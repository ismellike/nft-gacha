// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {IERC721} from "forge-std/interfaces/IERC721.sol";
import {IERC721Receiver} from "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract GachaTreasury is IERC721Receiver, Ownable {
    enum Rarity {
        Common,
        Uncommon,
        Rare,
        Epic,
        Legendary
    }

    struct NFTItem {
        address collection;
        uint256 tokenId;
        Rarity rarity;
    }

    mapping(Rarity => NFTItem[]) public treasury;
    mapping(Rarity => uint256) public rarityCount;
    address public gachaContract;

    event NFTDeposited(address indexed collection, uint256 indexed tokenId, Rarity rarity);
    event NFTWithdrawn(address indexed collection, uint256 indexed tokenId, Rarity rarity, address to);
    event GachaContractUpdated(address indexed oldGacha, address indexed newGacha);

    constructor(address _owner) Ownable(_owner) {}

    function depositNFT(address collection, uint256 tokenId, Rarity rarity) external onlyOwner {
        require(collection != address(0), "GachaTreasury: Invalid collection address");
        
        IERC721(collection).safeTransferFrom(msg.sender, address(this), tokenId);
        
        NFTItem memory newItem = NFTItem({
            collection: collection,
            tokenId: tokenId,
            rarity: rarity
        });
        
        treasury[rarity].push(newItem);
        rarityCount[rarity]++;
        
        emit NFTDeposited(collection, tokenId, rarity);
    }

    function withdrawNFT(Rarity rarity, uint256 index, address to) external onlyOwner {
        require(index < treasury[rarity].length, "GachaTreasury: Invalid index");
        require(to != address(0), "GachaTreasury: Invalid recipient address");
        
        NFTItem memory item = treasury[rarity][index];
        
        treasury[rarity][index] = treasury[rarity][treasury[rarity].length - 1];
        treasury[rarity].pop();
        rarityCount[rarity]--;
        
        IERC721(item.collection).safeTransferFrom(address(this), to, item.tokenId);
        
        emit NFTWithdrawn(item.collection, item.tokenId, rarity, to);
    }

    function sendNFTToWinner(Rarity rarity, uint256 index, address winner) external returns (NFTItem memory) {
        require(msg.sender == gachaContract, "GachaTreasury: Only gacha contract can send NFTs to winners");
        require(index < treasury[rarity].length, "GachaTreasury: Invalid index");
        require(winner != address(0), "GachaTreasury: Invalid winner address");
        
        NFTItem memory item = treasury[rarity][index];
        
        treasury[rarity][index] = treasury[rarity][treasury[rarity].length - 1];
        treasury[rarity].pop();
        rarityCount[rarity]--;
        
        IERC721(item.collection).safeTransferFrom(address(this), winner, item.tokenId);
        
        emit NFTWithdrawn(item.collection, item.tokenId, rarity, winner);
        return item;
    }

    function getTreasuryItems(Rarity rarity) external view returns (NFTItem[] memory) {
        return treasury[rarity];
    }

    function getTreasuryItem(Rarity rarity, uint256 index) external view returns (NFTItem memory) {
        require(index < treasury[rarity].length, "GachaTreasury: Invalid index");
        return treasury[rarity][index];
    }

    function getRarityCount(Rarity rarity) external view returns (uint256) {
        return rarityCount[rarity];
    }

    function getTotalItemsCount() external view returns (uint256) {
        return rarityCount[Rarity.Common] + 
               rarityCount[Rarity.Uncommon] + 
               rarityCount[Rarity.Rare] + 
               rarityCount[Rarity.Epic] + 
               rarityCount[Rarity.Legendary];
    }

    function setGachaContract(address _gachaContract) external onlyOwner {
        require(_gachaContract != address(0), "GachaTreasury: Invalid gacha contract address");
        address oldGacha = gachaContract;
        gachaContract = _gachaContract;
        emit GachaContractUpdated(oldGacha, _gachaContract);
    }

    function onERC721Received(
        address, // operator
        address, // from
        uint256, // tokenId
        bytes calldata // data
    ) external pure override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }
}