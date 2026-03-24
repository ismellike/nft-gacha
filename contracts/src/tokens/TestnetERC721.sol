// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/// @title TestnetERC721
/// @notice Freely mintable NFT collection for testnet gacha testing.
///         Anyone can mint. No images — just on-chain metadata with a sequential ID.
contract TestnetERC721 is ERC721 {
    uint256 private _nextId = 1;

    constructor() ERC721("Testnet Gacha NFT", "tGACHA") {}

    /// @notice Mint a single NFT to the caller.
    function mint() external returns (uint256 tokenId) {
        tokenId = _nextId++;
        _mint(msg.sender, tokenId);
    }

    /// @notice Mint multiple NFTs to the caller (max 20 per tx to limit gas).
    function batchMint(uint256 count) external returns (uint256[] memory tokenIds) {
        require(count > 0 && count <= 20, "Count must be 1-20");
        tokenIds = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            uint256 tokenId = _nextId++;
            _mint(msg.sender, tokenId);
            tokenIds[i] = tokenId;
        }
    }

    /// @notice Returns a simple on-chain metadata URI encoding the token ID.
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return string(abi.encodePacked("testnet-gacha://", _toString(tokenId)));
    }

    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits--;
            buffer[digits] = bytes1(uint8(48 + (value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}
