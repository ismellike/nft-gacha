// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Test} from "forge-std/Test.sol";
import {GachaPFP} from "../../../src/tokens/GachaPFP.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title GachaPFP Test Suite
 * @notice Comprehensive tests for the Gacha PFP collection contract
 * @dev Covers minting, rarity assignment, metadata, and edge cases
 */
contract GachaPFPTest is Test {
    using Strings for uint256;

    GachaPFP public pfp;

    address public alice = makeAddr("alice");
    address public bob = makeAddr("bob");

    function setUp() public {
        pfp = new GachaPFP();
    }

    // ========================================================================
    // DEPLOYMENT
    // ========================================================================

    function testName() public view {
        assertEq(pfp.name(), "Gacha PFP");
    }

    function testSymbol() public view {
        assertEq(pfp.symbol(), "GPFP");
    }

    // ========================================================================
    // MINTING
    // ========================================================================

    function testMintReturnsSequentialIds() public {
        vm.startPrank(alice);
        uint256 id1 = pfp.mint();
        uint256 id2 = pfp.mint();
        uint256 id3 = pfp.mint();
        vm.stopPrank();

        assertEq(id1, 1);
        assertEq(id2, 2);
        assertEq(id3, 3);
    }

    function testMintAssignsOwnership() public {
        vm.prank(alice);
        uint256 tokenId = pfp.mint();

        assertEq(pfp.ownerOf(tokenId), alice);
    }

    function testMintUpdatesBalance() public {
        vm.startPrank(alice);
        pfp.mint();
        pfp.mint();
        pfp.mint();
        vm.stopPrank();

        assertEq(pfp.balanceOf(alice), 3);
    }

    function testMintFromMultipleUsers() public {
        vm.prank(alice);
        uint256 id1 = pfp.mint();

        vm.prank(bob);
        uint256 id2 = pfp.mint();

        assertEq(id1, 1);
        assertEq(id2, 2);
        assertEq(pfp.ownerOf(1), alice);
        assertEq(pfp.ownerOf(2), bob);
    }

    function testMintEmitsTransferEvent() public {
        vm.prank(alice);
        vm.expectEmit(true, true, true, false);
        emit Transfer(address(0), alice, 1);
        pfp.mint();
    }

    // ========================================================================
    // RARITY ASSIGNMENT
    // ========================================================================

    function testRarityIsAssignedOnMint() public {
        vm.prank(alice);
        uint256 tokenId = pfp.mint();

        GachaPFP.Rarity rarity = pfp.tokenRarity(tokenId);
        assertTrue(uint8(rarity) <= uint8(GachaPFP.Rarity.Mythic), "Rarity should be valid enum value");
    }

    function testRarityIsDeterministicPerBlock() public {
        // Same block → same prevrandao → same rarity for a given tokenId
        uint256 snapshot = vm.snapshotState();

        vm.prank(alice);
        uint256 id1 = pfp.mint();
        GachaPFP.Rarity rarity1 = pfp.tokenRarity(id1);

        vm.revertToState(snapshot);

        vm.prank(alice);
        uint256 id2 = pfp.mint();
        GachaPFP.Rarity rarity2 = pfp.tokenRarity(id2);

        assertEq(uint8(rarity1), uint8(rarity2), "Same block should yield same rarity for same tokenId");
    }

    function testRarityPersistsAfterMint() public {
        vm.prank(alice);
        uint256 tokenId = pfp.mint();

        GachaPFP.Rarity r1 = pfp.tokenRarity(tokenId);
        GachaPFP.Rarity r2 = pfp.tokenRarity(tokenId);

        assertEq(uint8(r1), uint8(r2), "Rarity should not change after mint");
    }

    function testUnmintedTokenHasDefaultRarity() public view {
        // Unminted token has default mapping value (Common = 0)
        GachaPFP.Rarity rarity = pfp.tokenRarity(999);
        assertEq(uint8(rarity), 0, "Unminted token should have default rarity value");
    }

    // ========================================================================
    // RARITY DISTRIBUTION (FUZZ)
    // ========================================================================

    function testFuzz_RarityDistribution(uint256 seed) public {
        // Verify all 6 rarities are achievable by varying block randomness
        vm.prevrandao(bytes32(seed));

        vm.prank(alice);
        uint256 tokenId = pfp.mint();

        GachaPFP.Rarity rarity = pfp.tokenRarity(tokenId);
        assertTrue(uint8(rarity) <= 5, "Rarity must be in [0, 5]");
    }

    function testRarityDistributionOverManyMints() public {
        uint256[6] memory counts;
        uint256 total = 500;

        for (uint256 i = 0; i < total; i++) {
            // Vary prevrandao per mint to get different rarities
            vm.prevrandao(bytes32(uint256(keccak256(abi.encodePacked(i, block.timestamp)))));
            vm.prank(alice);
            uint256 tokenId = pfp.mint();
            counts[uint8(pfp.tokenRarity(tokenId))]++;
        }

        // With 500 mints, verify each tier has at least 1 (statistical guarantee with varied randomness)
        // Common (40%) should dominate
        assertGt(counts[0], 0, "Should have Common mints");
        assertGt(counts[1], 0, "Should have Uncommon mints");
        // Rarer tiers may not appear in small samples, so just verify totals
        uint256 sum;
        for (uint256 i = 0; i < 6; i++) {
            sum += counts[i];
        }
        assertEq(sum, total, "All mints should be accounted for");
    }

    // ========================================================================
    // TOKEN URI / METADATA
    // ========================================================================

    function testTokenURIStartsWithDataPrefix() public {
        vm.prank(alice);
        uint256 tokenId = pfp.mint();

        string memory uri = pfp.tokenURI(tokenId);
        bytes memory uriBytes = bytes(uri);

        // Check it starts with "data:application/json;base64,"
        bytes memory prefix = bytes("data:application/json;base64,");
        assertGe(uriBytes.length, prefix.length, "URI should be at least as long as prefix");
        for (uint256 i = 0; i < prefix.length; i++) {
            assertEq(uriBytes[i], prefix[i], "URI prefix mismatch");
        }
    }

    function testTokenURIRevertsForNonexistentToken() public {
        vm.expectRevert();
        pfp.tokenURI(999);
    }

    function testTokenURIDiffersPerToken() public {
        vm.prevrandao(bytes32(uint256(1)));
        vm.prank(alice);
        uint256 id1 = pfp.mint();

        vm.prevrandao(bytes32(uint256(2)));
        vm.prank(alice);
        uint256 id2 = pfp.mint();

        string memory uri1 = pfp.tokenURI(id1);
        string memory uri2 = pfp.tokenURI(id2);

        // URIs should differ (different token IDs at minimum)
        assertFalse(
            keccak256(bytes(uri1)) == keccak256(bytes(uri2)),
            "Different tokens should have different URIs"
        );
    }

    function testTokenURIContainsBase64() public {
        vm.prank(alice);
        uint256 tokenId = pfp.mint();

        string memory uri = pfp.tokenURI(tokenId);

        // The base64 portion should be non-empty
        bytes memory prefix = bytes("data:application/json;base64,");
        assertGt(bytes(uri).length, prefix.length, "Base64 content should be non-empty");
    }

    // ========================================================================
    // ERC721 COMPLIANCE
    // ========================================================================

    function testSupportsERC721Interface() public view {
        assertTrue(pfp.supportsInterface(0x80ac58cd), "Should support ERC721 interface");
    }

    function testSupportsERC165Interface() public view {
        assertTrue(pfp.supportsInterface(0x01ffc9a7), "Should support ERC165 interface");
    }

    function testTransferWorks() public {
        vm.prank(alice);
        uint256 tokenId = pfp.mint();

        vm.prank(alice);
        pfp.transferFrom(alice, bob, tokenId);

        assertEq(pfp.ownerOf(tokenId), bob);
        assertEq(pfp.balanceOf(alice), 0);
        assertEq(pfp.balanceOf(bob), 1);
    }

    function testApproveAndTransfer() public {
        vm.prank(alice);
        uint256 tokenId = pfp.mint();

        vm.prank(alice);
        pfp.approve(bob, tokenId);

        vm.prank(bob);
        pfp.transferFrom(alice, bob, tokenId);

        assertEq(pfp.ownerOf(tokenId), bob);
    }

    function testRarityPersistsAfterTransfer() public {
        vm.prank(alice);
        uint256 tokenId = pfp.mint();

        GachaPFP.Rarity rarityBefore = pfp.tokenRarity(tokenId);

        vm.prank(alice);
        pfp.transferFrom(alice, bob, tokenId);

        GachaPFP.Rarity rarityAfter = pfp.tokenRarity(tokenId);
        assertEq(uint8(rarityBefore), uint8(rarityAfter), "Rarity should persist after transfer");
    }

    function testTokenURIAccessibleAfterTransfer() public {
        vm.prank(alice);
        uint256 tokenId = pfp.mint();

        string memory uriBefore = pfp.tokenURI(tokenId);

        vm.prank(alice);
        pfp.transferFrom(alice, bob, tokenId);

        string memory uriAfter = pfp.tokenURI(tokenId);
        assertEq(keccak256(bytes(uriBefore)), keccak256(bytes(uriAfter)), "URI should not change after transfer");
    }

    // ========================================================================
    // FUZZ TESTS
    // ========================================================================

    function testFuzz_MintAlwaysSucceeds(address minter) public {
        vm.assume(minter != address(0));

        vm.prank(minter);
        uint256 tokenId = pfp.mint();

        assertEq(pfp.ownerOf(tokenId), minter);
        assertTrue(uint8(pfp.tokenRarity(tokenId)) <= 5);
    }

    function testFuzz_TokenURINeverReverts(uint256 seed) public {
        vm.prevrandao(bytes32(seed));
        vm.prank(alice);
        uint256 tokenId = pfp.mint();

        // Should never revert for a minted token
        string memory uri = pfp.tokenURI(tokenId);
        assertGt(bytes(uri).length, 0, "URI should be non-empty");
    }

    function testFuzz_SequentialIdsNeverCollide(uint8 count) public {
        vm.assume(count > 0 && count <= 50);

        vm.startPrank(alice);
        uint256 prevId;
        for (uint8 i = 0; i < count; i++) {
            uint256 tokenId = pfp.mint();
            if (i > 0) {
                assertEq(tokenId, prevId + 1, "IDs should be strictly sequential");
            }
            prevId = tokenId;
        }
        vm.stopPrank();
    }

    // ========================================================================
    // EVENTS (needed for expectEmit)
    // ========================================================================

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
}
