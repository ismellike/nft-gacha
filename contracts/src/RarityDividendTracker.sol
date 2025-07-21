// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {SafeERC20, IERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {GachaTreasury} from "./GachaTreasury.sol";

contract RarityDividendTracker is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    error InvalidAmount();
    error NoFundsToWithdraw();
    error NoDeposits();
    error InvalidAddress();
    error TransferFailed();
    error UnauthorizedCaller();

    IERC20 public immutable fundsToken;
    GachaTreasury public immutable treasury;
    GachaTreasury.Rarity public immutable rarity;

    uint256 public totalFundsDistributed;
    uint256 private constant pointsMultiplier = 2 ** 128;
    uint256 private pointsPerShare;

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

        fundsToken.safeTransferFrom(msg.sender, address(this), amount);
        pointsPerShare += (amount * pointsMultiplier) / totalShares;
        totalFundsDistributed += amount;

        emit FundsDistributed(msg.sender, amount);
    }

    function withdrawFunds() external nonReentrant whenNotPaused {
        uint256 withdrawable = _prepareWithdraw();
        if (withdrawable == 0) revert NoFundsToWithdraw();
        fundsToken.safeTransfer(msg.sender, withdrawable);
    }

    function _prepareWithdraw() internal returns (uint256) {
        uint256 amount = withdrawableFundsOf(msg.sender);
        withdrawnFunds[msg.sender] += amount;
        emit FundsWithdrawn(msg.sender, amount);
        return amount;
    }

    function withdrawableFundsOf(address account) public view returns (uint256) {
        uint256 accumulative = accumulativeFundsOf(account);
        uint256 withdrawn = withdrawnFunds[account];
        return accumulative > withdrawn ? accumulative - withdrawn : 0;
    }

    function accumulativeFundsOf(address account) public view returns (uint256) {
        uint256 shares = treasury.getUserDepositCount(account, rarity);
        
        // Prevent overflow by checking if multiplication would overflow
        if (shares > 0 && pointsPerShare > type(uint256).max / shares) {
            return 0; // Return 0 on overflow to prevent revert
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
        
        // Set correction so that:
        // accumulativeFundsOf = (pointsPerShare * newShares + pointsCorrection) / pointsMultiplier
        // withdrawableFundsOf = accumulativeFundsOf - withdrawnFunds = currentWithdrawable
        // Therefore: accumulativeFundsOf = currentWithdrawable + withdrawnFunds
        uint256 targetAccumulative = currentWithdrawable + withdrawnFunds[account];
        pointsCorrection[account] = int256(targetAccumulative * pointsMultiplier) - int256(pointsPerShare * newShares);
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
