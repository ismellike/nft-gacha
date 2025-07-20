// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Test, console} from "forge-std/Test.sol";
import {RarityDividendToken} from "../src/RarityDividendToken.sol";
import {GachaTreasury} from "../src/GachaTreasury.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
    constructor() ERC20("Mock Token", "MOCK") {}
    
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract RarityDividendTokenTest is Test {
    RarityDividendToken public token;
    MockERC20 public fundsToken;
    
    address public owner;
    address public distributor;
    address public user1;
    address public user2;
    address public user3;
    
    function setUp() public {
        owner = makeAddr("owner");
        distributor = makeAddr("distributor");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        user3 = makeAddr("user3");
        
        // Deploy funds token
        fundsToken = new MockERC20();
        
        // Deploy rarity dividend token
        vm.prank(owner);
        token = new RarityDividendToken(
            "Epic Gacha Rewards",
            "EGR",
            owner,
            GachaTreasury.Rarity.Epic,
            address(fundsToken),
            address(0) // No initial distributor for this test
        );
        
        // Set distributor authorization
        vm.prank(owner);
        token.setAuthorizedDistributor(distributor, true);
        
        // Mint funds to distributor for testing
        fundsToken.mint(distributor, 10000e18);
    }
    
    function testTokenBasics() public {
        assertEq(token.name(), "Epic Gacha Rewards");
        assertEq(token.symbol(), "EGR");
        assertEq(uint8(token.rarity()), uint8(GachaTreasury.Rarity.Epic));
        assertEq(address(token.fundsToken()), address(fundsToken));
        assertEq(token.getRarityName(), "Epic");
    }
    
    function testMinting() public {
        // Only authorized distributor can mint
        vm.prank(distributor);
        token.mint(user1, 5e18);
        
        assertEq(token.balanceOf(user1), 5e18);
        assertEq(token.totalSupply(), 5e18);
        
        // Unauthorized address cannot mint
        vm.prank(user1);
        vm.expectRevert(abi.encodeWithSelector(RarityDividendToken.UnauthorizedDistributor.selector));
        token.mint(user2, 1e18);
    }
    
    function testFundsDistribution() public {
        // Setup: Mint tokens to users
        vm.startPrank(distributor);
        token.mint(user1, 3e18); // 60% of supply
        token.mint(user2, 2e18); // 40% of supply
        vm.stopPrank();
        
        // Distribute funds
        uint256 fundsToDistribute = 1000e18;
        vm.startPrank(distributor);
        fundsToken.approve(address(token), fundsToDistribute);
        token.distributeFunds(fundsToDistribute);
        vm.stopPrank();
        
        // Check withdrawable amounts
        uint256 user1Withdrawable = token.withdrawableFundsOf(user1);
        uint256 user2Withdrawable = token.withdrawableFundsOf(user2);
        
        // User1 should get 60% (600e18), User2 should get 40% (400e18)
        assertEq(user1Withdrawable, 600e18, "User1 should get 60% of funds");
        assertEq(user2Withdrawable, 400e18, "User2 should get 40% of funds");
        
        // Total withdrawable should equal distributed amount
        assertEq(user1Withdrawable + user2Withdrawable, fundsToDistribute, "Total should equal distributed");
    }
    
    function testWithdrawFunds() public {
        // Setup tokens and distribute funds
        vm.startPrank(distributor);
        token.mint(user1, 1e18);
        fundsToken.approve(address(token), 100e18);
        token.distributeFunds(100e18);
        vm.stopPrank();
        
        uint256 initialBalance = fundsToken.balanceOf(user1);
        uint256 withdrawable = token.withdrawableFundsOf(user1);
        
        // User1 withdraws funds
        vm.prank(user1);
        token.withdrawFunds();
        
        // Check balances
        assertEq(fundsToken.balanceOf(user1), initialBalance + withdrawable, "Balance should increase");
        assertEq(token.withdrawableFundsOf(user1), 0, "No more withdrawable funds");
        assertEq(token.withdrawnFundsOf(user1), withdrawable, "Withdrawn amount tracked");
    }
    
    function testMultipleDistributions() public {
        // Setup tokens
        vm.startPrank(distributor);
        token.mint(user1, 1e18);
        token.mint(user2, 1e18);
        vm.stopPrank();
        
        // First distribution
        vm.startPrank(distributor);
        fundsToken.approve(address(token), 200e18);
        token.distributeFunds(100e18);
        vm.stopPrank();
        
        uint256 user1FirstDist = token.withdrawableFundsOf(user1);
        assertEq(user1FirstDist, 50e18, "User1 should get 50% of first distribution");
        
        // Second distribution
        vm.startPrank(distributor);
        token.distributeFunds(100e18);
        vm.stopPrank();
        
        uint256 user1TotalWithdrawable = token.withdrawableFundsOf(user1);
        assertEq(user1TotalWithdrawable, 100e18, "User1 should get 50% of both distributions");
        
        // Withdraw after first distribution
        vm.prank(user1);
        token.withdrawFunds();
        
        assertEq(fundsToken.balanceOf(user1), 100e18, "User1 should receive total accumulated funds");
    }
    
    function testTokenTransferUpdatesFunds() public {
        // Setup: User1 has tokens and funds are distributed
        vm.startPrank(distributor);
        token.mint(user1, 2e18);
        fundsToken.approve(address(token), 200e18);
        token.distributeFunds(200e18);
        vm.stopPrank();
        
        // User1 should be able to withdraw 200e18
        assertEq(token.withdrawableFundsOf(user1), 200e18, "User1 should get all funds");
        
        // User1 transfers half tokens to User2
        vm.prank(user1);
        token.transfer(user2, 1e18);
        
        // Now both should have equal withdrawable amounts for future distributions
        assertEq(token.balanceOf(user1), 1e18, "User1 should have 1 token");
        assertEq(token.balanceOf(user2), 1e18, "User2 should have 1 token");
        
        // But user1 should still be able to withdraw the original distribution
        assertEq(token.withdrawableFundsOf(user1), 200e18, "User1 keeps rights to past distributions");
        assertEq(token.withdrawableFundsOf(user2), 0, "User2 has no rights to past distributions");
        
        // New distribution should be split equally
        vm.startPrank(distributor);
        fundsToken.approve(address(token), 100e18);
        token.distributeFunds(100e18);
        vm.stopPrank();
        
        // User1: 200 (old) + 50 (new) = 250
        // User2: 0 (old) + 50 (new) = 50
        assertEq(token.withdrawableFundsOf(user1), 250e18, "User1 gets old + half of new");
        assertEq(token.withdrawableFundsOf(user2), 50e18, "User2 gets half of new distribution");
    }
    
    function testDistributionWithZeroSupply() public {
        // Try to distribute when no tokens exist
        vm.startPrank(distributor);
        fundsToken.approve(address(token), 100e18);
        vm.expectRevert(abi.encodeWithSelector(RarityDividendToken.NoTokensToDistributeTo.selector));
        token.distributeFunds(100e18);
        vm.stopPrank();
    }
    
    function testDistributionWithZeroAmount() public {
        vm.startPrank(distributor);
        token.mint(user1, 1e18);
        
        vm.expectRevert(abi.encodeWithSelector(RarityDividendToken.InvalidAmount.selector));
        token.distributeFunds(0);
        vm.stopPrank();
    }
    
    function testWithdrawWithNoFunds() public {
        vm.prank(distributor);
        token.mint(user1, 1e18);
        
        // User has tokens but no funds distributed yet
        vm.prank(user1);
        vm.expectRevert(RarityDividendToken.NoFundsToWithdraw.selector);
        token.withdrawFunds();
    }
    
    function testAccumulativeFundsCalculation() public {
        vm.startPrank(distributor);
        token.mint(user1, 1e18);
        
        // First distribution
        fundsToken.approve(address(token), 200e18);
        token.distributeFunds(100e18);
        
        assertEq(token.accumulativeFundsOf(user1), 100e18, "Accumulative should be 100");
        assertEq(token.withdrawableFundsOf(user1), 100e18, "Withdrawable should be 100");
        
        // Second distribution
        token.distributeFunds(100e18);
        vm.stopPrank();
        
        assertEq(token.accumulativeFundsOf(user1), 200e18, "Accumulative should be 200");
        assertEq(token.withdrawableFundsOf(user1), 200e18, "Withdrawable should be 200");
        
        // Test partial withdrawal using proper method
        uint256 initialBalance = fundsToken.balanceOf(user1);
        vm.prank(user1);
        token.withdrawFunds(); // Withdraw all available funds
        
        assertEq(fundsToken.balanceOf(user1), initialBalance + 200e18, "User should receive all funds");
        assertEq(token.withdrawableFundsOf(user1), 0, "No more withdrawable funds");
    }
    
    function testAuthorizationManagement() public {
        // Only owner can set authorization
        vm.prank(user1);
        vm.expectRevert();
        token.setAuthorizedDistributor(user2, true);
        
        // Owner can set authorization
        vm.prank(owner);
        token.setAuthorizedDistributor(user2, true);
        
        assertTrue(token.authorizedDistributors(user2), "User2 should be authorized");
        
        // Newly authorized user can mint
        vm.prank(user2);
        token.mint(user3, 1e18);
        
        assertEq(token.balanceOf(user3), 1e18, "User3 should have tokens");
        
        // Remove authorization
        vm.prank(owner);
        token.setAuthorizedDistributor(user2, false);
        
        assertFalse(token.authorizedDistributors(user2), "User2 should not be authorized");
        
        // User2 can no longer mint
        vm.prank(user2);
        vm.expectRevert(abi.encodeWithSelector(RarityDividendToken.UnauthorizedDistributor.selector));
        token.mint(user3, 1e18);
    }
    
    function testEmergencyRecovery() public {
        // Mint some random ERC20 tokens to the contract
        MockERC20 randomToken = new MockERC20();
        randomToken.mint(address(token), 100e18);
        
        // Owner can recover random tokens
        vm.prank(owner);
        token.emergencyRecoverToken(address(randomToken), 100e18);
        
        assertEq(randomToken.balanceOf(owner), 100e18, "Owner should receive recovered tokens");
        
        // But cannot recover funds token
        fundsToken.mint(address(token), 50e18);
        vm.prank(owner);
        vm.expectRevert(abi.encodeWithSelector(RarityDividendToken.InvalidFundsToken.selector));
        token.emergencyRecoverToken(address(fundsToken), 50e18);
    }
    
    function testGetTotalFundsDistributed() public {
        vm.startPrank(distributor);
        token.mint(user1, 1e18);
        
        assertEq(token.getTotalFundsDistributed(), 0, "Initially no funds distributed");
        
        fundsToken.approve(address(token), 300e18);
        token.distributeFunds(100e18);
        
        assertEq(token.getTotalFundsDistributed(), 100e18, "Should track first distribution");
        
        token.distributeFunds(200e18);
        vm.stopPrank();
        
        assertEq(token.getTotalFundsDistributed(), 300e18, "Should track total distributions");
    }
}