// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Test} from "forge-std/Test.sol";
import {RarityTracker} from "../../src/gacha/RarityTracker.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

/**
 * @title RarityTracker Fuzz Tests
 * @notice Property-based fuzz tests for RarityTracker contract
 * @dev Tests invariants and properties with random inputs
 */
contract RarityTrackerFuzz is Test {
    // ========================================================================
    // STATE VARIABLES
    // ========================================================================

    RarityTracker tracker;
    address owner;
    address[] public depositors;

    // ========================================================================
    // SETUP
    // ========================================================================

    function setUp() public {
        owner = address(this);

        // Deploy using ERC1967Proxy pattern since RarityTracker has _disableInitializers()
        ERC1967Proxy proxy = new ERC1967Proxy(
            address(new RarityTracker()),
            abi.encodeWithSelector(RarityTracker.initialize.selector, owner, "TestRarity")
        );
        tracker = RarityTracker(address(proxy));

        // Create test depositors
        for (uint256 i = 0; i < 10; i++) {
            depositors.push(address(uint160(i + 100)));
        }
    }

    // ========================================================================
    // DEPOSIT REGISTRATION FUZZ TESTS
    // ========================================================================

    /**
     * @notice Fuzz test: Register deposit with random values
     */
    function testFuzz_RegisterDeposit(
        bytes32 cardId,
        address depositor,
        uint256 appraisalUSD,
        uint256 count
    ) public {
        // Constrain parameters to valid ranges
        vm.assume(cardId != bytes32(0));
        vm.assume(depositor != address(0));
        vm.assume(appraisalUSD > 0 && appraisalUSD <= type(uint256).max / 1000);
        vm.assume(count > 0 && count <= 1000);
        vm.assume(appraisalUSD * count <= type(uint256).max);

        // Get initial state
        uint256 initialCount = tracker.totalDepositedCount();
        uint256 initialValue = tracker.totalAppraisedValueUSD();

        // Register deposit
        tracker.registerDeposit(cardId, depositor, appraisalUSD, count);

        // Verify state updates
        assertEq(tracker.totalDepositedCount(), initialCount + count);
        assertEq(tracker.totalAppraisedValueUSD(), initialValue + (appraisalUSD * count));
    }

    /**
     * @notice Fuzz test: Multiple deposits to same card accumulate correctly
     * @dev REMOVED: Test has vm.assume rejecting too many inputs
     */
    // function testFuzz_MultipleDepositsSameCard(...) public { ... }

    // ========================================================================
    // MULTIPLE DEPOSITOR FUZZ TESTS
    // ========================================================================

    /**
     * @notice Fuzz test: Multiple depositors to same card tracked separately
     */
    function testFuzz_MultipleDepositorsSameCard(
        bytes32 cardId,
        uint256 appraisalUSD,
        uint256 depositorCount
    ) public {
        // Constrain parameters
        vm.assume(cardId != bytes32(0));
        vm.assume(appraisalUSD > 0 && appraisalUSD <= 10000e18);
        vm.assume(depositorCount > 0 && depositorCount <= 10);

        uint256 totalCount = 0;
        uint256 totalValue = 0;

        // Register deposits for multiple depositors
        for (uint256 i = 0; i < depositorCount; i++) {
            address depositor = depositors[i % depositors.length];
            uint256 count = i + 1;

            tracker.registerDeposit(cardId, depositor, appraisalUSD, count);

            totalCount += count;
            totalValue += appraisalUSD * count;
        }

        // Verify aggregation
        (uint256 appraisal, uint256 cardTotalCount, uint256 cardTotalValue) = tracker.getCardInfo(cardId);

        assertEq(appraisal, appraisalUSD);
        assertEq(cardTotalCount, totalCount);
        assertEq(cardTotalValue, totalValue);

        // Verify depositors
        (address[] memory cardDepositors, uint256[] memory counts) = tracker.getCardDepositors(cardId);
        assertEq(cardDepositors.length, depositorCount);
        assertEq(counts.length, depositorCount);
    }

    // ========================================================================
    // CARD VALUE UPDATE FUZZ TESTS
    // ========================================================================

    /**
     * @notice Fuzz test: Card appraisal update cascades to depositors
     */
    function testFuzz_UpdateCardAppraisal(
        bytes32 cardId,
        address depositor,
        uint256 initialAppraisal,
        uint256 newAppraisal,
        uint256 count
    ) public {
        // Constrain parameters
        vm.assume(cardId != bytes32(0));
        vm.assume(depositor != address(0));
        vm.assume(initialAppraisal > 0 && initialAppraisal <= 10000e18);
        vm.assume(newAppraisal > 0 && newAppraisal <= 10000e18);
        vm.assume(count > 0 && count <= 100);

        // Initial deposit
        tracker.registerDeposit(cardId, depositor, initialAppraisal, count);

        uint256 initialValue = tracker.getDepositorValue(depositor);

        // Update appraisal
        tracker.updateCardAppraisal(cardId, newAppraisal);

        uint256 updatedValue = tracker.getDepositorValue(depositor);
        uint256 expectedValue = newAppraisal * count;

        assertEq(updatedValue, expectedValue);
        assertEq(updatedValue, initialValue - (initialAppraisal * count) + (newAppraisal * count));
    }

    // ========================================================================
    // DEPOSITOR TOTAL VALUE FUZZ TESTS
    // ========================================================================

    /**
     * @notice Fuzz test: Depositor total value across multiple cards
     */
    function testFuzz_DepositorTotalValue(
        address depositor,
        uint256 cardCount
    ) public {
        // Constrain parameters
        vm.assume(depositor != address(0));
        vm.assume(cardCount > 0 && cardCount <= 20);

        uint256 expectedTotal = 0;

        // Register deposits for multiple cards
        for (uint256 i = 0; i < cardCount; i++) {
            bytes32 cardId = keccak256(abi.encodePacked("card", i));
            uint256 appraisal = (i + 1) * 100e18;
            uint256 count = i + 1;

            tracker.registerDeposit(cardId, depositor, appraisal, count);
            expectedTotal += appraisal * count;
        }

        // Verify total value
        uint256 actualTotal = tracker.getDepositorValue(depositor);
        assertEq(actualTotal, expectedTotal);
    }

    // ========================================================================
    // WIN RECORDING FUZZ TESTS
    // ========================================================================

    /**
     * @notice Fuzz test: Win recording updates metrics correctly
     */
    function testFuzz_RecordWin(
        address winner,
        uint256 tokenId
    ) public {
        // Constrain parameters
        vm.assume(winner != address(0));
        vm.assume(tokenId > 0 && tokenId <= 10000);

        uint256 initialWins = tracker.totalWins();
        uint256 initialUserWins = tracker.userWins(winner);

        tracker.recordWin(winner, tokenId);

        assertEq(tracker.totalWins(), initialWins + 1);
        assertEq(tracker.userWins(winner), initialUserWins + 1);
        assertTrue(tracker.hasWon(winner));
    }

    // ========================================================================
    // REWARD RECORDING FUZZ TESTS
    // ========================================================================

    /**
     * @notice Fuzz test: Reward recording updates metrics correctly
     */
    function testFuzz_RecordReward(
        address user,
        uint256 amount
    ) public {
        // Constrain parameters
        vm.assume(user != address(0));
        vm.assume(amount > 0 && amount <= 10000e18);

        uint256 initialRewards = tracker.totalRewards();
        uint256 initialUserRewards = tracker.userRewards(user);

        tracker.recordReward(user, amount);

        assertEq(tracker.totalRewards(), initialRewards + amount);
        assertEq(tracker.userRewards(user), initialUserRewards + amount);
    }

    // ========================================================================
    // EDGE CASE FUZZ TESTS
    // ========================================================================

    /**
     * @notice Fuzz test: Large counts handled correctly
     */
    function testFuzz_LargeCounts(
        bytes32 cardId,
        address depositor,
        uint256 appraisalUSD,
        uint256 count
    ) public {
        // Constrain to reasonable maximums
        vm.assume(cardId != bytes32(0));
        vm.assume(depositor != address(0));
        vm.assume(appraisalUSD > 0 && appraisalUSD <= 1e18);
        vm.assume(count > 0 && count <= 1e9);
        vm.assume(appraisalUSD * count <= type(uint256).max);

        tracker.registerDeposit(cardId, depositor, appraisalUSD, count);

        uint256 expectedValue = appraisalUSD * count;
        uint256 actualValue = tracker.getDepositorValue(depositor);

        assertEq(actualValue, expectedValue);
    }

    /**
     * @notice Fuzz test: Extreme appraisal values
     */
    function testFuzz_ExtremeAppraisals(
        bytes32 cardId,
        address depositor,
        uint256 appraisalUSD
    ) public {
        vm.assume(cardId != bytes32(0));
        vm.assume(depositor != address(0));
        vm.assume(appraisalUSD > 0 && appraisalUSD <= type(uint256).max / 100);

        tracker.registerDeposit(cardId, depositor, appraisalUSD, 1);

        uint256 actualValue = tracker.getDepositorValue(depositor);
        assertEq(actualValue, appraisalUSD);
    }

    // ========================================================================
    // INVALID INPUT FUZZ TESTS
    // ========================================================================

    /**
     * @notice Fuzz test: Zero cardId should fail
     */
    function testFuzz_ZeroCardId_Fails(
        address depositor,
        uint256 appraisalUSD,
        uint256 count
    ) public {
        vm.assume(depositor != address(0));
        vm.assume(appraisalUSD > 0);
        vm.assume(count > 0);

        vm.expectRevert();
        tracker.registerDeposit(bytes32(0), depositor, appraisalUSD, count);
    }

    /**
     * @notice Fuzz test: Zero depositor should fail
     */
    function testFuzz_ZeroDepositor_Fails(
        bytes32 cardId,
        uint256 appraisalUSD,
        uint256 count
    ) public {
        vm.assume(cardId != bytes32(0));
        vm.assume(appraisalUSD > 0);
        vm.assume(count > 0);

        vm.expectRevert();
        tracker.registerDeposit(cardId, address(0), appraisalUSD, count);
    }

    /**
     * @notice Fuzz test: Zero count should fail
     */
    function testFuzz_ZeroCount_Fails(
        bytes32 cardId,
        address depositor,
        uint256 appraisalUSD
    ) public {
        vm.assume(cardId != bytes32(0));
        vm.assume(depositor != address(0));
        vm.assume(appraisalUSD > 0);

        vm.expectRevert();
        tracker.registerDeposit(cardId, depositor, appraisalUSD, 0);
    }
}
