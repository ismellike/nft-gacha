// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {StandardTest} from "../../helpers/StandardTest.sol";
import {NFTAppraisal} from "../../../src/appraisal/NFTAppraisal.sol";
import {NFTAppraisalServiceHandler} from "../../../src/appraisal/NFTAppraisalServiceHandler.sol";
import {BaseERC721} from "../../../src/tokens/BaseERC721.sol";
import {BaseERC20} from "../../../src/tokens/BaseERC20.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {MockWavsServiceManager} from "../../mocks/MockWavsServiceManager.sol";
import {IWavsServiceManager} from "@wavs/eigenlayer/ecdsa/interfaces/IWavsServiceManager.sol";
import {AppraisalSuccess} from "../../../src/interfaces/NFTAppraisalTypes.sol";
import {IWavsServiceHandler} from "@wavs/eigenlayer/ecdsa/interfaces/IWavsServiceHandler.sol";

/**
 * @title NFT Appraisal Contract Test Suite
 * @notice Comprehensive test suite for NFT appraisal functionality
 * @dev Tests all aspects of the NFT appraisal system including fee mechanisms,
 *      price discovery, authorization, WAVS integration, and edge cases
 *
 * Consolidated from:
 * - test/NFTAppraisal.t.sol (24 tests)
 * - test/NFTAppraisalTest.t.sol (11 tests)
 * - test/NFTAppraisalEconomicsTest.t.sol (11 economics tests moved to economics/)
 *
 * @author NFT Gacha Team
 */
contract NFTAppraisalTest is StandardTest {
    // ========================================================================
    // TEST STATE VARIABLES
    // ========================================================================

    /// @dev Contract instances
    NFTAppraisal public appraisal;
    NFTAppraisalServiceHandler public serviceHandler;
    BaseERC721 public nft;
    BaseERC20 public feeToken;
    MockWavsServiceManager public mockWavsManager;

    /// @dev Test addresses specific to this test
    address public protocol;
    address public appraiser; // Service handler operator

    /// @dev Test constants
    uint256 public constant APPRAISAL_FEE = 10e18;
    uint256 public constant NFT_PRICE_100 = 100e18;
    uint256 public constant NFT_PRICE_1000 = 1000e18;
    uint256 public constant UPDATED_FEE = 20e18;

    /// @dev NFT token IDs for testing
    uint256 public constant TOKEN_ID_1 = 1;
    uint256 public constant TOKEN_ID_2 = 2;
    uint256 public constant TOKEN_ID_3 = 3;
    uint256 public constant INVALID_TOKEN_ID = 999;

    /// @dev Card IDs for testing
    bytes32 public constant CARD_ID_1 = keccak256("card-1");
    bytes32 public constant CARD_ID_2 = keccak256("card-2");
    bytes32 public constant CARD_ID_OVERRIDE = keccak256("card-override");

    // ========================================================================
    // EVENTS
    // ========================================================================

    event AppraisalRequested(address indexed nftContract, uint256 indexed tokenId);
    event AppraisalCompleted(
        address indexed collection,
        uint256 indexed tokenId,
        uint256 priceUSD,
        address indexed appraiser,
        uint256 timestamp
    );
    event AppraisalStatusChanged(
        address indexed collection,
        uint256 indexed tokenId,
        NFTAppraisal.AppraisalStatus oldStatus,
        NFTAppraisal.AppraisalStatus newStatus,
        uint256 timestamp
    );
    event AppraisalOverridden(
        address indexed collection,
        uint256 indexed tokenId,
        uint256 oldPriceUSD,
        uint256 newPriceUSD,
        address indexed owner
    );

    // ========================================================================
    // SETUP AND TEARDOWN
    // ========================================================================

    /**
     * @notice Sets up the test environment
     * @dev Deploys contracts, mints test NFTs, and sets up initial state
     */
    function setUp() public {
        // Set up test addresses specific to this test
        protocol = makeAddr("protocol");
        appraiser = makeAddr("appraiser");

        // Deploy mock WAVS manager
        mockWavsManager = new MockWavsServiceManager();

        // Deploy test tokens
        feeToken = new BaseERC20("Fee Token", "FEE", owner);
        nft = new BaseERC721("Test NFT", "TNFT", owner);

        // Deploy NFTAppraisal contract with proxy
        NFTAppraisal appraisalImpl = new NFTAppraisal();
        bytes memory initData =
            abi.encodeWithSelector(NFTAppraisal.initialize.selector, owner, address(feeToken), APPRAISAL_FEE, protocol);
        ERC1967Proxy proxy = new ERC1967Proxy(address(appraisalImpl), initData);
        appraisal = NFTAppraisal(address(proxy));

        // Deploy service handler
        serviceHandler =
            new NFTAppraisalServiceHandler(IWavsServiceManager(address(mockWavsManager)), address(appraisal));

        // Set service handler as the authorized handler for WAVS integration
        vm.prank(owner);
        appraisal.setServiceHandler(address(serviceHandler));

        // Setup initial test state
        vm.prank(owner);
        nft.mint(user);
        vm.prank(owner);
        nft.mint(user);
        vm.prank(owner);
        nft.mint(user);

        // Fund user with fee tokens
        vm.prank(owner);
        feeToken.mint(user, 1000e18);

        // Approve fee tokens
        vm.prank(user);
        feeToken.approve(address(appraisal), type(uint256).max);
    }

    // ========================================================================
    // CORE FUNCTIONALITY TESTS
    // ========================================================================

    /**
     * @notice Test basic appraisal request flow
     * @dev Verifies that users can request appraisals and fees are properly collected
     */
    function testRequestAppraisal() public {
        uint256 protocolBalanceBefore = feeToken.balanceOf(protocol);

        vm.expectEmit(true, true, false, false);
        emit AppraisalRequested(address(nft), TOKEN_ID_1);

        vm.prank(user);
        appraisal.requestAppraisal(address(nft), TOKEN_ID_1);

        // Verify fee collection
        assertEq(
            feeToken.balanceOf(protocol), protocolBalanceBefore + APPRAISAL_FEE, "Protocol should receive appraisal fee"
        );

        // Verify appraisal status
        NFTAppraisal.Appraisal memory appraisalInfo = appraisal.getAppraisal(address(nft), TOKEN_ID_1);
        assertEq(appraisalInfo.requester, user, "Requester should be set correctly");
        assertEq(appraisalInfo.priceUSD, 0, "Initial price should be zero");
        assertEq(
            uint256(appraisalInfo.status), uint256(NFTAppraisal.AppraisalStatus.Pending), "Status should be pending"
        );
        assertGt(appraisalInfo.timestamp, 0, "Timestamp should be set");
        assertEq(appraisalInfo.lastUpdated, 0, "LastUpdated should be zero initially");
    }

    /**
     * @notice Test appraisal completion flow
     * @dev Verifies that authorized handler can complete appraisals with pricing
     */
    function testCompleteAppraisal() public {
        // Request appraisal first
        _requestAppraisal(TOKEN_ID_1);

        // Complete appraisal
        vm.expectEmit(true, true, true, false);
        emit AppraisalCompleted(address(nft), TOKEN_ID_1, NFT_PRICE_100, address(serviceHandler), block.timestamp);

        vm.prank(address(serviceHandler));
        appraisal.setAppraisalForTokenWithCard(address(nft), TOKEN_ID_1, CARD_ID_1, NFT_PRICE_100);

        // Verify completion
        (uint256 price, NFTAppraisal.AppraisalStatus status) = appraisal.getAppraisedPrice(address(nft), TOKEN_ID_1);
        assertEq(price, NFT_PRICE_100, "Price should be set correctly");
        assertEq(uint256(status), uint256(NFTAppraisal.AppraisalStatus.Completed), "Status should be completed");
        assertTrue(appraisal.hasAppraisal(address(nft), TOKEN_ID_1), "Should have completed appraisal");
    }

    /**
     * @notice Test owner override functionality
     * @dev Verifies that owner can override appraisals
     */
    function testOwnerOverrideAppraisal() public {
        // Complete initial appraisal
        _completeAppraisal(0, NFT_PRICE_100);

        uint256 oldPrice = NFT_PRICE_100;
        uint256 newPrice = NFT_PRICE_1000;

        // Get the current card ID for the token
        bytes32 currentCardId = appraisal.getTokenCardId(address(nft), 0);

        vm.expectEmit(true, true, true, true);
        emit AppraisalOverridden(address(nft), 0, oldPrice, newPrice, owner);

        vm.prank(owner);
        appraisal.ownerSetAppraisalForTokenWithCard(address(nft), 0, currentCardId, newPrice);

        // Verify override
        (uint256 price, NFTAppraisal.AppraisalStatus status) = appraisal.getAppraisedPrice(address(nft), 0);
        assertEq(price, newPrice, "Price should be overridden");
        assertEq(
            uint256(status), uint256(NFTAppraisal.AppraisalStatus.OwnerOverride), "Status should be owner override"
        );
    }

    /**
     * @notice Test override then link token flow
     * @dev Verifies that owner can set appraisal before token exists, then link later
     */
    function testOverrideAppraisalThenLinkToken() public {
        uint256 tokenId = 2;
        bytes32 cardId = keccak256(abi.encodePacked("card-new"));

        // Set appraisal directly via owner (no request yet)
        vm.prank(owner);
        appraisal.ownerSetAppraisalForTokenWithCard(address(nft), tokenId, cardId, NFT_PRICE_1000);

        // Should be able to request appraisal again for re-appraisal
        vm.prank(user);
        appraisal.requestAppraisal(address(nft), tokenId);

        vm.prank(address(serviceHandler));
        appraisal.setAppraisalForTokenWithCard(address(nft), tokenId, cardId, NFT_PRICE_1000);

        (uint256 price, NFTAppraisal.AppraisalStatus status) = appraisal.getAppraisedPrice(address(nft), tokenId);
        assertEq(price, NFT_PRICE_1000, "Price should reflect card price");
        assertEq(uint256(status), uint256(NFTAppraisal.AppraisalStatus.Completed), "Should be completed");
        assertTrue(appraisal.hasAppraisal(address(nft), tokenId), "Should have completed appraisal");
    }

    // ========================================================================
    // AUTHORIZATION TESTS
    // ========================================================================

    /**
     * @notice Test unauthorized appraisal completion
     * @dev Verifies that only authorized handler can complete appraisals
     */
    function testUnauthorizedAppraisalCompletion() public {
        _requestAppraisal(TOKEN_ID_2);
        address hacker = makeAddr("hacker");

        vm.expectRevert(NFTAppraisal.UnauthorizedServiceHandler.selector);
        vm.prank(hacker);
        appraisal.setAppraisalForTokenWithCard(address(nft), TOKEN_ID_2, CARD_ID_1, NFT_PRICE_100);
    }

    /**
     * @notice Test owner-only functions
     * @dev Verifies that only owner can call administrative functions
     */
    function testOwnerOnlyFunctions() public {
        address hacker = makeAddr("hacker");

        // Test setServiceHandler
        vm.prank(hacker);
        vm.expectRevert();
        appraisal.setServiceHandler(hacker);

        // Test setAppraisalFee
        vm.prank(hacker);
        vm.expectRevert();
        appraisal.setAppraisalFee(UPDATED_FEE);

        // Test setFeeToken
        vm.prank(hacker);
        vm.expectRevert();
        appraisal.setFeeToken(address(this));

        // Test setProtocolAddress
        vm.prank(hacker);
        vm.expectRevert();
        appraisal.setProtocolAddress(address(this));
    }

    // ========================================================================
    // VALIDATION TESTS
    // ========================================================================

    /**
     * @notice Test invalid collection address
     * @dev Verifies that zero address is rejected for collection
     */
    function testInvalidCollectionAddress() public {
        vm.prank(user);
        vm.expectRevert(NFTAppraisal.InvalidCollection.selector);
        appraisal.requestAppraisal(address(0), TOKEN_ID_1);
    }

    /**
     * @notice Test invalid token ID
     * @dev Verifies that non-existent token ID is rejected
     */
    function testInvalidTokenId() public {
        vm.prank(user);
        vm.expectRevert(NFTAppraisal.InvalidTokenId.selector);
        appraisal.requestAppraisal(address(nft), INVALID_TOKEN_ID);
    }

    /**
     * @notice Test zero price validation
     * @dev Verifies that zero price is rejected
     */
    function testZeroPriceValidation() public {
        _requestAppraisal(TOKEN_ID_1);

        // Verify service handler is set
        assertEq(appraisal.getServiceHandler(), address(serviceHandler), "Service handler should be set");

        // Normal price should work
        vm.prank(address(serviceHandler));
        appraisal.setAppraisalForTokenWithCard(address(nft), TOKEN_ID_1, CARD_ID_1, NFT_PRICE_100);

        // Verify it worked
        (uint256 price,) = appraisal.getAppraisedPrice(address(nft), TOKEN_ID_1);
        assertEq(price, NFT_PRICE_100, "Normal price should work");

        // Request appraisal for different token
        _requestAppraisal(TOKEN_ID_2);

        // Zero price should revert
        vm.expectRevert(NFTAppraisal.InvalidPrice.selector);
        vm.prank(address(serviceHandler));
        appraisal.setAppraisalForTokenWithCard(address(nft), TOKEN_ID_2, CARD_ID_2, 0);
    }

    /**
     * @notice Test appraisal not found error
     * @dev Verifies that completing non-existent appraisal fails
     */
    function testAppraisalNotFound() public {
        vm.prank(address(serviceHandler));
        vm.expectRevert(NFTAppraisal.AppraisalNotFound.selector);
        appraisal.setAppraisalForTokenWithCard(address(nft), TOKEN_ID_1, CARD_ID_1, NFT_PRICE_100);
    }

    // ========================================================================
    // REAPPRAISAL TESTS
    // ========================================================================

    /**
     * @notice Test re-appraisal functionality
     * @dev Verifies that existing appraisals can be updated
     */
    function testReappraisalFunctionality() public {
        // Complete initial appraisal
        _completeAppraisal(TOKEN_ID_1, NFT_PRICE_100);

        // Request re-appraisal
        vm.prank(user);
        appraisal.requestAppraisal(address(nft), TOKEN_ID_1);

        // Complete with new price
        vm.prank(address(serviceHandler));
        appraisal.setAppraisalForTokenWithCard(address(nft), TOKEN_ID_1, CARD_ID_1, NFT_PRICE_1000);

        // Verify updated price
        (uint256 price,) = appraisal.getAppraisedPrice(address(nft), TOKEN_ID_1);
        assertEq(price, NFT_PRICE_1000, "Price should be updated");
    }

    /**
     * @notice Test allows re-appraisals for migration
     * @dev Verifies re-appraisal flow works correctly
     */
    function testRequestAppraisalAllowsReappraisals() public {
        // First appraisal
        _completeAppraisal(TOKEN_ID_1, NFT_PRICE_100);

        // Re-appraisal
        vm.prank(user);
        appraisal.requestAppraisal(address(nft), TOKEN_ID_1);

        // Complete with different price (price update)
        vm.prank(address(serviceHandler));
        appraisal.setAppraisalForTokenWithCard(address(nft), TOKEN_ID_1, CARD_ID_1, NFT_PRICE_1000);

        // Verify final price reflects re-appraisal
        (uint256 price, NFTAppraisal.AppraisalStatus status) = appraisal.getAppraisedPrice(address(nft), TOKEN_ID_1);
        assertEq(price, NFT_PRICE_1000, "Price should reflect re-appraisal");
        assertEq(uint256(status), uint256(NFTAppraisal.AppraisalStatus.Completed), "Should be completed");
    }

    // ========================================================================
    // CONFIGURATION TESTS
    // ========================================================================

    /**
     * @notice Test appraisal fee update
     * @dev Verifies that owner can update appraisal fee
     */
    function testUpdateAppraisalFee() public {
        vm.prank(owner);
        appraisal.setAppraisalFee(UPDATED_FEE);

        assertEq(appraisal.appraisalFee(), UPDATED_FEE, "Fee should be updated");

        // Test new fee is charged
        uint256 protocolBalanceBefore = feeToken.balanceOf(protocol);

        vm.prank(user);
        appraisal.requestAppraisal(address(nft), TOKEN_ID_2);

        assertEq(feeToken.balanceOf(protocol), protocolBalanceBefore + UPDATED_FEE, "New fee should be charged");
    }

    /**
     * @notice Test fee token update
     * @dev Verifies that owner can update fee token
     */
    function testUpdateFeeToken() public {
        BaseERC20 newFeeToken = new BaseERC20("New Fee Token", "NFT", owner);

        vm.prank(owner);
        appraisal.setFeeToken(address(newFeeToken));

        assertEq(address(appraisal.feeToken()), address(newFeeToken), "Fee token should be updated");
    }

    /**
     * @notice Test protocol address update
     * @dev Verifies that owner can update protocol address
     */
    function testUpdateProtocolAddress() public {
        address newProtocol = makeAddr("newProtocol");

        vm.prank(owner);
        appraisal.setProtocolAddress(newProtocol);

        assertEq(appraisal.protocolAddress(), newProtocol, "Protocol address should be updated");
    }

    // ========================================================================
    // EMERGENCY FUNCTIONS TESTS
    // ========================================================================

    /**
     * @notice Test emergency pause functionality
     * @dev Verifies that owner can pause and unpause contract
     */
    function testEmergencyPause() public {
        // Pause contract
        vm.prank(owner);
        appraisal.emergencyPause();

        assertTrue(appraisal.paused(), "Contract should be paused");

        // Should fail to request appraisal when paused
        vm.prank(user);
        vm.expectRevert();
        appraisal.requestAppraisal(address(nft), TOKEN_ID_1);

        // Unpause contract
        vm.prank(owner);
        appraisal.emergencyUnpause();

        assertFalse(appraisal.paused(), "Contract should be unpaused");

        // Should work after unpausing
        vm.prank(user);
        appraisal.requestAppraisal(address(nft), TOKEN_ID_1);
    }

    /**
     * @notice Test emergency unpause
     * @dev Verifies unpause functionality
     */
    function testEmergencyUnpause() public {
        vm.prank(owner);
        appraisal.emergencyPause();

        vm.prank(owner);
        appraisal.emergencyUnpause();

        assertFalse(appraisal.paused(), "Contract should be unpaused");

        // Should be able to request appraisal
        vm.prank(user);
        appraisal.requestAppraisal(address(nft), TOKEN_ID_1);
    }

    // ========================================================================
    // WAVS SERVICE HANDLER INTEGRATION TESTS
    // ========================================================================

    /**
     * @notice Test service handler processes signed envelope
     * @dev Verifies WAVS integration works correctly
     */
    function testServiceHandlerProcessesSignedEnvelope() public {
        // User requests appraisal
        vm.prank(user);
        appraisal.requestAppraisal(address(nft), TOKEN_ID_1);

        AppraisalSuccess memory successPayload = AppraisalSuccess({
            chain: "local",
            contractAddress: address(nft),
            tokenId: TOKEN_ID_1,
            groupId: CARD_ID_1,
            price: 150 * 1e6,
            // forge-lint: disable-next-line(unsafe-typecast)
            txHash: bytes32("tx_hash")
        });

        bytes memory payload = abi.encode(successPayload);

        IWavsServiceHandler.Envelope memory envelope = IWavsServiceHandler.Envelope({
            eventId: bytes20(uint160(address(appraisal))), ordering: bytes12(0), payload: payload
        });

        IWavsServiceHandler.SignatureData memory signatureData = IWavsServiceHandler.SignatureData({
            signers: new address[](0), signatures: new bytes[](0), referenceBlock: uint32(block.number)
        });

        // Appraiser calls service handler (WAVS integration)
        vm.prank(appraiser);
        serviceHandler.handleSignedEnvelope(envelope, signatureData);

        (uint256 priceUSD, NFTAppraisal.AppraisalStatus status) = appraisal.getAppraisedPrice(address(nft), TOKEN_ID_1);
        assertEq(priceUSD, successPayload.price * 1e12, "Handler should convert price to 18 decimals");
        assertEq(uint256(status), uint256(NFTAppraisal.AppraisalStatus.Completed), "Status should be completed");
    }

    // ========================================================================
    // VIEW FUNCTION TESTS
    // ========================================================================

    /**
     * @notice Test getAppraisal view function
     * @dev Verifies correct appraisal data is returned
     */
    function testGetAppraisal() public {
        uint256 tokenId = TOKEN_ID_1;

        vm.prank(user);
        appraisal.requestAppraisal(address(nft), tokenId);

        vm.prank(address(serviceHandler));
        appraisal.setAppraisalForTokenWithCard(address(nft), tokenId, keccak256("card-get2"), NFT_PRICE_100);

        NFTAppraisal.Appraisal memory result = appraisal.getAppraisal(address(nft), tokenId);

        assertEq(result.requester, user, "Requester should be user");
        assertEq(result.priceUSD, NFT_PRICE_100, "Price should be correct");
        assertEq(uint256(result.status), uint256(NFTAppraisal.AppraisalStatus.Completed), "Status should be completed");
        assertGt(result.timestamp, 0, "Timestamp should be set");
        assertGt(result.lastUpdated, 0, "LastUpdated should be set");
    }

    /**
     * @notice Test hasAppraisal view function
     * @dev Verifies correct appraisal status checking
     */
    function testHasAppraisal() public {
        uint256 tokenId = TOKEN_ID_1;

        assertFalse(appraisal.hasAppraisal(address(nft), tokenId), "Should not have appraisal initially");

        vm.prank(user);
        appraisal.requestAppraisal(address(nft), tokenId);

        assertFalse(appraisal.hasAppraisal(address(nft), tokenId), "Should not have appraisal after request (pending)");

        vm.prank(address(serviceHandler));
        appraisal.setAppraisalForTokenWithCard(address(nft), tokenId, keccak256("card-has"), NFT_PRICE_100);

        assertTrue(appraisal.hasAppraisal(address(nft), tokenId), "Should have appraisal after completion");
    }

    // ========================================================================
    // BATCH OPERATIONS TESTS
    // ========================================================================

    /**
     * @notice Test multiple appraisal requests
     * @dev Verifies that multiple appraisals can be processed correctly
     */
    function testMultipleAppraisalRequests() public {
        uint256 protocolBalanceBefore = feeToken.balanceOf(protocol);
        uint256 totalFees = APPRAISAL_FEE * 3;

        // Request multiple appraisals
        vm.prank(user);
        appraisal.requestAppraisal(address(nft), 0);

        vm.prank(user);
        appraisal.requestAppraisal(address(nft), 1);

        vm.prank(user);
        appraisal.requestAppraisal(address(nft), 2);

        // Verify fee collection
        assertEq(feeToken.balanceOf(protocol), protocolBalanceBefore + totalFees, "All fees should be collected");

        // Complete all appraisals
        uint256[] memory prices = new uint256[](3);
        prices[0] = 50e18;
        prices[1] = 500e18;
        prices[2] = 5000e18;

        bytes32[] memory cardIds = new bytes32[](3);
        cardIds[0] = keccak256("card-1-50");
        cardIds[1] = keccak256("card-2-500");
        cardIds[2] = keccak256("card-3-5000");

        for (uint256 i = 0; i < 3; i++) {
            vm.prank(address(serviceHandler));
            appraisal.setAppraisalForTokenWithCard(address(nft), i, cardIds[i], prices[i]);
        }

        // Verify all appraisals completed
        for (uint256 i = 0; i < 3; i++) {
            (uint256 price,) = appraisal.getAppraisedPrice(address(nft), i);
            assertEq(price, prices[i], string(abi.encodePacked("Appraisal ", i, " price mismatch")));
            assertTrue(appraisal.hasAppraisal(address(nft), i), "Should have completed appraisal");
        }
    }

    /**
     * @notice Test multiple appraisals with fee accuracy
     * @dev Verifies exact fee calculations
     */
    function testMultipleAppraisalsFeeAccuracy() public {
        uint256 protocolInitialBalance = feeToken.balanceOf(protocol);
        uint256 userInitialBalance = feeToken.balanceOf(user);

        // Request 3 appraisals
        vm.prank(user);
        appraisal.requestAppraisal(address(nft), 0);

        vm.prank(user);
        appraisal.requestAppraisal(address(nft), 1);

        vm.prank(user);
        appraisal.requestAppraisal(address(nft), 2);

        // Check exact fee deductions
        uint256 totalFeesPaid = 30e18; // 3 x 10e18
        assertEq(
            feeToken.balanceOf(protocol), protocolInitialBalance + totalFeesPaid, "Protocol should receive 30 tokens"
        );
        assertEq(feeToken.balanceOf(user), userInitialBalance - totalFeesPaid, "User should pay 30 tokens");

        // Complete appraisals
        vm.prank(address(serviceHandler));
        appraisal.setAppraisalForTokenWithCard(address(nft), 0, keccak256("card-1-50"), 50e18);

        vm.prank(address(serviceHandler));
        appraisal.setAppraisalForTokenWithCard(address(nft), 1, keccak256("card-2-500"), 500e18);

        vm.prank(address(serviceHandler));
        appraisal.setAppraisalForTokenWithCard(address(nft), 2, keccak256("card-3-5000"), 5000e18);

        // Verify prices
        (uint256 price1,) = appraisal.getAppraisedPrice(address(nft), 0);
        (uint256 price2,) = appraisal.getAppraisedPrice(address(nft), 1);
        (uint256 price3,) = appraisal.getAppraisedPrice(address(nft), 2);

        assertEq(price1, 50e18, "First NFT appraised at $50");
        assertEq(price2, 500e18, "Second NFT appraised at $500");
        assertEq(price3, 5000e18, "Third NFT appraised at $5000");
    }

    // ========================================================================
    // EDGE CASE TESTS
    // ========================================================================

    /**
     * @notice Test edge case: maximum fee
     * @dev Verifies behavior with maximum possible fee
     */
    function testMaximumFee() public {
        uint256 maxFee = type(uint128).max;

        vm.prank(owner);
        appraisal.setAppraisalFee(maxFee);

        assertEq(appraisal.appraisalFee(), maxFee, "Maximum fee should be set");

        // Fund user with enough tokens
        vm.prank(owner);
        feeToken.mint(user, maxFee + 1000e18);

        vm.prank(user);
        feeToken.approve(address(appraisal), maxFee);

        uint256 protocolBalanceBefore = feeToken.balanceOf(protocol);

        vm.prank(user);
        appraisal.requestAppraisal(address(nft), 0);

        assertEq(feeToken.balanceOf(protocol), protocolBalanceBefore + maxFee, "Maximum fee should be collected");
    }

    /**
     * @notice Test edge case: appraisal after owner override
     * @dev Verifies re-appraisal flow after owner override
     */
    function testAppraisalAfterOwnerOverride() public {
        // Set appraisal via owner override first
        vm.prank(owner);
        appraisal.ownerSetAppraisalForTokenWithCard(address(nft), TOKEN_ID_1, CARD_ID_OVERRIDE, NFT_PRICE_100);

        // Should be able to request normal appraisal
        vm.prank(user);
        appraisal.requestAppraisal(address(nft), TOKEN_ID_1);

        // Complete with appraiser
        vm.prank(address(serviceHandler));
        appraisal.setAppraisalForTokenWithCard(address(nft), TOKEN_ID_1, CARD_ID_OVERRIDE, NFT_PRICE_1000);

        // Should be completed with appraiser price
        (uint256 price,) = appraisal.getAppraisedPrice(address(nft), TOKEN_ID_1);
        assertEq(price, NFT_PRICE_1000, "Oracle price should take precedence");
    }

    // ========================================================================
    // HELPER FUNCTIONS
    // ========================================================================

    /**
     * @notice Helper function to request appraisal
     * @param tokenId The NFT token ID to appraise
     */
    function _requestAppraisal(uint256 tokenId) internal {
        vm.prank(user);
        appraisal.requestAppraisal(address(nft), tokenId);
    }

    /**
     * @notice Helper function to complete appraisal
     * @param tokenId The NFT token ID
     * @param price The appraisal price
     */
    function _completeAppraisal(uint256 tokenId, uint256 price) internal {
        _requestAppraisal(tokenId);

        vm.prank(address(serviceHandler));
        appraisal.setAppraisalForTokenWithCard(address(nft), tokenId, CARD_ID_1, price);
    }
}
