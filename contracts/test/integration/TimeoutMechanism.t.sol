// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Test} from "forge-std/Test.sol";
import {Gacha} from "../../src/gacha/Gacha.sol";
import {GachaTreasury} from "../../src/gacha/GachaTreasury.sol";
import {GachaEconomyManager} from "../../src/economy/GachaEconomyManager.sol";
import {MockERC20} from "../mocks/MockERC20.sol";
import {MockERC721} from "../mocks/MockERC721.sol";
import {MockNFTAppraisal} from "../mocks/MockNFTAppraisal.sol";
import {MockCardGroupedVault} from "../mocks/MockCardGroupedVault.sol";
import {MockProtocolTreasury} from "../mocks/MockProtocolTreasury.sol";

contract TimeoutMechanism is Test {
    Gacha internal gacha;
    GachaTreasury internal treasury;
    GachaEconomyManager internal economyManager;
    MockNFTAppraisal internal appraisal;
    MockERC20 internal feeToken;
    MockERC721 internal nftCollection;
    MockCardGroupedVault internal cardGroupedVault;
    MockProtocolTreasury internal protocolTreasury;

    address internal owner = address(0x1);
    address internal user = address(0x2);
    address internal serviceHandler = address(0x3);

    uint256 internal constant SPIN_FEE = 100 * 1e6; // 100 USDC (6 decimals)
    uint256 internal spinTimeout;

    function setUp() public {
        // Setup contracts
        feeToken = new MockERC20("USDC", "USDC", 6);
        nftCollection = new MockERC721("Test NFT", "TNFT");
        appraisal = new MockNFTAppraisal();
        cardGroupedVault = new MockCardGroupedVault(address(feeToken));
        vm.startPrank(owner);
        protocolTreasury = new MockProtocolTreasury();
        vm.stopPrank();

        // Deploy contracts
        treasury = new GachaTreasury();
        economyManager = new GachaEconomyManager();
        gacha = new Gacha();

        // Initialize contracts
        vm.startPrank(owner);

        // Initialize treasury with minimal price ranges (in USD 18 decimals)
        uint256 PRICE_STEP = 1e16;
        uint256[] memory minPrices = new uint256[](5);
        minPrices[0] = 0;
        minPrices[1] = uint256(15 * 1e18) + PRICE_STEP;
        minPrices[2] = uint256(60 * 1e18) + PRICE_STEP;
        minPrices[3] = uint256(250 * 1e18) + PRICE_STEP;
        minPrices[4] = uint256(1_200 * 1e18) + PRICE_STEP;

        uint256[] memory maxPrices = new uint256[](5);
        maxPrices[0] = uint256(15 * 1e18);
        maxPrices[1] = 60 * 1e18;
        maxPrices[2] = 250 * 1e18;
        maxPrices[3] = 1_200 * 1e18;
        maxPrices[4] = type(uint256).max;

        string[] memory rarityNames = new string[](5);
        rarityNames[0] = "Common";
        rarityNames[1] = "Uncommon";
        rarityNames[2] = "Rare";
        rarityNames[3] = "Epic";
        rarityNames[4] = "Legendary";

        treasury.initialize(
            owner,
            address(gacha),
            address(appraisal),
            uint8(5),
            rarityNames,
            minPrices,
            maxPrices
        );

        // Set the asset for mock protocol treasury (must be done by owner)
        protocolTreasury.setAsset(feeToken);

        // Initialize economy manager
        economyManager.initialize(
            owner,
            address(feeToken),
            address(gacha),
            address(cardGroupedVault),
            address(protocolTreasury),
            uint8(5)
        );

        // Initialize gacha
        gacha.initialize(
            owner,
            serviceHandler,
            address(feeToken),
            SPIN_FEE,
            address(treasury),
            address(economyManager)
        );

        vm.stopPrank();
        spinTimeout = gacha.spinTimeout();

        // Mint and approve tokens
        feeToken.mint(user, 1000 * SPIN_FEE);
        vm.startPrank(user);
        feeToken.approve(address(gacha), 1000 * SPIN_FEE);
        vm.stopPrank();

        // Mock some NFTs in treasury
        _mockTreasuryWithNFTs();
    }

    function test_timeoutMechanism_fulfillmentWorksAfterTimeout() public {
        // User starts a spin
        vm.startPrank(user);
        uint256 triggerId = gacha.spin(type(uint256).max);
        vm.stopPrank();

        // Verify spin request details
        (address requester, bool fulfilled, bool reclaimed, uint256 feePaid, uint256 requestTime) = gacha.getSpinRequest(triggerId);
        assertEq(requester, user, "Requester should be user");
        assertEq(fulfilled, false, "Should not be fulfilled");
        assertEq(reclaimed, false, "Should not be reclaimed");
        assertEq(feePaid, SPIN_FEE, "Fee should match");
        assertEq(requestTime, block.timestamp, "Request time should be current timestamp");

        // Fast forward past timeout
        vm.warp(block.timestamp + spinTimeout + 1);

        // Fulfillment should still work after timeout (only fulfilled status blocks)
        vm.startPrank(serviceHandler);
        gacha.fulfillRandomness(triggerId, bytes32(abi.encodePacked(uint256(123))));
        vm.stopPrank();

        // Verify spin is marked as fulfilled
        (, bool fulfilledAfter, bool reclaimedAfter,, ) = gacha.getSpinRequest(triggerId);
        assertTrue(fulfilledAfter, "Spin should be marked as fulfilled");
        assertFalse(reclaimedAfter, "Should not be marked as reclaimed");
    }

    function test_timeoutMechanism_allowsReclaimAfterTimeout() public {
        // User starts a spin
        vm.startPrank(user);
        uint256 triggerId = gacha.spin(type(uint256).max);
        uint256 balanceBefore = feeToken.balanceOf(user);
        vm.stopPrank();

        // Try to reclaim before timeout should fail
        vm.startPrank(user);
        vm.expectRevert(abi.encodeWithSelector(Gacha.SpinRequestNotExpired.selector));
        gacha.reclaimFailedSpin(triggerId);
        vm.stopPrank();

        // Fast forward past timeout
        vm.warp(block.timestamp + spinTimeout + 1);

        // Reclaim should succeed after timeout
        vm.startPrank(user);
        gacha.reclaimFailedSpin(triggerId);
        vm.stopPrank();

        // Verify user got refund
        uint256 balanceAfter = feeToken.balanceOf(user);
        assertEq(balanceAfter - balanceBefore, SPIN_FEE, "User should receive refund");

        // Verify spin is marked as fulfilled and reclaimed
        (, bool fulfilled, bool reclaimed,, ) = gacha.getSpinRequest(triggerId);
        assertTrue(fulfilled, "Spin should be marked as fulfilled");
        assertTrue(reclaimed, "Spin should be marked as reclaimed");

        // Fulfillment should fail after reclaim with better error message
        vm.startPrank(serviceHandler);
        vm.expectRevert(abi.encodeWithSelector(Gacha.SpinAlreadyReclaimed.selector));
        gacha.fulfillRandomness(triggerId, bytes32(abi.encodePacked(uint256(123))));
        vm.stopPrank();
    }

    function test_timeoutMechanism_fulfillmentWorksBeforeTimeout() public {
        // User starts a spin
        vm.startPrank(user);
        uint256 triggerId = gacha.spin(type(uint256).max);
        vm.stopPrank();

        // Fulfillment should work before timeout
        vm.startPrank(serviceHandler);
        gacha.fulfillRandomness(triggerId, bytes32(abi.encodePacked(uint256(123))));
        vm.stopPrank();

        // Verify spin is marked as fulfilled but not reclaimed
        (, bool fulfilled, bool reclaimed,, ) = gacha.getSpinRequest(triggerId);
        assertTrue(fulfilled, "Spin should be marked as fulfilled");
        assertFalse(reclaimed, "Should not be marked as reclaimed");

        // Reclaim should fail after fulfillment
        vm.startPrank(user);
        vm.expectRevert(abi.encodeWithSelector(Gacha.CannotReclaimFulfilledSpin.selector));
        gacha.reclaimFailedSpin(triggerId);
        vm.stopPrank();
    }

    function test_timeoutMechanism_multipleSpinsIndependent() public {
        // Capture balance before any spins
        uint256 balanceBefore = feeToken.balanceOf(user);

        // User starts multiple spins
        vm.startPrank(user);
        uint256 triggerId1 = gacha.spin(type(uint256).max);
        vm.stopPrank();

        // Fast forward partially (not past timeout)
        vm.warp(block.timestamp + spinTimeout / 2);

        // Start second spin
        vm.startPrank(user);
        uint256 triggerId2 = gacha.spin(type(uint256).max);
        vm.stopPrank();

        // Fast forward past timeout for first spin but not second
        vm.warp(block.timestamp + spinTimeout / 2 + 1);

        // First spin should be reclaimable, second should not
        vm.startPrank(user);
        gacha.reclaimFailedSpin(triggerId1); // Should succeed

        vm.expectRevert(abi.encodeWithSelector(Gacha.SpinRequestNotExpired.selector));
        gacha.reclaimFailedSpin(triggerId2); // Should fail
        vm.stopPrank();

        // Fast forward past timeout for second spin
        vm.warp(block.timestamp + spinTimeout / 2 + 1);

        // Second spin should now be reclaimable
        vm.startPrank(user);
        gacha.reclaimFailedSpin(triggerId2);
        vm.stopPrank();

        // Verify user got both refunds (should be back to original balance)
        uint256 balanceAfter = feeToken.balanceOf(user);
        assertEq(balanceAfter, balanceBefore, "User should receive both refunds and return to original balance");
    }

    function test_timeoutMechanism_betterErrorMessages() public {
        // User starts a spin
        vm.startPrank(user);
        uint256 triggerId = gacha.spin(type(uint256).max);
        vm.stopPrank();

        // Fast forward past timeout and reclaim
        vm.warp(block.timestamp + spinTimeout + 1);

        vm.startPrank(user);
        gacha.reclaimFailedSpin(triggerId);
        vm.stopPrank();

        // Fulfillment should fail with specific "already reclaimed" error
        vm.startPrank(serviceHandler);
        vm.expectRevert(abi.encodeWithSelector(Gacha.SpinAlreadyReclaimed.selector));
        gacha.fulfillRandomness(triggerId, bytes32(abi.encodePacked(uint256(123))));
        vm.stopPrank();

        // Start another spin and fulfill it first
        vm.startPrank(user);
        uint256 triggerId2 = gacha.spin(type(uint256).max);
        vm.stopPrank();

        vm.startPrank(serviceHandler);
        gacha.fulfillRandomness(triggerId2, bytes32(abi.encodePacked(uint256(123))));
        vm.stopPrank();

        // Now reclaim should fail with "already fulfilled" error
        vm.startPrank(user);
        vm.expectRevert(abi.encodeWithSelector(Gacha.CannotReclaimFulfilledSpin.selector));
        gacha.reclaimFailedSpin(triggerId2);
        vm.stopPrank();
    }

    function test_timeoutMechanism_noFeesHeldInContract() public {
        // User starts a spin
        vm.startPrank(user);
        uint256 triggerId = gacha.spin(type(uint256).max);
        vm.stopPrank();

        // Contract should only hold the spin fee, no escrow tracking
        assertEq(feeToken.balanceOf(address(gacha)), SPIN_FEE, "Contract should hold only spin fee");

        // Fast forward past timeout and reclaim
        vm.warp(block.timestamp + spinTimeout + 1);

        vm.startPrank(user);
        gacha.reclaimFailedSpin(triggerId);
        vm.stopPrank();

        // Contract should have zero balance after reclaim
        assertEq(feeToken.balanceOf(address(gacha)), 0, "Contract should have zero balance after reclaim");
    }

    function _mockTreasuryWithNFTs() internal {
        // Add NFTs to treasury for successful fulfillment testing

        vm.startPrank(owner);

        // Whitelist the collection
        treasury.addToWhitelist(address(nftCollection));
        vm.stopPrank();

        // Deposit NFTs
        vm.startPrank(address(this));
        for (uint i = 1; i <= 5; i++) {
            uint256 tokenId = i;
            nftCollection.mint(address(this), tokenId);

            // Set mock appraisal price for Common rarity ($50)
            vm.startPrank(owner);
            appraisal.setMockAppraisal(address(nftCollection), tokenId, 50 * 1e6);
            vm.stopPrank();

            // Deposit NFT
            nftCollection.approve(address(treasury), tokenId);
            treasury.depositNFT(address(nftCollection), tokenId);
        }
        vm.stopPrank();

        // Set weights to 100% Common for simplicity
        vm.startPrank(owner);
        uint256[] memory targetWeights = new uint256[](5);
        targetWeights[0] = 10_000;
        targetWeights[1] = 0;
        targetWeights[2] = 0;
        targetWeights[3] = 0;
        targetWeights[4] = 0;
        gacha.setDynamicWeightsConfig(targetWeights); // 100% Common, others 0
        vm.stopPrank();
    }
}
