// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {GachaTreasury} from "../gacha/GachaTreasury.sol";

/**
 * @title IBuybackVault
 * @notice Interface for the USDC buyback vault that honors NFT redemptions
 */
interface IBuybackVault {
    /**
     * @notice Emitted whenever the vault receives protocol revenue
     * @param amount Amount of USDC credited (6 decimals)
     */
    event BuybackRevenueReceived(uint256 amount);

    /**
     * @notice Emitted when a spinner sells an NFT back to the protocol
     * @param seller Address of the spinner
     * @param collection NFT collection address
     * @param tokenId Token identifier
     * @param payout Amount of USDC paid out
     */
    event BuybackExecuted(address indexed seller, address indexed collection, uint256 indexed tokenId, uint256 payout);

    /**
     * @notice Emitted when liquidity is staked into the depositor vault
     * @param amount Amount of USDC staked
     */
    event BuybackLiquidityStaked(uint256 amount);

    /**
     * @notice Emitted when liquidity is unstaked back from the depositor vault
     * @param amount Amount of USDC unstaked
     */
    event BuybackLiquidityUnstaked(uint256 amount);

    function asset() external view returns (IERC20);

    function treasury() external view returns (GachaTreasury);

    /**
     * @notice Called by the economy manager to credit buyback revenue
     * @param amount Amount of USDC (6 decimals) transferred from the manager
     */
    function onRevenueReceived(uint256 amount) external;

    /**
     * @notice Allows a spinner to sell an NFT back for 90% of appraisal
     * @param collection NFT collection address
     * @param tokenId NFT identifier
     * @param recipient Recipient receiving USDC payout
     * @return payout Amount paid in USDC
     */
    function executeBuyback(address collection, uint256 tokenId, address recipient) external returns (uint256 payout);

    /**
     * @notice Stakes surplus liquidity into the depositor vault (capped at 60%)
     * @param amount Amount to stake
     */
    function stakeSurplus(uint256 amount) external;

    /**
     * @notice Withdraws previously staked liquidity from the depositor vault
     * @param amount Amount to withdraw
     */
    function unstakeSurplus(uint256 amount) external;

    /**
     * @notice Returns readily available USDC not staked
     */
    function availableLiquidity() external view returns (uint256);

    /**
     * @notice Maximum share of balance that can be staked (in BPS, default 6000)
     */
    function maxStakeBps() external view returns (uint256);
}
