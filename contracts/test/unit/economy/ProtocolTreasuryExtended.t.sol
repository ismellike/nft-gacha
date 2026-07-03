// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {StandardTest} from "../../helpers/StandardTest.sol";
import {TestConstants} from "../../helpers/TestConstants.sol";
import {ProtocolTreasury} from "../../../src/economy/ProtocolTreasury.sol";
import {GachaTreasury} from "../../../src/gacha/GachaTreasury.sol";
import {BaseERC20} from "../../../src/tokens/BaseERC20.sol";
import {BaseERC721} from "../../../src/tokens/BaseERC721.sol";
import {MockNFTAppraisal} from "../../mocks/MockNFTAppraisal.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

/**
 * @title ProtocolTreasuryExtended Test Suite
 * @notice Comprehensive extended tests for ProtocolTreasury contract
 * @dev Tests edge cases, event emissions, and view functions
 */
contract ProtocolTreasuryExtendedTest is StandardTest {
    ProtocolTreasury public protoTreasury;
    GachaTreasury public gachaTreasury;
    BaseERC20 public usdc;
    BaseERC721 public nft;
    MockNFTAppraisal public mockAppraisal;

    address public treasuryOwner;
    address public economyManagerAddr;
    address public redeemer;

    // Reproduce all events from ProtocolTreasury (from IProtocolTreasury + contract)
    event ProtocolRevenueReceived(uint256 amount);
    event RedemptionExecuted(address indexed user, address indexed collection, uint256 indexed tokenId, uint256 payout);
    event ProtocolTransfer(address indexed to, uint256 amount);
    event EconomyManagerUpdated(address indexed previousManager, address indexed newManager);
    event GachaTreasuryUpdated(address indexed previousTreasury, address indexed newTreasury);
    event AppraisalOracleUpdated(address indexed previousOracle, address indexed newOracle);
    event RedemptionWindowUpdated(uint256 indexed oldWindow, uint256 indexed newWindow);
    event MaxPayoutBpsUpdated(uint256 indexed oldBps, uint256 indexed newBps);
    event RedemptionWindowEnforced(
        address indexed collection, uint256 indexed tokenId, address indexed user, uint256 timeSinceWin
    );

    function setUp() public {
        treasuryOwner = makeAddr("treasuryOwner");
        economyManagerAddr = makeAddr("economyManager");
        redeemer = makeAddr("redeemer");

        usdc = new BaseERC20("USDC", "USDC", treasuryOwner);
        nft = new BaseERC721("Test NFT", "TNFT", treasuryOwner);
        mockAppraisal = new MockNFTAppraisal();

        // Deploy a real GachaTreasury so getNFTRedemptionDeadline/getNFTReceiveTime work
        vm.startPrank(treasuryOwner);
        gachaTreasury = _deployTreasury(treasuryOwner, address(0xDEAD), address(mockAppraisal));
        vm.stopPrank();

        // Deploy ProtocolTreasury with proxy
        vm.startPrank(treasuryOwner);
        ProtocolTreasury impl = new ProtocolTreasury();
        bytes memory initData = abi.encodeWithSelector(
            ProtocolTreasury.initialize.selector,
            treasuryOwner,
            address(usdc),
            economyManagerAddr,
            address(gachaTreasury),
            address(mockAppraisal)
        );
        ERC1967Proxy proxy = new ERC1967Proxy(address(impl), initData);
        protoTreasury = ProtocolTreasury(address(proxy));

        // Wire the GachaTreasury to know about the ProtocolTreasury
        gachaTreasury.setProtocolTreasury(address(protoTreasury));
        vm.stopPrank();
    }

    // ========================================================================
    // Helper: set up a redeemable NFT scenario
    // ========================================================================

    /// @dev Mints an NFT to redeemer, appraises it, runs a gacha spin so that the NFT
    ///      exits the treasury and a redemption deadline is recorded.
    ///      Returns the tokenId deposited and the redemption deadline.
    function _setupRedeemableNFT(uint256 appraisalUSD) internal returns (uint256 tokenId, uint256 deadline) {
        // We need to simulate sendRandomNFTToWinner to set a deadline.
        // The easiest approach: use vm.store to directly write the deadline into the
        // nftRedemptionDeadlines mapping in GachaTreasury.
        vm.startPrank(treasuryOwner);
        tokenId = nft.mint(redeemer);
        vm.stopPrank();

        mockAppraisal.setMockAppraisal(address(nft), tokenId, appraisalUSD);

        // Compute the storage slot of nftRedemptionDeadlines[address(nft)][tokenId]
        // forge inspect GachaTreasury storageLayout shows nftRedemptionDeadlines at slot 15.
        // Layout for mapping(address => mapping(uint256 => uint256)):
        //   innerSlot = keccak256(abi.encode(collection, baseSlot))
        //   finalSlot = keccak256(abi.encode(tokenId, innerSlot))
        uint256 deadlineValue = block.timestamp + 1 hours;
        bytes32 innerKey = keccak256(abi.encode(address(nft), uint256(15)));
        bytes32 outerKey = keccak256(abi.encode(tokenId, innerKey));
        vm.store(address(gachaTreasury), outerKey, bytes32(deadlineValue));

        deadline = deadlineValue;
    }

    // ========================================================================
    // executeRedemption: REAL InsufficientLiquidity
    // ========================================================================

    function testExecuteRedemptionRevertsInsufficientLiquidity() public {
        // appraisal $100e18 → payout = 100e18 * 8000 / (10000 * 1e12) = 80e6 USDC
        (uint256 tokenId,) = _setupRedeemableNFT(100e18);

        // Fund treasury with only 1 USDC (less than the 80 USDC payout)
        vm.prank(treasuryOwner);
        usdc.mint(address(protoTreasury), 1e6);

        vm.startPrank(redeemer);
        nft.approve(address(protoTreasury), tokenId);
        vm.expectRevert(abi.encodeWithSelector(ProtocolTreasury.InsufficientLiquidity.selector));
        protoTreasury.executeRedemption(address(nft), tokenId);
        vm.stopPrank();
    }

    // ========================================================================
    // executeRedemption: Pending appraisal status
    // ========================================================================

    function testExecuteRedemptionRevertsPendingAppraisalStatus() public {
        // Mint NFT but deliberately set up a Pending appraisal (no setMockAppraisal call)
        vm.prank(treasuryOwner);
        uint256 tokenId = nft.mint(redeemer);

        // Do not call mockAppraisal.setMockAppraisal → status remains Pending, price = 0
        vm.prank(redeemer);
        vm.expectRevert(abi.encodeWithSelector(ProtocolTreasury.AppraisalMissing.selector));
        protoTreasury.executeRedemption(address(nft), tokenId);
    }

    // ========================================================================
    // executeRedemption: very low appraisal where payout rounds to 0
    // ========================================================================

    function testExecuteRedemptionRevertsWhenPayoutIsZero() public {
        // payout = appraisalUSD * 8000 / (10000 * 1e12)
        // For payout == 0: appraisalUSD * 8000 < 10000 * 1e12
        // → appraisalUSD < 10000 * 1e12 / 8000 = 1.25e12
        // Use appraisalUSD = 1 (1 wei of USD, effectively zero after integer division)
        (uint256 tokenId,) = _setupRedeemableNFT(1);

        // A payout that rounds to 0 (appraisal below ~$0.00000125) is treated as no meaningful
        // appraisal by the shared _quoteRedemption path → AppraisalMissing.
        vm.prank(redeemer);
        vm.expectRevert(abi.encodeWithSelector(ProtocolTreasury.AppraisalMissing.selector));
        protoTreasury.executeRedemption(address(nft), tokenId);
    }

    // ========================================================================
    // setMaxPayoutBps: value > 10000 (should succeed — no revert in contract)
    // ========================================================================

    function testSetMaxPayoutBpsAbove10000() public {
        // The contract does NOT revert for values > 10000 — it stores whatever is set.
        // A value of 20000 means 200% of balance, which effectively disables the cap
        // because payout can never exceed 100% of balance.
        vm.prank(treasuryOwner);
        protoTreasury.setMaxPayoutBps(20000);
        assertEq(protoTreasury.maxPayoutBps(), 20000, "maxPayoutBps should accept values > 10000");
    }

    function testSetMaxPayoutBpsExactly10000() public {
        vm.prank(treasuryOwner);
        protoTreasury.setMaxPayoutBps(10000);
        assertEq(protoTreasury.maxPayoutBps(), 10000);
    }

    function testSetMaxPayoutBpsZeroDisablesCap() public {
        vm.prank(treasuryOwner);
        protoTreasury.setMaxPayoutBps(1000); // enable first
        vm.prank(treasuryOwner);
        protoTreasury.setMaxPayoutBps(0); // then disable
        assertEq(protoTreasury.maxPayoutBps(), 0, "maxPayoutBps == 0 means no cap");
    }

    function testSetMaxPayoutBpsOnlyOwner() public {
        vm.prank(redeemer);
        vm.expectRevert();
        protoTreasury.setMaxPayoutBps(500);
    }

    // ========================================================================
    // setRedemptionWindow: very large value
    // ========================================================================

    function testSetRedemptionWindowVeryLargeValue() public {
        uint256 veryLarge = type(uint256).max;
        vm.prank(treasuryOwner);
        protoTreasury.setRedemptionWindow(veryLarge);
        assertEq(protoTreasury.redemptionWindow(), veryLarge, "Should accept very large window");
    }

    function testSetRedemptionWindowOneYear() public {
        uint256 oneYear = 365 days;
        vm.prank(treasuryOwner);
        protoTreasury.setRedemptionWindow(oneYear);
        assertEq(protoTreasury.redemptionWindow(), oneYear);
    }

    // ========================================================================
    // Event emission: ProtocolRevenueReceived
    // ========================================================================

    function testEventProtocolRevenueReceived() public {
        uint256 amount = 500e6;
        vm.prank(treasuryOwner);
        usdc.mint(economyManagerAddr, amount);

        vm.startPrank(economyManagerAddr);
        usdc.approve(address(protoTreasury), amount);
        vm.expectEmit(false, false, false, true);
        emit ProtocolRevenueReceived(amount);
        protoTreasury.onRevenueReceived(amount);
        vm.stopPrank();
    }

    // ========================================================================
    // Event emission: ProtocolTransfer
    // ========================================================================

    function testEventProtocolTransfer() public {
        uint256 amount = 250e6;
        vm.prank(treasuryOwner);
        usdc.mint(address(protoTreasury), amount);

        address recipient = makeAddr("recipient");
        vm.expectEmit(true, false, false, true);
        emit ProtocolTransfer(recipient, amount);
        vm.prank(treasuryOwner);
        protoTreasury.transferOut(recipient, amount);
    }

    // ========================================================================
    // Event emission: EconomyManagerUpdated
    // ========================================================================

    function testEventEconomyManagerUpdated() public {
        address newManager = makeAddr("newManager");
        vm.expectEmit(true, true, false, false);
        emit EconomyManagerUpdated(economyManagerAddr, newManager);
        vm.prank(treasuryOwner);
        protoTreasury.setEconomyManager(newManager);
    }

    // ========================================================================
    // Event emission: GachaTreasuryUpdated
    // ========================================================================

    function testEventGachaTreasuryUpdated() public {
        address newTreasuryAddr = makeAddr("newGachaTreasury");
        vm.expectEmit(true, true, false, false);
        emit GachaTreasuryUpdated(address(gachaTreasury), newTreasuryAddr);
        vm.prank(treasuryOwner);
        protoTreasury.setGachaTreasury(newTreasuryAddr);
    }

    // ========================================================================
    // Event emission: AppraisalOracleUpdated
    // ========================================================================

    function testEventAppraisalOracleUpdated() public {
        address newOracle = makeAddr("newOracle");
        vm.expectEmit(true, true, false, false);
        emit AppraisalOracleUpdated(address(mockAppraisal), newOracle);
        vm.prank(treasuryOwner);
        protoTreasury.setAppraisalOracle(newOracle);
    }

    // ========================================================================
    // Event emission: RedemptionWindowUpdated
    // ========================================================================

    function testEventRedemptionWindowUpdated() public {
        uint256 oldWindow = protoTreasury.redemptionWindow();
        uint256 newWindow = 2 hours;
        vm.expectEmit(true, true, false, false);
        emit RedemptionWindowUpdated(oldWindow, newWindow);
        vm.prank(treasuryOwner);
        protoTreasury.setRedemptionWindow(newWindow);
    }

    // ========================================================================
    // Event emission: MaxPayoutBpsUpdated
    // ========================================================================

    function testEventMaxPayoutBpsUpdated() public {
        uint256 oldBps = protoTreasury.maxPayoutBps();
        uint256 newBps = 500;
        vm.expectEmit(true, true, false, false);
        emit MaxPayoutBpsUpdated(oldBps, newBps);
        vm.prank(treasuryOwner);
        protoTreasury.setMaxPayoutBps(newBps);
    }

    // ========================================================================
    // Event emission: RedemptionExecuted
    // ========================================================================

    function testEventRedemptionExecuted() public {
        // appraisal $100e18 → payout = 100e18 * 8000 / (10000 * 1e12) = 80e6
        uint256 appraisalUSD = 100e18;
        uint256 expectedPayout = (appraisalUSD * 8000) / (10000 * 1e12);

        (uint256 tokenId,) = _setupRedeemableNFT(appraisalUSD);

        // Fund treasury with enough USDC
        vm.prank(treasuryOwner);
        usdc.mint(address(protoTreasury), expectedPayout * 2);

        vm.startPrank(redeemer);
        nft.approve(address(protoTreasury), tokenId);
        vm.expectEmit(true, true, true, true);
        emit RedemptionExecuted(redeemer, address(nft), tokenId, expectedPayout);
        protoTreasury.executeRedemption(address(nft), tokenId);
        vm.stopPrank();
    }

    // ========================================================================
    // View function: getRemainingRedemptionWindow
    // ========================================================================

    function testGetRemainingRedemptionWindowWithActiveDeadline() public {
        (uint256 tokenId,) = _setupRedeemableNFT(100e18);

        uint256 remaining = protoTreasury.getRemainingRedemptionWindow(address(nft), tokenId);
        // deadline = block.timestamp + 1 hours, so remaining should be close to 1 hour
        assertGt(remaining, 0, "Remaining window should be > 0 while deadline is in the future");
        assertLe(remaining, 1 hours, "Remaining window should not exceed 1 hour");
    }

    function testGetRemainingRedemptionWindowAfterExpiry() public {
        (uint256 tokenId, uint256 deadline) = _setupRedeemableNFT(100e18);

        // Warp past the deadline
        vm.warp(deadline + 1);

        uint256 remaining = protoTreasury.getRemainingRedemptionWindow(address(nft), tokenId);
        assertEq(remaining, 0, "Remaining window should be 0 after expiry");
    }

    function testGetRemainingRedemptionWindowNoDeadline() public view {
        // NFT with no deadline set
        uint256 remaining = protoTreasury.getRemainingRedemptionWindow(address(nft), 999);
        assertEq(remaining, 0, "Remaining window should be 0 when no deadline is set");
    }

    // ========================================================================
    // View function: isRedemptionEligible
    // ========================================================================

    function testIsRedemptionEligibleWithActiveDeadline() public {
        (uint256 tokenId,) = _setupRedeemableNFT(100e18);

        bool eligible = protoTreasury.isRedemptionEligible(address(nft), tokenId);
        assertTrue(eligible, "Should be eligible while deadline is in the future");
    }

    function testIsRedemptionEligibleAfterExpiry() public {
        (uint256 tokenId, uint256 deadline) = _setupRedeemableNFT(100e18);

        vm.warp(deadline + 1);

        bool eligible = protoTreasury.isRedemptionEligible(address(nft), tokenId);
        assertFalse(eligible, "Should not be eligible after expiry");
    }

    function testIsRedemptionEligibleNoDeadline() public view {
        bool eligible = protoTreasury.isRedemptionEligible(address(nft), 999);
        assertFalse(eligible, "Should not be eligible without a deadline");
    }

    function testIsRedemptionEligibleAtExactDeadline() public {
        (uint256 tokenId, uint256 deadline) = _setupRedeemableNFT(100e18);

        // At exact deadline: block.timestamp <= deadline → eligible
        vm.warp(deadline);
        bool eligible = protoTreasury.isRedemptionEligible(address(nft), tokenId);
        assertTrue(eligible, "Should be eligible at exact deadline timestamp");
    }

    // ========================================================================
    // Full executeRedemption success path with event verification
    // ========================================================================

    function testExecuteRedemptionSuccess() public {
        uint256 appraisalUSD = 200e18;
        // payout = 200e18 * 8000 / (10000 * 1e12) = 160e6
        uint256 expectedPayout = (appraisalUSD * 8000) / (10000 * 1e12);

        (uint256 tokenId,) = _setupRedeemableNFT(appraisalUSD);

        vm.prank(treasuryOwner);
        usdc.mint(address(protoTreasury), expectedPayout * 2);

        uint256 redeemerBalanceBefore = usdc.balanceOf(redeemer);

        vm.startPrank(redeemer);
        nft.approve(address(protoTreasury), tokenId);
        uint256 payout = protoTreasury.executeRedemption(address(nft), tokenId);
        vm.stopPrank();

        assertEq(payout, expectedPayout, "Payout should match expected");
        assertEq(usdc.balanceOf(redeemer), redeemerBalanceBefore + expectedPayout, "Redeemer should receive USDC");
    }

    // ========================================================================
    // maxPayoutBps cap: payout exceeds cap → revert PayoutExceedsTreasuryCap
    // ========================================================================

    function testExecuteRedemptionRevertsPayoutExceedsTreasuryCap() public {
        // appraisal $100e18 → payout = 80e6
        uint256 appraisalUSD = 100e18;
        uint256 payout = (appraisalUSD * 8000) / (10000 * 1e12);

        (uint256 tokenId,) = _setupRedeemableNFT(appraisalUSD);

        // Fund treasury with exactly the payout amount
        vm.prank(treasuryOwner);
        usdc.mint(address(protoTreasury), payout);

        // Set cap to 50% of balance — payout (80e6) == balance (80e6) so 80e6 > 50% of 80e6 = 40e6
        vm.prank(treasuryOwner);
        protoTreasury.setMaxPayoutBps(5000);

        vm.startPrank(redeemer);
        nft.approve(address(protoTreasury), tokenId);
        vm.expectRevert(abi.encodeWithSelector(ProtocolTreasury.PayoutExceedsTreasuryCap.selector));
        protoTreasury.executeRedemption(address(nft), tokenId);
        vm.stopPrank();
    }

    // ========================================================================
    // maxPayoutBps disabled (0): no cap applied
    // ========================================================================

    function testExecuteRedemptionSucceedsWithNoMaxPayoutCap() public {
        uint256 appraisalUSD = 100e18;
        uint256 payout = (appraisalUSD * 8000) / (10000 * 1e12);

        (uint256 tokenId,) = _setupRedeemableNFT(appraisalUSD);

        vm.prank(treasuryOwner);
        usdc.mint(address(protoTreasury), payout);

        // maxPayoutBps is 0 by default (no cap)
        assertEq(protoTreasury.maxPayoutBps(), 0, "Default maxPayoutBps should be 0");

        vm.startPrank(redeemer);
        nft.approve(address(protoTreasury), tokenId);
        uint256 actualPayout = protoTreasury.executeRedemption(address(nft), tokenId);
        vm.stopPrank();

        assertEq(actualPayout, payout, "Should succeed with no cap");
    }

    // ========================================================================
    // Multiple sequential setMaxPayoutBps calls emit events correctly
    // ========================================================================

    function testSetMaxPayoutBpsMultipleUpdates() public {
        vm.startPrank(treasuryOwner);

        vm.expectEmit(true, true, false, false);
        emit MaxPayoutBpsUpdated(0, 1000);
        protoTreasury.setMaxPayoutBps(1000);

        vm.expectEmit(true, true, false, false);
        emit MaxPayoutBpsUpdated(1000, 2000);
        protoTreasury.setMaxPayoutBps(2000);

        vm.expectEmit(true, true, false, false);
        emit MaxPayoutBpsUpdated(2000, 0);
        protoTreasury.setMaxPayoutBps(0);

        vm.stopPrank();
    }

    // ========================================================================
    // Multiple sequential setRedemptionWindow calls emit events correctly
    // ========================================================================

    function testSetRedemptionWindowMultipleUpdates() public {
        uint256 initial = protoTreasury.redemptionWindow();

        vm.startPrank(treasuryOwner);

        vm.expectEmit(true, true, false, false);
        emit RedemptionWindowUpdated(initial, 2 hours);
        protoTreasury.setRedemptionWindow(2 hours);

        vm.expectEmit(true, true, false, false);
        emit RedemptionWindowUpdated(2 hours, 24 hours);
        protoTreasury.setRedemptionWindow(24 hours);

        vm.stopPrank();

        assertEq(protoTreasury.redemptionWindow(), 24 hours);
    }

    // ========================================================================
    // setEconomyManager dedicated test
    // ========================================================================

    function testSetEconomyManagerEmitsEvent() public {
        address newManager = makeAddr("newManagerB");
        address previous = protoTreasury.economyManager();

        vm.expectEmit(true, true, false, false);
        emit EconomyManagerUpdated(previous, newManager);
        vm.prank(treasuryOwner);
        protoTreasury.setEconomyManager(newManager);

        assertEq(protoTreasury.economyManager(), newManager);
    }

    // ========================================================================
    // Redemption window expired path
    // ========================================================================

    function testExecuteRedemptionRevertsExpiredWindow() public {
        (uint256 tokenId, uint256 deadline) = _setupRedeemableNFT(100e18);

        // Warp past deadline
        vm.warp(deadline + 1);

        vm.prank(treasuryOwner);
        usdc.mint(address(protoTreasury), 1000e6);

        vm.prank(redeemer);
        vm.expectRevert(abi.encodeWithSelector(ProtocolTreasury.RedemptionWindowExpired.selector));
        protoTreasury.executeRedemption(address(nft), tokenId);
    }
}
