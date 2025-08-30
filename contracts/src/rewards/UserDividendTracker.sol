// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {SafeERC20, IERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {GachaTreasury} from "../gacha/GachaTreasury.sol";
import {IFundsDistributionToken} from "../interfaces/IFundsDistributionToken.sol";

interface IGachaRewardsManager {
    function recordUserRewardClaim(address user, uint256 amount) external;
}

/// @title UserDividendTracker - ERC2222-style dividend distribution tracker
/// @notice Distributes rewards to users based on their weighted shares
contract UserDividendTracker is IFundsDistributionToken, Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    // Custom errors
    error InvalidAmount();
    error NoFundsToWithdraw();
    error NoDeposits();
    error InvalidAddress();
    error TransferFailed();
    error UnauthorizedCaller();
    error CalculationOverflow();
    error PrecisionLoss();
    error InvalidFundsToken();
    error InvalidTreasury();

    // Immutable references
    IERC20 public immutable fundsToken;
    GachaTreasury public immutable treasury;
    GachaTreasury.Rarity public immutable rarity;

    // State variables
    uint256 public totalFundsDistributed;
    uint256 private constant POINTS_MULTIPLIER = 2 ** 96; // Sufficient precision with overflow safety
    uint256 private pointsPerShare;

    // Minimum distribution threshold to prevent precision loss
    uint256 private constant MIN_DISTRIBUTION = 1e12; // 0.000001 tokens

    // ERC2222-style dividend tracking
    mapping(address => int256) private pointsCorrection;
    mapping(address => uint256) private withdrawnFunds;

    // Access control
    address public rewardsManager;

    // Events
    event RewardsManagerUpdated(address indexed oldManager, address indexed newManager);

    /**
     * @notice Initialize the user dividend tracker
     * @param _owner Owner of this contract
     * @param _fundsToken Token used for rewards distribution
     * @param _treasury Treasury contract reference
     * @param _rarity Rarity tier this tracker manages
     */
    constructor(
        address _owner,
        address _fundsToken, 
        address _treasury, 
        GachaTreasury.Rarity _rarity
    ) Ownable(_owner) {
        if (_fundsToken == address(0)) revert InvalidFundsToken();
        if (_treasury == address(0)) revert InvalidTreasury();
        
        fundsToken = IERC20(_fundsToken);
        treasury = GachaTreasury(_treasury);
        rarity = _rarity;
    }

    /// @notice Distribute funds to users based on their shares (ERC2222 pattern)
    /// @param amount Amount of tokens to distribute
    function distributeFunds(uint256 amount) external nonReentrant whenNotPaused {
        if (amount == 0) revert InvalidAmount();

        uint256 totalShares = treasury.getRarityTotalValue(rarity);
        if (totalShares == 0) revert NoDeposits();

        // Check for precision loss in points calculation
        uint256 pointsIncrease = (amount * POINTS_MULTIPLIER) / totalShares;
        if (pointsIncrease == 0 && amount >= MIN_DISTRIBUTION) revert PrecisionLoss();

        // Check for overflow in pointsPerShare update
        if (pointsPerShare > type(uint256).max - pointsIncrease) revert CalculationOverflow();

        fundsToken.safeTransferFrom(msg.sender, address(this), amount);
        pointsPerShare += pointsIncrease;
        totalFundsDistributed += amount;

        emit FundsDistributed(msg.sender, amount);
    }

    /// @notice Withdraw accumulated dividend funds for the caller
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

    /// @notice Calculate withdrawable funds for an account
    /// @param account Account to check
    /// @return Withdrawable amount
    function withdrawableFundsOf(address account) public view returns (uint256) {
        uint256 accumulative = accumulativeFundsOf(account);
        uint256 withdrawn = withdrawnFunds[account];
        return accumulative > withdrawn ? accumulative - withdrawn : 0;
    }

    /// @notice Calculate total accumulated funds for an account (including withdrawn)
    /// @param account Account to check
    /// @return Total accumulated funds
    function accumulativeFundsOf(address account) public view returns (uint256) {
        uint256 shares = treasury.getUserDepositValue(account, rarity);

        if (shares == 0) return 0;

        // Enhanced overflow protection - revert instead of returning 0
        if (pointsPerShare > type(uint256).max / shares) {
            revert CalculationOverflow();
        }

        int256 corrected = int256(pointsPerShare * shares) + pointsCorrection[account];
        return corrected < 0 ? 0 : uint256(corrected) / POINTS_MULTIPLIER;
    }

    function updateCorrection(address account) external {
        if (msg.sender != rewardsManager && msg.sender != owner()) revert UnauthorizedCaller();

        // This method should be called when treasury deposit values change
        // We need to preserve the user's already-earned dividends while updating their share value
        uint256 currentWithdrawable = withdrawableFundsOf(account);
        uint256 newShares = treasury.getUserDepositValue(account, rarity);
        uint256 targetAccumulative = currentWithdrawable + withdrawnFunds[account];

        // Enhanced overflow protection for correction calculation
        uint256 targetPoints = targetAccumulative * POINTS_MULTIPLIER;
        uint256 sharePoints = pointsPerShare * newShares;

        // Check for overflow in multiplication
        if (targetAccumulative > 0 && targetPoints / POINTS_MULTIPLIER != targetAccumulative) {
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

    /// @notice Set the rewards manager that can call updateCorrection
    /// @param _rewardsManager Address of the rewards manager contract
    function setRewardsManager(address _rewardsManager) external onlyOwner {
        address oldManager = rewardsManager;
        rewardsManager = _rewardsManager;
        emit RewardsManagerUpdated(oldManager, _rewardsManager);
    }

    // Admin: recover any stuck token
    function recoverToken(address token, uint256 amount) external onlyOwner {
        if (token == address(fundsToken)) revert TransferFailed();
        IERC20(token).safeTransfer(owner(), amount);
    }
}
