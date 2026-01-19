// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {StandardTest} from "../../helpers/StandardTest.sol";
import {TestConstants} from "../../helpers/TestConstants.sol";
import {RarityTracker} from "../../../src/gacha/RarityTracker.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

/**
 * @title RarityTracker Test Suite
 * @notice Comprehensive unit tests for the ERC2222-style rarity tracking system
 * @dev Tests the complete tree structure: rarity → card → depositor with price cascading
 * @author NFT Gacha Team
 */
contract RarityTrackerTest is StandardTest {
    using TestConstants for *;

    // ========================================================================
    // TEST STATE VARIABLES
    // ========================================================================

    RarityTracker public tracker;
    RarityTracker public trackerImpl;

    address public trackerOwner;
    address public depositor1;
    address public depositor2;
    address public depositor3;

    // Card IDs (simulating collection + tokenId combinations)
    bytes32 public constant CARD_ID_1 = keccak256("collection1-token1");
    bytes32 public constant CARD_ID_2 = keccak256("collection1-token2");
    bytes32 public constant CARD_ID_3 = keccak256("collection2-token1");

    // Appraisal values
    uint256 public constant APPRAISAL_1 = 100e18; // $100
    uint256 public constant APPRAISAL_2 = 200e18; // $200
    uint256 public constant APPRAISAL_3 = 300e18; // $300

    // ========================================================================
    // EVENTS
    // ========================================================================

    event NftWon(address indexed winner, uint256 indexed tokenId, uint256 totalWins);
    event RewardClaimed(address indexed user, uint256 amount);
    event TrackerUpdated(string indexed key, uint256 value);
    event DepositorPositionUpdated(address indexed depositor, bytes32 indexed cardId, uint256 count, uint256 valueUSD);
    event CardAggregationUpdated(bytes32 indexed cardId, uint256 totalCount, uint256 totalValueUSD);
    event CardAppraisalUpdated(bytes32 indexed cardId, uint256 previousAppraisalUSD, uint256 newAppraisalUSD, int256 rarityDeltaUSD);

    // ========================================================================
    // SETUP AND TEARDOWN
    // ========================================================================

    /**
     * @notice Sets up the test environment
     * @dev Deploys RarityTracker with proxy pattern
     */
    function setUp() public {
        // Set up test addresses
        trackerOwner = makeAddr("trackerOwner");
        depositor1 = makeAddr("depositor1");
        depositor2 = makeAddr("depositor2");
        depositor3 = makeAddr("depositor3");

        // Deploy implementation
        trackerImpl = new RarityTracker();

        // Deploy proxy with initialization
        bytes memory initData = abi.encodeWithSelector(
            RarityTracker.initialize.selector,
            trackerOwner,
            "Common"
        );

        ERC1967Proxy proxy = new ERC1967Proxy(address(trackerImpl), initData);
        tracker = RarityTracker(address(proxy));
    }

    // ========================================================================
    // DEPLOYMENT TESTS
    // ========================================================================

    /**
     * @notice Test proper deployment
     */
    function testDeployment() public view {
        assertEq(tracker.rarityName(), "Common", "Rarity name should match");
        assertEq(tracker.owner(), trackerOwner, "Owner should match");
        assertEq(tracker.totalWins(), 0, "Total wins should be 0");
        assertEq(tracker.totalRewards(), 0, "Total rewards should be 0");
        assertEq(tracker.totalNftsWon(), 0, "Total NFTs won should be 0");
        assertEq(tracker.totalDepositedCount(), 0, "Total deposited count should be 0");
        assertEq(tracker.totalAppraisedValueUSD(), 0, "Total appraised value should be 0");
    }

    /**
     * @notice Test initialization fails with zero owner
     */
    function testInitializationFailsWithZeroOwner() public {
        trackerImpl = new RarityTracker();

        bytes memory initData = abi.encodeWithSelector(
            RarityTracker.initialize.selector,
            address(0),
            "Common"
        );

        vm.expectRevert("RarityTracker: owner is zero");
        new ERC1967Proxy(address(trackerImpl), initData);
    }

    // ========================================================================
    // DEPOSIT REGISTRATION TESTS
    // ========================================================================

    /**
     * @notice Test single NFT deposit registration
     */
    function testRegisterDeposit() public {
        vm.startPrank(trackerOwner);

        tracker.registerDeposit(CARD_ID_1, depositor1, APPRAISAL_1, 1);

        // Verify card tracking
        (uint256 appraisal, uint256 totalCount, uint256 totalValue) = tracker.getCardInfo(CARD_ID_1);
        assertEq(appraisal, APPRAISAL_1, "Card appraisal should match");
        assertEq(totalCount, 1, "Card total count should be 1");
        assertEq(totalValue, APPRAISAL_1, "Card total value should match");

        // Verify depositor position
        assertEq(tracker.getDepositorValue(depositor1), APPRAISAL_1, "Depositor value should match");

        // Verify rarity totals
        assertEq(tracker.totalDepositedCount(), 1, "Total count should be 1");
        assertEq(tracker.totalAppraisedValueUSD(), APPRAISAL_1, "Total value should match");

        // Verify tracked cards
        bytes32[] memory trackedCards = tracker.getTrackedCards();
        assertEq(trackedCards.length, 1, "Should have 1 tracked card");
        assertEq(trackedCards[0], CARD_ID_1, "Card ID should match");

        vm.stopPrank();
    }

    /**
     * @notice Test multiple NFT deposit registration in single call
     */
    function testRegisterDepositMultiple() public {
        vm.startPrank(trackerOwner);

        tracker.registerDeposit(CARD_ID_1, depositor1, APPRAISAL_1, 5);

        (uint256 appraisal, uint256 totalCount, uint256 totalValue) = tracker.getCardInfo(CARD_ID_1);
        assertEq(totalCount, 5, "Card should have 5 NFTs");
        assertEq(totalValue, APPRAISAL_1 * 5, "Card value should be 5x appraisal");
        assertEq(tracker.getDepositorValue(depositor1), APPRAISAL_1 * 5, "Depositor should have 5x value");
        assertEq(tracker.totalDepositedCount(), 5, "Total count should be 5");

        vm.stopPrank();
    }

    /**
     * @notice Test multiple depositors for same card
     */
    function testRegisterMultipleDepositorsSameCard() public {
        vm.startPrank(trackerOwner);

        tracker.registerDeposit(CARD_ID_1, depositor1, APPRAISAL_1, 3);
        tracker.registerDeposit(CARD_ID_1, depositor2, APPRAISAL_1, 2);

        (, uint256 totalCount, uint256 totalValue) = tracker.getCardInfo(CARD_ID_1);
        assertEq(totalCount, 5, "Card should have 5 total NFTs");
        assertEq(totalValue, APPRAISAL_1 * 5, "Card value should be 5x appraisal");

        assertEq(tracker.getDepositorValue(depositor1), APPRAISAL_1 * 3, "Depositor1 should have 3x value");
        assertEq(tracker.getDepositorValue(depositor2), APPRAISAL_1 * 2, "Depositor2 should have 2x value");

        // Verify getCardDepositors
        (address[] memory depositors, uint256[] memory counts) = tracker.getCardDepositors(CARD_ID_1);
        assertEq(depositors.length, 2, "Should have 2 depositors");
        assertEq(counts[0], 3, "Depositor1 count should be 3");
        assertEq(counts[1], 2, "Depositor2 count should be 2");

        vm.stopPrank();
    }

    /**
     * @notice Test deposit to multiple cards
     */
    function testRegisterDepositsToMultipleCards() public {
        vm.startPrank(trackerOwner);

        tracker.registerDeposit(CARD_ID_1, depositor1, APPRAISAL_1, 2);
        tracker.registerDeposit(CARD_ID_2, depositor1, APPRAISAL_2, 1);
        tracker.registerDeposit(CARD_ID_3, depositor2, APPRAISAL_3, 3);

        bytes32[] memory trackedCards = tracker.getTrackedCards();
        assertEq(trackedCards.length, 3, "Should track 3 cards");

        assertEq(tracker.getDepositorValue(depositor1), APPRAISAL_1 * 2 + APPRAISAL_2, "Depositor1 total incorrect");
        assertEq(tracker.getDepositorValue(depositor2), APPRAISAL_3 * 3, "Depositor2 total incorrect");

        vm.stopPrank();
    }

    /**
     * @notice Test additional deposits increase existing position
     */
    function testRegisterDepositAdditionalToExisting() public {
        vm.startPrank(trackerOwner);

        tracker.registerDeposit(CARD_ID_1, depositor1, APPRAISAL_1, 2);
        assertEq(tracker.getDepositorValue(depositor1), APPRAISAL_1 * 2, "Initial value incorrect");

        tracker.registerDeposit(CARD_ID_1, depositor1, APPRAISAL_1, 3);
        assertEq(tracker.getDepositorValue(depositor1), APPRAISAL_1 * 5, "Updated value incorrect");

        (, uint256 totalCount,) = tracker.getCardInfo(CARD_ID_1);
        assertEq(totalCount, 5, "Total count should be 5");

        vm.stopPrank();
    }

    /**
     * @notice Test deposit fails with zero card ID
     */
    function testRegisterDepositFailsWithZeroCardId() public {
        vm.startPrank(trackerOwner);

        vm.expectRevert("RarityTracker: cardId is zero");
        tracker.registerDeposit(bytes32(0), depositor1, APPRAISAL_1, 1);

        vm.stopPrank();
    }

    /**
     * @notice Test deposit fails with zero depositor
     */
    function testRegisterDepositFailsWithZeroDepositor() public {
        vm.startPrank(trackerOwner);

        vm.expectRevert("RarityTracker: depositor is zero");
        tracker.registerDeposit(CARD_ID_1, address(0), APPRAISAL_1, 1);

        vm.stopPrank();
    }

    /**
     * @notice Test deposit fails with zero count
     */
    function testRegisterDepositFailsWithZeroCount() public {
        vm.startPrank(trackerOwner);

        vm.expectRevert("RarityTracker: count is zero");
        tracker.registerDeposit(CARD_ID_1, depositor1, APPRAISAL_1, 0);

        vm.stopPrank();
    }

    /**
     * @notice Test deposit fails with zero appraisal
     */
    function testRegisterDepositFailsWithZeroAppraisal() public {
        vm.startPrank(trackerOwner);

        vm.expectRevert("RarityTracker: appraisal is zero");
        tracker.registerDeposit(CARD_ID_1, depositor1, 0, 1);

        vm.stopPrank();
    }

    /**
     * @notice Test deposit fails with appraisal mismatch
     */
    function testRegisterDepositFailsWithAppraisalMismatch() public {
        vm.startPrank(trackerOwner);

        tracker.registerDeposit(CARD_ID_1, depositor1, APPRAISAL_1, 1);

        vm.expectRevert("RarityTracker: appraisal mismatch");
        tracker.registerDeposit(CARD_ID_1, depositor2, APPRAISAL_2, 1);

        vm.stopPrank();
    }

    // ========================================================================
    // DEPOSIT REMOVAL TESTS
    // ========================================================================

    /**
     * @notice Test single NFT removal
     */
    function testRemoveDeposit() public {
        vm.startPrank(trackerOwner);

        tracker.registerDeposit(CARD_ID_1, depositor1, APPRAISAL_1, 5);
        tracker.removeDeposit(CARD_ID_1, depositor1, 2);

        (, uint256 totalCount, uint256 totalValue) = tracker.getCardInfo(CARD_ID_1);
        assertEq(totalCount, 3, "Card should have 3 remaining");
        assertEq(totalValue, APPRAISAL_1 * 3, "Card value should be 3x appraisal");
        assertEq(tracker.getDepositorValue(depositor1), APPRAISAL_1 * 3, "Depositor should have 3x value");

        vm.stopPrank();
    }

    /**
     * @notice Test complete removal of position
     */
    function testRemoveDepositCompletePosition() public {
        vm.startPrank(trackerOwner);

        tracker.registerDeposit(CARD_ID_1, depositor1, APPRAISAL_1, 3);
        tracker.removeDeposit(CARD_ID_1, depositor1, 3);

        assertEq(tracker.getDepositorValue(depositor1), 0, "Depositor value should be 0");

        (address[] memory depositors,) = tracker.getCardDepositors(CARD_ID_1);
        assertEq(depositors.length, 0, "No depositors should remain");

        vm.stopPrank();
    }

    /**
     * @notice Test removal untracks card when empty
     */
    function testRemoveDepositUntracksEmptyCard() public {
        vm.startPrank(trackerOwner);

        tracker.registerDeposit(CARD_ID_1, depositor1, APPRAISAL_1, 2);
        assertEq(tracker.getTrackedCards().length, 1, "Should have 1 tracked card");

        tracker.removeDeposit(CARD_ID_1, depositor1, 2);
        assertEq(tracker.getTrackedCards().length, 0, "Card should be untracked");

        vm.stopPrank();
    }

    /**
     * @notice Test removal fails with insufficient balance
     */
    function testRemoveDepositFailsWithInsufficientBalance() public {
        vm.startPrank(trackerOwner);

        tracker.registerDeposit(CARD_ID_1, depositor1, APPRAISAL_1, 2);

        vm.expectRevert("RarityTracker: insufficient balance");
        tracker.removeDeposit(CARD_ID_1, depositor1, 3);

        vm.stopPrank();
    }

    /**
     * @notice Test removal fails for untracked card
     */
    function testRemoveDepositFailsForUntrackedCard() public {
        vm.startPrank(trackerOwner);

        vm.expectRevert("RarityTracker: card not tracked");
        tracker.removeDeposit(CARD_ID_1, depositor1, 1);

        vm.stopPrank();
    }

    // ========================================================================
    // PRICE UPDATE TESTS (CRITICAL - CASCADING LOGIC)
    // ========================================================================

    /**
     * @notice Test price increase cascades to depositors
     */
    function testUpdateCardAppraisalIncrease() public {
        vm.startPrank(trackerOwner);

        // Setup: 2 depositors with different amounts
        tracker.registerDeposit(CARD_ID_1, depositor1, APPRAISAL_1, 3); // 3 NFTs at $100 = $300
        tracker.registerDeposit(CARD_ID_1, depositor2, APPRAISAL_1, 2); // 2 NFTs at $100 = $200

        uint256 totalBefore = tracker.totalAppraisedValueUSD();
        assertEq(totalBefore, APPRAISAL_1 * 5, "Total before should be 5x appraisal");

        // Update price to $150 (50% increase)
        uint256 newAppraisal = 150e18;
        int256 rarityDelta = tracker.updateCardAppraisal(CARD_ID_1, newAppraisal);

        // Verify delta: +$50 * 5 NFTs = +$250
        assertEq(int256(rarityDelta), int256(250e18), "Delta should be +$250");

        // Verify card updated
        (uint256 appraisal, uint256 totalCount, uint256 totalValue) = tracker.getCardInfo(CARD_ID_1);
        assertEq(appraisal, newAppraisal, "Card appraisal should be updated");
        assertEq(totalCount, 5, "Count should be unchanged");
        assertEq(totalValue, newAppraisal * 5, "Card value should be updated");

        // Verify cascading to depositors
        assertEq(tracker.getDepositorValue(depositor1), newAppraisal * 3, "Depositor1 should have 3x new appraisal");
        assertEq(tracker.getDepositorValue(depositor2), newAppraisal * 2, "Depositor2 should have 2x new appraisal");

        // Verify rarity total
        uint256 totalAfter = tracker.totalAppraisedValueUSD();
        assertEq(totalAfter, totalBefore + uint256(rarityDelta), "Total should increase by delta");

        vm.stopPrank();
    }

    /**
     * @notice Test price decrease cascades to depositors
     */
    function testUpdateCardAppraisalDecrease() public {
        vm.startPrank(trackerOwner);

        tracker.registerDeposit(CARD_ID_1, depositor1, APPRAISAL_1, 2);

        uint256 totalBefore = tracker.totalAppraisedValueUSD();

        // Decrease price to $50
        uint256 newAppraisal = 50e18;
        int256 rarityDelta = tracker.updateCardAppraisal(CARD_ID_1, newAppraisal);

        // Verify delta is negative
        assertEq(rarityDelta, int256(-100e18), "Delta should be -$100");

        // Verify depositor value decreased
        assertEq(tracker.getDepositorValue(depositor1), newAppraisal * 2, "Depositor value should decrease");
        assertEq(tracker.totalAppraisedValueUSD(), totalBefore - 100e18, "Total should decrease");

        vm.stopPrank();
    }

    /**
     * @notice Test price update with zero delta (same price)
     */
    function testUpdateCardAppraisalNoChange() public {
        vm.startPrank(trackerOwner);

        tracker.registerDeposit(CARD_ID_1, depositor1, APPRAISAL_1, 1);

        uint256 totalBefore = tracker.totalAppraisedValueUSD();
        int256 delta = tracker.updateCardAppraisal(CARD_ID_1, APPRAISAL_1);

        assertEq(delta, int256(0), "Delta should be 0");
        assertEq(tracker.totalAppraisedValueUSD(), totalBefore, "Total should be unchanged");

        vm.stopPrank();
    }

    /**
     * @notice Test price update fails for untracked card
     */
    function testUpdateCardAppraisalFailsForUntrackedCard() public {
        vm.startPrank(trackerOwner);

        vm.expectRevert("RarityTracker: card not tracked");
        tracker.updateCardAppraisal(CARD_ID_1, APPRAISAL_2);

        vm.stopPrank();
    }

    /**
     * @notice Test price update fails with zero appraisal
     */
    function testUpdateCardAppraisalFailsWithZeroAppraisal() public {
        vm.startPrank(trackerOwner);

        tracker.registerDeposit(CARD_ID_1, depositor1, APPRAISAL_1, 1);

        vm.expectRevert("RarityTracker: appraisal is zero");
        tracker.updateCardAppraisal(CARD_ID_1, 0);

        vm.stopPrank();
    }

    // ========================================================================
    // SWAP-AND-POP ARRAY OPERATION TESTS
    // ========================================================================

    /**
     * @notice Test swap-and-pop when removing depositor from middle of array
     */
    function testSwapAndPopRemovesDepositor() public {
        vm.startPrank(trackerOwner);

        // Add 3 depositors
        tracker.registerDeposit(CARD_ID_1, depositor1, APPRAISAL_1, 1);
        tracker.registerDeposit(CARD_ID_1, depositor2, APPRAISAL_1, 1);
        tracker.registerDeposit(CARD_ID_1, depositor3, APPRAISAL_1, 1);

        (address[] memory depositorsBefore,) = tracker.getCardDepositors(CARD_ID_1);
        assertEq(depositorsBefore.length, 3, "Should have 3 depositors");

        // Remove middle depositor
        tracker.removeDeposit(CARD_ID_1, depositor2, 1);

        (address[] memory depositorsAfter,) = tracker.getCardDepositors(CARD_ID_1);
        assertEq(depositorsAfter.length, 2, "Should have 2 depositors");

        // Verify swap-and-pop worked - depositor2 should be gone
        bool foundDepositor2 = false;
        for (uint256 i = 0; i < depositorsAfter.length; i++) {
            if (depositorsAfter[i] == depositor2) {
                foundDepositor2 = true;
                break;
            }
        }
        assertTrue(!foundDepositor2, "Depositor2 should be removed");

        vm.stopPrank();
    }

    /**
     * @notice Test swap-and-pop when removing last card
     */
    function testSwapAndPopRemovesLastCard() public {
        vm.startPrank(trackerOwner);

        tracker.registerDeposit(CARD_ID_1, depositor1, APPRAISAL_1, 1);
        tracker.registerDeposit(CARD_ID_2, depositor1, APPRAISAL_2, 1);
        tracker.registerDeposit(CARD_ID_3, depositor1, APPRAISAL_3, 1);

        bytes32[] memory cardsBefore = tracker.getTrackedCards();
        assertEq(cardsBefore.length, 3, "Should have 3 cards");

        // Remove last card
        tracker.removeDeposit(CARD_ID_3, depositor1, 1);

        bytes32[] memory cardsAfter = tracker.getTrackedCards();
        assertEq(cardsAfter.length, 2, "Should have 2 cards");

        // Verify CARD_ID_3 is gone
        bool foundCard3 = false;
        for (uint256 i = 0; i < cardsAfter.length; i++) {
            if (cardsAfter[i] == CARD_ID_3) {
                foundCard3 = true;
                break;
            }
        }
        assertTrue(!foundCard3, "Card3 should be removed");

        vm.stopPrank();
    }

    // ========================================================================
    // ANALYTICS TESTS
    // ========================================================================

    /**
     * @notice Test recording wins
     */
    function testRecordWin() public {
        vm.startPrank(trackerOwner);

        tracker.recordWin(depositor1, 100);

        assertEq(tracker.totalWins(), 1, "Total wins should be 1");
        assertEq(tracker.totalNftsWon(), 1, "Total NFTs won should be 1");
        assertEq(tracker.userWins(depositor1), 1, "User wins should be 1");
        assertTrue(tracker.hasWon(depositor1), "User should have won flag");

        tracker.recordWin(depositor2, 101);
        assertEq(tracker.totalWins(), 2, "Total wins should be 2");

        vm.stopPrank();
    }

    /**
     * @notice Test recording rewards
     */
    function testRecordReward() public {
        vm.startPrank(trackerOwner);

        tracker.recordReward(depositor1, 100e18);

        assertEq(tracker.totalRewards(), 100e18, "Total rewards should match");
        assertEq(tracker.userRewards(depositor1), 100e18, "User rewards should match");

        tracker.recordReward(depositor1, 50e18);
        assertEq(tracker.userRewards(depositor1), 150e18, "Rewards should accumulate");

        vm.stopPrank();
    }

    /**
     * @notice Test recording reward fails with zero amount
     */
    function testRecordRewardFailsWithZeroAmount() public {
        vm.startPrank(trackerOwner);

        vm.expectRevert("RarityTracker: amount is zero");
        tracker.recordReward(depositor1, 0);

        vm.stopPrank();
    }

    /**
     * @notice Test getStatistics
     */
    function testGetStatistics() public {
        vm.startPrank(trackerOwner);

        tracker.recordWin(depositor1, 1);
        tracker.recordReward(depositor1, 100e18);
        tracker.recordWin(depositor2, 2);

        (uint256 totalWins, uint256 totalRewards, uint256 totalNftsWon) = tracker.getStatistics();

        assertEq(totalWins, 2, "Total wins should be 2");
        assertEq(totalRewards, 100e18, "Total rewards should match");
        assertEq(totalNftsWon, 2, "Total NFTs won should be 2");

        vm.stopPrank();
    }

    // ========================================================================
    // ACCESS CONTROL TESTS
    // ========================================================================

    /**
     * @notice Test only owner can register deposits
     */
    function testRegisterDepositAuthorization() public {
        vm.prank(unauthorizedUser);
        vm.expectRevert();
        tracker.registerDeposit(CARD_ID_1, depositor1, APPRAISAL_1, 1);
    }

    /**
     * @notice Test only owner can remove deposits
     */
    function testRemoveDepositAuthorization() public {
        vm.startPrank(trackerOwner);
        tracker.registerDeposit(CARD_ID_1, depositor1, APPRAISAL_1, 1);
        vm.stopPrank();

        vm.prank(unauthorizedUser);
        vm.expectRevert();
        tracker.removeDeposit(CARD_ID_1, depositor1, 1);
    }

    /**
     * @notice Test only owner can update appraisals
     */
    function testUpdateCardAppraisalAuthorization() public {
        vm.startPrank(trackerOwner);
        tracker.registerDeposit(CARD_ID_1, depositor1, APPRAISAL_1, 1);
        vm.stopPrank();

        vm.prank(unauthorizedUser);
        vm.expectRevert();
        tracker.updateCardAppraisal(CARD_ID_1, APPRAISAL_2);
    }

    // ========================================================================
    // PAUSE/UNPAUSE TESTS
    // ========================================================================

    /**
     * @notice Test pause prevents mutations
     */
    function testPausePreventsMutations() public {
        vm.startPrank(trackerOwner);

        tracker.registerDeposit(CARD_ID_1, depositor1, APPRAISAL_1, 1);
        tracker.pause();

        vm.expectRevert();
        tracker.registerDeposit(CARD_ID_2, depositor1, APPRAISAL_2, 1);

        vm.expectRevert();
        tracker.removeDeposit(CARD_ID_1, depositor1, 1);

        vm.expectRevert();
        tracker.updateCardAppraisal(CARD_ID_1, APPRAISAL_2);

        vm.stopPrank();
    }

    /**
     * @notice Test unpause allows mutations
     */
    function testUnpauseAllowsMutations() public {
        vm.startPrank(trackerOwner);

        tracker.pause();
        tracker.unpause();

        // Should succeed after unpause
        tracker.registerDeposit(CARD_ID_1, depositor1, APPRAISAL_1, 1);

        vm.stopPrank();
    }

    /**
     * @notice Test only owner can pause
     */
    function testPauseAuthorization() public {
        vm.prank(unauthorizedUser);
        vm.expectRevert();
        tracker.pause();
    }

    /**
     * @notice Test only owner can unpause
     */
    function testUnpauseAuthorization() public {
        vm.startPrank(trackerOwner);
        tracker.pause();
        vm.stopPrank();

        vm.prank(unauthorizedUser);
        vm.expectRevert();
        tracker.unpause();
    }

    // ========================================================================
    // EDGE CASE TESTS
    // ========================================================================

    /**
     * @notice Test maximum appraisal value
     */
    function testMaximumAppraisalValue() public {
        vm.startPrank(trackerOwner);

        uint256 maxAppraisal = uint256(type(int256).max);
        tracker.registerDeposit(CARD_ID_1, depositor1, maxAppraisal, 1);

        (uint256 appraisal,,) = tracker.getCardInfo(CARD_ID_1);
        assertEq(appraisal, maxAppraisal, "Should handle max appraisal");

        vm.stopPrank();
    }

    /**
     * @notice Test appraisal overflow is prevented
     */
    function testAppraisalOverflowPrevented() public {
        vm.startPrank(trackerOwner);

        uint256 overflowAppraisal = uint256(type(int256).max) + 1;

        vm.expectRevert("RarityTracker: appraisal overflow");
        tracker.registerDeposit(CARD_ID_1, depositor1, overflowAppraisal, 1);

        vm.stopPrank();
    }

    /**
     * @notice Test multiple cards and depositors complex scenario
     */
    function testComplexScenario() public {
        vm.startPrank(trackerOwner);

        // Setup complex state
        tracker.registerDeposit(CARD_ID_1, depositor1, APPRAISAL_1, 10);
        tracker.registerDeposit(CARD_ID_1, depositor2, APPRAISAL_1, 5);
        tracker.registerDeposit(CARD_ID_2, depositor1, APPRAISAL_2, 3);
        tracker.registerDeposit(CARD_ID_2, depositor3, APPRAISAL_2, 7);
        tracker.registerDeposit(CARD_ID_3, depositor2, APPRAISAL_3, 4);

        // Verify totals
        assertEq(tracker.totalDepositedCount(), 29, "Total count should be 29");
        assertEq(
            tracker.totalAppraisedValueUSD(),
            APPRAISAL_1 * 15 + APPRAISAL_2 * 10 + APPRAISAL_3 * 4,
            "Total value should match sum"
        );

        // Verify individual values
        assertEq(
            tracker.getDepositorValue(depositor1),
            APPRAISAL_1 * 10 + APPRAISAL_2 * 3,
            "Depositor1 value incorrect"
        );
        assertEq(
            tracker.getDepositorValue(depositor2),
            APPRAISAL_1 * 5 + APPRAISAL_3 * 4,
            "Depositor2 value incorrect"
        );
        assertEq(tracker.getDepositorValue(depositor3), APPRAISAL_2 * 7, "Depositor3 value incorrect");

        vm.stopPrank();
    }
}
