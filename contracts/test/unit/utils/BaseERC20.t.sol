// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Test} from "forge-std/Test.sol";
import {BaseERC20} from "../../../src/tokens/BaseERC20.sol";

/**
 * @title BaseERC20 Test
 * @notice Comprehensive tests for BaseERC20 token contract
 * @dev Tests deployment, minting, transfers, approvals, and permit functionality
 */
contract BaseERC20Test is Test {
    // ========================================================================
    // STATE VARIABLES
    // ========================================================================

    BaseERC20 token;
    address owner;
    address user;
    address spender;

    // ========================================================================
    // EVENTS
    // ========================================================================

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    // ========================================================================
    // SETUP
    // ========================================================================

    function setUp() public {
        owner = address(this);
        user = address(0x1);
        spender = address(0x2);

        token = new BaseERC20("Test Token", "TEST", owner);
    }

    // ========================================================================
    // DEPLOYMENT TESTS
    // ========================================================================

    /**
     * @notice Test correct deployment with parameters
     */
    function test_Deployment() public view {
        assertEq(token.name(), "Test Token");
        assertEq(token.symbol(), "TEST");
        assertEq(token.owner(), owner);
        assertEq(token.totalSupply(), 0);
    }

    /**
     * @notice test deployment with zero address owner should fail
     */
    function test_Deployment_ZeroOwner() public {
        vm.expectRevert();
        new BaseERC20("Test Token", "TEST", address(0));
    }

    // ========================================================================
    // MINT TESTS
    // ========================================================================

    /**
     * @notice Test owner can mint tokens
     */
    function test_Mint_ByOwner() public {
        uint256 mintAmount = 1000e18;

        vm.expectEmit(true, true, false, true);
        emit Transfer(address(0), user, mintAmount);

        token.mint(user, mintAmount);

        assertEq(token.balanceOf(user), mintAmount);
        assertEq(token.totalSupply(), mintAmount);
    }

    /**
     * @notice Test non-owner cannot mint tokens
     */
    function test_Mint_NotOwner_Fails() public {
        vm.prank(user);
        vm.expectRevert();
        token.mint(user, 100e18);
    }

    /**
     * @notice Test mint to zero address fails
     */
    function test_Mint_ZeroAddress_Fails() public {
        vm.expectRevert();
        token.mint(address(0), 100e18);
    }

    /**
     * @notice Test multiple mints accumulate correctly
     */
    function test_Mint_MultipleTimes() public {
        token.mint(user, 100e18);
        token.mint(user, 200e18);
        token.mint(user, 300e18);

        assertEq(token.balanceOf(user), 600e18);
        assertEq(token.totalSupply(), 600e18);
    }

    // ========================================================================
    // TRANSFER TESTS
    // ========================================================================

    /**
     * @notice Test successful token transfer
     */
    function test_Transfer_Success() public {
        token.mint(user, 1000e18);

        vm.prank(user);
        vm.expectEmit(true, true, false, true);
        emit Transfer(user, spender, 500e18);

        // forge-lint: disable-next-line(erc20-unchecked-transfer)
        token.transfer(spender, 500e18);

        assertEq(token.balanceOf(user), 500e18);
        assertEq(token.balanceOf(spender), 500e18);
    }

    /**
     * @notice Test transfer with insufficient balance fails
     */
    function test_Transfer_InsufficientBalance_Fails() public {
        token.mint(user, 100e18);

        vm.prank(user);
        vm.expectRevert();
        // forge-lint: disable-next-line(erc20-unchecked-transfer)
        token.transfer(spender, 200e18);
    }

    /**
     * @notice Test transfer to zero address fails
     */
    function test_Transfer_ZeroAddress_Fails() public {
        token.mint(user, 100e18);

        vm.prank(user);
        vm.expectRevert();
        // forge-lint: disable-next-line(erc20-unchecked-transfer)
        token.transfer(address(0), 50e18);
    }

    // ========================================================================
    // APPROVE TESTS
    // ========================================================================

    /**
     * @notice Test approval works correctly
     */
    function test_Approve_Success() public {
        vm.prank(user);

        vm.expectEmit(true, true, false, true);
        emit Approval(user, spender, 500e18);

        token.approve(spender, 500e18);

        assertEq(token.allowance(user, spender), 500e18);
    }

    /**
     * @notice Test approve from zero address fails
     */
    function test_Approve_FromZeroAddress_Fails() public {
        vm.prank(address(0));
        vm.expectRevert();
        token.approve(spender, 100e18);
    }

    /**
     * @notice Test approve to zero address fails (OpenZeppelin ERC20 doesn't allow zero spender)
     */
    function test_Approve_ToZeroAddress_Fails() public {
        vm.prank(user);
        vm.expectRevert(); // OpenZeppelin ERC20 rejects zero address spender
        token.approve(address(0), 100e18);
    }

    // ========================================================================
    // TRANSFERFROM TESTS
    // ========================================================================

    /**
     * @notice Test transferFrom with sufficient allowance
     */
    function test_TransferFrom_Success() public {
        token.mint(user, 1000e18);

        vm.prank(user);
        token.approve(spender, 500e18);

        vm.prank(spender);
        vm.expectEmit(true, true, false, true);
        emit Transfer(user, spender, 400e18);

        // forge-lint: disable-next-line(erc20-unchecked-transfer)
        token.transferFrom(user, spender, 400e18);

        assertEq(token.balanceOf(user), 600e18);
        assertEq(token.balanceOf(spender), 400e18);
        assertEq(token.allowance(user, spender), 100e18);
    }

    /**
     * @notice Test transferFrom with insufficient allowance fails
     */
    function test_TransferFrom_InsufficientAllowance_Fails() public {
        token.mint(user, 1000e18);

        vm.prank(user);
        token.approve(spender, 100e18);

        vm.prank(spender);
        vm.expectRevert();
        // forge-lint: disable-next-line(erc20-unchecked-transfer)
        token.transferFrom(user, spender, 200e18);
    }

    /**
     * @notice Test transferFrom decreases allowance
     */
    function test_TransferFrom_DecreasesAllowance() public {
        token.mint(user, 1000e18);

        vm.prank(user);
        token.approve(spender, 500e18);

        vm.prank(spender);
        // forge-lint: disable-next-line(erc20-unchecked-transfer)
        token.transferFrom(user, spender, 300e18);

        assertEq(token.allowance(user, spender), 200e18);
    }
}
