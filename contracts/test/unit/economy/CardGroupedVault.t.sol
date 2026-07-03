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

    function test_yieldDistributesGloballyByValue() public {
        uint256 price = 100e18;

        // Alice in Common, Bob in Rare — equal value.
        vm.startPrank(treasury);
        vault.registerCardDeposit(CARD_A, alice, price, COMMON, 1);
        vault.registerCardDeposit(CARD_B, bob, price, RARE, 1);
        vm.stopPrank();

        // Distribute 50 USDC citing COMMON as the hit tier. Routing is global value-weighted:
        // the cited rarity is analytics only, so the 50 splits across the whole pool by value.
        // Alice and Bob hold equal value, so each gets 25.
        vm.prank(economyManager);
        vault.distributeYield(50e6, COMMON);
        assertApproxEqAbs(vault.pendingYield(alice), 25e6, 1);
        assertApproxEqAbs(vault.pendingYield(bob), 25e6, 1);

        // Distribute 30 USDC citing RARE — again split by value across the whole pool (15 each).
        vm.prank(economyManager);
        vault.distributeYield(30e6, RARE);
        assertApproxEqAbs(vault.pendingYield(alice), 40e6, 1); // 25 + 15
        assertApproxEqAbs(vault.pendingYield(bob), 40e6, 1); // 25 + 15
    }

    /// @notice Carry-forward keeps flooring dust from accumulating: over many distributions with
    ///         an amount that never divides the pool value evenly, the total un-distributed dust
    ///         stays bounded by a single remainder (< totalValue/PRECISION), NOT rounds × dust.
    function test_yieldDistribution_dustDoesNotAccumulate() public {
        // Awkward pool value so amount×PRECISION rarely divides totalValue evenly.
        vm.startPrank(treasury);
        vault.registerCardDeposit(CARD_A, alice, 10e18, COMMON, 1);
        vault.registerCardDeposit(CARD_B, bob, 100e18, RARE, 1);
        vault.registerCardDeposit(CARD_C, alice, 333e18, EPIC, 1);
        vm.stopPrank();

        uint256 totalValue = 10e18 + 100e18 + 333e18; // 443e18
        uint256 amount = 1_000_001; // ~$1, deliberately not a clean divisor
        uint256 rounds = 200;

        vm.startPrank(economyManager);
        for (uint256 i = 0; i < rounds; i++) {
            vault.distributeYield(amount, COMMON);
        }
        vm.stopPrank();

        uint256 totalDistributed = amount * rounds;
        uint256 totalPending = vault.pendingYield(alice) + vault.pendingYield(bob);

        // Bound is a single outstanding remainder (< totalValue/PRECISION) plus per-card floor —
        // independent of `rounds`. Without carry-forward the shortfall would be ~rounds × that,
        // i.e. ~200× larger, and this assertion would fail.
        uint256 bound = totalValue / 1e18 + 5; // ~448 units of 6-dec USDC
        assertApproxEqAbs(totalPending, totalDistributed, bound, "dust must not accumulate across rounds");

        // The carried remainder is always strictly less than the pool value (PRECISION×USD units).
        assertLt(vault.yieldRemainder(), totalValue, "remainder stays bounded by pool value");
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
        uint256 commonPrice = 10e18; // $10 Common
        uint256 epicPrice = 500e18; // $500 Epic

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

        // Distribute citing both pools
        vm.startPrank(economyManager);
        vault.distributeYield(10e6, COMMON);
        vault.distributeYield(100e6, EPIC);
        vm.stopPrank();

        // Alice is the sole depositor, so global-by-value routing still sends her essentially
        // all of both distributions (110 USDC). Carry-forward means only a single outstanding
        // remainder (< totalValue/PRECISION ≈ 1050 units of 6-dec USDC) can be undistributed — the
        // dust does not scale with the number of distributions.
        uint256 pending = vault.pendingYield(alice);
        assertApproxEqAbs(pending, 110e6, 1100);
    }

    // ================================================================
    // Multiple depositors per card
    // ================================================================

    function test_multipleDepositorsPerCard() public {
        uint256 price = 100e18;

        // Both deposit into same card
        vm.startPrank(treasury);
        vault.registerCardDeposit(CARD_A, alice, price, COMMON, 3); // 300 value
        vault.registerCardDeposit(CARD_A, bob, price, COMMON, 1); // 100 value
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

        // Global-by-value routing: CARD_A and CARD_B hold equal value, so each accrues half of
        // both distributions -> 10/2 + 20/2 = 15 each. Claiming only CARD_A pays 15; CARD_B's 15
        // stays pending.
        assertApproxEqAbs(balAfter - balBefore, 15e6, 1);
        assertApproxEqAbs(vault.pendingYield(alice), 15e6, 1);
    }

    // ================================================================
    // Complex scenario: deposit → yield → price change → more yield
    // ================================================================

    function test_complexScenario_yieldSplitAcrossPriceChange() public {
        // Setup: Alice deposits 2 tokens at $50 each, Bob deposits 1 at $50
        vm.startPrank(treasury);
        vault.registerCardDeposit(CARD_A, alice, 50e18, COMMON, 2); // 100 value
        vault.registerCardDeposit(CARD_A, bob, 50e18, COMMON, 1); // 50 value
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

    // ================================================================
    // Paginated claim / views (unbounded-list DoS mitigation)
    // ================================================================

    /// @dev Registers `n` distinct single-token COMMON cards for `who` at `price`.
    function _registerManyCards(address who, uint256 n, uint256 price) internal {
        vm.startPrank(treasury);
        for (uint256 i; i < n; ++i) {
            vault.registerCardDeposit(keccak256(abi.encode("pagcard", who, i)), who, price, COMMON, 1);
        }
        vm.stopPrank();
    }

    function test_getDepositorCardCount() public {
        _registerManyCards(alice, 5, 10e18);
        assertEq(vault.getDepositorCardCount(alice), 5);
        assertEq(vault.getDepositorCardCount(bob), 0);
    }

    function test_paginatedClaim_walksAllPages_matchesFull() public {
        _registerManyCards(alice, 7, 10e18);
        vm.prank(economyManager);
        vault.distributeYield(100e6, COMMON);

        uint256 expected = vault.pendingYield(alice);
        // Per-card integer division loses a few wei across the 7 cards (dust); tolerate it.
        assertApproxEqAbs(expected, 100e6, 100, "pending should equal distributed");

        uint256 totalClaimed;
        uint256 offset;
        uint256 guard;
        do {
            vm.prank(alice);
            (uint256 got, uint256 next) = vault.claimYieldPaginated(alice, offset, 3);
            totalClaimed += got;
            offset = next;
            require(guard++ < 20, "pagination did not terminate");
        } while (offset != 0);

        assertApproxEqAbs(totalClaimed, expected, 100, "paged claim total should match full pending");
        assertEq(vault.pendingYield(alice), 0, "nothing left after full paged claim");
    }

    function test_paginatedClaim_emptyPagesDoNotRevert() public {
        _registerManyCards(alice, 4, 10e18);
        vm.prank(economyManager);
        vault.distributeYield(40e6, COMMON);

        // First full walk drains everything.
        uint256 offset;
        do {
            vm.prank(alice);
            (, uint256 next) = vault.claimYieldPaginated(alice, offset, 2);
            offset = next;
        } while (offset != 0);

        // A second walk over already-claimed pages must not revert and must pay nothing.
        offset = 0;
        uint256 second;
        do {
            vm.prank(alice);
            (uint256 got, uint256 next) = vault.claimYieldPaginated(alice, offset, 2);
            second += got;
            offset = next;
        } while (offset != 0);
        assertEq(second, 0, "re-walk of claimed pages pays nothing");
    }

    function test_paginatedClaim_zeroLimitReverts() public {
        _registerManyCards(alice, 2, 10e18);
        vm.prank(alice);
        vm.expectRevert(CardGroupedVault.ZeroAmount.selector);
        vault.claimYieldPaginated(alice, 0, 0);
    }

    function test_paginatedClaim_unauthorizedReverts() public {
        _registerManyCards(alice, 2, 10e18);
        vm.prank(bob);
        vm.expectRevert(CardGroupedVault.UnauthorizedClaim.selector);
        vault.claimYieldPaginated(alice, 0, 2);
    }

    function test_paginatedViews_sumToFull() public {
        _registerManyCards(alice, 6, 25e18);
        vm.prank(economyManager);
        vault.distributeYield(60e6, COMMON);

        uint256 pendingFull = vault.pendingYield(alice);
        uint256 sharesFull = vault.sharesOf(alice);

        uint256 pendingSum;
        uint256 sharesSum;
        uint256 offset;
        uint256 guard;
        do {
            (uint256 p, uint256 nextP) = vault.pendingYieldPaginated(alice, offset, 4);
            (uint256 s,) = vault.sharesOfPaginated(alice, offset, 4);
            pendingSum += p;
            sharesSum += s;
            offset = nextP;
            require(guard++ < 20, "pagination did not terminate");
        } while (offset != 0);

        assertEq(pendingSum, pendingFull, "paged pending must equal full pending");
        assertEq(sharesSum, sharesFull, "paged shares must equal full shares");
    }

    function test_paginatedClaim_capturesAccruedYieldMaterializedMidWalk() public {
        _registerManyCards(alice, 4, 10e18);
        vm.prank(economyManager);
        vault.distributeYield(40e6, COMMON);

        uint256 expected = vault.pendingYield(alice);

        // Page 1: claim cards [0,1].
        vm.prank(alice);
        (uint256 got1, uint256 next1) = vault.claimYieldPaginated(alice, 0, 2);
        assertEq(next1, 2, "more pages remain");

        // Between pages, a withdraw of a not-yet-claimed card materializes its yield into
        // accruedYield (the bucket). Removing card index 3 (swap-pops it out of the list).
        vm.prank(treasury);
        vault.removeCardDeposit(keccak256(abi.encode("pagcard", alice, uint256(3))), alice, 1);

        // Finish the walk. accruedYield must be paid on the final page (nextOffset == 0), so the
        // total captures the mid-walk-materialized yield rather than stranding it.
        uint256 got2;
        uint256 offset = next1;
        uint256 guard;
        do {
            vm.prank(alice);
            (uint256 g, uint256 n) = vault.claimYieldPaginated(alice, offset, 2);
            got2 += g;
            offset = n;
            require(guard++ < 10, "no terminate");
        } while (offset != 0);

        assertApproxEqAbs(got1 + got2, expected, 100, "paged walk must capture all yield incl. mid-walk accrual");
        assertEq(vault.pendingYield(alice), 0, "nothing stranded");
    }

    function test_paginatedViews_zeroLimitReverts() public {
        _registerManyCards(alice, 2, 10e18);
        vm.expectRevert(CardGroupedVault.ZeroAmount.selector);
        vault.pendingYieldPaginated(alice, 0, 0);
        vm.expectRevert(CardGroupedVault.ZeroAmount.selector);
        vault.sharesOfPaginated(alice, 0, 0);
    }
}
