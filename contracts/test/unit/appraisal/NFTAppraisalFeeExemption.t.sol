// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {StandardTest} from "../../helpers/StandardTest.sol";
import {NFTAppraisal} from "../../../src/appraisal/NFTAppraisal.sol";
import {NFTAppraisalServiceHandler} from "../../../src/appraisal/NFTAppraisalServiceHandler.sol";
import {BaseERC721} from "../../../src/tokens/BaseERC721.sol";
import {BaseERC20} from "../../../src/tokens/BaseERC20.sol";
import {GachaPFP} from "../../../src/tokens/GachaPFP.sol";
import {TestnetERC721} from "../../../src/tokens/TestnetERC721.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {MockWavsServiceManager} from "../../mocks/MockWavsServiceManager.sol";
import {IWavsServiceManager} from "@wavs/eigenlayer/ecdsa/interfaces/IWavsServiceManager.sol";

/**
 * @title NFT Appraisal Fee Exemption Test Suite
 * @notice Tests the fee exemption mechanism for designated collections
 * @dev Covers setFeeExemption(), requestAppraisal() with exemptions,
 *      batch appraisals with mixed exempt/non-exempt, and edge cases
 */
contract NFTAppraisalFeeExemptionTest is StandardTest {
    // ========================================================================
    // STATE
    // ========================================================================

    NFTAppraisal public appraisal;
    NFTAppraisalServiceHandler public serviceHandler;
    BaseERC721 public nft;
    BaseERC20 public feeToken;
    GachaPFP public pfp;
    TestnetERC721 public testnetNft;
    MockWavsServiceManager public mockWavsManager;

    address public protocol;

    uint256 public constant APPRAISAL_FEE = 1e6; // 1 USDC (6 decimals)

    // ========================================================================
    // EVENTS
    // ========================================================================

    event FeeExemptionUpdated(address indexed collection, bool exempt);
    event AppraisalRequested(address indexed nftContract, uint256 indexed tokenId);

    // ========================================================================
    // SETUP
    // ========================================================================

    function setUp() public {
        protocol = makeAddr("protocol");

        mockWavsManager = new MockWavsServiceManager();
        feeToken = new BaseERC20("Fee Token", "FEE", owner);
        nft = new BaseERC721("Test NFT", "TNFT", owner);
        pfp = new GachaPFP(0, 10_000, owner);
        testnetNft = new TestnetERC721();

        // Deploy NFTAppraisal with proxy
        NFTAppraisal impl = new NFTAppraisal();
        bytes memory initData =
            abi.encodeWithSelector(NFTAppraisal.initialize.selector, owner, address(feeToken), APPRAISAL_FEE, protocol);
        ERC1967Proxy proxy = new ERC1967Proxy(address(impl), initData);
        appraisal = NFTAppraisal(address(proxy));

        // Deploy service handler
        serviceHandler =
            new NFTAppraisalServiceHandler(IWavsServiceManager(address(mockWavsManager)), address(appraisal));

        vm.prank(owner);
        appraisal.setServiceHandler(address(serviceHandler));

        // Mint test NFTs
        vm.prank(owner);
        nft.mint(user); // token 0
        vm.prank(owner);
        nft.mint(user); // token 1
        vm.prank(owner);
        nft.mint(user); // token 2

        vm.prank(user);
        pfp.mint(); // token 1
        vm.prank(user);
        pfp.mint(); // token 2

        vm.prank(user);
        testnetNft.mint(); // token 1
        vm.prank(user);
        testnetNft.mint(); // token 2

        // Fund user
        vm.prank(owner);
        feeToken.mint(user, 1_000_000e6);

        vm.prank(user);
        feeToken.approve(address(appraisal), type(uint256).max);
    }

    // ========================================================================
    // setFeeExemption() - ACCESS CONTROL
    // ========================================================================

    function testSetFeeExemptionAsOwner() public {
        vm.prank(owner);
        appraisal.setFeeExemption(address(pfp), true);

        assertTrue(appraisal.feeExemptCollections(address(pfp)));
    }

    function testSetFeeExemptionEmitsEvent() public {
        vm.expectEmit(true, false, false, true);
        emit FeeExemptionUpdated(address(pfp), true);

        vm.prank(owner);
        appraisal.setFeeExemption(address(pfp), true);
    }

    function testSetFeeExemptionRevertsForNonOwner() public {
        vm.prank(user);
        vm.expectRevert();
        appraisal.setFeeExemption(address(pfp), true);
    }

    function testSetFeeExemptionRevertsForZeroAddress() public {
        vm.prank(owner);
        vm.expectRevert(NFTAppraisal.InvalidCollection.selector);
        appraisal.setFeeExemption(address(0), true);
    }

    function testSetFeeExemptionRevertsIfAlreadyExempt() public {
        vm.prank(owner);
        appraisal.setFeeExemption(address(pfp), true);

        vm.prank(owner);
        vm.expectRevert(NFTAppraisal.CollectionAlreadyExempt.selector);
        appraisal.setFeeExemption(address(pfp), true);
    }

    function testRemoveFeeExemptionRevertsIfNotExempt() public {
        vm.prank(owner);
        vm.expectRevert(NFTAppraisal.CollectionNotExempt.selector);
        appraisal.setFeeExemption(address(pfp), false);
    }

    // ========================================================================
    // setFeeExemption() - STATE MANAGEMENT
    // ========================================================================

    function testAddAndRemoveFeeExemption() public {
        vm.startPrank(owner);
        appraisal.setFeeExemption(address(pfp), true);
        assertTrue(appraisal.feeExemptCollections(address(pfp)));

        appraisal.setFeeExemption(address(pfp), false);
        assertFalse(appraisal.feeExemptCollections(address(pfp)));
        vm.stopPrank();
    }

    function testRemoveFeeExemptionEmitsEvent() public {
        vm.prank(owner);
        appraisal.setFeeExemption(address(pfp), true);

        vm.expectEmit(true, false, false, true);
        emit FeeExemptionUpdated(address(pfp), false);

        vm.prank(owner);
        appraisal.setFeeExemption(address(pfp), false);
    }

    function testMultipleCollectionsExempted() public {
        vm.startPrank(owner);
        appraisal.setFeeExemption(address(pfp), true);
        appraisal.setFeeExemption(address(testnetNft), true);
        vm.stopPrank();

        assertTrue(appraisal.feeExemptCollections(address(pfp)));
        assertTrue(appraisal.feeExemptCollections(address(testnetNft)));
        assertFalse(appraisal.feeExemptCollections(address(nft)));
    }

    // ========================================================================
    // requestAppraisal() - FEE EXEMPTION
    // ========================================================================

    function testExemptCollectionSkipsFee() public {
        vm.prank(owner);
        appraisal.setFeeExemption(address(pfp), true);

        uint256 protocolBefore = feeToken.balanceOf(protocol);
        uint256 userBefore = feeToken.balanceOf(user);

        vm.prank(user);
        appraisal.requestAppraisal(address(pfp), 1);

        assertEq(feeToken.balanceOf(protocol), protocolBefore, "Protocol should not receive fee");
        assertEq(feeToken.balanceOf(user), userBefore, "User should not be charged");
    }

    function testExemptCollectionStillEmitsEvent() public {
        vm.prank(owner);
        appraisal.setFeeExemption(address(pfp), true);

        vm.expectEmit(true, true, false, false);
        emit AppraisalRequested(address(pfp), 1);

        vm.prank(user);
        appraisal.requestAppraisal(address(pfp), 1);
    }

    function testExemptCollectionCreatesRequest() public {
        vm.prank(owner);
        appraisal.setFeeExemption(address(pfp), true);

        vm.prank(user);
        appraisal.requestAppraisal(address(pfp), 1);

        NFTAppraisal.Appraisal memory a = appraisal.getAppraisal(address(pfp), 1);
        assertEq(a.requester, user);
        assertEq(uint256(a.status), uint256(NFTAppraisal.AppraisalStatus.Pending));
    }

    function testNonExemptCollectionChargesFee() public {
        uint256 protocolBefore = feeToken.balanceOf(protocol);

        vm.prank(user);
        appraisal.requestAppraisal(address(nft), 0);

        assertEq(feeToken.balanceOf(protocol), protocolBefore + APPRAISAL_FEE, "Fee should be charged");
    }

    function testExemptCollectionNoApprovalNeeded() public {
        vm.prank(owner);
        appraisal.setFeeExemption(address(pfp), true);

        // Reset approval to 0 — exempt collection shouldn't need any
        vm.prank(user);
        feeToken.approve(address(appraisal), 0);

        // Should succeed without any token approval
        vm.prank(user);
        appraisal.requestAppraisal(address(pfp), 1);
    }

    function testRemovedExemptionChargesFee() public {
        vm.startPrank(owner);
        appraisal.setFeeExemption(address(pfp), true);
        appraisal.setFeeExemption(address(pfp), false);
        vm.stopPrank();

        uint256 protocolBefore = feeToken.balanceOf(protocol);

        vm.prank(user);
        appraisal.requestAppraisal(address(pfp), 1);

        assertEq(feeToken.balanceOf(protocol), protocolBefore + APPRAISAL_FEE, "Fee should be charged after removal");
    }

    // ========================================================================
    // requestAppraisal() - EXEMPT WITH GachaPFP
    // ========================================================================

    function testGachaPFPExemptAppraisal() public {
        vm.prank(owner);
        appraisal.setFeeExemption(address(pfp), true);

        vm.prank(user);
        appraisal.requestAppraisal(address(pfp), 1);

        NFTAppraisal.Appraisal memory a = appraisal.getAppraisal(address(pfp), 1);
        assertEq(a.requester, user);
        assertEq(uint256(a.status), uint256(NFTAppraisal.AppraisalStatus.Pending));
    }

    function testTestnetERC721ExemptAppraisal() public {
        vm.prank(owner);
        appraisal.setFeeExemption(address(testnetNft), true);

        vm.prank(user);
        appraisal.requestAppraisal(address(testnetNft), 1);

        NFTAppraisal.Appraisal memory a = appraisal.getAppraisal(address(testnetNft), 1);
        assertEq(a.requester, user);
    }

    // ========================================================================
    // requestBatchAppraisal() - MIXED EXEMPTION
    // ========================================================================

    function testBatchAllExemptSkipsFees() public {
        vm.startPrank(owner);
        appraisal.setFeeExemption(address(pfp), true);
        appraisal.setFeeExemption(address(testnetNft), true);
        vm.stopPrank();

        address[] memory collections = new address[](2);
        uint256[] memory tokenIds = new uint256[](2);
        collections[0] = address(pfp);
        collections[1] = address(testnetNft);
        tokenIds[0] = 1;
        tokenIds[1] = 1;

        uint256 protocolBefore = feeToken.balanceOf(protocol);

        vm.prank(user);
        appraisal.requestBatchAppraisal(collections, tokenIds);

        assertEq(feeToken.balanceOf(protocol), protocolBefore, "No fees should be charged for all-exempt batch");
    }

    function testBatchAllNonExemptChargesFullFees() public {
        address[] memory collections = new address[](3);
        uint256[] memory tokenIds = new uint256[](3);
        collections[0] = address(nft);
        collections[1] = address(nft);
        collections[2] = address(nft);
        tokenIds[0] = 0;
        tokenIds[1] = 1;
        tokenIds[2] = 2;

        uint256 protocolBefore = feeToken.balanceOf(protocol);

        vm.prank(user);
        appraisal.requestBatchAppraisal(collections, tokenIds);

        assertEq(feeToken.balanceOf(protocol), protocolBefore + APPRAISAL_FEE * 3, "Full fees for non-exempt batch");
    }

    function testBatchMixedExemptAndNonExempt() public {
        vm.prank(owner);
        appraisal.setFeeExemption(address(pfp), true);

        // 1 exempt (pfp) + 2 non-exempt (nft) = 2 fees
        address[] memory collections = new address[](3);
        uint256[] memory tokenIds = new uint256[](3);
        collections[0] = address(pfp);
        collections[1] = address(nft);
        collections[2] = address(nft);
        tokenIds[0] = 1;
        tokenIds[1] = 0;
        tokenIds[2] = 1;

        uint256 protocolBefore = feeToken.balanceOf(protocol);

        vm.prank(user);
        appraisal.requestBatchAppraisal(collections, tokenIds);

        assertEq(
            feeToken.balanceOf(protocol),
            protocolBefore + APPRAISAL_FEE * 2,
            "Should charge 2 fees (1 exempt, 2 non-exempt)"
        );
    }

    function testBatchMixedExemptCreatesAllRequests() public {
        vm.prank(owner);
        appraisal.setFeeExemption(address(pfp), true);

        address[] memory collections = new address[](2);
        uint256[] memory tokenIds = new uint256[](2);
        collections[0] = address(pfp);
        collections[1] = address(nft);
        tokenIds[0] = 1;
        tokenIds[1] = 0;

        vm.prank(user);
        appraisal.requestBatchAppraisal(collections, tokenIds);

        // Both should have requests
        NFTAppraisal.Appraisal memory a1 = appraisal.getAppraisal(address(pfp), 1);
        NFTAppraisal.Appraisal memory a2 = appraisal.getAppraisal(address(nft), 0);
        assertEq(a1.requester, user);
        assertEq(a2.requester, user);
    }

    // ========================================================================
    // RE-APPRAISAL WITH EXEMPTION
    // ========================================================================

    function testReappraisalExemptSkipsFee() public {
        // First appraisal charges fee (not exempt)
        vm.prank(user);
        appraisal.requestAppraisal(address(pfp), 1);

        // Now exempt the collection
        vm.prank(owner);
        appraisal.setFeeExemption(address(pfp), true);

        uint256 protocolBefore = feeToken.balanceOf(protocol);

        // Re-appraisal should be free
        vm.prank(user);
        appraisal.requestAppraisal(address(pfp), 1);

        assertEq(feeToken.balanceOf(protocol), protocolBefore, "Re-appraisal of exempt should be free");
    }

    // ========================================================================
    // ZERO FEE + EXEMPTION INTERACTION
    // ========================================================================

    function testExemptionWithZeroFeeIsNoop() public {
        // Set fee to 0
        vm.prank(owner);
        appraisal.setAppraisalFee(0);

        // Exempt a collection
        vm.prank(owner);
        appraisal.setFeeExemption(address(pfp), true);

        uint256 protocolBefore = feeToken.balanceOf(protocol);

        // Should work fine
        vm.prank(user);
        appraisal.requestAppraisal(address(pfp), 1);

        assertEq(feeToken.balanceOf(protocol), protocolBefore);
    }

    // ========================================================================
    // SERVICE HANDLER COMPLETION WORKS FOR EXEMPT COLLECTIONS
    // ========================================================================

    function testExemptCollectionCanBeCompleted() public {
        vm.prank(owner);
        appraisal.setFeeExemption(address(pfp), true);

        // Request (free)
        vm.prank(user);
        appraisal.requestAppraisal(address(pfp), 1);

        // Complete via service handler
        bytes32 cardId = keccak256("pfp-card-1");
        uint256 price = 5e18; // $5 Common

        vm.prank(address(serviceHandler));
        appraisal.setAppraisalForTokenWithCard(address(pfp), 1, cardId, price);

        (uint256 appraisedPrice, NFTAppraisal.AppraisalStatus status) = appraisal.getAppraisedPrice(address(pfp), 1);
        assertEq(appraisedPrice, price);
        assertEq(uint256(status), uint256(NFTAppraisal.AppraisalStatus.Completed));
    }

    // ========================================================================
    // FUZZ TESTS
    // ========================================================================

    function testFuzz_SetFeeExemptionIdempotent(address collection) public {
        vm.assume(collection != address(0));

        // Deploying a mock to make it a valid ERC721
        // Just test the state management
        vm.prank(owner);
        appraisal.setFeeExemption(collection, true);
        assertTrue(appraisal.feeExemptCollections(collection));

        vm.prank(owner);
        appraisal.setFeeExemption(collection, false);
        assertFalse(appraisal.feeExemptCollections(collection));
    }
}
