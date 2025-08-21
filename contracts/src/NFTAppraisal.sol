// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title NFTAppraisal - NFT Valuation System for Gacha Treasury
 * @notice Provides paid NFT appraisal services with external oracle integration
 * @dev Supports user-initiated appraisals and owner overrides for treasury automation
 * @author NFT Gacha Team
 */
contract NFTAppraisal is Ownable, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    /// @notice Custom errors for gas efficiency and clarity
    error InvalidFeeToken();
    error InvalidProtocolAddress();
    error InvalidCollection();
    error InvalidTokenId();
    error AppraisalFeeRequired();
    error FeePaymentFailed();
    error AppraisalNotFound();
    error AppraisalAlreadyExists();
    error UnauthorizedOracle();
    error InvalidPrice();
    error NoFeesToWithdraw();
    error InvalidRecipient();
    error OracleAlreadyAuthorized();
    error OracleNotAuthorized();
    error InvalidTreasuryAddress();
    error TreasuryAlreadyWhitelisted();
    error TreasuryNotWhitelisted();

    /// @notice Status of NFT appraisals
    enum AppraisalStatus {
        Pending, // Awaiting external service response
        Completed, // Price set by oracle
        OwnerOverride // Price manually set by owner

    }

    /// @notice Represents an NFT appraisal record
    struct Appraisal {
        address requester; // User who requested appraisal
        uint256 priceUSD; // Appraised price in USD (scaled by 1e18)
        AppraisalStatus status; // Current status
        uint256 timestamp; // When appraisal was requested
        uint256 lastUpdated; // When price was last updated
    }

    /// @notice Configuration variables
    IERC20 public feeToken; // Token used for appraisal fees
    uint256 public appraisalFee; // Fee amount for appraisal requests
    address public protocolAddress; // Address receiving protocol fees

    /// @notice Oracle management
    mapping(address => bool) public authorizedOracles; // Approved external oracles
    address[] public oracleList; // List of all oracles

    /// @notice Treasury management for automatic migration
    mapping(address => bool) public whitelistedTreasuries; // Treasuries that trigger auto-migration
    address[] public treasuryList; // List of all whitelisted treasuries

    /// @notice Appraisal storage
    /// @dev collection => tokenId => Appraisal
    mapping(address => mapping(uint256 => Appraisal)) public appraisals;

    /// @notice Events for external service integration and monitoring
    event AppraisalRequested(
        address indexed collection, uint256 indexed tokenId, address indexed requester, uint256 fee, uint256 timestamp
    );

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

    event OracleAuthorized(address indexed oracle);
    event OracleRevoked(address indexed oracle);
    event AppraisalFeeUpdated(uint256 oldFee, uint256 newFee);
    
    event TreasuryWhitelisted(address indexed treasury);
    event TreasuryUnwhitelisted(address indexed treasury);
    event AutoMigrationTriggered(address indexed treasury, address indexed collection, uint256 indexed tokenId);
    event FeeTokenUpdated(address oldToken, address newToken);
    event ProtocolAddressUpdated(address oldAddress, address newAddress);

    /// @notice Enhanced events for better UX
    event AppraisalStatusChanged(
        address indexed collection,
        uint256 indexed tokenId,
        AppraisalStatus oldStatus,
        AppraisalStatus newStatus,
        uint256 timestamp
    );

    /// @notice Restricts access to authorized oracles
    modifier onlyAuthorizedOracle() {
        if (!authorizedOracles[msg.sender]) revert UnauthorizedOracle();
        _;
    }

    /**
     * @notice Initializes the NFT appraisal contract
     * @param _owner Address that will own the contract
     * @param _feeToken Token used for appraisal fees
     * @param _appraisalFee Fee amount for each appraisal request
     * @param _protocolAddress Address to receive protocol fees
     */
    constructor(address _owner, address _feeToken, uint256 _appraisalFee, address _protocolAddress) Ownable(_owner) {
        if (_feeToken == address(0)) revert InvalidFeeToken();
        if (_protocolAddress == address(0)) revert InvalidProtocolAddress();

        feeToken = IERC20(_feeToken);
        appraisalFee = _appraisalFee;
        protocolAddress = _protocolAddress;
    }

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

        // Check if appraisal already exists
        if (appraisals[collection][tokenId].timestamp != 0) {
            revert AppraisalAlreadyExists();
        }

        // Collect appraisal fee
        if (appraisalFee > 0) {
            feeToken.safeTransferFrom(msg.sender, protocolAddress, appraisalFee);
        }

        // Create appraisal record
        appraisals[collection][tokenId] = Appraisal({
            requester: msg.sender,
            priceUSD: 0,
            status: AppraisalStatus.Pending,
            timestamp: block.timestamp,
            lastUpdated: 0
        });

        emit AppraisalRequested(collection, tokenId, msg.sender, appraisalFee, block.timestamp);
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

            // Check if appraisal already exists
            if (appraisals[collection][tokenId].timestamp != 0) {
                revert AppraisalAlreadyExists();
            }

            // Create appraisal record
            appraisals[collection][tokenId] = Appraisal({
                requester: msg.sender,
                priceUSD: 0,
                status: AppraisalStatus.Pending,
                timestamp: block.timestamp,
                lastUpdated: 0
            });

            // Emit events for external service integration
            emit AppraisalRequested(collection, tokenId, msg.sender, appraisalFee, block.timestamp);
            emit AppraisalStatusChanged(
                collection, tokenId, AppraisalStatus.Pending, AppraisalStatus.Pending, block.timestamp
            );
        }
    }

    /**
     * @notice Oracle sets the appraised price for an NFT
     * @param collection NFT collection address
     * @param tokenId Token ID that was appraised
     * @param priceUSD Appraised price in USD (scaled by 1e18)
     */
    function setAppraisedPrice(address collection, uint256 tokenId, uint256 priceUSD)
        external
        onlyAuthorizedOracle
        whenNotPaused
    {
        Appraisal storage appraisal = appraisals[collection][tokenId];
        if (appraisal.timestamp == 0) revert AppraisalNotFound();
        if (priceUSD == 0) revert InvalidPrice();

        uint256 oldPrice = appraisal.priceUSD;
        appraisal.priceUSD = priceUSD;
        appraisal.status = AppraisalStatus.Completed;
        appraisal.lastUpdated = block.timestamp;

        emit AppraisalCompleted(collection, tokenId, priceUSD, msg.sender, block.timestamp);
        emit AppraisalStatusChanged(
            collection, tokenId, AppraisalStatus.Pending, AppraisalStatus.Completed, block.timestamp
        );

        if (oldPrice != priceUSD) {
            emit PriceUpdated(collection, tokenId, oldPrice, priceUSD);
            
            // Trigger automatic migration if NFT is in a whitelisted treasury
            _triggerAutoMigration(collection, tokenId);
        }
    }

    /**
     * @notice Owner can override any appraisal price
     * @param collection NFT collection address
     * @param tokenId Token ID to override
     * @param priceUSD New price in USD (scaled by 1e18)
     * @dev Creates appraisal record if it doesn't exist
     */
    function overrideAppraisal(address collection, uint256 tokenId, uint256 priceUSD)
        external
        onlyOwner
        whenNotPaused
    {
        if (collection == address(0)) revert InvalidCollection();
        if (priceUSD == 0) revert InvalidPrice();

        Appraisal storage appraisal = appraisals[collection][tokenId];
        uint256 oldPrice = appraisal.priceUSD;
        AppraisalStatus oldStatus = appraisal.status;

        // Create appraisal if it doesn't exist
        if (appraisal.timestamp == 0) {
            appraisal.requester = msg.sender;
            appraisal.timestamp = block.timestamp;
            oldStatus = AppraisalStatus.Pending;
        }

        appraisal.priceUSD = priceUSD;
        appraisal.status = AppraisalStatus.OwnerOverride;
        appraisal.lastUpdated = block.timestamp;

        emit AppraisalOverridden(collection, tokenId, oldPrice, priceUSD, msg.sender);
        emit AppraisalStatusChanged(collection, tokenId, oldStatus, AppraisalStatus.OwnerOverride, block.timestamp);

        if (oldPrice != priceUSD) {
            emit PriceUpdated(collection, tokenId, oldPrice, priceUSD);
            
            // Trigger automatic migration if NFT is in a whitelisted treasury
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
        Appraisal memory appraisal = appraisals[collection][tokenId];
        return (appraisal.priceUSD, appraisal.status);
    }

    /**
     * @notice Gets full appraisal details
     * @param collection NFT collection address
     * @param tokenId Token ID to query
     * @return appraisal Complete appraisal record
     */
    function getAppraisal(address collection, uint256 tokenId) external view returns (Appraisal memory appraisal) {
        return appraisals[collection][tokenId];
    }

    /**
     * @notice Checks if an NFT has a completed appraisal
     * @param collection NFT collection address
     * @param tokenId Token ID to check
     * @return True if NFT has been appraised with a price > 0
     */
    function hasAppraisal(address collection, uint256 tokenId) external view returns (bool) {
        Appraisal memory appraisal = appraisals[collection][tokenId];
        return appraisal.priceUSD > 0
            && (appraisal.status == AppraisalStatus.Completed || appraisal.status == AppraisalStatus.OwnerOverride);
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
            Appraisal memory appraisal = appraisals[collections[i]][tokenIds[i]];
            prices[i] = appraisal.priceUSD;
            statuses[i] = appraisal.status;
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
            Appraisal memory appraisal = appraisals[collections[i]][tokenIds[i]];
            hasAppraisals[i] = appraisal.priceUSD > 0
                && (appraisal.status == AppraisalStatus.Completed || appraisal.status == AppraisalStatus.OwnerOverride);
        }
    }

    // ============ ORACLE MANAGEMENT ============

    /**
     * @notice Authorizes an oracle to set appraisal prices
     * @param oracle Address to authorize as oracle
     */
    function authorizeOracle(address oracle) external onlyOwner {
        if (oracle == address(0)) revert UnauthorizedOracle();
        if (authorizedOracles[oracle]) revert OracleAlreadyAuthorized();

        authorizedOracles[oracle] = true;
        oracleList.push(oracle);

        emit OracleAuthorized(oracle);
    }

    /**
     * @notice Revokes oracle authorization
     * @param oracle Address to revoke authorization from
     */
    function revokeOracle(address oracle) external onlyOwner {
        if (!authorizedOracles[oracle]) revert OracleNotAuthorized();

        authorizedOracles[oracle] = false;

        // Remove from oracle list
        for (uint256 i = 0; i < oracleList.length; i++) {
            if (oracleList[i] == oracle) {
                oracleList[i] = oracleList[oracleList.length - 1];
                oracleList.pop();
                break;
            }
        }

        emit OracleRevoked(oracle);
    }

    /**
     * @notice Gets all authorized oracles
     * @return oracles Array of authorized oracle addresses
     */
    function getAuthorizedOracles() external view returns (address[] memory oracles) {
        return oracleList;
    }

    /**
     * @notice Checks if an address is an authorized oracle
     * @param oracle Address to check
     * @return isAuthorized True if address is authorized oracle
     */
    function isAuthorizedOracle(address oracle) external view returns (bool isAuthorized) {
        return authorizedOracles[oracle];
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
            (bool success,) = nftOwner.call(
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
}
