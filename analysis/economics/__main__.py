"""CLI: evaluate the SPINFI gacha economics via Monte-Carlo simulation.

Usage (from analysis/economics/, or via `task econ:*`):
    python __main__.py --scenario all --spins 20000 --runs 5
    python __main__.py --scenario baseline --deep --format markdown --out report.md
    python __main__.py --scenario baseline --sweep premium_bps --format markdown
"""

from __future__ import annotations

import argparse
import dataclasses
import statistics
import sys

import dataclasses as _dc

from report import (
    print_summary_table,
    print_sweep_table,
    sweep_to_markdown,
    to_json,
    to_markdown,
    yield_compare_to_text,
)
from scenarios import SCENARIOS, get_scenario
from simulate import SimResult, TierStats, TrajPoint, simulate
from sweep import SWEEPABLE, default_grid, run_sweep


def _avg_value(vals):
    """Average a list of same-typed field values (numbers, dataclasses, or lists)."""
    first = vals[0]
    if isinstance(first, bool):
        return first
    if isinstance(first, (int, float)):
        avg = statistics.fmean(vals)
        return int(round(avg)) if isinstance(first, int) else avg
    if isinstance(first, str):
        return first
    if dataclasses.is_dataclass(first):
        fields = dataclasses.fields(first)
        kwargs = {f.name: _avg_value([getattr(v, f.name) for v in vals]) for f in fields}
        return type(first)(**kwargs)
    if isinstance(first, list):
        # Element-wise average across equal-length lists (tiers / trajectory).
        return [_avg_value([v[i] for v in vals]) for i in range(len(first))]
    return first


def _average(results: list[SimResult]) -> SimResult:
    if len(results) == 1:
        return results[0]
    kwargs = {
        f.name: _avg_value([getattr(r, f.name) for r in results])
        for f in dataclasses.fields(SimResult)
    }
    return SimResult(**kwargs)


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(
        prog="econ-eval",
        description="Monte-Carlo evaluation of the SPINFI gacha economic design.",
    )
    p.add_argument("--scenario", default="all",
                   help=f"scenario name or 'all'. Available: {', '.join(SCENARIOS)}")
    p.add_argument("--spins", type=int, default=20_000, help="spins per run (default 20000)")
    p.add_argument("--runs", type=int, default=5, help="repeat runs to average (default 5)")
    p.add_argument("--seed", type=int, default=0, help="base RNG seed (default 0)")
    p.add_argument("--deep", action="store_true",
                   help="include per-rarity breakdown + trajectories (markdown only)")
    p.add_argument("--sweep", metavar="PARAM",
                   help=f"sensitivity sweep on one param: {', '.join(sorted(SWEEPABLE))}")
    p.add_argument("--compare-yield", action="store_true",
                   help="run the scenario under per_rarity vs global_value yield routing")
    p.add_argument("--values", help="comma-separated sweep values (default: built-in grid)")
    p.add_argument("--format", choices=["table", "markdown", "json"], default="table")
    p.add_argument("--out", help="write output to this file instead of stdout")
    args = p.parse_args(argv)

    # --- Yield-routing comparison -----------------------------------------
    if args.compare_yield:
        sc_name = args.scenario if args.scenario != "all" else "baseline"
        try:
            base = get_scenario(sc_name)
        except KeyError as e:
            print(e, file=sys.stderr)
            return 2
        variants = {
            "per_rarity": _dc.replace(base, yield_mode="per_rarity"),
            "global_value": _dc.replace(base, yield_mode="global_value"),
        }
        avg = {}
        for mode, sc in variants.items():
            runs = [simulate(sc, args.spins, seed=args.seed + i) for i in range(max(1, args.runs))]
            avg[mode] = _average(runs)
        md = args.format == "markdown"
        out = yield_compare_to_text(sc_name, avg["per_rarity"], avg["global_value"], markdown=md)
        if md:
            return _emit(out, args)
        print(out)
        return 0

    # --- Sweep mode --------------------------------------------------------
    if args.sweep:
        sc_name = args.scenario if args.scenario != "all" else "baseline"
        try:
            scenario = get_scenario(sc_name)
        except KeyError as e:
            print(e, file=sys.stderr)
            return 2
        if args.values:
            grid = [float(v) for v in args.values.split(",")]
        else:
            grid = default_grid(args.sweep)
        try:
            rows = run_sweep(scenario, args.sweep, grid, args.spins, args.runs, args.seed)
        except KeyError as e:
            print(e, file=sys.stderr)
            return 2
        if args.format == "markdown":
            out = sweep_to_markdown(sc_name, args.sweep, rows)
        else:
            print(f"# sweep {args.sweep} on {sc_name} ({args.spins:,} spins x {args.runs} runs)")
            print_sweep_table(args.sweep, rows)
            return 0
        return _emit(out, args)

    # --- Evaluation mode ---------------------------------------------------
    names = list(SCENARIOS) if args.scenario == "all" else [args.scenario]
    try:
        scenarios = [get_scenario(n) for n in names]
    except KeyError as e:
        print(e, file=sys.stderr)
        return 2

    results: list[SimResult] = []
    for sc in scenarios:
        runs = [simulate(sc, args.spins, seed=args.seed + i) for i in range(max(1, args.runs))]
        results.append(_average(runs))

    if args.format == "json":
        out = to_json(results)
    elif args.format == "markdown":
        out = to_markdown(results, runs=max(1, args.runs), seed=args.seed, deep=args.deep)
    else:
        print_summary_table(results)
        return 0
    return _emit(out, args)


def _emit(out: str, args) -> int:
    if args.out:
        with open(args.out, "w") as fh:
            fh.write(out)
        print(f"wrote {args.format} -> {args.out}", file=sys.stderr)
    else:
        print(out)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
