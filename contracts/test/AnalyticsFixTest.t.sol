// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Test, console2} from "forge-std/Test.sol";
import {GachaTreasury} from "../src/gacha/GachaTreasury.sol";
import {DepositorVault} from "../src/economy/DepositorVault.sol";
import {MockERC20} from "./mocks/MockERC20.sol";

/**
 * @title Analytics Fix Test
 * @notice Test to verify that globalLifetimeClaimed analytics are properly updated
 * @author NFT Gacha Team
 */
contract AnalyticsFixTest is Test {
    GachaTreasury public treasury;
    DepositorVault public vault;
    MockERC20 public usdc;

    address public owner = makeAddr("owner");
    address public user = makeAddr("user");
    address public economyManager = makeAddr("economyManager");
    address public gachaContract = makeAddr("gachaContract");
    address public appraisalContract = makeAddr("appraisalContract");

    uint256 public constant CLAIM_AMOUNT = 1000 * 1e6; // 1000 USDC (6 decimals)
    uint256 public constant EXPECTED_ANALYTICS_VALUE = 1000 * 1e18; // Expected in 18 decimals

    function setUp() public {
        // Deploy mock USDC
        usdc = new MockERC20("USDC", "USDC", 6);

        // Deploy GachaTreasury
        vm.startPrank(owner);
        treasury = new GachaTreasury();

        // Deploy DepositorVault
        vault = new DepositorVault();

        // Initialize DepositorVault
        vault.initialize(owner, address(usdc), address(treasury), economyManager);

        // Initialize GachaTreasury with dummy values
        uint256[5] memory minPrices = [
            uint256(0),
            uint256(15e18) + 1,
            uint256(60e18) + 1,
            uint256(250e18) + 1,
            uint256(1200e18) + 1
        ];
        uint256[5] memory maxPrices = [uint256(15e18), 60e18, 250e18, 1200e18, type(uint256).max];
        treasury.initialize(owner, gachaContract, appraisalContract, minPrices, maxPrices);

        // Set DepositorVault in GachaTreasury
        treasury.setDepositorVault(address(vault));

        vm.stopPrank();
    }

    function testRecordYieldClaimUpdatesAnalytics() public {
        // Check initial state
        assertEq(treasury.globalLifetimeClaimed(), 0, "Global claimed should start at 0");
        assertEq(treasury.getUserLifetimeClaimed(user), 0, "User claimed should start at 0");

        // Simulate a yield claim by calling recordYieldClaim directly
        vm.startPrank(address(vault));
        treasury.recordYieldClaim(user, CLAIM_AMOUNT);
        vm.stopPrank();

        // Verify analytics are updated
        assertEq(treasury.globalLifetimeClaimed(), EXPECTED_ANALYTICS_VALUE, "Global claimed should be updated");
        assertEq(treasury.getUserLifetimeClaimed(user), EXPECTED_ANALYTICS_VALUE, "User claimed should be updated");
    }

    function testMultipleClaimsAccumulateCorrectly() public {
        uint256 claim1 = 500 * 1e6;
        uint256 claim2 = 750 * 1e6;
        uint256 expectedTotal = (claim1 + claim2) * 1e12; // Convert to 18 decimals

        // First claim
        vm.startPrank(address(vault));
        treasury.recordYieldClaim(user, claim1);
        vm.stopPrank();

        assertEq(treasury.globalLifetimeClaimed(), claim1 * 1e12, "Global claimed should reflect first claim");
        assertEq(treasury.getUserLifetimeClaimed(user), claim1 * 1e12, "User claimed should reflect first claim");

        // Second claim
        vm.startPrank(address(vault));
        treasury.recordYieldClaim(user, claim2);
        vm.stopPrank();

        assertEq(treasury.globalLifetimeClaimed(), expectedTotal, "Global claimed should accumulate");
        assertEq(treasury.getUserLifetimeClaimed(user), expectedTotal, "User claimed should accumulate");
    }

    function testUnauthorizedCallerCannotRecordClaim() public {
        vm.startPrank(user);
        vm.expectRevert();
        treasury.recordYieldClaim(user, CLAIM_AMOUNT);
        vm.stopPrank();
    }

    function testZeroClaimDoesNotUpdateAnalytics() public {
        vm.startPrank(address(vault));
        treasury.recordYieldClaim(user, 0);
        vm.stopPrank();

        assertEq(treasury.globalLifetimeClaimed(), 0, "Global claimed should remain 0");
        assertEq(treasury.getUserLifetimeClaimed(user), 0, "User claimed should remain 0");
    }
}
