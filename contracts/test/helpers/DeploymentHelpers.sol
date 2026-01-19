// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Test} from "forge-std/Test.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {GachaTreasury} from "../../src/gacha/GachaTreasury.sol";
import {NFTAppraisal} from "../../src/appraisal/NFTAppraisal.sol";
import {DepositorVault} from "../../src/economy/DepositorVault.sol";
import {ProtocolTreasury} from "../../src/economy/ProtocolTreasury.sol";
import {GachaEconomyManager} from "../../src/economy/GachaEconomyManager.sol";
import {MockNFTAppraisal} from "../mocks/MockNFTAppraisal.sol";
import {BaseERC20} from "../../src/tokens/BaseERC20.sol";
import {TestConstants} from "./TestConstants.sol";

/**
 * @title Deployment Helpers
 * @notice Standardized deployment patterns for all test contracts
 * @dev Eliminates duplicated deployment code across test files
 * @author NFT Gacha Team
 */
contract DeploymentHelpers is Test {
    using TestConstants for *;

    // ========================================================================
    // GACHA TREASURY DEPLOYMENT
    // ========================================================================

    /**
     * @notice Deploy GachaTreasury with proxy pattern
     * @param owner The owner of the contract
     * @param gachaContract The authorized gacha contract address
     * @param mockAppraisal The mock NFT appraisal contract
     * @return treasury The deployed GachaTreasury proxy
     */
    function _deployTreasury(
        address owner,
        address gachaContract,
        address mockAppraisal
    ) internal returns (GachaTreasury treasury) {
        GachaTreasury treasuryImpl = new GachaTreasury();

        vm.startPrank(owner);
        uint256[5] memory minPrices = TestConstants.getMinPrices();
        uint256[5] memory maxPrices = TestConstants.getMaxPrices();

        bytes memory initData = abi.encodeWithSelector(
            GachaTreasury.initialize.selector,
            owner,
            gachaContract,
            mockAppraisal,
            minPrices,
            maxPrices
        );

        ERC1967Proxy proxy = new ERC1967Proxy(address(treasuryImpl), initData);
        treasury = GachaTreasury(address(proxy));
        vm.stopPrank();
    }

    /**
     * @notice Deploy GachaTreasury with default test configuration
     * @return treasury The deployed GachaTreasury proxy
     * @return mockAppraisal The deployed mock appraisal
     */
    function _deployDefaultTreasury() internal returns (GachaTreasury treasury, MockNFTAppraisal mockAppraisal) {
        mockAppraisal = new MockNFTAppraisal();
        treasury = _deployTreasury(TestConstants.OWNER, TestConstants.GACHA_CONTRACT, address(mockAppraisal));
    }

    // ========================================================================
    // NFT APPRAISAL DEPLOYMENT
    // ========================================================================

    /**
     * @notice Deploy NFTAppraisal with proxy pattern
     * @param owner The owner of the contract
     * @param feeToken The fee token address
     * @param fee The appraisal fee amount
     * @param protocolTreasury The protocol treasury address
     * @return appraisal The deployed NFTAppraisal proxy
     */
    function _deployAppraisal(
        address owner,
        address feeToken,
        uint256 fee,
        address protocolTreasury
    ) internal returns (NFTAppraisal appraisal) {
        NFTAppraisal appraisalImpl = new NFTAppraisal();

        bytes memory initData =
            abi.encodeWithSelector(NFTAppraisal.initialize.selector, owner, feeToken, fee, protocolTreasury);

        ERC1967Proxy proxy = new ERC1967Proxy(address(appraisalImpl), initData);
        appraisal = NFTAppraisal(address(proxy));
    }

    /**
     * @notice Deploy NFTAppraisal with default test configuration
     * @param owner The owner of the contract
     * @return appraisal The deployed NFTAppraisal proxy
     * @return feeToken The deployed fee token
     */
    function _deployDefaultAppraisal(address owner)
        internal
        returns (NFTAppraisal appraisal, BaseERC20 feeToken)
    {
        feeToken = new BaseERC20("Fee Token", "FEE", owner);
        appraisal = _deployAppraisal(owner, address(feeToken), TestConstants.APPRAISAL_FEE, TestConstants.PROTOCOL_TREASURY);
    }

    // ========================================================================
    // ECONOMY STACK DEPLOYMENT
    // ========================================================================

    /**
     * @notice Deploy complete economy stack (vault + treasury + manager)
     * @param owner The owner of all contracts
     * @param feeToken The fee token for rewards
     * @return vault The deployed DepositorVault
     * @return protocolTreasury The deployed ProtocolTreasury
     * @return manager The deployed GachaEconomyManager
     */
    function _deployEconomyStack(
        address owner,
        address feeToken
    )
        internal
        returns (
            DepositorVault vault,
            ProtocolTreasury protocolTreasury,
            GachaEconomyManager manager
        )
    {
        vm.startPrank(owner);

        // Deploy all contracts first
        vault = new DepositorVault();
        protocolTreasury = new ProtocolTreasury();
        manager = new GachaEconomyManager();

        // Initialize with temporary addresses (will be wired later)
        vault.initialize(owner, feeToken, address(protocolTreasury), address(manager));
        protocolTreasury.initialize(owner, feeToken, address(manager), address(0), address(0));  // treasury and appraisal will be set later
        manager.initialize(owner, feeToken, TestConstants.GACHA_CONTRACT, address(vault), address(protocolTreasury));

        // Wire up the contracts using setter functions
        vault.setEconomyManager(address(manager));
        protocolTreasury.setEconomyManager(address(manager));

        vm.stopPrank();
    }

    /**
     * @notice Deploy economy stack with default test configuration
     * @return vault The deployed DepositorVault
     * @return protocolTreasury The deployed ProtocolTreasury
     * @return manager The deployed GachaEconomyManager
     * @return feeToken The deployed fee token
     */
    function _deployDefaultEconomyStack()
        internal
        returns (
            DepositorVault vault,
            ProtocolTreasury protocolTreasury,
            GachaEconomyManager manager,
            BaseERC20 feeToken
        )
    {
        feeToken = new BaseERC20("USDC", "USDC", TestConstants.OWNER);
        (vault, protocolTreasury, manager) = _deployEconomyStack(TestConstants.OWNER, address(feeToken));
    }

    // ========================================================================
    // INDIVIDUAL ECONOMY CONTRACTS
    // ========================================================================

    /**
     * @notice Deploy DepositorVault
     * @param owner The owner of the contract
     * @param feeToken The fee token address
     * @return vault The deployed DepositorVault
     */
    function _deployVault(address owner, address feeToken) internal returns (DepositorVault vault) {
        vault = new DepositorVault();
        vm.prank(owner);
        // Initialize with temporary addresses
        vault.initialize(owner, feeToken, address(0), address(0));
    }

    /**
     * @notice Deploy ProtocolTreasury
     * @param owner The owner of the contract
     * @param feeToken The fee token address
     * @return treasury The deployed ProtocolTreasury
     */
    function _deployProtocolTreasury(address owner, address feeToken) internal returns (ProtocolTreasury treasury) {
        treasury = new ProtocolTreasury();
        vm.prank(owner);
        // Initialize with temporary addresses
        treasury.initialize(owner, feeToken, address(0), address(0), address(0));
    }

    /**
     * @notice Deploy GachaEconomyManager
     * @param owner The owner of the contract
     * @param feeToken The fee token address
     * @return manager The deployed GachaEconomyManager
     */
    function _deployEconomyManager(address owner, address feeToken)
        internal
        returns (GachaEconomyManager manager)
    {
        manager = new GachaEconomyManager();
        vm.prank(owner);
        // Initialize with temporary addresses
        manager.initialize(owner, feeToken, TestConstants.GACHA_CONTRACT, address(0), address(0));
    }

    // ========================================================================
    // MOCK DEPLOYMENT
    // ========================================================================

    /**
     * @notice Deploy MockNFTAppraisal
     * @return mockAppraisal The deployed mock
     */
    function _deployMockAppraisal() internal returns (MockNFTAppraisal mockAppraisal) {
        return new MockNFTAppraisal();
    }

    /**
     * @notice Deploy mock fee token
     * @param owner The owner of the token
     * @return feeToken The deployed fee token
     */
    function _deployMockFeeToken(address owner) internal returns (BaseERC20 feeToken) {
        return new BaseERC20("Fee Token", "FEE", owner);
    }

    // ========================================================================
    // BATCH DEPLOYMENT
    // ========================================================================

    /**
     * @notice Deploy complete test suite (treasury + economy stack)
     * @param owner The owner of all contracts
     * @return treasury The deployed GachaTreasury
     * @return vault The deployed DepositorVault
     * @return protocolTreasury The deployed ProtocolTreasury
     * @return manager The deployed GachaEconomyManager
     * @return feeToken The deployed fee token
     * @return mockAppraisal The deployed mock appraisal
     */
    function _deployCompleteTestSuite(address owner)
        internal
        returns (
            GachaTreasury treasury,
            DepositorVault vault,
            ProtocolTreasury protocolTreasury,
            GachaEconomyManager manager,
            BaseERC20 feeToken,
            MockNFTAppraisal mockAppraisal
        )
    {
        // Deploy economy stack
        (vault, protocolTreasury, manager, feeToken) = _deployDefaultEconomyStack();

        // Deploy treasury
        (treasury, mockAppraisal) = _deployDefaultTreasury();

        // Wire up treasury with economy contracts
        vm.startPrank(owner);
        treasury.setProtocolTreasury(address(protocolTreasury));
        vm.stopPrank();
    }
}
