// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Test} from "forge-std/Test.sol";
import {CardGroupedVault} from "../../../src/economy/CardGroupedVault.sol";
import {ICardGroupedVault} from "../../../src/interfaces/ICardGroupedVault.sol";
import {BaseERC20} from "../../../src/tokens/BaseERC20.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";

contract CardGroupedVaultTest is Test {
    CardGroupedVault vault;
    BaseERC20 usdc;

    address owner = address(0x1);
    address treasury = address(0x2);
    address economyManager = address(0x3);
    address alice = address(0xA);
    address bob = address(0xB);

    bytes32 constant CARD_A = keccak256("card-A");
    bytes32 constant CARD_B = keccak256("card-B");
    bytes32 constant CARD_C = keccak256("card-C");

    uint256 constant PRECISION = 1e18;

    // Rarity constants
    uint8 constant COMMON = 0;
    uint8 constant UNCOMMON = 1;
    uint8 constant RARE = 2;
    uint8 constant EPIC = 3;
    uint8 constant LEGENDARY = 4;

    function setUp() public {
        usdc = new BaseERC20("USDC", "USDC", address(this));
        vault = new CardGroupedVault();
        vault.initialize(owner, address(usdc), treasury, economyManager, uint8(5));

        // Mint and fund economy manager with USDC for yield distributions
        usdc.mint(economyManager, 1_000_000e6);

        // Approve vault to pull from economy manager
        vm.prank(economyManager);
        usdc.approve(address(vault), type(uint256).max);
    }

    // ================================================================
    // Basic deposit / remove / claim flow
    // ================================================================

    function test_registerAndRemoveDeposit() public {
        uint256 price = 100e18; // $100

        vm.prank(treasury);
        vault.registerCardDeposit(CARD_A, alice, price, COMMON, 3);

        assertEq(vault.sharesOf(alice), 3 * price);
        assertEq(vault.totalShares(), 3 * price);

        vm.prank(treasury);
        vault.removeCardDeposit(CARD_A, alice, 1);

        assertEq(vault.sharesOf(alice), 2 * price);
        assertEq(vault.totalShares(), 2 * price);

        vm.prank(treasury);
        vault.removeCardDeposit(CARD_A, alice, 2);

        assertEq(vault.sharesOf(alice), 0);
        assertEq(vault.totalShares(), 0);
    }

    function test_basicYieldDistributionAndClaim() public {
        uint256 price = 100e18;

        // Alice deposits 2 tokens of CARD_A (Common)
        vm.prank(treasury);
        vault.registerCardDeposit(CARD_A, alice, price, COMMON, 2);

        // Distribute 100 USDC to Common pool
        vm.prank(economyManager);
        vault.distributeYield(100e6, COMMON);

        // Alice should have ~100 USDC pending (sole depositor)
        uint256 pending = vault.pendingYield(alice);
        assertApproxEqAbs(pending, 100e6, 1); // Allow 1 wei rounding

        // Claim
        vm.prank(alice);
        uint256 claimed = vault.claimYield(alice);
        assertApproxEqAbs(claimed, 100e6, 1);

        // After claim, pending should be 0
        assertEq(vault.pendingYield(alice), 0);
    }

    // ================================================================
    // Per-rarity yield distribution
    // ================================================================

    function test_yieldGoesToCorrectRarity() public {
        uint256 price = 100e18;

        // Alice in Common, Bob in Rare
        vm.startPrank(treasury);
        vault.registerCardDeposit(CARD_A, alice, price, COMMON, 1);
        vault.registerCardDeposit(CARD_B, bob, price, RARE, 1);
        vm.stopPrank();

        // Distribute 50 USDC to Common
        vm.prank(economyManager);
        vault.distributeYield(50e6, COMMON);

        // Only Alice should get yield
        assertApproxEqAbs(vault.pendingYield(alice), 50e6, 1);
        assertEq(vault.pendingYield(bob), 0);

        // Distribute 30 USDC to Rare
        vm.prank(economyManager);
        vault.distributeYield(30e6, RARE);

        // Now Bob gets 30
        assertApproxEqAbs(vault.pendingYield(bob), 30e6, 1);
        assertApproxEqAbs(vault.pendingYield(alice), 50e6, 1); // Unchanged
    }

    // ================================================================
    // Correction accumulator: price change within same rarity
    // ================================================================

    function test_correctionAccumulator_priceChange() public {
        // Alice deposits 1 token at $100 (Common)
        vm.prank(treasury);
        vault.registerCardDeposit(CARD_A, alice, 100e18, COMMON, 1);

        // Distribute 10 USDC to Common while price is $100
        vm.prank(economyManager);
        vault.distributeYield(10e6, COMMON);

        // Price changes to $200 (still Common)
        vm.prank(treasury);
        vault.updateCardPrice(CARD_A, 200e18);

        // Distribute another 10 USDC to Common with new price
        vm.prank(economyManager);
        vault.distributeYield(10e6, COMMON);

        // Expected: 10 USDC from first period + 10 USDC from second period = 20 USDC
        // The correction accumulator ensures the first period's yield is based on $100, not $200
        uint256 pending = vault.pendingYield(alice);
        assertApproxEqAbs(pending, 20e6, 2); // Allow small rounding
    }

    function test_correctionAccumulator_priceDecrease() public {
        // Alice deposits 1 token at $200 (Common range for test)
        vm.prank(treasury);
        vault.registerCardDeposit(CARD_A, alice, 200e18, COMMON, 1);

        // Distribute 20 USDC while price is $200
        vm.prank(economyManager);
        vault.distributeYield(20e6, COMMON);

        // Price decreases to $100
        vm.prank(treasury);
        vault.updateCardPrice(CARD_A, 100e18);

        // Distribute 10 USDC at new price
        vm.prank(economyManager);
        vault.distributeYield(10e6, COMMON);

        // Expected: 20 + 10 = 30 USDC total
        uint256 pending = vault.pendingYield(alice);
        assertApproxEqAbs(pending, 30e6, 2);
    }

    // ================================================================
    // Rarity migration
    // ================================================================

    function test_rarityMigration_preservesYield() public {
        uint256 commonPrice = 10e18;  // $10 Common
        uint256 epicPrice = 500e18;   // $500 Epic

        // Alice deposits at Common
        vm.prank(treasury);
        vault.registerCardDeposit(CARD_A, alice, commonPrice, COMMON, 1);

        // Distribute 5 USDC to Common
        vm.prank(economyManager);
        vault.distributeYield(5e6, COMMON);

        // Migrate card to Epic with new price
        vm.prank(treasury);
        vault.migrateCardRarity(CARD_A, EPIC, epicPrice);

        // Distribute 50 USDC to Epic
        vm.prank(economyManager);
        vault.distributeYield(50e6, EPIC);

        // Alice should have: 5 USDC (settled from Common) + 50 USDC (from Epic)
        uint256 pending = vault.pendingYield(alice);
        assertApproxEqAbs(pending, 55e6, 2);

        // Claim and verify
        vm.prank(alice);
        uint256 claimed = vault.claimYield(alice);
        assertApproxEqAbs(claimed, 55e6, 2);
    }

    // ================================================================
    // Multiple cards per depositor
    // ================================================================

    function test_multipleCardsPerDepositor() public {
        // Alice deposits into two different cards in different rarities
        vm.startPrank(treasury);
        vault.registerCardDeposit(CARD_A, alice, 10e18, COMMON, 5);
        vault.registerCardDeposit(CARD_B, alice, 500e18, EPIC, 2);
        vm.stopPrank();

        // Shares should be 5*10 + 2*500 = 1050e18
        assertEq(vault.sharesOf(alice), 5 * 10e18 + 2 * 500e18);

        // Distribute to both pools
        vm.startPrank(economyManager);
        vault.distributeYield(10e6, COMMON);
        vault.distributeYield(100e6, EPIC);
        vm.stopPrank();

        // Alice gets all of Common yield (10) + all of Epic yield (100)
        uint256 pending = vault.pendingYield(alice);
        assertApproxEqAbs(pending, 110e6, 2);
    }

    // ================================================================
    // Multiple depositors per card
    // ================================================================

    function test_multipleDepositorsPerCard() public {
        uint256 price = 100e18;

        // Both deposit into same card
        vm.startPrank(treasury);
        vault.registerCardDeposit(CARD_A, alice, price, COMMON, 3); // 300 value
        vault.registerCardDeposit(CARD_A, bob, price, COMMON, 1);   // 100 value
        vm.stopPrank();

        // Total = 400e18
        assertEq(vault.totalShares(), 4 * price);

        // Distribute 100 USDC to Common
        vm.prank(economyManager);
        vault.distributeYield(100e6, COMMON);

        // Alice: 3/4 * 100 = 75, Bob: 1/4 * 100 = 25
        assertApproxEqAbs(vault.pendingYield(alice), 75e6, 1);
        assertApproxEqAbs(vault.pendingYield(bob), 25e6, 1);
    }

    // ================================================================
    // Edge cases
    // ================================================================

    function test_distributeToEmptyPool_reverts() public {
        vm.prank(economyManager);
        vm.expectRevert(CardGroupedVault.NoValueInPool.selector);
        vault.distributeYield(100e6, COMMON);
    }

    function test_claimWithNoPending_reverts() public {
        vm.prank(alice);
        vm.expectRevert(CardGroupedVault.NothingToClaim.selector);
        vault.claimYield(alice);
    }

    function test_removeMoreThanDeposited_reverts() public {
        vm.prank(treasury);
        vault.registerCardDeposit(CARD_A, alice, 100e18, COMMON, 2);

        vm.prank(treasury);
        vm.expectRevert(CardGroupedVault.InsufficientPosition.selector);
        vault.removeCardDeposit(CARD_A, alice, 3);
    }

    function test_lastDepositorExit_cleansUp() public {
        vm.prank(treasury);
        vault.registerCardDeposit(CARD_A, alice, 100e18, COMMON, 1);

        vm.prank(treasury);
        vault.removeCardDeposit(CARD_A, alice, 1);

        assertEq(vault.sharesOf(alice), 0);
        assertEq(vault.totalShares(), 0);

        bytes32[] memory cards = vault.getDepositorCards(alice);
        assertEq(cards.length, 0);
    }

    function test_removeDeposit_accruesYield() public {
        vm.prank(treasury);
        vault.registerCardDeposit(CARD_A, alice, 100e18, COMMON, 1);

        // Distribute yield
        vm.prank(economyManager);
        vault.distributeYield(50e6, COMMON);

        uint256 balBefore = usdc.balanceOf(alice);

        // Remove all tokens — should accrue, not auto-transfer
        vm.prank(treasury);
        vault.removeCardDeposit(CARD_A, alice, 1);

        // No USDC transfer on removal
        assertEq(usdc.balanceOf(alice), balBefore, "removal must not transfer USDC");

        // Yield is still claimable
        assertApproxEqAbs(vault.pendingYield(alice), 50e6, 1);

        // Explicit claim transfers it
        vm.prank(alice);
        uint256 claimed = vault.claimYield(alice);
        assertApproxEqAbs(claimed, 50e6, 1);
        assertApproxEqAbs(usdc.balanceOf(alice) - balBefore, 50e6, 1);
    }

    // ================================================================
    // Access control
    // ================================================================

    function test_onlyTreasury_canRegister() public {
        vm.prank(alice);
        vm.expectRevert(CardGroupedVault.CallerNotTreasury.selector);
        vault.registerCardDeposit(CARD_A, alice, 100e18, COMMON, 1);
    }

    function test_onlyEconomyManager_canDistribute() public {
        vm.prank(treasury);
        vault.registerCardDeposit(CARD_A, alice, 100e18, COMMON, 1);

        vm.prank(alice);
        vm.expectRevert(CardGroupedVault.CallerNotManager.selector);
        vault.distributeYield(10e6, COMMON);
    }

    function test_unauthorizedClaim_reverts() public {
        vm.prank(bob);
        vm.expectRevert(CardGroupedVault.UnauthorizedClaim.selector);
        vault.claimYield(alice);
    }

    // ================================================================
    // Partial claim via claimYieldForCards
    // ================================================================

    function test_claimYieldForCards() public {
        vm.startPrank(treasury);
        vault.registerCardDeposit(CARD_A, alice, 100e18, COMMON, 1);
        vault.registerCardDeposit(CARD_B, alice, 100e18, RARE, 1);
        vm.stopPrank();

        vm.startPrank(economyManager);
        vault.distributeYield(10e6, COMMON);
        vault.distributeYield(20e6, RARE);
        vm.stopPrank();

        // Claim only CARD_A
        bytes32[] memory cardIds = new bytes32[](1);
        cardIds[0] = CARD_A;

        uint256 balBefore = usdc.balanceOf(alice);
        vm.prank(alice);
        vault.claimYieldForCards(alice, cardIds);
        uint256 balAfter = usdc.balanceOf(alice);

        assertApproxEqAbs(balAfter - balBefore, 10e6, 1);

        // CARD_B yield still pending
        assertApproxEqAbs(vault.pendingYield(alice), 20e6, 1);
    }

    // ================================================================
    // Complex scenario: deposit → yield → price change → more yield
    // ================================================================

    function test_complexScenario_yieldSplitAcrossPriceChange() public {
        // Setup: Alice deposits 2 tokens at $50 each, Bob deposits 1 at $50
        vm.startPrank(treasury);
        vault.registerCardDeposit(CARD_A, alice, 50e18, COMMON, 2); // 100 value
        vault.registerCardDeposit(CARD_A, bob, 50e18, COMMON, 1);   // 50 value
        vm.stopPrank();

        // Total: 150e18 in Common

        // Period 1: Distribute 30 USDC while price is $50
        vm.prank(economyManager);
        vault.distributeYield(30e6, COMMON);

        // Alice: 2/3 * 30 = 20, Bob: 1/3 * 30 = 10
        assertApproxEqAbs(vault.pendingYield(alice), 20e6, 1);
        assertApproxEqAbs(vault.pendingYield(bob), 10e6, 1);

        // Price changes to $100 (same rarity)
        vm.prank(treasury);
        vault.updateCardPrice(CARD_A, 100e18);

        // Total now: 3 * 100 = 300e18 in Common (but proportions are same: 2:1)

        // Period 2: Distribute 60 USDC at new price
        vm.prank(economyManager);
        vault.distributeYield(60e6, COMMON);

        // Alice: 20 + 2/3 * 60 = 20 + 40 = 60
        // Bob: 10 + 1/3 * 60 = 10 + 20 = 30
        assertApproxEqAbs(vault.pendingYield(alice), 60e6, 2);
        assertApproxEqAbs(vault.pendingYield(bob), 30e6, 2);
    }

    // ================================================================
    // Partial removal / deposit must harvest yield (regression tests)
    // ================================================================

    /// @notice Reproduces the bug where partial removal silently destroyed
    ///         accumulated yield. Before the fix, _accruePosition was a no-op
    ///         and _resetDebts zeroed out pending yield without paying it.
    ///         Now yield is materialized into accruedYield, claimable explicitly.
    function test_partialRemoval_preservesYield() public {
        uint256 price = 100e18;

        // Alice deposits 3 copies of CARD_A
        vm.prank(treasury);
        vault.registerCardDeposit(CARD_A, alice, price, COMMON, 3);

        // Distribute 90 USDC → Alice is sole depositor, should earn all 90
        vm.prank(economyManager);
        vault.distributeYield(90e6, COMMON);

        assertApproxEqAbs(vault.pendingYield(alice), 90e6, 1);

        uint256 balBefore = usdc.balanceOf(alice);

        // Partial removal: remove 1 of 3 tokens
        vm.prank(treasury);
        vault.removeCardDeposit(CARD_A, alice, 1);

        // No USDC transfer on removal
        assertEq(usdc.balanceOf(alice), balBefore, "removal must not transfer USDC");

        // All 90 USDC still visible as pending (materialized into accruedYield)
        assertApproxEqAbs(vault.pendingYield(alice), 90e6, 1, "partial removal must preserve yield");

        // Future yield should still accrue for the remaining 2 tokens
        vm.prank(economyManager);
        vault.distributeYield(60e6, COMMON);

        assertApproxEqAbs(vault.pendingYield(alice), 150e6, 1, "remaining tokens must earn future yield");

        // Explicit claim pays out everything
        vm.prank(alice);
        uint256 claimed = vault.claimYield(alice);
        assertApproxEqAbs(claimed, 150e6, 1);
    }

    /// @notice Verifies that depositing additional tokens into an existing
    ///         position materializes yield into accruedYield (not auto-transferred).
    function test_additionalDeposit_preservesYield() public {
        uint256 price = 100e18;

        // Alice deposits 2 copies
        vm.prank(treasury);
        vault.registerCardDeposit(CARD_A, alice, price, COMMON, 2);

        // Distribute 50 USDC
        vm.prank(economyManager);
        vault.distributeYield(50e6, COMMON);

        assertApproxEqAbs(vault.pendingYield(alice), 50e6, 1);

        uint256 balBefore = usdc.balanceOf(alice);

        // Add 1 more token — should materialize the 50 USDC, not transfer
        vm.prank(treasury);
        vault.registerCardDeposit(CARD_A, alice, price, COMMON, 1);

        // No USDC transfer on deposit
        assertEq(usdc.balanceOf(alice), balBefore, "deposit must not transfer USDC");

        // 50 USDC still visible as pending
        assertApproxEqAbs(vault.pendingYield(alice), 50e6, 1);

        // Future yield accrues for all 3 tokens on top of the materialized amount
        vm.prank(economyManager);
        vault.distributeYield(30e6, COMMON);

        assertApproxEqAbs(vault.pendingYield(alice), 80e6, 1);

        // Explicit claim gets it all
        vm.prank(alice);
        uint256 claimed = vault.claimYield(alice);
        assertApproxEqAbs(claimed, 80e6, 1);
    }

    /// @notice End-to-end simulation of the reported bug scenario:
    ///         depositor spins multiple times, winning their own NFTs back.
    ///         Each partial removal materializes yield; explicit claim pays out.
    function test_repeatedPartialRemovals_accumulateYield() public {
        uint256 price = 50e18; // $50 each

        // Alice deposits 5 copies of CARD_A
        vm.prank(treasury);
        vault.registerCardDeposit(CARD_A, alice, price, COMMON, 5);

        // Simulate 4 spins where Alice wins her own NFTs back each time
        for (uint256 i = 0; i < 4; i++) {
            // Each spin distributes 76 USDC (95% of ~$80 fee) to Common
            vm.prank(economyManager);
            vault.distributeYield(76e6, COMMON);

            // Partial removal: 1 NFT won from Alice's position
            vm.prank(treasury);
            vault.removeCardDeposit(CARD_A, alice, 1);
        }

        // No USDC transferred yet — only accrued
        assertEq(usdc.balanceOf(alice), 0, "no auto-transfer during removals");

        // After 4 spins at 76 USDC each = 304 USDC total distributed
        // Alice is the sole depositor so pendingYield should reflect all of it
        assertApproxEqAbs(vault.pendingYield(alice), 304e6, 200, "all yield must be claimable");

        // 1 token remaining
        assertEq(vault.sharesOf(alice), price);

        // Explicit claim pays out
        uint256 balBefore = usdc.balanceOf(alice);
        vm.prank(alice);
        uint256 claimed = vault.claimYield(alice);
        assertApproxEqAbs(claimed, 304e6, 200);
        assertApproxEqAbs(usdc.balanceOf(alice) - balBefore, 304e6, 200);
    }

    // ================================================================
    // Gas benchmark: O(1) price update
    // ================================================================

    function test_gasBenchmark_priceUpdateIsConstant() public {
        // Setup many depositors on same card
        uint256 price = 100e18;
        for (uint256 i = 1; i <= 50; i++) {
            vm.prank(treasury);
            vault.registerCardDeposit(CARD_A, address(uint160(i + 100)), price, COMMON, 1);
        }

        // Distribute some yield
        vm.prank(economyManager);
        vault.distributeYield(100e6, COMMON);

        // Price update should be O(1) regardless of depositor count
        uint256 gasBefore = gasleft();
        vm.prank(treasury);
        vault.updateCardPrice(CARD_A, 150e18);
        uint256 gasUsed = gasBefore - gasleft();

        // Should use roughly constant gas (well under 50k for O(1))
        assertLt(gasUsed, 50_000, "Price update should be O(1) gas");
    }

    // ================================================================
    // View functions
    // ================================================================

    function test_rarityTotalValue() public {
        vm.startPrank(treasury);
        vault.registerCardDeposit(CARD_A, alice, 100e18, COMMON, 3);
        vault.registerCardDeposit(CARD_B, bob, 500e18, EPIC, 2);
        vm.stopPrank();

        assertEq(vault.rarityTotalValue(COMMON), 3 * 100e18);
        assertEq(vault.rarityTotalValue(EPIC), 2 * 500e18);
        assertEq(vault.rarityTotalValue(RARE), 0);
    }

    function test_getDepositorCards() public {
        vm.startPrank(treasury);
        vault.registerCardDeposit(CARD_A, alice, 100e18, COMMON, 1);
        vault.registerCardDeposit(CARD_B, alice, 200e18, RARE, 1);
        vm.stopPrank();

        bytes32[] memory cards = vault.getDepositorCards(alice);
        assertEq(cards.length, 2);
    }
}
