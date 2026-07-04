"""[variation 2: supply_feedback] Endogenous liquidity — LPs enter and exit.

The default :class:`~strategies.defaults.PoissonInflow` models a one-way tap:
fresh depositor NFTs arrive at a fixed ``deposit_rate`` (Poisson) and nobody ever
withdraws, so pool composition and LP retention are exogenous. ``FeedbackSupply``
closes that loop:

  * **Withdrawals (outflow):** each still-pooled depositor is evaluated against a
    realised yield APR. When a depositor's APR falls below ``withdraw_apr`` (or
    their realised P&L has gone negative because their card was drawn out), they
    withdraw their remaining pooled cards with a hazard probability that rises as
    APR falls. Withdrawn cards leave the pool (``topology.remove``); the LP is
    marked ``exited`` and counted in ``metrics.withdrawals``.
  * **Inflow (attraction):** the base Poisson arrival rate is *scaled up* when the
    observed pool-wide APR beats an ``attract_apr`` target, so a healthy,
    high-yielding pool draws fresh liquidity faster. The per-card sampling is the
    EXACT same weighted-rarity + triangular-value block the default uses, so
    inflow economics stay contract-faithful; only the *rate* is endogenous.

Design notes / faithfulness:
  * Purely opt-in. It is registered as ``supply``/``feedback`` and is NEVER the
    default, so the byte-identical golden path (``supply``/``poisson``) is
    untouched. Selecting it may shift the rng stream — that is expected for a
    variation and does not affect any default run.
  * All randomness routes through ``st.rng`` (one ``random()`` gate per evaluated
    at-risk depositor, then the default Poisson+per-card block), so runs are
    deterministic per seed.
  * A withdrawal is NOT a loss: the depositor takes their own card back, so only
    ``remaining_value_usd`` is decremented. ``lost_value_usd`` is reserved for
    cards drawn OUT by a spinner (forfeited), keeping realised-P&L accounting and
    the "buyback insolvency is by design" framing intact — a withdrawn card is
    never double-counted as a loss.
  * APR needs a tick->time mapping; ``ticks_per_year`` makes it explicit (a tick
    ~ one spin). Its absolute value only rescales the APR thresholds, so
    comparative economics are insensitive to the exact constant.

Params (all scalar, JSON-serialisable):
    base_rate        Base Poisson arrival rate. ``None`` (default) => fall back to
                     ``scenario.deposit_rate`` so enabling the variation with no
                     params reuses the scenario's configured inflow as the floor.
    withdraw_apr     Annualised yield APR below which an LP may withdraw (0.05 = 5%).
    attract_apr      Annualised APR above which fresh inflow is boosted (0.10).
    sensitivity      Inflow boost per unit of APR above ``attract_apr`` (1.0).
    ticks_per_year   Ticks (spins) per year for APR annualisation (8760.0 ~ hourly).
    max_withdraw_prob Ceiling on the per-tick withdrawal hazard (1.0).
    pnl_hazard       Minimum hazard applied when realised P&L is already negative (0.5).
    warmup_ticks     Ticks before any withdrawal fires, so brand-new LPs are not
                     churned before yield can accrue (10).
    eps              Small denominator floor to avoid divide-by-zero (1e-9).
"""

from __future__ import annotations

from strategies.base import (
    SimState,
    poisson,
    sample_value,
    weighted_rarity,
)
from strategies.registry import register


@register("supply", "feedback")
class FeedbackSupply:
    """Endogenous supply: yield-driven LP withdrawals + APR-scaled inflow."""

    def __init__(
        self,
        base_rate: float | None = None,
        withdraw_apr: float = 0.05,
        attract_apr: float = 0.10,
        sensitivity: float = 1.0,
        ticks_per_year: float = 8760.0,
        max_withdraw_prob: float = 1.0,
        pnl_hazard: float = 0.5,
        warmup_ticks: int = 10,
        eps: float = 1e-9,
    ) -> None:
        self.base_rate = None if base_rate is None else float(base_rate)
        self.withdraw_apr = float(withdraw_apr)
        self.attract_apr = float(attract_apr)
        self.sensitivity = float(sensitivity)
        self.ticks_per_year = float(ticks_per_year)
        self.max_withdraw_prob = float(max_withdraw_prob)
        self.pnl_hazard = float(pnl_hazard)
        self.warmup_ticks = int(warmup_ticks)
        self.eps = float(eps)
        # Per-run state (one instance per simulate() call). Tracks when each
        # depositor was first observed so APR can be annualised over their own
        # elapsed ticks, and which depositors have already exited.
        self._entry_tick: dict[int, int] = {}

    # -- SupplyStrategy ------------------------------------------------------
    def step(self, st: SimState) -> None:
        """Called once per tick AFTER the pull(s): withdraw, then attract."""
        self._record_new_depositors(st)
        self._process_withdrawals(st)
        self._process_inflow(st)

    # -- helpers -------------------------------------------------------------
    def _record_new_depositors(self, st: SimState) -> None:
        """Lazily stamp each depositor's first-seen tick (deterministic; no rng)."""
        for did in st.depositors:
            if did not in self._entry_tick:
                self._entry_tick[did] = st.tick

    def _apr(self, dep, tick: int) -> float:
        """Annualised realised yield APR for one depositor."""
        deposited = dep.deposited_value_usd
        if deposited <= self.eps:
            return 0.0
        elapsed = max(1, tick - self._entry_tick.get(dep.id, tick))
        return (dep.yield_usd / deposited) * (self.ticks_per_year / elapsed)

    def _hazard(self, apr: float, dep) -> float:
        """Per-tick withdrawal probability, rising as APR falls below threshold."""
        shortfall = 0.0
        if self.withdraw_apr > 0:
            shortfall = max(0.0, (self.withdraw_apr - apr) / self.withdraw_apr)
        p = shortfall
        if dep.realized_pnl_usd < 0:
            p = max(p, self.pnl_hazard)
        p *= self.max_withdraw_prob
        if p < 0.0:
            return 0.0
        if p > 1.0:
            return 1.0
        return p

    def _process_withdrawals(self, st: SimState) -> None:
        """Evaluate each active, still-pooled LP; withdraw their cards on a hit."""
        exiting: set[int] = set()
        # Deterministic evaluation order (sorted ids) so the rng gate stream is
        # stable across runs with the same seed.
        for did in sorted(st.depositors):
            dep = st.depositors[did]
            if dep.exited:
                continue
            # Nothing pooled to withdraw (all cards already drawn out).
            if dep.remaining_value_usd <= self.eps:
                continue
            # Give brand-new LPs a grace window before churn.
            if st.tick - self._entry_tick.get(did, st.tick) < self.warmup_ticks:
                continue
            apr = self._apr(dep, st.tick)
            if apr >= self.withdraw_apr and dep.realized_pnl_usd >= 0:
                continue  # healthy LP: no rng consumed, no withdrawal
            hazard = self._hazard(apr, dep)
            if hazard <= 0.0:
                continue
            if st.rng.random() < hazard:
                exiting.add(did)

        if not exiting:
            return

        # Remove the exiting LPs' still-pooled cards, per segment (composes with
        # segmented pools; guards empty segments). A withdrawal returns the card
        # to its owner: decrement remaining value only (NOT a forfeited loss).
        for seg in st.topology.segments(st):
            for nft in list(st.topology.cards(st, seg)):
                if nft.depositor_id in exiting:
                    st.topology.remove(st, seg, nft)
                    st.depositors[nft.depositor_id].remaining_value_usd -= nft.appraisal_usd
        for did in exiting:
            st.depositors[did].exited = True
            st.metrics.withdrawals += 1

    def _observed_apr(self, st: SimState) -> float:
        """Pool-wide realised APR (value-weighted), annualised over elapsed ticks."""
        total_yield = 0.0
        total_deposited = 0.0
        for dep in st.depositors.values():
            total_yield += dep.yield_usd
            total_deposited += dep.deposited_value_usd
        if total_deposited <= self.eps:
            return 0.0
        elapsed = max(1, st.tick)
        return (total_yield / total_deposited) * (self.ticks_per_year / elapsed)

    def _process_inflow(self, st: SimState) -> None:
        """APR-scaled Poisson inflow; per-card sampling identical to the default."""
        sc = st.scenario
        base = sc.deposit_rate if self.base_rate is None else self.base_rate
        if base <= 0:
            return
        observed_apr = self._observed_apr(st)
        boost = 1.0 + self.sensitivity * max(0.0, observed_apr - self.attract_apr)
        effective_rate = base * boost
        if effective_rate <= 0:
            return
        for _ in range(poisson(st.rng, effective_rate)):
            r_idx = weighted_rarity(st.rng, sc.bands)
            band = sc.bands[r_idx]
            did = st.new_depositor(r_idx)
            st.add_nft(r_idx, sample_value(st.rng, band.lo_usd, band.hi_usd), did)
            st.metrics.deposits_added += 1
