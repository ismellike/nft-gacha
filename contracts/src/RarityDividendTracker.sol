// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {SafeERC20, IERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {GachaTreasury} from "./GachaTreasury.sol";

interface IGachaRewardsManager {
    function recordUserRewardClaim(address user, uint256 amount) external;
}

contract RarityDividendTracker is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    error InvalidAmount();
    error NoFundsToWithdraw();
    error NoDeposits();
    error InvalidAddress();
    error TransferFailed();
    error UnauthorizedCaller();
    error CalculationOverflow();
    error PrecisionLoss();

    IERC20 public immutable fundsToken;
    GachaTreasury public immutable treasury;
    GachaTreasury.Rarity public immutable rarity;

    uint256 public totalFundsDistributed;
    uint256 private constant pointsMultiplier = 2 ** 96; // Sufficient precision with overflow safety
    uint256 private pointsPerShare;

    // Minimum distribution threshold to prevent precision loss
    uint256 private constant MIN_DISTRIBUTION = 1e12; // 0.000001 tokens

    mapping(address => int256) private pointsCorrection;
    mapping(address => uint256) private withdrawnFunds;

    // Address of the rewards manager that can call updateCorrection
    address public rewardsManager;

    event FundsDistributed(address indexed by, uint256 amount);
    event FundsWithdrawn(address indexed by, uint256 amount);

    constructor(address _fundsToken, address _treasury, GachaTreasury.Rarity _rarity) Ownable(msg.sender) {
        require(_fundsToken != address(0) && _treasury != address(0), "Zero address");
        fundsToken = IERC20(_fundsToken);
        treasury = GachaTreasury(_treasury);
        rarity = _rarity;
    }

    function distributeFunds(uint256 amount) external nonReentrant whenNotPaused {
        if (amount == 0) revert InvalidAmount();

        uint256 totalShares = treasury.getRarityCount(rarity);
        if (totalShares == 0) revert NoDeposits();

        // Check for precision loss in points calculation
        uint256 pointsIncrease = (amount * pointsMultiplier) / totalShares;
        if (pointsIncrease == 0 && amount >= MIN_DISTRIBUTION) revert PrecisionLoss();

        // Check for overflow in pointsPerShare update
        if (pointsPerShare > type(uint256).max - pointsIncrease) revert CalculationOverflow();

        fundsToken.safeTransferFrom(msg.sender, address(this), amount);
        pointsPerShare += pointsIncrease;
        totalFundsDistributed += amount;

        emit FundsDistributed(msg.sender, amount);
    }

    function withdrawFunds() external nonReentrant whenNotPaused {
        uint256 withdrawable = withdrawableFundsOf(msg.sender);
        if (withdrawable == 0) revert NoFundsToWithdraw();

        // Update state before external calls (CEI pattern)
        withdrawnFunds[msg.sender] += withdrawable;
        emit FundsWithdrawn(msg.sender, withdrawable);

        // External transfer
        fundsToken.safeTransfer(msg.sender, withdrawable);

        // External call to rewards manager (after state changes)
        if (rewardsManager != address(0)) {
            try IGachaRewardsManager(rewardsManager).recordUserRewardClaim(msg.sender, withdrawable) {
                // Success - claim recorded
            } catch {
                // Ignore errors to prevent withdrawal failures
            }
        }
    }

    function withdrawableFundsOf(address account) public view returns (uint256) {
        uint256 accumulative = accumulativeFundsOf(account);
        uint256 withdrawn = withdrawnFunds[account];
        return accumulative > withdrawn ? accumulative - withdrawn : 0;
    }

    function accumulativeFundsOf(address account) public view returns (uint256) {
        uint256 shares = treasury.getUserDepositCount(account, rarity);

        if (shares == 0) return 0;

        // Enhanced overflow protection - revert instead of returning 0
        if (pointsPerShare > type(uint256).max / shares) {
            revert CalculationOverflow();
        }

        int256 corrected = int256(pointsPerShare * shares) + pointsCorrection[account];
        return corrected < 0 ? 0 : uint256(corrected) / pointsMultiplier;
    }

    function updateCorrection(address account) external {
        if (msg.sender != rewardsManager && msg.sender != owner()) revert UnauthorizedCaller();

        // This method should be called when treasury deposit counts change
        // We need to preserve the user's already-earned dividends while updating their share count
        uint256 currentWithdrawable = withdrawableFundsOf(account);
        uint256 newShares = treasury.getUserDepositCount(account, rarity);
        uint256 targetAccumulative = currentWithdrawable + withdrawnFunds[account];

        // Enhanced overflow protection for correction calculation
        uint256 targetPoints = targetAccumulative * pointsMultiplier;
        uint256 sharePoints = pointsPerShare * newShares;

        // Check for overflow in multiplication
        if (targetAccumulative > 0 && targetPoints / pointsMultiplier != targetAccumulative) {
            revert CalculationOverflow();
        }
        if (newShares > 0 && sharePoints / newShares != pointsPerShare) {
            revert CalculationOverflow();
        }

        pointsCorrection[account] = int256(targetPoints) - int256(sharePoints);
    }

    // Optional: helper view
    function getTotalFundsDistributed() external view returns (uint256) {
        return totalFundsDistributed;
    }

    // Admin: pause controls
    function emergencyPause() external onlyOwner {
        _pause();
    }

    function emergencyUnpause() external onlyOwner {
        _unpause();
    }

    // Admin: set rewards manager that can call updateCorrection
    function setRewardsManager(address _rewardsManager) external onlyOwner {
        rewardsManager = _rewardsManager;
    }

    // Admin: recover any stuck token
    function recoverToken(address token, uint256 amount) external onlyOwner {
        if (token == address(fundsToken)) revert TransferFailed();
        IERC20(token).safeTransfer(owner(), amount);
    }
}
