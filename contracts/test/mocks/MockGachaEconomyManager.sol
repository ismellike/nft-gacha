// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {GachaTreasury} from "../../src/gacha/GachaTreasury.sol";

/**
 * @title MockGachaEconomyManager
 * @notice Mock implementation of IGachaEconomyManager for testing Gacha contract
 * @dev Provides simple no-op implementation of economy manager interface
 *      Suitable for unit tests where economy distribution logic is not the focus
 */
contract MockGachaEconomyManager {
    /// @dev Basis points for depositor share (default 95%)
    uint256 public depositorShareBps = 9500;

    /// @dev Basis points for protocol share (default 5%)
    uint256 public protocolShareBps = 500;

    /// @dev Track total revenue received for testing assertions
    uint256 public totalRevenueReceived = 0;

    /**
     * @notice Emitted whenever spin revenue is processed
     * @param amount Total USDC processed
     * @param depositorShare Amount forwarded to the depositor vault
     * @param protocolShare Amount forwarded to the protocol treasury
     */
    event SpinRevenueReceived(uint256 amount, uint256 depositorShare, uint256 protocolShare);

    /**
     * @notice Emitted when fee splits are updated
     * @param depositorShareBps New depositor share in BPS
     * @param protocolShareBps New protocol share in BPS
     */
    event RevenueSplitUpdated(uint256 depositorShareBps, uint256 protocolShareBps);

    /**
     * @notice Processes spin revenue (no-op for testing)
     * @dev Simply accepts the fee tokens and emits an event for testing
     *      Does not perform actual distribution logic in tests
     * @param usdcAmount Amount of USDC (6 decimals) collected for the spin
     * @param - Rarity executed, for analytical eventing
     */
    function onSpinRevenue(uint256 usdcAmount, GachaTreasury.Rarity /* hitRarity */) external {
        // Track total revenue for testing
        totalRevenueReceived += usdcAmount;

        // Calculate shares
        uint256 depositorShare = (usdcAmount * depositorShareBps) / 10000;
        uint256 protocolShare = (usdcAmount * protocolShareBps) / 10000;

        // Emit event for testing verification
        emit SpinRevenueReceived(usdcAmount, depositorShare, protocolShare);

        // No-op: don't actually distribute tokens in mock
        // Real implementation would transfer to vaults
    }

    /**
     * @notice Set custom share splits for testing
     * @dev Allows tests to verify different split configurations
     * @param _depositorShareBps New depositor share in BPS
     * @param _protocolShareBps New protocol share in BPS
     */
    function setShareSplits(uint256 _depositorShareBps, uint256 _protocolShareBps) external {
        require(_depositorShareBps + _protocolShareBps == 10000, "Shares must sum to 10000");
        depositorShareBps = _depositorShareBps;
        protocolShareBps = _protocolShareBps;
        emit RevenueSplitUpdated(_depositorShareBps, _protocolShareBps);
    }

    /**
     * @notice Get total revenue received by this mock
     * @dev Helper function for test assertions
     */
    function getTotalRevenueReceived() external view returns (uint256) {
        return totalRevenueReceived;
    }

    /**
     * @notice Reset revenue tracking for test isolation
     * @dev Helper function to reset mock state between tests
     */
    function resetRevenueTracking() external {
        totalRevenueReceived = 0;
    }
}
