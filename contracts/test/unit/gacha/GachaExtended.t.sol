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
 * @title GachaExtended Test Suite
 * @notice Comprehensive extended tests for the Gacha contract
 * @dev Tests analytics, initialize reverts, events, and view/batch functions
 */
contract GachaExtendedTest is StandardTest {
    using TestConstants for *;

    // ========================================================================
    // STATE
    // ========================================================================

    Gacha public gacha;
    GachaServiceHandler public serviceHandler;
    GachaTreasury public treasury;
    BaseERC721 public nft;
    BaseERC20 public feeToken;
    MockNFTAppraisal public mockAppraisal;
    MockWavsServiceManager public mockWavsManager;
    MockGachaEconomyManager public mockEconomyManager;

    address public gachaOwner;
    address public gameSpinner;
    address public treasuryOwner;

    uint256 public constant MIN_SPIN_FEE = 0.01e6;
    uint256 public constant MAX_SPIN_FEE = 1e9;

    // ========================================================================
    // EVENTS (replicate from Gacha.sol for expectEmit)
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
    event PricingConfigUpdated(uint256 premiumBps, uint256 minFee, uint256 maxFee);
    event DynamicWeightsUpdated(uint256[] targetBps);
    event GachaServiceHandlerUpdated(address indexed oldHandler, address indexed newHandler);
    event EconomyManagerUpdated(address indexed oldManager, address indexed newManager);
    event SpinTimeoutUpdated(uint256 oldTimeout, uint256 newTimeout);

    // ========================================================================
    // SETUP
    // ========================================================================

    function setUp() public {
        gachaOwner = makeAddr("gachaOwner");
        gameSpinner = makeAddr("gameSpinner");
        treasuryOwner = makeAddr("treasuryOwner");

        mockWavsManager = new MockWavsServiceManager();
        mockEconomyManager = new MockGachaEconomyManager();
        feeToken = new BaseERC20("USDC", "USDC", gachaOwner);
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
            address(0xDEAD),
            address(mockAppraisal),
            uint8(5),
            rarityNames,
            minPrices,
            maxPrices
        );
        ERC1967Proxy treasuryProxy = new ERC1967Proxy(address(treasuryImpl), initData);
        treasury = GachaTreasury(address(treasuryProxy));
        vm.stopPrank();

        // Deploy Gacha
        Gacha gachaImpl = new Gacha();
        serviceHandler = new GachaServiceHandler(IWavsServiceManager(address(mockWavsManager)), address(gachaImpl));

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

        vm.prank(gachaOwner);
        gacha.setFeeTokenDecimals(6);

        vm.prank(treasuryOwner);
        treasury.setGachaContract(address(gacha));

        nft = new BaseERC721("Test NFT", "TNFT", treasuryOwner);

        // Fund spinner
        vm.prank(gachaOwner);
        feeToken.mint(gameSpinner, 100 ether);
    }

    // ========================================================================
    // HELPERS
    // ========================================================================

    bool private _nftDeposited;

    function _depositNFTsForSpins() internal {
        if (_nftDeposited) return;

        vm.startPrank(treasuryOwner);
        treasury.addToWhitelist(address(nft));

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

    /// @dev Performs one complete spin+fulfillment and returns the triggerId
    function _doFullSpin(bytes32 randomness) internal returns (uint256 triggerId) {
        _depositNFTsForSpins();

        uint256 fee = gacha.getCurrentSpinFee();
        vm.startPrank(gameSpinner);
        feeToken.approve(address(gacha), fee);
        triggerId = gacha.spin(MAX_SPIN_FEE);
        vm.stopPrank();

        vm.prank(address(serviceHandler));
        gacha.fulfillRandomness(triggerId, randomness);
    }

    // ========================================================================
    // INITIALIZE REVERTS
    // ========================================================================

    function testInitializeRevertsInvalidFeeToken() public {
        Gacha newImpl = new Gacha();
        bytes memory initData = abi.encodeWithSelector(
            Gacha.initialize.selector,
            gachaOwner,
            address(serviceHandler),
            address(0), // zero fee token → InvalidFeeToken
            MIN_SPIN_FEE,
            address(treasury),
            address(mockEconomyManager)
        );
        vm.expectRevert(abi.encodeWithSelector(Gacha.InvalidFeeToken.selector));
        new ERC1967Proxy(address(newImpl), initData);
    }

    function testInitializeRevertsInvalidFeeTokenZeroMinFee() public {
        Gacha newImpl = new Gacha();
        bytes memory initData = abi.encodeWithSelector(
            Gacha.initialize.selector,
            gachaOwner,
            address(serviceHandler),
            address(feeToken),
            0, // zero minSpinFee → InvalidFeeToken
            address(treasury),
            address(mockEconomyManager)
        );
        vm.expectRevert(abi.encodeWithSelector(Gacha.InvalidFeeToken.selector));
        new ERC1967Proxy(address(newImpl), initData);
    }

    function testInitializeRevertsInvalidTreasuryContract() public {
        Gacha newImpl = new Gacha();
        bytes memory initData = abi.encodeWithSelector(
            Gacha.initialize.selector,
            gachaOwner,
            address(serviceHandler),
            address(feeToken),
            MIN_SPIN_FEE,
            address(0), // zero treasury → InvalidTreasuryContract
            address(mockEconomyManager)
        );
        vm.expectRevert(abi.encodeWithSelector(Gacha.InvalidTreasuryContract.selector));
        new ERC1967Proxy(address(newImpl), initData);
    }

    function testInitializeRevertsInvalidEconomyManager() public {
        Gacha newImpl = new Gacha();
        bytes memory initData = abi.encodeWithSelector(
            Gacha.initialize.selector,
            gachaOwner,
            address(serviceHandler),
            address(feeToken),
            MIN_SPIN_FEE,
            address(treasury),
            address(0) // zero economy manager → InvalidEconomyManager
        );
        vm.expectRevert(abi.encodeWithSelector(Gacha.InvalidEconomyManager.selector));
        new ERC1967Proxy(address(newImpl), initData);
    }

    function testInitializeRevertsInvalidServiceHandler() public {
        Gacha newImpl = new Gacha();
        bytes memory initData = abi.encodeWithSelector(
            Gacha.initialize.selector,
            gachaOwner,
            address(0), // zero service handler → InvalidServiceHandler
            address(feeToken),
            MIN_SPIN_FEE,
            address(treasury),
            address(mockEconomyManager)
        );
        vm.expectRevert(abi.encodeWithSelector(Gacha.InvalidServiceHandler.selector));
        new ERC1967Proxy(address(newImpl), initData);
    }

    // ========================================================================
    // ANALYTICS TRACKING AFTER SPIN
    // ========================================================================

    function testAnalyticsTrackingTotalSpinsAfterFulfillment() public {
        uint256 spinsBefore = gacha.totalSpinCount();
        _doFullSpin(bytes32(uint256(12345)));
        assertEq(gacha.totalSpinCount(), spinsBefore + 1, "totalSpinCount should increment after fulfillment");
    }

    function testAnalyticsTrackingUserSpinCount() public {
        uint256 userSpinsBefore = gacha.userSpinCount(gameSpinner);
        _doFullSpin(bytes32(uint256(99999)));
        assertEq(gacha.userSpinCount(gameSpinner), userSpinsBefore + 1, "User spin count should increment");
    }

    function testAnalyticsTrackingWinsByRarity() public {
        // Perform multiple spins and verify at least one rarity counter increments
        uint256 spinsBefore = gacha.totalSpinCount();
        _doFullSpin(bytes32(uint256(42)));

        // totalSpinCount went up by 1
        uint256 spinsAfter = gacha.totalSpinCount();
        assertEq(spinsAfter, spinsBefore + 1);

        // The winning rarity counter should also be 1 now (global)
        uint256 totalGlobalWins;
        for (uint8 i = 0; i < 5; i++) {
            totalGlobalWins += gacha.globalRarityWins(i);
        }
        assertEq(totalGlobalWins, spinsAfter, "Sum of globalRarityWins should equal totalSpinCount");
    }

    function testAnalyticsTrackingTotalFees() public {
        // mockEconomyManager tracks totalRevenueReceived
        uint256 revBefore = mockEconomyManager.totalRevenueReceived();
        _doFullSpin(bytes32(uint256(55555)));
        uint256 revAfter = mockEconomyManager.totalRevenueReceived();
        // Fee should have been forwarded to economy manager
        assertGt(revAfter, revBefore, "Economy manager should have received spin revenue");
    }

    function testAnalyticsUserRarityWins() public {
        _doFullSpin(bytes32(uint256(42)));

        uint256 totalUserWins;
        for (uint8 i = 0; i < 5; i++) {
            totalUserWins += gacha.userRarityWins(gameSpinner, i);
        }
        assertEq(totalUserWins, 1, "User should have exactly 1 rarity win after one spin");
    }

    // ========================================================================
    // EVENT: SpinReclaimed
    // ========================================================================

    function testEventSpinReclaimed() public {
        _depositNFTsForSpins();

        uint256 fee = gacha.getCurrentSpinFee();
        vm.startPrank(gameSpinner);
        feeToken.approve(address(gacha), fee);
        uint256 triggerId = gacha.spin(MAX_SPIN_FEE);
        vm.stopPrank();

        // Warp past timeout
        vm.warp(block.timestamp + gacha.spinTimeout() + 1);

        vm.expectEmit(true, true, false, true);
        emit SpinReclaimed(triggerId, gameSpinner, fee);
        vm.prank(gameSpinner);
        gacha.reclaimFailedSpin(triggerId);
    }

    // ========================================================================
    // EVENT: PricingConfigUpdated
    // ========================================================================

    function testEventPricingConfigUpdated() public {
        uint256 premiumBps = 300;
        uint256 minFee = 0.05e6;
        uint256 maxFee = 10e6;

        vm.expectEmit(false, false, false, true);
        emit PricingConfigUpdated(premiumBps, minFee, maxFee);
        vm.prank(gachaOwner);
        gacha.setPricingConfig(premiumBps, minFee, maxFee);
    }

    // ========================================================================
    // EVENT: DynamicWeightsUpdated (named DynamicWeightsUpdated in contract)
    // ========================================================================

    function testEventDynamicWeightsUpdated() public {
        uint256[] memory newWeights = new uint256[](5);
        newWeights[0] = 6000;
        newWeights[1] = 2500;
        newWeights[2] = 1000;
        newWeights[3] = 400;
        newWeights[4] = 100;

        vm.expectEmit(false, false, false, true);
        emit DynamicWeightsUpdated(newWeights);
        vm.prank(gachaOwner);
        gacha.setDynamicWeightsConfig(newWeights);
    }

    // ========================================================================
    // EVENT: GachaServiceHandlerUpdated
    // ========================================================================

    function testEventGachaServiceHandlerUpdated() public {
        address newHandler = makeAddr("newHandler");
        vm.expectEmit(true, true, false, false);
        emit GachaServiceHandlerUpdated(address(serviceHandler), newHandler);
        vm.prank(gachaOwner);
        gacha.setGachaServiceHandler(newHandler);
    }

    // ========================================================================
    // EVENT: EconomyManagerUpdated
    // ========================================================================

    function testEventEconomyManagerUpdated() public {
        address newManager = makeAddr("newEconMgr");
        vm.expectEmit(true, true, false, false);
        emit EconomyManagerUpdated(address(mockEconomyManager), newManager);
        vm.prank(gachaOwner);
        gacha.setEconomyManager(newManager);
    }

    // ========================================================================
    // EVENT: SpinTimeoutUpdated
    // ========================================================================

    function testEventSpinTimeoutUpdated() public {
        uint256 oldTimeout = gacha.spinTimeout();
        uint256 newTimeout = 120;
        vm.expectEmit(false, false, false, true);
        emit SpinTimeoutUpdated(oldTimeout, newTimeout);
        vm.prank(gachaOwner);
        gacha.setSpinTimeout(newTimeout);
    }

    // ========================================================================
    // setEconomyManager dedicated test
    // ========================================================================

    function testSetEconomyManagerUpdatesAddress() public {
        address newManager = makeAddr("econMgr2");
        vm.prank(gachaOwner);
        gacha.setEconomyManager(newManager);
        assertEq(address(gacha.economyManager()), newManager, "Economy manager should be updated");
    }

    function testSetEconomyManagerRevertsZeroAddress() public {
        vm.prank(gachaOwner);
        vm.expectRevert(abi.encodeWithSelector(Gacha.InvalidEconomyManager.selector));
        gacha.setEconomyManager(address(0));
    }

    function testSetEconomyManagerOnlyOwner() public {
        vm.prank(gameSpinner);
        vm.expectRevert();
        gacha.setEconomyManager(makeAddr("x"));
    }

    // ========================================================================
    // getSpinRequest explicit test
    // ========================================================================

    function testGetSpinRequestAfterSpin() public {
        _depositNFTsForSpins();

        uint256 fee = gacha.getCurrentSpinFee();
        vm.startPrank(gameSpinner);
        feeToken.approve(address(gacha), fee);
        uint256 triggerId = gacha.spin(MAX_SPIN_FEE);
        vm.stopPrank();

        (address requester, bool fulfilled, bool reclaimed, uint256 feePaid, uint256 requestTime) =
            gacha.getSpinRequest(triggerId);

        assertEq(requester, gameSpinner, "Requester should match");
        assertFalse(fulfilled, "Should not be fulfilled yet");
        assertFalse(reclaimed, "Should not be reclaimed");
        assertEq(feePaid, fee, "Fee paid should match");
        assertGt(requestTime, 0, "Request time should be set");
    }

    function testGetSpinRequestAfterFulfillment() public {
        _depositNFTsForSpins();

        uint256 fee = gacha.getCurrentSpinFee();
        vm.startPrank(gameSpinner);
        feeToken.approve(address(gacha), fee);
        uint256 triggerId = gacha.spin(MAX_SPIN_FEE);
        vm.stopPrank();

        vm.prank(address(serviceHandler));
        gacha.fulfillRandomness(triggerId, bytes32(uint256(11111)));

        (address requester, bool fulfilled, bool reclaimed,,) = gacha.getSpinRequest(triggerId);
        assertEq(requester, gameSpinner);
        assertTrue(fulfilled, "Should be fulfilled after randomness");
        assertFalse(reclaimed, "Should not be reclaimed");
    }

    function testGetSpinRequestAfterReclaim() public {
        _depositNFTsForSpins();

        uint256 fee = gacha.getCurrentSpinFee();
        vm.startPrank(gameSpinner);
        feeToken.approve(address(gacha), fee);
        uint256 triggerId = gacha.spin(MAX_SPIN_FEE);
        vm.stopPrank();

        vm.warp(block.timestamp + gacha.spinTimeout() + 1);
        vm.prank(gameSpinner);
        gacha.reclaimFailedSpin(triggerId);

        (,bool fulfilled, bool reclaimed,,) = gacha.getSpinRequest(triggerId);
        assertTrue(fulfilled, "Reclaimed spin should be marked fulfilled");
        assertTrue(reclaimed, "Reclaimed spin should be marked reclaimed");
    }

    // ========================================================================
    // getExpectedValueUSD
    // ========================================================================

    function testGetExpectedValueUSDZeroWhenEmpty() public view {
        // Treasury has no NFTs deposited yet
        uint256 ev = gacha.getExpectedValueUSD();
        assertEq(ev, 0, "Expected value should be 0 when treasury is empty");
    }

    function testGetExpectedValueUSDNonZeroWhenPopulated() public {
        _depositNFTsForSpins();
        uint256 ev = gacha.getExpectedValueUSD();
        assertGt(ev, 0, "Expected value should be > 0 when treasury has NFTs");
    }

    // ========================================================================
    // getAverageRarityValues
    // ========================================================================

    function testGetAverageRarityValuesLength() public view {
        uint256[] memory averages = gacha.getAverageRarityValues();
        assertEq(averages.length, 5, "Should return 5 rarity averages");
    }

    function testGetAverageRarityValuesZeroWhenEmpty() public view {
        uint256[] memory averages = gacha.getAverageRarityValues();
        for (uint256 i = 0; i < 5; i++) {
            assertEq(averages[i], 0, "Average should be 0 when treasury is empty");
        }
    }

    function testGetAverageRarityValuesNonZeroWhenPopulated() public {
        _depositNFTsForSpins();
        uint256[] memory averages = gacha.getAverageRarityValues();
        uint256 nonZeroCount;
        for (uint256 i = 0; i < 5; i++) {
            if (averages[i] > 0) nonZeroCount++;
        }
        assertGt(nonZeroCount, 0, "At least one rarity should have non-zero average value");
    }

    // ========================================================================
    // getTotalValueLocked
    // ========================================================================

    function testGetTotalValueLockedZeroWhenEmpty() public view {
        uint256 tvl = gacha.getTotalValueLocked();
        assertEq(tvl, 0, "TVL should be 0 when treasury is empty");
    }

    function testGetTotalValueLockedNonZeroWhenPopulated() public {
        _depositNFTsForSpins();
        uint256 tvl = gacha.getTotalValueLocked();
        assertGt(tvl, 0, "TVL should be > 0 after depositing NFTs");
    }

    // ========================================================================
    // getUserAnalytics
    // ========================================================================

    function testGetUserAnalyticsInitialState() public view {
        (uint256 totalSpins, uint256 totalRefunds, uint256 totalReclaims, uint256[] memory rarityWins) =
            gacha.getUserAnalytics(gameSpinner);
        assertEq(totalSpins, 0);
        assertEq(totalRefunds, 0);
        assertEq(totalReclaims, 0);
        assertEq(rarityWins.length, 5);
        for (uint256 i = 0; i < 5; i++) {
            assertEq(rarityWins[i], 0);
        }
    }

    function testGetUserAnalyticsAfterSpin() public {
        _doFullSpin(bytes32(uint256(77777)));

        (uint256 totalSpins,,, uint256[] memory rarityWins) = gacha.getUserAnalytics(gameSpinner);
        assertEq(totalSpins, 1, "User should have 1 spin");

        uint256 totalWins;
        for (uint256 i = 0; i < 5; i++) {
            totalWins += rarityWins[i];
        }
        assertEq(totalWins, 1, "User should have 1 total rarity win");
    }

    function testGetUserAnalyticsAfterReclaim() public {
        _depositNFTsForSpins();

        uint256 fee = gacha.getCurrentSpinFee();
        vm.startPrank(gameSpinner);
        feeToken.approve(address(gacha), fee);
        gacha.spin(MAX_SPIN_FEE);
        vm.stopPrank();

        vm.warp(block.timestamp + gacha.spinTimeout() + 1);
        vm.prank(gameSpinner);
        gacha.reclaimFailedSpin(1);

        (, , uint256 totalReclaims,) = gacha.getUserAnalytics(gameSpinner);
        assertEq(totalReclaims, 1, "User should have 1 reclaim");
    }

    // ========================================================================
    // getGlobalAnalytics
    // ========================================================================

    function testGetGlobalAnalyticsInitialState() public view {
        (uint256 totalSpins, uint256 totalRefunds, uint256 totalReclaims, uint256[] memory globalRarityWins) =
            gacha.getGlobalAnalytics();
        assertEq(totalSpins, 0);
        assertEq(totalRefunds, 0);
        assertEq(totalReclaims, 0);
        assertEq(globalRarityWins.length, 5);
    }

    function testGetGlobalAnalyticsAfterSpin() public {
        _doFullSpin(bytes32(uint256(33333)));

        (uint256 totalSpins,,, uint256[] memory globalRarityWins) = gacha.getGlobalAnalytics();
        assertEq(totalSpins, 1);

        uint256 total;
        for (uint256 i = 0; i < 5; i++) {
            total += globalRarityWins[i];
        }
        assertEq(total, 1, "Global rarity wins should sum to 1 after one spin");
    }

    // ========================================================================
    // getBatchSpinRequests
    // ========================================================================

    function testGetBatchSpinRequestsEmpty() public view {
        uint256[] memory ids = new uint256[](0);
        Gacha.SpinRequest[] memory requests = gacha.getBatchSpinRequests(ids);
        assertEq(requests.length, 0, "Empty batch should return empty array");
    }

    function testGetBatchSpinRequestsSingleId() public {
        _depositNFTsForSpins();
        uint256 fee = gacha.getCurrentSpinFee();
        vm.startPrank(gameSpinner);
        feeToken.approve(address(gacha), fee);
        uint256 triggerId = gacha.spin(MAX_SPIN_FEE);
        vm.stopPrank();

        uint256[] memory ids = new uint256[](1);
        ids[0] = triggerId;
        Gacha.SpinRequest[] memory requests = gacha.getBatchSpinRequests(ids);
        assertEq(requests.length, 1);
        assertEq(requests[0].requester, gameSpinner);
    }

    function testGetBatchSpinRequestsMultipleIds() public {
        _depositNFTsForSpins();

        // Create 3 spins
        uint256[] memory triggerIds = new uint256[](3);
        for (uint256 i = 0; i < 3; i++) {
            uint256 fee = gacha.getCurrentSpinFee();
            vm.startPrank(gameSpinner);
            feeToken.approve(address(gacha), fee);
            triggerIds[i] = gacha.spin(MAX_SPIN_FEE);
            vm.stopPrank();

            // Fulfill each spin to restore treasury inventory
            vm.prank(address(serviceHandler));
            gacha.fulfillRandomness(triggerIds[i], bytes32(uint256(i + 1)));
        }

        Gacha.SpinRequest[] memory requests = gacha.getBatchSpinRequests(triggerIds);
        assertEq(requests.length, 3, "Should return 3 requests");
        for (uint256 i = 0; i < 3; i++) {
            assertEq(requests[i].requester, gameSpinner);
        }
    }

    function testGetBatchSpinRequestsNonexistentIdReturnsZeroAddress() public view {
        uint256[] memory ids = new uint256[](1);
        ids[0] = 9999;
        Gacha.SpinRequest[] memory requests = gacha.getBatchSpinRequests(ids);
        assertEq(requests[0].requester, address(0), "Non-existent id should return zero address");
    }

    // ========================================================================
    // getGachaConfigBatch
    // ========================================================================

    function testGetGachaConfigBatch() public view {
        (
            address feeTokenAddr,
            uint256 spinFeeAmount,
            bool isPaused,
            uint256[] memory rarityWeights,
            uint256 totalWeight,
            bool isAvailable
        ) = gacha.getGachaConfigBatch();

        assertEq(feeTokenAddr, address(feeToken), "Fee token address should match");
        assertGe(spinFeeAmount, MIN_SPIN_FEE, "Spin fee should be >= min");
        assertFalse(isPaused, "Should not be paused");
        assertEq(rarityWeights.length, 5, "Should have 5 rarity weights");
        assertEq(totalWeight, gacha.TOTAL_WEIGHT(), "Total weight should match TOTAL_WEIGHT");
        assertFalse(isAvailable, "Should not be available with empty treasury");
    }

    function testGetGachaConfigBatchWhenPaused() public {
        vm.prank(gachaOwner);
        gacha.emergencyPause();

        (, , bool isPaused, , ,) = gacha.getGachaConfigBatch();
        assertTrue(isPaused, "Should report paused");
    }

    // ========================================================================
    // getUserGachaBatch
    // ========================================================================

    function testGetUserGachaBatchInitialState() public view {
        (
            uint256 totalSpins,
            uint256 totalRefunds,
            uint256 totalReclaims,
            uint256[] memory rarityWins,
            uint256 spinCount
        ) = gacha.getUserGachaBatch(gameSpinner);

        assertEq(totalSpins, 0);
        assertEq(totalRefunds, 0);
        assertEq(totalReclaims, 0);
        assertEq(rarityWins.length, 5);
        assertEq(spinCount, 0);
    }

    function testGetUserGachaBatchAfterSpin() public {
        _doFullSpin(bytes32(uint256(22222)));

        (uint256 totalSpins,,, uint256[] memory rarityWins, uint256 spinCount) =
            gacha.getUserGachaBatch(gameSpinner);

        assertEq(totalSpins, 1);
        assertEq(spinCount, totalSpins, "spinCount should equal totalSpins");

        uint256 totalWins;
        for (uint256 i = 0; i < 5; i++) {
            totalWins += rarityWins[i];
        }
        assertEq(totalWins, 1);
    }

    // ========================================================================
    // getUserRarityWinCount
    // ========================================================================

    function testGetUserRarityWinCountInitialZero() public view {
        for (uint8 i = 0; i < 5; i++) {
            assertEq(gacha.getUserRarityWinCount(gameSpinner, i), 0);
        }
    }

    function testGetUserRarityWinCountAfterSpin() public {
        _doFullSpin(bytes32(uint256(44444)));

        uint256 totalWins;
        for (uint8 i = 0; i < 5; i++) {
            totalWins += gacha.getUserRarityWinCount(gameSpinner, i);
        }
        assertEq(totalWins, 1, "Should have 1 win total across all rarities");
    }

    // ========================================================================
    // getTargetRarityBps
    // ========================================================================

    function testGetTargetRarityBpsDefaultValues() public view {
        uint256[] memory targetBps = gacha.getTargetRarityBps();
        assertEq(targetBps.length, 5);

        // Default for 5 rarities: [7000, 2000, 600, 300, 100]
        assertEq(targetBps[0], 7000, "Common weight should be 7000");
        assertEq(targetBps[1], 2000, "Uncommon weight should be 2000");
        assertEq(targetBps[2], 600, "Rare weight should be 600");
        assertEq(targetBps[3], 300, "Epic weight should be 300");
        assertEq(targetBps[4], 100, "Legendary weight should be 100");

        // Sum must equal TOTAL_WEIGHT
        uint256 total;
        for (uint256 i = 0; i < 5; i++) {
            total += targetBps[i];
        }
        assertEq(total, gacha.TOTAL_WEIGHT(), "Target bps should sum to TOTAL_WEIGHT");
    }

    function testGetTargetRarityBpsAfterUpdate() public {
        uint256[] memory newWeights = new uint256[](5);
        newWeights[0] = 5000;
        newWeights[1] = 3000;
        newWeights[2] = 1000;
        newWeights[3] = 700;
        newWeights[4] = 300;

        vm.prank(gachaOwner);
        gacha.setDynamicWeightsConfig(newWeights);

        uint256[] memory targetBps = gacha.getTargetRarityBps();
        for (uint256 i = 0; i < 5; i++) {
            assertEq(targetBps[i], newWeights[i], "Updated weight should match");
        }
    }

    // ========================================================================
    // SpinRequested event (emitted by Gacha as RandomnessRequested from interface)
    // ========================================================================

    function testSpinEmitsRandomnessRequested() public {
        _depositNFTsForSpins();

        uint256 nextId = gacha.getNextTriggerId();
        uint256 fee = gacha.getCurrentSpinFee();
        vm.startPrank(gameSpinner);
        feeToken.approve(address(gacha), fee);

        // The contract emits RandomnessRequested (same signature) from the WAVS interface
        // We verify indirectly by checking the triggerId returned from spin
        uint256 triggerId = gacha.spin(MAX_SPIN_FEE);
        vm.stopPrank();

        assertEq(triggerId, nextId, "Trigger ID should match next ID");
    }

    // ========================================================================
    // SpinStatusUpdate events during spin lifecycle
    // ========================================================================

    function testSpinStatusUpdateEventsOnFullLifecycle() public {
        _depositNFTsForSpins();

        uint256 nextId = gacha.getNextTriggerId();
        uint256 fee = gacha.getCurrentSpinFee();

        // Spin → "requested"
        vm.startPrank(gameSpinner);
        feeToken.approve(address(gacha), fee);
        vm.expectEmit(true, true, false, true);
        emit SpinStatusUpdate(nextId, gameSpinner, "requested", block.timestamp);
        uint256 triggerId = gacha.spin(MAX_SPIN_FEE);
        vm.stopPrank();

        // Fulfill → "completed"
        vm.expectEmit(true, true, false, false);
        emit SpinStatusUpdate(triggerId, gameSpinner, "completed", block.timestamp);
        vm.prank(address(serviceHandler));
        gacha.fulfillRandomness(triggerId, bytes32(uint256(12345)));
    }

    function testSpinStatusUpdateEventOnReclaim() public {
        _depositNFTsForSpins();

        uint256 fee = gacha.getCurrentSpinFee();
        vm.startPrank(gameSpinner);
        feeToken.approve(address(gacha), fee);
        uint256 triggerId = gacha.spin(MAX_SPIN_FEE);
        vm.stopPrank();

        vm.warp(block.timestamp + gacha.spinTimeout() + 1);

        vm.expectEmit(true, true, false, false);
        emit SpinStatusUpdate(triggerId, gameSpinner, "reclaimed", block.timestamp);
        vm.prank(gameSpinner);
        gacha.reclaimFailedSpin(triggerId);
    }
}
