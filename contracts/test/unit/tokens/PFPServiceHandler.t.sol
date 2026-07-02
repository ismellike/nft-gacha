// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Test} from "forge-std/Test.sol";
import {IWavsServiceHandler} from "@wavs/eigenlayer/ecdsa/interfaces/IWavsServiceHandler.sol";
import {GachaPFP} from "../../../src/tokens/GachaPFP.sol";
import {PFPServiceHandler} from "../../../src/tokens/PFPServiceHandler.sol";
import {WavsDrandPayload} from "../../../src/interfaces/WavsDrandTypes.sol";
import {MockWavsServiceManager} from "../../mocks/MockWavsServiceManager.sol";

/**
 * @title PFPServiceHandler Test Suite
 * @notice Verifies the handler validates envelopes and forwards randomness to GachaPFP.
 */
contract PFPServiceHandlerTest is Test {
    GachaPFP public pfp;
    PFPServiceHandler public handler;
    MockWavsServiceManager public serviceManager;

    address public alice = makeAddr("alice");
    address public owner = makeAddr("owner");

    uint256 constant MINT_PRICE = 0.01 ether;
    uint256 constant MAX_SUPPLY = 100;

    function setUp() public {
        pfp = new GachaPFP(MINT_PRICE, MAX_SUPPLY, owner);
        serviceManager = new MockWavsServiceManager();
        handler = new PFPServiceHandler(serviceManager, address(pfp));

        vm.prank(owner);
        pfp.setServiceHandler(address(handler));
    }

    function _mint() internal returns (uint256 tokenId) {
        vm.deal(alice, 1 ether);
        vm.prank(alice);
        tokenId = pfp.mint{value: MINT_PRICE}();
    }

    function _envelope(uint256 triggerId, bytes32 randomness)
        internal
        view
        returns (IWavsServiceHandler.Envelope memory envelope, IWavsServiceHandler.SignatureData memory sig)
    {
        WavsDrandPayload memory payload = WavsDrandPayload({triggerId: triggerId, randomness: randomness});
        envelope = IWavsServiceHandler.Envelope({
            eventId: bytes20(uint160(address(pfp))), ordering: bytes12(0), payload: abi.encode(payload)
        });
        address[] memory signers = new address[](0);
        bytes[] memory signatures = new bytes[](0);
        sig = IWavsServiceHandler.SignatureData({signers: signers, signatures: signatures, referenceBlock: 0});
    }

    function testConstructorRejectsZeroServiceManager() public {
        vm.expectRevert(PFPServiceHandler.InvalidServiceManager.selector);
        new PFPServiceHandler(MockWavsServiceManager(address(0)), address(pfp));
    }

    function testConstructorRejectsZeroPFP() public {
        vm.expectRevert(PFPServiceHandler.InvalidPFPAddress.selector);
        new PFPServiceHandler(serviceManager, address(0));
    }

    function testGetters() public view {
        assertEq(handler.getServiceManager(), address(serviceManager));
        assertEq(handler.getPFP(), address(pfp));
    }

    function testHandleEnvelopeFulfillsRarity() public {
        uint256 tokenId = _mint();
        (IWavsServiceHandler.Envelope memory envelope, IWavsServiceHandler.SignatureData memory sig) =
            _envelope(tokenId, bytes32(uint256(9950))); // Mythic band

        handler.handleSignedEnvelope(envelope, sig);

        assertTrue(pfp.rarityRevealed(tokenId));
        assertEq(uint8(pfp.tokenRarity(tokenId)), uint8(GachaPFP.Rarity.Mythic));
    }

    function testHandleEnvelopeRevertsOnInvalidSignature() public {
        uint256 tokenId = _mint();
        serviceManager.setShouldRevert(true);
        (IWavsServiceHandler.Envelope memory envelope, IWavsServiceHandler.SignatureData memory sig) =
            _envelope(tokenId, bytes32(uint256(1)));

        vm.expectRevert();
        handler.handleSignedEnvelope(envelope, sig);

        assertFalse(pfp.rarityRevealed(tokenId), "rarity must not be set when validation fails");
    }

    function testUnauthorizedDirectFulfillReverts() public {
        uint256 tokenId = _mint();
        // Only the handler (set as serviceHandler) may fulfill; a raw caller cannot.
        vm.expectRevert(GachaPFP.NotServiceHandler.selector);
        pfp.fulfillRarity(tokenId, bytes32(uint256(1)));
    }
}
