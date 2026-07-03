"""Pure, contract-faithful economic primitives for the SPINFI gacha.

Every constant and formula here mirrors the on-chain Solidity so the simulation
in ``simulate.py`` reflects real protocol behaviour rather than an idealised model.

Source of truth (contracts/src):
  - gacha/Gacha.sol
      TOTAL_WEIGHT                = 10_000
      DEFAULT_PRICING_PREMIUM_BPS = 500      (spin fee = EV * (1 + 5%))
      getExpectedValueUSD()       = sum(totalValue) / sum(counts)   (uniform-over-pool)
      _getSpinFeeToCharge()       = clamp(EV*(1+premium), minSpinFee, maxSpinFee)
  - economy/GachaEconomyManager.sol
      DEFAULT_DEPOSITOR_SHARE_BPS = 9_500    (95% to depositor vault)
      DEFAULT_PROTOCOL_SHARE_BPS  = 500      (5% to protocol treasury)
  - economy/ProtocolTreasury.sol
      REDEMPTION_PAYOUT_BPS       = 8_000    (buyback pays 80%)
      basisUSD                    = min(win-time snapshot, live appraisal)
      redemptionWindow            = 1 hour
"""

from __future__ import annotations

# --- Contract constants (basis points, 10_000 = 100%) ---------------------
BPS_DENOMINATOR = 10_000
DEFAULT_PRICING_PREMIUM_BPS = 500  # Gacha.DEFAULT_PRICING_PREMIUM_BPS
DEFAULT_DEPOSITOR_SHARE_BPS = 9_500  # GachaEconomyManager
DEFAULT_PROTOCOL_SHARE_BPS = 500  # GachaEconomyManager
REDEMPTION_PAYOUT_BPS = 8_000  # ProtocolTreasury (fixed, non-configurable)


def expected_value_usd(total_pool_value: float, pool_count: int) -> float:
    """Mean NFT value of the pool — the on-chain ``getExpectedValueUSD()``.

    Because draws are uniform-over-pool (a tier is picked with probability
    ``count_i / total`` then a uniform NFT within it), every NFT is equally
    likely and the EV of a single spin is exactly the pool mean.
    """
    if pool_count == 0:
        return 0.0
    return total_pool_value / pool_count


def spin_fee_usd(
    ev_usd: float,
    premium_bps: int = DEFAULT_PRICING_PREMIUM_BPS,
    min_fee_usd: float = 0.0,
    max_fee_usd: float = 0.0,
) -> float:
    """Spin fee in USD: ``EV * (1 + premium)`` clamped to [min, max].

    Mirrors ``_getSpinFeeToCharge()``. ``max_fee_usd == 0`` means "no cap"
    (the contract treats ``maxSpinFee == 0`` as unbounded).
    """
    fee = ev_usd * (BPS_DENOMINATOR + premium_bps) / BPS_DENOMINATOR
    if min_fee_usd > 0 and fee < min_fee_usd:
        fee = min_fee_usd
    if max_fee_usd > 0 and fee > max_fee_usd:
        fee = max_fee_usd
    return fee


def revenue_split(
    fee_usd: float,
    depositor_share_bps: int = DEFAULT_DEPOSITOR_SHARE_BPS,
) -> tuple[float, float]:
    """Split a spin fee into (depositor_yield, protocol_fee).

    Mirrors GachaEconomyManager: depositors get ``depositor_share_bps``, the
    protocol keeps the remainder (rounding dust goes to the protocol on-chain).
    """
    depositor = fee_usd * depositor_share_bps / BPS_DENOMINATOR
    protocol = fee_usd - depositor
    return depositor, protocol


def redemption_payout_usd(
    live_appraisal_usd: float,
    snapshot_usd: float,
    payout_bps: int = REDEMPTION_PAYOUT_BPS,
) -> float:
    """Best-effort buyback payout = ``80% * min(snapshot, live)``.

    Mirrors ``ProtocolTreasury._quoteRedemption``: the snapshot (win-time price)
    caps oracle inflation after winning; the live appraisal caps overpayment if
    the market fell. A zero snapshot falls back to the live appraisal.
    """
    if snapshot_usd > 0 and snapshot_usd < live_appraisal_usd:
        basis = snapshot_usd
    else:
        basis = live_appraisal_usd
    return basis * payout_bps / BPS_DENOMINATOR
