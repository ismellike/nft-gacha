// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title IProtocolTreasury
 * @notice Interface for DAO-controlled protocol treasury handling spin fees
 */
interface IProtocolTreasury {
    /**
     * @notice Emitted when protocol revenue is received
     * @param amount Amount of USDC credited
     */
    event ProtocolRevenueReceived(uint256 amount);

    /**
     * @notice Emitted when funds are moved out by governance
     * @param to Receiver of funds
     * @param amount Amount transferred
     */
    event ProtocolTransfer(address indexed to, uint256 amount);

    /**
     * @notice Emitted when a redemption is fulfilled
     * @param seller Address that returned the NFT
     * @param collection NFT contract address
     * @param tokenId NFT identifier
     * @param payout Amount of USDC paid out
     */
    event RedemptionExecuted(
        address indexed seller, address indexed collection, uint256 indexed tokenId, uint256 payout
    );

    function asset() external view returns (IERC20);

    /**
     * @notice Called by the economy manager to route the protocol's revenue share
     * @param amount Amount of USDC transferred in
     */
    function onRevenueReceived(uint256 amount) external;

    /**
     * @notice Governance-controlled transfer of USDC funds
     * @param to Destination address
     * @param amount Amount of USDC to send
     */
    function transferOut(address to, uint256 amount) external;

    /**
     * @notice Allows players to redeem NFTs back to the protocol
     * @param collection NFT collection address
     * @param tokenId NFT identifier
     * @return payout Amount of USDC paid to the caller
     */
    function executeRedemption(address collection, uint256 tokenId)
        external
        returns (uint256 payout);
}
