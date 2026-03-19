// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {TimelockController} from "@openzeppelin/contracts/governance/TimelockController.sol";

/**
 * @title GachaTimelock
 * @notice Wraps OpenZeppelin TimelockController for governing critical admin operations.
 *
 * ## Design Rationale
 *
 *   Critical operations (upgrades, revenue splits, pricing config, whitelist removals)
 *   go through a mandatory delay so token-holders and depositors can react.
 *   Emergency pause/unpause bypasses the timelock via the EMERGENCY_ROLE.
 *
 * ## Roles
 *
 *   - PROPOSER_ROLE  → multisig / DAO governance contract
 *   - EXECUTOR_ROLE  → can be open (address(0)) or restricted
 *   - CANCELLER_ROLE → same as proposers by default
 *   - EMERGENCY_ROLE → can pause/unpause contracts without delay
 *
 * @dev The deployer should transfer ownership of all governed contracts to this timelock.
 */
contract GachaTimelock is TimelockController {
    /// @notice Role for emergency pause/unpause operations (bypasses timelock delay)
    bytes32 public constant EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");

    /// @notice Minimum delay for the timelock (1 day)
    uint256 public constant MIN_DELAY_FLOOR = 1 days;

    error DelayTooShort(uint256 provided, uint256 minimum);

    /**
     * @notice Deploy the timelock with initial configuration
     * @param minDelay Minimum delay for queued operations (must be >= MIN_DELAY_FLOOR)
     * @param proposers Addresses that can propose (schedule) operations
     * @param executors Addresses that can execute ready operations (address(0) = anyone)
     * @param emergencyAccounts Addresses granted EMERGENCY_ROLE for instant pause/unpause
     * @param admin Optional admin address; pass address(0) to leave self-administered
     */
    constructor(
        uint256 minDelay,
        address[] memory proposers,
        address[] memory executors,
        address[] memory emergencyAccounts,
        address admin
    ) TimelockController(minDelay, proposers, executors, admin) {
        if (minDelay < MIN_DELAY_FLOOR) revert DelayTooShort(minDelay, MIN_DELAY_FLOOR);

        for (uint256 i; i < emergencyAccounts.length; i++) {
            _grantRole(EMERGENCY_ROLE, emergencyAccounts[i]);
        }
    }

    /**
     * @notice Convenience: schedule a single operation with zero salt
     * @param target Contract to call
     * @param data Encoded function call (e.g. abi.encodeWithSelector(...))
     * @param delay Override delay (must be >= getMinDelay())
     */
    function propose(address target, bytes calldata data, uint256 delay) external onlyRole(PROPOSER_ROLE) {
        schedule(target, 0, data, bytes32(0), bytes32(0), delay);
    }

    /**
     * @notice Convenience: execute a ready single operation with zero salt
     * @param target Contract to call
     * @param data Encoded function call matching a previously scheduled operation
     */
    function executeProposal(address target, bytes calldata data) external onlyRole(EXECUTOR_ROLE) {
        execute(target, 0, data, bytes32(0), bytes32(0));
    }
}
