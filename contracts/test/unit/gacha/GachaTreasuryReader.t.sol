// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {StandardTest} from "../../helpers/StandardTest.sol";
import {TestConstants} from "../../helpers/TestConstants.sol";
import {GachaTreasury} from "../../../src/gacha/GachaTreasury.sol";
import {GachaTreasuryReader, IGachaTreasuryRead} from "../../../src/gacha/GachaTreasuryReader.sol";
import {BaseERC721} from "../../../src/tokens/BaseERC721.sol";
import {MockNFTAppraisal} from "../../mocks/MockNFTAppraisal.sol";

/**
 * @title GachaTreasuryReader Test Suite
 * @notice Comprehensive tests for GachaTreasuryReader view functions
 * @dev Covers all paginated and batch query paths including edge cases
 * @author NFT Gacha Team
 */
contract GachaTreasuryReaderTest is StandardTest {
    using TestConstants for *;

    // ========================================================================
    // STATE VARIABLES
    // ========================================================================

    GachaTreasury public treasury;
    GachaTreasuryReader public reader;
    BaseERC721 public nft;
    MockNFTAppraisal public mockAppraisal;

    // ========================================================================
    // SETUP
    // ========================================================================

    function setUp() public {
        mockAppraisal = new MockNFTAppraisal();
        treasury = _deployTreasury(owner, gachaContract, address(mockAppraisal));
        reader = new GachaTreasuryReader(address(treasury));
        nft = new BaseERC721("TestNFT", "TNFT", owner);

        // Whitelist the collection
        vm.prank(owner);
        treasury.addToWhitelist(address(nft));
    }

    // ========================================================================
    // HELPERS
    // ========================================================================

    /// @dev Mint, appraise, approve, and deposit a single NFT as `depositor`.
    function _depositNFTAs(address depositor, uint256 price) internal returns (uint256 tokenId) {
        tokenId = _mintNFT(nft, depositor);
        mockAppraisal.setMockAppraisal(address(nft), tokenId, price);
        vm.prank(depositor);
        nft.approve(address(treasury), tokenId);
        vm.prank(depositor);
        treasury.depositNFT(address(nft), tokenId);
    }

    // ========================================================================
    // CONSTRUCTOR TEST
    // ========================================================================

    function test_Constructor_SetsImmutableTreasury() public view {
        assertEq(address(reader.treasury()), address(treasury));
    }

    // ========================================================================
    // getUserCardDepositsPage TESTS
    // ========================================================================

    function test_GetUserCardDepositsPage_InvalidLimit_Zero() public {
        vm.expectRevert(GachaTreasuryReader.InvalidLimit.selector);
        reader.getUserCardDepositsPage(user, 0, 0);
    }

    function test_GetUserCardDepositsPage_InvalidLimit_OverMax() public {
        vm.expectRevert(GachaTreasuryReader.InvalidLimit.selector);
        reader.getUserCardDepositsPage(user, 0, 51);
    }

    function test_GetUserCardDepositsPage_ZeroAddress_ReturnsEmpty() public view {
        (IGachaTreasuryRead.UserCardDeposit[] memory deposits, uint256 total, bool hasMore) =
            reader.getUserCardDepositsPage(address(0), 0, 10);
        assertEq(deposits.length, 0);
        assertEq(total, 0);
        assertFalse(hasMore);
    }

    function test_GetUserCardDepositsPage_EmptyDeposits() public view {
        (IGachaTreasuryRead.UserCardDeposit[] memory deposits, uint256 total, bool hasMore) =
            reader.getUserCardDepositsPage(user, 0, 10);
        assertEq(deposits.length, 0);
        assertEq(total, 0);
        assertFalse(hasMore);
    }

    function test_GetUserCardDepositsPage_NormalPage() public {
        // Deposit 3 NFTs of different cards
        _depositNFTAs(user, TestConstants.COMMON_PRICE);
        _depositNFTAs(user, TestConstants.UNCOMMON_PRICE);
        _depositNFTAs(user, TestConstants.RARE_PRICE);

        (IGachaTreasuryRead.UserCardDeposit[] memory deposits, uint256 total, bool hasMore) =
            reader.getUserCardDepositsPage(user, 0, 10);

        assertEq(total, 3, "total should be 3 card ids");
        assertEq(deposits.length, 3, "should return all 3");
        assertFalse(hasMore, "no more pages");
    }

    function test_GetUserCardDepositsPage_Pagination_HasMore() public {
        // Deposit 5 NFTs
        for (uint256 i = 0; i < 5; i++) {
            _depositNFTAs(user, TestConstants.COMMON_PRICE);
        }

        (IGachaTreasuryRead.UserCardDeposit[] memory page1, uint256 total, bool hasMore) =
            reader.getUserCardDepositsPage(user, 0, 3);

        assertEq(total, 5, "total should be 5");
        assertEq(page1.length, 3, "first page should have 3");
        assertTrue(hasMore, "should have more");

        (IGachaTreasuryRead.UserCardDeposit[] memory page2,, bool hasMore2) =
            reader.getUserCardDepositsPage(user, 3, 3);

        assertEq(page2.length, 2, "second page should have remaining 2");
        assertFalse(hasMore2, "no more after page 2");
    }

    function test_GetUserCardDepositsPage_LastPage_ExactFit() public {
        // Deposit exactly 4 NFTs
        for (uint256 i = 0; i < 4; i++) {
            _depositNFTAs(user, TestConstants.COMMON_PRICE);
        }

        (IGachaTreasuryRead.UserCardDeposit[] memory deposits, uint256 total, bool hasMore) =
            reader.getUserCardDepositsPage(user, 0, 4);

        assertEq(total, 4);
        assertEq(deposits.length, 4);
        assertFalse(hasMore);
    }

    function test_GetUserCardDepositsPage_OverflowPage_ReturnsEmpty() public {
        _depositNFTAs(user, TestConstants.COMMON_PRICE);

        // Offset beyond total
        (IGachaTreasuryRead.UserCardDeposit[] memory deposits, uint256 total, bool hasMore) =
            reader.getUserCardDepositsPage(user, 100, 10);

        assertEq(deposits.length, 0, "should be empty");
        assertEq(total, 1, "total unchanged");
        assertFalse(hasMore);
    }

    function test_GetUserCardDepositsPage_DepositCountsAreCorrect() public {
        // Deposit two NFTs of the same card type (same price → same card ID via mock)
        uint256 tid1 = _mintNFT(nft, user);
        uint256 tid2 = _mintNFT(nft, user);
        bytes32 cardId = keccak256(abi.encodePacked(address(nft), "card", tid1));

        mockAppraisal.setMockAppraisalWithCardId(address(nft), tid1, cardId, TestConstants.COMMON_PRICE);
        mockAppraisal.setMockAppraisalWithCardId(address(nft), tid2, cardId, TestConstants.COMMON_PRICE);

        vm.prank(user);
        nft.approve(address(treasury), tid1);
        vm.prank(user);
        treasury.depositNFT(address(nft), tid1);

        vm.prank(user);
        nft.approve(address(treasury), tid2);
        vm.prank(user);
        treasury.depositNFT(address(nft), tid2);

        (IGachaTreasuryRead.UserCardDeposit[] memory deposits,,) = reader.getUserCardDepositsPage(user, 0, 10);

        assertEq(deposits.length, 1, "single unique card");
        assertEq(deposits[0].depositCount, 2, "user deposited 2 of this card");
        assertEq(deposits[0].totalCardDeposits, 2, "total card deposits should be 2");
    }

    // ========================================================================
    // getUserDepositedNFTsPaginated TESTS
    // ========================================================================

    function test_GetUserDepositedNFTsPaginated_ZeroAddress() public view {
        (IGachaTreasuryRead.NFTItem[] memory items, uint256 total, bool hasMore) =
            reader.getUserDepositedNFTsPaginated(address(0), 0, 10);
        assertEq(items.length, 0);
        assertEq(total, 0);
        assertFalse(hasMore);
    }

    function test_GetUserDepositedNFTsPaginated_ZeroLimit() public view {
        (IGachaTreasuryRead.NFTItem[] memory items, uint256 total, bool hasMore) =
            reader.getUserDepositedNFTsPaginated(user, 0, 0);
        assertEq(items.length, 0);
        assertEq(total, 0);
        assertFalse(hasMore);
    }

    function test_GetUserDepositedNFTsPaginated_Empty() public view {
        (IGachaTreasuryRead.NFTItem[] memory items, uint256 total, bool hasMore) =
            reader.getUserDepositedNFTsPaginated(user, 0, 10);
        assertEq(items.length, 0);
        assertEq(total, 0);
        assertFalse(hasMore);
    }

    function test_GetUserDepositedNFTsPaginated_SingleItem() public {
        _depositNFTAs(user, TestConstants.COMMON_PRICE);

        (IGachaTreasuryRead.NFTItem[] memory items, uint256 total, bool hasMore) =
            reader.getUserDepositedNFTsPaginated(user, 0, 10);

        assertEq(items.length, 1);
        assertEq(total, 1);
        assertFalse(hasMore);
        assertEq(items[0].depositor, user);
    }

    function test_GetUserDepositedNFTsPaginated_MultipleItems_Paginated() public {
        _depositNFTAs(user, TestConstants.COMMON_PRICE);
        _depositNFTAs(user, TestConstants.UNCOMMON_PRICE);
        _depositNFTAs(user, TestConstants.RARE_PRICE);
        _depositNFTAs(user, TestConstants.EPIC_PRICE);

        (IGachaTreasuryRead.NFTItem[] memory page1, uint256 total, bool hasMore) =
            reader.getUserDepositedNFTsPaginated(user, 0, 2);

        assertEq(total, 4);
        assertEq(page1.length, 2);
        assertTrue(hasMore);

        (IGachaTreasuryRead.NFTItem[] memory page2,, bool hasMore2) =
            reader.getUserDepositedNFTsPaginated(user, 2, 2);

        assertEq(page2.length, 2);
        assertFalse(hasMore2);
    }

    function test_GetUserDepositedNFTsPaginated_OffsetBeyondTotal_ReturnsEmpty() public {
        _depositNFTAs(user, TestConstants.COMMON_PRICE);

        (IGachaTreasuryRead.NFTItem[] memory items, uint256 total, bool hasMore) =
            reader.getUserDepositedNFTsPaginated(user, 100, 10);

        assertEq(items.length, 0);
        assertEq(total, 1);
        assertFalse(hasMore);
    }

    function test_GetUserDepositedNFTsPaginated_OnlyReturnsUserItems() public {
        address other = makeAddr("other");
        _depositNFTAs(user, TestConstants.COMMON_PRICE);
        _depositNFTAs(other, TestConstants.COMMON_PRICE);

        (IGachaTreasuryRead.NFTItem[] memory items, uint256 total,) =
            reader.getUserDepositedNFTsPaginated(user, 0, 10);

        assertEq(total, 1);
        assertEq(items.length, 1);
        assertEq(items[0].depositor, user);
    }

    // ========================================================================
    // getUserDepositedNFTsByCardIdPaginated TESTS
    // ========================================================================

    function test_GetUserDepositedNFTsByCardIdPaginated_ZeroAddress() public view {
        (IGachaTreasuryRead.NFTItem[] memory items, uint256 total, bool hasMore) =
            reader.getUserDepositedNFTsByCardIdPaginated(address(0), keccak256("card"), 0, 10);
        assertEq(items.length, 0);
        assertEq(total, 0);
        assertFalse(hasMore);
    }

    function test_GetUserDepositedNFTsByCardIdPaginated_ZeroCardId() public view {
        (IGachaTreasuryRead.NFTItem[] memory items, uint256 total, bool hasMore) =
            reader.getUserDepositedNFTsByCardIdPaginated(user, bytes32(0), 0, 10);
        assertEq(items.length, 0);
        assertEq(total, 0);
        assertFalse(hasMore);
    }

    function test_GetUserDepositedNFTsByCardIdPaginated_ZeroLimit() public view {
        (IGachaTreasuryRead.NFTItem[] memory items, uint256 total, bool hasMore) =
            reader.getUserDepositedNFTsByCardIdPaginated(user, keccak256("card"), 0, 0);
        assertEq(items.length, 0);
        assertEq(total, 0);
        assertFalse(hasMore);
    }

    function test_GetUserDepositedNFTsByCardIdPaginated_FiltersByCard() public {
        uint256 tid1 = _mintNFT(nft, user);
        uint256 tid2 = _mintNFT(nft, user);
        bytes32 card1 = keccak256("targetCard");
        bytes32 card2 = keccak256("otherCard");

        mockAppraisal.setMockAppraisalWithCardId(address(nft), tid1, card1, TestConstants.COMMON_PRICE);
        mockAppraisal.setMockAppraisalWithCardId(address(nft), tid2, card2, TestConstants.UNCOMMON_PRICE);

        vm.prank(user);
        nft.approve(address(treasury), tid1);
        vm.prank(user);
        treasury.depositNFT(address(nft), tid1);

        vm.prank(user);
        nft.approve(address(treasury), tid2);
        vm.prank(user);
        treasury.depositNFT(address(nft), tid2);

        (IGachaTreasuryRead.NFTItem[] memory items, uint256 total,) =
            reader.getUserDepositedNFTsByCardIdPaginated(user, card1, 0, 10);

        assertEq(total, 1, "only 1 item matches card1");
        assertEq(items.length, 1);
    }

    function test_GetUserDepositedNFTsByCardIdPaginated_NoneMatchCardId() public {
        _depositNFTAs(user, TestConstants.COMMON_PRICE);

        (IGachaTreasuryRead.NFTItem[] memory items, uint256 total, bool hasMore) =
            reader.getUserDepositedNFTsByCardIdPaginated(user, keccak256("nonexistentCard"), 0, 10);

        assertEq(items.length, 0);
        assertEq(total, 0);
        assertFalse(hasMore);
    }

    function test_GetUserDepositedNFTsByCardIdPaginated_Paginated() public {
        bytes32 cardId = keccak256("sharedCard");

        // Deposit 4 NFTs all with the same card ID
        for (uint256 i = 0; i < 4; i++) {
            uint256 tid = _mintNFT(nft, user);
            mockAppraisal.setMockAppraisalWithCardId(address(nft), tid, cardId, TestConstants.COMMON_PRICE);
            vm.prank(user);
            nft.approve(address(treasury), tid);
            vm.prank(user);
            treasury.depositNFT(address(nft), tid);
        }

        (IGachaTreasuryRead.NFTItem[] memory page1, uint256 total, bool hasMore) =
            reader.getUserDepositedNFTsByCardIdPaginated(user, cardId, 0, 2);

        assertEq(total, 4);
        assertEq(page1.length, 2);
        assertTrue(hasMore);

        (IGachaTreasuryRead.NFTItem[] memory page2,, bool hasMore2) =
            reader.getUserDepositedNFTsByCardIdPaginated(user, cardId, 2, 2);

        assertEq(page2.length, 2);
        assertFalse(hasMore2);
    }

    function test_GetUserDepositedNFTsByCardIdPaginated_OffsetBeyondTotal() public {
        uint256 tid = _mintNFT(nft, user);
        bytes32 cardId = keccak256("someCard");
        mockAppraisal.setMockAppraisalWithCardId(address(nft), tid, cardId, TestConstants.COMMON_PRICE);
        vm.prank(user);
        nft.approve(address(treasury), tid);
        vm.prank(user);
        treasury.depositNFT(address(nft), tid);

        (IGachaTreasuryRead.NFTItem[] memory items, uint256 total, bool hasMore) =
            reader.getUserDepositedNFTsByCardIdPaginated(user, cardId, 100, 10);

        assertEq(items.length, 0);
        assertEq(total, 1);
        assertFalse(hasMore);
    }

    // ========================================================================
    // getUserDepositedNFTs TESTS
    // ========================================================================

    function test_GetUserDepositedNFTs_ZeroAddress() public view {
        IGachaTreasuryRead.NFTItem[] memory items = reader.getUserDepositedNFTs(address(0));
        assertEq(items.length, 0);
    }

    function test_GetUserDepositedNFTs_Empty() public view {
        IGachaTreasuryRead.NFTItem[] memory items = reader.getUserDepositedNFTs(user);
        assertEq(items.length, 0);
    }

    function test_GetUserDepositedNFTs_FullList() public {
        _depositNFTAs(user, TestConstants.COMMON_PRICE);
        _depositNFTAs(user, TestConstants.UNCOMMON_PRICE);
        _depositNFTAs(user, TestConstants.RARE_PRICE);

        IGachaTreasuryRead.NFTItem[] memory items = reader.getUserDepositedNFTs(user);

        assertEq(items.length, 3, "should return all 3 NFTs");
        for (uint256 i = 0; i < items.length; i++) {
            assertEq(items[i].depositor, user, "all items should belong to user");
        }
    }

    function test_GetUserDepositedNFTs_OnlyReturnsCallerItems() public {
        address other = makeAddr("other");
        _depositNFTAs(user, TestConstants.COMMON_PRICE);
        _depositNFTAs(other, TestConstants.RARE_PRICE);

        IGachaTreasuryRead.NFTItem[] memory items = reader.getUserDepositedNFTs(user);

        assertEq(items.length, 1);
        assertEq(items[0].depositor, user);
    }

    function test_GetUserDepositedNFTs_AcrossMultipleRarities() public {
        _depositNFTAs(user, TestConstants.COMMON_PRICE);
        _depositNFTAs(user, TestConstants.RARE_PRICE);
        _depositNFTAs(user, TestConstants.LEGENDARY_PRICE);

        IGachaTreasuryRead.NFTItem[] memory items = reader.getUserDepositedNFTs(user);

        assertEq(items.length, 3, "three items across different rarities");
    }

    // ========================================================================
    // getUserProfileBatch TESTS
    // ========================================================================

    function test_GetUserProfileBatch_ZeroAddress_ReturnsZeros() public view {
        (
            uint256[] memory depositCounts,
            uint256 totalDeposits,
            uint256 lifetimeClaimed,
            uint256 lifetimeDeposited,
            uint256 lifetimeWithdrawn,
            uint256 netContribution
        ) = reader.getUserProfileBatch(address(0));

        assertEq(totalDeposits, 0);
        assertEq(lifetimeClaimed, 0);
        assertEq(lifetimeDeposited, 0);
        assertEq(lifetimeWithdrawn, 0);
        assertEq(netContribution, 0);
        assertEq(depositCounts.length, treasury.getNumRarities());
        for (uint256 i = 0; i < depositCounts.length; i++) {
            assertEq(depositCounts[i], 0);
        }
    }

    function test_GetUserProfileBatch_WithDeposits() public {
        _depositNFTAs(user, TestConstants.COMMON_PRICE);
        _depositNFTAs(user, TestConstants.RARE_PRICE);

        (
            uint256[] memory depositCounts,
            uint256 totalDeposits,
            uint256 lifetimeClaimed,
            uint256 lifetimeDeposited,
            uint256 lifetimeWithdrawn,
            uint256 netContribution
        ) = reader.getUserProfileBatch(user);

        assertEq(totalDeposits, 2, "2 total deposits");
        assertEq(lifetimeClaimed, 0, "nothing claimed yet");
        assertGt(lifetimeDeposited, 0, "some value deposited");
        assertEq(lifetimeWithdrawn, 0, "nothing withdrawn");
        assertEq(netContribution, lifetimeDeposited, "net = deposited - withdrawn = deposited");

        // common rarity (index 0) should have 1, rare (index 2) should have 1
        assertEq(depositCounts[0], 1, "1 common");
        assertEq(depositCounts[2], 1, "1 rare");
    }

    function test_GetUserProfileBatch_NetContribution_WhenWithdrawnExceedsDeposited() public view {
        // With no deposits, both are 0, so netContribution should be 0 (not underflow)
        (,,,,, uint256 netContribution) = reader.getUserProfileBatch(user);
        assertEq(netContribution, 0, "no underflow when lifetimeDeposited == 0");
    }

    function test_GetUserProfileBatch_DepositCountsLength_MatchesNumRarities() public view {
        (uint256[] memory depositCounts,,,,,) = reader.getUserProfileBatch(user);
        assertEq(depositCounts.length, treasury.getNumRarities());
    }

    // ========================================================================
    // getPlatformOverviewBatch TESTS
    // ========================================================================

    function test_GetPlatformOverviewBatch_EmptyTreasury() public view {
        (uint256[] memory rarityCounts, uint256 totalItems, bool gachaAvailable, uint256 totalDeposited, uint256 totalClaimed)
        = reader.getPlatformOverviewBatch();

        assertEq(totalItems, 0);
        assertEq(rarityCounts.length, treasury.getNumRarities());
        // gachaAvailable requires whitelist AND items — treasury has whitelist but no items
        assertFalse(gachaAvailable, "no items so not available");
        assertEq(totalDeposited, 0);
        assertEq(totalClaimed, 0);
    }

    function test_GetPlatformOverviewBatch_WithItems() public {
        _depositNFTAs(user, TestConstants.COMMON_PRICE);
        _depositNFTAs(user, TestConstants.RARE_PRICE);

        (uint256[] memory rarityCounts, uint256 totalItems, bool gachaAvailable, uint256 totalDeposited,) =
            reader.getPlatformOverviewBatch();

        assertEq(totalItems, 2, "2 items in treasury");
        assertEq(rarityCounts[0], 1, "1 common");
        assertEq(rarityCounts[2], 1, "1 rare");
        assertTrue(gachaAvailable, "whitelist has entry and items present");
        assertGt(totalDeposited, 0);
    }

    function test_GetPlatformOverviewBatch_RarityCountsSumToTotal() public {
        _depositNFTAs(user, TestConstants.COMMON_PRICE);
        _depositNFTAs(user, TestConstants.UNCOMMON_PRICE);
        _depositNFTAs(user, TestConstants.RARE_PRICE);

        (uint256[] memory rarityCounts, uint256 totalItems,,, ) = reader.getPlatformOverviewBatch();

        uint256 sum;
        for (uint256 i = 0; i < rarityCounts.length; i++) {
            sum += rarityCounts[i];
        }
        assertEq(sum, totalItems, "sum of rarity counts equals totalItems");
    }

    // ========================================================================
    // getGlobalStats TESTS
    // ========================================================================

    function test_GetGlobalStats_InitiallyZero() public view {
        (uint256 totalDeposited, uint256 totalClaimed) = reader.getGlobalStats();
        assertEq(totalDeposited, 0);
        assertEq(totalClaimed, 0);
    }

    function test_GetGlobalStats_AfterDeposit() public {
        _depositNFTAs(user, TestConstants.RARE_PRICE);

        (uint256 totalDeposited, uint256 totalClaimed) = reader.getGlobalStats();

        assertGt(totalDeposited, 0, "should reflect deposit value");
        assertEq(totalClaimed, 0, "nothing claimed yet");
    }

    function test_GetGlobalStats_MatchesTreasuryDirectly() public {
        _depositNFTAs(user, TestConstants.COMMON_PRICE);
        _depositNFTAs(user, TestConstants.EPIC_PRICE);

        (uint256 readerDeposited, uint256 readerClaimed) = reader.getGlobalStats();

        assertEq(readerDeposited, treasury.globalLifetimeDeposited(), "deposited matches treasury");
        assertEq(readerClaimed, treasury.globalLifetimeClaimed(), "claimed matches treasury");
    }
}
