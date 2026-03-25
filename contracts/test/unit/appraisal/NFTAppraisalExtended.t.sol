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
import {AppraisalRequested} from "../../../src/interfaces/NFTAppraisalTypes.sol";

/**
 * @title NFTAppraisal Extended Test Suite
 * @notice Additional edge-case and event coverage for NFTAppraisal
 * @author NFT Gacha Team
 */
contract NFTAppraisalExtendedTest is StandardTest {
    // ========================================================================
    // STATE VARIABLES
    // ========================================================================

    NFTAppraisal public appraisal;
    NFTAppraisalServiceHandler public serviceHandler;
    BaseERC721 public nft;
    BaseERC20 public feeToken;
    MockWavsServiceManager public mockWavsManager;

    address public protocol;

    uint256 public constant APPRAISAL_FEE = 10e18;
    bytes32 public constant CARD_ID_A = keccak256("extended-card-a");
    bytes32 public constant CARD_ID_B = keccak256("extended-card-b");
    uint256 public constant PRICE_A = 100e18;

    // ========================================================================
    // EVENTS (mirror contract events for vm.expectEmit)
    // ========================================================================

    // AppraisalRequested is imported from NFTAppraisalTypes — no redeclaration needed
    event ServiceHandlerUpdated(address indexed oldHandler, address indexed newHandler);
    event AppraisalFeeUpdated(uint256 oldFee, uint256 newFee);
    event FeeTokenUpdated(address oldToken, address newToken);
    event ProtocolAddressUpdated(address oldAddress, address newAddress);
    event TreasuryWhitelisted(address indexed treasury);
    event TreasuryUnwhitelisted(address indexed treasury);

    // ========================================================================
    // SETUP
    // ========================================================================

    function setUp() public {
        protocol = makeAddr("protocol");

        mockWavsManager = new MockWavsServiceManager();
        feeToken = new BaseERC20("Fee Token", "FEE", owner);
        nft = new BaseERC721("Test NFT", "TNFT", owner);

        NFTAppraisal appraisalImpl = new NFTAppraisal();
        bytes memory initData =
            abi.encodeWithSelector(NFTAppraisal.initialize.selector, owner, address(feeToken), APPRAISAL_FEE, protocol);
        ERC1967Proxy proxy = new ERC1967Proxy(address(appraisalImpl), initData);
        appraisal = NFTAppraisal(address(proxy));

        serviceHandler =
            new NFTAppraisalServiceHandler(IWavsServiceManager(address(mockWavsManager)), address(appraisal));

        vm.prank(owner);
        appraisal.setServiceHandler(address(serviceHandler));

        // Mint some NFTs and fund user with fee tokens
        vm.prank(owner);
        nft.batchMint(user, 5);

        vm.prank(owner);
        feeToken.mint(user, 1000e18);

        vm.prank(user);
        feeToken.approve(address(appraisal), type(uint256).max);
    }

    // ========================================================================
    // setFeeToken(address(0)) REVERT
    // ========================================================================

    function test_SetFeeToken_ZeroAddress_Reverts() public {
        vm.prank(owner);
        vm.expectRevert(NFTAppraisal.InvalidFeeToken.selector);
        appraisal.setFeeToken(address(0));
    }

    function test_SetFeeToken_ValidAddress_Succeeds() public {
        BaseERC20 newToken = new BaseERC20("New Token", "NTK", owner);

        vm.prank(owner);
        vm.expectEmit(false, false, false, true);
        emit FeeTokenUpdated(address(feeToken), address(newToken));

        appraisal.setFeeToken(address(newToken));

        assertEq(address(appraisal.feeToken()), address(newToken));
    }

    // ========================================================================
    // setProtocolAddress(address(0)) REVERT
    // ========================================================================

    function test_SetProtocolAddress_ZeroAddress_Reverts() public {
        vm.prank(owner);
        vm.expectRevert(NFTAppraisal.InvalidProtocolAddress.selector);
        appraisal.setProtocolAddress(address(0));
    }

    function test_SetProtocolAddress_ValidAddress_Succeeds() public {
        address newProtocol = makeAddr("newProtocol");

        vm.prank(owner);
        vm.expectEmit(false, false, false, true);
        emit ProtocolAddressUpdated(protocol, newProtocol);

        appraisal.setProtocolAddress(newProtocol);

        assertEq(appraisal.protocolAddress(), newProtocol);
    }

    // ========================================================================
    // whitelistTreasury duplicate REVERT
    // ========================================================================

    function test_WhitelistTreasury_AlreadyWhitelisted_Reverts() public {
        address dummyTreasury = makeAddr("dummyTreasury");

        vm.prank(owner);
        appraisal.whitelistTreasury(dummyTreasury);

        vm.prank(owner);
        vm.expectRevert(NFTAppraisal.TreasuryAlreadyWhitelisted.selector);
        appraisal.whitelistTreasury(dummyTreasury);
    }

    function test_WhitelistTreasury_EmitsEvent() public {
        address dummyTreasury = makeAddr("dummyTreasury");

        vm.prank(owner);
        vm.expectEmit(true, false, false, false);
        emit TreasuryWhitelisted(dummyTreasury);

        appraisal.whitelistTreasury(dummyTreasury);
    }

    // ========================================================================
    // unwhitelistTreasury not-whitelisted REVERT
    // ========================================================================

    function test_UnwhitelistTreasury_NotWhitelisted_Reverts() public {
        address notListed = makeAddr("notListed");

        vm.prank(owner);
        vm.expectRevert(NFTAppraisal.TreasuryNotWhitelisted.selector);
        appraisal.unwhitelistTreasury(notListed);
    }

    function test_UnwhitelistTreasury_EmitsEvent() public {
        address dummyTreasury = makeAddr("dummyTreasury");

        vm.prank(owner);
        appraisal.whitelistTreasury(dummyTreasury);

        vm.prank(owner);
        vm.expectEmit(true, false, false, false);
        emit TreasuryUnwhitelisted(dummyTreasury);

        appraisal.unwhitelistTreasury(dummyTreasury);
    }

    function test_UnwhitelistTreasury_RemovesFromList() public {
        address t1 = makeAddr("t1");
        address t2 = makeAddr("t2");

        vm.prank(owner);
        appraisal.whitelistTreasury(t1);
        vm.prank(owner);
        appraisal.whitelistTreasury(t2);

        assertEq(appraisal.getWhitelistedTreasuries().length, 2);

        vm.prank(owner);
        appraisal.unwhitelistTreasury(t1);

        address[] memory remaining = appraisal.getWhitelistedTreasuries();
        assertEq(remaining.length, 1, "should have 1 remaining");
        assertEq(remaining[0], t2, "t2 should remain");
        assertFalse(appraisal.isTreasuryWhitelisted(t1), "t1 should no longer be whitelisted");
    }

    // ========================================================================
    // requestAppraisal() transferFrom failure
    // ========================================================================

    function test_RequestAppraisal_TransferFromFails_Reverts() public {
        // Revoke the allowance so transferFrom will fail
        vm.prank(user);
        feeToken.approve(address(appraisal), 0);

        vm.prank(user);
        vm.expectRevert();
        appraisal.requestAppraisal(address(nft), 0);
    }

    function test_RequestAppraisal_InsufficientBalance_Reverts() public {
        address poorUser = makeAddr("poorUser");
        vm.prank(owner);
        nft.mint(poorUser);

        // poorUser has no fee tokens but approves max
        vm.prank(poorUser);
        feeToken.approve(address(appraisal), type(uint256).max);

        vm.prank(poorUser);
        vm.expectRevert();
        appraisal.requestAppraisal(address(nft), 5); // token 5 belongs to poorUser
    }

    // ========================================================================
    // Event: AppraisalRequested
    // ========================================================================

    function test_Event_AppraisalRequested() public {
        vm.prank(user);
        vm.expectEmit(true, true, false, false);
        emit AppraisalRequested(address(nft), 0);
        appraisal.requestAppraisal(address(nft), 0);
    }

    // ========================================================================
    // Event: ServiceHandlerUpdated
    // ========================================================================

    function test_Event_ServiceHandlerUpdated() public {
        address newHandler = makeAddr("newHandler");

        vm.prank(owner);
        vm.expectEmit(true, true, false, false);
        emit ServiceHandlerUpdated(address(serviceHandler), newHandler);

        appraisal.setServiceHandler(newHandler);
    }

    // ========================================================================
    // Event: FeeUpdated (AppraisalFeeUpdated)
    // ========================================================================

    function test_Event_AppraisalFeeUpdated() public {
        uint256 oldFee = appraisal.appraisalFee();
        uint256 newFee = 25e18;

        vm.prank(owner);
        vm.expectEmit(false, false, false, true);
        emit AppraisalFeeUpdated(oldFee, newFee);

        appraisal.setAppraisalFee(newFee);
    }

    // ========================================================================
    // getCardInstances() with cardId that has no instances
    // ========================================================================

    function test_GetCardInstances_NoInstance_ReturnsZeroAddress() public view {
        bytes32[] memory cardIds = new bytes32[](1);
        cardIds[0] = keccak256("nonexistentCard");

        (address[] memory collections, uint256[] memory tokenIds) = appraisal.getCardInstances(cardIds);

        assertEq(collections.length, 1);
        assertEq(tokenIds.length, 1);
        assertEq(collections[0], address(0), "no canonical collection");
        assertEq(tokenIds[0], 0, "no canonical tokenId");
    }

    function test_GetCardInstances_MixedExistingAndMissing() public {
        // Set up one appraisal so card A has a canonical instance
        vm.prank(user);
        appraisal.requestAppraisal(address(nft), 0);

        vm.prank(address(serviceHandler));
        appraisal.setAppraisalForTokenWithCard(address(nft), 0, CARD_ID_A, PRICE_A);

        bytes32[] memory cardIds = new bytes32[](2);
        cardIds[0] = CARD_ID_A;
        cardIds[1] = keccak256("missing");

        (address[] memory collections, uint256[] memory tokenIds) = appraisal.getCardInstances(cardIds);

        assertEq(collections[0], address(nft), "card A has canonical collection");
        assertEq(tokenIds[0], 0, "card A has canonical tokenId 0");
        assertEq(collections[1], address(0), "missing card has no collection");
        assertEq(tokenIds[1], 0, "missing card has no tokenId");
    }

    function test_GetCardInstances_EmptyArray() public view {
        bytes32[] memory cardIds = new bytes32[](0);
        (address[] memory collections, uint256[] memory tokenIds) = appraisal.getCardInstances(cardIds);
        assertEq(collections.length, 0);
        assertEq(tokenIds.length, 0);
    }

    // ========================================================================
    // After unwhitelistTreasury, auto-migration no longer triggers
    // ========================================================================

    function test_AutoMigration_NoTriggerAfterUnwhitelist() public {
        address dummyTreasury = makeAddr("dummyTreasury");

        // Whitelist then unwhitelist the treasury
        vm.prank(owner);
        appraisal.whitelistTreasury(dummyTreasury);

        vm.prank(owner);
        appraisal.unwhitelistTreasury(dummyTreasury);

        // After unwhitelisting, treasuryList should be empty
        assertEq(appraisal.getWhitelistedTreasuries().length, 0, "treasury list should be empty");

        // Complete an appraisal — with no whitelisted treasuries, auto-migration
        // simply loops over an empty list without emitting AutoMigrationTriggered.
        vm.prank(user);
        appraisal.requestAppraisal(address(nft), 0);

        // This should succeed without reverting (no treasury to notify)
        vm.prank(address(serviceHandler));
        appraisal.setAppraisalForTokenWithCard(address(nft), 0, CARD_ID_A, PRICE_A);

        // Then update price — should not emit AutoMigrationTriggered since list is empty
        vm.prank(user);
        appraisal.requestAppraisal(address(nft), 0);

        vm.prank(address(serviceHandler));
        appraisal.setAppraisalForTokenWithCard(address(nft), 0, CARD_ID_A, PRICE_A * 2);

        // We can assert no treasury is whitelisted and everything proceeds cleanly
        assertEq(appraisal.getWhitelistedTreasuries().length, 0);
    }

    // ========================================================================
    // BatchAppraisalRequested — batch request events
    // ========================================================================

    function test_Event_BatchAppraisalRequested_EmitsPerToken() public {
        address[] memory collections = new address[](2);
        collections[0] = address(nft);
        collections[1] = address(nft);
        uint256[] memory tokenIds = new uint256[](2);
        tokenIds[0] = 1;
        tokenIds[1] = 2;

        // Expect AppraisalRequested emitted for the first token in the batch
        vm.expectEmit(true, true, false, false);
        emit AppraisalRequested(address(nft), 1);

        vm.prank(user);
        appraisal.requestBatchAppraisal(collections, tokenIds);
    }

    // ========================================================================
    // TreasuryWhitelisted / TreasuryUnwhitelisted symmetry
    // ========================================================================

    function test_Whitelist_Unwhitelist_Symmetry() public {
        address t = makeAddr("treasury");

        assertFalse(appraisal.isTreasuryWhitelisted(t));

        vm.prank(owner);
        appraisal.whitelistTreasury(t);
        assertTrue(appraisal.isTreasuryWhitelisted(t));

        vm.prank(owner);
        appraisal.unwhitelistTreasury(t);
        assertFalse(appraisal.isTreasuryWhitelisted(t));
    }
}
