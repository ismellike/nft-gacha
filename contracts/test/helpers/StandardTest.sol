// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Test} from "forge-std/Test.sol";
import {TestConstants} from "./TestConstants.sol";
import {TestUsers} from "./TestUsers.sol";
import {DeploymentHelpers} from "./DeploymentHelpers.sol";
import {NFTHelpers} from "./NFTHelpers.sol";
import {MockNFTAppraisal} from "../mocks/MockNFTAppraisal.sol";

/**
 * @title Standard Test
 * @notice Base test contract providing all shared utilities
 * @dev All test contracts should inherit from this for consistency
 * @author NFT Gacha Team
 */
abstract contract StandardTest is Test, TestUsers, DeploymentHelpers, NFTHelpers {
    using TestConstants for *;

    // ========================================================================
    // MODIFIERS
    // ========================================================================

    /// @dev Helper modifier to run tests as owner
    modifier asOwner() {
        vm.startPrank(owner);
        _;
        vm.stopPrank();
    }

    /// @dev Helper modifier to run tests as user
    modifier asUser() {
        vm.startPrank(user);
        _;
        vm.stopPrank();
    }

    /// @dev Helper modifier to run tests as specific address
    modifier asAddress(address testUser) {
        vm.startPrank(testUser);
        _;
        vm.stopPrank();
    }

    /// @dev Helper modifier to expect specific revert reason
    modifier expectRevertWith(bytes4 errorSelector) {
        vm.expectRevert(errorSelector);
        _;
    }

    /// @dev Helper modifier to expect revert with custom error message
    modifier expectRevertWithMessage(string memory errorMessage) {
        vm.expectRevert(bytes(errorMessage));
        _;
    }

    // ========================================================================
    // ASSERTION HELPERS
    // ========================================================================

    /**
     * @notice Assert two uint arrays are equal
     * @param a First array
     * @param b Second array
     * @param message Error message
     */
    function assertArrayEq(uint256[] memory a, uint256[] memory b, string memory message) internal pure {
        assertEq(a.length, b.length, message);
        for (uint256 i = 0; i < a.length; i++) {
            assertEq(a[i], b[i], message);
        }
    }

    /**
     * @notice Assert two address arrays are equal
     * @param a First array
     * @param b Second array
     * @param message Error message
     */
    function assertAddressArrayEq(address[] memory a, address[] memory b, string memory message) internal pure {
        assertEq(a.length, b.length, message);
        for (uint256 i = 0; i < a.length; i++) {
            assertEq(a[i], b[i], message);
        }
    }

    /**
     * @notice Assert value is not zero
     * @param value Value to check
     * @param message Error message
     */
    function assertNotZero(uint256 value, string memory message) internal pure {
        assertTrue(value > 0, message);
    }

    /**
     * @notice Assert address is not zero
     * @param addr Address to check
     * @param message Error message
     */
    function assertNotZeroAddress(address addr, string memory message) internal pure {
        assertTrue(addr != address(0), message);
    }

    /**
     * @notice Assert two values are approximately equal (0.1% tolerance)
     * @param a First value
     * @param b Second value
     * @param message Error message
     */
    function assertApproxRel(uint256 a, uint256 b, string memory message) internal pure {
        uint256 maxDelta = (a > b ? a : b) / 1000; // 0.1%
        // Use built-in assertApproxEqAbs from StdAssertions
        assertApproxEqAbs(a, b, maxDelta, message);
    }

    // ========================================================================
    // SETUP HELPERS
    // ========================================================================

    /**
     * @notice Set timestamp for testing
     * @param newTimestamp The timestamp to set
     */
    function setTimestamp(uint256 newTimestamp) internal {
        vm.warp(newTimestamp);
    }

    /**
     * @notice Advance time by amount
     * @param timeAmount Seconds to advance
     */
    function advanceTime(uint256 timeAmount) internal {
        vm.warp(block.timestamp + timeAmount);
    }

    /**
     * @notice Advance a specific block
     * @param blocks Number of blocks to advance
     */
    function advanceBlocks(uint256 blocks) internal {
        uint256 newBlock = block.number + blocks;
        vm.roll(newBlock);
    }

    // ========================================================================
    // EVENT HELPERS
    // ========================================================================

    /**
     * @notice Expect emit with no indexed parameters
     * @param expected The expected event data
     */
    function expectEmitNoIndexed(bytes memory expected) internal {
        vm.expectEmit(false, false, false, true);
        emit Log(expected);
    }

    /**
     * @notice Expect emit with one indexed parameter
     * @param topic1 The first indexed parameter
     * @param data The event data
     */
    function expectEmit1Indexed(address topic1, bytes memory data) internal {
        vm.expectEmit(true, false, false, true);
        emit Log1(topic1, data);
    }

    // ========================================================================
    // PRANK HELPERS
    // ========================================================================

    /**
     * @notice Execute function as owner
     * @param fn The function to execute
     */
    function asOwnerExecute(function() external fn) internal {
        vm.startPrank(owner);
        fn();
        vm.stopPrank();
    }

    /**
     * @notice Execute function as specific address
     * @param addr The address to act as
     * @param fn The function to execute
     */
    function asExecute(address addr, function() external fn) internal {
        vm.startPrank(addr);
        fn();
        vm.stopPrank();
    }

    // ========================================================================
    // MOCK HELPERS
    // ========================================================================

    /**
     * @notice Setup mock appraisal for multiple NFTs
     * @param mockAppraisal The mock appraisal contract
     * @param collection The NFT collection
     * @param tokenIds Array of token IDs
     * @param prices Array of prices
     */
    function setupMockAppraisals(
        MockNFTAppraisal mockAppraisal,
        address collection,
        uint256[] memory tokenIds,
        uint256[] memory prices
    ) internal {
        require(tokenIds.length == prices.length, "Arrays length mismatch");
        for (uint256 i = 0; i < tokenIds.length; i++) {
            mockAppraisal.setMockAppraisal(collection, tokenIds[i], prices[i]);
        }
    }

    // ========================================================================
    // STORAGE HELPERS
    // ========================================================================

    /**
     * @notice Get storage at slot
     * @param contractAddress The contract address
     * @param slot The storage slot
     * @return value The value at the slot
     */
    function getStorageAt(address contractAddress, bytes32 slot) internal view returns (bytes32 value) {
        return vm.load(contractAddress, slot);
    }

    /**
     * @notice Set storage at slot
     * @param contractAddress The contract address
     * @param slot The storage slot
     * @param value The value to set
     */
    function setStorageAt(address contractAddress, bytes32 slot, bytes32 value) internal {
        vm.store(contractAddress, slot, value);
    }

    // ========================================================================
    // DUMMY EVENT FOR HELPER FUNCTIONS
    // ========================================================================

    event Log(bytes data);
    event Log1(address indexed topic1, bytes data);
}
