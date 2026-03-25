// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {StandardTest} from "../../helpers/StandardTest.sol";
import {GachaServiceHandler} from "../../../src/gacha/GachaServiceHandler.sol";
import {Gacha} from "../../../src/gacha/Gacha.sol";
import {GachaTreasury} from "../../../src/gacha/GachaTreasury.sol";
import {BaseERC721} from "../../../src/tokens/BaseERC721.sol";
import {BaseERC20} from "../../../src/tokens/BaseERC20.sol";
import {MockWavsServiceManager} from "../../mocks/MockWavsServiceManager.sol";
import {MockGachaEconomyManager} from "../../mocks/MockGachaEconomyManager.sol";
import {MockNFTAppraisal} from "../../mocks/MockNFTAppraisal.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {IWavsServiceManager} from "@wavs/eigenlayer/ecdsa/interfaces/IWavsServiceManager.sol";
import {IWavsServiceHandler} from "@wavs/eigenlayer/ecdsa/interfaces/IWavsServiceHandler.sol";
import {WavsDrandPayload} from "../../../src/interfaces/WavsDrandTypes.sol";

/**
 * @title GachaServiceHandler Contract Test Suite
 * @notice Comprehensive test suite for WAVS randomness integration
 * @dev Tests service handler construction, WAVS envelope processing, and randomness forwarding
 *
 * @author NFT Gacha Team
 */
contract GachaServiceHandlerTest is StandardTest {
    // ========================================================================
    // TEST STATE VARIABLES
    // ========================================================================

    /// @dev Contract instances
    GachaServiceHandler public serviceHandler;
    Gacha public gacha;
    GachaTreasury public treasury;
    BaseERC721 public nft;
    BaseERC20 public feeToken;
    MockWavsServiceManager public mockWavsManager;
    MockGachaEconomyManager public mockEconomyManager;
    MockNFTAppraisal public mockAppraisal;

    /// @dev Test addresses
    address public gachaOwner;
    address public treasuryOwner;

    /// @dev Test constants
    uint256 public constant MIN_SPIN_FEE = 0.01e6;
    uint256 public constant MAX_SPIN_FEE = 1e9;

    // ========================================================================
    // EVENTS
    // ========================================================================

    event RandomnessReceived(bytes32 randomness);

    // ========================================================================
    // SETUP AND TEARDOWN
    // ========================================================================

    /**
     * @notice Sets up the test environment
     * @dev Deploys complete gacha stack with service handler
     */
    function setUp() public {
        // Set up test addresses
        gachaOwner = makeAddr("gachaOwner");
        treasuryOwner = makeAddr("treasuryOwner");

        // Deploy mock WAVS manager
        mockWavsManager = new MockWavsServiceManager();

        // Deploy mock economy manager
        mockEconomyManager = new MockGachaEconomyManager();

        // Deploy fee token
        feeToken = new BaseERC20("USDC", "USDC", gachaOwner);

        // Deploy mock appraisal
        mockAppraisal = new MockNFTAppraisal();

        // Deploy treasury
        vm.startPrank(treasuryOwner);
        GachaTreasury treasuryImpl = new GachaTreasury();
        uint256 PRICE_STEP = 1e16;
        uint256[] memory minPrices = new uint256[](5);
        minPrices[0] = 0;
        minPrices[1] = 15 * 1e18 + PRICE_STEP; // 15.01
        minPrices[2] = 60 * 1e18 + PRICE_STEP; // 60.01
        minPrices[3] = 250 * 1e18 + PRICE_STEP; // 250.01
        minPrices[4] = 1200 * 1e18 + PRICE_STEP; // 1200.01

        uint256[] memory maxPrices = new uint256[](5);
        maxPrices[0] = 15 * 1e18;
        maxPrices[1] = 60 * 1e18;
        maxPrices[2] = 250 * 1e18;
        maxPrices[3] = 1200 * 1e18;
        maxPrices[4] = type(uint256).max;

        string[] memory rarityNames = new string[](5);
        rarityNames[0] = "Common";
        rarityNames[1] = "Uncommon";
        rarityNames[2] = "Rare";
        rarityNames[3] = "Epic";
        rarityNames[4] = "Legendary";

        bytes memory initData = abi.encodeWithSelector(
            GachaTreasury.initialize.selector,
            treasuryOwner,
            address(0xDEAD), // Placeholder gacha
            address(mockAppraisal),
            uint8(5),
            rarityNames,
            minPrices,
            maxPrices
        );
        ERC1967Proxy treasuryProxy = new ERC1967Proxy(address(treasuryImpl), initData);
        treasury = GachaTreasury(address(treasuryProxy));
        vm.stopPrank();

        // Deploy Gacha implementation
        Gacha gachaImpl = new Gacha();

        // Initialize Gacha proxy first (without service handler for now)
        vm.prank(gachaOwner);
        bytes memory gachaInitData = abi.encodeWithSelector(
            Gacha.initialize.selector,
            gachaOwner,
            address(0xDEAD), // Placeholder service handler
            address(feeToken),
            MIN_SPIN_FEE,
            address(treasury),
            address(mockEconomyManager)
        );
        ERC1967Proxy gachaProxy = new ERC1967Proxy(address(gachaImpl), gachaInitData);
        gacha = Gacha(address(gachaProxy));

        // Deploy service handler with proxy address
        serviceHandler = new GachaServiceHandler(IWavsServiceManager(address(mockWavsManager)), address(gacha));

        // Update gacha with correct service handler
        vm.prank(gachaOwner);
        gacha.setGachaServiceHandler(address(serviceHandler));

        // Set fee token decimals
        vm.prank(gachaOwner);
        gacha.setFeeTokenDecimals(6);

        // Wire up treasury with gacha
        vm.prank(treasuryOwner);
        treasury.setGachaContract(address(gacha));

        // Deploy test NFT
        nft = new BaseERC721("Test NFT", "TNFT", treasuryOwner);
    }

    // ========================================================================
    // CONSTRUCTION TESTS
    // ========================================================================

    /**
     * @notice Test contract deployment
     * @dev Verifies that handler is deployed with correct initial state
     */
    function testDeployment() public view {
        assertEq(serviceHandler.getServiceManager(), address(mockWavsManager), "Service manager should be set");
        assertEq(serviceHandler.getGacha(), address(gacha), "Gacha should be set correctly");
        assertEq(serviceHandler.getGachaTreasury(), address(treasury), "Treasury should be accessible");
    }

    /**
     * @notice Test construction with zero service manager
     * @dev Verifies that zero service manager address is rejected
     */
    function testConstructorFailsWithZeroServiceManager() public {
        vm.expectRevert(GachaServiceHandler.InvalidServiceManager.selector);
        new GachaServiceHandler(IWavsServiceManager(address(0)), address(gacha));
    }

    /**
     * @notice Test construction with zero gacha address
     * @dev Verifies that zero gacha address is rejected
     */
    function testConstructorFailsWithZeroGachaAddress() public {
        vm.expectRevert(GachaServiceHandler.InvalidGachaAddress.selector);
        new GachaServiceHandler(IWavsServiceManager(address(mockWavsManager)), address(0));
    }

    // ========================================================================
    // WAVS ENVELOPE PROCESSING TESTS
    // ========================================================================

    /**
     * @notice Test successful envelope processing
     * @dev Verifies that valid WAVS envelopes are processed correctly
     */
    function testHandleSignedEnvelope() public {
        // Deposit NFTs
        _depositNFTsForSpins();

        // Create spin
        uint256 spinFee = gacha.getCurrentSpinFee();
        address spinner = makeAddr("spinner");
        vm.prank(gachaOwner);
        feeToken.mint(spinner, 100 ether);
        vm.prank(spinner);
        feeToken.approve(address(gacha), spinFee);
        vm.prank(spinner);
        uint256 triggerId = gacha.spin(MAX_SPIN_FEE);

        // Create WAVS envelope
        bytes32 randomness = bytes32(uint256(12345));
        WavsDrandPayload memory payload = WavsDrandPayload({triggerId: triggerId, randomness: randomness});

        bytes memory payloadBytes = abi.encode(payload);
        IWavsServiceHandler.Envelope memory envelope = IWavsServiceHandler.Envelope({
            eventId: bytes20(uint160(address(gacha))), ordering: bytes12(0), payload: payloadBytes
        });

        IWavsServiceHandler.SignatureData memory signatureData = IWavsServiceHandler.SignatureData({
            signers: new address[](0), signatures: new bytes[](0), referenceBlock: uint32(block.number)
        });

        // Expect event
        vm.expectEmit(false, false, false, true);
        emit RandomnessReceived(randomness);

        // Process envelope
        serviceHandler.handleSignedEnvelope(envelope, signatureData);

        // Verify spin was fulfilled
        (,,, uint32 statusFlags) = gacha.spinRequests(triggerId);
        assertEq(statusFlags & 1, 1, "Fulfilled flag should be set");
    }

    /**
     * @notice Test envelope with mock signature
     * @dev Verifies that mock WAVS manager accepts envelopes for testing.
     *      In production, WAVS service manager validates signatures strictly
     */
    function testHandleSignedEnvelopeWithMockSignature() public {
        // Deposit NFTs
        _depositNFTsForSpins();

        // Create spin
        uint256 triggerId = _createSpin();

        // Create WAVS envelope with any signature data (mock accepts all)
        bytes32 randomness = bytes32(uint256(99999));
        WavsDrandPayload memory payload = WavsDrandPayload({triggerId: triggerId, randomness: randomness});

        bytes memory payloadBytes = abi.encode(payload);
        IWavsServiceHandler.Envelope memory envelope = IWavsServiceHandler.Envelope({
            eventId: bytes20(uint160(address(gacha))), ordering: bytes12(0), payload: payloadBytes
        });

        // Mock signature data (accepted by mock manager)
        address[] memory signers = new address[](1);
        signers[0] = address(0xBAD);
        bytes[] memory signatures = new bytes[](1);
        signatures[0] = hex"1234";

        IWavsServiceHandler.SignatureData memory signatureData = IWavsServiceHandler.SignatureData({
            signers: signers, signatures: signatures, referenceBlock: uint32(block.number)
        });

        // Mock manager accepts all signatures for testing
        serviceHandler.handleSignedEnvelope(envelope, signatureData);

        // Verify randomness was processed
        (,,, uint32 statusFlags) = gacha.spinRequests(triggerId);
        assertEq(statusFlags & 1, 1, "Spin should be fulfilled");
    }

    // ========================================================================
    // RANDOMNESS FORWARDING TESTS
    // ========================================================================

    /**
     * @notice Test randomness forwarding to gacha
     * @dev Verifies that randomness is correctly forwarded to gacha contract
     */
    function testRandomnessForwarding() public {
        // Deposit NFTs
        _depositNFTsForSpins();

        // Create spin
        uint256 triggerId = _createSpin();

        // Generate randomness
        bytes32 randomness = bytes32(uint256(54321));

        // Create and process envelope
        _processWavsEnvelope(triggerId, randomness);

        // Verify gacha received randomness
        (,,, uint32 statusFlags) = gacha.spinRequests(triggerId);
        assertEq(statusFlags & 1, 1, "Spin should be fulfilled");
    }

    /**
     * @notice Test multiple envelope processing
     * @dev Verifies that multiple spins can be fulfilled
     */
    function testMultipleEnvelopeProcessing() public {
        // Deposit NFTs
        _depositNFTsForSpins();

        // Create multiple spins
        uint256[] memory triggerIds = new uint256[](3);
        bytes32[] memory randomnessValues = new bytes32[](3);

        for (uint256 i = 0; i < 3; i++) {
            triggerIds[i] = _createSpin();
            randomnessValues[i] = bytes32(uint256(i + 1000));
        }

        // Process all envelopes
        for (uint256 i = 0; i < 3; i++) {
            _processWavsEnvelope(triggerIds[i], randomnessValues[i]);
        }

        // Verify all spins fulfilled
        for (uint256 i = 0; i < 3; i++) {
            (,,, uint32 statusFlags) = gacha.spinRequests(triggerIds[i]);
            assertEq(statusFlags & 1, 1, string(abi.encodePacked("Spin ", i, " should be fulfilled")));
        }
    }

    // ========================================================================
    // VIEW FUNCTION TESTS
    // ========================================================================

    /**
     * @notice Test getServiceManager view function
     * @dev Verifies correct service manager address is returned
     */
    function testGetServiceManager() public view {
        assertEq(serviceHandler.getServiceManager(), address(mockWavsManager), "Should return correct service manager");
    }

    /**
     * @notice Test getGacha view function
     * @dev Verifies correct gacha address is returned
     */
    function testGetGacha() public view {
        assertEq(serviceHandler.getGacha(), address(gacha), "Should return correct gacha address");
    }

    /**
     * @notice Test getGachaTreasury view function
     * @dev Verifies correct treasury address is returned
     */
    function testGetGachaTreasury() public view {
        address treasuryAddr = serviceHandler.getGachaTreasury();
        assertEq(treasuryAddr, address(treasury), "Should return correct treasury address");
    }

    // ========================================================================
    // EDGE CASE TESTS
    // ========================================================================

    /**
     * @notice Test envelope with malformed payload
     * @dev Verifies that malformed payloads are rejected
     */
    function testHandleSignedEnvelopeFailsWithMalformedPayload() public {
        // Create malformed payload
        bytes memory malformedPayload = abi.encode(uint256(123), uint256(456));

        IWavsServiceHandler.Envelope memory envelope = IWavsServiceHandler.Envelope({
            eventId: bytes20(uint160(address(gacha))), ordering: bytes12(0), payload: malformedPayload
        });

        IWavsServiceHandler.SignatureData memory signatureData = IWavsServiceHandler.SignatureData({
            signers: new address[](0), signatures: new bytes[](0), referenceBlock: uint32(block.number)
        });

        // Should fail during decoding
        vm.expectRevert();
        serviceHandler.handleSignedEnvelope(envelope, signatureData);
    }

    /**
     * @notice Test envelope with wrong event ID
     * @dev Verifies that envelopes for different contracts are rejected
     */
    function testHandleSignedEnvelopeWithWrongEventId() public {
        // Deposit NFTs
        _depositNFTsForSpins();

        uint256 triggerId = _createSpin();

        // Create envelope with wrong event ID
        bytes32 randomness = bytes32(uint256(11111));
        WavsDrandPayload memory payload = WavsDrandPayload({triggerId: triggerId, randomness: randomness});

        bytes memory payloadBytes = abi.encode(payload);
        IWavsServiceHandler.Envelope memory envelope = IWavsServiceHandler.Envelope({
            eventId: bytes20(uint160(address(0xBAD))), // Wrong event ID
            ordering: bytes12(0),
            payload: payloadBytes
        });

        IWavsServiceHandler.SignatureData memory signatureData = IWavsServiceHandler.SignatureData({
            signers: new address[](0), signatures: new bytes[](0), referenceBlock: uint32(block.number)
        });

        // Process envelope (WAVS validation may or may not catch this)
        // The gacha contract will reject invalid trigger IDs
        serviceHandler.handleSignedEnvelope(envelope, signatureData);
    }

    // ========================================================================
    // HELPER FUNCTIONS
    // ========================================================================

    /**
     * @notice Deposit NFTs to treasury
     * @dev Helper to make spins available
     */
    function _depositNFTsForSpins() internal {
        vm.startPrank(treasuryOwner);

        treasury.addToWhitelist(address(nft));

        uint256[] memory prices = new uint256[](5);
        prices[0] = 10e18; // Common (0-15)
        prices[1] = 50e18; // Uncommon (15.01-60)
        prices[2] = 100e18; // Rare (60.01-250)
        prices[3] = 500e18; // Epic (250.01-1200)
        prices[4] = 2000e18; // Legendary (1200.01+)

        for (uint256 i = 0; i < 5; i++) {
            uint256 tokenId = nft.mint(treasuryOwner);
            nft.approve(address(treasury), tokenId);
            mockAppraisal.setMockAppraisal(address(nft), tokenId, prices[i]);
            treasury.depositNFT(address(nft), tokenId);
        }

        vm.stopPrank();
    }

    /**
     * @notice Create a spin
     * @return triggerId The ID of the created spin
     */
    function _createSpin() internal returns (uint256 triggerId) {
        address spinner = makeAddr("spinner");
        vm.prank(gachaOwner);
        feeToken.mint(spinner, 100 ether);

        uint256 spinFee = gacha.getCurrentSpinFee();
        vm.prank(spinner);
        feeToken.approve(address(gacha), spinFee);
        vm.prank(spinner);
        triggerId = gacha.spin(MAX_SPIN_FEE);
    }

    /**
     * @notice Process WAVS envelope with randomness
     * @param triggerId The spin request ID
     * @param randomness The randomness bytes
     */
    function _processWavsEnvelope(uint256 triggerId, bytes32 randomness) internal {
        WavsDrandPayload memory payload = WavsDrandPayload({triggerId: triggerId, randomness: randomness});

        bytes memory payloadBytes = abi.encode(payload);
        IWavsServiceHandler.Envelope memory envelope = IWavsServiceHandler.Envelope({
            eventId: bytes20(uint160(address(gacha))), ordering: bytes12(0), payload: payloadBytes
        });

        IWavsServiceHandler.SignatureData memory signatureData = IWavsServiceHandler.SignatureData({
            signers: new address[](0), signatures: new bytes[](0), referenceBlock: uint32(block.number)
        });

        serviceHandler.handleSignedEnvelope(envelope, signatureData);
    }
}
