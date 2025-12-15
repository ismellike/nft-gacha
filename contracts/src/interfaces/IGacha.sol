// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {GachaTreasury} from "../gacha/GachaTreasury.sol";

/**
 * @title IGacha - Interface for Gacha contract
 * @notice Provides type-safe interface for Gacha contract interactions
 */
interface IGacha {
    /// @notice Get the current fee for spinning
    /// @return The spin fee amount
    function spinFee() external view returns (uint256);

    /// @notice Get the fee token contract
    /// @return The fee token address
    function feeToken() external view returns (IERC20);

    /// @notice Set the service handler contract
    /// @param _serviceHandler Address of the service handler
    function setGachaServiceHandler(address _serviceHandler) external;

    /// @notice Set the spin fee
    /// @param _newFee New spin fee amount
    function setSpinFee(uint256 _newFee) external;

    /// @notice Set rarity weights
    /// @param _common Weight for common rarity
    /// @param _uncommon Weight for uncommon rarity
    /// @param _rare Weight for rare rarity
    /// @param _epic Weight for epic rarity
    /// @param _legendary Weight for legendary rarity
    function setRarityWeights(uint256 _common, uint256 _uncommon, uint256 _rare, uint256 _epic, uint256 _legendary)
        external;

    /// @notice Spin the gacha
    /// @return triggerId The trigger ID for randomness fulfillment
    function spin() external returns (uint256);

    /// @notice Fulfill randomness for a spin
    /// @param triggerId The trigger ID to fulfill
    /// @param randomness The randomness value
    function fulfillRandomness(uint256 triggerId, bytes32 randomness) external;
}
