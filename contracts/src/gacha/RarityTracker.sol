// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title RarityTracker
 * @notice Tracks statistics and rewards for a specific rarity tier
 * @dev Simple tracker for monitoring NFT wins and rewards distribution per rarity
 */
contract RarityTracker is Ownable {
    // Events
    event NftWon(address indexed winner, uint256 indexed tokenId, uint256 rarity);
    event RewardClaimed(address indexed user, uint256 amount);
    event TrackerUpdated(string indexed key, uint256 value);

    // State variables
    string public rarityName;
    uint256 public totalWins;
    uint256 public totalRewards;
    uint256 public totalNftsWon;

    // Mapping from user to their wins count
    mapping(address => uint256) public userWins;
    // Mapping from user to their rewards claimed
    mapping(address => uint256) public userRewards;
    // Mapping from user to track if they have any wins
    mapping(address => bool) public hasWon;

    constructor(string memory _rarityName, address initialOwner) Ownable(initialOwner) {
        rarityName = _rarityName;
    }

    /**
     * @notice Records an NFT win for this rarity tier
     * @param winner The address of the winner
     * @param tokenId The token ID that was won
     */
    function recordWin(address winner, uint256 tokenId) external onlyOwner {
        require(winner != address(0), "Invalid winner address");

        totalWins++;
        totalNftsWon++;
        userWins[winner]++;
        hasWon[winner] = true;

        emit NftWon(winner, tokenId, totalWins);
    }

    /**
     * @notice Records reward distribution for this rarity tier
     * @param user The address receiving rewards
     * @param amount The amount of rewards
     */
    function recordReward(address user, uint256 amount) external onlyOwner {
        require(user != address(0), "Invalid user address");
        require(amount > 0, "Invalid reward amount");

        totalRewards += amount;
        userRewards[user] += amount;

        emit RewardClaimed(user, amount);
    }

    /**
     * @notice Updates tracker metadata (for future extensibility)
     * @param key The metadata key
     * @param value The metadata value
     */
    function updateTracker(string memory key, uint256 value) external onlyOwner {
        emit TrackerUpdated(key, value);
    }

    /**
     * @notice Gets the win count for a specific user
     * @param user The user address
     * @return The number of wins for the user
     */
    function getUserWins(address user) external view returns (uint256) {
        return userWins[user];
    }

    /**
     * @notice Gets the rewards claimed for a specific user
     * @param user The user address
     * @return The total rewards claimed for the user
     */
    function getUserRewards(address user) external view returns (uint256) {
        return userRewards[user];
    }

    /**
     * @notice Checks if a user has won any NFTs of this rarity
     * @param user The user address
     * @return True if the user has won at least one NFT
     */
    function getHasWon(address user) external view returns (bool) {
        return hasWon[user];
    }

    /**
     * @notice Gets the total number of unique winners
     * @return The count of unique addresses that have won
     */
    function getUniqueWinnersCount() external view returns (uint256) {
        // This is a simplified implementation
        // In production, you'd want to maintain a separate array or more efficient tracking
        return totalWins > 0 ? 1 : 0; // Placeholder
    }

    /**
     * @notice Gets comprehensive statistics for this rarity tier
     * @return totalWins_ Total number of wins
     * @return totalRewards_ Total rewards distributed
     * @return totalNftsWon_ Total NFTs won
     * @return uniqueWinners_ Number of unique winners
     */
    function getStatistics()
        external
        view
        returns (uint256 totalWins_, uint256 totalRewards_, uint256 totalNftsWon_, uint256 uniqueWinners_)
    {
        return (totalWins, totalRewards, totalNftsWon, this.getUniqueWinnersCount());
    }
}
