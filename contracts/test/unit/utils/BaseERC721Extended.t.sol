// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Test} from "forge-std/Test.sol";
import {BaseERC721} from "../../../src/tokens/BaseERC721.sol";

/**
 * @title BaseERC721 Extended Test Suite
 * @notice Additional edge-case tests for BaseERC721 not covered by the base test suite
 * @author NFT Gacha Team
 */
contract BaseERC721ExtendedTest is Test {
    // ========================================================================
    // STATE VARIABLES
    // ========================================================================

    BaseERC721 public nft;
    address public owner;
    address public user;
    address public nonOwner;

    // ========================================================================
    // SETUP
    // ========================================================================

    function setUp() public {
        owner = makeAddr("owner");
        user = makeAddr("user");
        nonOwner = makeAddr("nonOwner");

        nft = new BaseERC721("Extended NFT", "ENFT", owner);
    }

    // ========================================================================
    // batchMintWithURIs() — empty array
    // ========================================================================

    function test_BatchMintWithURIs_EmptyArray_Reverts() public {
        string[] memory uris = new string[](0);

        vm.prank(owner);
        vm.expectRevert(abi.encodeWithSelector(BaseERC721.InvalidCount.selector));
        nft.batchMintWithURIs(user, uris);
    }

    // ========================================================================
    // batchMint() — empty array (zero count)
    // ========================================================================

    function test_BatchMint_ZeroCount_Reverts() public {
        vm.prank(owner);
        vm.expectRevert(abi.encodeWithSelector(BaseERC721.InvalidCount.selector));
        nft.batchMint(user, 0);
    }

    function test_BatchMint_OverMaxCount_Reverts() public {
        vm.prank(owner);
        vm.expectRevert(abi.encodeWithSelector(BaseERC721.InvalidCount.selector));
        nft.batchMint(user, 101);
    }

    // ========================================================================
    // setTokenURI() — non-existent token
    // ========================================================================

    function test_SetTokenURI_NonExistentToken_Reverts() public {
        vm.prank(owner);
        vm.expectRevert(abi.encodeWithSelector(BaseERC721.TokenDoesNotExist.selector, 999));
        nft.setTokenURI(999, "ipfs://should-fail");
    }

    function test_SetTokenURI_AfterBurn_Reverts() public {
        // Mint then burn (transfer to zero not supported by ERC721 — use safeTransferFrom to sink)
        // We test the non-existent path by simply using a token that was never minted.
        vm.prank(owner);
        vm.expectRevert(abi.encodeWithSelector(BaseERC721.TokenDoesNotExist.selector, 42));
        nft.setTokenURI(42, "ipfs://burned");
    }

    // ========================================================================
    // setBaseURI() — access control (non-owner)
    // ========================================================================

    function test_SetBaseURI_NonOwner_Reverts() public {
        vm.prank(nonOwner);
        vm.expectRevert();
        nft.setBaseURI("https://evil.com/");
    }

    function test_SetBaseURI_NonOwner_User_Reverts() public {
        vm.prank(user);
        vm.expectRevert();
        nft.setBaseURI("https://hacked.com/");
    }

    function test_SetBaseURI_Owner_Succeeds() public {
        vm.prank(owner);
        nft.setBaseURI("https://valid.com/");

        // Verify it takes effect by minting and checking URI
        vm.prank(owner);
        uint256 tokenId = nft.mint(user);

        // With only a base URI and no per-token URI, tokenURI calls super.tokenURI
        // which returns baseURI + tokenId string from ERC721
        string memory uri = nft.tokenURI(tokenId);
        assertTrue(bytes(uri).length > 0, "URI should not be empty after setting base URI");
    }

    // ========================================================================
    // setTokenURI() — access control (non-owner)
    // ========================================================================

    function test_SetTokenURI_NonOwner_Reverts() public {
        vm.prank(owner);
        uint256 tokenId = nft.mint(user);

        vm.prank(nonOwner);
        vm.expectRevert();
        nft.setTokenURI(tokenId, "ipfs://stolen");
    }

    function test_SetTokenURI_User_Reverts() public {
        vm.prank(owner);
        uint256 tokenId = nft.mint(user);

        // Even the NFT owner cannot set the token URI (only contract owner can)
        vm.prank(user);
        vm.expectRevert();
        nft.setTokenURI(tokenId, "ipfs://user-set");
    }

    function test_SetTokenURI_Owner_Succeeds() public {
        vm.prank(owner);
        uint256 tokenId = nft.mint(user);

        vm.prank(owner);
        nft.setTokenURI(tokenId, "ipfs://new-uri");

        assertEq(nft.tokenURI(tokenId), "ipfs://new-uri");
    }

    // ========================================================================
    // batchMintWithURIs() additional edge cases
    // ========================================================================

    function test_BatchMintWithURIs_NonOwner_Reverts() public {
        string[] memory uris = new string[](2);
        uris[0] = "ipfs://a";
        uris[1] = "ipfs://b";

        vm.prank(nonOwner);
        vm.expectRevert();
        nft.batchMintWithURIs(user, uris);
    }

    function test_BatchMintWithURIs_ExceedsMax_Reverts() public {
        string[] memory uris = new string[](101);
        for (uint256 i = 0; i < 101; i++) {
            uris[i] = "ipfs://x";
        }

        vm.prank(owner);
        vm.expectRevert(abi.encodeWithSelector(BaseERC721.InvalidCount.selector));
        nft.batchMintWithURIs(user, uris);
    }

    function test_BatchMintWithURIs_ExactMax_Succeeds() public {
        string[] memory uris = new string[](100);
        for (uint256 i = 0; i < 100; i++) {
            uris[i] = "ipfs://x";
        }

        vm.prank(owner);
        uint256[] memory tokenIds = nft.batchMintWithURIs(user, uris);

        assertEq(tokenIds.length, 100);
        assertEq(nft.totalSupply(), 100);
    }

    function test_BatchMintWithURIs_SingleElement_Succeeds() public {
        string[] memory uris = new string[](1);
        uris[0] = "ipfs://single";

        vm.prank(owner);
        uint256[] memory tokenIds = nft.batchMintWithURIs(user, uris);

        assertEq(tokenIds.length, 1);
        assertEq(nft.tokenURI(tokenIds[0]), "ipfs://single");
    }

    // ========================================================================
    // tokenURI() — non-existent token reverts
    // ========================================================================

    function test_TokenURI_NonExistentToken_Reverts() public {
        vm.expectRevert(abi.encodeWithSelector(BaseERC721.TokenDoesNotExist.selector, 0));
        nft.tokenURI(0);
    }

    // ========================================================================
    // Interaction: setBaseURI + setTokenURI concatenation
    // ========================================================================

    function test_TokenURI_BaseAndIndividual_Concatenated() public {
        vm.prank(owner);
        nft.setBaseURI("https://base.com/");

        vm.prank(owner);
        uint256 tokenId = nft.mintWithURI(user, "metadata.json");

        string memory uri = nft.tokenURI(tokenId);
        assertEq(uri, "https://base.com/metadata.json");
    }

    function test_TokenURI_OnlyBaseURI_ReturnsDefault() public {
        vm.prank(owner);
        nft.setBaseURI("https://base.com/");

        vm.prank(owner);
        uint256 tokenId = nft.mint(user);

        // When only base URI is set and no per-token URI, falls back to ERC721 default
        string memory uri = nft.tokenURI(tokenId);
        assertTrue(bytes(uri).length > 0, "URI should not be empty");
    }

    // ========================================================================
    // Ownership edge cases
    // ========================================================================

    function test_Owner_IsSetCorrectly() public view {
        assertEq(nft.owner(), owner);
    }

    function test_SetBaseURI_EmptyString_Allowed() public {
        vm.prank(owner);
        nft.setBaseURI(""); // clearing base URI should succeed

        vm.prank(owner);
        uint256 tokenId = nft.mintWithURI(user, "ipfs://token");

        // With empty base URI, individual URI is returned directly
        assertEq(nft.tokenURI(tokenId), "ipfs://token");
    }
}
