// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {StandardTest} from "../../helpers/StandardTest.sol";
import {TestConstants} from "../../helpers/TestConstants.sol";
import {GachaTreasury} from "../../../src/gacha/GachaTreasury.sol";
import {BaseERC721} from "../../../src/tokens/BaseERC721.sol";
import {MockNFTAppraisal} from "../../mocks/MockNFTAppraisal.sol";

/**
 * @title Gacha Treasury Contract Test Suite
 * @notice Comprehensive test suite for Gacha treasury functionality
 * @dev Tests NFT storage, rarity assignment, whitelist management, and distribution
 *
 * Consolidated from:
 * - test/GachaTreasury.t.sol (base)
 * - test/GachaTreasuryTest.t.sol (additional unit tests)
 * - test/GachaTreasuryEconomicsTest.t.sol (moved to economics/)
 *
 * @author NFT Gacha Team
 */
contract GachaTreasuryTest is StandardTest {
    using TestConstants for *;
    // ========================================================================
    // TEST STATE VARIABLES
    // ========================================================================

    /// @dev Contract instances
    GachaTreasury public treasury;
    BaseERC721 public nft;
    MockNFTAppraisal public mockAppraisal;

    // ========================================================================
    // EVENTS
    // ========================================================================

    event GachaContractUpdated(address indexed oldGacha, address indexed newGacha);
    event CollectionWhitelisted(address indexed collection);
    event CollectionRemovedFromWhitelist(address indexed collection);
    event NFTDeposited(
        address indexed collection, uint256 indexed tokenId, address indexed depositor, GachaTreasury.Rarity rarity
    );
    event NFTWithdrawn(address indexed collection, uint256 indexed tokenId, address indexed depositor);
    event ProtocolTreasuryUpdated(address indexed previous, address indexed newProtocol);

    // ========================================================================
    // SETUP AND TEARDOWN
    // ========================================================================

    /**
     * @notice Sets up the test environment
     * @dev Deploys contracts and sets up initial state
     */
    function setUp() public {
        // Deploy mock appraisal
        mockAppraisal = new MockNFTAppraisal();

        // Deploy treasury with proxy
        treasury = _deployTreasury(owner, gachaContract, address(mockAppraisal));

        // Deploy test NFT collection
        nft = new BaseERC721("TestNFT", "TNFT", owner);
    }

    // ========================================================================
    // DEPLOYMENT TESTS
    // ========================================================================

    /**
     * @notice Test contract deployment
     * @dev Verifies that contract is deployed with correct initial state
     */
    function testDeployment() public view {
        assertEq(treasury.owner(), owner, "Owner should be set correctly");
        assertEq(treasury.gachaContract(), gachaContract, "Gacha contract should be set correctly");
        assertEq(treasury.getRarityCount(GachaTreasury.Rarity.Common), 0, "Initial common count should be zero");
        assertEq(treasury.getTotalItemsCount(), 0, "Initial total count should be zero");
    }

    // ========================================================================
    // WHITELIST MANAGEMENT TESTS
    // ========================================================================

    /**
     * @notice Test collection whitelisting
     * @dev Verifies that owner can whitelist collections
     */
    function testAddToWhitelist() public {
        vm.expectEmit(true, false, false, false);
        emit CollectionWhitelisted(address(nft));

        vm.prank(owner);
        treasury.addToWhitelist(address(nft));

        assertTrue(treasury.isCollectionWhitelisted(address(nft)), "Collection should be whitelisted");
        assertEq(treasury.getWhitelistLength(), 1, "Whitelist length should be 1");

        address[] memory whitelisted = treasury.getWhitelistedCollections();
        assertEq(whitelisted.length, 1, "Should have one whitelisted collection");
        assertEq(whitelisted[0], address(nft), "Should be the correct collection");
    }

    /**
     * @notice Test collection removal from whitelist
     * @dev Verifies that owner can remove collections from whitelist
     */
    function testRemoveFromWhitelist() public {
        // First add to whitelist
        vm.prank(owner);
        treasury.addToWhitelist(address(nft));

        vm.expectEmit(true, false, false, false);
        emit CollectionRemovedFromWhitelist(address(nft));

        vm.prank(owner);
        treasury.removeFromWhitelist(address(nft));

        assertFalse(treasury.isCollectionWhitelisted(address(nft)), "Collection should not be whitelisted");
        assertEq(treasury.getWhitelistLength(), 0, "Whitelist should be empty");
    }

    /**
     * @notice Test whitelist authorization
     * @dev Verifies that only owner can manage whitelist
     */
    function testWhitelistAuthorization() public {
        // Non-owner should not be able to add to whitelist
        vm.prank(unauthorizedUser);
        vm.expectRevert();
        treasury.addToWhitelist(address(nft));

        // Non-owner should not be able to remove from whitelist
        vm.prank(owner);
        treasury.addToWhitelist(address(nft));

        vm.prank(unauthorizedUser);
        vm.expectRevert();
        treasury.removeFromWhitelist(address(nft));
    }

    /**
     * @notice Test whitelist validation
     * @dev Verifies that duplicate whitelisting and invalid addresses are rejected
     */
    function testWhitelistValidation() public {
        // Should not be able to whitelist zero address
        vm.prank(owner);
        vm.expectRevert(abi.encodeWithSelector(GachaTreasury.InvalidCollectionAddress.selector));
        treasury.addToWhitelist(address(0));

        // Should not be able to whitelist same collection twice
        vm.prank(owner);
        treasury.addToWhitelist(address(nft));

        vm.prank(owner);
        vm.expectRevert(abi.encodeWithSelector(GachaTreasury.CollectionAlreadyWhitelisted.selector));
        treasury.addToWhitelist(address(nft));
    }

    /**
     * @notice Test multiple collections whitelisting
     * @dev Verifies that multiple collections can be whitelisted
     */
    function testMultipleCollectionsWhitelist() public {
        vm.prank(owner);
        BaseERC721 nft2 = new BaseERC721("TestNFT2", "TNFT2", owner);

        vm.startPrank(owner);
        treasury.addToWhitelist(address(nft));
        treasury.addToWhitelist(address(nft2));
        vm.stopPrank();

        assertEq(treasury.getWhitelistLength(), 2, "Should have 2 whitelisted collections");
        assertTrue(treasury.isCollectionWhitelisted(address(nft)), "First collection should be whitelisted");
        assertTrue(treasury.isCollectionWhitelisted(address(nft2)), "Second collection should be whitelisted");

        address[] memory whitelisted = treasury.getWhitelistedCollections();
        assertEq(whitelisted.length, 2, "Should have 2 whitelisted collections");
    }

    /**
     * @notice Test removing collection not in whitelist
     * @dev Verifies that removing non-whitelisted collection reverts
     */
    function testRemoveFromWhitelistRevertNotInWhitelist() public {
        vm.prank(owner);
        vm.expectRevert(abi.encodeWithSelector(GachaTreasury.CollectionNotInWhitelist.selector));
        treasury.removeFromWhitelist(address(nft));
    }

    // ========================================================================
    // NFT DEPOSIT TESTS
    // ========================================================================

    /**
     * @notice Test single NFT deposit
     * @dev Verifies that NFT can be deposited and rarity is assigned correctly
     */
    function testDepositSingleNFT() public {
        _whitelistCollection(treasury, address(nft), owner);

        uint256 tokenId = _mintNFT(nft, owner);
        _approveNFT(nft, owner, tokenId, address(treasury));

        // Set NFT appraisal to $50 (Uncommon range)
        mockAppraisal.setMockAppraisal(address(nft), tokenId, TestConstants.UNCOMMON_PRICE);

        vm.prank(owner);
        treasury.depositNFT(address(nft), tokenId);

        assertEq(treasury.getRarityCount(GachaTreasury.Rarity.Uncommon), 1, "Should have 1 Uncommon NFT");
        assertEq(treasury.getTotalItemsCount(), 1, "Should have 1 total NFT");
        assertEq(nft.ownerOf(tokenId), address(treasury), "Treasury should own the NFT");
    }

    /**
     * @notice Test deposit authorization
     * @dev Verifies that only NFT owner can deposit
     */
    function testDepositAuthorization() public {
        uint256 tokenId = _mintNFT(nft, user);  // Mint to user, not owner

        _whitelistCollection(treasury, address(nft), owner);
        mockAppraisal.setMockAppraisal(address(nft), tokenId, TestConstants.UNCOMMON_PRICE);

        // Owner tries to deposit user's NFT - should fail
        vm.startPrank(owner);
        vm.expectRevert();  // Should fail because owner doesn't own the NFT
        treasury.depositNFT(address(nft), tokenId);
        vm.stopPrank();
    }

    /**
     * @notice Test deposit validation
     * @dev Verifies that deposit fails for non-whitelisted collections
     */
    function testDepositValidation() public {
        uint256 tokenId = _mintNFT(nft, owner);
        _approveNFT(nft, owner, tokenId, address(treasury));
        mockAppraisal.setMockAppraisal(address(nft), tokenId, TestConstants.UNCOMMON_PRICE);

        // Collection not whitelisted - should fail
        vm.prank(owner);
        vm.expectRevert(abi.encodeWithSelector(GachaTreasury.CollectionNotWhitelisted.selector));
        treasury.depositNFT(address(nft), tokenId);
    }

    /**
     * @notice Test deposit of multiple NFTs with different rarities
     * @dev Verifies that rarity assignment works correctly across all tiers
     */
    function testDepositMultipleRarities() public {
        _whitelistCollection(treasury, address(nft), owner);

        // Deposit one of each rarity
        uint256[] memory prices = new uint256[](5);
        prices[0] = TestConstants.COMMON_PRICE;
        prices[1] = TestConstants.UNCOMMON_PRICE;
        prices[2] = TestConstants.RARE_PRICE;
        prices[3] = TestConstants.EPIC_PRICE;
        prices[4] = TestConstants.LEGENDARY_PRICE;

        uint256[] memory tokenIds = _mintNFTs(nft, owner, 5);

        vm.startPrank(owner);
        for (uint256 i = 0; i < tokenIds.length; i++) {
            nft.approve(address(treasury), tokenIds[i]);
            mockAppraisal.setMockAppraisal(address(nft), tokenIds[i], prices[i]);
            treasury.depositNFT(address(nft), tokenIds[i]);
        }
        vm.stopPrank();

        assertEq(treasury.getRarityCount(GachaTreasury.Rarity.Common), 1, "Should have 1 Common NFT");
        assertEq(treasury.getRarityCount(GachaTreasury.Rarity.Uncommon), 1, "Should have 1 Uncommon NFT");
        assertEq(treasury.getRarityCount(GachaTreasury.Rarity.Rare), 1, "Should have 1 Rare NFT");
        assertEq(treasury.getRarityCount(GachaTreasury.Rarity.Epic), 1, "Should have 1 Epic NFT");
        assertEq(treasury.getRarityCount(GachaTreasury.Rarity.Legendary), 1, "Should have 1 Legendary NFT");
        assertEq(treasury.getTotalItemsCount(), 5, "Should have 5 total NFTs");
    }

    // ========================================================================
    // NFT WITHDRAWAL TESTS
    // ========================================================================

    /**
     * @notice Test NFT withdrawal by depositor
     * @dev Verifies that depositor can withdraw their NFT
     */
    function testWithdrawMyNFT() public {
        _whitelistCollection(treasury, address(nft), owner);

        uint256 tokenId = _mintNFT(nft, owner);
        _approveNFT(nft, owner, tokenId, address(treasury));

        // Epic: $500 (in $300-$1200 range)
        mockAppraisal.setMockAppraisal(address(nft), tokenId, TestConstants.EPIC_PRICE);

        vm.prank(owner);
        treasury.depositNFT(address(nft), tokenId);

        // Owner withdraws their own NFT
        vm.prank(owner);
        treasury.withdrawMyNFT(address(nft), tokenId);

        assertEq(treasury.getRarityCount(GachaTreasury.Rarity.Epic), 0, "Should have 0 Epic NFTs after withdrawal");
        assertEq(nft.ownerOf(tokenId), owner, "Owner should own their withdrawn NFT");
    }

    /**
     * @notice Test withdrawal authorization
     * @dev Verifies that only depositor can withdraw their NFT
     */
    function testWithdrawalAuthorization() public {
        _whitelistCollection(treasury, address(nft), owner);

        uint256 tokenId = _mintNFT(nft, owner);
        _approveNFT(nft, owner, tokenId, address(treasury));

        mockAppraisal.setMockAppraisal(address(nft), tokenId, TestConstants.UNCOMMON_PRICE);

        vm.prank(owner);
        treasury.depositNFT(address(nft), tokenId);

        // User (not the depositor) cannot withdraw owner's NFT
        vm.prank(user);
        vm.expectRevert(abi.encodeWithSelector(GachaTreasury.NotNFTDepositor.selector));
        treasury.withdrawMyNFT(address(nft), tokenId);
    }

    // ========================================================================
    // RARITY ASSIGNMENT TESTS
    // ========================================================================

    /**
     * @notice Test precise rarity boundaries
     * @dev Verifies exact threshold values for each rarity tier
     */
    function testPreciseRarityBoundaries() public {
        _whitelistCollection(treasury, address(nft), owner);

        // Test exact boundary values
        uint256[] memory prices = new uint256[](6);
        prices[0] = 10e18;  // Common: $10
        prices[1] = 25e18;  // Uncommon: exact threshold
        prices[2] = 70e18;  // Rare: exact threshold
        prices[3] = 300e18; // Epic: exact threshold
        prices[4] = 1500e18; // Legendary: exact threshold
        prices[5] = 5000e18; // Legendary: way above

        GachaTreasury.Rarity[] memory expectedRarities = new GachaTreasury.Rarity[](6);
        expectedRarities[0] = GachaTreasury.Rarity.Common;
        expectedRarities[1] = GachaTreasury.Rarity.Uncommon;
        expectedRarities[2] = GachaTreasury.Rarity.Rare;
        expectedRarities[3] = GachaTreasury.Rarity.Epic;
        expectedRarities[4] = GachaTreasury.Rarity.Legendary;
        expectedRarities[5] = GachaTreasury.Rarity.Legendary;

        uint256[] memory tokenIds = _mintNFTs(nft, owner, 6);

        vm.startPrank(owner);
        for (uint256 i = 0; i < tokenIds.length; i++) {
            nft.approve(address(treasury), tokenIds[i]);
            mockAppraisal.setMockAppraisal(address(nft), tokenIds[i], prices[i]);
            treasury.depositNFT(address(nft), tokenIds[i]);
        }
        vm.stopPrank();

        // Verify counts
        assertEq(treasury.getRarityCount(GachaTreasury.Rarity.Common), 1, "Should have 1 Common");
        assertEq(treasury.getRarityCount(GachaTreasury.Rarity.Uncommon), 1, "Should have 1 Uncommon");
        assertEq(treasury.getRarityCount(GachaTreasury.Rarity.Rare), 1, "Should have 1 Rare");
        assertEq(treasury.getRarityCount(GachaTreasury.Rarity.Epic), 1, "Should have 1 Epic");
        assertEq(treasury.getRarityCount(GachaTreasury.Rarity.Legendary), 2, "Should have 2 Legendary");
    }

    /**
     * @notice Test rarity pool management
     * @dev Verifies getTreasuryItems returns correct items for each rarity
     */
    function testRarityPoolManagement() public {
        _whitelistCollection(treasury, address(nft), owner);

        uint256[] memory tokenIds = _mintNFTs(nft, owner, 2);
        uint256[] memory prices = new uint256[](2);
        prices[0] = TestConstants.UNCOMMON_PRICE;
        prices[1] = TestConstants.UNCOMMON_PRICE;

        vm.startPrank(owner);
        for (uint256 i = 0; i < tokenIds.length; i++) {
            nft.approve(address(treasury), tokenIds[i]);
            mockAppraisal.setMockAppraisal(address(nft), tokenIds[i], prices[i]);
            treasury.depositNFT(address(nft), tokenIds[i]);
        }
        vm.stopPrank();

        GachaTreasury.NFTItem[] memory items = treasury.getTreasuryItems(GachaTreasury.Rarity.Uncommon);
        assertEq(items.length, 2, "Should have 2 Uncommon items");
        assertEq(items[0].collection, address(nft), "First item should have correct collection");
        assertEq(items[0].tokenId, tokenIds[0], "First item should have correct tokenId");
        assertEq(uint8(items[0].rarity), uint8(GachaTreasury.Rarity.Uncommon), "First item should be Uncommon");
        assertEq(items[0].appraisedPrice, TestConstants.UNCOMMON_PRICE, "First item should have correct price");
    }

    /**
     * @notice Test empty rarity pool
     * @dev Verifies behavior when querying empty rarity pool
     */
    function testEmptyRarityPool() public view {
        GachaTreasury.NFTItem[] memory items = treasury.getTreasuryItems(GachaTreasury.Rarity.Common);
        assertEq(items.length, 0, "Empty pool should return 0 items");
    }

    // ========================================================================
    // GACHA INTEGRATION TESTS
    // ========================================================================

    /**
     * @notice Test sending NFT to winner
     * @dev Verifies that gacha contract can distribute NFTs to winners
     */
    function testSendNFTToWinner() public {
        _whitelistCollection(treasury, address(nft), owner);

        uint256 tokenId = _mintNFT(nft, owner);
        _approveNFT(nft, owner, tokenId, address(treasury));

        // Epic: $500 (in $300-$1200 range)
        mockAppraisal.setMockAppraisal(address(nft), tokenId, TestConstants.EPIC_PRICE);

        vm.prank(owner);
        treasury.depositNFT(address(nft), tokenId);

        address winner = address(0x456);

        // Check initial state
        assertEq(treasury.getUserDepositCount(owner, GachaTreasury.Rarity.Epic), 1, "Should have 1 Epic deposit");
        assertEq(treasury.getUserTotalDepositCount(owner), 1, "Should have 1 total deposit");

        // Gacha sends NFT to winner
        vm.prank(gachaContract);
        GachaTreasury.NFTItem memory item = treasury.sendRandomNFTToWinner(GachaTreasury.Rarity.Epic, 0, winner);

        assertEq(treasury.getRarityCount(GachaTreasury.Rarity.Epic), 0, "Should have 0 Epic NFTs after distribution");
        assertEq(nft.ownerOf(tokenId), winner, "Winner should own the NFT");
        assertEq(item.collection, address(nft), "Item should have correct collection");
        assertEq(item.tokenId, tokenId, "Item should have correct tokenId");
        assertEq(uint8(item.rarity), uint8(GachaTreasury.Rarity.Epic), "Item should be Epic rarity");
        assertEq(item.appraisedPrice, TestConstants.EPIC_PRICE, "Item should have correct price");

        // Verify deposit counts decreased
        assertEq(treasury.getUserDepositCount(owner, GachaTreasury.Rarity.Epic), 0, "Should have 0 Epic deposits");
        assertEq(treasury.getUserTotalDepositCount(owner), 0, "Should have 0 total deposits");
    }

    /**
     * @notice Test gacha authorization
     * @dev Verifies that only gacha contract can send NFTs to winners
     */
    function testGachaAuthorization() public {
        _whitelistCollection(treasury, address(nft), owner);

        uint256 tokenId = _mintNFT(nft, owner);
        _approveNFT(nft, owner, tokenId, address(treasury));

        mockAppraisal.setMockAppraisal(address(nft), tokenId, TestConstants.EPIC_PRICE);

        vm.prank(owner);
        treasury.depositNFT(address(nft), tokenId);

        // Non-gacha address cannot send NFT
        vm.prank(user);
        vm.expectRevert(abi.encodeWithSelector(GachaTreasury.UnauthorizedGachaContract.selector));
        treasury.sendRandomNFTToWinner(GachaTreasury.Rarity.Epic, 0, user);
    }

    /**
     * @notice Test gacha availability
     * @dev Verifies isGachaAvailable returns correct status
     */
    function testGachaAvailability() public {
        // Initially should be false (empty whitelist)
        assertFalse(treasury.isGachaAvailable(), "Should not be available with empty whitelist");

        // Add to whitelist but no NFTs
        vm.prank(owner);
        treasury.addToWhitelist(address(nft));
        assertFalse(treasury.isGachaAvailable(), "Should not be available with no NFTs");

        // Deposit an NFT
        uint256 tokenId = _mintNFT(nft, owner);
        _approveNFT(nft, owner, tokenId, address(treasury));

        mockAppraisal.setMockAppraisal(address(nft), tokenId, TestConstants.UNCOMMON_PRICE);

        vm.prank(owner);
        treasury.depositNFT(address(nft), tokenId);

        assertTrue(treasury.isGachaAvailable(), "Should be available with NFTs");

        // Remove from whitelist
        vm.prank(owner);
        treasury.removeFromWhitelist(address(nft));
        assertFalse(treasury.isGachaAvailable(), "Should not be available after removing from whitelist");
    }

    // ========================================================================
    // CONTRACT MANAGEMENT TESTS
    // ========================================================================

    /**
     * @notice Test updating gacha contract
     * @dev Verifies that owner can update gacha contract address
     */
    function testUpdateGachaContract() public {
        address newGacha = address(0x123);

        vm.expectEmit(true, true, false, false);
        emit GachaContractUpdated(gachaContract, newGacha);

        vm.prank(owner);
        treasury.setGachaContract(newGacha);

        assertEq(treasury.gachaContract(), newGacha, "Gacha contract should be updated");
    }

    /**
     * @notice Test transfer ownership
     * @dev Verifies that ownership can be transferred
     */
    function testTransferOwnership() public {
        address newOwner = address(0x3);

        vm.prank(owner);
        treasury.transferOwnership(newOwner);

        assertEq(treasury.owner(), newOwner, "Owner should be transferred");
    }

    /**
     * @notice Test protocol treasury rotation with inventory
     * @dev Verifies that protocol treasury cannot be rotated with deposits
     */
    function testSetProtocolTreasuryFailsWithInventory() public {
        address initialProtocol = address(0x123);

        vm.prank(owner);
        treasury.setProtocolTreasury(initialProtocol);

        // Whitelist and deposit NFT as protocol
        _whitelistCollection(treasury, address(nft), owner);

        uint256 tokenId = _mintNFT(nft, owner);
        mockAppraisal.setMockAppraisal(address(nft), tokenId, TestConstants.RARE_PRICE);

        // Simulate protocol treasury deposit
        vm.prank(initialProtocol);
        treasury.handleRedemptionReturn(address(nft), tokenId, owner, TestConstants.RARE_PRICE);

        // Verify deposit
        assertEq(treasury.userTotalDeposits(initialProtocol), 1, "Protocol should have 1 deposit");

        // Attempt to rotate - should fail
        vm.prank(owner);
        vm.expectRevert("TreasuryRotation: Must drain inventory before rotation");
        treasury.setProtocolTreasury(address(0x456));
    }

    /**
     * @notice Test protocol treasury rotation with empty inventory
     * @dev Verifies that protocol treasury can be rotated when empty
     */
    function testSetProtocolTreasurySucceedsWithEmptyInventory() public {
        address initialProtocol = address(0x123);

        vm.prank(owner);
        treasury.setProtocolTreasury(initialProtocol);

        // Verify inventory is empty
        assertEq(treasury.userTotalDeposits(initialProtocol), 0, "Protocol should have 0 deposits");

        // Should succeed
        address newProtocol = address(0x456);
        vm.prank(owner);
        treasury.setProtocolTreasury(newProtocol);

        assertEq(treasury.protocolTreasury(), newProtocol, "Protocol treasury should be updated");
    }

    /**
     * @notice Test setting protocol treasury to zero address
     * @dev Verifies that zero address is rejected
     */
    function testSetProtocolTreasuryFailsWithZeroAddress() public {
        vm.prank(owner);
        vm.expectRevert(abi.encodeWithSelector(GachaTreasury.InvalidProtocolTreasury.selector));
        treasury.setProtocolTreasury(address(0));
    }
}
