// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {IERC721Receiver} from "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import {ReentrancyGuardTransient} from "@openzeppelin/contracts/utils/ReentrancyGuardTransient.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {NFTAppraisal} from "../appraisal/NFTAppraisal.sol";
import {ICardGroupedVault} from "../interfaces/ICardGroupedVault.sol";

/// @notice Minimal interface for reading redemptionWindow from ProtocolTreasury
interface IRedemptionWindow {
    function redemptionWindow() external view returns (uint256);
}

/**
 * @title GachaTreasury - Upgradeable Price-Based NFT Treasury Management
 * @notice Manages NFT storage with automatic rarity assignment based on appraised USD values
 * @dev Integrates with NFTAppraisal contract for price-based categorization with immutable price ranges
 * @dev Number of rarities is configurable at initialization (2-10, immutable after init)
 * @dev This contract is upgradeable using UUPS proxy pattern
 * @author NFT Gacha Team
 */
contract GachaTreasury is
    IERC721Receiver,
    Initializable,
    OwnableUpgradeable,
    PausableUpgradeable,
    ReentrancyGuardTransient,
    UUPSUpgradeable
{
    /// @notice Custom errors for gas efficiency and clear error handling
    error InvalidCollectionAddress();
    error NFTAlreadyDeposited();
    error InvalidNFTContract();
    error NotNFTOwner();
    error InvalidIndex();
    error InvalidRecipient();
    error ArrayLengthMismatch();
    error EmptyArrays();
    error TooManyItems();
    error InvalidGachaContract();
    error UnauthorizedGachaContract();
    error CollectionNotWhitelisted();
    error CollectionAlreadyWhitelisted();
    error CollectionNotInWhitelist();
    error InvalidAppraisalContract();
    error NFTNotAppraised();
    error AppraisalRequired();
    error InvalidPriceRange();
    error PriceRangesAlreadySet();
    error PriceOutOfBounds(uint256 priceUSD);
    error NoNFTsAvailable(uint8 rarity);
    error NFTNotDeposited();
    error NotNFTDepositor();
    error InvalidCardGroupedVault();
    error InvalidProtocolTreasury();
    error UnauthorizedProtocolTreasury();
    error TreasuryRotationBlocked();
    error InsufficientDepositorValue();
    error InvalidLimit();
    error MaxCardDepositsReached();
    error InvalidNumRarities();
    error InvalidImplementation();

    /// @notice Maximum batch operation limits for gas optimization
    uint256 public constant MAX_BATCH_DEPOSIT = 50;
    uint256 public constant MAX_BATCH_WITHDRAW = 20;
    uint256 public constant MAX_MIGRATION_BATCH = 50;
    /// @notice Rarity price ranges must be continuous in 1-cent steps (1e16)
    uint256 private constant PRICE_STEP = 1e16;

    /// @notice Price range for a rarity tier
    struct PriceRange {
        uint256 minPriceUSD; // Minimum price in USD (scaled by 1e18)
        uint256 maxPriceUSD; // Maximum price in USD (scaled by 1e18)
    }

    /// @notice Represents an NFT stored in the treasury
    struct NFTItem {
        address collection; // NFT collection contract address
        address depositor; // Original depositor address
        uint256 tokenId; // Token ID within the collection
        uint256 appraisedPrice; // USD price when deposited (scaled by 1e18)
        uint8 rarity; // Current rarity tier based on price
        uint256 depositTime; // When NFT was deposited
        uint256 receiveTime; // When user received the NFT from gacha (0 if not won yet)
    }

    /// @notice User's card deposit information for frontend display
    struct UserCardDeposit {
        bytes32 cardId; // Card ID (group identifier)
        uint256 depositCount; // Number of tokens deposited for this card
        uint256 totalCardDeposits; // Total deposits across all users for this card
    }

    /// @notice Number of rarity tiers (2-10, set once during init)
    uint8 public numRarities;

    /// @notice On-chain rarity names
    string[] public rarityNames;

    /// @notice Core treasury storage
    mapping(uint8 => NFTItem[]) public treasury;
    /// @dev NFTs organized by rarity
    mapping(uint8 => uint256) public rarityCount;
    /// @dev Count of NFTs per rarity

    /// @notice Contract addresses
    address public gachaContract;
    NFTAppraisal public appraisalContract;
    ICardGroupedVault public cardGroupedVault;
    address public protocolTreasury;

    /// @notice Scalar for converting yield token amounts to 18-decimal USD (0 = default 1e12 for USDC)
    uint256 public yieldClaimDecimalScalar;

    /// @notice Price ranges for each rarity tier (set during initialization, not modifiable afterwards)
    PriceRange[] public priceRanges;

    /// @notice Track if price ranges have been set (to prevent changes after initialization)
    bool public priceRangesSet;

    /// @notice Duplicate protection and indexing
    mapping(address => mapping(uint256 => bool)) public depositedNFTs;
    mapping(address => mapping(uint256 => uint256)) public nftToTreasuryIndex; // collection => tokenId => index in rarity array
    mapping(address => mapping(uint256 => uint8)) public nftCurrentRarity; // collection => tokenId => current rarity
    mapping(address => mapping(uint256 => uint256)) public nftReceiveTimes; // collection => tokenId => when user received NFT from gacha
    /// @notice Snapshot of redemption deadline at win time
    mapping(address => mapping(uint256 => uint256)) public nftRedemptionDeadlines;

    /// @notice User deposit tracking for rewards
    mapping(address => mapping(uint8 => uint256)) public userDepositCounts;
    mapping(address => uint256) public userTotalDeposits;
    /// @dev Slot preserved for storage layout compatibility (was userActiveDepositValueUSD)
    mapping(address => uint256) private __deprecated_userActiveDepositValueUSD;

    /// @notice Value-weighted dividend tracking
    mapping(address => mapping(uint8 => uint256)) public userDepositValues; // Total USD value deposited by user per rarity
    mapping(uint8 => uint256) public totalRarityValue; // Total USD value in each rarity pool

    /// @notice Lifetime user statistics tracking (industry standard)
    mapping(address => uint256) public userLifetimeClaimed; // Total value claimed by user across all time
    mapping(address => uint256) public userLifetimeDeposited; // Total value of NFTs deposited (for analytics)
    /// @notice Total value manually withdrawn by user (excludes gacha wins)
    mapping(address => uint256) public userLifetimeWithdrawn;
    uint256 public globalLifetimeClaimed; // Total claimed across all users
    uint256 public globalLifetimeDeposited; // Total deposited across all users

    /// @notice Card-level deposit tracking for enhanced rewards
    mapping(address => mapping(bytes32 => uint256)) public userCardDeposits; // user => cardId => count
    mapping(bytes32 => uint256) public cardTotalDeposits; // cardId => total count
    /// @notice Cached rarity per card so onCardPriceUpdated doesn't depend on any specific token
    mapping(bytes32 => uint8) public cardCurrentRarity;

    /// @notice Per-user list of active groupIds (bytes32 hashes) for pagination and batching
    mapping(address => bytes32[]) private userGroupIds; // user => groupIds
    mapping(address => mapping(bytes32 => uint256)) private userCardIdIndex; // index+1 by cardId

    /// @notice Maximum deposits allowed per card to bound migration gas
    uint256 public maxDepositsPerCard;

    /// @notice Tracks which deposited tokens belong to each card for O(card_tokens) migration
    struct CardTokenRef {
        address collection;
        uint256 tokenId;
    }

    mapping(bytes32 => CardTokenRef[]) private cardTokenRefs;
    /// @dev (collection, tokenId) => index+1 in cardTokenRefs[cardId] for O(1) removal
    mapping(address => mapping(uint256 => uint256)) private cardTokenRefIndex;

    /// @notice Collection whitelist management
    mapping(address => bool) public whitelistedCollections;
    address[] public whitelistedCollectionsList;
    /// @dev collection => index+1 in whitelistedCollectionsList for O(1) removal
    mapping(address => uint256) private whitelistedCollectionIndex;

    /// @notice Events for tracking treasury operations
    event NFTDeposited(
        address indexed collection,
        uint256 indexed tokenId,
        address indexed depositor,
        uint8 rarity,
        uint256 appraisedPrice
    );
    event NFTWithdrawn(address indexed collection, uint256 indexed tokenId, uint8 rarity, address indexed to);
    event GachaContractUpdated(address indexed oldGacha, address indexed newGacha);
    event BatchDeposited(uint256 count);

    event RarityMigrated(
        address indexed collection, uint256 indexed tokenId, uint8 oldRarity, uint8 newRarity, uint256 newPrice
    );

    event AppraisalContractUpdated(address indexed oldAppraisal, address indexed newAppraisal);
    event CollectionWhitelisted(address indexed collection);
    event CollectionRemovedFromWhitelist(address indexed collection);
    event CardGroupedVaultUpdated(address indexed oldVault, address indexed newVault);
    event ProtocolTreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    event MaxDepositsPerCardUpdated(uint256 oldMax, uint256 newMax);
    event YieldClaimDecimalScalarUpdated(uint256 oldScalar, uint256 newScalar);
    event RedemptionRestocked(
        address indexed collection,
        uint256 indexed tokenId,
        address indexed seller,
        uint8 rarity,
        uint256 appraisedPrice
    );
    event YieldClaimRecorded(address indexed user, uint256 amount);

    /// @notice Restricts access to the authorized gacha contract
    modifier onlyGacha() {
        _onlyGacha();
        _;
    }

    modifier onlyProtocolTreasury() {
        _onlyProtocolTreasury();
        _;
    }

    function _onlyGacha() internal view {
        if (msg.sender != gachaContract) revert UnauthorizedGachaContract();
    }

    function _onlyProtocolTreasury() internal view {
        if (msg.sender != protocolTreasury) revert UnauthorizedProtocolTreasury();
    }

    /**
     * @notice Initializes the treasury with required contracts and price ranges
     * @param _gachaContract Address of the authorized gacha contract
     * @param _appraisalContract Address of the NFT appraisal contract
     * @param _numRarities Number of rarity tiers (2-10)
     * @param _rarityNames On-chain names for each rarity tier
     * @param minPrices Array of minimum prices per rarity (scaled by 1e18)
     * @param maxPrices Array of maximum prices per rarity (scaled by 1e18)
     */
    function initialize(
        address _owner,
        address _gachaContract,
        address _appraisalContract,
        uint8 _numRarities,
        string[] memory _rarityNames,
        uint256[] memory minPrices,
        uint256[] memory maxPrices
    ) public initializer {
        __Ownable_init(_owner);
        __Pausable_init();
        // ReentrancyGuardTransient doesn't need initialization

        if (_gachaContract == address(0)) revert InvalidGachaContract();
        if (_appraisalContract == address(0)) revert InvalidAppraisalContract();

        // Validate rarity count
        if (_numRarities < 2 || _numRarities > 10) revert InvalidNumRarities();
        if (_rarityNames.length != _numRarities) revert ArrayLengthMismatch();
        if (minPrices.length != _numRarities) revert ArrayLengthMismatch();
        if (maxPrices.length != _numRarities) revert ArrayLengthMismatch();

        // Check if price ranges have already been set
        if (priceRangesSet) revert PriceRangesAlreadySet();

        numRarities = _numRarities;
        for (uint256 i = 0; i < _rarityNames.length; i++) {
            rarityNames.push(_rarityNames[i]);
        }

        _setInitialPriceRanges(_numRarities, minPrices, maxPrices);

        gachaContract = _gachaContract;
        appraisalContract = NFTAppraisal(_appraisalContract);
        maxDepositsPerCard = 50;
    }

    /**
     * @notice Authorizes upgrade to new implementation
     * @dev Only owner can upgrade the contract
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {
        if (newImplementation == address(0)) revert InvalidImplementation();
        if (newImplementation.code.length == 0) revert InvalidImplementation();
    }

    /// @dev Validates and stores the initial price ranges for all rarity tiers.
    ///      Requires: lowest tier starts at $0, highest tier is open-ended (type(uint256).max),
    ///      ranges are contiguous with 1-cent (PRICE_STEP) gaps, and min < max for all but the last.
    /// @param n Number of rarity tiers
    /// @param minPrices Array of minimum prices per rarity (scaled by 1e18)
    /// @param maxPrices Array of maximum prices per rarity (scaled by 1e18)
    function _setInitialPriceRanges(uint8 n, uint256[] memory minPrices, uint256[] memory maxPrices) private {
        // Lowest rarity must start at $0
        if (minPrices[0] != 0) revert InvalidPriceRange();
        // Highest rarity must be open-ended
        if (maxPrices[n - 1] != type(uint256).max) revert InvalidPriceRange();

        for (uint8 i = 0; i < n; i++) {
            // All ranges except the last must have min < max
            if (i < n - 1) {
                if (minPrices[i] >= maxPrices[i]) revert InvalidPriceRange();
            }
            // Ranges must be contiguous
            if (i > 0) {
                if (maxPrices[i - 1] + PRICE_STEP != minPrices[i]) revert InvalidPriceRange();
            }
            priceRanges.push(PriceRange({minPriceUSD: minPrices[i], maxPriceUSD: maxPrices[i]}));
        }
        priceRangesSet = true;
    }

    /// @notice Deposits an NFT into the treasury with automatic rarity assignment
    /// @param collection NFT collection address
    /// @param tokenId Token ID to deposit
    /// @dev Requires NFT to be appraised first, automatically assigns rarity based on price
    function depositNFT(address collection, uint256 tokenId) external whenNotPaused nonReentrant {
        _depositSingleNFT(collection, tokenId);
    }

    /// @notice Migrates an NFT to a new rarity tier based on updated appraisal
    /// @param collection NFT collection address
    /// @param tokenId Token ID to migrate
    /// @dev Can be called by anyone when appraisal price changes through appraisal system updates
    function migrateNFTRarity(address collection, uint256 tokenId) external whenNotPaused nonReentrant {
        _migrateNFTRarity(collection, tokenId);
    }

    /// @notice Batch migrate multiple NFTs to their correct rarity
    /// @param collections Array of NFT collection addresses
    /// @param tokenIds Array of token IDs to migrate
    function batchMigrateNFTRarity(address[] calldata collections, uint256[] calldata tokenIds)
        external
        whenNotPaused
        nonReentrant
    {
        uint256 length = collections.length;
        if (length != tokenIds.length) revert ArrayLengthMismatch();
        if (length == 0) revert EmptyArrays();
        if (length > MAX_MIGRATION_BATCH) revert TooManyItems();

        for (uint256 i; i < length;) {
            _migrateNFTRarity(collections[i], tokenIds[i]);
            unchecked { ++i; }
        }
    }

    /// @dev Migrates a single deposited NFT to the correct rarity tier based on its current appraisal.
    ///
    ///      Validation logic:
    ///      1. The NFT must already be deposited in the treasury (`depositedNFTs` check).
    ///      2. The appraisal must exist and be in Completed or OwnerOverride status with a
    ///         non-zero price; otherwise reverts with `NFTNotAppraised`.
    ///      3. The new price is mapped to a rarity tier via `getRarityByPrice()`, which searches
    ///         the contiguous price ranges configured at initialization. Each rarity tier i has
    ///         `[minPriceUSD[i], maxPriceUSD[i]]` and ranges are contiguous with 1-cent gaps.
    ///         If the price falls outside all ranges, `PriceOutOfBounds` is reverted.
    ///      4. If the computed rarity matches the current rarity, the function is a no-op (early return).
    ///
    ///      Migration steps (when rarity changes):
    ///      - Removes the NFT from the old rarity array using swap-and-pop (O(1) removal).
    ///      - Updates the index mapping for the swapped item.
    ///      - Pushes the NFT (with updated price and rarity) into the new rarity array.
    ///      - Updates all deposit counts, value-weighted tracking, and rarity counters.
    ///      - Note: vault-level sync is handled separately by `onCardPriceUpdated` at the card level.
    ///
    /// @param collection NFT collection address
    /// @param tokenId Token ID to migrate
    function _migrateNFTRarity(address collection, uint256 tokenId) internal {
        if (!depositedNFTs[collection][tokenId]) revert NFTNotDeposited();

        // Get current and new appraised price
        (uint256 newPriceUSD, NFTAppraisal.AppraisalStatus status) =
            appraisalContract.getAppraisedPrice(collection, tokenId);
        if (
            newPriceUSD == 0
                || (
                    status != NFTAppraisal.AppraisalStatus.Completed && status != NFTAppraisal.AppraisalStatus.OwnerOverride
                )
        ) {
            revert NFTNotAppraised();
        }

        uint8 currentRarity = nftCurrentRarity[collection][tokenId];

        // Determine new rarity based on updated price
        uint8 newRarity = getRarityByPrice(newPriceUSD);

        // Only migrate if rarity actually changes
        if (currentRarity == newRarity) return;

        // Find and remove NFT from current rarity array
        uint256 currentIndex = nftToTreasuryIndex[collection][tokenId];
        NFTItem[] storage currentTreasury = treasury[currentRarity];

        if (currentIndex >= currentTreasury.length) revert InvalidIndex();

        NFTItem memory item = currentTreasury[currentIndex];

        // Move last item to current position and pop
        currentTreasury[currentIndex] = currentTreasury[currentTreasury.length - 1];
        currentTreasury.pop();

        // Update index for moved item
        if (currentIndex < currentTreasury.length) {
            NFTItem memory movedItem = currentTreasury[currentIndex];
            nftToTreasuryIndex[movedItem.collection][movedItem.tokenId] = currentIndex;
        }

        unchecked {
            --rarityCount[currentRarity];
        }

        // Capture old price before updating
        uint256 oldPrice = item.appraisedPrice;

        // Update item with new price and rarity
        item.appraisedPrice = newPriceUSD;
        item.rarity = newRarity;

        // Add to new rarity array
        treasury[newRarity].push(item);
        nftToTreasuryIndex[collection][tokenId] = treasury[newRarity].length - 1;
        nftCurrentRarity[collection][tokenId] = newRarity;

        unchecked {
            ++rarityCount[newRarity];
        }

        // Update user deposit counts
        userDepositCounts[item.depositor][currentRarity]--;
        userDepositCounts[item.depositor][newRarity]++;

        // Update value-weighted tracking for dividend rewards
        userDepositValues[item.depositor][currentRarity] -= oldPrice;
        userDepositValues[item.depositor][newRarity] += newPriceUSD;
        totalRarityValue[currentRarity] -= oldPrice;
        totalRarityValue[newRarity] += newPriceUSD;
        // Note: vault sync is handled card-level via onCardPriceUpdated, not per-token

        emit RarityMigrated(collection, tokenId, currentRarity, newRarity, newPriceUSD);
    }

    /// @notice Allows users to withdraw their own deposited NFTs
    /// @param collection NFT collection address
    /// @param tokenId Token ID to withdraw
    function withdrawMyNFT(address collection, uint256 tokenId) external whenNotPaused nonReentrant {
        if (collection == address(0)) revert InvalidCollectionAddress();
        if (!depositedNFTs[collection][tokenId]) revert NFTNotDeposited();

        // Get the NFT's current rarity and treasury index
        uint8 rarity = nftCurrentRarity[collection][tokenId];
        uint256 index = nftToTreasuryIndex[collection][tokenId];

        if (index >= treasury[rarity].length) revert InvalidIndex();

        NFTItem storage item = treasury[rarity][index];

        // Store item data before modifying the array to prevent reference issues
        address depositor = item.depositor;
        uint256 appraisedPrice = item.appraisedPrice;

        // Verify the caller is the original depositor
        if (depositor != msg.sender) revert NotNFTDepositor();

        // Move the last item to the current position and pop
        uint256 lastIndex = treasury[rarity].length - 1;
        if (index != lastIndex) {
            NFTItem storage lastItem = treasury[rarity][lastIndex];
            treasury[rarity][index] = lastItem;
            nftToTreasuryIndex[lastItem.collection][lastItem.tokenId] = index;
        }
        treasury[rarity].pop();

        // Update counts and clean up mappings (effects before interactions)
        unchecked {
            --rarityCount[rarity];
        }
        userLifetimeWithdrawn[depositor] += appraisedPrice;
        depositedNFTs[collection][tokenId] = false;
        delete nftToTreasuryIndex[collection][tokenId];
        delete nftCurrentRarity[collection][tokenId];

        // External calls (interactions)
        _trackRemoval(depositor, collection, tokenId, rarity, appraisedPrice);
        IERC721(collection).safeTransferFrom(address(this), msg.sender, tokenId);

        emit NFTWithdrawn(collection, tokenId, rarity, msg.sender);
    }

    /// @notice Gets all NFT items stored in a specific rarity tier
    /// @param rarity Rarity tier index to query
    /// @return Array of NFT items in the specified rarity pool
    function getTreasuryItems(uint8 rarity) external view returns (NFTItem[] memory) {
        return treasury[rarity];
    }

    /// @notice Gets a specific NFT item from treasury
    /// @param rarity Rarity tier
    /// @param index Index in the rarity array
    /// @return NFT item at the specified position
    function getTreasuryItem(uint8 rarity, uint256 index) external view returns (NFTItem memory) {
        if (index >= treasury[rarity].length) revert InvalidIndex();
        return treasury[rarity][index];
    }

    /// @notice Gets the number of NFTs in a specific rarity tier
    /// @param rarity Rarity tier index to query
    /// @return Number of NFTs in the specified rarity pool
    function getRarityCount(uint8 rarity) external view returns (uint256) {
        return rarityCount[rarity];
    }

    /// @notice Returns the number of distinct groupIds a user has
    function getUserCardIdsLength(address user) external view returns (uint256) {
        return userGroupIds[user].length;
    }

    /// @notice Returns a paginated slice of the user's cardIds (keccak256 hashes)
    /// @param user The user address
    /// @param offset Starting index (0-based)
    /// @param limit Maximum number of items to return (1-100)
    /// @return cardIds Array of cardIds for this page
    /// @return total Total number of cardIds the user has
    /// @return hasMore Whether there are more items after this page
    function getUserCardIds(address user, uint256 offset, uint256 limit)
        external
        view
        returns (bytes32[] memory cardIds, uint256 total, bool hasMore)
    {
        if (limit == 0 || limit > 100) revert InvalidLimit();

        bytes32[] storage list = userGroupIds[user];
        total = list.length;

        if (offset >= total) {
            return (new bytes32[](0), total, false);
        }

        uint256 end = offset + limit;
        if (end > total) {
            end = total;
        }

        uint256 resultLength = end - offset;
        cardIds = new bytes32[](resultLength);
        for (uint256 i = 0; i < resultLength; i++) {
            cardIds[i] = list[offset + i];
        }

        hasMore = end < total;
    }


    /// @dev Internal: add a cardId (bytes32 hash) to user's list if absent, using cardId index
    function _addUserGroupId(address user, bytes32 cardId) internal {
        if (userCardIdIndex[user][cardId] == 0) {
            userGroupIds[user].push(cardId);
            userCardIdIndex[user][cardId] = userGroupIds[user].length; // 1-based
        }
    }

    /// @dev Internal: remove a groupId (by cardId) from user's list if present
    function _removeUserGroupId(address user, bytes32 cardId) internal {
        uint256 idxPlus = userCardIdIndex[user][cardId];
        if (idxPlus == 0) return; // not present
        uint256 idx = idxPlus - 1;
        bytes32[] storage list = userGroupIds[user];
        uint256 lastIndex = list.length - 1;
        if (idx != lastIndex) {
            bytes32 last = list[lastIndex];
            list[idx] = last;
            // Update the index for the moved element using its cardId hash
            bytes32 movedCardId = last;
            userCardIdIndex[user][movedCardId] = idx + 1;
        }
        list.pop();
        delete userCardIdIndex[user][cardId];
    }

    /// @dev Adds a token to the card's tracked token list if not already present.
    function _addCardTokenRef(bytes32 cardId, address collection, uint256 tokenId) internal {
        if (cardTokenRefIndex[collection][tokenId] == 0) {
            cardTokenRefs[cardId].push(CardTokenRef(collection, tokenId));
            cardTokenRefIndex[collection][tokenId] = cardTokenRefs[cardId].length; // 1-based
        }
    }

    /// @dev Removes a token from the card's tracked token list using swap-and-pop.
    function _removeCardTokenRef(bytes32 cardId, address collection, uint256 tokenId) internal {
        uint256 idxPlus = cardTokenRefIndex[collection][tokenId];
        if (idxPlus == 0) return;

        uint256 idx = idxPlus - 1;
        CardTokenRef[] storage refs = cardTokenRefs[cardId];
        uint256 lastIndex = refs.length - 1;

        if (idx != lastIndex) {
            CardTokenRef memory last = refs[lastIndex];
            refs[idx] = last;
            cardTokenRefIndex[last.collection][last.tokenId] = idx + 1;
        }

        refs.pop();
        delete cardTokenRefIndex[collection][tokenId];
    }

    /// @notice Gets all rarity counts in a single call to reduce RPC usage
    /// @return counts Array of rarity counts
    function getAllRarityCounts() external view returns (uint256[] memory counts) {
        counts = new uint256[](numRarities);
        for (uint8 i = 0; i < numRarities; i++) {
            counts[i] = rarityCount[i];
        }
    }

    /// @notice Gets the total number of NFTs across all rarity tiers
    /// @return Total count of NFTs in the treasury
    function getTotalItemsCount() external view returns (uint256) {
        uint256 total;
        for (uint8 i = 0; i < numRarities; i++) {
            total += rarityCount[i];
        }
        return total;
    }

    /// @notice Updates the authorized gacha contract address
    /// @param _gachaContract New gacha contract address (must be non-zero)
    function setGachaContract(address _gachaContract) external onlyOwner {
        if (_gachaContract == address(0)) revert InvalidGachaContract();
        address oldGacha = gachaContract;
        gachaContract = _gachaContract;
        emit GachaContractUpdated(oldGacha, _gachaContract);
    }

    /// @notice Updates the NFT appraisal contract address used for price lookups
    /// @param _appraisalContract New appraisal contract address (must be non-zero)
    function setAppraisalContract(address _appraisalContract) external onlyOwner {
        if (_appraisalContract == address(0)) revert InvalidAppraisalContract();
        address oldAppraisal = address(appraisalContract);
        appraisalContract = NFTAppraisal(_appraisalContract);
        emit AppraisalContractUpdated(oldAppraisal, _appraisalContract);
    }

    /// @notice Updates the card-grouped yield vault contract address
    /// @param _cardGroupedVault New vault contract address (must be non-zero)
    function setCardGroupedVault(address _cardGroupedVault) external onlyOwner {
        if (_cardGroupedVault == address(0)) revert InvalidCardGroupedVault();
        address previous = address(cardGroupedVault);
        cardGroupedVault = ICardGroupedVault(_cardGroupedVault);
        emit CardGroupedVaultUpdated(previous, _cardGroupedVault);
    }

    /// @notice Sets the maximum deposits allowed per card to bound migration gas
    /// @param _maxDepositsPerCard New maximum (must be > 0)
    function setMaxDepositsPerCard(uint256 _maxDepositsPerCard) external onlyOwner {
        if (_maxDepositsPerCard == 0) revert InvalidLimit();
        uint256 oldMax = maxDepositsPerCard;
        maxDepositsPerCard = _maxDepositsPerCard;
        emit MaxDepositsPerCardUpdated(oldMax, _maxDepositsPerCard);
    }

    /// @notice Sets the decimal scalar for yield claim analytics conversion
    /// @dev Set to 10^(18 - tokenDecimals). E.g. 1e12 for 6-decimal USDC, 1 for 18-decimal tokens.
    ///      Set to 0 to use the default (1e12 for USDC).
    /// @param scalar New scalar value
    function setYieldClaimDecimalScalar(uint256 scalar) external onlyOwner {
        uint256 oldScalar = yieldClaimDecimalScalar;
        yieldClaimDecimalScalar = scalar;
        emit YieldClaimDecimalScalarUpdated(oldScalar, scalar);
    }

    /// @notice Updates the protocol treasury address
    /// @dev Blocks rotation if the current treasury still has active deposits or vault shares
    ///      to prevent stranding unclaimed yield. Skips the guard on first-time configuration.
    /// @param _protocolTreasury New protocol treasury address (must be non-zero)
    function setProtocolTreasury(address _protocolTreasury) external onlyOwner {
        if (_protocolTreasury == address(0)) revert InvalidProtocolTreasury();

        // Skip guard if current treasury is unset (first-time configuration)
        if (protocolTreasury != address(0)) {
            // Prevent treasury rotation unless all NFTs are withdrawn to avoid yield loss
            if (userTotalDeposits[protocolTreasury] != 0) revert TreasuryRotationBlocked();
            // Also check vault shares to prevent stranding unclaimed yield
            if (address(cardGroupedVault) != address(0) && cardGroupedVault.sharesOf(protocolTreasury) != 0) {
                revert TreasuryRotationBlocked();
            }
        }

        address previous = protocolTreasury;
        protocolTreasury = _protocolTreasury;
        emit ProtocolTreasuryUpdated(previous, _protocolTreasury);
    }

    /**
     * @notice Called when a card's price is updated to sync vault and treasury arrays
     * @param cardId Card identifier
     * @param newPriceUSD New appraised USD price (18 decimals)
     * @dev Determines if rarity changes and routes to updateCardPrice or migrateCardRarity
     */
    function onCardPriceUpdated(bytes32 cardId, uint256 newPriceUSD) external whenNotPaused nonReentrant {
        // Only callable by appraisal contract
        if (msg.sender != address(appraisalContract)) revert InvalidAppraisalContract();
        if (address(cardGroupedVault) == address(0)) return;
        if (cardTotalDeposits[cardId] == 0) return;

        uint8 newRarity = getRarityByPrice(newPriceUSD);

        // O(1) lookup of the card's current rarity from the cached mapping
        uint8 currentRarity = cardCurrentRarity[cardId];

        if (currentRarity == newRarity) {
            // Same rarity — O(1) vault price update
            cardGroupedVault.updateCardPrice(cardId, newPriceUSD);
        } else {
            // Rarity change — O(1) vault migration + O(tokens) treasury array migration
            cardGroupedVault.migrateCardRarity(cardId, uint8(newRarity), newPriceUSD);

            // Migrate all deposited tokens of this card in treasury arrays
            _migrateCardTokensInTreasury(cardId, currentRarity, newRarity, newPriceUSD);
        }
    }

    /**
     * @dev Migrate all tokens of a card from one rarity to another in treasury arrays.
     *      Uses cardTokenRefs for O(card_tokens) iteration instead of scanning the entire pool.
     * @param cardId Card identifier
     * @param fromRarity Source rarity
     * @param toRarity Destination rarity
     * @param newPriceUSD New price for the tokens
     */
    function _migrateCardTokensInTreasury(
        bytes32 cardId,
        uint8 fromRarity,
        uint8 toRarity,
        uint256 newPriceUSD
    ) internal {
        CardTokenRef[] storage refs = cardTokenRefs[cardId];
        NFTItem[] storage fromArr = treasury[fromRarity];

        for (uint256 i; i < refs.length; ++i) {
            address collection = refs[i].collection;
            uint256 tokenId = refs[i].tokenId;

            // Skip tokens not in the source rarity (safety check)
            if (!depositedNFTs[collection][tokenId]) continue;
            if (nftCurrentRarity[collection][tokenId] != fromRarity) continue;

            uint256 currentIndex = nftToTreasuryIndex[collection][tokenId];

            // Save item data
            NFTItem memory movedItem = fromArr[currentIndex];
            uint256 oldPrice = movedItem.appraisedPrice;

            // Swap-and-pop from source
            uint256 lastIdx = fromArr.length - 1;
            if (currentIndex != lastIdx) {
                fromArr[currentIndex] = fromArr[lastIdx];
                NFTItem memory swapped = fromArr[currentIndex];
                nftToTreasuryIndex[swapped.collection][swapped.tokenId] = currentIndex;
            }
            fromArr.pop();

            unchecked {
                --rarityCount[fromRarity];
                ++rarityCount[toRarity];
            }

            // Update depositor value tracking
            userDepositValues[movedItem.depositor][fromRarity] -= oldPrice;
            userDepositValues[movedItem.depositor][toRarity] += newPriceUSD;
            totalRarityValue[fromRarity] -= oldPrice;
            totalRarityValue[toRarity] += newPriceUSD;

            // Update deposit counts
            userDepositCounts[movedItem.depositor][fromRarity]--;
            userDepositCounts[movedItem.depositor][toRarity]++;

            // Update item and push to destination
            movedItem.appraisedPrice = newPriceUSD;
            movedItem.rarity = toRarity;
            treasury[toRarity].push(movedItem);
            nftToTreasuryIndex[collection][tokenId] = treasury[toRarity].length - 1;
            nftCurrentRarity[collection][tokenId] = toRarity;

            emit RarityMigrated(collection, tokenId, fromRarity, toRarity, newPriceUSD);
        }

        // Update the cached card-level rarity
        cardCurrentRarity[cardId] = toRarity;
    }

    /**
     * @notice Determines the rarity tier based on USD price
     * @param priceUSD Price in USD (scaled by 1e18)
     * @return rarity The appropriate rarity tier for the price
     */
    function getRarityByPrice(uint256 priceUSD) public view returns (uint8 rarity) {
        // Search from highest rarity to lowest
        for (uint8 i = numRarities; i > 0;) {
            unchecked { --i; }
            PriceRange memory r = priceRanges[i];
            if (priceUSD >= r.minPriceUSD && priceUSD <= r.maxPriceUSD) return i;
        }
        revert PriceOutOfBounds(priceUSD);
    }

    /**
     * @notice Gets all price ranges in a single call
     * @return ranges Array of price ranges
     */
    function getAllPriceRanges() external view returns (PriceRange[] memory ranges) {
        ranges = new PriceRange[](numRarities);
        for (uint8 i = 0; i < numRarities; i++) {
            ranges[i] = priceRanges[i];
        }
    }

    /**
     * @notice Gets the price range for a specific rarity
     * @param rarity The rarity tier to query
     * @return minPrice Minimum price in USD
     * @return maxPrice Maximum price in USD
     */
    function getPriceRange(uint8 rarity) external view returns (uint256 minPrice, uint256 maxPrice) {
        if (rarity >= numRarities) revert InvalidPriceRange();
        PriceRange memory r = priceRanges[rarity];
        return (r.minPriceUSD, r.maxPriceUSD);
    }

    // Batch operations
    /// @notice Batch deposit multiple NFTs with automatic rarity assignment
    /// @param collections Array of NFT collection addresses
    /// @param tokenIds Array of token IDs
    function batchDepositNFT(address[] calldata collections, uint256[] calldata tokenIds)
        external
        whenNotPaused
        nonReentrant
    {
        uint256 length = collections.length;
        if (length != tokenIds.length) revert ArrayLengthMismatch();
        if (length == 0) revert EmptyArrays();
        if (length > MAX_BATCH_DEPOSIT) revert TooManyItems();

        for (uint256 i; i < length;) {
            _depositSingleNFT(collections[i], tokenIds[i]);
            unchecked { ++i; }
        }

        emit BatchDeposited(length);
    }

    /// @dev Shared deposit logic used by both depositNFT and batchDepositNFT.
    ///      Validates, transfers, and registers a single NFT into the treasury.
    function _depositSingleNFT(address collection, uint256 tokenId) internal {
        if (collection == address(0)) revert InvalidCollectionAddress();
        if (!whitelistedCollections[collection]) revert CollectionNotWhitelisted();
        if (depositedNFTs[collection][tokenId]) revert NFTAlreadyDeposited();
        if (!_isValidNFTContract(collection)) revert InvalidNFTContract();
        if (IERC721(collection).ownerOf(tokenId) != msg.sender) revert NotNFTOwner();

        // Get appraised price
        (uint256 priceUSD, NFTAppraisal.AppraisalStatus status) =
            appraisalContract.getAppraisedPrice(collection, tokenId);
        if (
            priceUSD == 0
                || (
                    status != NFTAppraisal.AppraisalStatus.Completed && status != NFTAppraisal.AppraisalStatus.OwnerOverride
                )
        ) {
            revert NFTNotAppraised();
        }

        uint8 rarity = getRarityByPrice(priceUSD);

        // Effects before interactions (CEI pattern)
        depositedNFTs[collection][tokenId] = true;
        nftCurrentRarity[collection][tokenId] = rarity;

        treasury[rarity].push(NFTItem({
            collection: collection,
            depositor: msg.sender,
            tokenId: tokenId,
            appraisedPrice: priceUSD,
            rarity: rarity,
            depositTime: block.timestamp,
            receiveTime: 0
        }));
        nftToTreasuryIndex[collection][tokenId] = treasury[rarity].length - 1;

        unchecked {
            ++rarityCount[rarity];
        }

        _trackDeposit(msg.sender, collection, tokenId, rarity, priceUSD);

        emit NFTDeposited(collection, tokenId, msg.sender, rarity, priceUSD);

        // Interaction last — safeTransferFrom may call onERC721Received
        IERC721(collection).safeTransferFrom(msg.sender, address(this), tokenId);
    }

    // Helper functions
    function _isValidNFTContract(address collection) private view returns (bool) {
        try IERC165(collection).supportsInterface(0x80ac58cd) returns (bool supported) {
            return supported;
        } catch {
            return false;
        }
    }

    /// @notice Checks if a specific NFT is currently deposited in the treasury
    /// @param collection NFT collection address
    /// @param tokenId Token ID to check
    /// @return True if the NFT is deposited
    function isNFTDeposited(address collection, uint256 tokenId) external view returns (bool) {
        return depositedNFTs[collection][tokenId];
    }

    /// @notice Gets the current rarity tier assigned to a deposited NFT
    /// @param collection NFT collection address
    /// @param tokenId Token ID to query
    /// @return Current rarity tier index (0 if not deposited or rarity 0)
    function getNFTCurrentRarity(address collection, uint256 tokenId) external view returns (uint8) {
        return nftCurrentRarity[collection][tokenId];
    }

    /// @notice Gets user's deposit count for a specific rarity
    /// @param user User address
    /// @param rarity Rarity to check
    /// @return count Number of deposits by user for the rarity
    function getUserDepositCount(address user, uint8 rarity) external view returns (uint256 count) {
        if (user == address(0)) return 0;
        return userDepositCounts[user][rarity];
    }

    /// @notice Gets user's total deposit count across all rarities
    /// @param user User address
    /// @return totalCount Total number of deposits by user
    function getUserTotalDepositCount(address user) external view returns (uint256 totalCount) {
        if (user == address(0)) return 0;
        return userTotalDeposits[user];
    }

    /// @notice Gets the time when a user received an NFT from gacha
    /// @param collection NFT collection address
    /// @param tokenId Token ID
    /// @return receiveTime Timestamp when user received the NFT (0 if not received from gacha)
    function getNFTReceiveTime(address collection, uint256 tokenId) external view returns (uint256 receiveTime) {
        return nftReceiveTimes[collection][tokenId];
    }

    /// @notice Gets the snapshot redemption deadline for an NFT
    /// @param collection NFT collection address
    /// @param tokenId Token ID
    /// @return deadline Timestamp deadline (0 if not set)
    function getNFTRedemptionDeadline(address collection, uint256 tokenId) external view returns (uint256 deadline) {
        return nftRedemptionDeadlines[collection][tokenId];
    }

    /// @notice Gets all deposit counts for a user across all rarities
    /// @param user User address
    /// @return counts Array of deposit counts
    function getUserAllDepositCounts(address user) external view returns (uint256[] memory counts) {
        counts = new uint256[](numRarities);
        if (user == address(0)) return counts; // Returns all zeros
        for (uint8 i = 0; i < numRarities; i++) {
            counts[i] = userDepositCounts[user][i];
        }
    }

    // ============ VALUE-WEIGHTED DIVIDEND FUNCTIONS ============

    /// @notice Gets user's total deposited value for a specific rarity
    /// @param user User address
    /// @param rarity Rarity to check
    /// @return value Total USD value (in 18 decimals) deposited by user for the rarity
    function getUserDepositValue(address user, uint8 rarity) external view returns (uint256 value) {
        if (user == address(0)) return 0;
        return userDepositValues[user][rarity];
    }

    /// @notice Gets total value in a specific rarity pool
    /// @param rarity Rarity to check
    /// @return totalValue Total USD value (in 18 decimals) in the rarity pool
    function getRarityTotalValue(uint8 rarity) external view returns (uint256 totalValue) {
        return totalRarityValue[rarity];
    }

    /// @notice Gets all deposit values for a user across all rarities
    /// @param user User address
    /// @return values Array of deposit values in USD (18 decimals)
    function getUserAllDepositValues(address user) external view returns (uint256[] memory values) {
        values = new uint256[](numRarities);
        if (user == address(0)) return values; // Returns all zeros
        for (uint8 i = 0; i < numRarities; i++) {
            values[i] = userDepositValues[user][i];
        }
    }

    /// @notice Gets total values across all rarity pools
    /// @return values Array of total values in USD (18 decimals)
    function getAllRarityTotalValues() external view returns (uint256[] memory values) {
        values = new uint256[](numRarities);
        for (uint8 i = 0; i < numRarities; i++) {
            values[i] = totalRarityValue[i];
        }
    }

    /// @notice Sends a pseudo-random NFT to winner (optimized for gas)
    /// @param rarity Rarity tier to select from
    /// @param randomSeed Random seed for selection (from VRF or similar)
    /// @param winner Winner's address
    /// @return item The NFT item that was sent
    function sendRandomNFTToWinner(uint8 rarity, uint256 randomSeed, address winner)
        external
        onlyGacha
        nonReentrant
        returns (NFTItem memory item)
    {
        uint256 totalCount = treasury[rarity].length;
        if (totalCount == 0) revert NoNFTsAvailable(rarity);
        if (winner == address(0)) revert InvalidRecipient();

        // O(1) random selection
        uint256 randomIndex = randomSeed % totalCount;
        return _removeNFTAtIndex(rarity, randomIndex, winner);
    }

    /// @notice Gas-optimized NFT removal using swap-and-pop
    /// @param rarity Rarity pool
    /// @param index Index to remove
    /// @param winner Winner receiving the NFT
    /// @return item Removed NFT item
    function _removeNFTAtIndex(uint8 rarity, uint256 index, address winner) private returns (NFTItem memory item) {
        NFTItem[] storage rarityTreasury = treasury[rarity];
        if (index >= rarityTreasury.length) revert InvalidIndex();

        item = rarityTreasury[index];

        // O(1) removal: swap with last element and pop
        rarityTreasury[index] = rarityTreasury[rarityTreasury.length - 1];
        rarityTreasury.pop();

        // Update index mapping for the swapped item (if any)
        if (index < rarityTreasury.length) {
            NFTItem memory movedItem = rarityTreasury[index];
            nftToTreasuryIndex[movedItem.collection][movedItem.tokenId] = index;
        }

        // Update counters and value tracking
        unchecked {
            --rarityCount[rarity];
        }

        _trackRemoval(item.depositor, item.collection, item.tokenId, rarity, item.appraisedPrice);

        // Clean up mappings
        depositedNFTs[item.collection][item.tokenId] = false;
        delete nftToTreasuryIndex[item.collection][item.tokenId];
        delete nftCurrentRarity[item.collection][item.tokenId];

        // Record receive time before transfer
        uint256 receiveTime = block.timestamp;
        nftReceiveTimes[item.collection][item.tokenId] = receiveTime;

        // Snapshot redemption deadline at win time
        if (protocolTreasury != address(0)) {
            uint256 window = IRedemptionWindow(protocolTreasury).redemptionWindow();
            nftRedemptionDeadlines[item.collection][item.tokenId] = receiveTime + window;
        }

        // Transfer NFT to winner
        IERC721(item.collection).safeTransferFrom(address(this), winner, item.tokenId);

        emit NFTWithdrawn(item.collection, item.tokenId, rarity, winner);
    }

    /// @notice Re-stocks a redeemed NFT back into the treasury after protocol buyback
    /// @dev Only callable by the protocol treasury. The NFT must not already be deposited.
    ///      Assigns rarity based on the provided appraisal price and registers it as a
    ///      protocol-owned deposit. Clears any previous receive time and redemption deadline.
    /// @param collection NFT collection address
    /// @param tokenId Token ID being returned
    /// @param seller Address of the user who redeemed (for event tracking)
    /// @param appraisalUSD Appraised price in USD (scaled by 1e18, must be > 0)
    function handleRedemptionReturn(address collection, uint256 tokenId, address seller, uint256 appraisalUSD)
        external
        onlyProtocolTreasury
        whenNotPaused
        nonReentrant
    {
        if (collection == address(0)) revert InvalidCollectionAddress();
        if (depositedNFTs[collection][tokenId]) revert NFTAlreadyDeposited();
        if (appraisalUSD == 0) revert NFTNotAppraised();
        address protocol = protocolTreasury;
        if (protocol == address(0)) revert InvalidProtocolTreasury();

        uint8 rarity = getRarityByPrice(appraisalUSD);

        NFTItem memory item = NFTItem({
            collection: collection,
            depositor: protocol,
            tokenId: tokenId,
            appraisedPrice: appraisalUSD,
            rarity: rarity,
            depositTime: block.timestamp,
            receiveTime: 0 // Not won yet
        });

        depositedNFTs[collection][tokenId] = true;
        nftCurrentRarity[collection][tokenId] = rarity;
        treasury[rarity].push(item);
        nftToTreasuryIndex[collection][tokenId] = treasury[rarity].length - 1;

        // Clear receive time and redemption deadline when NFT returns to treasury
        delete nftReceiveTimes[collection][tokenId];
        delete nftRedemptionDeadlines[collection][tokenId];

        unchecked {
            ++rarityCount[rarity];
        }

        _trackDeposit(protocol, collection, tokenId, rarity, appraisalUSD);

        emit RedemptionRestocked(collection, tokenId, seller, rarity, appraisalUSD);
    }

    /// @dev Updates all deposit-related counters, value-weighted tracking, lifetime stats,
    ///      and registers the card deposit in the CardGroupedVault for yield eligibility.
    /// @param depositor Address of the user depositing the NFT
    /// @param collection NFT collection address
    /// @param tokenId Token ID being deposited
    /// @param rarity Assigned rarity tier
    /// @param priceUSD Appraised price in USD (scaled by 1e18)
    function _trackDeposit(address depositor, address collection, uint256 tokenId, uint8 rarity, uint256 priceUSD)
        internal
    {
        userDepositCounts[depositor][rarity]++;
        userTotalDeposits[depositor]++;
        userDepositValues[depositor][rarity] += priceUSD;
        totalRarityValue[rarity] += priceUSD;
        userLifetimeDeposited[depositor] += priceUSD;
        globalLifetimeDeposited += priceUSD;

        bytes32 cardId = appraisalContract.getTokenCardId(collection, tokenId);
        if (cardId != bytes32(0)) {
            if (cardTotalDeposits[cardId] >= maxDepositsPerCard) revert MaxCardDepositsReached();
            userCardDeposits[depositor][cardId]++;
            cardTotalDeposits[cardId]++;
            cardCurrentRarity[cardId] = rarity;
            _addUserGroupId(depositor, cardId);
            _addCardTokenRef(cardId, collection, tokenId);
            if (address(cardGroupedVault) != address(0)) {
                cardGroupedVault.registerCardDeposit(cardId, depositor, priceUSD, rarity, 1);
            }
        }
    }

    /// @dev Decrements all deposit-related counters, value-weighted tracking, and
    ///      deregisters the card deposit from the CardGroupedVault (triggers auto-claim if last token).
    /// @param depositor Address of the user whose NFT is being removed
    /// @param collection NFT collection address
    /// @param tokenId Token ID being removed
    /// @param rarity Current rarity tier of the NFT
    /// @param priceUSD Appraised price in USD (scaled by 1e18)
    function _trackRemoval(address depositor, address collection, uint256 tokenId, uint8 rarity, uint256 priceUSD)
        internal
    {
        if (depositor != address(0)) {
            if (userDepositCounts[depositor][rarity] > 0) {
                unchecked { --userDepositCounts[depositor][rarity]; }
            }
            if (userTotalDeposits[depositor] > 0) {
                unchecked { --userTotalDeposits[depositor]; }
            }
            userDepositValues[depositor][rarity] -= priceUSD;

            bytes32 cardId = appraisalContract.getTokenCardId(collection, tokenId);
            if (cardId != bytes32(0)) {
                uint256 cardCount = userCardDeposits[depositor][cardId];
                if (cardCount > 0) {
                    uint256 newCount = cardCount - 1;
                    userCardDeposits[depositor][cardId] = newCount;
                    cardTotalDeposits[cardId]--;
                    if (newCount == 0) {
                        _removeUserGroupId(depositor, cardId);
                    }
                }
                _removeCardTokenRef(cardId, collection, tokenId);
                if (address(cardGroupedVault) != address(0)) {
                    cardGroupedVault.removeCardDeposit(cardId, depositor, 1);
                }
            }
        }
        totalRarityValue[rarity] -= priceUSD;
    }

    /// @notice Emergency pause function
    function emergencyPause() external onlyOwner {
        _pause();
    }

    /// @notice Emergency unpause function
    function emergencyUnpause() external onlyOwner {
        _unpause();
    }

    // ============ WHITELIST MANAGEMENT ============

    /// @notice Adds a collection to the whitelist
    /// @param collection Collection address to whitelist
    function addToWhitelist(address collection) external onlyOwner {
        if (collection == address(0)) revert InvalidCollectionAddress();
        if (!_isValidNFTContract(collection)) revert InvalidNFTContract();
        if (whitelistedCollections[collection]) revert CollectionAlreadyWhitelisted();

        whitelistedCollections[collection] = true;
        whitelistedCollectionsList.push(collection);
        whitelistedCollectionIndex[collection] = whitelistedCollectionsList.length; // 1-based

        emit CollectionWhitelisted(collection);
    }

    /// @notice Removes a collection from the whitelist
    /// @param collection Collection address to remove from whitelist
    function removeFromWhitelist(address collection) external onlyOwner {
        if (!whitelistedCollections[collection]) revert CollectionNotInWhitelist();

        whitelistedCollections[collection] = false;

        // O(1) swap-and-pop removal using index mapping
        uint256 idxPlus = whitelistedCollectionIndex[collection];
        if (idxPlus > 0) {
            uint256 idx = idxPlus - 1;
            uint256 lastIndex = whitelistedCollectionsList.length - 1;
            if (idx != lastIndex) {
                address last = whitelistedCollectionsList[lastIndex];
                whitelistedCollectionsList[idx] = last;
                whitelistedCollectionIndex[last] = idx + 1;
            }
            whitelistedCollectionsList.pop();
            delete whitelistedCollectionIndex[collection];
        }

        emit CollectionRemovedFromWhitelist(collection);
    }

    /// @notice Checks if a collection is whitelisted
    /// @param collection Collection address to check
    /// @return isWhitelisted True if collection is whitelisted
    function isCollectionWhitelisted(address collection) external view returns (bool isWhitelisted) {
        return whitelistedCollections[collection];
    }

    /// @notice Gets all whitelisted collections
    /// @return collections Array of whitelisted collection addresses
    function getWhitelistedCollections() external view returns (address[] memory collections) {
        return whitelistedCollectionsList;
    }

    /// @notice Gets the number of whitelisted collections
    /// @return count Number of whitelisted collections
    function getWhitelistLength() external view returns (uint256 count) {
        return whitelistedCollectionsList.length;
    }

    /// @notice Checks if the gacha system is available (whitelist not empty and has NFTs)
    /// @return available True if gacha can operate
    function isGachaAvailable() external view returns (bool available) {
        if (whitelistedCollectionsList.length == 0) return false;
        uint256 totalItems;
        for (uint8 i = 0; i < numRarities; i++) {
            totalItems += rarityCount[i];
        }
        return totalItems > 0;
    }

    /// @notice Record that a user has claimed yield rewards (called by CardGroupedVault)
    /// @param user Address of the user who claimed rewards
    /// @param amount Amount of USDC claimed (in USDC decimals, typically 6)
    function recordYieldClaim(address user, uint256 amount) external whenNotPaused {
        if (msg.sender != address(cardGroupedVault)) revert InvalidCardGroupedVault();
        if (user == address(0)) revert InvalidRecipient();
        if (amount == 0) return;

        // Convert yield token amount to USD value (18 decimals) for consistency
        // yieldClaimDecimalScalar == 0 means use default 1e12 (USDC 6-decimal)
        uint256 scalar = yieldClaimDecimalScalar;
        if (scalar == 0) scalar = 1e12;
        uint256 claimedValueUSD = amount * scalar;

        // Update user lifetime claimed analytics
        userLifetimeClaimed[user] += claimedValueUSD;

        // Update global lifetime claimed analytics
        globalLifetimeClaimed += claimedValueUSD;

        emit YieldClaimRecorded(user, amount);
    }

    /// @notice Required for receiving ERC721 tokens
    function onERC721Received(
        address, // operator
        address, // from
        uint256, // tokenId
        bytes calldata // data
    ) external pure override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }


    /// @notice Gets total deposit count for a specific card ID
    /// @param cardId Card ID to check
    /// @return totalCount Total number of deposits for the card
    function getCardTotalDeposits(bytes32 cardId) external view returns (uint256 totalCount) {
        if (cardId == bytes32(0)) return 0;
        return cardTotalDeposits[cardId];
    }

    /// @notice Gets paginated user card deposits with deposit counts (optimized for frontend)
    /// @param user The user address
    /// @param offset Starting index (0-based)
    /// @param limit Maximum number of items to return (1-50)
    /// @return deposits Array of UserCardDeposit structs for this page
    /// @return total Total number of cards the user has deposited
    /// @return hasMore Whether there are more items after this page
    function getUserCardDepositsPage(address user, uint256 offset, uint256 limit)
        external
        view
        returns (UserCardDeposit[] memory deposits, uint256 total, bool hasMore)
    {
        if (limit == 0 || limit > 50) revert InvalidLimit();
        if (user == address(0)) {
            return (new UserCardDeposit[](0), 0, false);
        }

        bytes32[] storage userCards = userGroupIds[user];
        total = userCards.length;

        if (offset >= total) {
            return (new UserCardDeposit[](0), total, false);
        }

        uint256 end = offset + limit;
        if (end > total) {
            end = total;
        }

        uint256 resultLength = end - offset;
        deposits = new UserCardDeposit[](resultLength);

        for (uint256 i = 0; i < resultLength; i++) {
            bytes32 cardId = userCards[offset + i];
            deposits[i] = UserCardDeposit({
                cardId: cardId,
                depositCount: userCardDeposits[user][cardId],
                totalCardDeposits: cardTotalDeposits[cardId]
            });
        }

        hasMore = end < total;
    }

    // ============ PAGINATED QUERY FUNCTIONS ============

    /// @notice Gets paginated list of NFTs deposited by a user
    /// @param user User address
    /// @param offset Starting index (0-based)
    /// @param limit Maximum number of items to return
    /// @return items Array of NFT items for this page
    /// @return total Total number of items the user has deposited
    /// @return hasMore Whether there are more items after this page
    function getUserDepositedNFTsPaginated(address user, uint256 offset, uint256 limit)
        external
        view
        returns (NFTItem[] memory items, uint256 total, bool hasMore)
    {
        if (user == address(0) || limit == 0) return (new NFTItem[](0), 0, false);

        // Count total items for user
        for (uint8 i = 0; i < numRarities; i++) {
            total += userDepositCounts[user][i];
        }

        if (total == 0 || offset >= total) return (new NFTItem[](0), total, false);

        uint256 remaining = total - offset;
        uint256 resultLength = remaining < limit ? remaining : limit;
        items = new NFTItem[](resultLength);
        uint256 currentIndex = 0;
        uint256 skipped = 0;

        for (uint8 rarity = 0; rarity < numRarities && currentIndex < resultLength; rarity++) {
            NFTItem[] memory rarityItems = treasury[rarity];
            for (uint256 i = 0; i < rarityItems.length && currentIndex < resultLength; i++) {
                if (rarityItems[i].depositor == user) {
                    if (skipped < offset) {
                        skipped++;
                    } else {
                        items[currentIndex] = rarityItems[i];
                        currentIndex++;
                    }
                }
            }
        }

        hasMore = offset + resultLength < total;
    }

    /// @notice Gets paginated list of NFTs deposited by a user for a specific card ID
    /// @param user User address
    /// @param cardId Card ID to filter by
    /// @param offset Starting index (0-based)
    /// @param limit Maximum number of items to return
    /// @return items Array of NFT items for this page
    /// @return total Total matching items
    /// @return hasMore Whether there are more items after this page
    function getUserDepositedNFTsByCardIdPaginated(address user, bytes32 cardId, uint256 offset, uint256 limit)
        external
        view
        returns (NFTItem[] memory items, uint256 total, bool hasMore)
    {
        if (user == address(0) || cardId == bytes32(0) || limit == 0) return (new NFTItem[](0), 0, false);
        if (address(appraisalContract) == address(0)) return (new NFTItem[](0), 0, false);

        // First pass: count matching items
        for (uint8 rarity = 0; rarity < numRarities; rarity++) {
            NFTItem[] memory rarityItems = treasury[rarity];
            for (uint256 i = 0; i < rarityItems.length; i++) {
                if (rarityItems[i].depositor == user) {
                    bytes32 itemCardId = appraisalContract.getTokenCardId(rarityItems[i].collection, rarityItems[i].tokenId);
                    if (itemCardId == cardId) total++;
                }
            }
        }

        if (total == 0 || offset >= total) return (new NFTItem[](0), total, false);

        uint256 remaining = total - offset;
        uint256 resultLength = remaining < limit ? remaining : limit;
        items = new NFTItem[](resultLength);
        uint256 currentIndex = 0;
        uint256 skipped = 0;

        for (uint8 rarity = 0; rarity < numRarities && currentIndex < resultLength; rarity++) {
            NFTItem[] memory rarityItems = treasury[rarity];
            for (uint256 i = 0; i < rarityItems.length && currentIndex < resultLength; i++) {
                if (rarityItems[i].depositor == user) {
                    bytes32 itemCardId = appraisalContract.getTokenCardId(rarityItems[i].collection, rarityItems[i].tokenId);
                    if (itemCardId == cardId) {
                        if (skipped < offset) {
                            skipped++;
                        } else {
                            items[currentIndex] = rarityItems[i];
                            currentIndex++;
                        }
                    }
                }
            }
        }

        hasMore = offset + resultLength < total;
    }

    // ============ LIFETIME STATISTICS FUNCTIONS ============

    /// @notice Gets user's lifetime claimed rewards value
    /// @param user User address
    /// @return claimed Total value claimed by user across all time
    function getUserLifetimeClaimed(address user) external view returns (uint256 claimed) {
        if (user == address(0)) return 0;
        return userLifetimeClaimed[user];
    }

    /// @notice Gets comprehensive user profile data in a single call (BATCH FUNCTION)
    /// @param user User address
    /// @return depositCounts Array of deposit counts
    /// @return totalDeposits Total number of deposits
    /// @return lifetimeClaimed Total rewards claimed
    /// @return lifetimeDeposited Total value deposited
    /// @return lifetimeWithdrawn Total value withdrawn
    /// @return netContribution Net value contributed (deposited - withdrawn)
    function getUserProfileBatch(address user)
        external
        view
        returns (
            uint256[] memory depositCounts,
            uint256 totalDeposits,
            uint256 lifetimeClaimed,
            uint256 lifetimeDeposited,
            uint256 lifetimeWithdrawn,
            uint256 netContribution
        )
    {
        depositCounts = new uint256[](numRarities);
        if (user == address(0)) {
            return (depositCounts, 0, 0, 0, 0, 0);
        }

        // Get deposit counts for all rarities
        for (uint8 i = 0; i < numRarities; i++) {
            depositCounts[i] = userDepositCounts[user][i];
        }

        totalDeposits = userTotalDeposits[user];
        lifetimeClaimed = userLifetimeClaimed[user];
        lifetimeDeposited = userLifetimeDeposited[user];
        lifetimeWithdrawn = userLifetimeWithdrawn[user];
        netContribution = lifetimeDeposited > lifetimeWithdrawn ? lifetimeDeposited - lifetimeWithdrawn : 0;
    }

    /// @notice Gets platform overview data in a single call (BATCH FUNCTION)
    /// @return rarityCounts Array of NFT counts
    /// @return totalItems Total NFTs in treasury
    /// @return gachaAvailable Whether gacha is available
    /// @return totalDeposited Global total value deposited
    /// @return totalClaimed Global total value claimed
    function getPlatformOverviewBatch()
        external
        view
        returns (
            uint256[] memory rarityCounts,
            uint256 totalItems,
            bool gachaAvailable,
            uint256 totalDeposited,
            uint256 totalClaimed
        )
    {
        // Get rarity counts inline
        rarityCounts = new uint256[](numRarities);
        for (uint8 i = 0; i < numRarities; i++) {
            rarityCounts[i] = rarityCount[i];
            totalItems += rarityCounts[i];
        }

        // Check if gacha is available
        gachaAvailable = whitelistedCollectionsList.length > 0 && totalItems > 0;

        // Global stats
        totalDeposited = globalLifetimeDeposited;
        totalClaimed = globalLifetimeClaimed;
    }

    /// @notice Gets user's lifetime deposited NFT value
    /// @param user User address
    /// @return deposited Total value of NFTs deposited by user
    function getUserLifetimeDeposited(address user) external view returns (uint256 deposited) {
        if (user == address(0)) return 0;
        return userLifetimeDeposited[user];
    }

    /// @notice Gets user's lifetime withdrawn NFT value
    /// @param user User address
    /// @return withdrawn Total value of NFTs withdrawn by user
    function getUserLifetimeWithdrawn(address user) external view returns (uint256 withdrawn) {
        if (user == address(0)) return 0;
        return userLifetimeWithdrawn[user];
    }

    /// @notice Gets all NFTs deposited by a specific user
    /// @param user User address
    /// @return items Array of NFT items deposited by the user
    function getUserDepositedNFTs(address user) external view returns (NFTItem[] memory items) {
        if (user == address(0)) return new NFTItem[](0);

        // First, count how many items the user has to optimize array size
        uint256 userItemCount = 0;
        for (uint8 i = 0; i < numRarities; i++) {
            userItemCount += userDepositCounts[user][i];
        }

        if (userItemCount == 0) return new NFTItem[](0);

        // Create array with exact size needed
        items = new NFTItem[](userItemCount);
        uint256 currentIndex = 0;

        // Iterate through all rarity tiers and collect user's items
        for (uint8 rarity = 0; rarity < numRarities; rarity++) {
            NFTItem[] memory rarityItems = treasury[rarity];

            for (uint256 i = 0; i < rarityItems.length; i++) {
                if (rarityItems[i].depositor == user) {
                    items[currentIndex] = rarityItems[i];
                    currentIndex++;
                }
            }
        }
    }

    /// @notice Gets global platform statistics
    /// @return totalDeposited Total value deposited across all users
    /// @return totalClaimed Total rewards claimed across all users
    function getGlobalStats()
        external
        view
        returns (uint256 totalDeposited, uint256 totalClaimed)
    {
        totalDeposited = globalLifetimeDeposited;
        totalClaimed = globalLifetimeClaimed;
    }

    // ============ RARITY METADATA GETTERS ============

    /// @notice Gets the number of rarity tiers
    /// @return The number of rarity tiers configured
    function getNumRarities() external view returns (uint8) {
        return numRarities;
    }

    /// @notice Gets all rarity names
    /// @return names Array of rarity names
    function getRarityNames() external view returns (string[] memory names) {
        names = new string[](numRarities);
        for (uint8 i = 0; i < numRarities; i++) {
            names[i] = rarityNames[i];
        }
    }

    /// @notice Gets the name of a specific rarity tier
    /// @param rarity The rarity tier index
    /// @return name The rarity name
    function getRarityName(uint8 rarity) external view returns (string memory name) {
        if (rarity >= numRarities) revert InvalidPriceRange();
        return rarityNames[rarity];
    }

    /// @notice Custom gap for future storage variables
    uint256[45] private __gap;
}
