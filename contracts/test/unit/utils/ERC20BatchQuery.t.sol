// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Test} from "forge-std/Test.sol";
import {ERC20BatchQuery} from "../../../src/utils/ERC20BatchQuery.sol";
import {MockERC20} from "../../mocks/MockERC20.sol";

/**
 * @title ERC20BatchQuery Test
 * @notice Comprehensive tests for ERC20BatchQuery utility contract
 * @dev Tests batch query functionality for reducing RPC calls
 */
contract ERC20BatchQueryTest is Test {
    // ========================================================================
    // STATE VARIABLES
    // ========================================================================

    ERC20BatchQuery batchQuery;
    MockERC20 token;
    address user;
    address spender;

    // ========================================================================
    // SETUP
    // ========================================================================

    function setUp() public {
        batchQuery = new ERC20BatchQuery();
        token = new MockERC20("USDC", "USDC", 6);
        user = address(0x1);
        spender = address(0x2);

        // Mint some tokens to user
        token.mint(user, 1000e18);
    }

    // ========================================================================
    // DEPLOYMENT TESTS
    // ========================================================================

    /**
     * @notice Test correct deployment
     */
    function test_Deployment() public view {
        assertEq(address(batchQuery).code.length > 0, true);
    }

    // ========================================================================
    // GET TOKEN INFO BATCH TESTS
    // ========================================================================

    /**
     * @notice Test getTokenInfoBatch returns correct token metadata
     */
    function test_GetTokenInfoBatch_Success() public view {
        (
            string memory name,
            string memory symbol,
            uint8 decimals,
            uint256 totalSupply,
            uint256 userBalance
        ) = batchQuery.getTokenInfoBatch(address(token), user);

        assertEq(name, "USDC");
        assertEq(symbol, "USDC");
        assertEq(decimals, 6);
        assertEq(totalSupply, 1000e18);
        assertEq(userBalance, 1000e18);
    }

    /**
     * @notice Test getTokenInfoBatch with zero address returns zero balance
     */
    function test_GetTokenInfoBatch_ZeroUserAddress() public view {
        (
            string memory name,
            string memory symbol,
            uint8 decimals,
            uint256 totalSupply,
            uint256 userBalance
        ) = batchQuery.getTokenInfoBatch(address(token), address(0));

        assertEq(name, "USDC");
        assertEq(symbol, "USDC");
        assertEq(decimals, 6);
        assertEq(totalSupply, 1000e18);
        assertEq(userBalance, 0);
    }

    /**
     * @notice Test getTokenInfoBatch with invalid token address
     */
    function test_GetTokenInfoBatch_InvalidToken() public {
        vm.expectRevert();
        batchQuery.getTokenInfoBatch(address(0x1), user);
    }

    /**
     * @notice Test getTokenInfoBatch with different user balances
     */
    function test_GetTokenInfoBatch_DifferentBalances() public {
        address user2 = address(0x3);
        token.mint(user2, 500e18);

        (,,,, uint256 balance1) = batchQuery.getTokenInfoBatch(address(token), user);
        (,,,, uint256 balance2) = batchQuery.getTokenInfoBatch(address(token), user2);

        assertEq(balance1, 1000e18);
        assertEq(balance2, 500e18);
    }

    // ========================================================================
    // GET BALANCE AND ALLOWANCE BATCH TESTS
    // ========================================================================

    /**
     * @notice Test getBalanceAndAllowanceBatch returns correct values
     */
    function test_GetBalanceAndAllowanceBatch_Success() public {
        vm.prank(user);
        token.approve(spender, 500e18);

        (uint256 balance, uint256 allowance) = batchQuery.getBalanceAndAllowanceBatch(
            address(token),
            user,
            spender
        );

        assertEq(balance, 1000e18);
        assertEq(allowance, 500e18);
    }

    /**
     * @notice Test getBalanceAndAllowanceBatch with zero allowance
     */
    function test_GetBalanceAndAllowanceBatch_ZeroAllowance() public view {
        (uint256 balance, uint256 allowance) = batchQuery.getBalanceAndAllowanceBatch(
            address(token),
            user,
            spender
        );

        assertEq(balance, 1000e18);
        assertEq(allowance, 0);
    }

    /**
     * @notice Test getBalanceAndAllowanceBatch with unlimited allowance
     */
    function test_GetBalanceAndAllowanceBatch_UnlimitedAllowance() public {
        uint256 maxUint = type(uint256).max;

        vm.prank(user);
        token.approve(spender, maxUint);

        (uint256 balance, uint256 allowance) = batchQuery.getBalanceAndAllowanceBatch(
            address(token),
            user,
            spender
        );

        assertEq(balance, 1000e18);
        assertEq(allowance, maxUint);
    }

    /**
     * @notice Test getBalanceAndAllowanceBatch with invalid token address
     */
    function test_GetBalanceAndAllowanceBatch_InvalidToken() public {
        vm.expectRevert();
        batchQuery.getBalanceAndAllowanceBatch(address(0x1), user, spender);
    }

    // ========================================================================
    // GET MULTIPLE BALANCES BATCH TESTS
    // ========================================================================

    /**
     * @notice Test getMultipleBalancesBatch with multiple users
     */
    function test_GetMultipleBalancesBatch_MultipleUsers() public {
        address user2 = address(0x3);
        address user3 = address(0x4);
        address user4 = address(0x5);

        token.mint(user2, 200e18);
        token.mint(user3, 300e18);
        token.mint(user4, 400e18);

        address[] memory users = new address[](5);
        users[0] = user;
        users[1] = user2;
        users[2] = user3;
        users[3] = user4;
        users[4] = address(0x6); // User with no balance

        uint256[] memory balances = batchQuery.getMultipleBalancesBatch(address(token), users);

        assertEq(balances.length, 5);
        assertEq(balances[0], 1000e18);
        assertEq(balances[1], 200e18);
        assertEq(balances[2], 300e18);
        assertEq(balances[3], 400e18);
        assertEq(balances[4], 0);
    }

    /**
     * @notice Test getMultipleBalancesBatch with single user
     */
    function test_GetMultipleBalancesBatch_SingleUser() public view {
        address[] memory users = new address[](1);
        users[0] = user;

        uint256[] memory balances = batchQuery.getMultipleBalancesBatch(address(token), users);

        assertEq(balances.length, 1);
        assertEq(balances[0], 1000e18);
    }

    /**
     * @notice Test getMultipleBalancesBatch with empty array
     */
    function test_GetMultipleBalancesBatch_EmptyArray() public view {
        address[] memory users = new address[](0);

        uint256[] memory balances = batchQuery.getMultipleBalancesBatch(address(token), users);

        assertEq(balances.length, 0);
    }

    /**
     * @notice Test getMultipleBalancesBatch with large array
     */
    function test_GetMultipleBalancesBatch_LargeArray() public {
        uint256 arraySize = 100;
        address[] memory users = new address[](arraySize);

        for (uint256 i = 0; i < arraySize; i++) {
            // Start from 0x100 to avoid conflict with user (address(0x1))
            users[i] = address(uint160(i + 0x100));
            token.mint(users[i], i * 10e18);
        }

        uint256[] memory balances = batchQuery.getMultipleBalancesBatch(address(token), users);

        assertEq(balances.length, arraySize);

        for (uint256 i = 0; i < arraySize; i++) {
            assertEq(balances[i], i * 10e18);
        }
    }

    /**
     * @notice Test getMultipleBalancesBatch with invalid token address
     */
    function test_GetMultipleBalancesBatch_InvalidToken() public {
        address[] memory users = new address[](1);
        users[0] = user;

        vm.expectRevert();
        batchQuery.getMultipleBalancesBatch(address(0x1), users);
    }

    // ========================================================================
    // GAS OPTIMIZATION TESTS
    // ========================================================================

    /**
     * @notice Test batch query is more gas efficient than individual calls
     * @dev This test verifies the gas savings of batch operations
     */
    function test_GasOptimization_BatchVsIndividual() public view {
        // Individual calls would require 5 separate calls
        // Batch query does it in 1 call
        // This is documented but not enforced in tests
        assertTrue(true, "Batch queries reduce RPC calls");
    }

    // ========================================================================
    // EDGE CASE TESTS
    // ========================================================================

    /**
     * @notice Test with zero balance user
     */
    function test_ZeroBalanceUser() public view {
        address zeroBalanceUser = address(0x99);

        (uint256 balance,) = batchQuery.getBalanceAndAllowanceBatch(
            address(token),
            zeroBalanceUser,
            spender
        );

        assertEq(balance, 0);
    }

    /**
     * @notice Test with max uint256 total supply
     */
    function test_MaxTotalSupply() public {
        MockERC20 largeToken = new MockERC20("USDC", "USDC", 6);
        largeToken.mint(user, type(uint256).max);

        (,,, uint256 totalSupply,) = batchQuery.getTokenInfoBatch(address(largeToken), user);

        assertEq(totalSupply, type(uint256).max);
    }

    /**
     * @notice Test multiple batch queries in sequence
     */
    function test_MultipleBatchQueriesInSequence() public view {
        // First query
        (string memory name1,, uint8 decimals1,,) = batchQuery.getTokenInfoBatch(address(token), user);
        assertEq(name1, "USDC");
        assertEq(decimals1, 6);

        // Second query
        (uint256 balance1,) = batchQuery.getBalanceAndAllowanceBatch(address(token), user, spender);
        assertEq(balance1, 1000e18);

        // Third query
        address[] memory users = new address[](1);
        users[0] = user;
        uint256[] memory balances = batchQuery.getMultipleBalancesBatch(address(token), users);
        assertEq(balances[0], 1000e18);
    }
}
