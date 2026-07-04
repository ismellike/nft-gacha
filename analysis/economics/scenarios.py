"""Pool + market scenarios to evaluate the gacha economics against.

A scenario defines the initial inventory (rarity bands + how many cards and at
what value) plus the market/behaviour knobs that drive the Monte-Carlo loop.
Keep these representative of real Courtyard graded-Pokemon inventory; the
default bands match docs/DESIGN.md section 6.
"""

from __future__ import annotations

from dataclasses import dataclass, field


@dataclass
class StratSpec:
    """Names one strategy for one seam plus its scalar params.

    The composable unit stored in :class:`VariationConfig` and parsed from the
    CLI ``name:k=v,...`` form. Non-frozen so ``sweep.py`` can deep-copy / mutate
    it per grid point. ``params`` are scalars only (JSON-serialisable).
    """

    name: str
    params: dict = field(default_factory=dict)


@dataclass
class VariationConfig:
    """Per-seam strategy selection carried on a :class:`Scenario`.

    All-defaults reproduces today's behaviour exactly, so every existing
    scenario (which omits ``variations``) is byte-identical. ``yield_`` is a
    sentinel: ``None`` means "derive the yield router from ``scenario.yield_mode``"
    (-> ``per_rarity`` / ``global_value``), keeping ``--compare-yield`` untouched.
    An explicit ``yield_`` spec wins if set.
    """

    topology: StratSpec = field(default_factory=lambda: StratSpec("single"))
    draw: StratSpec = field(default_factory=lambda: StratSpec("uniform"))
    pricing: StratSpec = field(default_factory=lambda: StratSpec("premium_clamp"))
    demand: StratSpec = field(default_factory=lambda: StratSpec("inelastic"))
    supply: StratSpec = field(default_factory=lambda: StratSpec("poisson"))
    redemption: StratSpec = field(default_factory=lambda: StratSpec("flat"))
    yield_: StratSpec | None = None


@dataclass
class RarityBand:
    """One rarity tier: a USD value range and how many cards start in it."""

    name: str
    lo_usd: float
    hi_usd: float
    count: int


@dataclass
class Scenario:
    """A full evaluation scenario: initial pool + behaviour + market drift."""

    name: str
    description: str
    bands: list[RarityBand]

    # Behaviour knobs (per-spin unless noted) --------------------------------
    # Probability a winner sells the NFT back within the redemption window.
    redeem_prob: float = 0.25
    # Expected number of fresh depositor NFTs arriving per spin (Poisson mean).
    # 0 => a closed pool that only refills via buybacks; >0 => open liquidity.
    deposit_rate: float = 0.0
    # Multiplicative market drift applied to every live appraisal each spin
    # (1.0 = flat, 0.9995 ~= slow bleed, 1.0005 ~= slow pump). Snapshots are
    # frozen at win time, so drift exercises the min(snapshot, live) cap.
    market_drift_per_spin: float = 1.0

    # Pricing config (contract defaults) -------------------------------------
    premium_bps: int = 500
    depositor_share_bps: int = 9_500
    min_fee_usd: float = 0.0
    max_fee_usd: float = 0.0

    # Initial protocol treasury seed in USD (capitalises early buybacks).
    protocol_seed_usd: float = 0.0
    # ProtocolTreasury.maxPayoutBps: a single buyback may not exceed this
    # fraction of the treasury balance (0 = uncapped, the on-chain default).
    max_payout_bps: int = 0
    # Yield routing:
    #   "per_rarity"   -> depositor cut goes to the HIT rarity, value-weighted
    #                     within it. Matches CardGroupedVault today. Every card
    #                     earns ~depositor_cut/total regardless of value, so
    #                     above-mean cards are structurally -EV to deposit.
    #   "global_value" -> depositor cut spread across the WHOLE pool by value,
    #                     ignoring which tier was hit. Yield then scales with
    #                     value-at-risk, so all tiers break even in expectation.
    yield_mode: str = "per_rarity"

    # Pluggable strategy selection. Omitted by every existing scenario, so it
    # resolves to the all-default VariationConfig == current behaviour. Set a
    # non-default StratSpec on any seam to enable a variation.
    variations: VariationConfig = field(default_factory=VariationConfig)

    def total_cards(self) -> int:
        return sum(b.count for b in self.bands)


def _pokemon_bands(scale: int = 1) -> list[RarityBand]:
    """DESIGN.md rarity bands with a plausible count profile (rarer = fewer)."""
    return [
        RarityBand("Common", 5.0, 15.0, 500 * scale),
        RarityBand("Uncommon", 25.0, 60.0, 200 * scale),
        RarityBand("Rare", 70.0, 250.0, 80 * scale),
        RarityBand("Epic", 300.0, 1_200.0, 18 * scale),
        RarityBand("Legendary", 1_500.0, 6_000.0, 4 * scale),
    ]


SCENARIOS: dict[str, Scenario] = {
    "baseline": Scenario(
        name="baseline",
        description="Balanced Pokemon pool, moderate redemptions, no new deposits (closed pool).",
        bands=_pokemon_bands(),
        redeem_prob=0.25,
        deposit_rate=0.0,
        protocol_seed_usd=0.0,
    ),
    "open-liquidity": Scenario(
        name="open-liquidity",
        description="Depositors keep arriving (~0.8/spin), replenishing the pool as it drains.",
        bands=_pokemon_bands(),
        redeem_prob=0.25,
        deposit_rate=0.8,
        protocol_seed_usd=0.0,
    ),
    "redemption-heavy": Scenario(
        name="redemption-heavy",
        description="Most winners immediately sell back; stresses protocol buyback solvency.",
        bands=_pokemon_bands(),
        redeem_prob=0.75,
        deposit_rate=0.0,
        protocol_seed_usd=25_000.0,
    ),
    "bear-market": Scenario(
        name="bear-market",
        description="Steady price bleed; exercises the min(snapshot, live) redemption cap.",
        bands=_pokemon_bands(),
        redeem_prob=0.35,
        deposit_rate=0.3,
        market_drift_per_spin=0.9990,
    ),
    "whale-heavy": Scenario(
        name="whale-heavy",
        description="Legendary-skewed inventory: high EV, high per-spin variance for spinners.",
        bands=[
            RarityBand("Common", 5.0, 15.0, 100),
            RarityBand("Uncommon", 25.0, 60.0, 80),
            RarityBand("Rare", 70.0, 250.0, 60),
            RarityBand("Epic", 300.0, 1_200.0, 40),
            RarityBand("Legendary", 1_500.0, 6_000.0, 20),
        ],
        redeem_prob=0.4,
        deposit_rate=0.2,
        protocol_seed_usd=10_000.0,
    ),
}


def get_scenario(name: str) -> Scenario:
    if name not in SCENARIOS:
        raise KeyError(f"unknown scenario '{name}'. Available: {', '.join(SCENARIOS)}")
    return SCENARIOS[name]
