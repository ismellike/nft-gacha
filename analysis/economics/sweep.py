"""Parameter sensitivity sweeps.

Vary one lever across a grid, holding everything else fixed, and report how the
decision-relevant outputs move. This is what turns the harness from "describe
the design" into "quantify the effect of a proposed change."

Swept params map to the exact contract knobs under discussion:
  premium_bps        -> Gacha.pricingPremiumBps
  depositor_share_bps-> GachaEconomyManager.depositorShareBps
  protocol_seed_usd  -> initial ProtocolTreasury capitalisation
  max_payout_bps     -> ProtocolTreasury.maxPayoutBps (reserve cap)
  redeem_prob        -> player behaviour (not a contract knob; demand-side)
  deposit_rate       -> LP inflow (not a contract knob; supply-side)
  market_drift_per_spin -> market condition
"""

from __future__ import annotations

import dataclasses
import statistics

from scenarios import Scenario
from simulate import SimResult, simulate

SWEEPABLE = {
    "premium_bps",
    "depositor_share_bps",
    "protocol_seed_usd",
    "max_payout_bps",
    "redeem_prob",
    "deposit_rate",
    "market_drift_per_spin",
}


@dataclasses.dataclass
class SweepRow:
    value: float
    house_edge_pct: float
    protocol_revenue_usd: float  # total protocol fee = revenue (the demand-sweep headline)
    spins_fulfilled: int  # volume — falls under elastic demand as the fee rises
    depositor_pnl_median_usd: float
    depositors_in_profit_pct: float
    redeem_success_pct: float
    spins_to_depletion: int
    pool_size_final: int
    protocol_balance_min_usd: float


def _mean_result(results: list[SimResult]):
    def m(attr):
        return statistics.fmean(getattr(r, attr) for r in results)

    att = statistics.fmean(r.redemptions_attempted for r in results)
    ok = statistics.fmean(r.redemptions_succeeded for r in results)
    redeem_pct = (ok / att * 100.0) if att > 0 else 0.0
    return (
        m("house_edge_pct"),
        m("total_protocol_fee_usd"),
        int(round(m("spins_fulfilled"))),
        m("depositor_pnl_median_usd"),
        m("depositors_in_profit_pct"),
        redeem_pct,
        int(round(m("spins_to_depletion"))),
        int(round(m("pool_size_final"))),
        m("protocol_balance_min_usd"),
    )


def run_sweep(
    scenario: Scenario,
    param: str,
    values: list[float],
    spins: int,
    runs: int,
    seed: int,
) -> list[SweepRow]:
    if param not in SWEEPABLE:
        raise KeyError(f"'{param}' is not sweepable. Options: {', '.join(sorted(SWEEPABLE))}")
    rows: list[SweepRow] = []
    for v in values:
        # ints stay ints so dataclass typing/formatting is clean
        coerced = int(v) if param.endswith("_bps") else v
        sc = dataclasses.replace(scenario, **{param: coerced})
        results = [simulate(sc, spins, seed=seed + i) for i in range(max(1, runs))]
        edge, rev, spins_ok, dep_med, dep_prof, redeem, deplete, pool_fin, treas_min = _mean_result(results)
        rows.append(
            SweepRow(
                value=v,
                house_edge_pct=edge,
                protocol_revenue_usd=rev,
                spins_fulfilled=spins_ok,
                depositor_pnl_median_usd=dep_med,
                depositors_in_profit_pct=dep_prof,
                redeem_success_pct=redeem,
                spins_to_depletion=deplete,
                pool_size_final=pool_fin,
                protocol_balance_min_usd=treas_min,
            )
        )
    return rows


def default_grid(param: str) -> list[float]:
    """Sensible default sweep values per parameter."""
    return {
        "premium_bps": [250, 500, 750, 1000, 1500, 2000],
        "depositor_share_bps": [8000, 9000, 9500, 9800],
        "protocol_seed_usd": [0, 10_000, 50_000, 100_000, 250_000],
        "max_payout_bps": [0, 500, 1000, 2500, 5000],
        "redeem_prob": [0.0, 0.25, 0.5, 0.75, 1.0],
        "deposit_rate": [0.0, 0.25, 0.5, 0.8, 1.0, 1.5],
        "market_drift_per_spin": [0.9990, 0.9995, 1.0, 1.0005],
    }[param]
