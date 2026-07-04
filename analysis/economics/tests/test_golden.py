"""Golden-master + invariant tests for the strategy-seam refactor.

This is the MERGE GATE for behaviour-neutral changes: every default-path run of
``simulate`` must stay byte-identical to the committed goldens. Variation PRs
may add new strategies but must NOT perturb the all-default output.

Runnable two ways (stdlib only, no pytest required):

    python3 tests/test_golden.py            # run all checks, exit non-zero on fail
    python3 tests/test_golden.py --bootstrap # (re)write goldens from current code

pytest also collects the ``test_*`` functions.

Goldens live in ``tests/goldens/<scenario>_<seed>.json`` and are produced by the
current all-default engine. The first run with no goldens auto-bootstraps them
and reports it (so a fresh checkout is self-seeding); commit the result to lock
the baseline.
"""

from __future__ import annotations

import json
import os
import random
import sys

# Make the economics package importable when run as a script from any cwd.
_HERE = os.path.dirname(os.path.abspath(__file__))
_ECON_DIR = os.path.dirname(_HERE)
if _ECON_DIR not in sys.path:
    sys.path.insert(0, _ECON_DIR)

import dataclasses  # noqa: E402

from econ_model import expected_value_usd  # noqa: E402
from scenarios import SCENARIOS, get_scenario  # noqa: E402
from simulate import SimState, simulate  # noqa: E402
from strategies.base import Metrics, SpinnerState  # noqa: E402
from strategies.defaults import SinglePool, UniformDraw  # noqa: E402

GOLDEN_DIR = os.path.join(_HERE, "goldens")
SEEDS = range(5)  # seeds 0..4
SPINS = 3000  # keep goldens small but exercise every branch


def _result_json(scenario_name: str, seed: int) -> str:
    r = simulate(get_scenario(scenario_name), SPINS, seed=seed)
    return json.dumps(dataclasses.asdict(r), indent=2)


def _golden_path(scenario_name: str, seed: int) -> str:
    return os.path.join(GOLDEN_DIR, f"{scenario_name}_{seed}.json")


def bootstrap() -> None:
    os.makedirs(GOLDEN_DIR, exist_ok=True)
    for name in SCENARIOS:
        for seed in SEEDS:
            with open(_golden_path(name, seed), "w") as fh:
                fh.write(_result_json(name, seed))
    print(f"bootstrapped {len(SCENARIOS) * len(list(SEEDS))} goldens -> {GOLDEN_DIR}")


def test_golden_byte_identity() -> None:
    """Every default-path (scenario, seed) reproduces its golden byte-for-byte."""
    if not os.path.isdir(GOLDEN_DIR) or not os.listdir(GOLDEN_DIR):
        bootstrap()
        print("NOTE: goldens were missing and have been bootstrapped; re-run to assert.")
        return
    mismatches = []
    for name in SCENARIOS:
        for seed in SEEDS:
            path = _golden_path(name, seed)
            if not os.path.exists(path):
                mismatches.append(f"missing golden: {name}_{seed}")
                continue
            with open(path) as fh:
                want = fh.read()
            got = _result_json(name, seed)
            if got != want:
                mismatches.append(f"golden mismatch: {name}_{seed}")
    assert not mismatches, "\n".join(mismatches)


def test_uniform_ev_equivalence() -> None:
    """UniformDraw.expected_value == econ_model.expected_value_usd (pool mean)."""
    sc = get_scenario("whale-heavy")
    topo = SinglePool()
    st = SimState(
        rng=random.Random(0),
        scenario=sc,
        topology=topo,
        depositors={},
        spinners={0: SpinnerState(id=0)},
        protocol_balance=0.0,
        protocol_balance_min=0.0,
        reserves={},
        tick=0,
        metrics=Metrics(),
    )
    topo.init(st)
    cards = topo.all_cards(st)
    want = expected_value_usd(sum(n.appraisal_usd for n in cards), len(cards))
    got = UniformDraw().expected_value(st, None)
    assert got == want, f"{got!r} != {want!r}"


def test_empty_pool_ev_is_zero() -> None:
    """An empty segment prices at EV 0 (engine refunds before it is charged)."""
    sc = get_scenario("baseline")
    topo = SinglePool()
    st = SimState(
        rng=random.Random(0),
        scenario=sc,
        topology=topo,
        depositors={},
        spinners={0: SpinnerState(id=0)},
        protocol_balance=0.0,
        protocol_balance_min=0.0,
        reserves={},
        tick=0,
        metrics=Metrics(),
    )
    assert UniformDraw().expected_value(st, None) == 0.0


def test_determinism_same_seed() -> None:
    """Same seed -> identical result object (JSON)."""
    a = _result_json("open-liquidity", 3)
    b = _result_json("open-liquidity", 3)
    assert a == b


def _run_all() -> int:
    tests = [
        test_golden_byte_identity,
        test_uniform_ev_equivalence,
        test_empty_pool_ev_is_zero,
        test_determinism_same_seed,
    ]
    failures = 0
    for t in tests:
        try:
            t()
            print(f"PASS {t.__name__}")
        except AssertionError as e:
            failures += 1
            print(f"FAIL {t.__name__}: {e}")
    return failures


if __name__ == "__main__":
    if "--bootstrap" in sys.argv:
        bootstrap()
        raise SystemExit(0)
    raise SystemExit(1 if _run_all() else 0)
