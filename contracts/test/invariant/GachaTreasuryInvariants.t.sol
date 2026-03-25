// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Test} from "forge-std/Test.sol";
import {StdInvariant} from "forge-std/StdInvariant.sol";
import {GachaTreasury} from "../../src/gacha/GachaTreasury.sol";
import {MockNFTAppraisal} from "../mocks/MockNFTAppraisal.sol";
import {MockCardGroupedVault} from "../mocks/MockCardGroupedVault.sol";
import {MockProtocolTreasury} from "../mocks/MockProtocolTreasury.sol";
import {MockERC721} from "../mocks/MockERC721.sol";

/**
 * @title GachaTreasuryHandler
 * @notice Invariant test handler that drives GachaTreasury through realistic operation sequences.
 *
 * Design principles:
 *  - Handlers pre-configure all prerequisites (appraisal, ownership, approval) before
 *    calling into GachaTreasury so that state-mutating calls succeed at a meaningful rate.
 *  - The handler is the only `targetContract`; invariant functions are in the parent test.
 *  - Ghost variables mirror treasury state so invariants can check consistency without
 *    iterating on-chain storage in O(n).
 */
contract GachaTreasuryHandler is Test {
    // ─── Contracts under test ──────────────────────────────────────────
    GachaTreasury public treasury;
    MockNFTAppraisal public appraisal;
    MockCardGroupedVault public vault;
    MockERC721 public nftCollection;

    // ─── Actors ───────────────────────────────────────────────────────
    /// @dev Fixed pool of depositors so the fuzzer reuses them
    address[] public actors;
    uint256 constant NUM_ACTORS = 5;

    // ─── NFT pool ─────────────────────────────────────────────────────
    /// @dev Token IDs pre-minted to actors (actor i owns tokens [i*TOKENS_PER_ACTOR .. i*TOKENS_PER_ACTOR+TOKENS_PER_ACTOR-1])
    uint256 constant TOKENS_PER_ACTOR = 4;
    uint256 constant TOTAL_TOKENS = NUM_ACTORS * TOKENS_PER_ACTOR;

    // ─── Price tier helpers ───────────────────────────────────────────
    uint256 constant COMMON_PRICE = 10e18; // rarity 0
    uint256 constant UNCOMMON_PRICE = 30e18; // rarity 1
    uint256 constant RARE_PRICE = 100e18; // rarity 2
    uint256 constant EPIC_PRICE = 500e18; // rarity 3
    uint256 constant LEGENDARY_PRICE = 2000e18; // rarity 4

    // ─── Ghost variables (mirrors of expected on-chain state) ─────────
    /// @dev Total NFTs deposited (lifetime counter, never decreases)
    uint256 public ghost_totalDeposited;
    /// @dev Total NFTs currently in treasury (deposits - withdrawals - gacha wins)
    uint256 public ghost_currentTotal;
    /// @dev Per-depositor current NFT counts
    mapping(address => uint256) public ghost_depositorCount;
    /// @dev Per-rarity current counts
    mapping(uint8 => uint256) public ghost_rarityCount;
    /// @dev Vault registerCardDeposit call count (should match ghost_totalDeposited when cardId != 0)
    uint256 public ghost_vaultRegisterCalls;
    /// @dev Vault removeCardDeposit call count
    uint256 public ghost_vaultRemoveCalls;
    /// @dev Tokens that are currently deposited (for withdrawal targeting)
    DepositedToken[] public ghost_depositedTokens;

    struct DepositedToken {
        address collection;
        uint256 tokenId;
        address depositor;
        uint8 rarity;
    }

    // ─── Constructor ─────────────────────────────────────────────────

    constructor(
        GachaTreasury treasury_,
        MockNFTAppraisal appraisal_,
        MockCardGroupedVault vault_,
        MockERC721 nftCollection_
    ) {
        treasury = treasury_;
        appraisal = appraisal_;
        vault = vault_;
        nftCollection = nftCollection_;

        // Build actor array and mint tokens for each actor
        for (uint256 i = 0; i < NUM_ACTORS; i++) {
            address actor = address(uint160(0x1000 + i));
            actors.push(actor);

            for (uint256 j = 0; j < TOKENS_PER_ACTOR; j++) {
                uint256 tokenId = i * TOKENS_PER_ACTOR + j;
                nftCollection.mint(actor, tokenId);
            }
        }
    }

    // ─── Internal helpers ─────────────────────────────────────────────

    function _actorFor(uint256 seed) internal view returns (address) {
        return actors[seed % NUM_ACTORS];
    }

    function _tokenFor(uint256 actorIndex, uint256 tokenSlot) internal pure returns (uint256) {
        return actorIndex * TOKENS_PER_ACTOR + (tokenSlot % TOKENS_PER_ACTOR);
    }

    function _priceFor(uint256 rarityIndex) internal pure returns (uint256) {
        if (rarityIndex == 0) return COMMON_PRICE;
        if (rarityIndex == 1) return UNCOMMON_PRICE;
        if (rarityIndex == 2) return RARE_PRICE;
        if (rarityIndex == 3) return EPIC_PRICE;
        return LEGENDARY_PRICE;
    }

    /// @dev Finds the ghost index of a deposited token; returns type(uint256).max if not found
    function _ghostIndexOf(address collection, uint256 tokenId) internal view returns (uint256) {
        for (uint256 i = 0; i < ghost_depositedTokens.length; i++) {
            if (ghost_depositedTokens[i].collection == collection && ghost_depositedTokens[i].tokenId == tokenId) {
                return i;
            }
        }
        return type(uint256).max;
    }

    /// @dev Swap-and-pop from ghost_depositedTokens
    function _removeGhostToken(uint256 idx) internal {
        uint256 last = ghost_depositedTokens.length - 1;
        if (idx != last) {
            ghost_depositedTokens[idx] = ghost_depositedTokens[last];
        }
        ghost_depositedTokens.pop();
    }

    // ─── Handler: deposit ─────────────────────────────────────────────

    /**
     * @notice Deposit a token from a randomly selected actor with a price in a given rarity tier.
     * @dev Configures the appraisal mock and grants approval before calling depositNFT.
     *      Silently skips if the token is already deposited or owned by the treasury.
     */
    function handler_deposit(uint256 actorSeed, uint256 tokenSlot, uint256 raritySeed) external {
        uint256 actorIdx = actorSeed % NUM_ACTORS;
        address actor = actors[actorIdx];
        uint256 tokenId = _tokenFor(actorIdx, tokenSlot);
        uint8 rarity = uint8(raritySeed % 5);
        uint256 price = _priceFor(rarity);

        // Skip if already deposited
        if (treasury.depositedNFTs(address(nftCollection), tokenId)) return;
        // Skip if not owned by actor (e.g. won by gacha)
        if (nftCollection.ownerOf(tokenId) != actor) return;

        // Set appraisal (use consistent cardId derived from collection+tokenId)
        bytes32 cardId = keccak256(abi.encodePacked(address(nftCollection), "card", tokenId));
        appraisal.setMockAppraisalWithCardId(address(nftCollection), tokenId, cardId, price);

        // Approve treasury
        vm.prank(actor);
        nftCollection.approve(address(treasury), tokenId);

        uint256 vaultRegisterBefore = vault.getRegisterCallCount();

        vm.prank(actor);
        try treasury.depositNFT(address(nftCollection), tokenId) {
            // Update ghost state
            ghost_totalDeposited++;
            ghost_currentTotal++;
            ghost_depositorCount[actor]++;
            ghost_rarityCount[rarity]++;
            ghost_depositedTokens.push(
                DepositedToken({collection: address(nftCollection), tokenId: tokenId, depositor: actor, rarity: rarity})
            );

            // Track vault calls
            if (vault.getRegisterCallCount() > vaultRegisterBefore) {
                ghost_vaultRegisterCalls++;
            }
        } catch {
            // Ignore expected failures (e.g., contract paused)
        }
    }

    // ─── Handler: withdraw ────────────────────────────────────────────

    /**
     * @notice Withdraw a randomly selected deposited NFT by its original depositor.
     * @dev Selects from ghost_depositedTokens so we always pick an actually-deposited token.
     */
    function handler_withdraw(uint256 tokenSeed) external {
        if (ghost_depositedTokens.length == 0) return;

        uint256 idx = tokenSeed % ghost_depositedTokens.length;
        DepositedToken memory dt = ghost_depositedTokens[idx];

        // Confirm treasury still thinks it is deposited
        if (!treasury.depositedNFTs(dt.collection, dt.tokenId)) {
            _removeGhostToken(idx);
            ghost_currentTotal--;
            ghost_depositorCount[dt.depositor]--;
            ghost_rarityCount[dt.rarity]--;
            return;
        }

        uint256 vaultRemoveBefore = vault.getRemoveCallCount();

        vm.prank(dt.depositor);
        try treasury.withdrawMyNFT(dt.collection, dt.tokenId) {
            // Update ghost state
            ghost_currentTotal--;
            ghost_depositorCount[dt.depositor]--;
            ghost_rarityCount[dt.rarity]--;
            _removeGhostToken(idx);

            if (vault.getRemoveCallCount() > vaultRemoveBefore) {
                ghost_vaultRemoveCalls++;
            }
        } catch {
            // Unexpected failure — token may have been won by gacha or already withdrawn
        }
    }

    // ─── Handler: migrateRarity ───────────────────────────────────────

    /**
     * @notice Update the appraisal price of a deposited token so it crosses a rarity boundary,
     *         then call migrateNFTRarity to exercise the migration path.
     */
    function handler_migrateRarity(uint256 tokenSeed, uint256 newRaritySeed) external {
        if (ghost_depositedTokens.length == 0) return;

        uint256 idx = tokenSeed % ghost_depositedTokens.length;
        DepositedToken storage dt = ghost_depositedTokens[idx];

        if (!treasury.depositedNFTs(dt.collection, dt.tokenId)) return;

        uint8 newRarity = uint8(newRaritySeed % 5);
        if (newRarity == dt.rarity) {
            // Make it different — flip to the opposite end
            newRarity = dt.rarity == 0 ? uint8(4) : uint8(0);
        }

        uint256 newPrice = _priceFor(newRarity);

        // Update appraisal to new price (same cardId)
        bytes32 cardId = keccak256(abi.encodePacked(dt.collection, "card", dt.tokenId));
        appraisal.setMockAppraisalWithCardId(dt.collection, dt.tokenId, cardId, newPrice);

        uint8 oldRarity = dt.rarity;

        try treasury.migrateNFTRarity(dt.collection, dt.tokenId) {
            // Update ghost state — rarity changed
            ghost_rarityCount[oldRarity]--;
            ghost_rarityCount[newRarity]++;
            dt.rarity = newRarity;
        } catch {
            // May fail if price didn't actually change rarity or contract is paused
        }
    }

    // ─── Handler: updateCardPrice (same rarity) ───────────────────────

    /**
     * @notice Update the appraisal price of a deposited token within the same rarity tier.
     *         Verifies that the vault's updateCardPrice path is exercised.
     */
    function handler_updateCardPrice(uint256 tokenSeed, uint256 priceDeltaSeed) external {
        if (ghost_depositedTokens.length == 0) return;

        uint256 idx = tokenSeed % ghost_depositedTokens.length;
        DepositedToken memory dt = ghost_depositedTokens[idx];

        if (!treasury.depositedNFTs(dt.collection, dt.tokenId)) return;

        // Pick a new price within the same rarity tier (no migration)
        uint256 newPrice;
        if (dt.rarity == 0) {
            // Common: $0 - $15
            newPrice = bound(priceDeltaSeed, 1e18, 14e18);
        } else if (dt.rarity == 1) {
            // Uncommon: $15.01 - $60
            newPrice = bound(priceDeltaSeed, 16e18, 59e18);
        } else if (dt.rarity == 2) {
            // Rare: $60.01 - $250
            newPrice = bound(priceDeltaSeed, 61e18, 249e18);
        } else if (dt.rarity == 3) {
            // Epic: $250.01 - $1200
            newPrice = bound(priceDeltaSeed, 251e18, 1199e18);
        } else {
            // Legendary: $1200.01+
            newPrice = bound(priceDeltaSeed, 1201e18, 5000e18);
        }

        bytes32 cardId = keccak256(abi.encodePacked(dt.collection, "card", dt.tokenId));

        uint256 priceUpdatesBefore = vault.getPriceUpdateCallCount();
        appraisal.setMockAppraisalWithCardId(dt.collection, dt.tokenId, cardId, newPrice);

        // onCardPriceUpdated is called by the appraisal contract in the real system.
        // In tests we simulate by calling it directly from the appraisal mock address.
        vm.prank(address(appraisal));
        try treasury.onCardPriceUpdated(cardId, newPrice) {
            // Verify vault received the update
            assertTrue(
                vault.getPriceUpdateCallCount() > priceUpdatesBefore || vault.getMigrateCallCount() > 0,
                "vault should see price update or migration"
            );
        } catch {
            // May fail if card has no deposits in vault or contract is paused
        }
    }

    // ─── Handler: multiDeposit ────────────────────────────────────────

    /**
     * @notice Deposit multiple tokens from the same actor to exercise batch paths and
     *         shared-card accounting (multiple tokens with the same cardId).
     */
    function handler_multiDeposit(uint256 actorSeed, uint256 raritySeed) external {
        uint256 actorIdx = actorSeed % NUM_ACTORS;
        address actor = actors[actorIdx];
        uint8 rarity = uint8(raritySeed % 5);
        uint256 price = _priceFor(rarity);

        uint256 deposited = 0;

        for (uint256 j = 0; j < TOKENS_PER_ACTOR && deposited < 2; j++) {
            uint256 tokenId = _tokenFor(actorIdx, j);

            if (treasury.depositedNFTs(address(nftCollection), tokenId)) continue;
            if (nftCollection.ownerOf(tokenId) != actor) continue;

            // Give all tokens in this actor's set the same cardId so they share a card node
            bytes32 cardId = keccak256(abi.encodePacked(address(nftCollection), "sharedcard", actorIdx));
            appraisal.setMockAppraisalWithCardId(address(nftCollection), tokenId, cardId, price);

            vm.prank(actor);
            nftCollection.approve(address(treasury), tokenId);

            uint256 vaultRegisterBefore = vault.getRegisterCallCount();

            vm.prank(actor);
            try treasury.depositNFT(address(nftCollection), tokenId) {
                ghost_totalDeposited++;
                ghost_currentTotal++;
                ghost_depositorCount[actor]++;
                ghost_rarityCount[rarity]++;
                ghost_depositedTokens.push(
                    DepositedToken({
                        collection: address(nftCollection), tokenId: tokenId, depositor: actor, rarity: rarity
                    })
                );

                if (vault.getRegisterCallCount() > vaultRegisterBefore) {
                    ghost_vaultRegisterCalls++;
                }
                deposited++;
            } catch {
                // Skip on failure (e.g., paused)
            }
        }
    }

    // ─── Handler: withdrawAll ─────────────────────────────────────────

    /**
     * @notice Withdraw all currently-deposited tokens from a randomly selected actor.
     *         Exercises the full removal path including vault deregistration.
     */
    function handler_withdrawAll(uint256 actorSeed) external {
        address actor = actors[actorSeed % NUM_ACTORS];

        // Collect this actor's tokens from ghost state
        uint256 i = 0;
        while (i < ghost_depositedTokens.length) {
            DepositedToken memory dt = ghost_depositedTokens[i];
            if (dt.depositor != actor) {
                i++;
                continue;
            }
            if (!treasury.depositedNFTs(dt.collection, dt.tokenId)) {
                _removeGhostToken(i);
                ghost_currentTotal--;
                ghost_depositorCount[dt.depositor]--;
                ghost_rarityCount[dt.rarity]--;
                continue;
            }

            vm.prank(actor);
            try treasury.withdrawMyNFT(dt.collection, dt.tokenId) {
                ghost_currentTotal--;
                ghost_depositorCount[actor]--;
                ghost_rarityCount[dt.rarity]--;
                _removeGhostToken(i);
                ghost_vaultRemoveCalls++;
                // Don't increment i — element at i is now the swapped element
            } catch {
                i++;
            }
        }
    }

    // ─── Ghost accessors ─────────────────────────────────────────────

    /// @dev Returns the number of actors
    function numActors() external pure returns (uint256) {
        return NUM_ACTORS;
    }

    /// @dev Returns the number of currently-tracked deposited tokens
    function ghost_depositedTokens_length() external view returns (uint256) {
        return ghost_depositedTokens.length;
    }

    /// @dev Returns a specific deposited token entry
    function ghost_depositedTokensAt(uint256 idx)
        external
        view
        returns (address collection, uint256 tokenId, address depositor, uint8 rarity)
    {
        DepositedToken memory dt = ghost_depositedTokens[idx];
        return (dt.collection, dt.tokenId, dt.depositor, dt.rarity);
    }

    // ─── Handler: depositThenMigrate ─────────────────────────────────

    /**
     * @notice Composite handler: deposit a token at one rarity, then immediately migrate it.
     *         Exercises the complete deposit → migrate code path in one sequence.
     */
    function handler_depositThenMigrate(uint256 actorSeed, uint256 tokenSlot, uint256 fromRaritySeed) external {
        uint256 actorIdx = actorSeed % NUM_ACTORS;
        address actor = actors[actorIdx];
        uint256 tokenId = _tokenFor(actorIdx, tokenSlot);

        if (treasury.depositedNFTs(address(nftCollection), tokenId)) return;
        if (nftCollection.ownerOf(tokenId) != actor) return;

        uint8 fromRarity = uint8(fromRaritySeed % 4); // 0..3 so there is always a higher tier to migrate to
        uint8 toRarity = fromRarity + 1;
        uint256 fromPrice = _priceFor(fromRarity);
        uint256 toPrice = _priceFor(toRarity);

        bytes32 cardId = keccak256(abi.encodePacked(address(nftCollection), "card", tokenId));
        appraisal.setMockAppraisalWithCardId(address(nftCollection), tokenId, cardId, fromPrice);

        vm.prank(actor);
        nftCollection.approve(address(treasury), tokenId);

        vm.prank(actor);
        try treasury.depositNFT(address(nftCollection), tokenId) {}
        catch {
            return;
        }

        ghost_totalDeposited++;
        ghost_currentTotal++;
        ghost_depositorCount[actor]++;
        ghost_rarityCount[fromRarity]++;
        ghost_depositedTokens.push(
            DepositedToken({collection: address(nftCollection), tokenId: tokenId, depositor: actor, rarity: fromRarity})
        );

        // Now update the price to trigger a rarity change
        appraisal.setMockAppraisalWithCardId(address(nftCollection), tokenId, cardId, toPrice);

        uint256 ghostIdx = _ghostIndexOf(address(nftCollection), tokenId);

        try treasury.migrateNFTRarity(address(nftCollection), tokenId) {
            ghost_rarityCount[fromRarity]--;
            ghost_rarityCount[toRarity]++;
            if (ghostIdx != type(uint256).max) {
                ghost_depositedTokens[ghostIdx].rarity = toRarity;
            }
        } catch {
            // Migration may fail if price doesn't resolve to a different rarity
        }
    }
}

/**
 * @title GachaTreasuryInvariants
 * @notice Invariant test suite for GachaTreasury.
 *
 * Invariants checked on every run:
 *  I1. sum(rarityCount[i]) == current NFTs in treasury == globalLifetimeDeposited - globalLifetimeClaimed
 *      (Note: globalLifetimeClaimed tracks NFT value, not count — use ghost counters for count)
 *  I2. rarityCount[i] matches treasury[i].length for all tiers
 *  I3. Every NFT in the treasury has a non-zero depositor address
 *  I4. Every NFT in the treasury comes from a whitelisted collection
 *  I5. globalLifetimeDeposited >= sum of all current rarityCount (lifetime >= current)
 *  I6. userTotalDeposits[user] <= globalLifetimeDeposited for all actors
 *  I7. totalRarityValue[r] == sum of appraisedPrice for every NFT in treasury[r]
 *  I8. vault.getRegisterCallCount() >= ghost_vaultRegisterCalls (vault was notified for every deposit with a cardId)
 *  I9. depositedNFTs[collection][tokenId] == true iff the NFT is in some rarity array
 * I10. userTotalDeposits[user] matches sum of userDepositCounts[user][r] across all rarities
 */
contract GachaTreasuryInvariants is StdInvariant, Test {
    // ========================================================================
    // STATE VARIABLES
    // ========================================================================

    GachaTreasury public treasury;
    MockNFTAppraisal public appraisal;
    MockCardGroupedVault public vault;
    MockProtocolTreasury public protocolTreasury;
    MockERC721 public nftCollection;
    GachaTreasuryHandler public handler;

    address public owner;

    // ========================================================================
    // SETUP
    // ========================================================================

    function setUp() public {
        owner = address(this);

        // Deploy mocks
        appraisal = new MockNFTAppraisal();
        vault = new MockCardGroupedVault(address(0x1));
        protocolTreasury = new MockProtocolTreasury();
        nftCollection = new MockERC721("Mock NFT", "MNFT");

        // Deploy and initialize treasury
        treasury = GachaTreasury(payable(address(new GachaTreasury())));

        uint256[] memory minPrices = new uint256[](5);
        minPrices[0] = 0;
        minPrices[1] = 15e18 + 1e16; // $15.01
        minPrices[2] = 60e18 + 1e16; // $60.01
        minPrices[3] = 250e18 + 1e16; // $250.01
        minPrices[4] = 1200e18 + 1e16; // $1200.01

        uint256[] memory maxPrices = new uint256[](5);
        maxPrices[0] = 15e18;
        maxPrices[1] = 60e18;
        maxPrices[2] = 250e18;
        maxPrices[3] = 1200e18;
        maxPrices[4] = type(uint256).max;

        string[] memory rarityNames = new string[](5);
        rarityNames[0] = "Common";
        rarityNames[1] = "Uncommon";
        rarityNames[2] = "Rare";
        rarityNames[3] = "Epic";
        rarityNames[4] = "Legendary";

        treasury.initialize(
            owner,
            address(0x999), // gacha contract (not exercised in these tests)
            address(appraisal),
            uint8(5),
            rarityNames,
            minPrices,
            maxPrices
        );

        treasury.setCardGroupedVault(address(vault));
        treasury.setProtocolTreasury(address(protocolTreasury));
        treasury.addToWhitelist(address(nftCollection));

        // Deploy handler — it mints tokens internally
        handler = new GachaTreasuryHandler(treasury, appraisal, vault, nftCollection);

        // Focus the invariant runner exclusively on the handler
        targetContract(address(handler));

        bytes4[] memory selectors = new bytes4[](6);
        selectors[0] = GachaTreasuryHandler.handler_deposit.selector;
        selectors[1] = GachaTreasuryHandler.handler_withdraw.selector;
        selectors[2] = GachaTreasuryHandler.handler_migrateRarity.selector;
        selectors[3] = GachaTreasuryHandler.handler_updateCardPrice.selector;
        selectors[4] = GachaTreasuryHandler.handler_multiDeposit.selector;
        selectors[5] = GachaTreasuryHandler.handler_depositThenMigrate.selector;
        targetSelector(FuzzSelector({addr: address(handler), selectors: selectors}));
    }

    // ========================================================================
    // INVARIANT I1 — rarityCount sum == ghost_currentTotal
    // ========================================================================

    /**
     * @notice The sum of rarityCount[i] across all tiers must equal the handler's
     *         ghost_currentTotal, which tracks deposits minus withdrawals.
     */
    function invariant_I1_rarityCountMatchesGhostTotal() public view {
        uint256 onChainTotal = 0;
        for (uint8 i = 0; i < 5; i++) {
            onChainTotal += treasury.rarityCount(i);
        }
        assertEq(onChainTotal, handler.ghost_currentTotal(), "I1: rarityCount sum != ghost_currentTotal");
    }

    // ========================================================================
    // INVARIANT I2 — rarityCount[i] == treasury[i].length
    // ========================================================================

    /**
     * @notice The rarityCount mapping must always equal the actual array length for each rarity.
     *         Mismatch would indicate a swap-and-pop bug.
     */
    function invariant_I2_rarityCountMatchesArrayLength() public view {
        for (uint8 i = 0; i < 5; i++) {
            uint256 mappingCount = treasury.rarityCount(i);
            uint256 arrayLength = treasury.getTreasuryItems(i).length;
            assertEq(mappingCount, arrayLength, "I2: rarityCount != treasury array length");
        }
    }

    // ========================================================================
    // INVARIANT I3 — every NFT has a non-zero depositor
    // ========================================================================

    /**
     * @notice Every NFT stored in the treasury must have a valid (non-zero) depositor address.
     */
    function invariant_I3_nonZeroDepositors() public view {
        for (uint8 i = 0; i < 5; i++) {
            GachaTreasury.NFTItem[] memory items = treasury.getTreasuryItems(i);
            for (uint256 j = 0; j < items.length; j++) {
                assertTrue(items[j].depositor != address(0), "I3: zero depositor found");
            }
        }
    }

    // ========================================================================
    // INVARIANT I4 — every NFT is from a whitelisted collection
    // ========================================================================

    /**
     * @notice Every NFT in the treasury must come from a collection on the whitelist.
     */
    function invariant_I4_whitelistedCollectionsOnly() public view {
        for (uint8 i = 0; i < 5; i++) {
            GachaTreasury.NFTItem[] memory items = treasury.getTreasuryItems(i);
            for (uint256 j = 0; j < items.length; j++) {
                assertTrue(
                    treasury.isCollectionWhitelisted(items[j].collection), "I4: NFT from non-whitelisted collection"
                );
            }
        }
    }

    // ========================================================================
    // INVARIANT I5 — lifetime deposited >= current total
    // ========================================================================

    /**
     * @notice globalLifetimeDeposited (sum of appraised prices) should always be >= 0 and
     *         the current count in the treasury should not exceed total deposited count.
     *         We track the NFT count equivalent via ghost_totalDeposited.
     */
    function invariant_I5_lifetimeDepositedGeCurrentTotal() public view {
        uint256 currentTotal = 0;
        for (uint8 i = 0; i < 5; i++) {
            currentTotal += treasury.rarityCount(i);
        }
        assertGe(handler.ghost_totalDeposited(), currentTotal, "I5: ghost_totalDeposited < current count");
    }

    // ========================================================================
    // INVARIANT I6 — per-user deposits <= globalLifetimeDeposited
    // ========================================================================

    /**
     * @notice Each depositor's total deposit count cannot exceed the global lifetime count.
     */
    function invariant_I6_perUserDepositsLeGlobal() public view {
        for (uint256 i = 0; i < handler.numActors(); i++) {
            address actor = handler.actors(i);
            uint256 userTotal = treasury.userTotalDeposits(actor);
            assertLe(userTotal, treasury.globalLifetimeDeposited(), "I6: user deposits > global lifetime");
        }
    }

    // ========================================================================
    // INVARIANT I7 — totalRarityValue matches sum of item prices
    // ========================================================================

    /**
     * @notice The totalRarityValue mapping for each rarity must equal the sum of appraisedPrice
     *         for every NFT currently in that rarity pool.
     */
    function invariant_I7_rarityValueConsistency() public view {
        for (uint8 i = 0; i < 5; i++) {
            GachaTreasury.NFTItem[] memory items = treasury.getTreasuryItems(i);
            uint256 computedValue = 0;
            for (uint256 j = 0; j < items.length; j++) {
                computedValue += items[j].appraisedPrice;
            }
            assertEq(computedValue, treasury.totalRarityValue(i), "I7: totalRarityValue mismatch");
        }
    }

    // ========================================================================
    // INVARIANT I8 — vault received registerCardDeposit for every deposited token with cardId
    // ========================================================================

    /**
     * @notice The vault's registerCardDeposit call count must be >= ghost_vaultRegisterCalls.
     *         We use >= rather than == because the handler may not capture every successful
     *         deposit in the ghost counter during reverts inside try/catch.
     */
    function invariant_I8_vaultRegisterCallsConsistent() public view {
        assertGe(
            vault.getRegisterCallCount(),
            handler.ghost_vaultRegisterCalls(),
            "I8: vault.registerCallCount < ghost_vaultRegisterCalls"
        );
    }

    // ========================================================================
    // INVARIANT I9 — depositedNFTs mapping consistency
    // ========================================================================

    /**
     * @notice For every NFT in the ghost deposited list, depositedNFTs must be true.
     *         For every token not in the treasury, depositedNFTs must be false.
     *
     * We only check the positive direction (ghost deposited → mapping true) to avoid
     * iterating the entire token space.
     */
    function invariant_I9_depositedNFTsMappingConsistency() public view {
        uint256 len = handler.ghost_depositedTokens_length();
        for (uint256 i = 0; i < len; i++) {
            (address col, uint256 tid,,) = handler.ghost_depositedTokensAt(i);
            assertTrue(treasury.depositedNFTs(col, tid), "I9: ghost thinks token is deposited but mapping says false");
        }
    }

    // ========================================================================
    // INVARIANT I10 — userTotalDeposits == sum of userDepositCounts across rarities
    // ========================================================================

    /**
     * @notice userTotalDeposits[user] must equal the sum of userDepositCounts[user][r] for all r.
     */
    function invariant_I10_userTotalDepositsConsistency() public view {
        for (uint256 i = 0; i < handler.numActors(); i++) {
            address actor = handler.actors(i);
            uint256 sumByRarity = 0;
            for (uint8 r = 0; r < 5; r++) {
                sumByRarity += treasury.userDepositCounts(actor, r);
            }
            assertEq(
                treasury.userTotalDeposits(actor), sumByRarity, "I10: userTotalDeposits != sum of per-rarity counts"
            );
        }
    }

    // ========================================================================
    // INVARIANT I11 — NFT rarity tag matches its pool
    // ========================================================================

    /**
     * @notice Every NFTItem.rarity must match the pool index it was found in.
     *         Mismatch indicates a bug in migration or deposit assignment.
     */
    function invariant_I11_rarityTagMatchesPool() public view {
        for (uint8 i = 0; i < 5; i++) {
            GachaTreasury.NFTItem[] memory items = treasury.getTreasuryItems(i);
            for (uint256 j = 0; j < items.length; j++) {
                assertEq(items[j].rarity, i, "I11: NFTItem.rarity does not match pool index");
            }
        }
    }

    // ========================================================================
    // INVARIANT I12 — nftCurrentRarity matches the pool the NFT is in
    // ========================================================================

    /**
     * @notice nftCurrentRarity[collection][tokenId] must match the rarity pool where the NFT resides.
     */
    function invariant_I12_nftCurrentRarityMatchesPool() public view {
        for (uint8 i = 0; i < 5; i++) {
            GachaTreasury.NFTItem[] memory items = treasury.getTreasuryItems(i);
            for (uint256 j = 0; j < items.length; j++) {
                uint8 trackedRarity = treasury.nftCurrentRarity(items[j].collection, items[j].tokenId);
                assertEq(trackedRarity, i, "I12: nftCurrentRarity does not match pool index");
            }
        }
    }

    // ========================================================================
    // INVARIANT I13 — no duplicate NFTs across pools
    // ========================================================================

    /**
     * @notice An NFT (collection, tokenId) must appear in exactly one rarity pool.
     *         We verify by checking depositedNFTs is true for each item in each pool
     *         and that the registered treasury index points back to the correct slot.
     */
    function invariant_I13_noDuplicateNFTs() public view {
        uint256 totalCount = 0;
        for (uint8 i = 0; i < 5; i++) {
            GachaTreasury.NFTItem[] memory items = treasury.getTreasuryItems(i);
            for (uint256 j = 0; j < items.length; j++) {
                // The treasury index for this token should point to slot j
                uint256 registeredIndex = treasury.nftToTreasuryIndex(items[j].collection, items[j].tokenId);
                assertEq(registeredIndex, j, "I13: nftToTreasuryIndex is stale (possible duplicate)");
            }
            totalCount += items.length;
        }

        // Total items across all pools must equal ghost_currentTotal
        assertEq(totalCount, handler.ghost_currentTotal(), "I13: totalCount across pools != ghost_currentTotal");
    }

    // ========================================================================
    // INVARIANT I14 — userDepositValues[user][r] matches sum of appraisedPrice for user's NFTs in r
    // ========================================================================

    /**
     * @notice userDepositValues must match the sum of appraisedPrice for every NFT deposited
     *         by each actor in each rarity pool.
     */
    function invariant_I14_userDepositValuesConsistency() public view {
        for (uint256 a = 0; a < handler.numActors(); a++) {
            address actor = handler.actors(a);
            for (uint8 r = 0; r < 5; r++) {
                GachaTreasury.NFTItem[] memory items = treasury.getTreasuryItems(r);
                uint256 computedValue = 0;
                for (uint256 j = 0; j < items.length; j++) {
                    if (items[j].depositor == actor) {
                        computedValue += items[j].appraisedPrice;
                    }
                }
                assertEq(
                    treasury.userDepositValues(actor, r),
                    computedValue,
                    "I14: userDepositValues does not match sum of appraisedPrices"
                );
            }
        }
    }
}
