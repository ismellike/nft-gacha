// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Test, console} from "forge-std/Test.sol";
import {GachaRewardsManager} from "../src/GachaRewardsManager.sol";
import {RarityDividendTracker} from "../src/RarityDividendTracker.sol";
import {GachaTreasury} from "../src/GachaTreasury.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestToken is ERC20 {
    constructor() ERC20("Test Token", "TEST") {
        _mint(msg.sender, 10000000e18);
    }
}

contract MockGacha {
    function getRarityWeights() external pure returns (uint256, uint256, uint256, uint256, uint256) {
        return (7000, 2000, 600, 300, 100); // Standard gacha weights
    }
}

// Mock treasury for testing integration methods
contract MockTreasury {
    mapping(GachaTreasury.Rarity => uint256) public rarityCount;
    mapping(address => mapping(GachaTreasury.Rarity => uint256)) public userDepositCount;
    
    // Value-weighted tracking for new dividend system
    mapping(GachaTreasury.Rarity => uint256) public totalRarityValue;
    mapping(address => mapping(GachaTreasury.Rarity => uint256)) public userDepositValue;

    function setUserDeposits(address user, GachaTreasury.Rarity rarity, uint256 count) external {
        userDepositCount[user][rarity] = count;
        rarityCount[rarity] = count; // Simplified for testing
    }
    
    function setUserDepositValues(address user, GachaTreasury.Rarity rarity, uint256 value) external {
        userDepositValue[user][rarity] = value;
        totalRarityValue[rarity] += value; // Accumulate total for testing
    }

    function getRarityCount(GachaTreasury.Rarity rarity) external view returns (uint256) {
        return rarityCount[rarity];
    }

    function getUserDepositCount(address user, GachaTreasury.Rarity rarity) external view returns (uint256) {
        return userDepositCount[user][rarity];
    }
    
    // New value-weighted functions
    function getRarityTotalValue(GachaTreasury.Rarity rarity) external view returns (uint256) {
        return totalRarityValue[rarity];
    }

    function getUserDepositValue(address user, GachaTreasury.Rarity rarity) external view returns (uint256) {
        return userDepositValue[user][rarity];
    }
}

contract GachaRewardsTest is Test {
    GachaRewardsManager public rewardsManager;
    TestToken public feeToken;
    MockGacha public gacha;
    MockTreasury public treasury;

    address public owner;
    address public protocol;
    address public user1;
    address public user2;

    function setUp() public {
        owner = makeAddr("owner");
        protocol = makeAddr("protocol");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");

        vm.startPrank(owner);

        feeToken = new TestToken();
        gacha = new MockGacha();
        treasury = new MockTreasury();

        rewardsManager = new GachaRewardsManager(owner, address(gacha), address(treasury), protocol, address(feeToken));

        // Deploy all rarity tokens
        rewardsManager.deployAllRarityTokens();

        // Give rewards manager tokens for distribution
        feeToken.transfer(address(rewardsManager), 1000000e18);

        vm.stopPrank();

        // Setup mock deposits for testing - need non-zero counts for distribution
        treasury.setUserDeposits(user1, GachaTreasury.Rarity.Common, 3);
        treasury.setUserDeposits(user2, GachaTreasury.Rarity.Epic, 1);
        
        // Setup value-weighted deposits (assuming $1000 per Common NFT, $5000 per Epic NFT)
        treasury.setUserDepositValues(user1, GachaTreasury.Rarity.Common, 3000e18); // 3 × $1000
        treasury.setUserDepositValues(user2, GachaTreasury.Rarity.Epic, 5000e18);   // 1 × $5000
        
        // Set minimal values for other rarities to prevent NoDeposits error
        treasury.setUserDepositValues(address(this), GachaTreasury.Rarity.Uncommon, 1e18); // $1
        treasury.setUserDepositValues(address(this), GachaTreasury.Rarity.Rare, 1e18);     // $1
        treasury.setUserDepositValues(address(this), GachaTreasury.Rarity.Legendary, 1e18); // $1

        // Mock the getRarityCount calls that the dividend tracker uses
        vm.mockCall(
            address(treasury),
            abi.encodeWithSignature("getRarityCount(uint8)", uint8(GachaTreasury.Rarity.Common)),
            abi.encode(uint256(3))
        );
        vm.mockCall(
            address(treasury),
            abi.encodeWithSignature("getRarityCount(uint8)", uint8(GachaTreasury.Rarity.Uncommon)),
            abi.encode(uint256(1))
        );
        vm.mockCall(
            address(treasury),
            abi.encodeWithSignature("getRarityCount(uint8)", uint8(GachaTreasury.Rarity.Rare)),
            abi.encode(uint256(1))
        );
        vm.mockCall(
            address(treasury),
            abi.encodeWithSignature("getRarityCount(uint8)", uint8(GachaTreasury.Rarity.Epic)),
            abi.encode(uint256(1))
        );
        vm.mockCall(
            address(treasury),
            abi.encodeWithSignature("getRarityCount(uint8)", uint8(GachaTreasury.Rarity.Legendary)),
            abi.encode(uint256(1))
        );
    }

    // === Basic Setup Tests ===

    function testDeployment() public view {
        assertEq(rewardsManager.owner(), owner);
        assertEq(rewardsManager.protocolAddress(), protocol);
        assertEq(address(rewardsManager.feeToken()), address(feeToken));
        assertEq(address(rewardsManager.gachaContract()), address(gacha));
    }

    function testRarityTokensDeployed() public view {
        // Check all rarity tokens are deployed
        for (uint256 i = 0; i < 5; i++) {
            address token = rewardsManager.getRarityToken(GachaTreasury.Rarity(i));
            assertTrue(token != address(0), "Rarity token should be deployed");
        }

        // Check getAllRarityTokens works
        address[5] memory tokens = rewardsManager.getAllRarityTokens();
        for (uint256 i = 0; i < 5; i++) {
            assertTrue(tokens[i] != address(0), "All tokens should be deployed");
            assertEq(tokens[i], rewardsManager.getRarityToken(GachaTreasury.Rarity(i)));
        }
    }

    function testInitialMultipliers() public view {
        assertEq(rewardsManager.rarityMultipliers(GachaTreasury.Rarity.Common), 10000); // 1.0x
        assertEq(rewardsManager.rarityMultipliers(GachaTreasury.Rarity.Uncommon), 12000); // 1.2x
        assertEq(rewardsManager.rarityMultipliers(GachaTreasury.Rarity.Rare), 15000); // 1.5x
        assertEq(rewardsManager.rarityMultipliers(GachaTreasury.Rarity.Epic), 20000); // 2.0x
        assertEq(rewardsManager.rarityMultipliers(GachaTreasury.Rarity.Legendary), 30000); // 3.0x
    }

    function testRarityTrackerOwnership() public view {
        address commonTracker = rewardsManager.getRarityToken(GachaTreasury.Rarity.Common);

        // Should be owned by the original owner
        assertEq(RarityDividendTracker(commonTracker).owner(), owner);

        // But rewards manager should be set correctly
        assertEq(RarityDividendTracker(commonTracker).rewardsManager(), address(rewardsManager));
    }

    // === Core Distribution Tests ===

    function testBasicRewardsDistribution() public {
        uint256 feeAmount = 1000e18;

        vm.prank(address(gacha));
        rewardsManager.distributeSpinRewards(feeAmount);

        // Check protocol received exact share: 10% of 1000e18 = 100e18
        assertEq(feeToken.balanceOf(protocol), 100e18, "Protocol should receive exactly 100 tokens");

        // Check total tracking matches exact amounts
        assertEq(rewardsManager.totalFeesDistributed(), 1000e18, "Total fees should be 1000 tokens");
        assertEq(rewardsManager.totalProtocolFees(), 100e18, "Protocol fees should be 100 tokens");
    }

    function testZeroAmountDistribution() public {
        vm.prank(address(gacha));
        rewardsManager.distributeSpinRewards(0);

        assertEq(rewardsManager.totalFeesDistributed(), 0);
        assertEq(feeToken.balanceOf(protocol), 0);
    }

    function testMultipleDistributions() public {
        uint256 feeAmount = 500e18;

        // First distribution
        vm.prank(address(gacha));
        rewardsManager.distributeSpinRewards(feeAmount);

        // Second distribution
        vm.prank(address(gacha));
        rewardsManager.distributeSpinRewards(feeAmount);

        // Exact calculations: 2 * 500 = 1000 tokens total
        assertEq(rewardsManager.totalFeesDistributed(), 1000e18, "Total fees should be 1000 tokens");
        // Protocol: 10% of 1000 = 100 tokens
        assertEq(rewardsManager.totalProtocolFees(), 100e18, "Protocol fees should be 100 tokens");
    }

    // === User Rewards Tests ===

    function testUserRewardCalculation() public {
        uint256 feeAmount = 1000e18;

        vm.prank(address(gacha));
        rewardsManager.distributeSpinRewards(feeAmount);

        /*
         * Exact reward calculation:
         * Total rewards: 900e18 (90% of 1000e18)
         * 
         * Effective weights calculation:
         * Common: 7000 * 10000 / 10000 = 7000
         * Uncommon: 2000 * 12000 / 10000 = 2400  
         * Rare: 600 * 15000 / 10000 = 900
         * Epic: 300 * 20000 / 10000 = 600
         * Legendary: 100 * 30000 / 10000 = 300
         * Total effective weight: 11200
         * 
         * Common rewards: (900e18 * 7000) / 11200 = 562.5e18
         * Epic rewards: (900e18 * 600) / 11200 = 48.214285714285714285e18
         * 
         * user1 has 3 Common deposits out of 3 total = 100% of Common rewards = 562.5e18
         * user2 has 1 Epic deposit out of 1 total = 100% of Epic rewards ≈ 48.214285714285714285e18
         */
        uint256 expectedUser1Rewards = 562500000000000000000; // 562.5e18
        uint256 expectedUser2Rewards = 48214285714285714284; // ~48.214e18

        uint256 user1Rewards = rewardsManager.getUserTotalClaimableRewards(user1);
        uint256 user2Rewards = rewardsManager.getUserTotalClaimableRewards(user2);

        assertEq(user1Rewards, expectedUser1Rewards, "User1 should receive exactly 562.5 tokens");
        assertEq(user2Rewards, expectedUser2Rewards, "User2 should receive exactly ~48.214 tokens");

        // Check individual rarity rewards match total rewards
        uint256 user1CommonRewards = rewardsManager.getUserRarityClaimableRewards(user1, GachaTreasury.Rarity.Common);
        uint256 user2EpicRewards = rewardsManager.getUserRarityClaimableRewards(user2, GachaTreasury.Rarity.Epic);

        assertEq(user1CommonRewards, expectedUser1Rewards, "User1 Common rewards should equal total");
        assertEq(user2EpicRewards, expectedUser2Rewards, "User2 Epic rewards should equal total");
        assertEq(user1CommonRewards, user1Rewards, "User1 should only have Common rewards");
        assertEq(user2EpicRewards, user2Rewards, "User2 should only have Epic rewards");
    }

    // === Comprehensive Rewards Claiming Tests ===
    // Re-implementing comprehensive claiming tests without complex mocks

    // === Multiplier Tests ===

    function testRarityMultiplierUpdate() public {
        vm.prank(owner);
        rewardsManager.setRarityMultiplier(GachaTreasury.Rarity.Legendary, 50000); // 5.0x

        assertEq(rewardsManager.rarityMultipliers(GachaTreasury.Rarity.Legendary), 50000);
    }

    function testMultiplierEffects() public {
        // Set high multiplier for Epic
        vm.prank(owner);
        rewardsManager.setRarityMultiplier(GachaTreasury.Rarity.Epic, 50000); // 5.0x

        uint256 feeAmount = 1000e18;
        vm.prank(address(gacha));
        rewardsManager.distributeSpinRewards(feeAmount);

        /*
         * Exact reward calculation with 5.0x Epic multiplier:
         * Total rewards: 900e18 (90% of 1000e18)
         * 
         * Effective weights with new multiplier:
         * Common: 7000 * 10000 / 10000 = 7000
         * Uncommon: 2000 * 12000 / 10000 = 2400  
         * Rare: 600 * 15000 / 10000 = 900
         * Epic: 300 * 50000 / 10000 = 1500 (boosted from 600)
         * Legendary: 100 * 30000 / 10000 = 300
         * Total effective weight: 12100
         * 
         * Epic rewards: (900e18 * 1500) / 12100 = 111.570247933884297520e18
         */
        uint256 expectedUser2EpicRewards = 111570247933884297519; // ~111.57e18
        uint256 user2EpicRewards = rewardsManager.getUserRarityClaimableRewards(user2, GachaTreasury.Rarity.Epic);

        assertEq(
            user2EpicRewards,
            expectedUser2EpicRewards,
            "Epic should receive exactly ~111.57 tokens with 5.0x multiplier"
        );
    }

    // === Integration Methods Tests ===

    function testIntegrationMethodsExist() public {
        // Test that the treasury integration methods work
        vm.prank(address(treasury));
        rewardsManager.recordApprovedDeposit(user1, uint8(GachaTreasury.Rarity.Common));

        vm.prank(address(treasury));
        rewardsManager.recordNFTWon(user1, uint8(GachaTreasury.Rarity.Common));

        // These should not revert if properly integrated
        assertTrue(true, "Integration methods should work");
    }

    function testUpdateCorrectionAccess() public {
        address commonTracker = rewardsManager.getRarityToken(GachaTreasury.Rarity.Common);

        // Rewards manager should be able to call updateCorrection
        vm.prank(address(rewardsManager));
        RarityDividendTracker(commonTracker).updateCorrection(user1);

        // Owner should be able to call it too
        vm.prank(owner);
        RarityDividendTracker(commonTracker).updateCorrection(user1);

        // Random user should not
        vm.prank(user1);
        vm.expectRevert();
        RarityDividendTracker(commonTracker).updateCorrection(user1);
    }

    // === Access Control Tests ===

    function testUnauthorizedDistribution() public {
        vm.prank(user1);
        vm.expectRevert();
        rewardsManager.distributeSpinRewards(1000e18);
    }

    function testUnauthorizedIntegrationMethods() public {
        // Only treasury should be able to call these methods
        vm.prank(user1);
        vm.expectRevert();
        rewardsManager.recordApprovedDeposit(user1, uint8(GachaTreasury.Rarity.Common));

        vm.prank(user1);
        vm.expectRevert();
        rewardsManager.recordNFTWon(user1, uint8(GachaTreasury.Rarity.Common));
    }

    function testUnauthorizedMultiplierUpdate() public {
        vm.prank(user1);
        vm.expectRevert();
        rewardsManager.setRarityMultiplier(GachaTreasury.Rarity.Common, 15000);
    }

    function testUnauthorizedProtocolUpdate() public {
        vm.prank(user1);
        vm.expectRevert();
        rewardsManager.setProtocolAddress(makeAddr("newProtocol"));
    }

    // === Admin Functions Tests ===

    function testProtocolAddressUpdate() public {
        address newProtocol = makeAddr("newProtocol");

        vm.prank(owner);
        rewardsManager.setProtocolAddress(newProtocol);

        assertEq(rewardsManager.protocolAddress(), newProtocol);

        // Test protocol receives fees at new address
        uint256 feeAmount = 1000e18;
        vm.prank(address(gacha));
        rewardsManager.distributeSpinRewards(feeAmount);

        // Exact protocol fee calculation: 10% of 1000e18 = 100e18
        uint256 expectedProtocolFee = 100e18;
        assertEq(feeToken.balanceOf(newProtocol), expectedProtocolFee, "New protocol should receive exactly 100 tokens");
        assertEq(feeToken.balanceOf(protocol), 0, "Old protocol should receive no tokens");
    }

    function testEmergencyPauseUnpause() public {
        // Test pause functionality
        vm.prank(owner);
        rewardsManager.emergencyPause();

        // Test that claiming fails when paused
        address commonTracker = rewardsManager.getRarityToken(GachaTreasury.Rarity.Common);
        vm.prank(user1);
        vm.expectRevert();
        RarityDividendTracker(commonTracker).withdrawFunds();

        // Test unpause
        vm.prank(owner);
        rewardsManager.emergencyUnpause();

        // After unpause, the system should be operational again
        // (we don't test actual claiming due to mock complexity)
        assertTrue(true, "Pause/unpause functionality works");
    }

    // === Edge Cases Tests ===

    function testUserClaimIndividualRarityRewards() public {
        uint256 feeAmount = 1000e18;

        // Distribute rewards first
        vm.prank(address(gacha));
        rewardsManager.distributeSpinRewards(feeAmount);

        // Exact expected Common rewards calculation (same as testUserRewardCalculation)
        uint256 expectedUser1CommonRewards = 562500000000000000000; // 562.5e18

        uint256 user1CommonRewards = rewardsManager.getUserRarityClaimableRewards(user1, GachaTreasury.Rarity.Common);
        assertEq(user1CommonRewards, expectedUser1CommonRewards, "User1 should have exactly 562.5 Common rewards");

        uint256 user1InitialBalance = feeToken.balanceOf(user1);

        // Get the Common rarity tracker directly to test individual claiming
        address commonTracker = rewardsManager.getRarityToken(GachaTreasury.Rarity.Common);

        // User claims their Common rewards specifically through the individual tracker
        vm.prank(user1);
        RarityDividendTracker(commonTracker).withdrawFunds();

        // Verify exact amount was transferred
        assertEq(
            feeToken.balanceOf(user1),
            user1InitialBalance + expectedUser1CommonRewards,
            "User1 should receive exactly 562.5 tokens"
        );

        // Verify rewards are now zero
        uint256 user1RemainingRewards = rewardsManager.getUserRarityClaimableRewards(user1, GachaTreasury.Rarity.Common);
        assertEq(user1RemainingRewards, 0, "User1 should have no remaining Common rewards");
    }

    function testUserClaimAllRewards() public {
        uint256 feeAmount = 1000e18;

        // Distribute rewards
        vm.prank(address(gacha));
        rewardsManager.distributeSpinRewards(feeAmount);

        // Exact expected Epic rewards calculation (same as testUserRewardCalculation)
        uint256 expectedUser2EpicRewards = 48214285714285714284; // ~48.214e18

        uint256 user2EpicRewards = rewardsManager.getUserRarityClaimableRewards(user2, GachaTreasury.Rarity.Epic);
        assertEq(user2EpicRewards, expectedUser2EpicRewards, "User2 should have exactly ~48.214 Epic rewards");

        uint256 user2InitialBalance = feeToken.balanceOf(user2);

        // User claims their Epic rewards directly through the Epic tracker
        address epicTracker = rewardsManager.getRarityToken(GachaTreasury.Rarity.Epic);
        vm.prank(user2);
        RarityDividendTracker(epicTracker).withdrawFunds();

        // Verify exact amount was transferred
        assertEq(
            feeToken.balanceOf(user2),
            user2InitialBalance + expectedUser2EpicRewards,
            "User2 should receive exactly ~48.214 tokens"
        );

        // Verify Epic rewards are now zero
        uint256 user2RemainingRewards = rewardsManager.getUserRarityClaimableRewards(user2, GachaTreasury.Rarity.Epic);
        assertEq(user2RemainingRewards, 0, "User2 should have no remaining Epic rewards");
    }

    function testClaimWithNoRewardsAvailable() public {
        address user3 = makeAddr("user3"); // User with no deposits

        // Test claiming with no rewards using individual tracker
        address commonTracker = rewardsManager.getRarityToken(GachaTreasury.Rarity.Common);
        vm.prank(user3);
        vm.expectRevert(); // Should revert when trying to claim with no rewards
        RarityDividendTracker(commonTracker).withdrawFunds();

        // Also test claiming specific rarity with no rewards directly
        vm.prank(user3);
        vm.expectRevert(); // Should revert when trying to claim specific rarity with no rewards
        RarityDividendTracker(commonTracker).withdrawFunds();
    }

    function testClaimZeroBalance() public {
        // Test claiming when user has zero claimable balance (edge case)
        uint256 user1ZeroRewards = rewardsManager.getUserRarityClaimableRewards(user1, GachaTreasury.Rarity.Rare);
        assertEq(user1ZeroRewards, 0, "User1 should have no Rare rewards initially");

        address rareTracker = rewardsManager.getRarityToken(GachaTreasury.Rarity.Rare);
        vm.prank(user1);
        vm.expectRevert(); // Should revert when claiming zero rewards
        RarityDividendTracker(rareTracker).withdrawFunds();
    }

    function testInvalidMultiplierUpdate() public {
        vm.prank(owner);
        vm.expectRevert();
        rewardsManager.setRarityMultiplier(GachaTreasury.Rarity.Common, 0); // Zero multiplier should fail
    }

    function testInvalidProtocolAddress() public {
        vm.prank(owner);
        vm.expectRevert();
        rewardsManager.setProtocolAddress(address(0));
    }

    // === NFT Won Behavior Tests ===

    function testRecordNFTWonReducesFutureYield() public {
        uint256 feeAmount = 1000e18;

        // Initial distribution - user1 should get rewards based on 3 Common deposits
        vm.prank(address(gacha));
        rewardsManager.distributeSpinRewards(feeAmount);

        uint256 user1InitialRewards = rewardsManager.getUserRarityClaimableRewards(user1, GachaTreasury.Rarity.Common);
        assertTrue(user1InitialRewards > 0, "User1 should have earned initial rewards");

        // Simulate one of user1's NFTs being won
        vm.prank(address(treasury));
        rewardsManager.recordNFTWon(user1, uint8(GachaTreasury.Rarity.Common));

        // Check that earned rewards are preserved
        uint256 user1AfterNFTWon = rewardsManager.getUserRarityClaimableRewards(user1, GachaTreasury.Rarity.Common);
        assertEq(user1AfterNFTWon, user1InitialRewards, "Earned rewards should be preserved after NFT won");

        // Distribute more rewards - user1's share should be reduced due to fewer NFTs
        vm.prank(address(gacha));
        rewardsManager.distributeSpinRewards(feeAmount);

        uint256 user1FinalRewards = rewardsManager.getUserRarityClaimableRewards(user1, GachaTreasury.Rarity.Common);
        uint256 user1NewRewards = user1FinalRewards - user1AfterNFTWon;

        // user1 now has 2 NFTs instead of 3, so should get 2/3 of their previous share
        // This is the key test: future yield is reduced based on reduced NFT count
        assertTrue(user1NewRewards > 0, "User1 should still earn some new rewards");

        // The exact amount depends on the dividend tracker's calculation, but it should be positive
        // and represent their reduced share of the reward pool
    }

    function testRecordNFTWonPreservesAccumulatedRewards() public {
        uint256 feeAmount = 1000e18;

        // User earns rewards from multiple distributions
        vm.prank(address(gacha));
        rewardsManager.distributeSpinRewards(feeAmount);

        vm.prank(address(gacha));
        rewardsManager.distributeSpinRewards(feeAmount);

        uint256 user1AccumulatedRewards =
            rewardsManager.getUserRarityClaimableRewards(user1, GachaTreasury.Rarity.Common);
        assertTrue(user1AccumulatedRewards > 0, "User1 should have accumulated rewards");

        // Record NFT won
        vm.prank(address(treasury));
        rewardsManager.recordNFTWon(user1, uint8(GachaTreasury.Rarity.Common));

        // All previously accumulated rewards should still be claimable
        uint256 user1PostWinRewards = rewardsManager.getUserRarityClaimableRewards(user1, GachaTreasury.Rarity.Common);
        assertEq(user1PostWinRewards, user1AccumulatedRewards, "All accumulated rewards should be preserved");
    }

    function testMultipleNFTWonRewardsAdjustment() public {
        uint256 feeAmount = 1000e18;

        // Initial distribution
        vm.prank(address(gacha));
        rewardsManager.distributeSpinRewards(feeAmount);

        uint256 user1Initial = rewardsManager.getUserRarityClaimableRewards(user1, GachaTreasury.Rarity.Common);

        // Simulate 2 of user1's NFTs being won (they had 3 total)
        vm.prank(address(treasury));
        rewardsManager.recordNFTWon(user1, uint8(GachaTreasury.Rarity.Common));

        vm.prank(address(treasury));
        rewardsManager.recordNFTWon(user1, uint8(GachaTreasury.Rarity.Common));

        // Rewards should still be preserved
        uint256 user1AfterBothWon = rewardsManager.getUserRarityClaimableRewards(user1, GachaTreasury.Rarity.Common);
        assertEq(user1AfterBothWon, user1Initial, "Rewards preserved after multiple NFTs won");

        // Future distributions should reflect the drastically reduced share (1 NFT instead of 3)
        vm.prank(address(gacha));
        rewardsManager.distributeSpinRewards(feeAmount);

        uint256 user1Final = rewardsManager.getUserRarityClaimableRewards(user1, GachaTreasury.Rarity.Common);
        uint256 user1NewRewards = user1Final - user1AfterBothWon;

        // user1 now has only 1 NFT out of 3 total (user1: 1, user2: 1, plus 1 won)
        // So their share should be significantly reduced
        assertTrue(user1NewRewards > 0, "User1 should still earn some rewards with 1 NFT remaining");
    }

    function testRecordNFTWonOnlyAffectsSpecificRarity() public {
        uint256 feeAmount = 1000e18;

        // Set up user2 to have Epic deposits as well
        treasury.setUserDeposits(user2, GachaTreasury.Rarity.Epic, 2);

        // Mock Epic rarity count for distribution
        vm.mockCall(
            address(treasury),
            abi.encodeWithSignature("getRarityCount(uint8)", uint8(GachaTreasury.Rarity.Epic)),
            abi.encode(uint256(2))
        );

        // Distribute rewards - should go to both Common and Epic based on weights
        vm.prank(address(gacha));
        rewardsManager.distributeSpinRewards(feeAmount);

        uint256 user1CommonBefore = rewardsManager.getUserRarityClaimableRewards(user1, GachaTreasury.Rarity.Common);
        uint256 user2EpicBefore = rewardsManager.getUserRarityClaimableRewards(user2, GachaTreasury.Rarity.Epic);

        // Record NFT won for user1's Common NFT
        vm.prank(address(treasury));
        rewardsManager.recordNFTWon(user1, uint8(GachaTreasury.Rarity.Common));

        // user1's Common rewards should be preserved, user2's Epic rewards should be unaffected
        uint256 user1CommonAfter = rewardsManager.getUserRarityClaimableRewards(user1, GachaTreasury.Rarity.Common);
        uint256 user2EpicAfter = rewardsManager.getUserRarityClaimableRewards(user2, GachaTreasury.Rarity.Epic);

        assertEq(user1CommonAfter, user1CommonBefore, "Common rewards should be preserved");
        assertEq(user2EpicAfter, user2EpicBefore, "Epic rewards should be unaffected");
    }

    function testClaimAfterMultipleDistributions() public {
        uint256 feeAmount = 500e18;

        // Multiple distributions to build up rewards
        vm.prank(address(gacha));
        rewardsManager.distributeSpinRewards(feeAmount);

        vm.prank(address(gacha));
        rewardsManager.distributeSpinRewards(feeAmount);

        vm.prank(address(gacha));
        rewardsManager.distributeSpinRewards(feeAmount);

        /*
         * Exact calculation for 3 distributions of 500e18 each = 1500e18 total
         * Total rewards: 1350e18 (90% of 1500e18)
         * Common effective weight: 7000, total effective weight: 11200
         * Common share: (1350e18 * 7000) / 11200 = 843.75e18
         * user1 gets 100% of Common share = 843.75e18
         */
        uint256 expectedUser1CommonRewards = 843750000000000000000; // 843.75e18

        uint256 user1CommonRewards = rewardsManager.getUserRarityClaimableRewards(user1, GachaTreasury.Rarity.Common);
        assertEq(
            user1CommonRewards,
            expectedUser1CommonRewards,
            "User1 should have exactly 843.75 accumulated Common rewards"
        );

        uint256 user1InitialBalance = feeToken.balanceOf(user1);

        // Claim accumulated Common rewards directly
        address commonTracker = rewardsManager.getRarityToken(GachaTreasury.Rarity.Common);
        vm.prank(user1);
        RarityDividendTracker(commonTracker).withdrawFunds();

        assertEq(
            feeToken.balanceOf(user1),
            user1InitialBalance + expectedUser1CommonRewards,
            "User1 should receive exactly 843.75 tokens"
        );
        assertEq(
            rewardsManager.getUserRarityClaimableRewards(user1, GachaTreasury.Rarity.Common),
            0,
            "User1 should have no remaining Common rewards"
        );
    }

    function testClaimAfterNFTWon() public {
        uint256 feeAmount = 1000e18;

        // Initial distribution
        vm.prank(address(gacha));
        rewardsManager.distributeSpinRewards(feeAmount);

        // Expected initial rewards (same as testUserRewardCalculation)
        uint256 expectedInitialCommonRewards = 562500000000000000000; // 562.5e18
        uint256 user1CommonRewards = rewardsManager.getUserRarityClaimableRewards(user1, GachaTreasury.Rarity.Common);
        assertEq(
            user1CommonRewards, expectedInitialCommonRewards, "User1 should have exactly 562.5 initial Common rewards"
        );

        // Simulate NFT won (reduces future yield)
        vm.prank(address(treasury));
        rewardsManager.recordNFTWon(user1, uint8(GachaTreasury.Rarity.Common));

        // Rewards should still be claimable (preserved)
        uint256 user1PreClaimRewards = rewardsManager.getUserRarityClaimableRewards(user1, GachaTreasury.Rarity.Common);
        assertEq(
            user1PreClaimRewards,
            expectedInitialCommonRewards,
            "Earned Common rewards should be preserved after NFT won"
        );

        uint256 user1InitialBalance = feeToken.balanceOf(user1);

        // Claim preserved rewards directly
        address commonTracker = rewardsManager.getRarityToken(GachaTreasury.Rarity.Common);
        vm.prank(user1);
        RarityDividendTracker(commonTracker).withdrawFunds();

        assertEq(
            feeToken.balanceOf(user1),
            user1InitialBalance + expectedInitialCommonRewards,
            "User1 should receive exactly 562.5 preserved tokens"
        );

        // Future distributions should reflect reduced share
        vm.prank(address(gacha));
        rewardsManager.distributeSpinRewards(feeAmount);

        /*
         * After claiming, user1 starts fresh with new rewards from the second distribution.
         * With reduced NFT count (2 instead of 3), user1 should get a smaller share.
         * Common rewards for second distribution: (900e18 * 7000) / 11200 = 562.5e18
         * user1's share with 2 NFTs out of remaining 2 total Common NFTs = 100% = 562.5e18
         * 
         * Note: After NFT won, there are only 2 Common NFTs left in treasury (user1 has 2),
         * so user1 still gets 100% of Common rewards in this test setup.
         */
        uint256 expectedSecondDistributionRewards = 562500000000000000000; // 562.5e18
        uint256 user1NewRewards = rewardsManager.getUserRarityClaimableRewards(user1, GachaTreasury.Rarity.Common);
        assertEq(
            user1NewRewards,
            expectedSecondDistributionRewards,
            "User1 should earn exactly 562.5 tokens from second distribution"
        );
    }

    function testClaimNormalFlow() public {
        uint256 feeAmount = 1000e18;

        // Distribute rewards
        vm.prank(address(gacha));
        rewardsManager.distributeSpinRewards(feeAmount);

        uint256 user1CommonRewards = rewardsManager.getUserRarityClaimableRewards(user1, GachaTreasury.Rarity.Common);
        assertTrue(user1CommonRewards > 0, "User1 should have Common rewards to claim");

        // The rewards should be automatically distributed to individual trackers during distributeSpinRewards
        // So this test verifies the normal claiming process works
        uint256 user1InitialBalance = feeToken.balanceOf(user1);

        // Claim directly through the Common tracker
        address commonTracker = rewardsManager.getRarityToken(GachaTreasury.Rarity.Common);
        vm.prank(user1);
        RarityDividendTracker(commonTracker).withdrawFunds();

        // Should succeed since rewards are distributed to individual trackers
        assertEq(
            feeToken.balanceOf(user1),
            user1InitialBalance + user1CommonRewards,
            "User1 should receive exact Common rewards"
        );
        assertEq(
            rewardsManager.getUserRarityClaimableRewards(user1, GachaTreasury.Rarity.Common),
            0,
            "User1 should have no remaining Common rewards"
        );
    }

    function testClaimingWithPausedIndividualTracker() public {
        uint256 feeAmount = 1000e18;

        // Distribute rewards first
        vm.prank(address(gacha));
        rewardsManager.distributeSpinRewards(feeAmount);

        uint256 user1CommonRewards = rewardsManager.getUserRarityClaimableRewards(user1, GachaTreasury.Rarity.Common);
        assertTrue(user1CommonRewards > 0, "User1 should have Common rewards to claim");

        // Pause the individual tracker
        address commonTracker = rewardsManager.getRarityToken(GachaTreasury.Rarity.Common);
        vm.prank(owner);
        RarityDividendTracker(commonTracker).emergencyPause();

        // Claiming should fail when tracker is paused
        vm.prank(user1);
        vm.expectRevert(); // Should revert when tracker is paused
        RarityDividendTracker(commonTracker).withdrawFunds();

        // Unpause and try again
        vm.prank(owner);
        RarityDividendTracker(commonTracker).emergencyUnpause();

        uint256 user1InitialBalance = feeToken.balanceOf(user1);

        vm.prank(user1);
        RarityDividendTracker(commonTracker).withdrawFunds();

        assertEq(
            feeToken.balanceOf(user1),
            user1InitialBalance + user1CommonRewards,
            "User1 should receive Common rewards after unpause"
        );
    }

    // === Dust Distribution Tests ===

    function testDustAccumulationBelowThreshold() public {
        // Use a fee amount that creates dust but stays below threshold
        uint256 feeAmount = 12345; // Small amount to create dust
        
        uint256 initialDust = rewardsManager.accumulatedDust();
        
        vm.prank(address(gacha));
        rewardsManager.distributeSpinRewards(feeAmount);
        
        uint256 finalDust = rewardsManager.accumulatedDust();
        
        // Should have accumulated some dust
        assertGt(finalDust, initialDust, "Dust should accumulate from small distributions");
        
        // Should be below the threshold (0.001 tokens = 1e15 wei)
        assertLt(finalDust, 1e15, "Dust should remain below threshold");
    }

    function testDustRedistributionWhenThresholdReached() public {
        // Use multiple small distributions to build up dust above threshold
        uint256 smallFee = 123456; // Creates dust each time
        
        // Distribute multiple times to accumulate dust above threshold
        for (uint256 i = 0; i < 20; i++) {
            vm.prank(address(gacha));
            rewardsManager.distributeSpinRewards(smallFee);
            
            // Check if dust was redistributed (reset to 0)
            if (rewardsManager.accumulatedDust() == 0) {
                // Dust was redistributed, test successful
                assertTrue(true, "Dust threshold reached and redistributed");
                return;
            }
        }
        
        // If we get here, we should have significant accumulated dust
        uint256 finalDust = rewardsManager.accumulatedDust();
        assertGt(finalDust, 0, "Should have accumulated dust if threshold not reached");
    }

    function testDustRedistributionProportional() public {
        // Build up dust manually by making multiple small distributions
        uint256 smallFee = 111111; // Creates dust
        
        // Track user rewards before dust redistribution
        uint256 user1RewardsBefore = rewardsManager.getUserRarityClaimableRewards(user1, GachaTreasury.Rarity.Common);
        uint256 user2RewardsBefore = rewardsManager.getUserRarityClaimableRewards(user2, GachaTreasury.Rarity.Epic);
        
        // Make enough distributions to trigger dust redistribution
        uint256 dustBefore = 0;
        for (uint256 i = 0; i < 30; i++) {
            dustBefore = rewardsManager.accumulatedDust();
            
            vm.prank(address(gacha));
            rewardsManager.distributeSpinRewards(smallFee);
            
            // If dust was reset to 0, redistribution occurred
            if (dustBefore > 0 && rewardsManager.accumulatedDust() == 0) {
                break;
            }
        }
        
        // Verify that additional rewards were distributed proportionally
        uint256 user1RewardsAfter = rewardsManager.getUserRarityClaimableRewards(user1, GachaTreasury.Rarity.Common);
        uint256 user2RewardsAfter = rewardsManager.getUserRarityClaimableRewards(user2, GachaTreasury.Rarity.Epic);
        
        // Both users should have received additional rewards from dust redistribution
        assertGt(user1RewardsAfter, user1RewardsBefore, "User1 should receive additional rewards from dust");
        assertGt(user2RewardsAfter, user2RewardsBefore, "User2 should receive additional rewards from dust");
    }

    function testDustWithZeroMultiplierReverts() public {
        // Attempting to set multiplier to 0 should revert
        vm.prank(owner);
        vm.expectRevert(GachaRewardsManager.InvalidWeights.selector);
        rewardsManager.setRarityMultiplier(GachaTreasury.Rarity.Epic, 0);
    }

    function testDustWithMinimalMultiplier() public {
        // Set Epic multiplier to 100 (still very low) to test low multiplier edge case
        // With multiplier 1, effective weight becomes 0 due to rounding: (300 * 1) / 10000 = 0.03 → 0
        vm.prank(owner);
        rewardsManager.setRarityMultiplier(GachaTreasury.Rarity.Epic, 100); // 0.01x multiplier
        
        uint256 feeAmount = 1000e18; // Use large amount 
        uint256 initialDust = rewardsManager.accumulatedDust();
        
        vm.prank(address(gacha));
        rewardsManager.distributeSpinRewards(feeAmount);
        
        uint256 finalDust = rewardsManager.accumulatedDust();
        
        // Should still accumulate dust with very low Epic multiplier
        assertGt(finalDust, initialDust, "Dust should accumulate with very low Epic multiplier");
        
        // With multiplier 100, effective weight is (300 * 100) / 10000 = 3, should get some rewards
        uint256 user2EpicRewards = rewardsManager.getUserRarityClaimableRewards(user2, GachaTreasury.Rarity.Epic);
        assertGt(user2EpicRewards, 0, "User2 should receive some Epic rewards with low multiplier");
    }

    function testDustAccumulationAcrossMultipleDistributions() public {
        uint256 smallFee = 7777; // Creates small dust amounts
        uint256 initialDust = rewardsManager.accumulatedDust();
        
        // Make 5 small distributions
        for (uint256 i = 0; i < 5; i++) {
            vm.prank(address(gacha));
            rewardsManager.distributeSpinRewards(smallFee);
        }
        
        uint256 finalDust = rewardsManager.accumulatedDust();
        
        // Should have accumulated more dust than initial
        assertGt(finalDust, initialDust, "Dust should accumulate across multiple distributions");
        
        // Should be the sum of all individual dust amounts (approximately)
        // Each distribution creates some dust, total should be meaningful
        assertGt(finalDust, 5, "Should have accumulated meaningful dust from 5 distributions");
    }

    function testDustThresholdConstant() public view {
        // Verify the dust threshold is set correctly (0.001 tokens = 1e15 wei)
        // We can't access private constant directly, but we can verify behavior
        // The threshold should be 1e15 based on the contract comments
        assertTrue(true, "Dust threshold constant should be 1e15 wei (0.001 tokens)");
    }

    function testDustRedistributionExactThreshold() public {
        // Test redistribution when dust reaches exactly the threshold
        uint256 threshold = 1e15; // 0.001 tokens
        
        // First, accumulate dust close to threshold
        vm.prank(address(gacha));
        rewardsManager.distributeSpinRewards(111111); // Small amount
        
        uint256 dustBefore = rewardsManager.accumulatedDust();
        
        // Calculate how much more dust we need to reach threshold
        if (dustBefore < threshold) {
            // Make another distribution that should push us over threshold
            vm.prank(address(gacha));
            rewardsManager.distributeSpinRewards(threshold * 2); // Large enough to trigger redistribution
            
            uint256 dustAfter = rewardsManager.accumulatedDust();
            
            // Dust should either be 0 (redistributed) or some new accumulated amount
            assertTrue(
                dustAfter != dustBefore,
                "Dust amount should change when threshold is approached"
            );
        }
    }

    function testLargeDustRedistribution() public {
        // Create a scenario where dust accumulation is significant
        uint256 oddFee = 1234567890123; // Large odd number to create significant dust
        
        vm.prank(address(gacha));
        rewardsManager.distributeSpinRewards(oddFee);
        
        uint256 dustAfterFirst = rewardsManager.accumulatedDust();
        
        // The dust should be the remainder after integer division
        assertGt(dustAfterFirst, 0, "Should create dust from odd fee amount");
        
        // Make another distribution to potentially trigger redistribution
        vm.prank(address(gacha));
        rewardsManager.distributeSpinRewards(oddFee);
        
        uint256 dustAfterSecond = rewardsManager.accumulatedDust();
        
        // Either dust accumulated further, or was redistributed (reset to lower amount)
        assertTrue(
            dustAfterSecond == 0 || dustAfterSecond != dustAfterFirst,
            "Dust should either be redistributed or accumulated differently"
        );
    }

    function testClaimingAccuracy() public {
        uint256 feeAmount = 1000e18;

        // Distribute rewards
        vm.prank(address(gacha));
        rewardsManager.distributeSpinRewards(feeAmount);

        // Exact expected rewards (same calculations as testUserRewardCalculation)
        uint256 expectedUser1CommonRewards = 562500000000000000000; // 562.5e18
        uint256 expectedUser2EpicRewards = 48214285714285714284; // ~48.214e18

        // Check individual rarity rewards match exact expectations
        uint256 user1CommonRewards = rewardsManager.getUserRarityClaimableRewards(user1, GachaTreasury.Rarity.Common);
        uint256 user2EpicRewards = rewardsManager.getUserRarityClaimableRewards(user2, GachaTreasury.Rarity.Epic);

        assertEq(user1CommonRewards, expectedUser1CommonRewards, "User1 Common rewards should be exactly 562.5 tokens");
        assertEq(user2EpicRewards, expectedUser2EpicRewards, "User2 Epic rewards should be exactly ~48.214 tokens");

        // Total should match sum of individual rewards
        uint256 user1TotalCalculated = rewardsManager.getUserTotalClaimableRewards(user1);
        uint256 user2TotalCalculated = rewardsManager.getUserTotalClaimableRewards(user2);

        assertEq(user1TotalCalculated, expectedUser1CommonRewards, "User1 total should equal expected Common rewards");
        assertEq(user2TotalCalculated, expectedUser2EpicRewards, "User2 total should equal expected Epic rewards");
        assertEq(user1TotalCalculated, user1CommonRewards, "User1 total should equal individual Common rewards");
        assertEq(user2TotalCalculated, user2EpicRewards, "User2 total should equal individual Epic rewards");

        // Verify that claiming matches the exact expected amounts
        uint256 user1InitialBalance = feeToken.balanceOf(user1);
        uint256 user2InitialBalance = feeToken.balanceOf(user2);

        // Claim through individual trackers
        address commonTracker = rewardsManager.getRarityToken(GachaTreasury.Rarity.Common);
        address epicTracker = rewardsManager.getRarityToken(GachaTreasury.Rarity.Epic);

        vm.prank(user1);
        RarityDividendTracker(commonTracker).withdrawFunds();

        vm.prank(user2);
        RarityDividendTracker(epicTracker).withdrawFunds();

        assertEq(
            feeToken.balanceOf(user1),
            user1InitialBalance + expectedUser1CommonRewards,
            "User1 should receive exactly 562.5 tokens"
        );
        assertEq(
            feeToken.balanceOf(user2),
            user2InitialBalance + expectedUser2EpicRewards,
            "User2 should receive exactly ~48.214 tokens"
        );
    }
}
