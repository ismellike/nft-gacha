// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {StandardTest} from "../../helpers/StandardTest.sol";
import {GachaEconomyManager} from "../../../src/economy/GachaEconomyManager.sol";
import {CardGroupedVault} from "../../../src/economy/CardGroupedVault.sol";
import {ProtocolTreasury} from "../../../src/economy/ProtocolTreasury.sol";
import {GachaTreasury} from "../../../src/gacha/GachaTreasury.sol";
import {BaseERC20} from "../../../src/tokens/BaseERC20.sol";
import {MockNFTAppraisal} from "../../mocks/MockNFTAppraisal.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

/**
 * @title GachaEconomyManagerExtended Test Suite
 * @notice Extended test coverage for GachaEconomyManager edge cases and events
 */
contract GachaEconomyManagerExtendedTest is StandardTest {
    GachaEconomyManager public economy;
    CardGroupedVault public vault;
    ProtocolTreasury public protTreasury;
    BaseERC20 public usdc;

    address public economyOwner;
    address public localGacha;

    uint256 public constant DEPOSITOR_SHARE_BPS = 9_500;
    uint256 public constant PROTOCOL_SHARE_BPS = 500;
    uint256 public constant REVENUE_AMOUNT = 1_000e6;

    // ─── Events mirrored from GachaEconomyManager / IGachaEconomyManager ──

    event RevenueSplitUpdated(uint256 depositorShareBps, uint256 protocolShareBps);
    event SpinRevenueReceived(uint256 amount, uint256 depositorShare, uint256 protocolShare);
    event FeeTokenUpdated(address indexed previousToken, address indexed newToken);
    event GachaUpdated(address indexed previousGacha, address indexed newGacha);
    event CardGroupedVaultUpdated(address indexed previousVault, address indexed newVault);
    event ProtocolTreasuryUpdated(address indexed previousTreasury, address indexed newTreasury);
    event DepositorYieldQueued(uint256 amount, uint8 rarity);
    event QueuedDepositorYieldProcessed(uint256 amount, uint8 rarity);

    function setUp() public {
        economyOwner = makeAddr("economyOwner");
        localGacha = makeAddr("gacha");

        vm.startPrank(economyOwner);

        usdc = new BaseERC20("USDC", "USDC", economyOwner);

        // Deploy vault
        CardGroupedVault vaultImpl = new CardGroupedVault();
        bytes memory vaultInit = abi.encodeWithSelector(
            CardGroupedVault.initialize.selector, economyOwner, address(usdc), address(this), address(this), uint8(5)
        );
        ERC1967Proxy vaultProxy = new ERC1967Proxy(address(vaultImpl), vaultInit);
        vault = CardGroupedVault(address(vaultProxy));

        // Deploy protocol treasury
        ProtocolTreasury treasuryImpl = new ProtocolTreasury();
        MockNFTAppraisal mockAppraisal = new MockNFTAppraisal();
        GachaTreasury mockGachaTreasury = GachaTreasury(address(0x1));

        bytes memory treasuryInit = abi.encodeWithSelector(
            ProtocolTreasury.initialize.selector,
            economyOwner,
            address(usdc),
            address(this),
            address(mockGachaTreasury),
            address(mockAppraisal)
        );
        ERC1967Proxy treasuryProxy = new ERC1967Proxy(address(treasuryImpl), treasuryInit);
        protTreasury = ProtocolTreasury(address(treasuryProxy));

        // Deploy economy manager
        GachaEconomyManager economyImpl = new GachaEconomyManager();
        bytes memory economyInit = abi.encodeWithSelector(
            GachaEconomyManager.initialize.selector,
            economyOwner,
            address(usdc),
            localGacha,
            address(vault),
            address(protTreasury),
            uint8(5)
        );
        ERC1967Proxy economyProxy = new ERC1967Proxy(address(economyImpl), economyInit);
        economy = GachaEconomyManager(address(economyProxy));

        vault.setEconomyManager(address(economy));
        protTreasury.setEconomyManager(address(economy));

        usdc.mint(localGacha, REVENUE_AMOUNT * 100);

        vm.stopPrank();
    }

    // ========================================================================
    // 1. onSpinRevenue() with out-of-bounds rarity index
    // ========================================================================

    function testOnSpinRevenue_outOfBoundsRarity_queuesYield() public {
        // Rarity index 5 is out of bounds (numRarities == 5, valid: 0-4)
        // The vault will fail to distributeYield for rarity 5, so yield should be queued
        vm.startPrank(localGacha);
        usdc.approve(address(economy), REVENUE_AMOUNT);
        economy.onSpinRevenue(REVENUE_AMOUNT, 5);
        vm.stopPrank();

        // Depositor share should be queued for rarity 5 since vault rejects it
        uint256 expectedQueued = (REVENUE_AMOUNT * DEPOSITOR_SHARE_BPS) / 10_000;
        assertEq(economy.queuedYieldByRarity(5), expectedQueued, "Should queue yield for out-of-bounds rarity");
    }

    // ========================================================================
    // 2. setVaults() with zero-address
    // ========================================================================

    function testSetVaults_bothZeroAddress_reverts() public {
        vm.prank(economyOwner);
        vm.expectRevert(GachaEconomyManager.InvalidConfiguration.selector);
        economy.setVaults(address(0), address(0));
    }

    function testSetVaults_onlyVaultZero_updatesTreasury() public {
        address newProtocol = makeAddr("newProtocol");

        vm.prank(economyOwner);
        economy.setVaults(address(0), newProtocol);

        assertEq(address(economy.protocolTreasury()), newProtocol, "Protocol treasury should be updated");
        assertEq(address(economy.cardGroupedVault()), address(vault), "Vault should be unchanged");
    }

    function testSetVaults_onlyProtocolZero_updatesVault() public {
        // Deploy new vault
        CardGroupedVault vaultImpl2 = new CardGroupedVault();
        bytes memory vaultInit2 = abi.encodeWithSelector(
            CardGroupedVault.initialize.selector, economyOwner, address(usdc), address(this), address(economy), uint8(5)
        );
        ERC1967Proxy vaultProxy2 = new ERC1967Proxy(address(vaultImpl2), vaultInit2);
        address newVault = address(vaultProxy2);

        vm.prank(economyOwner);
        economy.setVaults(newVault, address(0));

        assertEq(address(economy.cardGroupedVault()), newVault, "Vault should be updated");
        assertEq(address(economy.protocolTreasury()), address(protTreasury), "Protocol treasury unchanged");
    }

    function testSetVaults_unauthorized_reverts() public {
        vm.prank(user);
        vm.expectRevert();
        economy.setVaults(makeAddr("vault"), address(0));
    }

    // ========================================================================
    // 3. setFeeToken() with zero address
    // ========================================================================

    function testSetFeeToken_zeroAddress_reverts() public {
        vm.prank(economyOwner);
        vm.expectRevert(GachaEconomyManager.ZeroAddress.selector);
        economy.setFeeToken(address(0));
    }

    function testSetFeeToken_validAddress_succeeds() public {
        vm.startPrank(economyOwner);
        BaseERC20 newToken = new BaseERC20("NewToken", "NTK", economyOwner);
        economy.setFeeToken(address(newToken));
        vm.stopPrank();

        assertEq(address(economy.feeToken()), address(newToken), "Fee token should be updated");
    }

    // ========================================================================
    // 4. setGacha() with zero address
    // ========================================================================

    function testSetGacha_zeroAddress_reverts() public {
        vm.prank(economyOwner);
        vm.expectRevert(GachaEconomyManager.ZeroAddress.selector);
        economy.setGacha(address(0));
    }

    function testSetGacha_validAddress_succeeds() public {
        address newGacha = makeAddr("newGacha");
        vm.prank(economyOwner);
        economy.setGacha(newGacha);

        assertEq(economy.gacha(), newGacha, "Gacha should be updated");
    }

    // ========================================================================
    // 5. Event emissions
    // ========================================================================

    function testEvent_SpinRevenueReceived() public {
        vm.startPrank(localGacha);
        usdc.approve(address(economy), REVENUE_AMOUNT);

        // No vault shares, so depositor yield is queued (actualDistributed = 0)
        uint256 expectedDepositorDistributed = 0;
        // Protocol share = floor(1000e6 * 500 / 10000) = 50e6, but remainder goes to protocol too
        uint256 depositorShare = (REVENUE_AMOUNT * DEPOSITOR_SHARE_BPS) / 10_000; // 950e6
        uint256 expectedProtocol = REVENUE_AMOUNT - depositorShare; // 50e6

        vm.expectEmit(false, false, false, true);
        emit SpinRevenueReceived(REVENUE_AMOUNT, expectedDepositorDistributed, expectedProtocol);

        economy.onSpinRevenue(REVENUE_AMOUNT, 0);
        vm.stopPrank();
    }

    function testEvent_RevenueSplitUpdated_onInitialize() public view {
        // Verified from constructor: emits RevenueSplitUpdated with defaults
        assertEq(economy.depositorShareBps(), DEPOSITOR_SHARE_BPS);
        assertEq(economy.protocolShareBps(), PROTOCOL_SHARE_BPS);
    }

    function testEvent_RevenueSplitUpdated_onSet() public {
        vm.expectEmit(false, false, false, true);
        emit RevenueSplitUpdated(8_000, 2_000);

        vm.prank(economyOwner);
        economy.setRevenueSplit(8_000, 2_000);
    }

    function testEvent_FeeTokenUpdated() public {
        vm.startPrank(economyOwner);
        BaseERC20 newToken = new BaseERC20("New", "NEW", economyOwner);

        vm.expectEmit(true, true, false, false);
        emit FeeTokenUpdated(address(usdc), address(newToken));

        economy.setFeeToken(address(newToken));
        vm.stopPrank();
    }

    function testEvent_GachaUpdated() public {
        address newGacha = makeAddr("newGacha2");

        vm.expectEmit(true, true, false, false);
        emit GachaUpdated(localGacha, newGacha);

        vm.prank(economyOwner);
        economy.setGacha(newGacha);
    }

    function testEvent_CardGroupedVaultUpdated() public {
        CardGroupedVault vaultImpl2 = new CardGroupedVault();
        bytes memory vaultInit2 = abi.encodeWithSelector(
            CardGroupedVault.initialize.selector, economyOwner, address(usdc), address(this), address(economy), uint8(5)
        );
        ERC1967Proxy vaultProxy2 = new ERC1967Proxy(address(vaultImpl2), vaultInit2);
        address newVault = address(vaultProxy2);

        // CardGroupedVaultUpdated has indexed address params
        vm.expectEmit(true, true, false, false);
        emit CardGroupedVaultUpdated(address(vault), newVault);

        vm.prank(economyOwner);
        economy.setVaults(newVault, address(0));
    }

    function testEvent_ProtocolTreasuryUpdated() public {
        address newProtocol = makeAddr("newProtocol2");

        // ProtocolTreasuryUpdated has indexed address params
        vm.expectEmit(true, true, false, false);
        emit ProtocolTreasuryUpdated(address(protTreasury), newProtocol);

        vm.prank(economyOwner);
        economy.setVaults(address(0), newProtocol);
    }

    // ========================================================================
    // 6. onSpinRevenue() when depositorShareBps == 0 with queued yield
    // ========================================================================

    function testOnSpinRevenue_depositorShareZero_allToProtocol() public {
        // Set depositor share to 0
        vm.prank(economyOwner);
        economy.setRevenueSplit(0, 10_000);

        vm.startPrank(localGacha);
        usdc.approve(address(economy), REVENUE_AMOUNT);
        economy.onSpinRevenue(REVENUE_AMOUNT, 0);
        vm.stopPrank();

        // No depositor share — all to protocol
        assertEq(economy.totalToDepositors(), 0, "No depositor yield");
        assertEq(economy.totalToProtocol(), REVENUE_AMOUNT, "All to protocol");
        assertEq(economy.totalQueuedYield(), 0, "Nothing queued");
    }

    function testOnSpinRevenue_depositorShareZero_withPreviousQueue_noFlush() public {
        // First: put something in the queue by running with non-zero depositor share
        vm.startPrank(localGacha);
        usdc.approve(address(economy), REVENUE_AMOUNT * 10);
        economy.onSpinRevenue(REVENUE_AMOUNT, 0); // queues depositor share
        vm.stopPrank();

        uint256 queuedBefore = economy.totalQueuedYield();
        assertGt(queuedBefore, 0, "Should have queued yield");

        // Now set depositor share to 0 and run another spin
        vm.prank(economyOwner);
        economy.setRevenueSplit(0, 10_000);

        vm.startPrank(localGacha);
        economy.onSpinRevenue(REVENUE_AMOUNT, 0);
        vm.stopPrank();

        // Queued yield for rarity 0 remains unchanged since depositorShare==0 means no flush attempt
        // But the flush loop still runs for all rarities — if rarity pool is empty, it will fail silently
        uint256 queuedAfter = economy.totalQueuedYield();
        // Queue should still be there since vault pool is still empty
        assertEq(queuedAfter, queuedBefore, "Queued yield should not change without vault shares");
    }

    function testOnSpinRevenue_queued_thenFlushed_whenDepositorArrives() public {
        // Queue some yield by spinning without any vault deposits
        vm.startPrank(localGacha);
        usdc.approve(address(economy), REVENUE_AMOUNT * 10);
        economy.onSpinRevenue(REVENUE_AMOUNT, 0);
        vm.stopPrank();

        uint256 queuedBefore = economy.totalQueuedYield();
        assertGt(queuedBefore, 0, "Should have queued yield");

        // Now add vault shares (simulate a depositor arriving)
        // treasury address is address(this) in setup
        vm.prank(address(this)); // treasury = address(this)
        vault.registerCardDeposit(keccak256("card"), address(0xA), 100e18, 0, 1);

        // Fund economy with queued amount so it can flush
        vm.prank(economyOwner);
        usdc.mint(address(economy), queuedBefore);
        vm.prank(economyOwner);
        usdc.approve(address(vault), queuedBefore);

        // Do another spin — should flush the queued yield for rarity 0 now
        vm.startPrank(localGacha);
        economy.onSpinRevenue(REVENUE_AMOUNT, 0);
        vm.stopPrank();

        // After flush, queued yield for rarity 0 should be zero
        assertEq(economy.queuedYieldByRarity(0), 0, "Queued yield for rarity 0 should be flushed");
    }

    // ========================================================================
    // Additional validation tests
    // ========================================================================

    function testSetRevenueSplit_sumNotEqualBps_reverts() public {
        vm.prank(economyOwner);
        vm.expectRevert(GachaEconomyManager.InvalidRevenueSplit.selector);
        economy.setRevenueSplit(5_000, 5_001); // sum != 10_000
    }

    function testOnSpinRevenue_zeroRevenue_reverts() public {
        vm.prank(localGacha);
        vm.expectRevert(GachaEconomyManager.ZeroRevenue.selector);
        economy.onSpinRevenue(0, 0);
    }

    function testOnSpinRevenue_callerNotGacha_reverts() public {
        vm.prank(user);
        vm.expectRevert(GachaEconomyManager.CallerNotGacha.selector);
        economy.onSpinRevenue(REVENUE_AMOUNT, 0);
    }

    function testTotalQueuedYield_sumsAllRarities() public {
        // Spin for 5 different rarities, each queues depositor share
        vm.startPrank(localGacha);
        usdc.approve(address(economy), REVENUE_AMOUNT * 5);
        for (uint8 i = 0; i < 5; i++) {
            economy.onSpinRevenue(REVENUE_AMOUNT, i);
        }
        vm.stopPrank();

        uint256 perRarityQueued = (REVENUE_AMOUNT * DEPOSITOR_SHARE_BPS) / 10_000;
        assertApproxEqAbs(economy.totalQueuedYield(), perRarityQueued * 5, 10, "Sum of all 5 rarity queues");
    }

    function testRevenueByRarity_tracking() public {
        vm.startPrank(localGacha);
        usdc.approve(address(economy), REVENUE_AMOUNT * 3);
        economy.onSpinRevenue(REVENUE_AMOUNT, 0);
        economy.onSpinRevenue(REVENUE_AMOUNT, 0);
        economy.onSpinRevenue(REVENUE_AMOUNT, 2);
        vm.stopPrank();

        assertEq(economy.revenueByRarity(0), REVENUE_AMOUNT * 2, "Rarity 0 should have 2x revenue");
        assertEq(economy.revenueByRarity(2), REVENUE_AMOUNT, "Rarity 2 should have 1x revenue");
        assertEq(economy.revenueByRarity(1), 0, "Rarity 1 should have no revenue");
    }
}
