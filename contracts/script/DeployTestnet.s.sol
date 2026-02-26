// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Script, console} from "forge-std/Script.sol";
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
import {CardGroupedVault} from "../src/economy/CardGroupedVault.sol";
import {ProtocolTreasury} from "../src/economy/ProtocolTreasury.sol";
import {GachaEconomyManager} from "../src/economy/GachaEconomyManager.sol";

/// @dev Simple 6-decimal test token to simulate USDC on testnets without a native USDC
contract TestUSDC is ERC20, ERC20Permit, Ownable {
    constructor(address initialOwner) ERC20("Test USDC", "tUSDC") ERC20Permit("Test USDC") Ownable(initialOwner) {}

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}

/**
 * @title DeployTestnet
 * @notice Deploys the full Gacha system to a public testnet (Holesky, Sepolia, Polygon Amoy, etc.)
 *
 * @dev Required environment variables:
 *   DEPLOYER_PRIVATE_KEY          - Private key of the deploying wallet (must be funded)
 *   WAVS_SERVICE_MANAGER_ADDRESS  - Address of the deployed WavsServiceManager on the target chain
 *
 * @dev Optional environment variables:
 *   USDC_TOKEN_ADDRESS            - Existing USDC/stablecoin address. If unset, deploys TestUSDC.
 *   CHAIN_ID                      - Target chain ID (auto-detected from RPC if omitted)
 *   RPC_URL                       - Target RPC URL (passed via --rpc-url flag)
 *   SPIN_FEE                      - Custom spin fee in USDC decimals (default: 25_000_000 = $25)
 *   PROTOCOL_TREASURY_FUNDING     - Amount to fund protocol treasury with (only when TestUSDC deployed)
 *
 * @dev Usage:
 *   forge script script/DeployTestnet.s.sol:DeployTestnet \
 *     --rpc-url $RPC_URL \
 *     --broadcast \
 *     --verify \
 *     --etherscan-api-key $ETHERSCAN_API_KEY \
 *     --private-key $DEPLOYER_PRIVATE_KEY
 */
contract DeployTestnet is Script {
    // =========================================================================
    // ECONOMIC MODEL (same as DeployLocal)
    // =========================================================================

    address constant TEMP_GACHA_ADDRESS = 0x1111111111111111111111111111111111111111;
    uint256 constant DEFAULT_SPIN_FEE = 25_000_000; // 25 tUSDC in 6 decimals (~$25 USD)
    uint256 constant INITIAL_MINT = 1_000_000_000_000; // 1,000,000 tUSDC (6 decimals)
    uint256 constant DEFAULT_PROTOCOL_TREASURY_FUNDING = 100_000_000_000; // 100,000 tUSDC

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
        address cardGroupedVaultProxy;
        address protocolTreasuryProxy;
        address economyManagerProxy;
        address gachaProxy;
        address gachaServiceHandler;
        address appraisalServiceHandler;
        bool deployedTestUSDC;
    }

    // =========================================================================
    // MAIN ENTRY POINT
    // =========================================================================

    function run() external {
        uint256 deployerKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployer = vm.addr(deployerKey);

        // WAVS service manager is required for testnet -- no mocks
        address wavsServiceManager = vm.envAddress("WAVS_SERVICE_MANAGER_ADDRESS");

        // Optional overrides
        uint256 spinFee = vm.envOr("SPIN_FEE", DEFAULT_SPIN_FEE);
        uint256 chainId = vm.envOr("CHAIN_ID", block.chainid);
        string memory rpcUrl = vm.envOr("RPC_URL", string(""));

        console.log("========================================");
        console.log("   TESTNET DEPLOYMENT");
        console.log("========================================");
        console.log("Deployer:              ", deployer);
        console.log("Chain ID:              ", chainId);
        console.log("WAVS Service Manager:  ", wavsServiceManager);
        console.log("Spin Fee (USDC units): ", spinFee);
        console.log("========================================");

        vm.startBroadcast(deployerKey);
        Deployments memory d = _deployAll(deployer, wavsServiceManager, spinFee);
        vm.stopBroadcast();

        // Write environment file for frontend integration
        _writeEnvFile(d, chainId, rpcUrl);

        // Print deployment summary
        _printSummary(d);

        // Print verification commands
        _printVerificationCommands(d, chainId);
    }

    // =========================================================================
    // DEPLOYMENT LOGIC
    // =========================================================================

    function _deployAll(address deployer, address wavsServiceManager, uint256 spinFee)
        internal
        returns (Deployments memory d)
    {
        // Step 1: Resolve or deploy USDC
        d.usdc = _resolveUSDC(deployer, d);

        // Step 2: Deploy implementation contracts behind proxies
        _deployProxies(d, deployer, spinFee);

        // Step 3: Deploy service handlers (non-upgradeable)
        _deployServiceHandlers(d, wavsServiceManager);

        // Step 4: Wire all contracts together
        _configureEconomy(d);

        // Step 5: Fund protocol treasury if we deployed TestUSDC
        if (d.deployedTestUSDC) {
            uint256 funding = vm.envOr("PROTOCOL_TREASURY_FUNDING", DEFAULT_PROTOCOL_TREASURY_FUNDING);
            _fundProtocolTreasury(TestUSDC(d.usdc), ProtocolTreasury(d.protocolTreasuryProxy), funding);
        }

        console.log("\nAll contracts deployed and wired successfully.");
        return d;
    }

    function _resolveUSDC(address deployer, Deployments memory d) internal returns (address) {
        try vm.envAddress("USDC_TOKEN_ADDRESS") returns (address existingUsdc) {
            console.log("Using existing USDC at:", existingUsdc);
            d.deployedTestUSDC = false;
            return existingUsdc;
        } catch {
            console.log("No USDC_TOKEN_ADDRESS set -- deploying TestUSDC...");
            TestUSDC usdc = new TestUSDC(deployer);
            usdc.mint(deployer, INITIAL_MINT);
            console.log("TestUSDC deployed. Minted", INITIAL_MINT / 1e6, "tUSDC to deployer.");
            d.deployedTestUSDC = true;
            return address(usdc);
        }
    }

    // =========================================================================
    // PROXY DEPLOYMENTS
    // =========================================================================

    function _deployProxies(Deployments memory d, address deployer, uint256 spinFee) internal {
        // NFTAppraisal
        {
            NFTAppraisal impl = new NFTAppraisal();
            d.appraisalProxy = address(
                new ERC1967Proxy(
                    address(impl),
                    abi.encodeWithSelector(NFTAppraisal.initialize.selector, deployer, d.usdc, 10 * 1e6, deployer)
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

        // ProtocolTreasury
        {
            ProtocolTreasury impl = new ProtocolTreasury();
            d.protocolTreasuryProxy = address(
                new ERC1967Proxy(
                    address(impl),
                    abi.encodeWithSelector(
                        ProtocolTreasury.initialize.selector,
                        deployer,
                        d.usdc,
                        deployer,
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
    // FUNDING
    // =========================================================================

    function _fundProtocolTreasury(TestUSDC usdc, ProtocolTreasury protocolTreasury, uint256 amount) internal {
        console.log("\nFunding ProtocolTreasury with", amount / 1e6, "tUSDC...");
        // forge-lint: disable-next-line(erc20-unchecked-transfer)
        usdc.transfer(address(protocolTreasury), amount);
        uint256 balance = usdc.balanceOf(address(protocolTreasury));
        console.log("ProtocolTreasury balance:", balance / 1e6, "tUSDC");
    }

    // =========================================================================
    // ENV FILE OUTPUT
    // =========================================================================

    function _writeEnvFile(Deployments memory d, uint256 chainId, string memory rpcUrl) internal {
        string memory content = string(
            abi.encodePacked(
                "# Generated by DeployTestnet.s.sol\n",
                "# Copy these into your root .env.local and run `task frontend:sync-env`\n\n",
                _envLine("ENV_MODE", "TESTNET"),
                _envLine("CHAIN_ID", vm.toString(chainId)),
                _envLine("RPC_URL", rpcUrl),
                _envLine("USDC_ADDRESS", vm.toString(d.usdc)),
                _envLine("NFT_APPRAISAL_ADDRESS", vm.toString(d.appraisalProxy)),
                _envLine("GACHA_TREASURY_ADDRESS", vm.toString(d.treasuryProxy)),
                _envLine("CARD_GROUPED_VAULT_ADDRESS", vm.toString(d.cardGroupedVaultProxy)),
                _envLine("PROTOCOL_TREASURY_ADDRESS", vm.toString(d.protocolTreasuryProxy)),
                _envLine("ECONOMY_MANAGER_ADDRESS", vm.toString(d.economyManagerProxy)),
                _envLine("GACHA_ADDRESS", vm.toString(d.gachaProxy)),
                _envLine("GACHA_SERVICE_HANDLER_ADDRESS", vm.toString(d.gachaServiceHandler)),
                _envLine("APPRAISAL_SERVICE_HANDLER_ADDRESS", vm.toString(d.appraisalServiceHandler))
            )
        );

        // forge-lint: disable-next-line(unsafe-cheatcode)
        vm.writeFile("../.env.testnet", content);
        console.log("\nEnvironment file written to: .env.testnet");
    }

    function _envLine(string memory key, string memory value) internal pure returns (string memory) {
        return string(abi.encodePacked(key, "=", value, "\n"));
    }

    // =========================================================================
    // SUMMARY & VERIFICATION
    // =========================================================================

    function _printSummary(Deployments memory d) internal pure {
        console.log("\n========================================");
        console.log("   DEPLOYMENT SUMMARY");
        console.log("========================================");
        console.log("USDC:                   ", d.usdc);
        console.log("NFTAppraisal Proxy:     ", d.appraisalProxy);
        console.log("GachaTreasury Proxy:    ", d.treasuryProxy);
        console.log("CardGroupedVault Proxy: ", d.cardGroupedVaultProxy);
        console.log("ProtocolTreasury Proxy: ", d.protocolTreasuryProxy);
        console.log("EconomyManager Proxy:   ", d.economyManagerProxy);
        console.log("Gacha Proxy:            ", d.gachaProxy);
        console.log("GachaServiceHandler:    ", d.gachaServiceHandler);
        console.log("AppraisalServiceHandler:", d.appraisalServiceHandler);
        console.log("TestUSDC deployed:      ", d.deployedTestUSDC ? "YES" : "NO");
        console.log("========================================");
    }

    function _printVerificationCommands(Deployments memory d, uint256 chainId) internal pure {
        console.log("\n========================================");
        console.log("   POST-DEPLOY VERIFICATION");
        console.log("========================================");
        console.log("Run these commands to verify the deployment:\n");
        console.log("# Check Gacha owner");
        console.log(
            string(abi.encodePacked("cast call ", vm.toString(d.gachaProxy), " 'owner()(address)' --rpc-url $RPC_URL"))
        );
        console.log("\n# Check spin fee");
        console.log(
            string(
                abi.encodePacked("cast call ", vm.toString(d.gachaProxy), " 'spinFee()(uint256)' --rpc-url $RPC_URL")
            )
        );
        console.log("\n# Check treasury is wired to gacha");
        console.log(
            string(
                abi.encodePacked(
                    "cast call ", vm.toString(d.treasuryProxy), " 'gachaContract()(address)' --rpc-url $RPC_URL"
                )
            )
        );
        console.log("\n# Check gacha is available (will be false until NFTs are deposited)");
        console.log(
            string(
                abi.encodePacked(
                    "cast call ", vm.toString(d.treasuryProxy), " 'isGachaAvailable()(bool)' --rpc-url $RPC_URL"
                )
            )
        );
        console.log("\n# Verify contracts on Etherscan/Blockscout:");
        console.log(
            string(
                abi.encodePacked(
                    "forge verify-contract ",
                    vm.toString(d.gachaProxy),
                    " ERC1967Proxy --chain ",
                    vm.toString(chainId),
                    " --etherscan-api-key $ETHERSCAN_API_KEY"
                )
            )
        );
        console.log("========================================");
    }
}
