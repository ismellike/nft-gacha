// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {GachaTreasury} from "../gacha/GachaTreasury.sol";

/**
 * @title IGachaRewardsManager - Interface for rewards management
 * @notice Provides type-safe interface for GachaRewardsManager contract
 */
interface IGachaRewardsManager {
    /// @notice Process spin fees using three-tier accrual system
    /// @param totalFeeAmount Total fee collected from spin
    /// @param hitRarity The rarity that was hit by this spin
    function processSpinRewards(uint256 totalFeeAmount, GachaTreasury.Rarity hitRarity) external;

    /// @notice Create or update card tracker on deposit/withdrawal/reappraisal
    /// @param rarity Card rarity
    /// @param cardId Card ID
    /// @param userAddress User making deposit/withdrawal
    /// @param unitsDelta Change in user's units (+/- for deposit/withdrawal)
    function updateUserUnits(
        GachaTreasury.Rarity rarity,
        bytes32 cardId,
        address userAddress,
        int256 unitsDelta
    ) external;

    /// @notice Handle card reappraisal - settle and update weight, with migration support
    /// @param rarity Current card rarity
    /// @param cardId Card ID
    /// @param newPrice New appraised price
    /// @param newRarity New rarity (if migration needed)
    function handleReappraisal(
        GachaTreasury.Rarity rarity,
        bytes32 cardId,
        uint256 newPrice,
        GachaTreasury.Rarity newRarity
    ) external;

    /// @notice Record when a user wins an NFT (legacy function)
    /// @param user User who won the NFT
    /// @param rarity Rarity tier of the won NFT
    function recordNFTWon(address user, GachaTreasury.Rarity rarity) external;

    /// @notice Record when a user deposits an NFT (legacy function)
    /// @param user User who deposited the NFT
    /// @param rarity Rarity tier of the deposited NFT
    function recordApprovedDeposit(address user, GachaTreasury.Rarity rarity) external;

    /// @notice Record when a user claims rewards (existing function)
    /// @param user User who claimed rewards
    /// @param amount Amount claimed
    function recordUserRewardClaim(address user, uint256 amount) external;
}