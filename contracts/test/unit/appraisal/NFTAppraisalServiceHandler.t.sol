// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {StandardTest} from "../../helpers/StandardTest.sol";
import {NFTAppraisalServiceHandler} from "../../../src/appraisal/NFTAppraisalServiceHandler.sol";
import {MockNFTAppraisal} from "../../mocks/MockNFTAppraisal.sol";
import {MockWavsServiceManager} from "../../mocks/MockWavsServiceManager.sol";
import {IWavsServiceManager} from "@wavs/eigenlayer/ecdsa/interfaces/IWavsServiceManager.sol";

/**
 * @title NFTAppraisalServiceHandler Test Suite
 * @notice Basic unit tests for the WAVS service handler
 * @dev Tests deployment, view functions, and basic configuration
 */
contract NFTAppraisalServiceHandlerTest is StandardTest {
    NFTAppraisalServiceHandler public handler;
    MockWavsServiceManager public mockWavsManager;
    MockNFTAppraisal public mockAppraisal;

    address public collection;

    function setUp() public {
        mockWavsManager = new MockWavsServiceManager();
        mockAppraisal = new MockNFTAppraisal();
        collection = makeAddr("collection");

        handler = new NFTAppraisalServiceHandler(IWavsServiceManager(address(mockWavsManager)), address(mockAppraisal));
    }

    function testDeployment() public view {
        assertEq(address(handler.getServiceManager()), address(mockWavsManager));
        assertEq(handler.getAppraisalContract(), address(mockAppraisal));
    }

    function testDeploymentFailsWithZeroServiceManager() public {
        vm.expectRevert(abi.encodeWithSelector(NFTAppraisalServiceHandler.InvalidServiceManager.selector));
        new NFTAppraisalServiceHandler(IWavsServiceManager(address(0)), address(mockAppraisal));
    }

    function testDeploymentFailsWithZeroAppraisal() public {
        vm.expectRevert(abi.encodeWithSelector(NFTAppraisalServiceHandler.InvalidAppraisalContract.selector));
        new NFTAppraisalServiceHandler(IWavsServiceManager(address(mockWavsManager)), address(0));
    }

    function testGetServiceManager() public view {
        assertEq(handler.getServiceManager(), address(mockWavsManager));
    }

    function testGetAppraisalContract() public view {
        assertEq(handler.getAppraisalContract(), address(mockAppraisal));
    }

    function testCheckAppraisalExists() public {
        // Setup mock appraisal
        uint256 priceUSD = 100e18;
        mockAppraisal.setMockAppraisal(collection, 1, priceUSD);

        // Check appraisal
        (bool exists, uint256 appraisedPrice) = handler.checkAppraisal(collection, 1);

        assertTrue(exists, "Appraisal should exist");
        assertEq(appraisedPrice, priceUSD, "Price should match");
    }

    function testCheckAppraisalNonExistent() public view {
        (bool exists, uint256 appraisedPrice) = handler.checkAppraisal(collection, 999);

        assertTrue(!exists, "Appraisal should not exist");
        assertEq(appraisedPrice, 0, "Price should be 0");
    }

    function testCheckAppraisalZeroPrice() public {
        // Setup mock appraisal with zero price
        mockAppraisal.setMockAppraisal(collection, 2, 0);

        (bool exists, uint256 appraisedPrice) = handler.checkAppraisal(collection, 2);

        assertTrue(!exists, "Zero price appraisal should not count as existing");
        assertEq(appraisedPrice, 0, "Price should be 0");
    }

    function testCheckAppraisalMultipleTokens() public {
        // Setup multiple appraisals
        mockAppraisal.setMockAppraisal(collection, 1, 50e18);
        mockAppraisal.setMockAppraisal(collection, 2, 100e18);
        mockAppraisal.setMockAppraisal(collection, 3, 200e18);

        (bool exists1, uint256 price1) = handler.checkAppraisal(collection, 1);
        (bool exists2, uint256 price2) = handler.checkAppraisal(collection, 2);
        (bool exists3, uint256 price3) = handler.checkAppraisal(collection, 3);

        assertTrue(exists1, "Token 1 should exist");
        assertTrue(exists2, "Token 2 should exist");
        assertTrue(exists3, "Token 3 should exist");

        assertEq(price1, 50e18, "Token 1 price incorrect");
        assertEq(price2, 100e18, "Token 2 price incorrect");
        assertEq(price3, 200e18, "Token 3 price incorrect");
    }

    function testCheckAppraisalDifferentCollections() public {
        address collection1 = makeAddr("collection1");
        address collection2 = makeAddr("collection2");

        mockAppraisal.setMockAppraisal(collection1, 1, 100e18);
        mockAppraisal.setMockAppraisal(collection2, 1, 200e18);

        (bool exists1, uint256 price1) = handler.checkAppraisal(collection1, 1);
        (bool exists2, uint256 price2) = handler.checkAppraisal(collection2, 1);

        assertTrue(exists1, "Collection1 token should exist");
        assertTrue(exists2, "Collection2 token should exist");

        assertEq(price1, 100e18, "Collection1 price incorrect");
        assertEq(price2, 200e18, "Collection2 price incorrect");
    }
}
