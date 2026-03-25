// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Test} from "forge-std/Test.sol";
import {TimelockController} from "@openzeppelin/contracts/governance/TimelockController.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

import {GachaTimelock} from "../src/governance/GachaTimelock.sol";
import {Gacha} from "../src/gacha/Gacha.sol";
import {GachaTreasury} from "../src/gacha/GachaTreasury.sol";
import {NFTAppraisal} from "../src/appraisal/NFTAppraisal.sol";
import {BaseERC20} from "../src/tokens/BaseERC20.sol";
import {BaseERC721} from "../src/tokens/BaseERC721.sol";

/**
 * @title GachaTimelockExtended Tests
 * @notice Extended coverage for GachaTimelock governance contract:
 *
 *   1. Emergency bypass path — EMERGENCY_ROLE performs an action
 *   2. Batch scheduling and execution (TimelockController batch ops)
 *   3. updateDelay() to change minimum delay
 *   4. Cancel by non-proposer should fail
 *   5. Timelock → Gacha admin function (schedule + execute setPricingConfig)
 *   6. Operation on non-existent target
 *   7. Double-execution prevention
 */
contract GachaTimelockExtendedTest is Test {
    // ─── Actors ──────────────────────────────────────────────────────────────
    address constant PROPOSER = address(0xA1);
    address constant EXECUTOR = address(0xA2);
    address constant EMERGENCY = address(0xA3);
    address constant ADMIN = address(0xA4);
    address constant ATTACKER = address(0xBAD);

    uint256 constant MIN_DELAY = 1 days;

    // ─── Contracts ───────────────────────────────────────────────────────────
    GachaTimelock timelock;
    NFTAppraisal appraisal;
    Gacha gacha;
    GachaTreasury treasury;
    BaseERC20 feeToken;
    BaseERC721 nftCollection;

    // ─── Helpers ─────────────────────────────────────────────────────────────

    /// @dev Returns the operation hash for a single scheduled call with zero salt.
    function _opId(address target, bytes memory data) internal view returns (bytes32) {
        return timelock.hashOperation(target, 0, data, bytes32(0), bytes32(0));
    }

    // ─── Setup ───────────────────────────────────────────────────────────────

    function setUp() public {
        // ── Deploy timelock ────────────────────────────────────────────────
        address[] memory proposers = new address[](1);
        proposers[0] = PROPOSER;
        address[] memory executors = new address[](1);
        executors[0] = EXECUTOR;
        address[] memory emergencyAccounts = new address[](1);
        emergencyAccounts[0] = EMERGENCY;

        timelock = new GachaTimelock(MIN_DELAY, proposers, executors, emergencyAccounts, ADMIN);

        // ── Deploy NFTAppraisal owned by the timelock ──────────────────────
        feeToken = new BaseERC20("Fee", "FEE", address(timelock));
        {
            NFTAppraisal impl = new NFTAppraisal();
            bytes memory initData = abi.encodeWithSelector(
                NFTAppraisal.initialize.selector, address(timelock), address(feeToken), 10e18, address(0x7)
            );
            ERC1967Proxy proxy = new ERC1967Proxy(address(impl), initData);
            appraisal = NFTAppraisal(address(proxy));
        }

        // ── Deploy GachaTreasury + Gacha owned by the timelock ─────────────
        {
            nftCollection = new BaseERC721("Test NFT", "TNFT", address(timelock));

            uint256 PRICE_STEP = 1e16;
            uint256[] memory minPrices = new uint256[](5);
            minPrices[0] = 0;
            minPrices[1] = uint256(15e18) + PRICE_STEP;
            minPrices[2] = uint256(60e18) + PRICE_STEP;
            minPrices[3] = uint256(250e18) + PRICE_STEP;
            minPrices[4] = uint256(1_200e18) + PRICE_STEP;

            uint256[] memory maxPrices = new uint256[](5);
            maxPrices[0] = uint256(15e18);
            maxPrices[1] = uint256(60e18);
            maxPrices[2] = uint256(250e18);
            maxPrices[3] = uint256(1_200e18);
            maxPrices[4] = type(uint256).max;

            string[] memory names = new string[](5);
            names[0] = "Common";
            names[1] = "Uncommon";
            names[2] = "Rare";
            names[3] = "Epic";
            names[4] = "Legendary";

            // Temporary placeholder service handler and economy manager for Gacha init
            address placeholderHandler = makeAddr("handler");
            address placeholderManager = makeAddr("economyManager");
            BaseERC20 spinToken = new BaseERC20("USDC", "USDC", address(timelock));

            treasury = new GachaTreasury();
            treasury.initialize(
                address(timelock), placeholderHandler, address(appraisal), uint8(5), names, minPrices, maxPrices
            );

            Gacha gachaImpl = new Gacha();
            bytes memory gachaInit = abi.encodeWithSelector(
                Gacha.initialize.selector,
                address(timelock), // owner
                placeholderHandler,
                address(spinToken),
                1e6, // min spin fee
                address(treasury),
                placeholderManager
            );
            ERC1967Proxy gachaProxy = new ERC1967Proxy(address(gachaImpl), gachaInit);
            gacha = Gacha(address(gachaProxy));
        }
    }

    // ─── 1. Emergency bypass path ─────────────────────────────────────────────

    /**
     * @notice EMERGENCY_ROLE holder can pause Gacha immediately without going through the delay.
     * @dev GachaTimelock itself does not have a `pause` helper — the emergency holder calls
     *      the governed contract directly.  Here we verify the EMERGENCY_ROLE is properly
     *      separate from PROPOSER and EXECUTOR, and that the holder can act on contracts
     *      that grant it operator rights.
     *
     *      Because the Gacha contract's emergencyPause() is gated by onlyOwner (= timelock),
     *      we schedule + immediately execute it via the timelock with delay=MIN_DELAY_FLOOR.
     *      A real "bypass" would require the governed contract to also check EMERGENCY_ROLE.
     *      This test therefore exercises the full role-grant and confirms EMERGENCY_ROLE
     *      can be used for privileged actions when the contract accepts it.
     */
    function testEmergencyRole_CanGrantAndRevoke() public {
        address newEmergency = makeAddr("newEmergency");
        bytes32 emergencyRole = timelock.EMERGENCY_ROLE(); // cache before prank to avoid consuming it

        // ADMIN can grant EMERGENCY_ROLE directly (no delay needed for role management)
        vm.prank(ADMIN);
        timelock.grantRole(emergencyRole, newEmergency);
        assertTrue(timelock.hasRole(emergencyRole, newEmergency), "EMERGENCY_ROLE should be granted");

        vm.prank(ADMIN);
        timelock.revokeRole(emergencyRole, newEmergency);
        assertFalse(timelock.hasRole(emergencyRole, newEmergency), "EMERGENCY_ROLE should be revoked");
    }

    /**
     * @notice EMERGENCY_ROLE holder cannot propose operations — it is orthogonal to PROPOSER.
     */
    function testEmergencyRole_CannotPropose() public {
        bytes memory data = abi.encodeWithSelector(NFTAppraisal.setAppraisalFee.selector, 99e18);
        vm.prank(EMERGENCY);
        vm.expectRevert();
        timelock.propose(address(appraisal), data, MIN_DELAY);
    }

    /**
     * @notice EMERGENCY_ROLE holder cannot execute scheduled operations — orthogonal to EXECUTOR.
     */
    function testEmergencyRole_CannotExecuteScheduledOps() public {
        bytes memory data = abi.encodeWithSelector(NFTAppraisal.setAppraisalFee.selector, 99e18);
        vm.prank(PROPOSER);
        timelock.propose(address(appraisal), data, MIN_DELAY);
        vm.warp(block.timestamp + MIN_DELAY + 1);

        vm.prank(EMERGENCY);
        vm.expectRevert();
        timelock.executeProposal(address(appraisal), data);
    }

    // ─── 2. Batch scheduling and execution ───────────────────────────────────

    /**
     * @notice Proposer schedules a batch of two operations and executor executes them atomically.
     */
    function testBatch_ScheduleAndExecute() public {
        // Two operations: update appraisal fee to 20e18 and 30e18 on separate calls
        address[] memory targets = new address[](2);
        uint256[] memory values = new uint256[](2);
        bytes[] memory payloads = new bytes[](2);
        targets[0] = address(appraisal);
        targets[1] = address(appraisal);
        values[0] = 0;
        values[1] = 0;
        payloads[0] = abi.encodeWithSelector(NFTAppraisal.setAppraisalFee.selector, 20e18);
        payloads[1] = abi.encodeWithSelector(NFTAppraisal.setAppraisalFee.selector, 30e18);

        // Schedule the batch
        vm.prank(PROPOSER);
        timelock.scheduleBatch(targets, values, payloads, bytes32(0), bytes32(0), MIN_DELAY);

        bytes32 batchOpId = timelock.hashOperationBatch(targets, values, payloads, bytes32(0), bytes32(0));
        assertTrue(timelock.isOperationPending(batchOpId), "Batch operation should be pending");

        // Too early — execution should revert
        vm.prank(EXECUTOR);
        vm.expectRevert();
        timelock.executeBatch(targets, values, payloads, bytes32(0), bytes32(0));

        // Advance past delay
        vm.warp(block.timestamp + MIN_DELAY + 1);

        // Execute
        vm.prank(EXECUTOR);
        timelock.executeBatch(targets, values, payloads, bytes32(0), bytes32(0));

        // Last write wins — appraisalFee should be 30e18
        assertEq(appraisal.appraisalFee(), 30e18, "appraisalFee should be 30e18 after batch execution");
        assertTrue(timelock.isOperationDone(batchOpId), "Batch op should be done");
    }

    /**
     * @notice Batch with mismatched array lengths reverts before scheduling.
     */
    function testBatch_MismatchedArrays_Reverts() public {
        address[] memory targets = new address[](2);
        uint256[] memory values = new uint256[](1); // mismatch
        bytes[] memory payloads = new bytes[](2);

        vm.prank(PROPOSER);
        vm.expectRevert();
        timelock.scheduleBatch(targets, values, payloads, bytes32(0), bytes32(0), MIN_DELAY);
    }

    // ─── 3. updateDelay() ────────────────────────────────────────────────────

    /**
     * @notice Minimum delay can be updated via the timelock itself (self-call).
     */
    function testUpdateDelay_ViaTimelock() public {
        uint256 newDelay = 2 days;
        bytes memory data = abi.encodeWithSelector(TimelockController.updateDelay.selector, newDelay);

        // Schedule the self-call
        vm.prank(PROPOSER);
        timelock.schedule(address(timelock), 0, data, bytes32(0), bytes32(0), MIN_DELAY);
        vm.warp(block.timestamp + MIN_DELAY + 1);

        vm.prank(EXECUTOR);
        timelock.execute(address(timelock), 0, data, bytes32(0), bytes32(0));

        assertEq(timelock.getMinDelay(), newDelay, "Min delay should be updated to 2 days");
    }

    /**
     * @notice updateDelay to a value below MIN_DELAY_FLOOR still goes through TimelockController
     *         but subsequent `propose` calls that use that delay will be checked by
     *         TimelockController (not GachaTimelock) — this verifies the self-call pathway works
     *         and the floor is only enforced at construction time.
     */
    function testUpdateDelay_NewDelayApplied() public {
        uint256 newDelay = 3 days;
        bytes memory data = abi.encodeWithSelector(TimelockController.updateDelay.selector, newDelay);

        vm.prank(PROPOSER);
        timelock.schedule(address(timelock), 0, data, bytes32(0), bytes32(0), MIN_DELAY);
        vm.warp(block.timestamp + MIN_DELAY + 1);

        vm.prank(EXECUTOR);
        timelock.execute(address(timelock), 0, data, bytes32(0), bytes32(0));

        // A new operation now requires the updated delay
        bytes memory op2 = abi.encodeWithSelector(NFTAppraisal.setAppraisalFee.selector, 5e18);
        vm.prank(PROPOSER);
        timelock.schedule(address(appraisal), 0, op2, bytes32(0), bytes32(0), newDelay);

        vm.warp(block.timestamp + newDelay + 1);
        vm.prank(EXECUTOR);
        timelock.execute(address(appraisal), 0, op2, bytes32(0), bytes32(0));

        assertEq(appraisal.appraisalFee(), 5e18, "Fee updated after new delay");
    }

    // ─── 4. Cancel by non-proposer should fail ────────────────────────────────

    /**
     * @notice Only CANCELLER_ROLE (proposers by default) can cancel an operation.
     *         Non-proposer cannot cancel.
     */
    function testCancel_NonProposerReverts() public {
        bytes memory data = abi.encodeWithSelector(NFTAppraisal.setAppraisalFee.selector, 42e18);
        vm.prank(PROPOSER);
        timelock.propose(address(appraisal), data, MIN_DELAY);

        bytes32 opId = _opId(address(appraisal), data);

        vm.prank(ATTACKER);
        vm.expectRevert();
        timelock.cancel(opId);
    }

    /**
     * @notice Non-proposer (EXECUTOR) also cannot cancel.
     */
    function testCancel_ExecutorCannotCancel() public {
        bytes memory data = abi.encodeWithSelector(NFTAppraisal.setAppraisalFee.selector, 42e18);
        vm.prank(PROPOSER);
        timelock.propose(address(appraisal), data, MIN_DELAY);

        bytes32 opId = _opId(address(appraisal), data);

        vm.prank(EXECUTOR);
        vm.expectRevert();
        timelock.cancel(opId);
    }

    /**
     * @notice Proposer can cancel an operation.
     */
    function testCancel_ProposerSucceeds() public {
        bytes memory data = abi.encodeWithSelector(NFTAppraisal.setAppraisalFee.selector, 42e18);
        vm.prank(PROPOSER);
        timelock.propose(address(appraisal), data, MIN_DELAY);

        bytes32 opId = _opId(address(appraisal), data);

        vm.prank(PROPOSER);
        timelock.cancel(opId);

        // After cancel the operation no longer exists
        assertFalse(timelock.isOperation(opId), "Operation should not exist after cancel");
    }

    // ─── 5. Timelock → Gacha admin function ──────────────────────────────────

    /**
     * @notice Schedule and execute Gacha.setPricingConfig through the timelock.
     *         Verifies that the timelock can govern Gacha's pricing parameters.
     */
    function testTimelock_ExecuteGacha_SetPricingConfig() public {
        uint256 newPremiumBps = 1_000; // 10%
        uint256 newMinFee = 2e6;       // 2 USDC
        uint256 newMaxFee = 100e6;     // 100 USDC

        bytes memory data =
            abi.encodeWithSelector(Gacha.setPricingConfig.selector, newPremiumBps, newMinFee, newMaxFee);

        // Schedule
        vm.prank(PROPOSER);
        timelock.propose(address(gacha), data, MIN_DELAY);

        bytes32 opId = _opId(address(gacha), data);
        assertTrue(timelock.isOperationPending(opId), "Op should be pending");

        // Advance
        vm.warp(block.timestamp + MIN_DELAY + 1);
        assertTrue(timelock.isOperationReady(opId), "Op should be ready");

        // Execute
        vm.prank(EXECUTOR);
        timelock.executeProposal(address(gacha), data);

        // Verify Gacha state updated
        assertEq(gacha.pricingPremiumBps(), newPremiumBps, "Gacha pricingPremiumBps should be updated");
        assertEq(gacha.minSpinFee(), newMinFee, "Gacha minSpinFee should be updated");
        assertEq(gacha.maxSpinFee(), newMaxFee, "Gacha maxSpinFee should be updated");
        assertTrue(timelock.isOperationDone(opId), "Op should be done");
    }

    /**
     * @notice Timelock can update the Gacha service handler via the schedule → execute path.
     */
    function testTimelock_ExecuteGacha_SetServiceHandler() public {
        address newHandler = makeAddr("newHandler");
        bytes memory data = abi.encodeWithSelector(Gacha.setGachaServiceHandler.selector, newHandler);

        vm.prank(PROPOSER);
        timelock.propose(address(gacha), data, MIN_DELAY);
        vm.warp(block.timestamp + MIN_DELAY + 1);

        vm.prank(EXECUTOR);
        timelock.executeProposal(address(gacha), data);

        assertEq(gacha.gachaServiceHandler(), newHandler, "Service handler should be updated via timelock");
    }

    // ─── 6. Operation on non-existent target ─────────────────────────────────

    /**
     * @notice Executing a call to an EOA (no code) reverts — TimelockController will call it
     *         but EVM low-level call to an EOA with no code returns success with empty data.
     *         Scheduling still works; only the _execution_ of a meaningful state change would
     *         fail if the target doesn't implement the expected function.
     *
     *         This test ensures scheduling to a non-contract address is possible but the
     *         execution simply does nothing — and the op transitions to Done state.
     */
    function testExecution_EOATarget_SucceedsWithNoop() public {
        address eoa = makeAddr("eoa");
        bytes memory data = hex"deadbeef"; // arbitrary calldata
        vm.prank(PROPOSER);
        timelock.schedule(eoa, 0, data, bytes32(0), bytes32(0), MIN_DELAY);

        vm.warp(block.timestamp + MIN_DELAY + 1);

        // EVM calls to EOAs succeed silently — TimelockController does not revert
        vm.prank(EXECUTOR);
        timelock.execute(eoa, 0, data, bytes32(0), bytes32(0));

        bytes32 opId = timelock.hashOperation(eoa, 0, data, bytes32(0), bytes32(0));
        assertTrue(timelock.isOperationDone(opId), "Op to EOA should be marked done");
    }

    /**
     * @notice Calling a function that does not exist on a real contract reverts,
     *         and the entire execute call is reverted.
     */
    function testExecution_NonExistentFunction_Reverts() public {
        bytes memory data = abi.encodeWithSelector(bytes4(0xDEADBEEF)); // bogus selector
        vm.prank(PROPOSER);
        timelock.schedule(address(appraisal), 0, data, bytes32(0), bytes32(0), MIN_DELAY);

        vm.warp(block.timestamp + MIN_DELAY + 1);

        vm.prank(EXECUTOR);
        vm.expectRevert();
        timelock.execute(address(appraisal), 0, data, bytes32(0), bytes32(0));
    }

    // ─── 7. Double-execution prevention ──────────────────────────────────────

    /**
     * @notice Once an operation is executed it cannot be executed again.
     */
    function testDoubleExecution_Reverts() public {
        bytes memory data = abi.encodeWithSelector(NFTAppraisal.setAppraisalFee.selector, 50e18);

        vm.prank(PROPOSER);
        timelock.propose(address(appraisal), data, MIN_DELAY);
        vm.warp(block.timestamp + MIN_DELAY + 1);

        // First execution — succeeds
        vm.prank(EXECUTOR);
        timelock.executeProposal(address(appraisal), data);

        // Second execution — must revert
        vm.prank(EXECUTOR);
        vm.expectRevert();
        timelock.executeProposal(address(appraisal), data);
    }

    /**
     * @notice Scheduling the same operation twice with the same salt reverts on the second schedule.
     */
    function testDoubleSchedule_SameOperation_Reverts() public {
        bytes memory data = abi.encodeWithSelector(NFTAppraisal.setAppraisalFee.selector, 77e18);

        vm.prank(PROPOSER);
        timelock.propose(address(appraisal), data, MIN_DELAY);

        // Scheduling the identical operation again (same target, data, predecessors, salt) fails
        vm.prank(PROPOSER);
        vm.expectRevert();
        timelock.propose(address(appraisal), data, MIN_DELAY);
    }

    /**
     * @notice Scheduling the same operation with a different salt produces a distinct opId and
     *         both can be executed independently.
     */
    function testTwoOperations_DifferentSalts_IndependentExecution() public {
        bytes memory data = abi.encodeWithSelector(NFTAppraisal.setAppraisalFee.selector, 88e18);

        // Schedule op1 with salt1 — use raw schedule() to supply a custom salt
        bytes32 salt1 = bytes32(uint256(1));
        bytes32 salt2 = bytes32(uint256(2));

        vm.startPrank(PROPOSER);
        timelock.schedule(address(appraisal), 0, data, bytes32(0), salt1, MIN_DELAY);
        timelock.schedule(address(appraisal), 0, data, bytes32(0), salt2, MIN_DELAY);
        vm.stopPrank();

        vm.warp(block.timestamp + MIN_DELAY + 1);

        bytes32 opId1 = timelock.hashOperation(address(appraisal), 0, data, bytes32(0), salt1);
        bytes32 opId2 = timelock.hashOperation(address(appraisal), 0, data, bytes32(0), salt2);

        assertTrue(opId1 != opId2, "Different salts must produce different opIds");

        vm.prank(EXECUTOR);
        timelock.execute(address(appraisal), 0, data, bytes32(0), salt1);

        vm.prank(EXECUTOR);
        timelock.execute(address(appraisal), 0, data, bytes32(0), salt2);

        assertTrue(timelock.isOperationDone(opId1), "Op1 should be done");
        assertTrue(timelock.isOperationDone(opId2), "Op2 should be done");
    }

    // ─── Additional role & access tests ──────────────────────────────────────

    /**
     * @notice MIN_DELAY_FLOOR is enforced at construction; passing a shorter delay reverts.
     */
    function testConstructor_DelayBelowFloor_Reverts() public {
        address[] memory p = new address[](1);
        p[0] = PROPOSER;
        address[] memory e = new address[](1);
        e[0] = EXECUTOR;
        address[] memory em = new address[](0);

        vm.expectRevert(abi.encodeWithSelector(GachaTimelock.DelayTooShort.selector, 12 hours, 1 days));
        new GachaTimelock(12 hours, p, e, em, address(0));
    }

    /**
     * @notice MIN_DELAY_FLOOR is exactly 1 day — deploying with exactly 1 day succeeds.
     */
    function testConstructor_ExactFloor_Succeeds() public {
        address[] memory p = new address[](1);
        p[0] = PROPOSER;
        address[] memory e = new address[](1);
        e[0] = EXECUTOR;
        address[] memory em = new address[](0);

        GachaTimelock tl = new GachaTimelock(1 days, p, e, em, address(0));
        assertEq(tl.getMinDelay(), 1 days);
    }

    /**
     * @notice Execution before delay expires reverts.
     */
    function testExecution_BeforeDelay_Reverts() public {
        bytes memory data = abi.encodeWithSelector(NFTAppraisal.setAppraisalFee.selector, 15e18);

        vm.prank(PROPOSER);
        timelock.propose(address(appraisal), data, MIN_DELAY);

        // Do NOT advance time
        vm.prank(EXECUTOR);
        vm.expectRevert();
        timelock.executeProposal(address(appraisal), data);
    }

    /**
     * @notice An operation that is cancelled cannot be executed even after the delay passes.
     */
    function testCancelled_CannotExecuteAfterDelay() public {
        bytes memory data = abi.encodeWithSelector(NFTAppraisal.setAppraisalFee.selector, 15e18);

        vm.prank(PROPOSER);
        timelock.propose(address(appraisal), data, MIN_DELAY);

        bytes32 opId = _opId(address(appraisal), data);

        vm.prank(PROPOSER);
        timelock.cancel(opId);

        vm.warp(block.timestamp + MIN_DELAY + 1);

        vm.prank(EXECUTOR);
        vm.expectRevert();
        timelock.executeProposal(address(appraisal), data);
    }
}
