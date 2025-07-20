// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {RarityDividendToken} from "./RarityDividendToken.sol";
import {GachaTreasury} from "./GachaTreasury.sol";
import {Gacha} from "./Gacha.sol";

/// @title GachaRewardsManager - Factory and Manager for Rarity Dividend Tokens
/// @notice Deploys and manages 5 separate dividend tokens (one per rarity)
/// @dev Handles fee distribution from gacha spins to appropriate rarity tokens
contract GachaRewardsManager is Ownable, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    // Custom errors
    error InvalidGachaContract();
    error InvalidTreasuryContract();
    error InvalidProtocolAddress();
    error InvalidFeeToken();
    error NoFeesToDistribute();
    error InvalidRarity();
    error TokenNotDeployed();
    error InvalidWeights();
    error UnauthorizedGachaContract();
    error UnauthorizedTreasuryContract();
    error NoFundsToWithdraw();
    error InvalidAddress();

    // Constants
    uint256 public constant REWARDS_PERCENTAGE = 9000; // 90% to rewards
    uint256 public constant PROTOCOL_PERCENTAGE = 1000; // 10% to protocol
    uint256 public constant PERCENTAGE_DENOMINATOR = 10000;

    // Contract references
    Gacha public gachaContract;
    GachaTreasury public immutable treasuryContract;
    IERC20 public immutable feeToken;
    address public protocolAddress;

    // Rarity dividend tokens mapping
    mapping(GachaTreasury.Rarity => RarityDividendToken) public rarityTokens;

    // Fee distribution tracking
    uint256 public totalFeesDistributed;
    uint256 public totalProtocolFees;

    // Events
    event RarityTokenDeployed(GachaTreasury.Rarity indexed rarity, address indexed tokenAddress);
    event FeesDistributed(uint256 totalAmount, uint256 rewardsAmount, uint256 protocolAmount);
    event RarityFundsDistributed(GachaTreasury.Rarity indexed rarity, uint256 amount);
    event ProtocolAddressUpdated(address indexed oldProtocol, address indexed newProtocol);
    event DepositApproved(address indexed depositor, GachaTreasury.Rarity rarity, uint256 tokensIssued);

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
        // Allow _feeToken to be address(0) for zero-fee scenarios

        gachaContract = Gacha(_gachaContract);
        treasuryContract = GachaTreasury(_treasuryContract);
        protocolAddress = _protocolAddress;
        if (_feeToken != address(0)) {
            feeToken = IERC20(_feeToken);
        }
    }

    /// @notice Deploys dividend tokens for all 5 rarities
    function deployAllRarityTokens() external onlyOwner {
        _deployRarityToken(GachaTreasury.Rarity.Common, "Common Gacha Rewards", "CGR");
        _deployRarityToken(GachaTreasury.Rarity.Uncommon, "Uncommon Gacha Rewards", "UGR");
        _deployRarityToken(GachaTreasury.Rarity.Rare, "Rare Gacha Rewards", "RGR");
        _deployRarityToken(GachaTreasury.Rarity.Epic, "Epic Gacha Rewards", "EGR");
        _deployRarityToken(GachaTreasury.Rarity.Legendary, "Legendary Gacha Rewards", "LGR");
    }

    /// @notice Deploys a dividend token for a specific rarity
    /// @param rarity The rarity to deploy token for
    /// @param name Token name
    /// @param symbol Token symbol
    function _deployRarityToken(GachaTreasury.Rarity rarity, string memory name, string memory symbol) private {
        RarityDividendToken token = new RarityDividendToken(
            name, 
            symbol, 
            owner(), 
            rarity, 
            address(feeToken),
            address(this) // Set this manager as initial authorized distributor
        );

        rarityTokens[rarity] = token;

        emit RarityTokenDeployed(rarity, address(token));
    }

    /// @notice Called by treasury when a deposit is approved - mints reward tokens
    /// @param depositor Address that made the deposit
    /// @param rarity Rarity of the approved deposit
    function recordApprovedDeposit(address depositor, GachaTreasury.Rarity rarity) external onlyTreasuryContract {
        if (depositor == address(0)) revert InvalidAddress();
        RarityDividendToken token = rarityTokens[rarity];
        if (address(token) == address(0)) revert TokenNotDeployed();

        // Mint 1 token per approved deposit
        token.mint(depositor, 1 ether); // 1 token with 18 decimals

        emit DepositApproved(depositor, rarity, 1 ether);
    }

    /// @notice Distributes spin fees to rarity tokens based on gacha weights
    /// @param totalFeeAmount Total fee amount from spin
    function distributeSpinRewards(uint256 totalFeeAmount) external onlyGachaContract nonReentrant {
        if (totalFeeAmount == 0) return;

        uint256 rewardsAmount = (totalFeeAmount * REWARDS_PERCENTAGE) / PERCENTAGE_DENOMINATOR;
        uint256 protocolAmount = totalFeeAmount - rewardsAmount;

        // Get rarity weights from gacha contract
        (uint256 commonWeight, uint256 uncommonWeight, uint256 rareWeight, uint256 epicWeight, uint256 legendaryWeight)
        = gachaContract.getRarityWeights();

        uint256 totalWeight = commonWeight + uncommonWeight + rareWeight + epicWeight + legendaryWeight;
        
        // Protect against division by zero
        if (totalWeight == 0) revert InvalidWeights();

        // Distribute rewards proportionally to each rarity based on weights
        _distributeToRarity(GachaTreasury.Rarity.Common, rewardsAmount, commonWeight, totalWeight);
        _distributeToRarity(GachaTreasury.Rarity.Uncommon, rewardsAmount, uncommonWeight, totalWeight);
        _distributeToRarity(GachaTreasury.Rarity.Rare, rewardsAmount, rareWeight, totalWeight);
        _distributeToRarity(GachaTreasury.Rarity.Epic, rewardsAmount, epicWeight, totalWeight);
        _distributeToRarity(GachaTreasury.Rarity.Legendary, rewardsAmount, legendaryWeight, totalWeight);

        // Send protocol fee
        if (protocolAmount > 0 && address(feeToken) != address(0)) {
            feeToken.safeTransfer(protocolAddress, protocolAmount);
            totalProtocolFees += protocolAmount;
        }

        totalFeesDistributed += totalFeeAmount;

        emit FeesDistributed(totalFeeAmount, rewardsAmount, protocolAmount);
    }

    /// @notice Distributes funds to a specific rarity token
    /// @param rarity Rarity to distribute to
    /// @param totalRewards Total rewards amount to distribute
    /// @param rarityWeight Weight for this rarity
    /// @param totalWeight Total weight across all rarities
    function _distributeToRarity(
        GachaTreasury.Rarity rarity,
        uint256 totalRewards,
        uint256 rarityWeight,
        uint256 totalWeight
    ) private {
        if (rarityWeight == 0) return;

        RarityDividendToken token = rarityTokens[rarity];
        if (address(token) == address(0)) return; // Skip if token not deployed
        if (token.totalSupply() == 0) return; // Skip if no token holders

        uint256 rarityAmount = (totalRewards * rarityWeight) / totalWeight;
        if (rarityAmount == 0) return;

        // Only distribute if fee token exists
        if (address(feeToken) != address(0)) {
            // Approve token contract to spend funds, then let it pull via distributeFunds
            feeToken.safeIncreaseAllowance(address(token), rarityAmount);
            token.distributeFunds(rarityAmount);
        }

        emit RarityFundsDistributed(rarity, rarityAmount);
    }

    /// @notice Gets the dividend token address for a rarity
    /// @param rarity Rarity to get token for
    /// @return tokenAddress Address of the rarity token
    function getRarityToken(GachaTreasury.Rarity rarity) external view returns (address tokenAddress) {
        return address(rarityTokens[rarity]);
    }

    /// @notice Gets all rarity token addresses
    /// @return tokens Array of token addresses [Common, Uncommon, Rare, Epic, Legendary]
    function getAllRarityTokens() external view returns (address[5] memory tokens) {
        for (uint256 i = 0; i < 5; i++) {
            tokens[i] = address(rarityTokens[GachaTreasury.Rarity(i)]);
        }
    }

    /// @notice Gets user's total claimable rewards across all rarities
    /// @param user User address
    /// @return totalClaimable Total claimable amount across all rarity tokens
    function getUserTotalClaimableRewards(address user) external view returns (uint256 totalClaimable) {
        if (user == address(0)) return 0;
        for (uint256 i = 0; i < 5; i++) {
            RarityDividendToken token = rarityTokens[GachaTreasury.Rarity(i)];
            if (address(token) != address(0)) {
                totalClaimable += token.withdrawableFundsOf(user);
            }
        }
    }

    /// @notice Gets user's claimable rewards for a specific rarity
    /// @param user User address
    /// @param rarity Rarity to check
    /// @return claimable Claimable amount for the rarity
    function getUserRarityClaimableRewards(address user, GachaTreasury.Rarity rarity)
        external
        view
        returns (uint256 claimable)
    {
        if (user == address(0)) return 0;
        RarityDividendToken token = rarityTokens[rarity];
        if (address(token) == address(0)) return 0;
        return token.withdrawableFundsOf(user);
    }

    /// @notice Allows users to claim all rewards across all rarities
    function claimAllRewards() external whenNotPaused nonReentrant {
        uint256 totalClaimed = 0;
        
        for (uint256 i = 0; i < 5; i++) {
            RarityDividendToken token = rarityTokens[GachaTreasury.Rarity(i)];
            if (address(token) != address(0)) {
                uint256 withdrawable = token.withdrawableFundsOf(msg.sender);
                if (withdrawable > 0) {
                    uint256 balanceBefore = feeToken.balanceOf(msg.sender);
                    
                    // Try withdraw and catch any reverts to handle precision issues
                    try token.withdrawFunds() {
                        uint256 balanceAfter = feeToken.balanceOf(msg.sender);
                        totalClaimed += (balanceAfter - balanceBefore);
                    } catch {
                        // Continue if this token has precision issues
                    }
                }
            }
        }
        
        if (totalClaimed == 0) revert NoFundsToWithdraw();
    }

    /// @notice Updates protocol address
    /// @param _protocolAddress New protocol address
    function setProtocolAddress(address _protocolAddress) external onlyOwner {
        if (_protocolAddress == address(0)) revert InvalidProtocolAddress();
        address oldProtocol = protocolAddress;
        protocolAddress = _protocolAddress;
        emit ProtocolAddressUpdated(oldProtocol, _protocolAddress);
    }

    /// @notice Emergency pause function
    function emergencyPause() external onlyOwner {
        _pause();
    }

    /// @notice Emergency unpause function
    function emergencyUnpause() external onlyOwner {
        _unpause();
    }

    /// @notice Emergency function to recover tokens (not fee token)
    /// @param token Token address (address(0) for ETH)
    /// @param amount Amount to recover
    function emergencyRecoverTokens(address token, uint256 amount) external onlyOwner {
        if (token == address(feeToken)) revert InvalidFeeToken();
        if (token == address(0)) {
            payable(owner()).transfer(amount);
        } else {
            IERC20(token).safeTransfer(owner(), amount);
        }
    }
}
