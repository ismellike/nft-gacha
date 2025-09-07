// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

interface IGachaRewardsManager {
    function recordUserRewardClaim(address user, uint256 amount) external;
}