// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {IWavsServiceManager} from "@wavs/eigenlayer/ecdsa/interfaces/IWavsServiceManager.sol";
import {IWavsServiceHandler} from "@wavs/eigenlayer/ecdsa/interfaces/IWavsServiceHandler.sol";
import {NFTAppraisal} from "./NFTAppraisal.sol";

/**
 * @title NFTAppraisalServiceHandler - WAVS Randomness Integration for NFT Appraisal
 * @notice Handles randomness requests and responses from WAVS service for NFT appraisal operations
 * @dev Implements IWavsServiceHandler to receive signed randomness envelopes for appraisal services
 * @author NFT Gacha Team
 */
contract NFTAppraisalServiceHandler is IWavsServiceHandler {
    /// @notice WAVS service manager for signature validation
    IWavsServiceManager private immutable _serviceManager;

    /// @notice NFT Appraisal contract that receives appraisal data
    NFTAppraisal private immutable _appraisalContract;

    /// @notice Payload structure for WAVS-based NFT appraisal data
    struct AppraisalPayload {
        address collection; // NFT collection address
        uint256 tokenId; // Token ID being appraised
        uint256 priceUSD; // Appraised price in USD (scaled by 1e18)
        bytes32 requestId; // Unique identifier for the appraisal request
        uint256 timestamp; // Timestamp of the appraisal
    }

    /// @notice Events for tracking appraisal operations
    event AppraisalDataReceived(
        address indexed collection, uint256 indexed tokenId, uint256 priceUSD, bytes32 requestId, uint256 timestamp
    );

    event AppraisalProcessed(address indexed collection, uint256 indexed tokenId, uint256 priceUSD, bool success, uint256 timestamp);
    
    /// @notice Enhanced events for monitoring
    event ServiceHandlerStatusUpdate(
        string indexed operation,
        bool success,
        string reason,
        uint256 timestamp
    );

    /// @notice Custom errors for validation
    error InvalidServiceManager();
    error InvalidAppraisalContract();
    error InvalidAppraisalData();
    error AppraisalProcessingFailed();

    /**
     * @notice Initializes the service handler with WAVS manager and appraisal contract
     * @param serviceManager WAVS service manager for signature validation
     * @param appraisalContract Address of the NFTAppraisal contract
     */
    constructor(IWavsServiceManager serviceManager, address appraisalContract) {
        if (address(serviceManager) == address(0)) revert InvalidServiceManager();
        if (appraisalContract == address(0)) revert InvalidAppraisalContract();

        _serviceManager = serviceManager;
        _appraisalContract = NFTAppraisal(appraisalContract);
    }

    /**
     * @notice Returns the WAVS service manager address
     * @return Address of the service manager contract
     */
    function getServiceManager() external view returns (address) {
        return address(_serviceManager);
    }

    /**
     * @notice Returns the NFT appraisal contract address
     * @return Address of the NFTAppraisal contract
     */
    function getAppraisalContract() external view returns (address) {
        return address(_appraisalContract);
    }

    /**
     * @notice Handles signed appraisal envelopes from WAVS service
     * @param envelope The envelope containing the appraisal payload
     * @param signatureData Signature data for envelope validation
     * @dev Only accepts envelopes with valid signatures from WAVS service
     */
    function handleSignedEnvelope(
        IWavsServiceHandler.Envelope calldata envelope,
        IWavsServiceHandler.SignatureData calldata signatureData
    ) external {
        // Validate the envelope signature through WAVS service manager
        _serviceManager.validate(envelope, signatureData);

        // Decode the appraisal payload
        AppraisalPayload memory payload = abi.decode(envelope.payload, (AppraisalPayload));

        // Validate appraisal data
        if (payload.collection == address(0)) revert InvalidAppraisalData();
        if (payload.priceUSD == 0) revert InvalidAppraisalData();

        // Emit event for monitoring
        emit AppraisalDataReceived(payload.collection, payload.tokenId, payload.priceUSD, payload.requestId, block.timestamp);

        // Set the appraised price in the NFTAppraisal contract
        bool success = _processAppraisal(payload);

        emit AppraisalProcessed(payload.collection, payload.tokenId, payload.priceUSD, success, block.timestamp);

        if (!success) {
            emit ServiceHandlerStatusUpdate("processAppraisal", false, "Failed to process appraisal", block.timestamp);
            revert AppraisalProcessingFailed();
        } else {
            emit ServiceHandlerStatusUpdate("processAppraisal", true, "Successfully processed appraisal", block.timestamp);
        }
    }

    /**
     * @dev Internal function to process the appraisal by calling the NFTAppraisal contract
     * @param payload The appraisal data payload
     * @return success True if the appraisal was successfully processed
     */
    function _processAppraisal(AppraisalPayload memory payload) internal returns (bool success) {
        try _appraisalContract.setAppraisedPrice(payload.collection, payload.tokenId, payload.priceUSD) {
            return true;
        } catch {
            return false;
        }
    }

    /**
     * @notice Emergency function to verify if an appraisal exists
     * @param collection NFT collection address
     * @param tokenId Token ID to check
     * @return exists True if the appraisal exists in the contract
     * @return priceUSD Current appraised price
     */
    function checkAppraisal(address collection, uint256 tokenId)
        external
        view
        returns (bool exists, uint256 priceUSD)
    {
        NFTAppraisal.AppraisalStatus status;
        (priceUSD, status) = _appraisalContract.getAppraisedPrice(collection, tokenId);
        exists = priceUSD > 0
            && (status == NFTAppraisal.AppraisalStatus.Completed || status == NFTAppraisal.AppraisalStatus.OwnerOverride);
    }
}
