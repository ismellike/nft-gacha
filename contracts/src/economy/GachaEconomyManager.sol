// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";
import {IGachaEconomyManager} from "../interfaces/IGachaEconomyManager.sol";
import {IDepositorVault} from "../interfaces/IDepositorVault.sol";
import {IBuybackVault} from "../interfaces/IBuybackVault.sol";
import {IProtocolTreasury} from "../interfaces/IProtocolTreasury.sol";
import {GachaTreasury} from "../gacha/GachaTreasury.sol";

/**
 * @title GachaEconomyManager
 * @notice Routes spin revenue between depositor yield vault, buyback vault, and protocol treasury.
 */
contract GachaEconomyManager is
    IGachaEconomyManager,
    Initializable,
    OwnableUpgradeable,
    PausableUpgradeable,
    ReentrancyGuardUpgradeable,
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
    /// @notice Buyback liquidity vault
    IBuybackVault public buybackVault;
    /// @notice Protocol treasury wallet
    IProtocolTreasury public protocolTreasury;

    /// @inheritdoc IGachaEconomyManager
    uint256 public override depositorShareBps;
    /// @inheritdoc IGachaEconomyManager
    uint256 public override buybackShareBps;
    /// @inheritdoc IGachaEconomyManager
    uint256 public override protocolShareBps;

    /// @notice Aggregate metrics
    uint256 public totalRevenueProcessed;
    uint256 public totalToDepositors;
    uint256 public totalToBuyback;
    uint256 public totalToProtocol;
    mapping(GachaTreasury.Rarity => uint256) public revenueByRarity;

    /// @notice Events for admin changes
    event FeeTokenUpdated(address indexed previousToken, address indexed newToken);
    event GachaUpdated(address indexed previousGacha, address indexed newGacha);
    event DepositorVaultUpdated(address indexed previousVault, address indexed newVault);
    event BuybackVaultUpdated(address indexed previousVault, address indexed newVault);
    event ProtocolTreasuryUpdated(address indexed previousTreasury, address indexed newTreasury);

    modifier onlyGacha() {
        require(msg.sender == gacha, "GachaEconomyManager: caller not gacha");
        _;
    }

    /**
     * @notice Initialize the economy manager
     * @param owner Owner address
     * @param feeToken_ USDC token
     * @param gacha_ Gacha contract authorized to report revenue
     * @param depositorVault_ Depositor vault address
     * @param buybackVault_ Buyback vault address
     * @param protocolTreasury_ Protocol treasury address
     */
    function initialize(
        address owner,
        address feeToken_,
        address gacha_,
        address depositorVault_,
        address buybackVault_,
        address protocolTreasury_
    ) external initializer {
        require(owner != address(0), "GachaEconomyManager: owner is zero");
        require(feeToken_ != address(0), "GachaEconomyManager: token is zero");
        require(gacha_ != address(0), "GachaEconomyManager: gacha is zero");
        require(depositorVault_ != address(0), "GachaEconomyManager: depositor vault is zero");
        require(buybackVault_ != address(0), "GachaEconomyManager: buyback vault is zero");
        require(protocolTreasury_ != address(0), "GachaEconomyManager: protocol treasury is zero");

        __Ownable_init();
        __Pausable_init();
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();

        feeToken = IERC20(feeToken_);
        gacha = gacha_;
        depositorVault = IDepositorVault(depositorVault_);
        buybackVault = IBuybackVault(buybackVault_);
        protocolTreasury = IProtocolTreasury(protocolTreasury_);

        depositorShareBps = 7_000;
        buybackShareBps = 2_500;
        protocolShareBps = 500;

        _transferOwnership(owner);
    }

    /// @inheritdoc IGachaEconomyManager
    function onSpinRevenue(uint256 usdcAmount, GachaTreasury.Rarity hitRarity)
        external
        override
        onlyGacha
        whenNotPaused
        nonReentrant
    {
        require(usdcAmount > 0, "GachaEconomyManager: zero revenue");

        // Pull funds from Gacha
        feeToken.safeTransferFrom(msg.sender, address(this), usdcAmount);

        uint256 depositShare = Math.mulDiv(usdcAmount, depositorShareBps, BPS_DENOMINATOR);
        uint256 buybackShare = Math.mulDiv(usdcAmount, buybackShareBps, BPS_DENOMINATOR);
        uint256 protocolShare = Math.mulDiv(usdcAmount, protocolShareBps, BPS_DENOMINATOR);

        // Ensure rounding remainder is given to protocol treasury
        uint256 distributed = depositShare + buybackShare + protocolShare;
        if (distributed < usdcAmount) {
            protocolShare += usdcAmount - distributed;
        }

        if (depositShare > 0) {
            feeToken.forceApprove(address(depositorVault), depositShare);
            depositorVault.distributeYield(depositShare);
        }

        if (buybackShare > 0) {
            feeToken.forceApprove(address(buybackVault), buybackShare);
            buybackVault.onRevenueReceived(buybackShare);
        }

        if (protocolShare > 0) {
            feeToken.forceApprove(address(protocolTreasury), protocolShare);
            protocolTreasury.onRevenueReceived(protocolShare);
        }

        totalRevenueProcessed += usdcAmount;
        revenueByRarity[hitRarity] += usdcAmount;
        totalToDepositors += depositShare;
        totalToBuyback += buybackShare;
        totalToProtocol += protocolShare;

        emit SpinRevenueReceived(usdcAmount, depositShare, buybackShare, protocolShare);
    }

    /**
     * @notice Updates the fee split (BPS must sum to <= 10_000)
     */
    function setRevenueSplit(uint256 depositorBps, uint256 buybackBps, uint256 protocolBps) external onlyOwner {
        require(depositorBps + buybackBps + protocolBps <= BPS_DENOMINATOR, "GachaEconomyManager: invalid split");

        depositorShareBps = depositorBps;
        buybackShareBps = buybackBps;
        protocolShareBps = protocolBps;

        emit RevenueSplitUpdated(depositorBps, buybackBps, protocolBps);
    }

    /**
     * @notice Updates the fee token
     */
    function setFeeToken(address newToken) external onlyOwner {
        require(newToken != address(0), "GachaEconomyManager: token is zero");
        address previous = address(feeToken);
        feeToken = IERC20(newToken);
        emit FeeTokenUpdated(previous, newToken);
    }

    /**
     * @notice Updates the gacha contract address
     */
    function setGacha(address newGacha) external onlyOwner {
        require(newGacha != address(0), "GachaEconomyManager: gacha is zero");
        address previous = gacha;
        gacha = newGacha;
        emit GachaUpdated(previous, newGacha);
    }

    /**
     * @notice Updates downstream vault addresses
     */
    function setVaults(address depositorVault_, address buybackVault_, address protocolTreasury_) external onlyOwner {
        if (depositorVault_ != address(0)) {
            address previous = address(depositorVault);
            depositorVault = IDepositorVault(depositorVault_);
            emit DepositorVaultUpdated(previous, depositorVault_);
        }

        if (buybackVault_ != address(0)) {
            address previousBuyback = address(buybackVault);
            buybackVault = IBuybackVault(buybackVault_);
            emit BuybackVaultUpdated(previousBuyback, buybackVault_);
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

    uint256[42] private __gap;
}
