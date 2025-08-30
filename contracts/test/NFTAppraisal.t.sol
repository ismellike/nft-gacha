// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Test, console2} from "forge-std/Test.sol";
import {NFTAppraisal} from "../src/NFTAppraisal.sol";
import {SimpleERC721} from "../src/SimpleERC721.sol";
import {TestToken} from "../src/TestToken.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract NFTAppraisalTest is Test {
    NFTAppraisal public appraisal;
    SimpleERC721 public nft;
    TestToken public feeToken;

    address public owner = makeAddr("owner");
    address public oracle = makeAddr("oracle");
    address public user = makeAddr("user");
    address public protocol = makeAddr("protocol");

    uint256 public constant APPRAISAL_FEE = 10e18; // 10 tokens
    uint256 public constant NFT_PRICE_100 = 100e18; // $100
    uint256 public constant NFT_PRICE_1000 = 1000e18; // $1000

    event AppraisalRequested(
        address indexed collection, uint256 indexed tokenId, address indexed requester, uint256 fee, uint256 timestamp
    );

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

    function setUp() public {
        // Deploy contracts
        feeToken = new TestToken("Fee Token", "FEE", address(this));
        nft = new SimpleERC721("Test NFT", "TNFT");

        vm.prank(owner);
        appraisal = new NFTAppraisal(owner, address(feeToken), APPRAISAL_FEE, protocol);

        // Setup initial state
        feeToken.mint(user, 1000e18);
        // Note: NFT is owned by test contract (address(this)), so we can mint directly
        nft.mint(user);
        nft.mint(user);
        nft.mint(user); // Add third NFT for tokenId 2

        // Set service handler
        vm.prank(owner);
        appraisal.setServiceHandler(oracle);

        // Approve fee tokens
        vm.prank(user);
        feeToken.approve(address(appraisal), type(uint256).max);
    }

    function testRequestAppraisal() public {
        uint256 tokenId = 1;
        uint256 protocolBalanceBefore = feeToken.balanceOf(protocol);

        vm.expectEmit(true, true, true, false);
        emit AppraisalRequested(address(nft), tokenId, user, 10e18, block.timestamp);

        vm.prank(user);
        appraisal.requestAppraisal(address(nft), tokenId);

        // Check exact fee amount was transferred
        assertEq(
            feeToken.balanceOf(protocol), protocolBalanceBefore + 10e18, "Protocol should receive exactly 10 tokens"
        );

        // Check request via composed getter
        NFTAppraisal.Appraisal memory info0 = appraisal.getAppraisal(address(nft), tokenId);
        assertEq(info0.requester, user, "Requester should be user");
        assertEq(info0.priceUSD, 0, "Initial price should be 0");
        assertEq(uint256(info0.status), uint256(NFTAppraisal.AppraisalStatus.Pending), "Status should be Pending");
        assertGt(info0.timestamp, 0, "Timestamp should be set");
        assertEq(info0.lastUpdated, 0, "LastUpdated should be 0 initially");
    }

    function testRequestAppraisalRevertsForInvalidCollection() public {
        vm.prank(user);
        vm.expectRevert(NFTAppraisal.InvalidCollection.selector);
        appraisal.requestAppraisal(address(0), 1);
    }

    function testRequestAppraisalRevertsForInvalidTokenId() public {
        vm.prank(user);
        vm.expectRevert(NFTAppraisal.InvalidTokenId.selector);
        appraisal.requestAppraisal(address(nft), 999);
    }

    function testRequestAppraisalRevertsForDuplicate() public {
        vm.prank(user);
        appraisal.requestAppraisal(address(nft), 1);

        vm.prank(user);
        vm.expectRevert(NFTAppraisal.AppraisalAlreadyExists.selector);
        appraisal.requestAppraisal(address(nft), 1);
    }

    function testSetAppraisedPrice() public {
        uint256 tokenId = 1;

        // Request appraisal first
        vm.prank(user);
        appraisal.requestAppraisal(address(nft), tokenId);

        vm.expectEmit(true, true, true, false);
        emit AppraisalCompleted(address(nft), tokenId, 100e18, oracle, block.timestamp);

        vm.prank(oracle);
        appraisal.setAppraisalForTokenWithCard(address(nft), tokenId, keccak256("card-1a"), 100e18);

        // Check appraisal was updated with exact values
        (uint256 price, NFTAppraisal.AppraisalStatus status) = appraisal.getAppraisedPrice(address(nft), tokenId);

        assertEq(price, 100e18, "Price should be exactly $100");
        assertEq(uint256(status), uint256(NFTAppraisal.AppraisalStatus.Completed), "Status should be Completed");

        assertTrue(appraisal.hasAppraisal(address(nft), tokenId), "Should have completed appraisal");
    }

    function testSetAppraisedPriceRevertsForUnauthorized() public {
        vm.prank(user);
        appraisal.requestAppraisal(address(nft), 1);

        vm.prank(user);
        vm.expectRevert(NFTAppraisal.UnauthorizedServiceHandler.selector);
        appraisal.setAppraisalForTokenWithCard(address(nft), 1, keccak256("card-unauth2"), NFT_PRICE_100);
    }

    function testSetAppraisedPriceRevertsForNonexistentAppraisal() public {
        vm.prank(oracle);
        vm.expectRevert(NFTAppraisal.AppraisalNotFound.selector);
        appraisal.setAppraisalForTokenWithCard(address(nft), 1, keccak256("card-notfound"), NFT_PRICE_100);
    }

    function testSetAppraisedPriceRevertsForZeroPrice() public {
        vm.prank(user);
        appraisal.requestAppraisal(address(nft), 1);

        vm.prank(oracle);
        vm.expectRevert(NFTAppraisal.InvalidPrice.selector);
        appraisal.setAppraisalForTokenWithCard(address(nft), 1, keccak256("card-zero2"), 0);
    }

    function testOverrideCardAppraisal() public {
        uint256 tokenId = 1;
        bytes32 cardId = keccak256(abi.encodePacked("card-ovr"));

        // Request and complete appraisal first
        vm.prank(user);
        appraisal.requestAppraisal(address(nft), tokenId);

        vm.prank(oracle);
        appraisal.setAppraisalForTokenWithCard(address(nft), tokenId, cardId, 100e18);

        vm.prank(owner);
        appraisal.overrideCardAppraisal(cardId, 1000e18);

        // Check override worked with exact values
        (uint256 price, NFTAppraisal.AppraisalStatus status) = appraisal.getAppraisedPrice(address(nft), tokenId);

        assertEq(price, 1000e18, "Overridden price should be exactly $1000");
        assertEq(uint256(status), uint256(NFTAppraisal.AppraisalStatus.OwnerOverride), "Status should be OwnerOverride");
    }

    function testOverrideAppraisalThenLinkToken() public {
        uint256 tokenId = 2;
        bytes32 cardId = keccak256(abi.encodePacked("card-new"));

        // Override card first (no token linked yet)
        vm.prank(owner);
        appraisal.overrideCardAppraisal(cardId, 1000e18);

        // Link token to the overridden card via service handler
        vm.prank(user);
        appraisal.requestAppraisal(address(nft), tokenId);

        vm.prank(oracle);
        appraisal.setAppraisalForTokenWithCard(address(nft), tokenId, cardId, 1000e18);

        (uint256 price, NFTAppraisal.AppraisalStatus status) = appraisal.getAppraisedPrice(address(nft), tokenId);
        assertEq(price, 1000e18, "Price should reflect overridden card price");
        assertEq(uint256(status), uint256(NFTAppraisal.AppraisalStatus.Completed), "Should be completed after link");
        assertTrue(appraisal.hasAppraisal(address(nft), tokenId), "Should have completed appraisal");
    }

    // Oracle auth model removed; using a single service handler.

    function testSetAppraisalFee() public {
        uint256 newFee = 20e18;

        vm.prank(owner);
        appraisal.setAppraisalFee(newFee);

        assertEq(appraisal.appraisalFee(), 20e18, "Appraisal fee should be exactly 20 tokens");

        // Test that new fee is charged for subsequent appraisals
        // First approve the new fee amount
        vm.prank(user);
        feeToken.approve(address(appraisal), 20e18);

        uint256 protocolBalanceBefore = feeToken.balanceOf(protocol);
        vm.prank(user);
        appraisal.requestAppraisal(address(nft), 1);

        assertEq(
            feeToken.balanceOf(protocol),
            protocolBalanceBefore + 20e18,
            "Protocol should receive exactly 20 tokens with new fee"
        );
    }

    function testSetFeeToken() public {
        TestToken newFeeToken = new TestToken("New Fee", "NFEE", address(this));

        vm.prank(owner);
        appraisal.setFeeToken(address(newFeeToken));

        assertEq(address(appraisal.feeToken()), address(newFeeToken));
    }

    function testSetProtocolAddress() public {
        address newProtocol = makeAddr("newProtocol");

        vm.prank(owner);
        appraisal.setProtocolAddress(newProtocol);

        assertEq(appraisal.protocolAddress(), newProtocol);
    }

    function testEmergencyPause() public {
        vm.prank(owner);
        appraisal.emergencyPause();

        assertTrue(appraisal.paused());

        vm.prank(user);
        vm.expectRevert();
        appraisal.requestAppraisal(address(nft), 1);
    }

    function testEmergencyUnpause() public {
        vm.prank(owner);
        appraisal.emergencyPause();

        vm.prank(owner);
        appraisal.emergencyUnpause();

        assertFalse(appraisal.paused());

        // Should be able to request appraisal again
        vm.prank(user);
        appraisal.requestAppraisal(address(nft), 1);
    }

    function testGetAppraisal() public {
        uint256 tokenId = 1;

        vm.prank(user);
        appraisal.requestAppraisal(address(nft), tokenId);

        vm.prank(oracle);
        appraisal.setAppraisalForTokenWithCard(address(nft), tokenId, keccak256("card-get2"), 100e18);

        NFTAppraisal.Appraisal memory result = appraisal.getAppraisal(address(nft), tokenId);

        assertEq(result.requester, user, "Requester should be user");
        assertEq(result.priceUSD, 100e18, "Price should be exactly $100");
        assertEq(uint256(result.status), uint256(NFTAppraisal.AppraisalStatus.Completed), "Status should be Completed");
        assertGt(result.timestamp, 0, "Timestamp should be set");
        assertGt(result.lastUpdated, 0, "LastUpdated should be set after completion");
    }

    function testHasAppraisal() public {
        uint256 tokenId = 1;

        assertFalse(appraisal.hasAppraisal(address(nft), tokenId), "Should not have appraisal initially");

        vm.prank(user);
        appraisal.requestAppraisal(address(nft), tokenId);

        assertFalse(appraisal.hasAppraisal(address(nft), tokenId), "Should not have appraisal after request (pending)");

        vm.prank(oracle);
        appraisal.setAppraisalForTokenWithCard(address(nft), tokenId, keccak256("card-has"), 100e18);

        assertTrue(
            appraisal.hasAppraisal(address(nft), tokenId), "Should have appraisal after completion with $100 price"
        );
    }

    function testMultipleAppraisalsFeeAccuracy() public {
        // First mint the NFTs to user
        nft.mint(user); // tokenId 1
        nft.mint(user); // tokenId 2
        nft.mint(user); // tokenId 3

        uint256 protocolInitialBalance = feeToken.balanceOf(protocol);
        uint256 userInitialBalance = feeToken.balanceOf(user);

        // Request 3 appraisals with exact fee calculations
        vm.prank(user);
        appraisal.requestAppraisal(address(nft), 1);

        vm.prank(user);
        appraisal.requestAppraisal(address(nft), 2);

        vm.prank(user);
        appraisal.requestAppraisal(address(nft), 3);

        // Check exact fee deductions and protocol receipts
        uint256 totalFeesPaid = 30e18; // 3 x 10e18
        assertEq(
            feeToken.balanceOf(protocol),
            protocolInitialBalance + totalFeesPaid,
            "Protocol should receive exactly 30 tokens (3x10)"
        );
        assertEq(
            feeToken.balanceOf(user), userInitialBalance - totalFeesPaid, "User should pay exactly 30 tokens (3x10)"
        );

        // Complete appraisals with different prices
        vm.prank(oracle);
        appraisal.setAppraisalForTokenWithCard(address(nft), 1, keccak256("card-1-50"), 50e18); // $50

        vm.prank(oracle);
        appraisal.setAppraisalForTokenWithCard(address(nft), 2, keccak256("card-2-500"), 500e18); // $500

        vm.prank(oracle);
        appraisal.setAppraisalForTokenWithCard(address(nft), 3, keccak256("card-3-5000"), 5000e18); // $5000

        // Verify all appraisals completed with exact prices
        (uint256 price1,) = appraisal.getAppraisedPrice(address(nft), 1);
        (uint256 price2,) = appraisal.getAppraisedPrice(address(nft), 2);
        (uint256 price3,) = appraisal.getAppraisedPrice(address(nft), 3);

        assertEq(price1, 50e18, "First NFT should be appraised at exactly $50");
        assertEq(price2, 500e18, "Second NFT should be appraised at exactly $500");
        assertEq(price3, 5000e18, "Third NFT should be appraised at exactly $5000");

        assertTrue(appraisal.hasAppraisal(address(nft), 1), "First NFT should have completed appraisal");
        assertTrue(appraisal.hasAppraisal(address(nft), 2), "Second NFT should have completed appraisal");
        assertTrue(appraisal.hasAppraisal(address(nft), 3), "Third NFT should have completed appraisal");
    }
}
