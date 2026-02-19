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
import {IDepositorVault} from "../interfaces/IDepositorVault.sol";

/**
 * @title GachaTreasury - Upgradeable Price-Based NFT Treasury Management
 * @notice Manages NFT storage with automatic rarity assignment based on appraised USD values
 * @dev Integrates with NFTAppraisal contract for price-based categorization with immutable price ranges
 * @dev Price ranges are set during initialization: Common $0-$15, Uncommon $25-$60, Rare $70-$250, Epic $300-$1.2k, Legendary $1.5k+
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
    error NoNFTsAvailable(Rarity rarity);
    error NFTNotDeposited();
    error NotNFTDepositor();
    error InvalidDepositorVault();
    error InvalidProtocolTreasury();
    error UnauthorizedProtocolTreasury();
    error InsufficientDepositorValue();

    /// @notice Maximum batch operation limits for gas optimization
    uint256 public constant MAX_BATCH_DEPOSIT = 50;
    uint256 public constant MAX_BATCH_WITHDRAW = 20;
    uint256 public constant MAX_MIGRATION_BATCH = 50;
    /// @notice Rarity price ranges must be continuous in 1-cent steps (1e16)
    uint256 private constant PRICE_STEP = 1e16;

    /// @notice NFT rarity tiers for gacha distribution
    enum Rarity {
        Common, // 0
        Uncommon, // 1
        Rare, // 2
        Epic, // 3
        Legendary // 4

    }

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
        Rarity rarity; // Current rarity tier based on price
        uint256 depositTime; // When NFT was deposited
        uint256 receiveTime; // When user received the NFT from gacha (0 if not won yet)
    }

    /// @notice User's card deposit information for frontend display
    struct UserCardDeposit {
        bytes32 cardId; // Card ID (group identifier)
        uint256 depositCount; // Number of tokens deposited for this card
        uint256 totalCardDeposits; // Total deposits across all users for this card
    }

    /// @notice Core treasury storage
    mapping(Rarity => NFTItem[]) public treasury;
    /// @dev NFTs organized by rarity
    mapping(Rarity => uint256) public rarityCount;
    /// @dev Count of NFTs per rarity

    /// @notice Contract addresses
    address public gachaContract;
    NFTAppraisal public appraisalContract;
    IDepositorVault public depositorVault;
    address public protocolTreasury;

    /// @notice Price ranges for each rarity tier indexed by Rarity enum (set during initialization, not modifiable afterwards)
    PriceRange[5] public priceRanges;

    /// @notice Track if price ranges have been set (to prevent changes after initialization)
    bool public priceRangesSet;

    /// @notice Duplicate protection and indexing
    mapping(address => mapping(uint256 => bool)) public depositedNFTs;
    mapping(address => mapping(uint256 => uint256)) public nftToTreasuryIndex; // collection => tokenId => index in rarity array
    mapping(address => mapping(uint256 => Rarity)) public nftCurrentRarity; // collection => tokenId => current rarity
    mapping(address => mapping(uint256 => uint256)) public nftReceiveTimes; // collection => tokenId => when user received NFT from gacha

    /// @notice User deposit tracking for rewards
    mapping(address => mapping(Rarity => uint256)) public userDepositCounts;
    mapping(address => uint256) public userTotalDeposits;
    mapping(address => uint256) public userActiveDepositValueUSD;

    /// @notice Value-weighted dividend tracking
    mapping(address => mapping(Rarity => uint256)) public userDepositValues; // Total USD value deposited by user per rarity
    mapping(Rarity => uint256) public totalRarityValue; // Total USD value in each rarity pool

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

    /// @notice Per-user list of active groupIds (bytes32 hashes) for pagination and batching
    mapping(address => bytes32[]) private userGroupIds; // user => groupIds
    mapping(address => mapping(bytes32 => uint256)) private userCardIdIndex; // index+1 by cardId

    /// @notice Collection whitelist management
    mapping(address => bool) public whitelistedCollections;
    address[] public whitelistedCollectionsList;

    /// @notice Events for tracking treasury operations
    event NFTDeposited(
        address indexed collection,
        uint256 indexed tokenId,
        address indexed depositor,
        Rarity rarity,
        uint256 appraisedPrice
    );
    event NFTWithdrawn(address indexed collection, uint256 indexed tokenId, Rarity rarity, address indexed to);
    event GachaContractUpdated(address indexed oldGacha, address indexed newGacha);
    event BatchDeposited(uint256 count);
    event BatchWithdrawn(uint256 count, Rarity rarity, address to);

    event RarityMigrated(
        address indexed collection, uint256 indexed tokenId, Rarity oldRarity, Rarity newRarity, uint256 newPrice
    );

    event AppraisalContractUpdated(address indexed oldAppraisal, address indexed newAppraisal);
    event CollectionWhitelisted(address indexed collection);
    event CollectionRemovedFromWhitelist(address indexed collection);
    event DepositorVaultUpdated(address indexed oldVault, address indexed newVault);
    event ProtocolTreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    event RedemptionRestocked(
        address indexed collection,
        uint256 indexed tokenId,
        address indexed seller,
        Rarity rarity,
        uint256 appraisedPrice
    );

    /// @notice Restricts access to the authorized gacha contract
    modifier onlyGacha() {
        if (msg.sender != gachaContract) revert UnauthorizedGachaContract();
        _;
    }

    modifier onlyProtocolTreasury() {
        if (msg.sender != protocolTreasury) revert UnauthorizedProtocolTreasury();
        _;
    }

    /**
     * @notice Initializes the treasury with required contracts and price ranges
     * @param _gachaContract Address of the authorized gacha contract
     * @param _appraisalContract Address of the NFT appraisal contract
     * @param minPrices Array of minimum prices per rarity [Common, Uncommon, Rare, Epic, Legendary] (scaled by 1e18)
     * @param maxPrices Array of maximum prices per rarity [Common, Uncommon, Rare, Epic, Legendary] (scaled by 1e18)
     *                  Legendary max can be set to `type(uint256).max` to indicate no upper bound.
     */
    function initialize(
        address _owner,
        address _gachaContract,
        address _appraisalContract,
        uint256[5] memory minPrices,
        uint256[5] memory maxPrices
    ) public initializer {
        __Ownable_init(_owner);
        __Pausable_init();
        // ReentrancyGuardTransient doesn't need initialization

        if (_gachaContract == address(0)) revert InvalidGachaContract();
        if (_appraisalContract == address(0)) revert InvalidAppraisalContract();

        // Check if price ranges have already been set
        if (priceRangesSet) revert PriceRangesAlreadySet();

        _setInitialPriceRanges(minPrices, maxPrices);

        gachaContract = _gachaContract;
        appraisalContract = NFTAppraisal(_appraisalContract);
    }

    /**
     * @notice Authorizes upgrade to new implementation
     * @dev Only owner can upgrade the contract
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    function _setInitialPriceRanges(uint256[5] memory minPrices, uint256[5] memory maxPrices) private {
        uint256 commonMin = minPrices[uint256(Rarity.Common)];
        uint256 commonMax = maxPrices[uint256(Rarity.Common)];
        // #3 — Common must start at $0 and have a non-zero max
        if (commonMin != 0) revert InvalidPriceRange();
        if (commonMax == 0) revert InvalidPriceRange();
        priceRanges[uint256(Rarity.Common)] = PriceRange(commonMin, commonMax);

        uint256 uncommonMin = minPrices[uint256(Rarity.Uncommon)];
        uint256 uncommonMax = maxPrices[uint256(Rarity.Uncommon)];
        if (uncommonMin >= uncommonMax) revert InvalidPriceRange();
        priceRanges[uint256(Rarity.Uncommon)] = PriceRange(uncommonMin, uncommonMax);

        uint256 rareMin = minPrices[uint256(Rarity.Rare)];
        uint256 rareMax = maxPrices[uint256(Rarity.Rare)];
        if (rareMin >= rareMax) revert InvalidPriceRange();
        priceRanges[uint256(Rarity.Rare)] = PriceRange(rareMin, rareMax);

        uint256 epicMin = minPrices[uint256(Rarity.Epic)];
        uint256 epicMax = maxPrices[uint256(Rarity.Epic)];
        if (epicMin >= epicMax) revert InvalidPriceRange();
        priceRanges[uint256(Rarity.Epic)] = PriceRange(epicMin, epicMax);

        uint256 legendaryMin = minPrices[uint256(Rarity.Legendary)];
        uint256 legendaryMax = maxPrices[uint256(Rarity.Legendary)];
        if (legendaryMax != type(uint256).max) revert InvalidPriceRange();
        if (legendaryMin >= legendaryMax) revert InvalidPriceRange();
        priceRanges[uint256(Rarity.Legendary)] = PriceRange(legendaryMin, legendaryMax);

        // Ensure ranges are continuous and non-overlapping so every price fits exactly one bucket
        if (commonMax + PRICE_STEP != uncommonMin) revert InvalidPriceRange();
        if (uncommonMax + PRICE_STEP != rareMin) revert InvalidPriceRange();
        if (rareMax + PRICE_STEP != epicMin) revert InvalidPriceRange();
        if (epicMax + PRICE_STEP != legendaryMin) revert InvalidPriceRange();

        priceRangesSet = true;
    }

    /// @notice Deposits an NFT into the treasury with automatic rarity assignment
    /// @param collection NFT collection address
    /// @param tokenId Token ID to deposit
    /// @dev Requires NFT to be appraised first, automatically assigns rarity based on price
    function depositNFT(address collection, uint256 tokenId) external whenNotPaused nonReentrant {
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

        // Determine rarity based on price
        Rarity rarity = getRarityByPrice(priceUSD);

        // Transfer NFT to treasury
        IERC721(collection).safeTransferFrom(msg.sender, address(this), tokenId);

        // Mark as deposited
        depositedNFTs[collection][tokenId] = true;
        nftCurrentRarity[collection][tokenId] = rarity;

        // Create NFT item
        NFTItem memory item = NFTItem({
            collection: collection,
            depositor: msg.sender,
            tokenId: tokenId,
            appraisedPrice: priceUSD,
            rarity: rarity,
            depositTime: block.timestamp,
            receiveTime: 0 // Not won yet
        });

        // Add to treasury
        treasury[rarity].push(item);
        nftToTreasuryIndex[collection][tokenId] = treasury[rarity].length - 1;

        unchecked {
            ++rarityCount[rarity];
        }

        // Track user deposit counts for rewards
        userDepositCounts[msg.sender][rarity]++;
        userTotalDeposits[msg.sender]++;

        // Track value-weighted deposits for enhanced rewards
        userDepositValues[msg.sender][rarity] += priceUSD;
        totalRarityValue[rarity] += priceUSD;
        _increaseActiveValue(msg.sender, priceUSD);

        // Track lifetime statistics (industry standard)
        userLifetimeDeposited[msg.sender] += priceUSD;
        globalLifetimeDeposited += priceUSD;

        // Track card-level deposits for enhanced rewards
        bytes32 cardId = appraisalContract.getTokenCardId(collection, tokenId);
        if (cardId != bytes32(0)) {
            userCardDeposits[msg.sender][cardId]++;
            cardTotalDeposits[cardId]++;
            _addUserGroupId(msg.sender, cardId);
        }

        emit NFTDeposited(collection, tokenId, msg.sender, rarity, priceUSD);
    }

    /// @notice Migrates an NFT to a new rarity tier based on updated appraisal
    /// @param collection NFT collection address
    /// @param tokenId Token ID to migrate
    /// @dev Can be called by anyone when appraisal price changes through appraisal system updates
    function migrateNFTRarity(address collection, uint256 tokenId) external whenNotPaused nonReentrant {
        _migrateNFTRarity(collection, tokenId);
    }

    /// @dev Internal function to migrate NFT rarity
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

        Rarity currentRarity = nftCurrentRarity[collection][tokenId];

        // Determine new rarity based on updated price
        Rarity newRarity = getRarityByPrice(newPriceUSD);

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
        if (newPriceUSD > oldPrice) {
            _increaseActiveValue(item.depositor, newPriceUSD - oldPrice);
        } else if (oldPrice > newPriceUSD) {
            _decreaseActiveValue(item.depositor, oldPrice - newPriceUSD);
        }

        emit RarityMigrated(collection, tokenId, currentRarity, newRarity, newPriceUSD);
    }

    /// @notice Allows users to withdraw their own deposited NFTs
    /// @param collection NFT collection address
    /// @param tokenId Token ID to withdraw
    function withdrawMyNFT(address collection, uint256 tokenId) external whenNotPaused nonReentrant {
        if (collection == address(0)) revert InvalidCollectionAddress();
        if (!depositedNFTs[collection][tokenId]) revert NFTNotDeposited();

        // Get the NFT's current rarity and treasury index
        Rarity rarity = nftCurrentRarity[collection][tokenId];
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

        // Update counts
        unchecked {
            --rarityCount[rarity];
        }

        // Update user deposit tracking (affects their rewards)
        uint256 currentCount = userDepositCounts[depositor][rarity];
        if (currentCount > 0) {
            userDepositCounts[depositor][rarity] = currentCount - 1;
            --userTotalDeposits[depositor];
        }

        // Update value tracking - subtract the NFT's value from user and total
        userDepositValues[depositor][rarity] -= appraisedPrice;
        totalRarityValue[rarity] -= appraisedPrice;
        _decreaseActiveValue(depositor, appraisedPrice);

        // Track lifetime withdrawal statistics
        userLifetimeWithdrawn[depositor] += appraisedPrice;

        // Clean up mappings
        depositedNFTs[collection][tokenId] = false;
        delete nftToTreasuryIndex[collection][tokenId];
        delete nftCurrentRarity[collection][tokenId];

        // Update card tracking for withdrawal
        bytes32 cardId = appraisalContract.getTokenCardId(collection, tokenId);
        if (cardId != bytes32(0)) {
            uint256 cardCount = userCardDeposits[depositor][cardId];
            if (cardCount > 0) {
                uint256 newCount = cardCount - 1;
                userCardDeposits[depositor][cardId] = newCount;
                cardTotalDeposits[cardId]--;
                // If user no longer holds this cardId, remove from list
                if (newCount == 0) {
                    _removeUserGroupId(depositor, cardId);
                }
            }
        }

        // Transfer NFT back to the user
        IERC721(collection).safeTransferFrom(address(this), msg.sender, tokenId);

        emit NFTWithdrawn(collection, tokenId, rarity, msg.sender);
    }

    function getTreasuryItems(Rarity rarity) external view returns (NFTItem[] memory) {
        return treasury[rarity];
    }

    /// @notice Gets a specific NFT item from treasury
    /// @param rarity Rarity tier
    /// @param index Index in the rarity array
    /// @return NFT item at the specified position
    function getTreasuryItem(Rarity rarity, uint256 index) external view returns (NFTItem memory) {
        if (index >= treasury[rarity].length) revert InvalidIndex();
        return treasury[rarity][index];
    }

    function getRarityCount(Rarity rarity) external view returns (uint256) {
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
        require(limit > 0 && limit <= 100, "Invalid limit: must be 1-100");

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

    /// @notice Gets all rarity counts in a single call to reduce RPC usage
    /// @return counts Array of rarity counts [Common, Uncommon, Rare, Epic, Legendary]
    function getAllRarityCounts() external view returns (uint256[5] memory counts) {
        counts[0] = rarityCount[Rarity.Common];
        counts[1] = rarityCount[Rarity.Uncommon];
        counts[2] = rarityCount[Rarity.Rare];
        counts[3] = rarityCount[Rarity.Epic];
        counts[4] = rarityCount[Rarity.Legendary];
    }

    function getTotalItemsCount() external view returns (uint256) {
        return rarityCount[Rarity.Common] + rarityCount[Rarity.Uncommon] + rarityCount[Rarity.Rare]
            + rarityCount[Rarity.Epic] + rarityCount[Rarity.Legendary];
    }

    function setGachaContract(address _gachaContract) external onlyOwner {
        if (_gachaContract == address(0)) revert InvalidGachaContract();
        address oldGacha = gachaContract;
        gachaContract = _gachaContract;
        emit GachaContractUpdated(oldGacha, _gachaContract);
    }

    function setAppraisalContract(address _appraisalContract) external onlyOwner {
        if (_appraisalContract == address(0)) revert InvalidAppraisalContract();
        address oldAppraisal = address(appraisalContract);
        appraisalContract = NFTAppraisal(_appraisalContract);
        emit AppraisalContractUpdated(oldAppraisal, _appraisalContract);
    }

    function setDepositorVault(address _depositorVault) external onlyOwner {
        if (_depositorVault == address(0)) revert InvalidDepositorVault();
        address previous = address(depositorVault);
        depositorVault = IDepositorVault(_depositorVault);
        emit DepositorVaultUpdated(previous, _depositorVault);
    }

    function setProtocolTreasury(address _protocolTreasury) external onlyOwner {
        if (_protocolTreasury == address(0)) revert InvalidProtocolTreasury();

        // Prevent treasury rotation unless all NFTs are withdrawn to avoid yield loss
        // Existing inventory would keep old treasury as depositor, locking vault shares and yield
        require(userTotalDeposits[protocolTreasury] == 0, "TreasuryRotation: Must drain inventory before rotation");

        address previous = protocolTreasury;
        protocolTreasury = _protocolTreasury;
        emit ProtocolTreasuryUpdated(previous, _protocolTreasury);
    }

    function syncDepositorValue(address depositor) external onlyOwner {
        if (depositor == address(0)) revert InvalidRecipient();
        uint256 total;
        for (uint256 i; i < 5; i++) {
            total += userDepositValues[depositor][Rarity(i)];
        }
        uint256 previous = userActiveDepositValueUSD[depositor];
        userActiveDepositValueUSD[depositor] = total;
        _syncDepositorVault(depositor, previous, total);
    }

    /**
     * @notice Determines the rarity tier based on USD price
     * @param priceUSD Price in USD (scaled by 1e18)
     * @return rarity The appropriate rarity tier for the price
     */
    function getRarityByPrice(uint256 priceUSD) public view returns (Rarity rarity) {
        // Open-ended top tier guarantees a slot for any sufficiently high price
        PriceRange memory r;
        r = priceRanges[uint256(Rarity.Legendary)];
        if (priceUSD >= r.minPriceUSD && priceUSD <= r.maxPriceUSD) return Rarity.Legendary;
        r = priceRanges[uint256(Rarity.Epic)];
        if (priceUSD >= r.minPriceUSD && priceUSD <= r.maxPriceUSD) return Rarity.Epic;
        r = priceRanges[uint256(Rarity.Rare)];
        if (priceUSD >= r.minPriceUSD && priceUSD <= r.maxPriceUSD) return Rarity.Rare;
        r = priceRanges[uint256(Rarity.Uncommon)];
        if (priceUSD >= r.minPriceUSD && priceUSD <= r.maxPriceUSD) return Rarity.Uncommon;
        r = priceRanges[uint256(Rarity.Common)];
        if (priceUSD >= r.minPriceUSD && priceUSD <= r.maxPriceUSD) return Rarity.Common;

        revert PriceOutOfBounds(priceUSD);
    }

    /**
     * @notice Gets all price ranges in a single call
     * @return ranges Array of price ranges [Common, Uncommon, Rare, Epic, Legendary]
     */
    function getAllPriceRanges() external view returns (PriceRange[5] memory ranges) {
        for (uint256 i = 0; i < 5; i++) {
            ranges[i] = priceRanges[i];
        }
    }

    /**
     * @notice Gets the price range for a specific rarity
     * @param rarity The rarity tier to query
     * @return minPrice Minimum price in USD
     * @return maxPrice Maximum price in USD
     */
    function getPriceRange(Rarity rarity) external view returns (uint256 minPrice, uint256 maxPrice) {
        uint256 idx = uint256(rarity);
        if (idx > 4) revert InvalidPriceRange();
        PriceRange memory r = priceRanges[idx];
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
            address collection = collections[i];
            uint256 tokenId = tokenIds[i];

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
                        status != NFTAppraisal.AppraisalStatus.Completed
                            && status != NFTAppraisal.AppraisalStatus.OwnerOverride
                    )
            ) {
                revert NFTNotAppraised();
            }

            // Determine rarity based on price
            Rarity rarity = getRarityByPrice(priceUSD);

            IERC721(collection).safeTransferFrom(msg.sender, address(this), tokenId);
            depositedNFTs[collection][tokenId] = true;
            nftCurrentRarity[collection][tokenId] = rarity;

            NFTItem memory item = NFTItem({
                collection: collection,
                depositor: msg.sender,
                tokenId: tokenId,
                appraisedPrice: priceUSD,
                rarity: rarity,
                depositTime: block.timestamp,
                receiveTime: 0 // Not won yet
            });

            treasury[rarity].push(item);
            nftToTreasuryIndex[collection][tokenId] = treasury[rarity].length - 1;

            unchecked {
                ++rarityCount[rarity];
                ++i;
            }

            // Track user deposit counts for rewards
            userDepositCounts[msg.sender][rarity]++;
            userTotalDeposits[msg.sender]++;

            // Track value-weighted deposits for enhanced rewards
            userDepositValues[msg.sender][rarity] += priceUSD;
            totalRarityValue[rarity] += priceUSD;
            _increaseActiveValue(msg.sender, priceUSD);

            // Track card-level deposits for enhanced rewards
            bytes32 cardId = appraisalContract.getTokenCardId(collection, tokenId);
            if (cardId != bytes32(0)) {
                userCardDeposits[msg.sender][cardId]++;
                cardTotalDeposits[cardId]++;
                _addUserGroupId(msg.sender, cardId);
            }

            emit NFTDeposited(collection, tokenId, msg.sender, rarity, priceUSD);
        }

        emit BatchDeposited(length);
    }

    // Helper functions
    function _isValidNFTContract(address collection) private view returns (bool) {
        try IERC165(collection).supportsInterface(0x80ac58cd) returns (bool supported) {
            return supported;
        } catch {
            return false;
        }
    }

    function isNFTDeposited(address collection, uint256 tokenId) external view returns (bool) {
        return depositedNFTs[collection][tokenId];
    }

    function getNFTCurrentRarity(address collection, uint256 tokenId) external view returns (Rarity) {
        return nftCurrentRarity[collection][tokenId];
    }

    /// @notice Gets user's deposit count for a specific rarity
    /// @param user User address
    /// @param rarity Rarity to check
    /// @return count Number of deposits by user for the rarity
    function getUserDepositCount(address user, Rarity rarity) external view returns (uint256 count) {
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

    /// @notice Gets all deposit counts for a user across all rarities
    /// @param user User address
    /// @return counts Array of deposit counts [Common, Uncommon, Rare, Epic, Legendary]
    function getUserAllDepositCounts(address user) external view returns (uint256[5] memory counts) {
        if (user == address(0)) return counts; // Returns all zeros
        for (uint256 i = 0; i < 5; i++) {
            counts[i] = userDepositCounts[user][Rarity(i)];
        }
    }

    // ============ VALUE-WEIGHTED DIVIDEND FUNCTIONS ============

    /// @notice Gets user's total deposited value for a specific rarity
    /// @param user User address
    /// @param rarity Rarity to check
    /// @return value Total USD value (in 18 decimals) deposited by user for the rarity
    function getUserDepositValue(address user, Rarity rarity) external view returns (uint256 value) {
        if (user == address(0)) return 0;
        return userDepositValues[user][rarity];
    }

    /// @notice Gets total value in a specific rarity pool
    /// @param rarity Rarity to check
    /// @return totalValue Total USD value (in 18 decimals) in the rarity pool
    function getRarityTotalValue(Rarity rarity) external view returns (uint256 totalValue) {
        return totalRarityValue[rarity];
    }

    /// @notice Gets all deposit values for a user across all rarities
    /// @param user User address
    /// @return values Array of deposit values [Common, Uncommon, Rare, Epic, Legendary] in USD (18 decimals)
    function getUserAllDepositValues(address user) external view returns (uint256[5] memory values) {
        if (user == address(0)) return values; // Returns all zeros
        for (uint256 i = 0; i < 5; i++) {
            values[i] = userDepositValues[user][Rarity(i)];
        }
    }

    /// @notice Gets total values across all rarity pools
    /// @return values Array of total values [Common, Uncommon, Rare, Epic, Legendary] in USD (18 decimals)
    function getAllRarityTotalValues() external view returns (uint256[5] memory values) {
        for (uint256 i = 0; i < 5; i++) {
            values[i] = totalRarityValue[Rarity(i)];
        }
    }

    /// @notice Sends a pseudo-random NFT to winner (optimized for gas)
    /// @param rarity Rarity tier to select from
    /// @param randomSeed Random seed for selection (from VRF or similar)
    /// @param winner Winner's address
    /// @return item The NFT item that was sent
    function sendRandomNFTToWinner(Rarity rarity, uint256 randomSeed, address winner)
        external
        onlyGacha
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
    function _removeNFTAtIndex(Rarity rarity, uint256 index, address winner) private returns (NFTItem memory item) {
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

        if (item.depositor != address(0)) {
            if (userDepositCounts[item.depositor][rarity] > 0) {
                unchecked { --userDepositCounts[item.depositor][rarity]; }
            }
            if (userTotalDeposits[item.depositor] > 0) {
                unchecked { --userTotalDeposits[item.depositor]; }
            }

            userDepositValues[item.depositor][rarity] -= item.appraisedPrice;
            _decreaseActiveValue(item.depositor, item.appraisedPrice);
        }

        totalRarityValue[rarity] -= item.appraisedPrice;

        // Clean up mappings
        depositedNFTs[item.collection][item.tokenId] = false;
        delete nftToTreasuryIndex[item.collection][item.tokenId];
        delete nftCurrentRarity[item.collection][item.tokenId];

        // Record receive time before transfer
        uint256 receiveTime = block.timestamp;
        nftReceiveTimes[item.collection][item.tokenId] = receiveTime;

        // Transfer NFT to winner
        IERC721(item.collection).safeTransferFrom(address(this), winner, item.tokenId);

        emit NFTWithdrawn(item.collection, item.tokenId, rarity, winner);
    }

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

        Rarity rarity = getRarityByPrice(appraisalUSD);

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

        // Clear receive time when NFT returns to treasury
        delete nftReceiveTimes[collection][tokenId];

        unchecked {
            ++rarityCount[rarity];
        }

        totalRarityValue[rarity] += appraisalUSD;
        userDepositCounts[protocol][rarity]++;
        userTotalDeposits[protocol]++;
        userDepositValues[protocol][rarity] += appraisalUSD;
        _increaseActiveValue(protocol, appraisalUSD);

        // Track lifetime statistics for protocol restocking
        userLifetimeDeposited[protocol] += appraisalUSD;
        globalLifetimeDeposited += appraisalUSD;

        emit RedemptionRestocked(collection, tokenId, seller, rarity, appraisalUSD);
    }

    function _increaseActiveValue(address depositor, uint256 amount) internal {
        if (amount == 0 || depositor == address(0)) return;
        uint256 previous = userActiveDepositValueUSD[depositor];
        uint256 newTotal = previous + amount;
        userActiveDepositValueUSD[depositor] = newTotal;
        _syncDepositorVault(depositor, previous, newTotal);
    }

    function _decreaseActiveValue(address depositor, uint256 amount) internal {
        if (amount == 0 || depositor == address(0)) return;
        uint256 previous = userActiveDepositValueUSD[depositor];
        if (previous < amount) revert InsufficientDepositorValue();
        uint256 newTotal = previous - amount;
        userActiveDepositValueUSD[depositor] = newTotal;
        _syncDepositorVault(depositor, previous, newTotal);
    }

    function _syncDepositorVault(address depositor, uint256 previous, uint256 newTotal) internal {
        IDepositorVault vault = depositorVault;
        if (address(vault) == address(0)) {
            return;
        }

        if (previous == 0 && newTotal > 0) {
            vault.registerDepositor(depositor, newTotal);
        } else if (newTotal == 0 && previous > 0) {
            vault.deregisterDepositor(depositor);
        } else if (newTotal > 0) {
            vault.updateDepositor(depositor, newTotal);
        }
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

        emit CollectionWhitelisted(collection);
    }

    /// @notice Removes a collection from the whitelist
    /// @param collection Collection address to remove from whitelist
    function removeFromWhitelist(address collection) external onlyOwner {
        if (!whitelistedCollections[collection]) revert CollectionNotInWhitelist();

        whitelistedCollections[collection] = false;

        // Remove from the array
        for (uint256 i = 0; i < whitelistedCollectionsList.length; i++) {
            if (whitelistedCollectionsList[i] == collection) {
                whitelistedCollectionsList[i] = whitelistedCollectionsList[whitelistedCollectionsList.length - 1];
                whitelistedCollectionsList.pop();
                break;
            }
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
        uint256 totalItems = rarityCount[Rarity.Common] + rarityCount[Rarity.Uncommon] + rarityCount[Rarity.Rare]
            + rarityCount[Rarity.Epic] + rarityCount[Rarity.Legendary];
        return totalItems > 0;
    }

    /// @notice Record that a user has claimed yield rewards (called by DepositorVault)
    /// @param user Address of the user who claimed rewards
    /// @param amount Amount of USDC claimed (in USDC decimals, typically 6)
    function recordYieldClaim(address user, uint256 amount) external whenNotPaused {
        if (msg.sender != address(depositorVault)) revert InvalidDepositorVault();
        if (user == address(0)) revert InvalidRecipient();
        if (amount == 0) return;

        // Convert USDC amount (6 decimals) to USD value (18 decimals) for consistency
        uint256 claimedValueUSD = amount * 1e12;

        // Update user lifetime claimed analytics
        userLifetimeClaimed[user] += claimedValueUSD;

        // Update global lifetime claimed analytics
        globalLifetimeClaimed += claimedValueUSD;
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
        require(limit > 0 && limit <= 50, "Invalid limit: must be 1-50");
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

    /// @notice Gets all user card deposits with deposit counts (for smaller datasets)
    /// @param user The user address
    /// @return deposits Array of all UserCardDeposit structs for the user
    function getAllUserCardDeposits(address user) external view returns (UserCardDeposit[] memory deposits) {
        if (user == address(0)) {
            return new UserCardDeposit[](0);
        }

        bytes32[] storage userCards = userGroupIds[user];
        uint256 length = userCards.length;
        deposits = new UserCardDeposit[](length);

        for (uint256 i = 0; i < length; i++) {
            bytes32 cardId = userCards[i];
            deposits[i] = UserCardDeposit({
                cardId: cardId,
                depositCount: userCardDeposits[user][cardId],
                totalCardDeposits: cardTotalDeposits[cardId]
            });
        }
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
        for (uint256 i = 0; i < 5; i++) {
            total += userDepositCounts[user][Rarity(i)];
        }

        if (total == 0 || offset >= total) return (new NFTItem[](0), total, false);

        uint256 remaining = total - offset;
        uint256 resultLength = remaining < limit ? remaining : limit;
        items = new NFTItem[](resultLength);
        uint256 currentIndex = 0;
        uint256 skipped = 0;

        for (uint256 rarity = 0; rarity < 5 && currentIndex < resultLength; rarity++) {
            NFTItem[] memory rarityItems = treasury[Rarity(rarity)];
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
        for (uint256 rarity = 0; rarity < 5; rarity++) {
            NFTItem[] memory rarityItems = treasury[Rarity(rarity)];
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

        for (uint256 rarity = 0; rarity < 5 && currentIndex < resultLength; rarity++) {
            NFTItem[] memory rarityItems = treasury[Rarity(rarity)];
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
    /// @return depositCounts Array of deposit counts [Common, Uncommon, Rare, Epic, Legendary]
    /// @return totalDeposits Total number of deposits
    /// @return lifetimeClaimed Total rewards claimed
    /// @return lifetimeDeposited Total value deposited
    /// @return lifetimeWithdrawn Total value withdrawn
    /// @return netContribution Net value contributed (deposited - withdrawn)
    function getUserProfileBatch(address user)
        external
        view
        returns (
            uint256[5] memory depositCounts,
            uint256 totalDeposits,
            uint256 lifetimeClaimed,
            uint256 lifetimeDeposited,
            uint256 lifetimeWithdrawn,
            uint256 netContribution
        )
    {
        if (user == address(0)) {
            return (depositCounts, 0, 0, 0, 0, 0);
        }

        // Get deposit counts for all rarities
        for (uint256 i = 0; i < 5; i++) {
            depositCounts[i] = userDepositCounts[user][Rarity(i)];
        }

        totalDeposits = userTotalDeposits[user];
        lifetimeClaimed = userLifetimeClaimed[user];
        lifetimeDeposited = userLifetimeDeposited[user];
        lifetimeWithdrawn = userLifetimeWithdrawn[user];
        netContribution = lifetimeDeposited > lifetimeWithdrawn ? lifetimeDeposited - lifetimeWithdrawn : 0;
    }

    /// @notice Gets platform overview data in a single call (BATCH FUNCTION)
    /// @return rarityCounts Array of NFT counts [Common, Uncommon, Rare, Epic, Legendary]
    /// @return totalItems Total NFTs in treasury
    /// @return gachaAvailable Whether gacha is available
    /// @return totalDeposited Global total value deposited
    /// @return totalClaimed Global total value claimed
    function getPlatformOverviewBatch()
        external
        view
        returns (
            uint256[5] memory rarityCounts,
            uint256 totalItems,
            bool gachaAvailable,
            uint256 totalDeposited,
            uint256 totalClaimed
        )
    {
        // Get rarity counts inline
        for (uint256 i = 0; i < 5; i++) {
            rarityCounts[i] = rarityCount[Rarity(i)];
        }

        // Calculate total items inline
        totalItems = rarityCount[Rarity.Common] + rarityCount[Rarity.Uncommon] + rarityCount[Rarity.Rare]
            + rarityCount[Rarity.Epic] + rarityCount[Rarity.Legendary];

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
        for (uint256 i = 0; i < 5; i++) {
            userItemCount += userDepositCounts[user][Rarity(i)];
        }

        if (userItemCount == 0) return new NFTItem[](0);

        // Create array with exact size needed
        items = new NFTItem[](userItemCount);
        uint256 currentIndex = 0;

        // Iterate through all rarity tiers and collect user's items
        for (uint256 rarity = 0; rarity < 5; rarity++) {
            NFTItem[] memory rarityItems = treasury[Rarity(rarity)];

            for (uint256 i = 0; i < rarityItems.length; i++) {
                if (rarityItems[i].depositor == user) {
                    items[currentIndex] = rarityItems[i];
                    currentIndex++;
                }
            }
        }
    }

    /// @notice Gets all NFTs deposited by a user for a specific card ID
    /// @param user User address
    /// @param cardId Card ID to filter by
    /// @return items Array of NFT items for the specified card ID
    function getUserDepositedNFTsByCardId(address user, bytes32 cardId) external view returns (NFTItem[] memory items) {
        if (user == address(0) || cardId == bytes32(0)) return new NFTItem[](0);

        // Get the appraisal contract to check card IDs
        if (address(appraisalContract) == address(0)) return new NFTItem[](0);

        // First, count how many matching items the user has
        uint256 matchingItemCount = 0;
        for (uint256 rarity = 0; rarity < 5; rarity++) {
            NFTItem[] memory rarityItems = treasury[Rarity(rarity)];

            for (uint256 i = 0; i < rarityItems.length; i++) {
                if (rarityItems[i].depositor == user) {
                    bytes32 itemCardId = appraisalContract.getTokenCardId(rarityItems[i].collection, rarityItems[i].tokenId);
                    if (itemCardId == cardId) {
                        matchingItemCount++;
                    }
                }
            }
        }

        if (matchingItemCount == 0) return new NFTItem[](0);

        // Create array with exact size needed
        items = new NFTItem[](matchingItemCount);
        uint256 currentIndex = 0;

        // Iterate through all rarity tiers and collect matching items
        for (uint256 rarity = 0; rarity < 5; rarity++) {
            NFTItem[] memory rarityItems = treasury[Rarity(rarity)];

            for (uint256 i = 0; i < rarityItems.length; i++) {
                if (rarityItems[i].depositor == user) {
                    bytes32 itemCardId = appraisalContract.getTokenCardId(rarityItems[i].collection, rarityItems[i].tokenId);
                    if (itemCardId == cardId) {
                        items[currentIndex] = rarityItems[i];
                        currentIndex++;
                    }
                }
            }
        }
    }

    /// @notice Gets comprehensive user lifetime statistics
    /// @param user User address
    /// @return deposited Total value deposited
    /// @return withdrawn Total value withdrawn
    /// @return claimed Total rewards claimed
    /// @return netContribution Net value contributed (deposited - withdrawn)
    function getUserLifetimeStats(address user)
        external
        view
        returns (uint256 deposited, uint256 withdrawn, uint256 claimed, uint256 netContribution)
    {
        if (user == address(0)) return (0, 0, 0, 0);

        deposited = userLifetimeDeposited[user];
        withdrawn = userLifetimeWithdrawn[user];
        claimed = userLifetimeClaimed[user];
        netContribution = deposited > withdrawn ? deposited - withdrawn : 0;
    }

  
    /// @notice Gets global platform statistics
    /// @return totalDeposited Total value deposited across all users
    /// @return totalClaimed Total rewards claimed across all users
    /// @return activeUsers Number of users who have deposited
    function getGlobalStats()
        external
        view
        returns (uint256 totalDeposited, uint256 totalClaimed, uint256 activeUsers)
    {
        totalDeposited = globalLifetimeDeposited;
        totalClaimed = globalLifetimeClaimed;
        // activeUsers would require additional tracking or could be derived from events
        activeUsers = 0; // Placeholder - would need separate implementation
    }

    /// @notice Custom gap for future storage variables (50 slots)
    uint256[47] private __gap;
}
