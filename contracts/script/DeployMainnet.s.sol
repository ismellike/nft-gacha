// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Script, console} from "forge-std/Script.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {IWavsServiceManager} from "@wavs/eigenlayer/ecdsa/interfaces/IWavsServiceManager.sol";

import {NFTAppraisal} from "../src/appraisal/NFTAppraisal.sol";
import {NFTAppraisalServiceHandler} from "../src/appraisal/NFTAppraisalServiceHandler.sol";
import {Gacha} from "../src/gacha/Gacha.sol";
import {GachaTreasury} from "../src/gacha/GachaTreasury.sol";
import {GachaTreasuryReader} from "../src/gacha/GachaTreasuryReader.sol";
import {GachaServiceHandler} from "../src/gacha/GachaServiceHandler.sol";
import {CardGroupedVault} from "../src/economy/CardGroupedVault.sol";
import {ProtocolTreasury} from "../src/economy/ProtocolTreasury.sol";
import {GachaEconomyManager} from "../src/economy/GachaEconomyManager.sol";

/**
 * @title DeployMainnet
 * @notice Deploys the full Gacha system to Polygon mainnet.
 *
 * @dev Required environment variables:
 *   DEPLOYER_PRIVATE_KEY          - Private key of the deploying wallet (must be funded with POL)
 *   WAVS_SERVICE_MANAGER_ADDRESS  - Address of the deployed WavsServiceManager on Polygon
 *   USDC_TOKEN_ADDRESS            - Polygon USDC address (0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359)
 *   PROTOCOL_OWNER                - Multisig or governance address that will own all contracts
 *
 * @dev Optional environment variables:
 *   SPIN_FEE                      - Custom spin fee in USDC 6-decimal units (default: 25_000_000 = $25)
 *   APPRAISAL_FEE                 - Custom appraisal fee in USDC 6-decimal units (default: 1_000_000 = $1)
 *
 * @dev Usage:
 *   forge script script/DeployMainnet.s.sol:DeployMainnet \
 *     --rpc-url $POLYGON_RPC_URL \
 *     --broadcast \
 *     --verify \
 *     --etherscan-api-key $POLYGONSCAN_API_KEY \
 *     --private-key $DEPLOYER_PRIVATE_KEY \
 *     --slow
 */
contract DeployMainnet is Script {
    // =========================================================================
    // CONSTANTS
    // =========================================================================

    uint256 constant POLYGON_CHAIN_ID = 137;
    address constant TEMP_GACHA_ADDRESS = 0x1111111111111111111111111111111111111111;
    uint256 constant DEFAULT_SPIN_FEE = 25_000_000; // 25 USDC (6 decimals)
    uint256 constant DEFAULT_APPRAISAL_FEE = 1_000_000; // 1 USDC (6 decimals)

    // Price range constants (all in 18 decimals for USD values)
    uint256 constant PRICE_STEP = 1e16;
    uint256 constant COMMON_MIN = 0;
    uint256 constant COMMON_MAX = 15 * 1e18;
    uint256 constant UNCOMMON_MIN = COMMON_MAX + PRICE_STEP;
    uint256 constant UNCOMMON_MAX = 60 * 1e18;
    uint256 constant RARE_MIN = UNCOMMON_MAX + PRICE_STEP;
    uint256 constant RARE_MAX = 250 * 1e18;
    uint256 constant EPIC_MIN = RARE_MAX + PRICE_STEP;
    uint256 constant EPIC_MAX = 1200 * 1e18;
    uint256 constant LEGENDARY_MIN = EPIC_MAX + PRICE_STEP;
    uint256 constant LEGENDARY_MAX = type(uint256).max;

    // =========================================================================
    // STRUCTS
    // =========================================================================

    struct Deployments {
        address usdc;
        address appraisalProxy;
        address treasuryProxy;
        address treasuryReader;
        address cardGroupedVaultProxy;
        address protocolTreasuryProxy;
        address economyManagerProxy;
        address gachaProxy;
        address gachaServiceHandler;
        address appraisalServiceHandler;
    }

    // =========================================================================
    // MAIN ENTRY POINT
    // =========================================================================

    function run() external {
        // Validate chain
        require(block.chainid == POLYGON_CHAIN_ID, "DeployMainnet: must be run on Polygon (chain 137)");

        uint256 deployerKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployer = vm.addr(deployerKey);

        // Required addresses
        address wavsServiceManager = vm.envAddress("WAVS_SERVICE_MANAGER_ADDRESS");
        address usdc = vm.envAddress("USDC_TOKEN_ADDRESS");
        address protocolOwner = vm.envAddress("PROTOCOL_OWNER");

        // Optional overrides
        uint256 spinFee = vm.envOr("SPIN_FEE", DEFAULT_SPIN_FEE);
        uint256 appraisalFee = vm.envOr("APPRAISAL_FEE", DEFAULT_APPRAISAL_FEE);

        console.log("========================================");
        console.log("   MAINNET DEPLOYMENT (Polygon)");
        console.log("========================================");
        console.log("Deployer:              ", deployer);
        console.log("Protocol Owner:        ", protocolOwner);
        console.log("Chain ID:              ", block.chainid);
        console.log("USDC:                  ", usdc);
        console.log("WAVS Service Manager:  ", wavsServiceManager);
        console.log("Spin Fee (USDC units): ", spinFee);
        console.log("Appraisal Fee (USDC):  ", appraisalFee);
        console.log("========================================");

        vm.startBroadcast(deployerKey);
        Deployments memory d = _deployAll(deployer, protocolOwner, usdc, wavsServiceManager, spinFee, appraisalFee);

        // Transfer ownership to protocol owner (multisig)
        if (deployer != protocolOwner) {
            _transferOwnership(d, protocolOwner);
        }
        vm.stopBroadcast();

        // Write environment file
        _writeEnvFile(d);

        // Print deployment summary
        _printSummary(d, protocolOwner);

        // Print verification commands
        _printVerificationCommands(d);
    }

    // =========================================================================
    // DEPLOYMENT LOGIC
    // =========================================================================

    function _deployAll(
        address deployer,
        address protocolOwner,
        address usdc,
        address wavsServiceManager,
        uint256 spinFee,
        uint256 appraisalFee
    ) internal returns (Deployments memory d) {
        d.usdc = usdc;

        // Deploy all proxied contracts
        _deployProxies(d, deployer, protocolOwner, spinFee, appraisalFee);

        // Deploy service handlers (immutable, non-upgradeable)
        _deployServiceHandlers(d, wavsServiceManager);

        // Wire all contracts together
        _configureEconomy(d);

        console.log("\nAll contracts deployed and wired successfully.");
        return d;
    }

    // =========================================================================
    // PROXY DEPLOYMENTS
    // =========================================================================

    function _deployProxies(
        Deployments memory d,
        address deployer,
        address protocolOwner,
        uint256 spinFee,
        uint256 appraisalFee
    ) internal {
        // NFTAppraisal - protocolAddress receives appraisal fees
        {
            NFTAppraisal impl = new NFTAppraisal();
            d.appraisalProxy = address(
                new ERC1967Proxy(
                    address(impl),
                    abi.encodeWithSelector(NFTAppraisal.initialize.selector, deployer, d.usdc, appraisalFee, deployer)
                )
            );
            console.log("NFTAppraisal proxy:     ", d.appraisalProxy);
        }

        // GachaTreasury
        {
            GachaTreasury impl = new GachaTreasury();
            uint8 numRarities = 5;
            string[] memory rarityNames = new string[](5);
            rarityNames[0] = "Common";
            rarityNames[1] = "Uncommon";
            rarityNames[2] = "Rare";
            rarityNames[3] = "Epic";
            rarityNames[4] = "Legendary";
            uint256[] memory minPrices = new uint256[](5);
            minPrices[0] = COMMON_MIN;
            minPrices[1] = UNCOMMON_MIN;
            minPrices[2] = RARE_MIN;
            minPrices[3] = EPIC_MIN;
            minPrices[4] = LEGENDARY_MIN;
            uint256[] memory maxPrices = new uint256[](5);
            maxPrices[0] = COMMON_MAX;
            maxPrices[1] = UNCOMMON_MAX;
            maxPrices[2] = RARE_MAX;
            maxPrices[3] = EPIC_MAX;
            maxPrices[4] = LEGENDARY_MAX;
            d.treasuryProxy = address(
                new ERC1967Proxy(
                    address(impl),
                    abi.encodeWithSelector(
                        GachaTreasury.initialize.selector,
                        deployer,
                        TEMP_GACHA_ADDRESS,
                        d.appraisalProxy,
                        numRarities,
                        rarityNames,
                        minPrices,
                        maxPrices
                    )
                )
            );
            console.log("GachaTreasury proxy:    ", d.treasuryProxy);
        }

        // GachaTreasuryReader (non-upgradeable)
        {
            d.treasuryReader = address(new GachaTreasuryReader(d.treasuryProxy));
            console.log("GachaTreasuryReader:    ", d.treasuryReader);
        }

        // CardGroupedVault
        {
            CardGroupedVault impl = new CardGroupedVault();
            d.cardGroupedVaultProxy = address(
                new ERC1967Proxy(
                    address(impl),
                    abi.encodeWithSelector(
                        CardGroupedVault.initialize.selector, deployer, d.usdc, d.treasuryProxy, deployer, uint8(5)
                    )
                )
            );
            console.log("CardGroupedVault proxy: ", d.cardGroupedVaultProxy);
        }

        // ProtocolTreasury - protocolOwner as beneficiary
        {
            ProtocolTreasury impl = new ProtocolTreasury();
            d.protocolTreasuryProxy = address(
                new ERC1967Proxy(
                    address(impl),
                    abi.encodeWithSelector(
                        ProtocolTreasury.initialize.selector,
                        deployer,
                        d.usdc,
                        protocolOwner,
                        d.treasuryProxy,
                        d.appraisalProxy
                    )
                )
            );
            console.log("ProtocolTreasury proxy: ", d.protocolTreasuryProxy);
        }

        // GachaEconomyManager
        {
            GachaEconomyManager impl = new GachaEconomyManager();
            d.economyManagerProxy = address(
                new ERC1967Proxy(
                    address(impl),
                    abi.encodeWithSelector(
                        GachaEconomyManager.initialize.selector,
                        deployer,
                        d.usdc,
                        TEMP_GACHA_ADDRESS,
                        d.cardGroupedVaultProxy,
                        d.protocolTreasuryProxy,
                        uint8(5)
                    )
                )
            );
            console.log("EconomyManager proxy:   ", d.economyManagerProxy);
        }

        // Gacha (main game contract)
        {
            Gacha impl = new Gacha();
            d.gachaProxy = address(
                new ERC1967Proxy(
                    address(impl),
                    abi.encodeWithSelector(
                        Gacha.initialize.selector,
                        deployer,
                        deployer,
                        d.usdc,
                        spinFee,
                        d.treasuryProxy,
                        d.economyManagerProxy
                    )
                )
            );
            console.log("Gacha proxy:            ", d.gachaProxy);
        }
    }

    // =========================================================================
    // SERVICE HANDLERS
    // =========================================================================

    function _deployServiceHandlers(Deployments memory d, address wavsServiceManager) internal {
        GachaServiceHandler gsh = new GachaServiceHandler(IWavsServiceManager(wavsServiceManager), d.gachaProxy);
        d.gachaServiceHandler = address(gsh);
        console.log("GachaServiceHandler:    ", d.gachaServiceHandler);

        NFTAppraisalServiceHandler ash =
            new NFTAppraisalServiceHandler(IWavsServiceManager(wavsServiceManager), d.appraisalProxy);
        d.appraisalServiceHandler = address(ash);
        console.log("AppraisalServiceHandler:", d.appraisalServiceHandler);
    }

    // =========================================================================
    // ECONOMY WIRING
    // =========================================================================

    function _configureEconomy(Deployments memory d) internal {
        console.log("\nWiring economy contracts...");

        // Treasury wiring
        GachaTreasury(d.treasuryProxy).setGachaContract(d.gachaProxy);
        GachaTreasury(d.treasuryProxy).setCardGroupedVault(d.cardGroupedVaultProxy);
        GachaTreasury(d.treasuryProxy).setProtocolTreasury(d.protocolTreasuryProxy);

        // Economy manager links
        GachaEconomyManager(d.economyManagerProxy).setGacha(d.gachaProxy);
        GachaEconomyManager(d.economyManagerProxy).setVaults(d.cardGroupedVaultProxy, d.protocolTreasuryProxy);

        // Update vault controllers
        CardGroupedVault(d.cardGroupedVaultProxy).setEconomyManager(d.economyManagerProxy);
        ProtocolTreasury(d.protocolTreasuryProxy).setEconomyManager(d.economyManagerProxy);
        ProtocolTreasury(d.protocolTreasuryProxy).setGachaTreasury(d.treasuryProxy);

        // Point gacha to service handler and economy manager
        Gacha(d.gachaProxy).setGachaServiceHandler(d.gachaServiceHandler);
        Gacha(d.gachaProxy).setEconomyManager(d.economyManagerProxy);

        // Configure default rarity weights
        uint256[] memory defaultTargets = new uint256[](5);
        defaultTargets[0] = 7000;
        defaultTargets[1] = 2000;
        defaultTargets[2] = 600;
        defaultTargets[3] = 300;
        defaultTargets[4] = 100;
        Gacha(d.gachaProxy).setDynamicWeightsConfig(defaultTargets);

        console.log("Economy wiring complete.");
    }

    // =========================================================================
    // OWNERSHIP TRANSFER
    // =========================================================================

    function _transferOwnership(Deployments memory d, address newOwner) internal {
        console.log("\nTransferring ownership to:", newOwner);

        NFTAppraisal(d.appraisalProxy).transferOwnership(newOwner);
        GachaTreasury(d.treasuryProxy).transferOwnership(newOwner);
        CardGroupedVault(d.cardGroupedVaultProxy).transferOwnership(newOwner);
        ProtocolTreasury(d.protocolTreasuryProxy).transferOwnership(newOwner);
        GachaEconomyManager(d.economyManagerProxy).transferOwnership(newOwner);
        Gacha(d.gachaProxy).transferOwnership(newOwner);

        console.log("Ownership transferred for all upgradeable contracts.");
    }

    // =========================================================================
    // ENV FILE OUTPUT
    // =========================================================================

    function _writeEnvFile(Deployments memory d) internal {
        string memory content = string(
            abi.encodePacked(
                "# Generated by DeployMainnet.s.sol\n",
                "# Copy these into your root .env and run `task frontend:sync-env`\n\n",
                _envLine("ENV_MODE", "MAINNET"),
                _envLine("CHAIN_ID", "137"),
                _envLine("USDC_ADDRESS", vm.toString(d.usdc)),
                _envLine("NFT_APPRAISAL_ADDRESS", vm.toString(d.appraisalProxy)),
                _envLine("GACHA_TREASURY_ADDRESS", vm.toString(d.treasuryProxy)),
                _envLine("GACHA_TREASURY_READER_ADDRESS", vm.toString(d.treasuryReader)),
                _envLine("CARD_GROUPED_VAULT_ADDRESS", vm.toString(d.cardGroupedVaultProxy)),
                _envLine("PROTOCOL_TREASURY_ADDRESS", vm.toString(d.protocolTreasuryProxy)),
                _envLine("ECONOMY_MANAGER_ADDRESS", vm.toString(d.economyManagerProxy)),
                _envLine("GACHA_ADDRESS", vm.toString(d.gachaProxy)),
                _envLine("GACHA_SERVICE_HANDLER_ADDRESS", vm.toString(d.gachaServiceHandler)),
                _envLine("APPRAISAL_SERVICE_HANDLER_ADDRESS", vm.toString(d.appraisalServiceHandler))
            )
        );

        // forge-lint: disable-next-line(unsafe-cheatcode)
        vm.writeFile("../.env.mainnet", content);
        console.log("\nEnvironment file written to: .env.mainnet");
    }

    function _envLine(string memory key, string memory value) internal pure returns (string memory) {
        return string(abi.encodePacked(key, "=", value, "\n"));
    }

    // =========================================================================
    // SUMMARY & VERIFICATION
    // =========================================================================

    function _printSummary(Deployments memory d, address protocolOwner) internal pure {
        console.log("\n========================================");
        console.log("   MAINNET DEPLOYMENT SUMMARY");
        console.log("========================================");
        console.log("USDC:                   ", d.usdc);
        console.log("NFTAppraisal Proxy:     ", d.appraisalProxy);
        console.log("GachaTreasury Proxy:    ", d.treasuryProxy);
        console.log("GachaTreasuryReader:    ", d.treasuryReader);
        console.log("CardGroupedVault Proxy: ", d.cardGroupedVaultProxy);
        console.log("ProtocolTreasury Proxy: ", d.protocolTreasuryProxy);
        console.log("EconomyManager Proxy:   ", d.economyManagerProxy);
        console.log("Gacha Proxy:            ", d.gachaProxy);
        console.log("GachaServiceHandler:    ", d.gachaServiceHandler);
        console.log("AppraisalServiceHandler:", d.appraisalServiceHandler);
        console.log("Owner:                  ", protocolOwner);
        console.log("========================================");
    }

    function _printVerificationCommands(Deployments memory d) internal pure {
        console.log("\n========================================");
        console.log("   POST-DEPLOY CHECKLIST");
        console.log("========================================");
        console.log("\n1. Verify all contracts on Polygonscan:");
        console.log(
            string(
                abi.encodePacked(
                    "   forge verify-contract ",
                    vm.toString(d.gachaProxy),
                    " ERC1967Proxy --chain 137 --etherscan-api-key $POLYGONSCAN_API_KEY"
                )
            )
        );
        console.log("\n2. Validate ownership transfer:");
        console.log(
            string(
                abi.encodePacked(
                    "   cast call ", vm.toString(d.gachaProxy), " 'owner()(address)' --rpc-url $POLYGON_RPC_URL"
                )
            )
        );
        console.log("\n3. Check spin fee:");
        console.log(
            string(
                abi.encodePacked(
                    "   cast call ", vm.toString(d.gachaProxy), " 'spinFee()(uint256)' --rpc-url $POLYGON_RPC_URL"
                )
            )
        );
        console.log("\n4. Whitelist NFT collections via owner multisig");
        console.log("5. Fund ProtocolTreasury with USDC for buybacks");
        console.log("6. Deploy WAVS operators and register services");
        console.log("7. Update frontend .env with .env.mainnet values");
        console.log("========================================");
    }
}
