// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ReentrancyGuardTransient} from "solady/utils/ReentrancyGuardTransient.sol";
import {SafeTransferLib} from "solady/utils/SafeTransferLib.sol";
import {FixedPointMathLib} from "solady/utils/FixedPointMathLib.sol";
import {ICardGroupedVault} from "../interfaces/ICardGroupedVault.sol";

/// @notice Interface for GachaTreasury to record claimed analytics
interface IGachaTreasuryYieldTracker {
    function recordYieldClaim(address user, uint256 amount) external;
}

/**
 * @title CardGroupedVault
 * @notice Card-grouped yield vault with per-rarity accumulators and O(1) price updates.
 *
 * ## Yield routing
 *
 *   Distribution is GLOBAL value-weighted: {distributeYield} credits every card in proportion to
 *   its own value share of the WHOLE pool, independent of which rarity the spin hit (the `rarity`
 *   argument is analytics only). This keeps expected depositor P&L value-neutral across tiers — a
 *   card of value V draws with probability 1/N and thus risks V/N per spin, exactly the V/totalValue
 *   share of the fee it earns. The per-rarity accumulators below remain the accounting substrate
 *   (each is bumped by the same per-USD increment); only the increment's denominator is the whole
 *   pool's value rather than a single tier's.
 *
 * ## Data Model
 *
 *   RarityPool[]              — N per-rarity accumulators (numRarities set at init)
 *     accYieldPerUSD       — cumulative yield per $1 of value (scaled by PRECISION)
 *     totalValueUSD        — sum of (count × price) for all cards in this tier
 *
 *   CardNode[cardId]       — one per card
 *     rarity, cardPriceUSD, totalCount
 *     correctionPerUnit    — int256, accumulates price-change corrections
 *     settledYieldPerUnit  — yield from previous rarity stints
 *     baseAcc              — accYieldPerUSD[rarity] snapshot when card entered pool
 *
 *   Position[cardId][depositor] — per depositor per card
 *     count, rewardDebt, correctionDebt, settledDebt
 *
 * ## Pending Yield Formula
 *
 *   pending(card, user) =
 *       count × price × (accYieldPerUSD[rarity] - baseAcc) / PRECISION
 *     + count × settledYieldPerUnit / PRECISION
 *     - count × correctionPerUnit / PRECISION   (int256, may be negative)
 *     - rewardDebt
 *     - settledDebt
 *     + correctionDebt                          (int256)
 *
 * @dev UUPS upgradeable.
 */
contract CardGroupedVault is
    ICardGroupedVault,
    Initializable,
    OwnableUpgradeable,
    PausableUpgradeable,
    ReentrancyGuardTransient,
    UUPSUpgradeable
{
    using SafeTransferLib for address;

    // ─── Errors ─────────────────────────────────────────────────────────

    error ZeroAddress();
    error CallerNotTreasury();
    error CallerNotManager();
    error ZeroAmount();
    error ZeroPrice();
    error InvalidRarity();
    error CardNotRegistered();
    error InsufficientPosition();
    error NothingToClaim();
    error InsufficientVaultBalance();

    event YieldTrackingFailed(address indexed account, uint256 amount, bytes reason);
    error UnauthorizedClaim();
    error NoValueInPool();
    error YieldTooSmall();
    error InvalidNumRarities();
    error Int256Overflow();
    error InvalidImplementation();

    // ─── Constants ──────────────────────────────────────────────────────

    /// @notice Precision for accumulator math (1e18)
    uint256 private constant PRECISION = 1e18;

    // ─── State ──────────────────────────────────────────────────────────

    /// @notice USDC token used for payouts
    IERC20 public override asset;

    /// @notice Gacha treasury allowed to update card positions
    address public treasury;

    /// @notice Economy manager that distributes yield
    address public economyManager;

    /// @notice Number of rarity tiers
    uint8 public numRarities;

    /// @notice Aggregate USDC distributed / claimed
    uint256 public totalYieldDistributed;
    uint256 public totalYieldClaimed;

    /// @dev Per-rarity yield accumulator
    struct RarityPool {
        uint256 accYieldPerUSD; // Cumulative yield per $1 of value (scaled × PRECISION)
        uint256 totalValueUSD; // Sum of count × price for all cards in this tier (18-dec USD)
    }

    /// @dev One node per card (all tokens of same card share one node)
    struct CardNode {
        uint8 rarity;
        uint256 cardPriceUSD; // 18-dec USD price for one token
        uint256 totalCount; // Total tokens deposited across all depositors
        int256 correctionPerUnit; // Accumulates price-change corrections (scaled × PRECISION)
        uint256 settledYieldPerUnit; // Yield from previous rarity stints (scaled × PRECISION)
        uint256 baseAcc; // accYieldPerUSD[rarity] snapshot when card entered pool
    }

    /// @dev Per depositor per card
    struct DepositorPosition {
        uint256 count;
        uint256 rewardDebt; // Snapshot of main accumulator yield owed
        int256 correctionDebt; // Snapshot of correction at time of last update
        uint256 settledDebt; // Snapshot of settled yield at time of last update
    }

    RarityPool[] public rarityPools;

    mapping(bytes32 => CardNode) public cardNodes;

    /// @dev cardId => depositor => position
    mapping(bytes32 => mapping(address => DepositorPosition)) public positions;

    /// @dev depositor => list of cardIds they have positions in
    mapping(address => bytes32[]) private _depositorCards;
    /// @dev depositor => cardId => index+1 in _depositorCards (0 means absent)
    mapping(address => mapping(bytes32 => uint256)) private _depositorCardIndex;

    /// @dev Yield materialized during position changes, claimable via claimYield
    mapping(address => uint256) public accruedYield;

    // ─── Events ─────────────────────────────────────────────────────────

    event TreasuryUpdated(address indexed previousTreasury, address indexed newTreasury);
    event EconomyManagerUpdated(address indexed previousManager, address indexed newManager);

    // ─── Modifiers ──────────────────────────────────────────────────────

    modifier onlyTreasury() {
        if (msg.sender != treasury) revert CallerNotTreasury();
        _;
    }

    modifier onlyEconomyManager() {
        if (msg.sender != economyManager) revert CallerNotManager();
        _;
    }

    // ─── Initialization ─────────────────────────────────────────────────

    function initialize(address owner_, address asset_, address treasury_, address economyManager_, uint8 numRarities_)
        external
        initializer
    {
        if (owner_ == address(0)) revert ZeroAddress();
        if (asset_ == address(0)) revert ZeroAddress();
        if (treasury_ == address(0)) revert ZeroAddress();
        if (economyManager_ == address(0)) revert ZeroAddress();
        if (numRarities_ < 2 || numRarities_ > 10) revert InvalidNumRarities();

        __Ownable_init(owner_);
        __Pausable_init();

        asset = IERC20(asset_);
        treasury = treasury_;
        economyManager = economyManager_;
        numRarities = numRarities_;

        // Initialize rarity pools
        for (uint8 i = 0; i < numRarities_; i++) {
            rarityPools.push(RarityPool({accYieldPerUSD: 0, totalValueUSD: 0}));
        }
    }

    // ─── Card-level operations ──────────────────────────────────────────

    /// @inheritdoc ICardGroupedVault
    function registerCardDeposit(bytes32 cardId, address depositor, uint256 priceUSD, uint8 rarity, uint256 count)
        external
        override
        onlyTreasury
        whenNotPaused
        nonReentrant
    {
        if (depositor == address(0)) revert ZeroAddress();
        if (priceUSD == 0) revert ZeroPrice();
        if (count == 0) revert ZeroAmount();
        if (rarity >= numRarities) revert InvalidRarity();

        CardNode storage card = cardNodes[cardId];
        DepositorPosition storage pos = positions[cardId][depositor];

        // First deposit for this card — initialize the node
        if (card.totalCount == 0 && card.cardPriceUSD == 0) {
            card.rarity = rarity;
            card.cardPriceUSD = priceUSD;
            card.baseAcc = rarityPools[rarity].accYieldPerUSD;
        }

        // Materialize pending yield before modifying position
        if (pos.count > 0) {
            uint256 unclaimed = _unclaimedOf(cardId, depositor);
            if (unclaimed > 0) {
                accruedYield[depositor] += unclaimed;
            }
        }

        // Update card totals
        uint256 addedValue = count * priceUSD;
        card.totalCount += count;
        rarityPools[card.rarity].totalValueUSD += addedValue;

        // Update position
        pos.count += count;
        _resetDebts(cardId, depositor);

        // Track depositor's card list
        _addDepositorCard(depositor, cardId);

        emit CardDepositRegistered(cardId, depositor, priceUSD, rarity, count);
    }

    /// @inheritdoc ICardGroupedVault
    function removeCardDeposit(bytes32 cardId, address depositor, uint256 count)
        external
        override
        onlyTreasury
        whenNotPaused
        nonReentrant
    {
        if (depositor == address(0)) revert ZeroAddress();
        if (count == 0) revert ZeroAmount();

        CardNode storage card = cardNodes[cardId];
        if (card.totalCount == 0) revert CardNotRegistered();

        DepositorPosition storage pos = positions[cardId][depositor];
        if (pos.count < count) revert InsufficientPosition();

        // Materialize pending yield before modifying position
        uint256 unclaimed = _unclaimedOf(cardId, depositor);
        if (unclaimed > 0) {
            accruedYield[depositor] += unclaimed;
        }

        // Update totals
        uint256 removedValue = count * card.cardPriceUSD;
        card.totalCount -= count;
        rarityPools[card.rarity].totalValueUSD -= removedValue;

        // Update position
        pos.count -= count;
        _resetDebts(cardId, depositor);

        // Remove from depositor's card list if empty
        if (pos.count == 0) {
            _removeDepositorCard(depositor, cardId);
        }

        // When the last token of this card is removed, zero out the card node so that a
        // subsequent re-deposit does not inherit a stale price or rarity from a previous stint.
        if (card.totalCount == 0) {
            card.cardPriceUSD = 0;
            card.rarity = 0;
            card.baseAcc = 0;
            card.correctionPerUnit = 0;
            card.settledYieldPerUnit = 0;
        }

        emit CardDepositRemoved(cardId, depositor, count);
    }

    /// @inheritdoc ICardGroupedVault
    function updateCardPrice(bytes32 cardId, uint256 newPriceUSD) external override onlyTreasury whenNotPaused {
        if (newPriceUSD == 0) revert ZeroPrice();

        CardNode storage card = cardNodes[cardId];
        if (card.totalCount == 0 && card.cardPriceUSD == 0) revert CardNotRegistered();

        uint256 oldPrice = card.cardPriceUSD;
        if (oldPrice == newPriceUSD) return;

        RarityPool storage pool = rarityPools[card.rarity];

        // O(1) correction:
        // correctionPerUnit += (newP - oldP) × (accYieldPerUSD[rarity] - baseAcc)
        int256 priceDelta = int256(newPriceUSD) - int256(oldPrice);
        int256 accDelta = int256(pool.accYieldPerUSD) - int256(card.baseAcc);

        // Use mulDiv for the unsigned magnitude, then apply sign
        // correction = priceDelta * accDelta / PRECISION
        if (priceDelta != 0 && accDelta != 0) {
            bool negative = (priceDelta < 0) != (accDelta < 0);
            uint256 absPriceDelta = priceDelta < 0 ? uint256(-priceDelta) : uint256(priceDelta);
            uint256 absAccDelta = accDelta < 0 ? uint256(-accDelta) : uint256(accDelta);
            uint256 absCorrectionInc = FixedPointMathLib.mulDiv(absPriceDelta, absAccDelta, PRECISION);
            card.correctionPerUnit += negative ? -int256(absCorrectionInc) : int256(absCorrectionInc);
        }

        // Update pool total value
        uint256 oldTotalValue = card.totalCount * oldPrice;
        uint256 newTotalValue = card.totalCount * newPriceUSD;
        pool.totalValueUSD = pool.totalValueUSD - oldTotalValue + newTotalValue;

        card.cardPriceUSD = newPriceUSD;

        emit CardPriceUpdated(cardId, oldPrice, newPriceUSD);
    }

    /// @inheritdoc ICardGroupedVault
    function migrateCardRarity(bytes32 cardId, uint8 newRarity, uint256 newPriceUSD)
        external
        override
        onlyTreasury
        whenNotPaused
    {
        if (newPriceUSD == 0) revert ZeroPrice();
        if (newRarity >= numRarities) revert InvalidRarity();

        CardNode storage card = cardNodes[cardId];
        if (card.totalCount == 0 && card.cardPriceUSD == 0) revert CardNotRegistered();

        uint8 oldRarity = card.rarity;
        uint256 oldPrice = card.cardPriceUSD;
        RarityPool storage oldPool = rarityPools[oldRarity];

        // Settle yield from old rarity:
        // settledYieldPerUnit += price × (accYieldPerUSD[oldR] - baseAcc) / PRECISION - correctionPerUnit
        {
            int256 accDelta = int256(oldPool.accYieldPerUSD) - int256(card.baseAcc);
            int256 mainYield = 0;
            if (accDelta > 0) {
                mainYield = int256(FixedPointMathLib.mulDiv(oldPrice, uint256(accDelta), PRECISION));
            }
            int256 settled = mainYield - card.correctionPerUnit;
            if (settled > 0) {
                card.settledYieldPerUnit += uint256(settled);
            }
            // If settled <= 0, it means corrections ate all yield (rare edge case);
            // we don't subtract from settledYieldPerUnit to avoid underflow.
        }

        // Remove value from old pool
        uint256 oldValue = card.totalCount * oldPrice;
        oldPool.totalValueUSD -= oldValue;

        // Move card to new rarity
        card.rarity = newRarity;
        card.cardPriceUSD = newPriceUSD;
        card.baseAcc = rarityPools[newRarity].accYieldPerUSD;
        card.correctionPerUnit = 0;

        // Add value to new pool
        uint256 newValue = card.totalCount * newPriceUSD;
        rarityPools[newRarity].totalValueUSD += newValue;

        emit CardRarityMigrated(cardId, oldRarity, newRarity, newPriceUSD);
    }

    // ─── Yield distribution ─────────────────────────────────────────────

    /// @inheritdoc ICardGroupedVault
    /// @dev Global value-weighted distribution. The `rarity` argument identifies the tier the
    ///      spin hit (retained for analytics and the emitted event) but does NOT scope the
    ///      payout: every card in the pool accrues yield in proportion to its own value share of
    ///      the WHOLE pool, regardless of which tier was drawn.
    ///
    ///      Rationale: a card of value V draws with probability 1/N, so it risks V/N of value per
    ///      spin. Paying it the V/totalValue share of the fee credits exactly V/N in expectation,
    ///      making expected depositor P&L value-neutral across tiers. The prior per-hit-rarity
    ///      routing instead paid every card ~fee/N regardless of value, leaving above-mean cards
    ///      (Epic/Legendary) structurally underwater. Since draws are uniform-over-pool, the hit
    ///      tier carries no merit signal that would justify concentrating yield there.
    ///
    ///      Implemented by bumping every non-empty pool's accumulator by the SAME per-USD amount
    ///      (amount/totalValue). A card's pending formula is unchanged, so the correction and
    ///      rarity-migration machinery all keep working; only the increment's denominator changed
    ///      from one pool's value to the whole pool's value.
    function distributeYield(uint256 amount, uint8 rarity)
        external
        override
        onlyEconomyManager
        whenNotPaused
        nonReentrant
    {
        if (amount == 0) revert ZeroAmount();
        if (rarity >= numRarities) revert InvalidRarity();

        uint8 n = numRarities;
        uint256 totalValueUSD;
        for (uint8 i; i < n; ++i) {
            totalValueUSD += rarityPools[i].totalValueUSD;
        }
        if (totalValueUSD == 0) revert NoValueInPool();

        // increment = amount × PRECISION / totalValueUSD  (shared across all pools)
        uint256 increment = FixedPointMathLib.mulDiv(amount, PRECISION, totalValueUSD);
        if (increment == 0) revert YieldTooSmall();

        address(asset).safeTransferFrom(msg.sender, address(this), amount);

        // Apply the same per-USD increment to every pool that holds value. Empty pools are
        // skipped (they hold no cards; a future deposit snapshots baseAcc at deposit time, so
        // skipping them changes nothing). Yield credited sums to `increment × totalValueUSD`,
        // i.e. `amount` less the usual flooring dust, matching the previous single-pool behaviour.
        for (uint8 i; i < n; ++i) {
            if (rarityPools[i].totalValueUSD > 0) {
                rarityPools[i].accYieldPerUSD += increment;
            }
        }
        totalYieldDistributed += amount;

        emit YieldDistributed(msg.sender, amount, rarity);
    }

    // ─── User-facing ────────────────────────────────────────────────────

    /// @inheritdoc ICardGroupedVault
    function claimYield(address account) external override whenNotPaused nonReentrant returns (uint256 withdrawn) {
        if (account == address(0)) revert ZeroAddress();
        if (msg.sender != account && msg.sender != economyManager) revert UnauthorizedClaim();

        withdrawn = _accrueAll(account);
        if (withdrawn == 0) revert NothingToClaim();

        _payOut(account, withdrawn);
        return withdrawn;
    }

    /**
     * @notice Claims yield for specific cards only (partial claim)
     * @param account  Address whose rewards will be withdrawn
     * @param cardIds  Array of card IDs to claim for
     * @return withdrawn Amount paid out in USDC
     */
    function claimYieldForCards(address account, bytes32[] calldata cardIds)
        external
        whenNotPaused
        nonReentrant
        returns (uint256 withdrawn)
    {
        if (account == address(0)) revert ZeroAddress();
        if (msg.sender != account && msg.sender != economyManager) revert UnauthorizedClaim();

        // Include any yield materialized during prior position changes
        withdrawn = accruedYield[account];
        if (withdrawn > 0) {
            accruedYield[account] = 0;
        }

        for (uint256 i; i < cardIds.length; ++i) {
            DepositorPosition storage pos = positions[cardIds[i]][account];
            if (pos.count == 0) continue;

            uint256 unclaimed = _unclaimedOf(cardIds[i], account);
            if (unclaimed > 0) {
                _resetDebts(cardIds[i], account);
                withdrawn += unclaimed;
            }
        }

        if (withdrawn == 0) revert NothingToClaim();
        _payOut(account, withdrawn);
        return withdrawn;
    }

    /**
     * @notice Claims yield over a contiguous slice of the depositor's card list so accounts with
     *         many cards can always claim in bounded-gas pages. The unpaginated {claimYield} loops
     *         over every card and can exceed the block gas limit for a very large position, which
     *         would otherwise strand that depositor's yield; this is the safe path for all sizes.
     * @dev Loop from offset 0 with a fixed page size, re-calling with the returned `nextOffset`
     *      until it is 0. The pre-materialized `accruedYield` bucket is paid out once, on the first
     *      page (offset == 0). Claiming does not remove cards from the list, so a straight 0..N walk
     *      is stable unless a concurrent deposit/withdraw reorders it (swap-and-pop); in that rare
     *      case a card may be revisited (yields 0, its debts already reset) or briefly skipped and
     *      picked up on a subsequent pass — no yield is lost.
     * @param account Address whose rewards will be withdrawn
     * @param offset  Starting index into the depositor's card list
     * @param limit   Maximum number of cards to process this page (must be > 0)
     * @return withdrawn  Amount paid out in USDC this page
     * @return nextOffset Index to resume from, or 0 when the end of the list was reached
     */
    function claimYieldPaginated(address account, uint256 offset, uint256 limit)
        external
        whenNotPaused
        nonReentrant
        returns (uint256 withdrawn, uint256 nextOffset)
    {
        if (account == address(0)) revert ZeroAddress();
        if (msg.sender != account && msg.sender != economyManager) revert UnauthorizedClaim();
        if (limit == 0) revert ZeroAmount();

        bytes32[] storage cards = _depositorCards[account];
        uint256 len = cards.length;
        uint256 end = offset + limit;
        if (end > len) end = len;
        // 0 signals "done" (end of list reached this page). offset==0 on an empty list also
        // returns 0, which callers treat as complete.
        nextOffset = end >= len ? 0 : end;

        for (uint256 i = offset; i < end; ++i) {
            bytes32 cardId = cards[i];
            uint256 unclaimed = _unclaimedOf(cardId, account);
            if (unclaimed > 0) {
                _resetDebts(cardId, account);
                withdrawn += unclaimed;
            }
        }

        // Pay the pre-materialized accruedYield bucket on the FINAL page (nextOffset == 0), not the
        // first. removeCardDeposit / auto-claim may add to accruedYield during a multi-page walk;
        // draining it at the end captures whatever materialized before the last page.
        if (nextOffset == 0) {
            uint256 bucket = accruedYield[account];
            if (bucket > 0) {
                accruedYield[account] = 0;
                withdrawn += bucket;
            }
        }

        // Tolerate empty pages so a pagination loop doesn't revert mid-walk; only pay when non-zero.
        if (withdrawn > 0) {
            _payOut(account, withdrawn);
        }
    }

    /// @notice Number of distinct cards a depositor holds positions in (page count basis).
    /// @param account Address to query
    function getDepositorCardCount(address account) external view returns (uint256) {
        return _depositorCards[account].length;
    }

    /// @inheritdoc ICardGroupedVault
    function pendingYield(address account) external view override returns (uint256 total) {
        total = accruedYield[account];
        bytes32[] storage cards = _depositorCards[account];
        for (uint256 i; i < cards.length; ++i) {
            total += _pendingForCard(cards[i], account);
        }
    }

    /// @notice Paginated {pendingYield} for depositors with many cards (bounded-gas view).
    /// @dev Includes the `accruedYield` bucket only on the final page (nextOffset == 0), mirroring
    ///      {claimYieldPaginated}, so summing all pages equals {pendingYield}.
    /// @param account Address to query
    /// @param offset  Starting index into the depositor's card list
    /// @param limit   Maximum number of cards to sum this page (must be > 0)
    /// @return total      Pending USDC accrued across this page's cards (plus the bucket on the last page)
    /// @return nextOffset Index to resume from, or 0 when the end of the list was reached
    function pendingYieldPaginated(address account, uint256 offset, uint256 limit)
        external
        view
        returns (uint256 total, uint256 nextOffset)
    {
        if (limit == 0) revert ZeroAmount();
        bytes32[] storage cards = _depositorCards[account];
        uint256 len = cards.length;
        uint256 end = offset + limit;
        if (end > len) end = len;
        nextOffset = end >= len ? 0 : end;
        for (uint256 i = offset; i < end; ++i) {
            total += _pendingForCard(cards[i], account);
        }
        if (nextOffset == 0) {
            total += accruedYield[account];
        }
    }

    /// @notice Paginated {sharesOf} for depositors with many cards (bounded-gas view).
    /// @param account Address to query
    /// @param offset  Starting index into the depositor's card list
    /// @param limit   Maximum number of cards to sum this page (must be > 0)
    /// @return total      Share value (count × price) across this page's cards
    /// @return nextOffset Index to resume from, or 0 when the end of the list was reached
    function sharesOfPaginated(address account, uint256 offset, uint256 limit)
        external
        view
        returns (uint256 total, uint256 nextOffset)
    {
        if (limit == 0) revert ZeroAmount();
        bytes32[] storage cards = _depositorCards[account];
        uint256 len = cards.length;
        uint256 end = offset + limit;
        if (end > len) end = len;
        for (uint256 i = offset; i < end; ++i) {
            bytes32 cardId = cards[i];
            total += positions[cardId][account].count * cardNodes[cardId].cardPriceUSD;
        }
        nextOffset = end >= len ? 0 : end;
    }

    /// @inheritdoc ICardGroupedVault
    function totalShares() external view override returns (uint256 total) {
        for (uint256 r; r < numRarities; ++r) {
            total += rarityPools[r].totalValueUSD;
        }
    }

    /// @inheritdoc ICardGroupedVault
    function sharesOf(address account) external view override returns (uint256 total) {
        bytes32[] storage cards = _depositorCards[account];
        for (uint256 i; i < cards.length; ++i) {
            DepositorPosition storage pos = positions[cards[i]][account];
            total += pos.count * cardNodes[cards[i]].cardPriceUSD;
        }
    }

    /**
     * @notice Returns the total value in a specific rarity pool
     * @param rarity Rarity tier index
     */
    function rarityTotalValue(uint8 rarity) external view returns (uint256) {
        return rarityPools[rarity].totalValueUSD;
    }

    /**
     * @notice Returns the list of card IDs a depositor has positions in
     * @param depositor Address to query
     */
    function getDepositorCards(address depositor) external view returns (bytes32[] memory) {
        return _depositorCards[depositor];
    }

    // ─── Admin ──────────────────────────────────────────────────────────

    /// @notice Updates the treasury address authorized to manage card positions
    /// @param newTreasury New treasury contract address (must be non-zero)
    function setTreasury(address newTreasury) external onlyOwner {
        if (newTreasury == address(0)) revert ZeroAddress();
        address previous = treasury;
        treasury = newTreasury;
        emit TreasuryUpdated(previous, newTreasury);
    }

    /// @notice Updates the economy manager address authorized to distribute yield
    /// @param newManager New economy manager contract address (must be non-zero)
    function setEconomyManager(address newManager) external onlyOwner {
        if (newManager == address(0)) revert ZeroAddress();
        address previous = economyManager;
        economyManager = newManager;
        emit EconomyManagerUpdated(previous, newManager);
    }

    /// @notice Pauses all vault operations (deposits, removals, claims, yield distribution)
    function pause() external onlyOwner {
        _pause();
    }

    /// @notice Unpauses vault operations
    function unpause() external onlyOwner {
        _unpause();
    }

    // ─── Internal: yield math ───────────────────────────────────────────

    /**
     * @dev Computes pending yield for a single card position (view)
     *
     *   pending = count × price × (accYieldPerUSD[rarity] - baseAcc) / PRECISION
     *           + count × settledYieldPerUnit / PRECISION
     *           - count × correctionPerUnit / PRECISION  (signed)
     *           - rewardDebt
     *           - settledDebt
     *           + correctionDebt (signed)
     */
    function _pendingForCard(bytes32 cardId, address depositor) internal view returns (uint256) {
        CardNode storage card = cardNodes[cardId];
        DepositorPosition storage pos = positions[cardId][depositor];
        if (pos.count == 0) return 0;

        RarityPool storage pool = rarityPools[card.rarity];

        // Main accumulator yield: count × price × (acc - base) / PRECISION → USDC
        int256 mainYield;
        {
            uint256 accDelta = pool.accYieldPerUSD - card.baseAcc;
            if (accDelta > 0) {
                mainYield = int256(FixedPointMathLib.mulDiv(pos.count * card.cardPriceUSD, accDelta, PRECISION));
            }
        }

        // Settled yield from previous rarity stints (in USDC × PRECISION units per token)
        int256 settledYield = _safeToInt256(pos.count) * _safeToInt256(card.settledYieldPerUnit);

        // Correction (signed, in USDC × PRECISION units per token)
        int256 correction = _safeToInt256(pos.count) * card.correctionPerUnit;

        // Total raw = mainYield + settledYield - correction - rewardDebt - settledDebt + correctionDebt
        int256 raw = mainYield + settledYield - correction - _safeToInt256(pos.rewardDebt)
            - _safeToInt256(pos.settledDebt) + pos.correctionDebt;

        return raw > 0 ? uint256(raw) : 0;
    }

    /**
     * @dev Returns the "unclaimed" portion that was already accrued into debt snapshots.
     */
    function _unclaimedOf(bytes32 cardId, address depositor) internal view returns (uint256) {
        return _pendingForCard(cardId, depositor);
    }

    /**
     * @dev Accrues all pending yield across all cards for a depositor.
     *      Iterates the depositor's card list, sums pending yield from each card
     *      via `_pendingForCard()`, and resets all debts so pending becomes zero.
     * @param depositor Address of the depositor to accrue for
     * @return total Aggregate pending yield across all cards (in USDC)
     */
    function _accrueAll(address depositor) internal returns (uint256 total) {
        total = accruedYield[depositor];
        if (total > 0) {
            accruedYield[depositor] = 0;
        }

        bytes32[] storage cards = _depositorCards[depositor];
        for (uint256 i; i < cards.length; ++i) {
            uint256 pending = _pendingForCard(cards[i], depositor);
            if (pending > 0) {
                total += pending;
            }
            _resetDebts(cards[i], depositor);
        }
    }

    /**
     * @dev Snapshots all three debt fields to match the current accumulator state, effectively
     *      "zeroing out" any pending yield so it is not double-counted after a position change.
     *
     *      The three debts mirror the three terms in the pending yield formula:
     *
     *        rewardDebt     = count * price * (accYieldPerUSD[rarity] - baseAcc) / PRECISION
     *                         Captures the main accumulator yield already owed.
     *
     *        correctionDebt = count * correctionPerUnit   (int256, in USDC × PRECISION units per token)
     *                         Captures the price-change correction already owed. Signed because
     *                         price decreases produce negative corrections.
     *
     *        settledDebt    = count * settledYieldPerUnit  (uint256, in USDC × PRECISION units per token)
     *                         Captures yield from previous rarity stints already owed.
     *
     *      When `pos.count == 0` (empty position), all debts are cleared to zero to avoid
     *      stale values persisting from a previous deposit.
     *
     *      Called after every position mutation (register, remove, claim) to keep the
     *      pending yield calculation consistent.
     *
     * @param cardId    Identifier of the card whose position debts are being reset
     * @param depositor Address of the depositor whose debts are being reset
     */
    function _resetDebts(bytes32 cardId, address depositor) internal {
        CardNode storage card = cardNodes[cardId];
        DepositorPosition storage pos = positions[cardId][depositor];
        if (pos.count == 0) {
            pos.rewardDebt = 0;
            pos.correctionDebt = 0;
            pos.settledDebt = 0;
            return;
        }

        RarityPool storage pool = rarityPools[card.rarity];

        // rewardDebt = count × price × (accYieldPerUSD - baseAcc) / PRECISION
        uint256 accDelta = pool.accYieldPerUSD - card.baseAcc;
        pos.rewardDebt = FixedPointMathLib.mulDiv(pos.count * card.cardPriceUSD, accDelta, PRECISION);

        // correctionDebt = count × correctionPerUnit (in USDC × PRECISION units per token)
        pos.correctionDebt = _safeToInt256(pos.count) * card.correctionPerUnit;

        // settledDebt = count × settledYieldPerUnit (in USDC × PRECISION units per token)
        pos.settledDebt = pos.count * card.settledYieldPerUnit;
    }

    /**
     * @dev Transfers USDC yield to the account, updates global claimed counter,
     *      and records analytics in GachaTreasury (best-effort, swallows failures).
     * @param account Recipient of the USDC payout
     * @param amount Amount of USDC to transfer
     */
    function _payOut(address account, uint256 amount) internal {
        totalYieldClaimed += amount;

        // Record analytics in GachaTreasury (best-effort)
        if (treasury != address(0) && treasury.code.length > 0) {
            try IGachaTreasuryYieldTracker(treasury).recordYieldClaim(account, amount) {}
            catch (bytes memory reason) {
                emit YieldTrackingFailed(account, amount, reason);
            }
        }

        if (IERC20(asset).balanceOf(address(this)) < amount) revert InsufficientVaultBalance();
        address(asset).safeTransfer(account, amount);

        emit YieldClaimed(account, amount);
    }

    // ─── Internal: depositor card list management ───────────────────────

    /// @dev Adds a cardId to the depositor's tracked card list if not already present.
    ///      Uses a 1-based index mapping for O(1) membership checks.
    /// @param depositor Address of the depositor
    /// @param cardId Card identifier to add
    function _addDepositorCard(address depositor, bytes32 cardId) internal {
        if (_depositorCardIndex[depositor][cardId] == 0) {
            _depositorCards[depositor].push(cardId);
            _depositorCardIndex[depositor][cardId] = _depositorCards[depositor].length; // 1-based
        }
    }

    /// @dev Removes a cardId from the depositor's tracked card list using swap-and-pop.
    ///      No-op if the cardId is not present. Updates the index mapping for the swapped element.
    /// @param depositor Address of the depositor
    /// @param cardId Card identifier to remove
    function _removeDepositorCard(address depositor, bytes32 cardId) internal {
        uint256 idxPlus = _depositorCardIndex[depositor][cardId];
        if (idxPlus == 0) return;

        uint256 idx = idxPlus - 1;
        bytes32[] storage list = _depositorCards[depositor];
        uint256 lastIndex = list.length - 1;

        if (idx != lastIndex) {
            bytes32 last = list[lastIndex];
            list[idx] = last;
            _depositorCardIndex[depositor][last] = idx + 1;
        }

        list.pop();
        delete _depositorCardIndex[depositor][cardId];
    }

    // ─── Safe cast ────────────────────────────────────────────────────

    /// @dev Safely casts uint256 to int256, reverting on overflow
    function _safeToInt256(uint256 value) internal pure returns (int256) {
        if (value > uint256(type(int256).max)) revert Int256Overflow();
        return int256(value);
    }

    // ─── Upgrade auth ───────────────────────────────────────────────────

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {
        if (newImplementation == address(0)) revert InvalidImplementation();
        if (newImplementation.code.length == 0) revert InvalidImplementation();
    }

    uint256[40] private __gap;
}
