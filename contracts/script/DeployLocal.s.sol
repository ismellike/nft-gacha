// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Script, console} from "forge-std/Script.sol";
import {IWavsServiceManager} from "@wavs/eigenlayer/ecdsa/interfaces/IWavsServiceManager.sol";
import {Gacha} from "../src/gacha/Gacha.sol";
import {GachaTreasury} from "../src/gacha/GachaTreasury.sol";
import {GachaRewardsManager} from "../src/rewards/GachaRewardsManager.sol";
import {GachaServiceHandler} from "../src/gacha/GachaServiceHandler.sol";
import {NFTAppraisal} from "../src/appraisal/NFTAppraisal.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {BaseERC20} from "../src/tokens/BaseERC20.sol";
import {BaseERC721} from "../src/tokens/BaseERC721.sol";

contract DeployLocal is Script {
    // Polygon contract address for Courtyard NFTs
    address constant POLYGON_CONTRACT_ADDRESS = 0x251BE3A17Af4892035C37ebf5890F4a4D889dcAD;

    struct ProxyDeployments {
        address appraisalProxy;
        address treasuryProxy;
        address rewardsManagerProxy;
        address gachaProxy;
        address serviceHandler;
        address collection;
    }

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("Deploying local system using account:", deployer);
        console.log("Account balance:", deployer.balance);

        vm.startBroadcast(deployerPrivateKey);

        ProxyDeployments memory deployments = _deployLocalSystem(deployer);

        vm.stopBroadcast();

        // Write addresses to file
        _writeEnvFile(deployments);

        console.log("All contracts deployed and configured successfully");
    }

    function _deployLocalSystem(address deployer) internal returns (ProxyDeployments memory) {
        ProxyDeployments memory deployments;

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

        console.log("\n=== Deploying Local Gacha System ===");

        // Deploy implementation contracts
        console.log("Deploying implementation contracts...");
        NFTAppraisal appraisalImpl = new NFTAppraisal();
        GachaTreasury treasuryImpl = new GachaTreasury();
        GachaRewardsManager rewardsManagerImpl = new GachaRewardsManager();
        Gacha gachaImpl = new Gacha();

        console.log("Appraisal implementation:", address(appraisalImpl));
        console.log("Treasury implementation:", address(treasuryImpl));
        console.log("Rewards Manager implementation:", address(rewardsManagerImpl));
        console.log("Gacha implementation:", address(gachaImpl));

        // Deploy proxies and initialize
        console.log("Deploying and initializing proxies...");

        // Deploy NFT appraisal proxy
        bytes memory appraisalInitData = abi.encodeWithSelector(
            NFTAppraisal.initialize.selector,
            deployer,
            address(testToken),
            10 * 10 ** testToken.decimals(), // 10 TEST tokens appraisal fee
            deployer // protocol address
        );
        ERC1967Proxy appraisalProxy = new ERC1967Proxy(address(appraisalImpl), appraisalInitData);
        deployments.appraisalProxy = address(appraisalProxy);
        console.log("NFTAppraisal proxy deployed to:", deployments.appraisalProxy);

        // Deploy treasury proxy
        bytes memory treasuryInitData = abi.encodeWithSelector(
            GachaTreasury.initialize.selector,
            deployer,
            address(0x1111), // temporary gacha address - will be updated
            deployments.appraisalProxy
        );
        ERC1967Proxy treasuryProxy = new ERC1967Proxy(address(treasuryImpl), treasuryInitData);
        deployments.treasuryProxy = address(treasuryProxy);
        console.log("Treasury proxy deployed to:", deployments.treasuryProxy);

        // Deploy rewards manager proxy
        bytes memory rewardsManagerInitData = abi.encodeWithSelector(
            GachaRewardsManager.initialize.selector,
            deployer,
            address(0x2222), // temporary gacha address - will be updated
            deployments.treasuryProxy,
            deployments.appraisalProxy,
            deployer, // protocol address
            address(testToken)
        );
        ERC1967Proxy rewardsManagerProxy = new ERC1967Proxy(address(rewardsManagerImpl), rewardsManagerInitData);
        deployments.rewardsManagerProxy = address(rewardsManagerProxy);
        console.log("RewardsManager proxy deployed to:", deployments.rewardsManagerProxy);

        // Deploy gacha proxy
        bytes memory gachaInitData = abi.encodeWithSelector(
            Gacha.initialize.selector,
            deployer,
            address(0x3333), // temporary service handler - will be updated
            address(testToken),
            100 * 10 ** testToken.decimals(), // 100 TEST tokens fee
            deployments.treasuryProxy,
            deployments.rewardsManagerProxy
        );
        ERC1967Proxy gachaProxy = new ERC1967Proxy(address(gachaImpl), gachaInitData);
        deployments.gachaProxy = address(gachaProxy);
        console.log("Gacha proxy deployed to:", deployments.gachaProxy);

        // Deploy service handler (not upgradeable - simple trusted handler)
        console.log("Deploying ServiceHandler...");
        GachaServiceHandler serviceHandler =
            new GachaServiceHandler(IWavsServiceManager(wavsServiceManagerAddress), deployments.gachaProxy);
        deployments.serviceHandler = address(serviceHandler);
        console.log("ServiceHandler deployed to:", deployments.serviceHandler);

        // Update references to point to correct addresses
        console.log("Updating contract references...");
        _configureContracts(deployments, deployments.serviceHandler, deployer, address(testToken));

        // Deploy simple NFT collection and seed treasury
        console.log("\n=== Deploying Base ERC721 Collection ===");
        BaseERC721 collection = new BaseERC721("Gacha Collection", "GACHA", deployer);
        deployments.collection = address(collection);
        console.log("Collection:      ", deployments.collection);

        console.log("\n=== Whitelisting NFT Collection ===");
        GachaTreasury(deployments.treasuryProxy).addToWhitelist(deployments.collection);
        console.log("Whitelisted 1 NFT collection");

        console.log("\n=== Minting, Appraising, and Depositing Sample NFTs ===");
        _seedTreasuryWithSampleNFTs(
            deployments.treasuryProxy,
            deployments.appraisalProxy,
            collection,
            deployer,
            address(testToken)
        );

        console.log("\n=== Local Gacha System Status ===");
        console.log("Whitelist Length:    ", GachaTreasury(deployments.treasuryProxy).getWhitelistLength());
        console.log("Gacha Available:     ", GachaTreasury(deployments.treasuryProxy).isGachaAvailable());
        console.log("Total NFTs:          ", GachaTreasury(deployments.treasuryProxy).getTotalItemsCount());

        // Display final stats
        _displayTreasuryStats(deployments.treasuryProxy);

        return deployments;
    }

    function _configureContracts(
        ProxyDeployments memory deployments,
        address serviceHandler,
        address deployer,
        address testToken
    ) internal {
        // Update treasury with real gacha address
        GachaTreasury(deployments.treasuryProxy).setGachaContract(deployments.gachaProxy);

        // Update rewards manager with real gacha address and protocol address
        GachaRewardsManager(deployments.rewardsManagerProxy).setGachaContract(deployments.gachaProxy);
        GachaRewardsManager(deployments.rewardsManagerProxy).setProtocolAddress(deployer);

        // Update gacha with real service handler and rewards manager addresses
        Gacha(deployments.gachaProxy).setGachaServiceHandler(serviceHandler);

        // Configure system with default values
        Gacha(deployments.gachaProxy).setRarityWeights(7000, 2000, 600, 300, 100); // 70%, 20%, 6%, 3%, 1%

        // Configure price ranges for proper rarity distribution
        console.log("Setting price ranges for rarity tiers (canonical)...");
        GachaTreasury(deployments.treasuryProxy).setPriceRange(
            GachaTreasury.Rarity.Common, 0, 99 * 1e18
        ); // $0-99 (Common)
        GachaTreasury(deployments.treasuryProxy).setPriceRange(
            GachaTreasury.Rarity.Uncommon, 100 * 1e18, 199 * 1e18
        ); // $100-199 (Uncommon)
        GachaTreasury(deployments.treasuryProxy).setPriceRange(
            GachaTreasury.Rarity.Rare, 200 * 1e18, 399 * 1e18
        ); // $200-399 (Rare)
        GachaTreasury(deployments.treasuryProxy).setPriceRange(
            GachaTreasury.Rarity.Epic, 400 * 1e18, 999 * 1e18
        ); // $400-999 (Epic)
        GachaTreasury(deployments.treasuryProxy).setPriceRange(
            GachaTreasury.Rarity.Legendary, 1000 * 1e18, type(uint256).max
        ); // $1000+ (Legendary)

        console.log("Rewards manager deployed and configured...");
        GachaTreasury(deployments.treasuryProxy).setTreasuryRewardsManager(deployments.rewardsManagerProxy);

        console.log("\n=== Local System Deployed Successfully ===");
        console.log("ServiceHandler:   ", deployments.serviceHandler);
        console.log("Gacha Proxy:      ", deployments.gachaProxy);
        console.log("Treasury Proxy:   ", deployments.treasuryProxy);
        console.log("RewardsManager:  ", deployments.rewardsManagerProxy);
        console.log("Appraisal Proxy:  ", deployments.appraisalProxy);
    }

    function _seedTreasuryWithSampleNFTs(
        address treasuryProxy,
        address appraisalProxy,
        BaseERC721 nft,
        address deployer,
        address testToken
    ) internal {
        // Total: 50 appraised (deposited) + 10 non-appraised (not deposited)
        console.log("=== Minting NFTs with Real Courtyard TokenURIs ===");

        // Approve treasury once for all subsequent deposits
        nft.setApprovalForAll(treasuryProxy, true);

        _seedCommon(treasuryProxy, appraisalProxy, nft, deployer);
        _seedUncommon(treasuryProxy, appraisalProxy, nft, deployer);
        _seedRare(treasuryProxy, appraisalProxy, nft, deployer);
        _seedEpic(treasuryProxy, appraisalProxy, nft, deployer);
        _seedLegendary(treasuryProxy, appraisalProxy, nft, deployer);
        _seedNonAppraised(nft, deployer);
    }

    function _seedCommon(
        address treasuryProxy,
        address appraisalProxy,
        BaseERC721 nft,
        address deployer
    ) internal {
        string[15] memory ids = [
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
            "0x94a865a7d6e9caa4d23b8e65106a25aec9c581dd257e2ea2c4fa44e91f08674f",
            "0x94a865a7d6e9caa4d23b8e65106a25aec9c581dd257e2ea2c4fa44e91f08674f"
        ];
        for (uint256 i = 0; i < ids.length; i++) {
            uint256 tokenId = nft.mintWithURI(deployer, _generateCourtyardTokenURI(ids[i]));
            uint256 price = (50 + ((i % 10) * 5)) * 1e18;
            bytes32 cardId = _generateCardId("CGC", "8.5 NM-MT+", "Unnumbered Energy Cards", "Fire Energy", "English", "");
            NFTAppraisal(appraisalProxy).ownerSetAppraisalForTokenWithCard(address(nft), tokenId, cardId, price);
            GachaTreasury(treasuryProxy).depositNFT(address(nft), tokenId);
        }
    }

    function _seedUncommon(
        address treasuryProxy,
        address appraisalProxy,
        BaseERC721 nft,
        address deployer
    ) internal {
        string[10] memory ids = [
            "0xe3fe2307c9e2bd4d466687de407e7607540478594c34a1c3a0ba14a0ace7f5cb",
            "0x12ca95bab110eb35ef841bacd186ae9dece31452de28b6d4ffec25d734e4fd19",
            "0xe3fe2307c9e2bd4d466687de407e7607540478594c34a1c3a0ba14a0ace7f5cb",
            "0x12ca95bab110eb35ef841bacd186ae9dece31452de28b6d4ffec25d734e4fd19",
            "0xe3fe2307c9e2bd4d466687de407e7607540478594c34a1c3a0ba14a0ace7f5cb",
            "0x12ca95bab110eb35ef841bacd186ae9dece31452de28b6d4ffec25d734e4fd19",
            "0xe3fe2307c9e2bd4d466687de407e7607540478594c34a1c3a0ba14a0ace7f5cb",
            "0x12ca95bab110eb35ef841bacd186ae9dece31452de28b6d4ffec25d734e4fd19",
            "0xe3fe2307c9e2bd4d466687de407e7607540478594c34a1c3a0ba14a0ace7f5cb",
            "0x12ca95bab110eb35ef841bacd186ae9dece31452de28b6d4ffec25d734e4fd19"
        ];
        for (uint256 i = 0; i < ids.length; i++) {
            uint256 tokenId = nft.mintWithURI(deployer, _generateCourtyardTokenURI(ids[i]));
            uint256 price = (110 + (i * 8)) * 1e18;
            bytes32 cardId = (i % 2 == 0)
                ? _generateCardId("CGC", "9 MINT", "Majestic Dawn", "Bronzong", "English", "16")
                : _generateCardId("CGC", "9 MINT", "EX Hidden Legends", "Beldum", "English", "29");
            NFTAppraisal(appraisalProxy).ownerSetAppraisalForTokenWithCard(address(nft), tokenId, cardId, price);
            GachaTreasury(treasuryProxy).depositNFT(address(nft), tokenId);
        }
    }

    function _seedRare(
        address treasuryProxy,
        address appraisalProxy,
        BaseERC721 nft,
        address deployer
    ) internal {
        string[10] memory ids = [
            "0x560b63c82c999147eb80dbf88634e0394e4e70170dff1064e22283422d5cb4a9",
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
        for (uint256 i = 0; i < ids.length; i++) {
            uint256 tokenId = nft.mintWithURI(deployer, _generateCourtyardTokenURI(ids[i]));
            uint256 price = (220 + (i * 18)) * 1e18;
            bytes32 cardId = _generateCardId("PSA", "9 MINT", "Black Star", "Psyduck", "English", "20");
            NFTAppraisal(appraisalProxy).ownerSetAppraisalForTokenWithCard(address(nft), tokenId, cardId, price);
            GachaTreasury(treasuryProxy).depositNFT(address(nft), tokenId);
        }
    }

    function _seedEpic(
        address treasuryProxy,
        address appraisalProxy,
        BaseERC721 nft,
        address deployer
    ) internal {
        string[10] memory ids = [
            "0x018f4009e23d378e58cc7fb130fecda4038367ab092a4d326b94bb79e9cfe46b",
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
        for (uint256 i = 0; i < ids.length; i++) {
            uint256 tokenId = nft.mintWithURI(deployer, _generateCourtyardTokenURI(ids[i]));
            uint256 price = (500 + (i * 50)) * 1e18;
            bytes32 cardId = _generateCardId("PSA", "10 GEM MINT", "Japanese Promo", "Feraligatr", "Japanese", "016/P");
            NFTAppraisal(appraisalProxy).ownerSetAppraisalForTokenWithCard(address(nft), tokenId, cardId, price);
            GachaTreasury(treasuryProxy).depositNFT(address(nft), tokenId);
        }
    }

    function _seedLegendary(
        address treasuryProxy,
        address appraisalProxy,
        BaseERC721 nft,
        address deployer
    ) internal {
        string[5] memory ids = [
            "0x217e91a9d710b92ebdaaee53d9b85dfff8b0010d85e01dc0c5d7e83a23552b4c",
            "0xd8747e713116b7c3171311e371f4864aa53cc444e0073fbe167fc99166c54b4f",
            "0x217e91a9d710b92ebdaaee53d9b85dfff8b0010d85e01dc0c5d7e83a23552b4c",
            "0xd8747e713116b7c3171311e371f4864aa53cc444e0073fbe167fc99166c54b4f",
            "0x217e91a9d710b92ebdaaee53d9b85dfff8b0010d85e01dc0c5d7e83a23552b4c"
        ];
        for (uint256 i = 0; i < ids.length; i++) {
            uint256 tokenId = nft.mintWithURI(deployer, _generateCourtyardTokenURI(ids[i]));
            uint256 price = (1200 + (i * 200)) * 1e18;
            bytes32 cardId = (i % 2 == 0)
                ? _generateCardId("PSA", "8 NM-MT", "Base Set 2", "Charizard", "English", "4")
                : _generateCardId("BGS", "10 PRISTINE", "Champion's Path", "Charizard V", "English", "079");
            NFTAppraisal(appraisalProxy).ownerSetAppraisalForTokenWithCard(address(nft), tokenId, cardId, price);
            GachaTreasury(treasuryProxy).depositNFT(address(nft), tokenId);
        }
    }

    function _seedNonAppraised(BaseERC721 nft, address deployer) internal {
        string[10] memory ids = [
            "0xd8747e713116b7c3171311e371f4864aa53cc444e0073fbe167fc99166c54b4f",
            "0x94a865a7d6e9caa4d23b8e65106a25aec9c581dd257e2ea2c4fa44e91f08674f",
            // Use the same known-good Bronzong/Beldum IDs as uncommon seeding
            "0xe3fe2307c9e2bd4d466687de407e7607540478594c34a1c3a0ba14a0ace7f5cb",
            "0x12ca95bab110eb35ef841bacd186ae9dece31452de28b6d4ffec25d734e4fd19",
            "0x217e91a9d710b92ebdaaee53d9b85dfff8b0010d85e01dc0c5d7e83a23552b4c",
            "0x018f4009e23d378e58cc7fb130fecda4038367ab092a4d326b94bb79e9cfe46b",
            "0xd8747e713116b7c3171311e371f4864aa53cc444e0073fbe167fc99166c54b4f",
            "0x94a865a7d6e9caa4d23b8e65106a25aec9c581dd257e2ea2c4fa44e91f08674f",
            "0xe3fe2307c9e2bd4d466687de407e7607540478594c34a1c3a0ba14a0ace7f5cb",
            "0x12ca95bab110eb35ef841bacd186ae9dece31452de28b6d4ffec25d734e4fd19"
        ];
        for (uint256 i = 0; i < ids.length; i++) {
            nft.mintWithURI(deployer, _generateCourtyardTokenURI(ids[i]));
        }
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

    function _displayTreasuryStats(address treasuryProxy) internal view {
        console.log("\n=== Treasury Stats ===");
        console.log("Common NFTs:     ", GachaTreasury(treasuryProxy).getRarityCount(GachaTreasury.Rarity.Common));
        console.log("Uncommon NFTs:   ", GachaTreasury(treasuryProxy).getRarityCount(GachaTreasury.Rarity.Uncommon));
        console.log("Rare NFTs:       ", GachaTreasury(treasuryProxy).getRarityCount(GachaTreasury.Rarity.Rare));
        console.log("Epic NFTs:       ", GachaTreasury(treasuryProxy).getRarityCount(GachaTreasury.Rarity.Epic));
        console.log("Legendary NFTs:  ", GachaTreasury(treasuryProxy).getRarityCount(GachaTreasury.Rarity.Legendary));
        console.log("Total NFTs:      ", GachaTreasury(treasuryProxy).getTotalItemsCount());
    }

    function _writeEnvFile(ProxyDeployments memory deployments) internal {
        string memory addresses = string(
            abi.encodePacked(
                "# Generated by LOCAL deployment\n",
                "GACHA_SERVICE_HANDLER_ADDRESS=",
                vm.toString(deployments.serviceHandler),
                "\n",
                "GACHA_CONTRACT_ADDRESS=",
                vm.toString(deployments.gachaProxy),
                "\n",
                "NFT_APPRAISAL_CONTRACT_ADDRESS=",
                vm.toString(deployments.appraisalProxy),
                "\n",
                "TREASURY_CONTRACT_ADDRESS=",
                vm.toString(deployments.treasuryProxy),
                "\n",
                "REWARDS_MANAGER_ADDRESS=",
                vm.toString(deployments.rewardsManagerProxy),
                "\n",
                "NFT_COLLECTION_ADDRESS=",
                vm.toString(deployments.collection),
                "\n",
                "WAVS_CHAIN_RPC_URL=http://localhost:8548\n"
            )
        );

        vm.writeFile("../.env.local", addresses);
        console.log("Contract addresses written to ../.env.local");
    }
}