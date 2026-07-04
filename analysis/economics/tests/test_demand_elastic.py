"""Focused tests for the demand_elasticity variation (strategies/demand_elastic.py).

Run from analysis/economics/ (so the flat imports + `strategies` package resolve):
    python3 -m unittest tests.test_demand_elastic
    python3 -m pytest  tests/test_demand_elastic.py

These exercise the strategy in isolation via a tiny SimState stub (wants_spin /
purchase_size only ever read ``st.rng``), so they do not depend on the full
engine and stay fast + deterministic.
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

from scenarios import StratSpec
from strategies.demand_elastic import ElasticDemand
from strategies.registry import available, build


class _StubState:
    """Minimal SimState surface used by DemandStrategy: just the shared rng."""

    def __init__(self, seed: int = 0) -> None:
        self.rng = random.Random(seed)


def _accepted_fraction(strat: ElasticDemand, ev: float, fee: float, n: int, seed: int) -> float:
    st = _StubState(seed)
    hits = sum(1 for _ in range(n) if strat.wants_spin(st, None, ev, fee))
    return hits / n


EV = 100.0


class TestAcceptProbShape(unittest.TestCase):
    def test_at_or_below_anchor_always_accepts(self):
        for form in ("power", "exp"):
            strat = ElasticDemand(beta=2.0, form=form)
            for fee in (0.0, 1.0, 50.0, EV):  # fee <= ev
                self.assertEqual(strat.accept_prob(EV, fee), 1.0, (form, fee))

    def test_prob_strictly_decreasing_in_fee_above_anchor(self):
        fees = [EV * m for m in (1.2, 1.5, 2.0, 3.0, 5.0)]
        for form in ("power", "exp"):
            strat = ElasticDemand(beta=1.5, form=form)
            ps = [strat.accept_prob(EV, f) for f in fees]
            self.assertTrue(all(0.0 <= p <= 1.0 for p in ps), (form, ps))
            self.assertTrue(
                all(ps[i] > ps[i + 1] for i in range(len(ps) - 1)),
                f"{form} accept_prob not strictly decreasing in fee: {ps}",
            )

    def test_beta_zero_recovers_inelastic(self):
        # beta -> 0 : p == 1 everywhere (volume matches inelastic demand).
        for form in ("power", "exp"):
            strat = ElasticDemand(beta=0.0, form=form)
            for fee in (EV, 2 * EV, 10 * EV):
                self.assertEqual(strat.accept_prob(EV, fee), 1.0, (form, fee))
            # Sampled: every tick accepted, so fraction is exactly 1.0.
            self.assertEqual(_accepted_fraction(strat, EV, 3 * EV, 5_000, seed=1), 1.0)

    def test_reference_price_overrides_ev_anchor(self):
        # With a fixed anchor of 200, a fee of 150 is "cheap" (always accept),
        # even though it is a 50% markup over the live EV of 100.
        strat = ElasticDemand(beta=2.0, form="exp", reference_price=200.0)
        self.assertEqual(strat.accept_prob(EV, 150.0), 1.0)
        # Above the reference anchor, demand erodes.
        self.assertLess(strat.accept_prob(EV, 400.0), 1.0)
        # Without the reference price, 150 over EV=100 is a real markup < 1.
        self.assertLess(ElasticDemand(beta=2.0, form="exp").accept_prob(EV, 150.0), 1.0)


class TestRevenueOptimum(unittest.TestCase):
    def test_exp_form_revenue_is_single_peaked_interior(self):
        # Exponential WTP with beta < 1 has an analytic interior revenue peak at
        # fee = anchor / beta. Here beta=0.5 -> peak at 2*EV. Sweeping the fee
        # (== sweeping premium) must show revenue rise then fall with an
        # interior argmax (proves a revenue-maximizing premium exists).
        strat = ElasticDemand(beta=0.5, form="exp")
        fees = [EV * (1.0 + 0.1 * k) for k in range(0, 31)]  # EV .. 4*EV
        rev = [f * strat.accept_prob(EV, f) for f in fees]
        peak = max(range(len(rev)), key=lambda i: rev[i])
        self.assertTrue(0 < peak < len(rev) - 1, f"peak at boundary idx {peak}")
        self.assertTrue(all(rev[i] <= rev[i + 1] for i in range(peak)), "not rising to peak")
        self.assertTrue(
            all(rev[i] >= rev[i + 1] for i in range(peak, len(rev) - 1)),
            "not falling after peak",
        )
        # Analytic optimum fee = EV / beta = 2*EV; argmax fee within one grid step.
        self.assertAlmostEqual(fees[peak], EV / strat.beta, delta=EV * 0.1 + 1e-6)

    def test_accepted_fraction_monotone_decreasing_in_fee(self):
        # Executed volume falls as the fee (premium) rises — the mechanism that
        # makes revenue non-monotone.
        strat = ElasticDemand(beta=1.0, form="exp")
        fees = [EV * m for m in (1.0, 1.5, 2.0, 3.0, 4.0)]
        fracs = [_accepted_fraction(strat, EV, f, 40_000, seed=7) for f in fees]
        for i in range(len(fracs) - 1):
            self.assertGreaterEqual(fracs[i] + 0.01, fracs[i + 1], fracs)


class TestRngIntegration(unittest.TestCase):
    def test_exactly_one_rng_draw_per_consulted_tick(self):
        # Reconstruct the accept sequence from a parallel Random to prove each
        # wants_spin() consumes exactly one random() in order.
        strat = ElasticDemand(beta=1.5, form="power")
        fee = 2.5 * EV
        p = strat.accept_prob(EV, fee)
        st = _StubState(seed=42)
        got = [strat.wants_spin(st, None, EV, fee) for _ in range(200)]
        ref = random.Random(42)
        expected = [ref.random() < p for _ in range(200)]
        self.assertEqual(got, expected)

    def test_determinism_same_seed_same_sequence(self):
        strat = ElasticDemand(beta=1.2, form="exp")
        a = [ElasticDemand.wants_spin(strat, _StubState(3), None, EV, 3 * EV) for _ in range(1)]
        seqA = [strat.wants_spin(_StubState(3), None, EV, 3 * EV) for _ in range(1)]  # noqa: F841
        st1, st2 = _StubState(3), _StubState(3)
        s1 = [strat.wants_spin(st1, None, EV, 3 * EV) for _ in range(500)]
        s2 = [strat.wants_spin(st2, None, EV, 3 * EV) for _ in range(500)]
        self.assertEqual(s1, s2)
        del a, seqA

    def test_purchase_size_is_one_and_touches_no_rng(self):
        strat = ElasticDemand(beta=1.0)
        st = _StubState(9)
        before = st.rng.getstate()
        self.assertEqual(strat.purchase_size(st, None), 1)
        self.assertEqual(st.rng.getstate(), before, "purchase_size consumed rng")


class TestConfigAndRegistry(unittest.TestCase):
    def test_registered_under_demand_seam(self):
        self.assertIn("elastic", available("demand"))

    def test_build_from_stratspec_params(self):
        strat = build("demand", StratSpec("elastic", {"beta": 2.0, "form": "exp"}))
        self.assertIsInstance(strat, ElasticDemand)
        self.assertEqual(strat.beta, 2.0)
        self.assertEqual(strat.form, "exp")

    def test_rejects_bad_form_and_negative_beta(self):
        with self.assertRaises(ValueError):
            ElasticDemand(form="linear")
        with self.assertRaises(ValueError):
            ElasticDemand(beta=-1.0)


if __name__ == "__main__":
    unittest.main()
