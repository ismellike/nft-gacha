// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

/**
 * @title MockNFTAppraisal - Mock contract for testing
 * @notice Simple mock that always returns valid appraisal data
 */
contract MockNFTAppraisal {
    enum AppraisalStatus {
        Pending,
        Completed,
        OwnerOverride
    }

    mapping(address => mapping(uint256 => bytes32)) public tokenCardIds;
    mapping(bytes32 => CardAppraisal) public cardAppraisals;
    mapping(address => mapping(uint256 => AppraisalStatus)) public appraisalStatuses;

    function setMockAppraisal(address collection, uint256 tokenId, uint256 priceUSD) external {
        // Generate a cardId based on collection and tokenId (this represents the "card type")
        bytes32 cardId = keccak256(abi.encodePacked(collection, "card", tokenId));
        tokenCardIds[collection][tokenId] = cardId;

        // Only set card appraisal if it doesn't exist yet, ensuring same cardId always has same price
        if (cardAppraisals[cardId].priceUSD == 0) {
            cardAppraisals[cardId] = CardAppraisal({
                priceUSD: priceUSD,
                status: AppraisalStatus.Completed,
                firstTimestamp: block.timestamp,
                lastUpdated: block.timestamp,
                canonicalContractAddress: collection,
                canonicalTokenId: tokenId
            });
        }

        appraisalStatuses[collection][tokenId] = AppraisalStatus.Completed;
    }

    function setMockAppraisalWithCardId(address collection, uint256 tokenId, bytes32 cardId, uint256 priceUSD)
        external
    {
        tokenCardIds[collection][tokenId] = cardId;

        // Only set card appraisal if it doesn't exist, ensuring price consistency
        if (cardAppraisals[cardId].priceUSD == 0) {
            cardAppraisals[cardId] = CardAppraisal({
                priceUSD: priceUSD,
                status: AppraisalStatus.Completed,
                firstTimestamp: block.timestamp,
                lastUpdated: block.timestamp,
                canonicalContractAddress: collection,
                canonicalTokenId: tokenId
            });
        } else {
            // Update existing card appraisal (for testing price updates)
            cardAppraisals[cardId].priceUSD = priceUSD;
            cardAppraisals[cardId].lastUpdated = block.timestamp;
        }

        appraisalStatuses[collection][tokenId] = AppraisalStatus.Completed;
    }

    function getAppraisedPrice(address collection, uint256 tokenId)
        external
        view
        returns (uint256 priceUSD, AppraisalStatus status)
    {
        bytes32 cardId = tokenCardIds[collection][tokenId];
        if (cardId == bytes32(0)) {
            return (0, AppraisalStatus.Pending);
        }

        CardAppraisal storage ca = cardAppraisals[cardId];
        return (ca.priceUSD, ca.status);
    }

    function hasAppraisal(address collection, uint256 tokenId) external view returns (bool) {
        bytes32 cardId = tokenCardIds[collection][tokenId];
        if (cardId == bytes32(0)) {
            return false;
        }

        CardAppraisal storage ca = cardAppraisals[cardId];
        return ca.priceUSD > 0 && (ca.status == AppraisalStatus.Completed || ca.status == AppraisalStatus.OwnerOverride);
    }

    function getTokenCardId(address collection, uint256 tokenId) external view returns (bytes32) {
        return tokenCardIds[collection][tokenId];
    }

    function setTokenCardId(address collection, uint256 tokenId, bytes32 cardId) external {
        tokenCardIds[collection][tokenId] = cardId;
    }

    struct CardAppraisal {
        uint256 priceUSD;
        AppraisalStatus status;
        uint256 firstTimestamp;
        uint256 lastUpdated;
        address canonicalContractAddress;
        uint256 canonicalTokenId;
    }

    function getCardAppraisal(bytes32 cardId) external view returns (CardAppraisal memory) {
        return cardAppraisals[cardId];
    }

    function getCardInstances(bytes32[] calldata cardIds)
        external
        view
        returns (address[] memory collections, uint256[] memory tokenIds)
    {
        uint256 length = cardIds.length;
        collections = new address[](length);
        tokenIds = new uint256[](length);

        for (uint256 i = 0; i < length; i++) {
            bytes32 cardId = cardIds[i];
            CardAppraisal storage cardAppraisal = cardAppraisals[cardId];

            // Return the canonical (first) NFT instance for this card
            if (cardAppraisal.canonicalContractAddress != address(0)) {
                collections[i] = cardAppraisal.canonicalContractAddress;
                tokenIds[i] = cardAppraisal.canonicalTokenId;
            } else {
                // No canonical instance available
                collections[i] = address(0);
                tokenIds[i] = 0;
            }
        }
    }

    function getCardInstance(bytes32 cardId)
        external
        view
        returns (address collection, uint256 tokenId)
    {
        CardAppraisal storage cardAppraisal = cardAppraisals[cardId];

        // Return the canonical (first) NFT instance for this card
        if (cardAppraisal.canonicalContractAddress != address(0)) {
            return (cardAppraisal.canonicalContractAddress, cardAppraisal.canonicalTokenId);
        } else {
            // No canonical instance available
            return (address(0), 0);
        }
    }
}
