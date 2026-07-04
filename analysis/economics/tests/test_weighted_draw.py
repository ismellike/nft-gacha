"""Focused tests for the weighted_draw variation (stdlib unittest, deterministic).

Run from ``analysis/economics/``::

    python -m unittest tests.test_weighted_draw -v

These use a minimal in-memory topology/state stub (the only surface WeightedDraw
touches is ``st.rng``, ``st.scenario.bands`` and ``st.topology.cards(st, seg)``),
so they validate the strategy's economics without depending on the full engine.
Card values are fixed (not sampled) so tier means are exact.
"""

from __future__ import annotations

import os
import random
import sys
import unittest

# Make the economics package importable when run directly or via unittest.
_HERE = os.path.dirname(os.path.abspath(__file__))
_ECON = os.path.dirname(_HERE)
if _ECON not in sys.path:
    sys.path.insert(0, _ECON)

from econ_model import expected_value_usd, spin_fee_usd  # noqa: E402
from scenarios import RarityBand, Scenario  # noqa: E402
from strategies.base import NFT  # noqa: E402
from strategies.registry import available, build  # noqa: E402
from strategies.weighted_draw import WeightedDraw  # noqa: E402

try:  # StratSpec is added to scenarios.py during the refactor; build() consumes it.
    from scenarios import StratSpec
except ImportError:  # pragma: no cover - integration not yet complete
    StratSpec = None


# --- tiny in-memory engine stubs (only what WeightedDraw reads) -------------
class _FakeTopology:
    def __init__(self, cards):
        self._cards = list(cards)

    def cards(self, st, seg):
        if seg is None:
            return self._cards
        return [c for c in self._cards if c.rarity == seg]

    def count(self, st, seg):
        return len(self.cards(st, seg))

    def total_value(self, st, seg):
        return sum(c.appraisal_usd for c in self.cards(st, seg))


class _FakeState:
    def __init__(self, scenario, cards, seed=0):
        self.rng = random.Random(seed)
        self.scenario = scenario
        self.topology = _FakeTopology(cards)


def _scenario():
    # 3 tiers; counts 5/3/2, fixed values 10/40/150 -> pool mean = 470/10 = 47.
    return Scenario(
        name="wtest",
        description="weighted-draw unit test pool",
        bands=[
            RarityBand("Common", 5.0, 15.0, 5),
            RarityBand("Uncommon", 25.0, 60.0, 3),
            RarityBand("Rare", 70.0, 250.0, 2),
        ],
    )


def _cards():
    vals = {0: 10.0, 1: 40.0, 2: 150.0}
    counts = {0: 5, 1: 3, 2: 2}
    out = []
    nid = 0
    for rarity, n in counts.items():
        for _ in range(n):
            out.append(NFT(id=nid, rarity=rarity, appraisal_usd=vals[rarity], depositor_id=nid))
            nid += 1
    return out


POOL_MEAN = 47.0
TIER_MEAN_OF_MEANS = (10.0 + 40.0 + 150.0) / 3.0  # 66.666...


class TestWeightedDraw(unittest.TestCase):
    # -- wiring ----------------------------------------------------------
    def test_registered_under_draw_seam(self):
        self.assertIn("weighted", available("draw"))

    @unittest.skipIf(StratSpec is None, "StratSpec not yet added to scenarios.py")
    def test_buildable_from_registry(self):
        strat = build("draw", StratSpec("weighted", {"weights": [1, 1, 1]}))
        self.assertIsInstance(strat, WeightedDraw)

    def test_flagged_non_contract(self):
        # Report layer relies on this hint to label the divergence from on-chain.
        self.assertTrue(getattr(WeightedDraw, "NON_CONTRACT", False))

    # -- EV equivalence / re-pricing ------------------------------------
    def test_default_weights_reproduce_pool_mean_exactly(self):
        st = _FakeState(_scenario(), _cards())
        ev = WeightedDraw().expected_value(st, None)
        # Bit-exact identity with the on-chain uniform-over-pool EV.
        self.assertEqual(ev, expected_value_usd(470.0, 10))
        self.assertEqual(ev, POOL_MEAN)

    def test_weights_proportional_to_counts_match_pool_mean(self):
        st = _FakeState(_scenario(), _cards())
        ev = WeightedDraw(weights=[5, 3, 2]).expected_value(st, None)
        self.assertAlmostEqual(ev, POOL_MEAN, places=9)

    def test_equal_weights_give_mean_of_tier_means(self):
        # Equal drop rates != uniform-over-pool; this is the intended knob.
        st = _FakeState(_scenario(), _cards())
        ev = WeightedDraw(weights=[1, 1, 1]).expected_value(st, None)
        self.assertAlmostEqual(ev, TIER_MEAN_OF_MEANS, places=9)
        self.assertGreater(ev, POOL_MEAN)

    def test_boosting_a_rare_tier_reprices_ev_upward(self):
        st = _FakeState(_scenario(), _cards())
        base = WeightedDraw().expected_value(st, None)
        boosted = WeightedDraw(rare_weight=100).expected_value(st, None)
        self.assertGreater(boosted, base)

    def test_named_override_matches_explicit_weights(self):
        st1 = _FakeState(_scenario(), _cards())
        st2 = _FakeState(_scenario(), _cards())
        by_name = WeightedDraw(rare_weight=100).expected_value(st1, None)
        by_list = WeightedDraw(weights=[5, 3, 100]).expected_value(st2, None)
        self.assertAlmostEqual(by_name, by_list, places=9)

    def test_normalize_false_equal_weights_is_uniform_over_pool(self):
        st = _FakeState(_scenario(), _cards())
        ev = WeightedDraw(weights=[1, 1, 1], normalize=False).expected_value(st, None)
        self.assertAlmostEqual(ev, POOL_MEAN, places=9)

    def test_normalize_string_false_is_coerced(self):
        st = _FakeState(_scenario(), _cards())
        ev = WeightedDraw(weights=[1, 1, 1], normalize="false").expected_value(st, None)
        self.assertAlmostEqual(ev, POOL_MEAN, places=9)

    def test_empty_pool_ev_is_zero(self):
        st = _FakeState(_scenario(), [])
        self.assertEqual(WeightedDraw(weights=[1, 1, 1]).expected_value(st, None), 0.0)

    def test_unknown_param_rejected(self):
        with self.assertRaises(TypeError):
            WeightedDraw(legendary=50)  # missing the _weight suffix

    # -- draw behaviour --------------------------------------------------
    def _empirical(self, strat, seed=123, n=60000, seg=None):
        st = _FakeState(_scenario(), _cards(), seed=seed)
        freq = {}
        val_sum = 0.0
        for _ in range(n):
            won = strat.draw(st, seg, spinner=None)
            freq[won.rarity] = freq.get(won.rarity, 0) + 1
            val_sum += won.appraisal_usd
        return {r: c / n for r, c in freq.items()}, val_sum / n

    def test_draw_frequencies_match_configured_drop_rates(self):
        # Equal weights => each of the 3 tiers ~1/3 regardless of inventory depth.
        freq, _ = self._empirical(WeightedDraw(weights=[1, 1, 1]))
        for r in (0, 1, 2):
            self.assertAlmostEqual(freq[r], 1.0 / 3.0, delta=0.02)

    def test_draw_frequencies_track_weights_when_skewed(self):
        # Weights 6/3/1 => normalized drop rates 0.6 / 0.3 / 0.1.
        freq, _ = self._empirical(WeightedDraw(weights=[6, 3, 1]))
        self.assertAlmostEqual(freq[0], 0.60, delta=0.02)
        self.assertAlmostEqual(freq[1], 0.30, delta=0.02)
        self.assertAlmostEqual(freq[2], 0.10, delta=0.02)

    def test_mean_drawn_value_equals_expected_value(self):
        # Realized average won value must equal the EV the fee is charged against
        # -> proves the fee is re-derived from the TRUE weighted EV (edge==premium).
        strat = WeightedDraw(weights=[6, 3, 1])
        st = _FakeState(_scenario(), _cards())
        ev = strat.expected_value(st, None)
        _, mean_val = self._empirical(strat)
        self.assertAlmostEqual(mean_val, ev, delta=1.5)

    def test_house_edge_equals_premium_under_skew(self):
        # fee = EV*(1+premium); realized edge = 1 - E[value]/fee ~= premium/(1+premium).
        premium_bps = 500
        strat = WeightedDraw(weights=[2, 5, 1])
        st = _FakeState(_scenario(), _cards())
        ev = strat.expected_value(st, None)
        fee = spin_fee_usd(ev, premium_bps)
        _, mean_val = self._empirical(strat)
        realized_edge = 1.0 - (mean_val / fee)
        expected_edge = premium_bps / (10_000.0 + premium_bps)
        self.assertAlmostEqual(realized_edge, expected_edge, delta=0.02)

    def test_empty_tier_never_awarded(self):
        # Only tiers 0 and 2 have cards; tier 1 present in bands but empty.
        cards = [
            NFT(id=0, rarity=0, appraisal_usd=10.0, depositor_id=0),
            NFT(id=1, rarity=0, appraisal_usd=10.0, depositor_id=1),
            NFT(id=2, rarity=2, appraisal_usd=150.0, depositor_id=2),
        ]
        st = _FakeState(_scenario(), cards, seed=1)
        strat = WeightedDraw(weights=[1, 1, 1])
        seen = set()
        for _ in range(2000):
            seen.add(strat.draw(st, None, None).rarity)
        self.assertNotIn(1, seen)  # empty tier skipped, no crash
        # EV must ignore the empty tier too: only tiers 0 and 2 counted.
        self.assertAlmostEqual(strat.expected_value(st, None), (10.0 + 150.0) / 2.0, places=9)

    def test_segment_scoped_draw(self):
        # seg=int restricts to that rarity; composes with segmented_pools.
        st = _FakeState(_scenario(), _cards(), seed=5)
        strat = WeightedDraw(weights=[1, 1, 1])
        for _ in range(500):
            self.assertEqual(strat.draw(st, 2, None).rarity, 2)
        self.assertAlmostEqual(strat.expected_value(st, 2), 150.0, places=9)

    def test_determinism_same_seed(self):
        strat = WeightedDraw(weights=[3, 2, 1])
        st_a = _FakeState(_scenario(), _cards(), seed=99)
        st_b = _FakeState(_scenario(), _cards(), seed=99)
        seq_a = [strat.draw(st_a, None, None).id for _ in range(500)]
        seq_b = [strat.draw(st_b, None, None).id for _ in range(500)]
        self.assertEqual(seq_a, seq_b)

    def test_observe_is_noop(self):
        st = _FakeState(_scenario(), _cards())
        self.assertIsNone(WeightedDraw().observe(st, None, _cards()[0]))


if __name__ == "__main__":
    unittest.main(verbosity=2)
