// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IProtocolTreasury} from "../interfaces/IProtocolTreasury.sol";

/**
 * @title ProtocolTreasury
 * @notice Collects the protocol's 5% revenue share and provides DAO-controlled outflows.
 */
contract ProtocolTreasury is
    IProtocolTreasury,
    Initializable,
    OwnableUpgradeable,
    PausableUpgradeable,
    UUPSUpgradeable
{
    using SafeERC20 for IERC20;

    IERC20 private _asset;
    address public economyManager;

    event EconomyManagerUpdated(address indexed previousManager, address indexed newManager);

    modifier onlyEconomyManager() {
        require(msg.sender == economyManager, "ProtocolTreasury: caller not manager");
        _;
    }

    /**
     * @notice Initialize the protocol treasury
     * @param owner Owner address (DAO or multisig)
     * @param asset_ USDC token address
     * @param economyManager_ Economy manager allowed to forward revenue
     */
    function initialize(address owner, address asset_, address economyManager_) external initializer {
        require(owner != address(0), "ProtocolTreasury: owner is zero");
        require(asset_ != address(0), "ProtocolTreasury: asset is zero");
        require(economyManager_ != address(0), "ProtocolTreasury: manager is zero");

        __Ownable_init();
        __Pausable_init();
        __UUPSUpgradeable_init();

        _asset = IERC20(asset_);
        economyManager = economyManager_;

        _transferOwnership(owner);
    }

    /// @inheritdoc IProtocolTreasury
    function asset() external view override returns (IERC20) {
        return _asset;
    }

    /// @inheritdoc IProtocolTreasury
    function onRevenueReceived(uint256 amount) external override onlyEconomyManager whenNotPaused {
        require(amount > 0, "ProtocolTreasury: amount is zero");
        _asset.safeTransferFrom(msg.sender, address(this), amount);
        emit ProtocolRevenueReceived(amount);
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
     * @notice Authorizes UUPS upgrades
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    uint256[48] private __gap;
}
