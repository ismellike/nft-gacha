// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ICardGroupedVault} from "../../src/interfaces/ICardGroupedVault.sol";

/**
 * @title MockCardGroupedVault
 * @notice Minimal mock of ICardGroupedVault for tests that need a vault but don't test vault internals.
 *         Tracks calls for assertions.
 */
contract MockCardGroupedVault is ICardGroupedVault {
    IERC20 public immutable override asset;

    // ─── Call tracking ──────────────────────────────────────────────────

    struct RegisterCall {
        bytes32 cardId;
        address depositor;
        uint256 priceUSD;
        uint8 rarity;
        uint256 count;
    }

    struct RemoveCall {
        bytes32 cardId;
        address depositor;
        uint256 count;
    }

    struct PriceUpdateCall {
        bytes32 cardId;
        uint256 newPriceUSD;
    }

    struct MigrateCall {
        bytes32 cardId;
        uint8 newRarity;
        uint256 newPriceUSD;
    }

    struct DistributeCall {
        uint256 amount;
        uint8 rarity;
    }

    RegisterCall[] public registerCalls;
    RemoveCall[] public removeCalls;
    PriceUpdateCall[] public priceUpdateCalls;
    MigrateCall[] public migrateCalls;
    DistributeCall[] public distributeCalls;

    // Simple tracking
    mapping(address => uint256) public mockShares;
    uint256 public mockTotalShares;
    mapping(address => uint256) public mockPendingYield;

    constructor(address _asset) {
        asset = IERC20(_asset);
    }

    // ─── ICardGroupedVault implementation ───────────────────────────────

    function registerCardDeposit(bytes32 cardId, address depositor, uint256 priceUSD, uint8 rarity, uint256 count)
        external
        override
    {
        registerCalls.push(RegisterCall(cardId, depositor, priceUSD, rarity, count));
        mockShares[depositor] += count * priceUSD;
        mockTotalShares += count * priceUSD;
        emit CardDepositRegistered(cardId, depositor, priceUSD, rarity, count);
    }

    function removeCardDeposit(bytes32 cardId, address depositor, uint256 count) external override {
        removeCalls.push(RemoveCall(cardId, depositor, count));
        // We don't track exact price in mock, just emit
        emit CardDepositRemoved(cardId, depositor, count);
    }

    function updateCardPrice(bytes32 cardId, uint256 newPriceUSD) external override {
        priceUpdateCalls.push(PriceUpdateCall(cardId, newPriceUSD));
        emit CardPriceUpdated(cardId, 0, newPriceUSD);
    }

    function migrateCardRarity(bytes32 cardId, uint8 newRarity, uint256 newPriceUSD) external override {
        migrateCalls.push(MigrateCall(cardId, newRarity, newPriceUSD));
        emit CardRarityMigrated(cardId, 0, newRarity, newPriceUSD);
    }

    function distributeYield(uint256 amount, uint8 rarity) external override {
        distributeCalls.push(DistributeCall(amount, rarity));
        emit YieldDistributed(msg.sender, amount, rarity);
    }

    function claimYield(address account) external override returns (uint256 withdrawn) {
        withdrawn = mockPendingYield[account];
        mockPendingYield[account] = 0;
        if (withdrawn > 0) {
            emit YieldClaimed(account, withdrawn);
        }
    }

    function pendingYield(address account) external view override returns (uint256) {
        return mockPendingYield[account];
    }

    function totalShares() external view override returns (uint256) {
        return mockTotalShares;
    }

    function sharesOf(address account) external view override returns (uint256) {
        return mockShares[account];
    }

    // ─── Test helpers ───────────────────────────────────────────────────

    function getRegisterCallCount() external view returns (uint256) {
        return registerCalls.length;
    }

    function getRemoveCallCount() external view returns (uint256) {
        return removeCalls.length;
    }

    function getPriceUpdateCallCount() external view returns (uint256) {
        return priceUpdateCalls.length;
    }

    function getMigrateCallCount() external view returns (uint256) {
        return migrateCalls.length;
    }

    function getDistributeCallCount() external view returns (uint256) {
        return distributeCalls.length;
    }

    function setMockPendingYield(address account, uint256 amount) external {
        mockPendingYield[account] = amount;
    }
}
