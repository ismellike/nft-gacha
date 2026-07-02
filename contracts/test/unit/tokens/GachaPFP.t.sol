// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Test} from "forge-std/Test.sol";
import {GachaPFP} from "../../../src/tokens/GachaPFP.sol";
import {RandomnessRequested} from "../../../src/interfaces/WavsDrandTypes.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";

/**
 * @title GachaPFP Test Suite
 * @notice Comprehensive tests for the Gacha PFP collection contract
 * @dev Covers minting, rarity assignment, metadata, supply cap, mint price, and edge cases
 */
contract GachaPFPTest is Test {
    using Strings for uint256;

    GachaPFP public pfp;

    address public alice = makeAddr("alice");
    address public bob = makeAddr("bob");
    address public owner = makeAddr("owner");
    address public handler = makeAddr("handler");

    uint256 constant MINT_PRICE = 0.01 ether;
    uint256 constant MAX_SUPPLY = 100;

    function setUp() public {
        pfp = new GachaPFP(MINT_PRICE, MAX_SUPPLY, owner);
        vm.prank(owner);
        pfp.setServiceHandler(handler);
    }

    /// @dev Fulfills a token's rarity as the authorized service handler would.
    function _fulfill(uint256 tokenId, bytes32 randomness) internal {
        vm.prank(handler);
        pfp.fulfillRarity(tokenId, randomness);
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

    function testMintPrice() public view {
        assertEq(pfp.mintPrice(), MINT_PRICE);
    }

    function testMaxSupply() public view {
        assertEq(pfp.maxSupply(), MAX_SUPPLY);
    }

    function testOwner() public view {
        assertEq(pfp.owner(), owner);
    }

    function testTotalMintedStartsAtZero() public view {
        assertEq(pfp.totalMinted(), 0);
    }

    // ========================================================================
    // MINTING
    // ========================================================================

    function testMintReturnsSequentialIds() public {
        vm.deal(alice, 1 ether);
        vm.startPrank(alice);
        uint256 id1 = pfp.mint{value: MINT_PRICE}();
        uint256 id2 = pfp.mint{value: MINT_PRICE}();
        uint256 id3 = pfp.mint{value: MINT_PRICE}();
        vm.stopPrank();

        assertEq(id1, 1);
        assertEq(id2, 2);
        assertEq(id3, 3);
    }

    function testMintAssignsOwnership() public {
        vm.deal(alice, 1 ether);
        vm.prank(alice);
        uint256 tokenId = pfp.mint{value: MINT_PRICE}();

        assertEq(pfp.ownerOf(tokenId), alice);
    }

    function testMintUpdatesBalance() public {
        vm.deal(alice, 1 ether);
        vm.startPrank(alice);
        pfp.mint{value: MINT_PRICE}();
        pfp.mint{value: MINT_PRICE}();
        pfp.mint{value: MINT_PRICE}();
        vm.stopPrank();

        assertEq(pfp.balanceOf(alice), 3);
    }

    function testMintUpdatesTotalMinted() public {
        vm.deal(alice, 1 ether);
        vm.startPrank(alice);
        pfp.mint{value: MINT_PRICE}();
        assertEq(pfp.totalMinted(), 1);
        pfp.mint{value: MINT_PRICE}();
        assertEq(pfp.totalMinted(), 2);
        vm.stopPrank();
    }

    function testMintFromMultipleUsers() public {
        vm.deal(alice, 1 ether);
        vm.deal(bob, 1 ether);

        vm.prank(alice);
        uint256 id1 = pfp.mint{value: MINT_PRICE}();

        vm.prank(bob);
        uint256 id2 = pfp.mint{value: MINT_PRICE}();

        assertEq(id1, 1);
        assertEq(id2, 2);
        assertEq(pfp.ownerOf(1), alice);
        assertEq(pfp.ownerOf(2), bob);
    }

    function testMintEmitsTransferEvent() public {
        vm.deal(alice, 1 ether);
        vm.prank(alice);
        vm.expectEmit(true, true, true, false);
        emit Transfer(address(0), alice, 1);
        pfp.mint{value: MINT_PRICE}();
    }

    function testMintAcceptsOverpayment() public {
        vm.deal(alice, 1 ether);
        vm.prank(alice);
        uint256 tokenId = pfp.mint{value: MINT_PRICE * 2}();
        assertEq(pfp.ownerOf(tokenId), alice);
    }

    // ========================================================================
    // MINT PRICE ENFORCEMENT
    // ========================================================================

    function testMintRevertsWithInsufficientPayment() public {
        vm.deal(alice, 1 ether);
        vm.prank(alice);
        vm.expectRevert(GachaPFP.MintPriceNotMet.selector);
        pfp.mint{value: MINT_PRICE - 1}();
    }

    function testMintRevertsWithZeroPayment() public {
        vm.prank(alice);
        vm.expectRevert(GachaPFP.MintPriceNotMet.selector);
        pfp.mint();
    }

    function testFreeMintWhenPriceIsZero() public {
        GachaPFP freePfp = new GachaPFP(0, MAX_SUPPLY, owner);
        vm.prank(alice);
        uint256 tokenId = freePfp.mint();
        assertEq(freePfp.ownerOf(tokenId), alice);
    }

    // ========================================================================
    // SUPPLY CAP
    // ========================================================================

    function testMintRevertsAtMaxSupply() public {
        GachaPFP smallPfp = new GachaPFP(MINT_PRICE, 3, owner);

        vm.deal(alice, 1 ether);
        vm.startPrank(alice);
        smallPfp.mint{value: MINT_PRICE}();
        smallPfp.mint{value: MINT_PRICE}();
        smallPfp.mint{value: MINT_PRICE}();

        vm.expectRevert(GachaPFP.MaxSupplyReached.selector);
        smallPfp.mint{value: MINT_PRICE}();
        vm.stopPrank();
    }

    function testCanMintExactlyMaxSupply() public {
        GachaPFP smallPfp = new GachaPFP(MINT_PRICE, 2, owner);

        vm.deal(alice, 1 ether);
        vm.startPrank(alice);
        smallPfp.mint{value: MINT_PRICE}();
        smallPfp.mint{value: MINT_PRICE}();
        vm.stopPrank();

        assertEq(smallPfp.totalMinted(), 2);
    }

    // ========================================================================
    // WITHDRAW
    // ========================================================================

    function testWithdrawSendsBalanceToOwner() public {
        vm.deal(alice, 1 ether);
        vm.prank(alice);
        pfp.mint{value: MINT_PRICE}();

        uint256 ownerBalanceBefore = owner.balance;
        vm.prank(owner);
        pfp.withdraw();

        assertEq(owner.balance, ownerBalanceBefore + MINT_PRICE);
        assertEq(address(pfp).balance, 0);
    }

    function testWithdrawRevertsForNonOwner() public {
        vm.deal(alice, 1 ether);
        vm.prank(alice);
        pfp.mint{value: MINT_PRICE}();

        vm.prank(alice);
        vm.expectRevert();
        pfp.withdraw();
    }

    function testWithdrawMultipleMints() public {
        vm.deal(alice, 1 ether);
        vm.deal(bob, 1 ether);

        vm.prank(alice);
        pfp.mint{value: MINT_PRICE}();
        vm.prank(bob);
        pfp.mint{value: MINT_PRICE}();

        uint256 ownerBalanceBefore = owner.balance;
        vm.prank(owner);
        pfp.withdraw();

        assertEq(owner.balance, ownerBalanceBefore + MINT_PRICE * 2);
    }

    // ========================================================================
    // ASYNC REVEAL FLOW (WAVS-DRAND)
    // ========================================================================

    function testMintLeavesTokenUnrevealed() public {
        vm.deal(alice, 1 ether);
        vm.prank(alice);
        uint256 tokenId = pfp.mint{value: MINT_PRICE}();

        assertFalse(pfp.rarityRevealed(tokenId), "rarity must not be revealed at mint");
    }

    function testMintEmitsRandomnessRequested() public {
        vm.deal(alice, 1 ether);
        vm.prank(alice);
        vm.expectEmit(true, false, false, false);
        emit RandomnessRequested(1);
        pfp.mint{value: MINT_PRICE}();
    }

    function testFulfillRaritySetsRarityAndReveals() public {
        vm.deal(alice, 1 ether);
        vm.prank(alice);
        uint256 tokenId = pfp.mint{value: MINT_PRICE}();

        // randomness rolling to the Mythic band (>= 9800 mod 10000)
        _fulfill(tokenId, bytes32(uint256(9950)));

        assertTrue(pfp.rarityRevealed(tokenId), "token should be revealed after fulfillment");
        assertEq(uint8(pfp.tokenRarity(tokenId)), uint8(GachaPFP.Rarity.Mythic), "9950 -> Mythic");
    }

    function testFulfillRarityRevertsForNonServiceHandler() public {
        vm.deal(alice, 1 ether);
        vm.prank(alice);
        uint256 tokenId = pfp.mint{value: MINT_PRICE}();

        vm.prank(alice);
        vm.expectRevert(GachaPFP.NotServiceHandler.selector);
        pfp.fulfillRarity(tokenId, bytes32(uint256(1)));
    }

    function testFulfillRarityIsIdempotent() public {
        vm.deal(alice, 1 ether);
        vm.prank(alice);
        uint256 tokenId = pfp.mint{value: MINT_PRICE}();

        _fulfill(tokenId, bytes32(uint256(100)));

        vm.prank(handler);
        vm.expectRevert(GachaPFP.RarityAlreadyRevealed.selector);
        pfp.fulfillRarity(tokenId, bytes32(uint256(9999)));
    }

    function testSetServiceHandlerOnlyOwner() public {
        vm.prank(alice);
        vm.expectRevert();
        pfp.setServiceHandler(alice);
    }

    function testSetServiceHandlerRejectsZeroAddress() public {
        vm.prank(owner);
        vm.expectRevert(GachaPFP.InvalidServiceHandler.selector);
        pfp.setServiceHandler(address(0));
    }

    function testRequestRevealRevertsBeforeCooldown() public {
        vm.deal(alice, 1 ether);
        vm.prank(alice);
        uint256 tokenId = pfp.mint{value: MINT_PRICE}();

        vm.prank(alice);
        vm.expectRevert(GachaPFP.RevealRequestCooldown.selector);
        pfp.requestReveal(tokenId);
    }

    function testRequestRevealReemitsAfterCooldown() public {
        vm.deal(alice, 1 ether);
        vm.prank(alice);
        uint256 tokenId = pfp.mint{value: MINT_PRICE}();

        vm.warp(block.timestamp + pfp.REVEAL_REREQUEST_COOLDOWN());

        vm.prank(alice);
        vm.expectEmit(true, false, false, false);
        emit RandomnessRequested(tokenId);
        pfp.requestReveal(tokenId);
    }

    function testRequestRevealRevertsIfAlreadyRevealed() public {
        vm.deal(alice, 1 ether);
        vm.prank(alice);
        uint256 tokenId = pfp.mint{value: MINT_PRICE}();
        _fulfill(tokenId, bytes32(uint256(1)));

        vm.warp(block.timestamp + pfp.REVEAL_REREQUEST_COOLDOWN());
        vm.prank(alice);
        vm.expectRevert(GachaPFP.RarityAlreadyRevealed.selector);
        pfp.requestReveal(tokenId);
    }

    function testUnmintedTokenHasDefaultRarity() public view {
        // Unminted token has default mapping value (Common = 0) and is unrevealed
        assertEq(uint8(pfp.tokenRarity(999)), 0, "Unminted token should have default rarity value");
        assertFalse(pfp.rarityRevealed(999));
    }

    // ========================================================================
    // RARITY DISTRIBUTION (FUZZ) — driven by fulfillment randomness
    // ========================================================================

    function testFuzz_RarityFromRandomness(uint256 seed) public {
        vm.deal(alice, 1 ether);
        vm.prank(alice);
        uint256 tokenId = pfp.mint{value: MINT_PRICE}();

        _fulfill(tokenId, bytes32(seed));

        assertTrue(uint8(pfp.tokenRarity(tokenId)) <= 5, "Rarity must be in [0, 5]");
        assertTrue(pfp.rarityRevealed(tokenId));
    }

    function testRarityDistributionOverManyMints() public {
        vm.deal(alice, 100 ether);
        uint256[6] memory counts;
        uint256 total = 100; // stay within MAX_SUPPLY

        for (uint256 i = 0; i < total; i++) {
            vm.prank(alice);
            uint256 tokenId = pfp.mint{value: MINT_PRICE}();
            // Vary fulfillment randomness per token to spread rarities
            _fulfill(tokenId, bytes32(uint256(keccak256(abi.encodePacked(i, block.timestamp)))));
            counts[uint8(pfp.tokenRarity(tokenId))]++;
        }

        assertGt(counts[0], 0, "Should have Common mints");
        uint256 sum;
        for (uint256 i = 0; i < 6; i++) {
            sum += counts[i];
        }
        assertEq(sum, total, "All mints should be accounted for");
    }

    function testRarityBandsMapCorrectly() public {
        vm.deal(alice, 1 ether);
        // roll = randomness % 10000; verify each band's boundary maps to the right tier
        uint256[6] memory rolls = [uint256(0), 4000, 6500, 8300, 9300, 9800];
        GachaPFP.Rarity[6] memory expected = [
            GachaPFP.Rarity.Common,
            GachaPFP.Rarity.Uncommon,
            GachaPFP.Rarity.Rare,
            GachaPFP.Rarity.Epic,
            GachaPFP.Rarity.Legendary,
            GachaPFP.Rarity.Mythic
        ];
        for (uint256 i = 0; i < 6; i++) {
            vm.prank(alice);
            uint256 tokenId = pfp.mint{value: MINT_PRICE}();
            _fulfill(tokenId, bytes32(rolls[i]));
            assertEq(uint8(pfp.tokenRarity(tokenId)), uint8(expected[i]), "band boundary mismatch");
        }
    }

    // ========================================================================
    // TOKEN URI / METADATA
    // ========================================================================

    function testTokenURIStartsWithDataPrefix() public {
        vm.deal(alice, 1 ether);
        vm.prank(alice);
        uint256 tokenId = pfp.mint{value: MINT_PRICE}();

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
        vm.deal(alice, 1 ether);

        vm.prevrandao(bytes32(uint256(1)));
        vm.prank(alice);
        uint256 id1 = pfp.mint{value: MINT_PRICE}();

        vm.prevrandao(bytes32(uint256(2)));
        vm.prank(alice);
        uint256 id2 = pfp.mint{value: MINT_PRICE}();

        string memory uri1 = pfp.tokenURI(id1);
        string memory uri2 = pfp.tokenURI(id2);

        // URIs should differ (different token IDs at minimum)
        assertFalse(keccak256(bytes(uri1)) == keccak256(bytes(uri2)), "Different tokens should have different URIs");
    }

    function testTokenURIContainsBase64() public {
        vm.deal(alice, 1 ether);
        vm.prank(alice);
        uint256 tokenId = pfp.mint{value: MINT_PRICE}();

        string memory uri = pfp.tokenURI(tokenId);

        // The base64 portion should be non-empty
        bytes memory prefix = bytes("data:application/json;base64,");
        assertGt(bytes(uri).length, prefix.length, "Base64 content should be non-empty");
    }

    function _dataUri(string memory json) internal pure returns (string memory) {
        return string(abi.encodePacked("data:application/json;base64,", Base64.encode(bytes(json))));
    }

    function testTokenURIUnrevealedShowsUnrevealedMetadata() public {
        vm.deal(alice, 1 ether);
        vm.prank(alice);
        uint256 tokenId = pfp.mint{value: MINT_PRICE}();

        string memory expected = _dataUri(
            '{"name":"Gacha PFP #1","description":"Gacha PFP Collection - Unrevealed","attributes":[{"trait_type":"Status","value":"Unrevealed"}]}'
        );
        assertEq(pfp.tokenURI(tokenId), expected, "unrevealed metadata must expose Status, not Rarity");
    }

    function testTokenURIRevealedShowsRarityMetadata() public {
        vm.deal(alice, 1 ether);
        vm.prank(alice);
        uint256 tokenId = pfp.mint{value: MINT_PRICE}();
        _fulfill(tokenId, bytes32(uint256(9950))); // Mythic

        string memory expected = _dataUri(
            '{"name":"Gacha PFP #1","description":"Gacha PFP Collection - Mythic","attributes":[{"trait_type":"Rarity","value":"Mythic"}]}'
        );
        assertEq(pfp.tokenURI(tokenId), expected, "revealed metadata must expose the Rarity trait");
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
        vm.deal(alice, 1 ether);
        vm.prank(alice);
        uint256 tokenId = pfp.mint{value: MINT_PRICE}();

        vm.prank(alice);
        pfp.transferFrom(alice, bob, tokenId);

        assertEq(pfp.ownerOf(tokenId), bob);
        assertEq(pfp.balanceOf(alice), 0);
        assertEq(pfp.balanceOf(bob), 1);
    }

    function testApproveAndTransfer() public {
        vm.deal(alice, 1 ether);
        vm.prank(alice);
        uint256 tokenId = pfp.mint{value: MINT_PRICE}();

        vm.prank(alice);
        pfp.approve(bob, tokenId);

        vm.prank(bob);
        pfp.transferFrom(alice, bob, tokenId);

        assertEq(pfp.ownerOf(tokenId), bob);
    }

    function testRarityPersistsAfterTransfer() public {
        vm.deal(alice, 1 ether);
        vm.prank(alice);
        uint256 tokenId = pfp.mint{value: MINT_PRICE}();
        _fulfill(tokenId, bytes32(uint256(7777)));

        GachaPFP.Rarity rarityBefore = pfp.tokenRarity(tokenId);

        vm.prank(alice);
        pfp.transferFrom(alice, bob, tokenId);

        GachaPFP.Rarity rarityAfter = pfp.tokenRarity(tokenId);
        assertEq(uint8(rarityBefore), uint8(rarityAfter), "Rarity should persist after transfer");
    }

    function testTokenURIAccessibleAfterTransfer() public {
        vm.deal(alice, 1 ether);
        vm.prank(alice);
        uint256 tokenId = pfp.mint{value: MINT_PRICE}();

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
        vm.deal(minter, 1 ether);

        vm.prank(minter);
        uint256 tokenId = pfp.mint{value: MINT_PRICE}();

        assertEq(pfp.ownerOf(tokenId), minter);
        assertFalse(pfp.rarityRevealed(tokenId), "freshly minted token is unrevealed");
    }

    function testFuzz_TokenURINeverReverts(uint256 seed) public {
        vm.deal(alice, 1 ether);
        vm.prevrandao(bytes32(seed));
        vm.prank(alice);
        uint256 tokenId = pfp.mint{value: MINT_PRICE}();

        // Should never revert for a minted token
        string memory uri = pfp.tokenURI(tokenId);
        assertGt(bytes(uri).length, 0, "URI should be non-empty");
    }

    function testFuzz_SequentialIdsNeverCollide(uint8 count) public {
        vm.assume(count > 0 && count <= 50);
        vm.deal(alice, 100 ether);

        vm.startPrank(alice);
        uint256 prevId;
        for (uint8 i = 0; i < count; i++) {
            uint256 tokenId = pfp.mint{value: MINT_PRICE}();
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
