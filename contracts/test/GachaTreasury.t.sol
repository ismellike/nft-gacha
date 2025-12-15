// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Test} from "forge-std/Test.sol";
import {GachaTreasury} from "../src/gacha/GachaTreasury.sol";
import {BaseERC721} from "../src/tokens/BaseERC721.sol";
import {MockNFTAppraisal} from "./mocks/MockNFTAppraisal.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

contract GachaTreasuryTest is Test {
    GachaTreasury public treasury;
    BaseERC721 public nft;
    MockNFTAppraisal public mockAppraisal;
    address public owner = address(0x1);
    address public user = address(0x2);

    function setUp() public {
        mockAppraisal = new MockNFTAppraisal();

        // Deploy implementation and proxy for GachaTreasury
        GachaTreasury treasuryImpl = new GachaTreasury();

        // Use a mock gacha address for testing
        address mockGacha = address(0x999);

        vm.startPrank(owner);
        uint256[5] memory minPrices = [
            uint256(0),
            uint256(15 * 1e18) + 1,
            uint256(60 * 1e18) + 1,
            uint256(250 * 1e18) + 1,
            uint256(1_200 * 1e18) + 1
        ];
        uint256[5] memory maxPrices = [uint256(15 * 1e18), 60 * 1e18, 250 * 1e18, 1_200 * 1e18, type(uint256).max];
        bytes memory initData = abi.encodeWithSelector(
            GachaTreasury.initialize.selector, owner, mockGacha, address(mockAppraisal), minPrices, maxPrices
        );

        ERC1967Proxy proxy = new ERC1967Proxy(address(treasuryImpl), initData);
        treasury = GachaTreasury(address(proxy));

        nft = new BaseERC721("TestNFT", "TNFT", owner);
        vm.stopPrank();
    }

    function testDeployment() public view {
        assertEq(treasury.owner(), owner);
        assertEq(treasury.getRarityCount(GachaTreasury.Rarity.Common), 0);
        assertEq(treasury.getTotalItemsCount(), 0);
    }

    function testDepositNFT() public {
        vm.startPrank(owner);
        // First whitelist the collection
        treasury.addToWhitelist(address(nft));

        uint256 tokenId = nft.mint(owner);
        nft.approve(address(treasury), tokenId);
        // Set NFT appraisal to $50 (50e18) - falls in Uncommon range ($25-$60)
        mockAppraisal.setMockAppraisal(address(nft), tokenId, 50e18);
        treasury.depositNFT(address(nft), tokenId);
        vm.stopPrank();

        assertEq(treasury.getRarityCount(GachaTreasury.Rarity.Uncommon), 1, "Should have exactly 1 Uncommon NFT");
        assertEq(treasury.getTotalItemsCount(), 1, "Should have exactly 1 total NFT");
        assertEq(nft.ownerOf(tokenId), address(treasury), "Treasury should own the NFT");
    }

    function testDepositMultipleRarities() public {
        vm.startPrank(owner);
        // First whitelist the collection
        treasury.addToWhitelist(address(nft));

        uint256 commonTokenId = nft.mint(owner);
        uint256 rareTokenId = nft.mint(owner);
        uint256 legendaryTokenId = nft.mint(owner);
        nft.approve(address(treasury), commonTokenId);
        nft.approve(address(treasury), rareTokenId);
        nft.approve(address(treasury), legendaryTokenId);

        // Uncommon: $50 (in $25-$60 range)
        mockAppraisal.setMockAppraisal(address(nft), commonTokenId, 50e18);
        treasury.depositNFT(address(nft), commonTokenId);
        // Epic: $1000 (in $300-$1200 range)
        mockAppraisal.setMockAppraisal(address(nft), rareTokenId, 1000e18);
        treasury.depositNFT(address(nft), rareTokenId);
        // Legendary: $15000 (above $1500 threshold)
        mockAppraisal.setMockAppraisal(address(nft), legendaryTokenId, 15000e18);
        treasury.depositNFT(address(nft), legendaryTokenId);
        vm.stopPrank();

        assertEq(treasury.getRarityCount(GachaTreasury.Rarity.Uncommon), 1, "Should have exactly 1 Uncommon NFT ($50)");
        assertEq(treasury.getRarityCount(GachaTreasury.Rarity.Epic), 1, "Should have exactly 1 Epic NFT ($1000)");
        assertEq(
            treasury.getRarityCount(GachaTreasury.Rarity.Legendary), 1, "Should have exactly 1 Legendary NFT ($15000)"
        );
        assertEq(treasury.getTotalItemsCount(), 3, "Should have exactly 3 total NFTs");
    }

    function testUserWithdrawMyNFT() public {
        vm.startPrank(owner);
        // First whitelist the collection
        treasury.addToWhitelist(address(nft));

        uint256 tokenId = nft.mint(owner);
        nft.approve(address(treasury), tokenId);
        // Epic: $500 (in $300-$1200 range)
        mockAppraisal.setMockAppraisal(address(nft), tokenId, 500e18);
        treasury.depositNFT(address(nft), tokenId);

        // Owner withdraws their own NFT
        treasury.withdrawMyNFT(address(nft), tokenId);
        vm.stopPrank();

        assertEq(treasury.getRarityCount(GachaTreasury.Rarity.Epic), 0, "Should have 0 Epic NFTs after withdrawal");
        assertEq(nft.ownerOf(tokenId), owner, "Owner should own their withdrawn NFT");
    }

    function testOnlyNFTOwnerCanDeposit() public {
        vm.prank(owner);
        uint256 tokenId = nft.mint(user);

        vm.startPrank(owner); // owner tries to deposit user's NFT
        treasury.addToWhitelist(address(nft));
        mockAppraisal.setMockAppraisal(address(nft), tokenId, 50 * 1e18);
        vm.expectRevert(); // Should fail because owner doesn't own the NFT
        treasury.depositNFT(address(nft), tokenId);
        vm.stopPrank();
    }

    function testOnlyDepositorCanWithdrawTheirNFT() public {
        vm.startPrank(owner);
        // First whitelist the collection
        treasury.addToWhitelist(address(nft));

        uint256 tokenId = nft.mint(owner);
        nft.approve(address(treasury), tokenId);
        mockAppraisal.setMockAppraisal(address(nft), tokenId, 50 * 1e18);
        treasury.depositNFT(address(nft), tokenId);
        vm.stopPrank();

        // User (not the depositor) cannot withdraw owner's NFT
        vm.startPrank(user);
        vm.expectRevert(abi.encodeWithSelector(GachaTreasury.NotNFTDepositor.selector));
        treasury.withdrawMyNFT(address(nft), tokenId);
        vm.stopPrank();
    }

    function testTransferOwnership() public {
        address newOwner = address(0x3);

        vm.prank(owner);
        treasury.transferOwnership(newOwner);

        assertEq(treasury.owner(), newOwner);
    }

    function testGetTreasuryItems() public {
        vm.startPrank(owner);
        // First whitelist the collection
        treasury.addToWhitelist(address(nft));

        uint256 tokenId1 = nft.mint(owner);
        uint256 tokenId2 = nft.mint(owner);
        nft.approve(address(treasury), tokenId1);
        nft.approve(address(treasury), tokenId2);

        // Uncommon: $250 (in $25-$60 range)
        mockAppraisal.setMockAppraisal(address(nft), tokenId1, 50e18);
        treasury.depositNFT(address(nft), tokenId1);
        mockAppraisal.setMockAppraisal(address(nft), tokenId2, 50e18);
        treasury.depositNFT(address(nft), tokenId2);
        vm.stopPrank();

        GachaTreasury.NFTItem[] memory items = treasury.getTreasuryItems(GachaTreasury.Rarity.Uncommon);
        assertEq(items.length, 2, "Should have exactly 2 Uncommon items");
        assertEq(items[0].collection, address(nft), "First item should be from correct collection");
        assertEq(items[0].tokenId, tokenId1, "First item should have correct tokenId");
        assertEq(uint8(items[0].rarity), uint8(GachaTreasury.Rarity.Uncommon), "First item should be Uncommon rarity");
        assertEq(items[0].appraisedPrice, 50e18, "First item should have exact appraised price of $50");
        assertEq(items[1].appraisedPrice, 50e18, "Second item should have exact appraised price of $50");
    }

    function testSetGachaContract() public {
        address gachaAddress = address(0x123);

        vm.prank(owner);
        vm.expectEmit(true, true, false, false);
        emit GachaContractUpdated(address(0x999), gachaAddress); // Use the mock gacha address from setUp
        treasury.setGachaContract(gachaAddress);

        assertEq(treasury.gachaContract(), gachaAddress);
    }

    function testSendNFTToWinner() public {
        vm.startPrank(owner);
        // First whitelist the collection
        treasury.addToWhitelist(address(nft));

        uint256 tokenId = nft.mint(owner);
        vm.stopPrank();

        address gachaAddress = address(0x123);
        address winner = address(0x456);

        vm.startPrank(owner);
        nft.approve(address(treasury), tokenId);
        // Epic: $500 (in $300-$1200 range)
        mockAppraisal.setMockAppraisal(address(nft), tokenId, 500e18);
        treasury.depositNFT(address(nft), tokenId);
        treasury.setGachaContract(gachaAddress);
        vm.stopPrank();

        // Check initial deposit counts
        assertEq(
            treasury.getUserDepositCount(owner, GachaTreasury.Rarity.Epic),
            1,
            "Should have exactly 1 Epic deposit before win"
        );
        assertEq(treasury.getUserTotalDepositCount(owner), 1, "Should have exactly 1 total deposit before win");

        vm.prank(gachaAddress);
        GachaTreasury.NFTItem memory item = treasury.sendNFTToWinner(GachaTreasury.Rarity.Epic, 0, winner);

        assertEq(treasury.getRarityCount(GachaTreasury.Rarity.Epic), 0, "Should have 0 Epic NFTs after winner claim");
        assertEq(nft.ownerOf(tokenId), winner, "Winner should own the NFT");
        assertEq(item.collection, address(nft), "Item should contain correct collection address");
        assertEq(item.tokenId, tokenId, "Item should contain correct tokenId");
        assertEq(uint8(item.rarity), uint8(GachaTreasury.Rarity.Epic), "Item should be Epic rarity");
        assertEq(item.appraisedPrice, 500e18, "Item should contain exact appraised price of $500");

        // Verify user deposit counts decreased by exactly 1
        assertEq(
            treasury.getUserDepositCount(owner, GachaTreasury.Rarity.Epic),
            0,
            "Should have exactly 0 Epic deposits after win"
        );
        assertEq(treasury.getUserTotalDepositCount(owner), 0, "Should have exactly 0 total deposits after win");
    }

    function testSendNFTToWinnerOnlyGacha() public {
        vm.startPrank(owner);
        // First whitelist the collection
        treasury.addToWhitelist(address(nft));

        uint256 tokenId = nft.mint(owner);
        nft.approve(address(treasury), tokenId);
        mockAppraisal.setMockAppraisal(address(nft), tokenId, 5000 * 1e18);
        treasury.depositNFT(address(nft), tokenId);
        vm.stopPrank();

        vm.prank(user);
        vm.expectRevert(abi.encodeWithSelector(GachaTreasury.UnauthorizedGachaContract.selector));
        treasury.sendNFTToWinner(GachaTreasury.Rarity.Epic, 0, user);
    }

    // ============ WHITELIST TESTS ============

    function testAddToWhitelist() public {
        vm.startPrank(owner);
        vm.expectEmit(true, false, false, false);
        emit CollectionWhitelisted(address(nft));
        treasury.addToWhitelist(address(nft));
        vm.stopPrank();

        assertTrue(treasury.isCollectionWhitelisted(address(nft)));
        assertEq(treasury.getWhitelistLength(), 1);

        address[] memory whitelisted = treasury.getWhitelistedCollections();
        assertEq(whitelisted.length, 1);
        assertEq(whitelisted[0], address(nft));
    }

    function testAddToWhitelistOnlyOwner() public {
        vm.prank(user);
        vm.expectRevert();
        treasury.addToWhitelist(address(nft));
    }

    function testAddToWhitelistRevertAlreadyWhitelisted() public {
        vm.startPrank(owner);
        treasury.addToWhitelist(address(nft));

        vm.expectRevert(abi.encodeWithSelector(GachaTreasury.CollectionAlreadyWhitelisted.selector));
        treasury.addToWhitelist(address(nft));
        vm.stopPrank();
    }

    function testAddToWhitelistRevertInvalidCollection() public {
        vm.prank(owner);
        vm.expectRevert(abi.encodeWithSelector(GachaTreasury.InvalidCollectionAddress.selector));
        treasury.addToWhitelist(address(0));
    }

    function testRemoveFromWhitelist() public {
        vm.startPrank(owner);
        treasury.addToWhitelist(address(nft));

        vm.expectEmit(true, false, false, false);
        emit CollectionRemovedFromWhitelist(address(nft));
        treasury.removeFromWhitelist(address(nft));
        vm.stopPrank();

        assertFalse(treasury.isCollectionWhitelisted(address(nft)));
        assertEq(treasury.getWhitelistLength(), 0);

        address[] memory whitelisted = treasury.getWhitelistedCollections();
        assertEq(whitelisted.length, 0);
    }

    function testRemoveFromWhitelistOnlyOwner() public {
        vm.prank(owner);
        treasury.addToWhitelist(address(nft));

        vm.prank(user);
        vm.expectRevert();
        treasury.removeFromWhitelist(address(nft));
    }

    function testRemoveFromWhitelistRevertNotInWhitelist() public {
        vm.prank(owner);
        vm.expectRevert(abi.encodeWithSelector(GachaTreasury.CollectionNotInWhitelist.selector));
        treasury.removeFromWhitelist(address(nft));
    }

    function testDepositRevertCollectionNotWhitelisted() public {
        vm.startPrank(owner);
        uint256 tokenId = nft.mint(owner);
        nft.approve(address(treasury), tokenId);
        mockAppraisal.setMockAppraisal(address(nft), tokenId, 50 * 1e18);

        vm.expectRevert(abi.encodeWithSelector(GachaTreasury.CollectionNotWhitelisted.selector));
        treasury.depositNFT(address(nft), tokenId);
        vm.stopPrank();
    }

    function testIsGachaAvailable() public {
        // Initially should be false (empty whitelist)
        assertFalse(treasury.isGachaAvailable());

        vm.startPrank(owner);
        // Add to whitelist but no NFTs
        treasury.addToWhitelist(address(nft));
        assertFalse(treasury.isGachaAvailable()); // Still false, no NFTs

        // Add an NFT
        uint256 tokenId = nft.mint(owner);
        nft.approve(address(treasury), tokenId);
        mockAppraisal.setMockAppraisal(address(nft), tokenId, 50 * 1e18);
        treasury.depositNFT(address(nft), tokenId);

        // Now should be true
        assertTrue(treasury.isGachaAvailable());

        // Remove from whitelist
        treasury.removeFromWhitelist(address(nft));
        assertFalse(treasury.isGachaAvailable()); // Should be false again
        vm.stopPrank();
    }

    function testMultipleCollectionsWhitelist() public {
        vm.prank(owner);
        BaseERC721 nft2 = new BaseERC721("TestNFT2", "TNFT2", owner);

        vm.startPrank(owner);
        treasury.addToWhitelist(address(nft));
        treasury.addToWhitelist(address(nft2));
        vm.stopPrank();

        assertEq(treasury.getWhitelistLength(), 2);
        assertTrue(treasury.isCollectionWhitelisted(address(nft)));
        assertTrue(treasury.isCollectionWhitelisted(address(nft2)));

        address[] memory whitelisted = treasury.getWhitelistedCollections();
        assertEq(whitelisted.length, 2);
        assertTrue(whitelisted[0] == address(nft) || whitelisted[0] == address(nft2));
        assertTrue(whitelisted[1] == address(nft) || whitelisted[1] == address(nft2));
        assertTrue(whitelisted[0] != whitelisted[1]);
    }

    function testPreciseRarityAssignment() public {
        vm.startPrank(owner);
        treasury.addToWhitelist(address(nft));

        // Test exact boundary values for each rarity
        uint256[] memory tokenIds = new uint256[](6);
        uint256[] memory prices = new uint256[](6);
        GachaTreasury.Rarity[] memory expectedRarities = new GachaTreasury.Rarity[](6);

        // Common: $10 (within $0-$15 range)
        tokenIds[0] = nft.mint(owner);
        prices[0] = 10e18;
        expectedRarities[0] = GachaTreasury.Rarity.Common;

        // Uncommon: $25 (exact threshold)
        tokenIds[1] = nft.mint(owner);
        prices[1] = 25e18;
        expectedRarities[1] = GachaTreasury.Rarity.Uncommon;

        // Rare: $70 (exact threshold)
        tokenIds[2] = nft.mint(owner);
        prices[2] = 70e18;
        expectedRarities[2] = GachaTreasury.Rarity.Rare;

        // Epic: $300 (exact threshold)
        tokenIds[3] = nft.mint(owner);
        prices[3] = 300e18;
        expectedRarities[3] = GachaTreasury.Rarity.Epic;

        // Legendary: $1500 (exact threshold)
        tokenIds[4] = nft.mint(owner);
        prices[4] = 1500e18;
        expectedRarities[4] = GachaTreasury.Rarity.Legendary;

        // Legendary: $5000 (way above threshold)
        tokenIds[5] = nft.mint(owner);
        prices[5] = 5000e18;
        expectedRarities[5] = GachaTreasury.Rarity.Legendary;

        // Deposit all NFTs and verify exact rarity assignment
        for (uint256 i = 0; i < tokenIds.length; i++) {
            nft.approve(address(treasury), tokenIds[i]);
            mockAppraisal.setMockAppraisal(address(nft), tokenIds[i], prices[i]);
            treasury.depositNFT(address(nft), tokenIds[i]);
        }
        vm.stopPrank();

        // Verify exact counts for each rarity
        assertEq(treasury.getRarityCount(GachaTreasury.Rarity.Common), 1, "Should have exactly 1 Common ($10)");
        assertEq(treasury.getRarityCount(GachaTreasury.Rarity.Uncommon), 1, "Should have exactly 1 Uncommon ($25)");
        assertEq(treasury.getRarityCount(GachaTreasury.Rarity.Rare), 1, "Should have exactly 1 Rare ($70)");
        assertEq(treasury.getRarityCount(GachaTreasury.Rarity.Epic), 1, "Should have exactly 1 Epic ($300)");
        assertEq(
            treasury.getRarityCount(GachaTreasury.Rarity.Legendary),
            2,
            "Should have exactly 2 Legendary ($1500 & $5000)"
        );
        assertEq(treasury.getTotalItemsCount(), 6, "Should have exactly 6 total NFTs");

        // Verify items in each rarity pool have correct prices
        GachaTreasury.NFTItem[] memory legendaryItems = treasury.getTreasuryItems(GachaTreasury.Rarity.Legendary);
        assertEq(legendaryItems.length, 2, "Should have 2 items in Legendary pool");
        // Items should be stored in deposit order
        assertEq(legendaryItems[0].appraisedPrice, 1500e18, "First Legendary should be $1500");
        assertEq(legendaryItems[1].appraisedPrice, 5000e18, "Second Legendary should be $5000");
    }

    function testSetProtocolTreasuryFailsWithInventory() public {
        vm.startPrank(owner);

        // Setup initial protocol treasury
        address initialProtocol = address(0x123);
        treasury.setProtocolTreasury(initialProtocol);

        // Whitelist collection
        treasury.addToWhitelist(address(nft));
        uint256 tokenId = nft.mint(owner);
        mockAppraisal.setMockAppraisal(address(nft), tokenId, 100e18); // $100 - Rare

        // Simulate protocol treasury getting NFTs through handleRedemptionReturn
        // This is how the protocol treasury actually gets deposits after user redemptions
        vm.startPrank(initialProtocol);
        treasury.handleRedemptionReturn(address(nft), tokenId, owner, 100e18);
        vm.stopPrank();

        // Verify NFT is deposited and protocol has deposits
        assertEq(treasury.userTotalDeposits(initialProtocol), 1, "Protocol should have 1 deposit");
        assertEq(treasury.getRarityCount(GachaTreasury.Rarity.Rare), 1, "Should have 1 Rare NFT");

        // Attempt to rotate protocol treasury - should fail
        vm.startPrank(owner);
        address newProtocol = address(0x456);
        vm.expectRevert("TreasuryRotation: Must drain inventory before rotation");
        treasury.setProtocolTreasury(newProtocol);

        vm.stopPrank();
    }

    function testSetProtocolTreasurySucceedsWithEmptyInventory() public {
        vm.startPrank(owner);

        // Setup initial protocol treasury
        address initialProtocol = address(0x123);
        treasury.setProtocolTreasury(initialProtocol);

        // Verify inventory is empty initially
        assertEq(treasury.userTotalDeposits(initialProtocol), 0, "Protocol should have 0 deposits initially");

        // Should be able to rotate treasury with empty inventory
        address newProtocol = address(0x456);
        treasury.setProtocolTreasury(newProtocol);

        // Verify the protocol treasury was updated
        assertEq(treasury.protocolTreasury(), newProtocol, "Protocol treasury should be updated");

        vm.stopPrank();
    }

    function testSetProtocolTreasuryFailsWithZeroAddress() public {
        vm.startPrank(owner);

        vm.expectRevert(abi.encodeWithSelector(GachaTreasury.InvalidProtocolTreasury.selector));
        treasury.setProtocolTreasury(address(0));

        vm.stopPrank();
    }

    event GachaContractUpdated(address indexed oldGacha, address indexed newGacha);
    event CollectionWhitelisted(address indexed collection);
    event CollectionRemovedFromWhitelist(address indexed collection);
    event ProtocolTreasuryUpdated(address indexed previous, address indexed newProtocol);
}
