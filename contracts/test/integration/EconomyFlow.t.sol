// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Test} from "forge-std/Test.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import {GachaTreasury} from "../../src/gacha/GachaTreasury.sol";
import {DepositorVault} from "../../src/economy/DepositorVault.sol";
import {ProtocolTreasury} from "../../src/economy/ProtocolTreasury.sol";
import {GachaEconomyManager} from "../../src/economy/GachaEconomyManager.sol";
import {BaseERC721} from "../../src/tokens/BaseERC721.sol";
import {MockNFTAppraisal} from "../mocks/MockNFTAppraisal.sol";

contract MockUSDC is ERC20 {
    constructor() ERC20("Mock USDC", "mUSDC") {}

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract EconomyFlowTest is Test {
    MockUSDC internal usdc;
    MockNFTAppraisal internal appraisal;
    GachaTreasury internal treasury;
    DepositorVault internal depositorVault;
    ProtocolTreasury internal protocolTreasury;
    GachaEconomyManager internal economy;
    BaseERC721 internal collection;

    address internal constant DEPOSITOR = address(0xA11CE);
    address internal constant SPINNER = address(0xB0B);

    uint256 internal constant APPRAISAL_PRICE = 100 * 1e18;
    uint256 internal constant REVENUE_AMOUNT = 1_000 * 1e6; // 1,000 mUSDC

    function setUp() public {
        usdc = new MockUSDC();
        appraisal = new MockNFTAppraisal();

        treasury = new GachaTreasury();
        uint256[5] memory minPrices = [uint256(0), 100 * 1e18, 500 * 1e18, 2000 * 1e18, 10000 * 1e18];
        uint256[5] memory maxPrices = [uint256(100 * 1e18), 500 * 1e18, 2000 * 1e18, 10000 * 1e18, type(uint256).max];
        treasury.initialize(address(this), address(0xDEAD), address(appraisal), minPrices, maxPrices);

        depositorVault = new DepositorVault();
        depositorVault.initialize(address(this), address(usdc), address(treasury), address(this));

        protocolTreasury = new ProtocolTreasury();
        protocolTreasury.initialize(address(this), address(usdc), address(this), address(treasury), address(appraisal));

        economy = new GachaEconomyManager();
        economy.initialize(
            address(this), address(usdc), address(this), address(depositorVault), address(protocolTreasury)
        );

        // Wire contract relationships
        treasury.setGachaContract(address(this));
        treasury.setDepositorVault(address(depositorVault));
        treasury.setProtocolTreasury(address(protocolTreasury));

        depositorVault.setEconomyManager(address(economy));
        protocolTreasury.setEconomyManager(address(economy));
        protocolTreasury.setGachaTreasury(address(treasury));
        economy.setGacha(address(this));
        economy.setVaults(address(depositorVault), address(protocolTreasury));

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
        uint256 depositorShare = (REVENUE_AMOUNT * 7_000) / 10_000;
        uint256 protocolShare = REVENUE_AMOUNT - depositorShare;

        usdc.mint(address(this), REVENUE_AMOUNT);
        usdc.approve(address(economy), REVENUE_AMOUNT);

        economy.onSpinRevenue(REVENUE_AMOUNT, GachaTreasury.Rarity.Common);

        assertEq(usdc.balanceOf(address(depositorVault)), depositorShare, "Depositor vault balance mismatch");
        assertEq(usdc.balanceOf(address(protocolTreasury)), protocolShare, "Protocol treasury balance mismatch");
        assertEq(depositorVault.totalYieldDistributed(), depositorShare, "Yield distributed tracking mismatch");
        assertEq(economy.totalRevenueProcessed(), REVENUE_AMOUNT, "Revenue processed mismatch");
        assertEq(economy.revenueByRarity(GachaTreasury.Rarity.Common), REVENUE_AMOUNT, "Rarity accounting mismatch");
    }

    function testDepositorClaimsYield() public {
        usdc.mint(address(this), REVENUE_AMOUNT);
        usdc.approve(address(economy), REVENUE_AMOUNT);
        economy.onSpinRevenue(REVENUE_AMOUNT, GachaTreasury.Rarity.Common);

        uint256 expectedClaim = (REVENUE_AMOUNT * 7_000) / 10_000;

        uint256 depositorBalanceBefore = usdc.balanceOf(DEPOSITOR);
        vm.prank(DEPOSITOR);
        uint256 claimed = depositorVault.claimYield(DEPOSITOR, DEPOSITOR);
        uint256 depositorBalanceAfter = usdc.balanceOf(DEPOSITOR);

        assertEq(claimed, expectedClaim, "Claimed amount mismatch");
        assertEq(
            depositorBalanceAfter - depositorBalanceBefore, expectedClaim, "Depositor did not receive expected yield"
        );
        assertEq(depositorVault.totalYieldClaimed(), expectedClaim, "Total claimed tracking mismatch");
        assertEq(usdc.balanceOf(address(depositorVault)), 0, "Vault should be empty after claim");
    }

    function testBuybackRedemption() public {
        usdc.mint(address(this), REVENUE_AMOUNT);
        usdc.approve(address(economy), REVENUE_AMOUNT);
        economy.onSpinRevenue(REVENUE_AMOUNT, GachaTreasury.Rarity.Common);

        // Spinner wins a new NFT and opts for redemption
        uint256 tokenId = collection.mint(SPINNER);
        appraisal.setMockAppraisal(address(collection), tokenId, APPRAISAL_PRICE);

        vm.prank(SPINNER);
        collection.approve(address(protocolTreasury), tokenId);

        uint256 spinnerBalanceBefore = usdc.balanceOf(SPINNER);
        vm.prank(SPINNER);
        uint256 payout = protocolTreasury.executeRedemption(address(collection), tokenId, SPINNER);
        uint256 spinnerBalanceAfter = usdc.balanceOf(SPINNER);

        uint256 expectedPayout = (APPRAISAL_PRICE * 8_500) / 10_000 / 1e12;

        assertEq(payout, expectedPayout, "Redemption payout mismatch");
        assertEq(
            spinnerBalanceAfter - spinnerBalanceBefore,
            expectedPayout,
            "Spinner did not receive expected redemption proceeds"
        );
        assertTrue(treasury.depositedNFTs(address(collection), tokenId), "Redeemed NFT not restocked");
        assertEq(
            usdc.balanceOf(address(protocolTreasury)),
            ((REVENUE_AMOUNT * 3_000) / 10_000) - expectedPayout,
            "Protocol treasury liquidity incorrect after redemption"
        );
    }
}
