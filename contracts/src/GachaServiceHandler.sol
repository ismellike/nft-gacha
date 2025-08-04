// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {IWavsServiceManager} from "@wavs/eigenlayer/ecdsa/interfaces/IWavsServiceManager.sol";
import {IWavsServiceHandler} from "@wavs/eigenlayer/ecdsa/interfaces/IWavsServiceHandler.sol";
import {Gacha} from "./Gacha.sol";

/**
 * @title GachaServiceHandler - WAVS Randomness Integration
 * @notice Handles randomness requests and responses from WAVS service
 * @dev Implements IWavsServiceHandler to receive signed randomness envelopes
 * @author NFT Gacha Team
 */
contract GachaServiceHandler is IWavsServiceHandler {
    /// @notice WAVS service manager for signature validation
    IWavsServiceManager private immutable _serviceManager;

    /// @notice Gacha contract that receives randomness
    Gacha private immutable _gacha;

    /// @notice Payload structure for WAVS-DRAND randomness
    struct WavsDrandPayload {
        uint256 triggerId;
        /// @dev Unique identifier for the randomness request
        bytes32 randomness;
    }
    /// @dev Random bytes from DRAND beacon

    /// @notice Events for tracking randomness operations
    event RandomnessReceived(bytes32 randomness);

    /// @notice Custom errors for validation
    error InvalidServiceManager();
    error InvalidGachaAddress();

    /**
     * @notice Initializes the service handler with WAVS manager and gacha contract
     * @param serviceManager WAVS service manager for signature validation
     * @param gachaAddress Address of the gacha contract to fulfill randomness for
     */
    constructor(IWavsServiceManager serviceManager, address gachaAddress) {
        if (address(serviceManager) == address(0)) revert InvalidServiceManager();
        if (gachaAddress == address(0)) revert InvalidGachaAddress();

        _serviceManager = serviceManager;
        _gacha = Gacha(gachaAddress);
    }

    /**
     * @notice Returns the WAVS service manager address
     * @return Address of the service manager contract
     */
    function getServiceManager() external view returns (address) {
        return address(_serviceManager);
    }

    /**
     * @notice Returns the gacha contract address
     * @return Address of the gacha contract
     */
    function getGacha() external view returns (address) {
        return address(_gacha);
    }

    /**
     * @notice Returns the treasury contract address
     * @return Address of the treasury contract
     */
    function getGachaTreasury() external view returns (address) {
        return _gacha.getTreasuryAddress();
    }

    /**
     * @notice Handles signed randomness envelopes from WAVS service
     * @param envelope The envelope containing the randomness payload
     * @param signatureData Signature data for envelope validation
     * @dev Only accepts envelopes with valid signatures from WAVS service
     */
    function handleSignedEnvelope(
        IWavsServiceHandler.Envelope calldata envelope,
        IWavsServiceHandler.SignatureData calldata signatureData
    ) external {
        // Validate the envelope signature through WAVS service manager
        _serviceManager.validate(envelope, signatureData);

        // Decode the randomness payload
        WavsDrandPayload memory payload = abi.decode(envelope.payload, (WavsDrandPayload));

        // Emit event for monitoring
        emit RandomnessReceived(payload.randomness);

        // Forward randomness to gacha contract for fulfillment
        _gacha.fulfillRandomness(payload.triggerId, payload.randomness);
    }
}
