// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {IERC721} from "forge-std/interfaces/IERC721.sol";
import {IERC721Receiver} from "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title GachaTreasury - NFT Treasury Management
 * @notice Manages NFT storage and distribution for gacha system with rarity-based organization
 * @dev Supports batch operations, pending deposit system, and collection whitelisting
 * @author NFT Gacha Team
 */
contract GachaTreasury is IERC721Receiver, Ownable, Pausable, ReentrancyGuard {
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
    error PendingDepositNotFound();
    error PendingDepositAlreadyProcessed();
    error CannotDepositSameNFTTwice();
    error InvalidRewardsManager();
    error UnauthorizedGachaContract();
    error CollectionNotWhitelisted();
    error CollectionAlreadyWhitelisted();
    error CollectionNotInWhitelist();
    error EmptyWhitelist();

    /// @notice Maximum batch operation limits for gas optimization
    uint256 public constant MAX_BATCH_DEPOSIT = 50;
    uint256 public constant MAX_BATCH_WITHDRAW = 20;

    /// @notice NFT rarity tiers for gacha distribution
    enum Rarity {
        Common, // 0
        Uncommon, // 1
        Rare, // 2
        Epic, // 3
        Legendary // 4

    }

    /// @notice Represents an NFT stored in the treasury
    struct NFTItem {
        address collection;
        /// @dev NFT collection contract address (20 bytes)
        address depositor;
        /// @dev Original depositor address (20 bytes, new slot)
        Rarity rarity;
        /// @dev Assigned rarity tier (1 byte)
        uint256 tokenId;
    }
    /// @dev Token ID within the collection (32 bytes, new slot)

    /// @notice Status of pending deposits awaiting admin approval
    enum PendingDepositStatus {
        Pending,
        /// @dev Awaiting admin review
        Approved,
        /// @dev Approved and added to treasury
        Denied
    }
    /// @dev Denied and returned to depositor

    /// @notice Represents a pending deposit submitted by users
    struct PendingDeposit {
        address depositor;
        /// @dev User who submitted deposit (20 bytes)
        Rarity proposedRarity;
        /// @dev User's proposed rarity (1 byte)
        PendingDepositStatus status;
        /// @dev Current status (1 byte)
        // 10 bytes remaining in slot
        address collection;
        /// @dev NFT collection address (20 bytes, new slot)
        uint256 tokenId;
        /// @dev Token ID (32 bytes, new slot)
        uint256 timestamp;
    }
    /// @dev Submission timestamp (32 bytes, new slot)

    /// @notice Core treasury storage
    mapping(Rarity => NFTItem[]) public treasury;
    /// @dev NFTs organized by rarity
    mapping(Rarity => uint256) public rarityCount;
    /// @dev Count of NFTs per rarity

    /// @notice Contract addresses
    address public gachaContract;
    /// @dev Authorized gacha contract
    address public treasuryRewardsManager;
    /// @dev Rewards distribution contract

    /// @notice Duplicate protection
    mapping(address => mapping(uint256 => bool)) public depositedNFTs;

    /// @notice Pending deposits system
    mapping(uint256 => PendingDeposit) public pendingDeposits;
    mapping(address => mapping(uint256 => uint256)) public userPendingDeposits;
    /// @dev user => tokenId => pendingId
    uint256 public nextPendingId = 1;
    uint256[] public pendingDepositIds;

    /// @notice User deposit tracking for rewards
    mapping(address => mapping(Rarity => uint256)) public userDepositCounts;
    mapping(address => uint256) public userTotalDeposits;

    /// @notice Collection whitelist management
    mapping(address => bool) public whitelistedCollections;
    address[] public whitelistedCollectionsList;

    /// @notice Events for tracking treasury operations
    event NFTDeposited(address indexed collection, uint256 indexed tokenId, Rarity rarity);
    event NFTWithdrawn(address indexed collection, uint256 indexed tokenId, Rarity rarity, address to);
    event GachaContractUpdated(address indexed oldGacha, address indexed newGacha);
    event BatchDeposited(uint256 count, Rarity rarity);
    event BatchWithdrawn(uint256 count, Rarity rarity, address to);

    event PendingDepositSubmitted(
        uint256 indexed pendingId, address indexed depositor, address collection, uint256 tokenId, Rarity proposedRarity
    );

    event PendingDepositApproved(uint256 indexed pendingId, address indexed depositor, Rarity finalRarity);
    event PendingDepositDenied(uint256 indexed pendingId, address indexed depositor, string reason);
    event RewardsManagerUpdated(address indexed oldRewards, address indexed newRewards);
    event CollectionWhitelisted(address indexed collection);
    event CollectionRemovedFromWhitelist(address indexed collection);

    /// @notice Restricts access to the authorized gacha contract
    modifier onlyGacha() {
        if (msg.sender != gachaContract) revert UnauthorizedGachaContract();
        _;
    }

    /**
     * @notice Initializes the treasury with owner and gacha contract
     * @param _owner Address that will own the treasury contract
     * @param _gachaContract Address of the authorized gacha contract
     */
    constructor(address _owner, address _gachaContract) Ownable(_owner) {
        if (_gachaContract == address(0)) revert InvalidGachaContract();
        gachaContract = _gachaContract;
    }

    /// @notice Deposits an NFT into the treasury
    /// @param collection NFT collection address
    /// @param tokenId Token ID to deposit
    /// @param rarity Assigned rarity for the NFT
    function depositNFT(address collection, uint256 tokenId, Rarity rarity)
        external
        onlyOwner
        whenNotPaused
        nonReentrant
    {
        if (collection == address(0)) revert InvalidCollectionAddress();
        if (!whitelistedCollections[collection]) revert CollectionNotWhitelisted();
        if (depositedNFTs[collection][tokenId]) revert NFTAlreadyDeposited();
        if (!_isValidNFTContract(collection)) revert InvalidNFTContract();
        if (IERC721(collection).ownerOf(tokenId) != msg.sender) revert NotNFTOwner();

        IERC721(collection).safeTransferFrom(msg.sender, address(this), tokenId);
        depositedNFTs[collection][tokenId] = true;

        treasury[rarity].push(
            NFTItem({collection: collection, depositor: msg.sender, tokenId: tokenId, rarity: rarity})
        );
        unchecked {
            ++rarityCount[rarity];
        }

        // Track user deposit counts for rewards
        userDepositCounts[msg.sender][rarity]++;
        userTotalDeposits[msg.sender]++;

        emit NFTDeposited(collection, tokenId, rarity);
    }

    /// @notice Withdraws an NFT from the treasury
    /// @param rarity Rarity tier to withdraw from
    /// @param index Index of NFT in the rarity array
    /// @param to Recipient address
    function withdrawNFT(Rarity rarity, uint256 index, address to) external onlyOwner whenNotPaused nonReentrant {
        if (index >= treasury[rarity].length) revert InvalidIndex();
        if (to == address(0)) revert InvalidRecipient();

        NFTItem memory item = treasury[rarity][index];

        treasury[rarity][index] = treasury[rarity][treasury[rarity].length - 1];
        treasury[rarity].pop();
        unchecked {
            --rarityCount[rarity];
        }
        depositedNFTs[item.collection][item.tokenId] = false;

        IERC721(item.collection).safeTransferFrom(address(this), to, item.tokenId);

        emit NFTWithdrawn(item.collection, item.tokenId, rarity, to);
    }

    /// @notice Sends NFT to gacha winner (called by gacha contract)
    /// @param rarity Rarity tier to select from
    /// @param index Index of NFT in the rarity array
    /// @param winner Winner's address
    /// @return item The NFT item that was sent
    function sendNFTToWinner(Rarity rarity, uint256 index, address winner)
        external
        onlyGacha
        returns (NFTItem memory item)
    {
        if (index >= treasury[rarity].length) revert InvalidIndex();
        if (winner == address(0)) revert InvalidRecipient();

        item = treasury[rarity][index];

        treasury[rarity][index] = treasury[rarity][treasury[rarity].length - 1];
        treasury[rarity].pop();
        unchecked {
            --rarityCount[rarity];
        }
        depositedNFTs[item.collection][item.tokenId] = false;

        // Burn dividend tokens from the original depositor
        if (treasuryRewardsManager != address(0)) {
            (bool success,) = treasuryRewardsManager.call(
                abi.encodeWithSignature("recordNFTWon(address,uint8)", item.depositor, uint8(rarity))
            );
            success; // Silence unused variable warning
        }

        IERC721(item.collection).safeTransferFrom(address(this), winner, item.tokenId);

        emit NFTWithdrawn(item.collection, item.tokenId, rarity, winner);
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

    /// @notice Updates the authorized gacha contract address
    /// @param _gachaContract New gacha contract address
    function setGachaContract(address _gachaContract) external onlyOwner {
        if (_gachaContract == address(0)) revert InvalidGachaContract();
        address oldGacha = gachaContract;
        gachaContract = _gachaContract;
        emit GachaContractUpdated(oldGacha, _gachaContract);
    }

    /// @notice Public function for users to submit NFT deposits for approval
    /// @param collection NFT collection address
    /// @param tokenId Token ID to deposit
    /// @param proposedRarity User's proposed rarity for the NFT
    /// @return pendingId The ID of the pending deposit
    function submitPendingDeposit(address collection, uint256 tokenId, Rarity proposedRarity)
        external
        whenNotPaused
        nonReentrant
        returns (uint256 pendingId)
    {
        if (collection == address(0)) revert InvalidCollectionAddress();
        if (!whitelistedCollections[collection]) revert CollectionNotWhitelisted();
        if (depositedNFTs[collection][tokenId]) revert NFTAlreadyDeposited();
        if (userPendingDeposits[msg.sender][tokenId] != 0) revert CannotDepositSameNFTTwice();
        if (!_isValidNFTContract(collection)) revert InvalidNFTContract();
        if (IERC721(collection).ownerOf(tokenId) != msg.sender) revert NotNFTOwner();

        // Transfer NFT to this contract
        IERC721(collection).safeTransferFrom(msg.sender, address(this), tokenId);

        pendingId = nextPendingId++;

        pendingDeposits[pendingId] = PendingDeposit({
            depositor: msg.sender,
            collection: collection,
            tokenId: tokenId,
            proposedRarity: proposedRarity,
            status: PendingDepositStatus.Pending,
            timestamp: block.timestamp
        });

        userPendingDeposits[msg.sender][tokenId] = pendingId;
        pendingDepositIds.push(pendingId);

        emit PendingDepositSubmitted(pendingId, msg.sender, collection, tokenId, proposedRarity);
    }

    /// @notice Owner approves a pending deposit
    /// @param pendingId ID of the pending deposit
    /// @param finalRarity Final rarity assigned by owner (can differ from proposed)
    function approvePendingDeposit(uint256 pendingId, Rarity finalRarity)
        external
        onlyOwner
        whenNotPaused
        nonReentrant
    {
        PendingDeposit storage deposit = pendingDeposits[pendingId];

        if (deposit.depositor == address(0)) revert PendingDepositNotFound();
        if (deposit.status != PendingDepositStatus.Pending) revert PendingDepositAlreadyProcessed();

        deposit.status = PendingDepositStatus.Approved;

        // Mark as deposited to prevent duplicates
        depositedNFTs[deposit.collection][deposit.tokenId] = true;

        // Add to treasury
        treasury[finalRarity].push(
            NFTItem({
                collection: deposit.collection,
                depositor: deposit.depositor,
                tokenId: deposit.tokenId,
                rarity: finalRarity
            })
        );

        unchecked {
            ++rarityCount[finalRarity];
        }

        // Track user deposit counts for rewards
        userDepositCounts[deposit.depositor][finalRarity]++;
        userTotalDeposits[deposit.depositor]++;

        // Notify rewards manager to mint reward tokens
        if (treasuryRewardsManager != address(0)) {
            (bool success,) = treasuryRewardsManager.call(
                abi.encodeWithSignature("recordApprovedDeposit(address,uint8)", deposit.depositor, uint8(finalRarity))
            );
            success; // Silence unused variable warning
        }

        // Remove from pending list
        _removePendingDepositId(pendingId);
        delete userPendingDeposits[deposit.depositor][deposit.tokenId];

        emit NFTDeposited(deposit.collection, deposit.tokenId, finalRarity);
        emit PendingDepositApproved(pendingId, deposit.depositor, finalRarity);
    }

    /// @notice Owner denies a pending deposit and returns NFT
    /// @param pendingId ID of the pending deposit
    /// @param reason Reason for denial
    function denyPendingDeposit(uint256 pendingId, string calldata reason)
        external
        onlyOwner
        whenNotPaused
        nonReentrant
    {
        PendingDeposit storage deposit = pendingDeposits[pendingId];

        if (deposit.depositor == address(0)) revert PendingDepositNotFound();
        if (deposit.status != PendingDepositStatus.Pending) revert PendingDepositAlreadyProcessed();

        deposit.status = PendingDepositStatus.Denied;

        // Return NFT to depositor
        IERC721(deposit.collection).safeTransferFrom(address(this), deposit.depositor, deposit.tokenId);

        // Remove from pending list
        _removePendingDepositId(pendingId);
        delete userPendingDeposits[deposit.depositor][deposit.tokenId];

        emit PendingDepositDenied(pendingId, deposit.depositor, reason);
    }

    /// @notice Gets all pending deposit IDs
    /// @return Array of pending deposit IDs
    function getPendingDepositIds() external view returns (uint256[] memory) {
        return pendingDepositIds;
    }

    /// @notice Gets pending deposit details
    /// @param pendingId ID of the pending deposit
    /// @return deposit Pending deposit details
    function getPendingDeposit(uint256 pendingId) external view returns (PendingDeposit memory deposit) {
        return pendingDeposits[pendingId];
    }

    /// @notice Gets user's pending deposits
    /// @param user Address to query
    /// @return userPendingIds Array of pending deposit IDs for the user
    function getUserPendingDeposits(address user) external view returns (uint256[] memory userPendingIds) {
        if (user == address(0)) return userPendingIds; // Returns empty array
        uint256 count = 0;

        // First pass: count user's pending deposits
        for (uint256 i = 0; i < pendingDepositIds.length; i++) {
            uint256 pendingId = pendingDepositIds[i];
            if (
                pendingDeposits[pendingId].depositor == user
                    && pendingDeposits[pendingId].status == PendingDepositStatus.Pending
            ) {
                count++;
            }
        }

        // Second pass: collect user's pending deposit IDs
        userPendingIds = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < pendingDepositIds.length; i++) {
            uint256 pendingId = pendingDepositIds[i];
            if (
                pendingDeposits[pendingId].depositor == user
                    && pendingDeposits[pendingId].status == PendingDepositStatus.Pending
            ) {
                userPendingIds[index] = pendingId;
                index++;
            }
        }
    }

    /// @notice Helper function to remove pending deposit ID from array
    /// @param pendingIdToRemove ID to remove from pending list
    function _removePendingDepositId(uint256 pendingIdToRemove) private {
        for (uint256 i = 0; i < pendingDepositIds.length; i++) {
            if (pendingDepositIds[i] == pendingIdToRemove) {
                pendingDepositIds[i] = pendingDepositIds[pendingDepositIds.length - 1];
                pendingDepositIds.pop();
                break;
            }
        }
    }

    // Batch operations
    /// @notice Batch deposit multiple NFTs
    /// @param collections Array of NFT collection addresses
    /// @param tokenIds Array of token IDs
    /// @param rarities Array of assigned rarities
    function batchDepositNFT(address[] calldata collections, uint256[] calldata tokenIds, Rarity[] calldata rarities)
        external
        onlyOwner
        whenNotPaused
        nonReentrant
    {
        uint256 length = collections.length;
        if (length != tokenIds.length || length != rarities.length) revert ArrayLengthMismatch();
        if (length == 0) revert EmptyArrays();
        if (length > MAX_BATCH_DEPOSIT) revert TooManyItems();

        for (uint256 i; i < length;) {
            address collection = collections[i];
            uint256 tokenId = tokenIds[i];
            Rarity rarity = rarities[i];

            if (collection == address(0)) revert InvalidCollectionAddress();
            if (!whitelistedCollections[collection]) revert CollectionNotWhitelisted();
            if (depositedNFTs[collection][tokenId]) revert NFTAlreadyDeposited();
            if (!_isValidNFTContract(collection)) revert InvalidNFTContract();
            if (IERC721(collection).ownerOf(tokenId) != msg.sender) revert NotNFTOwner();

            IERC721(collection).safeTransferFrom(msg.sender, address(this), tokenId);
            depositedNFTs[collection][tokenId] = true;

            treasury[rarity].push(
                NFTItem({collection: collection, depositor: msg.sender, tokenId: tokenId, rarity: rarity})
            );
            unchecked {
                ++rarityCount[rarity];
                ++i;
            }

            // Track user deposit counts for rewards
            userDepositCounts[msg.sender][rarity]++;
            userTotalDeposits[msg.sender]++;

            emit NFTDeposited(collection, tokenId, rarity);
        }

        emit BatchDeposited(length, rarities[0]);
    }

    /// @notice Batch withdraw multiple NFTs of same rarity
    /// @param rarity Rarity tier to withdraw from
    /// @param indices Array of indices to withdraw
    /// @param to Recipient address
    function batchWithdrawNFT(Rarity rarity, uint256[] calldata indices, address to)
        external
        onlyOwner
        whenNotPaused
        nonReentrant
    {
        uint256 length = indices.length;
        if (length == 0) revert EmptyArrays();
        if (length > MAX_BATCH_WITHDRAW) revert TooManyItems();
        if (to == address(0)) revert InvalidRecipient();

        // Sort indices in descending order to avoid index shifting issues
        uint256[] memory sortedIndices = _quickSort(indices);

        for (uint256 i; i < length;) {
            uint256 index = sortedIndices[i];
            if (index >= treasury[rarity].length) revert InvalidIndex();

            NFTItem memory item = treasury[rarity][index];

            treasury[rarity][index] = treasury[rarity][treasury[rarity].length - 1];
            treasury[rarity].pop();
            unchecked {
                --rarityCount[rarity];
                ++i;
            }
            depositedNFTs[item.collection][item.tokenId] = false;

            IERC721(item.collection).safeTransferFrom(address(this), to, item.tokenId);

            emit NFTWithdrawn(item.collection, item.tokenId, rarity, to);
        }

        emit BatchWithdrawn(length, rarity, to);
    }

    // Helper functions
    function _isValidNFTContract(address collection) private view returns (bool) {
        try IERC721(collection).supportsInterface(0x80ac58cd) returns (bool supported) {
            return supported;
        } catch {
            return false;
        }
    }

    /// @dev Optimized sorting for small arrays (up to 20 items)
    /// @param arr Array to sort in descending order
    /// @return sorted Sorted array in descending order
    function _quickSort(uint256[] calldata arr) private pure returns (uint256[] memory sorted) {
        uint256 length = arr.length;
        sorted = new uint256[](length);

        for (uint256 i; i < length;) {
            sorted[i] = arr[i];
            unchecked {
                ++i;
            }
        }

        // Insertion sort for small arrays (most efficient for n <= 20)
        for (uint256 i = 1; i < length;) {
            uint256 key = sorted[i];
            uint256 j = i;

            while (j > 0 && sorted[j - 1] < key) {
                sorted[j] = sorted[j - 1];
                unchecked {
                    --j;
                }
            }
            sorted[j] = key;
            unchecked {
                ++i;
            }
        }
    }

    function isNFTDeposited(address collection, uint256 tokenId) external view returns (bool) {
        return depositedNFTs[collection][tokenId];
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

    /// @notice Gets all deposit counts for a user across all rarities
    /// @param user User address
    /// @return counts Array of deposit counts [Common, Uncommon, Rare, Epic, Legendary]
    function getUserAllDepositCounts(address user) external view returns (uint256[5] memory counts) {
        if (user == address(0)) return counts; // Returns all zeros
        for (uint256 i = 0; i < 5; i++) {
            counts[i] = userDepositCounts[user][Rarity(i)];
        }
    }

    /// @notice Sets the treasury rewards manager address
    /// @param _treasuryRewardsManager New treasury rewards manager address
    function setTreasuryRewardsManager(address _treasuryRewardsManager) external onlyOwner {
        if (_treasuryRewardsManager == address(0)) revert InvalidRewardsManager();
        address oldRewardsManager = treasuryRewardsManager;
        treasuryRewardsManager = _treasuryRewardsManager;
        emit RewardsManagerUpdated(oldRewardsManager, _treasuryRewardsManager);
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

    /// @notice Required for receiving ERC721 tokens
    function onERC721Received(
        address, // operator
        address, // from
        uint256, // tokenId
        bytes calldata // data
    ) external pure override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }
}
