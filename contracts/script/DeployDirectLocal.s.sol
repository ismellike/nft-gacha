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
    // Polygon contract address for Courtyard NFTs
    address constant POLYGON_CONTRACT_ADDRESS = 0x251BE3A17Af4892035C37ebf5890F4a4D889dcAD;

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
            string memory avsDeployJson = vm.readFile("../avs/.project-output/chain-1/avs/avs_deploy.json");
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

        // Configure price ranges for proper rarity distribution
        console.log("Setting price ranges for rarity tiers...");
        treasury.setPriceRange(GachaTreasury.Rarity.Common, 0, 99 * 1e18); // $0-99 (5 cards)
        treasury.setPriceRange(GachaTreasury.Rarity.Uncommon, 100 * 1e18, 199 * 1e18); // $100-199 (7 cards)
        treasury.setPriceRange(GachaTreasury.Rarity.Rare, 200 * 1e18, 399 * 1e18); // $200-399 (8 cards)
        treasury.setPriceRange(GachaTreasury.Rarity.Epic, 400 * 1e18, 999 * 1e18); // $400-999 (6 cards)
        treasury.setPriceRange(GachaTreasury.Rarity.Legendary, 1000 * 1e18, type(uint256).max); // $1000+ (4 cards)

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

        // Mint and create NFTs with real Pokemon card data
        console.log("\\n=== Minting NFTs with Real Pokemon Card Data ===");
        _createPokemonNFTs(treasury, appraisalContract, pokemonNFT, deployer);

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

    function _createPokemonNFTs(
        GachaTreasury treasury,
        NFTAppraisal appraisalContract,
        SimpleERC721 nftContract,
        address deployer
    ) internal {
        console.log("Creating 36 Pokemon NFTs with real blockchain metadata using 9 verified Courtyard tokens...");

        // Using real Courtyard token IDs for authentic metadata

        // We'll create 36 NFTs total using VERIFIED real Courtyard tokens (reused with different rarities)
        uint256 totalNFTs = 36;

        // Create arrays for different groups - include all rarities for gacha
        address[] memory depositTokens = new address[](33); // Include Epic and Legendary
        uint256[] memory depositTokenIds = new uint256[](33);

        // Generate 36 NFTs using 9 real tokens cycled through with different rarities and values
        for (uint256 i = 0; i < totalNFTs; i++) {
            // Get Polygon token ID for this card (cycle through 9 real tokens)
            uint256 polygonTokenId = _getPolygonTokenId(i % 9);
            uint256 estimatedValue = _getCardValue(i);

            // Mint NFT with Polygon reference (automatically generates Courtyard URL)
            uint256 tokenId = nftContract.mintWithPolygonReference(deployer, POLYGON_CONTRACT_ADDRESS, polygonTokenId);
            console.log("Minted Pokemon NFT", i + 1, "with token ID:", tokenId);
            console.log("Estimated value: $", estimatedValue / 1e18);

            // Appraise cards 3-35 to include all rarities (skip first 3 common cards)
            if (i >= 3 && i < 36) {
                appraisalContract.overrideAppraisal(address(nftContract), tokenId, estimatedValue);
                console.log("Appraised NFT", tokenId, "at $", estimatedValue / 1e18);

                // Add to deposit arrays (shift index since we start from i=3)
                depositTokens[i - 3] = address(nftContract);
                depositTokenIds[i - 3] = tokenId;
            } else {
                console.log("NFT", tokenId, "left unappraised for testing");
            }
        }

        // Approve and deposit all appraised NFTs (cards 3-35 = 33 NFTs)
        nftContract.setApprovalForAll(address(treasury), true);
        treasury.batchDepositNFT(depositTokens, depositTokenIds);

        console.log("\\n=== VERIFIED Real Courtyard NFT Setup Complete ===");
        console.log(
            "Total NFTs minted:       36 (Using 9 VERIFIED REAL COURTYARD TOKENS cycled with different rarities)"
        );
        console.log("NFTs appraised:          33 (tokens 3-35 - includes ALL rarities)");
        console.log("NFTs deposited:          33 (tokens 3-35)");
        console.log("NFTs not appraised:      3 (tokens 0-2) - Available for testing appraisal");
        console.log("Rarity Distribution in Treasury (deposited cards 3-35):");
        console.log("  Common (15):    $35-85 range (cards 3-17)");
        console.log("  Uncommon (9):   $120-180 range (cards 18-26)");
        console.log("  Rare (5):       $280-350 range (cards 27-31)");
        console.log("  Epic (3):       $450-850 range (cards 32-34)");
        console.log("  Legendary (1):  $1200 (card 35 - exceeds $1000 threshold)");
    }

    function _getPolygonTokenId(uint256 cardIndex) internal pure returns (uint256) {
        // Real Courtyard token IDs (hex format) from the actual Polygon contract - VERIFIED REAL TOKENS ONLY
        string[9] memory courtyardTokenIds = [
            "0x6274859bf9e325d0fc7c2387c8efeafbb8728d0d38b02f932c390a6aad93038c", // VERIFIED: Real token
            "0x05f672f6cdfb808e4038ab2b331633158860809bb003a2cab4fbe8352a5f10dc", // VERIFIED: Real token
            "0x3f8eb6e3c0993739b6923416c9fad399da687f8bcaaf92d1e75901e1c872dc3e", // VERIFIED: Real token
            "0xb6e21e1d79445070a28fdfa9db3d199ffc4d01692d39967200113304dc114a03", // VERIFIED: Real token
            "0x32068595c4e1c727725444478d6dc6623c7ccaa854a291e1b1b886044b5af147", // VERIFIED: Real token
            "0x544ee57d69aa9a92cde78d297a01b847c0cb9763d4e653782d2e0fc3d6f5d4c4", // VERIFIED: Real token
            "0x277508a1beabc304c4b89f95a1117397901b7040f1df0cdb0531f16642b5793a", // VERIFIED: Real token
            "0xb7d232fecdc7bca4ed9b1f47328edc8cf38fe57416d4c31e8bc948c9ba7a6467", // VERIFIED: Real token
            "0x23afbd41b540a6675d4df584bc7b79bd0f99376cb8882b49e4e4e7e34577810d" // VERIFIED: Real token
        ];

        // Convert hex string to uint256
        return _hexStringToUint256(courtyardTokenIds[cardIndex]);
    }

    function _hexStringToUint256(string memory hexString) internal pure returns (uint256) {
        bytes memory hexBytes = bytes(hexString);
        require(hexBytes.length == 66, "Invalid hex string length"); // 0x + 64 chars
        require(hexBytes[0] == "0" && hexBytes[1] == "x", "Invalid hex prefix");

        uint256 result = 0;
        for (uint256 i = 2; i < hexBytes.length; i++) {
            result = result * 16;
            uint8 charValue = uint8(hexBytes[i]);

            if (charValue >= 48 && charValue <= 57) {
                // 0-9
                result += charValue - 48;
            } else if (charValue >= 97 && charValue <= 102) {
                // a-f
                result += charValue - 87;
            } else if (charValue >= 65 && charValue <= 70) {
                // A-F
                result += charValue - 55;
            } else {
                revert("Invalid hex character");
            }
        }

        return result;
    }

    function _getCardValue(uint256 cardIndex) internal pure returns (uint256) {
        // Create 36 cards with proper rarity distribution:
        // Most Common (18 cards): $35-85 range
        // Uncommon (9 cards): $120-180 range
        // Rare (5 cards): $280-350 range
        // Epic (3 cards): $450-850 range
        // Legendary (1 card): $1200 (exceeds $1000 threshold)

        // Common cards (0-17): 18 cards, mostly low values
        if (cardIndex < 18) {
            uint256[6] memory commonBaseValues = [uint256(35), 45, 55, 65, 75, 85]; // Mix of low values
            return commonBaseValues[cardIndex % 6] * 1e18;
        }
        // Uncommon cards (18-26): 9 cards, mid-low values
        else if (cardIndex < 27) {
            uint256[3] memory uncommonBaseValues = [uint256(120), 150, 180]; // Mid-range values
            return uncommonBaseValues[(cardIndex - 18) % 3] * 1e18;
        }
        // Rare cards (27-31): 5 cards, mid-high values
        else if (cardIndex < 32) {
            uint256[5] memory rareBaseValues = [uint256(280), 300, 320, 340, 350]; // Higher values
            return rareBaseValues[cardIndex - 27] * 1e18;
        }
        // Epic cards (32-34): 3 cards, high values
        else if (cardIndex < 35) {
            uint256[3] memory epicBaseValues = [uint256(450), 650, 850]; // High values in Epic range
            return epicBaseValues[cardIndex - 32] * 1e18;
        }
        // Legendary card (35): 1 card, highest value
        else {
            return 1200 * 1e18; // Legendary value - exceeds $1000 threshold
        }
    }

    function _getRarityFromValue(uint256 value) internal pure returns (GachaTreasury.Rarity) {
        // Define rarity thresholds based on card values for proper distribution
        if (value >= 1000 * 1e18) return GachaTreasury.Rarity.Legendary; // $1000+ (4 cards)
        if (value >= 400 * 1e18) return GachaTreasury.Rarity.Epic; // $400-999 (6 cards)
        if (value >= 200 * 1e18) return GachaTreasury.Rarity.Rare; // $200-399 (8 cards)
        if (value >= 100 * 1e18) return GachaTreasury.Rarity.Uncommon; // $100-199 (7 cards)
        return GachaTreasury.Rarity.Common; // Under $100 (5 cards)
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
