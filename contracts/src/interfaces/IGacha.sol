// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title IGacha - Interface for Gacha contract
 * @notice Provides type-safe interface for Gacha contract interactions
 */
interface IGacha {
    /// @notice Get the fee token contract
    /// @return The fee token address
    function feeToken() external view returns (IERC20);

    /// @notice Set the service handler contract
    /// @param _serviceHandler Address of the service handler
    function setGachaServiceHandler(address _serviceHandler) external;

    /// @notice Set the fee token decimals for USD conversion
    /// @param decimals Fee token decimals (<= 18)
    function setFeeTokenDecimals(uint8 decimals) external;

    /// @notice Configure pricing (EV-based)
    /// @param premiumBps Premium in bps over EV
    /// @param minFee Minimum fee in fee token units (0 disables floor)
    /// @param maxFee Maximum fee in fee token units (0 disables cap)
    function setPricingConfig(uint256 premiumBps, uint256 minFee, uint256 maxFee) external;

    /// @notice Configure target rarity weights
    /// @param targetBps Target rarity distribution in bps [Common..Legendary]
    function setDynamicWeightsConfig(uint256[5] calldata targetBps) external;

    /// @notice Get current spin fee (dynamic)
    function getCurrentSpinFee() external view returns (uint256);

    /// @notice Get current rarity weights (dynamic)
    function getCurrentRarityWeights() external view returns (uint256[5] memory);

    /// @notice Get target rarity weights in bps [Common..Legendary]
    function getTargetRarityBps() external view returns (uint256[5] memory);

    /// @notice Get expected value for a spin in USD (18 decimals)
    function getExpectedValueUSD() external view returns (uint256);

    /// @notice Spin the gacha with a max fee guard
    /// @param maxFee Maximum fee the caller is willing to pay
    /// @return triggerId The trigger ID for randomness fulfillment
    function spin(uint256 maxFee) external returns (uint256);

    /// @notice Fulfill randomness for a spin
    /// @param triggerId The trigger ID to fulfill
    /// @param randomness The randomness value
    function fulfillRandomness(uint256 triggerId, bytes32 randomness) external;

    /// @notice Spin with permit and max fee guard
    function spinWithPermit(uint256 deadline, uint8 v, bytes32 r, bytes32 s, uint256 maxFee)
        external
        returns (uint256);
}
