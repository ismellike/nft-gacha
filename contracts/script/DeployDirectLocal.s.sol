// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Script, console} from "forge-std/Script.sol";
import {IWavsServiceManager} from "@wavs/eigenlayer/ecdsa/interfaces/IWavsServiceManager.sol";
import {Gacha} from "../src/gacha/Gacha.sol";
import {GachaTreasury} from "../src/gacha/GachaTreasury.sol";
import {GachaRewardsManager} from "../src/rewards/GachaRewardsManager.sol";
import {GachaServiceHandler} from "../src/gacha/GachaServiceHandler.sol";
import {NFTAppraisal} from "../src/appraisal/NFTAppraisal.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {BaseERC20} from "../src/tokens/BaseERC20.sol";
import {BaseERC721} from "../src/tokens/BaseERC721.sol";

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
        console.log("Deploying Base ERC20 token...");
        BaseERC20 testToken = new BaseERC20("Test Token", "TEST", deployer);
        console.log("Test Token deployed to:", address(testToken));

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
            address(appraisalContract),
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
        // We control seed prices, so set canonical compact bands and seed accordingly
        console.log("Setting price ranges for rarity tiers (canonical)...");
        treasury.setPriceRange(GachaTreasury.Rarity.Common, 0, 99 * 1e18); // $0-99 (Common)
        treasury.setPriceRange(GachaTreasury.Rarity.Uncommon, 100 * 1e18, 199 * 1e18); // $100-199 (Uncommon)
        treasury.setPriceRange(GachaTreasury.Rarity.Rare, 200 * 1e18, 399 * 1e18); // $200-399 (Rare)
        treasury.setPriceRange(GachaTreasury.Rarity.Epic, 400 * 1e18, 999 * 1e18); // $400-999 (Epic)
        treasury.setPriceRange(GachaTreasury.Rarity.Legendary, 1000 * 1e18, type(uint256).max); // $1000+ (Legendary)

        console.log("Rewards manager deployed and configured...");
        treasury.setTreasuryRewardsManager(address(rewardsManager));

        console.log("\\n=== System Deployed Successfully ===");
        console.log("ServiceHandler:   ", address(serviceHandler));
        console.log("Gacha:           ", address(gacha));
        console.log("Treasury:        ", address(treasury));
        console.log("RewardsManager:  ", address(rewardsManager));

        // Deploy simple NFT collection and seed treasury
        console.log("\\n=== Deploying Base ERC721 Collection ===");
        BaseERC721 collection = new BaseERC721("Gacha Collection", "GACHA", deployer);
        console.log("Collection:      ", address(collection));

        console.log("\\n=== Whitelisting NFT Collection ===");
        treasury.addToWhitelist(address(collection));
        console.log("Whitelisted 1 NFT collection");

        console.log("\\n=== Minting, Appraising, and Depositing Sample NFTs ===");
        _seedTreasuryWithSampleNFTs(treasury, appraisalContract, collection, deployer);

        console.log("\\n=== Gacha System Status ===");
        console.log("Whitelist Length:    ", treasury.getWhitelistLength());
        console.log("Gacha Available:     ", treasury.isGachaAvailable());
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
            address(collection)
        );

        console.log("All contracts deployed and configured successfully");
    }

    function _seedTreasuryWithSampleNFTs(
        GachaTreasury treasury,
        NFTAppraisal appraisalContract,
        BaseERC721 nft,
        address deployer
    ) internal {
        // Total: 15 Common + 10 Uncommon + 10 Rare + 10 Epic + 5 Legendary = 50 appraised NFTs
        // Plus 10 non-appraised NFTs for testing = 60 total
        
        console.log("=== Minting NFTs with Real Courtyard TokenURIs ===");
        
        // Create all tokenURIs using real Courtyard API endpoints
        string[] memory tokenURIs = new string[](60);
        uint256[] memory prices = new uint256[](60);
        uint256 idx = 0;
        
        // Common NFTs (15 appraised) - Real Courtyard token IDs (repeated for variety)
        string[15] memory commonTokenIds = [
            "0x94a865a7d6e9caa4d23b8e65106a25aec9c581dd257e2ea2c4fa44e91f08674f", // Fire Energy CGC 8.5
            "0x94a865a7d6e9caa4d23b8e65106a25aec9c581dd257e2ea2c4fa44e91f08674f", 
            "0x94a865a7d6e9caa4d23b8e65106a25aec9c581dd257e2ea2c4fa44e91f08674f",
            "0x94a865a7d6e9caa4d23b8e65106a25aec9c581dd257e2ea2c4fa44e91f08674f",
            "0x94a865a7d6e9caa4d23b8e65106a25aec9c581dd257e2ea2c4fa44e91f08674f",
            "0x94a865a7d6e9caa4d23b8e65106a25aec9c581dd257e2ea2c4fa44e91f08674f",
            "0x94a865a7d6e9caa4d23b8e65106a25aec9c581dd257e2ea2c4fa44e91f08674f",
            "0x94a865a7d6e9caa4d23b8e65106a25aec9c581dd257e2ea2c4fa44e91f08674f",
            "0x94a865a7d6e9caa4d23b8e65106a25aec9c581dd257e2ea2c4fa44e91f08674f",
            "0x94a865a7d6e9caa4d23b8e65106a25aec9c581dd257e2ea2c4fa44e91f08674f",
            "0x94a865a7d6e9caa4d23b8e65106a25aec9c581dd257e2ea2c4fa44e91f08674f",
            "0x94a865a7d6e9caa4d23b8e65106a25aec9c581dd257e2ea2c4fa44e91f08674f",
            "0x94a865a7d6e9caa4d23b8e65106a25aec9c581dd257e2ea2c4fa44e91f08674f",
            "0x94a865a7d6e9caa4d23b8e65106a25aec9c581dd257e2ea2c4fa44e91f08674f",
            "0x94a865a7d6e9caa4d23b8e65106a25aec9c581dd257e2ea2c4fa44e91f08674f"
        ];
        
        for (uint256 i = 0; i < 15; i++) {
            tokenURIs[idx] = _generateCourtyardTokenURI(commonTokenIds[i]);
            // Seed strictly within Common band ($50–$95)
            prices[idx] = (50 + ((i % 10) * 5)) * 1e18; // 50,55,...,95 then repeat
            idx++;
        }
        
        // Uncommon NFTs (10 appraised)
        string[10] memory uncommonTokenIds = [
            "0xe3fe2307c9e2bd4d466687de407e7607540478594c34a1c3a0ba14a0ace7f5cb", // Bronzong CGC 9
            "0x12ca95bab110eb35ef841bacd186ae9dece31452de28b6d4ffec25d734e4fd19", // Beldum CGC 9
            "0xe3fe2307c9e2bd4d466687de407e7607540478594c34a1c3a0ba14a0ace7f5cb",
            "0x12ca95bab110eb35ef841bacd186ae9dece31452de28b6d4ffec25d734e4fd19",
            "0xe3fe2307c9e2bd4d466687de407e7607540478594c34a1c3a0ba14a0ace7f5cb",
            "0x12ca95bab110eb35ef841bacd186ae9dece31452de28b6d4ffec25d734e4fd19",
            "0xe3fe2307c9e2bd4d466687de407e7607540478594c34a1c3a0ba14a0ace7f5cb",
            "0x12ca95bab110eb35ef841bacd186ae9dece31452de28b6d4ffec25d734e4fd19",
            "0xe3fe2307c9e2bd4d466687de407e7607540478594c34a1c3a0ba14a0ace7f5cb",
            "0x12ca95bab110eb35ef841bacd186ae9dece31452de28b6d4ffec25d734e4fd19"
        ];
        
        for (uint256 i = 0; i < 10; i++) {
            tokenURIs[idx] = _generateCourtyardTokenURI(uncommonTokenIds[i]);
            // Seed within Uncommon band ($110–$190)
            prices[idx] = (110 + (i * 8)) * 1e18; // 110,118,...,182 (fits < 199)
            idx++;
        }
        
        // Rare NFTs (10 appraised)
        string[10] memory rareTokenIds = [
            "0x560b63c82c999147eb80dbf88634e0394e4e70170dff1064e22283422d5cb4a9", // Psyduck PSA 9
            "0x560b63c82c999147eb80dbf88634e0394e4e70170dff1064e22283422d5cb4a9",
            "0x560b63c82c999147eb80dbf88634e0394e4e70170dff1064e22283422d5cb4a9",
            "0x560b63c82c999147eb80dbf88634e0394e4e70170dff1064e22283422d5cb4a9",
            "0x560b63c82c999147eb80dbf88634e0394e4e70170dff1064e22283422d5cb4a9",
            "0x560b63c82c999147eb80dbf88634e0394e4e70170dff1064e22283422d5cb4a9",
            "0x560b63c82c999147eb80dbf88634e0394e4e70170dff1064e22283422d5cb4a9",
            "0x560b63c82c999147eb80dbf88634e0394e4e70170dff1064e22283422d5cb4a9",
            "0x560b63c82c999147eb80dbf88634e0394e4e70170dff1064e22283422d5cb4a9",
            "0x560b63c82c999147eb80dbf88634e0394e4e70170dff1064e22283422d5cb4a9"
        ];
        
        for (uint256 i = 0; i < 10; i++) {
            tokenURIs[idx] = _generateCourtyardTokenURI(rareTokenIds[i]);
            // Seed within Rare band ($220–$382)
            prices[idx] = (220 + (i * 18)) * 1e18;
            idx++;
        }
        
        // Epic NFTs (10 appraised)
        string[10] memory epicTokenIds = [
            "0x018f4009e23d378e58cc7fb130fecda4038367ab092a4d326b94bb79e9cfe46b", // Feraligatr PSA 10
            "0x018f4009e23d378e58cc7fb130fecda4038367ab092a4d326b94bb79e9cfe46b",
            "0x018f4009e23d378e58cc7fb130fecda4038367ab092a4d326b94bb79e9cfe46b",
            "0x018f4009e23d378e58cc7fb130fecda4038367ab092a4d326b94bb79e9cfe46b",
            "0x018f4009e23d378e58cc7fb130fecda4038367ab092a4d326b94bb79e9cfe46b",
            "0x018f4009e23d378e58cc7fb130fecda4038367ab092a4d326b94bb79e9cfe46b",
            "0x018f4009e23d378e58cc7fb130fecda4038367ab092a4d326b94bb79e9cfe46b",
            "0x018f4009e23d378e58cc7fb130fecda4038367ab092a4d326b94bb79e9cfe46b",
            "0x018f4009e23d378e58cc7fb130fecda4038367ab092a4d326b94bb79e9cfe46b",
            "0x018f4009e23d378e58cc7fb130fecda4038367ab092a4d326b94bb79e9cfe46b"
        ];
        
        for (uint256 i = 0; i < 10; i++) {
            tokenURIs[idx] = _generateCourtyardTokenURI(epicTokenIds[i]);
            // Seed within Epic band ($500–$950)
            prices[idx] = (500 + (i * 50)) * 1e18;
            idx++;
        }
        
        // Legendary NFTs (5 appraised)
        string[5] memory legendaryTokenIds = [
            "0x217e91a9d710b92ebdaaee53d9b85dfff8b0010d85e01dc0c5d7e83a23552b4c", // Charizard Base Set 2 PSA 8
            "0xd8747e713116b7c3171311e371f4864aa53cc444e0073fbe167fc99166c54b4f", // Charizard V BGS 10 PRISTINE 
            "0x217e91a9d710b92ebdaaee53d9b85dfff8b0010d85e01dc0c5d7e83a23552b4c",
            "0xd8747e713116b7c3171311e371f4864aa53cc444e0073fbe167fc99166c54b4f",
            "0x217e91a9d710b92ebdaaee53d9b85dfff8b0010d85e01dc0c5d7e83a23552b4c"
        ];
        
        for (uint256 i = 0; i < 5; i++) {
            tokenURIs[idx] = _generateCourtyardTokenURI(legendaryTokenIds[i]);
            prices[idx] = (1200 + (i * 200)) * 1e18; // $1200-2000 fits Legendary >= 1000
            idx++;
        }
        
        // Non-appraised test NFTs (10) - Use the known working token ID as base
        string[10] memory testTokenIds = [
            "0xd8747e713116b7c3171311e371f4864aa53cc444e0073fbe167fc99166c54b4f", // Known working
            "0x9234567890123456789012345678901234567890123456789012345678901235",
            "0x9234567890123456789012345678901234567890123456789012345678901236",
            "0x9234567890123456789012345678901234567890123456789012345678901237",
            "0x9234567890123456789012345678901234567890123456789012345678901238",
            "0x9234567890123456789012345678901234567890123456789012345678901239",
            "0x9234567890123456789012345678901234567890123456789012345678901240",
            "0x9234567890123456789012345678901234567890123456789012345678901241",
            "0x9234567890123456789012345678901234567890123456789012345678901242",
            "0x9234567890123456789012345678901234567890123456789012345678901243"
        ];
        
        for (uint256 i = 0; i < 10; i++) {
            tokenURIs[idx] = _generateCourtyardTokenURI(testTokenIds[i]);
            prices[idx] = 0; // No price set - for testing appraisal
            idx++;
        }
        
        // Batch mint all NFTs with URIs
        uint256[] memory tokenIds = nft.batchMintWithURIs(deployer, tokenURIs);
        console.log("Minted", tokenIds.length, "NFTs with Courtyard tokenURIs");
        
        // Prepare arrays for appraised NFTs only (first 50)
        address[] memory collections = new address[](50);
        uint256[] memory appraisedTokenIds = new uint256[](50);
        bytes32[] memory cardIds = new bytes32[](50);
        uint256[] memory appraisalPrices = new uint256[](50);
        
        // Generate cardIds based on card attributes (like NFTAppraisal AVS component does)
        // Format: keccak256(Grader|Grade|Set|Title/Subject|Language|Card Number)
        for (uint256 i = 0; i < 50; i++) {
            collections[i] = address(nft);
            appraisedTokenIds[i] = tokenIds[i];
            
            // Generate cardId from REAL card attributes based on actual Courtyard metadata
            if (i < 15) {
                // Common: Fire Energy CGC 8.5 (no card number in metadata)
                cardIds[i] = _generateCardId("CGC", "8.5 NM-MT+", "Unnumbered Energy Cards", "Fire Energy", "English", "");
            } else if (i < 25) {
                // Uncommon: Alternating between Bronzong and Beldum
                if ((i - 15) % 2 == 0) {
                    // Bronzong CGC 9
                    cardIds[i] = _generateCardId("CGC", "9 MINT", "Majestic Dawn", "Bronzong", "English", "16");
                } else {
                    // Beldum CGC 9 
                    cardIds[i] = _generateCardId("CGC", "9 MINT", "EX Hidden Legends", "Beldum", "English", "29");
                }
            } else if (i < 35) {
                // Rare: Using Psyduck for variety
                cardIds[i] = _generateCardId("PSA", "9 MINT", "Black Star", "Psyduck", "English", "20");
            } else if (i < 45) {
                // Epic: Japanese Feraligatr PSA 10
                cardIds[i] = _generateCardId("PSA", "10 GEM MINT", "Japanese Promo", "Feraligatr", "Japanese", "016/P");
            } else {
                // Legendary: Alternating between two Charizard cards
                if ((i - 45) % 2 == 0) {
                    // Charizard Base Set 2 PSA 8
                    cardIds[i] = _generateCardId("PSA", "8 NM-MT", "Base Set 2", "Charizard", "English", "4");
                } else {
                    // Charizard V BGS 10 PRISTINE
                    cardIds[i] = _generateCardId("BGS", "10 PRISTINE", "Champion's Path", "Charizard V", "English", "079");
                }
            }
            
            appraisalPrices[i] = prices[i];
        }
        
        console.log("=== Setting Appraisals ===");
        // Batch set appraisals for first 50 NFTs
        appraisalContract.ownerBatchSetAppraisalForTokensWithCards(
            collections, appraisedTokenIds, cardIds, appraisalPrices
        );
        console.log("Set appraisals for", collections.length, "NFTs");
        
        console.log("=== Depositing to Treasury ===");
        // Batch approve and deposit appraised NFTs only
        nft.setApprovalForAll(address(treasury), true);
        treasury.batchDepositNFT(collections, appraisedTokenIds);
        console.log("Deposited", collections.length, "appraised NFTs to treasury");
        console.log("Remaining", tokenIds.length - collections.length, "NFTs are non-appraised for testing");
    }

    function _generateCourtyardTokenURI(string memory tokenId) internal pure returns (string memory) {
        // Generate real Courtyard API URLs
        return string(abi.encodePacked(
            "https://api.courtyard.io/index/token/polygon/",
            "0x251BE3A17Af4892035C37ebf5890F4a4D889dcAD/",
            tokenId,
            "/metadata.json"
        ));
    }

    function _generateCardId(
        string memory grader,
        string memory grade, 
        string memory set,
        string memory title,
        string memory language,
        string memory cardNumber
    ) internal pure returns (bytes32) {
        // Format: keccak256(Grader|Grade|Set|Title/Subject|Language|Card Number)
        // This matches the NFTAppraisal AVS component logic
        return keccak256(abi.encodePacked(
            grader, "|",
            grade, "|", 
            set, "|",
            title, "|",
            language, "|",
            cardNumber
        ));
    }


    function _mintAppraiseDeposit(
        GachaTreasury treasury,
        NFTAppraisal appraisalContract,
        BaseERC721 nft,
        address deployer,
        uint256 price,
        uint8 rarityHint
    ) internal {
        // Mint
        uint256 tokenId = nft.mint(deployer);
        // Owner directly sets appraisal and links token to a synthetic card id
        bytes32 cardId = keccak256(abi.encodePacked("card-", rarityHint, "-", tokenId));
        appraisalContract.ownerSetAppraisalForTokenWithCard(address(nft), tokenId, cardId, price);
        // Approve and deposit
        nft.approve(address(treasury), tokenId);
        treasury.depositNFT(address(nft), tokenId);
    }

    // polygon-specific helpers removed for base deploy

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
