"""The seven DEFAULT strategies, grouped for one-place auditability.

Every method here reproduces the pre-refactor engine byte-for-byte, honouring
the RNG discipline documented in ``base.py``:

    * SinglePool (topology)     — zero rng; one flat list keyed under ``None``.
    * UniformDraw (draw)        — one ``rng.randrange(count)`` per pull; selects
                                  the card but does NOT remove it (engine removes
                                  after yield); EV = pool mean == econ_model.
    * PremiumClampPricing       — ``econ_model.spin_fee_usd`` (zero rng).
    * InelasticDemand           — always spins, purchase size 1 (zero rng).
    * PoissonInflow (supply)    — today's deposit block verbatim; rng ONLY when
                                  ``deposit_rate > 0``.
    * FlatBuyback (redemption)  — one unconditional ``rng.random()`` gate; then
                                  80%*min(snapshot,live) with balance + cap gates.
    * PerRarityYield / GlobalValueYield — today's ``distribute_yield`` closure,
                                  bridged from ``scenario.yield_mode`` (zero rng).
"""

from __future__ import annotations

from econ_model import expected_value_usd, redemption_payout_usd, spin_fee_usd

from strategies.base import (
    NFT,
    RedeemResult,
    Segment,
    SimState,
    SpinnerState,
    poisson,
    sample_value,
    weighted_rarity,
)
from strategies.registry import register


# --- Topology --------------------------------------------------------------
@register("topology", "single")
class SinglePool:
    """One flat pool under segment key ``None`` (today's ``pool`` list)."""

    def __init__(self) -> None:
        self._pool: list = []

    def init(self, st: SimState) -> None:
        for r_idx, band in enumerate(st.scenario.bands):
            for _ in range(band.count):
                did = st.new_depositor(r_idx)
                st.add_nft(r_idx, sample_value(st.rng, band.lo_usd, band.hi_usd), did)

    def choose_segment(self, st: SimState) -> Segment:
        return None  # no rng

    def cards(self, st: SimState, seg: Segment) -> list:
        return self._pool

    def count(self, st: SimState, seg: Segment) -> int:
        return len(self._pool)

    def total_value(self, st: SimState, seg: Segment) -> float:
        return sum(n.appraisal_usd for n in self._pool)

    def add(self, st: SimState, nft: NFT) -> None:
        self._pool.append(nft)

    def remove(self, st: SimState, seg: Segment, nft: NFT) -> None:
        pool = self._pool
        # Identity search then swap-pop == today's pool[idx]=pool[-1];pool.pop().
        for idx, x in enumerate(pool):
            if x is nft:
                pool[idx] = pool[-1]
                pool.pop()
                return

    def all_cards(self, st: SimState) -> list:
        return self._pool

    def segments(self, st: SimState) -> list:
        return [None]


# --- Draw ------------------------------------------------------------------
@register("draw", "uniform")
class UniformDraw:
    """Uniform-over-pool: every card equally likely (== on-chain).

    ``expected_value`` is the pool mean (== ``econ_model.expected_value_usd``),
    so the premium is charged against the true single-spin EV.
    """

    def expected_value(self, st: SimState, seg: Segment) -> float:
        return expected_value_usd(st.topology.total_value(st, seg), st.topology.count(st, seg))

    def draw(self, st: SimState, seg: Segment, spinner: SpinnerState) -> NFT:
        cards = st.topology.cards(st, seg)
        idx = st.rng.randrange(len(cards))  # ONE rng call, == today
        return cards[idx]

    def observe(self, st: SimState, spinner: SpinnerState, won: NFT) -> None:
        return None


# --- Pricing ---------------------------------------------------------------
@register("pricing", "premium_clamp")
class PremiumClampPricing:
    """``EV*(1+premium)`` clamped to [min,max] (== ``_getSpinFeeToCharge``)."""

    def spin_fee(self, st: SimState, seg: Segment, ev: float) -> float:
        sc = st.scenario
        return spin_fee_usd(ev, sc.premium_bps, sc.min_fee_usd, sc.max_fee_usd)


# --- Demand ----------------------------------------------------------------
@register("demand", "inelastic")
class InelasticDemand:
    """Spinners always spin, one pull per purchase. Zero rng."""

    def wants_spin(self, st: SimState, seg: Segment, ev: float, fee: float) -> bool:
        return True

    def purchase_size(self, st: SimState, seg: Segment) -> int:
        return 1


# --- Supply ----------------------------------------------------------------
@register("supply", "poisson")
class PoissonInflow:
    """Fresh depositor NFTs arrive at ``deposit_rate`` (Poisson). Verbatim.

    Consumes rng ONLY when ``deposit_rate > 0``: Poisson count, then per card a
    weighted-rarity draw and a triangular value, in that exact order.
    """

    def step(self, st: SimState) -> None:
        sc = st.scenario
        if sc.deposit_rate > 0:
            for _ in range(poisson(st.rng, sc.deposit_rate)):
                r_idx = weighted_rarity(st.rng, sc.bands)
                band = sc.bands[r_idx]
                did = st.new_depositor(r_idx)
                st.add_nft(r_idx, sample_value(st.rng, band.lo_usd, band.hi_usd), did)


# --- Redemption ------------------------------------------------------------
@register("redemption", "flat")
class FlatBuyback:
    """Best-effort 80% * min(snapshot, live) buyback.

    Consumes exactly ONE unconditional ``rng.random()`` gate per fulfilled pull
    (== today). Returns a RedeemResult; the engine applies balance/inventory
    mutation so solvency accounting stays centralised. Precedence matches today:
    insolvent (balance too low) is checked before the maxPayoutBps cap.
    """

    def maybe_redeem(self, st: SimState, won: NFT, spinner: SpinnerState) -> RedeemResult:
        sc = st.scenario
        if st.rng.random() < sc.redeem_prob:
            payout = redemption_payout_usd(won.appraisal_usd, won.snapshot_usd)
            capped = sc.max_payout_bps > 0 and payout > st.protocol_balance * sc.max_payout_bps / 10_000
            if st.protocol_balance < payout:
                return RedeemResult("insolvent", payout)
            if capped:
                return RedeemResult("capped", payout)
            return RedeemResult("success", payout)
        return RedeemResult("none", 0.0)


# --- Yield -----------------------------------------------------------------
class _YieldBase:
    """Shared value-weighted distribution over a filtered card set.

    Iterates ``topology.all_cards`` (the whole pool, WITH the won card still
    present) in list order, so basis + summation order match today exactly.
    """

    def _cards(self, st: SimState, hit: NFT) -> list:
        raise NotImplementedError

    def distribute(self, st: SimState, hit: NFT, amount: float) -> None:
        cards = self._cards(st, hit)
        basis = sum(n.appraisal_usd for n in cards)
        if basis <= 0:
            return
        for n in cards:
            st.depositors[n.depositor_id].yield_usd += amount * (n.appraisal_usd / basis)


@register("yield", "per_rarity")
class PerRarityYield(_YieldBase):
    """Depositor cut accrues to the HIT rarity's cards, value-weighted (== vault)."""

    def _cards(self, st: SimState, hit: NFT) -> list:
        return [n for n in st.topology.all_cards(st) if n.rarity == hit.rarity and n.depositor_id >= 0]


@register("yield", "global_value")
class GlobalValueYield(_YieldBase):
    """Depositor cut spread across the WHOLE pool by value (proposed routing)."""

    def _cards(self, st: SimState, hit: NFT) -> list:
        return [n for n in st.topology.all_cards(st) if n.depositor_id >= 0]
