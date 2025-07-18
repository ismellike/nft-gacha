// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Test} from "forge-std/Test.sol";
import {Gacha} from "../src/Gacha.sol";
import {GachaTreasury} from "../src/GachaTreasury.sol";
import {MockERC721} from "../src/MockERC721.sol";
import {ERC20Mock} from "@openzeppelin/contracts/mocks/token/ERC20Mock.sol";

contract GachaTest is Test {
    Gacha public gacha;
    GachaTreasury public treasury;
    MockERC721 public nft;
    ERC20Mock public feeToken;
    
    address public owner = address(0x1);
    address public user1 = address(0x2);
    address public user2 = address(0x3);
    
    uint256 public constant SPIN_FEE = 100 * 10**18; // 100 tokens

    function setUp() public {
        treasury = new GachaTreasury(owner);
        feeToken = new ERC20Mock();
        gacha = new Gacha(owner, address(treasury), address(feeToken), SPIN_FEE);
        nft = new MockERC721("TestNFT", "TNFT");
        
        // Setup treasury with some NFTs (owner deposits directly)
        _setupTreasuryWithNFTs();
        
        // Set gacha contract address in treasury so it can send NFTs to winners
        vm.prank(owner);
        treasury.setGachaContract(address(gacha));
        
        // Give users some fee tokens
        feeToken.mint(user1, 1000 * 10**18);
        feeToken.mint(user2, 1000 * 10**18);
    }

    function _setupTreasuryWithNFTs() private {
        vm.startPrank(owner);
        
        // Mint and deposit NFTs of different rarities directly to treasury
        for (uint i = 0; i < 10; i++) {
            uint256 tokenId = nft.mint(owner);
            nft.approve(address(treasury), tokenId);
            treasury.depositNFT(address(nft), tokenId, GachaTreasury.Rarity.Common);
        }
        
        for (uint i = 0; i < 5; i++) {
            uint256 tokenId = nft.mint(owner);
            nft.approve(address(treasury), tokenId);
            treasury.depositNFT(address(nft), tokenId, GachaTreasury.Rarity.Uncommon);
        }
        
        for (uint i = 0; i < 3; i++) {
            uint256 tokenId = nft.mint(owner);
            nft.approve(address(treasury), tokenId);
            treasury.depositNFT(address(nft), tokenId, GachaTreasury.Rarity.Rare);
        }
        
        for (uint i = 0; i < 2; i++) {
            uint256 tokenId = nft.mint(owner);
            nft.approve(address(treasury), tokenId);
            treasury.depositNFT(address(nft), tokenId, GachaTreasury.Rarity.Epic);
        }
        
        uint256 tokenId = nft.mint(owner);
        nft.approve(address(treasury), tokenId);
        treasury.depositNFT(address(nft), tokenId, GachaTreasury.Rarity.Legendary);
        
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
        emit RandomnessRequested(0);
        
        uint256 triggerId = gacha.spin();
        vm.stopPrank();
        
        assertEq(triggerId, 0);
        (address requester, bool fulfilled) = gacha.getSpinRequest(triggerId);
        assertEq(requester, user1);
        assertFalse(fulfilled);
        assertEq(feeToken.balanceOf(address(gacha)), SPIN_FEE);
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
        
        vm.prank(owner);
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
        vm.expectRevert();
        gacha.fulfillRandomness(triggerId, keccak256("test"));
    }

    function testFulfillRandomnessInvalidTriggerId() public {
        vm.prank(owner);
        vm.expectRevert("Gacha: Invalid trigger ID");
        gacha.fulfillRandomness(999, keccak256("test"));
    }

    function testFulfillRandomnessAlreadyFulfilled() public {
        vm.startPrank(user1);
        feeToken.approve(address(gacha), SPIN_FEE);
        uint256 triggerId = gacha.spin();
        vm.stopPrank();
        
        bytes32 randomness = keccak256("test_randomness");
        
        vm.startPrank(owner);
        gacha.fulfillRandomness(triggerId, randomness);
        
        vm.expectRevert("Gacha: Already fulfilled");
        gacha.fulfillRandomness(triggerId, randomness);
        vm.stopPrank();
    }

    function testSetSpinFee() public {
        uint256 newFee = 200 * 10**18;
        
        vm.prank(owner);
        vm.expectEmit(false, false, false, true);
        emit FeeUpdated(SPIN_FEE, newFee);
        gacha.setSpinFee(newFee);
        
        assertEq(gacha.spinFee(), newFee);
    }

    function testSetFeeToken() public {
        ERC20Mock newToken = new ERC20Mock();
        
        vm.prank(owner);
        vm.expectEmit(false, false, false, true);
        emit FeeTokenUpdated(address(feeToken), address(newToken));
        gacha.setFeeToken(address(newToken));
        
        assertEq(address(gacha.feeToken()), address(newToken));
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
        
        assertEq(feeToken.balanceOf(address(gacha)), 0);
        assertEq(feeToken.balanceOf(owner), ownerInitialBalance + SPIN_FEE);
    }

    function testGetRarityWeights() public view {
        (uint256 common, uint256 uncommon, uint256 rare, uint256 epic, uint256 legendary) = gacha.getRarityWeights();
        
        assertEq(common, 7000);  // 70%
        assertEq(uncommon, 2000); // 20%
        assertEq(rare, 600);      // 6%
        assertEq(epic, 300);      // 3%
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
        vm.expectRevert("Gacha: Weights must sum to TOTAL_WEIGHT");
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
        Gacha zeroFeeGacha = new Gacha(owner, address(treasury), address(0), 0);
        
        vm.prank(user1);
        uint256 triggerId = zeroFeeGacha.spin();
        
        assertEq(triggerId, 0);
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
        
        assertEq(triggerId1, 0);
        assertEq(triggerId2, 1);
        assertEq(triggerId3, 2);
        
        assertEq(feeToken.balanceOf(address(gacha)), SPIN_FEE * 3);
    }

    function testSpinBlockedWhenRarityEmpty() public {
        // Remove all common NFTs to test blocking
        vm.startPrank(owner);
        for (uint i = 0; i < 10; i++) {
            treasury.withdrawNFT(GachaTreasury.Rarity.Common, 0, owner);
        }
        vm.stopPrank();
        
        vm.startPrank(user1);
        feeToken.approve(address(gacha), SPIN_FEE);
        vm.expectRevert("Gacha: No Common NFTs available");
        gacha.spin();
        vm.stopPrank();
    }

    function testSpinAllowedWhenZeroWeightRarityEmpty() public {
        // Set common weight to 0 and remove all common NFTs
        vm.startPrank(owner);
        gacha.setRarityWeights(0, 6000, 2000, 1500, 500); // No common weight
        for (uint i = 0; i < 10; i++) {
            treasury.withdrawNFT(GachaTreasury.Rarity.Common, 0, owner);
        }
        vm.stopPrank();
        
        // Should be able to spin since common weight is 0
        vm.startPrank(user1);
        feeToken.approve(address(gacha), SPIN_FEE);
        uint256 triggerId = gacha.spin();
        vm.stopPrank();
        
        assertEq(triggerId, 0);
    }

    function testRefundWhenSelectedRarityEmpty() public {
        // First spin normally to get a triggerId
        vm.startPrank(user1);
        feeToken.approve(address(gacha), SPIN_FEE);
        uint256 triggerId = gacha.spin();
        vm.stopPrank();
        
        // Now remove the legendary NFT AFTER spinning but BEFORE fulfillment
        vm.startPrank(owner);
        treasury.withdrawNFT(GachaTreasury.Rarity.Legendary, 0, owner);
        vm.stopPrank();
        
        uint256 userInitialBalance = feeToken.balanceOf(user1);
        uint256 gachaInitialBalance = feeToken.balanceOf(address(gacha));
        
        // Use randomness that will select legendary (0-99 range for 1% legendary weight)
        bytes32 randomness = bytes32(uint256(50)); // Will select legendary
        
        vm.prank(owner);
        vm.expectEmit(true, true, false, true);
        emit SpinRefunded(triggerId, user1, GachaTreasury.Rarity.Legendary, SPIN_FEE);
        gacha.fulfillRandomness(triggerId, randomness);
        
        // Check refund was processed
        assertEq(feeToken.balanceOf(user1), userInitialBalance + SPIN_FEE);
        assertEq(feeToken.balanceOf(address(gacha)), gachaInitialBalance - SPIN_FEE);
        
        // Check request is still marked as fulfilled
        (, bool fulfilled) = gacha.getSpinRequest(triggerId);
        assertTrue(fulfilled);
    }

    function testRefundWithZeroFee() public {
        // Deploy gacha with zero fee
        Gacha zeroFeeGacha = new Gacha(owner, address(treasury), address(0), 0);
        
        vm.startPrank(owner);
        treasury.setGachaContract(address(zeroFeeGacha));
        vm.stopPrank();
        
        // First spin normally
        vm.prank(user1);
        uint256 triggerId = zeroFeeGacha.spin();
        
        // Now remove the legendary NFT AFTER spinning but BEFORE fulfillment
        vm.startPrank(owner);
        treasury.withdrawNFT(GachaTreasury.Rarity.Legendary, 0, owner);
        vm.stopPrank();
        
        // Use randomness that will select legendary
        bytes32 randomness = bytes32(uint256(50));
        
        vm.prank(owner);
        vm.expectEmit(true, true, false, true);
        emit SpinRefunded(triggerId, user1, GachaTreasury.Rarity.Legendary, 0);
        zeroFeeGacha.fulfillRandomness(triggerId, randomness);
        
        // No token transfers should occur with zero fee
        (, bool fulfilled) = zeroFeeGacha.getSpinRequest(triggerId);
        assertTrue(fulfilled);
    }

    event RandomnessRequested(uint256 indexed triggerId);
    event SpinCompleted(uint256 indexed triggerId, address indexed requester, GachaTreasury.Rarity rarity, address collection, uint256 tokenId);
    event SpinRefunded(uint256 indexed triggerId, address indexed requester, GachaTreasury.Rarity selectedRarity, uint256 refundAmount);
    event FeeUpdated(uint256 oldFee, uint256 newFee);
    event FeeTokenUpdated(address oldToken, address newToken);
    event RarityWeightsUpdated(uint256 common, uint256 uncommon, uint256 rare, uint256 epic, uint256 legendary);
}