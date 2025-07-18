// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Test} from "forge-std/Test.sol";
import {GachaTreasury} from "../src/GachaTreasury.sol";
import {MockERC721} from "../src/MockERC721.sol";

contract GachaTreasuryTest is Test {
    GachaTreasury public treasury;
    MockERC721 public nft;
    address public owner = address(0x1);
    address public user = address(0x2);

    function setUp() public {
        treasury = new GachaTreasury(owner);
        nft = new MockERC721("TestNFT", "TNFT");
    }

    function testDeployment() public view {
        assertEq(treasury.owner(), owner);
        assertEq(treasury.getRarityCount(GachaTreasury.Rarity.Common), 0);
        assertEq(treasury.getTotalItemsCount(), 0);
    }

    function testDepositNFT() public {
        uint256 tokenId = nft.mint(owner);

        vm.startPrank(owner);
        nft.approve(address(treasury), tokenId);
        treasury.depositNFT(address(nft), tokenId, GachaTreasury.Rarity.Common);
        vm.stopPrank();

        assertEq(treasury.getRarityCount(GachaTreasury.Rarity.Common), 1);
        assertEq(treasury.getTotalItemsCount(), 1);
        assertEq(nft.ownerOf(tokenId), address(treasury));
    }

    function testDepositMultipleRarities() public {
        uint256 commonTokenId = nft.mint(owner);
        uint256 rareTokenId = nft.mint(owner);
        uint256 legendaryTokenId = nft.mint(owner);

        vm.startPrank(owner);
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
        uint256 tokenId = nft.mint(owner);

        vm.startPrank(owner);
        nft.approve(address(treasury), tokenId);
        treasury.depositNFT(address(nft), tokenId, GachaTreasury.Rarity.Epic);

        treasury.withdrawNFT(GachaTreasury.Rarity.Epic, 0, user);
        vm.stopPrank();

        assertEq(treasury.getRarityCount(GachaTreasury.Rarity.Epic), 0);
        assertEq(nft.ownerOf(tokenId), user);
    }

    function testOnlyOwnerCanDeposit() public {
        uint256 tokenId = nft.mint(user);

        vm.startPrank(user);
        nft.approve(address(treasury), tokenId);
        vm.expectRevert();
        treasury.depositNFT(address(nft), tokenId, GachaTreasury.Rarity.Common);
        vm.stopPrank();
    }

    function testOnlyOwnerCanWithdraw() public {
        uint256 tokenId = nft.mint(owner);

        vm.startPrank(owner);
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
        uint256 tokenId1 = nft.mint(owner);
        uint256 tokenId2 = nft.mint(owner);

        vm.startPrank(owner);
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
}
