// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Test, console2} from "forge-std/Test.sol";
import {GachaTreasury} from "../src/gacha/GachaTreasury.sol";
import {BaseERC721} from "../src/tokens/BaseERC721.sol";
import {MockNFTAppraisal} from "./mocks/MockNFTAppraisal.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";

/**
 * @title Gacha Treasury Economics Tests
 * @notice Tests the economic mechanics of NFT storage, rarity assignment, and distribution
 * @dev Focuses on value flows, rarity economics, and treasury management
 */
contract GachaTreasuryEconomicsTest is Test {
    GachaTreasury public treasury;
    BaseERC721 public collection;
    BaseERC721 public collection2;
    MockNFTAppraisal public mockAppraisal;

    address public owner = address(0x1);
    address public depositor = address(0x2);
    address public gacha = address(0x3);

    // Price tiers (USD values in 18 decimals) - updated to match new price ranges
    uint256 public constant COMMON_PRICE = 10e18; // $10 (within $0-$15 range)
    uint256 public constant UNCOMMON_PRICE = 50e18; // $50 (within $25-$60 range)
    uint256 public constant RARE_PRICE = 100e18; // $100 (within $70-$250 range)
    uint256 public constant EPIC_PRICE = 500e18; // $500 (within $300-$1200 range)
    uint256 public constant LEGENDARY_PRICE = 2000e18; // $2,000 (within $1500+ range)

    // Card IDs for testing
    bytes32 public constant CARD_COMMON = keccak256("CARD_COMMON");
    bytes32 public constant CARD_UNCOMMON = keccak256("CARD_UNCOMMON");
    bytes32 public constant CARD_RARE = keccak256("CARD_RARE");
    bytes32 public constant CARD_EPIC = keccak256("CARD_EPIC");
    bytes32 public constant CARD_LEGENDARY = keccak256("CARD_LEGENDARY");

    struct NFTValue {
        uint256 tokenId;
        uint256 price;
        GachaTreasury.Rarity rarity;
        address collection;
    }

    event CollectionWhitelisted(address indexed collection);
    event NFTDeposited(
        address indexed collection, uint256 indexed tokenId, address indexed depositor, GachaTreasury.Rarity rarity
    );
    event NFTWithdrawn(address indexed collection, uint256 indexed tokenId, address indexed withdrawer);

    function setUp() public {
        // Deploy collections
        vm.startPrank(owner);
        collection = new BaseERC721("Collection 1", "COL1", owner);
        collection2 = new BaseERC721("Collection 2", "COL2", owner);

        // Deploy mock appraisal
        mockAppraisal = new MockNFTAppraisal();

        // Deploy treasury
        GachaTreasury treasuryImpl = new GachaTreasury();
        uint256[5] memory minPrices = [uint256(0), 25 * 1e18, 70 * 1e18, 300 * 1e18, 1_500 * 1e18];
        uint256[5] memory maxPrices = [uint256(15 * 1e18), 60 * 1e18, 250 * 1e18, 1_200 * 1e18, type(uint256).max];
        bytes memory initData = abi.encodeWithSelector(
            GachaTreasury.initialize.selector, owner, gacha, address(mockAppraisal), minPrices, maxPrices
        );

        ERC1967Proxy proxy = new ERC1967Proxy(address(treasuryImpl), initData);
        treasury = GachaTreasury(address(proxy));

        // Whitelist collections
        treasury.addToWhitelist(address(collection));
        treasury.addToWhitelist(address(collection2));

        // Mint NFTs to depositor (mint enough for all tests)
        for (uint256 i = 0; i < 20; i++) {
            collection.mint(depositor);
            collection2.mint(depositor);
        }

        vm.stopPrank();
    }

    /**
     * @notice Test price-based rarity assignment economics
     */
    function testPriceBasedRarityEconomics() public {
        // Test NFTs across all price tiers
        NFTValue[] memory nfts = new NFTValue[](5);

        nfts[0] = NFTValue(0, COMMON_PRICE, GachaTreasury.Rarity.Common, address(collection));
        nfts[1] = NFTValue(1, UNCOMMON_PRICE, GachaTreasury.Rarity.Uncommon, address(collection));
        nfts[2] = NFTValue(2, RARE_PRICE, GachaTreasury.Rarity.Rare, address(collection));
        nfts[3] = NFTValue(3, EPIC_PRICE, GachaTreasury.Rarity.Epic, address(collection));
        nfts[4] = NFTValue(4, LEGENDARY_PRICE, GachaTreasury.Rarity.Legendary, address(collection));

        uint256 totalValueLocked = 0;

        for (uint256 i = 0; i < nfts.length; i++) {
            // Set appraisal
            mockAppraisal.setMockAppraisalWithCardId(
                nfts[i].collection, nfts[i].tokenId, keccak256(abi.encodePacked("CARD_", i)), nfts[i].price
            );

            // Deposit NFT
            vm.startPrank(depositor);
            collection.approve(address(treasury), nfts[i].tokenId);
            treasury.depositNFT(nfts[i].collection, nfts[i].tokenId);
            vm.stopPrank();

            totalValueLocked += nfts[i].price;

            // Verify rarity assignment
            assertEq(
                treasury.getRarityCount(nfts[i].rarity),
                1,
                string(abi.encodePacked("Should assign correct rarity for price ", nfts[i].price))
            );
        }

        // Verify total value tracking
        uint256 treasuryValue = _calculateTreasuryValue();
        assertEq(treasuryValue, totalValueLocked, "Should track total value locked");
    }

    /**
     * @notice Test rarity pool economics and expected value
     */
    function testRarityPoolEconomics() public {
        // Create balanced rarity pools
        uint256[] memory prices = new uint256[](10);
        prices[0] = COMMON_PRICE; // Common
        prices[1] = COMMON_PRICE; // Common
        prices[2] = UNCOMMON_PRICE; // Uncommon
        prices[3] = UNCOMMON_PRICE; // Uncommon
        prices[4] = RARE_PRICE; // Rare
        prices[5] = RARE_PRICE; // Rare
        prices[6] = EPIC_PRICE; // Epic
        prices[7] = EPIC_PRICE; // Epic
        prices[8] = LEGENDARY_PRICE; // Legendary
        prices[9] = LEGENDARY_PRICE; // Legendary

        // Deposit all NFTs
        for (uint256 i = 0; i < prices.length; i++) {
            bytes32 cardId = _getCardIdForPrice(prices[i]);
            mockAppraisal.setMockAppraisalWithCardId(address(collection), i, cardId, prices[i]);

            vm.startPrank(depositor);
            collection.approve(address(treasury), i);
            treasury.depositNFT(address(collection), i);
            vm.stopPrank();
        }

        // Verify pool sizes
        assertEq(treasury.getRarityCount(GachaTreasury.Rarity.Common), 2, "Should have 2 Common");
        assertEq(treasury.getRarityCount(GachaTreasury.Rarity.Uncommon), 2, "Should have 2 Uncommon");
        assertEq(treasury.getRarityCount(GachaTreasury.Rarity.Rare), 2, "Should have 2 Rare");
        assertEq(treasury.getRarityCount(GachaTreasury.Rarity.Epic), 2, "Should have 2 Epic");
        assertEq(treasury.getRarityCount(GachaTreasury.Rarity.Legendary), 2, "Should have 2 Legendary");

        // All NFTs deposited successfully with correct rarity assignments
        // The economic value is preserved through the price-based rarity system
    }

    /**
     * @notice Test cross-collection treasury economics
     */
    function testCrossCollectionEconomics() public {
        // Deposit same value NFTs from different collections
        uint256 samePrice = RARE_PRICE;
        uint256 tokenId1 = 0;
        uint256 tokenId2 = 0;

        // Set appraisals for both collections
        bytes32 cardId = CARD_RARE;
        mockAppraisal.setMockAppraisalWithCardId(address(collection), tokenId1, cardId, samePrice);
        mockAppraisal.setMockAppraisalWithCardId(address(collection2), tokenId2, cardId, samePrice);

        // Deposit from both collections
        vm.startPrank(depositor);
        collection.approve(address(treasury), tokenId1);
        treasury.depositNFT(address(collection), tokenId1);
        collection2.approve(address(treasury), tokenId2);
        treasury.depositNFT(address(collection2), tokenId2);
        vm.stopPrank();

        // Verify both are in same rarity pool
        assertEq(treasury.getRarityCount(GachaTreasury.Rarity.Rare), 2, "Both should be in Rare pool");

        // Verify total value
        uint256 expectedTotal = samePrice * 2;
        uint256 actualTotal = _calculateTreasuryValue();
        assertEq(actualTotal, expectedTotal, "Should track value across collections");

        // Test random selection works across collections
        vm.prank(gacha);
        GachaTreasury.NFTItem memory selected = treasury.sendRandomNFTToWinner(
            GachaTreasury.Rarity.Rare,
            12345, // Randomness
            address(0x999) // Winner
        );

        // Should select from either collection
        assertTrue(
            selected.collection == address(collection) || selected.collection == address(collection2),
            "Should select from any whitelisted collection"
        );
        assertEq(selected.appraisedPrice, samePrice, "Should have correct price");
    }

    /**
     * @notice Test value distribution and rarity balance
     */
    function testValueDistributionAndRarityBalance() public {
        // Create unbalanced distribution: many cheap, few expensive
        uint256[] memory nftCounts = new uint256[](5);
        uint256[] memory prices = new uint256[](5);

        // Many commons (high supply, low value)
        nftCounts[0] = 10;
        prices[0] = COMMON_PRICE;
        // Few uncommons
        nftCounts[1] = 5;
        prices[1] = UNCOMMON_PRICE;
        // Very few rares
        nftCounts[2] = 2;
        prices[2] = RARE_PRICE;
        // Single epic
        nftCounts[3] = 1;
        prices[3] = EPIC_PRICE;
        // Single legendary
        nftCounts[4] = 1;
        prices[4] = LEGENDARY_PRICE;

        uint256 totalValue = 0;
        uint256 currentTokenId = 0;

        for (uint256 rarity = 0; rarity < 5; rarity++) {
            for (uint256 i = 0; i < nftCounts[rarity]; i++) {
                bytes32 cardId = _getCardIdForPrice(prices[rarity]);
                mockAppraisal.setMockAppraisalWithCardId(address(collection), currentTokenId, cardId, prices[rarity]);

                vm.startPrank(depositor);
                collection.approve(address(treasury), currentTokenId);
                treasury.depositNFT(address(collection), currentTokenId);
                vm.stopPrank();

                totalValue += prices[rarity];
                currentTokenId++;
            }
        }

        // Verify rarity counts
        assertEq(treasury.getRarityCount(GachaTreasury.Rarity.Common), 10, "Should have 10 Common");
        assertEq(treasury.getRarityCount(GachaTreasury.Rarity.Uncommon), 5, "Should have 5 Uncommon");
        assertEq(treasury.getRarityCount(GachaTreasury.Rarity.Rare), 2, "Should have 2 Rare");
        assertEq(treasury.getRarityCount(GachaTreasury.Rarity.Epic), 1, "Should have 1 Epic");
        assertEq(treasury.getRarityCount(GachaTreasury.Rarity.Legendary), 1, "Should have 1 Legendary");

        // Value is concentrated in higher rarities due to price-based rarity assignment
        // Legendary represents disproportionate value despite being only 1/19 of NFTs
        // This is inherent to the price-based rarity system
    }

    /**
     * @notice Test deposit and withdrawal economic impact
     */
    function testDepositWithdrawalEconomics() public {
        uint256 tokenId = 0;
        uint256 price = EPIC_PRICE;

        // Set appraisal and deposit
        mockAppraisal.setMockAppraisalWithCardId(address(collection), tokenId, CARD_EPIC, price);

        uint256 valueBefore = _calculateTreasuryValue();
        uint256 epicCountBefore = treasury.getRarityCount(GachaTreasury.Rarity.Epic);

        vm.startPrank(depositor);
        collection.approve(address(treasury), tokenId);
        treasury.depositNFT(address(collection), tokenId);
        vm.stopPrank();

        uint256 valueAfter = _calculateTreasuryValue();
        uint256 epicCountAfter = treasury.getRarityCount(GachaTreasury.Rarity.Epic);

        assertEq(valueAfter - valueBefore, price, "Value should increase by deposited NFT price");
        assertEq(epicCountAfter - epicCountBefore, 1, "Epic count should increase by 1");

        // Withdraw NFT
        vm.startPrank(depositor);
        treasury.withdrawMyNFT(address(collection), tokenId);
        vm.stopPrank();

        uint256 valueAfterWithdraw = _calculateTreasuryValue();
        uint256 epicCountAfterWithdraw = treasury.getRarityCount(GachaTreasury.Rarity.Epic);

        assertEq(valueAfterWithdraw, valueBefore, "Value should return to original");
        assertEq(epicCountAfterWithdraw, epicCountBefore, "Epic count should return to original");
    }

    /**
     * @notice Test random selection economic fairness
     */
    function testRandomSelectionEconomicFairness() public {
        // Create multiple NFTs with same rarity to test fair selection
        uint256 numNFTs = 10;
        uint256 price = RARE_PRICE;
        bytes32 cardId = CARD_RARE;

        // Deposit multiple NFTs
        for (uint256 i = 0; i < numNFTs; i++) {
            mockAppraisal.setMockAppraisalWithCardId(address(collection), i, cardId, price);

            vm.startPrank(depositor);
            collection.approve(address(treasury), i);
            treasury.depositNFT(address(collection), i);
            vm.stopPrank();
        }

        // Test multiple random selections
        uint256[] memory selectedTokenIds = new uint256[](numNFTs);
        address winner = address(0x999);

        for (uint256 i = 0; i < numNFTs; i++) {
            vm.prank(gacha);
            GachaTreasury.NFTItem memory selected = treasury.sendRandomNFTToWinner(
                GachaTreasury.Rarity.Rare,
                i + 1000, // Different randomness each time
                winner
            );
            selectedTokenIds[i] = selected.tokenId;
        }

        // Verify selections are unique (due to swap-and-pop algorithm)
        for (uint256 i = 0; i < selectedTokenIds.length; i++) {
            for (uint256 j = i + 1; j < selectedTokenIds.length; j++) {
                assertTrue(selectedTokenIds[i] != selectedTokenIds[j], "Selections should be unique");
            }
        }

        // All should have same economic value
        for (uint256 i = 0; i < selectedTokenIds.length; i++) {
            assertTrue(selectedTokenIds[i] < numNFTs, "Should select from deposited NFTs");
        }
    }

    /**
     * @notice Test treasury capacity economics
     */
    function testTreasuryCapacityEconomics() public {
        // Fill treasury with high-value NFTs
        uint256 numLegendary = 5;
        uint256 legendaryPrice = LEGENDARY_PRICE;

        for (uint256 i = 0; i < numLegendary; i++) {
            mockAppraisal.setMockAppraisalWithCardId(address(collection), i, CARD_LEGENDARY, legendaryPrice);

            vm.startPrank(depositor);
            collection.approve(address(treasury), i);
            treasury.depositNFT(address(collection), i);
            vm.stopPrank();
        }

        uint256 totalValue = _calculateTreasuryValue();
        uint256 expectedValue = legendaryPrice * numLegendary;
        assertEq(totalValue, expectedValue, "Should track total legendary value");

        // Test that all legendary NFTs are available for selection
        for (uint256 i = 0; i < numLegendary; i++) {
            assertTrue(treasury.depositedNFTs(address(collection), i), "All legendary NFTs should be deposited");
        }

        // Test emptying the pool
        address winner = address(0x999);
        for (uint256 i = 0; i < numLegendary; i++) {
            vm.prank(gacha);
            treasury.sendRandomNFTToWinner(GachaTreasury.Rarity.Legendary, i + 1000, winner);
        }

        assertEq(treasury.getRarityCount(GachaTreasury.Rarity.Legendary), 0, "Legendary pool should be empty");
        assertEq(_calculateTreasuryValue(), 0, "Treasury value should be zero");
    }

    /**
     * @notice Test whitelist management economics
     */
    function testWhitelistManagementEconomics() public {
        address newCollection = address(0x123);
        BaseERC721 newNFT = new BaseERC721("New Collection", "NEW", owner);

        // Should not be able to deposit from non-whitelisted collection
        uint256 tokenId = 0;
        mockAppraisal.setMockAppraisalWithCardId(address(newNFT), tokenId, CARD_EPIC, EPIC_PRICE);

        vm.startPrank(owner);
        collection.mint(depositor); // Mint to depositor for approval test
        newNFT.mint(depositor);
        vm.stopPrank();

        vm.startPrank(depositor);
        newNFT.approve(address(treasury), tokenId);
        vm.expectRevert(); // Should fail - collection not whitelisted
        treasury.depositNFT(address(newNFT), tokenId);
        vm.stopPrank();

        // Whitelist the collection
        vm.prank(owner);
        treasury.addToWhitelist(address(newNFT));

        // Should now be able to deposit
        vm.startPrank(depositor);
        newNFT.approve(address(treasury), tokenId);
        treasury.depositNFT(address(newNFT), tokenId);
        vm.stopPrank();

        assertEq(
            treasury.getRarityCount(GachaTreasury.Rarity.Epic), 1, "Should accept deposit from whitelisted collection"
        );

        // Remove from whitelist
        vm.prank(owner);
        treasury.removeFromWhitelist(address(newNFT));

        // Should not be able to deposit more (but existing deposits remain)
        uint256 tokenId2 = 1;
        vm.startPrank(owner);
        newNFT.mint(depositor);
        vm.stopPrank();

        mockAppraisal.setMockAppraisalWithCardId(address(newNFT), tokenId2, CARD_RARE, RARE_PRICE);

        vm.startPrank(depositor);
        newNFT.approve(address(treasury), tokenId2);
        vm.expectRevert(); // Should fail - collection no longer whitelisted
        treasury.depositNFT(address(newNFT), tokenId2);
        vm.stopPrank();

        // Existing NFT should still be there
        assertEq(treasury.getRarityCount(GachaTreasury.Rarity.Epic), 1, "Existing deposits should remain");
    }

    // Helper functions

    function _calculateTreasuryValue() internal view returns (uint256) {
        uint256 totalValue = 0;

        for (uint256 rarity = 0; rarity < 5; rarity++) {
            GachaTreasury.NFTItem[] memory items = treasury.getTreasuryItems(GachaTreasury.Rarity(rarity));
            for (uint256 i = 0; i < items.length; i++) {
                totalValue += items[i].appraisedPrice;
            }
        }

        return totalValue;
    }

    function _getCardIdForPrice(uint256 price) internal pure returns (bytes32) {
        if (price <= 15e18) return CARD_COMMON;     // $0-$15
        if (price <= 60e18) return CARD_UNCOMMON;    // $25-$60
        if (price <= 250e18) return CARD_RARE;       // $70-$250
        if (price <= 1200e18) return CARD_EPIC;     // $300-$1,200
        return CARD_LEGENDARY;                     // $1,500+
    }
}
