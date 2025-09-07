// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

/**
 * @title ERC20BatchQuery - Batch queries for ERC20 token information
 * @notice Utility contract to get multiple ERC20 token properties in a single call
 * @dev Reduces RPC calls and improves UX by batching common token queries
 */
contract ERC20BatchQuery {
    /// @notice Gets comprehensive ERC20 token info in a single call (BATCH FUNCTION)
    /// @param tokenAddress ERC20 token contract address
    /// @param userAddress User address to check balance for (optional, use address(0) to skip)
    /// @return name Token name
    /// @return symbol Token symbol  
    /// @return decimals Token decimals
    /// @return totalSupply Total token supply
    /// @return userBalance User's token balance (0 if userAddress is address(0))
    function getTokenInfoBatch(address tokenAddress, address userAddress) external view returns (
        string memory name,
        string memory symbol,
        uint8 decimals,
        uint256 totalSupply,
        uint256 userBalance
    ) {
        IERC20Metadata token = IERC20Metadata(tokenAddress);
        
        name = token.name();
        symbol = token.symbol();
        decimals = token.decimals();
        totalSupply = token.totalSupply();
        
        if (userAddress != address(0)) {
            userBalance = token.balanceOf(userAddress);
        } else {
            userBalance = 0;
        }
    }

    /// @notice Gets token balance and allowance for a user in a single call (BATCH FUNCTION)
    /// @param tokenAddress ERC20 token contract address
    /// @param userAddress User address to check
    /// @param spenderAddress Spender address for allowance check
    /// @return balance User's token balance
    /// @return allowance User's allowance for the spender
    function getBalanceAndAllowanceBatch(address tokenAddress, address userAddress, address spenderAddress) 
        external view returns (uint256 balance, uint256 allowance) {
        IERC20 token = IERC20(tokenAddress);
        
        balance = token.balanceOf(userAddress);
        allowance = token.allowance(userAddress, spenderAddress);
    }

    /// @notice Gets multiple users' balances for a token in a single call (BATCH FUNCTION)
    /// @param tokenAddress ERC20 token contract address
    /// @param userAddresses Array of user addresses to check
    /// @return balances Array of token balances corresponding to user addresses
    function getMultipleBalancesBatch(address tokenAddress, address[] calldata userAddresses)
        external view returns (uint256[] memory balances) {
        IERC20 token = IERC20(tokenAddress);
        balances = new uint256[](userAddresses.length);
        
        for (uint256 i = 0; i < userAddresses.length; i++) {
            balances[i] = token.balanceOf(userAddresses[i]);
        }
    }
}