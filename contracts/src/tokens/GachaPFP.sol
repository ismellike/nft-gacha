// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

/// @title GachaPFP
/// @notice Free-mint NFT profile picture collection with on-chain rarity traits.
///         Rarity is assigned deterministically at mint time using block.prevrandao.
///         Metadata is fully on-chain (data URI with JSON) for marketplace compatibility.
contract GachaPFP is ERC721 {
    using Strings for uint256;

    enum Rarity {
        Common, // 40%
        Uncommon, // 25%
        Rare, // 18%
        Epic, // 10%
        Legendary, // 5%
        Mythic // 2%
    }

    uint256 private _nextId = 1;

    /// @notice Rarity assigned to each token at mint time
    mapping(uint256 => Rarity) public tokenRarity;

    constructor() ERC721("Gacha PFP", "GPFP") {}

    /// @notice Mint a single PFP NFT to the caller. Rarity is assigned automatically.
    function mint() external returns (uint256 tokenId) {
        tokenId = _nextId++;
        tokenRarity[tokenId] = _determineRarity(tokenId);
        _mint(msg.sender, tokenId);
    }

    /// @notice Returns fully on-chain JSON metadata with rarity trait.
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);

        string memory rarityStr = _rarityString(tokenRarity[tokenId]);

        bytes memory json = abi.encodePacked(
            '{"name":"Gacha PFP #',
            tokenId.toString(),
            '","description":"Gacha PFP Collection - ',
            rarityStr,
            '","attributes":[{"trait_type":"Rarity","value":"',
            rarityStr,
            '"}]}'
        );

        return string(abi.encodePacked("data:application/json;base64,", Base64.encode(json)));
    }

    /// @notice Deterministic rarity assignment using block randomness.
    /// @dev Uses keccak256(tokenId, prevrandao) for unpredictable but verifiable rarity.
    function _determineRarity(uint256 tokenId) internal view returns (Rarity) {
        uint256 roll = uint256(keccak256(abi.encodePacked(tokenId, block.prevrandao))) % 10000;

        if (roll < 4000) return Rarity.Common; // 40%
        if (roll < 6500) return Rarity.Uncommon; // 25%
        if (roll < 8300) return Rarity.Rare; // 18%
        if (roll < 9300) return Rarity.Epic; // 10%
        if (roll < 9800) return Rarity.Legendary; //  5%
        return Rarity.Mythic; //  2%
    }

    function _rarityString(Rarity r) internal pure returns (string memory) {
        if (r == Rarity.Common) return "Common";
        if (r == Rarity.Uncommon) return "Uncommon";
        if (r == Rarity.Rare) return "Rare";
        if (r == Rarity.Epic) return "Epic";
        if (r == Rarity.Legendary) return "Legendary";
        return "Mythic";
    }
}
