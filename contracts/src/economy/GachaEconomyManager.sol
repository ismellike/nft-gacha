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
import {ICardGroupedVault} from "../interfaces/ICardGroupedVault.sol";
import {IProtocolTreasury} from "../interfaces/IProtocolTreasury.sol";

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
    /// @notice Default depositor share (95%)
    uint256 public constant DEFAULT_DEPOSITOR_SHARE_BPS = 9_500;
    /// @notice Default protocol share (5%)
    uint256 public constant DEFAULT_PROTOCOL_SHARE_BPS = 500;

    /// @notice USDC token used for all accounting
    IERC20 public feeToken;
    /// @notice Authorized gacha contract
    address public gacha;
    /// @notice Card-grouped yield vault
    ICardGroupedVault public cardGroupedVault;
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
    mapping(uint8 => uint256) public revenueByRarity;

    /// @notice Number of rarity tiers
    uint8 public numRarities;

    /// @notice Per-rarity queued depositor yield when no shares exist in that rarity pool
    mapping(uint8 => uint256) public queuedYieldByRarity;

    /// @notice Total queued yield that has been released to depositors
    uint256 public totalQueuedYieldReleased;

    /// @notice Custom errors
    error CallerNotGacha();
    error ZeroAddress();
    error ZeroRevenue();
    error InvalidRevenueSplit();
    error InvalidNumRarities();

    /// @notice Events for admin changes
    event FeeTokenUpdated(address indexed previousToken, address indexed newToken);
    event GachaUpdated(address indexed previousGacha, address indexed newGacha);
    event CardGroupedVaultUpdated(address indexed previousVault, address indexed newVault);
    event ProtocolTreasuryUpdated(address indexed previousTreasury, address indexed newTreasury);
    event DepositorYieldQueued(uint256 amount, uint8 rarity);
    event QueuedDepositorYieldProcessed(uint256 amount, uint8 rarity);

    modifier onlyGacha() {
        _onlyGacha();
        _;
    }

    function _onlyGacha() internal view {
        if (msg.sender != gacha) revert CallerNotGacha();
    }

    /**
     * @notice Initialize the economy manager
     * @param owner Owner address
     * @param feeToken_ USDC token
     * @param gacha_ Gacha contract authorized to report revenue
     * @param cardGroupedVault_ Card-grouped vault address
     * @param protocolTreasury_ Protocol treasury address
     * @param numRarities_ Number of rarity tiers
     */
    function initialize(
        address owner,
        address feeToken_,
        address gacha_,
        address cardGroupedVault_,
        address protocolTreasury_,
        uint8 numRarities_
    ) external initializer {
        if (owner == address(0)) revert ZeroAddress();
        if (feeToken_ == address(0)) revert ZeroAddress();
        if (gacha_ == address(0)) revert ZeroAddress();
        if (cardGroupedVault_ == address(0)) revert ZeroAddress();
        if (protocolTreasury_ == address(0)) revert ZeroAddress();
        if (numRarities_ < 2 || numRarities_ > 10) revert InvalidNumRarities();

        __Ownable_init(owner);
        __Pausable_init();
        // ReentrancyGuardTransient doesn't need initialization

        feeToken = IERC20(feeToken_);
        gacha = gacha_;
        cardGroupedVault = ICardGroupedVault(cardGroupedVault_);
        protocolTreasury = IProtocolTreasury(protocolTreasury_);
        numRarities = numRarities_;

        depositorShareBps = DEFAULT_DEPOSITOR_SHARE_BPS;
        protocolShareBps = DEFAULT_PROTOCOL_SHARE_BPS;
        emit RevenueSplitUpdated(depositorShareBps, protocolShareBps);
    }

    /// @inheritdoc IGachaEconomyManager
    function onSpinRevenue(uint256 usdcAmount, uint8 hitRarity)
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

        // Try to distribute this spin's depositor share to the hit rarity
        uint256 actualDistributed = 0;
        if (depositShare > 0) {
            feeToken.forceApprove(address(cardGroupedVault), depositShare);
            try cardGroupedVault.distributeYield(depositShare, hitRarity) {
                actualDistributed += depositShare;
            } catch {
                // Rarity pool is empty — queue for that specific rarity
                queuedYieldByRarity[hitRarity] += depositShare;
                emit DepositorYieldQueued(depositShare, hitRarity);
            }
        }

        // Flush queued yield for each rarity that has a non-zero queue
        uint256 totalFlushed = 0;
        for (uint8 i; i < numRarities; i++) {
            uint256 queued = queuedYieldByRarity[i];
            if (queued == 0) continue;
            feeToken.forceApprove(address(cardGroupedVault), queued);
            try cardGroupedVault.distributeYield(queued, i) {
                totalFlushed += queued;
                queuedYieldByRarity[i] = 0;
                emit QueuedDepositorYieldProcessed(queued, i);
            } catch {
                // Pool still empty — leave queued
            }
        }

        if (protocolShare > 0) {
            feeToken.forceApprove(address(protocolTreasury), protocolShare);
            protocolTreasury.onRevenueReceived(protocolShare);
        }

        totalRevenueProcessed += usdcAmount;
        revenueByRarity[hitRarity] += usdcAmount;
        totalToDepositors += actualDistributed + totalFlushed;
        if (totalFlushed > 0) totalQueuedYieldReleased += totalFlushed;
        totalToProtocol += protocolShare;

        emit SpinRevenueReceived(usdcAmount, actualDistributed + totalFlushed, protocolShare);
    }

    /**
     * @notice Returns the sum of all per-rarity queued yield awaiting distribution
     * @return total Aggregate queued USDC across all rarity tiers
     */
    function totalQueuedYield() external view returns (uint256 total) {
        for (uint8 i; i < numRarities; i++) total += queuedYieldByRarity[i];
    }

    /**
     * @notice Updates the depositor/protocol revenue split
     * @dev Both values must sum to exactly BPS_DENOMINATOR (10,000).
     * @param depositorBps Basis points allocated to depositor yield (e.g. 9500 = 95%)
     * @param protocolBps Basis points allocated to protocol treasury (e.g. 500 = 5%)
     */
    function setRevenueSplit(uint256 depositorBps, uint256 protocolBps) external onlyOwner {
        if (depositorBps + protocolBps != BPS_DENOMINATOR) revert InvalidRevenueSplit();

        depositorShareBps = depositorBps;
        protocolShareBps = protocolBps;

        emit RevenueSplitUpdated(depositorBps, protocolBps);
    }

    /**
     * @notice Updates the fee token contract address
     * @param newToken New ERC20 token address (must be non-zero)
     */
    function setFeeToken(address newToken) external onlyOwner {
        if (newToken == address(0)) revert ZeroAddress();
        address previous = address(feeToken);
        feeToken = IERC20(newToken);
        emit FeeTokenUpdated(previous, newToken);
    }

    /**
     * @notice Updates the authorized gacha contract address
     * @param newGacha New gacha contract address (must be non-zero)
     */
    function setGacha(address newGacha) external onlyOwner {
        if (newGacha == address(0)) revert ZeroAddress();
        address previous = gacha;
        gacha = newGacha;
        emit GachaUpdated(previous, newGacha);
    }

    /**
     * @notice Updates downstream vault addresses for yield routing
     * @dev Pass address(0) for either parameter to skip updating that vault.
     * @param cardGroupedVault_ New card-grouped vault address (or address(0) to skip)
     * @param protocolTreasury_ New protocol treasury address (or address(0) to skip)
     */
    function setVaults(address cardGroupedVault_, address protocolTreasury_) external onlyOwner {
        if (cardGroupedVault_ != address(0)) {
            address previous = address(cardGroupedVault);
            cardGroupedVault = ICardGroupedVault(cardGroupedVault_);
            emit CardGroupedVaultUpdated(previous, cardGroupedVault_);
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

    uint256[40] private __gap;
}
