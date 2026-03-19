// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Test} from "forge-std/Test.sol";
import {GachaTimelock} from "../../../src/governance/GachaTimelock.sol";
import {TimelockController} from "@openzeppelin/contracts/governance/TimelockController.sol";
import {NFTAppraisal} from "../../../src/appraisal/NFTAppraisal.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {BaseERC20} from "../../../src/tokens/BaseERC20.sol";

contract GachaTimelockTest is Test {
    GachaTimelock timelock;
    NFTAppraisal appraisal;
    BaseERC20 feeToken;

    address constant PROPOSER = address(0xA1);
    address constant EXECUTOR = address(0xA2);
    address constant EMERGENCY = address(0xA3);
    address constant ADMIN = address(0xA4);
    address constant ATTACKER = address(0xBAD);

    uint256 constant MIN_DELAY = 1 days;

    function setUp() public {
        address[] memory proposers = new address[](1);
        proposers[0] = PROPOSER;
        address[] memory executors = new address[](1);
        executors[0] = EXECUTOR;
        address[] memory emergencyAccounts = new address[](1);
        emergencyAccounts[0] = EMERGENCY;

        timelock = new GachaTimelock(MIN_DELAY, proposers, executors, emergencyAccounts, ADMIN);

        // Deploy a governed contract (NFTAppraisal) owned by the timelock
        feeToken = new BaseERC20("Fee", "FEE", address(timelock));
        NFTAppraisal impl = new NFTAppraisal();
        bytes memory initData = abi.encodeWithSelector(
            NFTAppraisal.initialize.selector, address(timelock), address(feeToken), 10e18, address(0x7)
        );
        ERC1967Proxy proxy = new ERC1967Proxy(address(impl), initData);
        appraisal = NFTAppraisal(address(proxy));
    }

    function testDeployment_SetsRoles() public view {
        assertTrue(timelock.hasRole(timelock.PROPOSER_ROLE(), PROPOSER), "proposer role set");
        assertTrue(timelock.hasRole(timelock.EXECUTOR_ROLE(), EXECUTOR), "executor role set");
        assertTrue(timelock.hasRole(timelock.EMERGENCY_ROLE(), EMERGENCY), "emergency role set");
    }

    function testDeployment_MinDelay() public view {
        assertEq(timelock.getMinDelay(), MIN_DELAY, "min delay set");
    }

    function testDeployment_TooShortDelay_Reverts() public {
        address[] memory p = new address[](1);
        p[0] = PROPOSER;
        address[] memory e = new address[](1);
        e[0] = EXECUTOR;
        address[] memory em = new address[](0);

        vm.expectRevert(abi.encodeWithSelector(GachaTimelock.DelayTooShort.selector, 1 hours, 1 days));
        new GachaTimelock(1 hours, p, e, em, address(0));
    }

    function testTimelocked_SetAppraisalFee() public {
        bytes memory data = abi.encodeWithSelector(NFTAppraisal.setAppraisalFee.selector, 42e18);

        // Schedule
        vm.prank(PROPOSER);
        timelock.propose(address(appraisal), data, MIN_DELAY);

        // Can't execute before delay
        vm.prank(EXECUTOR);
        vm.expectRevert();
        timelock.executeProposal(address(appraisal), data);

        // Advance time past delay
        vm.warp(block.timestamp + MIN_DELAY + 1);

        // Execute
        vm.prank(EXECUTOR);
        timelock.executeProposal(address(appraisal), data);

        assertEq(appraisal.appraisalFee(), 42e18, "fee updated via timelock");
    }

    function testTimelocked_NonProposerCannotSchedule() public {
        bytes memory data = abi.encodeWithSelector(NFTAppraisal.setAppraisalFee.selector, 42e18);

        vm.prank(ATTACKER);
        vm.expectRevert();
        timelock.propose(address(appraisal), data, MIN_DELAY);
    }

    function testTimelocked_NonExecutorCannotExecute() public {
        bytes memory data = abi.encodeWithSelector(NFTAppraisal.setAppraisalFee.selector, 42e18);

        vm.prank(PROPOSER);
        timelock.propose(address(appraisal), data, MIN_DELAY);
        vm.warp(block.timestamp + MIN_DELAY + 1);

        vm.prank(ATTACKER);
        vm.expectRevert();
        timelock.executeProposal(address(appraisal), data);
    }

    function testTimelocked_CancelOperation() public {
        bytes memory data = abi.encodeWithSelector(NFTAppraisal.setAppraisalFee.selector, 42e18);

        vm.prank(PROPOSER);
        timelock.propose(address(appraisal), data, MIN_DELAY);

        // Cancel (proposers get canceller role by default in OZ TimelockController)
        bytes32 opId = timelock.hashOperation(address(appraisal), 0, data, bytes32(0), bytes32(0));
        vm.prank(PROPOSER);
        timelock.cancel(opId);

        // Can't execute after cancel
        vm.warp(block.timestamp + MIN_DELAY + 1);
        vm.prank(EXECUTOR);
        vm.expectRevert();
        timelock.executeProposal(address(appraisal), data);
    }

    function testEmergencyRole_IsGranted() public view {
        assertTrue(timelock.hasRole(timelock.EMERGENCY_ROLE(), EMERGENCY));
        assertFalse(timelock.hasRole(timelock.EMERGENCY_ROLE(), ATTACKER));
    }
}
