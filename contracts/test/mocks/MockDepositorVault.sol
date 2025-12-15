// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IDepositorVault} from "../../src/interfaces/IDepositorVault.sol";

/**
 * @title MockDepositorVault
 * @notice Mock implementation of IDepositorVault for testing
 */
contract MockDepositorVault is IDepositorVault {
    IERC20 public immutable asset;
    mapping(address => uint256) public shares;
    uint256 public totalShares;
    mapping(address => uint256) public pendingYield;

    constructor(address _asset) {
        asset = IERC20(_asset);
    }

    function registerDepositor(address account, uint256 appraisalValueUSD) external override {
        require(shares[account] == 0, "Already registered");
        shares[account] = appraisalValueUSD;
        totalShares += appraisalValueUSD;
        emit DepositorRegistered(account, appraisalValueUSD);
    }

    function updateDepositor(address account, uint256 newAppraisalValueUSD) external override {
        uint256 previous = shares[account];
        totalShares = totalShares - previous + newAppraisalValueUSD;
        shares[account] = newAppraisalValueUSD;
        emit DepositorUpdated(account, previous, newAppraisalValueUSD);
    }

    function deregisterDepositor(address account) external override {
        uint256 value = shares[account];
        shares[account] = 0;
        totalShares -= value;
        emit DepositorDeregistered(account, value);
    }

    function distributeYield(uint256 amount) external override {
        // Simple distribution - divide among all shareholders proportionally
        if (totalShares > 0) {
            // For testing, just add to pending yield for first shareholder
            // This is a simplified implementation
        }
        emit YieldDistributed(msg.sender, amount);
    }

    function claimYield(address account) external override returns (uint256 withdrawn) {
        withdrawn = pendingYield[account];
        pendingYield[account] = 0;
        if (withdrawn > 0) {
            asset.transfer(account, withdrawn);
        }
        emit YieldClaimed(account, withdrawn);
    }

    function sharesOf(address account) external view override returns (uint256) {
        return shares[account];
    }
}
