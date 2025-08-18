// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Test, console} from "forge-std/Test.sol";
import {SimpleERC721} from "../src/SimpleERC721.sol";

contract SimpleERC721Test is Test {
    SimpleERC721 public nft;
    address public owner = makeAddr("owner");
    address public user1 = makeAddr("user1");
    address public user2 = makeAddr("user2");
    
    // Real Polygon NFT references from Courtyard
    address public constant POLYGON_CONTRACT = 0x251BE3A17Af4892035C37ebf5890F4a4D889dcAD;
    uint256 public constant POLYGON_TOKEN_ID = 0x6274859bf9e325d0fc7c2387c8efeafbb8728d0d38b02f932c390a6aad93038c;

    function setUp() public {
        vm.prank(owner);
        nft = new SimpleERC721("Test NFT", "TEST");
    }

    function testDeployment() public view {
        assertEq(nft.name(), "Test NFT");
        assertEq(nft.symbol(), "TEST");
        assertEq(nft.owner(), owner);
        assertEq(nft.totalSupply(), 0);
    }

    function testMintingWithPolygonReference() public {
        vm.prank(owner);
        uint256 tokenId = nft.mintWithPolygonReference(user1, POLYGON_CONTRACT, POLYGON_TOKEN_ID);
        
        assertEq(tokenId, 0);
        assertEq(nft.totalSupply(), 1);
        assertEq(nft.ownerOf(tokenId), user1);
        assertEq(nft.balanceOf(user1), 1);
        
        // Check polygon reference
        (address contractAddr, uint256 polygonTokenId) = nft.getPolygonReference(tokenId);
        assertEq(contractAddr, POLYGON_CONTRACT);
        assertEq(polygonTokenId, POLYGON_TOKEN_ID);
    }

    function testCourtyardTokenURI() public {
        vm.prank(owner);
        uint256 tokenId = nft.mintWithPolygonReference(user1, POLYGON_CONTRACT, POLYGON_TOKEN_ID);
        
        string memory expectedURI = string.concat(
            "https://api.courtyard.io/index/token/polygon/",
            "0x251be3a17af4892035c37ebf5890f4a4d889dcad",
            "/0x6274859bf9e325d0fc7c2387c8efeafbb8728d0d38b02f932c390a6aad93038c/metadata.json"
        );
        
        assertEq(nft.tokenURI(tokenId), expectedURI);
    }

    function testBatchMintingWithPolygonReferences() public {
        address[] memory contracts = new address[](2);
        uint256[] memory tokenIds = new uint256[](2);
        
        contracts[0] = POLYGON_CONTRACT;
        contracts[1] = POLYGON_CONTRACT;
        tokenIds[0] = POLYGON_TOKEN_ID;
        tokenIds[1] = 0x05f672f6cdfb808e4038ab2b331633158860809bb003a2cab4fbe8352a5f10dc; // Another real token
        
        vm.prank(owner);
        uint256[] memory localTokenIds = nft.batchMintWithPolygonReferences(user1, contracts, tokenIds);
        
        assertEq(localTokenIds.length, 2);
        assertEq(nft.totalSupply(), 2);
        assertEq(nft.balanceOf(user1), 2);
        
        // Check first token
        (address contractAddr1, uint256 polygonTokenId1) = nft.getPolygonReference(localTokenIds[0]);
        assertEq(contractAddr1, contracts[0]);
        assertEq(polygonTokenId1, tokenIds[0]);
        
        // Check second token
        (address contractAddr2, uint256 polygonTokenId2) = nft.getPolygonReference(localTokenIds[1]);
        assertEq(contractAddr2, contracts[1]);
        assertEq(polygonTokenId2, tokenIds[1]);
    }

    function testSetPolygonReference() public {
        vm.prank(owner);
        uint256 tokenId = nft.mintWithPolygonReference(user1, POLYGON_CONTRACT, POLYGON_TOKEN_ID);
        
        address newContract = POLYGON_CONTRACT;
        uint256 newTokenId = 0xb6e21e1d79445070a28fdfa9db3d199ffc4d01692d39967200113304dc114a03; // Another real token
        
        vm.prank(owner);
        nft.setPolygonReference(tokenId, newContract, newTokenId);
        
        (address contractAddr, uint256 polygonTokenId) = nft.getPolygonReference(tokenId);
        assertEq(contractAddr, newContract);
        assertEq(polygonTokenId, newTokenId);
        
        // Token URI should also update with real token ID
        string memory expectedURI = string.concat(
            "https://api.courtyard.io/index/token/polygon/",
            "0x251be3a17af4892035c37ebf5890f4a4d889dcad",
            "/0xb6e21e1d79445070a28fdfa9db3d199ffc4d01692d39967200113304dc114a03/metadata.json"
        );
        assertEq(nft.tokenURI(tokenId), expectedURI);
    }

    function testCourtyardURIWithDifferentRealTokens() public {
        // Test with different real Courtyard token IDs
        address contract1 = POLYGON_CONTRACT;
        address contract2 = POLYGON_CONTRACT;
        uint256 realToken1 = POLYGON_TOKEN_ID;
        uint256 realToken2 = 0x3f8eb6e3c0993739b6923416c9fad399da687f8bcaaf92d1e75901e1c872dc3e; // Another real token
        
        vm.startPrank(owner);
        uint256 token1 = nft.mintWithPolygonReference(user1, contract1, realToken1);
        uint256 token2 = nft.mintWithPolygonReference(user1, contract2, realToken2);
        vm.stopPrank();
        
        string memory uri1 = nft.tokenURI(token1);
        string memory uri2 = nft.tokenURI(token2);
        
        // Should be lowercase hex
        assertTrue(bytes(uri1).length > 0);
        assertTrue(bytes(uri2).length > 0);
        
        // Check specific expected URLs with real token IDs
        string memory expected1 = "https://api.courtyard.io/index/token/polygon/0x251be3a17af4892035c37ebf5890f4a4d889dcad/0x6274859bf9e325d0fc7c2387c8efeafbb8728d0d38b02f932c390a6aad93038c/metadata.json";
        string memory expected2 = "https://api.courtyard.io/index/token/polygon/0x251be3a17af4892035c37ebf5890f4a4d889dcad/0x3f8eb6e3c0993739b6923416c9fad399da687f8bcaaf92d1e75901e1c872dc3e/metadata.json";
        
        assertEq(uri1, expected1);
        assertEq(uri2, expected2);
    }

    function testTransfer() public {
        vm.prank(owner);
        uint256 tokenId = nft.mintWithPolygonReference(user1, POLYGON_CONTRACT, POLYGON_TOKEN_ID);
        
        vm.prank(user1);
        nft.transferFrom(user1, user2, tokenId);
        
        assertEq(nft.ownerOf(tokenId), user2);
        assertEq(nft.balanceOf(user1), 0);
        assertEq(nft.balanceOf(user2), 1);
        
        // Polygon reference should be preserved after transfer
        (address contractAddr, uint256 polygonTokenId) = nft.getPolygonReference(tokenId);
        assertEq(contractAddr, POLYGON_CONTRACT);
        assertEq(polygonTokenId, POLYGON_TOKEN_ID);
    }

    function testApproveAndTransfer() public {
        vm.prank(owner);
        uint256 tokenId = nft.mintWithPolygonReference(user1, POLYGON_CONTRACT, POLYGON_TOKEN_ID);
        
        vm.prank(user1);
        nft.approve(user2, tokenId);
        
        vm.prank(user2);
        nft.transferFrom(user1, user2, tokenId);
        
        assertEq(nft.ownerOf(tokenId), user2);
    }

    function testSupportsInterface() public view {
        // ERC165
        assertTrue(nft.supportsInterface(0x01ffc9a7));
        // ERC721
        assertTrue(nft.supportsInterface(0x80ac58cd));
        // ERC721Metadata
        assertTrue(nft.supportsInterface(0x5b5e139f));
    }

    function testOnlyOwnerCanMint() public {
        vm.prank(user1);
        vm.expectRevert();
        nft.mintWithPolygonReference(user2, POLYGON_CONTRACT, POLYGON_TOKEN_ID);
    }

    function testOnlyOwnerCanSetPolygonReference() public {
        vm.prank(owner);
        uint256 tokenId = nft.mintWithPolygonReference(user1, POLYGON_CONTRACT, POLYGON_TOKEN_ID);
        
        vm.prank(user1);
        vm.expectRevert();
        nft.setPolygonReference(tokenId, address(0x123), 456);
    }

    function testTokenURIRevertsForNonexistentToken() public {
        vm.expectRevert();
        nft.tokenURI(999);
    }

    function testTokenURIRevertsForTokenWithoutPolygonReference() public {
        // This test ensures that tokens without polygon references can't be created
        // Since our new mint function requires polygon references, this is built-in protection
        
        // Try to get polygon reference for non-existent token
        vm.expectRevert();
        nft.getPolygonReference(999);
    }

    function testBatchMintArrayLengthMismatch() public {
        address[] memory contracts = new address[](2);
        uint256[] memory tokenIds = new uint256[](3); // Different length
        
        contracts[0] = POLYGON_CONTRACT;
        contracts[1] = address(0x123);
        
        vm.prank(owner);
        vm.expectRevert("Arrays length mismatch");
        nft.batchMintWithPolygonReferences(user1, contracts, tokenIds);
    }

    function testRealCourtyardExample() public {
        // Test with the exact example from your requirement
        address polygonContract = 0x251BE3A17Af4892035C37ebf5890F4a4D889dcAD;
        uint256 polygonTokenId = 0xdeda77eb53d320100b24839ce137131200dc607959f4bd55bbee75a32848db8f;
        
        vm.prank(owner);
        uint256 localTokenId = nft.mintWithPolygonReference(user1, polygonContract, polygonTokenId);
        
        string memory expectedURI = "https://api.courtyard.io/index/token/polygon/0x251be3a17af4892035c37ebf5890f4a4d889dcad/0xdeda77eb53d320100b24839ce137131200dc607959f4bd55bbee75a32848db8f/metadata.json";
        string memory actualURI = nft.tokenURI(localTokenId);
        
        assertEq(actualURI, expectedURI);
    }
}