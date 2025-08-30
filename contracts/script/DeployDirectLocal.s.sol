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
        console.log("Setting price ranges for rarity tiers...");
        treasury.setPriceRange(GachaTreasury.Rarity.Common, 0, 99 * 1e18); // $0-99 (5 cards)
        treasury.setPriceRange(GachaTreasury.Rarity.Uncommon, 100 * 1e18, 199 * 1e18); // $100-199 (7 cards)
        treasury.setPriceRange(GachaTreasury.Rarity.Rare, 200 * 1e18, 399 * 1e18); // $200-399 (8 cards)
        treasury.setPriceRange(GachaTreasury.Rarity.Epic, 400 * 1e18, 999 * 1e18); // $400-999 (6 cards)
        treasury.setPriceRange(GachaTreasury.Rarity.Legendary, 1000 * 1e18, type(uint256).max); // $1000+ (4 cards)

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
        // Common: 10 @ $50
        for (uint256 i = 0; i < 10; i++) {
            _mintAppraiseDeposit(treasury, appraisalContract, nft, deployer, 50e18, 0);
        }
        // Uncommon: 5 @ $250
        for (uint256 i = 0; i < 5; i++) {
            _mintAppraiseDeposit(treasury, appraisalContract, nft, deployer, 250e18, 1);
        }
        // Rare: 3 @ $1000
        for (uint256 i = 0; i < 3; i++) {
            _mintAppraiseDeposit(treasury, appraisalContract, nft, deployer, 1000e18, 2);
        }
        // Epic: 2 @ $5000
        for (uint256 i = 0; i < 2; i++) {
            _mintAppraiseDeposit(treasury, appraisalContract, nft, deployer, 5000e18, 3);
        }
        // Legendary: 1 @ $15000
        _mintAppraiseDeposit(treasury, appraisalContract, nft, deployer, 15000e18, 4);
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
