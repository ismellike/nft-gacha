// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import {ReentrancyGuardUpgradeable} from "../utils/ReentrancyGuardUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {GachaTreasury} from "./GachaTreasury.sol";
import {IGachaEconomyManager} from "../interfaces/IGachaEconomyManager.sol";
import {RandomnessRequested} from "../interfaces/WavsDrandTypes.sol";

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
    ReentrancyGuardUpgradeable,
    UUPSUpgradeable
{
    using SafeERC20 for IERC20;

    /// @notice Custom errors for gas efficiency and clarity
    error InvalidFeeToken();
    error InvalidServiceHandler();
    error FeePaymentFailed();
    error InvalidTriggerId();
    error AlreadyFulfilled();
    error RefundFailed();
    error InvalidRecipient();
    error NoFeesToWithdraw();
    error FeeWithdrawalFailed();
    error WeightsMustSumToTotal();
    error NoNFTsAvailable(GachaTreasury.Rarity rarity);
    error UnauthorizedServiceHandler();
    error InvalidTreasuryContract();
    error InvalidEconomyManager();
    error CannotReclaimFulfilledSpin();
    error NotSpinRequester();
    error InvalidGachaInitialization();
    error NotGachaInitializing();

    /// @notice Represents a spin request with requester and fulfillment status
    struct SpinRequest {
        address requester; // Address that initiated the spin
        bool fulfilled; // Whether the spin has been completed
    }

    /// @notice Core contract interfaces and addresses
    GachaTreasury public treasury;
    IERC20 public feeToken;
    IGachaEconomyManager public economyManager;
    address public gachaServiceHandler;

    /// @notice Fee configuration
    uint256 public spinFee;

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

    /// @notice Total weight constant for rarity calculations (basis points)
    uint256 public constant TOTAL_WEIGHT = 10_000;

    /// @notice Rarity weights for selection (out of 10,000 for precision)
    uint256 public commonWeight = 7_000; // 70%
    uint256 public uncommonWeight = 2_000; // 20%
    uint256 public rareWeight = 600; // 6%
    uint256 public epicWeight = 300; // 3%
    uint256 public legendaryWeight = 100; // 1%

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

    event FeeUpdated(uint256 oldFee, uint256 newFee);

    event RarityWeightsUpdated(uint256 common, uint256 uncommon, uint256 rare, uint256 epic, uint256 legendary);

    event GachaServiceHandlerUpdated(address indexed oldHandler, address indexed newHandler);
    event EmergencyPause(address indexed admin);
    event EmergencyUnpause(address indexed admin);
    event SpinRevenueForwarded(uint256 amount);
    event EconomyManagerUpdated(address indexed oldManager, address indexed newManager);

    /// @notice Enhanced events for better UX tracking
    event SpinStatusUpdate(uint256 indexed triggerId, address indexed requester, string status, uint256 timestamp);

    /// @notice Restricts access to the authorized gacha service handler
    modifier onlyGachaServiceHandler() {
        if (msg.sender != gachaServiceHandler) revert UnauthorizedServiceHandler();
        _;
    }

    /// @notice Custom gap for future storage variables (50 slots)
    uint256[49] private __gap;

    /**
     * @notice Initializes the Gacha contract with required dependencies
     * @param _gachaServiceHandler Address of the randomness service handler
     * @param _feeToken Token used for spin fees (can be zero address for free spins)
     * @param _spinFee Amount of tokens required per spin
     * @param _treasury Address of the NFT treasury contract
     * @param _economyManager Address of the economy manager contract
     */
    function initialize(
        address, /* _owner */
        address _gachaServiceHandler,
        address _feeToken,
        uint256 _spinFee,
        address _treasury,
        address _economyManager
    ) public initializer {
        __Ownable_init();
        __Pausable_init();
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();

        // Validate critical addresses
        if (_gachaServiceHandler == address(0)) revert InvalidServiceHandler();
        if (_treasury == address(0)) revert InvalidTreasuryContract();
        if (_economyManager == address(0)) revert InvalidEconomyManager();

        // Validate fee configuration (allow zero fee with zero token for free spins)
        if (_spinFee == 0 && _feeToken != address(0)) revert InvalidFeeToken();
        if (_spinFee > 0 && _feeToken == address(0)) revert InvalidFeeToken();

        // Set initial values
        treasury = GachaTreasury(_treasury);
        gachaServiceHandler = _gachaServiceHandler;
        feeToken = IERC20(_feeToken);
        spinFee = _spinFee;
        economyManager = IGachaEconomyManager(_economyManager);

        // Initialize trigger ID to start from 1 instead of 0
        _nextTriggerId = 1;

        // Initialize default rarity weights
        commonWeight = 7_000; // 70%
        uncommonWeight = 2_000; // 20%
        rareWeight = 600; // 6%
        epicWeight = 300; // 3%
        legendaryWeight = 100; // 1%
    }

    /**
     * @notice Authorizes upgrade to new implementation
     * @dev Only owner can upgrade the contract
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    /// @notice Initiates a gacha spin
    /// @return triggerId The unique identifier for this spin request
    function spin() external whenNotPaused nonReentrant returns (uint256 triggerId) {
        if (spinFee > 0 && address(feeToken) == address(0)) revert InvalidFeeToken();

        // Check that all rarities with non-zero weights have at least one NFT
        _validateTreasuryHasItems();

        if (spinFee > 0) {
            feeToken.safeTransferFrom(msg.sender, address(this), spinFee);
        }

        triggerId = _nextTriggerId++;
        spinRequests[triggerId] = SpinRequest({requester: msg.sender, fulfilled: false});

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
    function spinWithPermit(uint256 deadline, uint8 v, bytes32 r, bytes32 s)
        external
        whenNotPaused
        nonReentrant
        returns (uint256 triggerId)
    {
        if (spinFee > 0 && address(feeToken) == address(0)) revert InvalidFeeToken();

        // Check that all rarities with non-zero weights have at least one NFT
        _validateTreasuryHasItems();

        if (spinFee > 0) {
            // Use permit to approve the fee transfer
            IERC20Permit(address(feeToken)).permit(msg.sender, address(this), spinFee, deadline, v, r, s);
            feeToken.safeTransferFrom(msg.sender, address(this), spinFee);
        }

        triggerId = _nextTriggerId++;
        spinRequests[triggerId] = SpinRequest({requester: msg.sender, fulfilled: false});

        emit RandomnessRequested(triggerId);
        emit SpinStatusUpdate(triggerId, msg.sender, "requested", block.timestamp);
        return triggerId;
    }

    /// @dev Validates that treasury has NFTs for all weighted rarities
    function _validateTreasuryHasItems() private view {
        if (commonWeight > 0 && treasury.getRarityCount(GachaTreasury.Rarity.Common) == 0) {
            revert NoNFTsAvailable(GachaTreasury.Rarity.Common);
        }
        if (uncommonWeight > 0 && treasury.getRarityCount(GachaTreasury.Rarity.Uncommon) == 0) {
            revert NoNFTsAvailable(GachaTreasury.Rarity.Uncommon);
        }
        if (rareWeight > 0 && treasury.getRarityCount(GachaTreasury.Rarity.Rare) == 0) {
            revert NoNFTsAvailable(GachaTreasury.Rarity.Rare);
        }
        if (epicWeight > 0 && treasury.getRarityCount(GachaTreasury.Rarity.Epic) == 0) {
            revert NoNFTsAvailable(GachaTreasury.Rarity.Epic);
        }
        if (legendaryWeight > 0 && treasury.getRarityCount(GachaTreasury.Rarity.Legendary) == 0) {
            revert NoNFTsAvailable(GachaTreasury.Rarity.Legendary);
        }
    }

    /// @notice Fulfills a spin request with randomness
    /// @param triggerId The spin request identifier
    /// @param randomness Random bytes for selection
    function fulfillRandomness(uint256 triggerId, bytes32 randomness) external onlyGachaServiceHandler {
        SpinRequest storage request = spinRequests[triggerId];
        if (request.requester == address(0)) revert InvalidTriggerId();
        if (request.fulfilled) revert AlreadyFulfilled();

        request.fulfilled = true;

        // Increment spin counters
        userSpinCount[request.requester]++;
        totalSpinCount++;

        // Select rarity based on randomness
        GachaTreasury.Rarity selectedRarity = _selectRarity(randomness);

        // Check if treasury has NFTs of selected rarity
        uint256 availableCount = treasury.getRarityCount(selectedRarity);

        if (availableCount == 0) {
            // Track refund statistics
            userRefundCount[request.requester]++;
            totalRefundCount++;

            // Refund the user if selected rarity is empty
            if (spinFee > 0) {
                feeToken.safeTransfer(request.requester, spinFee);
            }
            emit SpinRefunded(triggerId, request.requester, selectedRarity, spinFee);
            emit SpinStatusUpdate(triggerId, request.requester, "refunded", block.timestamp);
            return;
        }

        // Random selection now handled by treasury.sendRandomNFTToWinner()

        // Distribute rewards from spin fee
        if (spinFee > 0) {
            _distributeSpinRewards(selectedRarity);
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

    function _selectRarity(bytes32 randomness) private view returns (GachaTreasury.Rarity) {
        uint256 roll = uint256(randomness) % TOTAL_WEIGHT;

        // Select rarity from most common to rarest (cumulative probabilities)
        if (roll < commonWeight) {
            return GachaTreasury.Rarity.Common;
        } else if (roll < commonWeight + uncommonWeight) {
            return GachaTreasury.Rarity.Uncommon;
        } else if (roll < commonWeight + uncommonWeight + rareWeight) {
            return GachaTreasury.Rarity.Rare;
        } else if (roll < commonWeight + uncommonWeight + rareWeight + epicWeight) {
            return GachaTreasury.Rarity.Epic;
        } else {
            return GachaTreasury.Rarity.Legendary;
        }
    }

    /**
     * @notice Updates the spin fee amount
     * @param _newFee New fee amount in tokens
     * @dev Only owner can call this function
     */
    function setSpinFee(uint256 _newFee) external onlyOwner {
        if (_newFee == 0 && address(feeToken) != address(0)) revert InvalidFeeToken();
        uint256 oldFee = spinFee;
        spinFee = _newFee;
        emit FeeUpdated(oldFee, _newFee);
    }

    /// @notice Withdraws collected fees to specified address
    /// @param to Recipient address for fee withdrawal
    function withdrawFees(address to) external onlyOwner {
        if (to == address(0)) revert InvalidRecipient();
        uint256 balance = feeToken.balanceOf(address(this));
        if (balance == 0) revert NoFeesToWithdraw();
        feeToken.safeTransfer(to, balance);
    }

    function getSpinRequest(uint256 triggerId) external view returns (address requester, bool fulfilled) {
        SpinRequest memory request = spinRequests[triggerId];
        return (request.requester, request.fulfilled);
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

    /// @notice Updates rarity weights for gacha distribution
    /// @dev All weights must sum to TOTAL_WEIGHT (10000)
    function setRarityWeights(
        uint256 _commonWeight,
        uint256 _uncommonWeight,
        uint256 _rareWeight,
        uint256 _epicWeight,
        uint256 _legendaryWeight
    ) external onlyOwner {
        if (_commonWeight + _uncommonWeight + _rareWeight + _epicWeight + _legendaryWeight != TOTAL_WEIGHT) {
            revert WeightsMustSumToTotal();
        }

        commonWeight = _commonWeight;
        uncommonWeight = _uncommonWeight;
        rareWeight = _rareWeight;
        epicWeight = _epicWeight;
        legendaryWeight = _legendaryWeight;

        emit RarityWeightsUpdated(_commonWeight, _uncommonWeight, _rareWeight, _epicWeight, _legendaryWeight);
    }

    function getRarityWeights() external view returns (uint256, uint256, uint256, uint256, uint256) {
        return (commonWeight, uncommonWeight, rareWeight, epicWeight, legendaryWeight);
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
    function _distributeSpinRewards(GachaTreasury.Rarity hitRarity) private {
        uint256 totalFeeBalance = feeToken.balanceOf(address(this));
        if (totalFeeBalance == 0) return;

        IGachaEconomyManager manager = economyManager;
        if (address(manager) == address(0)) revert InvalidEconomyManager();

        feeToken.forceApprove(address(manager), totalFeeBalance);
        manager.onSpinRevenue(totalFeeBalance, hitRarity);

        emit SpinRevenueForwarded(totalFeeBalance);
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
     * @dev Marks the request as fulfilled to prevent late fulfillment
     */
    function reclaimFailedSpin(uint256 triggerId) external nonReentrant {
        SpinRequest storage request = spinRequests[triggerId];

        // Validate the request exists and caller is the original requester
        if (request.requester == address(0)) revert InvalidTriggerId();
        if (request.requester != msg.sender) revert NotSpinRequester();
        if (request.fulfilled) revert CannotReclaimFulfilledSpin();

        // Mark as fulfilled to prevent any future fulfillment of this trigger
        request.fulfilled = true;

        // Track reclaim statistics
        userReclaimCount[request.requester]++;
        totalReclaimCount++;

        // Refund the spin fee if one was paid
        if (spinFee > 0) {
            feeToken.safeTransfer(request.requester, spinFee);
        }

        emit SpinReclaimed(triggerId, request.requester, spinFee);
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
        for (uint256 i = 0; i < 5; i++) {
            GachaTreasury.Rarity rarity = GachaTreasury.Rarity(i);
            GachaTreasury.NFTItem[] memory items = treasury.getTreasuryItems(rarity);

            if (items.length == 0) {
                averageValues[i] = 0;
                continue;
            }

            uint256 totalValue = 0;
            for (uint256 j = 0; j < items.length; j++) {
                totalValue += items[j].appraisedPrice;
            }

            averageValues[i] = totalValue / items.length;
        }
    }

    /**
     * @notice Gets the total value locked in the treasury
     * @return totalValueUSD Total USD value of all NFTs in treasury (scaled by 1e18)
     */
    function getTotalValueLocked() external view returns (uint256 totalValueUSD) {
        for (uint256 i = 0; i < 5; i++) {
            GachaTreasury.Rarity rarity = GachaTreasury.Rarity(i);
            GachaTreasury.NFTItem[] memory items = treasury.getTreasuryItems(rarity);

            for (uint256 j = 0; j < items.length; j++) {
                totalValueUSD += items[j].appraisedPrice;
            }
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
        spinFeeAmount = spinFee;
        isPaused = paused();

        // Get rarity weights from storage
        rarityWeights[0] = commonWeight;
        rarityWeights[1] = uncommonWeight;
        rarityWeights[2] = rareWeight;
        rarityWeights[3] = epicWeight;
        rarityWeights[4] = legendaryWeight;
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
}
