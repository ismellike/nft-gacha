// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {StandardTest} from "../../helpers/StandardTest.sol";
import {GachaEconomyManager} from "../../../src/economy/GachaEconomyManager.sol";
import {CardGroupedVault} from "../../../src/economy/CardGroupedVault.sol";
import {ProtocolTreasury} from "../../../src/economy/ProtocolTreasury.sol";
import {GachaTreasury} from "../../../src/gacha/GachaTreasury.sol";
import {BaseERC20} from "../../../src/tokens/BaseERC20.sol";
import {MockNFTAppraisal} from "../../mocks/MockNFTAppraisal.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

/**
 * @title GachaEconomyManager Test Suite
 */
contract GachaEconomyManagerTest is StandardTest {
    GachaEconomyManager public economy;
    GachaEconomyManager public economyImpl;
    CardGroupedVault public vault;
    ProtocolTreasury public protTreasury;
    BaseERC20 public usdc;

    address public economyOwner;
    address public localGacha;

    uint256 public constant DEPOSITOR_SHARE_BPS = 9_500;
    uint256 public constant PROTOCOL_SHARE_BPS = 500;
    uint256 public constant REVENUE_AMOUNT = 1000e6;

    event RevenueSplitUpdated(uint256 indexed depositorShareBps, uint256 indexed protocolShareBps);
    event SpinRevenueReceived(uint256 indexed usdcAmount, uint256 indexed depositorShare, uint256 indexed protocolShare);

    function setUp() public {
        economyOwner = makeAddr("economyOwner");
        localGacha = makeAddr("gacha");

        vm.startPrank(economyOwner);

        usdc = new BaseERC20("USDC", "USDC", economyOwner);

        // Deploy vault
        CardGroupedVault vaultImpl = new CardGroupedVault();
        bytes memory vaultInit = abi.encodeWithSelector(
            CardGroupedVault.initialize.selector,
            economyOwner,
            address(usdc),
            address(this),
            address(this),
            uint8(5)
        );
        ERC1967Proxy vaultProxy = new ERC1967Proxy(address(vaultImpl), vaultInit);
        vault = CardGroupedVault(address(vaultProxy));

        // Deploy protocol treasury
        ProtocolTreasury treasuryImpl = new ProtocolTreasury();
        MockNFTAppraisal mockAppraisal = new MockNFTAppraisal();
        GachaTreasury mockGachaTreasury = GachaTreasury(address(0x1));

        bytes memory treasuryInit = abi.encodeWithSelector(
            ProtocolTreasury.initialize.selector,
            economyOwner,
            address(usdc),
            address(this),
            address(mockGachaTreasury),
            address(mockAppraisal)
        );
        ERC1967Proxy treasuryProxy = new ERC1967Proxy(address(treasuryImpl), treasuryInit);
        protTreasury = ProtocolTreasury(address(treasuryProxy));

        // Deploy economy manager
        economyImpl = new GachaEconomyManager();
        bytes memory economyInit = abi.encodeWithSelector(
            GachaEconomyManager.initialize.selector,
            economyOwner,
            address(usdc),
            localGacha,
            address(vault),
            address(protTreasury),
            uint8(5)
        );
        ERC1967Proxy economyProxy = new ERC1967Proxy(address(economyImpl), economyInit);
        economy = GachaEconomyManager(address(economyProxy));

        vault.setEconomyManager(address(economy));
        protTreasury.setEconomyManager(address(economy));

        usdc.mint(localGacha, REVENUE_AMOUNT * 100);

        vm.stopPrank();
    }

    function testDeployment() public view {
        assertEq(address(economy.feeToken()), address(usdc));
        assertEq(economy.gacha(), localGacha);
        assertEq(address(economy.cardGroupedVault()), address(vault));
        assertEq(address(economy.protocolTreasury()), address(protTreasury));
        assertEq(economy.depositorShareBps(), DEPOSITOR_SHARE_BPS);
        assertEq(economy.protocolShareBps(), PROTOCOL_SHARE_BPS);
    }

    function testOnSpinRevenueSplit() public {
        vm.startPrank(localGacha);

        usdc.approve(address(economy), REVENUE_AMOUNT);
        economy.onSpinRevenue(REVENUE_AMOUNT, 0);

        vm.stopPrank();

        // Since vault has no shares, yield is queued
        uint256 expectedDepositor = (REVENUE_AMOUNT * DEPOSITOR_SHARE_BPS) / 10_000;
        uint256 expectedProtocol = REVENUE_AMOUNT - expectedDepositor;

        assertEq(economy.totalQueuedYield(), expectedDepositor);
        assertEq(economy.totalToProtocol(), expectedProtocol);
        assertEq(economy.totalRevenueProcessed(), REVENUE_AMOUNT);
    }

    function testOnSpinRevenueFailsWithZeroAmount() public {
        vm.prank(localGacha);
        vm.expectRevert(GachaEconomyManager.ZeroRevenue.selector);
        economy.onSpinRevenue(0, 0);
    }

    function testOnSpinRevenueAuthorization() public {
        vm.prank(user);
        vm.expectRevert(GachaEconomyManager.CallerNotGacha.selector);
        economy.onSpinRevenue(REVENUE_AMOUNT, 0);
    }

    function testYieldQueuedWhenNoShares() public {
        vm.startPrank(localGacha);

        usdc.approve(address(economy), REVENUE_AMOUNT);
        economy.onSpinRevenue(REVENUE_AMOUNT, 0);

        vm.stopPrank();

        uint256 expectedQueue = (REVENUE_AMOUNT * DEPOSITOR_SHARE_BPS) / 10_000;
        assertEq(economy.totalQueuedYield(), expectedQueue);
    }

    function testSetRevenueSplit() public {
        vm.prank(economyOwner);
        economy.setRevenueSplit(9_000, 1_000);

        assertEq(economy.depositorShareBps(), 9_000);
        assertEq(economy.protocolShareBps(), 1_000);
    }

    function testSetRevenueSplitFailsWhenInvalid() public {
        vm.prank(economyOwner);
        vm.expectRevert(GachaEconomyManager.InvalidRevenueSplit.selector);
        economy.setRevenueSplit(10_001, 0);
    }

    function testSetRevenueSplitFailsWithZeroSum() public {
        vm.prank(economyOwner);
        vm.expectRevert(GachaEconomyManager.InvalidRevenueSplit.selector);
        economy.setRevenueSplit(0, 0);
    }

    function testSetFeeToken() public {
        vm.startPrank(economyOwner);

        BaseERC20 newToken = new BaseERC20("New", "NEW", economyOwner);
        economy.setFeeToken(address(newToken));

        assertEq(address(economy.feeToken()), address(newToken));

        vm.stopPrank();
    }

    function testSetGacha() public {
        vm.startPrank(economyOwner);

        address newGacha = makeAddr("newGacha");
        economy.setGacha(newGacha);

        assertEq(economy.gacha(), newGacha);

        vm.stopPrank();
    }

    function testPausePreventsRevenue() public {
        vm.prank(economyOwner);
        economy.pause();

        vm.prank(localGacha);
        vm.expectRevert();
        economy.onSpinRevenue(REVENUE_AMOUNT, 0);
    }

    function testUnpauseAllowsRevenue() public {
        vm.startPrank(economyOwner);

        economy.pause();
        economy.unpause();

        vm.stopPrank();

        vm.startPrank(localGacha);

        usdc.approve(address(economy), REVENUE_AMOUNT);
        economy.onSpinRevenue(REVENUE_AMOUNT, 0);

        vm.stopPrank();

        assertEq(economy.totalRevenueProcessed(), REVENUE_AMOUNT);
    }

    function testRevenueWithAllRarities() public {
        vm.startPrank(localGacha);

        usdc.approve(address(economy), REVENUE_AMOUNT * 5);

        economy.onSpinRevenue(REVENUE_AMOUNT, 0);
        economy.onSpinRevenue(REVENUE_AMOUNT, 1);
        economy.onSpinRevenue(REVENUE_AMOUNT, 2);
        economy.onSpinRevenue(REVENUE_AMOUNT, 3);
        economy.onSpinRevenue(REVENUE_AMOUNT, 4);

        vm.stopPrank();

        assertEq(economy.totalRevenueProcessed(), REVENUE_AMOUNT * 5);
        assertEq(economy.revenueByRarity(0), REVENUE_AMOUNT);
        assertEq(economy.revenueByRarity(4), REVENUE_AMOUNT);
    }

    function testRoundingFavorsProtocol() public {
        uint256 oddAmount = 1001e6;

        vm.startPrank(localGacha);

        usdc.approve(address(economy), oddAmount);
        economy.onSpinRevenue(oddAmount, 0);

        vm.stopPrank();

        // Since vault has no shares, yield is queued
        uint256 depositorShare = (oddAmount * DEPOSITOR_SHARE_BPS) / 10_000;
        uint256 protocolShare = oddAmount - depositorShare;

        assertEq(economy.totalQueuedYield(), depositorShare);
        assertEq(economy.totalToProtocol(), protocolShare);
        assertEq(economy.totalQueuedYield() + economy.totalToProtocol(), oddAmount);
    }

    function testZeroDepositorShare() public {
        vm.startPrank(economyOwner);

        economy.setRevenueSplit(0, 10_000);

        vm.stopPrank();

        vm.startPrank(localGacha);

        usdc.approve(address(economy), REVENUE_AMOUNT);
        economy.onSpinRevenue(REVENUE_AMOUNT, 0);

        vm.stopPrank();

        assertEq(economy.totalToDepositors(), 0);
        assertEq(economy.totalToProtocol(), REVENUE_AMOUNT);
    }

    function testSetRevenueSplitAuthorization() public {
        vm.prank(user);
        vm.expectRevert();
        economy.setRevenueSplit(9_000, 1_000);
    }

    function testSetGachaAuthorization() public {
        vm.prank(user);
        vm.expectRevert();
        economy.setGacha(makeAddr("new"));
    }

    function testPauseAuthorization() public {
        vm.prank(user);
        vm.expectRevert();
        economy.pause();
    }

    function testUnpauseAuthorization() public {
        vm.startPrank(economyOwner);
        economy.pause();
        vm.stopPrank();

        vm.prank(user);
        vm.expectRevert();
        economy.unpause();
    }
}
