// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Test} from "forge-std/Test.sol";
import {CardGroupedVault} from "../../../src/economy/CardGroupedVault.sol";
import {ICardGroupedVault} from "../../../src/interfaces/ICardGroupedVault.sol";
import {BaseERC20} from "../../../src/tokens/BaseERC20.sol";

/**
 * @title CardGroupedVaultExtended Test Suite
 * @notice Extended test coverage for CardGroupedVault edge cases and events
 */
contract CardGroupedVaultExtendedTest is Test {
    CardGroupedVault vault;
    BaseERC20 usdc;

    address owner = address(0x1);
    address treasury = address(0x2);
    address economyManager = address(0x3);
    address alice = address(0xA11CE);
    address bob = address(0xB0B);

    bytes32 constant CARD_A = keccak256("card-A");
    bytes32 constant CARD_B = keccak256("card-B");

    uint256 constant PRECISION = 1e18;

    uint8 constant COMMON = 0;
    uint8 constant UNCOMMON = 1;
    uint8 constant RARE = 2;
    uint8 constant EPIC = 3;
    uint8 constant LEGENDARY = 4;

    // ─── Events (mirrored from ICardGroupedVault) ──────────────────────

    event YieldDistributed(address indexed caller, uint256 amount, uint8 rarity);
    event YieldClaimed(address indexed account, uint256 amount);
    event CardRarityMigrated(bytes32 indexed cardId, uint8 oldRarity, uint8 newRarity, uint256 newPriceUSD);
    event CardPriceUpdated(bytes32 indexed cardId, uint256 oldPriceUSD, uint256 newPriceUSD);
    event CardDepositRegistered(
        bytes32 indexed cardId, address indexed depositor, uint256 priceUSD, uint8 rarity, uint256 count
    );
    event CardDepositRemoved(bytes32 indexed cardId, address indexed depositor, uint256 count);

    function setUp() public {
        usdc = new BaseERC20("USDC", "USDC", address(this));
        vault = new CardGroupedVault();
        vault.initialize(owner, address(usdc), treasury, economyManager, uint8(5));

        // Fund economy manager
        usdc.mint(economyManager, 1_000_000e6);
        vm.prank(economyManager);
        usdc.approve(address(vault), type(uint256).max);
    }

    // ========================================================================
    // 1. distributeYield() with zero amount
    // ========================================================================

    function testDistributeYield_zeroAmount_reverts() public {
        // First register a deposit so pool isn't empty
        vm.prank(treasury);
        vault.registerCardDeposit(CARD_A, alice, 100e18, COMMON, 1);

        vm.prank(economyManager);
        vm.expectRevert(CardGroupedVault.ZeroAmount.selector);
        vault.distributeYield(0, COMMON);
    }

    // ========================================================================
    // 2. updateCardPrice() with zero price and by unauthorized caller
    // ========================================================================

    function testUpdateCardPrice_zeroPrice_reverts() public {
        vm.prank(treasury);
        vault.registerCardDeposit(CARD_A, alice, 100e18, COMMON, 1);

        vm.prank(treasury);
        vm.expectRevert(CardGroupedVault.ZeroPrice.selector);
        vault.updateCardPrice(CARD_A, 0);
    }

    function testUpdateCardPrice_unauthorizedCaller_reverts() public {
        vm.prank(treasury);
        vault.registerCardDeposit(CARD_A, alice, 100e18, COMMON, 1);

        vm.prank(alice);
        vm.expectRevert(CardGroupedVault.CallerNotTreasury.selector);
        vault.updateCardPrice(CARD_A, 200e18);
    }

    function testUpdateCardPrice_notRegistered_reverts() public {
        // Card not registered at all
        vm.prank(treasury);
        vm.expectRevert(CardGroupedVault.CardNotRegistered.selector);
        vault.updateCardPrice(CARD_A, 100e18);
    }

    // ========================================================================
    // 3. migrateCardRarity() when newRarity == oldRarity
    // ========================================================================

    function testMigrateCardRarity_sameRarity_succeeds() public {
        uint256 price = 100e18;
        vm.prank(treasury);
        vault.registerCardDeposit(CARD_A, alice, price, COMMON, 2);

        // Distribute some yield before migration
        vm.prank(economyManager);
        vault.distributeYield(100e6, COMMON);

        uint256 pendingBefore = vault.pendingYield(alice);
        assertGt(pendingBefore, 0, "Should have pending yield");

        // Migrate to same rarity (no-op in terms of pool, but still processes)
        vm.prank(treasury);
        vault.migrateCardRarity(CARD_A, COMMON, 200e18);

        // Pool change: value should be updated
        (uint256 accYield, uint256 totalValue) = vault.rarityPools(COMMON);
        assertEq(totalValue, 2 * 200e18, "Total value should use new price");
        (accYield); // silence unused
    }

    function testMigrateCardRarity_differentRarity_movesYield() public {
        uint256 price = 100e18;
        vm.prank(treasury);
        vault.registerCardDeposit(CARD_A, alice, price, COMMON, 1);

        vm.prank(economyManager);
        vault.distributeYield(50e6, COMMON);

        uint256 pendingBefore = vault.pendingYield(alice);
        assertApproxEqAbs(pendingBefore, 50e6, 1);

        // Migrate to RARE
        vm.prank(treasury);
        vault.migrateCardRarity(CARD_A, RARE, 200e18);

        // Pending yield should still be accessible
        uint256 pendingAfter = vault.pendingYield(alice);
        assertApproxEqAbs(pendingAfter, 50e6, 1, "Settled yield should persist after migration");

        // New yield in RARE pool goes to alice
        // Fund more usdc for RARE distribution
        usdc.mint(economyManager, 100e6);
        vm.prank(economyManager);
        usdc.approve(address(vault), type(uint256).max);
        vm.prank(economyManager);
        vault.distributeYield(30e6, RARE);

        assertApproxEqAbs(vault.pendingYield(alice), 80e6, 2, "Should have both settled and new yield");
    }

    function testMigrateCardRarity_zeroPrice_reverts() public {
        vm.prank(treasury);
        vault.registerCardDeposit(CARD_A, alice, 100e18, COMMON, 1);

        vm.prank(treasury);
        vm.expectRevert(CardGroupedVault.ZeroPrice.selector);
        vault.migrateCardRarity(CARD_A, RARE, 0);
    }

    function testMigrateCardRarity_invalidRarity_reverts() public {
        vm.prank(treasury);
        vault.registerCardDeposit(CARD_A, alice, 100e18, COMMON, 1);

        vm.prank(treasury);
        vm.expectRevert(CardGroupedVault.InvalidRarity.selector);
        vault.migrateCardRarity(CARD_A, 10, 100e18); // rarity 10 >= numRarities (5)
    }

    // ========================================================================
    // 4. sharesOf() for address with no deposits
    // ========================================================================

    function testSharesOf_noDeposits_returnsZero() public view {
        assertEq(vault.sharesOf(alice), 0, "No deposits means zero shares");
        assertEq(vault.sharesOf(address(0)), 0, "Zero address has zero shares");
    }

    function testSharesOf_afterDeposit() public {
        uint256 price = 100e18;
        vm.prank(treasury);
        vault.registerCardDeposit(CARD_A, alice, price, COMMON, 3);

        assertEq(vault.sharesOf(alice), 3 * price, "Shares should be count * price");
    }

    function testSharesOf_afterFullWithdrawal() public {
        uint256 price = 100e18;
        vm.prank(treasury);
        vault.registerCardDeposit(CARD_A, alice, price, COMMON, 2);

        vm.prank(treasury);
        vault.removeCardDeposit(CARD_A, alice, 2);

        assertEq(vault.sharesOf(alice), 0, "Should be zero after full withdrawal");
    }

    // ========================================================================
    // 5. totalShares() when all depositors withdrawn
    // ========================================================================

    function testTotalShares_allWithdrawn_returnsZero() public {
        uint256 price = 100e18;

        vm.prank(treasury);
        vault.registerCardDeposit(CARD_A, alice, price, COMMON, 2);
        vm.prank(treasury);
        vault.registerCardDeposit(CARD_A, bob, price, COMMON, 3);

        assertEq(vault.totalShares(), 5 * price, "Should have 5 shares");

        vm.prank(treasury);
        vault.removeCardDeposit(CARD_A, alice, 2);
        vm.prank(treasury);
        vault.removeCardDeposit(CARD_A, bob, 3);

        assertEq(vault.totalShares(), 0, "Should be zero after all withdrawals");
    }

    function testTotalShares_crossRarityDeposits() public {
        vm.startPrank(treasury);
        vault.registerCardDeposit(CARD_A, alice, 10e18, COMMON, 1);
        vault.registerCardDeposit(CARD_B, bob, 500e18, EPIC, 2);
        vm.stopPrank();

        assertEq(vault.totalShares(), 10e18 + 2 * 500e18, "Total across rarities");
    }

    // ========================================================================
    // 6. Event emissions
    // ========================================================================

    function testEvent_YieldDistributed() public {
        vm.prank(treasury);
        vault.registerCardDeposit(CARD_A, alice, 100e18, COMMON, 1);

        vm.expectEmit(true, false, false, true);
        emit YieldDistributed(economyManager, 50e6, COMMON);

        vm.prank(economyManager);
        vault.distributeYield(50e6, COMMON);
    }

    function testEvent_YieldClaimed() public {
        vm.prank(treasury);
        vault.registerCardDeposit(CARD_A, alice, 100e18, COMMON, 1);

        vm.prank(economyManager);
        vault.distributeYield(100e6, COMMON);

        vm.expectEmit(true, false, false, false);
        emit YieldClaimed(alice, 0); // amount checked loosely

        vm.prank(alice);
        vault.claimYield(alice);
    }

    function testEvent_CardRarityMigrated() public {
        vm.prank(treasury);
        vault.registerCardDeposit(CARD_A, alice, 100e18, COMMON, 1);

        vm.expectEmit(true, false, false, true);
        emit CardRarityMigrated(CARD_A, COMMON, RARE, 200e18);

        vm.prank(treasury);
        vault.migrateCardRarity(CARD_A, RARE, 200e18);
    }

    function testEvent_CardPriceUpdated() public {
        vm.prank(treasury);
        vault.registerCardDeposit(CARD_A, alice, 100e18, COMMON, 1);

        vm.expectEmit(true, false, false, true);
        emit CardPriceUpdated(CARD_A, 100e18, 150e18);

        vm.prank(treasury);
        vault.updateCardPrice(CARD_A, 150e18);
    }

    function testEvent_CardDepositRegistered() public {
        vm.expectEmit(true, true, false, true);
        emit CardDepositRegistered(CARD_A, alice, 100e18, COMMON, 1);

        vm.prank(treasury);
        vault.registerCardDeposit(CARD_A, alice, 100e18, COMMON, 1);
    }

    function testEvent_CardDepositRemoved() public {
        vm.prank(treasury);
        vault.registerCardDeposit(CARD_A, alice, 100e18, COMMON, 2);

        vm.expectEmit(true, true, false, true);
        emit CardDepositRemoved(CARD_A, alice, 1);

        vm.prank(treasury);
        vault.removeCardDeposit(CARD_A, alice, 1);
    }

    // ========================================================================
    // Additional edge cases
    // ========================================================================

    function testUpdateCardPrice_samePrice_noop() public {
        vm.prank(treasury);
        vault.registerCardDeposit(CARD_A, alice, 100e18, COMMON, 1);

        // Update to same price should not emit event (noop)
        vm.prank(treasury);
        vault.updateCardPrice(CARD_A, 100e18); // no-op, should not revert

        (, uint256 totalValue) = vault.rarityPools(COMMON);
        assertEq(totalValue, 100e18, "Value unchanged");
    }

    function testDistributeYield_onlyEconomyManager_reverts() public {
        vm.prank(treasury);
        vault.registerCardDeposit(CARD_A, alice, 100e18, COMMON, 1);

        vm.prank(alice);
        vm.expectRevert(CardGroupedVault.CallerNotManager.selector);
        vault.distributeYield(100e6, COMMON);
    }

    function testMigrateCardRarity_notRegistered_reverts() public {
        vm.prank(treasury);
        vm.expectRevert(CardGroupedVault.CardNotRegistered.selector);
        vault.migrateCardRarity(CARD_A, RARE, 200e18);
    }

    function testSharesOf_multipleCards() public {
        vm.startPrank(treasury);
        vault.registerCardDeposit(CARD_A, alice, 100e18, COMMON, 2);
        vault.registerCardDeposit(CARD_B, alice, 300e18, RARE, 1);
        vm.stopPrank();

        // sharesOf = 2 * 100e18 + 1 * 300e18 = 500e18
        assertEq(vault.sharesOf(alice), 500e18, "Should sum across all cards");
    }

    function testPendingYield_noDeposits_returnsZero() public view {
        assertEq(vault.pendingYield(alice), 0, "No deposits, no yield");
    }

    function testClaimYield_zeroAddress_reverts() public {
        vm.expectRevert(CardGroupedVault.ZeroAddress.selector);
        vault.claimYield(address(0));
    }
}
