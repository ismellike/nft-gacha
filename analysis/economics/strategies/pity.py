"""[variation 3] pity_guarantees — guaranteed >= floor tier after N pulls + bundles.

One module, TWO seams (per the canonical spec's ``pity.py`` slot):

  * ``@register("draw", "pity")`` -> :class:`PityDraw` (DrawStrategy).
        A pity counter that FORCES a ``rarity >= floor_tier`` pull once
        ``pity_n`` pulls have elapsed without a guaranteed one, then resets the
        counter. Non-forced pulls delegate to a base draw (internal uniform by
        default, or any registered draw named via ``base=`` so it composes with
        ``weighted_draw``). The guarantee is PRICED by ``expected_value()`` — it
        returns ``base_EV + (1/N)*(E[value | rarity>=floor] - base_EV)`` — so
        PricingStrategy charges the premium against the uplifted EV and the
        long-run house-edge == premium invariant is preserved by construction.

  * ``@register("demand", "bundle")`` -> :class:`BundleDemand` (DemandStrategy).
        Fixed-size multi-pull purchases. Paired with ``pity_n <= bundle_size``
        every bundle window contains >= 1 floor-tier card (max gap between
        floor hits is ``pity_n``, so any window of length >= pity_n holds one).

OFF BY DEFAULT: nothing selects these unless a Scenario's ``VariationConfig``
names them, so the byte-identical default path (UniformDraw / InelasticDemand)
is untouched. DETERMINISTIC: every random choice routes through ``st.rng``, and
``draw`` consumes EXACTLY ONE ``st.rng`` call per pull (forced OR base) — the
same single-``randrange`` budget as UniformDraw — so the stream stays clean.

Documented approximations (see spec open-questions):
  * EV uplift is a steady-state amortisation, not per-counter-exact. It is tight
    for comparative economics; error shrinks as N grows.
  * Multi-spinner assignment (spinner_pop) is the engine's deterministic
    round-robin concern; this module reads/writes the SpinnerState it is handed.
"""

from __future__ import annotations

from typing import TYPE_CHECKING

from econ_model import expected_value_usd
from scenarios import StratSpec
from strategies.registry import register

if TYPE_CHECKING:  # annotations only; no runtime dependency / no import cycle
    from strategies.base import NFT, Segment, SimState, SpinnerState


@register("draw", "pity")
class PityDraw:
    """DrawStrategy wrapping a base draw with an N-pull floor-tier guarantee.

    Params (all scalars, forwarded from ``StratSpec.params``):
      * ``pity_n`` (int, default 90): pulls between guaranteed floor+ hits.
      * ``floor_tier`` (int|None, default None): guaranteed rarity index; a pull
        is "guaranteed" if ``card.rarity >= floor_tier``. ``None`` resolves to
        the top rarity (``len(bands) - 1``), i.e. the classic jackpot pity.
      * ``base`` (str, default ""): name of the wrapped draw for NON-forced
        pulls. "" => an internal uniform-over-pool draw (contract-faithful,
        no dependency on defaults being loaded). Any registered draw name (e.g.
        "weighted") composes on top.
      * ``spinner_pop`` (accepted, unused here): engine round-robin concern.
    """

    def __init__(self, pity_n: int = 90, floor_tier=None, base: str = "",
                 spinner_pop: int = 1, **_ignored):
        # Clamp to >= 1: pity_n <= 0 would make draw() force a floor pull every
        # time while expected_value() prices at base EV -> mispricing. (Mirrors
        # BundleDemand's max(1, ...).)
        self.pity_n = max(1, int(pity_n))
        self.floor_tier = None if floor_tier is None else int(floor_tier)
        self._base_name = str(base) if base else ""
        self._base = None  # lazily built registered draw, or None => internal uniform

    # -- base-draw plumbing -------------------------------------------------
    def _ensure_base(self) -> None:
        if self._base_name and self._base is None:
            # Lazy import + build so registration order / import cycles never bite.
            from strategies.registry import build
            self._base = build("draw", StratSpec(self._base_name))

    def _base_ev(self, st: "SimState", seg: "Segment") -> float:
        if self._base is not None:
            return self._base.expected_value(st, seg)
        # internal uniform == econ_model pool mean (single source of truth)
        return expected_value_usd(st.topology.total_value(st, seg),
                                  st.topology.count(st, seg))

    def _base_draw(self, st: "SimState", seg: "Segment", spinner: "SpinnerState") -> "NFT":
        if self._base is not None:
            return self._base.draw(st, seg, spinner)  # base owns its ONE rng call
        cards = st.topology.cards(st, seg)
        return cards[st.rng.randrange(st.topology.count(st, seg))]  # ONE rng call

    def _resolve_floor(self, st: "SimState") -> int:
        n = len(st.scenario.bands)
        if self.floor_tier is None:
            return n - 1
        return max(0, min(self.floor_tier, n - 1))

    # -- DrawStrategy protocol ---------------------------------------------
    def expected_value(self, st: "SimState", seg: "Segment") -> float:
        """base EV + steady-state pity uplift (the EV pricing charges against)."""
        self._ensure_base()
        base_ev = self._base_ev(st, seg)
        if self.pity_n <= 0:
            return base_ev
        cards = st.topology.cards(st, seg)
        if not cards:
            return base_ev  # empty pool handled by engine refund upstream
        floor = self._resolve_floor(st)
        eligible = [c for c in cards if c.rarity >= floor]
        if not eligible:  # cannot guarantee -> no uplift to price
            return base_ev
        e_floor = sum(c.appraisal_usd for c in eligible) / len(eligible)
        # amortise the once-per-N forced pull over the whole cycle
        return base_ev + (e_floor - base_ev) / self.pity_n

    def draw(self, st: "SimState", seg: "Segment", spinner: "SpinnerState") -> "NFT":
        """Select (do NOT remove) the won NFT; engine removes after yield split."""
        self._ensure_base()
        spinner.pity_counter += 1
        if spinner.pity_counter >= self.pity_n:
            floor = self._resolve_floor(st)
            cards = st.topology.cards(st, seg)
            eligible = [c for c in cards if c.rarity >= floor]
            if eligible:
                spinner.pity_counter = 0
                return eligible[st.rng.randrange(len(eligible))]  # ONE rng call
            # Edge case: no floor-eligible card in the pool. Fall back to a base
            # draw WITHOUT resetting, so the guarantee fires the instant one
            # appears. Still exactly ONE rng call below.
        return self._base_draw(st, seg, spinner)

    def observe(self, st: "SimState", spinner: "SpinnerState", won: "NFT") -> None:
        # Pity's own counter is advanced/reset inside draw(). Forward the post-award
        # hook to a composed stateful base draw so pity-over-pity (or any stateful
        # base) still bookkeeps correctly.
        if self._base is not None:
            self._base.observe(st, spinner, won)


@register("demand", "bundle")
class BundleDemand:
    """DemandStrategy: fixed-size multi-pull purchases with an implicit floor.

    Params:
      * ``bundle_size`` (int, default 10): pulls emitted per accepted purchase.
      * ``spinner_pop`` (accepted, unused here): engine round-robin concern.

    ``wants_spin`` is unconditional (bundles do not model elasticity — that is
    the ``demand_elastic`` variation's job) and consumes ZERO rng, so pairing it
    with the default draw would still not perturb the stream. The floor guarantee
    comes from pairing with :class:`PityDraw` at ``pity_n <= bundle_size``.
    """

    def __init__(self, bundle_size: int = 10, spinner_pop: int = 1, **_ignored):
        self.bundle_size = max(1, int(bundle_size))

    def wants_spin(self, st: "SimState", seg: "Segment", ev: float, fee: float) -> bool:
        return True

    def purchase_size(self, st: "SimState", seg: "Segment") -> int:
        return self.bundle_size
