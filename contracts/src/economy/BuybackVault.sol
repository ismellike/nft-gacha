// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import {ReentrancyGuardTransient} from "@openzeppelin/contracts/utils/ReentrancyGuardTransient.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";
import {IBuybackVault} from "../interfaces/IBuybackVault.sol";
import {IDepositorVault} from "../interfaces/IDepositorVault.sol";
import {GachaTreasury} from "../gacha/GachaTreasury.sol";
import {NFTAppraisal} from "../appraisal/NFTAppraisal.sol";

/**
 * @title BuybackVault
 * @notice Holds USDC liquidity that allows spinners to redeem NFTs for 90% of appraisal.
 * @dev Excess liquidity can be staked into the DepositorVault (capped to avoid recursion).
 */
contract BuybackVault is
    IBuybackVault,
    Initializable,
    OwnableUpgradeable,
    PausableUpgradeable,
    ReentrancyGuardTransient,
    UUPSUpgradeable
{
    using SafeERC20 for IERC20;

    /// @notice Payout percentage (in basis points) for NFT redemptions (90%)
    uint256 public constant BUYBACK_PAYOUT_BPS = 9_000;
    /// @notice Precision for appraisal conversion (1e12 converts 18-decimal USD to 6-decimal USDC)
    uint256 private constant USD_TO_USDC_CONVERSION = 1e12;

    /// @notice USDC token managed by the buyback vault
    IERC20 private _asset;
    /// @notice Treasury reference used for re-stocking NFTs
    GachaTreasury private _treasury;
    /// @notice Depositor vault that receives staked liquidity
    IDepositorVault public depositorVault;
    /// @notice Appraisal oracle used for pricing NFTs
    NFTAppraisal public appraisalOracle;
    /// @notice Economy manager authorized to forward revenue
    address public economyManager;

    /// @inheritdoc IBuybackVault
    uint256 public override maxStakeBps;
    /// @notice Total principal currently staked into the depositor vault (USDC)
    uint256 public stakedPrincipal;

    /// @notice Events
    event DepositorVaultUpdated(address indexed previousVault, address indexed newVault);
    event AppraisalOracleUpdated(address indexed previousOracle, address indexed newOracle);
    event EconomyManagerUpdated(address indexed previousManager, address indexed newManager);
    event MaxStakeBpsUpdated(uint256 previousBps, uint256 newBps);

    modifier onlyEconomyManager() {
        require(msg.sender == economyManager, "BuybackVault: caller not manager");
        _;
    }

    /**
     * @notice Initializes the buyback vault.
     * @param owner Owner to manage admin-only flows
     * @param asset_ USDC token address
     * @param treasury_ Gacha treasury reference
     * @param depositorVault_ Depositor vault reference
     * @param appraisalOracle_ Oracle providing USD appraisals
     * @param economyManager_ Economy manager that routes revenue
     */
    function initialize(
        address owner,
        address asset_,
        address treasury_,
        address depositorVault_,
        address appraisalOracle_,
        address economyManager_
    ) external initializer {
        require(owner != address(0), "BuybackVault: owner is zero");
        require(asset_ != address(0), "BuybackVault: asset is zero");
        require(treasury_ != address(0), "BuybackVault: treasury is zero");
        require(depositorVault_ != address(0), "BuybackVault: depositor vault is zero");
        require(appraisalOracle_ != address(0), "BuybackVault: oracle is zero");
        require(economyManager_ != address(0), "BuybackVault: manager is zero");

        __Ownable_init(owner);
        __Pausable_init();
        // ReentrancyGuardTransient doesn't need initialization

        _asset = IERC20(asset_);
        _treasury = GachaTreasury(treasury_);
        depositorVault = IDepositorVault(depositorVault_);
        appraisalOracle = NFTAppraisal(appraisalOracle_);
        economyManager = economyManager_;

        maxStakeBps = 6_000; // 60% cap by default

        _transferOwnership(owner);
    }

    /// @inheritdoc IBuybackVault
    function onRevenueReceived(uint256 amount) external override onlyEconomyManager whenNotPaused {
        require(amount > 0, "BuybackVault: amount is zero");
        _asset.safeTransferFrom(msg.sender, address(this), amount);
        emit BuybackRevenueReceived(amount);
    }

    /// @inheritdoc IBuybackVault
    function executeBuyback(address collection, uint256 tokenId, address recipient)
        external
        override
        whenNotPaused
        nonReentrant
        returns (uint256 payout)
    {
        require(recipient != address(0), "BuybackVault: bad recipient");
        require(collection != address(0), "BuybackVault: bad collection");

        (uint256 appraisalUSD, NFTAppraisal.AppraisalStatus status) =
            appraisalOracle.getAppraisedPrice(collection, tokenId);
        require(
            appraisalUSD > 0
                && (
                    status == NFTAppraisal.AppraisalStatus.Completed || status == NFTAppraisal.AppraisalStatus.OwnerOverride
                ),
            "BuybackVault: appraisal missing"
        );

        uint256 payoutUSD = Math.mulDiv(appraisalUSD, BUYBACK_PAYOUT_BPS, 10_000);
        payout = payoutUSD / USD_TO_USDC_CONVERSION;
        require(payout > 0, "BuybackVault: payout underflows");

        uint256 liquidAssets = _asset.balanceOf(address(this));
        require(liquidAssets >= payout, "BuybackVault: insufficient liquidity");

        // Transfer NFT from spinner to treasury for restocking
        IERC721(collection).safeTransferFrom(msg.sender, address(_treasury), tokenId);
        _treasury.handleBuybackReturn(collection, tokenId, msg.sender, appraisalUSD);

        _asset.safeTransfer(recipient, payout);

        emit BuybackExecuted(msg.sender, collection, tokenId, payout);
        return payout;
    }

    /// @inheritdoc IBuybackVault
    function stakeSurplus(uint256 amount) external override onlyOwner whenNotPaused nonReentrant {
        require(amount > 0, "BuybackVault: zero stake");
        uint256 balance = _asset.balanceOf(address(this));
        require(balance >= amount, "BuybackVault: insufficient balance");

        uint256 totalAssets = balance + stakedPrincipal;
        require(totalAssets > 0, "BuybackVault: nothing to stake");

        uint256 newStaked = stakedPrincipal + amount;
        uint256 maxStakeAmount = (totalAssets * maxStakeBps) / 10_000;
        require(newStaked <= maxStakeAmount, "BuybackVault: exceeds stake cap");

        stakedPrincipal = newStaked;
        _asset.safeIncreaseAllowance(address(depositorVault), amount);
        depositorVault.stakeBuybackLiquidity(amount);

        emit BuybackLiquidityStaked(amount);
    }

    /// @inheritdoc IBuybackVault
    function unstakeSurplus(uint256 amount) external override onlyOwner whenNotPaused nonReentrant {
        require(amount > 0, "BuybackVault: zero unstake");
        require(stakedPrincipal >= amount, "BuybackVault: exceeds staked");

        stakedPrincipal -= amount;
        depositorVault.unstakeBuybackLiquidity(amount, address(this));

        emit BuybackLiquidityUnstaked(amount);
    }

    /// @inheritdoc IBuybackVault
    function availableLiquidity() external view override returns (uint256) {
        return _asset.balanceOf(address(this));
    }

    /**
     * @notice Returns the total managed assets (liquid + staked principal)
     */
    function totalManagedLiquidity() external view returns (uint256) {
        return _asset.balanceOf(address(this)) + stakedPrincipal;
    }

    /**
     * @notice Updates the linked depositor vault
     */
    function setDepositorVault(address newDepositorVault) external onlyOwner {
        require(newDepositorVault != address(0), "BuybackVault: vault is zero");
        address previous = address(depositorVault);
        depositorVault = IDepositorVault(newDepositorVault);
        emit DepositorVaultUpdated(previous, newDepositorVault);
    }

    /**
     * @notice Updates the appraisal oracle
     */
    function setAppraisalOracle(address newOracle) external onlyOwner {
        require(newOracle != address(0), "BuybackVault: oracle is zero");
        address previous = address(appraisalOracle);
        appraisalOracle = NFTAppraisal(newOracle);
        emit AppraisalOracleUpdated(previous, newOracle);
    }

    /**
     * @notice Updates the economy manager allowed to forward revenue
     */
    function setEconomyManager(address newManager) external onlyOwner {
        require(newManager != address(0), "BuybackVault: manager is zero");
        address previous = economyManager;
        economyManager = newManager;
        emit EconomyManagerUpdated(previous, newManager);
    }

    /**
     * @notice Updates the maximum stake share allowed
     */
    function setMaxStakeBps(uint256 newMaxStakeBps) external onlyOwner {
        require(newMaxStakeBps <= 10_000, "BuybackVault: invalid bps");
        uint256 previous = maxStakeBps;
        maxStakeBps = newMaxStakeBps;
        emit MaxStakeBpsUpdated(previous, newMaxStakeBps);
    }

    /**
     * @notice Pause buyback and staking operations
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Resume operations
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /// @inheritdoc IBuybackVault
    function asset() external view override returns (IERC20) {
        return _asset;
    }

    /// @inheritdoc IBuybackVault
    function treasury() external view override returns (GachaTreasury) {
        return _treasury;
    }

    /**
     * @notice Authorizes UUPS upgrades
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    uint256[40] private __gap;
}
