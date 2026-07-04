"""Focused tests for the ``supply_feedback`` variation (FeedbackSupply).

Runnable stdlib-only (no pytest required):

    python3 tests/test_supply_feedback.py

pytest also collects the ``test_*`` functions.

Covers the spec's four claims plus the zero-regression guarantee:
  * OFF by default: enabling nothing keeps the default ``poisson`` supply and a
    run is byte-identical to the untouched default path.
  * Registration: ``feedback`` is discoverable under the ``supply`` seam.
  * Withdrawals fire ONLY when realised APR is below threshold (a generously
    profitable pool churns no LPs; a starved pool churns some).
  * Determinism: same seed -> identical withdrawal/deposit counts.
  * Endogenous inflow: a high-APR pool attracts strictly more deposits than the
    same base rate would at a low APR.
  * Composition drift: pool depositor set differs from a static-supply run.
  * Safety: never crashes on an empty/thin pool; a withdrawal is not double
    counted as a forfeited loss.
"""

from __future__ import annotations

import dataclasses
import json
import os
import random
import sys

_HERE = os.path.dirname(os.path.abspath(__file__))
_ECON_DIR = os.path.dirname(_HERE)
if _ECON_DIR not in sys.path:
    sys.path.insert(0, _ECON_DIR)

from scenarios import RarityBand, Scenario, StratSpec, VariationConfig, get_scenario  # noqa: E402
from simulate import simulate  # noqa: E402
from strategies import available, build  # noqa: E402
from strategies.base import Metrics, SimState, SpinnerState  # noqa: E402
from strategies.defaults import SinglePool  # noqa: E402


# --- helpers ---------------------------------------------------------------
def _feedback_scenario(base: Scenario, **params) -> Scenario:
    """Clone ``base`` with supply=feedback (all other seams default)."""
    return dataclasses.replace(
        base, variations=VariationConfig(supply=StratSpec("feedback", dict(params)))
    )


def _fresh_state(sc: Scenario, seed: int, tick: int = 0) -> SimState:
    topo = SinglePool()
    st = SimState(
        rng=random.Random(seed),
        scenario=sc,
        topology=topo,
        depositors={},
        spinners={0: SpinnerState(id=0)},
        protocol_balance=0.0,
        protocol_balance_min=0.0,
        reserves={},
        tick=tick,
        metrics=Metrics(),
    )
    topo.init(st)
    st.tick = tick
    return st


def _result_json(sc: Scenario, spins: int, seed: int) -> str:
    return json.dumps(dataclasses.asdict(simulate(sc, spins, seed=seed)), indent=2)


# --- tests -----------------------------------------------------------------
def test_registered() -> None:
    assert "feedback" in available("supply")


def test_off_by_default_is_byte_identical() -> None:
    """A scenario without variations keeps default poisson supply, byte-for-byte."""
    sc = get_scenario("open-liquidity")  # deposit_rate > 0 exercises supply
    # An explicit all-default VariationConfig must equal the implicit default.
    sc_explicit = dataclasses.replace(sc, variations=VariationConfig())
    for seed in range(3):
        assert _result_json(sc, 1500, seed) == _result_json(sc_explicit, 1500, seed)


def test_no_withdrawals_when_pool_is_lucrative() -> None:
    """If every LP's APR clears the threshold, nobody withdraws."""
    sc = _feedback_scenario(
        get_scenario("open-liquidity"),
        withdraw_apr=-1.0,  # impossible to fall below -> APR always >= threshold
        warmup_ticks=0,
    )
    r = simulate(sc, 2000, seed=1)
    # The engine does not surface metrics in SimResult, so re-run at the unit
    # level to read the counter directly (see test below). Here we assert the
    # run is stable and the pool still turns over (sanity).
    assert r.spins_fulfilled > 0


def test_withdrawals_only_below_threshold_unit() -> None:
    """Unit-level: a starving pool withdraws; a lucrative one does not."""
    sc = get_scenario("open-liquidity")

    # (a) withdraw_apr huge -> every LP is 'underwater' -> withdrawals happen.
    starve = build("supply", StratSpec("feedback", {"withdraw_apr": 1e9, "warmup_ticks": 0}))
    st_a = _fresh_state(sc, seed=7, tick=100)
    # Give depositors some yield so APR is finite but below the huge threshold.
    for d in st_a.depositors.values():
        d.yield_usd = 0.01 * d.deposited_value_usd
    starve.step(st_a)
    assert st_a.metrics.withdrawals > 0, "starved pool should shed LPs"

    # (b) withdraw_apr impossible-to-miss low + no negative P&L -> no withdrawals.
    keep = build("supply", StratSpec("feedback", {"withdraw_apr": -1.0, "warmup_ticks": 0}))
    st_b = _fresh_state(sc, seed=7, tick=100)
    keep.step(st_b)
    assert st_b.metrics.withdrawals == 0, "lucrative pool should retain LPs"


def test_negative_pnl_triggers_withdrawal_even_with_high_apr() -> None:
    """A depositor whose card was drawn out (realised P&L < 0) can still exit."""
    sc = get_scenario("open-liquidity")
    strat = build("supply", StratSpec("feedback", {"withdraw_apr": -1.0, "warmup_ticks": 0, "pnl_hazard": 1.0}))
    st = _fresh_state(sc, seed=3, tick=50)
    # Pick one depositor that still owns a pooled card; force realised P&L < 0
    # WITHOUT emptying its remaining pooled value (simulate a 2nd lost card).
    victim = next(d for d in st.depositors.values() if d.remaining_value_usd > 0)
    victim.lost_value_usd = victim.remaining_value_usd + 1.0  # realised_pnl < 0
    before = st.metrics.withdrawals
    strat.step(st)
    assert st.metrics.withdrawals > before
    assert st.depositors[victim.id].exited is True


def test_withdrawal_is_not_a_forfeited_loss() -> None:
    """Withdrawing decrements remaining value but never inflates lost_value."""
    sc = get_scenario("open-liquidity")
    strat = build("supply", StratSpec("feedback", {"withdraw_apr": 1e9, "warmup_ticks": 0}))
    st = _fresh_state(sc, seed=11, tick=100)
    lost_before = {d.id: d.lost_value_usd for d in st.depositors.values()}
    strat.step(st)
    for did, before in lost_before.items():
        assert st.depositors[did].lost_value_usd == before, "withdrawal must not add to lost_value"
    # Exited LPs no longer hold pooled value.
    for d in st.depositors.values():
        if d.exited:
            assert abs(d.remaining_value_usd) < 1e-6


def test_inflow_scales_with_apr() -> None:
    """A high observed APR attracts strictly more deposits than a low one."""
    sc = get_scenario("open-liquidity")

    def deposits_for_apr(yield_ratio: float) -> int:
        strat = build(
            "supply",
            StratSpec("feedback", {"withdraw_apr": -1.0, "attract_apr": 0.0, "sensitivity": 50.0, "warmup_ticks": 0}),
        )
        total = 0
        for tick in range(1, 400):
            st = _fresh_state(sc, seed=100 + tick, tick=tick)
            for d in st.depositors.values():
                d.yield_usd = yield_ratio * d.deposited_value_usd
            before = st.metrics.deposits_added
            strat.step(st)
            total += st.metrics.deposits_added - before
        return total

    low = deposits_for_apr(0.0)  # zero yield -> no boost, ~base rate
    high = deposits_for_apr(0.5)  # rich yield -> boosted inflow
    assert high > low, f"high-APR inflow {high} should exceed low-APR inflow {low}"


def test_composition_drifts_vs_static_supply() -> None:
    """Endogenous supply produces a different depositor population than static."""
    sc = get_scenario("open-liquidity")
    static_r = simulate(sc, 2000, seed=5)
    fb = _feedback_scenario(sc, withdraw_apr=0.20, warmup_ticks=5)
    fb_r = simulate(fb, 2000, seed=5)
    # Different final pool size and/or turnover => composition diverged.
    diverged = (
        fb_r.pool_size_final != static_r.pool_size_final
        or fb_r.depositor_pnl_mean_usd != static_r.depositor_pnl_mean_usd
    )
    assert diverged, "feedback supply should change pool composition vs static"


def test_determinism_same_seed() -> None:
    """Same seed -> identical withdrawal + deposit counts (unit-level)."""

    def counts(seed: int) -> tuple[int, int]:
        sc = get_scenario("open-liquidity")
        strat = build("supply", StratSpec("feedback", {"withdraw_apr": 0.30, "warmup_ticks": 0}))
        st = _fresh_state(sc, seed=seed, tick=200)
        for d in st.depositors.values():
            d.yield_usd = 0.02 * d.deposited_value_usd
        for t in range(200, 260):
            st.tick = t
            strat.step(st)
        return st.metrics.withdrawals, st.metrics.deposits_added

    assert counts(42) == counts(42)


def test_empty_pool_does_not_crash() -> None:
    """Withdrawal + inflow on a drained pool must not raise."""
    sc = Scenario(name="tiny", description="", bands=[RarityBand("C", 5.0, 15.0, 1)], deposit_rate=0.0)
    strat = build("supply", StratSpec("feedback", {"withdraw_apr": 1e9, "warmup_ticks": 0, "base_rate": 0.0}))
    st = _fresh_state(sc, seed=0, tick=100)
    # Drain the pool.
    for seg in st.topology.segments(st):
        for nft in list(st.topology.cards(st, seg)):
            st.topology.remove(st, seg, nft)
    strat.step(st)  # must not raise
    assert st.topology.count(st, None) == 0


def _run_all() -> int:
    tests = [v for k, v in sorted(globals().items()) if k.startswith("test_")]
    failures = 0
    for t in tests:
        try:
            t()
            print(f"PASS {t.__name__}")
        except AssertionError as e:
            failures += 1
            print(f"FAIL {t.__name__}: {e}")
        except Exception as e:  # noqa: BLE001
            failures += 1
            print(f"ERROR {t.__name__}: {type(e).__name__}: {e}")
    return failures


if __name__ == "__main__":
    raise SystemExit(1 if _run_all() else 0)
