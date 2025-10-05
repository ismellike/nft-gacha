// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Test} from "forge-std/Test.sol";
import {GachaRewardsManager} from "../src/rewards/GachaRewardsManager.sol";
import {Gacha} from "../src/gacha/Gacha.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

contract GachaRewardsManagerAuthTest is Test {
    GachaRewardsManager rewardsManager;
    Gacha gacha;

    address public owner = address(0x1);
    address public user = address(0x2);

    function setUp() public {
        vm.startPrank(owner);

        // Deploy implementations
        GachaRewardsManager rewardsImpl = new GachaRewardsManager();
        Gacha gachaImpl = new Gacha();

        // Deploy gacha proxy (rewards manager needs gacha address)
        bytes memory gachaInitData = abi.encodeWithSelector(
            Gacha.initialize.selector,
            owner,
            owner, // service handler
            address(0x1), // fee token placeholder
            1e18, // fee
            address(0x1), // treasury placeholder
            address(0x1)  // rewards manager placeholder
        );
        ERC1967Proxy gachaProxy = new ERC1967Proxy(address(gachaImpl), gachaInitData);
        gacha = Gacha(address(gachaProxy));

        // Deploy rewards manager proxy with temporary gacha address
        bytes memory rewardsInitData = abi.encodeWithSelector(
            GachaRewardsManager.initialize.selector,
            owner,
            address(0x999), // temporary gacha address
            address(0x888), // treasury placeholder
            address(0x777), // appraisal placeholder
            owner,
            address(0x1)   // fee token placeholder
        );
        ERC1967Proxy rewardsProxy = new ERC1967Proxy(address(rewardsImpl), rewardsInitData);
        rewardsManager = GachaRewardsManager(address(rewardsProxy));

        vm.stopPrank();
    }

    function testSetGachaContract() public {
        // Verify initial gacha contract is the temporary address
        assertEq(address(rewardsManager.gachaContract()), address(0x999));

        // Update to real gacha contract
        vm.startPrank(owner);
        rewardsManager.setGachaContract(address(gacha));
        vm.stopPrank();

        // Verify gacha contract was updated
        assertEq(address(rewardsManager.gachaContract()), address(gacha));
    }

    function testSetGachaContractUnauthorized() public {
        // Try to set gacha contract as non-owner
        vm.startPrank(user);
        vm.expectRevert();
        rewardsManager.setGachaContract(address(gacha));
        vm.stopPrank();
    }

    function testSetGachaContractZeroAddress() public {
        // Try to set gacha contract to zero address
        vm.startPrank(owner);
        vm.expectRevert();
        rewardsManager.setGachaContract(address(0));
        vm.stopPrank();
    }
}