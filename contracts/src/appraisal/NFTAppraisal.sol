// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import {ReentrancyGuardUpgradeable} from "../utils/ReentrancyGuardUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {AppraisalRequested} from "../interfaces/NFTAppraisalTypes.sol";

/**
 * @title NFTAppraisal - Upgradeable NFT Valuation System for Gacha Treasury
 * @notice Provides paid NFT appraisal services with external oracle integration
 * @dev Supports user-initiated appraisals and owner overrides for treasury automation
 * @dev This contract is upgradeable using UUPS proxy pattern
 * @author NFT Gacha Team
 */
contract NFTAppraisal is
    Initializable,
    OwnableUpgradeable,
    PausableUpgradeable,
    ReentrancyGuardUpgradeable,
    UUPSUpgradeable
{
    using SafeERC20 for IERC20;

    /// @notice Custom errors for gas efficiency and clarity
    error InvalidFeeToken();
    error InvalidProtocolAddress();
    error InvalidCollection();
    error InvalidTokenId();
    error AppraisalNotFound();
    error AppraisalAlreadyExists();
    error AppraisalNotPending();
    error UnauthorizedServiceHandler();
    error InvalidPrice();
    error CardIdMismatch();
    error CardIdRequired();
    error InvalidTreasuryAddress();
    error TreasuryAlreadyWhitelisted();
    error TreasuryNotWhitelisted();
    error InvalidAppraisalInitialization();
    error NotAppraisalInitializing();

    /// @notice Status of NFT appraisals
    enum AppraisalStatus {
        Pending,
        Completed,
        OwnerOverride
    }

    /// @notice Card-level appraisal (shared across multiple tokens)
    struct CardAppraisal {
        uint256 priceUSD; // Appraised price in USD (1e18)
        AppraisalStatus status; // Completed/OwnerOverride
        uint256 firstTimestamp; // First time a price was recorded
        uint256 lastUpdated; // When price was last updated
        address canonicalContractAddress; // Contract address of the first appraised token
        uint256 canonicalTokenId; // Token ID of the first appraised token
    }

    /// @notice Per-token request tracking
    struct TokenRequest {
        address requester; // requester of this token's appraisal
        AppraisalStatus status; // mirrors card status once linked
        uint256 timestamp; // request time
        uint256 lastUpdated; // last status update time
    }

    /// @notice Configuration variables
    IERC20 public feeToken; // Token used for appraisal fees
    uint256 public appraisalFee; // Fee amount for appraisal requests
    address public protocolAddress; // Address receiving protocol fees

    /// @notice Service handler authorized to set appraisals
    address public serviceHandler;

    /// @notice Treasury management for automatic migration
    mapping(address => bool) public whitelistedTreasuries;
    address[] public treasuryList;

    /// @notice Token -> Card linkage and storage
    mapping(address => mapping(uint256 => bytes32)) public tokenCardIds; // (collection, tokenId) -> cardId
    mapping(bytes32 => CardAppraisal) public cardAppraisals; // cardId -> appraisal
    mapping(address => mapping(uint256 => TokenRequest)) public tokenRequests;

    /// @notice Events for external service integration and monitoring

    event AppraisalCompleted(
        address indexed collection, uint256 indexed tokenId, uint256 priceUSD, address indexed oracle, uint256 timestamp
    );

    event AppraisalOverridden(
        address indexed collection,
        uint256 indexed tokenId,
        uint256 oldPriceUSD,
        uint256 newPriceUSD,
        address indexed owner
    );

    event PriceUpdated(address indexed collection, uint256 indexed tokenId, uint256 oldPriceUSD, uint256 newPriceUSD);
    event CardPriceUpdated(bytes32 indexed cardId, uint256 oldPriceUSD, uint256 newPriceUSD);
    event CardAppraisalCompleted(bytes32 indexed cardId, uint256 priceUSD, address indexed oracle, uint256 timestamp);
    event TokenLinkedToCard(address indexed collection, uint256 indexed tokenId, bytes32 indexed cardId);

    event ServiceHandlerUpdated(address indexed oldHandler, address indexed newHandler);
    event AppraisalFeeUpdated(uint256 oldFee, uint256 newFee);

    event TreasuryWhitelisted(address indexed treasury);
    event TreasuryUnwhitelisted(address indexed treasury);
    event AutoMigrationTriggered(address indexed treasury, address indexed collection, uint256 indexed tokenId);
    event FeeTokenUpdated(address oldToken, address newToken);
    event ProtocolAddressUpdated(address oldAddress, address newAddress);

    /// @notice Status changes
    event AppraisalStatusChanged(
        address indexed collection,
        uint256 indexed tokenId,
        AppraisalStatus oldStatus,
        AppraisalStatus newStatus,
        uint256 timestamp
    );

    /// @notice Restricts access to authorized service handler
    modifier onlyServiceHandler() {
        if (msg.sender != serviceHandler) revert UnauthorizedServiceHandler();
        _;
    }

    /**
     * @notice Initializes the NFT appraisal contract
     * @param _feeToken Token used for appraisal fees
     * @param _appraisalFee Fee amount for each appraisal request
     * @param _protocolAddress Address to receive protocol fees
     */
    function initialize(address /* _owner */, address _feeToken, uint256 _appraisalFee, address _protocolAddress)
        public
        initializer
    {
        __Ownable_init();
        __Pausable_init();
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();

        if (_feeToken == address(0)) revert InvalidFeeToken();
        if (_protocolAddress == address(0)) revert InvalidProtocolAddress();

        feeToken = IERC20(_feeToken);
        appraisalFee = _appraisalFee;
        protocolAddress = _protocolAddress;
    }

    /**
     * @notice Authorizes upgrade to new implementation
     * @dev Only owner can upgrade the contract
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    /**
     * @notice Requests an appraisal for an NFT
     * @param collection NFT collection address
     * @param tokenId Token ID to appraise
     * @dev Emits AppraisalRequested event for external service to pick up
     */
    function requestAppraisal(address collection, uint256 tokenId) external whenNotPaused nonReentrant {
        if (collection == address(0)) revert InvalidCollection();
        if (!_isValidNFTContract(collection)) revert InvalidCollection();

        // Verify token exists
        try IERC721(collection).ownerOf(tokenId) returns (address) {
            // Token exists, continue
        } catch {
            revert InvalidTokenId();
        }

        // Allow re-appraisals for migration purposes, but charge fee again
        // If already exists, this is a re-appraisal request

        // Collect appraisal fee
        if (appraisalFee > 0) {
            feeToken.safeTransferFrom(msg.sender, protocolAddress, appraisalFee);
        }

        // Create or update token request (supporting re-appraisals)
        bool isReAppraisal = tokenRequests[collection][tokenId].timestamp != 0;

        tokenRequests[collection][tokenId] = TokenRequest({
            requester: msg.sender,
            status: AppraisalStatus.Pending,
            timestamp: block.timestamp,
            lastUpdated: isReAppraisal ? block.timestamp : 0
        });

        emit AppraisalRequested(collection, tokenId);
        emit AppraisalStatusChanged(
            collection, tokenId, AppraisalStatus.Pending, AppraisalStatus.Pending, block.timestamp
        );
    }

    /**
     * @notice Requests appraisals for multiple NFTs in batch
     * @param collections Array of NFT collection addresses
     * @param tokenIds Array of token IDs to appraise
     * @dev Emits AppraisalRequested event for each NFT for external service to pick up
     */
    function requestBatchAppraisal(address[] calldata collections, uint256[] calldata tokenIds)
        external
        whenNotPaused
        nonReentrant
    {
        require(collections.length == tokenIds.length, "Array length mismatch");
        require(collections.length > 0, "Empty arrays");

        uint256 totalFee = appraisalFee * collections.length;

        // Collect total appraisal fee upfront
        if (totalFee > 0) {
            feeToken.safeTransferFrom(msg.sender, protocolAddress, totalFee);
        }

        // Process each appraisal request
        for (uint256 i = 0; i < collections.length; i++) {
            address collection = collections[i];
            uint256 tokenId = tokenIds[i];

            if (collection == address(0)) revert InvalidCollection();
            if (!_isValidNFTContract(collection)) revert InvalidCollection();

            // Verify token exists
            try IERC721(collection).ownerOf(tokenId) returns (address) {
                // Token exists, continue
            } catch {
                revert InvalidTokenId();
            }

            // Check if request already exists
            if (tokenRequests[collection][tokenId].timestamp != 0) revert AppraisalAlreadyExists();

            // Create token request record
            tokenRequests[collection][tokenId] = TokenRequest({
                requester: msg.sender,
                status: AppraisalStatus.Pending,
                timestamp: block.timestamp,
                lastUpdated: 0
            });

            // Emit events for external service integration
            emit AppraisalRequested(collection, tokenId);
            emit AppraisalStatusChanged(
                collection, tokenId, AppraisalStatus.Pending, AppraisalStatus.Pending, block.timestamp
            );
        }
    }

    /**
     * @notice Service handler sets the card-level appraised price and links the token to the card
     * @param collection NFT collection address
     * @param tokenId Token ID that was appraised
     * @param cardId Group identifier (bytes32)
     * @param priceUSD Appraised price in 1e18 USD
     */
    function setAppraisalForTokenWithCard(address collection, uint256 tokenId, bytes32 cardId, uint256 priceUSD)
        external
        onlyServiceHandler
        whenNotPaused
        nonReentrant
    {
        if (priceUSD == 0) revert InvalidPrice();
        // Ensure a request exists
        if (tokenRequests[collection][tokenId].timestamp == 0) revert AppraisalNotFound();

        // Link token to card
        bytes32 existing = tokenCardIds[collection][tokenId];
        if (existing != bytes32(0) && existing != cardId) revert CardIdMismatch();
        if (existing == bytes32(0)) {
            tokenCardIds[collection][tokenId] = cardId;
            emit TokenLinkedToCard(collection, tokenId, cardId);
        }

        // Update card appraisal
        CardAppraisal storage ca = cardAppraisals[cardId];
        uint256 oldPrice = ca.priceUSD;
        AppraisalStatus oldStatus = ca.status;
        if (ca.firstTimestamp == 0) {
            ca.firstTimestamp = block.timestamp;
            ca.canonicalContractAddress = collection;
            ca.canonicalTokenId = tokenId;
        }
        ca.priceUSD = priceUSD;
        ca.status = AppraisalStatus.Completed;
        ca.lastUpdated = block.timestamp;

        // Update token request status
        TokenRequest storage tr = tokenRequests[collection][tokenId];
        tr.status = AppraisalStatus.Completed;
        tr.lastUpdated = block.timestamp;

        emit AppraisalCompleted(collection, tokenId, priceUSD, msg.sender, block.timestamp);
        emit CardAppraisalCompleted(cardId, priceUSD, msg.sender, block.timestamp);
        emit AppraisalStatusChanged(collection, tokenId, oldStatus, AppraisalStatus.Completed, block.timestamp);
        if (oldPrice != priceUSD) {
            emit CardPriceUpdated(cardId, oldPrice, priceUSD);
            emit PriceUpdated(collection, tokenId, oldPrice, priceUSD);
            _triggerAutoMigration(collection, tokenId);
        }
    }

    /**
     * @notice Owner batch sets appraised prices for multiple tokens with cards
     * @dev Gas-optimized for seeding local environments
     */
    function ownerBatchSetAppraisalForTokensWithCards(
        address[] calldata collections,
        uint256[] calldata tokenIds,
        bytes32[] calldata cardIds,
        uint256[] calldata pricesUSD
    ) external onlyOwner whenNotPaused nonReentrant {
        require(
            collections.length == tokenIds.length && tokenIds.length == cardIds.length
                && cardIds.length == pricesUSD.length,
            "Array length mismatch"
        );
        require(collections.length <= 50, "Too many items");

        for (uint256 i = 0; i < collections.length; i++) {
            _setAppraisalForTokenWithCard(collections[i], tokenIds[i], cardIds[i], pricesUSD[i], true);
        }
    }

    /**
     * @notice Owner sets the card-level appraised price and links the token to the card without a prior request
     * @dev Avoids charging fees or requiring requestAppraisal; useful for seeding local environments
     */
    function ownerSetAppraisalForTokenWithCard(address collection, uint256 tokenId, bytes32 cardId, uint256 priceUSD)
        external
        onlyOwner
        whenNotPaused
        nonReentrant
    {
        _setAppraisalForTokenWithCard(collection, tokenId, cardId, priceUSD, true);
    }

    function _setAppraisalForTokenWithCard(
        address collection,
        uint256 tokenId,
        bytes32 cardId,
        uint256 priceUSD,
        bool isOwnerOverride
    ) internal {
        // Verify token exists
        try IERC721(collection).ownerOf(tokenId) returns (address) {
            // Token exists
        } catch {
            revert InvalidTokenId();
        }

        // Link token to card
        bytes32 existing = tokenCardIds[collection][tokenId];
        if (existing != bytes32(0) && existing != cardId) revert CardIdMismatch();
        if (existing == bytes32(0)) {
            tokenCardIds[collection][tokenId] = cardId;
            emit TokenLinkedToCard(collection, tokenId, cardId);
        }

        // Update card appraisal
        CardAppraisal storage ca = cardAppraisals[cardId];
        uint256 oldPrice = ca.priceUSD;
        AppraisalStatus oldStatus = ca.status;
        if (ca.firstTimestamp == 0) {
            ca.firstTimestamp = block.timestamp;
            ca.canonicalContractAddress = collection;
            ca.canonicalTokenId = tokenId;
        }
        ca.priceUSD = priceUSD;
        ca.status = isOwnerOverride ? AppraisalStatus.OwnerOverride : AppraisalStatus.Completed;
        ca.lastUpdated = block.timestamp;

        // Create/update token request record for completeness
        TokenRequest storage tr = tokenRequests[collection][tokenId];
        if (tr.timestamp == 0) {
            tr.requester = msg.sender;
            tr.timestamp = block.timestamp;
        }
        tr.status = isOwnerOverride ? AppraisalStatus.OwnerOverride : AppraisalStatus.Completed;
        tr.lastUpdated = block.timestamp;

        // Emit events
        if (isOwnerOverride) {
            emit AppraisalOverridden(collection, tokenId, oldPrice, priceUSD, msg.sender);
        } else {
            emit AppraisalCompleted(collection, tokenId, priceUSD, msg.sender, block.timestamp);
        }

        emit AppraisalStatusChanged(collection, tokenId, oldStatus, tr.status, block.timestamp);
        if (oldPrice != priceUSD) {
            emit CardPriceUpdated(cardId, oldPrice, priceUSD);
            emit PriceUpdated(collection, tokenId, oldPrice, priceUSD);
            _triggerAutoMigration(collection, tokenId);
        }
    }

    /**
     * @notice Gets the appraised price for an NFT
     * @param collection NFT collection address
     * @param tokenId Token ID to query
     * @return priceUSD Appraised price in USD (0 if not appraised)
     * @return status Current appraisal status
     */
    function getAppraisedPrice(address collection, uint256 tokenId)
        external
        view
        returns (uint256 priceUSD, AppraisalStatus status)
    {
        bytes32 cardId = tokenCardIds[collection][tokenId];
        if (cardId == bytes32(0)) return (0, AppraisalStatus.Pending);
        CardAppraisal memory ca = cardAppraisals[cardId];
        return (ca.priceUSD, ca.status);
    }

    /**
     * @notice Gets full appraisal details
     * @param collection NFT collection address
     * @param tokenId Token ID to query
     * @return appraisal Complete appraisal record
     */
    /// @notice Minimal view combining token request and card appraisal
    struct Appraisal {
        address requester;
        uint256 priceUSD;
        AppraisalStatus status;
        uint256 timestamp;
        uint256 lastUpdated;
    }

    function getAppraisal(address collection, uint256 tokenId) external view returns (Appraisal memory appraisal) {
        TokenRequest memory tr = tokenRequests[collection][tokenId];
        bytes32 cardId = tokenCardIds[collection][tokenId];
        CardAppraisal memory ca = cardAppraisals[cardId];
        return Appraisal({
            requester: tr.requester,
            priceUSD: ca.priceUSD,
            status: (cardId == bytes32(0)) ? tr.status : ca.status,
            timestamp: tr.timestamp,
            lastUpdated: (cardId == bytes32(0)) ? tr.lastUpdated : ca.lastUpdated
        });
    }

    /**
     * @notice Checks if an NFT has a completed appraisal
     * @param collection NFT collection address
     * @param tokenId Token ID to check
     * @return True if NFT has been appraised with a price > 0
     */
    function hasAppraisal(address collection, uint256 tokenId) external view returns (bool) {
        bytes32 cardId = tokenCardIds[collection][tokenId];
        if (cardId == bytes32(0)) return false;
        CardAppraisal memory ca = cardAppraisals[cardId];
        return ca.priceUSD > 0 && (ca.status == AppraisalStatus.Completed || ca.status == AppraisalStatus.OwnerOverride);
    }

    /**
     * @notice Batch function to get appraisal status for multiple NFTs
     * @param collections Array of NFT collection addresses
     * @param tokenIds Array of token IDs
     * @return prices Array of appraised prices
     * @return statuses Array of appraisal statuses
     */
    function getBatchAppraisals(address[] calldata collections, uint256[] calldata tokenIds)
        external
        view
        returns (uint256[] memory prices, AppraisalStatus[] memory statuses)
    {
        require(collections.length == tokenIds.length, "Array length mismatch");

        prices = new uint256[](collections.length);
        statuses = new AppraisalStatus[](collections.length);

        for (uint256 i = 0; i < collections.length; i++) {
            bytes32 cardId = tokenCardIds[collections[i]][tokenIds[i]];
            if (cardId == bytes32(0)) {
                prices[i] = 0;
                statuses[i] = AppraisalStatus.Pending;
            } else {
                CardAppraisal memory ca = cardAppraisals[cardId];
                prices[i] = ca.priceUSD;
                statuses[i] = ca.status;
            }
        }
    }

    /**
     * @notice Batch function to check if multiple NFTs have completed appraisals
     * @param collections Array of NFT collection addresses
     * @param tokenIds Array of token IDs
     * @return hasAppraisals Array of booleans indicating appraisal completion
     */
    function hasBatchAppraisals(address[] calldata collections, uint256[] calldata tokenIds)
        external
        view
        returns (bool[] memory hasAppraisals)
    {
        require(collections.length == tokenIds.length, "Array length mismatch");

        hasAppraisals = new bool[](collections.length);

        for (uint256 i = 0; i < collections.length; i++) {
            bytes32 cardId = tokenCardIds[collections[i]][tokenIds[i]];
            if (cardId == bytes32(0)) {
                hasAppraisals[i] = false;
            } else {
                CardAppraisal memory ca = cardAppraisals[cardId];
                hasAppraisals[i] = ca.priceUSD > 0
                    && (ca.status == AppraisalStatus.Completed || ca.status == AppraisalStatus.OwnerOverride);
            }
        }
    }

    /// Convenience getters for card-first reads
    function getTokenCardId(address collection, uint256 tokenId) external view returns (bytes32) {
        return tokenCardIds[collection][tokenId];
    }

    function getCardAppraisal(bytes32 cardId) external view returns (CardAppraisal memory) {
        return cardAppraisals[cardId];
    }

    function getCardAppraisals(bytes32[] calldata cardIds) external view returns (CardAppraisal[] memory appraisals) {
        appraisals = new CardAppraisal[](cardIds.length);
        for (uint256 i = 0; i < cardIds.length; i++) {
            appraisals[i] = cardAppraisals[cardIds[i]];
        }
    }

    // ============ SERVICE HANDLER MANAGEMENT ============

    /**
     * @notice Sets the authorized service handler address
     * @param _serviceHandler Address of the NFTAppraisalServiceHandler contract
     */
    function setServiceHandler(address _serviceHandler) external onlyOwner {
        if (_serviceHandler == address(0)) revert UnauthorizedServiceHandler();

        address oldHandler = serviceHandler;
        serviceHandler = _serviceHandler;

        emit ServiceHandlerUpdated(oldHandler, _serviceHandler);
    }

    /**
     * @notice Gets the current service handler address
     * @return handler Address of the authorized service handler
     */
    function getServiceHandler() external view returns (address handler) {
        return serviceHandler;
    }

    /**
     * @notice Checks if an address is the authorized service handler
     * @param handler Address to check
     * @return isAuthorized True if address is the authorized service handler
     */
    function isServiceHandler(address handler) external view returns (bool isAuthorized) {
        return handler == serviceHandler;
    }

    // ============ CONFIGURATION MANAGEMENT ============

    /**
     * @notice Updates the appraisal fee amount
     * @param _newFee New fee amount in tokens
     */
    function setAppraisalFee(uint256 _newFee) external onlyOwner {
        uint256 oldFee = appraisalFee;
        appraisalFee = _newFee;
        emit AppraisalFeeUpdated(oldFee, _newFee);
    }

    /**
     * @notice Updates the fee token contract
     * @param _newFeeToken Address of the new fee token
     */
    function setFeeToken(address _newFeeToken) external onlyOwner {
        if (_newFeeToken == address(0)) revert InvalidFeeToken();
        address oldToken = address(feeToken);
        feeToken = IERC20(_newFeeToken);
        emit FeeTokenUpdated(oldToken, _newFeeToken);
    }

    /**
     * @notice Updates the protocol address for fee collection
     * @param _newProtocolAddress New protocol address
     */
    function setProtocolAddress(address _newProtocolAddress) external onlyOwner {
        if (_newProtocolAddress == address(0)) revert InvalidProtocolAddress();
        address oldAddress = protocolAddress;
        protocolAddress = _newProtocolAddress;
        emit ProtocolAddressUpdated(oldAddress, _newProtocolAddress);
    }

    // ============ TREASURY MANAGEMENT ============

    /**
     * @notice Add a treasury to the whitelist for automatic migration
     * @param treasury Treasury contract address
     */
    function whitelistTreasury(address treasury) external onlyOwner {
        if (treasury == address(0)) revert InvalidTreasuryAddress();
        if (whitelistedTreasuries[treasury]) revert TreasuryAlreadyWhitelisted();

        whitelistedTreasuries[treasury] = true;
        treasuryList.push(treasury);
        emit TreasuryWhitelisted(treasury);
    }

    /**
     * @notice Remove a treasury from the whitelist
     * @param treasury Treasury contract address
     */
    function unwhitelistTreasury(address treasury) external onlyOwner {
        if (!whitelistedTreasuries[treasury]) revert TreasuryNotWhitelisted();

        whitelistedTreasuries[treasury] = false;

        // Remove from treasuryList array
        for (uint256 i = 0; i < treasuryList.length; i++) {
            if (treasuryList[i] == treasury) {
                treasuryList[i] = treasuryList[treasuryList.length - 1];
                treasuryList.pop();
                break;
            }
        }

        emit TreasuryUnwhitelisted(treasury);
    }

    /**
     * @notice Internal function to trigger automatic migration if NFT is in whitelisted treasury
     * @param collection NFT collection address
     * @param tokenId Token ID to check and migrate
     */
    function _triggerAutoMigration(address collection, uint256 tokenId) internal {
        // Check if the NFT owner is a whitelisted treasury
        address nftOwner = IERC721(collection).ownerOf(tokenId);

        if (whitelistedTreasuries[nftOwner]) {
            // Call the treasury's migration function
            // Use low-level call to prevent revert from failing this transaction
            (bool success,) = nftOwner.call{gas: 100_000}(
                abi.encodeWithSignature("migrateNFTRarity(address,uint256)", collection, tokenId)
            );

            if (success) {
                emit AutoMigrationTriggered(nftOwner, collection, tokenId);
            }
            // If migration fails, we don't revert - the price update still happened
        }
    }

    /**
     * @notice Get all whitelisted treasuries
     * @return treasuries Array of whitelisted treasury addresses
     */
    function getWhitelistedTreasuries() external view returns (address[] memory treasuries) {
        return treasuryList;
    }

    /**
     * @notice Check if a treasury is whitelisted
     * @param treasury Treasury address to check
     * @return isWhitelisted True if treasury is whitelisted
     */
    function isTreasuryWhitelisted(address treasury) external view returns (bool isWhitelisted) {
        return whitelistedTreasuries[treasury];
    }

    // ============ UTILITY FUNCTIONS ============

    /**
     * @dev Validates if address is a valid NFT contract
     * @param collection Address to validate
     * @return isValid True if address supports ERC721 interface
     */
    function _isValidNFTContract(address collection) private view returns (bool isValid) {
        try IERC165(collection).supportsInterface(0x80ac58cd) returns (bool supported) {
            return supported;
        } catch {
            return false;
        }
    }

    // ============ EMERGENCY FUNCTIONS ============

    /**
     * @notice Emergency pause function
     */
    function emergencyPause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Emergency unpause function
     */
    function emergencyUnpause() external onlyOwner {
        _unpause();
    }

    /// @notice Custom gap for future storage variables (50 slots)
    uint256[50] private __gap;
}