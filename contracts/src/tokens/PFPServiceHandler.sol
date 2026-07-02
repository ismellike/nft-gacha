// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {IWavsServiceManager} from "@wavs/eigenlayer/ecdsa/interfaces/IWavsServiceManager.sol";
import {IWavsServiceHandler} from "@wavs/eigenlayer/ecdsa/interfaces/IWavsServiceHandler.sol";
import {GachaPFP} from "./GachaPFP.sol";
import {WavsDrandPayload} from "../interfaces/WavsDrandTypes.sol";

/**
 * @title PFPServiceHandler - WAVS Randomness Integration for GachaPFP
 * @notice Receives signed DRAND randomness envelopes and fulfills PFP rarity.
 * @dev Mirrors GachaServiceHandler: validates the operator signature via the WAVS service manager,
 *      then forwards the randomness to GachaPFP.fulfillRarity. The `triggerId` in the payload is the
 *      PFP tokenId that requested randomness at mint.
 */
contract PFPServiceHandler is IWavsServiceHandler {
    /// @notice WAVS service manager for signature validation
    IWavsServiceManager private immutable _serviceManager;

    /// @notice GachaPFP contract that receives randomness
    GachaPFP private immutable _pfp;

    /// @notice Emitted when a validated randomness envelope is received
    event RandomnessReceived(uint256 indexed tokenId, bytes32 randomness);

    /// @notice Custom errors for validation
    error InvalidServiceManager();
    error InvalidPFPAddress();

    /**
     * @notice Initializes the service handler with the WAVS manager and PFP contract
     * @param serviceManager WAVS service manager for signature validation
     * @param pfpAddress Address of the GachaPFP contract to fulfill rarity for
     */
    constructor(IWavsServiceManager serviceManager, address pfpAddress) {
        if (address(serviceManager) == address(0)) revert InvalidServiceManager();
        if (pfpAddress == address(0)) revert InvalidPFPAddress();

        _serviceManager = serviceManager;
        _pfp = GachaPFP(pfpAddress);
    }

    /**
     * @notice Returns the WAVS service manager address
     */
    function getServiceManager() external view returns (address) {
        return address(_serviceManager);
    }

    /**
     * @notice Returns the GachaPFP contract address
     */
    function getPFP() external view returns (address) {
        return address(_pfp);
    }

    /**
     * @notice Handles signed randomness envelopes from the WAVS service
     * @param envelope The envelope containing the WavsDrandPayload
     * @param signatureData Signature data for envelope validation
     * @dev Only accepts envelopes with valid signatures from the WAVS service
     */
    function handleSignedEnvelope(
        IWavsServiceHandler.Envelope calldata envelope,
        IWavsServiceHandler.SignatureData calldata signatureData
    ) external {
        _serviceManager.validate(envelope, signatureData);

        WavsDrandPayload memory payload = abi.decode(envelope.payload, (WavsDrandPayload));

        emit RandomnessReceived(payload.triggerId, payload.randomness);

        _pfp.fulfillRarity(payload.triggerId, payload.randomness);
    }
}
