// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {ReentrancyGuardTransient} from "@openzeppelin/contracts/utils/ReentrancyGuardTransient.sol";

/**
 * @title RarityTracker
 * @notice Upgradeable tracker that maintains appraisal-weighted deposit state across a rarity → card → depositor tree.
 */
contract RarityTracker is Initializable, OwnableUpgradeable, PausableUpgradeable, ReentrancyGuardTransient, UUPSUpgradeable {
  /// @notice Emitted when an NFT win is recorded for analytics.
  event NftWon(address indexed winner, uint256 indexed tokenId, uint256 totalWins);
  /// @notice Emitted when rewards are recorded for a user.
  event RewardClaimed(address indexed user, uint256 amount);
  /// @notice Emitted when tracker metadata is updated.
  event TrackerUpdated(string indexed key, uint256 value);
  /// @notice Emitted when a depositor position is updated for a card.
  event DepositorPositionUpdated(address indexed depositor, bytes32 indexed cardId, uint256 count, uint256 valueUSD);
  /// @notice Emitted when aggregate card metrics change.
  event CardAggregationUpdated(bytes32 indexed cardId, uint256 totalCount, uint256 totalValueUSD);
  /// @notice Emitted when a card's appraisal changes.
  event CardAppraisalUpdated(bytes32 indexed cardId, uint256 previousAppraisalUSD, uint256 newAppraisalUSD, int256 rarityDeltaUSD);

  struct DepositorPosition {
    uint256 count;
  }

  struct CardNode {
    uint256 appraisalUSD;
    uint256 totalCount;
    uint256 totalValueUSD;
    address[] depositors;
    mapping(address => DepositorPosition) positions;
    mapping(address => uint256) depositorIndex; // 1-based index into depositors array
  }

  string public rarityName;
  uint256 public totalWins;
  uint256 public totalRewards;
  uint256 public totalNftsWon;

  /// @notice Total NFT deposit count tracked for this rarity.
  uint256 public totalDepositedCount;
  /// @notice Total appraised USD value (1e18 precision) tracked for this rarity.
  uint256 public totalAppraisedValueUSD;

  mapping(address => uint256) public userWins;
  mapping(address => uint256) public userRewards;
  mapping(address => bool) public hasWon;

  mapping(address => uint256) public depositorTotalsUSD;

  mapping(bytes32 => CardNode) private cardNodes;
  bytes32[] private trackedCardIds;
  mapping(bytes32 => uint256) private cardIndex; // 1-based index into trackedCardIds

  constructor() {
    _disableInitializers();
  }

  /**
   * @notice Initializes the rarity tracker.
   * @param owner_ Contract owner address
   * @param rarityName_ Display name for this rarity tier
   */
  function initialize(address owner_, string memory rarityName_) external initializer {
    require(owner_ != address(0), "RarityTracker: owner is zero");

    __Ownable_init(owner_);
    __Pausable_init();

    rarityName = rarityName_;
  }

  /**
   * @notice Records an NFT win for this rarity tier.
   */
  function recordWin(address winner, uint256 tokenId) external onlyOwner {
    require(winner != address(0), "RarityTracker: winner is zero");

    totalWins++;
    totalNftsWon++;
    userWins[winner]++;
    hasWon[winner] = true;

    emit NftWon(winner, tokenId, totalWins);
  }

  /**
   * @notice Records rewards distributed to a user.
   */
  function recordReward(address user, uint256 amount) external onlyOwner {
    require(user != address(0), "RarityTracker: user is zero");
    require(amount > 0, "RarityTracker: amount is zero");

    totalRewards += amount;
    userRewards[user] += amount;

    emit RewardClaimed(user, amount);
  }

  /**
   * @notice Registers newly deposited NFTs for a card.
   * @param cardId Logical identifier for the card grouping (bytes32 hash)
   * @param depositor Depositor address
   * @param appraisalUSD Appraisal value for the card in 1e18 USD
   * @param count Number of NFTs being deposited
   */
  function registerDeposit(bytes32 cardId, address depositor, uint256 appraisalUSD, uint256 count)
    external
    onlyOwner
    whenNotPaused
    nonReentrant
  {
    require(cardId != bytes32(0), "RarityTracker: cardId is zero");
    require(depositor != address(0), "RarityTracker: depositor is zero");
    require(count > 0, "RarityTracker: count is zero");
    require(appraisalUSD > 0, "RarityTracker: appraisal is zero");
    require(appraisalUSD <= uint256(type(int256).max), "RarityTracker: appraisal overflow");

    CardNode storage card = cardNodes[cardId];
    if (cardIndex[cardId] == 0) {
      _trackCard(cardId, appraisalUSD);
      card.appraisalUSD = appraisalUSD;
    } else {
      require(card.appraisalUSD == appraisalUSD, "RarityTracker: appraisal mismatch");
    }

    DepositorPosition storage position = card.positions[depositor];
    if (position.count == 0) {
      _addCardDepositor(card, depositor);
    }

    position.count += count;

    uint256 deltaValue = appraisalUSD * count;
    card.totalCount += count;
    card.totalValueUSD += deltaValue;
    totalDepositedCount += count;
    totalAppraisedValueUSD += deltaValue;
    depositorTotalsUSD[depositor] += deltaValue;

    emit DepositorPositionUpdated(depositor, cardId, position.count, position.count * appraisalUSD);
    emit CardAggregationUpdated(cardId, card.totalCount, card.totalValueUSD);
  }

  /**
   * @notice Removes NFTs from tracking when withdrawn or won.
   */
  function removeDeposit(bytes32 cardId, address depositor, uint256 count)
    external
    onlyOwner
    whenNotPaused
    nonReentrant
  {
    require(cardIndex[cardId] != 0, "RarityTracker: card not tracked");
    require(depositor != address(0), "RarityTracker: depositor is zero");
    require(count > 0, "RarityTracker: count is zero");

    CardNode storage card = cardNodes[cardId];
    DepositorPosition storage position = card.positions[depositor];
    require(position.count >= count, "RarityTracker: insufficient balance");

    uint256 appraisalUSD = card.appraisalUSD;
    uint256 deltaValue = appraisalUSD * count;

    position.count -= count;
    card.totalCount -= count;
    card.totalValueUSD -= deltaValue;
    totalDepositedCount -= count;
    totalAppraisedValueUSD -= deltaValue;
    depositorTotalsUSD[depositor] -= deltaValue;

    if (position.count == 0) {
      _removeCardDepositor(card, depositor);
      delete card.positions[depositor];
    }

    if (card.totalCount == 0) {
      _untrackCard(cardId, card);
    }

    emit DepositorPositionUpdated(depositor, cardId, position.count, position.count * appraisalUSD);
    emit CardAggregationUpdated(cardId, card.totalCount, card.totalValueUSD);
  }

  /**
   * @notice Updates the appraisal for a tracked card and cascades deltas to depositors.
   * @return rarityDeltaUSD Signed delta applied to the rarity total (positive if value increased)
   */
  function updateCardAppraisal(bytes32 cardId, uint256 newAppraisalUSD)
    external
    onlyOwner
    whenNotPaused
    nonReentrant
    returns (int256 rarityDeltaUSD)
  {
    require(cardIndex[cardId] != 0, "RarityTracker: card not tracked");
    require(newAppraisalUSD > 0, "RarityTracker: appraisal is zero");
    require(newAppraisalUSD <= uint256(type(int256).max), "RarityTracker: appraisal overflow");

    CardNode storage card = cardNodes[cardId];
    uint256 previous = card.appraisalUSD;
    if (newAppraisalUSD == previous) {
      return 0;
    }

    require(card.totalCount <= uint256(type(int256).max), "RarityTracker: count overflow");

    int256 priceDelta = int256(newAppraisalUSD) - int256(previous);
    int256 totalDelta = priceDelta * int256(card.totalCount);

    for (uint256 i; i < card.depositors.length; i++) {
      address depositor = card.depositors[i];
      uint256 depositorCount = card.positions[depositor].count;
      if (depositorCount == 0) continue;

      require(depositorCount <= uint256(type(int256).max), "RarityTracker: depositor count overflow");

      int256 depositorDelta = priceDelta * int256(depositorCount);
      depositorTotalsUSD[depositor] = _applyDelta(depositorTotalsUSD[depositor], depositorDelta);
    }

    card.appraisalUSD = newAppraisalUSD;
    card.totalValueUSD = card.totalCount * newAppraisalUSD;
    totalAppraisedValueUSD = _applyDelta(totalAppraisedValueUSD, totalDelta);

    emit CardAppraisalUpdated(cardId, previous, newAppraisalUSD, totalDelta);
    emit CardAggregationUpdated(cardId, card.totalCount, card.totalValueUSD);

    return totalDelta;
  }

  /**
   * @notice Updates tracker metadata (future proof hook).
   */
  function updateTracker(string memory key, uint256 value) external onlyOwner {
    emit TrackerUpdated(key, value);
  }

  /**
   * @notice Pauses mutation operations.
   */
  function pause() external onlyOwner {
    _pause();
  }

  /**
   * @notice Resumes mutation operations.
   */
  function unpause() external onlyOwner {
    _unpause();
  }

  /**
   * @notice Returns aggregated card data for a tracked card.
   */
  function getCardInfo(bytes32 cardId)
    external
    view
    returns (uint256 appraisalUSD, uint256 totalCount, uint256 totalValueUSD)
  {
    CardNode storage card = cardNodes[cardId];
    return (card.appraisalUSD, card.totalCount, card.totalValueUSD);
  }

  /**
   * @notice Returns depositor counts for a tracked card.
   */
  function getCardDepositors(bytes32 cardId)
    external
    view
    returns (address[] memory depositors, uint256[] memory counts)
  {
    CardNode storage card = cardNodes[cardId];
    uint256 length = card.depositors.length;
    depositors = new address[](length);
    counts = new uint256[](length);

    for (uint256 i; i < length; i++) {
      address depositor = card.depositors[i];
      depositors[i] = depositor;
      counts[i] = card.positions[depositor].count;
    }
  }

  /**
   * @notice Returns the IDs of all tracked cards.
   */
  function getTrackedCards() external view returns (bytes32[] memory) {
    return trackedCardIds;
  }

  /**
   * @notice Gets comprehensive statistics for this rarity tier.
   */
  function getStatistics()
    external
    view
    returns (uint256 totalWins_, uint256 totalRewards_, uint256 totalNftsWon_)
  {
    return (totalWins, totalRewards, totalNftsWon);
  }

  /**
   * @notice Returns the total appraised value (1e18 USD) tracked for a depositor.
   */
  function getDepositorValue(address depositor) external view returns (uint256) {
    return depositorTotalsUSD[depositor];
  }

  
  function _trackCard(bytes32 cardId, uint256 appraisalUSD) private {
    trackedCardIds.push(cardId);
    cardIndex[cardId] = trackedCardIds.length;
    CardNode storage card = cardNodes[cardId];
    card.appraisalUSD = appraisalUSD;
  }

  function _untrackCard(bytes32 cardId, CardNode storage card) private {
    uint256 index = cardIndex[cardId];
    if (index == 0) return;

    uint256 lastIndex = trackedCardIds.length;
    if (index != lastIndex) {
      bytes32 moved = trackedCardIds[lastIndex - 1];
      trackedCardIds[index - 1] = moved;
      cardIndex[moved] = index;
    }

    trackedCardIds.pop();
    delete cardIndex[cardId];
    delete card.appraisalUSD;
    delete card.totalCount;
    delete card.totalValueUSD;
    delete card.depositors;
  }

  function _addCardDepositor(CardNode storage card, address depositor) private {
    card.depositors.push(depositor);
    card.depositorIndex[depositor] = card.depositors.length;
  }

  function _removeCardDepositor(CardNode storage card, address depositor) private {
    uint256 index = card.depositorIndex[depositor];
    if (index == 0) return;

    uint256 lastIndex = card.depositors.length;
    if (index != lastIndex) {
      address moved = card.depositors[lastIndex - 1];
      card.depositors[index - 1] = moved;
      card.depositorIndex[moved] = index;
    }

    card.depositors.pop();
    delete card.depositorIndex[depositor];
  }

  function _applyDelta(uint256 baseValue, int256 delta) private pure returns (uint256) {
    if (delta == 0) return baseValue;
    if (delta > 0) {
      return baseValue + uint256(delta);
    }

    uint256 absDelta = uint256(-delta);
    require(baseValue >= absDelta, "RarityTracker: negative underflow");
    return baseValue - absDelta;
  }

  function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

  uint256[43] private __gap;
}
