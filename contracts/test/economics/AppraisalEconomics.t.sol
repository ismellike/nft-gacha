// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Test} from "forge-std/Test.sol";
import {NFTAppraisal} from "../../src/appraisal/NFTAppraisal.sol";
import {GachaTreasury} from "../../src/gacha/GachaTreasury.sol";
import {BaseERC20} from "../../src/tokens/BaseERC20.sol";
import {BaseERC721} from "../../src/tokens/BaseERC721.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

/**
 * @title NFT Appraisal Economics Tests
 * @notice Tests the economic impact of NFT appraisals on the gacha system
 * @dev Focuses on price discovery, rarity assignment, and economic flows
 *
 * Migrated from: test/NFTAppraisalEconomicsTest.t.sol
 *
 * @author NFT Gacha Team
 */
contract AppraisalEconomicsTest is Test {
    NFTAppraisal public appraisal;
    GachaTreasury public treasury;
    BaseERC20 public usdc;
    BaseERC721 public collection;

    address public owner = address(0x1);
    address public oracle = address(0x2);
    address public user = address(0x3);
    address public protocol = address(0x4);

    // Economic constants
    uint256 public constant APPRAISAL_FEE = 10e18;
    uint256 public constant INITIAL_BALANCE = 1000e18;

    // Price tiers (USD values in 18 decimals)
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

    function setUp() public {
        // Deploy tokens
        usdc = new BaseERC20("USDC", "USDC", owner);
        collection = new BaseERC721("Test Collection", "TEST", owner);

        // Fund user
        vm.startPrank(owner);
        usdc.mint(user, INITIAL_BALANCE);
        collection.mint(user); // tokenId 0
        collection.mint(user); // tokenId 1
        collection.mint(user); // tokenId 2
        collection.mint(user); // tokenId 3
        collection.mint(user); // tokenId 4
        vm.stopPrank();

        // Deploy appraisal contract
        _deployAppraisalContract();

        // Deploy treasury
        _deployTreasuryContract();

        // Setup approvals
        vm.prank(user);
        usdc.approve(address(appraisal), type(uint256).max);
    }

    function _deployAppraisalContract() internal {
        vm.startPrank(owner);
        NFTAppraisal appraisalImpl = new NFTAppraisal();

        bytes memory initData =
            abi.encodeWithSelector(NFTAppraisal.initialize.selector, owner, address(usdc), APPRAISAL_FEE, protocol);

        ERC1967Proxy proxy = new ERC1967Proxy(address(appraisalImpl), initData);
        appraisal = NFTAppraisal(address(proxy));

        // Set oracle
        appraisal.setServiceHandler(oracle);
        vm.stopPrank();
    }

    function _deployTreasuryContract() internal {
        vm.startPrank(owner);
        GachaTreasury treasuryImpl = new GachaTreasury();
        uint256 PRICE_STEP = 1e16;
        uint256[] memory minPrices = new uint256[](5);
        minPrices[0] = 0;
        minPrices[1] = uint256(15 * 1e18) + PRICE_STEP;
        minPrices[2] = uint256(60 * 1e18) + PRICE_STEP;
        minPrices[3] = uint256(250 * 1e18) + PRICE_STEP;
        minPrices[4] = uint256(1_200 * 1e18) + PRICE_STEP;

        uint256[] memory maxPrices = new uint256[](5);
        maxPrices[0] = uint256(15 * 1e18);
        maxPrices[1] = uint256(60 * 1e18);
        maxPrices[2] = uint256(250 * 1e18);
        maxPrices[3] = uint256(1_200 * 1e18);
        maxPrices[4] = type(uint256).max;

        string[] memory rarityNames = new string[](5);
        rarityNames[0] = "Common";
        rarityNames[1] = "Uncommon";
        rarityNames[2] = "Rare";
        rarityNames[3] = "Epic";
        rarityNames[4] = "Legendary";

        bytes memory initData = abi.encodeWithSelector(
            GachaTreasury.initialize.selector, owner, address(this), address(appraisal), uint8(5), rarityNames, minPrices, maxPrices
        );

        ERC1967Proxy proxy = new ERC1967Proxy(address(treasuryImpl), initData);
        treasury = GachaTreasury(address(proxy));

        // Whitelist collection
        treasury.addToWhitelist(address(collection));
        vm.stopPrank();
    }

    // ========================================================================
    // FEE ECONOMICS TESTS
    // ========================================================================

    /**
     * @notice Test appraisal fee collection and protocol revenue
     */
    function testAppraisalFeeEconomics() public {
        uint256 protocolBalanceBefore = usdc.balanceOf(protocol);
        uint256 userBalanceBefore = usdc.balanceOf(user);

        // Request appraisal
        vm.prank(user);
        appraisal.requestAppraisal(address(collection), 0);

        // Check fee collection
        assertEq(
            usdc.balanceOf(protocol), protocolBalanceBefore + APPRAISAL_FEE, "Protocol should receive appraisal fee"
        );
        assertEq(usdc.balanceOf(user), userBalanceBefore - APPRAISAL_FEE, "User should pay appraisal fee");

        // Verify appraisal status
        NFTAppraisal.Appraisal memory appraisalInfo = appraisal.getAppraisal(address(collection), 0);
        assertEq(appraisalInfo.requester, user, "Should track requester");
        assertEq(uint256(appraisalInfo.status), uint256(NFTAppraisal.AppraisalStatus.Pending), "Should be pending");
    }

    /**
     * @notice Test appraisal fee economics with different fee structures
     */
    function testVariableAppraisalFees() public {
        uint256 newFee = APPRAISAL_FEE * 2; // Double the fee
        uint256 protocolBalanceBefore = usdc.balanceOf(protocol);
        uint256 userBalanceBefore = usdc.balanceOf(user);

        // Update fee
        vm.prank(owner);
        appraisal.setAppraisalFee(newFee);

        // Request appraisal with new fee
        vm.prank(user);
        appraisal.requestAppraisal(address(collection), 0);

        // Check new fee collection
        assertEq(usdc.balanceOf(protocol), protocolBalanceBefore + newFee, "Protocol should receive increased fee");
        assertEq(usdc.balanceOf(user), userBalanceBefore - newFee, "User should pay increased fee");
    }

    // ========================================================================
    // PRICE DISCOVERY TESTS
    // ========================================================================

    /**
     * @notice Test price discovery and rarity assignment
     */
    function testPriceDiscoveryAndRarityAssignment() public {
        uint256 tokenId = 0;
        bytes32 cardId = CARD_COMMON;

        // Request appraisal
        vm.prank(user);
        appraisal.requestAppraisal(address(collection), tokenId);

        // Oracle sets price
        vm.prank(oracle);
        appraisal.setAppraisalForTokenWithCard(address(collection), tokenId, cardId, COMMON_PRICE);

        // Verify appraisal
        (uint256 price, NFTAppraisal.AppraisalStatus status) = appraisal.getAppraisedPrice(address(collection), tokenId);
        assertEq(price, COMMON_PRICE, "Should store correct price");
        assertEq(uint256(status), uint256(NFTAppraisal.AppraisalStatus.Completed), "Should be completed");

        // Test rarity assignment in treasury
        vm.startPrank(user);
        collection.approve(address(treasury), tokenId);
        treasury.depositNFT(address(collection), tokenId);
        vm.stopPrank();

        assertEq(
            treasury.getRarityCount(0), 1, "Should be assigned Common rarity based on price"
        );
    }

    /**
     * @notice Test price-based rarity boundary conditions
     */
    function testRarityBoundaryConditions() public {
        // Test exact boundary prices
        uint256[] memory boundaryPrices = new uint256[](5);
        uint8[] memory expectedRarities = new uint8[](5);

        // Common: $0-$15
        boundaryPrices[0] = 10e18;
        expectedRarities[0] = 0;

        // Uncommon: $25-$60
        boundaryPrices[1] = 25e18;
        expectedRarities[1] = 1;

        // Rare: $70-$250
        boundaryPrices[2] = 70e18;
        expectedRarities[2] = 2;

        // Epic: $300-$1200
        boundaryPrices[3] = 300e18;
        expectedRarities[3] = 3;

        // Legendary: $1500+
        boundaryPrices[4] = 1500e18;
        expectedRarities[4] = 4;

        for (uint256 i = 0; i < 5; i++) {
            uint256 tokenId = i;

            // Request and complete appraisal
            vm.prank(user);
            appraisal.requestAppraisal(address(collection), tokenId);

            bytes32 cardId = keccak256(abi.encodePacked("CARD_", i));
            vm.prank(oracle);
            appraisal.setAppraisalForTokenWithCard(address(collection), tokenId, cardId, boundaryPrices[i]);

            // Deposit and check rarity
            vm.startPrank(user);
            collection.approve(address(treasury), tokenId);
            treasury.depositNFT(address(collection), tokenId);
            vm.stopPrank();

            assertEq(
                treasury.getRarityCount(expectedRarities[i]),
                1,
                string(abi.encodePacked("Should assign correct rarity for boundary price ", boundaryPrices[i]))
            );
        }
    }

    /**
     * @notice Test card-based pricing consistency
     */
    function testCardBasedPricingConsistency() public {
        bytes32 cardId = CARD_RARE;
        uint256 price = RARE_PRICE;

        // Multiple tokens with same card should have same price
        uint256[] memory tokenIds = new uint256[](3);
        tokenIds[0] = 0;
        tokenIds[1] = 1;
        tokenIds[2] = 2;

        for (uint256 i = 0; i < 3; i++) {
            // Request appraisal
            vm.prank(user);
            appraisal.requestAppraisal(address(collection), tokenIds[i]);

            // Set price with same card
            vm.prank(oracle);
            appraisal.setAppraisalForTokenWithCard(address(collection), tokenIds[i], cardId, price);

            // Verify price consistency
            (uint256 tokenPrice,) = appraisal.getAppraisedPrice(address(collection), tokenIds[i]);
            assertEq(tokenPrice, price, "Same card should have same price");
        }
    }

    // ========================================================================
    // PRICE UPDATE TESTS
    // ========================================================================

    /**
     * @notice Test price updates and economic impact
     */
    function testPriceUpdatesAndEconomicImpact() public {
        uint256 tokenId = 0;
        bytes32 cardId = CARD_EPIC;
        uint256 initialPrice = EPIC_PRICE;
        uint256 updatedPrice = LEGENDARY_PRICE;

        // Initial appraisal
        vm.prank(user);
        appraisal.requestAppraisal(address(collection), tokenId);

        vm.prank(oracle);
        appraisal.setAppraisalForTokenWithCard(address(collection), tokenId, cardId, initialPrice);

        // Deposit NFT
        vm.startPrank(user);
        collection.approve(address(treasury), tokenId);
        treasury.depositNFT(address(collection), tokenId);
        vm.stopPrank();

        // Verify initial rarity
        assertEq(treasury.getRarityCount(3), 1, "Initial rarity should be Epic");

        // Price update through re-appraisal
        vm.prank(user);
        appraisal.requestAppraisal(address(collection), tokenId);

        vm.prank(oracle);
        appraisal.setAppraisalForTokenWithCard(address(collection), tokenId, cardId, updatedPrice);

        // Withdraw and re-deposit to test rarity update
        vm.startPrank(user);
        treasury.withdrawMyNFT(address(collection), tokenId);
        collection.approve(address(treasury), tokenId);
        treasury.depositNFT(address(collection), tokenId);
        vm.stopPrank();

        // Should now be Legendary
        assertEq(treasury.getRarityCount(3), 0, "Should no longer be Epic");
        assertEq(treasury.getRarityCount(4), 1, "Should now be Legendary");
    }

    /**
     * @notice Test owner override and economic implications
     */
    function testOwnerOverrideEconomics() public {
        uint256 tokenId = 0;
        bytes32 cardId = CARD_COMMON;
        uint256 oraclePrice = COMMON_PRICE;
        uint256 ownerPrice = LEGENDARY_PRICE;

        // Oracle appraisal
        vm.prank(user);
        appraisal.requestAppraisal(address(collection), tokenId);

        vm.prank(oracle);
        appraisal.setAppraisalForTokenWithCard(address(collection), tokenId, cardId, oraclePrice);

        // Verify oracle price
        (uint256 price,) = appraisal.getAppraisedPrice(address(collection), tokenId);
        assertEq(price, oraclePrice, "Should initially have oracle price");

        // Owner override
        vm.prank(owner);
        appraisal.ownerSetAppraisalForTokenWithCard(address(collection), tokenId, cardId, ownerPrice);

        // Verify override
        NFTAppraisal.Appraisal memory appraisalInfo = appraisal.getAppraisal(address(collection), tokenId);
        price = appraisalInfo.priceUSD;
        NFTAppraisal.AppraisalStatus status = appraisalInfo.status;
        assertEq(price, ownerPrice, "Should have owner override price");
        assertEq(uint256(status), uint256(NFTAppraisal.AppraisalStatus.OwnerOverride), "Should be owner override status");

        // Test economic impact in treasury
        vm.startPrank(user);
        collection.approve(address(treasury), tokenId);
        treasury.depositNFT(address(collection), tokenId);
        vm.stopPrank();

        assertEq(
            treasury.getRarityCount(4),
            1,
            "Should be Legendary based on owner override price"
        );
    }

    // ========================================================================
    // BATCH ECONOMICS TESTS
    // ========================================================================

    /**
     * @notice Test batch appraisal economics
     */
    function testBatchAppraisalEconomics() public {
        uint256 numAppraisals = 5;
        uint256 totalFees = numAppraisals * APPRAISAL_FEE;

        uint256 protocolBalanceBefore = usdc.balanceOf(protocol);
        uint256 userBalanceBefore = usdc.balanceOf(user);

        // Request multiple appraisals
        for (uint256 i = 0; i < numAppraisals; i++) {
            vm.prank(user);
            appraisal.requestAppraisal(address(collection), i);
        }

        // Check fee collection
        assertEq(
            usdc.balanceOf(protocol), protocolBalanceBefore + totalFees, "Protocol should receive all appraisal fees"
        );
        assertEq(usdc.balanceOf(user), userBalanceBefore - totalFees, "User should pay all appraisal fees");

        // Complete all appraisals with different prices
        uint256[] memory prices = new uint256[](numAppraisals);
        prices[0] = COMMON_PRICE;
        prices[1] = UNCOMMON_PRICE;
        prices[2] = RARE_PRICE;
        prices[3] = EPIC_PRICE;
        prices[4] = LEGENDARY_PRICE;

        for (uint256 i = 0; i < numAppraisals; i++) {
            bytes32 cardId = keccak256(abi.encodePacked("CARD_", i));
            vm.prank(oracle);
            appraisal.setAppraisalForTokenWithCard(address(collection), i, cardId, prices[i]);
        }

        // Deposit all NFTs and verify rarity distribution
        vm.startPrank(user);
        for (uint256 i = 0; i < numAppraisals; i++) {
            collection.approve(address(treasury), i);
            treasury.depositNFT(address(collection), i);
        }
        vm.stopPrank();

        // Verify one NFT in each rarity tier
        assertEq(treasury.getRarityCount(0), 1, "Should have 1 Common");
        assertEq(treasury.getRarityCount(1), 1, "Should have 1 Uncommon");
        assertEq(treasury.getRarityCount(2), 1, "Should have 1 Rare");
        assertEq(treasury.getRarityCount(3), 1, "Should have 1 Epic");
        assertEq(treasury.getRarityCount(4), 1, "Should have 1 Legendary");
    }

    // ========================================================================
    // SPECIAL SCENARIOS
    // ========================================================================

    /**
     * @notice Test incomplete appraisal economic impact
     */
    function testIncompleteAppraisalEconomics() public {
        uint256 tokenId = 0;

        // Request appraisal
        vm.prank(user);
        appraisal.requestAppraisal(address(collection), tokenId);

        // Check that appraisal is pending but no value created yet
        NFTAppraisal.Appraisal memory appraisalInfo = appraisal.getAppraisal(address(collection), tokenId);
        assertEq(uint256(appraisalInfo.status), uint256(NFTAppraisal.AppraisalStatus.Pending), "Should be pending");
        assertEq(appraisalInfo.priceUSD, 0, "Should have no price yet");

        // Should not be able to deposit without completed appraisal
        vm.startPrank(user);
        collection.approve(address(treasury), tokenId);
        vm.expectRevert(); // Should fail due to missing appraisal
        treasury.depositNFT(address(collection), tokenId);
        vm.stopPrank();

        // Complete appraisal
        vm.prank(oracle);
        appraisal.setAppraisalForTokenWithCard(address(collection), tokenId, CARD_COMMON, COMMON_PRICE);

        // Should now be able to deposit
        vm.startPrank(user);
        treasury.depositNFT(address(collection), tokenId);
        vm.stopPrank();

        assertEq(treasury.getRarityCount(0), 1, "Should be able to deposit after appraisal");
    }

    /**
     * @notice Test cross-collection appraisal economics
     */
    function testCrossCollectionAppraisalEconomics() public {
        // Deploy second collection
        BaseERC721 collection2 = new BaseERC721("Collection 2", "TEST2", owner);
        vm.startPrank(owner);
        collection2.mint(user); // tokenId 0
        collection2.mint(user); // tokenId 1
        treasury.addToWhitelist(address(collection2));
        vm.stopPrank();

        // Same card should have same price across collections
        bytes32 sharedCardId = CARD_RARE;
        uint256 sharedPrice = RARE_PRICE;

        // Appraise in both collections
        uint256 tokenId1 = 0;
        uint256 tokenId2 = 0;

        // First collection
        vm.prank(user);
        appraisal.requestAppraisal(address(collection), tokenId1);
        vm.prank(oracle);
        appraisal.setAppraisalForTokenWithCard(address(collection), tokenId1, sharedCardId, sharedPrice);

        // Second collection
        vm.prank(user);
        appraisal.requestAppraisal(address(collection2), tokenId2);
        vm.prank(oracle);
        appraisal.setAppraisalForTokenWithCard(address(collection2), tokenId2, sharedCardId, sharedPrice);

        // Verify consistent pricing
        (uint256 price1,) = appraisal.getAppraisedPrice(address(collection), tokenId1);
        (uint256 price2,) = appraisal.getAppraisedPrice(address(collection2), tokenId2);
        assertEq(price1, price2, "Same card should have same price across collections");

        // Both should deposit as same rarity
        vm.startPrank(user);
        collection.approve(address(treasury), tokenId1);
        treasury.depositNFT(address(collection), tokenId1);
        collection2.approve(address(treasury), tokenId2);
        treasury.depositNFT(address(collection2), tokenId2);
        vm.stopPrank();

        assertEq(treasury.getRarityCount(2), 2, "Both should be Rare");
    }
}
