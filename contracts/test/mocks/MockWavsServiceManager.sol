// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {IWavsServiceManager} from "@wavs/eigenlayer/ecdsa/interfaces/IWavsServiceManager.sol";
import {IWavsServiceHandler} from "@wavs/eigenlayer/ecdsa/interfaces/IWavsServiceHandler.sol";

/**
 * @title MockWavsServiceManager
 * @notice Minimal mock for WAVS service manager used in testing
 */
contract MockWavsServiceManager is IWavsServiceManager {
  bool public shouldRevert;
  uint256 private operatorWeight;
  string private serviceURI;

  function setShouldRevert(bool value) external {
    shouldRevert = value;
  }

  function setOperatorWeight(uint256 weight) external {
    operatorWeight = weight;
  }

  function setMockServiceURI(string calldata uri) external {
    serviceURI = uri;
  }

  function validate(
    IWavsServiceHandler.Envelope calldata,
    IWavsServiceHandler.SignatureData calldata
  ) external view override {
    if (shouldRevert) revert InvalidSignature();
  }

  function getOperatorWeight(address) external view override returns (uint256) {
    return operatorWeight;
  }

  function getServiceURI() external view override returns (string memory) {
    return serviceURI;
  }

  function setServiceURI(string calldata uri) external override {
    serviceURI = uri;
    emit ServiceURIUpdated(uri);
  }

  function getLatestOperatorForSigningKey(address) external pure override returns (address) {
    return address(0);
  }

  function getAllocationManager() external pure override returns (address) {
    return address(0);
  }

  function getDelegationManager() external pure override returns (address) {
    return address(0);
  }

  function getStakeRegistry() external pure override returns (address) {
    return address(0);
  }
}
