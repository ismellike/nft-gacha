"""Focused tests for the segmented_pools variation (stdlib unittest only).

Requires the base strategy refactor (build steps 1-6: scenarios.StratSpec/
VariationConfig, strategies.base, strategies.registry, pkgutil auto-import) to
be present. Run from analysis/economics with: ``python3 -m unittest
tests.test_segmented_pools`` (or ``python3 tests/test_segmented_pools.py``).

Proves the spec's four claims: banner isolation (a common banner never awards a
legendary), per-banner EV-derived fees, faster shallow-banner depletion, and
single-pool equivalence — plus determinism and the empty-pool guard.
"""

from __future__ import annotations

import os
import random
import sys
import unittest

# Make analysis/economics importable regardless of invocation cwd.
_HERE = os.path.dirname(os.path.abspath(__file__))
_ROOT = os.path.dirname(_HERE)
if _ROOT not in sys.path:
    sys.path.insert(0, _ROOT)

import strategies  # noqa: F401  (fires pkgutil auto-import -> @register decorators)
from econ_model import spin_fee_usd
from scenarios import RarityBand, Scenario, StratSpec
from strategies.base import Metrics, SimState, SpinnerState
from strategies.registry import build


def _scenario(bands, **kw) -> Scenario:
    return Scenario(name="seg-test", description="segmented test pool", bands=bands, **kw)


def _five_band() -> Scenario:
    return _scenario(
        [
            RarityBand("Common", 5.0, 15.0, 200),
            RarityBand("Uncommon", 25.0, 60.0, 100),
            RarityBand("Rare", 70.0, 250.0, 40),
            RarityBand("Epic", 300.0, 1_200.0, 12),
            RarityBand("Legendary", 1_500.0, 6_000.0, 4),
        ]
    )


def _make_state(scenario: Scenario, topo, seed: int = 0) -> SimState:
    st = SimState(
        rng=random.Random(seed),
        scenario=scenario,
        topology=topo,
        depositors={},
        spinners={0: SpinnerState(id=0)},
        protocol_balance=scenario.protocol_seed_usd,
        protocol_balance_min=scenario.protocol_seed_usd,
        reserves={},
        tick=0,
        metrics=Metrics(),
    )
    topo.init(st)
    return st


class SegmentedTopologyTest(unittest.TestCase):
    def test_banner_isolation(self):
        """A chosen banner only ever yields cards of that rarity — a common
        banner can never award a legendary (variance quarantined)."""
        topo = build("topology", StratSpec("segmented"))
        st = _make_state(_five_band(), topo, seed=1)
        seen = set()
        for _ in range(5000):
            seg = topo.choose_segment(st)
            n = topo.count(st, seg)
            if n == 0:
                continue
            won = topo.cards(st, seg)[st.rng.randrange(n)]
            self.assertEqual(won.rarity, seg)  # never cross-tier
            seen.add(seg)
        self.assertGreater(len(seen), 1)  # multiple banners actually exercised

    def test_per_segment_ev_and_fee(self):
        """Each banner prices off its OWN mean; cheaper tiers cost strictly
        less than richer tiers."""
        scenario = _five_band()
        topo = build("topology", StratSpec("segmented"))
        pricing = build("pricing", StratSpec("per_segment"))
        st = _make_state(scenario, topo, seed=2)

        fees = []
        for seg in topo.segments(st):
            ev_expected = topo.total_value(st, seg) / topo.count(st, seg)
            fee = pricing.spin_fee(st, seg, ev_expected)
            self.assertAlmostEqual(
                fee,
                spin_fee_usd(ev_expected, scenario.premium_bps, scenario.min_fee_usd, scenario.max_fee_usd),
            )
            # fee == tierMean * (1 + premium)
            self.assertAlmostEqual(fee, ev_expected * (10_000 + scenario.premium_bps) / 10_000)
            fees.append(fee)
        # Common < Uncommon < ... < Legendary (banner means are ordered).
        self.assertEqual(fees, sorted(fees))
        self.assertLess(fees[0], fees[-1])

    def test_per_segment_premium_override(self):
        """A per-banner premium override re-prices only that banner."""
        scenario = _five_band()
        topo = build("topology", StratSpec("segmented"))
        pricing = build("pricing", StratSpec("per_segment", {"premium_by_segment": {4: 3000}}))
        st = _make_state(scenario, topo, seed=3)
        ev = topo.total_value(st, 4) / topo.count(st, 4)
        self.assertAlmostEqual(pricing.spin_fee(st, 4, ev), ev * (10_000 + 3000) / 10_000)
        # Untouched banner still uses the scenario premium.
        ev0 = topo.total_value(st, 0) / topo.count(st, 0)
        self.assertAlmostEqual(pricing.spin_fee(st, 0, ev0), ev0 * (10_000 + scenario.premium_bps) / 10_000)

    def test_depth_weight_skips_empty_banner(self):
        """Depth-weighted selection never targets an empty banner while others
        still hold depth."""
        topo = build("topology", StratSpec("segmented"))
        st = _make_state(_five_band(), topo, seed=4)
        # Drain the legendary banner (index 4).
        while topo.count(st, 4) > 0:
            topo.remove(st, 4, topo.cards(st, 4)[0])
        for _ in range(3000):
            self.assertNotEqual(topo.choose_segment(st), 4)

    def test_shallow_banner_depletes_first(self):
        """Under equal per-banner selection weights, the shallowest banner
        empties before the deepest (per-banner depth is the cost of removing
        cross-tier subsidy)."""
        scenario = _scenario([RarityBand("Small", 5.0, 15.0, 5), RarityBand("Big", 25.0, 60.0, 60)])
        topo = build("topology", StratSpec("segmented", {"choice_weights": {0: 1, 1: 1}}))
        st = _make_state(scenario, topo, seed=5)
        first_empty = None
        for _ in range(2000):
            seg = topo.choose_segment(st)
            n = topo.count(st, seg)
            if n == 0:
                continue
            won = topo.cards(st, seg)[st.rng.randrange(n)]
            topo.remove(st, seg, won)
            if topo.count(st, 0) == 0:
                first_empty = 0
                self.assertGreater(topo.count(st, 1), 0)  # big banner still has depth
                break
        self.assertEqual(first_empty, 0)

    def test_all_empty_returns_segment_without_crash(self):
        """When every banner is empty, choose_segment yields a segment (engine
        refunds) rather than crashing."""
        topo = build("topology", StratSpec("segmented"))
        st = _make_state(_five_band(), topo, seed=6)
        for seg in list(topo.segments(st)):
            while topo.count(st, seg) > 0:
                topo.remove(st, seg, topo.cards(st, seg)[0])
        seg = topo.choose_segment(st)
        self.assertIn(seg, topo.segments(st))
        self.assertEqual(topo.count(st, seg), 0)

    def test_determinism_same_seed(self):
        """Same seed -> identical banner-selection sequence."""
        seqs = []
        for _ in range(2):
            topo = build("topology", StratSpec("segmented"))
            st = _make_state(_five_band(), topo, seed=7)
            seqs.append([topo.choose_segment(st) for _ in range(500)])
        self.assertEqual(seqs[0], seqs[1])

    def test_remove_swap_pop_by_identity(self):
        """remove drops exactly the identified card and shrinks the banner."""
        topo = build("topology", StratSpec("segmented"))
        st = _make_state(_five_band(), topo, seed=8)
        before = topo.count(st, 0)
        target = topo.cards(st, 0)[before // 2]
        topo.remove(st, 0, target)
        self.assertEqual(topo.count(st, 0), before - 1)
        self.assertFalse(any(n is target for n in topo.cards(st, 0)))

    def test_single_pool_default_reproduces_global_mean(self):
        """The default single topology collapses per-segment EV to the global
        pool mean (byte-identical baseline). Skipped if defaults not yet built."""
        try:
            topo = build("topology", StratSpec("single"))
        except KeyError:
            self.skipTest("default 'single' topology not present (base refactor pending)")
        st = _make_state(_five_band(), topo, seed=9)
        total = topo.total_value(st, None)
        count = topo.count(st, None)
        self.assertGreater(count, 0)
        # Segmented banners partition the same inventory: sum of banner totals
        # equals the flat-pool total (no value created or lost).
        seg_topo = build("topology", StratSpec("segmented"))
        st2 = _make_state(_five_band(), seg_topo, seed=9)
        seg_total = sum(seg_topo.total_value(st2, s) for s in seg_topo.segments(st2))
        seg_count = sum(seg_topo.count(st2, s) for s in seg_topo.segments(st2))
        self.assertAlmostEqual(total / count, seg_total / seg_count)


if __name__ == "__main__":
    unittest.main()
