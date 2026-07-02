// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Test} from "forge-std/Test.sol";
import {IERC721Receiver} from "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

import {Gacha} from "../src/gacha/Gacha.sol";
import {GachaTreasury} from "../src/gacha/GachaTreasury.sol";
import {GachaEconomyManager} from "../src/economy/GachaEconomyManager.sol";
import {CardGroupedVault} from "../src/economy/CardGroupedVault.sol";
import {ProtocolTreasury} from "../src/economy/ProtocolTreasury.sol";
import {NFTAppraisal} from "../src/appraisal/NFTAppraisal.sol";
import {BaseERC721} from "../src/tokens/BaseERC721.sol";
import {MockERC20} from "./mocks/MockERC20.sol";

/**
 * @title Integration Tests
 * @notice Cross-contract integration tests exercising the full NFT Gacha system
 *         with real (non-mock) contract deployments.
 *
 * ## Test Scenarios
 *
 *   1. Full spin-to-yield-claim
 *      Spin → fulfill randomness → economy split → depositor claims yield
 *
 *   2. Auto-migration end-to-end
 *      NFTAppraisal price update → GachaTreasury.onCardPriceUpdated()
 *      → CardGroupedVault.migrateCardRarity()
 *
 *   3. Redemption full flow
 *      Winner gets NFT → redeems through ProtocolTreasury
 *      → NFT restocked in treasury → yield implications
 */
contract IntegrationTest is Test, IERC721Receiver {
    // ─── Price ranges ────────────────────────────────────────────────────────
    uint256 private constant PRICE_STEP = 1e16;

    // Common: $0 – $15
    uint256 private constant COMMON_PRICE = 10e18;
    // Uncommon: $15.01 – $60
    uint256 private constant UNCOMMON_PRICE = 50e18;
    // Rare: $60.01 – $250
    uint256 private constant RARE_PRICE = 100e18;
    // Epic: $250.01 – $1200
    uint256 private constant EPIC_PRICE = 500e18;
    // Legendary: $1200.01+
    uint256 private constant LEGENDARY_PRICE = 2_000e18;

    // ─── Spin / fee constants ────────────────────────────────────────────────
    uint256 private constant MIN_SPIN_FEE = 1e6; // 1 USDC (6 dec)
    uint256 private constant MAX_FEE_GUARD = 1_000e6; // generous cap for tests

    // ─── Contracts ───────────────────────────────────────────────────────────
    MockERC20 internal usdc;
    BaseERC721 internal nftCollection;
    NFTAppraisal internal appraisal;
    GachaTreasury internal treasury;
    CardGroupedVault internal vault;
    ProtocolTreasury internal protocolTreasury;
    GachaEconomyManager internal economy;
    Gacha internal gacha;

    // ─── Actors ──────────────────────────────────────────────────────────────
    address internal owner = makeAddr("owner");
    address internal depositor = makeAddr("depositor");
    address internal spinner = makeAddr("spinner");
    address internal fakeServiceHandler = makeAddr("serviceHandler");

    // ─── Events (for expectEmit) ─────────────────────────────────────────────
    event SpinCompleted(
        uint256 indexed triggerId,
        address indexed requester,
        uint8 rarity,
        address collection,
        uint256 tokenId,
        uint256 appraisedPrice
    );
    event RarityMigrated(
        address indexed collection, uint256 indexed tokenId, uint8 oldRarity, uint8 newRarity, uint256 newPrice
    );

    // ─── Setup ───────────────────────────────────────────────────────────────

    function setUp() public {
        // ── 1. Tokens & NFT collection ──────────────────────────────────────
        // Use 6-decimal USDC so fee token amounts are in cents, consistent with real USDC
        usdc = new MockERC20("USD Coin", "USDC", 6);
        nftCollection = new BaseERC721("Test NFT", "TNFT", owner);

        // ── 2. NFTAppraisal (UUPS proxy, owner-controlled) ──────────────────
        vm.startPrank(owner);
        {
            NFTAppraisal appraisalImpl = new NFTAppraisal();
            bytes memory initData = abi.encodeWithSelector(
                NFTAppraisal.initialize.selector,
                owner, // owner
                address(usdc), // feeToken (not used in these tests — owner override)
                0, // appraisalFee = 0 for simplicity
                address(owner) // protocolAddress
            );
            ERC1967Proxy proxy = new ERC1967Proxy(address(appraisalImpl), initData);
            appraisal = NFTAppraisal(address(proxy));
        }
        vm.stopPrank();

        // ── 3. GachaTreasury (bare, no proxy for simplicity) ────────────────
        treasury = new GachaTreasury();
        {
            uint256[] memory minPrices = new uint256[](5);
            minPrices[0] = 0;
            minPrices[1] = uint256(15e18) + PRICE_STEP;
            minPrices[2] = uint256(60e18) + PRICE_STEP;
            minPrices[3] = uint256(250e18) + PRICE_STEP;
            minPrices[4] = uint256(1_200e18) + PRICE_STEP;

            uint256[] memory maxPrices = new uint256[](5);
            maxPrices[0] = uint256(15e18);
            maxPrices[1] = uint256(60e18);
            maxPrices[2] = uint256(250e18);
            maxPrices[3] = uint256(1_200e18);
            maxPrices[4] = type(uint256).max;

            string[] memory names = new string[](5);
            names[0] = "Common";
            names[1] = "Uncommon";
            names[2] = "Rare";
            names[3] = "Epic";
            names[4] = "Legendary";

            treasury.initialize(
                owner,
                address(this), // placeholder gacha — overwritten after Gacha deploy
                address(appraisal),
                uint8(5),
                names,
                minPrices,
                maxPrices
            );
        }

        // ── 4. CardGroupedVault ─────────────────────────────────────────────
        vault = new CardGroupedVault();
        vault.initialize(owner, address(usdc), address(treasury), address(this), uint8(5));

        // ── 5. ProtocolTreasury ─────────────────────────────────────────────
        protocolTreasury = new ProtocolTreasury();
        protocolTreasury.initialize(owner, address(usdc), address(this), address(treasury), address(appraisal));

        // ── 6. GachaEconomyManager ──────────────────────────────────────────
        economy = new GachaEconomyManager();
        economy.initialize(
            owner,
            address(usdc),
            address(this), // placeholder gacha — overwritten after Gacha deploy
            address(vault),
            address(protocolTreasury),
            uint8(5)
        );

        // ── 7. Gacha (UUPS proxy) ───────────────────────────────────────────
        vm.startPrank(owner);
        {
            Gacha gachaImpl = new Gacha();
            bytes memory initData = abi.encodeWithSelector(
                Gacha.initialize.selector,
                owner,
                fakeServiceHandler, // service handler (we call fulfillRandomness directly)
                address(usdc),
                MIN_SPIN_FEE,
                address(treasury),
                address(economy)
            );
            ERC1967Proxy proxy = new ERC1967Proxy(address(gachaImpl), initData);
            gacha = Gacha(address(proxy));
        }
        vm.stopPrank();

        // ── 8. Wire everything together ─────────────────────────────────────
        vm.startPrank(owner);
        treasury.setGachaContract(address(gacha));
        treasury.setCardGroupedVault(address(vault));
        treasury.setProtocolTreasury(address(protocolTreasury));
        vault.setEconomyManager(address(economy));
        protocolTreasury.setEconomyManager(address(economy));
        protocolTreasury.setGachaTreasury(address(treasury));
        economy.setGacha(address(gacha));
        economy.setVaults(address(vault), address(protocolTreasury));
        // Whitelist appraisal → treasury for auto-migration
        appraisal.whitelistTreasury(address(treasury));
        // Whitelist the NFT collection in the treasury
        treasury.addToWhitelist(address(nftCollection));
        vm.stopPrank();

        // ── 9. Set fee token decimals and fund actors ────────────────────────
        // Tell Gacha to use 6-decimal USDC scalar for fee calculations
        vm.prank(owner);
        gacha.setFeeTokenDecimals(6);

        // Fund spinner with USDC for spins
        usdc.mint(spinner, 10_000e6);
    }

    // ─── Helper: deposit one NFT of given price into the treasury ────────────

    function _depositNFT(address actor, uint256 priceUSD) internal returns (uint256 tokenId) {
        // Mint
        vm.prank(owner);
        tokenId = nftCollection.mint(actor);

        // Appraise (owner override — free, no request required)
        bytes32 cardId = keccak256(abi.encodePacked(address(nftCollection), tokenId));
        vm.prank(owner);
        appraisal.ownerSetAppraisalForTokenWithCard(address(nftCollection), tokenId, cardId, priceUSD);

        // Deposit
        vm.startPrank(actor);
        nftCollection.approve(address(treasury), tokenId);
        treasury.depositNFT(address(nftCollection), tokenId);
        vm.stopPrank();
    }

    // ─── 1. Full spin-to-yield-claim ─────────────────────────────────────────

    /**
     * @notice Tests the complete spin flow:
     *   deposit NFT → spin → fulfill randomness → economy split → depositor claims yield
     */
    function testFullSpinToYieldClaim() public {
        // Deposit one uncommon NFT ($50)
        _depositNFT(depositor, UNCOMMON_PRICE);
        uint8 uncommonRarity = 1;

        // Sanity-check treasury state
        assertEq(treasury.rarityCount(uncommonRarity), 1, "Treasury should have 1 uncommon NFT");

        // --- Spin ---
        uint256 spinFee = gacha.getCurrentSpinFee();
        assertTrue(spinFee >= MIN_SPIN_FEE, "Spin fee should be at least the min");

        vm.startPrank(spinner);
        usdc.approve(address(gacha), spinFee);
        uint256 triggerId = gacha.spin(MAX_FEE_GUARD);
        vm.stopPrank();

        assertEq(gacha.totalSpinCount(), 0, "Spin not fulfilled yet - counter must be 0");

        // --- Fulfill randomness (service handler role) ---
        // Use randomness that will land on uncommon (rarity 1) when there is 1 NFT each for
        // all non-empty tiers. For simplicity we just verify the full execution path runs.
        bytes32 randomness = bytes32(uint256(1)); // any non-zero value is fine
        vm.prank(fakeServiceHandler);
        gacha.fulfillRandomness(triggerId, randomness);

        // Post-spin: either SpinCompleted or SpinRefunded.  Because we deposited exactly one
        // NFT and the token was sent to the winner we check the treasury is now empty.
        uint256 totalInventory;
        for (uint8 i = 0; i < 5; i++) {
            totalInventory += treasury.rarityCount(i);
        }
        assertEq(totalInventory, 0, "Treasury must be empty after the sole NFT was awarded");
        assertEq(gacha.totalSpinCount(), 1, "Total spin count must be 1");

        // --- Economy split landed in the vault ---
        uint256 expectedDepositorShare = (spinFee * economy.depositorShareBps()) / 10_000;
        uint256 expectedProtocolShare = spinFee - expectedDepositorShare;

        assertEq(usdc.balanceOf(address(vault)), expectedDepositorShare, "Vault balance mismatch");
        assertEq(usdc.balanceOf(address(protocolTreasury)), expectedProtocolShare, "Protocol balance mismatch");

        // --- Depositor claims yield ---
        uint256 depositorBefore = usdc.balanceOf(depositor);
        vm.prank(depositor);
        uint256 claimed = vault.claimYield(depositor);
        uint256 depositorAfter = usdc.balanceOf(depositor);

        assertEq(claimed, expectedDepositorShare, "Claimed yield should equal depositor share");
        assertEq(depositorAfter - depositorBefore, expectedDepositorShare, "Depositor balance delta mismatch");
        assertEq(vault.totalYieldClaimed(), expectedDepositorShare, "totalYieldClaimed tracking mismatch");
        assertEq(usdc.balanceOf(address(vault)), 0, "Vault should be empty after claim");
    }

    /**
     * @notice Verifies spin counters are incremented correctly across multiple spins.
     */
    function testSpinCounterIncrements() public {
        // Deposit two common NFTs so we can spin twice
        _depositNFT(depositor, COMMON_PRICE);
        _depositNFT(depositor, COMMON_PRICE);

        for (uint256 i = 0; i < 2; i++) {
            uint256 spinFee = gacha.getCurrentSpinFee();
            vm.startPrank(spinner);
            usdc.approve(address(gacha), spinFee);
            uint256 triggerId = gacha.spin(MAX_FEE_GUARD);
            vm.stopPrank();

            vm.prank(fakeServiceHandler);
            gacha.fulfillRandomness(triggerId, bytes32(uint256(i + 1)));
        }

        assertEq(gacha.totalSpinCount(), 2, "Two completed spins expected");
        assertEq(gacha.userSpinCount(spinner), 2, "User spin count should be 2");
    }

    /**
     * @notice Verifies that economy manager accumulates metrics across multiple spins.
     */
    function testEconomyManagerAccumulatesRevenue() public {
        _depositNFT(depositor, UNCOMMON_PRICE);
        _depositNFT(depositor, UNCOMMON_PRICE);

        uint256 totalFee;
        for (uint256 i = 0; i < 2; i++) {
            uint256 spinFee = gacha.getCurrentSpinFee();
            totalFee += spinFee;
            vm.startPrank(spinner);
            usdc.approve(address(gacha), spinFee);
            uint256 triggerId = gacha.spin(MAX_FEE_GUARD);
            vm.stopPrank();
            vm.prank(fakeServiceHandler);
            gacha.fulfillRandomness(triggerId, bytes32(uint256(i + 42)));
        }

        assertEq(economy.totalRevenueProcessed(), totalFee, "Total revenue processed mismatch");
    }

    // ─── 2. Auto-migration end-to-end ────────────────────────────────────────

    /**
     * @notice Tests same-rarity price update via NFTAppraisal → GachaTreasury → CardGroupedVault.
     *   Deposit NFT at $50 (Uncommon), update price to $55 (still Uncommon).
     *   Vault's CardNode price must reflect the new price without rarity change.
     */
    function testAutoMigration_SameRarity_PriceUpdate() public {
        uint256 tokenId = _depositNFT(depositor, UNCOMMON_PRICE); // $50 Uncommon
        bytes32 cardId = appraisal.getTokenCardId(address(nftCollection), tokenId);

        // Verify initial rarity in treasury cached mapping
        assertEq(treasury.cardCurrentRarity(cardId), 1, "Initial rarity should be Uncommon (1)");

        // Update price within same rarity ($55 — still Uncommon)
        uint256 newPrice = 55e18;
        vm.prank(owner);
        appraisal.ownerSetAppraisalForTokenWithCard(address(nftCollection), tokenId, cardId, newPrice);

        // Rarity must not change
        assertEq(treasury.cardCurrentRarity(cardId), 1, "Rarity should still be Uncommon after same-rarity update");

        // Vault's CardNode should reflect the new price
        (, uint256 vaultPrice,,,,) = vault.cardNodes(cardId);
        assertEq(vaultPrice, newPrice, "Vault CardNode price should reflect updated price");
    }

    /**
     * @notice Tests cross-rarity migration via NFTAppraisal → GachaTreasury → CardGroupedVault.
     *   Deposit NFT at $50 (Uncommon), update price to $100 (Rare).
     *   Treasury token must move to Rare pool; vault must migrate rarity.
     */
    function testAutoMigration_CrossRarity_Migration() public {
        uint256 tokenId = _depositNFT(depositor, UNCOMMON_PRICE); // $50 Uncommon (rarity 1)
        bytes32 cardId = appraisal.getTokenCardId(address(nftCollection), tokenId);

        assertEq(treasury.rarityCount(1), 1, "Initial: 1 Uncommon token");
        assertEq(treasury.rarityCount(2), 0, "Initial: 0 Rare tokens");

        // Update price to Rare tier ($100)
        uint256 newPrice = RARE_PRICE;
        vm.expectEmit(true, true, false, true);
        emit RarityMigrated(address(nftCollection), tokenId, 1, 2, newPrice);

        vm.prank(owner);
        appraisal.ownerSetAppraisalForTokenWithCard(address(nftCollection), tokenId, cardId, newPrice);

        // Treasury arrays must reflect the migration
        assertEq(treasury.rarityCount(1), 0, "Uncommon pool should be empty after migration");
        assertEq(treasury.rarityCount(2), 1, "Rare pool should have 1 NFT after migration");

        // Cached card rarity must be updated
        assertEq(treasury.cardCurrentRarity(cardId), 2, "Cached card rarity should be Rare (2)");

        // Vault should have migrated too
        (uint8 vaultRarity,,,,,) = vault.cardNodes(cardId);
        assertEq(vaultRarity, 2, "Vault CardNode rarity should be Rare (2)");
    }

    /**
     * @notice Verifies that yield is correctly attributed after a rarity migration.
     *   Depositor earns yield in Uncommon tier before migration, and Rare tier after.
     */
    function testAutoMigration_YieldBeforeAndAfterMigration() public {
        uint256 tokenId = _depositNFT(depositor, UNCOMMON_PRICE); // rarity 1
        bytes32 cardId = appraisal.getTokenCardId(address(nftCollection), tokenId);

        // Distribute yield in Uncommon tier BEFORE migration.
        // Must be called as the economy manager since vault.distributeYield is onlyEconomyManager.
        uint256 preYield = 500e6; // 500 USDC
        usdc.mint(address(economy), preYield);
        vm.startPrank(address(economy));
        usdc.approve(address(vault), preYield);
        vault.distributeYield(preYield, 1);
        vm.stopPrank();

        // Migrate to Rare
        uint256 newPrice = RARE_PRICE;
        vm.prank(owner);
        appraisal.ownerSetAppraisalForTokenWithCard(address(nftCollection), tokenId, cardId, newPrice);

        // Distribute yield in Rare tier AFTER migration
        uint256 postYield = 300e6; // 300 USDC
        usdc.mint(address(economy), postYield);
        vm.startPrank(address(economy));
        usdc.approve(address(vault), postYield);
        vault.distributeYield(postYield, 2);
        vm.stopPrank();

        // Depositor should be able to claim both pre- and post-migration yield
        uint256 beforeClaim = usdc.balanceOf(depositor);
        vm.prank(depositor);
        uint256 claimed = vault.claimYield(depositor);
        uint256 afterClaim = usdc.balanceOf(depositor);

        assertEq(afterClaim - beforeClaim, preYield + postYield, "Depositor should claim full yield from both tiers");
        assertEq(claimed, preYield + postYield, "Claimed amount mismatch");
    }

    /**
     * @notice Verifies that multiple tokens with different cards can co-exist and migrate independently.
     */
    function testAutoMigration_MultipleCards_IndependentMigration() public {
        uint256 token1 = _depositNFT(depositor, UNCOMMON_PRICE); // rarity 1
        uint256 token2 = _depositNFT(depositor, UNCOMMON_PRICE); // rarity 1, separate card

        bytes32 card1 = appraisal.getTokenCardId(address(nftCollection), token1);
        bytes32 card2 = appraisal.getTokenCardId(address(nftCollection), token2);

        assertEq(treasury.rarityCount(1), 2, "Two uncommon NFTs deposited");

        // Migrate only token1 to Rare
        vm.prank(owner);
        appraisal.ownerSetAppraisalForTokenWithCard(address(nftCollection), token1, card1, RARE_PRICE);

        assertEq(treasury.rarityCount(1), 1, "One uncommon should remain after partial migration");
        assertEq(treasury.rarityCount(2), 1, "One rare after migration of token1");
        assertEq(treasury.cardCurrentRarity(card1), 2, "Card1 should be Rare");
        assertEq(treasury.cardCurrentRarity(card2), 1, "Card2 should still be Uncommon");
    }

    // ─── 3. Redemption full flow ──────────────────────────────────────────────

    /**
     * @notice Full redemption flow:
     *   Spin → win NFT → winner redeems → protocol treasury pays out → NFT restocked.
     *
     *   The ProtocolTreasury must have enough USDC (from spin revenue) to pay the redemption.
     */
    function testRedemptionFullFlow() public {
        // Deposit NFT so there is something to win
        uint256 depositedTokenId = _depositNFT(depositor, UNCOMMON_PRICE);
        uint8 uncommonRarity = 1;

        // Spin and fulfill
        uint256 spinFee = gacha.getCurrentSpinFee();
        vm.startPrank(spinner);
        usdc.approve(address(gacha), spinFee);
        uint256 triggerId = gacha.spin(MAX_FEE_GUARD);
        vm.stopPrank();

        vm.prank(fakeServiceHandler);
        gacha.fulfillRandomness(triggerId, bytes32(uint256(5)));

        // The spinner should have received the NFT
        assertEq(nftCollection.ownerOf(depositedTokenId), spinner, "Spinner should own the NFT after winning");

        // Check redemption window is still open (treasury sets it at win time)
        assertTrue(
            protocolTreasury.isRedemptionEligible(address(nftCollection), depositedTokenId),
            "Redemption window should be open"
        );

        // Fund protocol treasury with enough USDC for the 80% payout
        uint256 expectedPayout = (UNCOMMON_PRICE * 8_000) / 10_000 / 1e12; // 18-dec → 6-dec
        vm.prank(owner);
        usdc.mint(address(protocolTreasury), expectedPayout);

        // Winner approves and redeems
        vm.startPrank(spinner);
        nftCollection.approve(address(protocolTreasury), depositedTokenId);
        uint256 payout = protocolTreasury.executeRedemption(address(nftCollection), depositedTokenId);
        vm.stopPrank();

        assertEq(payout, expectedPayout, "Redemption payout should be 80% of appraised USD price");

        // NFT must be restocked in the treasury
        assertTrue(
            treasury.depositedNFTs(address(nftCollection), depositedTokenId), "NFT should be restocked in treasury"
        );
        assertEq(treasury.rarityCount(uncommonRarity), 1, "Treasury should have 1 uncommon NFT again after restock");

        // Redemption window should be cleared (deadline reset)
        assertFalse(
            protocolTreasury.isRedemptionEligible(address(nftCollection), depositedTokenId),
            "Redemption window should be closed after redemption"
        );
    }

    /**
     * @notice Verifies redemption fails after the redemption window expires.
     */
    function testRedemptionFailsAfterWindowExpires() public {
        _depositNFT(depositor, UNCOMMON_PRICE);

        uint256 spinFee = gacha.getCurrentSpinFee();
        vm.startPrank(spinner);
        usdc.approve(address(gacha), spinFee);
        uint256 triggerId = gacha.spin(MAX_FEE_GUARD);
        vm.stopPrank();

        vm.prank(fakeServiceHandler);
        gacha.fulfillRandomness(triggerId, bytes32(uint256(7)));

        // Spinner should own exactly one token after winning it
        assertEq(nftCollection.balanceOf(spinner), 1, "Spinner should own exactly one NFT");
        uint256 wonTokenId = nftCollection.tokenOfOwnerByIndex(spinner, 0);

        // Fast-forward past the redemption window (default 1 hour)
        vm.warp(block.timestamp + 2 hours);

        uint256 expectedPayout = (UNCOMMON_PRICE * 8_000) / 10_000 / 1e12;
        vm.prank(owner);
        usdc.mint(address(protocolTreasury), expectedPayout);

        vm.startPrank(spinner);
        nftCollection.approve(address(protocolTreasury), wonTokenId);
        vm.expectRevert(ProtocolTreasury.RedemptionWindowExpired.selector);
        protocolTreasury.executeRedemption(address(nftCollection), wonTokenId);
        vm.stopPrank();
    }

    // ─── Economic redesign: snapshot-capped redemption, uniform draw, deposit floor ─────

    /// @dev Wins `tokenId` for the spinner via a spin+fulfill, returns after the win.
    function _winNFT(uint256 seed) internal returns (uint256 wonTokenId) {
        uint256 spinFee = gacha.getCurrentSpinFee();
        vm.startPrank(spinner);
        usdc.approve(address(gacha), spinFee);
        uint256 triggerId = gacha.spin(MAX_FEE_GUARD);
        vm.stopPrank();

        vm.prank(fakeServiceHandler);
        gacha.fulfillRandomness(triggerId, bytes32(seed));

        return nftCollection.tokenOfOwnerByIndex(spinner, nftCollection.balanceOf(spinner) - 1);
    }

    /**
     * @notice A redeemer must not be able to inflate the appraisal after winning to extract more:
     *         payout is capped at 80% of the WIN-TIME snapshot, not the (higher) live price.
     */
    function testRedemptionCappedBySnapshotWhenPriceInflated() public {
        uint256 tokenId = _depositNFT(depositor, UNCOMMON_PRICE); // $50 at win
        uint256 wonTokenId = _winNFT(uint256(5));
        assertEq(wonTokenId, tokenId, "single-NFT pool: spinner wins the deposited token");

        // Snapshot captured at win must equal the win-time appraisal.
        assertEq(
            treasury.getNFTRedemptionPriceSnapshot(address(nftCollection), tokenId),
            UNCOMMON_PRICE,
            "win-time price snapshot"
        );

        // Redeemer inflates the live appraisal well above the snapshot.
        bytes32 cardId = keccak256(abi.encodePacked(address(nftCollection), tokenId));
        vm.prank(owner);
        appraisal.ownerSetAppraisalForTokenWithCard(address(nftCollection), tokenId, cardId, LEGENDARY_PRICE);

        // Fund generously so liquidity is never the limiting factor.
        uint256 snapshotPayout = (UNCOMMON_PRICE * 8_000) / 10_000 / 1e12;
        vm.prank(owner);
        usdc.mint(address(protocolTreasury), (LEGENDARY_PRICE * 8_000) / 10_000 / 1e12);

        vm.startPrank(spinner);
        nftCollection.approve(address(protocolTreasury), tokenId);
        uint256 payout = protocolTreasury.executeRedemption(address(nftCollection), tokenId);
        vm.stopPrank();

        assertEq(
            payout, snapshotPayout, "payout must be capped at 80% of the win-time snapshot, not inflated live price"
        );
    }

    /**
     * @notice If the card's live value falls after a win, the protocol pays the lower live price
     *         (min(snapshot, live)) so it never overpays versus current market.
     */
    function testRedemptionUsesLivePriceWhenBelowSnapshot() public {
        uint256 tokenId = _depositNFT(depositor, RARE_PRICE); // $100 at win
        _winNFT(uint256(5));

        // Live price drops below the win-time snapshot.
        bytes32 cardId = keccak256(abi.encodePacked(address(nftCollection), tokenId));
        vm.prank(owner);
        appraisal.ownerSetAppraisalForTokenWithCard(address(nftCollection), tokenId, cardId, UNCOMMON_PRICE);

        uint256 livePayout = (UNCOMMON_PRICE * 8_000) / 10_000 / 1e12;
        vm.prank(owner);
        usdc.mint(address(protocolTreasury), (RARE_PRICE * 8_000) / 10_000 / 1e12);

        vm.startPrank(spinner);
        nftCollection.approve(address(protocolTreasury), tokenId);
        uint256 payout = protocolTreasury.executeRedemption(address(nftCollection), tokenId);
        vm.stopPrank();

        assertEq(payout, livePayout, "payout must use the lower live price when it falls below the snapshot");
    }

    /**
     * @notice isRedeemable mirrors executeRedemption's checks so the UI can preflight status.
     */
    function testIsRedeemableReasonCodes() public {
        uint256 tokenId = _depositNFT(depositor, UNCOMMON_PRICE);

        // Won NFT, but treasury holds no USDC yet → insufficient liquidity.
        _winNFT(uint256(5));
        (bool ok, uint8 reason, uint256 payout) = protocolTreasury.isRedeemable(address(nftCollection), tokenId);
        assertFalse(ok, "unfunded treasury: not redeemable");
        assertEq(reason, protocolTreasury.REDEEM_INSUFFICIENT_LIQUIDITY(), "reason: insufficient liquidity");
        assertEq(payout, (UNCOMMON_PRICE * 8_000) / 10_000 / 1e12, "quoted payout still computed");

        // Fund it → now redeemable.
        vm.prank(owner);
        usdc.mint(address(protocolTreasury), payout);
        (ok, reason,) = protocolTreasury.isRedeemable(address(nftCollection), tokenId);
        assertTrue(ok, "funded + in-window: redeemable");
        assertEq(reason, protocolTreasury.REDEEM_OK(), "reason: ok");

        // Past the window → window expired.
        vm.warp(block.timestamp + 2 hours);
        (ok, reason,) = protocolTreasury.isRedeemable(address(nftCollection), tokenId);
        assertFalse(ok, "expired window: not redeemable");
        assertEq(reason, protocolTreasury.REDEEM_WINDOW_EXPIRED(), "reason: window expired");
    }

    /**
     * @notice The min-appraisal deposit floor rejects junk deposits below the configured threshold.
     */
    function testMinDepositAppraisalFloor() public {
        vm.prank(owner);
        treasury.setMinDepositAppraisalUSD(UNCOMMON_PRICE); // $50 floor

        // A $10 common is below the floor → reverts.
        vm.prank(owner);
        uint256 cheapToken = nftCollection.mint(depositor);
        bytes32 cheapCard = keccak256(abi.encodePacked(address(nftCollection), cheapToken));
        vm.prank(owner);
        appraisal.ownerSetAppraisalForTokenWithCard(address(nftCollection), cheapToken, cheapCard, COMMON_PRICE);
        vm.startPrank(depositor);
        nftCollection.approve(address(treasury), cheapToken);
        vm.expectRevert(
            abi.encodeWithSelector(GachaTreasury.DepositBelowMinAppraisal.selector, COMMON_PRICE, UNCOMMON_PRICE)
        );
        treasury.depositNFT(address(nftCollection), cheapToken);
        vm.stopPrank();

        // A $50 uncommon at the floor → succeeds.
        uint256 okToken = _depositNFT(depositor, UNCOMMON_PRICE);
        assertTrue(treasury.depositedNFTs(address(nftCollection), okToken), "at-floor deposit should succeed");
    }

    /**
     * @notice Uniform-over-pool draw: with counts held constant at 3 Common : 1 Rare, wins land
     *         count-proportionally (~75% / ~25%), never in empty tiers. Counts are topped back up
     *         after each win so the pool composition stays fixed across the sample.
     */
    function testUniformDrawTracksPoolComposition() public {
        // Build a 3 Common : 1 Rare pool.
        for (uint256 i = 0; i < 3; i++) {
            _depositNFT(depositor, COMMON_PRICE);
        }
        _depositNFT(depositor, RARE_PRICE);

        uint256 iterations = 40;
        for (uint256 s = 1; s <= iterations; s++) {
            _winNFT(s);
            // Restore counts to [3 common, 1 rare] so composition is constant.
            while (treasury.rarityCount(0) < 3) {
                _depositNFT(depositor, COMMON_PRICE);
            }
            while (treasury.rarityCount(2) < 1) {
                _depositNFT(depositor, RARE_PRICE);
            }
        }

        uint256 commonWins = gacha.globalRarityWins(0);
        uint256 rareWins = gacha.globalRarityWins(2);
        assertEq(commonWins + rareWins, iterations, "all spins land in a stocked tier (no empties won)");
        assertEq(gacha.globalRarityWins(1), 0, "empty Uncommon tier is never won");
        assertEq(gacha.globalRarityWins(3), 0, "empty Epic tier is never won");
        // ~75/25 split from count-proportional selection (generous band around 30/10).
        assertGt(commonWins, rareWins, "Common (3x inventory) should win more than Rare");
        assertGe(commonWins, 24, "Common share ~75%");
        assertLe(rareWins, 16, "Rare share ~25%");
    }

    /**
     * @notice Verifies that queued yield gets flushed to the depositor on the next spin
     *         after a deposit arrives in an empty rarity pool.
     */
    function testQueuedYieldFlushedOnNextSpin() public {
        // Simulate spin revenue going to the economy manager as if sent by the gacha contract.
        // economy.onSpinRevenue is gated by onlyGacha so we must prank as gacha.
        // First call with no vault deposits → yield gets queued for rarity 1.
        uint256 queueAmount = 1_000e6;
        usdc.mint(address(gacha), queueAmount);
        vm.startPrank(address(gacha));
        usdc.approve(address(economy), queueAmount);
        economy.onSpinRevenue(queueAmount, 1);
        vm.stopPrank();

        uint256 depositorShare = (queueAmount * economy.depositorShareBps()) / 10_000;
        assertGt(economy.queuedYieldByRarity(1), 0, "Yield should be queued for rarity 1");

        // Now deposit an NFT into rarity 1 so the vault has shares
        _depositNFT(depositor, UNCOMMON_PRICE);

        // Trigger another spin revenue as gacha; this will flush the queued yield
        uint256 nextRevenue = 100e6;
        usdc.mint(address(gacha), nextRevenue);
        vm.startPrank(address(gacha));
        usdc.approve(address(economy), nextRevenue);
        economy.onSpinRevenue(nextRevenue, 1);
        vm.stopPrank();

        // Queue should now be empty for rarity 1
        assertEq(economy.queuedYieldByRarity(1), 0, "Queued yield should be flushed");

        // Depositor should be able to claim both the queued and the new yield
        uint256 nextShare = (nextRevenue * economy.depositorShareBps()) / 10_000;
        uint256 expectedClaim = depositorShare + nextShare;

        vm.prank(depositor);
        uint256 claimed = vault.claimYield(depositor);
        assertEq(claimed, expectedClaim, "Depositor should claim queued + new yield");
    }

    // ─── ERC721Receiver ──────────────────────────────────────────────────────

    function onERC721Received(address, address, uint256, bytes calldata) external pure override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }
}
