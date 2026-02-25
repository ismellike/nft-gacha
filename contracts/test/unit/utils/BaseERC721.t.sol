// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Test} from "forge-std/Test.sol";
import {BaseERC721} from "../../../src/tokens/BaseERC721.sol";

/**
 * @title BaseERC721 Test
 * @notice Comprehensive tests for BaseERC721 NFT contract
 * @dev Tests deployment, minting, transfers, approvals, and token URI functionality
 */
contract BaseERC721Test is Test {
    // ========================================================================
    // STATE VARIABLES
    // ========================================================================

    BaseERC721 nft;
    address owner;
    address user;
    address spender;

    // ========================================================================
    // EVENTS
    // ========================================================================

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);

    // ========================================================================
    // SETUP
    // ========================================================================

    function setUp() public {
        owner = address(this);
        user = address(0x1);
        spender = address(0x2);

        nft = new BaseERC721("Test NFT", "TNFT", owner);
    }

    // ========================================================================
    // DEPLOYMENT TESTS
    // ========================================================================

    /**
     * @notice Test correct deployment with parameters
     */
    function test_Deployment() public view {
        assertEq(nft.name(), "Test NFT");
        assertEq(nft.symbol(), "TNFT");
        assertEq(nft.owner(), owner);
        assertEq(nft.totalSupply(), 0);
    }

    /**
     * @notice Test deployment with zero address owner should fail
     */
    function test_Deployment_ZeroOwner() public {
        vm.expectRevert();
        new BaseERC721("Test NFT", "TNFT", address(0));
    }

    // ========================================================================
    // MINT TESTS
    // ========================================================================

    /**
     * @notice Test owner can mint NFT
     */
    function test_Mint_ByOwner() public {
        vm.expectEmit(true, true, true, true);
        emit Transfer(address(0), user, 0);

        uint256 tokenId = nft.mint(user);

        assertEq(tokenId, 0);
        assertEq(nft.ownerOf(tokenId), user);
        assertEq(nft.balanceOf(user), 1);
        assertEq(nft.totalSupply(), 1);
    }

    /**
     * @notice Test non-owner cannot mint NFT
     */
    function test_Mint_NotOwner_Fails() public {
        vm.prank(user);
        vm.expectRevert();
        nft.mint(user);
    }

    /**
     * @notice Test multiple mints increment token IDs correctly
     */
    function test_Mint_MultipleTimes() public {
        uint256 tokenId1 = nft.mint(user);
        uint256 tokenId2 = nft.mint(user);
        uint256 tokenId3 = nft.mint(user);

        assertEq(tokenId1, 0);
        assertEq(tokenId2, 1);
        assertEq(tokenId3, 2);
        assertEq(nft.balanceOf(user), 3);
        assertEq(nft.totalSupply(), 3);
    }

    // ========================================================================
    // MINT WITH URI TESTS
    // ========================================================================

    /**
     * @notice Test mint with URI sets correct URI
     */
    function test_MintWithURI_Success() public {
        string memory uri = "ipfs://test123";

        vm.expectEmit(true, true, true, true);
        emit Transfer(address(0), user, 0);

        uint256 tokenId = nft.mintWithURI(user, uri);

        assertEq(tokenId, 0);
        assertEq(nft.tokenURI(tokenId), uri);
        assertEq(nft.ownerOf(tokenId), user);
    }

    /**
     * @notice Test mint with URI for non-owner fails
     */
    function test_MintWithURI_NotOwner_Fails() public {
        vm.prank(user);
        vm.expectRevert();
        nft.mintWithURI(user, "ipfs://test123");
    }

    // ========================================================================
    // BATCH MINT TESTS
    // ========================================================================

    /**
     * @notice Test batch mint works correctly
     */
    function test_BatchMint_Success() public {
        uint256 count = 10;

        uint256[] memory tokenIds = nft.batchMint(user, count);

        assertEq(tokenIds.length, count);
        assertEq(nft.balanceOf(user), count);
        assertEq(nft.totalSupply(), count);

        for (uint256 i = 0; i < count; i++) {
            assertEq(tokenIds[i], i);
            assertEq(nft.ownerOf(i), user);
        }
    }

    /**
     * @notice Test batch mint with zero count fails
     */
    function test_BatchMint_ZeroCount_Fails() public {
        vm.expectRevert(abi.encodeWithSelector(BaseERC721.InvalidCount.selector));
        nft.batchMint(user, 0);
    }

    /**
     * @notice Test batch mint exceeds maximum fails
     */
    function test_BatchMint_ExceedsMax_Fails() public {
        vm.expectRevert(abi.encodeWithSelector(BaseERC721.InvalidCount.selector));
        nft.batchMint(user, 101);
    }

    /**
     * @notice Test batch mint by non-owner fails
     */
    function test_BatchMint_NotOwner_Fails() public {
        vm.prank(user);
        vm.expectRevert();
        nft.batchMint(user, 10);
    }

    // ========================================================================
    // BATCH MINT WITH URIS TESTS
    // ========================================================================

    /**
     * @notice Test batch mint with URIs sets correct URIs
     */
    function test_BatchMintWithURIs_Success() public {
        string[] memory uris = new string[](3);
        uris[0] = "ipfs://test1";
        uris[1] = "ipfs://test2";
        uris[2] = "ipfs://test3";

        uint256[] memory tokenIds = nft.batchMintWithURIs(user, uris);

        assertEq(tokenIds.length, 3);
        assertEq(nft.balanceOf(user), 3);

        for (uint256 i = 0; i < 3; i++) {
            assertEq(nft.tokenURI(i), uris[i]);
            assertEq(nft.ownerOf(i), user);
        }
    }

    /**
     * @notice Test batch mint with empty URIs array fails
     */
    function test_BatchMintWithURIs_EmptyArray_Fails() public {
        string[] memory uris = new string[](0);

        vm.expectRevert(abi.encodeWithSelector(BaseERC721.InvalidCount.selector));
        nft.batchMintWithURIs(user, uris);
    }

    /**
     * @notice Test batch mint with URIs exceeds maximum fails
     */
    function test_BatchMintWithURIs_ExceedsMax_Fails() public {
        string[] memory uris = new string[](101);

        vm.expectRevert(abi.encodeWithSelector(BaseERC721.InvalidCount.selector));
        nft.batchMintWithURIs(user, uris);
    }

    // ========================================================================
    // TRANSFER TESTS
    // ========================================================================

    /**
     * @notice Test successful NFT transfer
     */
    function test_Transfer_Success() public {
        uint256 tokenId = nft.mint(user);

        vm.prank(user);
        vm.expectEmit(true, true, true, true);
        emit Transfer(user, spender, tokenId);

        nft.transferFrom(user, spender, tokenId);

        assertEq(nft.ownerOf(tokenId), spender);
        assertEq(nft.balanceOf(user), 0);
        assertEq(nft.balanceOf(spender), 1);
    }

    /**
     * @notice Test transfer from non-owner fails
     */
    function test_Transfer_NotOwner_Fails() public {
        uint256 tokenId = nft.mint(user);

        vm.prank(spender);
        vm.expectRevert();
        nft.transferFrom(user, spender, tokenId);
    }

    /**
     * @notice Test transfer to zero address fails
     */
    function test_Transfer_ZeroAddress_Fails() public {
        uint256 tokenId = nft.mint(user);

        vm.prank(user);
        vm.expectRevert();
        nft.transferFrom(user, address(0), tokenId);
    }

    // ========================================================================
    // APPROVE TESTS
    // ========================================================================

    /**
     * @notice Test approval works correctly
     */
    function test_Approve_Success() public {
        uint256 tokenId = nft.mint(user);

        vm.prank(user);
        vm.expectEmit(true, true, true, true);
        emit Approval(user, spender, tokenId);

        nft.approve(spender, tokenId);

        assertEq(nft.getApproved(tokenId), spender);
    }

    /**
     * @notice Test approve from non-owner fails
     */
    function test_Approve_NotOwner_Fails() public {
        uint256 tokenId = nft.mint(user);

        vm.prank(spender);
        vm.expectRevert();
        nft.approve(spender, tokenId);
    }

    /**
     * @notice Test approve for non-existent token fails
     */
    function test_Approve_NonExistentToken_Fails() public {
        vm.prank(user);
        vm.expectRevert();
        nft.approve(spender, 999);
    }

    // ========================================================================
    // SET APPROVAL FOR ALL TESTS
    // ========================================================================

    /**
     * @notice Test setApprovalForAll works correctly
     */
    function test_SetApprovalForAll_Success() public {
        vm.prank(user);

        vm.expectEmit(true, true, false, true);
        emit ApprovalForAll(user, spender, true);

        nft.setApprovalForAll(spender, true);

        assertTrue(nft.isApprovedForAll(user, spender));
    }

    /**
     * @notice Test setApprovalForAll to false works
     */
    function test_SetApprovalForAll_Remove() public {
        vm.prank(user);
        nft.setApprovalForAll(spender, true);

        vm.prank(user);
        nft.setApprovalForAll(spender, false);

        assertFalse(nft.isApprovedForAll(user, spender));
    }

    // ========================================================================
    // TOKEN URI TESTS
    // ========================================================================

    /**
     * @notice Test tokenURI returns individual URI when set
     */
    function test_TokenURI_IndividualURI() public {
        string memory uri = "ipfs://test123";
        uint256 tokenId = nft.mintWithURI(user, uri);

        assertEq(nft.tokenURI(tokenId), uri);
    }

    /**
     * @notice Test tokenURI returns baseURI + tokenURI when both set
     */
    function test_TokenURI_BasePlusIndividual() public {
        string memory baseURI = "https://base.com/";
        string memory individualURI = "123";
        string memory expected = "https://base.com/123";

        uint256 tokenId = nft.mintWithURI(user, individualURI);
        nft.setBaseURI(baseURI);

        assertEq(nft.tokenURI(tokenId), expected);
    }

    /**
     * @notice Test tokenURI for non-existent token fails
     */
    function test_TokenURI_NonExistentToken_Fails() public {
        vm.expectRevert(abi.encodeWithSelector(BaseERC721.TokenDoesNotExist.selector, 999));
        nft.tokenURI(999);
    }

    // ========================================================================
    // SET BASE URI TESTS
    // ========================================================================

    /**
     * @notice Test setBaseURI by owner works
     */
    function test_SetBaseURI_ByOwner() public {
        string memory baseURI = "https://base.com/";

        nft.setBaseURI(baseURI);

        // Should return baseURI when no individual URI is set
        uint256 tokenId = nft.mint(user);

        // tokenURI should concatenate baseURI and tokenId
        string memory uri = nft.tokenURI(tokenId);
        assertEq(bytes(uri).length > 0, true);
    }

    /**
     * @notice Test setBaseURI by non-owner fails
     */
    function test_SetBaseURI_NotOwner_Fails() public {
        vm.prank(user);
        vm.expectRevert();
        nft.setBaseURI("https://base.com/");
    }

    // ========================================================================
    // SET TOKEN URI TESTS
    // ========================================================================

    /**
     * @notice Test setTokenURI by owner works
     */
    function test_SetTokenURI_ByOwner() public {
        string memory uri = "ipfs://newuri";
        uint256 tokenId = nft.mint(user);

        nft.setTokenURI(tokenId, uri);

        assertEq(nft.tokenURI(tokenId), uri);
    }

    /**
     * @notice Test setTokenURI for non-existent token fails
     */
    function test_SetTokenURI_NonExistentToken_Fails() public {
        vm.expectRevert(abi.encodeWithSelector(BaseERC721.TokenDoesNotExist.selector, 999));
        nft.setTokenURI(999, "ipfs://test");
    }

    /**
     * @notice Test setTokenURI by non-owner fails
     */
    function test_SetTokenURI_NotOwner_Fails() public {
        uint256 tokenId = nft.mint(user);

        vm.prank(user);
        vm.expectRevert();
        nft.setTokenURI(tokenId, "ipfs://test");
    }
}
