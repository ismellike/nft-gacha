"""weighted_draw variation [4]: configurable non-uniform per-rarity draw weights.

DESIGN PROPOSAL -- NON-CONTRACT. The on-chain Gacha draws UNIFORM-OVER-POOL
(every NFT equally likely, EV == pool mean). This strategy replaces that with
configurable per-rarity drop weights and RE-DERIVES the spin fee from the true
weighted expected value: because ``PricingStrategy`` charges the premium against
whatever ``DrawStrategy.expected_value()`` returns, the ``house_edge == premium``
invariant is preserved BY CONSTRUCTION -- no pricing edit is needed. This seam
is OFF by default (the default draw strategy is ``uniform``); selecting
``draw=weighted`` is a deliberate divergence from current on-chain behaviour and
SHOULD be surfaced in reports as a \"design proposal (non-contract)\".

Economic model
--------------
For each rarity ``r`` present in the segment let ``W_r`` be its draw weight and
``n_r`` / ``V_r`` its live card count / total value (mean_r = V_r / n_r).

* ``normalize=True`` (default) -- rarity-drop-rate semantics (the spec's
  explicit formula). The rarity is chosen with probability ``W_r / sum(W)`` and
  then a uniform card within it, so the per-card award probability is
  ``p_i = W_{r(i)} / (n_{r(i)} * sum(W))`` and::

      expected_value = sum_r (W_r / sum(W)) * mean_r

  This is the classic gacha model: you set the drop rate of each tier directly,
  independent of how many cards happen to be in inventory.

* ``normalize=False`` -- per-card weighting. Each card is biased directly
  (``p_i proportional to W_{r(i)}``), so a tier's total draw probability scales
  with both its weight and its live count::

      expected_value = sum_r W_r*V_r / sum_r W_r*n_r

Empty rarities (``n_r == 0``) are skipped in the normalization, so a tier is
never priced into the EV nor awarded once it has drained.

Uniform-over-pool identity (the no-regression equivalence)
---------------------------------------------------------
With the DEFAULT configuration -- no weights supplied, so every tier's weight
tracks its own live count (``W_r = n_r``) -- both designs collapse to
``p_i = 1 / N`` and ``expected_value == econ_model.expected_value_usd`` EXACTLY
(``expected_value`` short-circuits to the pool mean when no override is set, so
the equality is bit-exact, not just approximate). Passing ``weights`` equal to
the tier counts reproduces the same result up to float rounding. Passing EQUAL
per-rarity weights instead is NOT the identity: under the drop-rate model it
yields the mean of the tier means (a deliberate rebalancing knob), which is the
whole point of the variation. See ``tests/test_weighted_draw.py``.

Configuration (``StratSpec.params`` -- all stdlib / JSON-serialisable)
---------------------------------------------------------------------
* ``weights``   : full per-rarity weights as a list ``[w0, w1, ...]`` (index ==
                  rarity index; ``None`` entry keeps that tier's count baseline),
                  a dict ``{rarity_index: w}`` / ``{\"2\": w}``, or a
                  comma/space-separated string ``\"1,2,3\"``. Omit to default
                  every tier to its live count (== uniform-over-pool).
* ``<band>_weight`` : per-tier override by (case-insensitive) band name, e.g.
                  ``legendary_weight=50`` or ``common_weight=1``. CLI-friendly:
                  ``--variation draw=weighted:legendary_weight=50``. Overrides
                  sit on top of the count baseline for any unspecified tier, and
                  take precedence over ``weights``.
* ``normalize`` : ``True`` (default) rarity-drop-rate semantics; ``False``
                  per-card weighting. Accepts bools or the strings
                  ``true/false/1/0/yes/no`` (CLI passes strings).

Composition
-----------
``draw`` reads ``st.topology.cards(st, seg)``, so it composes unchanged with
``segmented_pools`` (a segment is one rarity -> a single group) and can be
wrapped by ``pity`` (PityDraw delegates to a base draw). All randomness routes
through ``st.rng`` (one ``rng.random()`` per draw), so runs are deterministic
per seed. Because this is a non-default strategy, that single rng call is
allowed to shift the stream relative to ``UniformDraw`` -- byte-identity only
has to hold when the seam is OFF, which it is by default.
"""

from __future__ import annotations

from typing import TYPE_CHECKING

from econ_model import expected_value_usd
from strategies.registry import register

if TYPE_CHECKING:  # avoid import cycles at module import time; annotations are lazy
    from strategies.base import NFT, Segment, SimState, SpinnerState


def _as_bool(value) -> bool:
    """Coerce CLI/JSON scalars to bool ('false', '0', 'no' -> False)."""
    if isinstance(value, bool):
        return value
    if isinstance(value, (int, float)):
        return bool(value)
    if isinstance(value, str):
        return value.strip().lower() in ("1", "true", "t", "yes", "y", "on")
    return bool(value)


@register("draw", "weighted")
class WeightedDraw:
    """Non-uniform per-rarity draw with EV re-derived from the true weights.

    Implements the ``DrawStrategy`` protocol (``expected_value`` / ``draw`` /
    ``observe``). ``expected_value`` owns the pricing EV so the fee auto-reprices
    off the real distribution; ``draw`` selects (but does NOT remove) the winner
    -- the engine calls ``topology.remove`` after yield distribution.
    """

    NON_CONTRACT = True  # report hint: this diverges from the on-chain uniform draw

    def __init__(self, weights=None, normalize: object = True, **band_weights) -> None:
        self.normalize = _as_bool(normalize)

        # Explicit full/partial weights by rarity index -----------------------
        self._weights_list: list | None = None
        self._weights_map: dict[int, float] = {}
        if weights is not None:
            if isinstance(weights, str):
                parts = [p for p in weights.replace(",", " ").split() if p != ""]
                self._weights_list = [float(p) for p in parts]
            elif isinstance(weights, dict):
                for k, v in weights.items():
                    self._weights_map[int(k)] = float(v)
            elif isinstance(weights, (list, tuple)):
                self._weights_list = [None if w is None else float(w) for w in weights]
            else:
                raise TypeError(
                    "WeightedDraw: 'weights' must be a list, dict, comma/space "
                    f"string, or None (got {type(weights).__name__})"
                )

        # Per-band named overrides, e.g. legendary_weight=50 -----------------
        self._named: dict[str, float] = {}
        for key, value in band_weights.items():
            lkey = key.lower()
            if not lkey.endswith("_weight"):
                raise TypeError(
                    f"WeightedDraw: unknown param '{key}' "
                    "(expected 'weights', 'normalize', or '<band>_weight')"
                )
            self._named[lkey[: -len("_weight")]] = float(value)

        # No explicit config at all => pure identity (uniform-over-pool).
        self._has_overrides = bool(self._weights_list) or bool(self._weights_map) or bool(self._named)

    # -- helpers -------------------------------------------------------------
    def _weight_for(self, rarity: int, count_r: int, bands) -> float:
        """Resolve W_r: count baseline, then list, then map, then named (last wins)."""
        w = float(count_r)  # baseline reproduces uniform-over-pool
        if (
            self._weights_list is not None
            and rarity < len(self._weights_list)
            and self._weights_list[rarity] is not None
        ):
            w = float(self._weights_list[rarity])
        if rarity in self._weights_map:
            w = self._weights_map[rarity]
        if 0 <= rarity < len(bands):
            name = bands[rarity].name.lower()
            if name in self._named:
                w = self._named[name]
        return w

    def _aggregate(self, st: "SimState", cards):
        """Group live cards -> {rarity: (W_r, n_r, V_r)} over NON-EMPTY rarities."""
        bands = st.scenario.bands
        counts: dict[int, int] = {}
        totals: dict[int, float] = {}
        for nft in cards:
            counts[nft.rarity] = counts.get(nft.rarity, 0) + 1
            totals[nft.rarity] = totals.get(nft.rarity, 0.0) + nft.appraisal_usd
        agg: dict[int, tuple] = {}
        for rarity, n in counts.items():
            agg[rarity] = (self._weight_for(rarity, n, bands), n, totals[rarity])
        return agg

    # -- DrawStrategy protocol ----------------------------------------------
    def expected_value(self, st: "SimState", seg: "Segment") -> float:
        cards = st.topology.cards(st, seg)
        count = len(cards)
        if count == 0:
            return 0.0
        if not self._has_overrides:
            # Bit-exact uniform-over-pool identity == econ_model.expected_value_usd.
            return expected_value_usd(sum(n.appraisal_usd for n in cards), count)
        agg = self._aggregate(st, cards)
        if self.normalize:
            sum_w = sum(w for (w, _n, _v) in agg.values())
            if sum_w <= 0.0:  # degenerate (all weights zero) -> fall back to pool mean
                return expected_value_usd(sum(n.appraisal_usd for n in cards), count)
            ev = 0.0
            for (w, n, v) in agg.values():
                if n > 0:
                    ev += (w / sum_w) * (v / n)
            return ev
        # per-card weighting
        num = sum(w * v for (w, _n, v) in agg.values())
        den = sum(w * n for (w, n, _v) in agg.values())
        if den <= 0.0:
            return expected_value_usd(sum(n.appraisal_usd for n in cards), count)
        return num / den

    def draw(self, st: "SimState", seg: "Segment", spinner: "SpinnerState") -> "NFT":
        cards = st.topology.cards(st, seg)
        if not cards:  # engine refunds empty pools upstream; guard defensively
            raise IndexError("WeightedDraw.draw called on an empty segment")
        agg = self._aggregate(st, cards)
        # Per-card weight: normalize -> W_r/n_r (so the rarity total is exactly
        # W_r and within-rarity selection is uniform); else -> W_r directly.
        card_w: dict[int, float] = {}
        for rarity, (w, n, _v) in agg.items():
            card_w[rarity] = (w / n if n > 0 else 0.0) if self.normalize else w
        total_w = 0.0
        for nft in cards:
            total_w += card_w.get(nft.rarity, 0.0)
        if total_w <= 0.0:  # every present tier weighted 0 -> uniform fallback
            return cards[st.rng.randrange(len(cards))]
        target = st.rng.random() * total_w
        acc = 0.0
        for nft in cards:
            acc += card_w.get(nft.rarity, 0.0)
            if target <= acc:
                return nft
        return cards[-1]  # float guard: fall through to the last card

    def observe(self, st: "SimState", spinner: "SpinnerState", won: "NFT") -> None:
        return None
