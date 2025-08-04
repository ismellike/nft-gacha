// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract SimpleERC721 is ERC721, Ownable {
    uint256 private _tokenIdCounter;

    constructor(string memory name_, string memory symbol_) ERC721(name_, symbol_) Ownable(msg.sender) {}

    function mint(address to) external onlyOwner returns (uint256) {
        uint256 tokenId = _tokenIdCounter++;
        _mint(to, tokenId);
        return tokenId;
    }

    function batchMint(address to, uint256 amount) external onlyOwner returns (uint256[] memory tokenIds) {
        tokenIds = new uint256[](amount);
        for (uint256 i = 0; i < amount; i++) {
            uint256 tokenId = _tokenIdCounter++;
            _mint(to, tokenId);
            tokenIds[i] = tokenId;
        }
    }

    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter;
    }
}
