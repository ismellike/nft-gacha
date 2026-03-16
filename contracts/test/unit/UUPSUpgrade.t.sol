// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Test} from "forge-std/Test.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {ERC1967Utils} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Utils.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {Gacha} from "../../src/gacha/Gacha.sol";
import {GachaTreasury} from "../../src/gacha/GachaTreasury.sol";
import {NFTAppraisal} from "../../src/appraisal/NFTAppraisal.sol";
import {ProtocolTreasury} from "../../src/economy/ProtocolTreasury.sol";
import {CardGroupedVault} from "../../src/economy/CardGroupedVault.sol";
import {GachaEconomyManager} from "../../src/economy/GachaEconomyManager.sol";
import {BaseERC20} from "../../src/tokens/BaseERC20.sol";
import {MockNFTAppraisal} from "../mocks/MockNFTAppraisal.sol";
import {TestConstants} from "../helpers/TestConstants.sol";

// ─── V2 Contracts ────────────────────────────────────────────────────────────
// Each V2 adds a version() function and a new state variable to verify
// that upgrade preserves existing state and new storage is accessible.

contract GachaV2 is Gacha {
    uint256 public newGachaVar;

    function version() external pure returns (uint256) {
        return 2;
    }

    function setNewGachaVar(uint256 val) external onlyOwner {
        newGachaVar = val;
    }
}

contract GachaTreasuryV2 is GachaTreasury {
    uint256 public newTreasuryVar;

    function version() external pure returns (uint256) {
        return 2;
    }

    function setNewTreasuryVar(uint256 val) external onlyOwner {
        newTreasuryVar = val;
    }
}

contract NFTAppraisalV2 is NFTAppraisal {
    uint256 public newAppraisalVar;

    function version() external pure returns (uint256) {
        return 2;
    }

    function setNewAppraisalVar(uint256 val) external onlyOwner {
        newAppraisalVar = val;
    }
}

contract ProtocolTreasuryV2 is ProtocolTreasury {
    uint256 public newProtocolVar;

    function version() external pure returns (uint256) {
        return 2;
    }

    function setNewProtocolVar(uint256 val) external onlyOwner {
        newProtocolVar = val;
    }
}

contract CardGroupedVaultV2 is CardGroupedVault {
    uint256 public newVaultVar;

    function version() external pure returns (uint256) {
        return 2;
    }

    function setNewVaultVar(uint256 val) external onlyOwner {
        newVaultVar = val;
    }
}

contract GachaEconomyManagerV2 is GachaEconomyManager {
    uint256 public newManagerVar;

    function version() external pure returns (uint256) {
        return 2;
    }

    function setNewManagerVar(uint256 val) external onlyOwner {
        newManagerVar = val;
    }
}

/**
 * @title UUPS Upgrade Tests
 * @notice Verifies all 6 UUPS-upgradeable contracts can be upgraded safely:
 *   state is preserved, new functionality works, access control enforced.
 */
contract UUPSUpgradeTest is Test {
    address constant OWNER = address(0x1);
    address constant ATTACKER = address(0xBAD);
    address constant STUB_HANDLER = address(0x10);
    address constant STUB_ECONOMY = address(0x11);
    address constant STUB_GACHA = address(0x12);
    address constant STUB_PROTOCOL_ADDR = address(0x13);
    address constant STUB_TREASURY_ADDR = address(0x14);
    address constant STUB_VAULT_ADDR = address(0x15);
    address constant STUB_APPRAISAL_ADDR = address(0x16);

    BaseERC20 feeToken;

    function setUp() public {
        feeToken = new BaseERC20("Test USDC", "tUSDC", OWNER);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // NFTAppraisal
    // ═══════════════════════════════════════════════════════════════════════

    function _deployAppraisalProxy() internal returns (NFTAppraisal) {
        NFTAppraisal impl = new NFTAppraisal();
        bytes memory initData = abi.encodeWithSelector(
            NFTAppraisal.initialize.selector, OWNER, address(feeToken), 10e18, STUB_PROTOCOL_ADDR
        );
        ERC1967Proxy proxy = new ERC1967Proxy(address(impl), initData);
        return NFTAppraisal(address(proxy));
    }

    function testUpgrade_NFTAppraisal_PreservesState() public {
        NFTAppraisal appraisal = _deployAppraisalProxy();

        // Mutate state pre-upgrade
        vm.prank(OWNER);
        appraisal.setAppraisalFee(42e18);
        assertEq(appraisal.appraisalFee(), 42e18);

        // Upgrade
        NFTAppraisalV2 v2Impl = new NFTAppraisalV2();
        vm.prank(OWNER);
        appraisal.upgradeToAndCall(address(v2Impl), "");

        // Verify state preserved
        NFTAppraisalV2 upgraded = NFTAppraisalV2(address(appraisal));
        assertEq(upgraded.appraisalFee(), 42e18, "appraisalFee preserved");
        assertEq(upgraded.owner(), OWNER, "owner preserved");
        assertEq(address(upgraded.feeToken()), address(feeToken), "feeToken preserved");

        // Verify new functionality
        assertEq(upgraded.version(), 2, "version() returns 2");
        vm.prank(OWNER);
        upgraded.setNewAppraisalVar(99);
        assertEq(upgraded.newAppraisalVar(), 99, "new state var works");
    }

    function testUpgrade_NFTAppraisal_NonOwnerReverts() public {
        NFTAppraisal appraisal = _deployAppraisalProxy();
        NFTAppraisalV2 v2Impl = new NFTAppraisalV2();

        vm.prank(ATTACKER);
        vm.expectRevert(abi.encodeWithSelector(OwnableUpgradeable.OwnableUnauthorizedAccount.selector, ATTACKER));
        appraisal.upgradeToAndCall(address(v2Impl), "");
    }

    function testUpgrade_NFTAppraisal_ZeroAddressReverts() public {
        NFTAppraisal appraisal = _deployAppraisalProxy();

        vm.prank(OWNER);
        vm.expectRevert(NFTAppraisal.InvalidImplementation.selector);
        appraisal.upgradeToAndCall(address(0), "");
    }

    function testUpgrade_NFTAppraisal_EOAReverts() public {
        NFTAppraisal appraisal = _deployAppraisalProxy();

        vm.prank(OWNER);
        vm.expectRevert(NFTAppraisal.InvalidImplementation.selector);
        appraisal.upgradeToAndCall(address(0xDEAD), "");
    }

    // ═══════════════════════════════════════════════════════════════════════
    // CardGroupedVault
    // ═══════════════════════════════════════════════════════════════════════

    function _deployVaultProxy() internal returns (CardGroupedVault) {
        CardGroupedVault impl = new CardGroupedVault();
        bytes memory initData = abi.encodeWithSelector(
            CardGroupedVault.initialize.selector,
            OWNER,
            address(feeToken),
            STUB_TREASURY_ADDR,
            STUB_ECONOMY,
            uint8(5)
        );
        ERC1967Proxy proxy = new ERC1967Proxy(address(impl), initData);
        return CardGroupedVault(address(proxy));
    }

    function testUpgrade_CardGroupedVault_PreservesState() public {
        CardGroupedVault vault = _deployVaultProxy();

        // Verify initial state
        assertEq(vault.numRarities(), 5);
        assertEq(vault.owner(), OWNER);

        // Upgrade
        CardGroupedVaultV2 v2Impl = new CardGroupedVaultV2();
        vm.prank(OWNER);
        vault.upgradeToAndCall(address(v2Impl), "");

        CardGroupedVaultV2 upgraded = CardGroupedVaultV2(address(vault));
        assertEq(upgraded.numRarities(), 5, "numRarities preserved");
        assertEq(upgraded.owner(), OWNER, "owner preserved");
        assertEq(address(upgraded.asset()), address(feeToken), "asset preserved");
        assertEq(upgraded.version(), 2);

        vm.prank(OWNER);
        upgraded.setNewVaultVar(777);
        assertEq(upgraded.newVaultVar(), 777);
    }

    function testUpgrade_CardGroupedVault_NonOwnerReverts() public {
        CardGroupedVault vault = _deployVaultProxy();
        CardGroupedVaultV2 v2Impl = new CardGroupedVaultV2();

        vm.prank(ATTACKER);
        vm.expectRevert(abi.encodeWithSelector(OwnableUpgradeable.OwnableUnauthorizedAccount.selector, ATTACKER));
        vault.upgradeToAndCall(address(v2Impl), "");
    }

    // ═══════════════════════════════════════════════════════════════════════
    // GachaEconomyManager
    // ═══════════════════════════════════════════════════════════════════════

    function _deployManagerProxy() internal returns (GachaEconomyManager) {
        GachaEconomyManager impl = new GachaEconomyManager();
        bytes memory initData = abi.encodeWithSelector(
            GachaEconomyManager.initialize.selector,
            OWNER,
            address(feeToken),
            STUB_GACHA,
            STUB_VAULT_ADDR,
            STUB_PROTOCOL_ADDR,
            uint8(5)
        );
        ERC1967Proxy proxy = new ERC1967Proxy(address(impl), initData);
        return GachaEconomyManager(address(proxy));
    }

    function testUpgrade_GachaEconomyManager_PreservesState() public {
        GachaEconomyManager manager = _deployManagerProxy();

        // Mutate state
        vm.prank(OWNER);
        manager.setRevenueSplit(9000, 1000);
        assertEq(manager.depositorShareBps(), 9000);
        assertEq(manager.protocolShareBps(), 1000);

        // Upgrade
        GachaEconomyManagerV2 v2Impl = new GachaEconomyManagerV2();
        vm.prank(OWNER);
        manager.upgradeToAndCall(address(v2Impl), "");

        GachaEconomyManagerV2 upgraded = GachaEconomyManagerV2(address(manager));
        assertEq(upgraded.depositorShareBps(), 9000, "depositorShareBps preserved");
        assertEq(upgraded.protocolShareBps(), 1000, "protocolShareBps preserved");
        assertEq(upgraded.owner(), OWNER, "owner preserved");
        assertEq(upgraded.version(), 2);

        vm.prank(OWNER);
        upgraded.setNewManagerVar(42);
        assertEq(upgraded.newManagerVar(), 42);
    }

    function testUpgrade_GachaEconomyManager_NonOwnerReverts() public {
        GachaEconomyManager manager = _deployManagerProxy();
        GachaEconomyManagerV2 v2Impl = new GachaEconomyManagerV2();

        vm.prank(ATTACKER);
        vm.expectRevert(abi.encodeWithSelector(OwnableUpgradeable.OwnableUnauthorizedAccount.selector, ATTACKER));
        manager.upgradeToAndCall(address(v2Impl), "");
    }

    function testUpgrade_GachaEconomyManager_EOAReverts() public {
        GachaEconomyManager manager = _deployManagerProxy();

        vm.prank(OWNER);
        vm.expectRevert(GachaEconomyManager.InvalidImplementation.selector);
        manager.upgradeToAndCall(address(0xDEAD), "");
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ProtocolTreasury
    // ═══════════════════════════════════════════════════════════════════════

    function _deployProtocolTreasuryProxy() internal returns (ProtocolTreasury) {
        ProtocolTreasury impl = new ProtocolTreasury();
        bytes memory initData = abi.encodeWithSelector(
            ProtocolTreasury.initialize.selector,
            OWNER,
            address(feeToken),
            STUB_ECONOMY,
            STUB_TREASURY_ADDR,
            STUB_APPRAISAL_ADDR
        );
        ERC1967Proxy proxy = new ERC1967Proxy(address(impl), initData);
        return ProtocolTreasury(address(proxy));
    }

    function testUpgrade_ProtocolTreasury_PreservesState() public {
        ProtocolTreasury pt = _deployProtocolTreasuryProxy();

        // Mutate state
        vm.prank(OWNER);
        pt.setRedemptionWindow(2 hours);
        assertEq(pt.redemptionWindow(), 2 hours);

        // Upgrade
        ProtocolTreasuryV2 v2Impl = new ProtocolTreasuryV2();
        vm.prank(OWNER);
        pt.upgradeToAndCall(address(v2Impl), "");

        ProtocolTreasuryV2 upgraded = ProtocolTreasuryV2(address(pt));
        assertEq(upgraded.redemptionWindow(), 2 hours, "redemptionWindow preserved");
        assertEq(upgraded.owner(), OWNER, "owner preserved");
        assertEq(upgraded.version(), 2);

        vm.prank(OWNER);
        upgraded.setNewProtocolVar(123);
        assertEq(upgraded.newProtocolVar(), 123);
    }

    function testUpgrade_ProtocolTreasury_NonOwnerReverts() public {
        ProtocolTreasury pt = _deployProtocolTreasuryProxy();
        ProtocolTreasuryV2 v2Impl = new ProtocolTreasuryV2();

        vm.prank(ATTACKER);
        vm.expectRevert(abi.encodeWithSelector(OwnableUpgradeable.OwnableUnauthorizedAccount.selector, ATTACKER));
        pt.upgradeToAndCall(address(v2Impl), "");
    }

    // ═══════════════════════════════════════════════════════════════════════
    // GachaTreasury
    // ═══════════════════════════════════════════════════════════════════════

    function _deployGachaTreasuryProxy() internal returns (GachaTreasury) {
        GachaTreasury impl = new GachaTreasury();
        MockNFTAppraisal mockAppraisal = new MockNFTAppraisal();

        uint256[] memory minPrices = TestConstants.getMinPrices();
        uint256[] memory maxPrices = TestConstants.getMaxPrices();
        string[] memory rarityNames = TestConstants.getDefaultRarityNames();

        bytes memory initData = abi.encodeWithSelector(
            GachaTreasury.initialize.selector,
            OWNER,
            STUB_GACHA,
            address(mockAppraisal),
            uint8(5),
            rarityNames,
            minPrices,
            maxPrices
        );
        ERC1967Proxy proxy = new ERC1967Proxy(address(impl), initData);
        return GachaTreasury(address(proxy));
    }

    function testUpgrade_GachaTreasury_PreservesState() public {
        GachaTreasury treasury = _deployGachaTreasuryProxy();

        // Verify initial state
        assertEq(treasury.numRarities(), 5);
        assertEq(treasury.owner(), OWNER);

        // Upgrade
        GachaTreasuryV2 v2Impl = new GachaTreasuryV2();
        vm.prank(OWNER);
        treasury.upgradeToAndCall(address(v2Impl), "");

        GachaTreasuryV2 upgraded = GachaTreasuryV2(address(treasury));
        assertEq(upgraded.numRarities(), 5, "numRarities preserved");
        assertEq(upgraded.owner(), OWNER, "owner preserved");
        assertEq(upgraded.version(), 2);

        vm.prank(OWNER);
        upgraded.setNewTreasuryVar(555);
        assertEq(upgraded.newTreasuryVar(), 555);
    }

    function testUpgrade_GachaTreasury_NonOwnerReverts() public {
        GachaTreasury treasury = _deployGachaTreasuryProxy();
        GachaTreasuryV2 v2Impl = new GachaTreasuryV2();

        vm.prank(ATTACKER);
        vm.expectRevert(abi.encodeWithSelector(OwnableUpgradeable.OwnableUnauthorizedAccount.selector, ATTACKER));
        treasury.upgradeToAndCall(address(v2Impl), "");
    }

    function testUpgrade_GachaTreasury_EOAReverts() public {
        GachaTreasury treasury = _deployGachaTreasuryProxy();

        vm.prank(OWNER);
        vm.expectRevert(GachaTreasury.InvalidImplementation.selector);
        treasury.upgradeToAndCall(address(0xDEAD), "");
    }

    // ═══════════════════════════════════════════════════════════════════════
    // Gacha
    // ═══════════════════════════════════════════════════════════════════════

    function _deployGachaProxy() internal returns (Gacha) {
        // Gacha.initialize reads treasury.numRarities() and feeToken.decimals()
        // so we need real contracts for those
        GachaTreasury treasury = _deployGachaTreasuryProxy();

        Gacha impl = new Gacha();
        bytes memory initData = abi.encodeWithSelector(
            Gacha.initialize.selector,
            OWNER,
            STUB_HANDLER,
            address(feeToken),
            1e18, // minSpinFee
            address(treasury),
            STUB_ECONOMY
        );
        ERC1967Proxy proxy = new ERC1967Proxy(address(impl), initData);
        return Gacha(address(proxy));
    }

    function testUpgrade_Gacha_PreservesState() public {
        Gacha gacha = _deployGachaProxy();

        // Mutate state
        vm.prank(OWNER);
        gacha.setSpinTimeout(600);
        assertEq(gacha.spinTimeout(), 600);

        // Upgrade
        GachaV2 v2Impl = new GachaV2();
        vm.prank(OWNER);
        gacha.upgradeToAndCall(address(v2Impl), "");

        GachaV2 upgraded = GachaV2(address(gacha));
        assertEq(upgraded.spinTimeout(), 600, "spinTimeout preserved");
        assertEq(upgraded.owner(), OWNER, "owner preserved");
        assertEq(upgraded.numRarities(), 5, "numRarities preserved");
        assertEq(upgraded.version(), 2);

        vm.prank(OWNER);
        upgraded.setNewGachaVar(1337);
        assertEq(upgraded.newGachaVar(), 1337);
    }

    function testUpgrade_Gacha_NonOwnerReverts() public {
        Gacha gacha = _deployGachaProxy();
        GachaV2 v2Impl = new GachaV2();

        vm.prank(ATTACKER);
        vm.expectRevert(abi.encodeWithSelector(OwnableUpgradeable.OwnableUnauthorizedAccount.selector, ATTACKER));
        gacha.upgradeToAndCall(address(v2Impl), "");
    }

    function testUpgrade_Gacha_EOAReverts() public {
        Gacha gacha = _deployGachaProxy();

        vm.prank(OWNER);
        vm.expectRevert(Gacha.InvalidImplementation.selector);
        gacha.upgradeToAndCall(address(0xDEAD), "");
    }

    // ═══════════════════════════════════════════════════════════════════════
    // Double upgrade: V1 → V2 → V2 (re-upgrade with same impl)
    // ═══════════════════════════════════════════════════════════════════════

    function testDoubleUpgrade_NFTAppraisal() public {
        NFTAppraisal appraisal = _deployAppraisalProxy();

        NFTAppraisalV2 v2a = new NFTAppraisalV2();
        vm.prank(OWNER);
        appraisal.upgradeToAndCall(address(v2a), "");

        NFTAppraisalV2 upgraded = NFTAppraisalV2(address(appraisal));
        vm.prank(OWNER);
        upgraded.setNewAppraisalVar(100);

        // Deploy fresh V2 impl and upgrade again
        NFTAppraisalV2 v2b = new NFTAppraisalV2();
        vm.prank(OWNER);
        upgraded.upgradeToAndCall(address(v2b), "");

        // State from both V1 and V2 must persist
        assertEq(upgraded.appraisalFee(), 10e18, "V1 state preserved after double upgrade");
        assertEq(upgraded.newAppraisalVar(), 100, "V2 state preserved after double upgrade");
    }

    // ═══════════════════════════════════════════════════════════════════════
    // upgradeToAndCall with initialization data
    // ═══════════════════════════════════════════════════════════════════════

    function testUpgradeWithCalldata_CardGroupedVault() public {
        CardGroupedVault vault = _deployVaultProxy();

        CardGroupedVaultV2 v2Impl = new CardGroupedVaultV2();

        // Upgrade and call setNewVaultVar(42) in one transaction
        bytes memory callData = abi.encodeWithSelector(CardGroupedVaultV2.setNewVaultVar.selector, 42);
        vm.prank(OWNER);
        vault.upgradeToAndCall(address(v2Impl), callData);

        CardGroupedVaultV2 upgraded = CardGroupedVaultV2(address(vault));
        assertEq(upgraded.newVaultVar(), 42, "calldata executed during upgrade");
        assertEq(upgraded.version(), 2);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // Cannot reinitialize after upgrade
    // ═══════════════════════════════════════════════════════════════════════

    function testUpgrade_CannotReinitialize() public {
        NFTAppraisal appraisal = _deployAppraisalProxy();
        NFTAppraisalV2 v2Impl = new NFTAppraisalV2();

        vm.prank(OWNER);
        appraisal.upgradeToAndCall(address(v2Impl), "");

        vm.prank(OWNER);
        vm.expectRevert();
        NFTAppraisalV2(address(appraisal)).initialize(OWNER, address(feeToken), 5e18, STUB_PROTOCOL_ADDR);
    }
}
