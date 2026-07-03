# Economic Evaluation Harness

Monte-Carlo simulator that evaluates the **SPINFI gacha economic design** by
replaying the on-chain per-spin flow (Gacha → EconomyManager →
CardGroupedVault / ProtocolTreasury) and measuring the properties the contracts
themselves cannot assert:

- **Spinner house edge** — do players lose roughly the pricing premium (~5%)?
- **Depositor (LP) P&L distribution** — is providing NFTs profitable, and how
  much variance does an individual LP eat?
- **Protocol buyback solvency** — can the 5% protocol fee (plus seed) fund
  best-effort redemptions, and how often do they go unfunded (by design)?
- **Pool drain dynamics** — does the pool trend toward empty-pool refunds?

Pure Python standard library — **no dependencies, no install step**.

## Run it

```bash
# From the repo root (recommended — uses the Task wrapper):
task econ:eval                                  # all scenarios, console table
task econ:eval SCENARIO=open-liquidity SPINS=50000 RUNS=10
task econ:report                                # full markdown -> analysis/economics/report.md
task econ:json  SCENARIO=baseline               # raw metrics as JSON
task econ:scenarios                             # list scenarios

# Or directly:
cd analysis/economics
python3 __main__.py --scenario all --spins 20000 --runs 5 --format markdown
```

### CLI flags

| Flag | Default | Meaning |
|---|---|---|
| `--scenario` | `all` | scenario name or `all` |
| `--spins` | `20000` | spins per run |
| `--runs` | `5` | repeat runs (different seeds) averaged together |
| `--seed` | `0` | base RNG seed |
| `--format` | `table` | `table` \| `markdown` \| `json` |
| `--out` | — | write to a file instead of stdout |

## Files

| File | Role |
|---|---|
| `econ_model.py` | Contract-faithful constants + pure formulas (EV, spin fee, split, redemption payout). One-to-one with `contracts/src`. |
| `scenarios.py` | Named pool + market + behaviour scenarios to evaluate against. |
| `simulate.py` | Monte-Carlo engine replaying the per-spin flow. |
| `report.py` | Markdown / JSON / console-table renderers + interpretation notes. |
| `__main__.py` | CLI entrypoint. |

## Model fidelity

Every constant traces to the Solidity source:

| Model | Contract | Value |
|---|---|---|
| Spin fee = `EV·(1+premium)` | `Gacha._getSpinFeeToCharge` | premium 500 bps |
| EV = pool mean (uniform-over-pool) | `Gacha.getExpectedValueUSD` | — |
| Fee split | `GachaEconomyManager` | 9500 / 500 bps |
| Yield routes to **hit rarity**, value-weighted | `CardGroupedVault.distributeYield` | — |
| Buyback = `80%·min(snapshot, live)` | `ProtocolTreasury._quoteRedemption` | 8000 bps |
| Unfunded redemption leaves NFT with winner | best-effort by design | — |

### Known simplifications

- Card values are sampled from a triangular distribution per rarity band
  (mode near the floor) rather than real Courtyard prices — swap in real data
  by editing `scenarios.py` if you have a price feed.
- One depositor per initial card, to keep LP P&L granular. Real depositors hold
  multiple cards; aggregate/mean figures are unaffected, only the P&L
  *distribution* granularity.
- `minSpinFee` / `maxSpinFee` and the min-deposit floor default to off; set them
  per scenario in `scenarios.py` to model clamped pricing.

## Interpreting results

See the notes printed at the bottom of the markdown report. Headline:
the **`open-liquidity`** scenario (pool kept healthy by ongoing deposits) is the
cleanest read on the intrinsic house edge; closed-pool scenarios inflate the
edge because redemption churn compounds the 20% buyback haircut across cycles.
