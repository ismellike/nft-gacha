// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Test} from "forge-std/Test.sol";
import {IERC721Receiver} from "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

import {GachaTreasury} from "../../src/gacha/GachaTreasury.sol";
import {CardGroupedVault} from "../../src/economy/CardGroupedVault.sol";
import {ProtocolTreasury} from "../../src/economy/ProtocolTreasury.sol";
import {GachaEconomyManager} from "../../src/economy/GachaEconomyManager.sol";
import {BaseERC721} from "../../src/tokens/BaseERC721.sol";
import {MockNFTAppraisal} from "../mocks/MockNFTAppraisal.sol";
import {MockERC20} from "../mocks/MockERC20.sol";

contract QueuedYield is Test, IERC721Receiver {
    MockERC20 internal usdc;
    MockNFTAppraisal internal appraisal;
    GachaTreasury internal treasury;
    CardGroupedVault internal cardGroupedVault;
    ProtocolTreasury internal protocolTreasury;
    GachaEconomyManager internal economy;
    BaseERC721 internal collection;

    address internal constant DEPOSITOR = address(0xA11CE);
    uint256 internal constant APPRAISAL_PRICE = 50 * 1e18;
    uint256 internal constant REVENUE_AMOUNT = 1_000 * 1e6; // 1,000 mUSDC

    function setUp() public {
        usdc = new MockERC20("Mock USDC", "mUSDC", 6);
        appraisal = new MockNFTAppraisal();

        treasury = new GachaTreasury();
        uint256 PRICE_STEP = 1e16;
        uint256[] memory minPrices = new uint256[](5);
        minPrices[0] = 0;
        minPrices[1] = uint256(15 * 1e18) + PRICE_STEP;
        minPrices[2] = uint256(60 * 1e18) + PRICE_STEP;
        minPrices[3] = uint256(250 * 1e18) + PRICE_STEP;
        minPrices[4] = uint256(1_200 * 1e18) + PRICE_STEP;

        uint256[] memory maxPrices = new uint256[](5);
        maxPrices[0] = uint256(15 * 1e18);
        maxPrices[1] = uint256(60 * 1e18);
        maxPrices[2] = uint256(250 * 1e18);
        maxPrices[3] = uint256(1_200 * 1e18);
        maxPrices[4] = type(uint256).max;

        string[] memory rarityNames = new string[](5);
        rarityNames[0] = "Common";
        rarityNames[1] = "Uncommon";
        rarityNames[2] = "Rare";
        rarityNames[3] = "Epic";
        rarityNames[4] = "Legendary";

        treasury.initialize(
            address(this), address(0xDEAD), address(appraisal), uint8(5), rarityNames, minPrices, maxPrices
        );

        cardGroupedVault = new CardGroupedVault();
        cardGroupedVault.initialize(address(this), address(usdc), address(treasury), address(this), uint8(5));

        protocolTreasury = new ProtocolTreasury();
        protocolTreasury.initialize(address(this), address(usdc), address(this), address(treasury), address(appraisal));

        economy = new GachaEconomyManager();
        economy.initialize(
            address(this), address(usdc), address(this), address(cardGroupedVault), address(protocolTreasury), uint8(5)
        );

        // Wire contract relationships
        treasury.setGachaContract(address(this));
        treasury.setCardGroupedVault(address(cardGroupedVault));
        treasury.setProtocolTreasury(address(protocolTreasury));

        cardGroupedVault.setEconomyManager(address(economy));
        protocolTreasury.setEconomyManager(address(economy));
        protocolTreasury.setGachaTreasury(address(treasury));
        economy.setGacha(address(this));
        economy.setVaults(address(cardGroupedVault), address(protocolTreasury));

        // Deploy helper NFT collection and whitelist
        collection = new BaseERC721("Test NFT", "TNFT", address(this));
        treasury.addToWhitelist(address(collection));
    }

    function testQueuedYieldWhenNoShares() public {
        // Process revenue when no NFTs are deposited (no shares)
        usdc.mint(address(this), REVENUE_AMOUNT);
        usdc.approve(address(economy), REVENUE_AMOUNT);

        economy.onSpinRevenue(REVENUE_AMOUNT, 1);

        // Verify depositor share was queued, not sent to protocol
        assertEq(
            economy.totalQueuedYield(), (REVENUE_AMOUNT * economy.depositorShareBps()) / 10_000, "Queued yield mismatch"
        );
        assertEq(usdc.balanceOf(address(cardGroupedVault)), 0, "Depositor vault should have no funds");
        assertEq(
            usdc.balanceOf(address(protocolTreasury)),
            (REVENUE_AMOUNT * economy.protocolShareBps()) / 10_000,
            "Protocol should only get its share"
        );
    }

    function testQueuedYieldProcessedOnDeposit() public {
        // First, queue some yield
        usdc.mint(address(this), REVENUE_AMOUNT);
        usdc.approve(address(economy), REVENUE_AMOUNT);
        economy.onSpinRevenue(REVENUE_AMOUNT, 1);

        uint256 queuedAmount = economy.totalQueuedYield();
        assertGt(queuedAmount, 0, "Should have queued yield");

        // Now deposit an NFT, which should trigger processing of queued yield
        uint256 tokenId = collection.mint(DEPOSITOR);
        appraisal.setMockAppraisal(address(collection), tokenId, APPRAISAL_PRICE);

        vm.startPrank(DEPOSITOR);
        collection.setApprovalForAll(address(treasury), true);
        treasury.depositNFT(address(collection), tokenId);
        vm.stopPrank();

        // Process more revenue to trigger queued yield processing
        usdc.mint(address(this), REVENUE_AMOUNT);
        usdc.approve(address(economy), REVENUE_AMOUNT);
        economy.onSpinRevenue(REVENUE_AMOUNT, 1);

        // Verify queued yield was processed
        assertEq(economy.totalQueuedYield(), 0, "Queued yield should be processed");
        assertGt(usdc.balanceOf(address(cardGroupedVault)), queuedAmount, "Depositor vault should have queued funds");
    }

    function testProtocolAutoClaimOnlyWithShares() public {
        // Process revenue when protocol has no shares
        usdc.mint(address(this), REVENUE_AMOUNT);
        usdc.approve(address(economy), REVENUE_AMOUNT);
        economy.onSpinRevenue(REVENUE_AMOUNT, 1);

        // Protocol should not have claimed any yield since it has no shares
        uint256 protocolBalanceBefore = usdc.balanceOf(address(protocolTreasury));
        uint256 protocolPending = cardGroupedVault.pendingYield(address(protocolTreasury));
        assertEq(protocolPending, 0, "Protocol should have no pending yield");

        // Now give protocol shares by redeeming an NFT back to treasury
        uint256 tokenId = collection.mint(address(this));
        appraisal.setMockAppraisal(address(collection), tokenId, APPRAISAL_PRICE);

        vm.startPrank(address(this));
        collection.setApprovalForAll(address(treasury), true);
        treasury.depositNFT(address(collection), tokenId);
        treasury.sendRandomNFTToWinner(1, 0, address(this));
        collection.approve(address(protocolTreasury), tokenId);
        protocolTreasury.executeRedemption(address(collection), tokenId);
        vm.stopPrank();

        // Now protocol should have shares and future auto-claims should work
        usdc.mint(address(this), REVENUE_AMOUNT);
        usdc.approve(address(economy), REVENUE_AMOUNT);
        economy.onSpinRevenue(REVENUE_AMOUNT, 1);

        uint256 protocolBalanceAfter = usdc.balanceOf(address(protocolTreasury));
        assertGt(protocolBalanceAfter, protocolBalanceBefore, "Protocol should have claimed yield after getting shares");
    }

    function testMultipleRevenueWithQueuedYield() public {
        // Process multiple revenue events while no shares exist
        for (uint256 i = 0; i < 3; i++) {
            usdc.mint(address(this), REVENUE_AMOUNT);
            usdc.approve(address(economy), REVENUE_AMOUNT);
            economy.onSpinRevenue(REVENUE_AMOUNT, 1);
        }

        uint256 totalQueued = economy.totalQueuedYield();
        // forge-lint: disable-next-line(divide-before-multiply)
        uint256 expectedQueued = (REVENUE_AMOUNT * economy.depositorShareBps() / 10_000) * 3;
        assertEq(totalQueued, expectedQueued, "Total queued yield should be accumulated");

        // Deposit NFT and process final revenue
        uint256 tokenId = collection.mint(DEPOSITOR);
        appraisal.setMockAppraisal(address(collection), tokenId, APPRAISAL_PRICE);

        vm.startPrank(DEPOSITOR);
        collection.setApprovalForAll(address(treasury), true);
        treasury.depositNFT(address(collection), tokenId);
        vm.stopPrank();

        // Final revenue should process all queued yield
        usdc.mint(address(this), REVENUE_AMOUNT);
        usdc.approve(address(economy), REVENUE_AMOUNT);
        economy.onSpinRevenue(REVENUE_AMOUNT, 1);

        assertEq(economy.totalQueuedYield(), 0, "All queued yield should be processed");
        assertGt(usdc.balanceOf(address(cardGroupedVault)), totalQueued, "Depositor vault should have all queued funds");
    }

    function onERC721Received(address, address, uint256, bytes calldata) external pure override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }
}
