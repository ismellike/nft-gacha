"""Strategy seams + shared domain for the SPINFI economic simulation.

The Monte-Carlo engine (``simulate.py``) is decomposed into SEVEN swappable
seams, each a :class:`typing.Protocol` with a concrete DEFAULT implementation in
``defaults.py`` that reproduces today's behaviour byte-for-byte. The seams, in
the order the per-tick loop calls them:

    1. topology    — owns inventory + how it is partitioned into pools/banners.
    2. draw        — selects the winning NFT AND declares the EV to price against.
    3. pricing     — turns the draw-declared EV into a charged spin fee.
    4. demand      — gates whether a tick becomes a real spin, and bundle size.
    5. supply      — post-spin inventory inflow/outflow (deposits/withdrawals).
    6. redemption  — the buyback decision (status + payout).
    7. yield       — splits the depositor cut across cards.

This module imports ``scenarios`` and the pure ``econ_model`` only — never
``simulate`` — so there is no import cycle (``simulate`` imports from here).

RNG DISCIPLINE (the zero-regression contract every DEFAULT must honour):
    * ALL randomness routes through ``SimState.rng`` (a single seeded
      ``random.Random``); never module-level ``random`` or wall-clock.
    * The default draw consumes exactly ONE ``rng.randrange(count)`` per pull.
    * The default redemption consumes exactly ONE unconditional ``rng.random()``
      per fulfilled pull, BEFORE supply runs.
    * The default supply consumes rng ONLY when ``deposit_rate > 0`` (Poisson +
      per-card weighted-rarity + triangular value), in that exact order.
    * The default topology, pricing, demand and yield seams consume ZERO rng.

REMOVAL CONTRACT (important, and a deliberate deviation from a naive "draw
pops" reading): ``draw`` SELECTS and returns the winning NFT but does NOT
remove it from inventory. The engine removes it via ``topology.remove`` AFTER
``yield.distribute`` has run, because today's yield distribution sums over the
pool WITH the won card still present. Removing it inside ``draw`` would change
the float summation order/set and break byte-identity. Draw strategies
therefore only decide WHICH card wins; the engine owns inventory removal.
"""

from __future__ import annotations

import random
from dataclasses import dataclass
from typing import Literal, Optional, Protocol, runtime_checkable

from scenarios import Scenario

# --- Segment key -----------------------------------------------------------
# ``None`` = the single flat pool; ``int`` = a rarity index for segmented pools.
Segment = Optional[int]


# --- Shared domain objects -------------------------------------------------
@dataclass
class NFT:
    id: int
    rarity: int  # index into scenario.bands
    appraisal_usd: float  # live appraisal (moves with market drift)
    depositor_id: int  # -1 == protocol (restocked via buyback)
    snapshot_usd: float = 0.0  # frozen at win time; 0 while in pool


@dataclass
class Depositor:
    id: int
    tier: int
    deposited_value_usd: float = 0.0  # sum of appraisals ever supplied
    yield_usd: float = 0.0  # cumulative fee yield received
    lost_value_usd: float = 0.0  # appraisal of NFTs drawn out (forfeited)
    remaining_value_usd: float = 0.0  # appraisal of NFTs still in pool
    exited: bool = False  # set by supply variations when the LP withdraws

    @property
    def realized_pnl_usd(self) -> float:
        return self.yield_usd - self.lost_value_usd


@dataclass
class SpinnerState:
    """Per-spinner persistent state (used by the pity variation).

    The default engine threads a single collective spinner (id 0). The default
    draw/redemption never read it, so behaviour is unchanged until a variation
    that consults it (e.g. PityDraw) is selected.
    """

    id: int
    pity_counter: int = 0
    spins: int = 0
    realized_pnl_usd: float = 0.0


@dataclass
class Metrics:
    """Endogenous counters written by VARIATIONS (all default to neutral).

    These are NOT surfaced in ``SimResult`` by the core scaffold (so JSON stays
    byte-identical). A variation PR that wants to expose one additively extends
    ``SimResult`` + a guarded report column alongside enabling the variation.
    """

    spins_balked: int = 0  # elastic demand: ticks that declined to spin
    withdrawals: int = 0  # supply feedback: LP exits
    deposits_added: int = 0  # supply feedback / poisson: cards added post-init
    protocol_revenue_usd: float = 0.0  # running protocol fee (mirror for demand)


@dataclass
class RedeemResult:
    """Outcome of a buyback decision. Statuses partition exactly as today."""

    status: Literal["none", "success", "insolvent", "capped"]
    payout_usd: float = 0.0


@dataclass
class SimState:
    """Engine-owned mutable world handed to every strategy method.

    Owns the single shared ``rng`` (all randomness routes through here) plus the
    ``new_depositor`` / ``add_nft`` helpers lifted verbatim from today's engine
    closures. Inventory lives in ``topology``; this object references it.
    """

    rng: random.Random
    scenario: Scenario
    topology: "PoolTopology"
    depositors: dict  # dict[int, Depositor]
    spinners: dict  # dict[int, SpinnerState]
    protocol_balance: float
    protocol_balance_min: float
    reserves: dict  # dict[Segment, float] — per-segment buckets (tiered buyback)
    tick: int
    metrics: Metrics
    _next_nft_id: int = 0
    _next_depositor_id: int = 0

    def new_depositor(self, tier: int) -> int:
        did = self._next_depositor_id
        self.depositors[did] = Depositor(id=did, tier=tier)
        self._next_depositor_id += 1
        return did

    def add_nft(self, rarity: int, value: float, depositor_id: int) -> NFT:
        nft = NFT(id=self._next_nft_id, rarity=rarity, appraisal_usd=value, depositor_id=depositor_id)
        self._next_nft_id += 1
        self.topology.add(self, nft)
        if depositor_id >= 0:
            dep = self.depositors[depositor_id]
            dep.deposited_value_usd += value
            dep.remaining_value_usd += value
        return nft


# --- The seven seam protocols ----------------------------------------------
@runtime_checkable
class PoolTopology(Protocol):
    """[variation: segmented_pools] Owns inventory + partitioning."""

    def init(self, st: SimState) -> None:
        """Seed cards from ``scenario.bands`` (band-order triangular sampling)."""

    def choose_segment(self, st: SimState) -> Segment:
        """Which pool this tick spins. SinglePool -> None with NO rng."""

    def cards(self, st: SimState, seg: Segment) -> list:
        """The live card list for a segment (do not mutate directly)."""

    def count(self, st: SimState, seg: Segment) -> int: ...

    def total_value(self, st: SimState, seg: Segment) -> float: ...

    def add(self, st: SimState, nft: NFT) -> None:
        """Insert a card into its segment (append; O(1))."""

    def remove(self, st: SimState, seg: Segment, nft: NFT) -> None:
        """Swap-pop ``nft`` out of ``seg`` (== today's ``pool[idx]=pool[-1];pop()``)."""

    def all_cards(self, st: SimState) -> list:
        """Every card across every segment, in a stable order (drift + yield)."""

    def segments(self, st: SimState) -> list:
        """The list of segment keys currently defined."""


@runtime_checkable
class DrawStrategy(Protocol):
    """[variations: pity, weighted] Selects the winner AND declares its EV.

    ``draw`` returns the winning NFT but MUST NOT remove it — the engine calls
    ``topology.remove`` after yield distribution (see module docstring).
    """

    def expected_value(self, st: SimState, seg: Segment) -> float:
        """The probability-weighted EV pricing charges the premium against."""

    def draw(self, st: SimState, seg: Segment, spinner: SpinnerState) -> NFT:
        """Select and return the winning card (no inventory mutation)."""

    def observe(self, st: SimState, spinner: SpinnerState, won: NFT) -> None:
        """Post-award hook (pity counter bookkeeping). Default: no-op."""


@runtime_checkable
class PricingStrategy(Protocol):
    """Turns draw-declared EV into a charged fee (consumes ``ev`` only)."""

    def spin_fee(self, st: SimState, seg: Segment, ev: float) -> float: ...


@runtime_checkable
class DemandStrategy(Protocol):
    """[variation: demand_elasticity + pity bundles]."""

    def wants_spin(self, st: SimState, seg: Segment, ev: float, fee: float) -> bool:
        """Does this tick become a real spin? Default InelasticDemand -> True."""

    def purchase_size(self, st: SimState, seg: Segment) -> int:
        """Pulls per accepted purchase. Default -> 1."""


@runtime_checkable
class SupplyStrategy(Protocol):
    """[variation: supply_feedback] Post-spin inventory inflow/outflow."""

    def step(self, st: SimState) -> None: ...


@runtime_checkable
class RedemptionStrategy(Protocol):
    """[variation: alt_buyback] The buyback decision.

    Consumes the rng gate and computes the payout, but returns a
    :class:`RedeemResult` WITHOUT mutating treasury/inventory — the engine
    applies the state change so solvency accounting stays centralised.
    """

    def maybe_redeem(self, st: SimState, won: NFT, spinner: SpinnerState) -> RedeemResult: ...


@runtime_checkable
class YieldRouter(Protocol):
    """Splits the depositor cut across cards. Consumes ZERO rng.

    Called while the won card is STILL in the pool (before removal), so the
    default routers reproduce today's basis + summation order exactly.
    """

    def distribute(self, st: SimState, hit: NFT, amount: float) -> None: ...


@dataclass
class StrategyBundle:
    """The seven concrete seam instances resolved once per ``simulate`` call."""

    topology: PoolTopology
    draw: DrawStrategy
    pricing: PricingStrategy
    demand: DemandStrategy
    supply: SupplyStrategy
    redemption: RedemptionStrategy
    yield_: YieldRouter


# --- Shared RNG helpers (identical to the pre-refactor engine) --------------
def sample_value(rng: random.Random, lo: float, hi: float) -> float:
    """Triangular draw with the mode at 33% of the band (== today)."""
    return rng.triangular(lo, hi, lo + (hi - lo) * 0.33)


def poisson(rng: random.Random, lam: float) -> int:
    """Knuth Poisson sampler (== today's ``_poisson``).

    Uses ``pow(e, -lam)`` with the SAME literal constant as the pre-refactor
    engine; ``math.exp`` can differ in the last ULP and would break byte-identity.
    """
    L = pow(2.718281828459045, -lam)
    k = 0
    p = 1.0
    while True:
        k += 1
        p *= rng.random()
        if p <= L:
            return k - 1


def weighted_rarity(rng: random.Random, bands) -> int:
    """Pick a rarity index with probability proportional to band count (== today)."""
    weights = [b.count for b in bands]
    total = sum(weights)
    r = rng.random() * total
    acc = 0.0
    for i, w in enumerate(weights):
        acc += w
        if r <= acc:
            return i
    return len(bands) - 1
