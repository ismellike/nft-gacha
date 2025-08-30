// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title BaseERC721
/// @notice Minimal owner-mintable ERC721 for local deploys and tests
contract BaseERC721 is ERC721, Ownable {
    uint256 private _nextId;

    constructor(string memory name_, string memory symbol_, address initialOwner)
        ERC721(name_, symbol_)
        Ownable(initialOwner)
    {}

    function mint(address to) external onlyOwner returns (uint256 tokenId) {
        tokenId = _nextId;
        _nextId++;
        _safeMint(to, tokenId);
    }
}

