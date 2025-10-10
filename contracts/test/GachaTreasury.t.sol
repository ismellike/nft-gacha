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
        bytes memory initData =
            abi.encodeWithSelector(
                GachaTreasury.initialize.selector,
                owner,
                mockGacha,
                address(mockAppraisal),
                0, // Common min
                100 * 1e18, // Common max
                100 * 1e18, // Uncommon min
                500 * 1e18, // Uncommon max
                500 * 1e18, // Rare min
                2000 * 1e18, // Rare max
                2000 * 1e18, // Epic min
                10000 * 1e18, // Epic max
                10000 * 1e18, // Legendary min
                type(uint256).max // Legendary max
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
        // Set NFT appraisal to $50 (50e18) - falls in Common range ($0-$100)
        mockAppraisal.setMockAppraisal(address(nft), tokenId, 50e18);
        treasury.depositNFT(address(nft), tokenId);
        vm.stopPrank();

        assertEq(treasury.getRarityCount(GachaTreasury.Rarity.Common), 1, "Should have exactly 1 Common NFT");
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

        // Common: $50 (in $0-$100 range)
        mockAppraisal.setMockAppraisal(address(nft), commonTokenId, 50e18);
        treasury.depositNFT(address(nft), commonTokenId);
        // Rare: $1000 (in $500-$2000 range)
        mockAppraisal.setMockAppraisal(address(nft), rareTokenId, 1000e18);
        treasury.depositNFT(address(nft), rareTokenId);
        // Legendary: $15000 (above $10000 threshold)
        mockAppraisal.setMockAppraisal(address(nft), legendaryTokenId, 15000e18);
        treasury.depositNFT(address(nft), legendaryTokenId);
        vm.stopPrank();

        assertEq(treasury.getRarityCount(GachaTreasury.Rarity.Common), 1, "Should have exactly 1 Common NFT ($50)");
        assertEq(treasury.getRarityCount(GachaTreasury.Rarity.Rare), 1, "Should have exactly 1 Rare NFT ($1000)");
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
        // Epic: $5000 (in $2000-$10000 range)
        mockAppraisal.setMockAppraisal(address(nft), tokenId, 5000e18);
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

        // Uncommon: $250 (in $100-$500 range)
        mockAppraisal.setMockAppraisal(address(nft), tokenId1, 250e18);
        treasury.depositNFT(address(nft), tokenId1);
        mockAppraisal.setMockAppraisal(address(nft), tokenId2, 250e18);
        treasury.depositNFT(address(nft), tokenId2);
        vm.stopPrank();

        GachaTreasury.NFTItem[] memory items = treasury.getTreasuryItems(GachaTreasury.Rarity.Uncommon);
        assertEq(items.length, 2, "Should have exactly 2 Uncommon items");
        assertEq(items[0].collection, address(nft), "First item should be from correct collection");
        assertEq(items[0].tokenId, tokenId1, "First item should have correct tokenId");
        assertEq(uint8(items[0].rarity), uint8(GachaTreasury.Rarity.Uncommon), "First item should be Uncommon rarity");
        assertEq(items[0].appraisedPrice, 250e18, "First item should have exact appraised price of $250");
        assertEq(items[1].appraisedPrice, 250e18, "Second item should have exact appraised price of $250");
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
        // Epic: $5000 (in $2000-$10000 range)
        mockAppraisal.setMockAppraisal(address(nft), tokenId, 5000e18);
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
        assertEq(item.appraisedPrice, 5000e18, "Item should contain exact appraised price of $5000");

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

        // Common: $99 (just below $100 threshold)
        tokenIds[0] = nft.mint(owner);
        prices[0] = 99e18;
        expectedRarities[0] = GachaTreasury.Rarity.Common;

        // Uncommon: $100 (exact threshold)
        tokenIds[1] = nft.mint(owner);
        prices[1] = 100e18;
        expectedRarities[1] = GachaTreasury.Rarity.Uncommon;

        // Rare: $500 (exact threshold)
        tokenIds[2] = nft.mint(owner);
        prices[2] = 500e18;
        expectedRarities[2] = GachaTreasury.Rarity.Rare;

        // Epic: $2000 (exact threshold)
        tokenIds[3] = nft.mint(owner);
        prices[3] = 2000e18;
        expectedRarities[3] = GachaTreasury.Rarity.Epic;

        // Legendary: $10000 (exact threshold)
        tokenIds[4] = nft.mint(owner);
        prices[4] = 10000e18;
        expectedRarities[4] = GachaTreasury.Rarity.Legendary;

        // Legendary: $50000 (way above threshold)
        tokenIds[5] = nft.mint(owner);
        prices[5] = 50000e18;
        expectedRarities[5] = GachaTreasury.Rarity.Legendary;

        // Deposit all NFTs and verify exact rarity assignment
        for (uint256 i = 0; i < tokenIds.length; i++) {
            nft.approve(address(treasury), tokenIds[i]);
            mockAppraisal.setMockAppraisal(address(nft), tokenIds[i], prices[i]);
            treasury.depositNFT(address(nft), tokenIds[i]);
        }
        vm.stopPrank();

        // Verify exact counts for each rarity
        assertEq(treasury.getRarityCount(GachaTreasury.Rarity.Common), 1, "Should have exactly 1 Common ($99)");
        assertEq(treasury.getRarityCount(GachaTreasury.Rarity.Uncommon), 1, "Should have exactly 1 Uncommon ($100)");
        assertEq(treasury.getRarityCount(GachaTreasury.Rarity.Rare), 1, "Should have exactly 1 Rare ($500)");
        assertEq(treasury.getRarityCount(GachaTreasury.Rarity.Epic), 1, "Should have exactly 1 Epic ($2000)");
        assertEq(
            treasury.getRarityCount(GachaTreasury.Rarity.Legendary),
            2,
            "Should have exactly 2 Legendary ($10000 & $50000)"
        );
        assertEq(treasury.getTotalItemsCount(), 6, "Should have exactly 6 total NFTs");

        // Verify items in each rarity pool have correct prices
        GachaTreasury.NFTItem[] memory legendaryItems = treasury.getTreasuryItems(GachaTreasury.Rarity.Legendary);
        assertEq(legendaryItems.length, 2, "Should have 2 items in Legendary pool");
        // Items should be stored in deposit order
        assertEq(legendaryItems[0].appraisedPrice, 10000e18, "First Legendary should be $10000");
        assertEq(legendaryItems[1].appraisedPrice, 50000e18, "Second Legendary should be $50000");
    }

    event GachaContractUpdated(address indexed oldGacha, address indexed newGacha);
    event CollectionWhitelisted(address indexed collection);
    event CollectionRemovedFromWhitelist(address indexed collection);
}
