// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Script, console} from "forge-std/Script.sol";
import {GachaTreasury} from "../src/GachaTreasury.sol";
import {SimpleERC721} from "../src/SimpleERC721.sol";

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
        SimpleERC721 commonNFT = SimpleERC721(commonNFTAddress);
        address[] memory commonTokens = new address[](5);
        uint256[] memory commonTokenIds = new uint256[](5);
        for (uint256 i = 0; i < 5; i++) {
            uint256 tokenId = commonNFT.mint(deployer);
            commonTokens[i] = commonNFTAddress;
            commonTokenIds[i] = tokenId;
            console.log("Minted Common NFT tokenId:", tokenId);
        }
        // Approve treasury to transfer all common NFTs
        commonNFT.setApprovalForAll(address(treasury), true);
        GachaTreasury.Rarity[] memory commonRarities = new GachaTreasury.Rarity[](5);
        for (uint256 i = 0; i < 5; i++) {
            commonRarities[i] = GachaTreasury.Rarity.Common;
        }
        treasury.batchDepositNFT(commonTokens, commonTokenIds, commonRarities);
        console.log("Deposited 5 additional Common NFTs");

        // Add more Uncommon NFTs (mint 3 more)
        console.log("Adding 3 more Uncommon NFTs...");
        SimpleERC721 uncommonNFT = SimpleERC721(uncommonNFTAddress);
        address[] memory uncommonTokens = new address[](3);
        uint256[] memory uncommonTokenIds = new uint256[](3);
        for (uint256 i = 0; i < 3; i++) {
            uint256 tokenId = uncommonNFT.mint(deployer);
            uncommonTokens[i] = uncommonNFTAddress;
            uncommonTokenIds[i] = tokenId;
            console.log("Minted Uncommon NFT tokenId:", tokenId);
        }
        // Approve treasury to transfer all uncommon NFTs
        uncommonNFT.setApprovalForAll(address(treasury), true);
        GachaTreasury.Rarity[] memory uncommonRarities = new GachaTreasury.Rarity[](3);
        for (uint256 i = 0; i < 3; i++) {
            uncommonRarities[i] = GachaTreasury.Rarity.Uncommon;
        }
        treasury.batchDepositNFT(uncommonTokens, uncommonTokenIds, uncommonRarities);
        console.log("Deposited 3 additional Uncommon NFTs");

        // Add 1 more Rare NFT
        console.log("Adding 1 more Rare NFT...");
        SimpleERC721 rareNFT = SimpleERC721(rareNFTAddress);
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

        // Add 1 more Epic NFT
        console.log("Adding 1 more Epic NFT...");
        SimpleERC721 epicNFT = SimpleERC721(epicNFTAddress);
        address[] memory epicTokens = new address[](1);
        uint256[] memory epicTokenIds = new uint256[](1);
        uint256 epicTokenId = epicNFT.mint(deployer);
        epicTokens[0] = epicNFTAddress;
        epicTokenIds[0] = epicTokenId;
        console.log("Minted Epic NFT tokenId:", epicTokenId);
        // Approve treasury to transfer epic NFT
        epicNFT.setApprovalForAll(address(treasury), true);
        GachaTreasury.Rarity[] memory epicRarities = new GachaTreasury.Rarity[](1);
        epicRarities[0] = GachaTreasury.Rarity.Epic;
        treasury.batchDepositNFT(epicTokens, epicTokenIds, epicRarities);
        console.log("Deposited 1 additional Epic NFT");

        // Add 1 more Legendary NFT
        console.log("Adding 1 more Legendary NFT...");
        SimpleERC721 legendaryNFT = SimpleERC721(legendaryNFTAddress);
        address[] memory legendaryTokens = new address[](1);
        uint256[] memory legendaryTokenIds = new uint256[](1);
        uint256 legendaryTokenId = legendaryNFT.mint(deployer);
        legendaryTokens[0] = legendaryNFTAddress;
        legendaryTokenIds[0] = legendaryTokenId;
        console.log("Minted Legendary NFT tokenId:", legendaryTokenId);
        // Approve treasury to transfer legendary NFT
        legendaryNFT.setApprovalForAll(address(treasury), true);
        GachaTreasury.Rarity[] memory legendaryRarities = new GachaTreasury.Rarity[](1);
        legendaryRarities[0] = GachaTreasury.Rarity.Legendary;
        treasury.batchDepositNFT(legendaryTokens, legendaryTokenIds, legendaryRarities);
        console.log("Deposited 1 additional Legendary NFT");

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
