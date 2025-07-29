// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Script, console} from "forge-std/Script.sol";
import {IWavsServiceManager} from "@wavs/eigenlayer/ecdsa/interfaces/IWavsServiceManager.sol";
import {Gacha} from "../src/Gacha.sol";
import {GachaTreasury} from "../src/GachaTreasury.sol";
import {GachaRewardsManager} from "../src/GachaRewardsManager.sol";
import {GachaServiceHandler} from "../src/GachaServiceHandler.sol";
import {TestToken} from "../src/TestToken.sol";
import {SimpleERC721} from "../src/SimpleERC721.sol";

contract DeployDirectLocal is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("Deploying directly using account:", deployer);
        console.log("Account balance:", deployer.balance);

        vm.startBroadcast(deployerPrivateKey);

        // Deploy test token first
        console.log("Deploying TestToken...");
        TestToken testToken = new TestToken("Test Token", "TEST", deployer);
        console.log("TestToken deployed to:", address(testToken));

        // Mint initial tokens to deployer
        testToken.mint(deployer, 1000000 * 10 ** testToken.decimals());
        console.log("Minted 1,000,000 TEST tokens to deployer");

        // Read WAVS service manager address
        address wavsServiceManagerAddress;
        try vm.envAddress("WAVS_SERVICE_MANAGER_ADDRESS") {
            wavsServiceManagerAddress = vm.envAddress("WAVS_SERVICE_MANAGER_ADDRESS");
            console.log("Using WAVS Service Manager from env:", wavsServiceManagerAddress);
        } catch {
            string memory avsDeployJson = vm.readFile("../avs/.project-output/chain-1/wavs_drand/avs_deploy.json");
            wavsServiceManagerAddress = vm.parseJsonAddress(avsDeployJson, ".addresses.WavsServiceManager");
            console.log("Using WAVS Service Manager from JSON:", wavsServiceManagerAddress);
        }

        console.log("\\n=== Deploying Gacha System Directly ===");

        // Deploy treasury first with temporary gacha address
        console.log("Deploying Treasury...");
        GachaTreasury treasury = new GachaTreasury(deployer, address(0x1111));
        console.log("Treasury deployed to:", address(treasury));

        // Deploy gacha first with temporary service handler and rewards manager
        console.log("Deploying Gacha...");
        Gacha gacha = new Gacha(
            deployer,
            address(0x2222), // temporary service handler - will be updated
            address(testToken),
            100 * 10 ** testToken.decimals(), // 100 TEST tokens fee
            address(treasury),
            address(0x3333) // temporary rewards manager - will be updated
        );
        console.log("Gacha deployed to:", address(gacha));

        // Deploy rewards manager with real gacha address
        console.log("Deploying RewardsManager...");
        GachaRewardsManager rewardsManager = new GachaRewardsManager(
            deployer,
            address(gacha), // real gacha address
            address(treasury),
            deployer, // protocol address
            address(testToken)
        );
        console.log("RewardsManager deployed to:", address(rewardsManager));

        // Deploy service handler with actual gacha
        console.log("Deploying ServiceHandler...");
        GachaServiceHandler serviceHandler = new GachaServiceHandler(
            IWavsServiceManager(wavsServiceManagerAddress),
            address(gacha)
        );
        console.log("ServiceHandler deployed to:", address(serviceHandler));

        // Update references
        console.log("Updating contract references...");
        treasury.setGachaContract(address(gacha));
        gacha.setRewardsManager(address(rewardsManager));
        
        // CRITICAL: Update the gacha service handler to the real address
        console.log("Setting real service handler address...");
        gacha.setGachaServiceHandler(address(serviceHandler));
        console.log("Service handler updated from temp address to:", address(serviceHandler));
        
        // Configure system with default values
        console.log("Configuring system...");
        gacha.setRarityWeights(7000, 2000, 600, 300, 100); // 70%, 20%, 6%, 3%, 1%
        
        console.log("Deploying rarity dividend trackers...");
        rewardsManager.deployAllRarityTokens();
        
        // Get the deployed rarity token addresses
        address commonTracker = address(rewardsManager.rarityTokens(GachaTreasury.Rarity.Common));
        address uncommonTracker = address(rewardsManager.rarityTokens(GachaTreasury.Rarity.Uncommon));
        address rareTracker = address(rewardsManager.rarityTokens(GachaTreasury.Rarity.Rare));
        address epicTracker = address(rewardsManager.rarityTokens(GachaTreasury.Rarity.Epic));
        address legendaryTracker = address(rewardsManager.rarityTokens(GachaTreasury.Rarity.Legendary));
        
        console.log("Common Tracker:      ", commonTracker);
        console.log("Uncommon Tracker:    ", uncommonTracker);
        console.log("Rare Tracker:        ", rareTracker);
        console.log("Epic Tracker:        ", epicTracker);
        console.log("Legendary Tracker:   ", legendaryTracker);
        
        rewardsManager.setRarityMultiplier(GachaTreasury.Rarity.Common, 10000);
        rewardsManager.setRarityMultiplier(GachaTreasury.Rarity.Uncommon, 12000);
        rewardsManager.setRarityMultiplier(GachaTreasury.Rarity.Rare, 15000);
        rewardsManager.setRarityMultiplier(GachaTreasury.Rarity.Epic, 20000);
        rewardsManager.setRarityMultiplier(GachaTreasury.Rarity.Legendary, 30000);
        treasury.setTreasuryRewardsManager(address(rewardsManager));

        console.log("\\n=== System Deployed Successfully ===");
        console.log("ServiceHandler:   ", address(serviceHandler));
        console.log("Gacha:           ", address(gacha));
        console.log("Treasury:        ", address(treasury));
        console.log("RewardsManager:  ", address(rewardsManager));

        // Deploy test NFT collections
        console.log("\\n=== Deploying Test NFT Collections ===");
        SimpleERC721 commonNFT = new SimpleERC721("Common Heroes", "COMMON");
        SimpleERC721 uncommonNFT = new SimpleERC721("Uncommon Heroes", "UNCOMMON");
        SimpleERC721 rareNFT = new SimpleERC721("Rare Heroes", "RARE");
        SimpleERC721 epicNFT = new SimpleERC721("Epic Heroes", "EPIC");
        SimpleERC721 legendaryNFT = new SimpleERC721("Legendary Heroes", "LEGEND");

        console.log("Common NFT:      ", address(commonNFT));
        console.log("Uncommon NFT:    ", address(uncommonNFT));
        console.log("Rare NFT:        ", address(rareNFT));
        console.log("Epic NFT:        ", address(epicNFT));
        console.log("Legendary NFT:   ", address(legendaryNFT));

        // Mint and deposit NFTs
        console.log("\\n=== Minting and Depositing NFTs ===");
        _depositNFTs(treasury, commonNFT, GachaTreasury.Rarity.Common, 10);
        _depositNFTs(treasury, uncommonNFT, GachaTreasury.Rarity.Uncommon, 10);
        _depositNFTs(treasury, rareNFT, GachaTreasury.Rarity.Rare, 10);
        _depositNFTs(treasury, epicNFT, GachaTreasury.Rarity.Epic, 10);
        _depositNFTs(treasury, legendaryNFT, GachaTreasury.Rarity.Legendary, 10);

        vm.stopBroadcast();

        // Display final stats
        _displayTreasuryStats(treasury);

        // Write addresses to file
        _writeEnvFile(address(serviceHandler), address(gacha), address(treasury), address(rewardsManager), 
                     address(testToken), address(commonNFT), address(uncommonNFT), address(rareNFT), 
                     address(epicNFT), address(legendaryNFT), commonTracker, uncommonTracker, rareTracker, 
                     epicTracker, legendaryTracker);

        console.log("All contracts deployed and configured successfully");
    }

    function _depositNFTs(
        GachaTreasury treasury,
        SimpleERC721 nftContract,
        GachaTreasury.Rarity rarity,
        uint256 count
    ) internal {
        address[] memory tokens = new address[](count);
        uint256[] memory tokenIds = new uint256[](count);
        GachaTreasury.Rarity[] memory rarities = new GachaTreasury.Rarity[](count);

        for (uint256 i = 0; i < count; i++) {
            uint256 tokenId = nftContract.mint(msg.sender);
            tokens[i] = address(nftContract);
            tokenIds[i] = tokenId;
            rarities[i] = rarity;
        }

        nftContract.setApprovalForAll(address(treasury), true);
        treasury.batchDepositNFT(tokens, tokenIds, rarities);

        console.log("Deposited", count, "NFTs of rarity:", uint256(rarity));
    }

    function _displayTreasuryStats(GachaTreasury treasury) internal view {
        console.log("\\n=== Treasury Stats ===");
        console.log("Common NFTs:     ", treasury.getRarityCount(GachaTreasury.Rarity.Common));
        console.log("Uncommon NFTs:   ", treasury.getRarityCount(GachaTreasury.Rarity.Uncommon));
        console.log("Rare NFTs:       ", treasury.getRarityCount(GachaTreasury.Rarity.Rare));
        console.log("Epic NFTs:       ", treasury.getRarityCount(GachaTreasury.Rarity.Epic));
        console.log("Legendary NFTs:  ", treasury.getRarityCount(GachaTreasury.Rarity.Legendary));
        console.log("Total NFTs:      ", treasury.getTotalItemsCount());
    }

    function _writeEnvFile(
        address serviceHandler,
        address gacha,
        address treasury,
        address rewardsManager,
        address testToken,
        address commonNFT,
        address uncommonNFT,
        address rareNFT,
        address epicNFT,
        address legendaryNFT,
        address commonTracker,
        address uncommonTracker,
        address rareTracker,
        address epicTracker,
        address legendaryTracker
    ) internal {
        string memory addresses = string(
            abi.encodePacked(
                "# Generated by Direct deployment\n",
                "GACHA_SERVICE_HANDLER_ADDRESS=", vm.toString(serviceHandler), "\n",
                "GACHA_CONTRACT_ADDRESS=", vm.toString(gacha), "\n",
                "TREASURY_CONTRACT_ADDRESS=", vm.toString(treasury), "\n",
                "REWARDS_MANAGER_ADDRESS=", vm.toString(rewardsManager), "\n",
                "TEST_TOKEN_ADDRESS=", vm.toString(testToken), "\n",
                "COMMON_NFT_ADDRESS=", vm.toString(commonNFT), "\n",
                "UNCOMMON_NFT_ADDRESS=", vm.toString(uncommonNFT), "\n",
                "RARE_NFT_ADDRESS=", vm.toString(rareNFT), "\n",
                "EPIC_NFT_ADDRESS=", vm.toString(epicNFT), "\n",
                "LEGENDARY_NFT_ADDRESS=", vm.toString(legendaryNFT), "\n",
                "COMMON_TRACKER_ADDRESS=", vm.toString(commonTracker), "\n",
                "UNCOMMON_TRACKER_ADDRESS=", vm.toString(uncommonTracker), "\n",
                "RARE_TRACKER_ADDRESS=", vm.toString(rareTracker), "\n",
                "EPIC_TRACKER_ADDRESS=", vm.toString(epicTracker), "\n",
                "LEGENDARY_TRACKER_ADDRESS=", vm.toString(legendaryTracker), "\n",
                "WAVS_CHAIN_RPC_URL=http://localhost:8548\n"
            )
        );

        vm.writeFile("../.env.local", addresses);
        console.log("Contract addresses written to ../.env.local");
    }
}