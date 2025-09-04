// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

/// @notice Appraisal request event structure from component
/// @dev Event emitted when an NFT appraisal is requested
event AppraisalRequested(address indexed nftContract, uint256 indexed tokenId);

/// @notice Successful appraisal payload from NFT appraisal component
/// @dev Contains price data for successfully appraised NFTs
struct AppraisalSuccess {
    string chain;
    address contractAddress;
    uint256 tokenId;
    bytes32 groupId;
    uint256 price; // USDC-style 6 decimals
    bytes32 txHash;
}

/// @notice Error appraisal payload from NFT appraisal component
/// @dev Contains error information for failed appraisals
struct AppraisalError {
    address contractAddress;
    uint256 tokenId;
    bytes32 groupId;
    string error;
    bytes32 txHash;
}

/// @notice Events for tracking appraisal operations
event AppraisalSuccessReceived(address indexed contractAddress, uint256 indexed tokenId, uint256 price, bytes32 txHash);

event AppraisalErrorReceived(address indexed contractAddress, uint256 indexed tokenId, string error, bytes32 txHash);
