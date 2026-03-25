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

contract EconomyFlowTest is Test, IERC721Receiver {
    MockERC20 internal usdc;
    MockNFTAppraisal internal appraisal;
    GachaTreasury internal treasury;
    CardGroupedVault internal cardGroupedVault;
    ProtocolTreasury internal protocolTreasury;
    GachaEconomyManager internal economy;
    BaseERC721 internal collection;

    address internal constant DEPOSITOR = address(0xA11CE);
    address internal constant SPINNER = address(0xB0B);

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

        // Mint NFT to depositor and deposit into treasury
        uint256 tokenId = collection.mint(DEPOSITOR);
        appraisal.setMockAppraisal(address(collection), tokenId, APPRAISAL_PRICE);

        vm.startPrank(DEPOSITOR);
        collection.setApprovalForAll(address(treasury), true);
        treasury.depositNFT(address(collection), tokenId);
        vm.stopPrank();
    }

    function testSpinRevenueSplit() public {
        uint256 depositorShare = (REVENUE_AMOUNT * economy.depositorShareBps()) / 10_000;
        uint256 protocolShare = REVENUE_AMOUNT - depositorShare;

        usdc.mint(address(this), REVENUE_AMOUNT);
        usdc.approve(address(economy), REVENUE_AMOUNT);

        economy.onSpinRevenue(REVENUE_AMOUNT, 1);

        assertEq(usdc.balanceOf(address(cardGroupedVault)), depositorShare, "Depositor vault balance mismatch");
        assertEq(usdc.balanceOf(address(protocolTreasury)), protocolShare, "Protocol treasury balance mismatch");
        assertEq(cardGroupedVault.totalYieldDistributed(), depositorShare, "Yield distributed tracking mismatch");
        assertEq(economy.totalRevenueProcessed(), REVENUE_AMOUNT, "Revenue processed mismatch");
        assertEq(economy.revenueByRarity(1), REVENUE_AMOUNT, "Rarity accounting mismatch");
    }

    function testDepositorClaimsYield() public {
        usdc.mint(address(this), REVENUE_AMOUNT);
        usdc.approve(address(economy), REVENUE_AMOUNT);
        economy.onSpinRevenue(REVENUE_AMOUNT, 1);

        uint256 expectedClaim = (REVENUE_AMOUNT * economy.depositorShareBps()) / 10_000;

        uint256 depositorBalanceBefore = usdc.balanceOf(DEPOSITOR);
        vm.prank(DEPOSITOR);
        uint256 claimed = cardGroupedVault.claimYield(DEPOSITOR);
        uint256 depositorBalanceAfter = usdc.balanceOf(DEPOSITOR);

        assertEq(claimed, expectedClaim, "Claimed amount mismatch");
        assertEq(
            depositorBalanceAfter - depositorBalanceBefore, expectedClaim, "Depositor did not receive expected yield"
        );
        assertEq(cardGroupedVault.totalYieldClaimed(), expectedClaim, "Total claimed tracking mismatch");
        assertEq(usdc.balanceOf(address(cardGroupedVault)), 0, "Vault should be empty after claim");
    }

    function testBuybackRedemption() public {
        usdc.mint(address(this), REVENUE_AMOUNT);
        usdc.approve(address(economy), REVENUE_AMOUNT);
        economy.onSpinRevenue(REVENUE_AMOUNT, 1);

        // Deposit an NFT into treasury first
        uint256 tokenId = collection.mint(address(this));
        appraisal.setMockAppraisal(address(collection), tokenId, APPRAISAL_PRICE);

        vm.startPrank(address(this));
        collection.setApprovalForAll(address(treasury), true);
        treasury.depositNFT(address(collection), tokenId);
        vm.stopPrank();

        // Simulate gacha win by sending random NFT to SPINNER (this test contract acts as gacha)
        // This sets the receive time needed for redemption
        GachaTreasury.NFTItem memory wonItem = treasury.sendRandomNFTToWinner(1, 0, SPINNER);

        // The NFT is now owned by SPINNER, so they need to approve it for redemption
        vm.startPrank(SPINNER);
        collection.approve(address(protocolTreasury), wonItem.tokenId);

        uint256 spinnerBalanceBefore = usdc.balanceOf(SPINNER);
        uint256 payout = protocolTreasury.executeRedemption(address(collection), wonItem.tokenId);
        uint256 spinnerBalanceAfter = usdc.balanceOf(SPINNER);
        vm.stopPrank();

        uint256 expectedPayout = (APPRAISAL_PRICE * 8_000) / 10_000 / 1e12;
        uint256 expectedProtocolBalance = (REVENUE_AMOUNT * economy.protocolShareBps()) / 10_000 - expectedPayout;

        assertEq(payout, expectedPayout, "Redemption payout mismatch");
        assertEq(
            spinnerBalanceAfter - spinnerBalanceBefore,
            expectedPayout,
            "Spinner did not receive expected redemption proceeds"
        );
        assertTrue(treasury.depositedNFTs(address(collection), wonItem.tokenId), "Redeemed NFT not restocked");
        assertEq(
            usdc.balanceOf(address(protocolTreasury)),
            expectedProtocolBalance,
            "Protocol treasury liquidity incorrect after redemption"
        );
    }

    function testBuybackRevertsWhenPayoutExceedsTreasuryCap() public {
        usdc.mint(address(this), REVENUE_AMOUNT);
        usdc.approve(address(economy), REVENUE_AMOUNT);
        economy.onSpinRevenue(REVENUE_AMOUNT, 1);

        // Set max payout to 0.01% of treasury balance — too low for the redemption
        protocolTreasury.setMaxPayoutBps(1);

        uint256 tokenId = collection.mint(address(this));
        appraisal.setMockAppraisal(address(collection), tokenId, APPRAISAL_PRICE);

        collection.setApprovalForAll(address(treasury), true);
        treasury.depositNFT(address(collection), tokenId);

        GachaTreasury.NFTItem memory wonItem = treasury.sendRandomNFTToWinner(1, 0, SPINNER);

        vm.startPrank(SPINNER);
        collection.approve(address(protocolTreasury), wonItem.tokenId);

        vm.expectRevert(abi.encodeWithSelector(ProtocolTreasury.PayoutExceedsTreasuryCap.selector));
        protocolTreasury.executeRedemption(address(collection), wonItem.tokenId);
        vm.stopPrank();
    }

    function testBuybackSucceedsWhenPayoutWithinTreasuryCap() public {
        usdc.mint(address(this), REVENUE_AMOUNT);
        usdc.approve(address(economy), REVENUE_AMOUNT);
        economy.onSpinRevenue(REVENUE_AMOUNT, 1);

        // Set max payout to 100% of treasury balance — generous cap
        protocolTreasury.setMaxPayoutBps(10_000);

        uint256 tokenId = collection.mint(address(this));
        appraisal.setMockAppraisal(address(collection), tokenId, APPRAISAL_PRICE);

        collection.setApprovalForAll(address(treasury), true);
        treasury.depositNFT(address(collection), tokenId);

        GachaTreasury.NFTItem memory wonItem = treasury.sendRandomNFTToWinner(1, 0, SPINNER);

        vm.startPrank(SPINNER);
        collection.approve(address(protocolTreasury), wonItem.tokenId);

        uint256 payout = protocolTreasury.executeRedemption(address(collection), wonItem.tokenId);
        vm.stopPrank();

        uint256 expectedPayout = (APPRAISAL_PRICE * 8_000) / 10_000 / 1e12;
        assertEq(payout, expectedPayout, "Payout should succeed within cap");
    }

    function testBuybackSucceedsWhenCapDisabled() public {
        usdc.mint(address(this), REVENUE_AMOUNT);
        usdc.approve(address(economy), REVENUE_AMOUNT);
        economy.onSpinRevenue(REVENUE_AMOUNT, 1);

        // maxPayoutBps defaults to 0 (disabled)
        assertEq(protocolTreasury.maxPayoutBps(), 0, "Cap should be disabled by default");

        uint256 tokenId = collection.mint(address(this));
        appraisal.setMockAppraisal(address(collection), tokenId, APPRAISAL_PRICE);

        collection.setApprovalForAll(address(treasury), true);
        treasury.depositNFT(address(collection), tokenId);

        GachaTreasury.NFTItem memory wonItem = treasury.sendRandomNFTToWinner(1, 0, SPINNER);

        vm.startPrank(SPINNER);
        collection.approve(address(protocolTreasury), wonItem.tokenId);

        uint256 payout = protocolTreasury.executeRedemption(address(collection), wonItem.tokenId);
        vm.stopPrank();

        assertGt(payout, 0, "Payout should succeed when cap is disabled");
    }

    function onERC721Received(address, address, uint256, bytes calldata) external pure override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }
}
