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

    mapping(address => mapping(uint256 => uint256)) public appraisedPrices;
    mapping(address => mapping(uint256 => AppraisalStatus)) public appraisalStatuses;
    mapping(address => mapping(uint256 => bytes32)) public tokenCardIds;

    function setMockAppraisal(address collection, uint256 tokenId, uint256 priceUSD) external {
        appraisedPrices[collection][tokenId] = priceUSD;
        appraisalStatuses[collection][tokenId] = AppraisalStatus.Completed;
        // Generate a simple cardId for the token
        bytes32 cardId = keccak256(abi.encodePacked(collection, priceUSD));
        tokenCardIds[collection][tokenId] = cardId;
    }

    function getAppraisedPrice(address collection, uint256 tokenId)
        external
        view
        returns (uint256 priceUSD, AppraisalStatus status)
    {
        return (appraisedPrices[collection][tokenId], appraisalStatuses[collection][tokenId]);
    }

    function hasAppraisal(address collection, uint256 tokenId) external view returns (bool) {
        return appraisedPrices[collection][tokenId] > 0
            && appraisalStatuses[collection][tokenId] == AppraisalStatus.Completed;
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
        // Find the token that corresponds to this cardId
        // For simplicity, we'll return a basic appraisal
        return CardAppraisal({
            priceUSD: 100000000000000000000, // Default 100 USD
            status: AppraisalStatus.Completed,
            firstTimestamp: 1,
            lastUpdated: 1,
            canonicalContractAddress: address(0),
            canonicalTokenId: 0
        });
    }
}
