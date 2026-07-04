"""Focused, self-contained tests for the pity_guarantees variation.

Stdlib only (``unittest`` + a seeded ``random.Random``). Deterministic. Uses
lightweight duck-typed fakes for SimState / topology / spinner so the test
exercises the REAL :class:`PityDraw` / :class:`BundleDemand` in isolation —
independent of the rest of the engine — touching only the seam surface pity
actually reads (``st.rng``, ``st.scenario.bands``, ``st.topology.cards/count/
total_value``). Because ``draw`` does not mutate inventory, the fake pool is
static across pulls, which lets us measure the draw distribution directly.
"""

from __future__ import annotations

import os
import random
import sys
import unittest

# Make `strategies` importable when run directly (cwd-independent).
_ECON_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _ECON_DIR not in sys.path:
    sys.path.insert(0, _ECON_DIR)

from strategies.pity import BundleDemand, PityDraw  # noqa: E402


# --- Minimal duck-typed fakes ---------------------------------------------
class _Card:
    __slots__ = ("id", "rarity", "appraisal_usd", "depositor_id")

    def __init__(self, cid, rarity, value):
        self.id = cid
        self.rarity = rarity
        self.appraisal_usd = value
        self.depositor_id = 0


class _FakeTopology:
    """Single flat pool; draw() never removes, so it stays static per test."""

    def __init__(self, cards):
        self._cards = list(cards)

    def cards(self, st, seg):
        return self._cards

    def count(self, st, seg):
        return len(self._cards)

    def total_value(self, st, seg):
        return sum(c.appraisal_usd for c in self._cards)


class _FakeScenario:
    def __init__(self, num_rarities):
        self.bands = [None] * num_rarities  # pity only reads len(bands)


class _FakeState:
    def __init__(self, rng, scenario, topology):
        self.rng = rng
        self.scenario = scenario
        self.topology = topology


class _Spinner:
    def __init__(self):
        self.pity_counter = 0


class _CountingRandom(random.Random):
    """Counts rng consumption to assert the one-call-per-draw discipline.

    NOTE: only ``randrange`` is counted. We deliberately do NOT override
    ``random()`` — doing so makes CPython reroute ``randrange`` through
    ``random()`` internally (bypassing getrandbits), which would double-count.
    PityDraw only ever calls ``randrange``, so counting it is exactly the
    per-draw rng budget.
    """

    def __init__(self, seed):
        super().__init__(seed)
        self.calls = 0

    def randrange(self, *a, **k):
        self.calls += 1
        return super().randrange(*a, **k)


# Fixed per-rarity value so E[value|>=floor] is exactly computable.
# entry: (rarity, value, count)  — count may be 0 to declare an EMPTY tier.
_POOL_SPEC = [(0, 10.0, 50), (1, 40.0, 30), (2, 150.0, 20), (3, 700.0, 10), (4, 3000.0, 5)]
_NUM_RARITIES = len(_POOL_SPEC)


def _make_state(seed=0, spec=_POOL_SPEC, counting=False, num_rarities=None):
    cards = []
    cid = 0
    for rarity, value, count in spec:
        for _ in range(count):
            cards.append(_Card(cid, rarity, value))
            cid += 1
    rng = _CountingRandom(seed) if counting else random.Random(seed)
    bands = num_rarities if num_rarities is not None else len(spec)
    return _FakeState(rng, _FakeScenario(bands), _FakeTopology(cards))


class TestPityDraw(unittest.TestCase):
    def test_no_gap_between_floor_hits_exceeds_n(self):
        """Hard guarantee: forced pulls land every pity_n pulls (gap <= N)."""
        n = 10
        floor = 4
        st = _make_state(seed=1)
        draw = PityDraw(pity_n=n, floor_tier=floor)
        spinner = _Spinner()
        floor_hits = []
        for pull in range(1, 501):
            won = draw.draw(st, None, spinner)
            if won.rarity >= floor:
                floor_hits.append(pull)
        # First guaranteed hit within N pulls, and never a longer dry spell.
        self.assertLessEqual(floor_hits[0], n)
        max_gap = max(b - a for a, b in zip(floor_hits, floor_hits[1:]))
        self.assertLessEqual(max_gap, n)
        # Every N-th pull is a forced floor hit (counter resets only when forced).
        for pull in range(n, 501, n):
            self.assertIn(pull, floor_hits, f"pull {pull} should be a guaranteed floor hit")

    def test_single_rng_call_per_draw(self):
        """RNG discipline: exactly one rng draw per pull (matches UniformDraw)."""
        st = _make_state(seed=2, counting=True)
        draw = PityDraw(pity_n=7, floor_tier=4)
        spinner = _Spinner()
        m = 300
        for _ in range(m):
            draw.draw(st, None, spinner)
        self.assertEqual(st.rng.calls, m)

    def test_ev_uplift_priced_correctly(self):
        """expected_value() == realized mean payout => house_edge == premium.

        Since fee = premium * expected_value() and the spinner receives the drawn
        card, the house edge equals the configured premium iff expected_value()
        equals the long-run mean drawn value. We verify that equality empirically.
        """
        n = 10
        floor = 4
        st = _make_state(seed=3)
        draw = PityDraw(pity_n=n, floor_tier=floor)
        declared_ev = draw.expected_value(st, None)

        # Analytic cross-check of the declared EV.
        total = sum(v * c for _, v, c in _POOL_SPEC)
        count = sum(c for _, _, c in _POOL_SPEC)
        base_mean = total / count
        e_floor = 3000.0  # only rarity-4 cards qualify, all valued 3000
        self.assertAlmostEqual(declared_ev, base_mean + (e_floor - base_mean) / n, places=6)

        spinner = _Spinner()
        m = 100_000
        acc = 0.0
        for _ in range(m):
            acc += draw.draw(st, None, spinner).appraisal_usd
        empirical = acc / m
        # Empirical mean converges to the declared EV -> the uplift is priced right.
        self.assertAlmostEqual(empirical / declared_ev, 1.0, delta=0.03)

    def test_uniform_base_ev_matches_pool_mean(self):
        """With pity_n huge the uplift -> 0 and base EV is the pool mean.

        This is the equivalence anchor: the internal uniform base reproduces
        econ_model.expected_value_usd (pool mean) up to the vanishing uplift.
        """
        st = _make_state(seed=0)
        total = sum(v * c for _, v, c in _POOL_SPEC)
        count = sum(c for _, _, c in _POOL_SPEC)
        pool_mean = total / count
        ev = PityDraw(pity_n=10**9, floor_tier=4).expected_value(st, None)
        self.assertAlmostEqual(ev, pool_mean, delta=1e-3)

    def test_empty_floor_tier_falls_back_without_crash(self):
        """Valid floor index but zero eligible cards -> base draw, no reset."""
        # 5 declared rarities, but the top tier (index 4) has NO cards in pool.
        spec = [(0, 10.0, 40), (1, 40.0, 20), (2, 150.0, 10), (3, 700.0, 5), (4, 3000.0, 0)]
        st = _make_state(seed=5, spec=spec)  # num_rarities == 5 (len(spec))
        draw = PityDraw(pity_n=3, floor_tier=4)
        spinner = _Spinner()
        for _ in range(50):
            won = draw.draw(st, None, spinner)
            self.assertLess(won.rarity, 4)
        # Never fired => counter climbed unbounded (no spurious reset).
        self.assertEqual(spinner.pity_counter, 50)
        # EV degrades to the base pool mean (no uplift available).
        total = sum(v * c for _, v, c in spec)
        count = sum(c for _, _, c in spec)
        self.assertAlmostEqual(draw.expected_value(st, None), total / count, places=6)

    def test_determinism_same_seed(self):
        """Same seed -> identical rarity sequence."""
        def run():
            st = _make_state(seed=42)
            draw = PityDraw(pity_n=8, floor_tier=3)
            sp = _Spinner()
            return [draw.draw(st, None, sp).rarity for _ in range(400)]

        self.assertEqual(run(), run())

    def test_floor_tier_defaults_to_top_rarity(self):
        """floor_tier=None guarantees the top tier (classic jackpot pity)."""
        st = _make_state(seed=7)
        draw = PityDraw(pity_n=5)  # floor_tier omitted
        spinner = _Spinner()
        forced = []
        for pull in range(1, 201):
            won = draw.draw(st, None, spinner)
            if pull % 5 == 0:
                forced.append(won.rarity)
        self.assertTrue(all(r == _NUM_RARITIES - 1 for r in forced))

    def test_floor_tier_is_clamped_to_valid_range(self):
        """An out-of-range floor_tier clamps to the top rarity, never crashes."""
        st = _make_state(seed=8)  # 5 rarities
        draw = PityDraw(pity_n=4, floor_tier=99)
        spinner = _Spinner()
        for pull in range(1, 41):
            won = draw.draw(st, None, spinner)
            if pull % 4 == 0:
                self.assertEqual(won.rarity, _NUM_RARITIES - 1)


class TestBundleDemand(unittest.TestCase):
    def test_purchase_size_and_wants_spin(self):
        d = BundleDemand(bundle_size=10)
        st = _make_state(seed=0)
        self.assertTrue(d.wants_spin(st, None, ev=100.0, fee=105.0))
        self.assertEqual(d.purchase_size(st, None), 10)

    def test_bundle_size_floored_at_one(self):
        self.assertEqual(BundleDemand(bundle_size=0).bundle_size, 1)

    def test_every_bundle_window_contains_a_floor_card(self):
        """pity_n <= bundle_size => each consecutive bundle holds >= 1 floor."""
        n = 5
        bundle = 5
        floor = 4
        st = _make_state(seed=9)
        demand = BundleDemand(bundle_size=bundle)
        draw = PityDraw(pity_n=n, floor_tier=floor)
        spinner = _Spinner()
        rarities = []
        for _ in range(40):  # 40 bundles
            k = demand.purchase_size(st, None)
            self.assertEqual(k, bundle)
            for _ in range(k):
                rarities.append(draw.draw(st, None, spinner).rarity)
        # Chunk the pull stream into bundle-sized windows; each must hold a floor.
        for start in range(0, len(rarities), bundle):
            window = rarities[start:start + bundle]
            self.assertTrue(any(r >= floor for r in window),
                            f"bundle window at {start} lacked a floor card: {window}")


if __name__ == "__main__":
    unittest.main(verbosity=2)
