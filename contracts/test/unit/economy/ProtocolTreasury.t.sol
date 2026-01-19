// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {StandardTest} from "../../helpers/StandardTest.sol";
import {ProtocolTreasury} from "../../../src/economy/ProtocolTreasury.sol";
import {GachaTreasury} from "../../../src/gacha/GachaTreasury.sol";
import {NFTAppraisal} from "../../../src/appraisal/NFTAppraisal.sol";
import {BaseERC20} from "../../../src/tokens/BaseERC20.sol";
import {BaseERC721} from "../../../src/tokens/BaseERC721.sol";
import {MockNFTAppraisal} from "../../mocks/MockNFTAppraisal.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

/**
 * @title ProtocolTreasury Test Suite
 */
contract ProtocolTreasuryTest is StandardTest {
    ProtocolTreasury public treasury;
    ProtocolTreasury public treasuryImpl;

    BaseERC20 public usdc;
    BaseERC721 public nft;
    MockNFTAppraisal public mockAppraisal;
    GachaTreasury public mockGachaTreasury;

    address public treasuryOwner;
    address public economyManager;

    event ProtocolRevenueReceived(uint256 amount);
    event RedemptionExecuted(address indexed user, address indexed collection, uint256 indexed tokenId, uint256 payout);

    function setUp() public {
        treasuryOwner = makeAddr("treasuryOwner");
        economyManager = makeAddr("economyManager");

        vm.startPrank(treasuryOwner);

        usdc = new BaseERC20("USDC", "USDC", treasuryOwner);
        nft = new BaseERC721("Test NFT", "TNFT", treasuryOwner);
        mockAppraisal = new MockNFTAppraisal();
        mockGachaTreasury = GachaTreasury(address(0x1)); // Mock address

        treasuryImpl = new ProtocolTreasury();

        bytes memory initData = abi.encodeWithSelector(
            ProtocolTreasury.initialize.selector,
            treasuryOwner,
            address(usdc),
            economyManager,
            address(mockGachaTreasury),
            address(mockAppraisal)
        );

        ERC1967Proxy proxy = new ERC1967Proxy(address(treasuryImpl), initData);
        treasury = ProtocolTreasury(address(proxy));

        vm.stopPrank();
    }

    function testDeployment() public view {
        assertEq(address(treasury.asset()), address(usdc));
        assertEq(treasury.economyManager(), economyManager);
        assertEq(address(treasury.gachaTreasury()), address(mockGachaTreasury));
        assertEq(address(treasury.appraisalOracle()), address(mockAppraisal));
        assertEq(treasury.redemptionWindow(), 1 hours);
    }

    function testOnRevenueReceived() public {
        uint256 amount = 1000e6;

        vm.startPrank(treasuryOwner);
        usdc.mint(economyManager, amount);
        vm.stopPrank();

        vm.startPrank(economyManager);

        usdc.approve(address(treasury), amount);
        vm.expectEmit(false, false, false, true);
        emit ProtocolRevenueReceived(amount);
        treasury.onRevenueReceived(amount);

        vm.stopPrank();

        assertEq(usdc.balanceOf(address(treasury)), amount);
    }

    function testOnRevenueReceivedFailsWithZeroAmount() public {
        vm.prank(economyManager);
        vm.expectRevert(abi.encodeWithSelector(ProtocolTreasury.InvalidAmount.selector));
        treasury.onRevenueReceived(0);
    }

    function testOnRevenueReceivedAuthorization() public {
        vm.prank(user);
        vm.expectRevert(abi.encodeWithSelector(ProtocolTreasury.UnauthorizedEconomyManager.selector));
        treasury.onRevenueReceived(100e6);
    }

    function testTransferOut() public {
        uint256 amount = 500e6;

        vm.startPrank(treasuryOwner);

        usdc.mint(address(treasury), amount);

        treasury.transferOut(user, amount);

        vm.stopPrank();

        assertEq(usdc.balanceOf(user), amount);
        assertEq(usdc.balanceOf(address(treasury)), 0);
    }

    function testTransferOutFailsWithZeroRecipient() public {
        vm.prank(treasuryOwner);
        vm.expectRevert(abi.encodeWithSelector(ProtocolTreasury.ZeroAddress.selector, "recipient"));
        treasury.transferOut(address(0), 100e6);
    }

    function testTransferOutFailsWithZeroAmount() public {
        vm.prank(treasuryOwner);
        vm.expectRevert(abi.encodeWithSelector(ProtocolTreasury.InvalidAmount.selector));
        treasury.transferOut(user, 0);
    }

    function testTransferOutAuthorization() public {
        vm.prank(user);
        vm.expectRevert();
        treasury.transferOut(user, 100e6);
    }

    function testSetEconomyManager() public {
        vm.startPrank(treasuryOwner);

        address newManager = makeAddr("newManager");
        treasury.setEconomyManager(newManager);

        assertEq(treasury.economyManager(), newManager);

        vm.stopPrank();
    }

    function testSetEconomyManagerFailsWithZeroAddress() public {
        vm.prank(treasuryOwner);
        vm.expectRevert(abi.encodeWithSelector(ProtocolTreasury.ZeroAddress.selector, "newManager"));
        treasury.setEconomyManager(address(0));
    }

    function testSetGachaTreasury() public {
        vm.startPrank(treasuryOwner);

        address newTreasury = makeAddr("newTreasury");
        treasury.setGachaTreasury(newTreasury);

        assertEq(address(treasury.gachaTreasury()), newTreasury);

        vm.stopPrank();
    }

    function testSetGachaTreasuryFailsWithZeroAddress() public {
        vm.prank(treasuryOwner);
        vm.expectRevert(abi.encodeWithSelector(ProtocolTreasury.ZeroAddress.selector, "newTreasury"));
        treasury.setGachaTreasury(address(0));
    }

    function testSetAppraisalOracle() public {
        vm.startPrank(treasuryOwner);

        address newOracle = makeAddr("newOracle");
        treasury.setAppraisalOracle(newOracle);

        assertEq(address(treasury.appraisalOracle()), newOracle);

        vm.stopPrank();
    }

    function testSetAppraisalOracleFailsWithZeroAddress() public {
        vm.prank(treasuryOwner);
        vm.expectRevert(abi.encodeWithSelector(ProtocolTreasury.ZeroAddress.selector, "newOracle"));
        treasury.setAppraisalOracle(address(0));
    }

    function testSetRedemptionWindow() public {
        vm.startPrank(treasuryOwner);

        treasury.setRedemptionWindow(2 hours);

        assertEq(treasury.redemptionWindow(), 2 hours);

        vm.stopPrank();
    }

    function testSetRedemptionWindowFailsWithZero() public {
        vm.prank(treasuryOwner);
        vm.expectRevert(abi.encodeWithSelector(ProtocolTreasury.InvalidAmount.selector));
        treasury.setRedemptionWindow(0);
    }

    function testPausePreventsOperations() public {
        vm.prank(treasuryOwner);
        treasury.pause();

        vm.prank(economyManager);
        vm.expectRevert();
        treasury.onRevenueReceived(100e6);

        vm.prank(treasuryOwner);
        vm.expectRevert();
        treasury.transferOut(user, 100e6);
    }

    function testUnpauseAllowsOperations() public {
        vm.startPrank(treasuryOwner);

        treasury.pause();
        treasury.unpause();

        vm.stopPrank();

        uint256 amount = 100e6;

        vm.startPrank(treasuryOwner);
        usdc.mint(economyManager, amount);
        vm.stopPrank();

        vm.startPrank(economyManager);
        usdc.approve(address(treasury), amount);
        treasury.onRevenueReceived(amount);
        vm.stopPrank();

        assertEq(usdc.balanceOf(address(treasury)), amount);
    }

    function testPauseAuthorization() public {
        vm.prank(user);
        vm.expectRevert();
        treasury.pause();
    }

    function testUnpauseAuthorization() public {
        vm.startPrank(treasuryOwner);
        treasury.pause();
        vm.stopPrank();

        vm.prank(user);
        vm.expectRevert();
        treasury.unpause();
    }

    // Note: getRemainingRedemptionWindow and isRedemptionEligible require
    // proper GachaTreasury mock with getNFTReceiveTime implementation
    // These would be tested in integration tests with real contracts
}
