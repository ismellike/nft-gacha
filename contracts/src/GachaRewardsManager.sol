// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {RarityDividendTracker} from "./RarityDividendTracker.sol";
import {GachaTreasury} from "./GachaTreasury.sol";
import {Gacha} from "./Gacha.sol";

/// @title GachaRewardsManager - Factory and Manager for Rarity Dividend Tokens
/// @notice Distributes gacha spin fees to rarity dividend trackers based on rarity weights
contract GachaRewardsManager is Ownable, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Custom errors
    error InvalidGachaContract();
    error InvalidTreasuryContract();
    error InvalidProtocolAddress();
    error InvalidFeeToken();
    error InvalidWeights();
    error TokenNotDeployed();
    error NoFundsToWithdraw();
    error UnauthorizedGachaContract();
    error UnauthorizedTreasuryContract();

    // Constants
    uint256 public constant REWARDS_PERCENTAGE = 9000; // 90% to rewards
    uint256 public constant PROTOCOL_PERCENTAGE = 1000; // 10% to protocol
    uint256 public constant PERCENTAGE_DENOMINATOR = 10000;

    // References
    Gacha public gachaContract;
    GachaTreasury public immutable treasuryContract;
    IERC20 public immutable feeToken;
    address public protocolAddress;

    // Trackers per rarity
    mapping(GachaTreasury.Rarity => RarityDividendTracker) public rarityTokens;
    mapping(GachaTreasury.Rarity => uint256) public rarityMultipliers;

    // Stats
    uint256 public totalFeesDistributed;
    uint256 public totalProtocolFees;
    uint256 public totalSpinCount;
    mapping(address => uint256) public userTotalRewardsClaimed;
    mapping(address => uint256) public userSpinCount;

    // Events
    event RarityTokenDeployed(GachaTreasury.Rarity indexed rarity, address indexed tokenAddress);
    event FeesDistributed(uint256 totalAmount, uint256 rewardsAmount, uint256 protocolAmount);
    event RarityFundsDistributed(GachaTreasury.Rarity indexed rarity, uint256 amount);
    event ProtocolAddressUpdated(address indexed oldProtocol, address indexed newProtocol);
    event DepositRecorded(address indexed depositor, GachaTreasury.Rarity indexed rarity);
    event NFTWonRecorded(address indexed depositor, GachaTreasury.Rarity indexed rarity);
    event UserRewardsClaimed(address indexed user, uint256 amount);
    event SpinRecorded(address indexed user);

    modifier onlyGachaContract() {
        if (msg.sender != address(gachaContract)) revert UnauthorizedGachaContract();
        _;
    }

    modifier onlyTreasuryContract() {
        if (msg.sender != address(treasuryContract)) revert UnauthorizedTreasuryContract();
        _;
    }

    constructor(
        address _owner,
        address _gachaContract,
        address _treasuryContract,
        address _protocolAddress,
        address _feeToken
    ) Ownable(_owner) {
        if (_gachaContract == address(0)) revert InvalidGachaContract();
        if (_treasuryContract == address(0)) revert InvalidTreasuryContract();
        if (_protocolAddress == address(0)) revert InvalidProtocolAddress();
        // Note: _feeToken can be address(0) for zero-fee gacha systems

        gachaContract = Gacha(_gachaContract);
        treasuryContract = GachaTreasury(_treasuryContract);
        protocolAddress = _protocolAddress;
        if (_feeToken != address(0)) {
            feeToken = IERC20(_feeToken);
        }

        // Set default rarity multipliers (in basis points)
        rarityMultipliers[GachaTreasury.Rarity.Common] = 10000; // 1.0x
        rarityMultipliers[GachaTreasury.Rarity.Uncommon] = 12000; // 1.2x
        rarityMultipliers[GachaTreasury.Rarity.Rare] = 15000; // 1.5x
        rarityMultipliers[GachaTreasury.Rarity.Epic] = 20000; // 2.0x
        rarityMultipliers[GachaTreasury.Rarity.Legendary] = 30000; // 3.0x
    }

    /// @notice Deploys dividend trackers for all 5 rarities
    function deployAllRarityTokens() external onlyOwner {
        _deployRarityToken(GachaTreasury.Rarity.Common);
        _deployRarityToken(GachaTreasury.Rarity.Uncommon);
        _deployRarityToken(GachaTreasury.Rarity.Rare);
        _deployRarityToken(GachaTreasury.Rarity.Epic);
        _deployRarityToken(GachaTreasury.Rarity.Legendary);
    }

    function _deployRarityToken(GachaTreasury.Rarity rarity) private {
        RarityDividendTracker token = new RarityDividendTracker(address(feeToken), address(treasuryContract), rarity);
        // Note: token is deployed with this contract as owner, transfer ownership in separate call after setup
        token.setRewardsManager(address(this));
        token.transferOwnership(owner());
        rarityTokens[rarity] = token;
        emit RarityTokenDeployed(rarity, address(token));
    }

    /// @notice Updates the reward multiplier for a given rarity
    /// @param rarity The rarity to update
    /// @param multiplierBps The multiplier in basis points (e.g., 10000 = 1.0x, 15000 = 1.5x)
    function setRarityMultiplier(GachaTreasury.Rarity rarity, uint256 multiplierBps) external onlyOwner {
        if (multiplierBps == 0) revert InvalidWeights();
        rarityMultipliers[rarity] = multiplierBps;
    }

    /// @notice Distributes a spin fee to all rarity trackers based on weights
    function distributeSpinRewards(uint256 totalFeeAmount) external onlyGachaContract nonReentrant {
        if (totalFeeAmount == 0 || address(feeToken) == address(0)) return;

        // Track spin statistics
        totalSpinCount++;
        // Note: We don't track individual user spins here as gacha contract doesn't pass user info

        uint256 rewardsAmount = (totalFeeAmount * REWARDS_PERCENTAGE) / PERCENTAGE_DENOMINATOR;
        uint256 protocolAmount = totalFeeAmount - rewardsAmount;

        (uint256 commonWeight, uint256 uncommonWeight, uint256 rareWeight, uint256 epicWeight, uint256 legendaryWeight)
        = gachaContract.getRarityWeights();

        // Apply multipliers
        uint256[5] memory baseWeights = [commonWeight, uncommonWeight, rareWeight, epicWeight, legendaryWeight];
        uint256[5] memory effectiveWeights;
        uint256 totalEffectiveWeight;

        for (uint8 i = 0; i < 5; i++) {
            GachaTreasury.Rarity rarity = GachaTreasury.Rarity(i);
            uint256 base = baseWeights[i];
            uint256 multiplier = rarityMultipliers[rarity];

            if (base > 0 && multiplier > 0) {
                effectiveWeights[i] = (base * multiplier) / PERCENTAGE_DENOMINATOR;
                totalEffectiveWeight += effectiveWeights[i];
            }
        }

        if (totalEffectiveWeight == 0) revert InvalidWeights();

        // Distribute to each rarity proportionally
        for (uint8 i = 0; i < 5; i++) {
            if (effectiveWeights[i] == 0) continue;

            uint256 amount = (rewardsAmount * effectiveWeights[i]) / totalEffectiveWeight;
            if (amount == 0) continue;

            GachaTreasury.Rarity rarity = GachaTreasury.Rarity(i);
            RarityDividendTracker token = rarityTokens[rarity];
            if (address(token) == address(0)) revert TokenNotDeployed();

            feeToken.safeIncreaseAllowance(address(token), amount);
            token.distributeFunds(amount);

            emit RarityFundsDistributed(rarity, amount);
        }

        // Protocol fee
        if (protocolAmount > 0) {
            feeToken.safeTransfer(protocolAddress, protocolAmount);
            totalProtocolFees += protocolAmount;
        }

        totalFeesDistributed += totalFeeAmount;
        emit FeesDistributed(totalFeeAmount, rewardsAmount, protocolAmount);
    }

    /// @notice Updates user's total claimed rewards when they claim from individual trackers
    /// @dev Called by individual RarityDividendTracker contracts after successful withdrawal
    function recordUserRewardClaim(address user, uint256 amount) external {
        // Verify the caller is one of our deployed rarity trackers
        bool isValidTracker = false;
        for (uint256 i = 0; i < 5; i++) {
            if (msg.sender == address(rarityTokens[GachaTreasury.Rarity(i)])) {
                isValidTracker = true;
                break;
            }
        }
        
        if (!isValidTracker) revert UnauthorizedGachaContract();
        
        userTotalRewardsClaimed[user] += amount;
        emit UserRewardsClaimed(user, amount);
    }

    /// @notice View user's total withdrawable rewards across all rarities
    function getUserTotalClaimableRewards(address user) external view returns (uint256 totalClaimable) {
        for (uint256 i = 0; i < 5; i++) {
            RarityDividendTracker token = rarityTokens[GachaTreasury.Rarity(i)];
            if (address(token) != address(0)) {
                totalClaimable += token.withdrawableFundsOf(user);
            }
        }
    }

    /// @notice View user's withdrawable for a specific rarity
    function getUserRarityClaimableRewards(address user, GachaTreasury.Rarity rarity) external view returns (uint256) {
        RarityDividendTracker token = rarityTokens[rarity];
        if (address(token) == address(0)) return 0;
        return token.withdrawableFundsOf(user);
    }

    function getRarityToken(GachaTreasury.Rarity rarity) external view returns (address) {
        return address(rarityTokens[rarity]);
    }

    function getAllRarityTokens() external view returns (address[5] memory tokens) {
        for (uint256 i = 0; i < 5; i++) {
            tokens[i] = address(rarityTokens[GachaTreasury.Rarity(i)]);
        }
    }

    function setProtocolAddress(address _protocolAddress) external onlyOwner {
        if (_protocolAddress == address(0)) revert InvalidProtocolAddress();
        address old = protocolAddress;
        protocolAddress = _protocolAddress;
        emit ProtocolAddressUpdated(old, _protocolAddress);
    }

    /// @notice Called by treasury when an NFT deposit is approved
    /// @param depositor Address of the user who deposited the NFT
    /// @param rarity The rarity of the approved NFT deposit
    function recordApprovedDeposit(address depositor, uint8 rarity) external onlyTreasuryContract {
        GachaTreasury.Rarity rarityEnum = GachaTreasury.Rarity(rarity);
        RarityDividendTracker token = rarityTokens[rarityEnum];
        if (address(token) != address(0)) {
            token.updateCorrection(depositor);
        }
        emit DepositRecorded(depositor, rarityEnum);
    }

    /// @notice Called by treasury when an NFT is won by a user
    /// @param depositor Address of the original depositor (loses dividend rights)
    /// @param rarity The rarity of the won NFT
    function recordNFTWon(address depositor, uint8 rarity) external onlyTreasuryContract {
        GachaTreasury.Rarity rarityEnum = GachaTreasury.Rarity(rarity);
        RarityDividendTracker token = rarityTokens[rarityEnum];
        if (address(token) != address(0)) {
            token.updateCorrection(depositor);
        }
        emit NFTWonRecorded(depositor, rarityEnum);
    }

    function emergencyPause() external onlyOwner {
        _pause();
    }

    function emergencyUnpause() external onlyOwner {
        _unpause();
    }

    function emergencyRecoverTokens(address token, uint256 amount) external onlyOwner {
        if (address(feeToken) != address(0) && token == address(feeToken)) revert InvalidFeeToken();
        IERC20(token).safeTransfer(owner(), amount);
    }

    /// @notice Get analytics data for dashboard
    /// @param user User address to get analytics for
    /// @return totalClaimed Total rewards claimed by user
    /// @return totalClaimable Current claimable rewards
    /// @return spinCount Number of spins by user (if tracked)
    function getUserAnalytics(address user)
        external
        view
        returns (uint256 totalClaimed, uint256 totalClaimable, uint256 spinCount)
    {
        totalClaimed = userTotalRewardsClaimed[user];

        // Calculate total claimable rewards across all rarities
        for (uint256 i = 0; i < 5; i++) {
            RarityDividendTracker token = rarityTokens[GachaTreasury.Rarity(i)];
            if (address(token) != address(0)) {
                totalClaimable += token.withdrawableFundsOf(user);
            }
        }

        spinCount = userSpinCount[user];
    }

    /// @notice Get global analytics data
    /// @return totalSpins Total number of spins
    /// @return totalFees Total fees distributed
    /// @return protocolFees Total protocol fees collected
    function getGlobalAnalytics() external view returns (uint256 totalSpins, uint256 totalFees, uint256 protocolFees) {
        totalSpins = totalSpinCount;
        totalFees = totalFeesDistributed;
        protocolFees = totalProtocolFees;
    }
}
