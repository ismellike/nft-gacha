"""Monte-Carlo simulation of the SPINFI gacha economy.

The loop replays the on-chain per-spin flow (Gacha -> EconomyManager ->
CardGroupedVault / ProtocolTreasury) so we can measure the properties the
contracts themselves cannot assert: spinner house edge, depositor P&L
distribution, protocol buyback solvency, and pool drain dynamics.

Per-spin flow modelled (mirrors docs/DESIGN.md section 4):
  1. If the pool is empty the spin auto-refunds (tracked separately).
  2. Fee = EV*(1+premium) clamped to [min,max]; spinner pays it.
  3. Fee split 95/5: depositor yield accrues to the *hit rarity* pool,
     value-weighted across its cards (CardGroupedVault); protocol keeps 5%.
  4. A uniform-random NFT is drawn and sent to the winner; snapshot frozen.
  5. With ``redeem_prob`` the winner sells back at 80%*min(snapshot,live) if
     the protocol treasury can fund it AND the payout is within the
     ``max_payout_bps`` reserve cap (best-effort while funds last).
  6. Fresh depositor NFTs arrive at ``deposit_rate`` (Poisson), refilling.

Deliberately faithful details:
  - Yield routes to the hit rarity, not globally — a depositor's expected yield
    depends on how often *their* tier is hit, matching the real vault.
  - Redemption gate models both ProtocolTreasury checks: balance >= payout and
    payout <= balance*maxPayoutBps (REDEEM_INSUFFICIENT_LIQUIDITY / REDEEM_EXCEEDS_CAP).
  - Buyback insolvency is BY DESIGN (see economic-model-redesign memory): a
    failed redemption leaves the NFT with the winner and is recorded, not an
    invariant violation.
"""

from __future__ import annotations

import random
import statistics
from dataclasses import dataclass, field

from econ_model import (
    expected_value_usd,
    redemption_payout_usd,
    revenue_split,
    spin_fee_usd,
)
from scenarios import Scenario

TRAJECTORY_SAMPLES = 40  # time-series points recorded across the run


@dataclass
class NFT:
    id: int
    rarity: int  # index into scenario.bands
    appraisal_usd: float  # live appraisal (moves with market drift)
    depositor_id: int  # -1 == protocol (restocked via buyback)
    snapshot_usd: float = 0.0  # frozen at win time; 0 while in pool


@dataclass
class Depositor:
    id: int
    tier: int
    deposited_value_usd: float = 0.0  # sum of appraisals ever supplied
    yield_usd: float = 0.0  # cumulative fee yield received
    lost_value_usd: float = 0.0  # appraisal of NFTs drawn out (forfeited)
    remaining_value_usd: float = 0.0  # appraisal of NFTs still in pool

    @property
    def realized_pnl_usd(self) -> float:
        return self.yield_usd - self.lost_value_usd


@dataclass
class TierStats:
    """Per-rarity breakdown — surfaces which tiers drain and which buybacks fund."""

    name: str
    initial_count: int
    final_count: int
    draws: int  # times a card from this tier was won
    redeem_attempted: int
    redeem_succeeded: int
    redeem_unfunded: int
    depositor_pnl_mean_usd: float
    depositors_in_profit_pct: float


@dataclass
class TrajPoint:
    spin: int
    pool_size: int
    ev_usd: float
    treasury_usd: float
    cum_house_edge_pct: float


@dataclass
class SimResult:
    scenario: str
    spins_requested: int
    spins_fulfilled: int
    refunds_empty_pool: int

    total_fees_usd: float
    total_depositor_yield_usd: float
    total_protocol_fee_usd: float

    spinner_fees_paid_usd: float
    spinner_nft_value_received_usd: float
    spinner_redemption_cash_usd: float
    spinner_net_pnl_usd: float
    house_edge_pct: float

    redemptions_attempted: int
    redemptions_succeeded: int
    redemptions_insolvent: int  # unfunded: balance too low
    redemptions_capped: int  # rejected by maxPayoutBps reserve cap
    protocol_balance_final_usd: float
    protocol_balance_min_usd: float

    pool_size_initial: int
    pool_size_final: int
    pool_size_min: int
    ev_initial_usd: float
    ev_final_usd: float

    # Depth dynamics
    spins_to_first_refund: int  # -1 if pool never emptied
    spins_to_depletion: int  # first spin where pool hit 0; -1 if never

    depositor_pnl_p05_usd: float
    depositor_pnl_median_usd: float
    depositor_pnl_p95_usd: float
    depositor_pnl_mean_usd: float
    depositors_in_profit_pct: float

    tiers: list = field(default_factory=list)  # list[TierStats]
    trajectory: list = field(default_factory=list)  # list[TrajPoint]


def _sample_value(rng: random.Random, lo: float, hi: float) -> float:
    return rng.triangular(lo, hi, lo + (hi - lo) * 0.33)


def simulate(scenario: Scenario, spins: int, seed: int = 0) -> SimResult:
    rng = random.Random(seed)

    pool: list[NFT] = []
    depositors: dict[int, Depositor] = {}
    next_nft_id = 0
    next_depositor_id = 0
    num_rarities = len(scenario.bands)

    def new_depositor(tier: int) -> int:
        nonlocal next_depositor_id
        did = next_depositor_id
        depositors[did] = Depositor(id=did, tier=tier)
        next_depositor_id += 1
        return did

    def add_nft(rarity: int, value: float, depositor_id: int) -> None:
        nonlocal next_nft_id
        pool.append(NFT(id=next_nft_id, rarity=rarity, appraisal_usd=value, depositor_id=depositor_id))
        next_nft_id += 1
        if depositor_id >= 0:
            dep = depositors[depositor_id]
            dep.deposited_value_usd += value
            dep.remaining_value_usd += value

    for r_idx, band in enumerate(scenario.bands):
        for _ in range(band.count):
            did = new_depositor(r_idx)
            add_nft(r_idx, _sample_value(rng, band.lo_usd, band.hi_usd), did)

    # Running tallies
    protocol_balance = scenario.protocol_seed_usd
    protocol_balance_min = protocol_balance
    total_fees = total_depositor_yield = total_protocol_fee = 0.0
    spinner_fees_paid = spinner_nft_value_received = spinner_redemption_cash = 0.0
    refunds = fulfilled = 0
    redemptions_attempted = redemptions_succeeded = 0
    redemptions_insolvent = redemptions_capped = 0
    spins_to_first_refund = -1
    spins_to_depletion = -1

    # Per-tier counters
    tier_initial = [b.count for b in scenario.bands]
    tier_draws = [0] * num_rarities
    tier_redeem_att = [0] * num_rarities
    tier_redeem_ok = [0] * num_rarities
    tier_redeem_unfunded = [0] * num_rarities

    pool_size_initial = len(pool)
    ev_initial = expected_value_usd(sum(n.appraisal_usd for n in pool), len(pool))
    pool_size_min = pool_size_initial

    trajectory: list[TrajPoint] = []
    sample_every = max(1, spins // TRAJECTORY_SAMPLES)

    def pool_totals() -> tuple[float, int]:
        return sum(n.appraisal_usd for n in pool), len(pool)

    def distribute_yield(hit_rarity: int, amount: float) -> None:
        if scenario.yield_mode == "global_value":
            # Proposed fix: spread across the whole pool by value, so yield
            # tracks value-at-risk and every tier breaks even in expectation.
            cards = [n for n in pool if n.depositor_id >= 0]
        else:
            # Current contract behaviour: only the hit rarity's cards accrue.
            cards = [n for n in pool if n.rarity == hit_rarity and n.depositor_id >= 0]
        basis = sum(n.appraisal_usd for n in cards)
        if basis <= 0:
            return
        for n in cards:
            depositors[n.depositor_id].yield_usd += amount * (n.appraisal_usd / basis)

    for i in range(spins):
        if scenario.market_drift_per_spin != 1.0:
            d = scenario.market_drift_per_spin
            for n in pool:
                n.appraisal_usd *= d

        total_value, count = pool_totals()

        # Trajectory sample (before this spin acts)
        if i % sample_every == 0:
            cum_edge = (
                -(spinner_nft_value_received + spinner_redemption_cash - spinner_fees_paid)
                / spinner_fees_paid
                * 100.0
                if spinner_fees_paid > 0
                else 0.0
            )
            trajectory.append(
                TrajPoint(
                    spin=i,
                    pool_size=count,
                    ev_usd=expected_value_usd(total_value, count),
                    treasury_usd=protocol_balance,
                    cum_house_edge_pct=cum_edge,
                )
            )

        if count == 0:
            refunds += 1
            if spins_to_first_refund < 0:
                spins_to_first_refund = i
            if spins_to_depletion < 0:
                spins_to_depletion = i
            continue

        ev = expected_value_usd(total_value, count)
        fee = spin_fee_usd(ev, scenario.premium_bps, scenario.min_fee_usd, scenario.max_fee_usd)
        depositor_cut, protocol_cut = revenue_split(fee, scenario.depositor_share_bps)
        total_fees += fee
        spinner_fees_paid += fee

        idx = rng.randrange(len(pool))
        won = pool[idx]

        distribute_yield(won.rarity, depositor_cut)
        total_depositor_yield += depositor_cut
        protocol_balance += protocol_cut
        total_protocol_fee += protocol_cut

        pool[idx] = pool[-1]
        pool.pop()
        tier_draws[won.rarity] += 1
        if won.depositor_id >= 0:
            dep = depositors[won.depositor_id]
            dep.remaining_value_usd -= won.appraisal_usd
            dep.lost_value_usd += won.appraisal_usd
        won.snapshot_usd = won.appraisal_usd
        fulfilled += 1

        redeemed = False
        if rng.random() < scenario.redeem_prob:
            redemptions_attempted += 1
            tier_redeem_att[won.rarity] += 1
            payout = redemption_payout_usd(won.appraisal_usd, won.snapshot_usd)
            capped = (
                scenario.max_payout_bps > 0
                and payout > protocol_balance * scenario.max_payout_bps / 10_000
            )
            if protocol_balance < payout:
                redemptions_insolvent += 1
                tier_redeem_unfunded[won.rarity] += 1
            elif capped:
                redemptions_capped += 1
                tier_redeem_unfunded[won.rarity] += 1
            else:
                protocol_balance -= payout
                spinner_redemption_cash += payout
                redemptions_succeeded += 1
                tier_redeem_ok[won.rarity] += 1
                redeemed = True
                won.snapshot_usd = 0.0
                won.depositor_id = -1
                pool.append(won)

        if not redeemed:
            spinner_nft_value_received += won.appraisal_usd

        if scenario.deposit_rate > 0:
            for _ in range(_poisson(rng, scenario.deposit_rate)):
                r_idx = _weighted_rarity(rng, scenario.bands)
                band = scenario.bands[r_idx]
                did = new_depositor(r_idx)
                add_nft(r_idx, _sample_value(rng, band.lo_usd, band.hi_usd), did)

        protocol_balance_min = min(protocol_balance_min, protocol_balance)
        pool_size_min = min(pool_size_min, len(pool))
        if len(pool) == 0 and spins_to_depletion < 0:
            spins_to_depletion = i

    # Aggregate
    final_value, final_count = pool_totals()
    ev_final = expected_value_usd(final_value, final_count)
    spinner_net = spinner_nft_value_received + spinner_redemption_cash - spinner_fees_paid
    house_edge_pct = (-spinner_net / spinner_fees_paid * 100.0) if spinner_fees_paid > 0 else 0.0

    realized = [d.realized_pnl_usd for d in depositors.values() if d.deposited_value_usd > 0]
    realized.sort()
    if realized:
        pnl_p05 = _percentile(realized, 0.05)
        pnl_med = _percentile(realized, 0.50)
        pnl_p95 = _percentile(realized, 0.95)
        pnl_mean = statistics.fmean(realized)
        in_profit = sum(1 for p in realized if p > 0) / len(realized) * 100.0
    else:
        pnl_p05 = pnl_med = pnl_p95 = pnl_mean = in_profit = 0.0

    # Per-tier aggregation
    final_tier_count = [0] * num_rarities
    for n in pool:
        final_tier_count[n.rarity] += 1
    tiers: list[TierStats] = []
    for t in range(num_rarities):
        t_pnl = [d.realized_pnl_usd for d in depositors.values() if d.tier == t and d.deposited_value_usd > 0]
        t_mean = statistics.fmean(t_pnl) if t_pnl else 0.0
        t_profit = (sum(1 for p in t_pnl if p > 0) / len(t_pnl) * 100.0) if t_pnl else 0.0
        tiers.append(
            TierStats(
                name=scenario.bands[t].name,
                initial_count=tier_initial[t],
                final_count=final_tier_count[t],
                draws=tier_draws[t],
                redeem_attempted=tier_redeem_att[t],
                redeem_succeeded=tier_redeem_ok[t],
                redeem_unfunded=tier_redeem_unfunded[t],
                depositor_pnl_mean_usd=t_mean,
                depositors_in_profit_pct=t_profit,
            )
        )

    return SimResult(
        scenario=scenario.name,
        spins_requested=spins,
        spins_fulfilled=fulfilled,
        refunds_empty_pool=refunds,
        total_fees_usd=total_fees,
        total_depositor_yield_usd=total_depositor_yield,
        total_protocol_fee_usd=total_protocol_fee,
        spinner_fees_paid_usd=spinner_fees_paid,
        spinner_nft_value_received_usd=spinner_nft_value_received,
        spinner_redemption_cash_usd=spinner_redemption_cash,
        spinner_net_pnl_usd=spinner_net,
        house_edge_pct=house_edge_pct,
        redemptions_attempted=redemptions_attempted,
        redemptions_succeeded=redemptions_succeeded,
        redemptions_insolvent=redemptions_insolvent,
        redemptions_capped=redemptions_capped,
        protocol_balance_final_usd=protocol_balance,
        protocol_balance_min_usd=protocol_balance_min,
        pool_size_initial=pool_size_initial,
        pool_size_final=final_count,
        pool_size_min=pool_size_min,
        ev_initial_usd=ev_initial,
        ev_final_usd=ev_final,
        spins_to_first_refund=spins_to_first_refund,
        spins_to_depletion=spins_to_depletion,
        depositor_pnl_p05_usd=pnl_p05,
        depositor_pnl_median_usd=pnl_med,
        depositor_pnl_p95_usd=pnl_p95,
        depositor_pnl_mean_usd=pnl_mean,
        depositors_in_profit_pct=in_profit,
        tiers=tiers,
        trajectory=trajectory,
    )


def _poisson(rng: random.Random, lam: float) -> int:
    L = pow(2.718281828459045, -lam)
    k = 0
    p = 1.0
    while True:
        k += 1
        p *= rng.random()
        if p <= L:
            return k - 1


def _weighted_rarity(rng: random.Random, bands) -> int:
    weights = [b.count for b in bands]
    total = sum(weights)
    r = rng.random() * total
    acc = 0.0
    for i, w in enumerate(weights):
        acc += w
        if r <= acc:
            return i
    return len(bands) - 1


def _percentile(sorted_vals: list[float], q: float) -> float:
    if not sorted_vals:
        return 0.0
    if len(sorted_vals) == 1:
        return sorted_vals[0]
    pos = q * (len(sorted_vals) - 1)
    lo = int(pos)
    hi = min(lo + 1, len(sorted_vals) - 1)
    frac = pos - lo
    return sorted_vals[lo] * (1 - frac) + sorted_vals[hi] * frac
