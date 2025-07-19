// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {GachaTreasury} from "./GachaTreasury.sol";

/// @title Gacha - NFT Gacha Game Contract
/// @notice Manages gacha spins with weighted rarity system
/// @dev Uses external randomness service for fair distribution
contract Gacha is Ownable, Pausable, ReentrancyGuard {
    // Custom errors for gas efficiency
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

    struct SpinRequest {
        address requester;
        bool fulfilled;
    }

    GachaTreasury public treasury;
    IERC20 public feeToken;
    uint256 public spinFee;
    uint256 private _nextTriggerId;
    address public gachaServiceHandler;

    mapping(uint256 => SpinRequest) public spinRequests;

    // Constants
    uint256 public constant TOTAL_WEIGHT = 10000;

    // Rarity weights for selection (out of 10000 for precision)
    uint256 public commonWeight = 5500; // 55%
    uint256 public uncommonWeight = 2500; // 25%
    uint256 public rareWeight = 1200; // 12%
    uint256 public epicWeight = 600; // 6%
    uint256 public legendaryWeight = 200; // 2%

    event RandomnessRequested(uint256 indexed triggerId);
    event SpinCompleted(
        uint256 indexed triggerId,
        address indexed requester,
        GachaTreasury.Rarity rarity,
        address collection,
        uint256 tokenId
    );
    event SpinRefunded(
        uint256 indexed triggerId, address indexed requester, GachaTreasury.Rarity selectedRarity, uint256 refundAmount
    );
    event FeeUpdated(uint256 oldFee, uint256 newFee);
    event FeeTokenUpdated(address oldToken, address newToken);
    event RarityWeightsUpdated(uint256 common, uint256 uncommon, uint256 rare, uint256 epic, uint256 legendary);
    event GachaServiceHandlerUpdated(address indexed oldHandler, address indexed newHandler);
    event EmergencyPause(address indexed admin);
    event EmergencyUnpause(address indexed admin);

    modifier onlyGachaServiceHandler() {
        require(msg.sender == gachaServiceHandler, "Gacha: Only gacha service handler allowed");
        _;
    }

    constructor(address _owner, address _gachaServiceHandler, address _feeToken, uint256 _spinFee) Ownable(_owner) {
        if (_gachaServiceHandler == address(0)) revert InvalidServiceHandler();
        if (_spinFee > 0 && _feeToken == address(0)) revert InvalidFeeToken();

        gachaServiceHandler = _gachaServiceHandler;
        treasury = new GachaTreasury(_owner, address(this));
        if (_feeToken != address(0)) {
            feeToken = IERC20(_feeToken);
        }
        spinFee = _spinFee;
    }

    /// @notice Initiates a gacha spin
    /// @return triggerId The unique identifier for this spin request
    function spin() external whenNotPaused nonReentrant returns (uint256 triggerId) {
        if (spinFee > 0 && address(feeToken) == address(0)) revert InvalidFeeToken();

        // Check that all rarities with non-zero weights have at least one NFT
        _validateTreasuryHasItems();

        if (spinFee > 0) {
            if (!feeToken.transferFrom(msg.sender, address(this), spinFee)) {
                revert FeePaymentFailed();
            }
        }

        triggerId = _nextTriggerId++;
        spinRequests[triggerId] = SpinRequest({requester: msg.sender, fulfilled: false});

        emit RandomnessRequested(triggerId);
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

        // Select rarity based on randomness
        GachaTreasury.Rarity selectedRarity = _selectRarity(randomness);

        // Check if treasury has NFTs of selected rarity
        uint256 availableCount = treasury.getRarityCount(selectedRarity);

        if (availableCount == 0) {
            // Refund the user if selected rarity is empty
            if (spinFee > 0) {
                if (!feeToken.transfer(request.requester, spinFee)) {
                    revert RefundFailed();
                }
            }
            emit SpinRefunded(triggerId, request.requester, selectedRarity, spinFee);
            return;
        }

        // Select random NFT from the rarity pool
        uint256 selectedIndex = uint256(keccak256(abi.encode(randomness, selectedRarity))) % availableCount;

        // Send NFT from treasury to requester
        GachaTreasury.NFTItem memory selectedNFT =
            treasury.sendNFTToWinner(selectedRarity, selectedIndex, request.requester);

        emit SpinCompleted(triggerId, request.requester, selectedRarity, selectedNFT.collection, selectedNFT.tokenId);
    }

    function _selectRarity(bytes32 randomness) private view returns (GachaTreasury.Rarity) {
        uint256 roll = uint256(randomness) % TOTAL_WEIGHT;

        if (roll < legendaryWeight) {
            return GachaTreasury.Rarity.Legendary;
        } else if (roll < legendaryWeight + epicWeight) {
            return GachaTreasury.Rarity.Epic;
        } else if (roll < legendaryWeight + epicWeight + rareWeight) {
            return GachaTreasury.Rarity.Rare;
        } else if (roll < legendaryWeight + epicWeight + rareWeight + uncommonWeight) {
            return GachaTreasury.Rarity.Uncommon;
        } else {
            return GachaTreasury.Rarity.Common;
        }
    }

    function setSpinFee(uint256 _newFee) external onlyOwner {
        uint256 oldFee = spinFee;
        spinFee = _newFee;
        emit FeeUpdated(oldFee, _newFee);
    }

    function setFeeToken(address _newFeeToken) external onlyOwner {
        address oldToken = address(feeToken);
        feeToken = IERC20(_newFeeToken);
        emit FeeTokenUpdated(oldToken, _newFeeToken);
    }

    /// @notice Withdraws collected fees to specified address
    /// @param to Recipient address for fee withdrawal
    function withdrawFees(address to) external onlyOwner {
        if (to == address(0)) revert InvalidRecipient();
        uint256 balance = feeToken.balanceOf(address(this));
        if (balance == 0) revert NoFeesToWithdraw();
        if (!feeToken.transfer(to, balance)) revert FeeWithdrawalFailed();
    }

    function getSpinRequest(uint256 triggerId) external view returns (address requester, bool fulfilled) {
        SpinRequest memory request = spinRequests[triggerId];
        return (request.requester, request.fulfilled);
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

    function getTreasuryAddress() external view returns (address) {
        return address(treasury);
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
}
