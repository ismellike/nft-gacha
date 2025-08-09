// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Script, console} from "forge-std/Script.sol";
import {IWavsServiceManager} from "@wavs/eigenlayer/ecdsa/interfaces/IWavsServiceManager.sol";
import {Gacha} from "../src/Gacha.sol";
import {GachaTreasury} from "../src/GachaTreasury.sol";
import {GachaRewardsManager} from "../src/GachaRewardsManager.sol";
import {GachaServiceHandler} from "../src/GachaServiceHandler.sol";
import {NFTAppraisal} from "../src/NFTAppraisal.sol";
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

        // Deploy NFT appraisal system first
        console.log("Deploying NFTAppraisal...");
        NFTAppraisal appraisalContract = new NFTAppraisal(
            deployer,
            address(testToken),
            10 * 10 ** testToken.decimals(), // 10 TEST tokens appraisal fee
            deployer // protocol address
        );
        console.log("NFTAppraisal deployed to:", address(appraisalContract));

        // Deploy treasury with appraisal contract
        console.log("Deploying Treasury...");
        GachaTreasury treasury = new GachaTreasury(
            deployer,
            address(0x1111), // temporary gacha address
            address(appraisalContract)
        );
        console.log("Treasury deployed to:", address(treasury));

        // Deploy gacha contract
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
        GachaServiceHandler serviceHandler =
            new GachaServiceHandler(IWavsServiceManager(wavsServiceManagerAddress), address(gacha));
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

        // Deploy single NFT collection
        console.log("\\n=== Deploying Single NFT Collection ===");
        SimpleERC721 pokemonNFT = new SimpleERC721("Graded Pokemon Cards", "GPOKE");

        console.log("Pokemon NFT:     ", address(pokemonNFT));

        // Whitelist the NFT collection
        console.log("\\n=== Whitelisting NFT Collection ===");
        treasury.addToWhitelist(address(pokemonNFT));

        console.log("Whitelisted 1 NFT collection");
        console.log("Gacha Available: ", treasury.isGachaAvailable()); // Should be false (no NFTs yet)

        // Mint and deposit NFTs with different rarities based on appraisal values
        console.log("\\n=== Minting and Depositing NFTs ===");
        _depositNFTsWithRarity(treasury, appraisalContract, pokemonNFT, deployer);

        // Verify gacha is now available
        console.log("\\n=== Gacha System Status ===");
        console.log("Whitelist Length:    ", treasury.getWhitelistLength());
        console.log("Gacha Available:     ", treasury.isGachaAvailable()); // Should be true now
        console.log("Total NFTs:          ", treasury.getTotalItemsCount());

        vm.stopBroadcast();

        // Display final stats
        _displayTreasuryStats(treasury);

        // Write addresses to file
        _writeEnvFile(
            address(serviceHandler),
            address(gacha),
            address(appraisalContract),
            address(treasury),
            address(rewardsManager),
            commonTracker,
            uncommonTracker,
            rareTracker,
            epicTracker,
            legendaryTracker,
            address(pokemonNFT)
        );

        console.log("All contracts deployed and configured successfully");
    }

    function _depositNFTsWithRarity(
        GachaTreasury treasury,
        NFTAppraisal appraisalContract,
        SimpleERC721 nftContract,
        address deployer
    ) internal {
        // Mint 50 tokens total: 10 of each rarity
        uint256 totalTokens = 50;
        address[] memory tokens = new address[](totalTokens);
        uint256[] memory tokenIds = new uint256[](totalTokens);

        uint256 tokenIndex = 0;

        // Define rarity structure: 10 tokens each rarity
        GachaTreasury.Rarity[5] memory rarities = [
            GachaTreasury.Rarity.Common,
            GachaTreasury.Rarity.Uncommon,
            GachaTreasury.Rarity.Rare,
            GachaTreasury.Rarity.Epic,
            GachaTreasury.Rarity.Legendary
        ];

        // Mint 10 tokens for each rarity level
        for (uint256 rarityIndex = 0; rarityIndex < 5; rarityIndex++) {
            GachaTreasury.Rarity currentRarity = rarities[rarityIndex];
            uint256 priceUSD = _getAppraisalPriceForRarity(currentRarity);

            for (uint256 i = 0; i < 10; i++) {
                uint256 tokenId = nftContract.mint(deployer);
                tokens[tokenIndex] = address(nftContract);
                tokenIds[tokenIndex] = tokenId;

                // Set appraisal price based on rarity
                appraisalContract.overrideAppraisal(address(nftContract), tokenId, priceUSD);

                tokenIndex++;
            }

            console.log("Minted 10 tokens for rarity:", uint256(currentRarity));
            console.log("Price per token: $", priceUSD / 1e18);
        }

        // Approve and deposit all tokens at once
        nftContract.setApprovalForAll(address(treasury), true);
        treasury.batchDepositNFT(tokens, tokenIds);

        console.log("Deposited", totalTokens, "NFTs from single contract with mixed rarities");
    }

    function _getAppraisalPriceForRarity(GachaTreasury.Rarity rarity) internal pure returns (uint256) {
        if (rarity == GachaTreasury.Rarity.Common) return 50 * 1e18; // $50
        if (rarity == GachaTreasury.Rarity.Uncommon) return 250 * 1e18; // $250
        if (rarity == GachaTreasury.Rarity.Rare) return 1000 * 1e18; // $1000
        if (rarity == GachaTreasury.Rarity.Epic) return 5000 * 1e18; // $5000
        if (rarity == GachaTreasury.Rarity.Legendary) return 15000 * 1e18; // $15000
        return 50 * 1e18; // Default to common
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
        address nftAppraisal,
        address treasury,
        address rewardsManager,
        address commonTracker,
        address uncommonTracker,
        address rareTracker,
        address epicTracker,
        address legendaryTracker,
        address nftCollection
    ) internal {
        string memory addresses = string(
            abi.encodePacked(
                "# Generated by Direct deployment for LOCAL environment\n",
                "GACHA_SERVICE_HANDLER_ADDRESS=",
                vm.toString(serviceHandler),
                "\n",
                "GACHA_CONTRACT_ADDRESS=",
                vm.toString(gacha),
                "\n",
                "NFT_APPRAISAL_CONTRACT_ADDRESS=",
                vm.toString(nftAppraisal),
                "\n",
                "TREASURY_CONTRACT_ADDRESS=",
                vm.toString(treasury),
                "\n",
                "REWARDS_MANAGER_ADDRESS=",
                vm.toString(rewardsManager),
                "\n",
                "COMMON_TRACKER_ADDRESS=",
                vm.toString(commonTracker),
                "\n",
                "UNCOMMON_TRACKER_ADDRESS=",
                vm.toString(uncommonTracker),
                "\n",
                "RARE_TRACKER_ADDRESS=",
                vm.toString(rareTracker),
                "\n",
                "EPIC_TRACKER_ADDRESS=",
                vm.toString(epicTracker),
                "\n",
                "LEGENDARY_TRACKER_ADDRESS=",
                vm.toString(legendaryTracker),
                "\n",
                "NFT_COLLECTION_ADDRESS=",
                vm.toString(nftCollection),
                "\n",
                "WAVS_CHAIN_RPC_URL=http://localhost:8548\n"
            )
        );

        vm.writeFile("../.env.local", addresses);
        console.log("Contract addresses written to ../.env.local");
    }
}
