// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {IWavsServiceManager} from "@wavs/eigenlayer/ecdsa/interfaces/IWavsServiceManager.sol";
import {IWavsServiceHandler} from "@wavs/eigenlayer/ecdsa/interfaces/IWavsServiceHandler.sol";
import {NFTAppraisal} from "./NFTAppraisal.sol";
import {
    AppraisalSuccess,
    AppraisalError,
    AppraisalSuccessReceived,
    AppraisalErrorReceived
} from "./interfaces/NFTAppraisalTypes.sol";

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

    /// @notice Events for tracking appraisal operations
    event AppraisalProcessed(
        address indexed collection, uint256 indexed tokenId, uint256 priceUSD, bool success, uint256 timestamp
    );

    /// @notice Enhanced events for monitoring
    event ServiceHandlerStatusUpdate(string indexed operation, bool success, string reason, uint256 timestamp);

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

        // Try to decode as AppraisalSuccess first
        (bool isSuccess, bool success) = _tryProcessSuccess(envelope.payload);

        if (isSuccess) {
            if (!success) {
                emit ServiceHandlerStatusUpdate(
                    "processAppraisal", false, "Failed to process successful appraisal", block.timestamp
                );
                revert AppraisalProcessingFailed();
            }
            emit ServiceHandlerStatusUpdate(
                "processAppraisal", true, "Successfully processed appraisal", block.timestamp
            );
            return;
        }

        // If not success payload, try to decode as AppraisalError
        _processError(envelope.payload);
    }

    /**
     * @dev Internal function to try processing a successful appraisal payload
     * @param payload The encoded payload to decode and process
     * @return isSuccess True if payload was successfully decoded as AppraisalSuccess
     * @return processed True if the appraisal was successfully processed
     */
    function _tryProcessSuccess(bytes calldata payload) internal returns (bool isSuccess, bool processed) {
        try this._decodeSuccess(payload) returns (AppraisalSuccess memory successPayload) {
            // Validate appraisal data
            if (successPayload.contractAddress == address(0)) return (true, false);
            if (successPayload.price == 0) return (true, false);

            // Emit event for monitoring
            emit AppraisalSuccessReceived(
                successPayload.chain,
                successPayload.contractAddress,
                successPayload.tokenId,
                successPayload.price,
                successPayload.txHash
            );

            // Convert USDC 6-decimal price to 18-decimal for contract
            uint256 priceUSD18 = successPayload.price * 1e12;

            // Set the appraised price in the NFTAppraisal contract
            try _appraisalContract.setAppraisedPrice(successPayload.contractAddress, successPayload.tokenId, priceUSD18)
            {
                emit AppraisalProcessed(
                    successPayload.contractAddress, successPayload.tokenId, priceUSD18, true, block.timestamp
                );
                return (true, true);
            } catch {
                emit AppraisalProcessed(
                    successPayload.contractAddress, successPayload.tokenId, priceUSD18, false, block.timestamp
                );
                return (true, false);
            }
        } catch {
            return (false, false);
        }
    }

    /**
     * @dev Internal function to process an error appraisal payload
     * @param payload The encoded error payload to decode and emit
     */
    function _processError(bytes calldata payload) internal {
        try this._decodeError(payload) returns (AppraisalError memory errorPayload) {
            // Emit error event for monitoring
            emit AppraisalErrorReceived(
                errorPayload.chain,
                errorPayload.contractAddress,
                errorPayload.tokenId,
                errorPayload.error,
                errorPayload.txHash
            );

            emit ServiceHandlerStatusUpdate(
                "processAppraisal",
                false,
                string(abi.encodePacked("Appraisal error: ", errorPayload.error)),
                block.timestamp
            );
        } catch {
            emit ServiceHandlerStatusUpdate(
                "processAppraisal", false, "Failed to decode appraisal payload as success or error", block.timestamp
            );
            revert InvalidAppraisalData();
        }
    }

    /**
     * @dev External function for safe ABI decoding of success payload
     * @param payload The encoded success payload
     * @return The decoded AppraisalSuccess struct
     */
    function _decodeSuccess(bytes calldata payload) external pure returns (AppraisalSuccess memory) {
        return abi.decode(payload, (AppraisalSuccess));
    }

    /**
     * @dev External function for safe ABI decoding of error payload
     * @param payload The encoded error payload
     * @return The decoded AppraisalError struct
     */
    function _decodeError(bytes calldata payload) external pure returns (AppraisalError memory) {
        return abi.decode(payload, (AppraisalError));
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
