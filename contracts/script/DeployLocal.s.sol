// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Script, console} from "forge-std/Script.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {IWavsServiceManager} from "@wavs/eigenlayer/ecdsa/interfaces/IWavsServiceManager.sol";

import {NFTAppraisal} from "../src/appraisal/NFTAppraisal.sol";
import {NFTAppraisalServiceHandler} from "../src/appraisal/NFTAppraisalServiceHandler.sol";
import {Gacha} from "../src/gacha/Gacha.sol";
import {GachaTreasury} from "../src/gacha/GachaTreasury.sol";
import {GachaServiceHandler} from "../src/gacha/GachaServiceHandler.sol";
import {DepositorVault} from "../src/economy/DepositorVault.sol";
import {ProtocolTreasury} from "../src/economy/ProtocolTreasury.sol";
import {GachaEconomyManager} from "../src/economy/GachaEconomyManager.sol";
import {BaseERC721} from "../src/tokens/BaseERC721.sol";
import {RarityTracker} from "../src/gacha/RarityTracker.sol";

/// @dev Simple 6-decimal test token to simulate USDC
contract TestUSDC is ERC20, ERC20Permit, Ownable {
    constructor(address initialOwner) ERC20("Test USDC", "tUSDC") ERC20Permit("Test USDC") Ownable(initialOwner) {}

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}

contract DeployLocal is Script {
    /**
     * ECONOMIC MODEL FOR $25 SPIN SYSTEM (REVISED)
     *
     * Static Price Tiers (set during initialization):
     * - Common: $0-$15 (0-0.6x spin cost) - Static range
     * - Uncommon: $25-$60 (1-2.4x spin cost) - Static range
     * - Rare: $70-$250 (2.8-10x spin cost) - Static range
     * - Epic: $300-$1,200 (12-48x spin cost) - Static range
     * - Legendary: $1,500+ (60x+ spin cost) - Static range
     *
     * Probability Distribution:
     * - Common: 70% (1 in 1.4 spins) - Reduced house edge
     * - Uncommon: 20% (1 in 5 spins) - Better engagement
     * - Rare: 6% (1 in 17 spins) - Retention
     * - Epic: 3% (1 in 33 spins) - Excitement
     * - Legendary: 1% (1 in 100 spins) - Jackpot dreams
     *
     * Sample Prices in Each Tier:
     * - Common: $2, $5, $8, $10, $12, $15
     * - Uncommon: $25, $30, $35, $40, $45, $50, $55, $60
     * - Rare: $70, $80, $90, $100, $115, $130, $150, $175, $200, $225
     * - Epic: $300, $350, $400, $450, $500, $600, $750, $900
     * - Legendary: $1,500, $2,250, $3,000, $4,500, $6,000
     *
     * Expected Value Calculation (with static ranges):
     * EV = (0.7 × $11) + (0.2 × $43) + (0.06 × $160) + (0.03 × $600) + (0.01 × $3,450)
     * EV = $7.70 + $8.60 + $9.60 + $18.00 + $34.50 = $78.40
     *
     * House Edge: ($25 - $78.40 × 0.3) / $25 = ~6% (30% win rate adjustment)
     * Much more player-friendly while maintaining protocol sustainability.
     */
    struct Deployments {
        address usdc;
        address appraisalProxy;
        address treasuryProxy;
        address depositorVaultProxy;
        address protocolTreasuryProxy;
        address economyManagerProxy;
        address gachaProxy;
        address serviceHandler;
        address appraisalServiceHandler;
        address collection;
        address commonTracker;
        address uncommonTracker;
        address rareTracker;
        address epicTracker;
        address legendaryTracker;
    }

    address constant TEMP_GACHA_ADDRESS = 0x1111111111111111111111111111111111111111;
    uint256 constant INITIAL_MINT = 1_000_000_000_000; // 1,000,000 tUSDC (6 decimals)
    uint256 constant PROTOCOL_TREASURY_FUNDING = 100_000_000_000; // 100,000 tUSDC for NFT buybacks
    uint256 constant SPIN_FEE = 25_000_000; // 25 tUSDC in 6 decimals (~$25 USD)

    // Original price range constants (all in 18 decimals for USD values)
    uint256 constant COMMON_MIN = 0; // $0 minimum for Common
    uint256 constant COMMON_MAX = 15 * 1e18; // $15 maximum for Common
    uint256 constant UNCOMMON_MIN = COMMON_MAX + 1; // contiguous ranges
    uint256 constant UNCOMMON_MAX = 60 * 1e18; // $60 maximum for Uncommon
    uint256 constant RARE_MIN = UNCOMMON_MAX + 1; // contiguous ranges
    uint256 constant RARE_MAX = 250 * 1e18; // $250 maximum for Rare
    uint256 constant EPIC_MIN = RARE_MAX + 1; // contiguous ranges
    uint256 constant EPIC_MAX = 1200 * 1e18; // $1,200 maximum for Epic
    uint256 constant LEGENDARY_MIN = EPIC_MAX + 1; // contiguous ranges
    uint256 constant LEGENDARY_MAX = type(uint256).max; // No upper limit for Legendary

    function run() external {
        uint256 deployerKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployer = vm.addr(deployerKey);

        console.log("Deploying local stack from:", deployer);

        vm.startBroadcast(deployerKey);
        Deployments memory deployments = _deployStack(deployer);
        vm.stopBroadcast();

        // Write addresses to .env file for frontend integration
        _writeEnvFile(deployments);

        console.log("\n=== Deployment Summary ===");
        console.log("USDC:                  ", deployments.usdc);
        console.log("NFTAppraisal Proxy:    ", deployments.appraisalProxy);
        console.log("GachaTreasury Proxy:   ", deployments.treasuryProxy);
        console.log("DepositorVault Proxy:  ", deployments.depositorVaultProxy);
        console.log("ProtocolTreasury Proxy:", deployments.protocolTreasuryProxy);
        console.log("EconomyManager Proxy:  ", deployments.economyManagerProxy);
        console.log("Gacha Proxy:           ", deployments.gachaProxy);
        console.log("Service Handler:       ", deployments.serviceHandler);
        console.log("Appraisal Handler:     ", deployments.appraisalServiceHandler);
        console.log("Demo Collection:       ", deployments.collection);
        console.log("Common Tracker:        ", deployments.commonTracker);
        console.log("Uncommon Tracker:      ", deployments.uncommonTracker);
        console.log("Rare Tracker:          ", deployments.rareTracker);
        console.log("Epic Tracker:          ", deployments.epicTracker);
        console.log("Legendary Tracker:     ", deployments.legendaryTracker);
    }

    function _deployStack(address deployer) internal returns (Deployments memory d) {
        // Deploy USDC and get service manager
        d.usdc = address(_deployUSDC(deployer));
        address wavsServiceManager = _resolveWavsServiceManager();

        // Deploy all contracts
        _deployImplementations(d);
        _deployProxies(d, deployer);
        _deployServiceHandlers(d, wavsServiceManager);

        // Wire dependencies
        _configureEconomy(d);

        // Deploy collection and trackers
        _deployCollectionAndTrackers(d, deployer);

        // Fund ProtocolTreasury for NFT buybacks
        _fundProtocolTreasury(TestUSDC(d.usdc), ProtocolTreasury(d.protocolTreasuryProxy));

        // Seed treasury
        _seedTreasury(
            GachaTreasury(d.treasuryProxy), NFTAppraisal(d.appraisalProxy), BaseERC721(d.collection), deployer
        );

        console.log("\n=== Local Gacha System Status ===");
        console.log("Whitelist Length:    ", GachaTreasury(d.treasuryProxy).getWhitelistLength());
        console.log("Gacha Available:     ", GachaTreasury(d.treasuryProxy).isGachaAvailable());
        console.log("Total NFTs:          ", GachaTreasury(d.treasuryProxy).getTotalItemsCount());

        // Display final stats
        _displayTreasuryStats(d.treasuryProxy);

        console.log("Local stack deployed successfully");
        return d;
    }

    function _deployUSDC(address deployer) internal returns (TestUSDC usdc) {
        usdc = new TestUSDC(deployer);
        usdc.mint(deployer, INITIAL_MINT);
    }

    function _deployImplementations(Deployments memory) internal {
        // Store implementation addresses in temporary storage to avoid stack issues
        // Implementations are deployed but addresses not stored in memory
        new NFTAppraisal();
        new GachaTreasury();
        new DepositorVault();
        new ProtocolTreasury();
        new GachaEconomyManager();
        new Gacha();
    }

    function _deployProxies(Deployments memory d, address deployer) internal {
        _deployAppraisalProxy(d, deployer);
        _deployTreasuryProxy(d, deployer);
        _deployDepositorVaultProxy(d, deployer);
        _deployProtocolTreasuryProxy(d, deployer);
        _deployEconomyManagerProxy(d, deployer);
        _deployGachaProxy(d, deployer);
    }

    function _deployAppraisalProxy(Deployments memory d, address deployer) internal {
        NFTAppraisal appraisalImpl = new NFTAppraisal();
        d.appraisalProxy = address(
            new ERC1967Proxy(
                address(appraisalImpl),
                abi.encodeWithSelector(NFTAppraisal.initialize.selector, deployer, d.usdc, 10 * 1e6, deployer)
            )
        );
    }

    function _deployTreasuryProxy(Deployments memory d, address deployer) internal {
        GachaTreasury treasuryImpl = new GachaTreasury();
        uint256[5] memory minPrices = [COMMON_MIN, UNCOMMON_MIN, RARE_MIN, EPIC_MIN, LEGENDARY_MIN];
        uint256[5] memory maxPrices = [COMMON_MAX, UNCOMMON_MAX, RARE_MAX, EPIC_MAX, LEGENDARY_MAX];
        d.treasuryProxy = address(
            new ERC1967Proxy(
                address(treasuryImpl),
                abi.encodeWithSelector(
                    GachaTreasury.initialize.selector,
                    deployer,
                    TEMP_GACHA_ADDRESS,
                    d.appraisalProxy,
                    minPrices,
                    maxPrices
                )
            )
        );
    }

    function _deployDepositorVaultProxy(Deployments memory d, address deployer) internal {
        DepositorVault depositorVaultImpl = new DepositorVault();
        d.depositorVaultProxy = address(
            new ERC1967Proxy(
                address(depositorVaultImpl),
                abi.encodeWithSelector(DepositorVault.initialize.selector, deployer, d.usdc, d.treasuryProxy, deployer)
            )
        );
    }

    function _deployProtocolTreasuryProxy(Deployments memory d, address deployer) internal {
        ProtocolTreasury protocolTreasuryImpl = new ProtocolTreasury();
        d.protocolTreasuryProxy = address(
            new ERC1967Proxy(
                address(protocolTreasuryImpl),
                abi.encodeWithSelector(
                    ProtocolTreasury.initialize.selector, deployer, d.usdc, deployer, d.treasuryProxy, d.appraisalProxy
                )
            )
        );
    }

    function _deployEconomyManagerProxy(Deployments memory d, address deployer) internal {
        GachaEconomyManager economyManagerImpl = new GachaEconomyManager();
        d.economyManagerProxy = address(
            new ERC1967Proxy(
                address(economyManagerImpl),
                abi.encodeWithSelector(
                    GachaEconomyManager.initialize.selector,
                    deployer,
                    d.usdc,
                    TEMP_GACHA_ADDRESS,
                    d.depositorVaultProxy,
                    d.protocolTreasuryProxy
                )
            )
        );
    }

    function _deployGachaProxy(Deployments memory d, address deployer) internal {
        Gacha gachaImpl = new Gacha();
        d.gachaProxy = address(
            new ERC1967Proxy(
                address(gachaImpl),
                abi.encodeWithSelector(
                    Gacha.initialize.selector,
                    deployer,
                    deployer,
                    d.usdc,
                    SPIN_FEE,
                    d.treasuryProxy,
                    d.economyManagerProxy
                )
            )
        );
    }

    function _deployServiceHandlers(Deployments memory d, address wavsServiceManager) internal {
        // Deploy service handlers
        GachaServiceHandler serviceHandler =
            new GachaServiceHandler(IWavsServiceManager(wavsServiceManager), d.gachaProxy);
        d.serviceHandler = address(serviceHandler);

        NFTAppraisalServiceHandler appraisalServiceHandler =
            new NFTAppraisalServiceHandler(IWavsServiceManager(wavsServiceManager), d.appraisalProxy);
        d.appraisalServiceHandler = address(appraisalServiceHandler);
    }

    function _deployCollectionAndTrackers(Deployments memory d, address deployer) internal {
        _deployCollection(d, deployer);
        _deployTrackers(d, deployer);
        GachaTreasury(d.treasuryProxy).addToWhitelist(d.collection);
    }

    function _deployCollection(Deployments memory d, address deployer) internal {
        BaseERC721 collection = new BaseERC721("Gacha Collection", "GACHA", deployer);
        d.collection = address(collection);
    }

    function _deployTrackers(Deployments memory d, address deployer) internal {
        address trackerImpl = address(new RarityTracker());
        d.commonTracker = address(
            new ERC1967Proxy(trackerImpl, abi.encodeWithSelector(RarityTracker.initialize.selector, deployer, "Common"))
        );
        d.uncommonTracker = address(
            new ERC1967Proxy(
                trackerImpl, abi.encodeWithSelector(RarityTracker.initialize.selector, deployer, "Uncommon")
            )
        );
        d.rareTracker = address(
            new ERC1967Proxy(trackerImpl, abi.encodeWithSelector(RarityTracker.initialize.selector, deployer, "Rare"))
        );
        d.epicTracker = address(
            new ERC1967Proxy(trackerImpl, abi.encodeWithSelector(RarityTracker.initialize.selector, deployer, "Epic"))
        );
        d.legendaryTracker = address(
            new ERC1967Proxy(
                trackerImpl, abi.encodeWithSelector(RarityTracker.initialize.selector, deployer, "Legendary")
            )
        );
    }

    function _configureEconomy(Deployments memory d) internal {
        // Treasury wiring
        GachaTreasury(d.treasuryProxy).setGachaContract(d.gachaProxy);
        GachaTreasury(d.treasuryProxy).setDepositorVault(d.depositorVaultProxy);
        GachaTreasury(d.treasuryProxy).setProtocolTreasury(d.protocolTreasuryProxy);

        // Economy manager links
        GachaEconomyManager(d.economyManagerProxy).setGacha(d.gachaProxy);
        GachaEconomyManager(d.economyManagerProxy).setVaults(d.depositorVaultProxy, d.protocolTreasuryProxy);

        // Update vault controllers
        DepositorVault(d.depositorVaultProxy).setEconomyManager(d.economyManagerProxy);
        ProtocolTreasury(d.protocolTreasuryProxy).setEconomyManager(d.economyManagerProxy);
        ProtocolTreasury(d.protocolTreasuryProxy).setGachaTreasury(d.treasuryProxy);

        // Point gacha to service handler and economy manager
        Gacha(d.gachaProxy).setGachaServiceHandler(d.serviceHandler);
        Gacha(d.gachaProxy).setEconomyManager(d.economyManagerProxy);

        // Configure system with default values
        Gacha(d.gachaProxy).setRarityWeights(7000, 2000, 600, 300, 100); // 70%, 20%, 6%, 3%, 1%

        // Price ranges are now set during initialization and immutable:
        // Common: $0-$15, Uncommon: $25-$60, Rare: $70-$250, Epic: $300-$1,200, Legendary: $1,500+
        console.log("Using immutable price ranges set during treasury initialization");

        console.log("Economy wiring complete");
    }

    function _seedTreasury(GachaTreasury treasury, NFTAppraisal appraisal, BaseERC721 collection, address deployer)
        internal
    {
        // Total: 50 appraised (deposited) + 10 non-appraised (not deposited)
        console.log("=== Minting NFTs with Real Courtyard TokenURIs ===");

        // Approve treasury once for all subsequent deposits
        collection.setApprovalForAll(address(treasury), true);

        _seedCommon(treasury, appraisal, collection, deployer);
        _seedUncommon(treasury, appraisal, collection, deployer);
        _seedRare(treasury, appraisal, collection, deployer);
        _seedEpic(treasury, appraisal, collection, deployer);
        _seedLegendary(treasury, appraisal, collection, deployer);
        _seedNonAppraised(collection, deployer);

        console.log("Seeded treasury with comprehensive inventory");
    }

    function _seedCommon(GachaTreasury treasury, NFTAppraisal appraisal, BaseERC721 nft, address deployer) internal {
        string[14] memory ids = [
            "0x94a865a7d6e9caa4d23b8e65106a25aec9c581dd257e2ea2c4fa44e91f08674f", // Fire Energy (Valid)
            "0x94a865a7d6e9caa4d23b8e65106a25aec9c581dd257e2ea2c4fa44e91f08674f", // Fire Energy (duplicate)
            "0x94a865a7d6e9caa4d23b8e65106a25aec9c581dd257e2ea2c4fa44e91f08674f", // Fire Energy (duplicate)
            "0x94a865a7d6e9caa4d23b8e65106a25aec9c581dd257e2ea2c4fa44e91f08674f", // Fire Energy (duplicate)
            "0x94a865a7d6e9caa4d23b8e65106a25aec9c581dd257e2ea2c4fa44e91f08674f", // Fire Energy (duplicate)
            "0x94a865a7d6e9caa4d23b8e65106a25aec9c581dd257e2ea2c4fa44e91f08674f", // Fire Energy (duplicate)
            "0x94a865a7d6e9caa4d23b8e65106a25aec9c581dd257e2ea2c4fa44e91f08674f", // Fire Energy (duplicate)
            "0x94a865a7d6e9caa4d23b8e65106a25aec9c581dd257e2ea2c4fa44e91f08674f", // Fire Energy (duplicate)
            "0x94a865a7d6e9caa4d23b8e65106a25aec9c581dd257e2ea2c4fa44e91f08674f", // Fire Energy (duplicate)
            "0x94a865a7d6e9caa4d23b8e65106a25aec9c581dd257e2ea2c4fa44e91f08674f", // Fire Energy (duplicate)
            "0x94a865a7d6e9caa4d23b8e65106a25aec9c581dd257e2ea2c4fa44e91f08674f", // Fire Energy (duplicate)
            "0x94a865a7d6e9caa4d23b8e65106a25aec9c581dd257e2ea2c4fa44e91f08674f", // Fire Energy (duplicate)
            "0x94a865a7d6e9caa4d23b8e65106a25aec9c581dd257e2ea2c4fa44e91f08674f", // Fire Energy (duplicate)
            "0x94a865a7d6e9caa4d23b8e65106a25aec9c581dd257e2ea2c4fa44e91f08674f" // Fire Energy (duplicate)
        ];
        // Predefine card IDs and prices for Common range (matching actual Fire Energy metadata)
        bytes32[8] memory commonCardIds = [
            _generateCardId("CGC", "8.5 NM-MT+", "Unnumbered Energy Cards", "Fire Energy", "English", "3812512009"),
            _generateCardId("CGC", "8.5 NM-MT+", "Unnumbered Energy Cards", "Fire Energy", "English", "3812512009"),
            _generateCardId("CGC", "8.5 NM-MT+", "Unnumbered Energy Cards", "Fire Energy", "English", "3812512009"),
            _generateCardId("CGC", "8.5 NM-MT+", "Unnumbered Energy Cards", "Fire Energy", "English", "3812512009"),
            _generateCardId("CGC", "8.5 NM-MT+", "Unnumbered Energy Cards", "Fire Energy", "English", "3812512009"),
            _generateCardId("CGC", "8.5 NM-MT+", "Unnumbered Energy Cards", "Fire Energy", "English", "3812512009"),
            _generateCardId("CGC", "8.5 NM-MT+", "Unnumbered Energy Cards", "Fire Energy", "English", "3812512009"),
            _generateCardId("CGC", "8.5 NM-MT+", "Unnumbered Energy Cards", "Fire Energy", "English", "3812512009")
        ];
        uint256[8] memory commonPrices = [
            uint256(8 * 1e18), // All Fire Energy cards should have same price
            uint256(8 * 1e18),
            uint256(8 * 1e18),
            uint256(8 * 1e18),
            uint256(8 * 1e18),
            uint256(8 * 1e18),
            uint256(8 * 1e18),
            uint256(8 * 1e18)
        ];

        // Set prices once per card ID (these will be used when tokens are minted)
        // Note: We don't set appraisals for non-existent tokens here anymore

        // Mint and deposit NFTs using the predefined card IDs
        for (uint256 i = 0; i < ids.length; i++) {
            uint256 tokenId = nft.mintWithURI(deployer, _generateCourtyardTokenURI(ids[i]));
            bytes32 cardId = commonCardIds[i % commonCardIds.length];
            appraisal.ownerSetAppraisalForTokenWithCard(
                address(nft), tokenId, cardId, commonPrices[i % commonPrices.length]
            );
            treasury.depositNFT(address(nft), tokenId);
        }
    }

    function _seedUncommon(GachaTreasury treasury, NFTAppraisal appraisal, BaseERC721 nft, address deployer) internal {
        string[10] memory ids = [
            "0xe3fe2307c9e2bd4d466687de407e7607540478594c34a1c3a0ba14a0ace7f5cb", // Bronzong (Valid)
            "0x12ca95bab110eb35ef841bacd186ae9dece31452de28b6d4ffec25d734e4fd19", // Lucario (Valid)
            "0xe3fe2307c9e2bd4d466687de407e7607540478594c34a1c3a0ba14a0ace7f5cb", // Bronzong (duplicate)
            "0x12ca95bab110eb35ef841bacd186ae9dece31452de28b6d4ffec25d734e4fd19", // Lucario (duplicate)
            "0xe3fe2307c9e2bd4d466687de407e7607540478594c34a1c3a0ba14a0ace7f5cb", // Bronzong (duplicate)
            "0x12ca95bab110eb35ef841bacd186ae9dece31452de28b6d4ffec25d734e4fd19", // Lucario (duplicate)
            "0xe3fe2307c9e2bd4d466687de407e7607540478594c34a1c3a0ba14a0ace7f5cb", // Bronzong (duplicate)
            "0x12ca95bab110eb35ef841bacd186ae9dece31452de28b6d4ffec25d734e4fd19", // Lucario (duplicate)
            "0xe3fe2307c9e2bd4d466687de407e7607540478594c34a1c3a0ba14a0ace7f5cb", // Bronzong (duplicate)
            "0x12ca95bab110eb35ef841bacd186ae9dece31452de28b6d4ffec25d734e4fd19" // Lucario (duplicate)
        ];
        // Predefine card IDs and prices for Uncommon range (matching actual Bronzong/Lucario metadata)
        bytes32[2] memory uncommonCardIds = [
            _generateCardId("CGC", "9 MINT", "Majestic Dawn", "Bronzong", "English", "1401014224065"),
            _generateCardId("CGC", "9 MINT", "Majestic Dawn", "Lucario", "English", "1401014224066")
        ];
        uint256[2] memory uncommonPrices = [
            uint256(30 * 1e18), // Bronzong price
            uint256(35 * 1e18) // Lucario price
        ];

        // Set prices once per card ID (these will be used when tokens are minted)
        // Note: We don't set appraisals for non-existent tokens here anymore

        // Mint and deposit NFTs using the predefined card IDs
        for (uint256 i = 0; i < ids.length; i++) {
            uint256 tokenId = nft.mintWithURI(deployer, _generateCourtyardTokenURI(ids[i]));
            bytes32 cardId = uncommonCardIds[i % uncommonCardIds.length];
            appraisal.ownerSetAppraisalForTokenWithCard(
                address(nft), tokenId, cardId, uncommonPrices[i % uncommonPrices.length]
            );
            treasury.depositNFT(address(nft), tokenId);
        }
    }

    function _seedRare(GachaTreasury treasury, NFTAppraisal appraisal, BaseERC721 nft, address deployer) internal {
        string[10] memory ids = [
            "0x560b63c82c999147eb80dbf88634e0394e4e70170dff1064e22283422d5cb4a9", // Psyduck (Valid)
            "0x560b63c82c999147eb80dbf88634e0394e4e70170dff1064e22283422d5cb4a9", // Psyduck (duplicate)
            "0x560b63c82c999147eb80dbf88634e0394e4e70170dff1064e22283422d5cb4a9", // Psyduck (duplicate)
            "0x560b63c82c999147eb80dbf88634e0394e4e70170dff1064e22283422d5cb4a9", // Psyduck (duplicate)
            "0x560b63c82c999147eb80dbf88634e0394e4e70170dff1064e22283422d5cb4a9", // Psyduck (duplicate)
            "0x560b63c82c999147eb80dbf88634e0394e4e70170dff1064e22283422d5cb4a9", // Psyduck (duplicate)
            "0x560b63c82c999147eb80dbf88634e0394e4e70170dff1064e22283422d5cb4a9", // Psyduck (duplicate)
            "0x560b63c82c999147eb80dbf88634e0394e4e70170dff1064e22283422d5cb4a9", // Psyduck (duplicate)
            "0x560b63c82c999147eb80dbf88634e0394e4e70170dff1064e22283422d5cb4a9", // Psyduck (duplicate)
            "0x560b63c82c999147eb80dbf88634e0394e4e70170dff1064e22283422d5cb4a9" // Psyduck (duplicate)
        ];
        // Predefine card IDs and prices for Rare range (matching actual Psyduck metadata)
        bytes32[1] memory rareCardIds =
            [_generateCardId("PSA", "9 MINT", "Black Star", "Psyduck", "English", "71692205")];
        uint256[1] memory rarePrices = [
            uint256(100 * 1e18) // All Psyduck cards should have same price
        ];

        // Set prices once per card ID (these will be used when tokens are minted)
        // Note: We don't set appraisals for non-existent tokens here anymore

        // Mint and deposit NFTs using the predefined card IDs
        for (uint256 i = 0; i < ids.length; i++) {
            uint256 tokenId = nft.mintWithURI(deployer, _generateCourtyardTokenURI(ids[i]));
            bytes32 cardId = rareCardIds[i % rareCardIds.length];
            appraisal.ownerSetAppraisalForTokenWithCard(
                address(nft), tokenId, cardId, rarePrices[i % rarePrices.length]
            );
            treasury.depositNFT(address(nft), tokenId);
        }
    }

    function _seedEpic(GachaTreasury treasury, NFTAppraisal appraisal, BaseERC721 nft, address deployer) internal {
        string[10] memory ids = [
            "0x018f4009e23d378e58cc7fb130fecda4038367ab092a4d326b94bb79e9cfe46b", // Feraligatr (Valid)
            "0x018f4009e23d378e58cc7fb130fecda4038367ab092a4d326b94bb79e9cfe46b", // Feraligatr (duplicate)
            "0x018f4009e23d378e58cc7fb130fecda4038367ab092a4d326b94bb79e9cfe46b", // Feraligatr (duplicate)
            "0x018f4009e23d378e58cc7fb130fecda4038367ab092a4d326b94bb79e9cfe46b", // Feraligatr (duplicate)
            "0x018f4009e23d378e58cc7fb130fecda4038367ab092a4d326b94bb79e9cfe46b", // Feraligatr (duplicate)
            "0x018f4009e23d378e58cc7fb130fecda4038367ab092a4d326b94bb79e9cfe46b", // Feraligatr (duplicate)
            "0x018f4009e23d378e58cc7fb130fecda4038367ab092a4d326b94bb79e9cfe46b", // Feraligatr (duplicate)
            "0x018f4009e23d378e58cc7fb130fecda4038367ab092a4d326b94bb79e9cfe46b", // Feraligatr (duplicate)
            "0x018f4009e23d378e58cc7fb130fecda4038367ab092a4d326b94bb79e9cfe46b", // Feraligatr (duplicate)
            "0x018f4009e23d378e58cc7fb130fecda4038367ab092a4d326b94bb79e9cfe46b" // Feraligatr (duplicate)
        ];
        // Predefine card IDs and prices for Epic range (matching actual Feraligatr metadata)
        bytes32[1] memory epicCardIds =
            [_generateCardId("PSA", "10 GEM MINT", "Japanese Promo", "Feraligatr", "Japanese", "81437601")];
        uint256[1] memory epicPrices = [
            uint256(500 * 1e18) // All Feraligatr cards should have same price
        ];

        // Set prices once per card ID (these will be used when tokens are minted)
        // Note: We don't set appraisals for non-existent tokens here anymore

        // Mint and deposit NFTs using the predefined card IDs
        for (uint256 i = 0; i < ids.length; i++) {
            uint256 tokenId = nft.mintWithURI(deployer, _generateCourtyardTokenURI(ids[i]));
            bytes32 cardId = epicCardIds[i % epicCardIds.length];
            appraisal.ownerSetAppraisalForTokenWithCard(
                address(nft), tokenId, cardId, epicPrices[i % epicPrices.length]
            );
            treasury.depositNFT(address(nft), tokenId);
        }
    }

    function _seedLegendary(GachaTreasury treasury, NFTAppraisal appraisal, BaseERC721 nft, address deployer)
        internal
    {
        string[5] memory ids = [
            "0x217e91a9d710b92ebdaaee53d9b85dfff8b0010d85e01dc0c5d7e83a23552b4c", // Base Set Charizard (Valid)
            "0xd8747e713116b7c3171311e371f4864aa53cc444e0073fbe167fc99166c54b4f", // Charizard V (Valid)
            "0x217e91a9d710b92ebdaaee53d9b85dfff8b0010d85e01dc0c5d7e83a23552b4c", // Base Set Charizard (duplicate)
            "0xd8747e713116b7c3171311e371f4864aa53cc444e0073fbe167fc99166c54b4f", // Charizard V (duplicate)
            "0x217e91a9d710b92ebdaaee53d9b85dfff8b0010d85e01dc0c5d7e83a23552b4c" // Base Set Charizard (duplicate)
        ];
        // Predefine card IDs and prices for Legendary range (matching actual Charizard metadata)
        bytes32[2] memory legendaryCardIds = [
            _generateCardId("PSA", "8 NM-MT", "Base Set", "Charizard", "English", "22610703"),
            _generateCardId("BGS", "10 PRISTINE", "Champion's Path", "Charizard V", "English", "0012526329")
        ];
        uint256[2] memory legendaryPrices = [uint256(1_500 * 1e18), uint256(2_250 * 1e18)]; // Mix of 0s and 5s endings

        // Set prices once per card ID (these will be used when tokens are minted)
        // Note: We don't set appraisals for non-existent tokens here anymore

        // Mint and deposit NFTs using the predefined card IDs
        for (uint256 i = 0; i < ids.length; i++) {
            uint256 tokenId = nft.mintWithURI(deployer, _generateCourtyardTokenURI(ids[i]));
            bytes32 cardId = legendaryCardIds[i % legendaryCardIds.length];
            appraisal.ownerSetAppraisalForTokenWithCard(
                address(nft), tokenId, cardId, legendaryPrices[i % legendaryPrices.length]
            );
            treasury.depositNFT(address(nft), tokenId);
        }
    }

    function _fundProtocolTreasury(TestUSDC usdc, ProtocolTreasury protocolTreasury) internal {
        console.log("=== Funding ProtocolTreasury for NFT Buybacks ===");
        usdc.transfer(address(protocolTreasury), PROTOCOL_TREASURY_FUNDING);
        console.log("ProtocolTreasury funded with:", PROTOCOL_TREASURY_FUNDING / 1e6, " tUSDC");

        uint256 treasuryBalance = usdc.balanceOf(address(protocolTreasury));
        console.log("ProtocolTreasury balance:", treasuryBalance / 1e6, " tUSDC");
    }

    function _seedNonAppraised(BaseERC721 nft, address deployer) internal {
        string[10] memory ids = [
            "0x94a865a7d6e9caa4d23b8e65106a25aec9c581dd257e2ea2c4fa44e91f08674f", // Fire Energy (Valid)
            "0xe3fe2307c9e2bd4d466687de407e7607540478594c34a1c3a0ba14a0ace7f5cb", // Bronzong (Valid)
            "0x12ca95bab110eb35ef841bacd186ae9dece31452de28b6d4ffec25d734e4fd19", // Lucario (Valid)
            "0x560b63c82c999147eb80dbf88634e0394e4e70170dff1064e22283422d5cb4a9", // Psyduck (Valid)
            "0x018f4009e23d378e58cc7fb130fecda4038367ab092a4d326b94bb79e9cfe46b", // Feraligatr (Valid)
            "0x217e91a9d710b92ebdaaee53d9b85dfff8b0010d85e01dc0c5d7e83a23552b4c", // Base Set Charizard (Valid)
            "0xd8747e713116b7c3171311e371f4864aa53cc444e0073fbe167fc99166c54b4f", // Charizard V (Valid)
            "0x94a865a7d6e9caa4d23b8e65106a25aec9c581dd257e2ea2c4fa44e91f08674f", // Fire Energy (duplicate)
            "0xe3fe2307c9e2bd4d466687de407e7607540478594c34a1c3a0ba14a0ace7f5cb", // Bronzong (duplicate)
            "0x12ca95bab110eb35ef841bacd186ae9dece31452de28b6d4ffec25d734e4fd19" // Lucario (duplicate)
        ];
        for (uint256 i = 0; i < ids.length; i++) {
            nft.mintWithURI(deployer, _generateCourtyardTokenURI(ids[i]));
        }
    }

    function _resolveWavsServiceManager() internal view returns (address wavsServiceManager) {
        try vm.envAddress("WAVS_SERVICE_MANAGER_ADDRESS") returns (address envAddress) {
            wavsServiceManager = envAddress;
            console.log("Using WAVS manager from env:", wavsServiceManager);
        } catch {
            string memory deployJson = vm.readFile("../avs/.project-output/chain-1/avs/avs_deploy.json");
            wavsServiceManager = vm.parseJsonAddress(deployJson, ".addresses.WavsServiceManager");
            console.log("Using WAVS manager from JSON:", wavsServiceManager);
        }
    }

    function _generateCourtyardTokenURI(string memory id) internal pure returns (string memory) {
        return string(
            abi.encodePacked(
                "https://api.courtyard.io/index/token/polygon/",
                "0x251BE3A17Af4892035C37ebf5890F4a4D889dcAD/",
                id,
                "/metadata.json"
            )
        );
    }

    function _generateCardId(
        string memory gradingCompany,
        string memory grade,
        string memory set,
        string memory name,
        string memory language,
        string memory number
    ) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(gradingCompany, grade, set, name, language, number));
    }

    function _displayTreasuryStats(address treasuryProxy) internal view {
        GachaTreasury treasury = GachaTreasury(treasuryProxy);

        console.log("\n=== Treasury Statistics ===");
        console.log("Common NFTs:     ", treasury.getRarityCount(GachaTreasury.Rarity.Common));
        console.log("Uncommon NFTs:   ", treasury.getRarityCount(GachaTreasury.Rarity.Uncommon));
        console.log("Rare NFTs:       ", treasury.getRarityCount(GachaTreasury.Rarity.Rare));
        console.log("Epic NFTs:       ", treasury.getRarityCount(GachaTreasury.Rarity.Epic));
        console.log("Legendary NFTs:  ", treasury.getRarityCount(GachaTreasury.Rarity.Legendary));
        console.log("Total Deposited: ", treasury.getTotalItemsCount());
    }

    function _writeEnvFile(Deployments memory deployments) internal {
        string memory envContent = _buildEnvContent(deployments);
        vm.writeFile("../.env.local", envContent);
        console.log("Environment file written to: .env.local");
    }

    function _buildEnvContent(Deployments memory deployments) internal pure returns (string memory) {
        return string(
            abi.encodePacked(
                _envLine("CHAIN_ID", "31337"),
                _envLine("USDC_ADDRESS", vm.toString(deployments.usdc)),
                _envLine("NFT_APPRAISAL_ADDRESS", vm.toString(deployments.appraisalProxy)),
                _envLine("GACHA_TREASURY_ADDRESS", vm.toString(deployments.treasuryProxy)),
                _envLine("DEPOSITOR_VAULT_ADDRESS", vm.toString(deployments.depositorVaultProxy)),
                _envLine("PROTOCOL_TREASURY_ADDRESS", vm.toString(deployments.protocolTreasuryProxy)),
                _envLine("ECONOMY_MANAGER_ADDRESS", vm.toString(deployments.economyManagerProxy)),
                _envLine("GACHA_ADDRESS", vm.toString(deployments.gachaProxy)),
                _envLine("GACHA_SERVICE_HANDLER_ADDRESS", vm.toString(deployments.serviceHandler)),
                _envLine("APPRAISAL_SERVICE_HANDLER_ADDRESS", vm.toString(deployments.appraisalServiceHandler)),
                _envLine("COLLECTION_ADDRESS", vm.toString(deployments.collection)),
                _envLine("COMMON_TRACKER_ADDRESS", vm.toString(deployments.commonTracker)),
                _envLine("UNCOMMON_TRACKER_ADDRESS", vm.toString(deployments.uncommonTracker)),
                _envLine("RARE_TRACKER_ADDRESS", vm.toString(deployments.rareTracker)),
                _envLine("EPIC_TRACKER_ADDRESS", vm.toString(deployments.epicTracker)),
                _envLine("LEGENDARY_TRACKER_ADDRESS", vm.toString(deployments.legendaryTracker))
            )
        );
    }

    function _envLine(string memory key, string memory value) internal pure returns (string memory) {
        return string(abi.encodePacked(key, "=", value, "\n"));
    }
}
