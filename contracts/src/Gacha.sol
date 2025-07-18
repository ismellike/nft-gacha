// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {GachaTreasury} from "./GachaTreasury.sol";

contract Gacha is Ownable {
    struct SpinRequest {
        address requester;
        bool fulfilled;
    }

    GachaTreasury public treasury;
    IERC20 public feeToken;
    uint256 public spinFee;
    uint256 private _nextTriggerId;

    mapping(uint256 => SpinRequest) public spinRequests;

    // Rarity weights for selection (out of 10000 for precision)
    uint256 public commonWeight = 7000; // 70%
    uint256 public uncommonWeight = 2000; // 20%
    uint256 public rareWeight = 600; // 6%
    uint256 public epicWeight = 300; // 3%
    uint256 public legendaryWeight = 100; // 1%
    uint256 public constant TOTAL_WEIGHT = 10000;

    event RandomnessRequested(uint256 indexed triggerId);
    event SpinCompleted(
        uint256 indexed triggerId,
        address indexed requester,
        GachaTreasury.Rarity rarity,
        address collection,
        uint256 tokenId
    );
    event FeeUpdated(uint256 oldFee, uint256 newFee);
    event FeeTokenUpdated(address oldToken, address newToken);
    event RarityWeightsUpdated(uint256 common, uint256 uncommon, uint256 rare, uint256 epic, uint256 legendary);

    constructor(address _owner, address _treasury, address _feeToken, uint256 _spinFee) Ownable(_owner) {
        treasury = GachaTreasury(_treasury);
        feeToken = IERC20(_feeToken);
        spinFee = _spinFee;
    }

    function spin() external returns (uint256 triggerId) {
        require(spinFee == 0 || address(feeToken) != address(0), "Gacha: Fee token not set");

        if (spinFee > 0) {
            require(feeToken.transferFrom(msg.sender, address(this), spinFee), "Gacha: Fee payment failed");
        }

        triggerId = _nextTriggerId++;
        spinRequests[triggerId] = SpinRequest({requester: msg.sender, fulfilled: false});

        emit RandomnessRequested(triggerId);
        return triggerId;
    }

    function fulfillRandomness(uint256 triggerId, bytes32 randomness) external onlyOwner {
        SpinRequest storage request = spinRequests[triggerId];
        require(request.requester != address(0), "Gacha: Invalid trigger ID");
        require(!request.fulfilled, "Gacha: Already fulfilled");

        request.fulfilled = true;

        // Select rarity based on randomness
        GachaTreasury.Rarity selectedRarity = _selectRarity(randomness);

        // Check if treasury has NFTs of selected rarity
        uint256 availableCount = treasury.getRarityCount(selectedRarity);
        require(availableCount > 0, "Gacha: No NFTs available for selected rarity");

        // Select random NFT from the rarity pool
        uint256 selectedIndex = uint256(keccak256(abi.encode(randomness, selectedRarity))) % availableCount;

        // Send NFT from treasury to requester
        GachaTreasury.NFTItem memory selectedNFT = treasury.sendNFTToWinner(selectedRarity, selectedIndex, request.requester);

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

    function withdrawFees(address to) external onlyOwner {
        require(to != address(0), "Gacha: Invalid recipient");
        uint256 balance = feeToken.balanceOf(address(this));
        require(balance > 0, "Gacha: No fees to withdraw");
        require(feeToken.transfer(to, balance), "Gacha: Fee withdrawal failed");
    }

    function getSpinRequest(uint256 triggerId) external view returns (address requester, bool fulfilled) {
        SpinRequest memory request = spinRequests[triggerId];
        return (request.requester, request.fulfilled);
    }

    function setRarityWeights(
        uint256 _commonWeight,
        uint256 _uncommonWeight,
        uint256 _rareWeight,
        uint256 _epicWeight,
        uint256 _legendaryWeight
    ) external onlyOwner {
        require(
            _commonWeight + _uncommonWeight + _rareWeight + _epicWeight + _legendaryWeight == TOTAL_WEIGHT,
            "Gacha: Weights must sum to TOTAL_WEIGHT"
        );

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

}
