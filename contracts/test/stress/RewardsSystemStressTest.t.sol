// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Test, console2} from "forge-std/Test.sol";
import {DepositorVault} from "../../src/economy/DepositorVault.sol";
import {BuybackVault} from "../../src/economy/BuybackVault.sol";
import {GachaTreasury} from "../../src/gacha/GachaTreasury.sol";
import {BaseERC20} from "../../src/tokens/BaseERC20.sol";
import {BaseERC721} from "../../src/tokens/BaseERC721.sol";
import {MockNFTAppraisal} from "../mocks/MockNFTAppraisal.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";

/**
 * @title Rewards System Stress Tests
 * @notice Comprehensive stress testing of the rewards distribution system
 * @dev Tests edge cases, boundary conditions, and high-volume scenarios
 */
contract RewardsSystemStressTest is Test {
    DepositorVault public vault;
    BuybackVault public buyback;
    GachaTreasury public treasury;
    BaseERC20 public usdc;
    BaseERC721 public collection;
    MockNFTAppraisal public mockAppraisal;

    address public owner = address(0x1);
    address public economy = address(0x2);

    // Test constants
    uint256 public constant PRECISION = 1e18;
    uint256 public constant USDC_PRECISION = 1e6;
    uint256 public constant CONVERSION = 1e12;
    uint256 public constant SPIN_FEE = 10 * USDC_PRECISION; // $10 USDC

    // Large numbers for stress testing
    uint256 public constant HUGE_REWARD = 1_000_000 * 1e6; // $1M USDC
    uint256 public constant MANY_DEPOSITORS = 100;
    uint256 public constant MANY_ITERATIONS = 1000;

    struct DepositorState {
        uint256 shares;
        uint256 pending;
        uint256 claimed;
        uint256 totalReceived;
    }

    event YieldDistributed(address indexed from, uint256 amount);
    event YieldClaimed(address indexed account, address indexed recipient, uint256 amount);

    function setUp() public {
        // Deploy tokens
        usdc = new BaseERC20("USDC", "USDC", owner);
        collection = new BaseERC721("Test", "TEST", owner);
        mockAppraisal = new MockNFTAppraisal();

        // Deploy treasury first
        vm.startPrank(owner);
        GachaTreasury treasuryImpl = new GachaTreasury();
        bytes memory treasuryInit = abi.encodeWithSelector(
            GachaTreasury.initialize.selector,
            owner,
            address(this), // Mock gacha contract
            address(mockAppraisal)
        );
        ERC1967Proxy treasuryProxy = new ERC1967Proxy(address(treasuryImpl), treasuryInit);
        treasury = GachaTreasury(address(treasuryProxy));

        // Deploy vault
        DepositorVault vaultImpl = new DepositorVault();
        vault = DepositorVault(address(vaultImpl));
        vault.initialize(owner, address(usdc), address(treasury), economy);

        // Deploy buyback vault
        BuybackVault buybackImpl = new BuybackVault();
        buyback = BuybackVault(address(buybackImpl));
        buyback.initialize(owner, address(usdc), address(treasury), address(vault), address(mockAppraisal), economy);

        // Link buyback vault to depositor vault for staking flows
        vault.setBuybackVault(address(buyback));

        // Fund owner with massive amounts for stress testing
        usdc.mint(owner, HUGE_REWARD * 100);
        vm.stopPrank();
    }

    /**
     * @notice Test reward precision with tiny amounts
     */
    function testTinyRewardPrecision() public {
        address depositor = address(0x10);
        uint256 tinyShares = 1; // Single share unit

        // Register depositor with minimal shares
        vm.prank(address(treasury));
        vault.registerDepositor(depositor, tinyShares);

        // Distribute tiny reward
        uint256 tinyReward = 1; // 1 wei (smallest possible)
        _distributeReward(tinyReward);

        uint256 pending = vault.pendingYield(depositor);
        assertEq(pending, tinyReward, "Should handle tiny rewards precisely");
    }

    /**
     * @notice Test reward overflow with huge amounts
     */
    function testHugeRewardOverflow() public {
        address depositor = address(0x11);
        uint256 hugeShares = 1_000_000 * PRECISION;

        vm.prank(address(treasury));
        vault.registerDepositor(depositor, hugeShares);

        // Distribute massive reward
        _distributeReward(HUGE_REWARD);

        uint256 pending = vault.pendingYield(depositor);
        assertEq(pending, HUGE_REWARD, "Single large depositor should receive entire reward");
    }

    /**
     * @notice Test maximum number of depositors
     */
    function testMaximumDepositors() public {
        address[] memory depositors = new address[](MANY_DEPOSITORS);
        uint256[] memory shares = new uint256[](MANY_DEPOSITORS);

        // Create many depositors
        for (uint256 i = 0; i < MANY_DEPOSITORS; i++) {
            depositors[i] = address(uint160(0x1000 + i));
            shares[i] = (i + 1) * 1000 * PRECISION; // Varied share amounts

            vm.prank(address(treasury));
            vault.registerDepositor(depositors[i], shares[i]);
        }

        // Distribute rewards
        uint256 totalReward = MANY_DEPOSITORS * SPIN_FEE;
        _distributeReward(totalReward);

        // Verify all depositors got rewards proportional to shares
        for (uint256 i = 0; i < MANY_DEPOSITORS; i++) {
            uint256 pending = vault.pendingYield(depositors[i]);
            uint256 expectedShare = Math.mulDiv(totalReward, shares[i], vault.totalShares());

            // Allow for small rounding differences
            assertApproxEqAbs(pending, expectedShare, 1e6, "Rewards should be proportional");
        }
    }

    /**
     * @notice Test rapid reward distribution cycles
     */
    function testRapidDistributionCycles() public {
        address depositor = address(0x12);
        uint256 shares = 10000 * PRECISION;

        vm.prank(address(treasury));
        vault.registerDepositor(depositor, shares);

        // Rapid distribution cycles
        for (uint256 i = 0; i < MANY_ITERATIONS; i++) {
            _distributeReward(SPIN_FEE);
        }

        uint256 totalExpected = MANY_ITERATIONS * SPIN_FEE;
        uint256 pending = vault.pendingYield(depositor);

        assertEq(pending, totalExpected, "Should accumulate rewards over many cycles");
    }

    /**
     * @notice Test claiming after many reward accumulations
     */
    function testAccumulationAndClaiming() public {
        address depositor = address(0x13);
        uint256 shares = 5000 * PRECISION;

        vm.prank(address(treasury));
        vault.registerDepositor(depositor, shares);

        // Accumulate rewards over time
        uint256 totalDistributed = 0;
        for (uint256 i = 0; i < 100; i++) {
            uint256 reward = (i + 1) * SPIN_FEE; // Variable rewards
            _distributeReward(reward);
            totalDistributed += reward;
        }

        // Claim all at once
        uint256 balanceBefore = usdc.balanceOf(depositor);
        vm.prank(depositor);
        uint256 claimed = vault.claimYield(depositor, depositor);

        assertEq(claimed, totalDistributed, "Should claim all accumulated rewards");
        assertEq(usdc.balanceOf(depositor), balanceBefore + totalDistributed, "Should receive full amount");
        assertEq(vault.pendingYield(depositor), 0, "Should have no pending after claim");
    }

    /**
     * @notice Test partial claiming scenarios
     */
    function testPartialClaiming() public {
        address depositor = address(0x14);
        uint256 shares = 10000 * PRECISION;

        vm.prank(address(treasury));
        vault.registerDepositor(depositor, shares);

        // Distribute large reward
        _distributeReward(HUGE_REWARD);

        uint256 balanceBefore = usdc.balanceOf(depositor);

        vm.prank(depositor);
        uint256 claimed = vault.claimYield(depositor, depositor);
        assertEq(claimed, HUGE_REWARD, "Should claim entire pending amount");

        // Subsequent claims should revert with nothing to claim
        vm.prank(depositor);
        vm.expectRevert("DepositorVault: nothing to claim");
        vault.claimYield(depositor, depositor);

        assertEq(
            usdc.balanceOf(depositor),
            balanceBefore + HUGE_REWARD,
            "Should receive total amount across claims"
        );
    }

    /**
     * @notice Test share updates with rewards pending
     */
    function testShareUpdatesWithPendingRewards() public {
        address depositor = address(0x15);
        uint256 initialShares = 1000 * PRECISION;

        vm.prank(address(treasury));
        vault.registerDepositor(depositor, initialShares);

        // Distribute rewards
        _distributeReward(SPIN_FEE * 10);

        uint256 pendingBefore = vault.pendingYield(depositor);

        // Update shares (increase)
        uint256 newShares = 2000 * PRECISION;
        vm.prank(address(treasury));
        vault.updateDepositor(depositor, newShares);

        uint256 pendingAfter = vault.pendingYield(depositor);
        assertEq(pendingAfter, pendingBefore, "Pending rewards should be preserved during share update");

        // Update shares (decrease)
        uint256 finalShares = 500 * PRECISION;
        vm.prank(address(treasury));
        vault.updateDepositor(depositor, finalShares);

        uint256 pendingFinal = vault.pendingYield(depositor);
        assertEq(pendingFinal, pendingBefore, "Pending rewards should be preserved during decrease");
    }

    /**
     * @notice Test depositor removal with rewards
     */
    function testDepositorRemoval() public {
        address depositor = address(0x16);
        uint256 shares = 10000 * PRECISION;

        vm.prank(address(treasury));
        vault.registerDepositor(depositor, shares);

        // Distribute rewards
        _distributeReward(SPIN_FEE * 100);

        uint256 pending = vault.pendingYield(depositor);
        uint256 balanceBefore = usdc.balanceOf(depositor);

        // Claim before removal
        vm.prank(depositor);
        uint256 claimed = vault.claimYield(depositor, depositor);

        // Remove depositor
        vm.prank(address(treasury));
        vault.deregisterDepositor(depositor);

        assertEq(vault.sharesOf(depositor), 0, "Shares should be zero after removal");
        assertEq(vault.pendingYield(depositor), 0, "No pending rewards after removal");
        assertEq(claimed, pending, "Should claim all before removal");
        assertEq(usdc.balanceOf(depositor), balanceBefore + claimed, "Should receive all rewards");
    }

    /**
     * @notice Test buyback vault staking with rewards
     */
    function testBuybackStakingWithRewards() public {
        // Setup buyback vault as depositor
        uint256 stakeLiquidity = SPIN_FEE * 1000;
        uint256 stakeAmount = (stakeLiquidity * buyback.maxStakeBps()) / 10_000;
        assertGt(stakeAmount, 0, "Stake amount should respect cap");

        // Stake liquidity
        vm.startPrank(owner);
        usdc.transfer(address(buyback), stakeLiquidity);
        buyback.stakeSurplus(stakeAmount);
        vm.stopPrank();

        // Distribute rewards
        _distributeReward(SPIN_FEE * 500);

        // Check buyback vault earned rewards
        uint256 buybackPending = vault.pendingYield(address(buyback));
        assertGt(buybackPending, 0, "Buyback vault should earn rewards on staked liquidity");

        // Unstake and check rewards are preserved
        vm.prank(owner);
        buyback.unstakeSurplus(stakeAmount);

        uint256 pendingAfter = vault.pendingYield(address(buyback));
        assertEq(pendingAfter, buybackPending, "Rewards should be preserved after unstaking");
    }

    /**
     * @notice Test rounding edge cases
     */
    function testRoundingEdgeCases() public {
        address[] memory depositors = new address[](3);
        depositors[0] = address(0x20);
        depositors[1] = address(0x21);
        depositors[2] = address(0x22);

        // Create uneven share distribution that could cause rounding issues
        uint256[] memory shares = new uint256[](3);
        shares[0] = 1 * PRECISION; // Minimal shares
        shares[1] = 2 * PRECISION;
        shares[2] = 3 * PRECISION;

        for (uint256 i = 0; i < 3; i++) {
            vm.prank(address(treasury));
            vault.registerDepositor(depositors[i], shares[i]);
        }

        // Distribute amount that doesn't divide evenly
        uint256 awkwardAmount = 100 * USDC_PRECISION + 7; // Not divisible by 6
        _distributeReward(awkwardAmount);

        uint256 totalClaimed = 0;
        for (uint256 i = 0; i < 3; i++) {
            uint256 pending = vault.pendingYield(depositors[i]);
            vm.prank(depositors[i]);
            uint256 claimed = vault.claimYield(depositors[i], depositors[i]);
            totalClaimed += claimed;
        }

        // Total claimed should equal distributed amount (allowing for dust)
        assertApproxEqRel(totalClaimed, awkwardAmount, 1e12, "Total claimed should match distributed");
    }

    /**
     * @notice Test zero shares edge case
     */
    function testZeroSharesEdgeCase() public {
        address depositor = address(0x23);

        // Should not be able to register with zero shares
        vm.expectRevert();
        vm.prank(address(treasury));
        vault.registerDepositor(depositor, 0);

        // Register normally first
        vm.prank(address(treasury));
        vault.registerDepositor(depositor, 1000 * PRECISION);

        // Try to update to zero shares
        vm.expectRevert();
        vm.prank(address(treasury));
        vault.updateDepositor(depositor, 0);
    }

    /**
     * @notice Test massive concurrent operations
     */
    function testMassiveConcurrentOperations() public {
        address[] memory depositors = new address[](50);
        uint256[] memory shares = new uint256[](50);

        // Setup many depositors
        for (uint256 i = 0; i < 50; i++) {
            depositors[i] = address(uint160(0x2000 + i));
            shares[i] = (i + 1) * 100 * PRECISION;

            vm.prank(address(treasury));
            vault.registerDepositor(depositors[i], shares[i]);
        }

        // Rapid distribution and claiming cycles
        for (uint256 cycle = 0; cycle < 10; cycle++) {
            // Distribute
            _distributeReward(SPIN_FEE * 100);

            // Some depositors claim
            for (uint256 i = 0; i < 10; i++) {
                address claimer = depositors[(cycle * 10 + i) % 50];
                if (vault.pendingYield(claimer) > 0) {
                    vm.prank(claimer);
                    vault.claimYield(claimer, claimer);
                }
            }
        }

        // Final claim for all
        uint256 totalFinalClaimed = 0;
        for (uint256 i = 0; i < 50; i++) {
            uint256 pending = vault.pendingYield(depositors[i]);
            if (pending > 0) {
                vm.prank(depositors[i]);
                uint256 claimed = vault.claimYield(depositors[i], depositors[i]);
                totalFinalClaimed += claimed;
            }
        }

        assertGt(totalFinalClaimed, 0, "Should have distributed and claimed rewards");
    }

    // Helper functions

    function _distributeReward(uint256 amount) internal {
        vm.startPrank(owner);
        usdc.transfer(economy, amount);
        vm.stopPrank();

        vm.startPrank(economy);
        usdc.approve(address(vault), amount);
        vault.distributeYield(amount);
        vm.stopPrank();
    }
}
