// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Test, console2} from "forge-std/Test.sol";
import {Gacha} from "../src/gacha/Gacha.sol";
import {GachaTreasury} from "../src/gacha/GachaTreasury.sol";
import {GachaServiceHandler} from "../src/gacha/GachaServiceHandler.sol";
import {GachaEconomyManager} from "../src/economy/GachaEconomyManager.sol";
import {DepositorVault} from "../src/economy/DepositorVault.sol";
import {BuybackVault} from "../src/economy/BuybackVault.sol";
import {ProtocolTreasury} from "../src/economy/ProtocolTreasury.sol";
import {NFTAppraisal} from "../src/appraisal/NFTAppraisal.sol";
import {NFTAppraisalServiceHandler} from "../src/appraisal/NFTAppraisalServiceHandler.sol";
import {BaseERC721} from "../src/tokens/BaseERC721.sol";
import {BaseERC20} from "../src/tokens/BaseERC20.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";
import {MockNFTAppraisal} from "./mocks/MockNFTAppraisal.sol";
import {MockWavsServiceManager} from "./mocks/MockWavsServiceManager.sol";
import {IWavsServiceManager} from "@wavs/eigenlayer/ecdsa/interfaces/IWavsServiceManager.sol";
import {IWavsServiceHandler} from "@wavs/eigenlayer/ecdsa/interfaces/IWavsServiceHandler.sol";
import {WavsDrandPayload} from "../src/interfaces/WavsDrandTypes.sol";

/**
 * @title Comprehensive Gacha Economy Integration Tests
 * @notice Tests the complete economic flow from spin fees to depositor rewards
 * @dev Covers revenue distribution, reward accrual, buyback mechanics, and edge cases
 */
contract GachaEconomyIntegrationTest is Test {
    // Core contracts
    Gacha public gacha;
    GachaTreasury public treasury;
    GachaEconomyManager public economy;
    DepositorVault public depositorVault;
    BuybackVault public buybackVault;
    ProtocolTreasury public protocolTreasury;
    NFTAppraisal public appraisal;
    MockWavsServiceManager public serviceManager;
    GachaServiceHandler public gachaServiceHandler;
    NFTAppraisalServiceHandler public appraisalServiceHandler;

    // Mock tokens
    BaseERC20 public usdc;
    BaseERC721 public collection;
    MockNFTAppraisal public mockAppraisal;

    // Test addresses
    address public owner = address(0x1);
    address public gachaHandler = address(0x2);
    address public depositor = address(0x3);
    address public spinner = address(0x4);
    address public protocol = address(0x5);

    // Economic constants
    uint256 public constant SPIN_FEE = 10 * 1e6; // $10 USDC
    uint256 public constant APPRAISAL_FEE = 5 * 1e18; // 5 tokens
    uint256 public constant DEPOSITOR_SHARE = 7_000; // 70%
    uint256 public constant BUYBACK_SHARE = 2_500;  // 25%
    uint256 public constant PROTOCOL_SHARE = 500;   // 5%

    // NFT price tiers for testing (USD values)
    uint256 public constant COMMON_PRICE = 50e18;     // $50
    uint256 public constant UNCOMMON_PRICE = 250e18;  // $250
    uint256 public constant RARE_PRICE = 1_000e18;    // $1,000
    uint256 public constant EPIC_PRICE = 5_000e18;    // $5,000
    uint256 public constant LEGENDARY_PRICE = 15_000e18; // $15,000

    uint256 public constant TOKENS_PER_RARITY = 120;

    event SpinCompleted(uint256 indexed triggerId, address indexed requester, GachaTreasury.Rarity rarity, address collection, uint256 tokenId, uint256 appraisedPrice);

    function setUp() public {
        // Deploy USDC token
        usdc = new BaseERC20("USDC", "USDC", owner);

        // Deploy mock appraisal for faster testing
        mockAppraisal = new MockNFTAppraisal();

        // Deploy NFT collection
        vm.startPrank(owner);
        collection = new BaseERC721("Test Collection", "TEST", owner);
        vm.stopPrank();

        // Deploy core contract implementations
        Gacha gachaImpl = new Gacha();
        GachaTreasury treasuryImpl = new GachaTreasury();
        GachaEconomyManager economyImpl = new GachaEconomyManager();
        DepositorVault depositorImpl = new DepositorVault();
        BuybackVault buybackImpl = new BuybackVault();
        ProtocolTreasury protocolImpl = new ProtocolTreasury();
        NFTAppraisal appraisalImpl = new NFTAppraisal();

        // Deploy proxies and initialize
        vm.startPrank(owner);

        // Initialize GachaTreasury
        bytes memory treasuryInit = abi.encodeWithSelector(
            GachaTreasury.initialize.selector,
            owner,
            address(this), // Temporary gacha address
            address(mockAppraisal)
        );
        ERC1967Proxy treasuryProxy = new ERC1967Proxy(address(treasuryImpl), treasuryInit);
        treasury = GachaTreasury(address(treasuryProxy));

        // Initialize DepositorVault
        bytes memory depositorInit = abi.encodeWithSelector(
            DepositorVault.initialize.selector,
            owner,
            address(usdc),
            address(treasury),
            address(this) // Temporary economy manager
        );
        ERC1967Proxy depositorProxy = new ERC1967Proxy(address(depositorImpl), depositorInit);
        depositorVault = DepositorVault(address(depositorProxy));

        // Initialize BuybackVault
        bytes memory buybackInit = abi.encodeWithSelector(
            BuybackVault.initialize.selector,
            owner,
            address(usdc),
            address(treasury),
            address(depositorVault),
            address(mockAppraisal),
            address(this) // Temporary economy manager
        );
        ERC1967Proxy buybackProxy = new ERC1967Proxy(address(buybackImpl), buybackInit);
        buybackVault = BuybackVault(address(buybackProxy));

        // Initialize ProtocolTreasury
        bytes memory protocolInit = abi.encodeWithSelector(
            ProtocolTreasury.initialize.selector,
            owner,
            address(usdc),
            address(this) // Temporary economy manager
        );
        ERC1967Proxy protocolProxy = new ERC1967Proxy(address(protocolImpl), protocolInit);
        protocolTreasury = ProtocolTreasury(address(protocolProxy));

        // Initialize GachaEconomyManager
        bytes memory economyInit = abi.encodeWithSelector(
            GachaEconomyManager.initialize.selector,
            owner,
            address(usdc),
            address(this), // Temporary gacha address
            address(depositorVault),
            address(buybackVault),
            address(protocolTreasury)
        );
        ERC1967Proxy economyProxy = new ERC1967Proxy(address(economyImpl), economyInit);
        economy = GachaEconomyManager(address(economyProxy));

        // Initialize Gacha
        bytes memory gachaInit = abi.encodeWithSelector(
            Gacha.initialize.selector,
            owner,
            gachaHandler,
            address(usdc),
            SPIN_FEE,
            address(treasury),
            address(economy)
        );
        ERC1967Proxy gachaProxy = new ERC1967Proxy(address(gachaImpl), gachaInit);
        gacha = Gacha(address(gachaProxy));

        // Initialize NFTAppraisal
        bytes memory appraisalInit = abi.encodeWithSelector(
            NFTAppraisal.initialize.selector,
            owner,
            address(usdc),
            APPRAISAL_FEE,
            protocol
        );
        ERC1967Proxy appraisalProxy = new ERC1967Proxy(address(appraisalImpl), appraisalInit);
        appraisal = NFTAppraisal(address(appraisalProxy));

        // Configure WAVS service handlers
        serviceManager = new MockWavsServiceManager();
        gachaServiceHandler =
            new GachaServiceHandler(IWavsServiceManager(address(serviceManager)), address(gacha));
        appraisalServiceHandler =
            new NFTAppraisalServiceHandler(IWavsServiceManager(address(serviceManager)), address(appraisal));

        gacha.setGachaServiceHandler(address(gachaServiceHandler));
        appraisal.setServiceHandler(address(appraisalServiceHandler));

        // Fund test accounts (these will be called by owner since we're in owner prank)
        usdc.mint(depositor, 100_000 * 1e6); // $100k
        usdc.mint(spinner, 10_000 * 1e6);   // $10k
        usdc.mint(owner, 1_000_000 * 1e6);  // $1M for protocol

        // Wire contract relationships
        _wireContractRelationships();

        vm.stopPrank();

        // Setup NFT collection with appraisals
        _setupNFTCollection();

        // Deposit NFTs into treasury
        _depositNFTsIntoTreasury();

        // Sanity check: ensure each rarity pool is initialized with inventory
        for (uint256 rarityIndex = 0; rarityIndex < 5; rarityIndex++) {
            assertEq(
                treasury.getRarityCount(GachaTreasury.Rarity(rarityIndex)),
                TOKENS_PER_RARITY,
                "Treasury setup should seed all rarity pools"
            );
        }
    }

    function _wireContractRelationships() internal {
        vm.startPrank(owner);
        // Treasury connections
        treasury.setGachaContract(address(gacha));
        treasury.setDepositorVault(address(depositorVault));
        treasury.setBuybackVault(address(buybackVault));

        // Economy connections
        economy.setGacha(address(gacha));
        economy.setVaults(address(depositorVault), address(buybackVault), address(protocolTreasury));

        // Vault connections
        depositorVault.setEconomyManager(address(economy));
        depositorVault.setBuybackVault(address(buybackVault));
        buybackVault.setEconomyManager(address(economy));
        protocolTreasury.setEconomyManager(address(economy));

        vm.stopPrank();
    }

    function _setupNFTCollection() internal {
        vm.startPrank(owner);
        treasury.addToWhitelist(address(collection));

        uint256[5] memory prices = [COMMON_PRICE, UNCOMMON_PRICE, RARE_PRICE, EPIC_PRICE, LEGENDARY_PRICE];

        for (uint256 rarityIndex = 0; rarityIndex < prices.length; rarityIndex++) {
            for (uint256 i = 0; i < TOKENS_PER_RARITY; i++) {
                uint256 tokenId = rarityIndex * TOKENS_PER_RARITY + i;
                bytes32 cardId = keccak256(abi.encodePacked("rarity", rarityIndex, "_", i));
                mockAppraisal.setMockAppraisalWithCardId(address(collection), tokenId, cardId, prices[rarityIndex]);
            }
        }

        vm.stopPrank();
    }

    function _depositNFTsIntoTreasury() internal {
        uint256 totalTokens = 5 * TOKENS_PER_RARITY;
        uint256[] memory tokenIds = new uint256[](totalTokens);

        vm.startPrank(owner);
        for (uint256 i = 0; i < totalTokens; i++) {
            tokenIds[i] = collection.mint(depositor);
        }
        vm.stopPrank();

        vm.startPrank(depositor);
        collection.setApprovalForAll(address(treasury), true);
        for (uint256 i = 0; i < tokenIds.length; i++) {
            treasury.depositNFT(address(collection), tokenIds[i]);
        }
        vm.stopPrank();
    }

    /**
     * @notice Test complete economic flow: spin → revenue distribution → rewards accrual
     */
    function testCompleteEconomicFlow() public {
        // Record initial balances
        uint256 initialDepositorBalance = usdc.balanceOf(address(depositorVault));
        uint256 initialBuybackBalance = usdc.balanceOf(address(buybackVault));
        uint256 initialProtocolBalance = usdc.balanceOf(address(protocolTreasury));

        // Approve and execute spin
        vm.prank(spinner);
        usdc.approve(address(gacha), SPIN_FEE);

        vm.prank(spinner);
        uint256 triggerId = gacha.spin();

        // Fulfill spin with randomness that results in Common win
        _dispatchRandomness(triggerId, bytes32(uint256(100))); // Low roll = Common

        // Verify revenue distribution
        uint256 expectedDepositorShare = Math.mulDiv(SPIN_FEE, DEPOSITOR_SHARE, 10_000);
        uint256 expectedBuybackShare = Math.mulDiv(SPIN_FEE, BUYBACK_SHARE, 10_000);
        uint256 expectedProtocolShare = SPIN_FEE - expectedDepositorShare - expectedBuybackShare;

        assertEq(
            usdc.balanceOf(address(depositorVault)),
            initialDepositorBalance + expectedDepositorShare,
            "Depositor vault should receive 70% of spin fee"
        );
        assertEq(
            usdc.balanceOf(address(buybackVault)),
            initialBuybackBalance + expectedBuybackShare,
            "Buyback vault should receive 25% of spin fee"
        );
        assertEq(
            usdc.balanceOf(address(protocolTreasury)),
            initialProtocolBalance + expectedProtocolShare,
            "Protocol treasury should receive remainder"
        );

        // Verify reward accrual for depositor
        uint256 pendingRewards = depositorVault.pendingYield(depositor);
        assertGt(pendingRewards, 0, "Depositor should have accrued rewards");

        // Verify economy tracking
        assertEq(economy.totalRevenueProcessed(), SPIN_FEE, "Economy should track total revenue");
        assertEq(
            economy.revenueByRarity(GachaTreasury.Rarity.Common),
            SPIN_FEE,
            "Economy should track revenue by rarity"
        );
    }

    /**
     * @notice Test reward claiming mechanism
     */
    function testRewardClaiming() public {
        // Execute multiple spins to generate rewards
        _executeSpins(10);

        // Check pending rewards
        uint256 pendingBefore = depositorVault.pendingYield(depositor);
        assertGt(pendingBefore, 0, "Should have pending rewards");

        // Claim rewards
        uint256 depositorBalanceBefore = usdc.balanceOf(depositor);
        vm.prank(depositor);
        uint256 claimed = depositorVault.claimYield(depositor, depositor);

        // Verify claim
        assertEq(claimed, pendingBefore, "Should claim full pending amount");
        assertEq(
            usdc.balanceOf(depositor),
            depositorBalanceBefore + claimed,
            "Depositor should receive claimed rewards"
        );
        assertEq(depositorVault.pendingYield(depositor), 0, "Should have no pending rewards after claim");
    }

    /**
     * @notice Test buyback vault mechanics
     */
    function testBuybackMechanics() public {
        // Generate revenue in buyback vault
        _executeSpins(5);

        // Spinner wins an NFT and opts for buyback
        vm.startPrank(owner);
        uint256 tokenId = collection.mint(spinner);
        mockAppraisal.setMockAppraisalWithCardId(address(collection), tokenId, keccak256("epic"), EPIC_PRICE);
        vm.stopPrank();

        vm.startPrank(spinner);
        collection.approve(address(buybackVault), tokenId);
        vm.stopPrank();

        uint256 spinnerBalanceBefore = usdc.balanceOf(spinner);
        uint256 expectedPayout = Math.mulDiv(EPIC_PRICE, 9_000, 10_000) / 1e12; // 90% of appraisal, converted to USDC

        // Seed buyback vault liquidity to cover the payout scenario
        vm.prank(owner);
        usdc.transfer(address(buybackVault), 10_000 * 1e6);

        vm.startPrank(spinner);
        uint256 actualPayout = buybackVault.executeBuyback(address(collection), tokenId, spinner);

        assertEq(actualPayout, expectedPayout, "Should pay 90% of appraised value");
        assertEq(
            usdc.balanceOf(spinner),
            spinnerBalanceBefore + expectedPayout,
            "Spinner should receive buyback payout"
        );
        assertTrue(treasury.depositedNFTs(address(collection), tokenId), "NFT should be restocked in treasury");

        vm.stopPrank();
    }

    /**
     * @notice Test buyback liquidity staking
     */
    function testBuybackLiquidityStaking() public {
        // Generate revenue in buyback vault
        _executeSpins(10);

        uint256 totalRevenue = usdc.balanceOf(address(buybackVault));
        uint256 stakeAmount = totalRevenue / 2; // Stake 50%

        // Record stakes before
        uint256 stakedBefore = buybackVault.stakedPrincipal();
        uint256 buybackSharesBefore = depositorVault.sharesOf(address(buybackVault));

        // Stake surplus liquidity
        vm.prank(owner);
        buybackVault.stakeSurplus(stakeAmount);

        // Verify staking
        assertEq(
            buybackVault.stakedPrincipal(),
            stakedBefore + stakeAmount,
            "Should track staked principal"
        );
        assertGt(
            depositorVault.sharesOf(address(buybackVault)),
            buybackSharesBefore,
            "Buyback vault should receive shares"
        );

        // Unstake
        vm.prank(owner);
        buybackVault.unstakeSurplus(stakeAmount);

        assertEq(
            buybackVault.stakedPrincipal(),
            stakedBefore,
            "Should unstake principal"
        );
    }

    /**
     * @notice Test multiple depositors reward distribution
     */
    function testMultipleDepositorRewards() public {
        address depositor2 = address(0x6);

        // Setup second depositor
        vm.startPrank(owner);
        usdc.mint(depositor2, 50_000 * 1e6);

        // Mint NFTs to second depositor
        uint256[] memory tokenIds = new uint256[](3);
        for (uint256 i = 0; i < tokenIds.length; i++) {
            tokenIds[i] = collection.mint(depositor2);
            mockAppraisal.setMockAppraisalWithCardId(
                address(collection), tokenIds[i], keccak256(abi.encodePacked("rare", i)), RARE_PRICE
            );
        }
        vm.stopPrank();

        // Second depositor deposits NFTs
        vm.startPrank(depositor2);
        collection.setApprovalForAll(address(treasury), true);
        for (uint256 i = 0; i < tokenIds.length; i++) {
            treasury.depositNFT(address(collection), tokenIds[i]);
        }
        vm.stopPrank();

        // Generate revenue through spins
        _executeSpins(20);

        // Check reward distribution
        uint256 pending1 = depositorVault.pendingYield(depositor);
        uint256 pending2 = depositorVault.pendingYield(depositor2);

        assertGt(pending1, 0, "First depositor should have rewards");
        assertGt(pending2, 0, "Second depositor should have rewards");

        // Rewards should scale with deposited value
        uint256 totalValue1;
        uint256 totalValue2;
        for (uint256 r = 0; r < 5; r++) {
            totalValue1 += treasury.userDepositValues(depositor, GachaTreasury.Rarity(r));
            totalValue2 += treasury.userDepositValues(depositor2, GachaTreasury.Rarity(r));
        }

        assertGt(totalValue1, 0, "Primary depositor should have tracked value");
        assertGt(totalValue2, 0, "Secondary depositor should have tracked value");

        uint256 rewardRate1 = (pending1 * 1e18) / totalValue1;
        uint256 rewardRate2 = (pending2 * 1e18) / totalValue2;

        assertApproxEqRel(rewardRate1, rewardRate2, 0.05e18, "Rewards should be proportional to deposit value");
    }

    /**
     * @notice Test edge case: empty rarity pool refunds
     */
    function testEmptyRarityPoolRefund() public {
        // Initiate spin while inventory exists
        vm.startPrank(spinner);
        usdc.approve(address(gacha), SPIN_FEE);
        uint256 spinnerBalanceBefore = usdc.balanceOf(spinner);
        uint256 triggerId = gacha.spin();
        vm.stopPrank();

        // Drain all common NFTs before fulfillment
        vm.startPrank(depositor);
        for (uint256 i = 0; i < TOKENS_PER_RARITY; i++) {
            treasury.withdrawMyNFT(address(collection), i);
        }
        vm.stopPrank();

        // Fulfill with randomness that results in Common (should refund)
        _dispatchRandomness(triggerId, bytes32(uint256(100)));

        // Should be refunded
        assertEq(
            usdc.balanceOf(spinner),
            spinnerBalanceBefore,
            "Should receive full refund for empty pool"
        );

        // Check analytics
        (, uint256 totalRefunds,,) = gacha.getUserAnalytics(spinner);
        assertGt(totalRefunds, 0, "Should track refunds");
    }

    /**
     * @notice Test revenue split configuration changes
     */
    function testRevenueSplitConfiguration() public {
        // Update revenue split
        uint256 newDepositorShare = 6_000; // 60%
        uint256 newBuybackShare = 3_000;   // 30%
        uint256 newProtocolShare = 1_000;  // 10%

        vm.prank(owner);
        economy.setRevenueSplit(newDepositorShare, newBuybackShare, newProtocolShare);

        assertEq(economy.depositorShareBps(), newDepositorShare, "Should update depositor share");
        assertEq(economy.buybackShareBps(), newBuybackShare, "Should update buyback share");
        assertEq(economy.protocolShareBps(), newProtocolShare, "Should update protocol share");

        // Test new split in action
        uint256 initialDepositorBalance = usdc.balanceOf(address(depositorVault));
        uint256 initialBuybackBalance = usdc.balanceOf(address(buybackVault));
        uint256 initialProtocolBalance = usdc.balanceOf(address(protocolTreasury));

        _executeSpins(1);

        uint256 expectedDepositorShare = Math.mulDiv(SPIN_FEE, newDepositorShare, 10_000);
        uint256 expectedBuybackShare = Math.mulDiv(SPIN_FEE, newBuybackShare, 10_000);
        uint256 expectedProtocolShare = SPIN_FEE - expectedDepositorShare - expectedBuybackShare;

        assertEq(
            usdc.balanceOf(address(depositorVault)) - initialDepositorBalance,
            expectedDepositorShare,
            "Should use new depositor share"
        );
        assertEq(
            usdc.balanceOf(address(buybackVault)) - initialBuybackBalance,
            expectedBuybackShare,
            "Should use new buyback share"
        );
        assertEq(
            usdc.balanceOf(address(protocolTreasury)) - initialProtocolBalance,
            expectedProtocolShare,
            "Should use new protocol share"
        );
    }

    /**
     * @notice Test contract pause/unpause functionality
     */
    function testPauseFunctionality() public {
        // Pause contracts
        vm.prank(owner);
        gacha.emergencyPause();

        // Attempt spin should fail
        vm.prank(spinner);
        usdc.approve(address(gacha), SPIN_FEE);
        vm.prank(spinner);
        vm.expectRevert();
        gacha.spin();

        // Unpause
        vm.prank(owner);
        gacha.emergencyUnpause();

        // Should work again
        vm.prank(spinner);
        uint256 triggerId = gacha.spin();
        assertGt(triggerId, 0, "Should be able to spin after unpause");
    }

    /**
     * @notice Test stress scenario: high volume spins
     */
    function testHighVolumeSpins() public {
        uint256 numSpins = 100;

        // Execute many spins
        for (uint256 i = 0; i < numSpins; i++) {
            vm.startPrank(spinner);
            usdc.approve(address(gacha), SPIN_FEE);
            uint256 triggerId = gacha.spin();
            vm.stopPrank();

            // Use different randomness for variety
            _dispatchRandomness(triggerId, bytes32(i + 1000));
        }

        // Verify system integrity
        assertEq(economy.totalRevenueProcessed(), numSpins * SPIN_FEE, "Should process all revenue");

        uint256 totalDistributed = usdc.balanceOf(address(depositorVault))
            + usdc.balanceOf(address(buybackVault))
            + usdc.balanceOf(address(protocolTreasury));

        assertEq(totalDistributed, numSpins * SPIN_FEE, "All revenue should be distributed");

        // Check global analytics
        (uint256 totalSpins,,,) = gacha.getGlobalAnalytics();
        assertEq(totalSpins, numSpins, "Should track all spins");
    }

    // Helper functions

    function _executeSpins(uint256 count) internal {
        for (uint256 i = 0; i < count; i++) {
            vm.startPrank(spinner);
            usdc.approve(address(gacha), SPIN_FEE);
            uint256 triggerId = gacha.spin();
            vm.stopPrank();

            _dispatchRandomness(triggerId, bytes32(i + 1000));
        }
    }

    function _dispatchRandomness(uint256 triggerId, bytes32 randomness) internal {
        bytes memory payload = abi.encode(WavsDrandPayload({triggerId: triggerId, randomness: randomness}));

        IWavsServiceHandler.Envelope memory envelope = IWavsServiceHandler.Envelope({
            eventId: bytes20(uint160(address(gacha))),
            ordering: bytes12(0),
            payload: payload
        });

        IWavsServiceHandler.SignatureData memory signatureData = IWavsServiceHandler.SignatureData({
            signers: new address[](0),
            signatures: new bytes[](0),
            referenceBlock: uint32(block.number)
        });

        vm.prank(gachaHandler);
        gachaServiceHandler.handleSignedEnvelope(envelope, signatureData);
    }
}
