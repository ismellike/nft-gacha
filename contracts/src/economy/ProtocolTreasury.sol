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

    /// @notice Payout percentage (in basis points) for NFT redemptions (85%)
    uint256 public constant REDEMPTION_PAYOUT_BPS = 8_500;
    /// @notice Conversion multiplier between 18-decimal appraisals and 6-decimal USDC
    uint256 private constant USD_TO_USDC_CONVERSION = 1e12;
    /// @notice Redemption window after winning NFT (1 hour)
    uint256 public constant REDEMPTION_WINDOW = 1 hours;

    IERC20 private _asset;
    address public economyManager;
    GachaTreasury private _treasury;
    NFTAppraisal public appraisalOracle;

    event GachaTreasuryUpdated(address indexed previousTreasury, address indexed newTreasury);
    event AppraisalOracleUpdated(address indexed previousOracle, address indexed newOracle);
    event EconomyManagerUpdated(address indexed previousManager, address indexed newManager);
    event RedemptionWindowEnforced(address indexed collection, uint256 indexed tokenId, address indexed user, uint256 timeSinceWin);

    modifier onlyEconomyManager() {
        require(msg.sender == economyManager, "ProtocolTreasury: caller not manager");
        _;
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
        require(owner != address(0), "ProtocolTreasury: owner is zero");
        require(asset_ != address(0), "ProtocolTreasury: asset is zero");
        require(economyManager_ != address(0), "ProtocolTreasury: manager is zero");
        require(treasury_ != address(0), "ProtocolTreasury: treasury is zero");
        require(appraisalOracle_ != address(0), "ProtocolTreasury: oracle is zero");

        __Ownable_init(owner);
        __Pausable_init();

        _asset = IERC20(asset_);
        economyManager = economyManager_;
        _treasury = GachaTreasury(treasury_);
        appraisalOracle = NFTAppraisal(appraisalOracle_);

        _transferOwnership(owner);
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
        require(amount > 0, "ProtocolTreasury: amount is zero");
        _asset.safeTransferFrom(msg.sender, address(this), amount);
        emit ProtocolRevenueReceived(amount);
    }

    /**
     * @notice Allows players to redeem NFTs back to the protocol at 85% of the appraised value.
     * @param collection NFT contract address
     * @param tokenId NFT identifier
     * @param recipient Address receiving the USDC payout
     * @return payout Amount paid in USDC (6 decimals)
     */
    function executeRedemption(address collection, uint256 tokenId, address recipient)
        external
        whenNotPaused
        nonReentrant
        returns (uint256 payout)
    {
        require(collection != address(0), "ProtocolTreasury: bad collection");
        require(recipient != address(0), "ProtocolTreasury: bad recipient");

        (uint256 appraisalUSD, NFTAppraisal.AppraisalStatus status) =
            appraisalOracle.getAppraisedPrice(collection, tokenId);
        require(
            appraisalUSD > 0
                && (
                    status == NFTAppraisal.AppraisalStatus.Completed || status == NFTAppraisal.AppraisalStatus.OwnerOverride
                ),
            "ProtocolTreasury: appraisal missing"
        );

        payout = Math.mulDiv(appraisalUSD, REDEMPTION_PAYOUT_BPS, 10_000) / USD_TO_USDC_CONVERSION;
        require(payout > 0, "ProtocolTreasury: payout underflows");

        // Check redemption window (user must redeem within 1 hour of winning)
        uint256 receiveTime = _treasury.getNFTReceiveTime(collection, tokenId);
        require(
            receiveTime > 0 && block.timestamp <= receiveTime + REDEMPTION_WINDOW,
            "ProtocolTreasury: Redemption window expired"
        );

        uint256 timeSinceWin = block.timestamp - receiveTime;
        emit RedemptionWindowEnforced(collection, tokenId, msg.sender, timeSinceWin);

        require(_asset.balanceOf(address(this)) >= payout, "ProtocolTreasury: insufficient liquidity");

        IERC721(collection).safeTransferFrom(msg.sender, address(_treasury), tokenId);
        _treasury.handleRedemptionReturn(collection, tokenId, msg.sender, appraisalUSD);

        _asset.safeTransfer(recipient, payout);

        emit RedemptionExecuted(msg.sender, collection, tokenId, payout);
        return payout;
    }

    /// @inheritdoc IProtocolTreasury
    function transferOut(address to, uint256 amount) external override onlyOwner whenNotPaused {
        require(to != address(0), "ProtocolTreasury: bad recipient");
        require(amount > 0, "ProtocolTreasury: amount is zero");
        _asset.safeTransfer(to, amount);
        emit ProtocolTransfer(to, amount);
    }

    /**
     * @notice Sets a new economy manager
     */
    function setEconomyManager(address newManager) external onlyOwner {
        require(newManager != address(0), "ProtocolTreasury: manager is zero");
        address previous = economyManager;
        economyManager = newManager;
        emit EconomyManagerUpdated(previous, newManager);
    }

    /**
     * @notice Updates the gacha treasury reference
     */
    function setGachaTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "ProtocolTreasury: treasury is zero");
        address previous = address(_treasury);
        _treasury = GachaTreasury(newTreasury);
        emit GachaTreasuryUpdated(previous, newTreasury);
    }

    /**
     * @notice Updates the appraisal oracle
     */
    function setAppraisalOracle(address newOracle) external onlyOwner {
        require(newOracle != address(0), "ProtocolTreasury: oracle is zero");
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
        uint256 receiveTime = _treasury.getNFTReceiveTime(collection, tokenId);
        if (receiveTime == 0) {
            return 0; // NFT not received from gacha
        }

        uint256 expiryTime = receiveTime + REDEMPTION_WINDOW;
        if (block.timestamp >= expiryTime) {
            return 0; // Window expired
        }

        return expiryTime - block.timestamp;
    }

    /**
     * @notice Checks if an NFT is still within redemption window
     * @param collection NFT collection address
     * @param tokenId NFT identifier
     * @return isEligible True if NFT can still be redeemed
     */
    function isRedemptionEligible(address collection, uint256 tokenId) external view returns (bool isEligible) {
        uint256 receiveTime = _treasury.getNFTReceiveTime(collection, tokenId);
        return receiveTime > 0 && block.timestamp <= receiveTime + REDEMPTION_WINDOW;
    }

    /**
     * @notice Authorizes UUPS upgrades
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    uint256[44] private __gap;
}
