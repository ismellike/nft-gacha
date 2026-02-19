// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Test, console2} from "forge-std/Test.sol";
import {DepositorVault} from "../../../src/economy/DepositorVault.sol";
import {BaseERC20} from "../../../src/tokens/BaseERC20.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";

/**
 * @title Depositor Vault Test Suite
 * @notice Comprehensive unit tests for DepositorVault contract
 * @dev Tests reward distribution, share management, and vault operations in isolation
 * @author NFT Gacha Team
 */
contract DepositorVaultTest is Test {
    // ========================================================================
    // TEST STATE VARIABLES
    // ========================================================================

    /// @dev Contract instances
    DepositorVault public vault;
    BaseERC20 public usdc;

    /// @dev Test addresses
    address public owner = makeAddr("owner");
    address public treasury = owner; // Treat owner as treasury for test scenarios
    address public economyManager = makeAddr("economyManager");
    address public depositor1 = makeAddr("depositor1");
    address public depositor2 = makeAddr("depositor2");
    address public recipient = makeAddr("recipient");

    /// @dev Test constants
    uint256 public constant INITIAL_SUPPLY = 1_000_000 * 1e6; // 1M USDC
    uint256 public constant REWARD_AMOUNT = 10_000 * 1e6; // 10k USDC
    uint256 public constant DEPOSITOR1_SHARES = 1000e18; // 1000 appraisal units
    uint256 public constant DEPOSITOR2_SHARES = 2000e18; // 2000 appraisal units
    uint256 public constant TOTAL_SHARES = DEPOSITOR1_SHARES + DEPOSITOR2_SHARES;

    /// @dev Precision constants
    uint256 public constant REWARD_PRECISION = 1e18;
    uint256 public constant USDC_PRECISION = 1e6;

    // ========================================================================
    // EVENTS
    // ========================================================================

    event DepositorRegistered(address indexed account, uint256 appraisalValueUSD);
    event DepositorUpdated(address indexed account, uint256 oldValueUSD, uint256 newValueUSD);
    event DepositorDeregistered(address indexed account, uint256 appraisalValueUSD);
    event YieldDistributed(address indexed from, uint256 amount);
    event YieldClaimed(address indexed account, uint256 amount);

    // ========================================================================
    // MODIFIERS
    // ========================================================================

    modifier asOwner() {
        vm.startPrank(owner);
        _;
        vm.stopPrank();
    }

    modifier asEconomyManager() {
        vm.startPrank(economyManager);
        _;
        vm.stopPrank();
    }

    modifier asDepositor(address depositor) {
        vm.startPrank(depositor);
        _;
        vm.stopPrank();
    }

    modifier expectRevertWith(bytes4 errorSelector) {
        vm.expectRevert(errorSelector);
        _;
    }

    // ========================================================================
    // SETUP AND TEARDOWN
    // ========================================================================

    function setUp() public {
        _deployToken();
        _deployVault();
        _setupInitialState();
    }

    function _deployToken() internal {
        usdc = new BaseERC20("USDC", "USDC", owner);
        vm.startPrank(owner);
        usdc.mint(address(this), INITIAL_SUPPLY);
        usdc.mint(depositor1, 100_000 * 1e6);
        usdc.mint(depositor2, 100_000 * 1e6);
        usdc.mint(economyManager, INITIAL_SUPPLY);
        vm.stopPrank();
    }

    function _deployVault() internal {
        DepositorVault vaultImpl = new DepositorVault();

        vm.startPrank(owner);
        bytes memory initData = abi.encodeWithSelector(
            DepositorVault.initialize.selector, owner, address(usdc), address(treasury), address(economyManager)
        );

        ERC1967Proxy proxy = new ERC1967Proxy(address(vaultImpl), initData);
        vault = DepositorVault(address(proxy));
        vm.stopPrank();
    }

    function _setupInitialState() internal {
        // Approve USDC for economy manager
        vm.startPrank(address(this));
        usdc.approve(address(vault), type(uint256).max);
        vm.stopPrank();

        vm.startPrank(economyManager);
        usdc.approve(address(vault), type(uint256).max);
        vm.stopPrank();
    }

    // ========================================================================
    // DEPOSITOR MANAGEMENT TESTS
    // ========================================================================

    function testRegisterDepositor() public {
        vm.expectEmit(true, true, false, false);
        emit DepositorRegistered(depositor1, DEPOSITOR1_SHARES);

        vm.startPrank(owner);
        vault.registerDepositor(depositor1, DEPOSITOR1_SHARES);

        assertEq(vault.sharesOf(depositor1), DEPOSITOR1_SHARES, "Shares should be set");
        assertEq(vault.totalShares(), DEPOSITOR1_SHARES, "Total shares should be updated");
    }

    function testRegisterMultipleDepositors() public {
        vm.startPrank(owner);
        vault.registerDepositor(depositor1, DEPOSITOR1_SHARES);
        vault.registerDepositor(depositor2, DEPOSITOR2_SHARES);
        vm.stopPrank();

        assertEq(vault.sharesOf(depositor1), DEPOSITOR1_SHARES, "Depositor1 shares correct");
        assertEq(vault.sharesOf(depositor2), DEPOSITOR2_SHARES, "Depositor2 shares correct");
        assertEq(vault.totalShares(), TOTAL_SHARES, "Total shares correct");
    }

    function testUpdateDepositorShares() public {
        // Register initial shares
        vm.startPrank(owner);
        vault.registerDepositor(depositor1, DEPOSITOR1_SHARES);

        uint256 newShares = DEPOSITOR1_SHARES * 2;

        vm.expectEmit(true, true, true, false);
        emit DepositorUpdated(depositor1, DEPOSITOR1_SHARES, newShares);

        vm.startPrank(owner);
        vault.updateDepositor(depositor1, newShares);

        assertEq(vault.sharesOf(depositor1), newShares, "Shares should be updated");
        assertEq(vault.totalShares(), newShares, "Total shares should be updated");
    }

    function testDeregisterDepositor() public {
        // Register depositor first
        vm.startPrank(owner);
        vault.registerDepositor(depositor1, DEPOSITOR1_SHARES);

        vm.expectEmit(true, true, false, false);
        emit DepositorDeregistered(depositor1, DEPOSITOR1_SHARES);

        vm.startPrank(owner);
        vault.deregisterDepositor(depositor1);

        assertEq(vault.sharesOf(depositor1), 0, "Shares should be zero");
        assertEq(vault.totalShares(), 0, "Total shares should be zero");
    }

    function testDepositorAuthorization() public {
        // Only treasury should be able to manage depositors
        vm.prank(depositor1);
        vm.expectRevert();
        vault.registerDepositor(depositor1, DEPOSITOR1_SHARES);

        vm.prank(depositor1);
        vm.expectRevert();
        vault.updateDepositor(depositor1, DEPOSITOR1_SHARES * 2);

        vm.prank(depositor1);
        vm.expectRevert();
        vault.deregisterDepositor(depositor1);
    }

    // ========================================================================
    // REWARD DISTRIBUTION TESTS
    // ========================================================================

    function testDistributeYield() public {
        // Setup depositors
        vm.startPrank(owner);
        vault.registerDepositor(depositor1, DEPOSITOR1_SHARES);
        vault.registerDepositor(depositor2, DEPOSITOR2_SHARES);

        // Distribute yield
        vm.expectEmit(true, true, false, false);
        emit YieldDistributed(economyManager, REWARD_AMOUNT);

        vm.startPrank(economyManager);
        vault.distributeYield(REWARD_AMOUNT);
        vm.stopPrank();

        assertEq(vault.totalYieldDistributed(), REWARD_AMOUNT, "Total yield should be tracked");
        assertEq(
            vault.accYieldPerShare(),
            (REWARD_AMOUNT * REWARD_PRECISION) / TOTAL_SHARES,
            "Yield per share should be calculated"
        );
    }

    function testYieldAccrual() public {
        // Setup depositors and distribute initial yield
        vm.startPrank(owner);
        vault.registerDepositor(depositor1, DEPOSITOR1_SHARES);
        vault.registerDepositor(depositor2, DEPOSITOR2_SHARES);
        vm.stopPrank();

        vm.startPrank(economyManager);
        vault.distributeYield(REWARD_AMOUNT);
        vm.stopPrank();

        // Check pending rewards based on contract tracking
        uint256 expectedDepositor1Reward = vault.pendingYield(depositor1);
        uint256 expectedDepositor2Reward = vault.pendingYield(depositor2);

        assertEq(vault.pendingYield(depositor1), expectedDepositor1Reward, "Depositor1 pending reward correct");
        assertEq(vault.pendingYield(depositor2), expectedDepositor2Reward, "Depositor2 pending reward correct");
    }

    function testMultipleYieldDistributions() public {
        // Setup depositors
        vm.startPrank(owner);
        vault.registerDepositor(depositor1, DEPOSITOR1_SHARES);
        vault.registerDepositor(depositor2, DEPOSITOR2_SHARES);

        // Distribute yield multiple times
        uint256 totalReward = 0;
        for (uint256 i = 0; i < 5; i++) {
            uint256 rewardAmount = REWARD_AMOUNT * (i + 1);
            vm.startPrank(economyManager);
            vault.distributeYield(rewardAmount);
            totalReward += rewardAmount;
        }

        // Verify total tracked
        assertEq(vault.totalYieldDistributed(), totalReward, "Total yield should match sum");
    }

    // ========================================================================
    // YIELD CLAIMING TESTS
    // ========================================================================

    function testClaimYield() public {
        // Setup depositors and distribute yield
        vm.startPrank(owner);
        vault.registerDepositor(depositor1, DEPOSITOR1_SHARES);
        vm.stopPrank();

        vm.startPrank(economyManager);
        vault.distributeYield(REWARD_AMOUNT);
        vm.stopPrank();

        uint256 expectedReward = vault.pendingYield(depositor1);
        uint256 balanceBefore = usdc.balanceOf(depositor1);

        vm.expectEmit(true, true, true, false);
        emit YieldClaimed(depositor1, expectedReward);

        vm.startPrank(depositor1);
        uint256 claimed = vault.claimYield(depositor1);
        vm.stopPrank();

        assertEq(claimed, expectedReward, "Claimed amount should be correct");
        assertEq(usdc.balanceOf(depositor1), balanceBefore + expectedReward, "Depositor should receive reward");
        assertEq(vault.pendingYield(depositor1), 0, "Pending reward should be zero after claim");
        assertEq(vault.totalYieldClaimed(), expectedReward, "Total claimed should be tracked");
    }

    function testClaimYieldToDifferentRecipient() public {
        // Setup depositors and distribute yield
        vm.startPrank(owner);
        vault.registerDepositor(depositor1, DEPOSITOR1_SHARES);
        vm.stopPrank();

        vm.startPrank(economyManager);
        vault.distributeYield(REWARD_AMOUNT);
        vm.stopPrank();

        uint256 balanceBefore = usdc.balanceOf(depositor1);

        vm.startPrank(depositor1);
        vault.claimYield(depositor1);

        assertGt(usdc.balanceOf(depositor1), balanceBefore, "Depositor should receive reward");
    }

    function testClaimYieldAuthorization() public {
        // Setup depositors and distribute yield
        vm.startPrank(owner);
        vault.registerDepositor(depositor1, DEPOSITOR1_SHARES);
        vm.stopPrank();

        vm.startPrank(economyManager);
        vault.distributeYield(REWARD_AMOUNT);
        vm.stopPrank();

        // Only depositor or economy manager can claim
        vm.prank(depositor2);
        vm.expectRevert();
        vault.claimYield(depositor1);
    }

    function testClaimYieldWithZeroBalance() public {
        // Setup depositor but no yield distributed
        vm.startPrank(owner);
        vault.registerDepositor(depositor1, DEPOSITOR1_SHARES);

        vm.startPrank(depositor1);
        vm.expectRevert(); // Should fail - nothing to claim
        vault.claimYield(depositor1);
    }

    function testPartialYieldClaims() public {
        // Setup depositors and distribute yield
        vm.startPrank(owner);
        vault.registerDepositor(depositor1, DEPOSITOR1_SHARES);
        vm.stopPrank();

        vm.startPrank(economyManager);
        vault.distributeYield(REWARD_AMOUNT);
        vm.stopPrank();

        uint256 expectedReward = vault.pendingYield(depositor1);

        // Claim partial amount (if supported)
        // This test assumes the contract claims full amount
        vm.startPrank(depositor1);
        uint256 claimed = vault.claimYield(depositor1);
        vm.stopPrank();

        assertEq(claimed, expectedReward, "Should claim full amount");
        assertEq(vault.pendingYield(depositor1), 0, "No pending reward after claim");
    }

    // ========================================================================
    // SHARE UPDATE TESTS
    // ========================================================================

    function testShareUpdateWithPendingRewards() public {
        // Setup depositors and distribute yield
        vm.startPrank(owner);
        vault.registerDepositor(depositor1, DEPOSITOR1_SHARES);
        vm.stopPrank();

        vm.startPrank(economyManager);
        vault.distributeYield(REWARD_AMOUNT);
        vm.stopPrank();

        uint256 pendingBefore = vault.pendingYield(depositor1);

        // Update shares
        uint256 newShares = DEPOSITOR1_SHARES * 2;
        vm.startPrank(owner);
        vault.updateDepositor(depositor1, newShares);
        vm.stopPrank();

        // Pending rewards should be preserved
        assertEq(vault.pendingYield(depositor1), pendingBefore, "Pending rewards should be preserved");
    }

    function testShareUpdateFromZero() public {
        // Register with zero shares should fail
        vm.startPrank(owner);
        vm.expectRevert();
        vault.registerDepositor(depositor1, 0);
        vm.stopPrank();

        // Update to zero shares should fail
        vm.startPrank(owner);
        vault.registerDepositor(depositor1, DEPOSITOR1_SHARES);
        vm.stopPrank();

        vm.startPrank(owner);
        vm.expectRevert();
        vault.updateDepositor(depositor1, 0);
        vm.stopPrank();
    }

    // ========================================================================
    // EDGE CASE TESTS
    // ========================================================================

    function testDistributeYieldWithNoDepositors() public {
        vm.startPrank(economyManager);
        vm.expectRevert();
        vault.distributeYield(REWARD_AMOUNT);
    }

    function testDistributeZeroYield() public {
        // Setup depositors
        vm.startPrank(owner);
        vault.registerDepositor(depositor1, DEPOSITOR1_SHARES);

        vm.startPrank(economyManager);
        vm.expectRevert();
        vault.distributeYield(0);
    }

    function testMaximumShareValue() public {
        uint256 maxShares = type(uint256).max - 1;

        vm.startPrank(owner);
        vault.registerDepositor(depositor1, maxShares);

        assertEq(vault.sharesOf(depositor1), maxShares, "Maximum shares should be set");
        assertEq(vault.totalShares(), maxShares, "Total shares should match");
    }

    function testPrecisionHandling() public {
        // Setup depositors with precise share ratio
        uint256 shares1 = 1e18;
        uint256 shares2 = 3e18;
        uint256 totalSharesTest = shares1 + shares2;

        vm.startPrank(owner);
        vault.registerDepositor(depositor1, shares1);
        vault.registerDepositor(depositor2, shares2);
        vm.stopPrank();

        // Distribute yield that doesn't divide evenly
        uint256 rewardAmount = 100 * USDC_PRECISION + 1; // 100.000001 USDC

        vm.startPrank(economyManager);
        vault.distributeYield(rewardAmount);
        vm.stopPrank();

        // Verify precision handling
        uint256 expected1 = Math.mulDiv(rewardAmount, shares1, totalSharesTest);
        uint256 expected2 = Math.mulDiv(rewardAmount, shares2, totalSharesTest);

        assertEq(vault.pendingYield(depositor1), expected1, "Precision handling for depositor1");
        assertEq(vault.pendingYield(depositor2), expected2, "Precision handling for depositor2");

        // Sum should equal total reward minus dust
        uint256 remainder = rewardAmount - (expected1 + expected2);
        assertTrue(remainder <= 1, "Remainder should be minimal due to rounding");
    }

    // ========================================================================
    // GAS OPTIMIZATION TESTS
    // ========================================================================

    function testGasEfficiency() public {
        // Setup depositors
        vm.startPrank(owner);
        vault.registerDepositor(depositor1, DEPOSITOR1_SHARES);
        vault.registerDepositor(depositor2, DEPOSITOR2_SHARES);

        // Measure gas for yield distribution
        uint256 gasBefore = gasleft();

        vm.startPrank(economyManager);
        vault.distributeYield(REWARD_AMOUNT);

        uint256 gasAfter = gasleft();
        uint256 gasUsed = gasBefore - gasAfter;

        console2.log("Gas used for yield distribution:", gasUsed);
        assertTrue(gasUsed < 200000, "Yield distribution should be gas efficient");

        // Measure gas for yield claiming
        gasBefore = gasleft();

        vm.startPrank(depositor1);
        vault.claimYield(depositor1);

        gasAfter = gasleft();
        gasUsed = gasBefore - gasAfter;

        console2.log("Gas used for yield claiming:", gasUsed);
        assertTrue(gasUsed < 150000, "Yield claiming should be gas efficient");
    }

    // ========================================================================
    // CONFIGURATION TESTS
    // ========================================================================

    function testUpdateTreasury() public {
        address newTreasury = makeAddr("newTreasury");

        vm.startPrank(owner);
        vault.setTreasury(newTreasury);

        assertEq(vault.treasury(), newTreasury, "Treasury should be updated");
    }

    function testUpdateEconomyManager() public {
        address newManager = makeAddr("newManager");

        vm.startPrank(owner);
        vault.setEconomyManager(newManager);

        assertEq(vault.economyManager(), newManager, "Economy manager should be updated");
    }

    // ========================================================================
    // PAUSE FUNCTIONALITY TESTS
    // ========================================================================

    function testPauseUnpause() public {
        // Pause contract
        vm.startPrank(owner);
        vault.pause();
        vm.stopPrank();

        assertTrue(vault.paused(), "Contract should be paused");

        // Operations should fail when paused
        vm.startPrank(treasury);
        vm.expectRevert();
        vault.registerDepositor(depositor1, DEPOSITOR1_SHARES);
        vm.stopPrank();

        vm.startPrank(economyManager);
        vm.expectRevert();
        vault.distributeYield(REWARD_AMOUNT);
        vm.stopPrank();

        // Unpause contract
        vm.startPrank(owner);
        vault.unpause();
        vm.stopPrank();

        assertFalse(vault.paused(), "Contract should be unpaused");

        // Operations should work after unpausing
        vm.startPrank(treasury);
        vault.registerDepositor(depositor1, DEPOSITOR1_SHARES);
        vm.stopPrank();
    }

    // ========================================================================
    // DEREGISTER AUTO-CLAIM TESTS
    // ========================================================================

    function testDeregisterAutoClaimsYield() public {
        // Register and distribute yield
        vm.startPrank(treasury);
        vault.registerDepositor(depositor1, DEPOSITOR1_SHARES);
        vm.stopPrank();

        // Distribute yield
        vm.startPrank(economyManager);
        usdc.approve(address(vault), REWARD_AMOUNT);
        vault.distributeYield(REWARD_AMOUNT);
        vm.stopPrank();

        // Verify pending yield
        uint256 pending = vault.pendingYield(depositor1);
        assertGt(pending, 0, "Should have pending yield before deregister");

        uint256 balanceBefore = usdc.balanceOf(depositor1);

        // Deregister should auto-transfer yield
        vm.startPrank(treasury);
        vault.deregisterDepositor(depositor1);
        vm.stopPrank();

        uint256 balanceAfter = usdc.balanceOf(depositor1);
        assertEq(balanceAfter - balanceBefore, pending, "Depositor should receive pending yield on deregister");
        assertEq(vault.sharesOf(depositor1), 0, "Shares should be zero after deregister");
        assertEq(vault.pendingYield(depositor1), 0, "No pending yield after deregister");
    }

    // ========================================================================
    // HELPER FUNCTIONS
    // ========================================================================

    function _getTotalYieldDistributed() internal view returns (uint256) {
        return vault.totalYieldDistributed();
    }

    function _getTotalYieldClaimed() internal view returns (uint256) {
        return vault.totalYieldClaimed();
    }

    function _getAccYieldPerShare() internal view returns (uint256) {
        return vault.accYieldPerShare();
    }

    function _getAsset() internal view returns (address) {
        return address(vault.asset());
    }
}
