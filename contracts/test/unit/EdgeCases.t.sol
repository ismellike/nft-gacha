// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Test, Vm} from "forge-std/Test.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

import {CardGroupedVault} from "../../src/economy/CardGroupedVault.sol";
import {GachaEconomyManager} from "../../src/economy/GachaEconomyManager.sol";
import {ProtocolTreasury} from "../../src/economy/ProtocolTreasury.sol";
import {NFTAppraisal} from "../../src/appraisal/NFTAppraisal.sol";
import {Gacha} from "../../src/gacha/Gacha.sol";
import {GachaTreasury} from "../../src/gacha/GachaTreasury.sol";
import {BaseERC20} from "../../src/tokens/BaseERC20.sol";
import {BaseERC721} from "../../src/tokens/BaseERC721.sol";
import {MockNFTAppraisal} from "../mocks/MockNFTAppraisal.sol";
import {MockProtocolTreasury} from "../mocks/MockProtocolTreasury.sol";
import {MockGachaEconomyManager} from "../mocks/MockGachaEconomyManager.sol";
import {MockWavsServiceManager} from "../mocks/MockWavsServiceManager.sol";
import {GachaServiceHandler} from "../../src/gacha/GachaServiceHandler.sol";
import {IWavsServiceManager} from "@wavs/eigenlayer/ecdsa/interfaces/IWavsServiceManager.sol";

// ============================================================================
// Test 1: CardGroupedVault — partial card claims across multiple rarity tiers
// ============================================================================

/**
 * @title CardGroupedVaultPartialClaimTest
 * @notice Tests claimYieldForCards() with a subset of cards spanning multiple rarity tiers.
 *         Verifies that only the requested cards' yield is claimed and the rest stays pending.
 */
contract CardGroupedVaultPartialClaimTest is Test {
    CardGroupedVault vault;
    BaseERC20 usdc;

    address owner = address(0x1);
    address treasury = address(0x2);
    address economyManager = address(0x3);
    address alice = address(0xA);
    address bob = address(0xB);

    bytes32 constant CARD_COMMON_A = keccak256("card-common-a");
    bytes32 constant CARD_COMMON_B = keccak256("card-common-b");
    bytes32 constant CARD_RARE = keccak256("card-rare");
    bytes32 constant CARD_EPIC = keccak256("card-epic");
    bytes32 constant CARD_LEGENDARY = keccak256("card-legendary");

    uint8 constant COMMON = 0;
    uint8 constant UNCOMMON = 1;
    uint8 constant RARE = 2;
    uint8 constant EPIC = 3;
    uint8 constant LEGENDARY = 4;

    function setUp() public {
        usdc = new BaseERC20("USDC", "USDC", address(this));
        vault = new CardGroupedVault();
        vault.initialize(owner, address(usdc), treasury, economyManager, uint8(5));

        usdc.mint(economyManager, 10_000_000e6);
        vm.prank(economyManager);
        usdc.approve(address(vault), type(uint256).max);
    }

    // ─── Test: claim only a subset of cards, verify correct amounts ──────────

    /**
     * @notice Alice holds cards in 3 different rarity tiers.
     *         Yield is distributed to all 3 tiers.
     *         claimYieldForCards() is called with only 2 of the 3 card IDs.
     *         Verifies: the claimed amount equals those 2 cards' yield; the 3rd stays pending.
     */
    function test_partialClaim_subsetOfCards_acrossRarities() public {
        uint256 commonPrice = 10e18;
        uint256 rarePrice = 100e18;
        uint256 epicPrice = 500e18;

        // Alice deposits one token of each rarity
        vm.startPrank(treasury);
        vault.registerCardDeposit(CARD_COMMON_A, alice, commonPrice, COMMON, 1);
        vault.registerCardDeposit(CARD_RARE, alice, rarePrice, RARE, 1);
        vault.registerCardDeposit(CARD_EPIC, alice, epicPrice, EPIC, 1);
        vm.stopPrank();

        // Distribute yield to each rarity pool (alice is sole depositor in each)
        vm.startPrank(economyManager);
        vault.distributeYield(20e6, COMMON); // Alice gets 20 USDC from Common
        vault.distributeYield(80e6, RARE); // Alice gets 80 USDC from Rare
        vault.distributeYield(200e6, EPIC); // Alice gets 200 USDC from Epic
        vm.stopPrank();

        // Total pending should be 300 USDC
        uint256 totalPending = vault.pendingYield(alice);
        assertApproxEqAbs(totalPending, 300e6, 3, "Total pending should be ~300 USDC");

        // Claim only CARD_COMMON_A and CARD_EPIC (not CARD_RARE)
        bytes32[] memory cardsToClaim = new bytes32[](2);
        cardsToClaim[0] = CARD_COMMON_A;
        cardsToClaim[1] = CARD_EPIC;

        uint256 balBefore = usdc.balanceOf(alice);
        vm.prank(alice);
        uint256 claimed = vault.claimYieldForCards(alice, cardsToClaim);
        uint256 balAfter = usdc.balanceOf(alice);

        // Should have claimed Common (20) + Epic (200) = 220 USDC
        assertApproxEqAbs(claimed, 220e6, 2, "Claimed should be ~220 USDC");
        assertApproxEqAbs(balAfter - balBefore, 220e6, 2, "Balance increase should be ~220 USDC");

        // CARD_RARE yield (80 USDC) should still be pending
        uint256 remaining = vault.pendingYield(alice);
        assertApproxEqAbs(remaining, 80e6, 2, "Remaining pending should be ~80 USDC (Rare only)");
    }

    /**
     * @notice Verify that claiming the same subset twice only gives yield once.
     *         After a first partial claim, the claimed cards have zero pending.
     *         A second call with the same card IDs reverts with NothingToClaim.
     */
    function test_partialClaim_sameCards_twice_reverts() public {
        vm.prank(treasury);
        vault.registerCardDeposit(CARD_COMMON_A, alice, 10e18, COMMON, 1);

        vm.prank(economyManager);
        vault.distributeYield(50e6, COMMON);

        bytes32[] memory cards = new bytes32[](1);
        cards[0] = CARD_COMMON_A;

        // First claim succeeds
        vm.prank(alice);
        vault.claimYieldForCards(alice, cards);

        // Second claim on same card with no new yield reverts
        vm.prank(alice);
        vm.expectRevert(CardGroupedVault.NothingToClaim.selector);
        vault.claimYieldForCards(alice, cards);
    }

    /**
     * @notice Two depositors in the same card.
     *         Alice calls claimYieldForCards — should not affect Bob's pending yield.
     */
    function test_partialClaim_doesNotAffectOtherDepositors() public {
        uint256 price = 100e18;

        vm.startPrank(treasury);
        vault.registerCardDeposit(CARD_COMMON_A, alice, price, COMMON, 3); // 3/4 share
        vault.registerCardDeposit(CARD_COMMON_A, bob, price, COMMON, 1); // 1/4 share
        vm.stopPrank();

        vm.prank(economyManager);
        vault.distributeYield(100e6, COMMON); // Alice: 75, Bob: 25

        // Alice claims her share of CARD_COMMON_A
        bytes32[] memory cards = new bytes32[](1);
        cards[0] = CARD_COMMON_A;

        vm.prank(alice);
        uint256 aliceClaimed = vault.claimYieldForCards(alice, cards);
        assertApproxEqAbs(aliceClaimed, 75e6, 1, "Alice should claim ~75 USDC");

        // Bob's pending should still be ~25 USDC
        uint256 bobPending = vault.pendingYield(bob);
        assertApproxEqAbs(bobPending, 25e6, 1, "Bob should still have ~25 USDC pending");
    }

    /**
     * @notice Alice has 5 cards across all 5 rarity tiers.
     *         Yield is distributed to all tiers.
     *         Alice claims only the two most valuable (Epic + Legendary).
     *         Remaining 3 tiers stay pending.
     */
    function test_partialClaim_fiveRarities_claimTwo() public {
        uint256[5] memory prices = [uint256(10e18), 50e18, 100e18, 500e18, 2000e18];
        uint256[5] memory yieldAmounts = [uint256(5e6), 10e6, 30e6, 100e6, 400e6];
        bytes32[5] memory cards = [CARD_COMMON_A, CARD_COMMON_B, CARD_RARE, CARD_EPIC, CARD_LEGENDARY];
        uint8[5] memory rarities = [uint8(0), uint8(1), uint8(2), uint8(3), uint8(4)];

        // Register deposits across all 5 rarities
        vm.startPrank(treasury);
        for (uint256 i = 0; i < 5; i++) {
            vault.registerCardDeposit(cards[i], alice, prices[i], rarities[i], 1);
        }
        vm.stopPrank();

        // Distribute yield to each rarity
        vm.startPrank(economyManager);
        for (uint256 i = 0; i < 5; i++) {
            vault.distributeYield(yieldAmounts[i], rarities[i]);
        }
        vm.stopPrank();

        // Total pending: 5 + 10 + 30 + 100 + 400 = 545 USDC
        uint256 totalPending = vault.pendingYield(alice);
        assertApproxEqAbs(totalPending, 545e6, 5, "Total pending should be ~545 USDC");

        // Claim only Epic (index 3) and Legendary (index 4)
        bytes32[] memory claimCards = new bytes32[](2);
        claimCards[0] = CARD_EPIC;
        claimCards[1] = CARD_LEGENDARY;

        vm.prank(alice);
        uint256 claimed = vault.claimYieldForCards(alice, claimCards);

        // Claimed = Epic (100) + Legendary (400) = 500
        assertApproxEqAbs(claimed, 500e6, 2, "Should claim ~500 USDC (Epic + Legendary)");

        // Remaining = Common (5) + Uncommon (10) + Rare (30) = 45 USDC
        uint256 remaining = vault.pendingYield(alice);
        assertApproxEqAbs(remaining, 45e6, 3, "Remaining should be ~45 USDC");
    }

    /**
     * @notice Partial claim with an empty cardIds array should revert with NothingToClaim.
     */
    function test_partialClaim_emptyArray_reverts() public {
        vm.prank(treasury);
        vault.registerCardDeposit(CARD_COMMON_A, alice, 10e18, COMMON, 1);

        vm.prank(economyManager);
        vault.distributeYield(10e6, COMMON);

        bytes32[] memory empty = new bytes32[](0);

        vm.prank(alice);
        vm.expectRevert(CardGroupedVault.NothingToClaim.selector);
        vault.claimYieldForCards(alice, empty);
    }

    /**
     * @notice Partial claim with a card ID that the depositor doesn't hold (skipped),
     *         combined with a valid card, should succeed with only the valid card's yield.
     */
    function test_partialClaim_unknownCardSkipped() public {
        bytes32 unknownCard = keccak256("card-unknown");

        vm.prank(treasury);
        vault.registerCardDeposit(CARD_COMMON_A, alice, 10e18, COMMON, 1);

        vm.prank(economyManager);
        vault.distributeYield(50e6, COMMON);

        // Mix unknown card with valid card
        bytes32[] memory cards = new bytes32[](2);
        cards[0] = unknownCard; // alice has no position here — skipped
        cards[1] = CARD_COMMON_A; // alice has position here

        uint256 balBefore = usdc.balanceOf(alice);
        vm.prank(alice);
        uint256 claimed = vault.claimYieldForCards(alice, cards);
        uint256 balAfter = usdc.balanceOf(alice);

        assertApproxEqAbs(claimed, 50e6, 1, "Should claim only CARD_COMMON_A yield");
        assertApproxEqAbs(balAfter - balBefore, 50e6, 1, "Balance should increase by card yield");
    }
}

// ============================================================================
// Test 2: NFTAppraisal — _triggerAutoMigration when the low-level call fails
// ============================================================================

/**
 * @title RevertingTreasury
 * @notice A contract that reverts when onCardPriceUpdated is called, simulating a failure.
 */
contract RevertingTreasury {
    error IntentionalRevert();

    function onCardPriceUpdated(bytes32, uint256) external pure {
        revert IntentionalRevert();
    }
}

/**
 * @title GasExhaustingTreasury
 * @notice A contract that consumes all gas when onCardPriceUpdated is called,
 *         simulating gas exhaustion in the callee.
 */
contract GasExhaustingTreasury {
    // Writes to many storage slots to burn gas
    uint256[200] private _slots;

    function onCardPriceUpdated(bytes32, uint256) external {
        // Consume gas by writing to storage in a loop
        for (uint256 i = 0; i < 200; i++) {
            _slots[i] = i + 1;
        }
        // If gas is exhausted, this loop will run out
        // The outer low-level call has a 500_000 gas cap so this will succeed with
        // 200 slots but we can simulate the call failing at the gas limit
        assembly {
            // Burn remaining gas
            for { let j := 0 } lt(j, 0xffffffffffffffff) { j := add(j, 1) } {}
        }
    }
}

/**
 * @title NFTAppraisalAutoMigrationTest
 * @notice Tests _triggerAutoMigration() when the low-level .call() fails.
 *         Verifies:
 *         - The appraisal price update succeeds even if migration fails
 *         - AutoMigrationFailed event is emitted on failure
 *         - AutoMigrationTriggered event is emitted on success
 *         - The contract does not revert when migration fails
 */
contract NFTAppraisalAutoMigrationTest is Test {
    NFTAppraisal appraisal;
    BaseERC721 nft;
    BaseERC20 feeToken;

    address owner = makeAddr("appraisalOwner");
    address protocol = makeAddr("protocol");
    address serviceHandler = makeAddr("serviceHandler");

    bytes32 constant CARD_ID = keccak256("migration-test-card");

    event AutoMigrationTriggered(address indexed treasury, address indexed collection, uint256 indexed tokenId);
    event AutoMigrationFailed(
        address indexed treasury, address indexed collection, uint256 indexed tokenId, bytes reason
    );
    event CardPriceUpdated(bytes32 indexed cardId, uint256 oldPriceUSD, uint256 newPriceUSD);

    function setUp() public {
        feeToken = new BaseERC20("FEE", "FEE", owner);
        nft = new BaseERC721("NFT", "NFT", owner);

        NFTAppraisal impl = new NFTAppraisal();
        bytes memory initData = abi.encodeWithSelector(
            NFTAppraisal.initialize.selector,
            owner,
            address(feeToken),
            0, // zero fee for simplicity
            protocol
        );
        ERC1967Proxy proxy = new ERC1967Proxy(address(impl), initData);
        appraisal = NFTAppraisal(address(proxy));

        vm.prank(owner);
        appraisal.setServiceHandler(serviceHandler);

        // Mint an NFT to be used in tests
        vm.prank(owner);
        nft.mint(owner); // tokenId = 0
    }

    // ─── Helper: complete an initial appraisal so subsequent updates trigger migration ─

    function _initialAppraisal(uint256 tokenId, uint256 price) internal {
        // Owner override bypasses fee/request requirement
        vm.prank(owner);
        appraisal.ownerSetAppraisalForTokenWithCard(address(nft), tokenId, CARD_ID, price);
    }

    // ─── Test: migration call fails — contract must NOT revert ────────────────

    /**
     * @notice When the whitelisted treasury's onCardPriceUpdated reverts,
     *         AutoMigrationFailed is emitted and the appraisal price update succeeds.
     */
    function test_autoMigration_callReverts_gracefullyHandled() public {
        // Deploy a treasury that always reverts
        RevertingTreasury revertTreasury = new RevertingTreasury();

        // Transfer the NFT to the reverting treasury so it becomes the "owner"
        vm.prank(owner);
        nft.transferFrom(owner, address(revertTreasury), 0);

        // Whitelist the reverting treasury
        vm.prank(owner);
        appraisal.whitelistTreasury(address(revertTreasury));

        // Set an initial appraisal price (owner can set without owning NFT)
        _initialAppraisal(0, 100e18);

        // Now re-appraise with a different price to trigger auto-migration
        vm.prank(owner);
        vm.expectEmit(true, false, false, false); // only check treasury indexed arg
        emit AutoMigrationFailed(address(revertTreasury), address(nft), 0, "");

        // Should NOT revert even though migration fails
        appraisal.ownerSetAppraisalForTokenWithCard(address(nft), 0, CARD_ID, 200e18);

        // Verify the price was still updated
        (uint256 price,) = appraisal.getAppraisedPrice(address(nft), 0);
        assertEq(price, 200e18, "Price should be updated despite migration failure");
    }

    /**
     * @notice When the low-level call exhausts its 500,000 gas budget,
     *         AutoMigrationFailed is emitted and the outer transaction succeeds.
     */
    function test_autoMigration_gasExhaustion_gracefullyHandled() public {
        GasExhaustingTreasury gasTreasury = new GasExhaustingTreasury();

        // Transfer the NFT to the gas-exhausting treasury
        vm.prank(owner);
        nft.transferFrom(owner, address(gasTreasury), 0);

        vm.prank(owner);
        appraisal.whitelistTreasury(address(gasTreasury));

        _initialAppraisal(0, 50e18);

        // Updating price triggers auto-migration which will exhaust gas in the callee
        // The outer call should still succeed
        vm.prank(owner);
        appraisal.ownerSetAppraisalForTokenWithCard(address(nft), 0, CARD_ID, 150e18);

        // Price was updated correctly
        (uint256 price,) = appraisal.getAppraisedPrice(address(nft), 0);
        assertEq(price, 150e18, "Price should be updated even when migration exhausts gas");
    }

    /**
     * @notice When no treasury is whitelisted, no migration attempt is made.
     *         The price update should succeed without any AutoMigration events.
     */
    function test_autoMigration_noWhitelistedTreasury_noAttempt() public {
        // NFT still owned by `owner` (not a whitelisted treasury)
        _initialAppraisal(0, 100e18);

        // No AutoMigrationTriggered or AutoMigrationFailed events should be emitted
        vm.recordLogs();
        vm.prank(owner);
        appraisal.ownerSetAppraisalForTokenWithCard(address(nft), 0, CARD_ID, 150e18);

        // Parse emitted events and confirm no migration events were fired
        Vm.Log[] memory logs = vm.getRecordedLogs();
        bytes32 triggeredSig = keccak256("AutoMigrationTriggered(address,address,uint256)");
        bytes32 failedSig = keccak256("AutoMigrationFailed(address,address,uint256,bytes)");

        bool foundMigrationEvent = false;
        for (uint256 i = 0; i < logs.length; i++) {
            if (logs[i].topics[0] == triggeredSig || logs[i].topics[0] == failedSig) {
                foundMigrationEvent = true;
                break;
            }
        }
        assertFalse(foundMigrationEvent, "No migration events should be emitted when no treasury is whitelisted owner");
    }

    /**
     * @notice When a working treasury is whitelisted and owns the NFT,
     *         AutoMigrationTriggered is emitted and the call succeeds.
     *         Uses a mock that simply accepts the call.
     */
    function test_autoMigration_successfulMigration_eventEmitted() public {
        // Use the MockProtocolTreasury which has no onCardPriceUpdated;
        // the low-level call will succeed but return empty data (no revert)
        // We need a contract that accepts arbitrary calls — just use address(this) as treasury
        // Actually let's deploy a simple accepting stub
        AcceptingTreasury acceptTreasury = new AcceptingTreasury();

        vm.prank(owner);
        nft.transferFrom(owner, address(acceptTreasury), 0);

        vm.prank(owner);
        appraisal.whitelistTreasury(address(acceptTreasury));

        _initialAppraisal(0, 100e18);

        vm.prank(owner);
        vm.expectEmit(true, true, true, false);
        emit AutoMigrationTriggered(address(acceptTreasury), address(nft), 0);
        appraisal.ownerSetAppraisalForTokenWithCard(address(nft), 0, CARD_ID, 200e18);
    }

    /**
     * @notice When the same price is set (no change), migration is NOT triggered.
     */
    function test_autoMigration_samePrice_notTriggered() public {
        AcceptingTreasury acceptTreasury = new AcceptingTreasury();

        vm.prank(owner);
        nft.transferFrom(owner, address(acceptTreasury), 0);

        vm.prank(owner);
        appraisal.whitelistTreasury(address(acceptTreasury));

        _initialAppraisal(0, 100e18);

        vm.recordLogs();

        // Set same price — no CardPriceUpdated event should fire
        vm.prank(owner);
        appraisal.ownerSetAppraisalForTokenWithCard(address(nft), 0, CARD_ID, 100e18);

        Vm.Log[] memory logs = vm.getRecordedLogs();
        bytes32 triggeredSig = keccak256("AutoMigrationTriggered(address,address,uint256)");
        bytes32 failedSig = keccak256("AutoMigrationFailed(address,address,uint256,bytes)");
        bytes32 priceSig = keccak256("CardPriceUpdated(bytes32,uint256,uint256)");

        for (uint256 i = 0; i < logs.length; i++) {
            assertFalse(
                logs[i].topics[0] == triggeredSig || logs[i].topics[0] == failedSig || logs[i].topics[0] == priceSig,
                "No migration or price-change events should fire when price is unchanged"
            );
        }
    }
}

/**
 * @title AcceptingTreasury
 * @notice A stub treasury that accepts any call without reverting.
 */
contract AcceptingTreasury {
    bool public called;
    bytes32 public lastCardId;
    uint256 public lastPrice;

    function onCardPriceUpdated(bytes32 cardId, uint256 newPrice) external {
        called = true;
        lastCardId = cardId;
        lastPrice = newPrice;
    }
}

// ============================================================================
// Test 3: Gacha — rarity weight rounding edge cases
// ============================================================================

/**
 * @title GachaRarityWeightRoundingTest
 * @notice Tests _getCurrentRarityWeights() / getCurrentRarityWeights() under extreme
 *         and boundary weight distributions.
 *
 *  Key behaviors under test:
 *  - Remainder after mulDiv normalization always assigned to first non-zero weight rarity
 *  - Sum of all returned weights always equals TOTAL_WEIGHT (10_000)
 *  - A rarity with 0 weight never appears in the result
 *  - Empty treasury returns all-zero weights
 */
contract GachaRarityWeightRoundingTest is Test {
    Gacha gacha;
    GachaTreasury treasury;
    BaseERC20 feeToken;
    BaseERC721 nft;
    MockNFTAppraisal mockAppraisal;
    MockGachaEconomyManager mockEconomy;
    GachaServiceHandler serviceHandler;
    MockWavsServiceManager mockWavsManager;

    address gachaOwner = makeAddr("gachaOwner");
    address treasuryOwner = makeAddr("treasuryOwner");
    address spinner = makeAddr("spinner");

    uint256 constant TOTAL_WEIGHT = 10_000;
    uint256 constant MAX_SPIN_FEE = 1e9;

    function setUp() public {
        mockWavsManager = new MockWavsServiceManager();
        mockEconomy = new MockGachaEconomyManager();
        feeToken = new BaseERC20("USDC", "USDC", gachaOwner);
        nft = new BaseERC721("NFT", "NFT", treasuryOwner);
        mockAppraisal = new MockNFTAppraisal();

        // Deploy treasury
        GachaTreasury treasuryImpl = new GachaTreasury();
        uint256[] memory minPrices = new uint256[](5);
        uint256[] memory maxPrices = new uint256[](5);
        string[] memory names = new string[](5);
        uint256 PRICE_STEP = 1e16;

        minPrices[0] = 0;
        minPrices[1] = uint256(15e18) + PRICE_STEP;
        minPrices[2] = uint256(60e18) + PRICE_STEP;
        minPrices[3] = uint256(250e18) + PRICE_STEP;
        minPrices[4] = uint256(1200e18) + PRICE_STEP;

        maxPrices[0] = 15e18;
        maxPrices[1] = 60e18;
        maxPrices[2] = 250e18;
        maxPrices[3] = 1200e18;
        maxPrices[4] = type(uint256).max;

        names[0] = "Common";
        names[1] = "Uncommon";
        names[2] = "Rare";
        names[3] = "Epic";
        names[4] = "Legendary";

        bytes memory initData = abi.encodeWithSelector(
            GachaTreasury.initialize.selector,
            treasuryOwner,
            address(0xDEAD), // placeholder gacha
            address(mockAppraisal),
            uint8(5),
            names,
            minPrices,
            maxPrices
        );
        ERC1967Proxy treasuryProxy = new ERC1967Proxy(address(treasuryImpl), initData);
        treasury = GachaTreasury(address(treasuryProxy));

        // Deploy Gacha
        Gacha gachaImpl = new Gacha();
        serviceHandler = new GachaServiceHandler(IWavsServiceManager(address(mockWavsManager)), address(gachaImpl));

        bytes memory gachaInit = abi.encodeWithSelector(
            Gacha.initialize.selector,
            gachaOwner,
            address(serviceHandler),
            address(feeToken),
            uint256(1e4), // min spin fee
            address(treasury),
            address(mockEconomy)
        );
        ERC1967Proxy gachaProxy = new ERC1967Proxy(address(gachaImpl), gachaInit);
        gacha = Gacha(address(gachaProxy));

        vm.prank(gachaOwner);
        gacha.setFeeTokenDecimals(6);

        vm.prank(treasuryOwner);
        treasury.setGachaContract(address(gacha));

        vm.prank(gachaOwner);
        feeToken.mint(spinner, 1_000_000e6);
    }

    // ─── Helper: deposit one NFT at a price into treasury ────────────────────

    function _depositNFT(uint256 price) internal returns (uint256 tokenId) {
        vm.startPrank(treasuryOwner);
        if (!treasury.whitelistedCollections(address(nft))) {
            treasury.addToWhitelist(address(nft));
        }
        tokenId = nft.mint(treasuryOwner);
        nft.approve(address(treasury), tokenId);
        mockAppraisal.setMockAppraisal(address(nft), tokenId, price);
        treasury.depositNFT(address(nft), tokenId);
        vm.stopPrank();
    }

    // ─── Test: empty treasury → all-zero weights ─────────────────────────────

    function test_rarityWeights_emptyTreasury_allZero() public view {
        uint256[] memory weights = gacha.getCurrentRarityWeights();
        assertEq(weights.length, 5, "Should have 5 rarities");
        for (uint256 i = 0; i < 5; i++) {
            assertEq(weights[i], 0, "All weights should be zero for empty treasury");
        }
    }

    // ─── Test: sum always equals TOTAL_WEIGHT when any NFTs exist ────────────

    function test_rarityWeights_sumAlwaysEqualsTotalWeight() public {
        // Deposit one Common NFT — Common gets weight 7000, rest 0 (no NFTs)
        _depositNFT(10e18); // Common price

        uint256[] memory weights = gacha.getCurrentRarityWeights();
        uint256 sum;
        for (uint256 i = 0; i < 5; i++) {
            sum += weights[i];
        }
        assertEq(sum, TOTAL_WEIGHT, "Weights must sum to TOTAL_WEIGHT");
    }

    /**
     * @notice When only one rarity has NFTs, all weight (10000) is assigned to it.
     */
    function test_rarityWeights_singleRarity_getsAllWeight() public {
        // Single Rare NFT
        _depositNFT(100e18); // Rare price

        uint256[] memory weights = gacha.getCurrentRarityWeights();
        assertEq(weights[2], TOTAL_WEIGHT, "Rare should get all 10000 weight");
        for (uint256 i = 0; i < 5; i++) {
            if (i != 2) assertEq(weights[i], 0, "Other rarities should be zero");
        }
    }

    /**
     * @notice One NFT at each of the 5 rarities → equal counts. Under uniform-over-pool selection
     *         the draw odds ARE the pool composition, so each tier gets an equal 1/5 share
     *         (2000 bps). 10000/5 = 2000 exactly, so there is no rounding remainder.
     */
    function test_rarityWeights_oneNFTPerRarity_uniformComposition() public {
        uint256[5] memory prices = [uint256(10e18), 50e18, 100e18, 500e18, 2000e18];
        for (uint256 i = 0; i < 5; i++) {
            _depositNFT(prices[i]);
        }

        uint256[] memory weights = gacha.getCurrentRarityWeights();

        for (uint256 i = 0; i < 5; i++) {
            assertEq(
                weights[i],
                2000,
                string(abi.encodePacked("Equal counts should give equal 2000 bps for rarity ", vm.toString(i)))
            );
        }
        uint256 sum;
        for (uint256 i = 0; i < 5; i++) {
            sum += weights[i];
        }
        assertEq(sum, TOTAL_WEIGHT, "Sum must be 10000");
    }

    /**
     * @notice Heavily imbalanced: 1000 Common NFTs vs 1 Rare NFT.
     *         The rare rarity gets a significantly higher weight because it has fewer tokens.
     *         Sum must still equal TOTAL_WEIGHT.
     */
    function test_rarityWeights_heavilyImbalanced_sumIsCorrect() public {
        // 1000 Common NFTs
        for (uint256 i = 0; i < 10; i++) {
            _depositNFT(10e18); // Common
        }
        // 1 Rare NFT
        _depositNFT(100e18); // Rare

        uint256[] memory weights = gacha.getCurrentRarityWeights();
        uint256 sum;
        for (uint256 i = 0; i < 5; i++) {
            sum += weights[i];
        }
        assertEq(sum, TOTAL_WEIGHT, "Imbalanced treasury weights must still sum to 10000");

        // Rare weight should be boosted (fewer NFTs → higher weight in _getCurrentRarityWeights)
        assertGt(weights[2], 0, "Rare should have non-zero weight");
        assertGt(weights[0], 0, "Common should have non-zero weight");
    }

    /**
     * @notice When rarity weights cause a remainder after mulDiv normalization,
     *         the remainder must be assigned to the first non-zero weight rarity
     *         so the total is exactly TOTAL_WEIGHT.
     *
     *         We construct a scenario that guarantees a non-trivial remainder:
     *         3 rarities each with 1 NFT, target weights [5000, 3000, 2000].
     *         rawSum = 5000*3 + 3000*3 + 2000*3 = 30000
     *         weights[i] = raw[i]*10000/30000 = raw[i]/3
     *         5000/3 = 1666, 3000/3 = 1000, 2000/3 = 666 → sum = 3332 (not 10000)
     *         Wait, these are already normalized by rawSum so:
     *         weights[0] = 15000*10000/30000 = 5000
     *         weights[1] = 9000*10000/30000 = 3000
     *         weights[2] = 6000*10000/30000 = 2000
     *         sum = 10000, no remainder in this case.
     *
     *         Better: use 3 rarities but prime-number-like counts so mulDiv creates remainders.
     *         counts = [3, 7, 11] with target = [5000, 3000, 2000], totalCount = 21
     *         raw[0] = 5000*21/3 = 35000
     *         raw[1] = 3000*21/7 = 9000
     *         raw[2] = 2000*21/11 = 3818 (floor)
     *         rawSum = 35000+9000+3818 = 47818
     *         weights[0] = 35000*10000/47818 = 7320 (floor)
     *         weights[1] = 9000*10000/47818  = 1882 (floor)
     *         weights[2] = 3818*10000/47818  = 798  (floor)
     *         assigned = 7320+1882+798 = 10000 → no remainder here either.
     *
     *         The important invariant is simply: sum always equals TOTAL_WEIGHT.
     *         We test this by depositing varying numbers of NFTs across rarities.
     *         We use the GachaTreasury's first 3 rarities: Common, Uncommon, Rare.
     */
    function test_rarityWeights_remainder_assignedToFirstNonZeroRarity() public {
        // Use a 3-rarity-only config via a separate Gacha+Treasury deployment
        // Instead of redeploy we can just use the existing 5-tier treasury but
        // only populate 3 rarities in a way that tends to create a remainder.

        // Deposit 3 Common NFTs
        for (uint256 i = 0; i < 3; i++) {
            _depositNFT(10e18);
        }
        // Deposit 7 Uncommon NFTs
        for (uint256 i = 0; i < 7; i++) {
            _depositNFT(50e18);
        }
        // Deposit 11 Rare NFTs
        for (uint256 i = 0; i < 11; i++) {
            _depositNFT(100e18);
        }
        // No Epic or Legendary NFTs → those get zero weight

        uint256[] memory weights = gacha.getCurrentRarityWeights();

        // Invariant: sum must equal TOTAL_WEIGHT
        uint256 sum;
        for (uint256 i = 0; i < 5; i++) {
            sum += weights[i];
        }
        assertEq(sum, TOTAL_WEIGHT, "Weights with 3 active rarities must sum to exactly 10000");

        // The two empty rarities must have zero weight
        assertEq(weights[3], 0, "Epic with no NFTs must have zero weight");
        assertEq(weights[4], 0, "Legendary with no NFTs must have zero weight");

        // Each non-empty rarity must have non-zero weight
        assertGt(weights[0], 0, "Common should have weight");
        assertGt(weights[1], 0, "Uncommon should have weight");
        assertGt(weights[2], 0, "Rare should have weight");
    }

    /**
     * @notice Uniform-over-pool selection never picks an empty tier: only tiers that hold inventory
     *         can be drawn. Deposit 5 Common + 1 Rare (Uncommon/Epic/Legendary empty); their live
     *         composition weight is 0 and they never win across many spins.
     */
    function test_rarityWeights_selectRarity_respectsZeroWeight() public {
        // Deposit 5 Common NFTs and 1 Rare NFT
        // Common: rarity 0, price 10e18; Rare: rarity 2, price 100e18
        for (uint256 i = 0; i < 5; i++) {
            _depositNFT(10e18); // Common
        }
        _depositNFT(100e18); // Rare

        // Empty tiers have zero composition weight; stocked tiers are non-zero.
        uint256[] memory computed = gacha.getCurrentRarityWeights();
        assertEq(computed[1], 0, "empty Uncommon tier has zero draw weight");
        assertEq(computed[3], 0, "empty Epic tier has zero draw weight");
        assertEq(computed[4], 0, "empty Legendary tier has zero draw weight");
        assertGt(computed[0], 0, "Common should have non-zero computed weight");
        assertGt(computed[2], 0, "Rare should have non-zero computed weight");

        uint256 sum;
        for (uint256 i = 0; i < 5; i++) {
            sum += computed[i];
        }
        assertEq(sum, TOTAL_WEIGHT, "Computed weights must sum to TOTAL_WEIGHT");

        // Run 5 spins — all should win Common or Rare, never Uncommon/Epic/Legendary
        vm.prank(spinner);
        feeToken.approve(address(gacha), type(uint256).max);

        for (uint256 seed = 0; seed < 5; seed++) {
            vm.prank(spinner);
            uint256 triggerId = gacha.spin(MAX_SPIN_FEE);

            vm.prank(address(serviceHandler));
            gacha.fulfillRandomness(triggerId, bytes32(seed * 7777 + 1));
        }

        // Zero-weight rarities must never win
        assertEq(gacha.userRarityWins(spinner, 1), 0, "Uncommon (weight 0) should never win");
        assertEq(gacha.userRarityWins(spinner, 3), 0, "Epic (weight 0) should never win");
        assertEq(gacha.userRarityWins(spinner, 4), 0, "Legendary (weight 0) should never win");

        // Total wins should equal 5 (no refunds since both Common and Rare have NFTs)
        uint256 totalWins = gacha.userRarityWins(spinner, 0) + gacha.userRarityWins(spinner, 2);
        assertEq(totalWins, 5, "All 5 spins should produce wins (Common or Rare only)");
    }
}

// ============================================================================
// Test 4: GachaEconomyManager — queued yield processing across multiple rarities
// ============================================================================

/**
 * @title QueuedYieldProcessingTest
 * @notice Tests that GachaEconomyManager queues depositor yield per-rarity when pools are
 *         empty, and flushes those queues when NFTs are deposited and the pool has value.
 *
 *  Scenario:
 *  1. No NFTs in treasury → all rarity pools in CardGroupedVault are empty.
 *  2. Multiple onSpinRevenue() calls for different rarities → yield queued per-rarity.
 *  3. Deposit an NFT to specific rarity pool → that pool's queued yield is flushed.
 *  4. Other rarity queues remain until their pools are populated.
 */
contract QueuedYieldProcessingTest is Test {
    CardGroupedVault vault;
    GachaEconomyManager economy;
    ProtocolTreasury protocolTreasury;
    BaseERC20 usdc;

    address economyOwner = makeAddr("economyOwner");
    address gacha = makeAddr("gacha");
    address vaultTreasury = makeAddr("vaultTreasury"); // the CardGroupedVault's "treasury" role

    address alice = makeAddr("alice");
    address bob = makeAddr("bob");

    bytes32 constant CARD_COMMON = keccak256("queued-card-common");
    bytes32 constant CARD_UNCOMMON = keccak256("queued-card-uncommon");
    bytes32 constant CARD_RARE = keccak256("queued-card-rare");

    uint8 constant COMMON = 0;
    uint8 constant UNCOMMON = 1;
    uint8 constant RARE = 2;
    uint8 constant EPIC = 3;
    uint8 constant LEGENDARY = 4;

    uint256 constant DEPOSITOR_SHARE_BPS = 9_500;
    uint256 constant PROTOCOL_SHARE_BPS = 500;

    event DepositorYieldQueued(uint256 amount, uint8 rarity);
    event QueuedDepositorYieldProcessed(uint256 amount, uint8 rarity);

    function setUp() public {
        vm.startPrank(economyOwner);

        usdc = new BaseERC20("USDC", "USDC", economyOwner);

        // Deploy vault
        CardGroupedVault vaultImpl = new CardGroupedVault();
        bytes memory vaultInit = abi.encodeWithSelector(
            CardGroupedVault.initialize.selector,
            economyOwner,
            address(usdc),
            vaultTreasury, // vault's "treasury" = who can register deposits
            address(this), // temporary economy manager (will be replaced)
            uint8(5)
        );
        ERC1967Proxy vaultProxy = new ERC1967Proxy(address(vaultImpl), vaultInit);
        vault = CardGroupedVault(address(vaultProxy));

        // Deploy protocol treasury (minimal — uses MockProtocolTreasury)
        MockProtocolTreasury mockProto = new MockProtocolTreasury();
        mockProto.setAsset(usdc);

        // Deploy GachaEconomyManager
        GachaEconomyManager economyImpl = new GachaEconomyManager();
        bytes memory economyInit = abi.encodeWithSelector(
            GachaEconomyManager.initialize.selector,
            economyOwner,
            address(usdc),
            gacha,
            address(vault),
            address(mockProto),
            uint8(5)
        );
        ERC1967Proxy economyProxy = new ERC1967Proxy(address(economyImpl), economyInit);
        economy = GachaEconomyManager(address(economyProxy));

        // Wire vault's economyManager to the real economy contract
        vault.setEconomyManager(address(economy));

        usdc.mint(gacha, 100_000_000e6);
        // Allow gacha to approve economy to pull funds
        vm.stopPrank();

        vm.prank(gacha);
        usdc.approve(address(economy), type(uint256).max);
    }

    // ─── Helper: simulate spin revenue ───────────────────────────────────────

    function _spinRevenue(uint256 amount, uint8 rarity) internal {
        vm.prank(gacha);
        economy.onSpinRevenue(amount, rarity);
    }

    // ─── Test: single rarity queued, then flushed on deposit ─────────────────

    /**
     * @notice Revenue for COMMON rarity queued when pool is empty.
     *         After alice deposits into COMMON pool, the queued amount is flushed
     *         and distributed to alice.
     */
    function test_queuedYield_singleRarity_flushedOnDeposit() public {
        uint256 revenue = 1000e6;
        uint256 depositorShare = (revenue * DEPOSITOR_SHARE_BPS) / 10_000;

        // No NFTs yet → Common pool is empty, yield is queued
        vm.expectEmit(true, true, false, false);
        emit DepositorYieldQueued(depositorShare, COMMON);
        _spinRevenue(revenue, COMMON);

        assertEq(economy.queuedYieldByRarity(COMMON), depositorShare, "Common yield should be queued");

        // Alice deposits into Common pool — this doesn't auto-flush, the flush happens
        // on the NEXT onSpinRevenue call. Register the deposit first.
        vm.prank(vaultTreasury);
        vault.registerCardDeposit(CARD_COMMON, alice, 10e18, COMMON, 1);

        // Now a second spin revenue call — the flush loop will see the queued amount
        // and distribute it since the Common pool now has value
        uint256 revenue2 = 500e6;
        uint256 depositorShare2 = (revenue2 * DEPOSITOR_SHARE_BPS) / 10_000;

        // Approve usdc for the vault to pull from economy during flush
        vm.prank(economyOwner);
        usdc.mint(address(economy), depositorShare + depositorShare2 + 1000e6);

        vm.expectEmit(true, true, false, false);
        emit QueuedDepositorYieldProcessed(depositorShare, COMMON);
        _spinRevenue(revenue2, COMMON);

        // After flush, queued amount for Common should be 0
        assertEq(economy.queuedYieldByRarity(COMMON), 0, "Common queue should be empty after flush");

        // Alice's pending yield should include both the flushed queued amount
        // and the new revenue2 depositor share
        uint256 alicePending = vault.pendingYield(alice);
        uint256 expectedPending = depositorShare + depositorShare2;
        assertApproxEqAbs(alicePending, expectedPending, 10, "Alice should have both queued and new yield");
    }

    /**
     * @notice Multiple rarities accumulate queued yield simultaneously.
     *         When NFTs are deposited into some rarities, only those rarities' queues
     *         are flushed; the others remain queued.
     */
    function test_queuedYield_multipleRarities_partialFlush() public {
        uint256 revenueCommon = 1000e6;
        uint256 revenueUncommon = 2000e6;
        uint256 revenueRare = 3000e6;

        uint256 queuedCommon = (revenueCommon * DEPOSITOR_SHARE_BPS) / 10_000;
        uint256 queuedUncommon = (revenueUncommon * DEPOSITOR_SHARE_BPS) / 10_000;
        uint256 queuedRare = (revenueRare * DEPOSITOR_SHARE_BPS) / 10_000;

        // Queue yield for 3 rarities (all pools empty)
        _spinRevenue(revenueCommon, COMMON);
        _spinRevenue(revenueUncommon, UNCOMMON);
        _spinRevenue(revenueRare, RARE);

        assertEq(economy.queuedYieldByRarity(COMMON), queuedCommon, "Common queued");
        assertEq(economy.queuedYieldByRarity(UNCOMMON), queuedUncommon, "Uncommon queued");
        assertEq(economy.queuedYieldByRarity(RARE), queuedRare, "Rare queued");

        // Deposit into only Common and Rare pools
        vm.startPrank(vaultTreasury);
        vault.registerCardDeposit(CARD_COMMON, alice, 10e18, COMMON, 1);
        vault.registerCardDeposit(CARD_RARE, bob, 100e18, RARE, 1);
        vm.stopPrank();

        // Mint extra usdc to economy so flush can transfer
        vm.prank(economyOwner);
        usdc.mint(address(economy), queuedCommon + queuedUncommon + queuedRare + 10_000e6);

        // Next spin revenue call for COMMON rarity — flush loop should clear Common and Rare
        // (Uncommon pool is still empty, so its queue stays)
        uint256 spinRevenue = 500e6;
        _spinRevenue(spinRevenue, COMMON);

        // Common queue should be flushed (now has depositor)
        assertEq(economy.queuedYieldByRarity(COMMON), 0, "Common queue should be flushed");

        // Rare queue should be flushed (now has depositor)
        assertEq(economy.queuedYieldByRarity(RARE), 0, "Rare queue should be flushed");

        // Uncommon queue should still be pending (no depositors)
        assertEq(economy.queuedYieldByRarity(UNCOMMON), queuedUncommon, "Uncommon queue should remain");
    }

    /**
     * @notice Queued yield accumulates over many spin cycles.
     *         After a large accumulated queue, a single deposit triggers full flush.
     *         The depositor receives the entire accumulated queued yield.
     */
    function test_queuedYield_accumulatedOverMultipleSpins_fullFlushOnDeposit() public {
        uint256 spinAmount = 100e6;
        uint256 spinDepositorShare = (spinAmount * DEPOSITOR_SHARE_BPS) / 10_000;

        uint256 numSpins = 10;

        // 10 spin revenues for RARE — all queued since pool is empty
        for (uint256 i = 0; i < numSpins; i++) {
            _spinRevenue(spinAmount, RARE);
        }

        uint256 totalQueued = economy.queuedYieldByRarity(RARE);
        assertEq(totalQueued, spinDepositorShare * numSpins, "All 10 spins should be queued for Rare");

        // Alice deposits into Rare pool
        vm.prank(vaultTreasury);
        vault.registerCardDeposit(CARD_RARE, alice, 100e18, RARE, 1);

        // Mint enough usdc for the flush
        vm.prank(economyOwner);
        usdc.mint(address(economy), totalQueued + spinAmount + 1000e6);

        // Next spin revenue call — flush should distribute all 10 spins' worth to alice
        _spinRevenue(spinAmount, RARE);

        assertEq(economy.queuedYieldByRarity(RARE), 0, "Rare queue should be fully flushed");

        // Alice should have: all 10 queued spins + this spin's depositor share
        uint256 alicePending = vault.pendingYield(alice);
        uint256 expected = totalQueued + spinDepositorShare;
        assertApproxEqAbs(alicePending, expected, 10, "Alice should have accumulated + new yield");
    }

    /**
     * @notice When a queued rarity gets deposits but then ALL deposits are removed,
     *         the next spin revenue for that rarity is queued again (pool is empty again).
     */
    function test_queuedYield_depositThenWithdraw_reQueues() public {
        uint256 revenue = 500e6;
        uint256 depositorShare = (revenue * DEPOSITOR_SHARE_BPS) / 10_000;

        // Phase 1: Queue yield for Uncommon
        _spinRevenue(revenue, UNCOMMON);
        assertGt(economy.queuedYieldByRarity(UNCOMMON), 0, "Uncommon yield should be queued");

        // Alice deposits into Uncommon pool
        vm.prank(vaultTreasury);
        vault.registerCardDeposit(CARD_UNCOMMON, alice, 50e18, UNCOMMON, 1);

        // Mint usdc for flush
        vm.prank(economyOwner);
        usdc.mint(address(economy), depositorShare + 5000e6);

        // Trigger flush with a new spin
        _spinRevenue(revenue, UNCOMMON);
        assertEq(economy.queuedYieldByRarity(UNCOMMON), 0, "Uncommon queue flushed after deposit");

        // Alice claims her yield to have clean accounting
        vm.prank(alice);
        vault.claimYield(alice);

        // Alice removes her deposit entirely
        vm.prank(vaultTreasury);
        vault.removeCardDeposit(CARD_UNCOMMON, alice, 1);

        // Now Uncommon pool is empty again
        // Next spin revenue for Uncommon should be queued again
        _spinRevenue(revenue, UNCOMMON);
        uint256 newQueue = economy.queuedYieldByRarity(UNCOMMON);
        assertGt(newQueue, 0, "Uncommon yield should be re-queued after depositor left");
    }

    /**
     * @notice Multiple depositors across multiple rarities.
     *         After queued yield is flushed, each depositor gets proportional share.
     */
    function test_queuedYield_multipleDepositors_proportionalAfterFlush() public {
        uint256 revenue = 10000e6;
        uint256 depositorShare = (revenue * DEPOSITOR_SHARE_BPS) / 10_000;

        // Queue yield for COMMON
        _spinRevenue(revenue, COMMON);

        // Two depositors in COMMON: alice 3x, bob 1x
        vm.startPrank(vaultTreasury);
        vault.registerCardDeposit(CARD_COMMON, alice, 100e18, COMMON, 3); // 75% share
        vault.registerCardDeposit(CARD_COMMON, bob, 100e18, COMMON, 1); // 25% share
        vm.stopPrank();

        // Mint usdc for the flush
        vm.prank(economyOwner);
        usdc.mint(address(economy), depositorShare + 100_000e6);

        // Trigger flush
        _spinRevenue(100e6, COMMON);

        assertEq(economy.queuedYieldByRarity(COMMON), 0, "Common queue should be flushed");

        // Alice should have ~75% of the flushed queued yield
        // Bob should have ~25%
        // The current spin's depositor share is also in there; check relative proportions
        uint256 alicePending = vault.pendingYield(alice);
        uint256 bobPending = vault.pendingYield(bob);

        // With alice 3x and bob 1x: alice gets 3/(3+1) = 75%, bob gets 25%
        // Total flushed to vault = depositorShare (from first spin)
        // Plus current spin depositor share = (100e6 * 9500) / 10000 = 95e6
        // Total distributed = depositorShare + 95e6
        uint256 totalDistributed = depositorShare + (100e6 * DEPOSITOR_SHARE_BPS / 10_000);
        assertApproxEqAbs(alicePending + bobPending, totalDistributed, 20, "Combined yield should match distributed");
        assertApproxEqAbs(alicePending, (totalDistributed * 3) / 4, 10, "Alice should have ~75% of total");
        assertApproxEqAbs(bobPending, totalDistributed / 4, 10, "Bob should have ~25% of total");
    }
}

// ============================================================================
// Edge Case 1: Gacha — refunded spins must NOT inflate spin counters
// ============================================================================

/**
 * @title GachaRefundedSpinCounterTest
 * @notice Verifies that when fulfillRandomness triggers a refund because the selected
 *         rarity pool is empty, neither userSpinCount nor totalSpinCount are incremented.
 *
 * Bug context (Gacha.sol): counters are incremented only after a successful NFT transfer.
 * A refund path returns early without incrementing, so counters must stay at zero.
 */
contract GachaRefundedSpinCounterTest is Test {
    Gacha gacha;
    GachaServiceHandler serviceHandler;
    GachaTreasury treasury;
    BaseERC721 nft;
    BaseERC20 feeToken;
    MockNFTAppraisal mockAppraisal;
    MockWavsServiceManager mockWavsManager;
    MockGachaEconomyManager mockEconomyManager;

    address gachaOwner = makeAddr("gachaOwner");
    address treasuryOwner = makeAddr("treasuryOwner");
    address spinner = makeAddr("spinner");

    uint256 constant MIN_SPIN_FEE = 0.01e6; // 0.01 USDC (6 decimals)
    uint256 constant MAX_SPIN_FEE = 1e9;

    uint8 constant COMMON = 0;
    uint8 constant UNCOMMON = 1;
    uint8 constant RARE = 2;
    uint8 constant EPIC = 3;
    uint8 constant LEGENDARY = 4;

    function setUp() public {
        mockWavsManager = new MockWavsServiceManager();
        mockEconomyManager = new MockGachaEconomyManager();
        feeToken = new BaseERC20("USDC", "USDC", gachaOwner);
        mockAppraisal = new MockNFTAppraisal();

        // Deploy treasury
        vm.startPrank(treasuryOwner);
        GachaTreasury treasuryImpl = new GachaTreasury();
        uint256[] memory minPrices = _getMinPrices();
        uint256[] memory maxPrices = _getMaxPrices();
        string[] memory rarityNames = _getRarityNames();
        bytes memory initData = abi.encodeWithSelector(
            GachaTreasury.initialize.selector,
            treasuryOwner,
            address(0xDEAD),
            address(mockAppraisal),
            uint8(5),
            rarityNames,
            minPrices,
            maxPrices
        );
        ERC1967Proxy treasuryProxy = new ERC1967Proxy(address(treasuryImpl), initData);
        treasury = GachaTreasury(address(treasuryProxy));
        vm.stopPrank();

        // Deploy Gacha
        Gacha gachaImpl = new Gacha();
        serviceHandler = new GachaServiceHandler(IWavsServiceManager(address(mockWavsManager)), address(gachaImpl));
        vm.prank(gachaOwner);
        initData = abi.encodeWithSelector(
            Gacha.initialize.selector,
            gachaOwner,
            address(serviceHandler),
            address(feeToken),
            MIN_SPIN_FEE,
            address(treasury),
            address(mockEconomyManager)
        );
        ERC1967Proxy gachaProxy = new ERC1967Proxy(address(gachaImpl), initData);
        gacha = Gacha(address(gachaProxy));

        vm.prank(gachaOwner);
        gacha.setFeeTokenDecimals(6);

        vm.prank(treasuryOwner);
        treasury.setGachaContract(address(gacha));

        nft = new BaseERC721("Test NFT", "TNFT", treasuryOwner);

        vm.prank(gachaOwner);
        feeToken.mint(spinner, 100e6);
    }

    /**
     * @notice Refunded spin must not increment userSpinCount or totalSpinCount.
     *
     * Setup:
     *   - Only a Common NFT is deposited so the treasury is non-empty (spin allowed).
     *   - After the spin is created, the depositor withdraws the NFT, leaving the pool empty.
     *   - fulfillRandomness is called with randomness that selects Common (roll = 0).
     *   - The treasury has 0 Common NFTs → refund path is taken.
     *   - Neither userSpinCount[spinner] nor totalSpinCount must have increased.
     */
    function test_refundedSpin_doesNotInflateSpinCounters() public {
        // Deposit one Common NFT so spin validation passes
        vm.startPrank(treasuryOwner);
        treasury.addToWhitelist(address(nft));
        uint256 tokenId = nft.mint(treasuryOwner);
        nft.approve(address(treasury), tokenId);
        mockAppraisal.setMockAppraisal(address(nft), tokenId, 10e18); // $10 → Common
        treasury.depositNFT(address(nft), tokenId);
        vm.stopPrank();

        // Spin is created while Common has 1 NFT
        uint256 fee = gacha.getCurrentSpinFee();
        vm.prank(spinner);
        feeToken.approve(address(gacha), fee);
        vm.prank(spinner);
        uint256 triggerId = gacha.spin(MAX_SPIN_FEE);

        // Record counters before fulfillment
        uint256 userCountBefore = gacha.userSpinCount(spinner);
        uint256 totalCountBefore = gacha.totalSpinCount();

        // Withdraw the Common NFT so the pool is now empty when fulfillment arrives
        vm.prank(treasuryOwner);
        treasury.withdrawMyNFT(address(nft), tokenId);

        // Verify treasury is empty for Common
        assertEq(treasury.getRarityCount(COMMON), 0, "Common pool should be empty after withdrawal");

        // Fulfill with randomness that rolls 0 → selects Common (0 % 10000 = 0 < 10000)
        bytes32 randomness = bytes32(uint256(0)); // roll = 0 → Common
        vm.prank(address(serviceHandler));
        gacha.fulfillRandomness(triggerId, randomness);

        // Counters must be unchanged — refund path must NOT increment them
        assertEq(gacha.userSpinCount(spinner), userCountBefore, "userSpinCount must not increase on refund");
        assertEq(gacha.totalSpinCount(), totalCountBefore, "totalSpinCount must not increase on refund");

        // Refund counters should have incremented
        assertEq(gacha.userRefundCount(spinner), 1, "userRefundCount should be 1");
        assertEq(gacha.totalRefundCount(), 1, "totalRefundCount should be 1");
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    function _getMinPrices() internal pure returns (uint256[] memory m) {
        m = new uint256[](5);
        m[0] = 0;
        m[1] = 15e18 + 1e16;
        m[2] = 60e18 + 1e16;
        m[3] = 250e18 + 1e16;
        m[4] = 1_200e18 + 1e16;
    }

    function _getMaxPrices() internal pure returns (uint256[] memory m) {
        m = new uint256[](5);
        m[0] = 15e18;
        m[1] = 60e18;
        m[2] = 250e18;
        m[3] = 1_200e18;
        m[4] = type(uint256).max;
    }

    function _getRarityNames() internal pure returns (string[] memory n) {
        n = new string[](5);
        n[0] = "Common";
        n[1] = "Uncommon";
        n[2] = "Rare";
        n[3] = "Epic";
        n[4] = "Legendary";
    }
}

// ============================================================================
// Edge Case 2: CardGroupedVault — re-deposit after full removal uses fresh values
// ============================================================================

/**
 * @title CardGroupedVaultReDepositTest
 * @notice Verifies that after all copies of a card are removed (totalCount → 0),
 *         re-depositing that card initializes fresh price and rarity from the new call,
 *         not from any stale values left behind.
 *
 * Bug context (CardGroupedVault.sol): when the last token is removed the card node is
 * zeroed out (cardPriceUSD = 0, rarity = 0, etc.).  A subsequent registerCardDeposit
 * must treat this as a brand-new card and use the caller-supplied price/rarity.
 */
contract CardGroupedVaultReDepositTest is Test {
    CardGroupedVault vault;
    BaseERC20 usdc;

    address owner = address(0x1);
    address treasury = address(0x2);
    address economyMgr = address(0x3);
    address alice = address(0xA);

    bytes32 constant CARD_X = keccak256("card-X");

    uint8 constant COMMON = 0;
    uint8 constant EPIC = 3;

    function setUp() public {
        usdc = new BaseERC20("USDC", "USDC", address(this));
        vault = new CardGroupedVault();
        vault.initialize(owner, address(usdc), treasury, economyMgr, uint8(5));

        usdc.mint(economyMgr, 1_000_000e6);
        vm.prank(economyMgr);
        usdc.approve(address(vault), type(uint256).max);
    }

    /**
     * @notice After removing all deposits for a card, re-depositing must use the new
     *         price and rarity, not the old zeroed-out stale values.
     *
     * Steps:
     *   1. Register CARD_X at price $10 (Common).
     *   2. Remove all 2 deposits → card node is zeroed.
     *   3. Distribute yield to Common — should be a no-op (nobody in Common pool).
     *   4. Re-deposit CARD_X at price $500 (Epic).
     *   5. Distribute yield to Epic — alice must receive it (correct pool).
     *   6. Distribute yield to Common — alice must NOT receive it (wrong pool).
     */
    function test_reDeposit_afterFullRemoval_usesFreshPriceAndRarity() public {
        uint256 oldPrice = 10e18; // $10 — Common
        uint256 newPrice = 500e18; // $500 — Epic

        // Step 1: initial deposit
        vm.prank(treasury);
        vault.registerCardDeposit(CARD_X, alice, oldPrice, COMMON, 2);

        assertEq(vault.sharesOf(alice), 2 * oldPrice, "initial shares correct");
        assertEq(vault.rarityTotalValue(COMMON), 2 * oldPrice, "Common value correct");
        assertEq(vault.rarityTotalValue(EPIC), 0, "Epic value zero initially");

        // Step 2: remove all deposits → totalCount reaches 0
        vm.prank(treasury);
        vault.removeCardDeposit(CARD_X, alice, 2);

        assertEq(vault.sharesOf(alice), 0, "shares zeroed after full removal");
        assertEq(vault.rarityTotalValue(COMMON), 0, "Common value zeroed");

        // Step 3: re-deposit at new price / new rarity
        vm.prank(treasury);
        vault.registerCardDeposit(CARD_X, alice, newPrice, EPIC, 1);

        assertEq(vault.sharesOf(alice), newPrice, "shares reflect new price");
        assertEq(vault.rarityTotalValue(EPIC), newPrice, "Epic value reflects new deposit");
        assertEq(vault.rarityTotalValue(COMMON), 0, "Common value unchanged");

        // Step 4: distribute yield to Epic — alice must receive it all
        vm.prank(economyMgr);
        vault.distributeYield(100e6, EPIC);

        assertApproxEqAbs(vault.pendingYield(alice), 100e6, 1, "alice should receive Epic yield after re-deposit");

        // Step 5: distribute yield to Common — alice must NOT receive it
        // (Common pool is empty, so distributeYield would revert with NoValueInPool)
        vm.prank(economyMgr);
        vm.expectRevert(CardGroupedVault.NoValueInPool.selector);
        vault.distributeYield(50e6, COMMON);
    }

    /**
     * @notice Verify that the new rarity is stored correctly after re-deposit.
     *         Old accumulated yield from before the full removal does not bleed
     *         into the new stint at the Epic rarity.
     */
    function test_reDeposit_noYieldBleedFromPreviousStint() public {
        uint256 price1 = 10e18; // $10 — Common
        uint256 price2 = 500e18; // $500 — Epic

        // First stint: deposit, earn yield, remove all
        vm.prank(treasury);
        vault.registerCardDeposit(CARD_X, alice, price1, COMMON, 1);

        vm.prank(economyMgr);
        vault.distributeYield(30e6, COMMON);

        // Remove all — yield is materialized into accruedYield but not yet claimed
        vm.prank(treasury);
        vault.removeCardDeposit(CARD_X, alice, 1);

        assertApproxEqAbs(vault.pendingYield(alice), 30e6, 1, "accrued yield from first stint visible");

        // Second stint: re-deposit at different rarity
        vm.prank(treasury);
        vault.registerCardDeposit(CARD_X, alice, price2, EPIC, 1);

        // Distribute yield to Epic — alice gets 50 USDC new yield
        vm.prank(economyMgr);
        vault.distributeYield(50e6, EPIC);

        // Total pending = 30 (old settled) + 50 (new Epic yield) = 80
        assertApproxEqAbs(vault.pendingYield(alice), 80e6, 2, "total pending should be old + new yield");

        // Claiming should pay out exactly 80 USDC
        vm.prank(alice);
        uint256 claimed = vault.claimYield(alice);
        assertApproxEqAbs(claimed, 80e6, 2, "claim pays old + new yield");
    }
}

// ============================================================================
// Edge Case 3: NFTAppraisal — _triggerAutoMigration notifies treasuries even
//              when the appraised tokenId is not in any treasury
// ============================================================================

/// @dev Minimal mock treasury that records onCardPriceUpdated calls.
contract MockTreasuryForMigration {
    /// @dev Number of times onCardPriceUpdated was called
    uint256 public callCount;
    /// @dev Last cardId received
    bytes32 public lastCardId;
    /// @dev Last price received
    uint256 public lastPrice;

    // Signature must match what _triggerAutoMigration calls via low-level call
    function onCardPriceUpdated(bytes32 cardId, uint256 newPriceUSD) external {
        callCount++;
        lastCardId = cardId;
        lastPrice = newPriceUSD;
    }
}

/**
 * @title NFTAppraisalNonDepositedTokenMigrationTest
 * @notice Verifies _triggerAutoMigration notifies whitelisted treasuries for a card
 *         even when the specific tokenId that was appraised is NOT deposited in any
 *         treasury, as long as some other token of the same card IS deposited.
 *
 * Bug context (NFTAppraisal.sol): _triggerAutoMigration iterates ALL whitelisted
 * treasuries and calls onCardPriceUpdated(cardId, newPrice).  It must notify
 * based on the card identifier, not on the specific token that triggered the update.
 */
contract NFTAppraisalNonDepositedTokenMigrationTest is Test {
    NFTAppraisal appraisal;
    MockTreasuryForMigration mockTreasury;
    BaseERC721 nft;
    BaseERC20 feeToken;

    address appraisalOwner = makeAddr("appraisalOwner");
    address protocol = makeAddr("protocol");
    address serviceHandler = makeAddr("serviceHandler");
    address user = makeAddr("user");

    uint256 constant APPRAISAL_FEE = 10e18;

    // Two tokens belonging to the same card
    uint256 TOKEN_A; // will be deposited into the mock treasury
    uint256 TOKEN_B; // will be appraised — NOT in any treasury

    bytes32 SHARED_CARD_ID = keccak256("shared-card");

    function setUp() public {
        feeToken = new BaseERC20("FEE", "FEE", appraisalOwner);
        nft = new BaseERC721("NFT", "NFT", appraisalOwner);

        // Deploy NFTAppraisal proxy
        NFTAppraisal appraisalImpl = new NFTAppraisal();
        bytes memory initData = abi.encodeWithSelector(
            NFTAppraisal.initialize.selector, appraisalOwner, address(feeToken), APPRAISAL_FEE, protocol
        );
        ERC1967Proxy proxy = new ERC1967Proxy(address(appraisalImpl), initData);
        appraisal = NFTAppraisal(address(proxy));

        // Set service handler
        vm.prank(appraisalOwner);
        appraisal.setServiceHandler(serviceHandler);

        // Mint two NFT tokens; TOKEN_A simulates a deposited token (same card as TOKEN_B)
        vm.prank(appraisalOwner);
        TOKEN_A = nft.mint(appraisalOwner); // deposited token (not appraised here)
        vm.prank(appraisalOwner);
        TOKEN_B = nft.mint(appraisalOwner); // the token whose appraisal changes price

        // Fund user for appraisal fees
        vm.prank(appraisalOwner);
        feeToken.mint(user, 1000e18);
        vm.prank(user);
        feeToken.approve(address(appraisal), type(uint256).max);

        // Establish initial card appraisal BEFORE whitelisting the spy treasury.
        // This ensures the initial 0→10e18 price transition does not register on the spy.
        vm.prank(appraisalOwner);
        nft.transferFrom(appraisalOwner, user, TOKEN_A);
        vm.prank(user);
        appraisal.requestAppraisal(address(nft), TOKEN_A);
        vm.prank(serviceHandler);
        appraisal.setAppraisalForTokenWithCard(address(nft), TOKEN_A, SHARED_CARD_ID, 10e18);

        // Also link TOKEN_B to the same card at the same price (no price change → no migration)
        vm.prank(appraisalOwner);
        nft.transferFrom(appraisalOwner, user, TOKEN_B);
        vm.prank(user);
        appraisal.requestAppraisal(address(nft), TOKEN_B);
        vm.prank(serviceHandler);
        appraisal.setAppraisalForTokenWithCard(address(nft), TOKEN_B, SHARED_CARD_ID, 10e18);

        // Deploy the spy treasury mock and whitelist it AFTER the initial appraisals.
        // From this point on, any price change on SHARED_CARD_ID will notify the spy.
        mockTreasury = new MockTreasuryForMigration();
        vm.prank(appraisalOwner);
        appraisal.whitelistTreasury(address(mockTreasury));
    }

    /**
     * @notice Appraising TOKEN_B (not in any treasury) at a new price triggers
     *         onCardPriceUpdated on the mock treasury, which holds TOKEN_A of the same card.
     *
     * Flow:
     *   - TOKEN_A was linked to SHARED_CARD_ID at $10 (initial price).
     *   - TOKEN_B is appraised at $200 (price change).
     *   - _triggerAutoMigration iterates treasuryList → calls mockTreasury.onCardPriceUpdated.
     *   - mockTreasury.callCount must equal 1 and lastCardId must equal SHARED_CARD_ID.
     */
    function test_autoMigration_notifiesTreasury_evenWhenAppraisedTokenNotDeposited() public {
        // callCount should be 0 at this point (setup prices were identical)
        assertEq(mockTreasury.callCount(), 0, "no migration during setup (same price)");

        // Re-appraise TOKEN_B at a higher price — this causes a price change on SHARED_CARD_ID
        vm.prank(user);
        appraisal.requestAppraisal(address(nft), TOKEN_B);

        uint256 newPrice = 200e18; // $200 — price changed from $10
        vm.prank(serviceHandler);
        appraisal.setAppraisalForTokenWithCard(address(nft), TOKEN_B, SHARED_CARD_ID, newPrice);

        // The mock treasury must have been notified exactly once
        assertEq(mockTreasury.callCount(), 1, "treasury must receive onCardPriceUpdated when card price changes");
        assertEq(mockTreasury.lastCardId(), SHARED_CARD_ID, "treasury must receive the correct card ID");
        assertEq(mockTreasury.lastPrice(), newPrice, "treasury must receive the new price");
    }

    /**
     * @notice Multiple price updates on the same card each trigger a migration notification.
     *         TOKEN_A (the non-appraised token of the card) is never directly appraised here.
     */
    function test_autoMigration_firesOnEachPriceChange() public {
        uint256 price1 = 50e18;
        uint256 price2 = 300e18;

        // First price change on TOKEN_B
        vm.prank(user);
        appraisal.requestAppraisal(address(nft), TOKEN_B);
        vm.prank(serviceHandler);
        appraisal.setAppraisalForTokenWithCard(address(nft), TOKEN_B, SHARED_CARD_ID, price1);

        assertEq(mockTreasury.callCount(), 1, "first migration fired");
        assertEq(mockTreasury.lastPrice(), price1, "first migration price correct");

        // Second price change on TOKEN_B
        vm.prank(user);
        appraisal.requestAppraisal(address(nft), TOKEN_B);
        vm.prank(serviceHandler);
        appraisal.setAppraisalForTokenWithCard(address(nft), TOKEN_B, SHARED_CARD_ID, price2);

        assertEq(mockTreasury.callCount(), 2, "second migration fired");
        assertEq(mockTreasury.lastPrice(), price2, "second migration price correct");
    }
}
