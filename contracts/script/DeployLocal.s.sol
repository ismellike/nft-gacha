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
import {BuybackVault} from "../src/economy/BuybackVault.sol";
import {ProtocolTreasury} from "../src/economy/ProtocolTreasury.sol";
import {GachaEconomyManager} from "../src/economy/GachaEconomyManager.sol";
import {BaseERC721} from "../src/tokens/BaseERC721.sol";

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
     * Price Tiers (clean numbers ending in 0s and 5s):
     * - Common: $0-20 (0-0.8x spin cost) - Less punishing loss zone
     * - Uncommon: $25-60 (1-2.4x spin cost) - Break-even to small profit zone
     * - Rare: $70-250 (2.8-10x spin cost) - Decent profit zone
     * - Epic: $300-1,200 (12-48x spin cost) - Significant win zone
     * - Legendary: $1,500+ (60x+ spin cost) - Jackpot zone
     *
     * Probability Distribution:
     * - Common: 70% (1 in 1.4 spins) - Reduced house edge
     * - Uncommon: 20% (1 in 5 spins) - Better engagement
     * - Rare: 6% (1 in 17 spins) - Retention
     * - Epic: 3% (1 in 33 spins) - Excitement
     * - Legendary: 1% (1 in 100 spins) - Jackpot dreams
     *
     * Sample Prices in Each Tier:
     * - Common: $2, $5, $8, $10, $12, $15, $17, $18, $19, $20
     * - Uncommon: $25, $30, $35, $40, $45, $50, $55, $60
     * - Rare: $70, $80, $90, $100, $115, $130, $150, $175, $200, $225
     * - Epic: $300, $350, $400, $450, $500, $600, $750, $900
     * - Legendary: $1,500, $2,250, $3,000, $4,500, $6,000
     *
     * Expected Value Calculation (with new ranges):
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
        address buybackVaultProxy;
        address protocolTreasuryProxy;
        address economyManagerProxy;
        address gachaProxy;
        address serviceHandler;
        address appraisalServiceHandler;
        address collection;
    }

    address constant TEMP_GACHA_ADDRESS = 0x1111111111111111111111111111111111111111;
    uint256 constant INITIAL_MINT = 1_000_000_000_000; // 1,000,000 tUSDC (6 decimals)
    uint256 constant SPIN_FEE = 25_000_000; // 25 tUSDC in 6 decimals (~$25 USD)

    // Clean price range constants (all in 18 decimals for USD values)
    uint256 constant SPIN_COST_USD = 25 * 1e18; // $25 spin cost
    uint256 constant COMMON_MAX = 15 * 1e18; // Balanced for sustainability
    uint256 constant UNCOMMON_MIN = 25 * 1e18; // Clean round number
    uint256 constant UNCOMMON_MAX = 60 * 1e18; // Clean round number
    uint256 constant RARE_MIN = 70 * 1e18; // Clean round number
    uint256 constant RARE_MAX = 250 * 1e18; // Clean round number
    uint256 constant EPIC_MIN = 300 * 1e18; // Clean round number
    uint256 constant EPIC_MAX = 1200 * 1e18; // Clean round number
    uint256 constant LEGENDARY_MIN = 1500 * 1e18; // Clean round number

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
        console.log("BuybackVault Proxy:    ", deployments.buybackVaultProxy);
        console.log("ProtocolTreasury Proxy:", deployments.protocolTreasuryProxy);
        console.log("EconomyManager Proxy:  ", deployments.economyManagerProxy);
        console.log("Gacha Proxy:           ", deployments.gachaProxy);
        console.log("Service Handler:       ", deployments.serviceHandler);
        console.log("Appraisal Handler:     ", deployments.appraisalServiceHandler);
        console.log("Demo Collection:       ", deployments.collection);
    }

    function _deployStack(address deployer) internal returns (Deployments memory d) {
        // Deploy 6-decimal USDC test token
        TestUSDC usdc = new TestUSDC(deployer);
        usdc.mint(deployer, INITIAL_MINT);
        d.usdc = address(usdc);

        // Resolve WAVS service manager
        address wavsServiceManager = _resolveWavsServiceManager();

        // Deploy implementations
        NFTAppraisal appraisalImpl = new NFTAppraisal();
        GachaTreasury treasuryImpl = new GachaTreasury();
        DepositorVault depositorVaultImpl = new DepositorVault();
        BuybackVault buybackVaultImpl = new BuybackVault();
        ProtocolTreasury protocolTreasuryImpl = new ProtocolTreasury();
        GachaEconomyManager economyManagerImpl = new GachaEconomyManager();
        Gacha gachaImpl = new Gacha();

        // Deploy proxies with initializer payloads
        d.appraisalProxy = address(
            new ERC1967Proxy(
                address(appraisalImpl),
                abi.encodeWithSelector(
                    NFTAppraisal.initialize.selector, deployer, d.usdc, 10 * 10 ** usdc.decimals(), deployer
                )
            )
        );

        d.treasuryProxy = address(
            new ERC1967Proxy(
                address(treasuryImpl),
                abi.encodeWithSelector(
                    GachaTreasury.initialize.selector, deployer, TEMP_GACHA_ADDRESS, d.appraisalProxy
                )
            )
        );

        d.depositorVaultProxy = address(
            new ERC1967Proxy(
                address(depositorVaultImpl),
                abi.encodeWithSelector(DepositorVault.initialize.selector, deployer, d.usdc, d.treasuryProxy, deployer)
            )
        );

        d.protocolTreasuryProxy = address(
            new ERC1967Proxy(
                address(protocolTreasuryImpl),
                abi.encodeWithSelector(ProtocolTreasury.initialize.selector, deployer, d.usdc, deployer)
            )
        );

        d.buybackVaultProxy = address(
            new ERC1967Proxy(
                address(buybackVaultImpl),
                abi.encodeWithSelector(
                    BuybackVault.initialize.selector,
                    deployer,
                    d.usdc,
                    d.treasuryProxy,
                    d.depositorVaultProxy,
                    d.appraisalProxy,
                    deployer
                )
            )
        );

        d.economyManagerProxy = address(
            new ERC1967Proxy(
                address(economyManagerImpl),
                abi.encodeWithSelector(
                    GachaEconomyManager.initialize.selector,
                    deployer,
                    d.usdc,
                    TEMP_GACHA_ADDRESS,
                    d.depositorVaultProxy,
                    d.buybackVaultProxy,
                    d.protocolTreasuryProxy
                )
            )
        );

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

        // Deploy service handlers
        GachaServiceHandler serviceHandler =
            new GachaServiceHandler(IWavsServiceManager(wavsServiceManager), d.gachaProxy);
        d.serviceHandler = address(serviceHandler);

        NFTAppraisalServiceHandler appraisalServiceHandler =
            new NFTAppraisalServiceHandler(IWavsServiceManager(wavsServiceManager), d.appraisalProxy);
        d.appraisalServiceHandler = address(appraisalServiceHandler);

        // Wire dependencies
        _configureEconomy(d);

        // Deploy demo ERC721 collection and seed treasury
        BaseERC721 collection = new BaseERC721("Gacha Collection", "GACHA", deployer);
        d.collection = address(collection);

        GachaTreasury(d.treasuryProxy).addToWhitelist(d.collection);

        _seedTreasury(GachaTreasury(d.treasuryProxy), NFTAppraisal(d.appraisalProxy), collection, deployer);

        console.log("\n=== Local Gacha System Status ===");
        console.log("Whitelist Length:    ", GachaTreasury(d.treasuryProxy).getWhitelistLength());
        console.log("Gacha Available:     ", GachaTreasury(d.treasuryProxy).isGachaAvailable());
        console.log("Total NFTs:          ", GachaTreasury(d.treasuryProxy).getTotalItemsCount());

        // Display final stats
        _displayTreasuryStats(d.treasuryProxy);

        console.log("Local stack deployed successfully");
        return d;
    }

    function _configureEconomy(Deployments memory d) internal {
        // Treasury wiring
        GachaTreasury(d.treasuryProxy).setGachaContract(d.gachaProxy);
        GachaTreasury(d.treasuryProxy).setDepositorVault(d.depositorVaultProxy);
        GachaTreasury(d.treasuryProxy).setBuybackVault(d.buybackVaultProxy);

        // Economy manager links
        GachaEconomyManager(d.economyManagerProxy).setGacha(d.gachaProxy);
        GachaEconomyManager(d.economyManagerProxy).setVaults(
            d.depositorVaultProxy, d.buybackVaultProxy, d.protocolTreasuryProxy
        );

        // Update vault controllers
        DepositorVault(d.depositorVaultProxy).setEconomyManager(d.economyManagerProxy);
        DepositorVault(d.depositorVaultProxy).setBuybackVault(d.buybackVaultProxy);
        ProtocolTreasury(d.protocolTreasuryProxy).setEconomyManager(d.economyManagerProxy);
        BuybackVault(d.buybackVaultProxy).setEconomyManager(d.economyManagerProxy);

        // Point gacha to service handler and economy manager
        Gacha(d.gachaProxy).setGachaServiceHandler(d.serviceHandler);
        Gacha(d.gachaProxy).setEconomyManager(d.economyManagerProxy);

        // Configure system with default values
        Gacha(d.gachaProxy).setRarityWeights(7000, 2000, 600, 300, 100); // 70%, 20%, 6%, 3%, 1%

        // Configure clean price ranges with variety ending in 0s and 5s
        console.log("Setting clean price ranges with 0s and 5s variety...");
        GachaTreasury(d.treasuryProxy).setPriceRange(
            GachaTreasury.Rarity.Common, 0, COMMON_MAX
        ); // $0-15 (0-0.6x spin cost - sustainable loss)
        GachaTreasury(d.treasuryProxy).setPriceRange(
            GachaTreasury.Rarity.Uncommon, UNCOMMON_MIN, UNCOMMON_MAX
        ); // $25-60 (1-2.4x spin cost - small win)
        GachaTreasury(d.treasuryProxy).setPriceRange(
            GachaTreasury.Rarity.Rare, RARE_MIN, RARE_MAX
        ); // $70-250 (2.8-10x spin cost - decent profit)
        GachaTreasury(d.treasuryProxy).setPriceRange(
            GachaTreasury.Rarity.Epic, EPIC_MIN, EPIC_MAX
        ); // $300-1,200 (12-48x spin cost - significant win)
        GachaTreasury(d.treasuryProxy).setPriceRange(
            GachaTreasury.Rarity.Legendary, LEGENDARY_MIN, type(uint256).max
        ); // $1,500+ (60x+ spin cost - jackpot)

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

    function _seedCommon(
        GachaTreasury treasury,
        NFTAppraisal appraisal,
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
        // Predefine card IDs and prices for Common range
        bytes32[8] memory commonCardIds = [
            _generateCardId("CGC", "8.5 NM-MT+", "Unnumbered Energy Cards", "Fire Energy", "English", "Basic"),
            _generateCardId("CGC", "8.5 NM-MT+", "Unnumbered Energy Cards", "Water Energy", "English", "Basic"),
            _generateCardId("CGC", "8.5 NM-MT+", "Unnumbered Energy Cards", "Lightning Energy", "English", "Basic"),
            _generateCardId("CGC", "8.5 NM-MT+", "Unnumbered Energy Cards", "Fighting Energy", "English", "Basic"),
            _generateCardId("CGC", "8.5 NM-MT+", "Unnumbered Energy Cards", "Psychic Energy", "English", "Basic"),
            _generateCardId("CGC", "8.5 NM-MT+", "Unnumbered Energy Cards", "Darkness Energy", "English", "Basic"),
            _generateCardId("CGC", "8.5 NM-MT+", "Unnumbered Energy Cards", "Metal Energy", "English", "Basic"),
            _generateCardId("CGC", "8.5 NM-MT+", "Unnumbered Energy Cards", "Fairy Energy", "English", "Basic")
        ];
        uint256[8] memory commonPrices = [
            2 * 1e18, 5 * 1e18, 7 * 1e18, 10 * 1e18,
            12 * 1e18, 15 * 1e18, 13 * 1e18, 8 * 1e18
        ]; // Mix of 0s and 5s endings, max $15

        // Set prices once per card ID
        for (uint256 i = 0; i < commonCardIds.length; i++) {
            appraisal.ownerSetAppraisalForTokenWithCard(address(0), 0, commonCardIds[i], commonPrices[i]);
        }

        // Mint and deposit NFTs using the predefined card IDs
        for (uint256 i = 0; i < ids.length; i++) {
            uint256 tokenId = nft.mintWithURI(deployer, _generateCourtyardTokenURI(ids[i]));
            bytes32 cardId = commonCardIds[i % commonCardIds.length];
            appraisal.ownerSetAppraisalForToken(address(nft), tokenId, cardId);
            treasury.depositNFT(address(nft), tokenId);
        }
    }

    function _seedUncommon(
        GachaTreasury treasury,
        NFTAppraisal appraisal,
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
        // Predefine card IDs and prices for Uncommon range
        bytes32[8] memory uncommonCardIds = [
            _generateCardId("CGC", "9 MINT", "Majestic Dawn", "Bronzong", "English", "16"),
            _generateCardId("CGC", "9 MINT", "Majestic Dawn", "Lucario", "English", "17"),
            _generateCardId("CGC", "9 MINT", "EX Hidden Legends", "Beldum", "English", "29"),
            _generateCardId("CGC", "9 MINT", "EX Hidden Legends", "Metagross", "English", "30"),
            _generateCardId("CGC", "9 MINT", "Majestic Dawn", "Garchomp", "English", "18"),
            _generateCardId("CGC", "9 MINT", "Majestic Dawn", "Rayquaza", "English", "19"),
            _generateCardId("CGC", "9 MINT", "EX Hidden Legends", "Kyogre", "English", "31"),
            _generateCardId("CGC", "9 MINT", "EX Hidden Legends", "Groudon", "English", "32")
        ];
        uint256[8] memory uncommonPrices = [
            25 * 1e18, 30 * 1e18, 35 * 1e18, 40 * 1e18,
            45 * 1e18, 50 * 1e18, 55 * 1e18, 60 * 1e18
        ]; // Mix of 0s and 5s endings

        // Set prices once per card ID
        for (uint256 i = 0; i < uncommonCardIds.length; i++) {
            appraisal.ownerSetAppraisalForTokenWithCard(address(0), 0, uncommonCardIds[i], uncommonPrices[i]);
        }

        // Mint and deposit NFTs using the predefined card IDs
        for (uint256 i = 0; i < ids.length; i++) {
            uint256 tokenId = nft.mintWithURI(deployer, _generateCourtyardTokenURI(ids[i]));
            bytes32 cardId = uncommonCardIds[i % uncommonCardIds.length];
            appraisal.ownerSetAppraisalForToken(address(nft), tokenId, cardId);
            treasury.depositNFT(address(nft), tokenId);
        }
    }

    function _seedRare(
        GachaTreasury treasury,
        NFTAppraisal appraisal,
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
        // Predefine card IDs and prices for Rare range
        bytes32[10] memory rareCardIds = [
            _generateCardId("PSA", "9 MINT", "Black Star", "Psyduck", "English", "Basic"),
            _generateCardId("PSA", "9 MINT", "Black Star", "Pikachu", "English", "Basic"),
            _generateCardId("PSA", "9 MINT", "Black Star", "Bulbasaur", "English", "Basic"),
            _generateCardId("PSA", "9 MINT", "Black Star", "Charmander", "English", "Basic"),
            _generateCardId("PSA", "9 MINT", "Black Star", "Squirtle", "English", "Basic"),
            _generateCardId("PSA", "9 MINT", "Black Star", "Jigglypuff", "English", "Basic"),
            _generateCardId("PSA", "9 MINT", "Black Star", "Meowth", "English", "Basic"),
            _generateCardId("PSA", "9 MINT", "Black Star", "Eevee", "English", "Basic"),
            _generateCardId("PSA", "9 MINT", "Black Star", "Snorlax", "English", "Basic"),
            _generateCardId("PSA", "9 MINT", "Black Star", "Mewtwo", "English", "Basic")
        ];
        uint256[10] memory rarePrices = [
            70 * 1e18, 80 * 1e18, 90 * 1e18, 100 * 1e18, 115 * 1e18,
            130 * 1e18, 150 * 1e18, 175 * 1e18, 200 * 1e18, 225 * 1e18
        ]; // Mix of 0s and 5s endings

        // Set prices once per card ID
        for (uint256 i = 0; i < rareCardIds.length; i++) {
            appraisal.ownerSetAppraisalForTokenWithCard(address(0), 0, rareCardIds[i], rarePrices[i]);
        }

        // Mint and deposit NFTs using the predefined card IDs
        for (uint256 i = 0; i < ids.length; i++) {
            uint256 tokenId = nft.mintWithURI(deployer, _generateCourtyardTokenURI(ids[i]));
            bytes32 cardId = rareCardIds[i % rareCardIds.length];
            appraisal.ownerSetAppraisalForToken(address(nft), tokenId, cardId);
            treasury.depositNFT(address(nft), tokenId);
        }
    }

    function _seedEpic(
        GachaTreasury treasury,
        NFTAppraisal appraisal,
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
        // Predefine card IDs and prices for Epic range
        bytes32[8] memory epicCardIds = [
            _generateCardId("PSA", "10 GEM MINT", "Japanese Promo", "Feraligatr", "Japanese", "016/P"),
            _generateCardId("PSA", "10 GEM MINT", "Japanese Promo", "Typhlosion", "Japanese", "017/P"),
            _generateCardId("PSA", "10 GEM MINT", "Japanese Promo", "Meganium", "Japanese", "018/P"),
            _generateCardId("PSA", "10 GEM MINT", "Japanese Promo", "Dragonite", "Japanese", "019/P"),
            _generateCardId("PSA", "10 GEM MINT", "Japanese Promo", "Celebi", "Japanese", "020/P"),
            _generateCardId("PSA", "10 GEM MINT", "Japanese Promo", "Suicune", "Japanese", "021/P"),
            _generateCardId("PSA", "10 GEM MINT", "Japanese Promo", "Raikou", "Japanese", "022/P"),
            _generateCardId("PSA", "10 GEM MINT", "Japanese Promo", "Entei", "Japanese", "023/P")
        ];
        uint256[8] memory epicPrices = [
            300 * 1e18, 350 * 1e18, 400 * 1e18, 450 * 1e18,
            500 * 1e18, 600 * 1e18, 750 * 1e18, 900 * 1e18
        ]; // Mix of 0s and 5s endings

        // Set prices once per card ID
        for (uint256 i = 0; i < epicCardIds.length; i++) {
            appraisal.ownerSetAppraisalForTokenWithCard(address(0), 0, epicCardIds[i], epicPrices[i]);
        }

        // Mint and deposit NFTs using the predefined card IDs
        for (uint256 i = 0; i < ids.length; i++) {
            uint256 tokenId = nft.mintWithURI(deployer, _generateCourtyardTokenURI(ids[i]));
            bytes32 cardId = epicCardIds[i % epicCardIds.length];
            appraisal.ownerSetAppraisalForToken(address(nft), tokenId, cardId);
            treasury.depositNFT(address(nft), tokenId);
        }
    }

    function _seedLegendary(
        GachaTreasury treasury,
        NFTAppraisal appraisal,
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
        // Predefine card IDs and prices for Legendary range
        bytes32[2] memory legendaryCardIds = [
            _generateCardId("PSA", "8 NM-MT", "Base Set 2", "Charizard", "English", "4"),
            _generateCardId("BGS", "10 PRISTINE", "Champion's Path", "Charizard V", "English", "079")
        ];
        uint256[2] memory legendaryPrices = [
            1_500 * 1e18, 2_250 * 1e18
        ]; // Mix of 0s and 5s endings

        // Set prices once per card ID
        for (uint256 i = 0; i < legendaryCardIds.length; i++) {
            appraisal.ownerSetAppraisalForTokenWithCard(address(0), 0, legendaryCardIds[i], legendaryPrices[i]);
        }

        // Mint and deposit NFTs using the predefined card IDs
        for (uint256 i = 0; i < ids.length; i++) {
            uint256 tokenId = nft.mintWithURI(deployer, _generateCourtyardTokenURI(ids[i]));
            bytes32 cardId = legendaryCardIds[i % legendaryCardIds.length];
            appraisal.ownerSetAppraisalForToken(address(nft), tokenId, cardId);
            treasury.depositNFT(address(nft), tokenId);
        }
    }

    function _seedNonAppraised(BaseERC721 nft, address deployer) internal {
        string[10] memory ids = [
            "0xd8747e713116b7c3171311e371f4864aa53cc444e0073fbe167fc99166c54b4f",
            "0x94a865a7d6e9caa4d23b8e65106a25aec9c581dd257e2ea2c4fa44e91f08674f",
            "0xe3fe2307c9e2bd4d466687de407e7607540478594c34a1c3a0ba14a0ace7f5cb",
            "0x12ca95bab110eb35ef841bacd186ae9dece31452de28b6d4ffec25d734e4fd19",
            "0x560b63c82c999147eb80dbf88634e0394e4e70170dff1064e22283422d5cb4a9",
            "0x018f4009e23d378e58cc7fb130fecda4038367ab092a4d326b94bb79e9cfe46b",
            "0x217e91a9d710b92ebdaaee53d9b85dfff8b0010d85e01dc0c5d7e83a23552b4c",
            "0xd8747e713116b7c3171311e371f4864aa53cc444e0073fbe167fc99166c54b4f",
            "0x217e91a9d710b92ebdaaee53d9b85dfff8b0010d85e01dc0c5d7e83a23552b4c",
            "0x217e91a9d710b92ebdaaee53d9b85dfff8b0010d85e01dc0c5d7e83a23552b4c"
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
                "https://api.courtyard.io/v1/contract/0x251BE3A17Af4892035C37ebf5890F4a4D889dcAD/metadata/",
                id
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
        return keccak256(
            abi.encodePacked(gradingCompany, grade, set, name, language, number)
        );
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
        string memory envContent = string(
            abi.encodePacked(
                "# Auto-generated deployment addresses\n",
                "CHAIN_ID=31337\n",
                "USDC_ADDRESS=", vm.toString(deployments.usdc), "\n",
                "NFT_APPRAISAL_ADDRESS=", vm.toString(deployments.appraisalProxy), "\n",
                "GACHA_TREASURY_ADDRESS=", vm.toString(deployments.treasuryProxy), "\n",
                "DEPOSITOR_VAULT_ADDRESS=", vm.toString(deployments.depositorVaultProxy), "\n",
                "BUYBACK_VAULT_ADDRESS=", vm.toString(deployments.buybackVaultProxy), "\n",
                "PROTOCOL_TREASURY_ADDRESS=", vm.toString(deployments.protocolTreasuryProxy), "\n",
                "ECONOMY_MANAGER_ADDRESS=", vm.toString(deployments.economyManagerProxy), "\n",
                "GACHA_ADDRESS=", vm.toString(deployments.gachaProxy), "\n",
                "GACHA_SERVICE_HANDLER_ADDRESS=", vm.toString(deployments.serviceHandler), "\n",
                "APPRAISAL_SERVICE_HANDLER_ADDRESS=", vm.toString(deployments.appraisalServiceHandler), "\n",
                "COLLECTION_ADDRESS=", vm.toString(deployments.collection), "\n"
            )
        );

        vm.writeFile(".env.local", envContent);
        console.log("Environment file written to: .env.local");
    }
}
