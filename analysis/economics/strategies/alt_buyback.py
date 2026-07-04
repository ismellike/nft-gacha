"""[variation 5] alt_buyback: alternative NFT-redemption (buyback) economics.

Three drop-in ``RedemptionStrategy`` implementations that replace the default
``FlatBuyback`` (80% * min(snapshot, live), gated by treasury balance and the
maxPayoutBps reserve cap). All three preserve the contract-faithful invariants
the rest of the engine + reporting rely on:

  * payout basis is ALWAYS ``min(win-time snapshot, live appraisal)`` via
    ``econ_model.redemption_payout_usd`` (the snapshot caps oracle inflation
    after a win, the live appraisal caps an overpay if the market fell);
  * every redemption is gated FIRST by an unconditional
    ``st.rng.random() < redeem_prob`` \"does the winner want to sell?\" draw
    (gate-first ordering, exactly like ``FlatBuyback``), so wiring one of these
    in only shifts the rng stream -- it never changes the control flow;
  * the returned ``RedeemResult`` uses the SAME four statuses the engine and
    ``report.py`` understand -- ``\"none\"`` (winner kept it), ``\"success\"``,
    ``\"insolvent\"`` (treasury can't fund) and ``\"capped\"`` (rejected by the
    maxPayoutBps reserve cap) -- and the strategy NEVER mutates
    ``st.protocol_balance`` or inventory: the engine applies the balance debit,
    spinner cash, counters and pool re-add on ``\"success\"``.

Because these are non-default, they are free to consume extra rng (``dutch``
samples a seller \"wait\"); byte-identity of the default path is unaffected. They
are OFF by default -- selected only via ``VariationConfig.redemption`` /
``--variation redemption=...`` -- so current behaviour never regresses.

Documented approximations:
  * ``DutchBuyback`` samples the seller's \"wait\" analytically (one rng draw)
    rather than simulating the payout decay over real future spins; the basis
    stays ``min(snapshot, live)`` as of the win.
  * ``TieredReserveBuyback`` earmarks the treasury into per-rarity buckets at
    first use and replenishes them with ongoing protocol revenue by the same
    fixed split; a bucket underflow yields ``\"insolvent\"`` (by design), never a
    crash.
"""

from __future__ import annotations

import math

from econ_model import REDEMPTION_PAYOUT_BPS, redemption_payout_usd
from strategies.base import NFT, RedeemResult, SimState, SpinnerState
from strategies.registry import register

BPS_DENOM = 10_000


def _f(x) -> float:
    """Coerce a StratSpec param (which may arrive as a str from the CLI) to float."""
    return float(x)


def _quote(won: NFT, bps: float) -> float:
    """Contract-faithful payout: ``bps/10000 * min(snapshot, live)``."""
    return redemption_payout_usd(won.appraisal_usd, won.snapshot_usd, int(round(bps)))


def _flat_gate(st: SimState, payout: float) -> RedeemResult:
    """Shared balance + maxPayoutBps gate against the GLOBAL treasury.

    Mirrors FlatBuyback's ordering exactly: insolvency is checked before the
    reserve cap, so the status partition matches the default path.
    """
    if st.protocol_balance < payout:
        return RedeemResult("insolvent", 0.0)
    if (
        st.scenario.max_payout_bps > 0
        and payout > st.protocol_balance * st.scenario.max_payout_bps / BPS_DENOM
    ):
        return RedeemResult("capped", 0.0)
    return RedeemResult("success", payout)


@register("redemption", "dutch")
class DutchBuyback:
    """Dutch-auction buyback: payout bps decays over the redemption window.

    Economic story: a winner who is willing to wait to redeem accepts a lower
    price. We sample a \"wait\" uniformly within the window (one rng draw) and
    decay the payout bps ``start_bps -> floor_bps`` across it (linear default,
    or exponential). Basis stays ``min(snapshot, live)``. Because the wait is
    random, the *mean* effective payout sits below the flat 80%.

    Params: start_bps, floor_bps, window_spins, decay (\"linear\"|\"exp\"),
    decay_rate (only used when decay==\"exp\").
    """

    def __init__(
        self,
        start_bps=REDEMPTION_PAYOUT_BPS,
        floor_bps=4_000,
        window_spins=60,
        decay="linear",
        decay_rate=0.05,
    ):
        self.start_bps = _f(start_bps)
        self.floor_bps = _f(floor_bps)
        # window is a divisor; keep it strictly positive.
        self.window_spins = max(_f(window_spins), 1e-9)
        self.decay = str(decay)
        self.decay_rate = _f(decay_rate)

    def _bps_for_wait(self, wait: float) -> float:
        span = self.start_bps - self.floor_bps
        if self.decay == "exp":
            return self.floor_bps + span * math.exp(-self.decay_rate * wait)
        frac = min(max(wait / self.window_spins, 0.0), 1.0)
        return self.start_bps - span * frac

    def maybe_redeem(self, st: SimState, won: NFT, spinner: SpinnerState) -> RedeemResult:
        # Gate FIRST (one unconditional rng draw, exactly like FlatBuyback).
        if st.rng.random() >= st.scenario.redeem_prob:
            return RedeemResult("none", 0.0)
        # Second rng draw: how long is this seller willing to wait?
        wait = st.rng.random() * self.window_spins
        payout = _quote(won, self._bps_for_wait(wait))
        return _flat_gate(st, payout)


@register("redemption", "tiered")
class TieredReserveBuyback:
    """Per-rarity reserve buckets: fund a redemption only from its tier's bucket.

    The treasury is earmarked into per-rarity buckets (``st.reserves[rarity]``)
    at first use, split by ``reserve_split`` (\"by_count\" default | \"by_value\" |
    \"equal\"), and topped up with ongoing protocol revenue by the same fixed
    split. A redemption of a tier is funded only from that tier's bucket, so a
    legendary run drains its own bucket without starving cheap-tier
    redemptions. Bucket underflow -> ``\"insolvent\"`` (by design), never a crash.

    Params: reserve_split (\"by_count\"|\"by_value\"|\"equal\"), payout_bps (fixed
    payout percentage, default 80%).
    """

    def __init__(self, reserve_split="by_count", payout_bps=REDEMPTION_PAYOUT_BPS):
        self.reserve_split = str(reserve_split)
        self.payout_bps = _f(payout_bps)
        self._inited = False
        self._split: list[float] | None = None
        self._last_balance = 0.0

    def _tier_weights(self, st: SimState) -> list[float]:
        n = len(st.scenario.bands)
        if n == 0:
            return []
        if self.reserve_split == "equal":
            return [1.0] * n
        counts = [0.0] * n
        values = [0.0] * n
        for c in st.topology.all_cards(st):
            r = c.rarity
            if 0 <= r < n:
                counts[r] += 1.0
                values[r] += max(c.appraisal_usd, 0.0)
        w = values if self.reserve_split == "by_value" else counts
        if sum(w) <= 0:
            return [1.0] * n  # empty pool at init -> fall back to an equal split
        return w

    def _ensure(self, st: SimState) -> None:
        if self._inited:
            return
        w = self._tier_weights(st)
        total = sum(w) or 1.0
        self._split = [x / total for x in w]
        for r, frac in enumerate(self._split):
            st.reserves[r] = st.protocol_balance * frac
        self._last_balance = st.protocol_balance
        self._inited = True

    def maybe_redeem(self, st: SimState, won: NFT, spinner: SpinnerState) -> RedeemResult:
        self._ensure(st)
        # Replenish earmarked buckets with protocol revenue accrued since the
        # last visit, by the same fixed split (no rng -> stream unaffected).
        delta = st.protocol_balance - self._last_balance
        if delta > 0 and self._split:
            for r, frac in enumerate(self._split):
                st.reserves[r] = st.reserves.get(r, 0.0) + delta * frac
        self._last_balance = st.protocol_balance

        # Gate FIRST (one unconditional rng draw, exactly like FlatBuyback).
        if st.rng.random() >= st.scenario.redeem_prob:
            return RedeemResult("none", 0.0)

        rarity = won.rarity
        bucket = st.reserves.get(rarity, 0.0)
        payout = _quote(won, self.payout_bps)
        # Insolvent if either the tier bucket OR the global treasury can't fund.
        if st.protocol_balance < payout or bucket < payout:
            return RedeemResult("insolvent", 0.0)
        if st.scenario.max_payout_bps > 0 and payout > bucket * st.scenario.max_payout_bps / BPS_DENOM:
            return RedeemResult("capped", 0.0)
        # Debit our OWN accounting bucket (engine debits st.protocol_balance).
        st.reserves[rarity] = bucket - payout
        self._last_balance = st.protocol_balance - payout
        return RedeemResult("success", payout)


@register("redemption", "variable_bps")
class VariableBpsBuyback:
    """Treasury-health-scaled payout bps: pay more when the treasury is flush.

    ``payout_bps = min_bps + (max_bps - min_bps) * health`` where
    ``health = clip(balance / target_usd, 0, 1)``. Payout bps is therefore
    monotone non-decreasing in treasury health, throttling buybacks when the
    protocol is thin and paying up to ``max_bps`` when well capitalised. Basis
    stays ``min(snapshot, live)``; the same balance + cap gate applies.

    Params: min_bps, max_bps, target_usd (balance treated as \"fully healthy\").
    """

    def __init__(self, min_bps=5_000, max_bps=REDEMPTION_PAYOUT_BPS, target_usd=50_000.0):
        self.min_bps = _f(min_bps)
        self.max_bps = _f(max_bps)
        self.target_usd = max(_f(target_usd), 1e-9)

    def _bps(self, balance: float) -> float:
        health = min(max(balance / self.target_usd, 0.0), 1.0)
        return self.min_bps + (self.max_bps - self.min_bps) * health

    def maybe_redeem(self, st: SimState, won: NFT, spinner: SpinnerState) -> RedeemResult:
        # Gate FIRST (one unconditional rng draw, exactly like FlatBuyback).
        if st.rng.random() >= st.scenario.redeem_prob:
            return RedeemResult("none", 0.0)
        payout = _quote(won, self._bps(st.protocol_balance))
        return _flat_gate(st, payout)
