// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import {ReentrancyGuardTransient} from "@openzeppelin/contracts/utils/ReentrancyGuardTransient.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";
import {IGachaEconomyManager} from "../interfaces/IGachaEconomyManager.sol";
import {IDepositorVault} from "../interfaces/IDepositorVault.sol";
import {IProtocolTreasury} from "../interfaces/IProtocolTreasury.sol";
import {GachaTreasury} from "../gacha/GachaTreasury.sol";

/**
 * @title GachaEconomyManager
 * @notice Routes spin revenue between depositor yield vault and protocol treasury.
 */
contract GachaEconomyManager is
    IGachaEconomyManager,
    Initializable,
    OwnableUpgradeable,
    PausableUpgradeable,
    ReentrancyGuardTransient,
    UUPSUpgradeable
{
    using SafeERC20 for IERC20;

    /// @notice Basis points denominator
    uint256 public constant BPS_DENOMINATOR = 10_000;

    /// @notice USDC token used for all accounting
    IERC20 public feeToken;
    /// @notice Authorized gacha contract
    address public gacha;
    /// @notice Depositor yield vault
    IDepositorVault public depositorVault;
    /// @notice Protocol treasury wallet
    IProtocolTreasury public protocolTreasury;

    /// @inheritdoc IGachaEconomyManager
    uint256 public override depositorShareBps;
    /// @inheritdoc IGachaEconomyManager
    uint256 public override protocolShareBps;

    /// @notice Aggregate metrics
    uint256 public totalRevenueProcessed;
    uint256 public totalToDepositors;
    uint256 public totalToProtocol;
    mapping(GachaTreasury.Rarity => uint256) public revenueByRarity;

    /// @notice Queued depositor yield when no shares exist
    uint256 public queuedDepositorYield;

    /// @notice Total queued yield that has been released to depositors
    uint256 public totalQueuedYieldReleased;

    /// @notice Custom errors
    error CallerNotGacha();
    error ZeroAddress();
    error ZeroRevenue();
    error InvalidRevenueSplit();

    /// @notice Events for admin changes
    event FeeTokenUpdated(address indexed previousToken, address indexed newToken);
    event GachaUpdated(address indexed previousGacha, address indexed newGacha);
    event DepositorVaultUpdated(address indexed previousVault, address indexed newVault);
    event ProtocolTreasuryUpdated(address indexed previousTreasury, address indexed newTreasury);
    event DepositorYieldQueued(uint256 amount);
    event QueuedDepositorYieldProcessed(uint256 amount);

    modifier onlyGacha() {
        if (msg.sender != gacha) revert CallerNotGacha();
        _;
    }

    /**
     * @notice Initialize the economy manager
     * @param owner Owner address
     * @param feeToken_ USDC token
     * @param gacha_ Gacha contract authorized to report revenue
     * @param depositorVault_ Depositor vault address
     * @param protocolTreasury_ Protocol treasury address
     */
    function initialize(
        address owner,
        address feeToken_,
        address gacha_,
        address depositorVault_,
        address protocolTreasury_
    ) external initializer {
        if (owner == address(0)) revert ZeroAddress();
        if (feeToken_ == address(0)) revert ZeroAddress();
        if (gacha_ == address(0)) revert ZeroAddress();
        if (depositorVault_ == address(0)) revert ZeroAddress();
        if (protocolTreasury_ == address(0)) revert ZeroAddress();

        __Ownable_init(owner);
        __Pausable_init();
        // ReentrancyGuardTransient doesn't need initialization

        feeToken = IERC20(feeToken_);
        gacha = gacha_;
        depositorVault = IDepositorVault(depositorVault_);
        protocolTreasury = IProtocolTreasury(protocolTreasury_);

        depositorShareBps = 9_500;
        protocolShareBps = 500;
        emit RevenueSplitUpdated(depositorShareBps, protocolShareBps);
    }

    /// @inheritdoc IGachaEconomyManager
    function onSpinRevenue(uint256 usdcAmount, GachaTreasury.Rarity hitRarity)
        external
        override
        onlyGacha
        whenNotPaused
        nonReentrant
    {
        if (usdcAmount == 0) revert ZeroRevenue();

        // Pull funds from Gacha
        feeToken.safeTransferFrom(msg.sender, address(this), usdcAmount);

        uint256 depositShare = Math.mulDiv(usdcAmount, depositorShareBps, BPS_DENOMINATOR);
        uint256 protocolShare = Math.mulDiv(usdcAmount, protocolShareBps, BPS_DENOMINATOR);

        // Ensure rounding remainder is given to protocol treasury
        uint256 distributed = depositShare + protocolShare;
        if (distributed < usdcAmount) {
            protocolShare += usdcAmount - distributed;
        }

        uint256 totalShares = depositorVault.totalShares();
        uint256 queuedAmount = 0;

        // Queue depositor yield if no shares exist
        if (depositShare > 0 && totalShares == 0) {
            queuedDepositorYield += depositShare;
            emit DepositorYieldQueued(depositShare);
            depositShare = 0;
        }

        // Process any queued yield if shares now exist
        if (queuedDepositorYield > 0 && totalShares > 0) {
            queuedAmount = queuedDepositorYield;
            depositShare += queuedDepositorYield;
            emit QueuedDepositorYieldProcessed(queuedDepositorYield);
            queuedDepositorYield = 0;
        }

        if (depositShare > 0) {
            feeToken.forceApprove(address(depositorVault), depositShare);
            depositorVault.distributeYield(depositShare);
        }

        if (protocolShare > 0) {
            feeToken.forceApprove(address(protocolTreasury), protocolShare);
            protocolTreasury.onRevenueReceived(protocolShare);
        }

        // NOTE: Protocol yield auto-claim removed to prevent DoS vector.
        // If claimYield or downstream protocolTreasury logic reverts,
        // it would block all spins. Protocol should claim on its own schedule
        // via depositorVault.claimYield(protocolTreasuryAddress).

        totalRevenueProcessed += usdcAmount;
        revenueByRarity[hitRarity] += usdcAmount;
        // Only count new revenue towards depositors (queued yield was already counted)
        totalToDepositors += (depositShare - queuedAmount);
        if (queuedAmount > 0) totalQueuedYieldReleased += queuedAmount;
        totalToProtocol += protocolShare;

        emit SpinRevenueReceived(usdcAmount, depositShare, protocolShare);
    }

    /**
     * @notice Updates the fee split (BPS must sum to <= 10_000)
     */
    function setRevenueSplit(uint256 depositorBps, uint256 protocolBps) external onlyOwner {
        if (depositorBps + protocolBps != BPS_DENOMINATOR) revert InvalidRevenueSplit();

        depositorShareBps = depositorBps;
        protocolShareBps = protocolBps;

        emit RevenueSplitUpdated(depositorBps, protocolBps);
    }

    /**
     * @notice Updates the fee token
     */
    function setFeeToken(address newToken) external onlyOwner {
        if (newToken == address(0)) revert ZeroAddress();
        address previous = address(feeToken);
        feeToken = IERC20(newToken);
        emit FeeTokenUpdated(previous, newToken);
    }

    /**
     * @notice Updates the gacha contract address
     */
    function setGacha(address newGacha) external onlyOwner {
        if (newGacha == address(0)) revert ZeroAddress();
        address previous = gacha;
        gacha = newGacha;
        emit GachaUpdated(previous, newGacha);
    }

    /**
     * @notice Updates downstream vault addresses
     */
    function setVaults(address depositorVault_, address protocolTreasury_) external onlyOwner {
        if (depositorVault_ != address(0)) {
            address previous = address(depositorVault);
            depositorVault = IDepositorVault(depositorVault_);
            emit DepositorVaultUpdated(previous, depositorVault_);
        }

        if (protocolTreasury_ != address(0)) {
            address previousProtocol = address(protocolTreasury);
            protocolTreasury = IProtocolTreasury(protocolTreasury_);
            emit ProtocolTreasuryUpdated(previousProtocol, protocolTreasury_);
        }
    }

    /**
     * @notice Pause revenue routing
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause revenue routing
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice Authorizes UUPS upgrades
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    uint256[41] private __gap;
}
