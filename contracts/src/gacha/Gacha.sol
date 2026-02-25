// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {IERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import {ReentrancyGuardTransient} from "@openzeppelin/contracts/utils/ReentrancyGuardTransient.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";
import {GachaTreasury} from "./GachaTreasury.sol";
import {IGachaEconomyManager} from "../interfaces/IGachaEconomyManager.sol";
import {RandomnessRequested} from "../interfaces/WavsDrandTypes.sol";
import {IGacha} from "../interfaces/IGacha.sol";

/**
 * @title Gacha - Upgradeable NFT Gacha Game Contract with Price-Based Treasury
 * @notice Manages gacha spins with weighted rarity system using provably fair randomness
 * @dev Uses external WAVS randomness service for fair distribution with price-based treasury
 * @dev This contract is upgradeable using UUPS proxy pattern
 * @author NFT Gacha Team
 */
contract Gacha is
    Initializable,
    OwnableUpgradeable,
    PausableUpgradeable,
    ReentrancyGuardTransient,
    UUPSUpgradeable,
    IGacha
{
    using SafeERC20 for IERC20;

    /// @notice Custom errors for gas efficiency and clarity
    error InvalidFeeToken();
    error InvalidServiceHandler();
    error InvalidTriggerId();
    error AlreadyFulfilled();
    error InvalidRecipient();
    error WeightsMustSumToTotal();
    error NoNFTsAvailable(GachaTreasury.Rarity rarity);
    error UnauthorizedServiceHandler();
    error InvalidTreasuryContract();
    error InvalidEconomyManager();
    error CannotReclaimFulfilledSpin();
    error NotSpinRequester();
    error SpinRequestNotExpired();
    error SpinAlreadyReclaimed();
    error InvalidPricingConfig();
    error NoTreasuryInventory();
    error InvalidFeeTokenDecimals();
    error MaxFeeExceeded(uint256 currentFee, uint256 maxFee);
    error InvalidSpinTimeout();

    /// @notice Represents a spin request with requester and fulfillment status
    struct SpinRequest {
        uint256 feePaid; // Fee amount paid at time of spin (in fee tokens)
        uint256 requestTime; // Timestamp when the spin was requested (for timeout)
        address requester; // Address that initiated the spin
        uint32 statusFlags; // Packed flags: bit 0 = fulfilled, bit 1 = reclaimed, bits 2-31 unused
    }

    /// @notice Core contract interfaces and addresses
    GachaTreasury public treasury;
    IERC20 public feeToken;
    IGachaEconomyManager public economyManager;
    address public gachaServiceHandler;

    /// @notice Internal state
    uint256 private _nextTriggerId;
    mapping(uint256 => SpinRequest) public spinRequests;
    mapping(address => uint256) public userSpinCount;
    mapping(address => mapping(GachaTreasury.Rarity => uint256)) public userRarityWins;
    mapping(address => uint256) public userRefundCount;
    mapping(address => uint256) public userReclaimCount;
    uint256 public totalSpinCount;
    uint256 public totalRefundCount;
    uint256 public totalReclaimCount;
    mapping(GachaTreasury.Rarity => uint256) public globalRarityWins;

    /// @notice Timeout for spin requests (configurable)
    uint256 public spinTimeout;

    /// @notice Total weight constant for rarity calculations (basis points)
    uint256 public constant TOTAL_WEIGHT = 10_000;

    /// @notice Dynamic pricing and weights configuration
    uint8 public feeTokenDecimals;
    uint256 public feeTokenScalar;
    uint256 public pricingPremiumBps;
    uint256 public minSpinFee;
    uint256 public maxSpinFee;
    uint256[5] public targetRarityBps;

    event SpinCompleted(
        uint256 indexed triggerId,
        address indexed requester,
        GachaTreasury.Rarity rarity,
        address collection,
        uint256 tokenId,
        uint256 appraisedPrice
    );

    event SpinRefunded(
        uint256 indexed triggerId, address indexed requester, GachaTreasury.Rarity selectedRarity, uint256 refundAmount
    );

    event SpinReclaimed(uint256 indexed triggerId, address indexed requester, uint256 refundAmount);

    event PricingConfigUpdated(uint256 premiumBps, uint256 minFee, uint256 maxFee);
    event DynamicWeightsUpdated(uint256[5] targetBps);
    event FeeTokenDecimalsUpdated(uint8 previousDecimals, uint8 newDecimals);

    event GachaServiceHandlerUpdated(address indexed oldHandler, address indexed newHandler);
    event EmergencyPause(address indexed admin);
    event EmergencyUnpause(address indexed admin);
    event SpinRevenueForwarded(uint256 amount);
    event EconomyManagerUpdated(address indexed oldManager, address indexed newManager);
    event SpinTimeoutUpdated(uint256 oldTimeout, uint256 newTimeout);

    /// @notice Enhanced events for better UX tracking
    event SpinStatusUpdate(uint256 indexed triggerId, address indexed requester, string status, uint256 timestamp);

    /// @notice Restricts access to the authorized gacha service handler
    modifier onlyGachaServiceHandler() {
        _onlyGachaServiceHandler();
        _;
    }

    function _onlyGachaServiceHandler() internal view {
        if (msg.sender != gachaServiceHandler) revert UnauthorizedServiceHandler();
    }

    /**
     * @notice Initializes the Gacha contract with required dependencies
     * @param _gachaServiceHandler Address of the randomness service handler
     * @param _feeToken Token used for spin fees (must be non-zero)
     * @param _minSpinFee Minimum amount of tokens required per spin
     * @param _treasury Address of the NFT treasury contract
     * @param _economyManager Address of the economy manager contract
     */
    function initialize(
        address _owner,
        address _gachaServiceHandler,
        address _feeToken,
        uint256 _minSpinFee,
        address _treasury,
        address _economyManager
    ) public initializer {
        __Ownable_init(_owner);
        __Pausable_init();
        // ReentrancyGuardTransient doesn't need initialization

        // Validate critical addresses
        if (_gachaServiceHandler == address(0)) revert InvalidServiceHandler();
        if (_treasury == address(0)) revert InvalidTreasuryContract();
        if (_economyManager == address(0)) revert InvalidEconomyManager();

        // Validate fee configuration (no free spins)
        if (_minSpinFee == 0 || _feeToken == address(0)) revert InvalidFeeToken();

        // Set initial values
        treasury = GachaTreasury(_treasury);
        gachaServiceHandler = _gachaServiceHandler;
        feeToken = IERC20(_feeToken);
        economyManager = IGachaEconomyManager(_economyManager);
        feeTokenDecimals = IERC20Metadata(_feeToken).decimals();
        if (feeTokenDecimals > 18) revert InvalidFeeTokenDecimals();
        feeTokenScalar = 10 ** uint256(feeTokenDecimals);

        // Initialize trigger ID to start from 1 instead of 0
        _nextTriggerId = 1;
        spinTimeout = 300; // 5 minutes

        pricingPremiumBps = 500; // 5% premium over EV
        minSpinFee = _minSpinFee;
        maxSpinFee = 0;
        targetRarityBps[0] = 7_000;
        targetRarityBps[1] = 2_000;
        targetRarityBps[2] = 600;
        targetRarityBps[3] = 300;
        targetRarityBps[4] = 100;
    }

    /**
     * @notice Authorizes upgrade to new implementation
     * @dev Only owner can upgrade the contract
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    /// @notice Initiates a gacha spin with a max fee guard
    /// @param maxFee Maximum fee the caller is willing to pay
    /// @return triggerId The unique identifier for this spin request
    function spin(uint256 maxFee) external whenNotPaused nonReentrant returns (uint256 triggerId) {
        uint256 feeToCharge = _getSpinFeeToCharge();
        if (feeToCharge > maxFee) revert MaxFeeExceeded(feeToCharge, maxFee);

        // Check that all rarities with non-zero weights have at least one NFT
        _validateTreasuryHasItems();

        if (feeToCharge > 0) {
            feeToken.safeTransferFrom(msg.sender, address(this), feeToCharge);
        }

        triggerId = _nextTriggerId++;
        spinRequests[triggerId] = SpinRequest({
            feePaid: feeToCharge,
            requestTime: block.timestamp,
            requester: msg.sender,
            statusFlags: 0 // Both fulfilled and reclaimed flags start as false
        });

        emit RandomnessRequested(triggerId);
        emit SpinStatusUpdate(triggerId, msg.sender, "requested", block.timestamp);
        return triggerId;
    }

    /// @notice Initiates a gacha spin using permit for gasless approval
    /// @param deadline The deadline for the permit signature
    /// @param v The recovery id of the signature
    /// @param r Half of the ECDSA signature pair
    /// @param s Half of the ECDSA signature pair
    /// @return triggerId The unique identifier for this spin request
    function spinWithPermit(uint256 deadline, uint8 v, bytes32 r, bytes32 s, uint256 maxFee)
        external
        whenNotPaused
        nonReentrant
        returns (uint256 triggerId)
    {
        uint256 feeToCharge = _getSpinFeeToCharge();
        if (feeToCharge > maxFee) revert MaxFeeExceeded(feeToCharge, maxFee);

        // Check that all rarities with non-zero weights have at least one NFT
        _validateTreasuryHasItems();

        if (feeToCharge > 0) {
            // Use permit to approve the fee transfer (permit maxFee, transfer feeToCharge)
            IERC20Permit(address(feeToken)).permit(msg.sender, address(this), maxFee, deadline, v, r, s);
            feeToken.safeTransferFrom(msg.sender, address(this), feeToCharge);
        }

        triggerId = _nextTriggerId++;
        spinRequests[triggerId] = SpinRequest({
            feePaid: feeToCharge,
            requestTime: block.timestamp,
            requester: msg.sender,
            statusFlags: 0 // Both fulfilled and reclaimed flags start as false
        });

        emit RandomnessRequested(triggerId);
        emit SpinStatusUpdate(triggerId, msg.sender, "requested", block.timestamp);
        return triggerId;
    }

    /// @dev Validates that treasury has NFTs for all weighted rarities
    function _validateTreasuryHasItems() private view {
        uint256[5] memory counts = treasury.getAllRarityCounts();
        uint256 totalCount;
        for (uint256 i = 0; i < 5; i++) {
            totalCount += counts[i];
        }
        if (totalCount == 0) revert NoTreasuryInventory();

        uint256[5] memory weights = _getCurrentRarityWeights(counts, totalCount);
        if (weights[0] > 0 && counts[0] == 0) {
            revert NoNFTsAvailable(GachaTreasury.Rarity.Common);
        }
        if (weights[1] > 0 && counts[1] == 0) {
            revert NoNFTsAvailable(GachaTreasury.Rarity.Uncommon);
        }
        if (weights[2] > 0 && counts[2] == 0) {
            revert NoNFTsAvailable(GachaTreasury.Rarity.Rare);
        }
        if (weights[3] > 0 && counts[3] == 0) {
            revert NoNFTsAvailable(GachaTreasury.Rarity.Epic);
        }
        if (weights[4] > 0 && counts[4] == 0) {
            revert NoNFTsAvailable(GachaTreasury.Rarity.Legendary);
        }
    }

    /// @notice Fulfills a spin request with randomness
    /// @param triggerId The spin request identifier
    /// @param randomness Random bytes for selection
    function fulfillRandomness(uint256 triggerId, bytes32 randomness) external onlyGachaServiceHandler nonReentrant {
        SpinRequest storage request = spinRequests[triggerId];
        if (request.requester == address(0)) revert InvalidTriggerId();
        (bool isFulfilled, bool isReclaimed) = _getSpinRequestStatus(request);
        if (isFulfilled) {
            if (isReclaimed) {
                revert SpinAlreadyReclaimed();
            } else {
                revert AlreadyFulfilled();
            }
        }

        request.statusFlags = _setFulfilled(request.statusFlags);

        // Increment spin counters
        userSpinCount[request.requester]++;
        totalSpinCount++;

        // Select rarity based on randomness using cached counts
        uint256[5] memory counts = treasury.getAllRarityCounts();
        uint256 totalCount;
        for (uint256 i = 0; i < 5; i++) {
            totalCount += counts[i];
        }
        GachaTreasury.Rarity selectedRarity = _selectRarity(randomness, counts, totalCount);

        // Check if treasury has NFTs of selected rarity
        uint256 availableCount = counts[uint256(selectedRarity)];

        if (availableCount == 0) {
            // Track refund statistics
            userRefundCount[request.requester]++;
            totalRefundCount++;

            // Refund the user if selected rarity is empty
            if (request.feePaid > 0) {
                feeToken.safeTransfer(request.requester, request.feePaid);
            }
            emit SpinRefunded(triggerId, request.requester, selectedRarity, request.feePaid);
            emit SpinStatusUpdate(triggerId, request.requester, "refunded", block.timestamp);
            return;
        }

        // Distribute rewards from spin fee
        if (request.feePaid > 0) {
            _distributeSpinRewards(selectedRarity, request.feePaid);
        }

        // Send NFT from treasury to requester using optimized random selection
        GachaTreasury.NFTItem memory selectedNFT =
            treasury.sendRandomNFTToWinner(selectedRarity, uint256(randomness), request.requester);

        // Track win statistics
        userRarityWins[request.requester][selectedRarity]++;
        globalRarityWins[selectedRarity]++;

        emit SpinCompleted(
            triggerId,
            request.requester,
            selectedRarity,
            selectedNFT.collection,
            selectedNFT.tokenId,
            selectedNFT.appraisedPrice // Include appraised price in event
        );
        emit SpinStatusUpdate(triggerId, request.requester, "completed", block.timestamp);
    }

    function _selectRarity(bytes32 randomness, uint256[5] memory counts, uint256 totalCount) private view returns (GachaTreasury.Rarity) {
        uint256[5] memory weights = _getCurrentRarityWeights(counts, totalCount);
        uint256 roll = uint256(randomness) % TOTAL_WEIGHT;

        // Select rarity from most common to rarest (cumulative probabilities)
        if (roll < weights[0]) {
            return GachaTreasury.Rarity.Common;
        } else if (roll < weights[0] + weights[1]) {
            return GachaTreasury.Rarity.Uncommon;
        } else if (roll < weights[0] + weights[1] + weights[2]) {
            return GachaTreasury.Rarity.Rare;
        } else if (roll < weights[0] + weights[1] + weights[2] + weights[3]) {
            return GachaTreasury.Rarity.Epic;
        } else {
            return GachaTreasury.Rarity.Legendary;
        }
    }

    function setFeeTokenDecimals(uint8 decimals) external onlyOwner {
        if (address(feeToken) == address(0)) revert InvalidFeeToken();
        if (decimals > 18) revert InvalidFeeTokenDecimals();
        uint8 previous = feeTokenDecimals;
        feeTokenDecimals = decimals;
        feeTokenScalar = 10 ** uint256(decimals);
        emit FeeTokenDecimalsUpdated(previous, decimals);
    }

    function getSpinRequest(uint256 triggerId)
        external
        view
        returns (address requester, bool fulfilled, bool reclaimed, uint256 feePaid, uint256 requestTime)
    {
        SpinRequest memory request = spinRequests[triggerId];
        (bool isFulfilled, bool isReclaimed) = _getSpinRequestStatus(request);
        return (request.requester, isFulfilled, isReclaimed, request.feePaid, request.requestTime);
    }

    /// @notice Gets the current next trigger ID that will be used for the next spin
    /// @return nextId The next trigger ID
    function getNextTriggerId() external view returns (uint256 nextId) {
        return _nextTriggerId;
    }

    /// @notice Batch function to get multiple spin requests
    /// @param triggerIds Array of trigger IDs to query
    /// @return requests Array of spin requests
    function getBatchSpinRequests(uint256[] calldata triggerIds)
        external
        view
        returns (SpinRequest[] memory requests)
    {
        requests = new SpinRequest[](triggerIds.length);
        for (uint256 i = 0; i < triggerIds.length; i++) {
            requests[i] = spinRequests[triggerIds[i]];
        }
    }

    function setPricingConfig(uint256 premiumBps, uint256 minFee, uint256 maxFee) external onlyOwner {
        if (premiumBps > TOTAL_WEIGHT) revert InvalidPricingConfig();
        if (address(feeToken) == address(0)) revert InvalidFeeToken();
        if (feeTokenScalar == 0) revert InvalidFeeTokenDecimals();
        if (maxFee > 0 && minFee > maxFee) revert InvalidPricingConfig();

        pricingPremiumBps = premiumBps;
        minSpinFee = minFee;
        maxSpinFee = maxFee;

        emit PricingConfigUpdated(premiumBps, minFee, maxFee);
    }

    function setDynamicWeightsConfig(uint256[5] calldata targetBps) external onlyOwner {
        uint256 total;
        for (uint256 i = 0; i < 5; i++) {
            total += targetBps[i];
        }
        if (total != TOTAL_WEIGHT) revert WeightsMustSumToTotal();

        for (uint256 i = 0; i < 5; i++) {
            targetRarityBps[i] = targetBps[i];
        }
        emit DynamicWeightsUpdated(targetBps);
    }

    function getCurrentSpinFee() public view returns (uint256 fee) {
        return _getSpinFeeToCharge();
    }

    function getCurrentRarityWeights() public view returns (uint256[5] memory weights) {
        uint256[5] memory counts = treasury.getAllRarityCounts();
        uint256 totalCount;
        for (uint256 i = 0; i < 5; i++) {
            totalCount += counts[i];
        }
        if (totalCount == 0) return weights;
        return _getCurrentRarityWeights(counts, totalCount);
    }

    function getTargetRarityBps() external view returns (uint256[5] memory targetBps) {
        for (uint256 i = 0; i < 5; i++) {
            targetBps[i] = targetRarityBps[i];
        }
    }

    function getExpectedValueUSD() public view returns (uint256 expectedValueUSD) {
        uint256[5] memory counts = treasury.getAllRarityCounts();
        uint256 totalCount;
        for (uint256 i = 0; i < 5; i++) {
            totalCount += counts[i];
        }
        if (totalCount == 0) return 0;

        uint256[5] memory weights = _getCurrentRarityWeights(counts, totalCount);
        uint256[5] memory totals = treasury.getAllRarityTotalValues();

        for (uint256 i = 0; i < 5; i++) {
            if (counts[i] == 0 || weights[i] == 0) continue;
            uint256 averageValue = totals[i] / counts[i];
            expectedValueUSD += Math.mulDiv(weights[i], averageValue, TOTAL_WEIGHT);
        }
    }

    /// @notice Updates the gacha service handler address
    /// @param _gachaServiceHandler New service handler address
    function setGachaServiceHandler(address _gachaServiceHandler) external onlyOwner {
        if (_gachaServiceHandler == address(0)) revert InvalidServiceHandler();
        address oldHandler = gachaServiceHandler;
        gachaServiceHandler = _gachaServiceHandler;
        emit GachaServiceHandlerUpdated(oldHandler, _gachaServiceHandler);
    }

    /// @notice Internal function to distribute spin rewards
    function _distributeSpinRewards(GachaTreasury.Rarity hitRarity, uint256 feeAmount) private {
        if (feeAmount == 0) return;

        IGachaEconomyManager manager = economyManager;
        if (address(manager) == address(0)) revert InvalidEconomyManager();

        feeToken.forceApprove(address(manager), feeAmount);
        manager.onSpinRevenue(feeAmount, hitRarity);

        emit SpinRevenueForwarded(feeAmount);
    }

    function getTreasuryAddress() external view returns (address) {
        return address(treasury);
    }

    /// @notice Gets the total number of spins performed by a specific user
    /// @param user The user address to query
    /// @return spinCount The number of spins performed by the user
    function getUserSpinCount(address user) external view returns (uint256 spinCount) {
        return userSpinCount[user];
    }

    /// @notice Gets comprehensive analytics for a specific user
    /// @param user The user address to query
    /// @return totalSpins Total completed spins
    /// @return totalRefunds Total refunded spins
    /// @return totalReclaims Total reclaimed spins
    /// @return rarityWins Array of wins per rarity [Common, Uncommon, Rare, Epic, Legendary]
    function getUserAnalytics(address user)
        external
        view
        returns (uint256 totalSpins, uint256 totalRefunds, uint256 totalReclaims, uint256[5] memory rarityWins)
    {
        totalSpins = userSpinCount[user];
        totalRefunds = userRefundCount[user];
        totalReclaims = userReclaimCount[user];

        for (uint256 i = 0; i < 5; i++) {
            rarityWins[i] = userRarityWins[user][GachaTreasury.Rarity(i)];
        }
    }

    /// @notice Gets global analytics data
    /// @return totalSpins Total spins across all users
    /// @return totalRefunds Total refunded spins
    /// @return totalReclaims Total reclaimed spins
    /// @return globalRarityWinCounts Array of global wins per rarity
    function getGlobalAnalytics()
        external
        view
        returns (
            uint256 totalSpins,
            uint256 totalRefunds,
            uint256 totalReclaims,
            uint256[5] memory globalRarityWinCounts
        )
    {
        totalSpins = totalSpinCount;
        totalRefunds = totalRefundCount;
        totalReclaims = totalReclaimCount;

        for (uint256 i = 0; i < 5; i++) {
            globalRarityWinCounts[i] = globalRarityWins[GachaTreasury.Rarity(i)];
        }
    }

    /// @notice Gets user's win count for a specific rarity
    /// @param user The user address to query
    /// @param rarity The rarity to check
    /// @return winCount Number of wins for that rarity
    function getUserRarityWinCount(address user, GachaTreasury.Rarity rarity)
        external
        view
        returns (uint256 winCount)
    {
        return userRarityWins[user][rarity];
    }

    /**
     * @notice Allows users to reclaim their fees if randomness fails or times out
     * @param triggerId The trigger ID of the failed spin request
     * @dev Only the original requester can reclaim, and only if not already fulfilled
     * @dev Request must have timed out (spinTimeout duration passed)
     * @dev Marks the request as fulfilled to prevent late fulfillment
     * @dev Intentionally NOT guarded by whenNotPaused — users can always reclaim
     */
    function reclaimFailedSpin(uint256 triggerId) external nonReentrant {
        SpinRequest storage request = spinRequests[triggerId];

        // Validate the request exists and caller is the original requester
        if (request.requester == address(0)) revert InvalidTriggerId();
        if (request.requester != msg.sender) revert NotSpinRequester();
        (bool fulfilled, ) = _getSpinRequestStatus(request);
        if (fulfilled) revert CannotReclaimFulfilledSpin();

        // Check if the request has timed out
        if (block.timestamp <= request.requestTime + spinTimeout) {
            revert SpinRequestNotExpired();
        }

        // Mark as fulfilled and reclaimed to prevent any future fulfillment of this trigger
        request.statusFlags = _setFulfilled(request.statusFlags);
        request.statusFlags = _setReclaimed(request.statusFlags);

        // Track reclaim statistics
        userReclaimCount[request.requester]++;
        totalReclaimCount++;

        // Refund the spin fee if one was paid
        if (request.feePaid > 0) {
            feeToken.safeTransfer(request.requester, request.feePaid);
        }

        emit SpinReclaimed(triggerId, request.requester, request.feePaid);
        emit SpinStatusUpdate(triggerId, request.requester, "reclaimed", block.timestamp);
    }

    // Emergency functions
    function emergencyPause() external onlyOwner {
        _pause();
        emit EmergencyPause(msg.sender);
    }

    function emergencyUnpause() external onlyOwner {
        _unpause();
        emit EmergencyUnpause(msg.sender);
    }

    /// @notice Updates the spin timeout duration
    /// @param _spinTimeout New timeout in seconds (must be between 30 and 3600)
    function setSpinTimeout(uint256 _spinTimeout) external onlyOwner {
        if (_spinTimeout < 30 || _spinTimeout > 3600) revert InvalidSpinTimeout();
        uint256 oldTimeout = spinTimeout;
        spinTimeout = _spinTimeout;
        emit SpinTimeoutUpdated(oldTimeout, _spinTimeout);
    }

    /// @notice Update rewards manager address (for testing/emergency purposes)
    /// @dev Only owner can call this function
    function setEconomyManager(address _economyManager) external onlyOwner {
        if (_economyManager == address(0)) revert InvalidEconomyManager();
        address oldManager = address(economyManager);
        economyManager = IGachaEconomyManager(_economyManager);
        emit EconomyManagerUpdated(oldManager, _economyManager);
    }

    // ============ PRICE-BASED TREASURY INTEGRATION ============

    /**
     * @notice Gets the expected rarity distribution based on current treasury contents
     * @return distribution Array of rarity counts showing current treasury distribution
     */
    function getTreasuryDistribution() external view returns (uint256[5] memory distribution) {
        return treasury.getAllRarityCounts();
    }

    /**
     * @notice Gets the expected value (in USD) for each rarity tier based on current treasury
     * @return averageValues Array of average USD values per rarity [Common, Uncommon, Rare, Epic, Legendary]
     */
    function getAverageRarityValues() external view returns (uint256[5] memory averageValues) {
        uint256[5] memory counts = treasury.getAllRarityCounts();
        uint256[5] memory totals = treasury.getAllRarityTotalValues();
        for (uint256 i = 0; i < 5; i++) {
            if (counts[i] == 0) continue;
            averageValues[i] = totals[i] / counts[i];
        }
    }

    /**
     * @notice Gets the total value locked in the treasury
     * @return totalValueUSD Total USD value of all NFTs in treasury (scaled by 1e18)
     */
    function getTotalValueLocked() external view returns (uint256 totalValueUSD) {
        uint256[5] memory totals = treasury.getAllRarityTotalValues();
        for (uint256 i = 0; i < 5; i++) {
            totalValueUSD += totals[i];
        }
    }

    /// @notice Gets comprehensive gacha configuration in a single call (BATCH FUNCTION)
    /// @return feeTokenAddr Fee token contract address
    /// @return spinFeeAmount Cost to spin in fee token units
    /// @return isPaused Whether the gacha is currently paused
    /// @return rarityWeights Current rarity weights [Common, Uncommon, Rare, Epic, Legendary]
    /// @return totalWeight Sum of all rarity weights
    /// @return isAvailable Whether gacha has NFTs available
    function getGachaConfigBatch()
        external
        view
        returns (
            address feeTokenAddr,
            uint256 spinFeeAmount,
            bool isPaused,
            uint256[5] memory rarityWeights,
            uint256 totalWeight,
            bool isAvailable
        )
    {
        feeTokenAddr = address(feeToken);
        spinFeeAmount = getCurrentSpinFee();
        isPaused = paused();

        // Get current rarity weights (dynamic)
        rarityWeights = getCurrentRarityWeights();
        totalWeight = TOTAL_WEIGHT;

        isAvailable = treasury.isGachaAvailable();
    }

    /// @notice Gets user-specific gacha data in a single call (BATCH FUNCTION)
    /// @param user User address to get data for
    /// @return totalSpins Total spins by user
    /// @return totalRefunds Total refunds for user
    /// @return totalReclaims Total reclaims for user
    /// @return rarityWins Wins per rarity [Common, Uncommon, Rare, Epic, Legendary]
    /// @return spinCount Total spin count (same as totalSpins, for compatibility)
    function getUserGachaBatch(address user)
        external
        view
        returns (
            uint256 totalSpins,
            uint256 totalRefunds,
            uint256 totalReclaims,
            uint256[5] memory rarityWins,
            uint256 spinCount
        )
    {
        // Get user analytics inline
        totalSpins = userSpinCount[user];
        totalRefunds = userRefundCount[user];
        totalReclaims = userReclaimCount[user];

        // Get rarity wins
        for (uint256 i = 0; i < 5; i++) {
            rarityWins[i] = userRarityWins[user][GachaTreasury.Rarity(i)];
        }

        spinCount = totalSpins; // Same value for compatibility
    }

    function _getSpinFeeToCharge() private view returns (uint256 fee) {
        if (address(feeToken) == address(0)) revert InvalidFeeToken();

        uint256 expectedValueUSD = getExpectedValueUSD();
        if (expectedValueUSD == 0) return minSpinFee;

        uint256 priceUSD = Math.mulDiv(expectedValueUSD, TOTAL_WEIGHT + pricingPremiumBps, TOTAL_WEIGHT);
        uint256 converted = _usdToFeeToken(priceUSD);
        if (minSpinFee > 0 && converted < minSpinFee) {
            converted = minSpinFee;
        }
        if (maxSpinFee > 0 && converted > maxSpinFee) {
            converted = maxSpinFee;
        }
        return converted;
    }

    function _usdToFeeToken(uint256 amountUSD) private view returns (uint256) {
        if (feeTokenScalar == 0) return 0;
        return Math.mulDiv(amountUSD, feeTokenScalar, 1e18);
    }

    function _getCurrentRarityWeights(uint256[5] memory counts, uint256 totalCount)
        private
        view
        returns (uint256[5] memory weights)
    {
        uint256[5] memory raw;
        uint256 rawSum;
        for (uint256 i = 0; i < 5; i++) {
            if (counts[i] == 0 || targetRarityBps[i] == 0) continue;
            raw[i] = Math.mulDiv(targetRarityBps[i], totalCount, counts[i]);
            rawSum += raw[i];
        }

        if (rawSum == 0) return weights;

        uint256 assigned;
        for (uint256 i = 0; i < 5; i++) {
            if (raw[i] == 0) continue;
            weights[i] = Math.mulDiv(raw[i], TOTAL_WEIGHT, rawSum);
            assigned += weights[i];
        }

        if (assigned < TOTAL_WEIGHT) {
            // Assign remainder to first non-zero weight to avoid
            // routing probability to an empty rarity pool
            for (uint256 i = 0; i < 5; i++) {
                if (weights[i] > 0) {
                    weights[i] += TOTAL_WEIGHT - assigned;
                    break;
                }
            }
        }
    }

    // ============ SpinRequest Status Helpers ============

    /// @notice Sets the fulfilled flag in statusFlags
    /// @param flags Current statusFlags value
    /// @return newFlags Updated statusFlags with fulfilled flag set
    function _setFulfilled(uint32 flags) private pure returns (uint32 newFlags) {
        return flags | 1; // Set bit 0
    }

    /// @notice Sets the reclaimed flag in statusFlags
    /// @param flags Current statusFlags value
    /// @return newFlags Updated statusFlags with reclaimed flag set
    function _setReclaimed(uint32 flags) private pure returns (uint32 newFlags) {
        return flags | 2; // Set bit 1
    }

    /// @notice Checks if the fulfilled flag is set
    /// @param flags StatusFlags to check
    /// @return isFulfilled True if fulfilled flag is set
    function _isFulfilled(uint32 flags) private pure returns (bool isFulfilled) {
        return (flags & 1) != 0; // Check bit 0
    }

    /// @notice Checks if the reclaimed flag is set
    /// @param flags StatusFlags to check
    /// @return isReclaimed True if reclaimed flag is set
    function _isReclaimed(uint32 flags) private pure returns (bool isReclaimed) {
        return (flags & 2) != 0; // Check bit 1
    }

    /// @notice Gets the status of a spin request
    /// @param request SpinRequest to check
    /// @return fulfilled True if the spin has been completed
    /// @return reclaimed True if the user has reclaimed their fee
    function _getSpinRequestStatus(SpinRequest memory request)
        private pure returns (bool fulfilled, bool reclaimed) {
        fulfilled = _isFulfilled(request.statusFlags);
        reclaimed = _isReclaimed(request.statusFlags);
    }

    /// @notice Custom gap for future storage variables
    uint256[44] private __gap;
}
