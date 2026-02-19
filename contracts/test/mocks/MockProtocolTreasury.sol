// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IProtocolTreasury} from "../../src/interfaces/IProtocolTreasury.sol";

contract MockProtocolTreasury is IProtocolTreasury {
    using SafeERC20 for IERC20;

    IERC20 public override asset;
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    function setAsset(IERC20 _asset) external {
        require(msg.sender == owner, "Only owner");
        asset = _asset;
    }

    function onRevenueReceived(uint256 amount) external override {
        // Actually receive the USDC tokens for testing
        asset.safeTransferFrom(msg.sender, address(this), amount);
        emit ProtocolRevenueReceived(amount);
    }

    function transferOut(address to, uint256 amount) external override {
        require(msg.sender == owner, "Only owner");
        emit ProtocolTransfer(to, amount);
    }

    function executeRedemption(address collection, uint256 tokenId)
        external
        override
        returns (uint256 payout)
    {
        // Mock implementation - returns a fixed payout
        payout = 100 * 1e6; // 100 USDC
        emit RedemptionExecuted(msg.sender, collection, tokenId, payout);
    }
}