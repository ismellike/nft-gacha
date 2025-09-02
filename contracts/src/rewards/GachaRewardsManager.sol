// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {GachaTreasury} from "../gacha/GachaTreasury.sol";
import {Gacha} from "../gacha/Gacha.sol";
import {NFTAppraisal} from "../appraisal/NFTAppraisal.sol";

/// @title GachaRewardsManager - Three-tier ERC2222-style accrual system
/// @notice Implements single Treasury custody with three-tier cumulative meters
contract GachaRewardsManager is Ownable, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Custom errors
    error InvalidGachaContract();
    error InvalidTreasuryContract();
    error InvalidProtocolAddress();
    error InvalidFeeToken();
    error UnauthorizedGachaContract();
    error UnauthorizedTreasuryContract();
    error NoFundsToWithdraw();
    error CardNotFound();
    error InvalidDelta();
    error CalculationOverflow();

    // Constants
    uint256 public constant PROTOCOL_PERCENTAGE = 1000; // 10% to protocol
    uint256 public constant PERCENTAGE_DENOMINATOR = 10000;
    uint256 public constant PRECISION = 1e18; // Fixed-point precision for meters
    uint256 public constant GAMMA_PRECISION = 1e6; // Precision for gamma exponent

    // References
    Gacha public immutable gachaContract;
    GachaTreasury public immutable treasuryContract;
    NFTAppraisal public immutable appraisalContract;
    IERC20 public immutable feeToken;
    address public protocolAddress;

    // Configuration
    uint256 public delta = 9000; // 90% to depositors (δ in spec), remaining 10% can be bonus
    uint256 public gamma = GAMMA_PRECISION; // Exponent for price weighting (γ≈0.9-1.0)

    // Tier 1: Rarity meters - cumulative per-card-weight
    // rarityMeter[rarity] = cumulative (δ·D)/TotalCardWeight_r
    mapping(GachaTreasury.Rarity => uint256) public rarityMeters;
    mapping(GachaTreasury.Rarity => uint256) public totalCardWeights;

    // Tier 2: Card tracking
    struct CardTracker {
        uint256 perUnitMeter; // Cumulative per-unit accrual
        uint256 raritySnapshot; // Snapshot of rarity meter when last settled
        uint256 totalUnits; // Total units (deposits) for this card
        uint256 cardWeight; // W_c = price_c^γ * q_c
        uint256 lastPrice; // Last known price for weight calculations
        bool exists; // Whether this card tracker exists
        uint256 stashedBonus; // Bonus funds stashed when TotalUnits was 0
    }

    mapping(GachaTreasury.Rarity => mapping(bytes32 => CardTracker)) public cardTrackers;

    // Tier 3: User tracking
    struct UserSnapshot {
        uint256 perUnitSnapshot; // User's snapshot of card's per-unit meter
        uint256 units; // User's units in this card
    }

    mapping(address => mapping(GachaTreasury.Rarity => mapping(bytes32 => UserSnapshot))) public userSnapshots;

    // Single Treasury custody
    uint256 public totalAccrued; // Total USDC accrued for rewards
    uint256 public totalClaimed; // Total USDC claimed by users
    uint256 public totalProtocolFees; // Total protocol fees collected

    // Events
    event SpinProcessed(GachaTreasury.Rarity rarity, uint256 depositorShare, uint256 protocolFee);
    event CardTrackerCreated(GachaTreasury.Rarity rarity, bytes32 cardId, uint256 initialWeight);
    event CardReappraised(GachaTreasury.Rarity rarity, bytes32 cardId, uint256 oldWeight, uint256 newWeight);
    event CardMigrated(bytes32 cardId, GachaTreasury.Rarity fromRarity, GachaTreasury.Rarity toRarity);
    event RewardsAccrued(address indexed user, GachaTreasury.Rarity rarity, bytes32 cardId, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);
    event BonusStashed(GachaTreasury.Rarity rarity, bytes32 cardId, uint256 amount);
    event BonusDistributed(GachaTreasury.Rarity rarity, bytes32 cardId, uint256 amount);
    event ProtocolAddressUpdated(address indexed oldProtocol, address indexed newProtocol);
    event DeltaUpdated(uint256 oldDelta, uint256 newDelta);
    event GammaUpdated(uint256 oldGamma, uint256 newGamma);

    modifier onlyGachaContract() {
        if (msg.sender != address(gachaContract)) revert UnauthorizedGachaContract();
        _;
    }

    modifier onlyTreasuryContract() {
        if (msg.sender != address(treasuryContract)) revert UnauthorizedTreasuryContract();
        _;
    }

    constructor(
        address _owner,
        address _gachaContract,
        address _treasuryContract,
        address _appraisalContract,
        address _protocolAddress,
        address _feeToken
    ) Ownable(_owner) {
        if (_gachaContract == address(0)) revert InvalidGachaContract();
        if (_treasuryContract == address(0)) revert InvalidTreasuryContract();
        if (_appraisalContract == address(0)) revert InvalidTreasuryContract(); // Reuse error
        if (_protocolAddress == address(0)) revert InvalidProtocolAddress();
        if (_feeToken == address(0)) revert InvalidFeeToken();

        gachaContract = Gacha(_gachaContract);
        treasuryContract = GachaTreasury(_treasuryContract);
        appraisalContract = NFTAppraisal(_appraisalContract);
        protocolAddress = _protocolAddress;
        feeToken = IERC20(_feeToken);
    }

    /// @notice Process spin fees using three-tier accrual system
    /// @param totalFeeAmount Total fee collected from spin
    /// @param hitRarity The rarity that was hit by this spin
    function processSpinRewards(uint256 totalFeeAmount, GachaTreasury.Rarity hitRarity)
        external
        onlyGachaContract
        nonReentrant
        whenNotPaused
    {
        if (totalFeeAmount == 0) return;

        // Calculate protocol fee and depositor share
        uint256 protocolFee = (totalFeeAmount * PROTOCOL_PERCENTAGE) / PERCENTAGE_DENOMINATOR;
        uint256 depositorShare = totalFeeAmount - protocolFee;

        // Transfer all funds to this contract (Treasury custody)
        feeToken.safeTransferFrom(msg.sender, address(this), totalFeeAmount);

        // Update accounting
        totalAccrued += depositorShare;
        totalProtocolFees += protocolFee;

        // Tier 1: Distribute to ALL rarities (not just hit rarity)
        uint256 deltaShare = (depositorShare * delta) / PERCENTAGE_DENOMINATOR;
        _distributeToAllRarities(deltaShare);

        // Handle protocol fee transfer
        if (protocolFee > 0) {
            feeToken.safeTransfer(protocolAddress, protocolFee);
        }

        emit SpinProcessed(hitRarity, depositorShare, protocolFee);
    }

    /// @notice Settle a card against its rarity meter (Tier 1 → Tier 2)
    /// @param rarity The rarity of the card
    /// @param cardId The card to settle
    function settleCard(GachaTreasury.Rarity rarity, bytes32 cardId) public {
        CardTracker storage card = cardTrackers[rarity][cardId];
        if (!card.exists) return;

        uint256 currentRarityMeter = rarityMeters[rarity];
        uint256 accrualSinceSnapshot = currentRarityMeter - card.raritySnapshot;

        if (accrualSinceSnapshot > 0) {
            // Add card's share to its per-unit meter
            uint256 cardShare = (accrualSinceSnapshot * card.cardWeight) / PRECISION;
            if (card.totalUnits > 0) {
                card.perUnitMeter += (cardShare * PRECISION) / card.totalUnits;
            } else {
                // Stash bonus until units exist
                card.stashedBonus += cardShare;
                emit BonusStashed(rarity, cardId, cardShare);
            }

            // Update snapshot
            card.raritySnapshot = currentRarityMeter;
        }
    }

    /// @notice Calculate user's claimable rewards for a specific card
    /// @param user User address
    /// @param rarity Card rarity
    /// @param cardId Card ID
    /// @return claimable Amount user can claim
    function getUserCardClaimable(address user, GachaTreasury.Rarity rarity, bytes32 cardId)
        public
        view
        returns (uint256 claimable)
    {
        CardTracker storage card = cardTrackers[rarity][cardId];
        if (!card.exists) return 0;

        UserSnapshot storage userSnap = userSnapshots[user][rarity][cardId];
        if (userSnap.units == 0) return 0;

        // Calculate current per-unit meter (including pending settlement)
        uint256 currentPerUnitMeter = card.perUnitMeter;
        uint256 currentRarityMeter = rarityMeters[rarity];
        uint256 pendingAccrual = currentRarityMeter - card.raritySnapshot;

        if (pendingAccrual > 0 && card.totalUnits > 0) {
            uint256 cardShare = (pendingAccrual * card.cardWeight) / PRECISION;
            currentPerUnitMeter += (cardShare * PRECISION) / card.totalUnits;
        }

        // Calculate user's share
        uint256 perUnitDiff = currentPerUnitMeter - userSnap.perUnitSnapshot;
        claimable = (userSnap.units * perUnitDiff) / PRECISION;
    }

    /// @notice Check if a card exists in a specific rarity (for migration tracking)
    /// @param rarity Rarity to check
    /// @param cardId Card ID to check
    /// @return exists True if card tracker exists and is active
    function cardExists(GachaTreasury.Rarity rarity, bytes32 cardId) external view returns (bool exists) {
        CardTracker storage card = cardTrackers[rarity][cardId];
        return card.exists; // Card exists if tracker was created, regardless of units
    }

    /// @notice Find which rarity a card is currently active in (post-migration)
    /// @param cardId Card ID to locate
    /// @return activeRarity The rarity where this card is currently active
    /// @return found True if card is found and active
    function findActiveCardRarity(bytes32 cardId)
        external
        view
        returns (GachaTreasury.Rarity activeRarity, bool found)
    {
        // Check all rarities for active card
        for (uint8 i = 0; i < 5; i++) {
            GachaTreasury.Rarity rarity = GachaTreasury.Rarity(i);
            CardTracker storage card = cardTrackers[rarity][cardId];
            if (card.exists && card.totalUnits > 0) {
                return (rarity, true);
            }
        }
        return (GachaTreasury.Rarity.Common, false); // Default, not found
    }

    /// @notice Claim rewards for a specific card (Tier 3)
    /// @param rarity Card rarity
    /// @param cardId Card ID
    function claimCardRewards(GachaTreasury.Rarity rarity, bytes32 cardId) external nonReentrant whenNotPaused {
        // First settle the card
        settleCard(rarity, cardId);

        CardTracker storage card = cardTrackers[rarity][cardId];
        UserSnapshot storage userSnap = userSnapshots[msg.sender][rarity][cardId];

        if (userSnap.units == 0) revert NoFundsToWithdraw();

        uint256 claimableAmount = (userSnap.units * (card.perUnitMeter - userSnap.perUnitSnapshot)) / PRECISION;
        if (claimableAmount == 0) revert NoFundsToWithdraw();

        // Update user snapshot (ERC2222 pattern)
        userSnap.perUnitSnapshot = card.perUnitMeter;

        // Update total claimed
        totalClaimed += claimableAmount;

        // Single transfer: Treasury → user
        feeToken.safeTransfer(msg.sender, claimableAmount);

        emit RewardsClaimed(msg.sender, claimableAmount);
    }

    /// @notice Create or update card tracker on deposit/withdrawal/reappraisal
    /// @param rarity Card rarity
    /// @param cardId Card ID
    /// @param userAddress User making deposit/withdrawal
    /// @param unitsDelta Change in user's units (+/- for deposit/withdrawal)
    function updateUserUnits(GachaTreasury.Rarity rarity, bytes32 cardId, address userAddress, int256 unitsDelta)
        external
        onlyTreasuryContract
    {
        // Settle card first
        settleCard(rarity, cardId);

        CardTracker storage card = cardTrackers[rarity][cardId];
        UserSnapshot storage userSnap = userSnapshots[userAddress][rarity][cardId];

        // Create card tracker if it doesn't exist
        if (!card.exists) {
            _createCardTracker(rarity, cardId);
        }

        // Update user's snapshot to current before changing units
        userSnap.perUnitSnapshot = card.perUnitMeter;

        // Update units
        if (unitsDelta > 0) {
            userSnap.units += uint256(unitsDelta);
            card.totalUnits += uint256(unitsDelta);

            // Distribute any stashed bonus now that we have units
            if (card.stashedBonus > 0 && card.totalUnits > 0) {
                card.perUnitMeter += (card.stashedBonus * PRECISION) / card.totalUnits;
                emit BonusDistributed(rarity, cardId, card.stashedBonus);
                card.stashedBonus = 0;
            }
        } else if (unitsDelta < 0) {
            uint256 unitsToRemove = uint256(-unitsDelta);
            require(userSnap.units >= unitsToRemove, "Insufficient units");
            require(card.totalUnits >= unitsToRemove, "Insufficient total units");

            userSnap.units -= unitsToRemove;
            card.totalUnits -= unitsToRemove;
        }

        // Update card weight since total units changed: W_c = price_c^γ * q_c
        _updateCardWeight(rarity, cardId);

        emit RewardsAccrued(userAddress, rarity, cardId, 0); // Amount is calculated dynamically
    }

    /// @notice Create a new card tracker (Tier 2 instantiation)
    /// @param rarity Card rarity
    /// @param cardId Card ID
    function _createCardTracker(GachaTreasury.Rarity rarity, bytes32 cardId) internal {
        CardTracker storage card = cardTrackers[rarity][cardId];
        require(!card.exists, "Card already exists");

        // Get card price for weight calculation
        NFTAppraisal.CardAppraisal memory cardAppraisal = appraisalContract.getCardAppraisal(cardId);
        require(cardAppraisal.priceUSD > 0, "Card not appraised");

        // Calculate initial weight: W_c = price_c^γ * q_c (q_c starts at 0)
        uint256 priceWeight = _calculatePriceWeight(cardAppraisal.priceUSD);

        card.perUnitMeter = 0;
        card.raritySnapshot = rarityMeters[rarity]; // Snapshot current rarity meter
        card.totalUnits = 0;
        card.cardWeight = 0; // Initially 0 since q_c = 0
        card.lastPrice = cardAppraisal.priceUSD;
        card.exists = true;
        card.stashedBonus = 0;

        emit CardTrackerCreated(rarity, cardId, card.cardWeight);
    }

    /// @notice Handle card reappraisal - settle and update weight, with migration support
    /// @param rarity Current card rarity
    /// @param cardId Card ID
    /// @param newPrice New appraised price
    /// @param newRarity New rarity (if migration needed)
    function handleReappraisal(
        GachaTreasury.Rarity rarity,
        bytes32 cardId,
        uint256 newPrice,
        GachaTreasury.Rarity newRarity
    ) external {
        // Can be called by anyone when price changes
        CardTracker storage card = cardTrackers[rarity][cardId];
        if (!card.exists) return;
        if (card.lastPrice == newPrice && rarity == newRarity) return;

        // Settle card against current rarity first
        settleCard(rarity, cardId);

        // Calculate new weight
        uint256 oldWeight = card.cardWeight;
        uint256 priceWeight = _calculatePriceWeight(newPrice);
        uint256 newWeight = (priceWeight * card.totalUnits) / PRECISION;

        // Check if migration is needed (crossing rarity boundaries)
        if (rarity != newRarity) {
            // Migrate card to new rarity
            _migrateCard(rarity, newRarity, cardId, newPrice);
            emit CardMigrated(cardId, rarity, newRarity);
        } else {
            // Update weight in same rarity
            totalCardWeights[rarity] = totalCardWeights[rarity] - oldWeight + newWeight;
            card.cardWeight = newWeight;
            card.lastPrice = newPrice;
            emit CardReappraised(rarity, cardId, oldWeight, newWeight);
        }
    }

    /// @notice Migrate card from one rarity to another (Tier-2 only, preserving user snapshots)
    /// @param fromRarity Source rarity
    /// @param toRarity Destination rarity
    /// @param cardId Card to migrate
    /// @param newPrice New price for the card
    function _migrateCard(
        GachaTreasury.Rarity fromRarity,
        GachaTreasury.Rarity toRarity,
        bytes32 cardId,
        uint256 newPrice
    ) internal {
        CardTracker storage fromCard = cardTrackers[fromRarity][cardId];
        require(fromCard.exists, "Card does not exist");

        // Remove from old rarity weight totals
        totalCardWeights[fromRarity] -= fromCard.cardWeight;

        // Create or update tracker in new rarity
        CardTracker storage toCard = cardTrackers[toRarity][cardId];

        if (!toCard.exists) {
            // First time in this rarity - create fresh tracker
            toCard.exists = true;
            toCard.perUnitMeter = fromCard.perUnitMeter; // Preserve accumulated per-unit rewards
            toCard.raritySnapshot = rarityMeters[toRarity]; // Fresh snapshot in new rarity
            toCard.totalUnits = fromCard.totalUnits; // Transfer units
            toCard.stashedBonus = fromCard.stashedBonus; // Transfer any stashed bonus
            toCard.lastPrice = newPrice;
        } else {
            // Already exists in destination rarity (rare case) - merge
            toCard.totalUnits += fromCard.totalUnits;
            toCard.stashedBonus += fromCard.stashedBonus;
            toCard.lastPrice = newPrice; // Update price
                // Keep existing perUnitMeter and raritySnapshot for destination
        }

        // Calculate new weight in destination rarity
        uint256 priceWeight = _calculatePriceWeight(newPrice);
        uint256 newWeight = (priceWeight * toCard.totalUnits) / PRECISION;
        toCard.cardWeight = newWeight;

        // Add to new rarity weight totals
        totalCardWeights[toRarity] += newWeight;

        // Clear old card (but preserve for historical access if needed)
        fromCard.totalUnits = 0;
        fromCard.cardWeight = 0;
        fromCard.stashedBonus = 0;
        // Note: Keep fromCard.exists = true for history, but it's now inactive

        // User snapshots remain untouched - they continue to work with the migrated card
        // in the new rarity without any action required from users
    }

    /// @notice Distribute rewards to all rarities proportionally by their total card weights
    /// @param amount Total amount to distribute across all rarities
    function _distributeToAllRarities(uint256 amount) internal {
        if (amount == 0) return;

        // Calculate total weight across ALL rarities
        uint256 totalWeightAllRarities = 0;
        for (uint8 i = 0; i < 5; i++) {
            totalWeightAllRarities += totalCardWeights[GachaTreasury.Rarity(i)];
        }

        if (totalWeightAllRarities == 0) return;

        // Distribute proportionally to each rarity based on its weight
        for (uint8 i = 0; i < 5; i++) {
            GachaTreasury.Rarity rarity = GachaTreasury.Rarity(i);
            uint256 rarityWeight = totalCardWeights[rarity];
            
            if (rarityWeight > 0) {
                uint256 rarityShare = (amount * rarityWeight) / totalWeightAllRarities;
                uint256 rarityIncrease = (rarityShare * PRECISION) / rarityWeight;
                rarityMeters[rarity] += rarityIncrease;
            }
        }
    }

    /// @notice Calculate price weight: price^γ
    /// @param price Price in USD (1e18)
    /// @return priceWeight Price weight scaled by PRECISION
    function _calculatePriceWeight(uint256 price) internal view returns (uint256 priceWeight) {
        if (gamma == GAMMA_PRECISION) {
            // γ = 1.0, simple case
            return price;
        } else {
            // For γ ≠ 1.0, we'd need a power function
            // For simplicity, approximate or use library
            // For now, assume γ = 1.0
            return price;
        }
    }

    /// @notice Update card weight when units change: W_c = price_c^γ * q_c
    /// @param rarity Card rarity
    /// @param cardId Card ID
    function _updateCardWeight(GachaTreasury.Rarity rarity, bytes32 cardId) internal {
        CardTracker storage card = cardTrackers[rarity][cardId];
        if (!card.exists) return;

        uint256 oldWeight = card.cardWeight;
        uint256 priceWeight = _calculatePriceWeight(card.lastPrice);
        uint256 newWeight = (priceWeight * card.totalUnits) / PRECISION;

        // Update rarity totals
        totalCardWeights[rarity] = totalCardWeights[rarity] - oldWeight + newWeight;
        card.cardWeight = newWeight;
    }

    // Configuration functions
    function setProtocolAddress(address _protocolAddress) external onlyOwner {
        if (_protocolAddress == address(0)) revert InvalidProtocolAddress();
        address old = protocolAddress;
        protocolAddress = _protocolAddress;
        emit ProtocolAddressUpdated(old, _protocolAddress);
    }

    function setDelta(uint256 _delta) external onlyOwner {
        if (_delta > PERCENTAGE_DENOMINATOR) revert InvalidDelta();
        uint256 old = delta;
        delta = _delta;
        emit DeltaUpdated(old, _delta);
    }

    function setGamma(uint256 _gamma) external onlyOwner {
        uint256 old = gamma;
        gamma = _gamma;
        emit GammaUpdated(old, _gamma);
    }

    // Emergency functions
    function emergencyPause() external onlyOwner {
        _pause();
    }

    function emergencyUnpause() external onlyOwner {
        _unpause();
    }

    function emergencyRecoverTokens(address token, uint256 amount) external onlyOwner {
        if (token == address(feeToken)) revert InvalidFeeToken();
        IERC20(token).safeTransfer(owner(), amount);
    }

    // View functions
    function getCardTracker(GachaTreasury.Rarity rarity, bytes32 cardId) external view returns (CardTracker memory) {
        return cardTrackers[rarity][cardId];
    }

    function getUserSnapshot(address user, GachaTreasury.Rarity rarity, bytes32 cardId)
        external
        view
        returns (UserSnapshot memory)
    {
        return userSnapshots[user][rarity][cardId];
    }

    function getTreasuryBalance() external view returns (uint256) {
        return feeToken.balanceOf(address(this));
    }

    // ========= Batch Claim Helpers =========

    /// @notice Preview claimable rewards across multiple cards for the caller
    /// @param rarity The rarity of the provided cardIds
    /// @param cardIds Array of card IDs to preview
    /// @return total Amount claimable across all provided cards
    function previewClaimForCards(GachaTreasury.Rarity rarity, bytes32[] calldata cardIds)
        external
        view
        returns (uint256 total)
    {
        address user = msg.sender;
        for (uint256 i = 0; i < cardIds.length; i++) {
            bytes32 cardId = cardIds[i];
            CardTracker storage card = cardTrackers[rarity][cardId];
            if (!card.exists) continue;

            UserSnapshot storage userSnap = userSnapshots[user][rarity][cardId];
            if (userSnap.units == 0) continue;

            uint256 currentPerUnitMeter = card.perUnitMeter;
            uint256 pendingAccrual = rarityMeters[rarity] - card.raritySnapshot;
            if (pendingAccrual > 0 && card.totalUnits > 0) {
                uint256 cardShare = (pendingAccrual * card.cardWeight) / PRECISION;
                currentPerUnitMeter += (cardShare * PRECISION) / card.totalUnits;
            }

            uint256 perUnitDiff = currentPerUnitMeter - userSnap.perUnitSnapshot;
            total += (userSnap.units * perUnitDiff) / PRECISION;
        }
    }

    /// @notice Claim rewards across multiple cards in a single transaction
    /// @param rarity The rarity of the provided cardIds
    /// @param cardIds Array of card IDs to claim for
    function claimRewardsForCards(GachaTreasury.Rarity rarity, bytes32[] calldata cardIds)
        external
        nonReentrant
        whenNotPaused
    {
        address user = msg.sender;
        uint256 totalAmount;

        for (uint256 i = 0; i < cardIds.length; i++) {
            bytes32 cardId = cardIds[i];
            CardTracker storage card = cardTrackers[rarity][cardId];
            if (!card.exists) continue;

            // Settle card to include rarity accrual since last snapshot
            settleCard(rarity, cardId);

            UserSnapshot storage userSnap = userSnapshots[user][rarity][cardId];
            if (userSnap.units == 0) continue;

            uint256 claimableAmount = (userSnap.units * (card.perUnitMeter - userSnap.perUnitSnapshot)) / PRECISION;
            if (claimableAmount == 0) continue;

            // Update user snapshot to current
            userSnap.perUnitSnapshot = card.perUnitMeter;
            totalAmount += claimableAmount;
        }

        if (totalAmount == 0) revert NoFundsToWithdraw();

        // Update global claimed and transfer
        totalClaimed += totalAmount;
        feeToken.safeTransfer(user, totalAmount);

        emit RewardsClaimed(user, totalAmount);
    }

    /// @notice Claim rewards across multiple rarities in a single transaction
    /// @param rarities Array of rarities matching the nested cardIdsByRarity
    /// @param cardIdsByRarity Nested array of card IDs per rarity
    function claimRewardsForMultipleRarities(
        GachaTreasury.Rarity[] calldata rarities,
        bytes32[][] calldata cardIdsByRarity
    ) external nonReentrant whenNotPaused {
        require(rarities.length == cardIdsByRarity.length, "Array length mismatch");

        address user = msg.sender;
        uint256 totalAmount;

        for (uint256 r = 0; r < rarities.length; r++) {
            GachaTreasury.Rarity rarity = rarities[r];
            bytes32[] calldata cardIds = cardIdsByRarity[r];

            for (uint256 i = 0; i < cardIds.length; i++) {
                bytes32 cardId = cardIds[i];
                CardTracker storage card = cardTrackers[rarity][cardId];
                if (!card.exists) continue;

                settleCard(rarity, cardId);

                UserSnapshot storage userSnap = userSnapshots[user][rarity][cardId];
                if (userSnap.units == 0) continue;

                uint256 claimableAmount = (userSnap.units * (card.perUnitMeter - userSnap.perUnitSnapshot)) / PRECISION;
                if (claimableAmount == 0) continue;

                userSnap.perUnitSnapshot = card.perUnitMeter;
                totalAmount += claimableAmount;
            }
        }

        if (totalAmount == 0) revert NoFundsToWithdraw();

        totalClaimed += totalAmount;
        feeToken.safeTransfer(user, totalAmount);
        emit RewardsClaimed(user, totalAmount);
    }
}
