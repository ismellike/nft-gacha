"""Human- and machine-readable reporting for simulation results."""

from __future__ import annotations

import dataclasses
import json

from simulate import SimResult
from sweep import SweepRow

_SPARK = "▁▂▃▄▅▆▇█"


def to_json(results: list[SimResult]) -> str:
    return json.dumps([dataclasses.asdict(r) for r in results], indent=2)


def _usd(x: float) -> str:
    return f"${x:,.0f}" if abs(x) >= 100 else f"${x:,.2f}"


def _sparkline(vals: list[float]) -> str:
    if not vals:
        return ""
    lo, hi = min(vals), max(vals)
    if hi - lo < 1e-12:
        return _SPARK[0] * len(vals)
    out = []
    for v in vals:
        idx = int((v - lo) / (hi - lo) * (len(_SPARK) - 1))
        out.append(_SPARK[idx])
    return "".join(out)


def _redeem_pct(r: SimResult) -> float:
    return (
        r.redemptions_succeeded / r.redemptions_attempted * 100.0
        if r.redemptions_attempted
        else 0.0
    )


# --- Compact console table -------------------------------------------------
def print_summary_table(results: list[SimResult]) -> None:
    hdr = (
        f"{'scenario':<18} {'edge%':>7} {'dep.med':>10} {'dep.prof%':>10} "
        f"{'redeem%':>9} {'treas.min':>12} {'pool.fin':>9} {'deplete@':>10}"
    )
    print(hdr)
    print("-" * len(hdr))
    for r in results:
        deplete = "never" if r.spins_to_depletion < 0 else f"{r.spins_to_depletion:,}"
        print(
            f"{r.scenario:<18} {r.house_edge_pct:>7.2f} "
            f"{r.depositor_pnl_median_usd:>10,.0f} {r.depositors_in_profit_pct:>10.1f} "
            f"{_redeem_pct(r):>9.1f} {r.protocol_balance_min_usd:>12,.0f} "
            f"{r.pool_size_final:>9,} {deplete:>10}"
        )


# --- Deep markdown ---------------------------------------------------------
def to_markdown(results: list[SimResult], runs: int, seed: int, deep: bool = False) -> str:
    L: list[str] = []
    L.append("# SPINFI Economic Evaluation" + (" — Deep Report" if deep else ""))
    L.append("")
    L.append(f"_{runs} run(s) averaged · base seed {seed} · {results[0].spins_requested:,} spins/run_")
    L.append("")

    if deep:
        L.append(_cross_scenario_summary(results))
        L.append("")

    for r in results:
        L.append(f"## Scenario: `{r.scenario}`")
        L.append("")
        L.append(
            f"- **Spins**: {r.spins_fulfilled:,} fulfilled / "
            f"{r.refunds_empty_pool:,} empty-pool refunds"
        )
        deplete = "never" if r.spins_to_depletion < 0 else f"spin {r.spins_to_depletion:,}"
        L.append(f"- **Pool depletion**: {deplete}")
        L.append("")

        L.append("### Spinner (player) economics")
        L.append("")
        L.append("| Metric | Value |")
        L.append("|---|---|")
        L.append(f"| Fees paid | {_usd(r.spinner_fees_paid_usd)} |")
        L.append(f"| NFT value kept | {_usd(r.spinner_nft_value_received_usd)} |")
        L.append(f"| Buyback cash | {_usd(r.spinner_redemption_cash_usd)} |")
        L.append(f"| **Net P&L** | **{_usd(r.spinner_net_pnl_usd)}** |")
        L.append(f"| **Realised house edge** | **{r.house_edge_pct:.2f}%** |")
        L.append("")

        L.append("### Depositor (LP) economics")
        L.append("")
        L.append("| Metric | Value |")
        L.append("|---|---|")
        L.append(f"| Total yield distributed | {_usd(r.total_depositor_yield_usd)} |")
        L.append(f"| Realised P&L — median | {_usd(r.depositor_pnl_median_usd)} |")
        L.append(f"| Realised P&L — mean | {_usd(r.depositor_pnl_mean_usd)} |")
        L.append(
            f"| Realised P&L — p05 / p95 | "
            f"{_usd(r.depositor_pnl_p05_usd)} / {_usd(r.depositor_pnl_p95_usd)} |"
        )
        L.append(f"| Depositors in profit | {r.depositors_in_profit_pct:.1f}% |")
        L.append("")

        L.append("### Protocol treasury & buyback solvency")
        L.append("")
        L.append("| Metric | Value |")
        L.append("|---|---|")
        L.append(f"| Protocol fees collected | {_usd(r.total_protocol_fee_usd)} |")
        L.append(f"| Treasury balance (final) | {_usd(r.protocol_balance_final_usd)} |")
        L.append(f"| Treasury balance (min) | {_usd(r.protocol_balance_min_usd)} |")
        L.append(
            f"| Redemptions succeeded | {r.redemptions_succeeded:,}"
            f" / {r.redemptions_attempted:,} ({_redeem_pct(r):.1f}%) |"
        )
        L.append(f"| Unfunded — treasury dry | {r.redemptions_insolvent:,} |")
        L.append(f"| Unfunded — reserve cap (maxPayoutBps) | {r.redemptions_capped:,} |")
        L.append("")

        L.append("### Pool dynamics")
        L.append("")
        L.append("| Metric | Value |")
        L.append("|---|---|")
        L.append(
            f"| Pool size (init / min / final) | "
            f"{r.pool_size_initial:,} / {r.pool_size_min:,} / {r.pool_size_final:,} |"
        )
        L.append(
            f"| Expected value / spin (init -> final) | "
            f"{_usd(r.ev_initial_usd)} -> {_usd(r.ev_final_usd)} |"
        )
        L.append("")

        if deep:
            L.append(_tier_table(r))
            L.append("")
            L.append(_trajectory_block(r))
            L.append("")

    L.append("---")
    L.append("")
    L.append(_interpretation_notes())
    return "\n".join(L)


def _cross_scenario_summary(results: list[SimResult]) -> str:
    L = ["### At-a-glance", ""]
    L.append("| Scenario | Edge % | Dep. median | In profit | Redeem % | Deplete @ | Pool final |")
    L.append("|---|--:|--:|--:|--:|--:|--:|")
    for r in results:
        deplete = "never" if r.spins_to_depletion < 0 else f"{r.spins_to_depletion:,}"
        L.append(
            f"| `{r.scenario}` | {r.house_edge_pct:.2f} | {_usd(r.depositor_pnl_median_usd)} | "
            f"{r.depositors_in_profit_pct:.0f}% | {_redeem_pct(r):.0f}% | {deplete} | "
            f"{r.pool_size_final:,} |"
        )
    return "\n".join(L)


def _tier_table(r: SimResult) -> str:
    L = ["### Per-rarity breakdown", ""]
    L.append(
        "| Tier | Init | Final | Draws | Redeem ok/att | Unfunded | LP mean P&L | LP profit% |"
    )
    L.append("|---|--:|--:|--:|--:|--:|--:|--:|")
    for t in r.tiers:
        L.append(
            f"| {t.name} | {t.initial_count:,} | {t.final_count:,} | {t.draws:,} | "
            f"{t.redeem_succeeded:,}/{t.redeem_attempted:,} | {t.redeem_unfunded:,} | "
            f"{_usd(t.depositor_pnl_mean_usd)} | {t.depositors_in_profit_pct:.0f}% |"
        )
    L.append("")
    L.append(
        "> Redeem ok/att exposes the buyback-affordability gradient: cheap tiers fund on the "
        "rolling 5% fee, expensive tiers do not."
    )
    return "\n".join(L)


def _trajectory_block(r: SimResult) -> str:
    pool = [p.pool_size for p in r.trajectory]
    ev = [p.ev_usd for p in r.trajectory]
    treas = [p.treasury_usd for p in r.trajectory]
    edge = [p.cum_house_edge_pct for p in r.trajectory if p.cum_house_edge_pct != 0]
    L = ["### Trajectories (sampled across the run)", ""]
    L.append("```")
    L.append(f"pool size  {_sparkline(pool):<42}  {min(pool):>7,} .. {max(pool):>7,}")
    L.append(f"EV / spin  {_sparkline(ev):<42}  {_usd(min(ev)):>9} .. {_usd(max(ev))}")
    L.append(f"treasury   {_sparkline(treas):<42}  {_usd(min(treas)):>9} .. {_usd(max(treas))}")
    if edge:
        L.append(f"cum edge%  {_sparkline(edge):<42}  {min(edge):>7.1f} .. {max(edge):.1f}")
    L.append("```")
    return "\n".join(L)


# --- Sweep report ----------------------------------------------------------
def sweep_to_markdown(scenario_name: str, param: str, rows: list[SweepRow]) -> str:
    L = [f"# Sensitivity Sweep — `{param}` on `{scenario_name}`", ""]
    L.append(
        "| " + param + " | Edge % | Protocol rev | Volume | Dep. median | In profit | "
        "Redeem % | Deplete @ | Pool final | Treas. min |"
    )
    L.append("|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|")
    peak = max((r.protocol_revenue_usd for r in rows), default=0.0)
    for row in rows:
        val = f"{row.value:g}"
        deplete = "never" if row.spins_to_depletion < 0 else f"{row.spins_to_depletion:,}"
        rev = _usd(row.protocol_revenue_usd) + (" **←peak**" if row.protocol_revenue_usd == peak else "")
        L.append(
            f"| {val} | {row.house_edge_pct:.2f} | {rev} | {row.spins_fulfilled:,} | "
            f"{_usd(row.depositor_pnl_median_usd)} | {row.depositors_in_profit_pct:.0f}% | "
            f"{row.redeem_success_pct:.0f}% | {deplete} | {row.pool_size_final:,} | "
            f"{_usd(row.protocol_balance_min_usd)} |"
        )
    return "\n".join(L)


def print_sweep_table(param: str, rows: list[SweepRow]) -> None:
    hdr = (
        f"{param:>14} {'edge%':>7} {'protocol$':>11} {'volume':>7} {'dep.med':>9} {'prof%':>7} "
        f"{'redeem%':>8} {'deplete@':>10} {'pool.fin':>9} {'treas.min':>11}"
    )
    print(hdr)
    print("-" * len(hdr))
    peak = max((r.protocol_revenue_usd for r in rows), default=0.0)
    for row in rows:
        deplete = "never" if row.spins_to_depletion < 0 else f"{row.spins_to_depletion:,}"
        mark = " <=peak" if row.protocol_revenue_usd == peak else ""
        print(
            f"{row.value:>14g} {row.house_edge_pct:>7.2f} {row.protocol_revenue_usd:>11,.0f} "
            f"{row.spins_fulfilled:>7,} {row.depositor_pnl_median_usd:>9,.0f} "
            f"{row.depositors_in_profit_pct:>7.1f} {row.redeem_success_pct:>8.1f} "
            f"{deplete:>10} {row.pool_size_final:>9,} {row.protocol_balance_min_usd:>11,.0f}{mark}"
        )


def yield_compare_to_text(scenario_name: str, per_rarity: SimResult, global_value: SimResult, markdown: bool) -> str:
    """Side-by-side per-tier LP P&L under the current vs proposed yield routing."""
    a, b = per_rarity, global_value
    L: list[str] = []
    title = f"Yield-routing comparison — `{scenario_name}`"
    if markdown:
        L.append(f"# {title}\n")
        L.append("Per-tier depositor (LP) mean realised P&L and % in profit.\n")
        L.append("| Tier | per_rarity P&L | global_value P&L | per_rarity prof% | global_value prof% |")
        L.append("|---|--:|--:|--:|--:|")
        for ta, tb in zip(a.tiers, b.tiers):
            L.append(
                f"| {ta.name} | {_usd(ta.depositor_pnl_mean_usd)} | {_usd(tb.depositor_pnl_mean_usd)} | "
                f"{ta.depositors_in_profit_pct:.0f}% | {tb.depositors_in_profit_pct:.0f}% |"
            )
        L.append("")
        L.append(
            f"Pool-wide: median P&L {_usd(a.depositor_pnl_median_usd)} -> {_usd(b.depositor_pnl_median_usd)}; "
            f"house edge {a.house_edge_pct:.2f}% -> {b.house_edge_pct:.2f}%; "
            f"p05/p95 {_usd(a.depositor_pnl_p05_usd)}/{_usd(a.depositor_pnl_p95_usd)} -> "
            f"{_usd(b.depositor_pnl_p05_usd)}/{_usd(b.depositor_pnl_p95_usd)}."
        )
        return "\n".join(L)
    # console
    L.append(f"# {title}  (per_rarity  ->  global_value)")
    L.append(f"{'tier':<12} {'P&L now':>10} {'P&L new':>10} {'prof% now':>10} {'prof% new':>10}")
    L.append("-" * 56)
    for ta, tb in zip(a.tiers, b.tiers):
        L.append(
            f"{ta.name:<12} {ta.depositor_pnl_mean_usd:>10,.0f} {tb.depositor_pnl_mean_usd:>10,.0f} "
            f"{ta.depositors_in_profit_pct:>10.0f} {tb.depositors_in_profit_pct:>10.0f}"
        )
    L.append("-" * 56)
    L.append(
        f"{'POOL edge%':<12} {a.house_edge_pct:>10.2f} {b.house_edge_pct:>10.2f}"
        f"   (median P&L {a.depositor_pnl_median_usd:,.0f} -> {b.depositor_pnl_median_usd:,.0f})"
    )
    return "\n".join(L)


def _interpretation_notes() -> str:
    return (
        "### How to read this\n\n"
        "- **House edge** should track the pricing premium (~5% default). Spinners pay "
        "`EV*(1+premium)` and receive an NFT worth `EV` on average, so their expected loss "
        "is the premium — the protocol's edge, funded entirely by the spinner. Redemption "
        "churn adds to it: every 80% buyback skims 20% from the player collective.\n"
        "- **Spin price tracks inventory *value* (the pool mean), not *depth*.** `EV = "
        "totalValue/totalCount` is a ratio, so a thin pool is no more expensive than a deep "
        "one at the same mean — there is no scarcity brake before depletion.\n"
        "- **Depositor P&L is a redistribution**: the ~95% depositor cut of fees roughly "
        "replaces the one NFT drained per spin, but yield spreads by value across the *hit "
        "rarity* while the loss lands on one card. Wide p05/p95 = high individual variance.\n"
        "- **Buyback affordability is a gradient**: cheap tiers fund from the rolling 5% fee; "
        "expensive tiers hit `treasury dry` or the `maxPayoutBps` reserve cap. This is the "
        "by-design best-effort limit, not a broken invariant.\n"
        "- **Pool drain**: with `deposit_rate = 0` a closed pool trends to empty-pool refunds; "
        "a healthy deployment needs deposits or buybacks to refill faster than draws.\n"
    )
