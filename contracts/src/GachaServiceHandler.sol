// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {IWavsServiceManager} from "@wavs/eigenlayer/ecdsa/interfaces/IWavsServiceManager.sol";
import {IWavsServiceHandler} from "@wavs/eigenlayer/ecdsa/interfaces/IWavsServiceHandler.sol";
import {Gacha} from "./Gacha.sol";

contract GachaServiceHandler is IWavsServiceHandler {
    IWavsServiceManager private _serviceManager;
    Gacha private _gacha;

    struct WavsDrandPayload {
        uint256 triggerId;
        bytes32 randomness;
    }

    event RandomnessReceived(bytes32 randomness);

    constructor(IWavsServiceManager serviceManager, address gachaAddress) {
        _serviceManager = serviceManager;
        _gacha = Gacha(gachaAddress);
    }

    function getServiceManager() external view returns (address) {
        return address(_serviceManager);
    }

    function getGacha() external view returns (address) {
        return address(_gacha);
    }

    function getGachaTreasury() external view returns (address) {
        return _gacha.getTreasuryAddress();
    }

    function handleSignedEnvelope(
        IWavsServiceHandler.Envelope calldata envelope,
        IWavsServiceHandler.SignatureData calldata signatureData
    ) external {
        _serviceManager.validate(envelope, signatureData);

        WavsDrandPayload memory payload = abi.decode(envelope.payload, (WavsDrandPayload));

        _gacha.fulfillRandomness(payload.triggerId, payload.randomness);
    }
}
