// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ReentrancyGuardTransient} from "@openzeppelin/contracts/utils/ReentrancyGuardTransient.sol";
import {IDepositorVault} from "../interfaces/IDepositorVault.sol";

/// @notice Interface for GachaTreasury to record claimed analytics
interface IGachaTreasuryYieldTracker {
    function recordYieldClaim(address user, uint256 amount) external;
}

/**
 * @title DepositorVault
 * @notice ERC-2222 style vault that distributes USDC yield to NFT depositors based on appraisal weights.
 * @dev Shares are tracked in 18-decimal appraisal units to align with oracle pricing.
 */
contract DepositorVault is
    IDepositorVault,
    Initializable,
    OwnableUpgradeable,
    PausableUpgradeable,
    ReentrancyGuardTransient,
    UUPSUpgradeable
{
    using SafeERC20 for IERC20;

    /// @notice Precision used for reward accounting (1e18)
    uint256 private constant REWARD_PRECISION = 1e18;
    /// @notice USDC token used for payouts
    IERC20 public override asset;
    /// @notice Gacha treasury allowed to update depositor weights
    address public treasury;
    /// @notice Economy manager that performs revenue splits
    address public economyManager;

    /// @notice Total appraisal-weighted shares
    uint256 public override totalShares;
    /// @notice Aggregate USDC distributed
    uint256 public totalYieldDistributed;
    /// @notice Aggregate USDC claimed
    uint256 public totalYieldClaimed;

    /// @dev Accrued yield per share (scaled by REWARD_PRECISION)
    uint256 public accYieldPerShare;

    /// @dev Share balances tracked in 18-decimal appraisal units
    mapping(address => uint256) private _shares;
    /// @dev Reward debt for each account (scaled by REWARD_PRECISION)
    mapping(address => uint256) private _rewardDebt;
    /// @dev Unclaimed rewards tracked when shares change
    mapping(address => uint256) private _unclaimed;

    /// @notice Emitted when controlling addresses are updated
    event TreasuryUpdated(address indexed previousTreasury, address indexed newTreasury);
    event EconomyManagerUpdated(address indexed previousManager, address indexed newManager);

    /// @dev Ensures calls originate from the active treasury
    modifier onlyTreasury() {
        require(msg.sender == treasury, "DepositorVault: caller is not treasury");
        _;
    }

    /// @dev Ensures calls originate from the economy manager
    modifier onlyEconomyManager() {
        require(msg.sender == economyManager, "DepositorVault: caller is not manager");
        _;
    }

    /**
     * @notice Initializes the DepositorVault contract.
     * @param owner Address assigned contract ownership
     * @param asset_ USDC token address
     * @param treasury_ Gacha treasury allowed to modify shares
     * @param economyManager_ Economy manager handling revenue splits
     */
    function initialize(address owner, address asset_, address treasury_, address economyManager_)
        external
        initializer
    {
        require(owner != address(0), "DepositorVault: owner is zero");
        __Ownable_init(owner);
        __Pausable_init();

        require(asset_ != address(0), "DepositorVault: asset is zero");
        require(treasury_ != address(0), "DepositorVault: treasury is zero");
        require(economyManager_ != address(0), "DepositorVault: manager is zero");

        asset = IERC20(asset_);
        treasury = treasury_;
        economyManager = economyManager_;
    }

    /// @inheritdoc IDepositorVault
    function registerDepositor(address account, uint256 appraisalValueUSD)
        external
        override
        onlyTreasury
        whenNotPaused
    {
        require(account != address(0), "DepositorVault: invalid depositor");
        require(appraisalValueUSD > 0, "DepositorVault: appraisal is zero");

        _accrue(account);

        _shares[account] += appraisalValueUSD;
        totalShares += appraisalValueUSD;

        _rewardDebt[account] = (_shares[account] * accYieldPerShare) / REWARD_PRECISION;

        emit IDepositorVault.DepositorRegistered(account, appraisalValueUSD);
    }

    /// @inheritdoc IDepositorVault
    function updateDepositor(address account, uint256 newAppraisalValueUSD)
        external
        override
        onlyTreasury
        whenNotPaused
    {
        require(account != address(0), "DepositorVault: invalid depositor");

        _accrue(account);

        uint256 previous = _shares[account];
        require(newAppraisalValueUSD > 0, "DepositorVault: new appraisal is zero");

        if (newAppraisalValueUSD == previous) {
            return;
        }

        if (newAppraisalValueUSD > previous) {
            uint256 delta = newAppraisalValueUSD - previous;
            totalShares += delta;
        } else {
            uint256 delta = previous - newAppraisalValueUSD;
            totalShares -= delta;
        }

        _shares[account] = newAppraisalValueUSD;
        _rewardDebt[account] = (_shares[account] * accYieldPerShare) / REWARD_PRECISION;

        emit IDepositorVault.DepositorUpdated(account, previous, newAppraisalValueUSD);
    }

    /// @inheritdoc IDepositorVault
    function deregisterDepositor(address account) external override onlyTreasury whenNotPaused {
        require(account != address(0), "DepositorVault: invalid depositor");

        _accrue(account);

        uint256 currentShares = _shares[account];
        require(currentShares > 0, "DepositorVault: no shares");

        // Auto-transfer any unclaimed yield to the user before clearing
        uint256 unclaimed = _unclaimed[account];
        if (unclaimed > 0) {
            _unclaimed[account] = 0;
            totalYieldClaimed += unclaimed;

            // Record analytics in GachaTreasury
            if (treasury != address(0) && treasury.code.length > 0) {
                try IGachaTreasuryYieldTracker(treasury).recordYieldClaim(account, unclaimed) {} catch {}
            }

            asset.safeTransfer(account, unclaimed);
            emit IDepositorVault.YieldClaimed(account, unclaimed);
        }

        totalShares -= currentShares;
        _shares[account] = 0;
        _rewardDebt[account] = 0;

        emit IDepositorVault.DepositorDeregistered(account, currentShares);
    }

    /// @inheritdoc IDepositorVault
    function distributeYield(uint256 amount) external override onlyEconomyManager whenNotPaused nonReentrant {
        require(amount > 0, "DepositorVault: amount is zero");
        require(totalShares > 0, "DepositorVault: no shares outstanding");

        uint256 increment = (amount * REWARD_PRECISION) / totalShares;
        require(increment > 0, "DepositorVault: yield too small");

        asset.safeTransferFrom(msg.sender, address(this), amount);

        accYieldPerShare += increment;
        totalYieldDistributed += amount;

        emit IDepositorVault.YieldDistributed(msg.sender, amount);
    }

    /// @inheritdoc IDepositorVault
    function claimYield(address account) external override whenNotPaused nonReentrant returns (uint256 withdrawn) {
        require(account != address(0), "DepositorVault: invalid account");
        require(msg.sender == account || msg.sender == economyManager, "DepositorVault: unauthorized claim");

        _accrue(account);

        withdrawn = _unclaimed[account];
        require(withdrawn > 0, "DepositorVault: nothing to claim");

        _unclaimed[account] = 0;
        totalYieldClaimed += withdrawn;

        // Record claimed analytics in GachaTreasury if treasury is set and is a contract
        if (treasury != address(0) && treasury.code.length > 0) {
            try IGachaTreasuryYieldTracker(treasury).recordYieldClaim(account, withdrawn) {
                // Successfully recorded analytics
            } catch {
                // Fail silently to not break claim functionality if treasury call fails
            }
        }

        require(asset.balanceOf(address(this)) >= withdrawn, "DepositorVault: insufficient vault balance");
        asset.safeTransfer(account, withdrawn);

        emit IDepositorVault.YieldClaimed(account, withdrawn);
    }

    /// @inheritdoc IDepositorVault
    function pendingYield(address account) external view override returns (uint256) {
        uint256 share = _shares[account];
        uint256 owed = (share * accYieldPerShare) / REWARD_PRECISION;
        uint256 pending = owed > _rewardDebt[account] ? owed - _rewardDebt[account] : 0;
        return pending + _unclaimed[account];
    }

    /// @inheritdoc IDepositorVault
    function sharesOf(address account) external view override returns (uint256) {
        return _shares[account];
    }

    /**
     * @notice Updates the treasury address
     */
    function setTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "DepositorVault: treasury is zero");
        address previous = treasury;
        treasury = newTreasury;
        emit TreasuryUpdated(previous, newTreasury);
    }

    /**
     * @notice Updates the economy manager address
     */
    function setEconomyManager(address newManager) external onlyOwner {
        require(newManager != address(0), "DepositorVault: manager is zero");
        address previous = economyManager;
        economyManager = newManager;
        emit EconomyManagerUpdated(previous, newManager);
    }

    /**
     * @notice Emergency pause of distribution and staking logic
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Lift emergency pause
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Accrues pending rewards for an account into `_unclaimed`
     */
    function _accrue(address account) private {
        if (account == address(0)) {
            return;
        }
        uint256 share = _shares[account];
        if (share == 0) {
            return;
        }

        uint256 accrued = (share * accYieldPerShare) / REWARD_PRECISION;
        uint256 debt = _rewardDebt[account];
        if (accrued > debt) {
            _unclaimed[account] += accrued - debt;
        }
        _rewardDebt[account] = accrued;
    }

    /**
     * @notice Authorizes UUPS upgrades
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    uint256[42] private __gap;
}
