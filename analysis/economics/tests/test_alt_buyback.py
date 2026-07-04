"""Focused, stdlib-only tests for the alt_buyback redemption variation.

These drive each strategy through the documented ``RedemptionStrategy`` contract
using a lightweight fake ``st`` (a ``types.SimpleNamespace`` exposing exactly the
SimState slice redemption strategies are allowed to touch: ``rng``, ``scenario``,
``protocol_balance``, ``reserves`` and ``topology.all_cards``). This keeps the
tests runnable against the real ``strategies`` package + registry without
depending on the full engine's SimState construction. Deterministic per seed.

Run:  python3 tests/test_alt_buyback.py     (or: pytest tests/test_alt_buyback.py)
"""

from __future__ import annotations

import os
import random
import sys
import types

# Make analysis/economics importable whether invoked from there or from tests/.
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from scenarios import RarityBand, Scenario, StratSpec  # noqa: E402
from strategies.base import NFT, SpinnerState  # noqa: E402
from strategies.registry import build  # noqa: E402

SPINNER = SpinnerState(0)


class ScriptRandom:
    """Deterministic rng returning scripted values from ``random()`` (cycles)."""

    def __init__(self, values):
        self.values = list(values)
        self.i = 0

    def random(self) -> float:
        v = self.values[self.i % len(self.values)]
        self.i += 1
        return v


def _bands():
    return [
        RarityBand("Common", 5.0, 15.0, 90),
        RarityBand("Legendary", 1_500.0, 6_000.0, 10),
    ]


def _make_st(rng, balance, cards=(), redeem_prob=1.0, max_payout_bps=0, bands=None):
    bands = _bands() if bands is None else bands
    scn = Scenario(
        name="t",
        description="",
        bands=list(bands),
        redeem_prob=redeem_prob,
        max_payout_bps=max_payout_bps,
    )

    class _Topo:
        def __init__(self, c):
            self._c = list(c)

        def all_cards(self, st):
            return self._c

    return types.SimpleNamespace(
        rng=rng,
        scenario=scn,
        protocol_balance=float(balance),
        reserves={},
        topology=_Topo(cards),
        tick=0,
    )


def _nft(rarity, value, snapshot=None):
    snap = value if snapshot is None else snapshot
    return NFT(id=0, rarity=rarity, appraisal_usd=float(value), depositor_id=7, snapshot_usd=float(snap))


def _build(name, **params):
    return build("redemption", StratSpec(name, params))


# --------------------------------------------------------------------------- #
# Dutch                                                                        #
# --------------------------------------------------------------------------- #
def test_dutch_decays_with_wait():
    """Longer sampled wait -> lower payout; zero wait pays the start_bps."""
    won = _nft(1, 1_000.0)
    strat = _build("dutch", start_bps=8_000, floor_bps=4_000, window_spins=60, decay="linear")

    # gate=0.0 (passes redeem_prob=1.0), then wait fraction as 2nd draw.
    r_zero = strat.maybe_redeem(_make_st(ScriptRandom([0.0, 0.0]), 1e9), won, SPINNER)
    r_half = strat.maybe_redeem(_make_st(ScriptRandom([0.0, 0.5]), 1e9), won, SPINNER)
    r_late = strat.maybe_redeem(_make_st(ScriptRandom([0.0, 0.999]), 1e9), won, SPINNER)

    assert r_zero.status == r_half.status == r_late.status == "success"
    # wait=0 -> 8000 bps -> 0.80 * 1000
    assert abs(r_zero.payout_usd - 800.0) < 1e-6
    # wait=0.5*window -> frac 0.5 -> 6000 bps -> 0.60 * 1000
    assert abs(r_half.payout_usd - 600.0) < 1e-6
    # monotone decreasing in wait
    assert r_zero.payout_usd > r_half.payout_usd > r_late.payout_usd


def test_dutch_mean_below_flat_and_deterministic():
    """Mean effective payout sits strictly below the flat 80%, reproducibly."""
    won = _nft(0, 1_000.0)

    def run(seed):
        strat = _build("dutch")  # defaults: 8000 -> 4000 linear over 60
        rng = random.Random(seed)
        st = _make_st(rng, 1e12)
        total = n = 0
        for _ in range(4_000):
            st.rng = rng  # same stream; balance stays huge -> always success
            res = strat.maybe_redeem(st, won, SPINNER)
            assert res.status == "success"
            total += res.payout_usd
            n += 1
        return total / n

    mean_a = run(0)
    mean_b = run(0)
    assert mean_a == mean_b  # determinism per seed
    # flat 80% would be 800; mean must be below it but above the 4000-bps floor.
    assert 400.0 < mean_a < 800.0


# --------------------------------------------------------------------------- #
# Tiered reserves                                                             #
# --------------------------------------------------------------------------- #
def test_tiered_quarantines_legendary_drain():
    """A legendary run exhausts its own bucket without starving commons."""
    cards = [_nft(0, 10.0) for _ in range(90)] + [_nft(1, 3_000.0) for _ in range(10)]
    strat = _build("tiered", reserve_split="by_count")
    # by_count split 90/10 of a $1,000 treasury -> bucket0=900, bucket1=100.
    st = _make_st(ScriptRandom([0.0]), 1_000.0, cards=cards)

    legendary = _nft(1, 500.0)  # payout 400 > bucket1(100)
    common = _nft(0, 10.0)  # payout 8 < bucket0(900)

    # Legendary can't be funded from its own (small) bucket.
    r_leg = strat.maybe_redeem(st, legendary, SPINNER)
    assert r_leg.status == "insolvent"
    assert st.reserves[0] == 900.0  # common bucket untouched by the failed legendary

    # Commons keep succeeding, draining only bucket0 (mirror engine debit).
    for _ in range(5):
        r = strat.maybe_redeem(st, common, SPINNER)
        assert r.status == "success"
        st.protocol_balance -= r.payout_usd  # engine would debit the treasury
    assert abs(st.reserves[0] - (900.0 - 5 * 8.0)) < 1e-6
    assert st.reserves[1] == 100.0  # legendary bucket never funded a common

    # Legendary still insolvent even after commons drew down the shared treasury.
    assert strat.maybe_redeem(st, legendary, SPINNER).status == "insolvent"


# --------------------------------------------------------------------------- #
# Variable bps                                                                #
# --------------------------------------------------------------------------- #
def test_variable_bps_monotone_in_health():
    """payout_bps is monotone non-decreasing in treasury health, clamped."""
    strat = _build("variable_bps", min_bps=5_000, max_bps=8_000, target_usd=50_000.0)
    balances = [0.0, 10_000.0, 25_000.0, 40_000.0, 50_000.0, 200_000.0]
    bps = [strat._bps(b) for b in balances]
    assert bps == sorted(bps)  # monotone non-decreasing
    assert abs(bps[0] - 5_000.0) < 1e-9  # empty treasury -> floor
    assert abs(bps[-1] - 8_000.0) < 1e-9  # at/above target -> cap
    assert abs(bps[4] - 8_000.0) < 1e-9  # exactly at target -> max

    # Healthy treasury pays the max bps end-to-end.
    won = _nft(1, 1_000.0)
    res = strat.maybe_redeem(_make_st(ScriptRandom([0.0]), 100_000.0), won, SPINNER)
    assert res.status == "success"
    assert abs(res.payout_usd - 800.0) < 1e-6


# --------------------------------------------------------------------------- #
# Status partition + contract fidelity across all three                       #
# --------------------------------------------------------------------------- #
def test_all_statuses_partition():
    """Every strategy yields exactly the four engine-understood statuses."""
    won = _nft(0, 1_000.0)
    valid = {"none", "success", "insolvent", "capped"}
    single_band = [RarityBand("Common", 5.0, 15.0, 100)]

    for name in ("dutch", "tiered", "variable_bps"):
        # none: winner declines (gate draw 0.9 >= redeem_prob 0.5).
        st_none = _make_st(ScriptRandom([0.9]), 1e9, redeem_prob=0.5, bands=single_band)
        assert _build(name).maybe_redeem(st_none, won, SPINNER).status == "none"

        # insolvent: empty treasury can't fund anything.
        st_ins = _make_st(ScriptRandom([0.0]), 0.0, bands=single_band)
        assert _build(name).maybe_redeem(st_ins, won, SPINNER).status == "insolvent"

        # capped: funds exist but exceed the 1% maxPayoutBps reserve cap.
        st_cap = _make_st(ScriptRandom([0.0]), 1_000.0, max_payout_bps=100, bands=single_band)
        r_cap = _build(name).maybe_redeem(st_cap, won, SPINNER)
        assert r_cap.status == "capped", (name, r_cap.status)

        # success: well-capitalised treasury funds it.
        st_ok = _make_st(ScriptRandom([0.0]), 1e9, bands=single_band)
        r_ok = _build(name).maybe_redeem(st_ok, won, SPINNER)
        assert r_ok.status == "success" and r_ok.payout_usd > 0.0
        assert r_ok.status in valid


def _run_all():
    fns = [v for k, v in sorted(globals().items()) if k.startswith("test_") and callable(v)]
    for fn in fns:
        fn()
        print(f"ok  {fn.__name__}")
    print(f"\n{len(fns)} passed")


if __name__ == "__main__":
    _run_all()
