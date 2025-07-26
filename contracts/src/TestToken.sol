// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract TestToken is ERC20, ERC20Permit, Ownable {
    constructor(
        string memory name_,
        string memory symbol_,
        address owner_
    ) ERC20(name_, symbol_) ERC20Permit(name_) Ownable(owner_) {}

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    function mintToSelf(uint256 amount) external {
        _mint(msg.sender, amount);
    }

    // For development: anyone can mint tokens to themselves
    function faucet() external {
        _mint(msg.sender, 1000 * 10**decimals()); // Mint 1000 tokens
    }
}