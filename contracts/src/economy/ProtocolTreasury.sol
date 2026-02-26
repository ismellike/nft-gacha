// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";
import {ReentrancyGuardTransient} from "@openzeppelin/contracts/utils/ReentrancyGuardTransient.sol";
import {IProtocolTreasury} from "../interfaces/IProtocolTreasury.sol";
import {GachaTreasury} from "../gacha/GachaTreasury.sol";
import {NFTAppraisal} from "../appraisal/NFTAppraisal.sol";

/**
 * @title ProtocolTreasury
 * @notice Collects the protocol's 5% revenue share and provides DAO-controlled outflows.
 */
contract ProtocolTreasury is
    IProtocolTreasury,
    Initializable,
    OwnableUpgradeable,
    PausableUpgradeable,
    ReentrancyGuardTransient,
    UUPSUpgradeable
{
    using SafeERC20 for IERC20;

    /// @notice Custom errors for gas efficiency
    error UnauthorizedEconomyManager();
    error ZeroAddress(string context);
    error InvalidAmount();
    error InsufficientLiquidity();
    error AppraisalMissing();
    error RedemptionWindowExpired();
    error InvalidArrayLength();

    /// @notice Payout percentage (in basis points) for NFT redemptions (80%)
    uint256 public constant REDEMPTION_PAYOUT_BPS = 8_000;
    /// @notice Conversion multiplier between 18-decimal appraisals and 6-decimal USDC
    uint256 private constant USD_TO_USDC_CONVERSION = 1e12;
    /// @notice Redemption window after winning NFT (configurable by admin)
    uint256 public redemptionWindow = 1 hours;

    IERC20 private _asset;
    address public economyManager;
    GachaTreasury private _treasury;
    NFTAppraisal public appraisalOracle;

    event GachaTreasuryUpdated(address indexed previousTreasury, address indexed newTreasury);
    event AppraisalOracleUpdated(address indexed previousOracle, address indexed newOracle);
    event EconomyManagerUpdated(address indexed previousManager, address indexed newManager);
    event RedemptionWindowEnforced(address indexed collection, uint256 indexed tokenId, address indexed user, uint256 timeSinceWin);
    event RedemptionWindowUpdated(uint256 indexed oldWindow, uint256 indexed newWindow);

    modifier onlyEconomyManager() {
        _onlyEconomyManager();
        _;
    }

    function _onlyEconomyManager() internal view {
        if (msg.sender != economyManager) revert UnauthorizedEconomyManager();
    }

    /**
     * @notice Initialize the protocol treasury
     * @param owner Owner address (DAO or multisig)
     * @param asset_ USDC token address
     * @param economyManager_ Economy manager allowed to forward revenue
     * @param treasury_ Gacha treasury reference used to restock NFTs
     * @param appraisalOracle_ Oracle providing USD appraisals
     */
    function initialize(
        address owner,
        address asset_,
        address economyManager_,
        address treasury_,
        address appraisalOracle_
    ) external initializer {
        if (owner == address(0)) revert ZeroAddress("owner");
        if (asset_ == address(0)) revert ZeroAddress("asset");
        if (economyManager_ == address(0)) revert ZeroAddress("economyManager");
        if (treasury_ == address(0)) revert ZeroAddress("treasury");
        if (appraisalOracle_ == address(0)) revert ZeroAddress("appraisalOracle");

        __Ownable_init(owner);
        __Pausable_init();

        _asset = IERC20(asset_);
        economyManager = economyManager_;
        _treasury = GachaTreasury(treasury_);
        appraisalOracle = NFTAppraisal(appraisalOracle_);

        redemptionWindow = 1 hours;
    }

    /// @inheritdoc IProtocolTreasury
    function asset() external view override returns (IERC20) {
        return _asset;
    }

    /**
     * @notice Returns the associated gacha treasury
     */
    function gachaTreasury() external view returns (GachaTreasury) {
        return _treasury;
    }

    /// @inheritdoc IProtocolTreasury
    function onRevenueReceived(uint256 amount) external override onlyEconomyManager whenNotPaused {
        if (amount == 0) revert InvalidAmount();
        _asset.safeTransferFrom(msg.sender, address(this), amount);
        emit ProtocolRevenueReceived(amount);
    }

    /**
     * @notice Allows players to redeem NFTs back to the protocol at 80% of the appraised value.
     * @param collection NFT contract address
     * @param tokenId NFT identifier
     * @return payout Amount paid in USDC (6 decimals)
     */
    function executeRedemption(address collection, uint256 tokenId)
        external
        whenNotPaused
        nonReentrant
        returns (uint256 payout)
    {
        if (collection == address(0)) revert ZeroAddress("collection");

        (uint256 appraisalUSD, NFTAppraisal.AppraisalStatus status) =
            appraisalOracle.getAppraisedPrice(collection, tokenId);
        if (
            appraisalUSD == 0
                || (
                    status != NFTAppraisal.AppraisalStatus.Completed && status != NFTAppraisal.AppraisalStatus.OwnerOverride
                )
        ) {
            revert AppraisalMissing();
        }

        payout = Math.mulDiv(appraisalUSD, REDEMPTION_PAYOUT_BPS, 10_000 * USD_TO_USDC_CONVERSION);
        if (payout == 0) revert InvalidAmount();

        // Check redemption window using snapshot deadline
        uint256 deadline = _treasury.getNFTRedemptionDeadline(collection, tokenId);
        if (deadline == 0 || block.timestamp > deadline) {
            revert RedemptionWindowExpired();
        }

        uint256 receiveTime = _treasury.getNFTReceiveTime(collection, tokenId);
        uint256 timeSinceWin = receiveTime > 0 ? block.timestamp - receiveTime : 0;
        emit RedemptionWindowEnforced(collection, tokenId, msg.sender, timeSinceWin);

        if (_asset.balanceOf(address(this)) < payout) revert InsufficientLiquidity();

        IERC721(collection).safeTransferFrom(msg.sender, address(_treasury), tokenId);
        _treasury.handleRedemptionReturn(collection, tokenId, msg.sender, appraisalUSD);

        _asset.safeTransfer(msg.sender, payout);

        emit RedemptionExecuted(msg.sender, collection, tokenId, payout);
        return payout;
    }

    /// @inheritdoc IProtocolTreasury
    function transferOut(address to, uint256 amount) external override onlyOwner whenNotPaused {
        if (to == address(0)) revert ZeroAddress("recipient");
        if (amount == 0) revert InvalidAmount();
        _asset.safeTransfer(to, amount);
        emit ProtocolTransfer(to, amount);
    }

    /**
     * @notice Sets a new economy manager
     */
    function setEconomyManager(address newManager) external onlyOwner {
        if (newManager == address(0)) revert ZeroAddress("newManager");
        address previous = economyManager;
        economyManager = newManager;
        emit EconomyManagerUpdated(previous, newManager);
    }

    /**
     * @notice Updates the gacha treasury reference
     */
    function setGachaTreasury(address newTreasury) external onlyOwner {
        if (newTreasury == address(0)) revert ZeroAddress("newTreasury");
        address previous = address(_treasury);
        _treasury = GachaTreasury(newTreasury);
        emit GachaTreasuryUpdated(previous, newTreasury);
    }

    /**
     * @notice Updates the appraisal oracle
     */
    function setAppraisalOracle(address newOracle) external onlyOwner {
        if (newOracle == address(0)) revert ZeroAddress("newOracle");
        address previous = address(appraisalOracle);
        appraisalOracle = NFTAppraisal(newOracle);
        emit AppraisalOracleUpdated(previous, newOracle);
    }

    /**
     * @notice Pause treasury operations
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause treasury operations
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice Gets the remaining redemption window for an NFT
     * @param collection NFT collection address
     * @param tokenId NFT identifier
     * @return remainingTime Remaining time in seconds (0 if expired)
     */
    function getRemainingRedemptionWindow(address collection, uint256 tokenId) external view returns (uint256 remainingTime) {
        uint256 deadline = _treasury.getNFTRedemptionDeadline(collection, tokenId);
        if (deadline == 0 || block.timestamp >= deadline) return 0;
        return deadline - block.timestamp;
    }

    /**
     * @notice Checks if an NFT is still within redemption window
     * @param collection NFT collection address
     * @param tokenId NFT identifier
     * @return isEligible True if NFT can still be redeemed
     */
    function isRedemptionEligible(address collection, uint256 tokenId) external view returns (bool isEligible) {
        uint256 deadline = _treasury.getNFTRedemptionDeadline(collection, tokenId);
        return deadline > 0 && block.timestamp <= deadline;
    }

    /**
     * @notice Updates the redemption window duration
     * @param newWindow New redemption window duration in seconds
     * @dev Only owner can call this function
     */
    function setRedemptionWindow(uint256 newWindow) external onlyOwner {
        if (newWindow == 0) revert InvalidAmount();
        uint256 oldWindow = redemptionWindow;
        redemptionWindow = newWindow;
        emit RedemptionWindowUpdated(oldWindow, newWindow);
    }

    /**
     * @notice Authorizes UUPS upgrades
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    uint256[44] private __gap;
}
