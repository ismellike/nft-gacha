// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

/**
 * @title IGachaEconomyManager
 * @notice Interface for routing spin revenue through the NFT Gacha economy loop
 */
interface IGachaEconomyManager {
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
     * @notice Processes spin revenue and forwards shares to downstream vaults
     * @param usdcAmount Amount of USDC (6 decimals) collected for the spin
     * @param hitRarity Rarity tier that was hit (uint8 index)
     */
    function onSpinRevenue(uint256 usdcAmount, uint8 hitRarity) external;

    /**
     * @notice Basis points for depositor share
     */
    function depositorShareBps() external view returns (uint256);

    /**
     * @notice Basis points for protocol share
     */
    function protocolShareBps() external view returns (uint256);
}
