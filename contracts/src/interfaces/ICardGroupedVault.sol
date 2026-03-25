// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title ICardGroupedVault
 * @notice Card-grouped yield vault with per-rarity accumulators and O(1) price updates.
 * @dev Yield is distributed per-rarity so revenue from a
 *      Legendary spin goes exclusively to Legendary depositors. Price changes use a
 *      correction accumulator to avoid iterating depositors.
 */
interface ICardGroupedVault {
    // ─── Events ─────────────────────────────────────────────────────────

    event CardDepositRegistered(
        bytes32 indexed cardId, address indexed depositor, uint256 priceUSD, uint8 rarity, uint256 count
    );
    event CardDepositRemoved(bytes32 indexed cardId, address indexed depositor, uint256 count);
    event CardPriceUpdated(bytes32 indexed cardId, uint256 oldPriceUSD, uint256 newPriceUSD);
    event CardRarityMigrated(bytes32 indexed cardId, uint8 oldRarity, uint8 newRarity, uint256 newPriceUSD);
    event YieldDistributed(address indexed caller, uint256 amount, uint8 rarity);
    event YieldClaimed(address indexed account, uint256 amount);

    // ─── Card-level operations (called by GachaTreasury) ────────────────

    /**
     * @notice Register a deposit of `count` tokens of a card for a depositor
     * @param cardId   Card identifier (shared by all tokens of the same card)
     * @param depositor Address of the depositor
     * @param priceUSD  Current appraised USD price of one token (18 decimals)
     * @param rarity    Rarity tier (0-4)
     * @param count     Number of tokens deposited
     */
    function registerCardDeposit(bytes32 cardId, address depositor, uint256 priceUSD, uint8 rarity, uint256 count)
        external;

    /**
     * @notice Remove `count` tokens of a card from a depositor's position
     * @param cardId   Card identifier
     * @param depositor Address of the depositor
     * @param count     Number of tokens to remove
     */
    function removeCardDeposit(bytes32 cardId, address depositor, uint256 count) external;

    /**
     * @notice O(1) card price update within the same rarity tier
     * @param cardId     Card identifier
     * @param newPriceUSD New appraised USD price (18 decimals)
     */
    function updateCardPrice(bytes32 cardId, uint256 newPriceUSD) external;

    /**
     * @notice O(1) card rarity migration (settles old tier yield, moves to new tier)
     * @param cardId     Card identifier
     * @param newRarity  New rarity tier (0-4)
     * @param newPriceUSD New appraised USD price (18 decimals)
     */
    function migrateCardRarity(bytes32 cardId, uint8 newRarity, uint256 newPriceUSD) external;

    // ─── Yield distribution (called by GachaEconomyManager) ─────────────

    /**
     * @notice Distribute USDC yield to a specific rarity pool
     * @param amount USDC amount (6 decimals)
     * @param rarity Rarity tier to receive yield (0-4)
     */
    function distributeYield(uint256 amount, uint8 rarity) external;

    // ─── User-facing (backward-compatible signatures) ───────────────────

    /**
     * @notice Claims all accumulated USDC yield for an account
     * @param account Address whose rewards will be withdrawn
     * @return withdrawn Amount paid out in USDC
     */
    function claimYield(address account) external returns (uint256 withdrawn);

    /**
     * @notice Returns claimable yield for an account (across all cards)
     * @param account Address to query
     */
    function pendingYield(address account) external view returns (uint256);

    /**
     * @notice Total appraisal-weighted value outstanding (sum of count × price for all cards)
     */
    function totalShares() external view returns (uint256);

    /**
     * @notice Value tracked for an individual depositor (sum of count × price across their cards)
     * @param account Address to query
     */
    function sharesOf(address account) external view returns (uint256);

    /**
     * @notice Returns the USDC token used for yield accounting
     */
    function asset() external view returns (IERC20);
}
