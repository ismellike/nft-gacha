// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Script, console} from "forge-std/Script.sol";
import {TestToken} from "../src/TestToken.sol";

contract MintTestTokens is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        // Get the TestToken address from environment
        address testTokenAddress = vm.envAddress("TEST_TOKEN_ADDRESS");
        TestToken testToken = TestToken(testTokenAddress);
        
        // Target address to mint tokens to
        address targetAddress = vm.envAddress("USER_ADDRESS");
        
        console.log("Minting test tokens...");
        console.log("TestToken address:", testTokenAddress);
        console.log("Target address:", targetAddress);
        console.log("Deployer address:", deployer);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Mint 100,000 TEST tokens to the target address
        uint256 mintAmount = 100000 * 10 ** testToken.decimals();
        testToken.mint(targetAddress, mintAmount);
        
        vm.stopBroadcast();
        
        console.log("Successfully minted", mintAmount / 10 ** testToken.decimals(), "TEST tokens to", targetAddress);
        console.log("Token balance:", testToken.balanceOf(targetAddress) / 10 ** testToken.decimals());
    }
}