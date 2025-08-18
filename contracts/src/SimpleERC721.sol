// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SimpleERC721
 * @notice ERC721 contract that generates Courtyard.io API URLs for real Polygon NFTs
 * @dev Maps local token IDs to real Polygon contract addresses and token IDs
 */
contract SimpleERC721 is ERC721, Ownable {
    uint256 private _tokenIdCounter;
    
    // Mapping from local token ID to Polygon contract address and token ID
    struct PolygonNFT {
        address contractAddress;
        uint256 tokenId;
    }
    mapping(uint256 => PolygonNFT) private _polygonNFTs;
    
    // Courtyard API base URL
    string private constant COURTYARD_BASE = "https://api.courtyard.io/index/token/polygon/";

    constructor(string memory name_, string memory symbol_) ERC721(name_, symbol_) Ownable(msg.sender) {}

    function mintWithPolygonReference(address to, address polygonContract, uint256 polygonTokenId) external onlyOwner returns (uint256) {
        uint256 tokenId = _tokenIdCounter++;
        _mint(to, tokenId);
        _polygonNFTs[tokenId] = PolygonNFT({
            contractAddress: polygonContract,
            tokenId: polygonTokenId
        });
        return tokenId;
    }
    
    // Backward compatibility function for existing tests
    function mint(address to) external onlyOwner returns (uint256) {
        // Use a default REAL polygon reference for backward compatibility
        address defaultPolygonContract = 0x251BE3A17Af4892035C37ebf5890F4a4D889dcAD;
        uint256 defaultTokenId = 0x6274859bf9e325d0fc7c2387c8efeafbb8728d0d38b02f932c390a6aad93038c; // REAL Courtyard token
        
        uint256 tokenId = _tokenIdCounter++;
        _mint(to, tokenId);
        _polygonNFTs[tokenId] = PolygonNFT({
            contractAddress: defaultPolygonContract,
            tokenId: defaultTokenId
        });
        return tokenId;
    }
    

    function batchMintWithPolygonReferences(
        address to, 
        address[] memory polygonContracts, 
        uint256[] memory polygonTokenIds
    ) external onlyOwner returns (uint256[] memory tokenIds) {
        require(polygonContracts.length == polygonTokenIds.length, "Arrays length mismatch");
        
        tokenIds = new uint256[](polygonContracts.length);
        for (uint256 i = 0; i < polygonContracts.length; i++) {
            uint256 tokenId = _tokenIdCounter++;
            _mint(to, tokenId);
            _polygonNFTs[tokenId] = PolygonNFT({
                contractAddress: polygonContracts[i],
                tokenId: polygonTokenIds[i]
            });
            tokenIds[i] = tokenId;
        }
    }

    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter;
    }
    
    
    function setPolygonReference(uint256 tokenId, address polygonContract, uint256 polygonTokenId) external onlyOwner {
        _requireOwned(tokenId);
        _polygonNFTs[tokenId] = PolygonNFT({
            contractAddress: polygonContract,
            tokenId: polygonTokenId
        });
    }
    
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        
        PolygonNFT memory polygonNFT = _polygonNFTs[tokenId];
        require(polygonNFT.contractAddress != address(0), "Polygon reference not set");
        
        // Generate Courtyard API URL
        // Format: https://api.courtyard.io/index/token/polygon/{contractAddress}/{tokenId}/metadata.json
        string memory tokenIdStr = _getTokenIdString(polygonNFT.tokenId);
        
        return string.concat(
            COURTYARD_BASE,
            _toHexString(polygonNFT.contractAddress),
            "/",
            tokenIdStr,
            "/metadata.json"
        );
    }
    
    /**
     * @notice Gets the Polygon NFT reference for a token
     * @param tokenId The local token ID
     * @return contractAddress The Polygon contract address
     * @return polygonTokenId The Polygon token ID
     */
    function getPolygonReference(uint256 tokenId) external view returns (address contractAddress, uint256 polygonTokenId) {
        _requireOwned(tokenId);
        PolygonNFT memory polygonNFT = _polygonNFTs[tokenId];
        return (polygonNFT.contractAddress, polygonNFT.tokenId);
    }
    
    /**
     * @notice Converts a uint256 to its ASCII string decimal representation
     */
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
    
    /**
     * @notice Converts an address to its ASCII string hexadecimal representation (lowercase)
     */
    function _toHexString(address addr) internal pure returns (string memory) {
        return _toHexString(uint256(uint160(addr)), 20);
    }
    
    /**
     * @notice Converts a uint256 to its ASCII string hexadecimal representation (lowercase)
     */
    function _toHexString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0x00";
        }
        uint256 temp = value;
        uint256 length = 0;
        while (temp != 0) {
            length++;
            temp >>= 8;
        }
        return _toHexString(value, length);
    }
    
    /**
     * @notice Converts a uint256 to its ASCII string hexadecimal representation with fixed length
     */
    function _toHexString(uint256 value, uint256 length) internal pure returns (string memory) {
        bytes memory buffer = new bytes(2 * length + 2);
        buffer[0] = "0";
        buffer[1] = "x";
        for (uint256 i = 2 * length + 1; i > 1; --i) {
            buffer[i] = _SYMBOLS[value & 0xf];
            value >>= 4;
        }
        require(value == 0, "Strings: hex length insufficient");
        return string(buffer);
    }
    
    bytes16 private constant _SYMBOLS = "0123456789abcdef";
    
    /**
     * @notice Extract substring from string
     */
    function substring(string memory str, uint256 startIndex, uint256 length) internal pure returns (string memory) {
        bytes memory strBytes = bytes(str);
        require(startIndex + length <= strBytes.length, "Substring out of bounds");
        
        bytes memory result = new bytes(length);
        for (uint256 i = 0; i < length; i++) {
            result[i] = strBytes[startIndex + i];
        }
        
        return string(result);
    }
    
    /**
     * @notice Gets token ID string representation - hex for large values, decimal for small values
     */
    function _getTokenIdString(uint256 tokenId) internal pure returns (string memory) {
        // If token ID is very large (more than 18 decimal digits), it's likely a hex-based ID
        if (tokenId > 1e18) {
            // For Courtyard URLs, we need the full hex string with 0x prefix
            return _toHexString(tokenId, 32);
        } else {
            // For smaller values, use decimal representation
            return _toString(tokenId);
        }
    }
    
    /**
     * @notice Remove leading zeros from hex string
     */
    function _removeLeadingZeros(string memory hexStr) internal pure returns (string memory) {
        bytes memory hexBytes = bytes(hexStr);
        uint256 firstNonZero = 0;
        
        // Find first non-zero character
        for (uint256 i = 0; i < hexBytes.length; i++) {
            if (hexBytes[i] != '0') {
                firstNonZero = i;
                break;
            }
        }
        
        // If all zeros, return "0"
        if (firstNonZero == 0 && hexBytes[0] == '0' && hexBytes.length > 1) {
            return "0";
        }
        
        return substring(hexStr, firstNonZero, hexBytes.length - firstNonZero);
    }
    
}
