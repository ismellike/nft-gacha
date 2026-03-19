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

/**
 * @title NFT Appraisal Batch Functions Test Suite
 * @notice Tests requestBatchAppraisal and ownerBatchSetAppraisalForTokensWithCards
 */
contract NFTAppraisalBatchTest is StandardTest {
    NFTAppraisal public appraisal;
    NFTAppraisalServiceHandler public serviceHandler;
    BaseERC721 public nft;
    BaseERC20 public feeToken;
    MockWavsServiceManager public mockWavsManager;

    address public protocol;
    uint256 public constant APPRAISAL_FEE = 10e18;

    bytes32 public constant CARD_ID_A = keccak256("card-A");
    bytes32 public constant CARD_ID_B = keccak256("card-B");

    function setUp() public {
        protocol = makeAddr("protocol");
        mockWavsManager = new MockWavsServiceManager();

        feeToken = new BaseERC20("Fee Token", "FEE", owner);
        nft = new BaseERC721("Test NFT", "TNFT", owner);

        // Deploy appraisal proxy
        NFTAppraisal impl = new NFTAppraisal();
        bytes memory initData = abi.encodeWithSelector(
            NFTAppraisal.initialize.selector, owner, address(feeToken), APPRAISAL_FEE, protocol
        );
        ERC1967Proxy proxy = new ERC1967Proxy(address(impl), initData);
        appraisal = NFTAppraisal(address(proxy));

        serviceHandler =
            new NFTAppraisalServiceHandler(IWavsServiceManager(address(mockWavsManager)), address(appraisal));

        vm.prank(owner);
        appraisal.setServiceHandler(address(serviceHandler));

        // Mint several NFTs to user
        for (uint256 i = 0; i < 5; i++) {
            vm.prank(owner);
            nft.mint(user);
        }

        // Fund and approve
        vm.prank(owner);
        feeToken.mint(user, 10_000e18);

        vm.prank(user);
        feeToken.approve(address(appraisal), type(uint256).max);
    }

    // ========================================================================
    // requestBatchAppraisal
    // ========================================================================

    function testRequestBatchAppraisalSuccess() public {
        address[] memory collections = new address[](2);
        uint256[] memory tokenIds = new uint256[](2);
        collections[0] = address(nft);
        collections[1] = address(nft);
        tokenIds[0] = 1;
        tokenIds[1] = 2;

        uint256 protocolBefore = feeToken.balanceOf(protocol);

        vm.prank(user);
        appraisal.requestBatchAppraisal(collections, tokenIds);

        // Should charge 2x fee
        assertEq(feeToken.balanceOf(protocol), protocolBefore + APPRAISAL_FEE * 2, "Should collect 2x fee");
    }

    function testRequestBatchAppraisalRevertsEmptyArrays() public {
        address[] memory collections = new address[](0);
        uint256[] memory tokenIds = new uint256[](0);

        vm.prank(user);
        vm.expectRevert(abi.encodeWithSelector(NFTAppraisal.EmptyArrays.selector));
        appraisal.requestBatchAppraisal(collections, tokenIds);
    }

    function testRequestBatchAppraisalRevertsArrayLengthMismatch() public {
        address[] memory collections = new address[](2);
        uint256[] memory tokenIds = new uint256[](1);
        collections[0] = address(nft);
        collections[1] = address(nft);
        tokenIds[0] = 1;

        vm.prank(user);
        vm.expectRevert(abi.encodeWithSelector(NFTAppraisal.ArrayLengthMismatch.selector));
        appraisal.requestBatchAppraisal(collections, tokenIds);
    }

    function testRequestBatchAppraisalRevertsTooManyItems() public {
        address[] memory collections = new address[](51);
        uint256[] memory tokenIds = new uint256[](51);
        for (uint256 i = 0; i < 51; i++) {
            collections[i] = address(nft);
            tokenIds[i] = 1; // Token exists
        }

        vm.prank(user);
        vm.expectRevert(abi.encodeWithSelector(NFTAppraisal.TooManyItems.selector));
        appraisal.requestBatchAppraisal(collections, tokenIds);
    }

    function testRequestBatchAppraisalRevertsInvalidCollection() public {
        address[] memory collections = new address[](1);
        uint256[] memory tokenIds = new uint256[](1);
        collections[0] = address(0);
        tokenIds[0] = 1;

        vm.prank(user);
        vm.expectRevert(abi.encodeWithSelector(NFTAppraisal.InvalidCollection.selector));
        appraisal.requestBatchAppraisal(collections, tokenIds);
    }

    // ========================================================================
    // ownerBatchSetAppraisalForTokensWithCards
    // ========================================================================

    function testOwnerBatchSetAppraisalSuccess() public {
        address[] memory collections = new address[](2);
        uint256[] memory tokenIds = new uint256[](2);
        bytes32[] memory cardIds = new bytes32[](2);
        uint256[] memory prices = new uint256[](2);

        collections[0] = address(nft);
        collections[1] = address(nft);
        tokenIds[0] = 1;
        tokenIds[1] = 2;
        cardIds[0] = CARD_ID_A;
        cardIds[1] = CARD_ID_B;
        prices[0] = 100e18;
        prices[1] = 500e18;

        vm.prank(owner);
        appraisal.ownerBatchSetAppraisalForTokensWithCards(collections, tokenIds, cardIds, prices);

        // Verify appraisals were set
        (uint256 price1, NFTAppraisal.AppraisalStatus status1) = appraisal.getAppraisedPrice(address(nft), 1);
        assertEq(price1, 100e18, "Token 1 price should be set");
        assertEq(uint8(status1), uint8(NFTAppraisal.AppraisalStatus.OwnerOverride), "Token 1 status should be OwnerOverride");

        (uint256 price2,) = appraisal.getAppraisedPrice(address(nft), 2);
        assertEq(price2, 500e18, "Token 2 price should be set");
    }

    function testOwnerBatchSetAppraisalRevertsArrayLengthMismatch() public {
        address[] memory collections = new address[](2);
        uint256[] memory tokenIds = new uint256[](2);
        bytes32[] memory cardIds = new bytes32[](1); // Mismatched
        uint256[] memory prices = new uint256[](2);

        collections[0] = address(nft);
        collections[1] = address(nft);
        tokenIds[0] = 1;
        tokenIds[1] = 2;
        cardIds[0] = CARD_ID_A;
        prices[0] = 100e18;
        prices[1] = 500e18;

        vm.prank(owner);
        vm.expectRevert(abi.encodeWithSelector(NFTAppraisal.ArrayLengthMismatch.selector));
        appraisal.ownerBatchSetAppraisalForTokensWithCards(collections, tokenIds, cardIds, prices);
    }

    function testOwnerBatchSetAppraisalRevertsTooManyItems() public {
        address[] memory collections = new address[](51);
        uint256[] memory tokenIds = new uint256[](51);
        bytes32[] memory cardIds = new bytes32[](51);
        uint256[] memory prices = new uint256[](51);

        for (uint256 i = 0; i < 51; i++) {
            collections[i] = address(nft);
            tokenIds[i] = 1;
            cardIds[i] = CARD_ID_A;
            prices[i] = 100e18;
        }

        vm.prank(owner);
        vm.expectRevert(abi.encodeWithSelector(NFTAppraisal.TooManyItems.selector));
        appraisal.ownerBatchSetAppraisalForTokensWithCards(collections, tokenIds, cardIds, prices);
    }

    function testOwnerBatchSetAppraisalRevertsNotOwner() public {
        address[] memory collections = new address[](1);
        uint256[] memory tokenIds = new uint256[](1);
        bytes32[] memory cardIds = new bytes32[](1);
        uint256[] memory prices = new uint256[](1);

        collections[0] = address(nft);
        tokenIds[0] = 1;
        cardIds[0] = CARD_ID_A;
        prices[0] = 100e18;

        vm.prank(user);
        vm.expectRevert(); // OwnableUnauthorizedAccount
        appraisal.ownerBatchSetAppraisalForTokensWithCards(collections, tokenIds, cardIds, prices);
    }

    function testOwnerBatchAt50ItemsSucceeds() public {
        // Mint 50 more NFTs
        for (uint256 i = 0; i < 50; i++) {
            vm.prank(owner);
            nft.mint(user);
        }

        address[] memory collections = new address[](50);
        uint256[] memory tokenIds = new uint256[](50);
        bytes32[] memory cardIds = new bytes32[](50);
        uint256[] memory prices = new uint256[](50);

        for (uint256 i = 0; i < 50; i++) {
            collections[i] = address(nft);
            tokenIds[i] = i + 1; // Token IDs 1-50
            cardIds[i] = keccak256(abi.encodePacked("card-", i));
            prices[i] = (i + 1) * 10e18;
        }

        vm.prank(owner);
        appraisal.ownerBatchSetAppraisalForTokensWithCards(collections, tokenIds, cardIds, prices);

        // Spot check
        (uint256 price50,) = appraisal.getAppraisedPrice(address(nft), 50);
        assertEq(price50, 500e18);
    }
}
