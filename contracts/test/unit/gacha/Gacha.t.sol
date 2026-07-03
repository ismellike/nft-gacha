// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {StandardTest} from "../../helpers/StandardTest.sol";
import {TestConstants} from "../../helpers/TestConstants.sol";
import {Gacha} from "../../../src/gacha/Gacha.sol";
import {GachaServiceHandler} from "../../../src/gacha/GachaServiceHandler.sol";
import {GachaTreasury} from "../../../src/gacha/GachaTreasury.sol";
import {BaseERC721} from "../../../src/tokens/BaseERC721.sol";
import {BaseERC20} from "../../../src/tokens/BaseERC20.sol";
import {MockNFTAppraisal} from "../../mocks/MockNFTAppraisal.sol";
import {MockWavsServiceManager} from "../../mocks/MockWavsServiceManager.sol";
import {MockGachaEconomyManager} from "../../mocks/MockGachaEconomyManager.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {IWavsServiceManager} from "@wavs/eigenlayer/ecdsa/interfaces/IWavsServiceManager.sol";

/**
 * @title Gacha Contract Test Suite
 * @notice Comprehensive test suite for the main Gacha game contract
 * @dev Tests spin mechanics, randomness fulfillment, timeout handling, and configuration
 * @author NFT Gacha Team
 */
contract GachaTest is StandardTest {
    using TestConstants for *;

    // ========================================================================
    // TEST STATE VARIABLES
    // ========================================================================

    /// @dev Contract instances
    Gacha public gacha;
    GachaServiceHandler public serviceHandler;
    GachaTreasury public treasury;
    BaseERC721 public nft;
    BaseERC20 public feeToken;
    MockNFTAppraisal public mockAppraisal;
    MockWavsServiceManager public mockWavsManager;
    MockGachaEconomyManager public mockEconomyManager;

    /// @dev Test addresses
    address public gachaOwner;
    address public gameSpinner;
    address public treasuryOwner;

    /// @dev Test constants (using 6 decimals for USDC)
    uint256 public constant MIN_SPIN_FEE = 0.01e6; // 0.01 USDC (6 decimals)
    uint256 public constant PRICING_PREMIUM_BPS = 100; // 1%
    uint256 public constant MAX_SPIN_FEE = 1e9; // High enough to cover all cases

    // ========================================================================
    // EVENTS
    // ========================================================================

    event SpinCompleted(
        uint256 indexed triggerId,
        address indexed requester,
        uint8 rarity,
        address collection,
        uint256 tokenId,
        uint256 appraisedPrice
    );
    event SpinRefunded(
        uint256 indexed triggerId, address indexed requester, uint8 selectedRarity, uint256 refundAmount
    );
    event SpinReclaimed(uint256 indexed triggerId, address indexed requester, uint256 refundAmount);
    event SpinStatusUpdate(uint256 indexed triggerId, address indexed requester, string status, uint256 timestamp);

    // ========================================================================
    // SETUP AND TEARDOWN
    // ========================================================================

    /**
     * @notice Sets up the test environment
     * @dev Deploys complete gacha stack with all dependencies
     */
    function setUp() public {
        // Set up test addresses
        gachaOwner = makeAddr("gachaOwner");
        gameSpinner = makeAddr("gameSpinner");
        treasuryOwner = makeAddr("treasuryOwner");

        // Deploy mock WAVS manager
        mockWavsManager = new MockWavsServiceManager();

        // Deploy mock economy manager
        mockEconomyManager = new MockGachaEconomyManager();

        // Deploy fee token
        feeToken = new BaseERC20("USDC", "USDC", gachaOwner);

        // Deploy mock appraisal
        mockAppraisal = new MockNFTAppraisal();

        // Deploy treasury
        vm.startPrank(treasuryOwner);
        GachaTreasury treasuryImpl = new GachaTreasury();
        uint256[] memory minPrices = TestConstants.getMinPrices();
        uint256[] memory maxPrices = TestConstants.getMaxPrices();
        string[] memory rarityNames = TestConstants.getDefaultRarityNames();
        bytes memory initData = abi.encodeWithSelector(
            GachaTreasury.initialize.selector,
            treasuryOwner,
            address(0xDEAD), // Placeholder gacha address
            address(mockAppraisal),
            uint8(5),
            rarityNames,
            minPrices,
            maxPrices
        );
        ERC1967Proxy treasuryProxy = new ERC1967Proxy(address(treasuryImpl), initData);
        treasury = GachaTreasury(address(treasuryProxy));
        vm.stopPrank();

        // Deploy Gacha implementation
        Gacha gachaImpl = new Gacha();

        // Deploy service handler (gachaImpl will be replaced with proxy after initialization)
        serviceHandler = new GachaServiceHandler(IWavsServiceManager(address(mockWavsManager)), address(gachaImpl));

        // Initialize Gacha proxy
        vm.prank(gachaOwner);
        initData = abi.encodeWithSelector(
            Gacha.initialize.selector,
            gachaOwner,
            address(serviceHandler),
            address(feeToken),
            MIN_SPIN_FEE,
            address(treasury),
            address(mockEconomyManager)
        );
        ERC1967Proxy gachaProxy = new ERC1967Proxy(address(gachaImpl), initData);
        gacha = Gacha(address(gachaProxy));

        // Set fee token decimals (USDC uses 6 decimals)
        vm.prank(gachaOwner);
        gacha.setFeeTokenDecimals(6);

        // Wire up treasury with gacha
        vm.prank(treasuryOwner);
        treasury.setGachaContract(address(gacha));

        // Deploy test NFT collection
        nft = new BaseERC721("Test NFT", "TNFT", treasuryOwner);

        // Fund gameSpinner with fee tokens
        vm.prank(gachaOwner);
        feeToken.mint(gameSpinner, 100 ether);
    }

    // ========================================================================
    // DEPLOYMENT TESTS
    // ========================================================================

    /**
     * @notice Test contract deployment
     * @dev Verifies that contract is deployed with correct initial state
     */
    function testDeployment() public view {
        assertEq(gacha.owner(), gachaOwner, "Owner should be set correctly");
        assertEq(address(gacha.feeToken()), address(feeToken), "Fee token should be set correctly");
        assertEq(address(gacha.treasury()), address(treasury), "Treasury should be set correctly");
        assertEq(gacha.minSpinFee(), MIN_SPIN_FEE, "Min spin fee should be set correctly");
        assertEq(gacha.totalSpinCount(), 0, "Initial spin count should be 0");
        assertEq(gacha.totalRefundCount(), 0, "Initial refund count should be 0");
    }

    // ========================================================================
    // SPIN FUNCTION TESTS
    // ========================================================================

    /**
     * @notice Test basic spin functionality
     * @dev Verifies that a spin request can be created
     */
    function testSpin() public returns (uint256 triggerId) {
        // Deposit NFTs to make spins available
        _depositNFTsForSpins();

        uint256 fee = gacha.getCurrentSpinFee();
        vm.prank(gameSpinner);
        feeToken.approve(address(gacha), fee);

        vm.prank(gameSpinner);
        triggerId = gacha.spin(MAX_SPIN_FEE);

        // Verify spin was created
        (uint256 feePaid, uint256 requestTime, address requester,) = gacha.spinRequests(triggerId);
        assertTrue(feePaid > 0, "Fee should be paid");
        assertTrue(requestTime > 0, "Request time should be set");
        assertEq(requester, gameSpinner, "Requester should be gameSpinner");
    }

    /**
     * @notice Test spin with insufficient funds
     * @dev Verifies that spin fails when user doesn't have enough fee tokens
     */
    function testSpinFailsWithInsufficientFunds() public {
        address poorSpinner = makeAddr("poorSpinner");

        // Don't fund the poor gameSpinner
        vm.prank(poorSpinner);
        vm.expectRevert(); // Should fail due to insufficient funds
        gacha.spin(MAX_SPIN_FEE);
    }

    /**
     * @notice Test spin when contract is paused
     * @dev Verifies that spins fail when contract is paused
     */
    function testSpinFailsWhenPaused() public {
        // Pause contract
        vm.prank(gachaOwner);
        gacha.emergencyPause();

        vm.prank(gameSpinner);
        vm.expectRevert(); // Should fail due to pause
        gacha.spin(MAX_SPIN_FEE);
    }

    /**
     * @notice Test spin with max fee limit
     * @dev Verifies that spin respects max fee parameter
     */
    function testSpinWithMaxFee() public {
        _depositNFTsForSpins();

        uint256 currentFee = gacha.getCurrentSpinFee();

        // Set a very low max fee
        vm.prank(gameSpinner);
        vm.expectRevert(abi.encodeWithSelector(Gacha.MaxFeeExceeded.selector, currentFee, currentFee - 1));
        gacha.spin(currentFee - 1);
    }

    // ========================================================================
    // RANDOMNESS FULFILLMENT TESTS
    // ========================================================================

    /**
     * @notice Test randomness fulfillment
     * @dev Verifies that spin can be fulfilled with randomness
     */
    function testFulfillRandomness() public {
        // Deposit NFTs
        _depositNFTsForSpins();

        // Create spin
        uint256 triggerId = testSpin();

        // Generate randomness
        bytes32 randomness = bytes32(uint256(12345));

        // Fulfill spin
        vm.prank(address(serviceHandler));
        gacha.fulfillRandomness(triggerId, randomness);

        // Verify spin was completed
        (,,, uint32 statusFlags) = gacha.spinRequests(triggerId);
        assertEq(statusFlags & 1, 1, "Fulfilled flag should be set");
    }

    /**
     * @notice Test fulfillment with invalid trigger ID
     * @dev Verifies that invalid trigger IDs are rejected
     */
    function testFulfillRandomnessFailsWithInvalidTriggerId() public {
        bytes32 randomness = bytes32(uint256(12345));

        vm.prank(address(serviceHandler));
        vm.expectRevert(abi.encodeWithSelector(Gacha.InvalidTriggerId.selector));
        gacha.fulfillRandomness(999, randomness);
    }

    /**
     * @notice Test double fulfillment
     * @dev Verifies that already fulfilled spins cannot be fulfilled again
     */
    function testFulfillRandomnessFailsWhenAlreadyFulfilled() public {
        _depositNFTsForSpins();

        uint256 triggerId = testSpin();
        bytes32 randomness = bytes32(uint256(12345));

        // First fulfillment
        vm.prank(address(serviceHandler));
        gacha.fulfillRandomness(triggerId, randomness);

        // Try to fulfill again
        vm.prank(address(serviceHandler));
        vm.expectRevert(abi.encodeWithSelector(Gacha.AlreadyFulfilled.selector));
        gacha.fulfillRandomness(triggerId, randomness);
    }

    /**
     * @notice Test unauthorized fulfillment
     * @dev Verifies that only service handler can fulfill randomness
     */
    function testFulfillRandomnessFailsWithUnauthorizedHandler() public {
        _depositNFTsForSpins();

        uint256 triggerId = testSpin();
        bytes32 randomness = bytes32(uint256(12345));

        vm.prank(gameSpinner);
        vm.expectRevert(abi.encodeWithSelector(Gacha.UnauthorizedServiceHandler.selector));
        gacha.fulfillRandomness(triggerId, randomness);
    }

    // ========================================================================
    // TIMEOUT AND RECLAMATION TESTS
    // ========================================================================

    /**
     * @notice Test reclaiming failed spin
     * @dev Verifies that timed-out spins can be reclaimed
     */
    function testReclaimFailedSpin() public {
        _depositNFTsForSpins();

        // Create spin
        uint256 triggerId = testSpin();

        // Advance time past timeout
        vm.warp(block.timestamp + 301 seconds);

        // Reclaim spin
        vm.prank(gameSpinner);
        gacha.reclaimFailedSpin(triggerId);

        // Verify reclaim
        (,,, uint32 statusFlags) = gacha.spinRequests(triggerId);
        assertEq((statusFlags >> 1) & 1, 1, "Reclaimed flag should be set");
        assertEq(gacha.userReclaimCount(gameSpinner), 1, "User reclaim count should be 1");
        assertEq(gacha.totalReclaimCount(), 1, "Total reclaim count should be 1");
    }

    /**
     * @notice Test reclaim before timeout
     * @dev Verifies that spins cannot be reclaimed before timeout
     */
    function testReclaimFailsBeforeTimeout() public {
        _depositNFTsForSpins();

        uint256 triggerId = testSpin();

        // Try to reclaim immediately (before timeout)
        vm.prank(gameSpinner);
        vm.expectRevert(abi.encodeWithSelector(Gacha.SpinRequestNotExpired.selector));
        gacha.reclaimFailedSpin(triggerId);
    }

    /**
     * @notice Test reclaiming already fulfilled spin
     * @dev Verifies that fulfilled spins cannot be reclaimed
     */
    function testReclaimFailsForFulfilledSpin() public {
        _depositNFTsForSpins();

        uint256 triggerId = testSpin();
        bytes32 randomness = bytes32(uint256(12345));

        // Fulfill spin
        vm.prank(address(serviceHandler));
        gacha.fulfillRandomness(triggerId, randomness);

        // Try to reclaim
        vm.prank(gameSpinner);
        vm.expectRevert(abi.encodeWithSelector(Gacha.CannotReclaimFulfilledSpin.selector));
        gacha.reclaimFailedSpin(triggerId);
    }

    /**
     * @notice Test reclaiming already reclaimed spin
     * @dev Verifies that reclaimed spins cannot be reclaimed again.
     *      When a spin is reclaimed, it's also marked as fulfilled (with refund)
     *      so attempting to reclaim again triggers CannotReclaimFulfilledSpin
     */
    function testReclaimFailsForAlreadyReclaimedSpin() public {
        _depositNFTsForSpins();

        uint256 triggerId = testSpin();

        // Advance time and reclaim
        vm.warp(block.timestamp + 301 seconds);
        vm.prank(gameSpinner);
        gacha.reclaimFailedSpin(triggerId);

        // Try to reclaim again
        // Note: reclaimed spins are marked as fulfilled, so this fails with fulfilled error
        vm.prank(gameSpinner);
        vm.expectRevert(abi.encodeWithSelector(Gacha.CannotReclaimFulfilledSpin.selector));
        gacha.reclaimFailedSpin(triggerId);
    }

    /**
     * @notice Test unauthorized reclaim
     * @dev Verifies that only requester can reclaim their spin
     */
    function testReclaimFailsForUnauthorizedUser() public {
        _depositNFTsForSpins();

        uint256 triggerId = testSpin();

        // Advance time past timeout
        vm.warp(block.timestamp + 301 seconds);

        // Different user tries to reclaim
        address attacker = makeAddr("attacker");
        vm.prank(attacker);
        vm.expectRevert(abi.encodeWithSelector(Gacha.NotSpinRequester.selector));
        gacha.reclaimFailedSpin(triggerId);
    }

    // ========================================================================
    // PRICING TESTS
    // ========================================================================

    /**
     * @notice Test getting current spin fee
     * @dev Verifies that spin fee is calculated correctly
     */
    function testGetCurrentSpinFee() public view {
        uint256 fee = gacha.getCurrentSpinFee();
        assertTrue(fee >= MIN_SPIN_FEE, "Fee should be at least minimum");
    }

    /**
     * @notice Test setting pricing config
     * @dev Verifies that owner can update pricing configuration
     */
    function testSetPricingConfig() public {
        uint256 newPremiumBps = 200; // 2%
        uint256 newMinFee = 0.02 ether;
        uint256 newMaxFee = 0.2 ether;

        vm.prank(gachaOwner);
        gacha.setPricingConfig(newPremiumBps, newMinFee, newMaxFee);

        assertEq(gacha.pricingPremiumBps(), newPremiumBps, "Premium should be updated");
        assertEq(gacha.minSpinFee(), newMinFee, "Min fee should be updated");
        assertEq(gacha.maxSpinFee(), newMaxFee, "Max fee should be updated");
    }

    // ========================================================================
    // ACCESS CONTROL TESTS
    // ========================================================================

    /**
     * @notice Test setting service handler
     * @dev Verifies that owner can update service handler
     */
    function testSetGachaServiceHandler() public {
        address newHandler = makeAddr("newHandler");

        vm.prank(gachaOwner);
        gacha.setGachaServiceHandler(newHandler);

        assertEq(gacha.gachaServiceHandler(), newHandler, "Handler should be updated");
    }

    /**
     * @notice Test emergency pause
     * @dev Verifies that contract can be paused
     */
    function testEmergencyPause() public {
        assertFalse(gacha.paused(), "Contract should not be paused initially");

        vm.prank(gachaOwner);
        gacha.emergencyPause();

        assertTrue(gacha.paused(), "Contract should be paused");
    }

    /**
     * @notice Test emergency unpause
     * @dev Verifies that contract can be unpaused
     */
    function testEmergencyUnpause() public {
        // Pause first
        vm.prank(gachaOwner);
        gacha.emergencyPause();

        assertTrue(gacha.paused(), "Contract should be paused");

        // Unpause
        vm.prank(gachaOwner);
        gacha.emergencyUnpause();

        assertFalse(gacha.paused(), "Contract should be unpaused");
    }

    /**
     * @notice Test unauthorized pause
     * @dev Verifies that only owner can pause
     */
    function testEmergencyPauseFailsWithUnauthorizedUser() public {
        vm.prank(gameSpinner);
        vm.expectRevert();
        gacha.emergencyPause();
    }

    // ========================================================================
    // VIEW FUNCTION TESTS
    // ========================================================================

    /**
     * @notice Test get next trigger ID
     * @dev Verifies that next trigger ID is calculated correctly
     */
    function testGetNextTriggerId() public {
        uint256 nextId = gacha.getNextTriggerId();
        assertTrue(nextId == 0 || nextId == 1, "Initial next ID should be 0 or 1");

        // Create a spin
        _depositNFTsForSpins();
        uint256 fee = gacha.getCurrentSpinFee();
        vm.prank(gameSpinner);
        feeToken.approve(address(gacha), fee);
        vm.prank(gameSpinner);
        gacha.spin(MAX_SPIN_FEE);

        // Next ID should be incremented
        uint256 nextIdAfter = gacha.getNextTriggerId();
        assertEq(nextIdAfter, nextId + 1, "Next ID should be incremented");
    }

    /**
     * @notice Test get user spin count
     * @dev Verifies that user spin count is tracked correctly.
     *      userSpinCount is incremented when randomness is fulfilled, not when spin is created
     */
    function testGetUserSpinCount() public {
        uint256 initialCount = gacha.getUserSpinCount(gameSpinner);
        assertTrue(initialCount == 0 || initialCount == 1, "Initial count should be 0 or 1");

        _depositNFTsForSpins();
        uint256 fee = gacha.getCurrentSpinFee();
        vm.prank(gameSpinner);
        feeToken.approve(address(gacha), fee);
        vm.prank(gameSpinner);
        uint256 triggerId = gacha.spin(MAX_SPIN_FEE);

        // Count doesn't increment until randomness is fulfilled
        uint256 countAfterSpin = gacha.getUserSpinCount(gameSpinner);
        assertEq(countAfterSpin, initialCount, "Count should not increment until fulfilled");

        // Fulfill the spin
        vm.prank(address(serviceHandler));
        gacha.fulfillRandomness(triggerId, bytes32(uint256(12345)));

        // Now count should be incremented
        uint256 finalCount = gacha.getUserSpinCount(gameSpinner);
        assertTrue(finalCount == initialCount + 1, "Count should be incremented after fulfillment");
    }

    /**
     * @notice Test get treasury distribution
     * @dev Verifies that treasury distribution is calculated correctly
     */
    function testGetTreasuryDistribution() public view {
        uint256[] memory distribution = gacha.getTreasuryDistribution();

        // Should have 5 elements (one per rarity)
        assertEq(distribution.length, 5, "Distribution should have 5 elements");
    }

    // ========================================================================
    // HELPER FUNCTIONS
    // ========================================================================

    // Track if NFTs have been deposited
    bool private _nftDeposited;

    /**
     * @notice Deposit NFTs to treasury to make spins available
     * @dev Helper function to deposit one NFT of each rarity (only once)
     */
    function _depositNFTsForSpins() internal {
        if (_nftDeposited) return;

        vm.startPrank(treasuryOwner);

        // Whitelist collection (only once)
        treasury.addToWhitelist(address(nft));

        // Deposit one NFT of each rarity
        uint256[] memory prices = new uint256[](5);
        prices[0] = TestConstants.COMMON_PRICE;
        prices[1] = TestConstants.UNCOMMON_PRICE;
        prices[2] = TestConstants.RARE_PRICE;
        prices[3] = TestConstants.EPIC_PRICE;
        prices[4] = TestConstants.LEGENDARY_PRICE;

        for (uint256 i = 0; i < 5; i++) {
            uint256 tokenId = nft.mint(treasuryOwner);
            nft.approve(address(treasury), tokenId);
            mockAppraisal.setMockAppraisal(address(nft), tokenId, prices[i]);
            treasury.depositNFT(address(nft), tokenId);
        }

        vm.stopPrank();
        _nftDeposited = true;
    }
}
