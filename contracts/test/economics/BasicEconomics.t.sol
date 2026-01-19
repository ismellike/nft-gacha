// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Test, console2} from "forge-std/Test.sol";
import {BaseERC20} from "../../src/tokens/BaseERC20.sol";
import {BaseERC721} from "../../src/tokens/BaseERC721.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";

/**
 * @title Basic Economics
 * @notice Simple tests to verify economic logic without complex dependencies
 */
contract BasicEconomics is Test {
    BaseERC20 public usdc;
    BaseERC721 public nft;

    address public owner = address(0x1);
    address public user1 = address(0x2);
    address public user2 = address(0x3);

    // Economic constants
    uint256 public constant SPIN_FEE = 10 * 1e6; // $10 USDC (6 decimals)
    uint256 public constant REWARD_SHARE = 7000; // 70%
    uint256 public constant TOTAL_SHARE = 10000; // 100%

    // Price tiers (USD values in 18 decimals)
    uint256 public constant COMMON_PRICE = 50e18; // $50
    uint256 public constant UNCOMMON_PRICE = 250e18; // $250
    uint256 public constant RARE_PRICE = 1000e18; // $1,000

    function setUp() public {
        // Deploy tokens
        vm.startPrank(owner);
        usdc = new BaseERC20("USDC", "USDC", owner);
        nft = new BaseERC721("Test NFT", "TNFT", owner);

        // Fund users
        usdc.mint(user1, 1000 * 1e6); // $1,000
        usdc.mint(user2, 1000 * 1e6); // $1,000

        // Mint NFTs
        nft.mint(user1); // tokenId 0
        nft.mint(user1); // tokenId 1
        nft.mint(user2); // tokenId 2
        nft.mint(user2); // tokenId 3
        vm.stopPrank();
    }

    /**
     * @notice Test basic fee calculation logic
     */
    function testFeeCalculation() public {
        uint256 totalRevenue = SPIN_FEE;
        uint256 expectedReward = Math.mulDiv(totalRevenue, REWARD_SHARE, TOTAL_SHARE);
        uint256 expectedRemainder = totalRevenue - expectedReward;

        console2.log("Total Revenue:", totalRevenue);
        console2.log("Expected Reward (70%):", expectedReward);
        console2.log("Expected Remainder (30%):", expectedRemainder);

        assertEq(expectedReward, 7 * 1e6, "70% of $10 should be $7");
        assertEq(expectedRemainder, 3 * 1e6, "30% of $10 should be $3");
        assertEq(expectedReward + expectedRemainder, totalRevenue, "Reward + remainder should equal total");
    }

    /**
     * @notice Test price-to-rarity conversion logic
     */
    function testPriceToRarityLogic() public {
        // Test price boundaries
        assertEq(_getRarityFromPrice(COMMON_PRICE), 0, "$50 should be Common (0)");
        assertEq(_getRarityFromPrice(UNCOMMON_PRICE), 1, "$250 should be Uncommon (1)");
        assertEq(_getRarityFromPrice(RARE_PRICE), 2, "$1,000 should be Rare (2)");

        // Test edge cases
        assertEq(_getRarityFromPrice(99e18), 0, "$99 should be Common");
        assertEq(_getRarityFromPrice(100e18), 1, "$100 should be Uncommon");
        assertEq(_getRarityFromPrice(500e18), 2, "$500 should be Rare");
    }

    /**
     * @notice Test reward distribution mathematics
     */
    function testRewardDistributionMath() public {
        // Multiple users with different contribution levels
        uint256 user1Shares = 100e18; // $100 contribution
        uint256 user2Shares = 300e18; // $300 contribution
        uint256 totalShares = user1Shares + user2Shares; // $400 total

        uint256 totalReward = SPIN_FEE * 10; // $100 total reward

        uint256 user1Expected = Math.mulDiv(totalReward, user1Shares, totalShares);
        uint256 user2Expected = Math.mulDiv(totalReward, user2Shares, totalShares);

        console2.log("User1 Shares:", user1Shares);
        console2.log("User2 Shares:", user2Shares);
        console2.log("Total Reward:", totalReward);
        console2.log("User1 Expected (25%):", user1Expected);
        console2.log("User2 Expected (75%):", user2Expected);

        assertEq(user1Expected, 25 * 1e6, "User1 should get 25% of reward");
        assertEq(user2Expected, 75 * 1e6, "User2 should get 75% of reward");
        assertEq(user1Expected + user2Expected, totalReward, "Rewards should sum to total");
    }

    /**
     * @notice Test gas usage patterns
     */
    function testGasUsagePatterns() public {
        uint256 startGas = gasleft();

        // Simulate reward calculation
        uint256 revenue = SPIN_FEE;
        for (uint256 i = 0; i < 100; i++) {
            uint256 reward = Math.mulDiv(revenue, REWARD_SHARE, TOTAL_SHARE);
            reward += i; // Simple operation
        }

        uint256 endGas = gasleft();
        uint256 gasUsed = startGas - endGas;

        console2.log("Gas used for 100 reward calculations:", gasUsed);
        assertTrue(gasUsed < 1000000, "Gas usage should be reasonable");
    }

    /**
     * @notice Test boundary conditions
     */
    function testBoundaryConditions() public {
        // Test zero values
        assertEq(Math.mulDiv(0, REWARD_SHARE, TOTAL_SHARE), 0, "Zero revenue should give zero reward");

        // Test maximum values
        uint256 maxRevenue = type(uint256).max / 2;
        uint256 maxReward = Math.mulDiv(maxRevenue, REWARD_SHARE, TOTAL_SHARE);
        assertTrue(maxReward > 0, "Large revenue should give large reward");

        // Test precision
        uint256 smallAmount = 1; // 1 wei
        uint256 smallReward = Math.mulDiv(smallAmount, REWARD_SHARE, TOTAL_SHARE);
        assertEq(smallReward, 0, "Very small amounts may round to zero due to precision");
    }

    /**
     * @notice Test redemption calculation logic
     */
    function testRedemptionCalculation() public {
        uint256 appraisalPrice = RARE_PRICE; // $1,000 in 18 decimals
        uint256 payoutPercentage = 8_000; // 80%

        // Convert appraisal price to USDC (18 decimals to 6 decimals)
        uint256 appraisalUSDc = appraisalPrice / 1e12;

        // Calculate 80% payout
        uint256 expectedPayout = Math.mulDiv(appraisalUSDc, payoutPercentage, 10000);

        console2.log("Appraisal Price (USD):", appraisalPrice);
        console2.log("Appraisal Price (USDC):", appraisalUSDc);
        console2.log("Expected Payout (80%):", expectedPayout);

        assertEq(expectedPayout, 800 * 1e6, "$1,000 at 80% should be $800 USDC");
    }

    /**
     * @notice Test multi-user economics
     */
    function testMultiUserEconomics() public {
        uint256 numUsers = 5;
        uint256 totalRevenue = SPIN_FEE * numUsers;

        // Calculate expected rewards for different contribution levels
        uint256[] memory contributions = new uint256[](numUsers);
        contributions[0] = 50e18; // $50
        contributions[1] = 100e18; // $100
        contributions[2] = 150e18; // $150
        contributions[3] = 200e18; // $200
        contributions[4] = 250e18; // $250

        uint256 totalContributions = 0;
        for (uint256 i = 0; i < numUsers; i++) {
            totalContributions += contributions[i];
        }

        uint256[] memory expectedRewards = new uint256[](numUsers);
        for (uint256 i = 0; i < numUsers; i++) {
            expectedRewards[i] = Math.mulDiv(totalRevenue, contributions[i], totalContributions);
        }

        // Verify proportional distribution
        for (uint256 i = 0; i < numUsers - 1; i++) {
            assertTrue(
                expectedRewards[i] < expectedRewards[i + 1], "Higher contribution should result in higher reward"
            );
        }

        // Verify total rewards equal total revenue
        uint256 totalRewards = 0;
        for (uint256 i = 0; i < numUsers; i++) {
            totalRewards += expectedRewards[i];
        }
        assertApproxEqAbs(
            totalRewards, totalRevenue, 2, "Total rewards should equal total revenue within rounding tolerance"
        );
    }

    // Helper functions

    function _getRarityFromPrice(uint256 price) internal pure returns (uint256) {
        if (price < 100e18) return 0; // Common: $0-$100
        if (price < 500e18) return 1; // Uncommon: $100-$500
        if (price < 2000e18) return 2; // Rare: $500-$2000
        if (price < 10000e18) return 3; // Epic: $2000-$10000
        return 4; // Legendary: $10000+
    }
}
