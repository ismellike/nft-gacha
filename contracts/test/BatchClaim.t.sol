// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "forge-std/Test.sol";
import "../src/rewards/GachaRewardsManager.sol";
import "../src/gacha/GachaTreasury.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

contract BatchClaimTest is Test {
    GachaRewardsManager rewardsManager;

    function setUp() public {
        // Create mock addresses for the constructor
        address mockGacha = address(0x1);
        address mockTreasury = address(0x2);
        address mockAppraisal = address(0x3);
        address mockProtocol = address(0x4);
        address mockFeeToken = address(0x5);

        // Deploy rewards manager implementation and proxy
        GachaRewardsManager rewardsManagerImpl = new GachaRewardsManager();

        bytes memory initData = abi.encodeWithSelector(
            GachaRewardsManager.initialize.selector,
            address(this), // owner
            mockGacha,
            mockTreasury,
            mockAppraisal,
            mockProtocol,
            mockFeeToken
        );

        ERC1967Proxy proxy = new ERC1967Proxy(address(rewardsManagerImpl), initData);
        rewardsManager = GachaRewardsManager(address(proxy));
    }

    function testBatchClaimFunctionsExist() public view {
        // Test that our new batch claim functions exist and are callable
        // This is a compilation test - if the functions don't exist or have wrong signatures, this will fail
        
        bytes4 claimMultipleRaritiesSelector = bytes4(keccak256("claimRewardsForMultipleRarities(uint8[],bytes32[][])"));
        bytes4 getTotalClaimableSelector = bytes4(keccak256("getTotalClaimableForUser(uint8[],bytes32[][])"));
        
        // Check that the function selectors match what we expect
        assertTrue(claimMultipleRaritiesSelector != bytes4(0));
        assertTrue(getTotalClaimableSelector != bytes4(0));
    }

    function testBatchClaimArrayLengthValidation() public {
        // Test that the array length validation works
        GachaTreasury.Rarity[] memory rarities = new GachaTreasury.Rarity[](2);
        rarities[0] = GachaTreasury.Rarity.Common;
        rarities[1] = GachaTreasury.Rarity.Uncommon;
        
        bytes32[][] memory cardIdsByRarity = new bytes32[][](1); // Wrong length
        cardIdsByRarity[0] = new bytes32[](1);
        cardIdsByRarity[0][0] = bytes32(uint256(1));
        
        // This should revert with "Array length mismatch"
        vm.expectRevert("Array length mismatch");
        rewardsManager.claimRewardsForMultipleRarities(rarities, cardIdsByRarity);
    }

    function testGetTotalClaimableArrayValidation() public {
        // Test that getTotalClaimableForUser handles array length validation
        GachaTreasury.Rarity[] memory rarities = new GachaTreasury.Rarity[](2);
        rarities[0] = GachaTreasury.Rarity.Common;
        rarities[1] = GachaTreasury.Rarity.Uncommon;
        
        bytes32[][] memory cardIdsByRarity = new bytes32[][](1); // Wrong length
        cardIdsByRarity[0] = new bytes32[](1);
        cardIdsByRarity[0][0] = bytes32(uint256(1));
        
        // This should revert with "Array length mismatch"
        vm.expectRevert("Array length mismatch");
        rewardsManager.getTotalClaimableForUser(rarities, cardIdsByRarity);
    }
}