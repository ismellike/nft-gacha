// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Test, console2} from "forge-std/Test.sol";
import {NFTAppraisal} from "../src/appraisal/NFTAppraisal.sol";
import {NFTAppraisalServiceHandler} from "../src/appraisal/NFTAppraisalServiceHandler.sol";
import {BaseERC721} from "../src/tokens/BaseERC721.sol";
import {BaseERC20} from "../src/tokens/BaseERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {MockWavsServiceManager} from "./mocks/MockWavsServiceManager.sol";
import {IWavsServiceHandler} from "@wavs/eigenlayer/ecdsa/interfaces/IWavsServiceHandler.sol";
import {IWavsServiceManager} from "@wavs/eigenlayer/ecdsa/interfaces/IWavsServiceManager.sol";
import {AppraisalSuccess} from "../src/interfaces/NFTAppraisalTypes.sol";

/**
 * @title NFT Appraisal Contract Test Suite
 * @notice Comprehensive test suite for NFT appraisal functionality
 * @dev Tests all aspects of the NFT appraisal system including fee mechanisms,
 *      price discovery, authorization, and edge cases
 * @author NFT Gacha Team
 */
contract NFTAppraisalTest is Test {
    // ========================================================================
    // TEST STATE VARIABLES
    // ========================================================================

    /// @dev Contract instances
    NFTAppraisal public appraisal;
    BaseERC721 public nft;
    BaseERC20 public feeToken;

    /// @dev Test addresses
    address public owner = makeAddr("owner");
    address public oracle = makeAddr("oracle");
    address public user = makeAddr("user");
    address public protocol = makeAddr("protocol");
    address public unauthorizedUser = makeAddr("unauthorized");

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
        address indexed collection, uint256 indexed tokenId, uint256 priceUSD, address indexed oracle, uint256 timestamp
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
    // MODIFIERS
    // ========================================================================

    /// @dev Helper modifier to run tests as specific user
    modifier asUser(address testUser) {
        vm.startPrank(testUser);
        _;
        vm.stopPrank();
    }

    /// @dev Helper modifier to expect specific revert reason
    modifier expectRevertWith(bytes4 errorSelector) {
        vm.expectRevert(errorSelector);
        _;
    }

    // ========================================================================
    // SETUP AND TEARDOWN
    // ========================================================================

    /**
     * @notice Sets up the test environment
     * @dev Deploys contracts, mints test NFTs, and sets up initial state
     */
    function setUp() public {
        // Deploy test tokens
        _deployTestTokens();

        // Deploy NFTAppraisal contract with proxy
        _deployAppraisalContract();

        // Setup initial test state
        _setupInitialState();
    }

    /**
     * @notice Deploys test ERC20 and ERC721 tokens
     */
    function _deployTestTokens() internal {
        feeToken = new BaseERC20("Fee Token", "FEE", address(this));
        nft = new BaseERC721("Test NFT", "TNFT", address(this));
    }

    /**
     * @notice Deploys NFTAppraisal contract with proxy pattern
     */
    function _deployAppraisalContract() internal {
        NFTAppraisal appraisalImpl = new NFTAppraisal();

        ERC1967Proxy proxy = new ERC1967Proxy(address(appraisalImpl), "");
        appraisal = NFTAppraisal(address(proxy));

        vm.prank(owner);
        appraisal.initialize(owner, address(feeToken), APPRAISAL_FEE, protocol);
    }

    /**
     * @notice Sets up initial test state
     */
    function _setupInitialState() internal {
        // Mint NFTs to test user
        nft.mint(user);
        nft.mint(user);
        nft.mint(user);

        // Fund user with fee tokens
        feeToken.mint(user, 1000e18);

        // Set authorized oracle
        vm.prank(owner);
        appraisal.setServiceHandler(oracle);

        // Approve fee tokens for user
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
     * @dev Verifies that authorized oracle can complete appraisals with pricing
     */
    function testCompleteAppraisal() public {
        // Request appraisal first
        _requestAppraisal(TOKEN_ID_1);

        // Complete appraisal
        vm.expectEmit(true, true, true, false);
        emit AppraisalCompleted(address(nft), TOKEN_ID_1, NFT_PRICE_100, oracle, block.timestamp);

        vm.prank(oracle);
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
        _completeAppraisal(0, NFT_PRICE_100); // Use token ID 0

        uint256 oldPrice = NFT_PRICE_100;
        uint256 newPrice = NFT_PRICE_1000;

        // Get the current card ID for the token to use in override
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

    // ========================================================================
    // AUTHORIZATION TESTS
    // ========================================================================

    /**
     * @notice Test unauthorized appraisal completion
     * @dev Verifies that only authorized oracle can complete appraisals
     */
    function testUnauthorizedAppraisalCompletion() public {
        _requestAppraisal(2); // Use token ID 2 (third minted NFT)

        vm.expectRevert(NFTAppraisal.UnauthorizedServiceHandler.selector);
        vm.prank(unauthorizedUser);
        appraisal.setAppraisalForTokenWithCard(address(nft), 2, CARD_ID_1, NFT_PRICE_100);
    }

    /**
     * @notice test owner-only functions
     * @dev Verifies that only owner can call administrative functions
     */
    function testOwnerOnlyFunctions() public {
        // Test setServiceHandler
        vm.prank(unauthorizedUser);
        vm.expectRevert();
        appraisal.setServiceHandler(unauthorizedUser);

        // Test setAppraisalFee
        vm.prank(unauthorizedUser);
        vm.expectRevert();
        appraisal.setAppraisalFee(UPDATED_FEE);

        // Test setFeeToken
        vm.prank(unauthorizedUser);
        vm.expectRevert();
        appraisal.setFeeToken(address(this));

        // Test setProtocolAddress
        vm.prank(unauthorizedUser);
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
    function testInvalidCollectionAddress() public expectRevertWith(NFTAppraisal.InvalidCollection.selector) {
        vm.prank(user);
        appraisal.requestAppraisal(address(0), TOKEN_ID_1);
    }

    /**
     * @notice Test invalid token ID
     * @dev Verifies that non-existent token ID is rejected
     */
    function testInvalidTokenId() public expectRevertWith(NFTAppraisal.InvalidTokenId.selector) {
        vm.prank(user);
        appraisal.requestAppraisal(address(nft), INVALID_TOKEN_ID);
    }

    /**
     * @notice Test zero price validation
     * @dev Verifies that zero price is rejected
     */
    function testZeroPriceValidation() public {
        _requestAppraisal(TOKEN_ID_1);

        // First verify that oracle is the service handler
        assertEq(appraisal.getServiceHandler(), oracle, "Oracle should be the service handler");

        // Test that normal price works
        vm.prank(oracle);
        appraisal.setAppraisalForTokenWithCard(address(nft), TOKEN_ID_1, CARD_ID_1, NFT_PRICE_100);

        // Verify it worked
        (uint256 price,) = appraisal.getAppraisedPrice(address(nft), TOKEN_ID_1);
        assertEq(price, NFT_PRICE_100, "Normal price should work");

        // Request appraisal for different token
        _requestAppraisal(TOKEN_ID_2);

        // Now test zero price should revert
        vm.expectRevert(NFTAppraisal.InvalidPrice.selector);
        vm.prank(oracle);
        appraisal.setAppraisalForTokenWithCard(address(nft), TOKEN_ID_2, CARD_ID_2, 0);
    }

    /**
     * @notice Test appraisal not found error
     * @dev Verifies that completing non-existent appraisal fails
     */
    function testAppraisalNotFound() public expectRevertWith(NFTAppraisal.AppraisalNotFound.selector) {
        vm.prank(oracle);
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
        vm.prank(oracle);
        appraisal.setAppraisalForTokenWithCard(address(nft), TOKEN_ID_1, CARD_ID_1, NFT_PRICE_1000);

        // Verify updated price
        (uint256 price,) = appraisal.getAppraisedPrice(address(nft), TOKEN_ID_1);
        assertEq(price, NFT_PRICE_1000, "Price should be updated");
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
        BaseERC20 newFeeToken = new BaseERC20("New Fee Token", "NFT", address(this));

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
        appraisal.requestAppraisal(address(nft), 0); // Use token ID 0

        vm.prank(user);
        appraisal.requestAppraisal(address(nft), 1); // Use token ID 1

        vm.prank(user);
        appraisal.requestAppraisal(address(nft), 2); // Use token ID 2

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
            vm.prank(oracle);
            appraisal.setAppraisalForTokenWithCard(
                address(nft),
                i, // Use token IDs 0, 1, 2
                cardIds[i],
                prices[i]
            );
        }

        // Verify all appraisals completed
        for (uint256 i = 0; i < 3; i++) {
            (uint256 price,) = appraisal.getAppraisedPrice(address(nft), i);
            assertEq(price, prices[i], string(abi.encodePacked("Appraisal ", i, " price mismatch")));
            assertTrue(appraisal.hasAppraisal(address(nft), i), "Should have completed appraisal");
        }
    }

    // ========================================================================
    // EDGE CASE TESTS
    // ========================================================================

    /**
     * @notice Test edge case: maximum fee
     * @dev Verifies behavior with maximum possible fee
     */
    function testMaximumFee() public {
        uint256 maxFee = type(uint128).max; // Prevent overflow

        vm.prank(owner);
        appraisal.setAppraisalFee(maxFee);

        assertEq(appraisal.appraisalFee(), maxFee, "Maximum fee should be set");

        // Fund user with enough tokens for max fee
        feeToken.mint(user, maxFee + 1000e18);

        // User should approve max fee
        vm.prank(user);
        feeToken.approve(address(appraisal), maxFee);

        uint256 protocolBalanceBefore = feeToken.balanceOf(protocol);

        vm.prank(user);
        appraisal.requestAppraisal(address(nft), 0); // Use token ID 0

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

        // Complete with oracle
        vm.prank(oracle);
        appraisal.setAppraisalForTokenWithCard(address(nft), TOKEN_ID_1, CARD_ID_OVERRIDE, NFT_PRICE_1000);

        // Should be completed with oracle price
        (uint256 price,) = appraisal.getAppraisedPrice(address(nft), TOKEN_ID_1);
        assertEq(price, NFT_PRICE_1000, "Oracle price should take precedence");
    }

    function testServiceHandlerProcessesSignedEnvelope() public {
        // Switch to WAVS service handler integration
        MockWavsServiceManager manager = new MockWavsServiceManager();
        NFTAppraisalServiceHandler handler =
            new NFTAppraisalServiceHandler(IWavsServiceManager(address(manager)), address(appraisal));

        vm.prank(owner);
        appraisal.setServiceHandler(address(handler));

        // User requests appraisal to mimic production flow
        vm.prank(user);
        appraisal.requestAppraisal(address(nft), TOKEN_ID_1);

        AppraisalSuccess memory successPayload = AppraisalSuccess({
            chain: "local",
            contractAddress: address(nft),
            tokenId: TOKEN_ID_1,
            groupId: CARD_ID_1,
            price: 150 * 1e6,
            txHash: bytes32("tx_hash")
        });

        bytes memory payload = abi.encode(successPayload);

        IWavsServiceHandler.Envelope memory envelope = IWavsServiceHandler.Envelope({
            eventId: bytes20(uint160(address(appraisal))),
            ordering: bytes12(0),
            payload: payload
        });

        IWavsServiceHandler.SignatureData memory signatureData = IWavsServiceHandler.SignatureData({
            signers: new address[](0),
            signatures: new bytes[](0),
            referenceBlock: uint32(block.number)
        });

        vm.prank(oracle);
        handler.handleSignedEnvelope(envelope, signatureData);

        (uint256 priceUSD, NFTAppraisal.AppraisalStatus status) = appraisal.getAppraisedPrice(address(nft), TOKEN_ID_1);
        assertEq(priceUSD, successPayload.price * 1e12, "Handler should convert price to 18 decimals");
        assertEq(uint256(status), uint256(NFTAppraisal.AppraisalStatus.Completed), "Status should be completed");
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

        vm.prank(oracle);
        appraisal.setAppraisalForTokenWithCard(address(nft), tokenId, CARD_ID_1, price);
    }

    /**
     * @notice Helper function to get appraisal details
     * @param tokenId The NFT token ID
     * @return appraisal The appraisal details
     */
    function _getAppraisal(uint256 tokenId) internal view returns (NFTAppraisal.Appraisal memory) {
        return appraisal.getAppraisal(address(nft), tokenId);
    }

    /**
     * @notice Helper function to check if appraisal exists
     * @param tokenId The NFT token ID
     * @return exists Whether appraisal exists
     */
    function _hasAppraisal(uint256 tokenId) internal view returns (bool) {
        return appraisal.hasAppraisal(address(nft), tokenId);
    }
}
