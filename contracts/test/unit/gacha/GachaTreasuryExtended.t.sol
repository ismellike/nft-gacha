// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {StandardTest} from "../../helpers/StandardTest.sol";
import {TestConstants} from "../../helpers/TestConstants.sol";
import {GachaTreasury} from "../../../src/gacha/GachaTreasury.sol";
import {CardGroupedVault} from "../../../src/economy/CardGroupedVault.sol";
import {BaseERC721} from "../../../src/tokens/BaseERC721.sol";
import {BaseERC20} from "../../../src/tokens/BaseERC20.sol";
import {MockNFTAppraisal} from "../../mocks/MockNFTAppraisal.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

/**
 * @title GachaTreasuryExtended Test Suite
 * @notice Extended test coverage for GachaTreasury edge cases, view functions, and events
 */
contract GachaTreasuryExtendedTest is StandardTest {
	using TestConstants for *;

	GachaTreasury public treasury;
	BaseERC721 public nft;
	MockNFTAppraisal public mockAppraisal;
	CardGroupedVault public vault;
	BaseERC20 public usdc;

	// ─── Events mirrored from GachaTreasury ─────────────────────────────

	event NFTDeposited(
		address indexed collection,
		uint256 indexed tokenId,
		address indexed depositor,
		uint8 rarity,
		uint256 appraisedPrice
	);
	event NFTWithdrawn(address indexed collection, uint256 indexed tokenId, uint8 rarity, address indexed to);
	event CollectionWhitelisted(address indexed collection);
	event CollectionRemovedFromWhitelist(address indexed collection);
	event RarityMigrated(
		address indexed collection,
		uint256 indexed tokenId,
		uint8 oldRarity,
		uint8 newRarity,
		uint256 newPrice
	);
	event CardRarityMigrated(bytes32 indexed cardId, uint8 oldRarity, uint8 newRarity, uint256 newPriceUSD);
	event YieldClaimRecorded(address indexed user, uint256 amount);

	// Prices between rarity boundaries — gaps between tiers (not mapped to any tier)
	// Common: 0-$15, Uncommon: $25.01-$60, so $16-$25 is a gap
	// The actual gap price: after $15 max common, next valid is $25.01 uncommon
	// Actually per getMinPrices(): min[1] = 15e18 + PRICE_STEP = 15e18 + 1e16 = 15.01e18
	// So a price in range $15.01 to $60 is Uncommon. Prices exactly at $15 are Common.
	// A price BETWEEN $0 and max uint in the ranges must map to some rarity.
	// Actually there is NO gap — prices are always within some rarity range since:
	// Common: [0, 15e18], Uncommon: [15.01e18, 60e18], etc.
	// But there's a gap between $0.01 steps: price $15.001e18 would fall between $15e18 (Common max)
	// and $15.01e18 (Uncommon min). Let's use exactly the gap.

	function setUp() public {
		mockAppraisal = new MockNFTAppraisal();
		treasury = _deployTreasury(owner, gachaContract, address(mockAppraisal));
		nft = new BaseERC721("TestNFT", "TNFT", owner);

		// Deploy vault and link
		usdc = new BaseERC20("USDC", "USDC", owner);
		CardGroupedVault vaultImpl = new CardGroupedVault();
		bytes memory vaultInit = abi.encodeWithSelector(
			CardGroupedVault.initialize.selector,
			owner,
			address(usdc),
			address(treasury), // treasury
			address(this), // economyManager placeholder
			uint8(5)
		);
		ERC1967Proxy vaultProxy = new ERC1967Proxy(address(vaultImpl), vaultInit);
		vault = CardGroupedVault(address(vaultProxy));

		vm.prank(owner);
		treasury.setCardGroupedVault(address(vault));
	}

	// ========================================================================
	// 1. depositNFT() when price falls between rarity tier boundaries
	// ========================================================================

	/// @notice Price at exactly Common max ($15) should go to Common
	function testDepositNFT_priceAtCommonMax() public {
		_whitelistCollection(treasury, address(nft), owner);
		uint256 tokenId = _mintNFT(nft, owner);
		_approveNFT(nft, owner, tokenId, address(treasury));
		// $15 exactly — top of Common range
		mockAppraisal.setMockAppraisal(address(nft), tokenId, 15e18);

		vm.prank(owner);
		treasury.depositNFT(address(nft), tokenId);

		assertEq(treasury.getRarityCount(0), 1, "Should be Common");
		assertEq(treasury.getRarityCount(1), 0, "Should not be Uncommon");
	}

	/// @notice Price at exactly Uncommon min ($15.01) should go to Uncommon
	function testDepositNFT_priceAtUncommonMin() public {
		_whitelistCollection(treasury, address(nft), owner);
		uint256 tokenId = _mintNFT(nft, owner);
		_approveNFT(nft, owner, tokenId, address(treasury));
		// $15 + PRICE_STEP — bottom of Uncommon range
		uint256 uncommonMin = 15e18 + TestConstants.PRICE_STEP;
		mockAppraisal.setMockAppraisal(address(nft), tokenId, uncommonMin);

		vm.prank(owner);
		treasury.depositNFT(address(nft), tokenId);

		assertEq(treasury.getRarityCount(1), 1, "Should be Uncommon");
		assertEq(treasury.getRarityCount(0), 0, "Should not be Common");
	}

	/// @notice PriceOutOfBounds when price falls in the gap between Common and Uncommon
	function testDepositNFT_priceInGap_reverts() public {
		_whitelistCollection(treasury, address(nft), owner);
		uint256 tokenId = _mintNFT(nft, owner);
		_approveNFT(nft, owner, tokenId, address(treasury));
		// $15 + 1 wei — past Common max but below Uncommon min (which is $15 + PRICE_STEP = $15.01)
		// So $15 + 1 (1 wei) falls in gap
		uint256 gapPrice = 15e18 + 1;
		mockAppraisal.setMockAppraisal(address(nft), tokenId, gapPrice);

		vm.prank(owner);
		vm.expectRevert(abi.encodeWithSelector(GachaTreasury.PriceOutOfBounds.selector, gapPrice));
		treasury.depositNFT(address(nft), tokenId);
	}

	/// @notice Price exactly at Epic min should go to Epic
	function testDepositNFT_priceAtEpicMin() public {
		_whitelistCollection(treasury, address(nft), owner);
		uint256 tokenId = _mintNFT(nft, owner);
		_approveNFT(nft, owner, tokenId, address(treasury));
		uint256 epicMin = 250e18 + TestConstants.PRICE_STEP;
		mockAppraisal.setMockAppraisal(address(nft), tokenId, epicMin);

		vm.prank(owner);
		treasury.depositNFT(address(nft), tokenId);

		assertEq(treasury.getRarityCount(3), 1, "Should be Epic");
	}

	// ========================================================================
	// 2. handleRedemptionReturn() called by unauthorized caller
	// ========================================================================

	function testHandleRedemptionReturn_unauthorizedCaller_reverts() public {
		_whitelistCollection(treasury, address(nft), owner);
		uint256 tokenId = _mintNFT(nft, owner);

		vm.prank(unauthorizedUser);
		vm.expectRevert(abi.encodeWithSelector(GachaTreasury.UnauthorizedProtocolTreasury.selector));
		treasury.handleRedemptionReturn(address(nft), tokenId, owner, TestConstants.RARE_PRICE);
	}

	function testHandleRedemptionReturn_byProtocolTreasury_succeeds() public {
		address mockProtocol = makeAddr("protocol");
		vm.prank(owner);
		treasury.setProtocolTreasury(mockProtocol);

		_whitelistCollection(treasury, address(nft), owner);
		uint256 tokenId = _mintNFT(nft, owner);

		vm.prank(mockProtocol);
		treasury.handleRedemptionReturn(address(nft), tokenId, owner, TestConstants.RARE_PRICE);

		assertEq(treasury.getRarityCount(2), 1, "Should have 1 Rare NFT");
		assertEq(treasury.getTotalItemsCount(), 1, "Total should be 1");
	}

	// ========================================================================
	// 3. onCardPriceUpdated() with multi-depositor migration
	// ========================================================================

	function testOnCardPriceUpdated_multiDepositor_migration() public {
		_whitelistCollection(treasury, address(nft), owner);

		// Two depositors share the same card (same cardId from appraisal mock)
		// We use setMockAppraisalWithCardId so both tokens share a cardId
		bytes32 sharedCardId = keccak256("shared-card");

		// Deposit token 1 (alice) — Common price
		uint256 tokenId1 = _mintNFT(nft, ALICE);
		vm.prank(ALICE);
		nft.approve(address(treasury), tokenId1);
		mockAppraisal.setMockAppraisalWithCardId(address(nft), tokenId1, sharedCardId, TestConstants.COMMON_PRICE);
		vm.prank(ALICE);
		treasury.depositNFT(address(nft), tokenId1);

		// Deposit token 2 (bob) — same card, same price
		uint256 tokenId2 = _mintNFT(nft, BOB);
		vm.prank(BOB);
		nft.approve(address(treasury), tokenId2);
		mockAppraisal.setMockAppraisalWithCardId(address(nft), tokenId2, sharedCardId, TestConstants.COMMON_PRICE);
		vm.prank(BOB);
		treasury.depositNFT(address(nft), tokenId2);

		assertEq(treasury.getRarityCount(0), 2, "Both should be Common");
		assertEq(treasury.cardTotalDeposits(sharedCardId), 2, "Card should have 2 deposits");

		// Update price to Rare range — triggers rarity migration via appraisal contract
		mockAppraisal.setMockAppraisalWithCardId(address(nft), tokenId1, sharedCardId, TestConstants.RARE_PRICE);

		vm.prank(address(mockAppraisal));
		treasury.onCardPriceUpdated(sharedCardId, TestConstants.RARE_PRICE);

		// Both tokens should migrate to Rare
		assertEq(treasury.getRarityCount(0), 0, "Common should be empty after migration");
		assertEq(treasury.getRarityCount(2), 2, "Both should now be Rare");
	}

	// ========================================================================
	// 4. Deposit NFT, un-whitelist collection, verify withdrawal still works
	// ========================================================================

	function testDeposit_unwhitelist_withdrawalStillWorks() public {
		_whitelistCollection(treasury, address(nft), owner);

		uint256 tokenId = _mintNFT(nft, owner);
		_approveNFT(nft, owner, tokenId, address(treasury));
		mockAppraisal.setMockAppraisal(address(nft), tokenId, TestConstants.UNCOMMON_PRICE);

		vm.prank(owner);
		treasury.depositNFT(address(nft), tokenId);

		// Un-whitelist the collection
		vm.prank(owner);
		treasury.removeFromWhitelist(address(nft));

		assertFalse(treasury.isCollectionWhitelisted(address(nft)), "Should not be whitelisted");
		assertEq(treasury.getTotalItemsCount(), 1, "NFT still in treasury");

		// Withdrawal should still work even though collection is no longer whitelisted
		vm.prank(owner);
		treasury.withdrawMyNFT(address(nft), tokenId);

		assertEq(nft.ownerOf(tokenId), owner, "Owner should have NFT back");
		assertEq(treasury.getTotalItemsCount(), 0, "Treasury should be empty");
	}

	// ========================================================================
	// 5. batchWithdrawMyNFTs — multiple sequential withdrawals
	// ========================================================================

	function testBatchWithdrawNFTs_multipleTokens() public {
		_whitelistCollection(treasury, address(nft), owner);

		// Deposit 3 NFTs
		uint256 tokenId1 = _mintNFT(nft, owner);
		uint256 tokenId2 = _mintNFT(nft, owner);
		uint256 tokenId3 = _mintNFT(nft, owner);

		vm.startPrank(owner);
		nft.approve(address(treasury), tokenId1);
		nft.approve(address(treasury), tokenId2);
		nft.approve(address(treasury), tokenId3);
		mockAppraisal.setMockAppraisal(address(nft), tokenId1, TestConstants.COMMON_PRICE);
		mockAppraisal.setMockAppraisal(address(nft), tokenId2, TestConstants.RARE_PRICE);
		mockAppraisal.setMockAppraisal(address(nft), tokenId3, TestConstants.EPIC_PRICE);
		treasury.depositNFT(address(nft), tokenId1);
		treasury.depositNFT(address(nft), tokenId2);
		treasury.depositNFT(address(nft), tokenId3);
		vm.stopPrank();

		assertEq(treasury.getTotalItemsCount(), 3, "Should have 3 NFTs");

		// Withdraw all three
		vm.startPrank(owner);
		treasury.withdrawMyNFT(address(nft), tokenId1);
		treasury.withdrawMyNFT(address(nft), tokenId2);
		treasury.withdrawMyNFT(address(nft), tokenId3);
		vm.stopPrank();

		assertEq(treasury.getTotalItemsCount(), 0, "Treasury should be empty");
		assertEq(nft.ownerOf(tokenId1), owner, "Owner should have token 1");
		assertEq(nft.ownerOf(tokenId2), owner, "Owner should have token 2");
		assertEq(nft.ownerOf(tokenId3), owner, "Owner should have token 3");
	}

	function testBatchWithdrawNFTs_onlyOwnDeposits() public {
		_whitelistCollection(treasury, address(nft), owner);

		uint256 tokenId = _mintNFT(nft, owner);
		_approveNFT(nft, owner, tokenId, address(treasury));
		mockAppraisal.setMockAppraisal(address(nft), tokenId, TestConstants.UNCOMMON_PRICE);

		vm.prank(owner);
		treasury.depositNFT(address(nft), tokenId);

		// Bob tries to withdraw owner's NFT
		vm.prank(BOB);
		vm.expectRevert(abi.encodeWithSelector(GachaTreasury.NotNFTDepositor.selector));
		treasury.withdrawMyNFT(address(nft), tokenId);
	}

	// ========================================================================
	// 6. View functions
	// ========================================================================

	function testGetUserCardIds() public {
		_whitelistCollection(treasury, address(nft), owner);

		bytes32 cardId1 = keccak256("card-1");
		bytes32 cardId2 = keccak256("card-2");

		uint256 tokenId1 = _mintNFT(nft, owner);
		uint256 tokenId2 = _mintNFT(nft, owner);

		vm.startPrank(owner);
		nft.approve(address(treasury), tokenId1);
		nft.approve(address(treasury), tokenId2);
		mockAppraisal.setMockAppraisalWithCardId(address(nft), tokenId1, cardId1, TestConstants.COMMON_PRICE);
		mockAppraisal.setMockAppraisalWithCardId(address(nft), tokenId2, cardId2, TestConstants.RARE_PRICE);
		treasury.depositNFT(address(nft), tokenId1);
		treasury.depositNFT(address(nft), tokenId2);
		vm.stopPrank();

		(bytes32[] memory cardIds, uint256 total, bool hasMore) = treasury.getUserCardIds(owner, 0, 10);
		assertEq(total, 2, "Should have 2 card IDs");
		assertEq(cardIds.length, 2, "Should return 2 card IDs");
		assertFalse(hasMore, "No more pages");
	}

	function testGetUserCardIds_pagination() public {
		_whitelistCollection(treasury, address(nft), owner);

		// Deposit 3 different cards
		for (uint256 i = 0; i < 3; i++) {
			bytes32 cardId = keccak256(abi.encodePacked("card-pag", i));
			uint256 tokenId = _mintNFT(nft, owner);
			vm.prank(owner);
			nft.approve(address(treasury), tokenId);
			mockAppraisal.setMockAppraisalWithCardId(address(nft), tokenId, cardId, TestConstants.COMMON_PRICE);
			vm.prank(owner);
			treasury.depositNFT(address(nft), tokenId);
		}

		(bytes32[] memory cardIds, uint256 total, bool hasMore) = treasury.getUserCardIds(owner, 0, 2);
		assertEq(total, 3, "Total should be 3");
		assertEq(cardIds.length, 2, "Page should return 2");
		assertTrue(hasMore, "Should have more");

		(bytes32[] memory cardIds2,,) = treasury.getUserCardIds(owner, 2, 2);
		assertEq(cardIds2.length, 1, "Second page should have 1");
	}

	function testGetUserCardIds_invalidLimit_reverts() public {
		vm.expectRevert(abi.encodeWithSelector(GachaTreasury.InvalidLimit.selector));
		treasury.getUserCardIds(owner, 0, 0);

		vm.expectRevert(abi.encodeWithSelector(GachaTreasury.InvalidLimit.selector));
		treasury.getUserCardIds(owner, 0, 101);
	}

	function testGetUserCardDeposits_userCardDeposits() public {
		_whitelistCollection(treasury, address(nft), owner);
		bytes32 cardId = keccak256("test-card");

		uint256 tokenId = _mintNFT(nft, owner);
		vm.prank(owner);
		nft.approve(address(treasury), tokenId);
		mockAppraisal.setMockAppraisalWithCardId(address(nft), tokenId, cardId, TestConstants.COMMON_PRICE);
		vm.prank(owner);
		treasury.depositNFT(address(nft), tokenId);

		assertEq(treasury.userCardDeposits(owner, cardId), 1, "Should have 1 deposit for card");
		assertEq(treasury.cardTotalDeposits(cardId), 1, "Card total should be 1");
	}

	function testRecordYieldClaim_onlyVault() public {
		// Set the vault so recordYieldClaim can be called
		// recordYieldClaim can only be called by cardGroupedVault
		vm.prank(unauthorizedUser);
		vm.expectRevert(abi.encodeWithSelector(GachaTreasury.InvalidCardGroupedVault.selector));
		treasury.recordYieldClaim(owner, 100e6);
	}

	function testRecordYieldClaim_byVault_updatesLifetimeClaimed() public {
		// Deploy fresh treasury wired to our vault
		vm.prank(owner);
		treasury.setCardGroupedVault(address(vault));

		// Vault calls recordYieldClaim
		vm.prank(address(vault));
		treasury.recordYieldClaim(owner, 100e6);

		// Amount is converted: scalar default 1e12, so 100e6 * 1e12 = 100e18
		assertEq(treasury.userLifetimeClaimed(owner), 100e6 * 1e12);
	}

	function testGetTotalItemsCount() public {
		assertEq(treasury.getTotalItemsCount(), 0, "Empty initially");

		_whitelistCollection(treasury, address(nft), owner);
		uint256 tokenId1 = _mintNFT(nft, owner);
		uint256 tokenId2 = _mintNFT(nft, owner);

		vm.startPrank(owner);
		nft.approve(address(treasury), tokenId1);
		nft.approve(address(treasury), tokenId2);
		mockAppraisal.setMockAppraisal(address(nft), tokenId1, TestConstants.COMMON_PRICE);
		mockAppraisal.setMockAppraisal(address(nft), tokenId2, TestConstants.EPIC_PRICE);
		treasury.depositNFT(address(nft), tokenId1);
		treasury.depositNFT(address(nft), tokenId2);
		vm.stopPrank();

		assertEq(treasury.getTotalItemsCount(), 2, "Should have 2 total");
	}

	function testGetNumRarities() public view {
		assertEq(treasury.getNumRarities(), 5, "Should have 5 rarities");
	}

	function testGetWhitelistedCollections() public {
		assertEq(treasury.getWhitelistLength(), 0, "Empty initially");
		assertEq(treasury.getWhitelistedCollections().length, 0);

		vm.prank(owner);
		treasury.addToWhitelist(address(nft));

		assertEq(treasury.getWhitelistLength(), 1);
		address[] memory wl = treasury.getWhitelistedCollections();
		assertEq(wl.length, 1);
		assertEq(wl[0], address(nft));
	}

	function testGetWhitelistLength_afterRemoval() public {
		vm.prank(owner);
		treasury.addToWhitelist(address(nft));
		assertEq(treasury.getWhitelistLength(), 1);

		vm.prank(owner);
		treasury.removeFromWhitelist(address(nft));
		assertEq(treasury.getWhitelistLength(), 0);
	}

	// ========================================================================
	// 7. Event emissions
	// ========================================================================

	function testEvent_NFTDeposited() public {
		_whitelistCollection(treasury, address(nft), owner);
		uint256 tokenId = _mintNFT(nft, owner);
		_approveNFT(nft, owner, tokenId, address(treasury));
		mockAppraisal.setMockAppraisal(address(nft), tokenId, TestConstants.UNCOMMON_PRICE);

		vm.expectEmit(true, true, true, true);
		emit NFTDeposited(address(nft), tokenId, owner, uint8(1), TestConstants.UNCOMMON_PRICE);

		vm.prank(owner);
		treasury.depositNFT(address(nft), tokenId);
	}

	function testEvent_NFTWithdrawn_onUserWithdraw() public {
		_whitelistCollection(treasury, address(nft), owner);
		uint256 tokenId = _mintNFT(nft, owner);
		_approveNFT(nft, owner, tokenId, address(treasury));
		mockAppraisal.setMockAppraisal(address(nft), tokenId, TestConstants.EPIC_PRICE);

		vm.prank(owner);
		treasury.depositNFT(address(nft), tokenId);

		vm.expectEmit(true, true, false, true);
		emit NFTWithdrawn(address(nft), tokenId, uint8(3), owner);

		vm.prank(owner);
		treasury.withdrawMyNFT(address(nft), tokenId);
	}

	function testEvent_NFTWithdrawn_onSendToWinner() public {
		_whitelistCollection(treasury, address(nft), owner);
		uint256 tokenId = _mintNFT(nft, owner);
		_approveNFT(nft, owner, tokenId, address(treasury));
		mockAppraisal.setMockAppraisal(address(nft), tokenId, TestConstants.RARE_PRICE);

		vm.prank(owner);
		treasury.depositNFT(address(nft), tokenId);

		address winner = makeAddr("winner");
		vm.expectEmit(true, true, false, true);
		emit NFTWithdrawn(address(nft), tokenId, uint8(2), winner);

		vm.prank(gachaContract);
		treasury.sendRandomNFTToWinner(2, 0, winner);
	}

	function testEvent_CollectionWhitelisted() public {
		vm.expectEmit(true, false, false, false);
		emit CollectionWhitelisted(address(nft));

		vm.prank(owner);
		treasury.addToWhitelist(address(nft));
	}

	function testEvent_CollectionRemovedFromWhitelist() public {
		vm.prank(owner);
		treasury.addToWhitelist(address(nft));

		vm.expectEmit(true, false, false, false);
		emit CollectionRemovedFromWhitelist(address(nft));

		vm.prank(owner);
		treasury.removeFromWhitelist(address(nft));
	}

	function testEvent_RarityMigrated_onCardPriceUpdated() public {
		_whitelistCollection(treasury, address(nft), owner);
		bytes32 cardId = keccak256("migrate-card");

		uint256 tokenId = _mintNFT(nft, owner);
		vm.prank(owner);
		nft.approve(address(treasury), tokenId);
		mockAppraisal.setMockAppraisalWithCardId(address(nft), tokenId, cardId, TestConstants.COMMON_PRICE);
		vm.prank(owner);
		treasury.depositNFT(address(nft), tokenId);

		// Update appraisal to Rare price
		mockAppraisal.setMockAppraisalWithCardId(address(nft), tokenId, cardId, TestConstants.RARE_PRICE);

		vm.expectEmit(true, true, false, true);
		emit RarityMigrated(address(nft), tokenId, uint8(0), uint8(2), TestConstants.RARE_PRICE);

		vm.prank(address(mockAppraisal));
		treasury.onCardPriceUpdated(cardId, TestConstants.RARE_PRICE);
	}

	function testEvent_YieldClaimRecorded() public {
		vm.expectEmit(true, false, false, true);
		emit YieldClaimRecorded(owner, 50e6);

		vm.prank(address(vault));
		treasury.recordYieldClaim(owner, 50e6);
	}

	// ========================================================================
	// 8. sendRandomNFTToWinner() with out-of-bounds rarity index
	// ========================================================================

	function testSendRandomNFTToWinner_outOfBoundsRarity_reverts() public {
		address winner = makeAddr("winner");

		// Rarity index 5 is out of bounds for a 5-rarity system (valid: 0-4)
		// The function will revert with NoNFTsAvailable since the array at index 5 is empty
		// Actually index 5 > numRarities-1 so rarityCount[5] == 0, causing NoNFTsAvailable
		vm.prank(gachaContract);
		vm.expectRevert(abi.encodeWithSelector(GachaTreasury.NoNFTsAvailable.selector, uint8(5)));
		treasury.sendRandomNFTToWinner(5, 0, winner);
	}

	function testSendRandomNFTToWinner_emptyRarityPool_reverts() public {
		address winner = makeAddr("winner");

		// No NFTs deposited — pool is empty
		vm.prank(gachaContract);
		vm.expectRevert(abi.encodeWithSelector(GachaTreasury.NoNFTsAvailable.selector, uint8(0)));
		treasury.sendRandomNFTToWinner(0, 0, winner);
	}

	function testSendRandomNFTToWinner_unauthorized_reverts() public {
		_whitelistCollection(treasury, address(nft), owner);
		uint256 tokenId = _mintNFT(nft, owner);
		_approveNFT(nft, owner, tokenId, address(treasury));
		mockAppraisal.setMockAppraisal(address(nft), tokenId, TestConstants.COMMON_PRICE);
		vm.prank(owner);
		treasury.depositNFT(address(nft), tokenId);

		address winner = makeAddr("winner");
		vm.prank(unauthorizedUser);
		vm.expectRevert(abi.encodeWithSelector(GachaTreasury.UnauthorizedGachaContract.selector));
		treasury.sendRandomNFTToWinner(0, 0, winner);
	}

	function testSendRandomNFTToWinner_randomSeedSelecstCorrectly() public {
		_whitelistCollection(treasury, address(nft), owner);

		// Deposit 3 NFTs in Common pool
		uint256 tokenId1 = _mintNFT(nft, owner);
		uint256 tokenId2 = _mintNFT(nft, owner);
		uint256 tokenId3 = _mintNFT(nft, owner);

		vm.startPrank(owner);
		nft.approve(address(treasury), tokenId1);
		nft.approve(address(treasury), tokenId2);
		nft.approve(address(treasury), tokenId3);
		mockAppraisal.setMockAppraisal(address(nft), tokenId1, TestConstants.COMMON_PRICE);
		mockAppraisal.setMockAppraisal(address(nft), tokenId2, TestConstants.COMMON_PRICE);
		mockAppraisal.setMockAppraisal(address(nft), tokenId3, TestConstants.COMMON_PRICE);
		treasury.depositNFT(address(nft), tokenId1);
		treasury.depositNFT(address(nft), tokenId2);
		treasury.depositNFT(address(nft), tokenId3);
		vm.stopPrank();

		assertEq(treasury.getRarityCount(0), 3);

		address winner = makeAddr("winner");
		vm.prank(gachaContract);
		GachaTreasury.NFTItem memory item = treasury.sendRandomNFTToWinner(0, 0, winner); // index 0

		assertEq(item.rarity, 0, "Should be Common");
		assertEq(nft.ownerOf(item.tokenId), winner, "Winner should own the NFT");
		assertEq(treasury.getRarityCount(0), 2, "Should have 2 Common NFTs left");
	}
}
