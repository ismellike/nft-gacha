// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {Ownable} from "solady/auth/Ownable.sol";

/// @title BaseERC20
/// @notice Minimal owner-mintable ERC20 for local deploys and tests
contract BaseERC20 is ERC20, ERC20Permit, Ownable {
    constructor(string memory name_, string memory symbol_, address initialOwner)
        ERC20(name_, symbol_)
        ERC20Permit(name_)
    {
        require(initialOwner != address(0), "Owner cannot be zero address");
        _initializeOwner(initialOwner);
    }

    function _guardInitializeOwner() internal pure override returns (bool) {
        return true;
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
