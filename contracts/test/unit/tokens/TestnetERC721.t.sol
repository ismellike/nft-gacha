// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Test} from "forge-std/Test.sol";
import {TestnetERC721} from "../../../src/tokens/TestnetERC721.sol";

/**
 * @title TestnetERC721 Test Suite
 * @notice Comprehensive tests for TestnetERC721 permissionless mint contract
 * @dev TestnetERC721 uses plain ERC721 (no Enumerable), so supply is tracked
 *      indirectly via balances and ownership checks.
 * @author NFT Gacha Team
 */
contract TestnetERC721Test is Test {
    // ========================================================================
    // STATE VARIABLES
    // ========================================================================

    TestnetERC721 public nft;
    address public alice;
    address public bob;

    // ========================================================================
    // EVENTS
    // ========================================================================

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);

    // ========================================================================
    // SETUP
    // ========================================================================

    function setUp() public {
        nft = new TestnetERC721();
        alice = makeAddr("alice");
        bob = makeAddr("bob");
    }

    // ========================================================================
    // DEPLOYMENT TESTS
    // ========================================================================

    function test_Deployment_Name() public view {
        assertEq(nft.name(), "Testnet Gacha NFT");
    }

    function test_Deployment_Symbol() public view {
        assertEq(nft.symbol(), "tGACHA");
    }

    function test_Deployment_InitialBalancesZero() public view {
        assertEq(nft.balanceOf(alice), 0);
        assertEq(nft.balanceOf(bob), 0);
    }

    // ========================================================================
    // mint() TESTS
    // ========================================================================

    function test_Mint_Basic() public {
        vm.prank(alice);
        uint256 tokenId = nft.mint();

        assertEq(tokenId, 1, "first token ID should be 1");
        assertEq(nft.ownerOf(tokenId), alice, "alice should own the token");
        assertEq(nft.balanceOf(alice), 1);
    }

    function test_Mint_AnyoneCanMint() public {
        vm.prank(alice);
        uint256 tid1 = nft.mint();

        // bob mints — no access control
        vm.prank(bob);
        uint256 tid2 = nft.mint();

        assertEq(nft.ownerOf(tid1), alice);
        assertEq(nft.ownerOf(tid2), bob);
    }

    function test_Mint_IncrementsTokenId() public {
        vm.prank(alice);
        uint256 id1 = nft.mint();

        vm.prank(alice);
        uint256 id2 = nft.mint();

        assertEq(id2, id1 + 1, "IDs should be sequential");
    }

    function test_Mint_EmitsTransferEvent() public {
        vm.prank(alice);
        vm.expectEmit(true, true, true, false);
        emit Transfer(address(0), alice, 1);
        nft.mint();
    }

    function test_Mint_BalanceAccumulates() public {
        for (uint256 i = 0; i < 5; i++) {
            vm.prank(alice);
            nft.mint();
        }
        assertEq(nft.balanceOf(alice), 5);
    }

    // ========================================================================
    // batchMint() TESTS
    // ========================================================================

    function test_BatchMint_Basic() public {
        vm.prank(alice);
        uint256[] memory tokenIds = nft.batchMint(3);

        assertEq(tokenIds.length, 3);
        assertEq(nft.balanceOf(alice), 3);
    }

    function test_BatchMint_AnyoneCanBatchMint() public {
        vm.prank(bob);
        uint256[] memory tokenIds = nft.batchMint(5);

        assertEq(tokenIds.length, 5);
        for (uint256 i = 0; i < tokenIds.length; i++) {
            assertEq(nft.ownerOf(tokenIds[i]), bob);
        }
    }

    function test_BatchMint_ReturnsCorrectIds() public {
        // Mint a single token first so IDs start at 2
        vm.prank(alice);
        nft.mint();

        vm.prank(alice);
        uint256[] memory tokenIds = nft.batchMint(3);

        assertEq(tokenIds[0], 2);
        assertEq(tokenIds[1], 3);
        assertEq(tokenIds[2], 4);
    }

    function test_BatchMint_ZeroCount_Reverts() public {
        vm.prank(alice);
        vm.expectRevert("Count must be 1-20");
        nft.batchMint(0);
    }

    function test_BatchMint_ExceedsMaxCount_Reverts() public {
        vm.prank(alice);
        vm.expectRevert("Count must be 1-20");
        nft.batchMint(21);
    }

    function test_BatchMint_ExactMaxCount_Succeeds() public {
        vm.prank(alice);
        uint256[] memory tokenIds = nft.batchMint(20);

        assertEq(tokenIds.length, 20);
        assertEq(nft.balanceOf(alice), 20);
    }

    function test_BatchMint_Count1_Succeeds() public {
        vm.prank(alice);
        uint256[] memory tokenIds = nft.batchMint(1);

        assertEq(tokenIds.length, 1);
        assertEq(nft.ownerOf(tokenIds[0]), alice);
    }

    function test_BatchMint_SequentialAfterSingleMint() public {
        vm.prank(alice);
        uint256 single = nft.mint();

        vm.prank(alice);
        uint256[] memory batch = nft.batchMint(2);

        assertEq(batch[0], single + 1);
        assertEq(batch[1], single + 2);
    }

    function test_BatchMint_AllOwnedByMinter() public {
        vm.prank(alice);
        uint256[] memory tokenIds = nft.batchMint(10);

        for (uint256 i = 0; i < tokenIds.length; i++) {
            assertEq(nft.ownerOf(tokenIds[i]), alice);
        }
    }

    // ========================================================================
    // tokenURI() TESTS
    // ========================================================================

    function test_TokenURI_ExistingToken() public {
        vm.prank(alice);
        uint256 tokenId = nft.mint();

        string memory uri = nft.tokenURI(tokenId);
        assertEq(uri, "testnet-gacha://1", "URI should encode token ID");
    }

    function test_TokenURI_NotEmpty() public {
        vm.prank(alice);
        uint256 tokenId = nft.mint();

        string memory uri = nft.tokenURI(tokenId);
        assertTrue(bytes(uri).length > 0, "URI should not be empty");
    }

    function test_TokenURI_MultipleIds() public {
        vm.prank(alice);
        nft.mint(); // id 1
        vm.prank(alice);
        nft.mint(); // id 2

        assertEq(nft.tokenURI(1), "testnet-gacha://1");
        assertEq(nft.tokenURI(2), "testnet-gacha://2");
    }

    function test_TokenURI_NonExistentToken_Reverts() public {
        vm.expectRevert();
        nft.tokenURI(999);
    }

    function test_TokenURI_LargeTokenId() public {
        // Mint 10 tokens to reach ID 10
        for (uint256 i = 0; i < 10; i++) {
            vm.prank(alice);
            nft.mint();
        }

        string memory uri = nft.tokenURI(10);
        assertEq(uri, "testnet-gacha://10", "large ID should be encoded correctly");
    }

    // ========================================================================
    // No access control — anyone can call any function
    // ========================================================================

    function test_NoAccessControl_AnyAddressCanMint() public {
        address stranger = address(0xDEAD);
        vm.prank(stranger);
        uint256 tokenId = nft.mint();

        assertEq(nft.ownerOf(tokenId), stranger, "stranger should receive the NFT");
    }

    function test_NoAccessControl_AnyAddressCanBatchMint() public {
        address stranger = address(0xBEEF);
        vm.prank(stranger);
        uint256[] memory tokenIds = nft.batchMint(5);

        assertEq(tokenIds.length, 5);
        for (uint256 i = 0; i < tokenIds.length; i++) {
            assertEq(nft.ownerOf(tokenIds[i]), stranger);
        }
    }

    // ========================================================================
    // FUZZ TEST
    // ========================================================================

    function testFuzz_BatchMint_ValidCount(uint8 count) public {
        vm.assume(count >= 1 && count <= 20);

        vm.prank(alice);
        uint256[] memory tokenIds = nft.batchMint(count);

        assertEq(tokenIds.length, count);
        assertEq(nft.balanceOf(alice), count);
    }
}
