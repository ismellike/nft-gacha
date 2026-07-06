"""Monte-Carlo simulation of the SPINFI gacha economy (strategy orchestrator).

The loop replays the on-chain per-spin flow (Gacha -> EconomyManager ->
CardGroupedVault / ProtocolTreasury) so we can measure the properties the
contracts themselves cannot assert: spinner house edge, depositor P&L
distribution, protocol buyback solvency, and pool drain dynamics.

This module is a THIN ORCHESTRATOR. The 250-line monolith it replaced is
decomposed into seven swappable seams (topology, draw, pricing, demand, supply,
redemption, yield); see ``strategies/base.py``. ``simulate`` builds one strategy
per seam from ``scenario.variations`` via ``build_bundle``, threads a single
seeded ``random.Random`` through a shared ``SimState``, and calls the seams in
the identical order the pre-refactor loop used. With no variation enabled every
seam resolves to its DEFAULT (``strategies/defaults.py``), which is byte-identical
to the original engine — the golden-master test (``tests/test_golden.py``) is the
merge gate.

Per-spin flow modelled (mirrors docs/DESIGN.md section 4):
  1. Market drift is applied to every live appraisal.
  2. The topology picks the segment to spin (single pool -> the whole pool).
  3. If that pool is empty the spin auto-refunds (tracked separately).
  4. Fee = EV*(1+premium) clamped to [min,max]; the draw declares the EV so the
     premium is always charged against the true probability-weighted EV.
  5. Demand decides whether the tick spins and how many pulls it buys.
  6. Per pull: draw a winner; split the fee 95/5; route the depositor yield;
     credit the protocol; remove the card; snapshot it; run the buyback gate.
  7. Supply adds fresh depositor inflow (and, for variations, withdrawals).

Deliberately faithful details preserved by the DEFAULT strategies:
  - Draw is uniform-over-pool; EV == pool mean == ``econ_model.expected_value_usd``.
  - Yield routes to the hit rarity value-weighted (or global-value; bridged from
    ``scenario.yield_mode``), computed while the won card is STILL in the pool.
  - Redemption gate models both ProtocolTreasury checks (balance >= payout and
    payout <= balance*maxPayoutBps) and is best-effort while funds last.
  - Buyback insolvency is BY DESIGN (see economic-model-redesign memory): a
    failed redemption leaves the NFT with the winner and is recorded, not an
    invariant violation.
"""

from __future__ import annotations

import random
import statistics
from dataclasses import dataclass, field

from econ_model import expected_value_usd, revenue_split
from scenarios import Scenario

# Shared domain types now live in strategies.base; re-exported here for the
# public/back-compat surface (report/sweep/__main__ import SimResult/TierStats/
# TrajPoint from this module; downstream code may import NFT/Depositor).
from strategies.base import NFT, Depositor, Metrics, SimState, SpinnerState  # noqa: F401
from strategies.registry import build_bundle

TRAJECTORY_SAMPLES = 40  # time-series points recorded across the run


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

    # Endogenous variation metrics (0 on the default path, so goldens gain three
    # always-zero fields and every existing field stays byte-identical).
    spins_balked: int = 0  # elastic demand: ticks that declined to spin
    withdrawals: int = 0  # supply feedback: LP exits
    deposits_added: int = 0  # supply feedback: cards added post-init

    tiers: list = field(default_factory=list)  # list[TierStats]
    trajectory: list = field(default_factory=list)  # list[TrajPoint]


def _whole_count(st: SimState) -> int:
    return sum(st.topology.count(st, s) for s in st.topology.segments(st))


def _whole_value(st: SimState) -> float:
    return sum(st.topology.total_value(st, s) for s in st.topology.segments(st))


def simulate(scenario: Scenario, spins: int, seed: int = 0) -> SimResult:
    rng = random.Random(seed)
    num_rarities = len(scenario.bands)

    bundle = build_bundle(scenario)
    st = SimState(
        rng=rng,
        scenario=scenario,
        topology=bundle.topology,
        depositors={},
        spinners={0: SpinnerState(id=0)},
        protocol_balance=scenario.protocol_seed_usd,
        protocol_balance_min=scenario.protocol_seed_usd,
        reserves={},
        tick=0,
        metrics=Metrics(),
    )

    # Seed the initial inventory (band-order triangular sampling).
    st.topology.init(st)

    # Running tallies (engine-local; protocol_balance lives on st so strategies
    # can read it, e.g. the redemption solvency gate).
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

    pool_size_initial = _whole_count(st)
    ev_initial = expected_value_usd(_whole_value(st), pool_size_initial)
    pool_size_min = pool_size_initial

    trajectory: list[TrajPoint] = []
    sample_every = max(1, spins // TRAJECTORY_SAMPLES)

    for i in range(spins):
        st.tick = i

        # 1. Market drift (engine; no rng).
        if scenario.market_drift_per_spin != 1.0:
            d = scenario.market_drift_per_spin
            for n in st.topology.all_cards(st):
                n.appraisal_usd *= d

        # 2. Topology picks the segment to spin (single pool -> None, no rng).
        seg = st.topology.choose_segment(st)
        count = st.topology.count(st, seg)
        total_value = st.topology.total_value(st, seg)

        # Trajectory sample (before this spin acts).
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
                    treasury_usd=st.protocol_balance,
                    cum_house_edge_pct=cum_edge,
                )
            )

        # 3. Empty pool -> auto-refund (skips pricing/demand/pull/supply).
        if count == 0:
            refunds += 1
            if spins_to_first_refund < 0:
                spins_to_first_refund = i
            if spins_to_depletion < 0:
                spins_to_depletion = i
            continue

        # 4. Price against the draw-declared EV.
        ev = bundle.draw.expected_value(st, seg)
        fee = bundle.pricing.spin_fee(st, seg, ev)

        # 5. Demand: does this tick spin, and how many pulls?
        if not bundle.demand.wants_spin(st, seg, ev, fee):
            st.metrics.spins_balked += 1
            continue
        n_pulls = bundle.demand.purchase_size(st, seg)
        spinner = st.spinners[i % len(st.spinners)]

        for _ in range(n_pulls):
            if st.topology.count(st, seg) == 0:
                break
            pev = bundle.draw.expected_value(st, seg)
            pfee = bundle.pricing.spin_fee(st, seg, pev)
            depositor_cut, protocol_cut = revenue_split(pfee, scenario.depositor_share_bps)
            total_fees += pfee
            spinner_fees_paid += pfee

            # 6a. Draw a winner (selects, ONE rng; does NOT remove — see base.py).
            won = bundle.draw.draw(st, seg, spinner)

            # 6b. Route the depositor yield while the won card is still in-pool.
            bundle.yield_.distribute(st, won, depositor_cut)
            total_depositor_yield += depositor_cut
            st.protocol_balance += protocol_cut
            total_protocol_fee += protocol_cut
            st.metrics.protocol_revenue_usd += protocol_cut

            # 6c. Remove the won card (swap-pop == today) and book the LP loss.
            st.topology.remove(st, seg, won)
            tier_draws[won.rarity] += 1
            if won.depositor_id >= 0:
                dep = st.depositors[won.depositor_id]
                dep.remaining_value_usd -= won.appraisal_usd
                dep.lost_value_usd += won.appraisal_usd
            won.snapshot_usd = won.appraisal_usd
            fulfilled += 1

            # 6d. Buyback gate (ONE unconditional rng; engine applies state).
            redeemed = False
            res = bundle.redemption.maybe_redeem(st, won, spinner)
            if res.status != "none":
                redemptions_attempted += 1
                tier_redeem_att[won.rarity] += 1
                if res.status == "success":
                    st.protocol_balance -= res.payout_usd
                    spinner_redemption_cash += res.payout_usd
                    redemptions_succeeded += 1
                    tier_redeem_ok[won.rarity] += 1
                    redeemed = True
                    won.snapshot_usd = 0.0
                    won.depositor_id = -1
                    st.topology.add(st, won)
                elif res.status == "insolvent":
                    redemptions_insolvent += 1
                    tier_redeem_unfunded[won.rarity] += 1
                elif res.status == "capped":
                    redemptions_capped += 1
                    tier_redeem_unfunded[won.rarity] += 1

            if not redeemed:
                spinner_nft_value_received += won.appraisal_usd

            bundle.draw.observe(st, spinner, won)

        # 7. Supply inflow (deposits; rng only if deposit_rate > 0).
        bundle.supply.step(st)

        st.protocol_balance_min = min(st.protocol_balance_min, st.protocol_balance)
        pool_size_min = min(pool_size_min, _whole_count(st))
        if _whole_count(st) == 0 and spins_to_depletion < 0:
            spins_to_depletion = i

    protocol_balance = st.protocol_balance
    protocol_balance_min = st.protocol_balance_min

    # Aggregate ---------------------------------------------------------------
    final_count = _whole_count(st)
    final_value = _whole_value(st)
    ev_final = expected_value_usd(final_value, final_count)
    spinner_net = spinner_nft_value_received + spinner_redemption_cash - spinner_fees_paid
    house_edge_pct = (-spinner_net / spinner_fees_paid * 100.0) if spinner_fees_paid > 0 else 0.0

    realized = [d.realized_pnl_usd for d in st.depositors.values() if d.deposited_value_usd > 0]
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
    for n in st.topology.all_cards(st):
        final_tier_count[n.rarity] += 1
    tiers: list[TierStats] = []
    for t in range(num_rarities):
        t_pnl = [
            d.realized_pnl_usd
            for d in st.depositors.values()
            if d.tier == t and d.deposited_value_usd > 0
        ]
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
        spins_balked=st.metrics.spins_balked,
        withdrawals=st.metrics.withdrawals,
        deposits_added=st.metrics.deposits_added,
        tiers=tiers,
        trajectory=trajectory,
    )


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
