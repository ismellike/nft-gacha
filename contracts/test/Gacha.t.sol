// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Test} from "forge-std/Test.sol";
import {Gacha} from "../src/gacha/Gacha.sol";
import {GachaTreasury} from "../src/gacha/GachaTreasury.sol";
import {GachaRewardsManager} from "../src/rewards/GachaRewardsManager.sol";
import {BaseERC721} from "../src/tokens/BaseERC721.sol";
import {BaseERC20} from "../src/tokens/BaseERC20.sol";
import {MockNFTAppraisal} from "./mocks/MockNFTAppraisal.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

contract GachaTest is Test {
    Gacha public gacha;
    GachaTreasury public treasury;
    BaseERC721 public nft;
    BaseERC20 public feeToken;
    MockNFTAppraisal public mockAppraisal;

    address public owner = address(0x1);
    address public user1 = address(0x2);
    address public user2 = address(0x3);

    uint256 public constant SPIN_FEE = 100 * 10 ** 18; // 100 tokens

    function setUp() public {
        feeToken = new BaseERC20("Fee Token", "FEE", address(this));

        // Simplified approach for testing - deploy in correct order
        vm.startPrank(owner);

        // Deploy mock appraisal contract
        mockAppraisal = new MockNFTAppraisal();

        // Deploy implementations and proxies
        GachaTreasury treasuryImpl = new GachaTreasury();
        GachaRewardsManager rewardsManagerImpl = new GachaRewardsManager();
        Gacha gachaImpl = new Gacha();

        // Deploy treasury proxy first (will update gacha address later)
        bytes memory treasuryInitData = abi.encodeWithSelector(
            GachaTreasury.initialize.selector,
            owner,
            address(0x998), // temp gacha address
            address(mockAppraisal)
        );
        ERC1967Proxy treasuryProxy = new ERC1967Proxy(address(treasuryImpl), treasuryInitData);
        treasury = GachaTreasury(address(treasuryProxy));

        // Deploy a temporary rewards manager proxy just to satisfy gacha constructor
        bytes memory tempRewardsManagerInitData = abi.encodeWithSelector(
            GachaRewardsManager.initialize.selector,
            owner,
            address(this), // temp gacha address
            address(treasury),
            address(mockAppraisal),
            owner,
            address(feeToken)
        );
        ERC1967Proxy tempRewardsManagerProxy = new ERC1967Proxy(address(rewardsManagerImpl), tempRewardsManagerInitData);
        GachaRewardsManager tempRewardsManager = GachaRewardsManager(address(tempRewardsManagerProxy));

        // Deploy gacha proxy with temp rewards manager (using test contract as service handler for simplicity)
        bytes memory gachaInitData = abi.encodeWithSelector(
            Gacha.initialize.selector,
            owner,
            address(this), // service handler
            address(feeToken),
            SPIN_FEE,
            address(treasury),
            address(tempRewardsManager)
        );
        ERC1967Proxy gachaProxy = new ERC1967Proxy(address(gachaImpl), gachaInitData);
        gacha = Gacha(address(gachaProxy));

        // Update treasury to recognize the real gacha contract
        treasury.setGachaContract(address(gacha));

        // Now deploy the real rewards manager proxy with the correct gacha address
        bytes memory rewardsManagerInitData = abi.encodeWithSelector(
            GachaRewardsManager.initialize.selector,
            owner,
            address(gacha),
            address(treasury),
            address(mockAppraisal),
            owner,
            address(feeToken)
        );
        ERC1967Proxy rewardsManagerProxy = new ERC1967Proxy(address(rewardsManagerImpl), rewardsManagerInitData);
        GachaRewardsManager rewardsManager = GachaRewardsManager(address(rewardsManagerProxy));

        // Update gacha to use the correct rewards manager
        gacha.setRewardsManager(address(rewardsManager));

        // Setup the rewards system
        treasury.setTreasuryRewardsManager(address(rewardsManager));
        vm.stopPrank();

        vm.prank(owner);
        nft = new BaseERC721("TestNFT", "TNFT", owner);

        // Setup treasury with some NFTs (owner deposits directly)
        _setupTreasuryWithNFTs();

        // Give users some fee tokens
        feeToken.mint(user1, 1000 * 10 ** 18);
        feeToken.mint(user2, 1000 * 10 ** 18);
    }

    function _setupTreasuryWithNFTs() private {
        vm.startPrank(owner);

        // First whitelist the NFT collection
        treasury.addToWhitelist(address(nft));

        // Mint and deposit NFTs of different rarities directly to treasury
        for (uint256 i = 0; i < 10; i++) {
            uint256 tokenId = nft.mint(owner);
            nft.approve(address(treasury), tokenId);
            // Set mock appraisal for Common rarity ($50)
            mockAppraisal.setMockAppraisal(address(nft), tokenId, 50 * 1e18);
            treasury.depositNFT(address(nft), tokenId);
        }

        for (uint256 i = 0; i < 5; i++) {
            uint256 tokenId = nft.mint(owner);
            nft.approve(address(treasury), tokenId);
            // Set mock appraisal for Uncommon rarity ($250)
            mockAppraisal.setMockAppraisal(address(nft), tokenId, 250 * 1e18);
            treasury.depositNFT(address(nft), tokenId);
        }

        for (uint256 i = 0; i < 3; i++) {
            uint256 tokenId = nft.mint(owner);
            nft.approve(address(treasury), tokenId);
            // Set mock appraisal for Rare rarity ($1000)
            mockAppraisal.setMockAppraisal(address(nft), tokenId, 1000 * 1e18);
            treasury.depositNFT(address(nft), tokenId);
        }

        for (uint256 i = 0; i < 2; i++) {
            uint256 tokenId = nft.mint(owner);
            nft.approve(address(treasury), tokenId);
            // Set mock appraisal for Epic rarity ($5000)
            mockAppraisal.setMockAppraisal(address(nft), tokenId, 5000 * 1e18);
            treasury.depositNFT(address(nft), tokenId);
        }

        uint256 tokenId = nft.mint(owner);
        nft.approve(address(treasury), tokenId);
        // Set mock appraisal for Legendary rarity ($15000)
        mockAppraisal.setMockAppraisal(address(nft), tokenId, 15000 * 1e18);
        treasury.depositNFT(address(nft), tokenId);

        vm.stopPrank();
    }

    function testDeployment() public view {
        assertEq(gacha.owner(), owner);
        assertEq(address(gacha.treasury()), address(treasury));
        assertEq(address(gacha.feeToken()), address(feeToken));
        assertEq(gacha.spinFee(), SPIN_FEE);
    }

    function testSpin() public {
        vm.startPrank(user1);
        feeToken.approve(address(gacha), SPIN_FEE);

        vm.expectEmit(true, false, false, false);
        emit RandomnessRequested(1);

        uint256 triggerId = gacha.spin();
        vm.stopPrank();

        assertEq(triggerId, 1, "First spin should have triggerId 1");
        (address requester, bool fulfilled) = gacha.getSpinRequest(triggerId);
        assertEq(requester, user1, "Requester should be user1");
        assertFalse(fulfilled, "Spin should not be fulfilled yet");
        // Exact fee amount: 100 tokens
        assertEq(feeToken.balanceOf(address(gacha)), 100e18, "Gacha should hold exactly 100 tokens");
    }

    function testSpinWithoutApproval() public {
        vm.startPrank(user1);
        vm.expectRevert();
        gacha.spin();
        vm.stopPrank();
    }

    function testSpinWithInsufficientBalance() public {
        vm.startPrank(user2);
        feeToken.approve(address(gacha), SPIN_FEE);
        // Transfer away tokens
        feeToken.transfer(user1, feeToken.balanceOf(user2));

        vm.expectRevert();
        gacha.spin();
        vm.stopPrank();
    }

    function testFulfillRandomness() public {
        // User spins
        vm.startPrank(user1);
        feeToken.approve(address(gacha), SPIN_FEE);
        uint256 triggerId = gacha.spin();
        vm.stopPrank();

        uint256 initialUserNFTBalance = nft.balanceOf(user1);
        bytes32 randomness = keccak256("test_randomness");

        // Call fulfillRandomness as the service handler (test contract)
        gacha.fulfillRandomness(triggerId, randomness);

        (address requester, bool fulfilled) = gacha.getSpinRequest(triggerId);
        assertEq(requester, user1);
        assertTrue(fulfilled);
        assertEq(nft.balanceOf(user1), initialUserNFTBalance + 1);
    }

    function testFulfillRandomnessOnlyOwner() public {
        vm.startPrank(user1);
        feeToken.approve(address(gacha), SPIN_FEE);
        uint256 triggerId = gacha.spin();
        vm.stopPrank();

        vm.prank(user2);
        vm.expectRevert(abi.encodeWithSelector(Gacha.UnauthorizedServiceHandler.selector));
        gacha.fulfillRandomness(triggerId, keccak256("test"));
    }

    function testFulfillRandomnessInvalidTriggerId() public {
        // Call as service handler (test contract)
        vm.expectRevert(abi.encodeWithSelector(Gacha.InvalidTriggerId.selector));
        gacha.fulfillRandomness(999, keccak256("test"));
    }

    function testFulfillRandomnessAlreadyFulfilled() public {
        vm.startPrank(user1);
        feeToken.approve(address(gacha), SPIN_FEE);
        uint256 triggerId = gacha.spin();
        vm.stopPrank();

        bytes32 randomness = keccak256("test_randomness");

        // Call as service handler (test contract)
        gacha.fulfillRandomness(triggerId, randomness);

        vm.expectRevert(abi.encodeWithSelector(Gacha.AlreadyFulfilled.selector));
        gacha.fulfillRandomness(triggerId, randomness);
    }

    function testSetSpinFee() public {
        uint256 newFee = 200 * 10 ** 18;

        vm.prank(owner);
        vm.expectEmit(false, false, false, true);
        emit FeeUpdated(SPIN_FEE, newFee);
        gacha.setSpinFee(newFee);

        assertEq(gacha.spinFee(), newFee);
    }

    function testWithdrawFees() public {
        // Generate some fees
        vm.startPrank(user1);
        feeToken.approve(address(gacha), SPIN_FEE);
        gacha.spin();
        vm.stopPrank();

        uint256 ownerInitialBalance = feeToken.balanceOf(owner);

        vm.prank(owner);
        gacha.withdrawFees(owner);

        assertEq(feeToken.balanceOf(address(gacha)), 0, "Gacha should have 0 tokens after withdrawal");
        // Exact amount: owner's initial balance + 100 tokens
        assertEq(feeToken.balanceOf(owner), ownerInitialBalance + 100e18, "Owner should receive exactly 100 tokens");
    }

    function testGetRarityWeights() public view {
        (uint256 common, uint256 uncommon, uint256 rare, uint256 epic, uint256 legendary) = gacha.getRarityWeights();

        assertEq(common, 7000); // 70%
        assertEq(uncommon, 2000); // 20%
        assertEq(rare, 600); // 6%
        assertEq(epic, 300); // 3%
        assertEq(legendary, 100); // 1%
        assertEq(common + uncommon + rare + epic + legendary, 10000);
    }

    function testSetRarityWeights() public {
        uint256 newCommon = 4000;
        uint256 newUncommon = 3000;
        uint256 newRare = 2000;
        uint256 newEpic = 800;
        uint256 newLegendary = 200;

        vm.prank(owner);
        vm.expectEmit(false, false, false, true);
        emit RarityWeightsUpdated(newCommon, newUncommon, newRare, newEpic, newLegendary);
        gacha.setRarityWeights(newCommon, newUncommon, newRare, newEpic, newLegendary);

        (uint256 common, uint256 uncommon, uint256 rare, uint256 epic, uint256 legendary) = gacha.getRarityWeights();
        assertEq(common, newCommon);
        assertEq(uncommon, newUncommon);
        assertEq(rare, newRare);
        assertEq(epic, newEpic);
        assertEq(legendary, newLegendary);
    }

    function testSetRarityWeightsOnlyOwner() public {
        vm.prank(user1);
        vm.expectRevert();
        gacha.setRarityWeights(4000, 3000, 2000, 800, 200);
    }

    function testSetRarityWeightsInvalidSum() public {
        vm.prank(owner);
        vm.expectRevert(abi.encodeWithSelector(Gacha.WeightsMustSumToTotal.selector));
        gacha.setRarityWeights(4000, 3000, 2000, 800, 300); // Sum = 10100 != 10000
    }

    function testSetRarityWeightsZeroLegendary() public {
        uint256 newCommon = 6000;
        uint256 newUncommon = 2500;
        uint256 newRare = 1500;
        uint256 newEpic = 0;
        uint256 newLegendary = 0;

        vm.prank(owner);
        gacha.setRarityWeights(newCommon, newUncommon, newRare, newEpic, newLegendary);

        (uint256 common, uint256 uncommon, uint256 rare, uint256 epic, uint256 legendary) = gacha.getRarityWeights();
        assertEq(common, newCommon);
        assertEq(uncommon, newUncommon);
        assertEq(rare, newRare);
        assertEq(epic, newEpic);
        assertEq(legendary, newLegendary);
    }

    function testSpinWithZeroFee() public {
        // Deploy gacha with zero fee
        // Deploy minimal treasury and rewards manager for zero fee test
        GachaTreasury zeroTreasuryImpl = new GachaTreasury();
        GachaRewardsManager zeroRewardsImpl = new GachaRewardsManager();
        Gacha zeroFeeGachaImpl = new Gacha();

        vm.startPrank(owner);
        bytes memory zeroTreasuryInitData = abi.encodeWithSelector(
            GachaTreasury.initialize.selector,
            owner,
            address(0x997),
            address(mockAppraisal)
        );
        ERC1967Proxy zeroTreasuryProxy = new ERC1967Proxy(address(zeroTreasuryImpl), zeroTreasuryInitData);
        GachaTreasury zeroTreasury = GachaTreasury(address(zeroTreasuryProxy));

        bytes memory zeroRewardsInitData = abi.encodeWithSelector(
            GachaRewardsManager.initialize.selector,
            owner,
            address(0x997),
            address(zeroTreasury),
            address(mockAppraisal),
            owner,
            address(feeToken)
        );
        ERC1967Proxy zeroRewardsProxy = new ERC1967Proxy(address(zeroRewardsImpl), zeroRewardsInitData);
        GachaRewardsManager zeroRewards = GachaRewardsManager(address(zeroRewardsProxy));

        bytes memory zeroFeeGachaInitData = abi.encodeWithSelector(
            Gacha.initialize.selector,
            owner,
            owner,
            address(0),
            0,
            address(zeroTreasury),
            address(zeroRewards)
        );
        ERC1967Proxy zeroFeeGachaProxy = new ERC1967Proxy(address(zeroFeeGachaImpl), zeroFeeGachaInitData);
        Gacha zeroFeeGacha = Gacha(address(zeroFeeGachaProxy));
        vm.stopPrank();
        GachaTreasury zeroFeeGachaTreasury = zeroTreasury;

        // Setup treasury for zero fee gacha with some NFTs and set weights to only Common
        vm.startPrank(owner);
        // First whitelist the NFT collection
        zeroFeeGachaTreasury.addToWhitelist(address(nft));
        for (uint256 i = 0; i < 5; i++) {
            uint256 tokenId = nft.mint(owner);
            nft.approve(address(zeroFeeGachaTreasury), tokenId);
            mockAppraisal.setMockAppraisal(address(nft), tokenId, 50 * 1e18);
            zeroFeeGachaTreasury.depositNFT(address(nft), tokenId);
        }
        // Set weights to only Common (100%)
        zeroFeeGacha.setRarityWeights(10000, 0, 0, 0, 0);
        vm.stopPrank();

        vm.prank(user1);
        uint256 triggerId = zeroFeeGacha.spin();

        assertEq(triggerId, 1);
        (address requester, bool fulfilled) = zeroFeeGacha.getSpinRequest(triggerId);
        assertEq(requester, user1);
        assertFalse(fulfilled);
    }

    function testMultipleSpins() public {
        vm.startPrank(user1);
        feeToken.approve(address(gacha), SPIN_FEE * 3);

        uint256 triggerId1 = gacha.spin();
        uint256 triggerId2 = gacha.spin();
        uint256 triggerId3 = gacha.spin();
        vm.stopPrank();

        assertEq(triggerId1, 1, "First spin should have triggerId 1");
        assertEq(triggerId2, 2, "Second spin should have triggerId 2");
        assertEq(triggerId3, 3, "Third spin should have triggerId 3");

        // Exact fee calculation: 3 * 100 = 300 tokens
        assertEq(feeToken.balanceOf(address(gacha)), 300e18, "Gacha should hold exactly 300 tokens from 3 spins");
    }

    function testSpinBlockedWhenRarityEmpty() public {
        // Remove all common NFTs to test blocking - owner withdraws their own NFTs
        vm.startPrank(owner);
        // Get the common NFTs that owner deposited (token IDs 0-9)
        for (uint256 tokenId = 0; tokenId < 10; tokenId++) {
            treasury.withdrawMyNFT(address(nft), tokenId);
        }
        vm.stopPrank();

        vm.startPrank(user1);
        feeToken.approve(address(gacha), SPIN_FEE);
        vm.expectRevert(abi.encodeWithSelector(Gacha.NoNFTsAvailable.selector, GachaTreasury.Rarity.Common));
        gacha.spin();
        vm.stopPrank();
    }

    function testSpinAllowedWhenZeroWeightRarityEmpty() public {
        // Set common weight to 0 and remove all common NFTs - owner withdraws their own NFTs
        vm.startPrank(owner);
        gacha.setRarityWeights(0, 6000, 2000, 1500, 500); // No common weight
        // Get the common NFTs that owner deposited (token IDs 0-9)
        for (uint256 tokenId = 0; tokenId < 10; tokenId++) {
            treasury.withdrawMyNFT(address(nft), tokenId);
        }
        vm.stopPrank();

        // Should be able to spin since common weight is 0
        vm.startPrank(user1);
        feeToken.approve(address(gacha), SPIN_FEE);
        uint256 triggerId = gacha.spin();
        vm.stopPrank();

        assertEq(triggerId, 1);
    }

    function testRefundWhenSelectedRarityEmpty() public {
        // First spin normally to get a triggerId
        vm.startPrank(user1);
        feeToken.approve(address(gacha), SPIN_FEE);
        uint256 triggerId = gacha.spin();
        vm.stopPrank();

        // Now remove the legendary NFT AFTER spinning but BEFORE fulfillment - owner withdraws their own NFT
        vm.startPrank(owner);
        treasury.withdrawMyNFT(address(nft), 20); // Legendary NFT is token ID 20
        vm.stopPrank();

        uint256 userInitialBalance = feeToken.balanceOf(user1);
        uint256 gachaInitialBalance = feeToken.balanceOf(address(gacha));

        // Use randomness that will select legendary (9900-9999 range for 1% legendary weight)
        bytes32 randomness = bytes32(uint256(9950)); // Will select legendary

        // Call as service handler (test contract)
        vm.expectEmit(true, true, false, true);
        emit SpinRefunded(triggerId, user1, GachaTreasury.Rarity.Legendary, 100e18);
        gacha.fulfillRandomness(triggerId, randomness);

        // Check exact refund amounts
        assertEq(feeToken.balanceOf(user1), userInitialBalance + 100e18, "User should be refunded exactly 100 tokens");
        assertEq(
            feeToken.balanceOf(address(gacha)),
            gachaInitialBalance - 100e18,
            "Gacha balance should decrease by exactly 100 tokens"
        );

        // Check request is still marked as fulfilled
        (, bool fulfilled) = gacha.getSpinRequest(triggerId);
        assertTrue(fulfilled, "Request should be marked as fulfilled even after refund");
    }

    function testRefundWithZeroFee() public {
        // Deploy gacha with zero fee
        // Deploy minimal treasury and rewards manager for zero fee test
        GachaTreasury zeroTreasury2Impl = new GachaTreasury();
        GachaRewardsManager zeroRewards2Impl = new GachaRewardsManager();
        Gacha zeroFeeGachaImpl = new Gacha();

        vm.startPrank(owner);
        bytes memory zeroTreasury2InitData = abi.encodeWithSelector(
            GachaTreasury.initialize.selector,
            owner,
            address(0x996),
            address(mockAppraisal)
        );
        ERC1967Proxy zeroTreasury2Proxy = new ERC1967Proxy(address(zeroTreasury2Impl), zeroTreasury2InitData);
        GachaTreasury zeroTreasury2 = GachaTreasury(address(zeroTreasury2Proxy));

        bytes memory zeroRewards2InitData = abi.encodeWithSelector(
            GachaRewardsManager.initialize.selector,
            owner,
            address(0x996),
            address(zeroTreasury2),
            address(mockAppraisal),
            owner,
            address(feeToken)
        );
        ERC1967Proxy zeroRewards2Proxy = new ERC1967Proxy(address(zeroRewards2Impl), zeroRewards2InitData);
        GachaRewardsManager zeroRewards2 = GachaRewardsManager(address(zeroRewards2Proxy));

        bytes memory zeroFeeGacha2InitData = abi.encodeWithSelector(
            Gacha.initialize.selector,
            owner,
            owner,
            address(0),
            0,
            address(zeroTreasury2),
            address(zeroRewards2)
        );
        ERC1967Proxy zeroFeeGacha2Proxy = new ERC1967Proxy(address(zeroFeeGachaImpl), zeroFeeGacha2InitData);
        Gacha zeroFeeGacha = Gacha(address(zeroFeeGacha2Proxy));
        vm.stopPrank();
        GachaTreasury zeroFeeGachaTreasury = zeroTreasury2;

        // Setup treasury for zero fee gacha with some NFTs and set weights to only Common
        vm.startPrank(owner);
        // First whitelist the NFT collection
        zeroFeeGachaTreasury.addToWhitelist(address(nft));
        for (uint256 i = 0; i < 5; i++) {
            uint256 tokenId = nft.mint(owner);
            nft.approve(address(zeroFeeGachaTreasury), tokenId);
            mockAppraisal.setMockAppraisal(address(nft), tokenId, 50 * 1e18);
            zeroFeeGachaTreasury.depositNFT(address(nft), tokenId);
        }
        // Set weights to only Common (100%)
        zeroFeeGacha.setRarityWeights(10000, 0, 0, 0, 0);
        vm.stopPrank();

        // First spin normally
        vm.prank(user1);
        uint256 triggerId = zeroFeeGacha.spin();

        // Now remove all common NFTs AFTER spinning but BEFORE fulfillment - owner withdraws their own NFTs
        vm.startPrank(owner);
        // Zero fee test uses token IDs 21-25 (5 NFTs minted specifically for this test)
        for (uint256 tokenId = 21; tokenId < 26; tokenId++) {
            zeroFeeGachaTreasury.withdrawMyNFT(address(nft), tokenId);
        }
        vm.stopPrank();

        // Use any randomness since 100% weight is on Common
        bytes32 randomness = bytes32(uint256(5000));

        vm.prank(owner);
        vm.expectEmit(true, true, false, true);
        emit SpinRefunded(triggerId, user1, GachaTreasury.Rarity.Common, 0);
        zeroFeeGacha.fulfillRandomness(triggerId, randomness);

        // No token transfers should occur with zero fee
        (, bool fulfilled) = zeroFeeGacha.getSpinRequest(triggerId);
        assertTrue(fulfilled);
    }

    event RandomnessRequested(uint256 indexed triggerId);
    event SpinStatusUpdate(uint256 indexed triggerId, address indexed requester, string status, uint256 timestamp);
    event SpinCompleted(
        uint256 indexed triggerId,
        address indexed requester,
        GachaTreasury.Rarity rarity,
        address collection,
        uint256 tokenId
    );
    event SpinRefunded(
        uint256 indexed triggerId, address indexed requester, GachaTreasury.Rarity selectedRarity, uint256 refundAmount
    );
    event SpinReclaimed(uint256 indexed triggerId, address indexed requester, uint256 refundAmount);
    event FeeUpdated(uint256 oldFee, uint256 newFee);
    event FeeTokenUpdated(address oldToken, address newToken);
    event RarityWeightsUpdated(uint256 common, uint256 uncommon, uint256 rare, uint256 epic, uint256 legendary);

    function testReclaimFailedSpin() public {
        // Setup user with exact spin fee amount
        feeToken.mint(user1, SPIN_FEE);
        vm.startPrank(user1);
        feeToken.approve(address(gacha), SPIN_FEE);

        // Record initial balances
        uint256 userInitialBalance = feeToken.balanceOf(user1);
        uint256 gachaInitialBalance = feeToken.balanceOf(address(gacha));

        // Start a spin
        uint256 triggerId = gacha.spin();

        // Check that the user's balance is reduced by spin fee
        assertEq(feeToken.balanceOf(user1), userInitialBalance - SPIN_FEE);
        assertEq(feeToken.balanceOf(address(gacha)), gachaInitialBalance + SPIN_FEE);

        // User reclaims the failed spin
        vm.expectEmit(true, true, false, true);
        emit SpinReclaimed(triggerId, user1, SPIN_FEE);
        gacha.reclaimFailedSpin(triggerId);

        // Check that fee is refunded and request is marked as fulfilled
        assertEq(feeToken.balanceOf(user1), userInitialBalance);
        assertEq(feeToken.balanceOf(address(gacha)), gachaInitialBalance);

        (, bool fulfilled) = gacha.getSpinRequest(triggerId);
        assertTrue(fulfilled);

        vm.stopPrank();
    }

    function testReclaimFailedSpinPreventsLateFulfillment() public {
        // Setup user with tokens
        feeToken.mint(user1, SPIN_FEE);
        vm.startPrank(user1);
        feeToken.approve(address(gacha), SPIN_FEE);

        // Start a spin
        uint256 triggerId = gacha.spin();

        // User reclaims the failed spin
        gacha.reclaimFailedSpin(triggerId);
        vm.stopPrank();

        // Try to fulfill the reclaimed spin (should fail)
        bytes32 randomness = bytes32(uint256(5000));
        vm.expectRevert(abi.encodeWithSelector(Gacha.AlreadyFulfilled.selector));
        gacha.fulfillRandomness(triggerId, randomness);
    }

    function testReclaimFailedSpinOnlyByOriginalRequester() public {
        // Setup user1 with tokens
        feeToken.mint(user1, SPIN_FEE);
        vm.startPrank(user1);
        feeToken.approve(address(gacha), SPIN_FEE);

        // Start a spin
        uint256 triggerId = gacha.spin();
        vm.stopPrank();

        // user2 tries to reclaim user1's spin (should fail)
        vm.prank(user2);
        vm.expectRevert(abi.encodeWithSelector(Gacha.NotSpinRequester.selector));
        gacha.reclaimFailedSpin(triggerId);
    }

    function testCannotReclaimAlreadyFulfilledSpin() public {
        // Setup user with tokens
        feeToken.mint(user1, SPIN_FEE);
        vm.startPrank(user1);
        feeToken.approve(address(gacha), SPIN_FEE);

        // Start a spin
        uint256 triggerId = gacha.spin();
        vm.stopPrank();

        // Fulfill the spin first
        bytes32 randomness = bytes32(uint256(5000));
        gacha.fulfillRandomness(triggerId, randomness);

        // Try to reclaim already fulfilled spin (should fail)
        vm.prank(user1);
        vm.expectRevert(abi.encodeWithSelector(Gacha.CannotReclaimFulfilledSpin.selector));
        gacha.reclaimFailedSpin(triggerId);
    }

    function testUserSpinCountIncrement() public {
        // Setup users with tokens
        feeToken.mint(user1, SPIN_FEE * 3);
        vm.startPrank(user1);
        feeToken.approve(address(gacha), SPIN_FEE * 3);
        vm.stopPrank();

        feeToken.mint(user2, SPIN_FEE * 2);
        vm.startPrank(user2);
        feeToken.approve(address(gacha), SPIN_FEE * 2);
        vm.stopPrank();

        // Initial spin counts should be 0
        assertEq(gacha.getUserSpinCount(user1), 0);
        assertEq(gacha.getUserSpinCount(user2), 0);

        // User1 performs 3 spins
        vm.startPrank(user1);
        uint256 trigger1 = gacha.spin();
        uint256 trigger2 = gacha.spin();
        uint256 trigger3 = gacha.spin();
        vm.stopPrank();

        // User2 performs 2 spins
        vm.startPrank(user2);
        uint256 trigger4 = gacha.spin();
        uint256 trigger5 = gacha.spin();
        vm.stopPrank();

        // Spin counts should still be 0 before fulfillment
        assertEq(gacha.getUserSpinCount(user1), 0);
        assertEq(gacha.getUserSpinCount(user2), 0);

        // Fulfill user1's spins
        bytes32 randomness = bytes32(uint256(5000));
        gacha.fulfillRandomness(trigger1, randomness);
        assertEq(gacha.getUserSpinCount(user1), 1);

        gacha.fulfillRandomness(trigger2, randomness);
        assertEq(gacha.getUserSpinCount(user1), 2);

        gacha.fulfillRandomness(trigger3, randomness);
        assertEq(gacha.getUserSpinCount(user1), 3);

        // User2 should still have 0 spins
        assertEq(gacha.getUserSpinCount(user2), 0);

        // Fulfill user2's spins
        gacha.fulfillRandomness(trigger4, randomness);
        assertEq(gacha.getUserSpinCount(user2), 1);

        gacha.fulfillRandomness(trigger5, randomness);
        assertEq(gacha.getUserSpinCount(user2), 2);

        // Final check - user1 should still have 3, user2 should have 2
        assertEq(gacha.getUserSpinCount(user1), 3);
        assertEq(gacha.getUserSpinCount(user2), 2);
    }

    function testComprehensiveAnalytics() public {
        // Setup user with tokens
        feeToken.mint(user1, SPIN_FEE * 5);
        vm.startPrank(user1);
        feeToken.approve(address(gacha), SPIN_FEE * 5);
        vm.stopPrank();

        // Initial analytics should be all zeros
        (uint256 totalSpins, uint256 totalRefunds, uint256 totalReclaims, uint256[5] memory rarityWins) =
            gacha.getUserAnalytics(user1);
        assertEq(totalSpins, 0);
        assertEq(totalRefunds, 0);
        assertEq(totalReclaims, 0);
        for (uint256 i = 0; i < 5; i++) {
            assertEq(rarityWins[i], 0);
        }

        // Perform multiple spins
        vm.startPrank(user1);
        uint256 trigger1 = gacha.spin();
        uint256 trigger2 = gacha.spin();
        uint256 trigger3 = gacha.spin();
        vm.stopPrank();

        // Fulfill some spins (with different rarities based on randomness)
        // Default weights: Common (0-6999), Uncommon (7000-8999), Rare (9000-9599), Epic (9600-9899), Legendary (9900-9999)
        gacha.fulfillRandomness(trigger1, bytes32(uint256(1000))); // Should be common (1000 < 7000)
        gacha.fulfillRandomness(trigger2, bytes32(uint256(9100))); // Should be rare (9000 <= 9100 < 9600)
        gacha.fulfillRandomness(trigger3, bytes32(uint256(9700))); // Should be epic (9600 <= 9700 < 9900)

        // Check analytics after fulfillment
        (totalSpins, totalRefunds, totalReclaims, rarityWins) = gacha.getUserAnalytics(user1);
        assertEq(totalSpins, 3, "Should have 3 completed spins");
        assertEq(totalRefunds, 0, "Should have 0 refunds");
        assertEq(totalReclaims, 0, "Should have 0 reclaims");

        // Should have wins in different rarities
        assertEq(rarityWins[0], 1, "Should have 1 common win");
        assertEq(rarityWins[1], 0, "Should have 0 uncommon wins");
        assertEq(rarityWins[2], 1, "Should have 1 rare win");
        assertEq(rarityWins[3], 1, "Should have 1 epic win");
        assertEq(rarityWins[4], 0, "Should have 0 legendary wins");

        // Check global analytics
        (uint256 globalSpins, uint256 globalRefunds, uint256 globalReclaims, uint256[5] memory globalRarityWinCounts) =
            gacha.getGlobalAnalytics();
        assertEq(globalSpins, 3, "Global spins should be 3");
        assertEq(globalRefunds, 0, "Global refunds should be 0");
        assertEq(globalReclaims, 0, "Global reclaims should be 0");
        assertEq(globalRarityWinCounts[0], 1, "Global common wins should be 1");
        assertEq(globalRarityWinCounts[2], 1, "Global rare wins should be 1");
        assertEq(globalRarityWinCounts[3], 1, "Global epic wins should be 1");

        // Test reclaim functionality
        vm.startPrank(user1);
        uint256 trigger4 = gacha.spin();
        vm.stopPrank();

        // Reclaim the spin (simulate timeout)
        vm.prank(user1);
        gacha.reclaimFailedSpin(trigger4);

        // Check updated analytics
        (totalSpins, totalRefunds, totalReclaims,) = gacha.getUserAnalytics(user1);
        assertEq(totalSpins, 3, "Spins should still be 3 (reclaim doesn't count as completed)");
        assertEq(totalReclaims, 1, "Should have 1 reclaim");

        // Check global analytics after reclaim
        (globalSpins, globalRefunds, globalReclaims,) = gacha.getGlobalAnalytics();
        assertEq(globalSpins, 3, "Global spins should still be 3");
        assertEq(globalReclaims, 1, "Global reclaims should be 1");
    }
}
