// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {NFTAppraisal} from "../appraisal/NFTAppraisal.sol";

/// @notice Minimal read interface for GachaTreasury used by the reader
interface IGachaTreasuryRead {
    struct NFTItem {
        address collection;
        address depositor;
        uint256 tokenId;
        uint256 appraisedPrice;
        uint8 rarity;
        uint256 depositTime;
        uint256 receiveTime;
    }

    struct UserCardDeposit {
        bytes32 cardId;
        uint256 depositCount;
        uint256 totalCardDeposits;
    }

    function getNumRarities() external view returns (uint8);
    function getTreasuryItems(uint8 rarity) external view returns (NFTItem[] memory);
    function getRarityCount(uint8 rarity) external view returns (uint256);
    function getUserDepositCount(address user, uint8 rarity) external view returns (uint256);
    function getUserCardIds(address user, uint256 offset, uint256 limit)
        external
        view
        returns (bytes32[] memory cardIds, uint256 total, bool hasMore);
    function getUserCardIdsLength(address user) external view returns (uint256);
    function userCardDeposits(address user, bytes32 cardId) external view returns (uint256);
    function cardTotalDeposits(bytes32 cardId) external view returns (uint256);
    function userTotalDeposits(address user) external view returns (uint256);
    function userLifetimeClaimed(address user) external view returns (uint256);
    function userLifetimeDeposited(address user) external view returns (uint256);
    function userLifetimeWithdrawn(address user) external view returns (uint256);
    function globalLifetimeDeposited() external view returns (uint256);
    function globalLifetimeClaimed() external view returns (uint256);
    function getWhitelistLength() external view returns (uint256);
    function appraisalContract() external view returns (NFTAppraisal);
}

/// @title GachaTreasuryReader
/// @notice Extracted view functions from GachaTreasury to reduce main contract size
/// @dev Calls GachaTreasury's public getters via STATICCALL
contract GachaTreasuryReader {
    IGachaTreasuryRead public immutable treasury;

    error InvalidLimit();

    constructor(address _treasury) {
        treasury = IGachaTreasuryRead(_treasury);
    }

    function getUserCardDepositsPage(address user, uint256 offset, uint256 limit)
        external
        view
        returns (IGachaTreasuryRead.UserCardDeposit[] memory deposits, uint256 total, bool hasMore)
    {
        if (limit == 0 || limit > 50) revert InvalidLimit();
        if (user == address(0)) {
            return (new IGachaTreasuryRead.UserCardDeposit[](0), 0, false);
        }

        total = treasury.getUserCardIdsLength(user);

        if (offset >= total) {
            return (new IGachaTreasuryRead.UserCardDeposit[](0), total, false);
        }

        uint256 end = offset + limit;
        if (end > total) end = total;

        uint256 resultLength = end - offset;

        // Fetch the card IDs for this page
        (bytes32[] memory cardIds,,) = treasury.getUserCardIds(user, offset, resultLength);

        deposits = new IGachaTreasuryRead.UserCardDeposit[](resultLength);
        for (uint256 i = 0; i < resultLength; i++) {
            bytes32 cardId = cardIds[i];
            deposits[i] = IGachaTreasuryRead.UserCardDeposit({
                cardId: cardId,
                depositCount: treasury.userCardDeposits(user, cardId),
                totalCardDeposits: treasury.cardTotalDeposits(cardId)
            });
        }

        hasMore = end < total;
    }

    function getUserDepositedNFTsPaginated(address user, uint256 offset, uint256 limit)
        external
        view
        returns (IGachaTreasuryRead.NFTItem[] memory items, uint256 total, bool hasMore)
    {
        if (user == address(0) || limit == 0) return (new IGachaTreasuryRead.NFTItem[](0), 0, false);

        uint8 numRarities = treasury.getNumRarities();

        for (uint8 i = 0; i < numRarities; i++) {
            total += treasury.getUserDepositCount(user, i);
        }

        if (total == 0 || offset >= total) return (new IGachaTreasuryRead.NFTItem[](0), total, false);

        uint256 remaining = total - offset;
        uint256 resultLength = remaining < limit ? remaining : limit;
        items = new IGachaTreasuryRead.NFTItem[](resultLength);
        uint256 currentIndex = 0;
        uint256 skipped = 0;

        for (uint8 rarity = 0; rarity < numRarities && currentIndex < resultLength; rarity++) {
            IGachaTreasuryRead.NFTItem[] memory rarityItems = treasury.getTreasuryItems(rarity);
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

    function getUserDepositedNFTsByCardIdPaginated(address user, bytes32 cardId, uint256 offset, uint256 limit)
        external
        view
        returns (IGachaTreasuryRead.NFTItem[] memory items, uint256 total, bool hasMore)
    {
        if (user == address(0) || cardId == bytes32(0) || limit == 0) {
            return (new IGachaTreasuryRead.NFTItem[](0), 0, false);
        }

        NFTAppraisal appraisal = treasury.appraisalContract();
        if (address(appraisal) == address(0)) return (new IGachaTreasuryRead.NFTItem[](0), 0, false);

        uint8 numRarities = treasury.getNumRarities();

        // First pass: count matching items
        for (uint8 rarity = 0; rarity < numRarities; rarity++) {
            IGachaTreasuryRead.NFTItem[] memory rarityItems = treasury.getTreasuryItems(rarity);
            for (uint256 i = 0; i < rarityItems.length; i++) {
                if (rarityItems[i].depositor == user) {
                    bytes32 itemCardId = appraisal.getTokenCardId(rarityItems[i].collection, rarityItems[i].tokenId);
                    if (itemCardId == cardId) total++;
                }
            }
        }

        if (total == 0 || offset >= total) return (new IGachaTreasuryRead.NFTItem[](0), total, false);

        uint256 remaining = total - offset;
        uint256 resultLength = remaining < limit ? remaining : limit;
        items = new IGachaTreasuryRead.NFTItem[](resultLength);
        uint256 currentIndex = 0;
        uint256 skipped = 0;

        for (uint8 rarity = 0; rarity < numRarities && currentIndex < resultLength; rarity++) {
            IGachaTreasuryRead.NFTItem[] memory rarityItems = treasury.getTreasuryItems(rarity);
            for (uint256 i = 0; i < rarityItems.length && currentIndex < resultLength; i++) {
                if (rarityItems[i].depositor == user) {
                    bytes32 itemCardId = appraisal.getTokenCardId(rarityItems[i].collection, rarityItems[i].tokenId);
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

    function getUserDepositedNFTs(address user) external view returns (IGachaTreasuryRead.NFTItem[] memory items) {
        if (user == address(0)) return new IGachaTreasuryRead.NFTItem[](0);

        uint8 numRarities = treasury.getNumRarities();
        uint256 userItemCount = 0;
        for (uint8 i = 0; i < numRarities; i++) {
            userItemCount += treasury.getUserDepositCount(user, i);
        }

        if (userItemCount == 0) return new IGachaTreasuryRead.NFTItem[](0);

        items = new IGachaTreasuryRead.NFTItem[](userItemCount);
        uint256 currentIndex = 0;

        for (uint8 rarity = 0; rarity < numRarities; rarity++) {
            IGachaTreasuryRead.NFTItem[] memory rarityItems = treasury.getTreasuryItems(rarity);
            for (uint256 i = 0; i < rarityItems.length; i++) {
                if (rarityItems[i].depositor == user) {
                    items[currentIndex] = rarityItems[i];
                    currentIndex++;
                }
            }
        }
    }

    function getUserProfileBatch(address user)
        external
        view
        returns (
            uint256[] memory depositCounts,
            uint256 totalDeposits,
            uint256 lifetimeClaimed,
            uint256 lifetimeDeposited,
            uint256 lifetimeWithdrawn,
            uint256 netContribution
        )
    {
        uint8 numRarities = treasury.getNumRarities();
        depositCounts = new uint256[](numRarities);
        if (user == address(0)) {
            return (depositCounts, 0, 0, 0, 0, 0);
        }

        for (uint8 i = 0; i < numRarities; i++) {
            depositCounts[i] = treasury.getUserDepositCount(user, i);
        }

        totalDeposits = treasury.userTotalDeposits(user);
        lifetimeClaimed = treasury.userLifetimeClaimed(user);
        lifetimeDeposited = treasury.userLifetimeDeposited(user);
        lifetimeWithdrawn = treasury.userLifetimeWithdrawn(user);
        netContribution = lifetimeDeposited > lifetimeWithdrawn ? lifetimeDeposited - lifetimeWithdrawn : 0;
    }

    function getPlatformOverviewBatch()
        external
        view
        returns (
            uint256[] memory rarityCounts,
            uint256 totalItems,
            bool gachaAvailable,
            uint256 totalDeposited,
            uint256 totalClaimed
        )
    {
        uint8 numRarities = treasury.getNumRarities();
        rarityCounts = new uint256[](numRarities);
        for (uint8 i = 0; i < numRarities; i++) {
            rarityCounts[i] = treasury.getRarityCount(i);
            totalItems += rarityCounts[i];
        }

        gachaAvailable = treasury.getWhitelistLength() > 0 && totalItems > 0;
        totalDeposited = treasury.globalLifetimeDeposited();
        totalClaimed = treasury.globalLifetimeClaimed();
    }

    function getGlobalStats() external view returns (uint256 totalDeposited, uint256 totalClaimed) {
        totalDeposited = treasury.globalLifetimeDeposited();
        totalClaimed = treasury.globalLifetimeClaimed();
    }
}
