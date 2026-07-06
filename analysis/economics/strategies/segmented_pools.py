"""[variation 6] segmented_pools — per-rarity segmented pools.

Instead of one flat pool where a legendary can be won for a common-tier fee,
this variation partitions inventory into one sub-pool ("banner") per rarity.
The engine picks a banner *before* the spinner pays, so:

  - The spin fee is derived from that banner's OWN expected value
    (``PerSegmentPricing``) — a common banner costs the common mean, a legendary
    banner costs the legendary mean. Cross-tier subsidy is removed.
  - Per-spin variance is quarantined: a common-banner pull can never award a
    $6k legendary. You know which banner you are buying into.
  - The cost is shallower per-banner depth, so individual banners deplete faster
    than the single flat pool at equal spins.

This is a DESIGN PROPOSAL that diverges from the on-chain single-pool draw; the
default topology (``single``) stays byte-identical to today. Two seams are
registered from this one module:

  register("topology", "segmented")  -> SegmentedPools
  register("pricing",  "per_segment") -> PerSegmentPricing

Determinism: banner selection uses exactly ONE ``st.rng.random()`` call per
tick (depth-weighted by default). All randomness routes through ``st.rng``.
"""

from __future__ import annotations

from econ_model import spin_fee_usd
from strategies.base import sample_value
from strategies.registry import register


def _norm_weights(choice_weights):
    """Coerce a params-supplied weight map/list into ``{seg_int: float}``.

    Accepts ``None`` (=> depth-weighted default), a list indexed by rarity, or a
    dict keyed by rarity index (JSON string keys tolerated). Returns ``None``
    when no explicit weights were given so the default depth policy is used.
    """
    if choice_weights is None:
        return None
    if isinstance(choice_weights, dict):
        return {int(k): float(v) for k, v in choice_weights.items()}
    # list / tuple: position == rarity index
    return {int(i): float(w) for i, w in enumerate(choice_weights)}


@register("topology", "segmented")
class SegmentedPools:
    """PoolTopology: one inventory list per rarity band.

    ``Segment`` here is the integer rarity index. ``choose_segment`` picks which
    banner this tick spins; by default banners are depth-weighted (a card is
    equally likely across all banners, so the aggregate draw distribution equals
    the flat pool while per-spin variance is still quarantined and pricing is
    per-banner). Supplying ``choice_weights`` switches to a fixed per-banner
    selection weight (empty banners are always skipped so a spin never targets a
    depleted banner while depth remains elsewhere).

    Params (all optional, scalars / JSON-serialisable):
        segment_by:     only "rarity" supported (guarded for forward-compat).
        choice_weights: dict{rarity:int -> weight} or list[weight]; None =>
                        depth-weighted.
    """

    def __init__(self, segment_by: str = "rarity", choice_weights=None):
        if segment_by != "rarity":
            raise ValueError(f"segmented_pools: unsupported segment_by={segment_by!r} (only 'rarity')")
        self.segment_by = segment_by
        self._choice_weights = _norm_weights(choice_weights)
        self._pools: dict[int, list] = {}

    # --- lifecycle --------------------------------------------------------
    def init(self, st) -> None:
        """Seed each banner independently in band order (== today's seeding).

        Uses the engine helpers so depositor bookkeeping and NFT ids match the
        default path exactly; band-order triangular sampling keeps rng usage
        identical to the flat-pool seeding.
        """
        bands = st.scenario.bands
        self._pools = {r: [] for r in range(len(bands))}
        for r_idx, band in enumerate(bands):
            for _ in range(band.count):
                did = st.new_depositor(r_idx)
                val = sample_value(st.rng, band.lo_usd, band.hi_usd)
                st.add_nft(r_idx, val, did)

    # --- partitioning -----------------------------------------------------
    def segments(self, st) -> list:
        # Fixed-length over all rarity bands (keeps per-segment TierStats valid).
        return list(range(len(st.scenario.bands)))

    def _weight(self, st, seg) -> float:
        c = self.count(st, seg)
        if c == 0:
            return 0.0  # never target an empty banner while depth exists
        if self._choice_weights is not None:
            # Fall back to depth for any non-empty banner the caller omitted, so a
            # partial choice_weights map doesn't silently strand inventory (a banner
            # with cards but no listed weight would otherwise never be spun).
            return float(self._choice_weights.get(seg, c))
        return float(c)  # depth-weighted default

    def choose_segment(self, st):
        """Pick the banner this tick spins. Exactly ONE rng call (or zero when
        the whole pool is empty, in which case the engine's count==0 refund
        branch fires)."""
        segs = self.segments(st)
        if not segs:
            return None
        weights = [self._weight(st, s) for s in segs]
        total = sum(weights)
        if total <= 0.0:
            # Every banner empty: return one so engine takes its refund path.
            return segs[0]
        r = st.rng.random() * total
        acc = 0.0
        for s, w in zip(segs, weights):
            acc += w
            if r <= acc:
                return s
        return segs[-1]

    # --- inventory accessors ---------------------------------------------
    def cards(self, st, seg) -> list:
        return self._pools.get(seg, [])

    def count(self, st, seg) -> int:
        return len(self._pools.get(seg, []))

    def total_value(self, st, seg) -> float:
        return sum(n.appraisal_usd for n in self._pools.get(seg, []))

    def all_cards(self, st) -> list:
        out: list = []
        for r in range(len(st.scenario.bands)):
            out.extend(self._pools.get(r, []))
        return out

    # --- mutation ---------------------------------------------------------
    def add(self, st, nft) -> None:
        # Route by the card's own rarity so redemption re-adds land in-banner.
        self._pools.setdefault(nft.rarity, []).append(nft)

    def remove(self, st, seg, nft) -> None:
        """Swap-pop by identity (== today's ``pool[idx]=pool[-1];pop()``)."""
        pool = self._pools.get(seg)
        if pool is not None and self._swap_pop(pool, nft):
            return
        # Defensive fallback: card not in the expected banner (should not happen
        # since seg == nft.rarity for every draw). Search all banners.
        for p in self._pools.values():
            if p is pool:
                continue
            if self._swap_pop(p, nft):
                return

    @staticmethod
    def _swap_pop(pool, nft) -> bool:
        for i in range(len(pool)):
            if pool[i] is nft:
                pool[i] = pool[-1]
                pool.pop()
                return True
        return False


@register("pricing", "per_segment")
class PerSegmentPricing:
    """PricingStrategy: charge each banner its own ``EV*(1+premium)``.

    Because ``DrawStrategy.expected_value(st, seg)`` already returns the chosen
    banner's mean (it reads ``topology.total_value/count`` for that segment),
    the per-banner fee falls out for free. This seam additionally allows a
    per-banner premium override (patient discovery: charge a fatter premium on
    high-variance legendary banners, thinner on commons) while still consuming
    only ``ev`` — it never re-derives draw math.

    Params (all optional):
        premium_bps:        int override applied to EVERY banner (else the
                            scenario's premium_bps).
        premium_by_segment: dict{rarity:int -> bps} per-banner override (wins
                            over premium_bps for that banner).
    """

    def __init__(self, premium_bps=None, premium_by_segment=None):
        self._premium = None if premium_bps is None else int(premium_bps)
        if premium_by_segment is None:
            self._premium_by_segment = None
        else:
            self._premium_by_segment = {int(k): int(v) for k, v in dict(premium_by_segment).items()}

    def spin_fee(self, st, seg, ev) -> float:
        premium = st.scenario.premium_bps
        if self._premium is not None:
            premium = self._premium
        if self._premium_by_segment is not None and seg in self._premium_by_segment:
            premium = self._premium_by_segment[seg]
        return spin_fee_usd(ev, premium, st.scenario.min_fee_usd, st.scenario.max_fee_usd)
