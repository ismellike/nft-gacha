"""[variation 1] demand_elasticity — price-responsive spin volume.

Today the harness assumes perfectly inelastic demand: every non-empty tick is a
real spin regardless of how far the fee sits above expected value, so a premium
sweep only ever shows a monotone house-edge curve with no revenue-maximizing
interior optimum. This module adds ``ElasticDemand``: the probability a spinner
actually pulls falls as the charged fee rises above the value they receive (the
live pool EV, or a fixed reference price). Executed volume therefore *drops* as
the premium rises, so protocol revenue = fee x accepted-volume develops an
interior peak and a premium sweep can find the revenue-max markup.

CONTRACT NOTE: this is a purely DEMAND-side behavioural model (off-chain player
psychology). It changes NOTHING on-chain — draw selection, EV, the spin-fee
formula and the revenue split are all untouched. Elasticity only gates whether
a consulted tick becomes a spin (and never how the won card is priced).

DETERMINISM: all randomness routes through ``st.rng`` — exactly one
``st.rng.random()`` per consulted tick. This variation is non-default, so when
selected it legitimately shifts the RNG stream; the default path (InelasticDemand
in strategies/defaults.py) touches ``st.rng`` zero times and stays byte-identical.

``--spins`` SEMANTICS: under this variation a balked tick is not a spin, so
``--spins N`` becomes an N-tick time horizon (``spins_fulfilled`` <= N and
``st.metrics.spins_balked`` accounts for the difference). The default inelastic
demand keeps ``--spins`` == exactly N spins.

Selection (OFF by default — you must opt in):
    programmatic: VariationConfig(demand=StratSpec("elastic", {"beta": 1.5}))
    CLI:          --variation demand=elastic:beta=1.5,form=exp

Composes freely with every other seam (weighted/pity draws re-price the EV this
strategy reads; segmented pools pass their per-segment EV/fee straight through).
"""

from __future__ import annotations

import math

from strategies.base import DemandStrategy, Segment, SimState  # noqa: F401  (Protocol + type hints)
from strategies.registry import register


@register("demand", "elastic")
class ElasticDemand:
    """Price-elastic demand: accept a spin with probability ``p(fee / anchor)``.

    Two willingness-to-pay forms are offered; both are pinned so that a spin
    priced at or below the anchor value is *always* taken (p == 1) and only the
    premium markup above the anchor erodes volume:

      - ``"power"`` (constant-elasticity):  p = (anchor / fee) ** beta
            Iso-elastic demand. Revenue = anchor**beta * fee**(1-beta): beta>1
            favours a lower price (boundary), beta<1 a higher one, beta==1 is
            unit-elastic (revenue flat). Good for elasticity-theory framing.
      - ``"exp"`` (exponential WTP):        p = exp(-beta * (fee/anchor - 1))
            Gives an *interior* revenue peak at fee = anchor / beta (for
            beta < 1), i.e. a clean revenue-maximizing premium. Good for
            "find the optimal markup" sweeps.

    ``p`` is clipped to ``[0, 1]``. ``beta -> 0`` collapses both forms to
    ``p == 1`` — recovering (up to the one extra rng draw) the inelastic volume,
    which the tests assert.

    ``anchor = reference_price`` when ``reference_price > 0`` else the live pool
    EV passed in by the engine. Anchoring on EV means a "fairly priced" spin
    (fee == EV) is always accepted and only the house premium reduces volume;
    a fixed ``reference_price`` instead models a sticky external price anchor.

    Params (all scalar JSON-serializable, delivered as StratSpec.params kwargs):
      beta            elasticity / decay steepness, >= 0. Default 1.0.
      form            "power" | "exp". Default "power".
      reference_price fixed USD anchor; <= 0 (default) => anchor on live EV.
    """

    def __init__(
        self,
        beta: float = 1.0,
        form: str = "exp",
        reference_price: float = 0.0,
    ) -> None:
        # Default form is 'exp' (not 'power'): power form with beta=1 is unit-elastic,
        # giving revenue == EV *exactly constant* across premium (a degenerate demo with
        # no interior optimum). 'exp' has curvature at every beta, so the natural
        # `--variation demand=elastic` sweep reveals the revenue-maximizing premium.
        self.beta = float(beta)
        if self.beta < 0.0:
            raise ValueError(f"ElasticDemand.beta must be >= 0, got {self.beta}")
        self.form = str(form)
        if self.form not in ("power", "exp"):
            raise ValueError(
                f"ElasticDemand.form must be 'power' or 'exp', got {self.form!r}"
            )
        self.reference_price = float(reference_price)

    # --- pure economics (no rng; unit-testable in isolation) ---------------
    def accept_prob(self, ev: float, fee: float) -> float:
        """Probability an offered spin at ``fee`` (pool EV ``ev``) is taken.

        Pure and deterministic; ``wants_spin`` layers a single Bernoulli draw on
        top. Returns 1.0 whenever the spin is free / underpriced / unpriceable
        so this strategy never balks a spin the engine considers fillable and
        never divides by zero.
        """
        anchor = self.reference_price if self.reference_price > 0.0 else ev
        # The engine refunds empty pools (ev == 0) BEFORE demand is consulted;
        # this guard is belt-and-suspenders and keeps beta-sweeps well defined.
        if anchor <= 0.0 or fee <= 0.0:
            return 1.0
        markup = fee / anchor
        if markup <= 1.0:
            return 1.0  # priced at/below anchor value -> always spin
        if self.beta == 0.0:
            return 1.0  # perfectly inelastic limit
        if self.form == "exp":
            p = math.exp(-self.beta * (markup - 1.0))
        else:  # "power" constant-elasticity
            p = (anchor / fee) ** self.beta
        if p <= 0.0:
            return 0.0
        if p >= 1.0:
            return 1.0
        return p

    # --- DemandStrategy hooks ---------------------------------------------
    def wants_spin(self, st: SimState, seg: Segment, ev: float, fee: float) -> bool:
        """Bernoulli-accept the offered spin.

        Draws EXACTLY ONE ``st.rng.random()`` per consulted tick (kept constant
        across every branch so the stream stays predictable). Returning False
        makes the engine increment ``st.metrics.spins_balked`` and skip the tick
        — the engine owns that counter, this strategy only decides.
        """
        return st.rng.random() < self.accept_prob(ev, fee)

    def purchase_size(self, st: SimState, seg: Segment) -> int:
        """One pull per accepted purchase — elasticity governs *whether* to spin,
        not batch size (multi-pull bundles are the separate pity variation).
        Touches no rng.
        """
        return 1
