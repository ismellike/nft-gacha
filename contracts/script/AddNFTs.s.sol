// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Script, console} from "forge-std/Script.sol";
import {GachaTreasury} from "../src/GachaTreasury.sol";
import {MockERC721} from "../src/MockERC721.sol";

contract AddNFTs is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        // Get contract addresses from environment
        address treasuryAddress = vm.envAddress("TREASURY_CONTRACT_ADDRESS");
        address commonNFTAddress = vm.envAddress("COMMON_NFT_ADDRESS");
        address uncommonNFTAddress = vm.envAddress("UNCOMMON_NFT_ADDRESS");
        address rareNFTAddress = vm.envAddress("RARE_NFT_ADDRESS");
        address epicNFTAddress = vm.envAddress("EPIC_NFT_ADDRESS");
        address legendaryNFTAddress = vm.envAddress("LEGENDARY_NFT_ADDRESS");
        
        console.log("Adding NFTs with account:", deployer);
        console.log("Treasury address:", treasuryAddress);
        
        GachaTreasury treasury = GachaTreasury(treasuryAddress);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Add more Common NFTs (mint 5 more)
        console.log("Adding 5 more Common NFTs...");
        MockERC721 commonNFT = MockERC721(commonNFTAddress);
        address[] memory commonTokens = new address[](5);
        uint256[] memory commonTokenIds = new uint256[](5);
        for (uint i = 0; i < 5; i++) {
            uint256 tokenId = commonNFT.mint(deployer);
            commonTokens[i] = commonNFTAddress;
            commonTokenIds[i] = tokenId;
            console.log("Minted Common NFT tokenId:", tokenId);
        }
        // Approve treasury to transfer all common NFTs
        commonNFT.setApprovalForAll(address(treasury), true);
        GachaTreasury.Rarity[] memory commonRarities = new GachaTreasury.Rarity[](5);
        for (uint i = 0; i < 5; i++) {
            commonRarities[i] = GachaTreasury.Rarity.Common;
        }
        treasury.batchDepositNFT(commonTokens, commonTokenIds, commonRarities);
        console.log("Deposited 5 additional Common NFTs");
        
        // Add more Uncommon NFTs (mint 3 more)
        console.log("Adding 3 more Uncommon NFTs...");
        MockERC721 uncommonNFT = MockERC721(uncommonNFTAddress);
        address[] memory uncommonTokens = new address[](3);
        uint256[] memory uncommonTokenIds = new uint256[](3);
        for (uint i = 0; i < 3; i++) {
            uint256 tokenId = uncommonNFT.mint(deployer);
            uncommonTokens[i] = uncommonNFTAddress;
            uncommonTokenIds[i] = tokenId;
            console.log("Minted Uncommon NFT tokenId:", tokenId);
        }
        // Approve treasury to transfer all uncommon NFTs
        uncommonNFT.setApprovalForAll(address(treasury), true);
        GachaTreasury.Rarity[] memory uncommonRarities = new GachaTreasury.Rarity[](3);
        for (uint i = 0; i < 3; i++) {
            uncommonRarities[i] = GachaTreasury.Rarity.Uncommon;
        }
        treasury.batchDepositNFT(uncommonTokens, uncommonTokenIds, uncommonRarities);
        console.log("Deposited 3 additional Uncommon NFTs");
        
        // Add 1 more Rare NFT
        console.log("Adding 1 more Rare NFT...");
        MockERC721 rareNFT = MockERC721(rareNFTAddress);
        address[] memory rareTokens = new address[](1);
        uint256[] memory rareTokenIds = new uint256[](1);
        uint256 rareTokenId = rareNFT.mint(deployer);
        rareTokens[0] = rareNFTAddress;
        rareTokenIds[0] = rareTokenId;
        console.log("Minted Rare NFT tokenId:", rareTokenId);
        // Approve treasury to transfer rare NFT
        rareNFT.setApprovalForAll(address(treasury), true);
        GachaTreasury.Rarity[] memory rareRarities = new GachaTreasury.Rarity[](1);
        rareRarities[0] = GachaTreasury.Rarity.Rare;
        treasury.batchDepositNFT(rareTokens, rareTokenIds, rareRarities);
        console.log("Deposited 1 additional Rare NFT");
        
        vm.stopBroadcast();
        
        // Get updated treasury stats
        uint256 commonCount = treasury.getTreasuryItems(GachaTreasury.Rarity.Common).length;
        uint256 uncommonCount = treasury.getTreasuryItems(GachaTreasury.Rarity.Uncommon).length;
        uint256 rareCount = treasury.getTreasuryItems(GachaTreasury.Rarity.Rare).length;
        uint256 epicCount = treasury.getTreasuryItems(GachaTreasury.Rarity.Epic).length;
        uint256 legendaryCount = treasury.getTreasuryItems(GachaTreasury.Rarity.Legendary).length;
        
        console.log("\n=== Updated Treasury Stats ===");
        console.log("Common NFTs:        ", commonCount);
        console.log("Uncommon NFTs:      ", uncommonCount);
        console.log("Rare NFTs:          ", rareCount);
        console.log("Epic NFTs:          ", epicCount);
        console.log("Legendary NFTs:     ", legendaryCount);
        console.log("Total NFTs:         ", commonCount + uncommonCount + rareCount + epicCount + legendaryCount);
        
        console.log("\\n NFTs added successfully!");
    }
}