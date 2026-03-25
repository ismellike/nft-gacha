// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {StandardTest} from "../../helpers/StandardTest.sol";
import {TestConstants} from "../../helpers/TestConstants.sol";
import {GachaTreasury} from "../../../src/gacha/GachaTreasury.sol";
import {BaseERC721} from "../../../src/tokens/BaseERC721.sol";
import {BaseERC20} from "../../../src/tokens/BaseERC20.sol";
import {MockNFTAppraisal} from "../../mocks/MockNFTAppraisal.sol";
import {MockCardGroupedVault} from "../../mocks/MockCardGroupedVault.sol";

/**
 * @title cardCurrentRarity Mapping Test Suite
 * @notice Tests the O(1) card-level rarity lookup: set on deposit, updated on migration,
 *         read by onCardPriceUpdated.
 */
contract CardCurrentRarityTest is StandardTest {
    using TestConstants for *;

    GachaTreasury public treasury;
    BaseERC721 public nft;
    BaseERC20 public feeToken;
    MockNFTAppraisal public mockAppraisal;
    MockCardGroupedVault public mockVault;

    bytes32 public constant SHARED_CARD_ID = keccak256("shared-card");

    event RarityMigrated(
        address indexed collection, uint256 indexed tokenId, uint8 fromRarity, uint8 toRarity, uint256 newPrice
    );

    function setUp() public {
        mockAppraisal = new MockNFTAppraisal();
        feeToken = new BaseERC20("USDC", "USDC", owner);

        treasury = _deployTreasury(owner, gachaContract, address(mockAppraisal));

        // Deploy mock vault and wire it up
        mockVault = new MockCardGroupedVault(address(feeToken));
        vm.prank(owner);
        treasury.setCardGroupedVault(address(mockVault));

        nft = new BaseERC721("TestNFT", "TNFT", owner);

        // Whitelist collection
        vm.prank(owner);
        treasury.addToWhitelist(address(nft));
    }

    // ========================================================================
    // cardCurrentRarity SET ON DEPOSIT
    // ========================================================================

    function testCardCurrentRaritySetOnDeposit_Common() public {
        uint256 tokenId = _depositWithSharedCard(TestConstants.COMMON_PRICE);
        assertEq(treasury.cardCurrentRarity(SHARED_CARD_ID), TestConstants.COMMON, "Should be Common after deposit");
    }

    function testCardCurrentRaritySetOnDeposit_Uncommon() public {
        uint256 tokenId = _depositWithSharedCard(TestConstants.UNCOMMON_PRICE);
        assertEq(treasury.cardCurrentRarity(SHARED_CARD_ID), TestConstants.UNCOMMON, "Should be Uncommon after deposit");
    }

    function testCardCurrentRaritySetOnDeposit_Rare() public {
        uint256 tokenId = _depositWithSharedCard(TestConstants.RARE_PRICE);
        assertEq(treasury.cardCurrentRarity(SHARED_CARD_ID), TestConstants.RARE, "Should be Rare after deposit");
    }

    function testCardCurrentRaritySetOnDeposit_Epic() public {
        uint256 tokenId = _depositWithSharedCard(TestConstants.EPIC_PRICE);
        assertEq(treasury.cardCurrentRarity(SHARED_CARD_ID), TestConstants.EPIC, "Should be Epic after deposit");
    }

    function testCardCurrentRaritySetOnDeposit_Legendary() public {
        uint256 tokenId = _depositWithSharedCard(TestConstants.LEGENDARY_PRICE);
        assertEq(
            treasury.cardCurrentRarity(SHARED_CARD_ID), TestConstants.LEGENDARY, "Should be Legendary after deposit"
        );
    }

    function testCardCurrentRarityOverwrittenBySubsequentDeposit() public {
        // Deposit first token as Common
        _depositWithSharedCard(TestConstants.COMMON_PRICE);
        assertEq(treasury.cardCurrentRarity(SHARED_CARD_ID), TestConstants.COMMON);

        // Deposit second token with same cardId — _trackDeposit always writes
        _depositWithSharedCard(TestConstants.COMMON_PRICE);
        assertEq(treasury.cardCurrentRarity(SHARED_CARD_ID), TestConstants.COMMON, "Should still be Common");
    }

    // ========================================================================
    // cardCurrentRarity UPDATED ON PRICE-CHANGE MIGRATION
    // ========================================================================

    function testCardCurrentRarityUpdatedOnRarityMigration() public {
        // Deposit as Common
        _depositWithSharedCard(TestConstants.COMMON_PRICE);
        assertEq(treasury.cardCurrentRarity(SHARED_CARD_ID), TestConstants.COMMON);

        // Trigger price update that changes rarity: Common -> Epic
        mockAppraisal.setMockAppraisalWithCardId(address(nft), 1, SHARED_CARD_ID, TestConstants.EPIC_PRICE);

        vm.prank(address(mockAppraisal));
        treasury.onCardPriceUpdated(SHARED_CARD_ID, TestConstants.EPIC_PRICE);

        assertEq(treasury.cardCurrentRarity(SHARED_CARD_ID), TestConstants.EPIC, "Should migrate to Epic");
    }

    function testCardCurrentRarityUnchangedOnSameRarityPriceUpdate() public {
        // Deposit as Common at 10e18
        _depositWithSharedCard(TestConstants.COMMON_PRICE);
        assertEq(treasury.cardCurrentRarity(SHARED_CARD_ID), TestConstants.COMMON);

        // Price update within Common range (still Common)
        uint256 newCommonPrice = 5e18; // Still in Common range (0-15)
        mockAppraisal.setMockAppraisalWithCardId(address(nft), 1, SHARED_CARD_ID, newCommonPrice);

        vm.prank(address(mockAppraisal));
        treasury.onCardPriceUpdated(SHARED_CARD_ID, newCommonPrice);

        assertEq(treasury.cardCurrentRarity(SHARED_CARD_ID), TestConstants.COMMON, "Should remain Common");
        // Vault should get updateCardPrice, not migrateCardRarity
        assertEq(mockVault.getPriceUpdateCallCount(), 1, "Should have called updateCardPrice");
        assertEq(mockVault.getMigrateCallCount(), 0, "Should NOT have called migrateCardRarity");
    }

    function testMigrationUpdatesMultipleTokensOfSameCard() public {
        // Deposit two tokens with same card as Common
        _depositWithSharedCard(TestConstants.COMMON_PRICE);
        _depositWithSharedCard(TestConstants.COMMON_PRICE);

        assertEq(treasury.getRarityCount(TestConstants.COMMON), 2, "2 Common tokens");
        assertEq(treasury.getRarityCount(TestConstants.RARE), 0, "0 Rare tokens");

        // Migrate Common -> Rare
        mockAppraisal.setMockAppraisalWithCardId(address(nft), 1, SHARED_CARD_ID, TestConstants.RARE_PRICE);

        vm.prank(address(mockAppraisal));
        treasury.onCardPriceUpdated(SHARED_CARD_ID, TestConstants.RARE_PRICE);

        assertEq(treasury.cardCurrentRarity(SHARED_CARD_ID), TestConstants.RARE, "Card rarity should be Rare");
        assertEq(treasury.getRarityCount(TestConstants.COMMON), 0, "0 Common tokens after migration");
        assertEq(treasury.getRarityCount(TestConstants.RARE), 2, "2 Rare tokens after migration");
    }

    // ========================================================================
    // onCardPriceUpdated READS cardCurrentRarity (O(1) lookup)
    // ========================================================================

    function testOnCardPriceUpdatedReadsCardCurrentRarity() public {
        // Deposit as Common
        _depositWithSharedCard(TestConstants.COMMON_PRICE);

        // Migrate Common -> Legendary
        mockAppraisal.setMockAppraisalWithCardId(address(nft), 1, SHARED_CARD_ID, TestConstants.LEGENDARY_PRICE);

        vm.prank(address(mockAppraisal));
        treasury.onCardPriceUpdated(SHARED_CARD_ID, TestConstants.LEGENDARY_PRICE);

        assertEq(treasury.cardCurrentRarity(SHARED_CARD_ID), TestConstants.LEGENDARY);

        // Now update price within Legendary (vault should get updateCardPrice)
        uint256 higherLegendary = 3000e18;
        mockAppraisal.setMockAppraisalWithCardId(address(nft), 1, SHARED_CARD_ID, higherLegendary);

        vm.prank(address(mockAppraisal));
        treasury.onCardPriceUpdated(SHARED_CARD_ID, higherLegendary);

        assertEq(treasury.cardCurrentRarity(SHARED_CARD_ID), TestConstants.LEGENDARY, "Still Legendary");
        assertEq(mockVault.getPriceUpdateCallCount(), 1, "updateCardPrice called for same-rarity update");
    }

    function testOnCardPriceUpdatedRevertsForNonAppraisalCaller() public {
        _depositWithSharedCard(TestConstants.COMMON_PRICE);

        vm.prank(user);
        vm.expectRevert(abi.encodeWithSelector(GachaTreasury.InvalidAppraisalContract.selector));
        treasury.onCardPriceUpdated(SHARED_CARD_ID, TestConstants.EPIC_PRICE);
    }

    function testOnCardPriceUpdatedNoOpWhenNoDeposits() public {
        // Card has no deposits — should silently return
        vm.prank(address(mockAppraisal));
        treasury.onCardPriceUpdated(SHARED_CARD_ID, TestConstants.EPIC_PRICE);

        // No vault calls
        assertEq(mockVault.getPriceUpdateCallCount(), 0);
        assertEq(mockVault.getMigrateCallCount(), 0);
    }

    function testOnCardPriceUpdatedNoOpWhenVaultNotSet() public {
        // Deploy a treasury without vault
        GachaTreasury treasuryNoVault = _deployTreasury(owner, gachaContract, address(mockAppraisal));
        BaseERC721 nft2 = new BaseERC721("NFT2", "N2", owner);

        vm.startPrank(owner);
        treasuryNoVault.addToWhitelist(address(nft2));
        vm.stopPrank();

        // Deposit an NFT
        uint256 tokenId;
        vm.startPrank(owner);
        tokenId = nft2.mint(owner);
        nft2.approve(address(treasuryNoVault), tokenId);
        mockAppraisal.setMockAppraisalWithCardId(address(nft2), tokenId, SHARED_CARD_ID, TestConstants.COMMON_PRICE);
        treasuryNoVault.depositNFT(address(nft2), tokenId);
        vm.stopPrank();

        // onCardPriceUpdated should return early (no vault)
        vm.prank(address(mockAppraisal));
        treasuryNoVault.onCardPriceUpdated(SHARED_CARD_ID, TestConstants.EPIC_PRICE);
        // No revert = success
    }

    // ========================================================================
    // EDGE CASES
    // ========================================================================

    function testCardCurrentRarityDefaultsToZeroForUnknownCard() public view {
        bytes32 unknownCard = keccak256("unknown-card");
        assertEq(treasury.cardCurrentRarity(unknownCard), 0, "Default should be 0");
    }

    function testRarityMigrationEmitsEvents() public {
        uint256 tokenId = _depositWithSharedCard(TestConstants.COMMON_PRICE);

        mockAppraisal.setMockAppraisalWithCardId(address(nft), tokenId, SHARED_CARD_ID, TestConstants.EPIC_PRICE);

        vm.expectEmit(true, true, false, true);
        emit RarityMigrated(address(nft), tokenId, TestConstants.COMMON, TestConstants.EPIC, TestConstants.EPIC_PRICE);

        vm.prank(address(mockAppraisal));
        treasury.onCardPriceUpdated(SHARED_CARD_ID, TestConstants.EPIC_PRICE);
    }

    // ========================================================================
    // HELPERS
    // ========================================================================

    uint256 private _nextTokenSeed = 1;

    function _depositWithSharedCard(uint256 priceUSD) internal returns (uint256 tokenId) {
        vm.startPrank(owner);
        tokenId = nft.mint(owner);
        nft.approve(address(treasury), tokenId);
        mockAppraisal.setMockAppraisalWithCardId(address(nft), tokenId, SHARED_CARD_ID, priceUSD);
        treasury.depositNFT(address(nft), tokenId);
        vm.stopPrank();
    }
}
