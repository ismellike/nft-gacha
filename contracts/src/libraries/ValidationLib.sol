// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

/**
 * @title ValidationLib
 * @notice Shared validation functions for gas-efficient error handling across contracts
 * @dev Centralizes common validation patterns to reduce code duplication and gas costs
 * @author NFT Gacha Team
 */
library ValidationLib {
    /// @notice Custom errors for gas efficiency
    error ZeroAddress(string context);
    error ZeroAmount();
    error InvalidAddress(address addr);
    error InvalidLength();
    error InvalidArrayLength();
    error ArrayLengthMismatch();
    error EmptyArrays();
    error TooManyItems(uint256 provided, uint256 max);
    error InvalidIndex(uint256 index, uint256 max);

    /**
     * @notice Validates that an address is not zero
     * @param addr Address to validate
     * @param context Context for error message (e.g., "owner", "recipient")
     */
    function validateAddress(address addr, string memory context) internal pure {
        if (addr == address(0)) revert ZeroAddress(context);
    }

    /**
     * @notice Validates that an amount is greater than zero
     * @param amount Amount to validate
     */
    function validateAmount(uint256 amount) internal pure {
        if (amount == 0) revert ZeroAmount();
    }

    /**
     * @notice Validates array length is within bounds
     * @param length Array length to validate
     * @param max Maximum allowed length
     */
    function validateArrayLength(uint256 length, uint256 max) internal pure {
        if (length == 0) revert EmptyArrays();
        if (length > max) revert TooManyItems(length, max);
    }

    /**
     * @notice Validates two arrays have equal length
     * @param length1 Length of first array
     * @param length2 Length of second array
     */
    function validateArrayMatch(uint256 length1, uint256 length2) internal pure {
        if (length1 != length2) revert ArrayLengthMismatch();
    }

    /**
     * @notice Validates index is within array bounds
     * @param index Index to validate
     * @param max Maximum valid index (exclusive)
     */
    function validateIndex(uint256 index, uint256 max) internal pure {
        if (index >= max) revert InvalidIndex(index, max);
    }

    /**
     * @notice Validates that a value is within a range
     * @param value Value to validate
     * @param min Minimum allowed value (inclusive)
     * @param max Maximum allowed value (inclusive)
     */
    function validateInRange(uint256 value, uint256 min, uint256 max) internal pure {
        if (value < min || value > max) revert InvalidAddress(address(uint160(value)));
    }

    /**
     * @notice Batch validate multiple addresses
     * @param addresses Array of addresses to validate
     * @param contexts Array of contexts for each address
     */
    function batchValidateAddresses(
        address[] memory addresses,
        string[] memory contexts
    ) internal pure {
        uint256 length = addresses.length;
        validateArrayLength(length, 100); // Reasonable upper bound
        validateArrayMatch(length, contexts.length);

        for (uint256 i = 0; i < length; ++i) {
            validateAddress(addresses[i], contexts[i]);
        }
    }

    /**
     * @notice Checks if address is a valid contract (has code)
     * @param addr Address to check
     * @return isValid True if address contains code
     */
    function isValidContract(address addr) internal view returns (bool isValid) {
        uint256 size;
        assembly {
            size := extcodesize(addr)
        }
        return size > 0;
    }

    /**
     * @notice Validates that address is a contract
     * @param addr Address to validate
     * @param context Context for error message
     */
    function validateContract(address addr, string memory context) internal view {
        validateAddress(addr, context);
        if (!isValidContract(addr)) {
            revert InvalidAddress(addr);
        }
    }
}