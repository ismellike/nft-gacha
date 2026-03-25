// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {Ownable} from "solady/auth/Ownable.sol";

/// @title BaseERC721
/// @notice Minimal owner-mintable ERC721 for local deploys and tests with tokenURI support
contract BaseERC721 is ERC721Enumerable, Ownable {
    /// @notice Custom errors
    error InvalidCount();
    error TokenDoesNotExist(uint256 tokenId);

    uint256 private _nextId;

    /// @notice Mapping from token ID to token URI
    mapping(uint256 => string) private _tokenURIs;

    /// @notice Base URI for all tokens
    string private _baseTokenURI;

    constructor(string memory name_, string memory symbol_, address initialOwner) ERC721(name_, symbol_) {
        require(initialOwner != address(0), "Owner cannot be zero address");
        _initializeOwner(initialOwner);
    }

    function _guardInitializeOwner() internal pure override returns (bool) {
        return true;
    }

    function mint(address to) external onlyOwner returns (uint256 tokenId) {
        tokenId = _nextId;
        _nextId++;
        _safeMint(to, tokenId);
    }

    function mintWithURI(address to, string calldata uri) external onlyOwner returns (uint256 tokenId) {
        tokenId = _nextId;
        _nextId++;
        _safeMint(to, tokenId);
        _tokenURIs[tokenId] = uri;
    }

    function batchMint(address to, uint256 count) external onlyOwner returns (uint256[] memory tokenIds) {
        if (count == 0 || count > 100) revert InvalidCount();

        tokenIds = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            tokenIds[i] = _nextId;
            _safeMint(to, _nextId);
            _nextId++;
        }
    }

    function batchMintWithURIs(address to, string[] calldata uris)
        external
        onlyOwner
        returns (uint256[] memory tokenIds)
    {
        if (uris.length == 0 || uris.length > 100) revert InvalidCount();

        tokenIds = new uint256[](uris.length);
        for (uint256 i = 0; i < uris.length; i++) {
            tokenIds[i] = _nextId;
            _safeMint(to, _nextId);
            _tokenURIs[_nextId] = uris[i];
            _nextId++;
        }
    }

    function setTokenURI(uint256 tokenId, string calldata uri) external onlyOwner {
        if (_ownerOf(tokenId) == address(0)) revert TokenDoesNotExist(tokenId);
        _tokenURIs[tokenId] = uri;
    }

    function setBaseURI(string calldata baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        if (_ownerOf(tokenId) == address(0)) revert TokenDoesNotExist(tokenId);

        string memory _tokenURI = _tokenURIs[tokenId];
        string memory base = _baseURI();

        // If there is no base URI, return the token URI.
        if (bytes(base).length == 0) {
            return _tokenURI;
        }
        // If both are set, concatenate the baseURI and tokenURI (via string.concat).
        if (bytes(_tokenURI).length > 0) {
            return string.concat(base, _tokenURI);
        }

        return super.tokenURI(tokenId);
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
}
