// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IFundsDistributionToken} from "./interfaces/IFundsDistributionToken.sol";
import {GachaTreasury} from "./GachaTreasury.sol";

/// @title RarityDividendToken - Funds Distribution Token for Specific Rarity
/// @notice Each rarity has its own dividend token that distributes rewards to depositors
/// @dev Implements IFundsDistributionToken standard for funds distribution
contract RarityDividendToken is ERC20, IFundsDistributionToken, Ownable, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    // Custom errors
    error InvalidDistributor();
    error NoFundsToWithdraw();
    error TransferFailed();
    error InvalidFundsToken();
    error UnauthorizedDistributor();
    error InvalidAmount();
    error NoTokensToDistributeTo();
    error InvalidAddress();

    // The rarity this token represents
    GachaTreasury.Rarity public immutable rarity;
    
    // Token used for dividend payments (e.g., the fee token from gacha)
    IERC20 public immutable fundsToken;
    
    // Authorized addresses that can distribute funds and mint tokens
    mapping(address => bool) public authorizedDistributors;
    
    // Funds distribution state variables
    uint256 public totalFundsDistributed;
    uint256 private constant MAGNITUDE = 2**128;
    uint256 private magnifiedFundsPerShare;
    
    // User tracking
    mapping(address => int256) private magnifiedFundsCorrections;
    mapping(address => uint256) private withdrawnFunds;

    // Events
    event AuthorizedDistributorUpdated(address indexed distributor, bool authorized);

    modifier onlyAuthorizedDistributor() {
        if (!authorizedDistributors[msg.sender]) revert UnauthorizedDistributor();
        _;
    }

    constructor(
        string memory name,
        string memory symbol,
        address owner,
        GachaTreasury.Rarity _rarity,
        address _fundsToken,
        address _initialDistributor
    ) ERC20(name, symbol) Ownable(owner) {
        rarity = _rarity;
        if (_fundsToken == address(0)) revert InvalidFundsToken();
        fundsToken = IERC20(_fundsToken);
        
        // Set initial authorized distributor if provided
        if (_initialDistributor != address(0)) {
            authorizedDistributors[_initialDistributor] = true;
            emit AuthorizedDistributorUpdated(_initialDistributor, true);
        }
    }

    /// @notice Mints tokens to a user when they make an approved deposit
    /// @param to Address to mint tokens to
    /// @param amount Number of tokens to mint (usually 1 per NFT deposited)
    function mint(address to, uint256 amount) external onlyAuthorizedDistributor {
        if (to == address(0)) revert InvalidAddress();
        if (amount == 0) revert InvalidAmount();
        _mint(to, amount);
    }

    /// @notice Distributes funds to all token holders proportionally
    /// @dev Implements IFundsDistributionToken by accepting funds transfer first
    function distributeFunds() external payable {
        // This implementation is for ERC20 tokens, not ETH
        revert("Use distributeFunds(uint256) for ERC20 tokens");
    }

    /// @notice Distributes ERC20 funds to all token holders proportionally
    /// @param amount Amount of funds token to distribute
    function distributeFunds(uint256 amount) external onlyAuthorizedDistributor whenNotPaused nonReentrant {
        if (amount == 0) revert InvalidAmount();
        uint256 supply = totalSupply();
        if (supply == 0) revert NoTokensToDistributeTo();
        
        // Transfer funds from distributor to this contract
        fundsToken.safeTransferFrom(msg.sender, address(this), amount);
        
        // Update distribution tracking
        totalFundsDistributed += amount;
        // Division by zero protection already handled by supply > 0 check above
        magnifiedFundsPerShare += (amount * MAGNITUDE) / supply;
        
        emit FundsDistributed(msg.sender, amount);
    }

    /// @notice Withdraws available funds for the sender
    /// @dev Implements IFundsDistributionToken withdrawFunds function
    function withdrawFunds() external override whenNotPaused nonReentrant {
        uint256 withdrawableAmount = withdrawableFundsOf(msg.sender);
        if (withdrawableAmount == 0) revert NoFundsToWithdraw();
        
        withdrawnFunds[msg.sender] += withdrawableAmount;
        
        fundsToken.safeTransfer(msg.sender, withdrawableAmount);
        
        emit FundsWithdrawn(msg.sender, withdrawableAmount);
    }

    /// @notice Returns the total amount of funds distributed
    /// @return Total funds distributed to date
    function getTotalFundsDistributed() external view returns (uint256) {
        return totalFundsDistributed;
    }

    /// @notice Returns the amount of funds that can be withdrawn by an account
    /// @param owner The address of the account
    /// @return Withdrawable funds amount
    function withdrawableFundsOf(address owner) public view override returns (uint256) {
        uint256 accumulative = accumulativeFundsOf(owner);
        uint256 withdrawn = withdrawnFunds[owner];
        
        // Handle potential rounding issues
        if (accumulative <= withdrawn) {
            return 0;
        }
        
        return accumulative - withdrawn;
    }

    /// @notice Returns the amount of funds that have been withdrawn by an account
    /// @param account The address of the account
    /// @return Withdrawn funds amount
    function withdrawnFundsOf(address account) external view returns (uint256) {
        return withdrawnFunds[account];
    }

    /// @notice Returns the total amount of funds that can be withdrawn by an account
    /// @param account The address of the account
    /// @return Accumulative funds amount
    function accumulativeFundsOf(address account) public view returns (uint256) {
        int256 result = int256(magnifiedFundsPerShare * balanceOf(account)) + magnifiedFundsCorrections[account];
        if (result < 0) {
            return 0;
        }
        return uint256(result) / MAGNITUDE;
    }

    /// @notice Overrides _update to maintain funds tracking
    /// @param from Address tokens are transferred from
    /// @param to Address tokens are transferred to
    /// @param value Amount of tokens transferred
    function _update(address from, address to, uint256 value) internal override {
        super._update(from, to, value);

        int256 magnifiedCorrection = int256(magnifiedFundsPerShare * value);

        if (from != address(0)) {
            magnifiedFundsCorrections[from] += magnifiedCorrection;
        }
        if (to != address(0)) {
            magnifiedFundsCorrections[to] -= magnifiedCorrection;
        }
    }

    /// @notice Sets authorization for an address to distribute funds and mint tokens
    /// @param distributor Address to set authorization for
    /// @param authorized Whether the address is authorized
    function setAuthorizedDistributor(address distributor, bool authorized) external onlyOwner {
        if (distributor == address(0)) revert InvalidDistributor();
        authorizedDistributors[distributor] = authorized;
        emit AuthorizedDistributorUpdated(distributor, authorized);
    }

    /// @notice Gets the rarity name as a string for display purposes
    /// @return Rarity name
    function getRarityName() external view returns (string memory) {
        if (rarity == GachaTreasury.Rarity.Common) return "Common";
        if (rarity == GachaTreasury.Rarity.Uncommon) return "Uncommon";
        if (rarity == GachaTreasury.Rarity.Rare) return "Rare";
        if (rarity == GachaTreasury.Rarity.Epic) return "Epic";
        if (rarity == GachaTreasury.Rarity.Legendary) return "Legendary";
        return "Unknown";
    }

    /// @notice Emergency pause function
    function emergencyPause() external onlyOwner {
        _pause();
    }

    /// @notice Emergency unpause function
    function emergencyUnpause() external onlyOwner {
        _unpause();
    }

    /// @notice Emergency function to recover stuck tokens (not funds token)
    /// @param token Token address to recover
    /// @param amount Amount to recover
    function emergencyRecoverToken(address token, uint256 amount) external onlyOwner {
        if (token == address(fundsToken)) revert InvalidFundsToken();
        if (token == address(0)) {
            payable(owner()).transfer(amount);
        } else {
            IERC20(token).safeTransfer(owner(), amount);
        }
    }
}