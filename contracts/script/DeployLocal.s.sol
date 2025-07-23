// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Script, console} from "forge-std/Script.sol";
import {RandomnessConsumer} from "../src/GachaServiceHandler.sol";
import {IWavsServiceManager} from "@wavs/eigenlayer/ecdsa/interfaces/IWavsServiceManager.sol";
import {Gacha} from "../src/Gacha.sol";
import {GachaTreasury} from "../src/GachaTreasury.sol";
import {MockERC721} from "../src/MockERC721.sol";

contract DeployLocal is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deploying contracts with account:", deployer);
        console.log("Account balance:", deployer.balance);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // For local testing, we'll create a mock service manager
        // In production, this would be the actual WAVS service manager address
        IWavsServiceManager mockServiceManager = IWavsServiceManager(address(0x1234567890123456789012345678901234567890));
        
        // Deploy GachaServiceHandler (RandomnessConsumer)
        console.log("Deploying GachaServiceHandler...");
        RandomnessConsumer serviceHandler = new RandomnessConsumer(
            mockServiceManager,
            address(0), // No fee token for testing
            0, // No fee for testing
            deployer // Protocol address
        );
        console.log("GachaServiceHandler deployed to:", address(serviceHandler));
        
        // Get the Gacha and Treasury contracts created by the service handler
        address gachaAddress = serviceHandler.getGacha();
        address treasuryAddress = serviceHandler.getGachaTreasury();
        
        console.log("Gacha deployed to:", gachaAddress);
        console.log("Treasury deployed to:", treasuryAddress);
        
        Gacha gacha = Gacha(gachaAddress);
        GachaTreasury treasury = GachaTreasury(treasuryAddress);
        
        // Deploy NFT collections for different rarities
        console.log("\\n=== Deploying NFT Collections ===");
        
        MockERC721 commonNFT = new MockERC721("Common Heroes", "COMMON");
        MockERC721 uncommonNFT = new MockERC721("Uncommon Heroes", "UNCOMMON");
        MockERC721 rareNFT = new MockERC721("Rare Heroes", "RARE");
        MockERC721 epicNFT = new MockERC721("Epic Heroes", "EPIC");
        MockERC721 legendaryNFT = new MockERC721("Legendary Heroes", "LEGEND");
        
        console.log("Common NFT deployed to:", address(commonNFT));
        console.log("Uncommon NFT deployed to:", address(uncommonNFT));
        console.log("Rare NFT deployed to:", address(rareNFT));
        console.log("Epic NFT deployed to:", address(epicNFT));
        console.log("Legendary NFT deployed to:", address(legendaryNFT));
        
        // Mint NFTs and deposit to treasury
        console.log("\\n=== Minting and Depositing NFTs ===");
        
        // Common NFTs (70% weight) - mint 10 NFTs
        address[] memory commonTokens = new address[](10);
        uint256[] memory commonTokenIds = new uint256[](10);
        GachaTreasury.Rarity[] memory commonRarities = new GachaTreasury.Rarity[](10);
        for (uint i = 0; i < 10; i++) {
            uint256 tokenId = commonNFT.mint(deployer);
            commonTokens[i] = address(commonNFT);
            commonTokenIds[i] = tokenId;
            commonRarities[i] = GachaTreasury.Rarity.Common;
            console.log("Minted Common NFT tokenId:", tokenId);
        }
        // Approve treasury to transfer all common NFTs
        commonNFT.setApprovalForAll(address(treasury), true);
        treasury.batchDepositNFT(commonTokens, commonTokenIds, commonRarities);
        console.log("Deposited 10 Common NFTs to treasury");
        
        // Uncommon NFTs (20% weight) - mint 10 NFTs
        address[] memory uncommonTokens = new address[](10);
        uint256[] memory uncommonTokenIds = new uint256[](10);
        GachaTreasury.Rarity[] memory uncommonRarities = new GachaTreasury.Rarity[](10);
        for (uint i = 0; i < 10; i++) {
            uint256 tokenId = uncommonNFT.mint(deployer);
            uncommonTokens[i] = address(uncommonNFT);
            uncommonTokenIds[i] = tokenId;
            uncommonRarities[i] = GachaTreasury.Rarity.Uncommon;
            console.log("Minted Uncommon NFT tokenId:", tokenId);
        }
        // Approve treasury to transfer all uncommon NFTs
        uncommonNFT.setApprovalForAll(address(treasury), true);
        treasury.batchDepositNFT(uncommonTokens, uncommonTokenIds, uncommonRarities);
        console.log("Deposited 10 Uncommon NFTs to treasury");
        
        // Rare NFTs (6% weight) - mint 10 NFTs
        address[] memory rareTokens = new address[](10);
        uint256[] memory rareTokenIds = new uint256[](10);
        GachaTreasury.Rarity[] memory rareRarities = new GachaTreasury.Rarity[](10);
        for (uint i = 0; i < 10; i++) {
            uint256 tokenId = rareNFT.mint(deployer);
            rareTokens[i] = address(rareNFT);
            rareTokenIds[i] = tokenId;
            rareRarities[i] = GachaTreasury.Rarity.Rare;
            console.log("Minted Rare NFT tokenId:", tokenId);
        }
        // Approve treasury to transfer all rare NFTs
        rareNFT.setApprovalForAll(address(treasury), true);
        treasury.batchDepositNFT(rareTokens, rareTokenIds, rareRarities);
        console.log("Deposited 10 Rare NFTs to treasury");
        
        // Epic NFTs (3% weight) - mint 10 NFTs
        address[] memory epicTokens = new address[](10);
        uint256[] memory epicTokenIds = new uint256[](10);
        GachaTreasury.Rarity[] memory epicRarities = new GachaTreasury.Rarity[](10);
        for (uint i = 0; i < 10; i++) {
            uint256 tokenId = epicNFT.mint(deployer);
            epicTokens[i] = address(epicNFT);
            epicTokenIds[i] = tokenId;
            epicRarities[i] = GachaTreasury.Rarity.Epic;
            console.log("Minted Epic NFT tokenId:", tokenId);
        }
        // Approve treasury to transfer all epic NFTs
        epicNFT.setApprovalForAll(address(treasury), true);
        treasury.batchDepositNFT(epicTokens, epicTokenIds, epicRarities);
        console.log("Deposited 10 Epic NFTs to treasury");
        
        // Legendary NFTs (1% weight) - mint 10 NFTs
        address[] memory legendaryTokens = new address[](10);
        uint256[] memory legendaryTokenIds = new uint256[](10);
        GachaTreasury.Rarity[] memory legendaryRarities = new GachaTreasury.Rarity[](10);
        for (uint i = 0; i < 10; i++) {
            uint256 tokenId = legendaryNFT.mint(deployer);
            legendaryTokens[i] = address(legendaryNFT);
            legendaryTokenIds[i] = tokenId;
            legendaryRarities[i] = GachaTreasury.Rarity.Legendary;
            console.log("Minted Legendary NFT tokenId:", tokenId);
        }
        // Approve treasury to transfer legendary NFT
        legendaryNFT.setApprovalForAll(address(treasury), true);
        treasury.batchDepositNFT(legendaryTokens, legendaryTokenIds, legendaryRarities);
        console.log("Deposited 10 Legendary NFTs to treasury");
        
        vm.stopBroadcast();
        
        // Get treasury stats
        uint256 commonCount = treasury.getTreasuryItems(GachaTreasury.Rarity.Common).length;
        uint256 uncommonCount = treasury.getTreasuryItems(GachaTreasury.Rarity.Uncommon).length;
        uint256 rareCount = treasury.getTreasuryItems(GachaTreasury.Rarity.Rare).length;
        uint256 epicCount = treasury.getTreasuryItems(GachaTreasury.Rarity.Epic).length;
        uint256 legendaryCount = treasury.getTreasuryItems(GachaTreasury.Rarity.Legendary).length;
        
        console.log("\\n=== Deployment Summary ===");
        console.log("GachaServiceHandler:    ", address(serviceHandler));
        console.log("Gacha Contract:         ", gachaAddress);
        console.log("Treasury Contract:      ", treasuryAddress);
        console.log("Common NFT:             ", address(commonNFT));
        console.log("Uncommon NFT:           ", address(uncommonNFT));
        console.log("Rare NFT:               ", address(rareNFT));
        console.log("Epic NFT:               ", address(epicNFT));
        console.log("Legendary NFT:          ", address(legendaryNFT));
        console.log("\\n=== Treasury Stats ===");
        console.log("Common NFTs:            ", commonCount);
        console.log("Uncommon NFTs:          ", uncommonCount);
        console.log("Rare NFTs:              ", rareCount);
        console.log("Epic NFTs:              ", epicCount);
        console.log("Legendary NFTs:         ", legendaryCount);
        console.log("Total NFTs:             ", commonCount + uncommonCount + rareCount + epicCount + legendaryCount);
        
        // Write addresses to file
        string memory addresses = string(abi.encodePacked(
            "GACHA_SERVICE_HANDLER_ADDRESS=", vm.toString(address(serviceHandler)), "\\n",
            "GACHA_CONTRACT_ADDRESS=", vm.toString(gachaAddress), "\\n",
            "TREASURY_CONTRACT_ADDRESS=", vm.toString(treasuryAddress), "\\n",
            "COMMON_NFT_ADDRESS=", vm.toString(address(commonNFT)), "\\n",
            "UNCOMMON_NFT_ADDRESS=", vm.toString(address(uncommonNFT)), "\\n",
            "RARE_NFT_ADDRESS=", vm.toString(address(rareNFT)), "\\n",
            "EPIC_NFT_ADDRESS=", vm.toString(address(epicNFT)), "\\n",
            "LEGENDARY_NFT_ADDRESS=", vm.toString(address(legendaryNFT)), "\\n",
            "WAVS_CHAIN_RPC_URL=http://localhost:8548\\n"
        ));
        
        vm.writeFile(".env.local", addresses);
        console.log("Contract addresses written to .env.local");
        console.log("\\n Gacha system ready for use!");
        console.log("Run 'task frontend:codegen' to generate TypeScript types");
    }
}