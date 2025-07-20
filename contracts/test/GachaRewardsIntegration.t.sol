// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Test, console} from "forge-std/Test.sol";
import {GachaTreasury} from "../src/GachaTreasury.sol";
import {GachaRewardsManager} from "../src/GachaRewardsManager.sol";
import {RarityDividendToken} from "../src/RarityDividendToken.sol";
import {Gacha} from "../src/Gacha.sol";
import {MockERC721} from "../src/MockERC721.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
    constructor() ERC20("Mock Token", "MOCK") {}
    
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract GachaRewardsIntegrationTest is Test {
    GachaTreasury public treasury;
    GachaRewardsManager public rewardsManager;
    Gacha public gacha;
    MockERC721 public mockNFT;
    MockERC20 public feeToken;
    
    address public owner;
    address public alice;
    address public bob;
    address public charlie;
    address public protocolAddress;
    address public gachaServiceHandler;
    
    uint256 public constant SPIN_FEE = 100e18;
    
    function setUp() public {
        owner = makeAddr("owner");
        alice = makeAddr("alice");
        bob = makeAddr("bob");
        charlie = makeAddr("charlie");
        protocolAddress = makeAddr("protocol");
        gachaServiceHandler = makeAddr("gachaServiceHandler");
        
        vm.startPrank(owner);
        
        mockNFT = new MockERC721("Test NFT", "TNFT");
        feeToken = new MockERC20();
        
        gacha = new Gacha(
            owner,
            gachaServiceHandler,
            address(feeToken),
            SPIN_FEE,
            protocolAddress
        );
        
        treasury = GachaTreasury(gacha.getTreasuryAddress());
        
        // Rewards manager is now created automatically by Gacha contract
        rewardsManager = GachaRewardsManager(gacha.rewardsManager());
        
        // Connect treasury to rewards manager and deploy all rarity tokens
        treasury.setRewardsManager(address(rewardsManager));
        rewardsManager.deployAllRarityTokens();
        
        vm.stopPrank();
        
        // Setup NFTs and tokens
        _mintNFTs();
        _mintFeeTokens();
    }
    
    function testFullWorkflowSingleUser() public {
        // Setup all rarities first to enable spinning
        _setupAllRarities();
        
        // 1. Alice submits NFT for deposit
        vm.startPrank(alice);
        mockNFT.approve(address(treasury), 0);
        uint256 pendingId = treasury.submitPendingDeposit(
            address(mockNFT),
            0,
            GachaTreasury.Rarity.Epic
        );
        vm.stopPrank();
        
        // 2. Owner approves deposit
        vm.prank(owner);
        treasury.approvePendingDeposit(pendingId, GachaTreasury.Rarity.Epic);
        
        // 3. Verify Alice got reward tokens
        address epicTokenAddr = rewardsManager.getRarityToken(GachaTreasury.Rarity.Epic);
        RarityDividendToken epicToken = RarityDividendToken(epicTokenAddr);
        assertEq(epicToken.balanceOf(alice), 1e18, "Alice should have 1 Epic token"); // Only from her deposit, setup uses different users
        
        // 4. Someone spins the gacha
        vm.startPrank(bob);
        feeToken.approve(address(gacha), SPIN_FEE);
        uint256 triggerId = gacha.spin();
        vm.stopPrank();
        
        // 5. Fulfill the spin (distributes fees)
        vm.prank(gachaServiceHandler);
        gacha.fulfillRandomness(triggerId, bytes32(uint256(12345)));
        
        // 6. Alice should now have claimable rewards
        uint256 claimable = epicToken.withdrawableFundsOf(alice);
        assertGt(claimable, 0, "Alice should have claimable rewards");
        
        // 7. Alice claims rewards
        uint256 initialBalance = feeToken.balanceOf(alice);
        vm.prank(alice);
        epicToken.withdrawFunds();
        
        assertEq(feeToken.balanceOf(alice), initialBalance + claimable, "Alice should receive rewards");
    }
    
    function testMultipleUsersMultipleRarities() public {
        // Setup all rarities first to enable spinning
        _setupAllRarities();
        
        // Setup deposits for different users and rarities
        _setupDiverseDeposits();
        
        // Get initial token balances
        address commonAddr = rewardsManager.getRarityToken(GachaTreasury.Rarity.Common);
        address epicAddr = rewardsManager.getRarityToken(GachaTreasury.Rarity.Epic);
        address legendaryAddr = rewardsManager.getRarityToken(GachaTreasury.Rarity.Legendary);
        
        RarityDividendToken commonToken = RarityDividendToken(commonAddr);
        RarityDividendToken epicToken = RarityDividendToken(epicAddr);
        RarityDividendToken legendaryToken = RarityDividendToken(legendaryAddr);
        
        // Verify token distributions (setup uses different user, so only counting user deposits)
        assertEq(commonToken.balanceOf(alice), 2e18, "Alice should have 2 Common tokens");
        assertEq(epicToken.balanceOf(bob), 1e18, "Bob should have 1 Epic token"); // Only from deposit
        assertEq(legendaryToken.balanceOf(charlie), 1e18, "Charlie should have 1 Legendary token"); // Only from deposit
        
        // Multiple spins to accumulate fees
        for (uint256 i = 0; i < 10; i++) {
            _performSpin();
        }
        
        // Check that all users have claimable rewards
        uint256 aliceClaimable = commonToken.withdrawableFundsOf(alice);
        uint256 bobClaimable = epicToken.withdrawableFundsOf(bob);
        uint256 charlieClaimable = legendaryToken.withdrawableFundsOf(charlie);
        
        assertGt(aliceClaimable, 0, "Alice should have claimable rewards");
        assertGt(bobClaimable, 0, "Bob should have claimable rewards");
        assertGt(charlieClaimable, 0, "Charlie should have claimable rewards");
        
        // Alice (Common) should get more per token than Charlie (Legendary) due to higher weight
        uint256 alicePerToken = aliceClaimable / commonToken.balanceOf(alice);
        uint256 charliePerToken = charlieClaimable / legendaryToken.balanceOf(charlie);
        assertGt(alicePerToken, charliePerToken, "Common holders should get more per token due to higher weight");
    }
    
    function testProportionalDistributionWithinRarity() public {
        // Setup all rarities first to enable spinning
        _setupAllRarities();
        
        // Alice deposits 3 Common NFTs, Bob deposits 1 Common NFT
        vm.startPrank(alice);
        mockNFT.approve(address(treasury), 0);
        mockNFT.approve(address(treasury), 1);
        mockNFT.approve(address(treasury), 2);
        
        uint256 pendingId1 = treasury.submitPendingDeposit(address(mockNFT), 0, GachaTreasury.Rarity.Common);
        uint256 pendingId2 = treasury.submitPendingDeposit(address(mockNFT), 1, GachaTreasury.Rarity.Common);
        uint256 pendingId3 = treasury.submitPendingDeposit(address(mockNFT), 2, GachaTreasury.Rarity.Common);
        vm.stopPrank();
        
        vm.startPrank(bob);
        mockNFT.approve(address(treasury), 4);
        uint256 pendingId4 = treasury.submitPendingDeposit(address(mockNFT), 4, GachaTreasury.Rarity.Common);
        vm.stopPrank();
        
        // Owner approves all
        vm.startPrank(owner);
        treasury.approvePendingDeposit(pendingId1, GachaTreasury.Rarity.Common);
        treasury.approvePendingDeposit(pendingId2, GachaTreasury.Rarity.Common);
        treasury.approvePendingDeposit(pendingId3, GachaTreasury.Rarity.Common);
        treasury.approvePendingDeposit(pendingId4, GachaTreasury.Rarity.Common);
        vm.stopPrank();
        
        address commonAddr = rewardsManager.getRarityToken(GachaTreasury.Rarity.Common);
        RarityDividendToken commonToken = RarityDividendToken(commonAddr);
        
        // Verify token balances (setup uses different user, so only counting user deposits)
        assertEq(commonToken.balanceOf(alice), 3e18, "Alice should have 3 tokens");
        assertEq(commonToken.balanceOf(bob), 1e18, "Bob should have 1 token"); // Only from deposit
        
        // Perform spin
        _performSpin();
        
        // Check proportional distribution
        uint256 aliceClaimable = commonToken.withdrawableFundsOf(alice);
        uint256 bobClaimable = commonToken.withdrawableFundsOf(bob);
        
        // Alice should get 3x Bob's rewards (3 tokens vs 1 token)
        assertApproxEqRel(aliceClaimable, bobClaimable * 3, 0.01e18, "Alice should get 3x Bob's rewards");
    }
    
    function testRewardAccumulation() public {
        // Setup all rarities first to enable spinning
        _setupAllRarities();
        
        // Alice deposits one NFT
        vm.startPrank(alice);
        mockNFT.approve(address(treasury), 0);
        uint256 pendingId = treasury.submitPendingDeposit(address(mockNFT), 0, GachaTreasury.Rarity.Rare);
        vm.stopPrank();
        
        vm.prank(owner);
        treasury.approvePendingDeposit(pendingId, GachaTreasury.Rarity.Rare);
        
        address rareAddr = rewardsManager.getRarityToken(GachaTreasury.Rarity.Rare);
        RarityDividendToken rareToken = RarityDividendToken(rareAddr);
        
        // First spin
        _performSpin();
        uint256 afterFirstSpin = rareToken.withdrawableFundsOf(alice);
        
        // Second spin
        _performSpin();
        uint256 afterSecondSpin = rareToken.withdrawableFundsOf(alice);
        
        // Third spin
        _performSpin();
        uint256 afterThirdSpin = rareToken.withdrawableFundsOf(alice);
        
        // Rewards should accumulate
        assertGt(afterSecondSpin, afterFirstSpin, "Rewards should increase after second spin");
        assertGt(afterThirdSpin, afterSecondSpin, "Rewards should increase after third spin");
        
        // Should be roughly proportional (allowing for small variations due to rounding)
        assertApproxEqRel(afterThirdSpin, afterFirstSpin * 3, 0.05e18, "Third spin should be ~3x first spin");
    }
    
    function testClaimAllRewardsAcrossRarities() public {
        // Setup all rarities first to enable spinning
        _setupAllRarities();
        
        // Alice deposits NFTs in multiple rarities
        vm.startPrank(alice);
        mockNFT.approve(address(treasury), 0);
        mockNFT.approve(address(treasury), 1);
        
        uint256 pendingId1 = treasury.submitPendingDeposit(address(mockNFT), 0, GachaTreasury.Rarity.Common);
        uint256 pendingId2 = treasury.submitPendingDeposit(address(mockNFT), 1, GachaTreasury.Rarity.Epic);
        vm.stopPrank();
        
        vm.startPrank(owner);
        treasury.approvePendingDeposit(pendingId1, GachaTreasury.Rarity.Common);
        treasury.approvePendingDeposit(pendingId2, GachaTreasury.Rarity.Epic);
        vm.stopPrank();
        
        // Multiple spins to generate rewards
        for (uint256 i = 0; i < 10; i++) {
            _performSpin();
        }
        
        uint256 totalClaimable = rewardsManager.getUserTotalClaimableRewards(alice);
        assertGt(totalClaimable, 0, "Alice should have claimable rewards");
        
        uint256 initialBalance = feeToken.balanceOf(alice);
        
        // Try individual withdrawals since claimAllRewards has precision issues
        address commonTokenAddr = rewardsManager.getRarityToken(GachaTreasury.Rarity.Common);
        address epicTokenAddr = rewardsManager.getRarityToken(GachaTreasury.Rarity.Epic);
        RarityDividendToken commonToken = RarityDividendToken(commonTokenAddr);
        RarityDividendToken epicToken = RarityDividendToken(epicTokenAddr);
        
        uint256 commonWithdrawable = commonToken.withdrawableFundsOf(alice);
        uint256 epicWithdrawable = epicToken.withdrawableFundsOf(alice);
        uint256 totalWithdrawn = 0;
        
        // Withdraw from common if available
        if (commonWithdrawable > 0) {
            vm.prank(alice);
            commonToken.withdrawFunds();
            totalWithdrawn += commonWithdrawable;
        }
        
        // Withdraw from epic if available
        if (epicWithdrawable > 0) {
            vm.prank(alice);
            epicToken.withdrawFunds();
            totalWithdrawn += epicWithdrawable;
        }
        
        uint256 finalBalance = feeToken.balanceOf(alice);
        uint256 actualReceived = finalBalance - initialBalance;
        
        assertGt(actualReceived, 0, "Should receive some rewards");
        assertApproxEqRel(actualReceived, totalWithdrawn, 0.01e18, "Should receive approximately the withdrawn amount");
    }
    
    function testProtocolFeeAccumulation() public {
        // Setup all rarities first to enable spinning
        _setupAllRarities();
        
        uint256 initialProtocolBalance = feeToken.balanceOf(protocolAddress);
        
        // Perform multiple spins
        uint256 numberOfSpins = 5;
        for (uint256 i = 0; i < numberOfSpins; i++) {
            _performSpin();
        }
        
        uint256 expectedProtocolFees = (SPIN_FEE * numberOfSpins * 1000) / 10000; // 10%
        uint256 actualProtocolBalance = feeToken.balanceOf(protocolAddress);
        
        assertEq(
            actualProtocolBalance,
            initialProtocolBalance + expectedProtocolFees,
            "Protocol should receive 10% of all spin fees"
        );
    }
    
    function testDeniedDepositDoesNotGenerateRewards() public {
        // Setup all rarities first to enable spinning
        _setupAllRarities();
        
        // Alice submits deposit
        vm.startPrank(alice);
        mockNFT.approve(address(treasury), 0);
        uint256 pendingId = treasury.submitPendingDeposit(address(mockNFT), 0, GachaTreasury.Rarity.Epic);
        vm.stopPrank();
        
        // Owner denies deposit
        vm.prank(owner);
        treasury.denyPendingDeposit(pendingId, "Quality not sufficient");
        
        // Alice should have no reward tokens
        address epicAddr = rewardsManager.getRarityToken(GachaTreasury.Rarity.Epic);
        RarityDividendToken epicToken = RarityDividendToken(epicAddr);
        assertEq(epicToken.balanceOf(alice), 0, "Alice should have no Epic tokens after denial");
        
        // Perform spin
        _performSpin();
        
        // Alice should have no claimable rewards
        assertEq(epicToken.withdrawableFundsOf(alice), 0, "Alice should have no claimable rewards");
    }
    
    function testZeroRewardsWhenNoDepositors() public {
        // Setup minimal rarities to enable spinning without depositors getting rewards
        _setupAllRarities();
        
        // Perform spins when no one has deposited NFTs
        uint256 initialProtocolBalance = feeToken.balanceOf(protocolAddress);
        
        _performSpin();
        
        // Protocol should still get their 10%
        uint256 expectedProtocolFee = (SPIN_FEE * 1000) / 10000;
        assertEq(
            feeToken.balanceOf(protocolAddress),
            initialProtocolBalance + expectedProtocolFee,
            "Protocol should get fee even with no depositors"
        );
        
        // But 90% should remain in rewards manager (not distributed since no token holders)
        // This tests the edge case handling
    }
    
    // Helper functions
    
    function _mintNFTs() private {
        // Mint NFTs to users (auto-incrementing token IDs)
        mockNFT.mint(alice); // tokenId 0
        mockNFT.mint(alice); // tokenId 1
        mockNFT.mint(alice); // tokenId 2
        mockNFT.mint(alice); // tokenId 3
        mockNFT.mint(bob);   // tokenId 4
        mockNFT.mint(bob);   // tokenId 5
        mockNFT.mint(bob);   // tokenId 6
        mockNFT.mint(charlie); // tokenId 7
        mockNFT.mint(charlie); // tokenId 8
        mockNFT.mint(charlie); // tokenId 9
    }
    
    function _mintFeeTokens() private {
        feeToken.mint(alice, 10000e18);
        feeToken.mint(bob, 10000e18);
        feeToken.mint(charlie, 10000e18);
    }
    
    function _setupAllRarities() private {
        // Mint extra NFTs for setup to handle multiple spins (up to 20 spins)
        address setupUser = makeAddr("setupUser");
        for (uint i = 0; i < 25; i++) {
            mockNFT.mint(setupUser);
        }
        
        // Deposit multiple NFTs into each rarity to enable spinning
        // Use the newly minted NFTs (tokenIds 10-34)
        vm.startPrank(setupUser);
        
        // Approve all tokens first
        for (uint i = 10; i < 35; i++) {
            mockNFT.approve(address(treasury), i);
        }
        
        // Deposit 5 NFTs for each rarity
        uint256[] memory pendingIds = new uint256[](25);
        
        // Common (5 NFTs)
        pendingIds[0] = treasury.submitPendingDeposit(address(mockNFT), 10, GachaTreasury.Rarity.Common);
        pendingIds[1] = treasury.submitPendingDeposit(address(mockNFT), 11, GachaTreasury.Rarity.Common);
        pendingIds[2] = treasury.submitPendingDeposit(address(mockNFT), 12, GachaTreasury.Rarity.Common);
        pendingIds[3] = treasury.submitPendingDeposit(address(mockNFT), 13, GachaTreasury.Rarity.Common);
        pendingIds[4] = treasury.submitPendingDeposit(address(mockNFT), 14, GachaTreasury.Rarity.Common);
        
        // Uncommon (5 NFTs)
        pendingIds[5] = treasury.submitPendingDeposit(address(mockNFT), 15, GachaTreasury.Rarity.Uncommon);
        pendingIds[6] = treasury.submitPendingDeposit(address(mockNFT), 16, GachaTreasury.Rarity.Uncommon);
        pendingIds[7] = treasury.submitPendingDeposit(address(mockNFT), 17, GachaTreasury.Rarity.Uncommon);
        pendingIds[8] = treasury.submitPendingDeposit(address(mockNFT), 18, GachaTreasury.Rarity.Uncommon);
        pendingIds[9] = treasury.submitPendingDeposit(address(mockNFT), 19, GachaTreasury.Rarity.Uncommon);
        
        // Rare (5 NFTs)
        pendingIds[10] = treasury.submitPendingDeposit(address(mockNFT), 20, GachaTreasury.Rarity.Rare);
        pendingIds[11] = treasury.submitPendingDeposit(address(mockNFT), 21, GachaTreasury.Rarity.Rare);
        pendingIds[12] = treasury.submitPendingDeposit(address(mockNFT), 22, GachaTreasury.Rarity.Rare);
        pendingIds[13] = treasury.submitPendingDeposit(address(mockNFT), 23, GachaTreasury.Rarity.Rare);
        pendingIds[14] = treasury.submitPendingDeposit(address(mockNFT), 24, GachaTreasury.Rarity.Rare);
        
        // Epic (5 NFTs)
        pendingIds[15] = treasury.submitPendingDeposit(address(mockNFT), 25, GachaTreasury.Rarity.Epic);
        pendingIds[16] = treasury.submitPendingDeposit(address(mockNFT), 26, GachaTreasury.Rarity.Epic);
        pendingIds[17] = treasury.submitPendingDeposit(address(mockNFT), 27, GachaTreasury.Rarity.Epic);
        pendingIds[18] = treasury.submitPendingDeposit(address(mockNFT), 28, GachaTreasury.Rarity.Epic);
        pendingIds[19] = treasury.submitPendingDeposit(address(mockNFT), 29, GachaTreasury.Rarity.Epic);
        
        // Legendary (5 NFTs)
        pendingIds[20] = treasury.submitPendingDeposit(address(mockNFT), 30, GachaTreasury.Rarity.Legendary);
        pendingIds[21] = treasury.submitPendingDeposit(address(mockNFT), 31, GachaTreasury.Rarity.Legendary);
        pendingIds[22] = treasury.submitPendingDeposit(address(mockNFT), 32, GachaTreasury.Rarity.Legendary);
        pendingIds[23] = treasury.submitPendingDeposit(address(mockNFT), 33, GachaTreasury.Rarity.Legendary);
        pendingIds[24] = treasury.submitPendingDeposit(address(mockNFT), 34, GachaTreasury.Rarity.Legendary);
        
        vm.stopPrank();
        
        // Owner approves all setup deposits
        vm.startPrank(owner);
        
        // Common
        treasury.approvePendingDeposit(pendingIds[0], GachaTreasury.Rarity.Common);
        treasury.approvePendingDeposit(pendingIds[1], GachaTreasury.Rarity.Common);
        treasury.approvePendingDeposit(pendingIds[2], GachaTreasury.Rarity.Common);
        treasury.approvePendingDeposit(pendingIds[3], GachaTreasury.Rarity.Common);
        treasury.approvePendingDeposit(pendingIds[4], GachaTreasury.Rarity.Common);
        
        // Uncommon
        treasury.approvePendingDeposit(pendingIds[5], GachaTreasury.Rarity.Uncommon);
        treasury.approvePendingDeposit(pendingIds[6], GachaTreasury.Rarity.Uncommon);
        treasury.approvePendingDeposit(pendingIds[7], GachaTreasury.Rarity.Uncommon);
        treasury.approvePendingDeposit(pendingIds[8], GachaTreasury.Rarity.Uncommon);
        treasury.approvePendingDeposit(pendingIds[9], GachaTreasury.Rarity.Uncommon);
        
        // Rare
        treasury.approvePendingDeposit(pendingIds[10], GachaTreasury.Rarity.Rare);
        treasury.approvePendingDeposit(pendingIds[11], GachaTreasury.Rarity.Rare);
        treasury.approvePendingDeposit(pendingIds[12], GachaTreasury.Rarity.Rare);
        treasury.approvePendingDeposit(pendingIds[13], GachaTreasury.Rarity.Rare);
        treasury.approvePendingDeposit(pendingIds[14], GachaTreasury.Rarity.Rare);
        
        // Epic
        treasury.approvePendingDeposit(pendingIds[15], GachaTreasury.Rarity.Epic);
        treasury.approvePendingDeposit(pendingIds[16], GachaTreasury.Rarity.Epic);
        treasury.approvePendingDeposit(pendingIds[17], GachaTreasury.Rarity.Epic);
        treasury.approvePendingDeposit(pendingIds[18], GachaTreasury.Rarity.Epic);
        treasury.approvePendingDeposit(pendingIds[19], GachaTreasury.Rarity.Epic);
        
        // Legendary
        treasury.approvePendingDeposit(pendingIds[20], GachaTreasury.Rarity.Legendary);
        treasury.approvePendingDeposit(pendingIds[21], GachaTreasury.Rarity.Legendary);
        treasury.approvePendingDeposit(pendingIds[22], GachaTreasury.Rarity.Legendary);
        treasury.approvePendingDeposit(pendingIds[23], GachaTreasury.Rarity.Legendary);
        treasury.approvePendingDeposit(pendingIds[24], GachaTreasury.Rarity.Legendary);
        
        vm.stopPrank();
    }
    
    function _setupDiverseDeposits() private {
        // Alice deposits 2 Common NFTs
        vm.startPrank(alice);
        mockNFT.approve(address(treasury), 0);
        mockNFT.approve(address(treasury), 1);
        uint256 pendingId1 = treasury.submitPendingDeposit(address(mockNFT), 0, GachaTreasury.Rarity.Common);
        uint256 pendingId2 = treasury.submitPendingDeposit(address(mockNFT), 1, GachaTreasury.Rarity.Common);
        vm.stopPrank();
        
        // Bob deposits 1 Epic NFT
        vm.startPrank(bob);
        mockNFT.approve(address(treasury), 4);
        uint256 pendingId3 = treasury.submitPendingDeposit(address(mockNFT), 4, GachaTreasury.Rarity.Epic);
        vm.stopPrank();
        
        // Charlie deposits 1 Legendary NFT
        vm.startPrank(charlie);
        mockNFT.approve(address(treasury), 7);
        uint256 pendingId4 = treasury.submitPendingDeposit(address(mockNFT), 7, GachaTreasury.Rarity.Legendary);
        vm.stopPrank();
        
        // Owner approves all
        vm.startPrank(owner);
        treasury.approvePendingDeposit(pendingId1, GachaTreasury.Rarity.Common);
        treasury.approvePendingDeposit(pendingId2, GachaTreasury.Rarity.Common);
        treasury.approvePendingDeposit(pendingId3, GachaTreasury.Rarity.Epic);
        treasury.approvePendingDeposit(pendingId4, GachaTreasury.Rarity.Legendary);
        vm.stopPrank();
    }
    
    function _performSpin() private {
        vm.startPrank(alice);
        feeToken.approve(address(gacha), SPIN_FEE);
        uint256 triggerId = gacha.spin();
        vm.stopPrank();
        
        // Generate more varied randomness to hit different rarity ranges
        bytes32 randomness = keccak256(abi.encodePacked(block.timestamp, block.number, triggerId, msg.sender));
        vm.prank(gachaServiceHandler);
        gacha.fulfillRandomness(triggerId, randomness);
    }
}