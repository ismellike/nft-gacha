// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Test} from "forge-std/Test.sol";
import {GachaTreasury} from "../src/GachaTreasury.sol";
import {SimpleERC721} from "../src/SimpleERC721.sol";

contract GachaTreasuryTest is Test {
    GachaTreasury public treasury;
    SimpleERC721 public nft;
    address public owner = address(0x1);
    address public user = address(0x2);

    function setUp() public {
        // Use a mock gacha address for testing
        address mockGacha = address(0x999);
        treasury = new GachaTreasury(owner, mockGacha);
        vm.prank(owner);
        nft = new SimpleERC721("TestNFT", "TNFT");
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
        treasury.depositNFT(address(nft), tokenId, GachaTreasury.Rarity.Common);
        vm.stopPrank();

        assertEq(treasury.getRarityCount(GachaTreasury.Rarity.Common), 1);
        assertEq(treasury.getTotalItemsCount(), 1);
        assertEq(nft.ownerOf(tokenId), address(treasury));
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

        treasury.depositNFT(address(nft), commonTokenId, GachaTreasury.Rarity.Common);
        treasury.depositNFT(address(nft), rareTokenId, GachaTreasury.Rarity.Rare);
        treasury.depositNFT(address(nft), legendaryTokenId, GachaTreasury.Rarity.Legendary);
        vm.stopPrank();

        assertEq(treasury.getRarityCount(GachaTreasury.Rarity.Common), 1);
        assertEq(treasury.getRarityCount(GachaTreasury.Rarity.Rare), 1);
        assertEq(treasury.getRarityCount(GachaTreasury.Rarity.Legendary), 1);
        assertEq(treasury.getTotalItemsCount(), 3);
    }

    function testWithdrawNFT() public {
        vm.startPrank(owner);
        // First whitelist the collection
        treasury.addToWhitelist(address(nft));

        uint256 tokenId = nft.mint(owner);
        nft.approve(address(treasury), tokenId);
        treasury.depositNFT(address(nft), tokenId, GachaTreasury.Rarity.Epic);

        treasury.withdrawNFT(GachaTreasury.Rarity.Epic, 0, user);
        vm.stopPrank();

        assertEq(treasury.getRarityCount(GachaTreasury.Rarity.Epic), 0);
        assertEq(nft.ownerOf(tokenId), user);
    }

    function testOnlyOwnerCanDeposit() public {
        vm.prank(owner);
        uint256 tokenId = nft.mint(user);

        vm.startPrank(user);
        nft.approve(address(treasury), tokenId);
        vm.expectRevert();
        treasury.depositNFT(address(nft), tokenId, GachaTreasury.Rarity.Common);
        vm.stopPrank();
    }

    function testOnlyOwnerCanWithdraw() public {
        vm.startPrank(owner);
        // First whitelist the collection
        treasury.addToWhitelist(address(nft));

        uint256 tokenId = nft.mint(owner);
        nft.approve(address(treasury), tokenId);
        treasury.depositNFT(address(nft), tokenId, GachaTreasury.Rarity.Common);
        vm.stopPrank();

        vm.startPrank(user);
        vm.expectRevert();
        treasury.withdrawNFT(GachaTreasury.Rarity.Common, 0, user);
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

        treasury.depositNFT(address(nft), tokenId1, GachaTreasury.Rarity.Uncommon);
        treasury.depositNFT(address(nft), tokenId2, GachaTreasury.Rarity.Uncommon);
        vm.stopPrank();

        GachaTreasury.NFTItem[] memory items = treasury.getTreasuryItems(GachaTreasury.Rarity.Uncommon);
        assertEq(items.length, 2);
        assertEq(items[0].collection, address(nft));
        assertEq(items[0].tokenId, tokenId1);
        assertEq(uint8(items[0].rarity), uint8(GachaTreasury.Rarity.Uncommon));
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
        treasury.depositNFT(address(nft), tokenId, GachaTreasury.Rarity.Epic);
        treasury.setGachaContract(gachaAddress);
        vm.stopPrank();

        // Check initial deposit counts
        assertEq(treasury.getUserDepositCount(owner, GachaTreasury.Rarity.Epic), 1, "Should have 1 deposit before win");
        assertEq(treasury.getUserTotalDepositCount(owner), 1, "Should have 1 total deposit before win");

        vm.prank(gachaAddress);
        GachaTreasury.NFTItem memory item = treasury.sendNFTToWinner(GachaTreasury.Rarity.Epic, 0, winner);

        assertEq(treasury.getRarityCount(GachaTreasury.Rarity.Epic), 0);
        assertEq(nft.ownerOf(tokenId), winner);
        assertEq(item.collection, address(nft));
        assertEq(item.tokenId, tokenId);
        assertEq(uint8(item.rarity), uint8(GachaTreasury.Rarity.Epic));
        
        // Verify user deposit counts decreased
        assertEq(treasury.getUserDepositCount(owner, GachaTreasury.Rarity.Epic), 0, "Should have 0 deposits after win");
        assertEq(treasury.getUserTotalDepositCount(owner), 0, "Should have 0 total deposits after win");
    }

    function testSendNFTToWinnerOnlyGacha() public {
        vm.startPrank(owner);
        // First whitelist the collection
        treasury.addToWhitelist(address(nft));

        uint256 tokenId = nft.mint(owner);
        nft.approve(address(treasury), tokenId);
        treasury.depositNFT(address(nft), tokenId, GachaTreasury.Rarity.Epic);
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

        vm.expectRevert(abi.encodeWithSelector(GachaTreasury.CollectionNotWhitelisted.selector));
        treasury.depositNFT(address(nft), tokenId, GachaTreasury.Rarity.Common);
        vm.stopPrank();
    }

    function testSubmitPendingDepositRevertCollectionNotWhitelisted() public {
        vm.prank(owner);
        uint256 tokenId = nft.mint(user);

        vm.startPrank(user);
        nft.approve(address(treasury), tokenId);

        vm.expectRevert(abi.encodeWithSelector(GachaTreasury.CollectionNotWhitelisted.selector));
        treasury.submitPendingDeposit(address(nft), tokenId, GachaTreasury.Rarity.Common);
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
        treasury.depositNFT(address(nft), tokenId, GachaTreasury.Rarity.Common);

        // Now should be true
        assertTrue(treasury.isGachaAvailable());

        // Remove from whitelist
        treasury.removeFromWhitelist(address(nft));
        assertFalse(treasury.isGachaAvailable()); // Should be false again
        vm.stopPrank();
    }

    function testMultipleCollectionsWhitelist() public {
        vm.prank(owner);
        SimpleERC721 nft2 = new SimpleERC721("TestNFT2", "TNFT2");

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

    event GachaContractUpdated(address indexed oldGacha, address indexed newGacha);
    event CollectionWhitelisted(address indexed collection);
    event CollectionRemovedFromWhitelist(address indexed collection);
}
