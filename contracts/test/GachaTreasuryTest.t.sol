// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Test} from "forge-std/Test.sol";
import {GachaTreasury} from "../src/gacha/GachaTreasury.sol";
import {BaseERC721} from "../src/tokens/BaseERC721.sol";
import {MockNFTAppraisal} from "./mocks/MockNFTAppraisal.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

/**
 * @title Gacha Treasury Contract Test Suite
 * @notice Comprehensive test suite for Gacha treasury functionality
 * @dev Tests NFT storage, rarity assignment, whitelist management, and distribution
 * @author NFT Gacha Team
 */
contract GachaTreasuryTest is Test {
    // ========================================================================
    // TEST STATE VARIABLES
    // ========================================================================

    /// @dev Contract instances
    GachaTreasury public treasury;
    BaseERC721 public nft;
    MockNFTAppraisal public mockAppraisal;

    /// @dev Test addresses
    address public owner = address(0x1);
    address public user = address(0x2);
    address public unauthorizedUser = address(0x3);
    address public gachaContract = address(0x999);

    /// @dev Test constants (updated to match new price ranges)
    uint256 public constant COMMON_PRICE = 10e18; // $10 (within $0-$15 range)
    uint256 public constant UNCOMMON_PRICE = 50e18; // $50 (within $25-$60 range)
    uint256 public constant RARE_PRICE = 100e18; // $100 (within $70-$250 range)
    uint256 public constant EPIC_PRICE = 500e18; // $500 (within $300-$1,200 range)
    uint256 public constant LEGENDARY_PRICE = 2000e18; // $2,000 (within $1,500+ range)

    // ========================================================================
    // EVENTS
    // ========================================================================

    event GachaContractUpdated(address indexed oldGacha, address indexed newGacha);
    event CollectionWhitelisted(address indexed collection);
    event CollectionRemovedFromWhitelist(address indexed collection);
    event NFTDeposited(
        address indexed collection, uint256 indexed tokenId, address indexed depositor, GachaTreasury.Rarity rarity
    );

    // ========================================================================
    // MODIFIERS
    // ========================================================================

    /// @dev Helper modifier to run tests as owner
    modifier asOwner() {
        vm.startPrank(owner);
        _;
        vm.stopPrank();
    }

    /// @dev Helper modifier to run tests as user
    modifier asUser() {
        vm.startPrank(user);
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
     * @dev Deploys contracts and sets up initial state
     */
    function setUp() public {
        // Deploy mock appraisal
        mockAppraisal = new MockNFTAppraisal();

        // Deploy treasury with proxy
        _deployTreasuryContract();

        // Deploy test NFT collection
        _deployTestCollection();
    }

    /**
     * @notice Deploys GachaTreasury contract with proxy pattern
     */
    function _deployTreasuryContract() internal {
        GachaTreasury treasuryImpl = new GachaTreasury();

        vm.startPrank(owner);
        uint256[5] memory minPrices = [uint256(0), 25 * 1e18, 70 * 1e18, 300 * 1e18, 1_500 * 1e18];
        uint256[5] memory maxPrices = [uint256(15 * 1e18), 60 * 1e18, 250 * 1e18, 1_200 * 1e18, type(uint256).max];
        bytes memory initData = abi.encodeWithSelector(
            GachaTreasury.initialize.selector, owner, gachaContract, address(mockAppraisal), minPrices, maxPrices
        );

        ERC1967Proxy proxy = new ERC1967Proxy(address(treasuryImpl), initData);
        treasury = GachaTreasury(address(proxy));
        vm.stopPrank();
    }

    /**
     * @notice Deploys test NFT collection
     */
    function _deployTestCollection() internal {
        nft = new BaseERC721("TestNFT", "TNFT", owner);
    }

    // ========================================================================
    // DEPLOYMENT TESTS
    // ========================================================================

    /**
     * @notice Test contract deployment
     * @dev Verifies that contract is deployed with correct initial state
     */
    function testDeployment() public view {
        assertEq(treasury.owner(), owner, "Owner should be set correctly");
        assertEq(treasury.gachaContract(), gachaContract, "Gacha contract should be set correctly");
        assertEq(treasury.getRarityCount(GachaTreasury.Rarity.Common), 0, "Initial common count should be zero");
        assertEq(treasury.getTotalItemsCount(), 0, "Initial total count should be zero");
    }

    // ========================================================================
    // WHITELIST MANAGEMENT TESTS
    // ========================================================================

    /**
     * @notice Test collection whitelisting
     * @dev Verifies that owner can whitelist collections
     */
    function testAddToWhitelist() public {
        vm.expectEmit(true, false, false, false);
        emit CollectionWhitelisted(address(nft));

        vm.startPrank(owner);
        treasury.addToWhitelist(address(nft));
        vm.stopPrank();

        assertTrue(treasury.isCollectionWhitelisted(address(nft)), "Collection should be whitelisted");
        assertEq(treasury.getWhitelistLength(), 1, "Whitelist length should be 1");

        address[] memory whitelisted = treasury.getWhitelistedCollections();
        assertEq(whitelisted.length, 1, "Should have one whitelisted collection");
        assertEq(whitelisted[0], address(nft), "Should be the correct collection");
    }

    /**
     * @notice Test collection removal from whitelist
     * @dev Verifies that owner can remove collections from whitelist
     */
    function testRemoveFromWhitelist() public {
        // First add to whitelist
        vm.startPrank(owner);
        treasury.addToWhitelist(address(nft));

        vm.expectEmit(true, false, false, false);
        emit CollectionRemovedFromWhitelist(address(nft));

        vm.startPrank(owner);
        treasury.removeFromWhitelist(address(nft));

        assertFalse(treasury.isCollectionWhitelisted(address(nft)), "Collection should not be whitelisted");
        assertEq(treasury.getWhitelistLength(), 0, "Whitelist should be empty");
    }

    /**
     * @notice Test whitelist authorization
     * @dev Verifies that only owner can manage whitelist
     */
    function testWhitelistAuthorization() public {
        // Non-owner should not be able to add to whitelist
        vm.prank(unauthorizedUser);
        vm.expectRevert();
        treasury.addToWhitelist(address(nft));

        // Non-owner should not be able to remove from whitelist
        vm.startPrank(owner);
        treasury.addToWhitelist(address(nft));
        vm.stopPrank();

        vm.prank(unauthorizedUser);
        vm.expectRevert();
        treasury.removeFromWhitelist(address(nft));
    }

    /**
     * @notice Test whitelist validation
     * @dev Verifies whitelist validation logic
     */
    function testWhitelistValidation() public {
        // Test adding already whitelisted collection
        vm.startPrank(owner);
        treasury.addToWhitelist(address(nft));
        vm.stopPrank();

        vm.startPrank(owner);
        vm.expectRevert(abi.encodeWithSelector(GachaTreasury.CollectionAlreadyWhitelisted.selector));
        treasury.addToWhitelist(address(nft));
        vm.stopPrank();

        // Remove the collection to reset state
        vm.startPrank(owner);
        treasury.removeFromWhitelist(address(nft));
        vm.stopPrank();

        // Test removing non-whitelisted collection
        vm.startPrank(owner);
        vm.expectRevert(abi.encodeWithSelector(GachaTreasury.CollectionNotInWhitelist.selector));
        treasury.removeFromWhitelist(address(nft));
        vm.stopPrank();

        // Test invalid collection address
        vm.startPrank(owner);
        vm.expectRevert(abi.encodeWithSelector(GachaTreasury.InvalidCollectionAddress.selector));
        treasury.addToWhitelist(address(0));
        vm.stopPrank();
    }

    /**
     * @notice Test multiple collections in whitelist
     * @dev Verifies that multiple collections can be whitelisted
     */
    function testMultipleCollectionsWhitelist() public {
        BaseERC721 nft2;

        vm.startPrank(owner);
        nft2 = new BaseERC721("TestNFT2", "TNFT2", owner);
        treasury.addToWhitelist(address(nft));
        treasury.addToWhitelist(address(nft2));
        vm.stopPrank();

        assertEq(treasury.getWhitelistLength(), 2, "Should have 2 whitelisted collections");
        assertTrue(treasury.isCollectionWhitelisted(address(nft)), "First collection should be whitelisted");
        assertTrue(treasury.isCollectionWhitelisted(address(nft2)), "Second collection should be whitelisted");
    }

    // ========================================================================
    // NFT DEPOSIT TESTS
    // ========================================================================

    /**
     * @notice Test NFT deposit with single rarity
     * @dev Verifies basic NFT deposit functionality
     */
    function testDepositSingleNFT() public {
        _whitelistCollection();

        vm.startPrank(owner);
        uint256 tokenId = nft.mint(owner);
        mockAppraisal.setMockAppraisal(address(nft), tokenId, COMMON_PRICE);
        nft.setApprovalForAll(address(treasury), true);
        treasury.depositNFT(address(nft), tokenId);
        vm.stopPrank();

        assertEq(treasury.getRarityCount(GachaTreasury.Rarity.Common), 1, "Should have 1 common NFT");
        assertEq(treasury.getTotalItemsCount(), 1, "Should have 1 total NFT");
        assertEq(nft.ownerOf(tokenId), address(treasury), "Treasury should own NFT");
    }

    /**
     * @notice Test NFT deposit with multiple rarities
     * @dev Verifies that different price NFTs get correct rarity assignment
     */
    function testDepositMultipleRarities() public {
        _whitelistCollection();

        vm.startPrank(owner);
        // Deposit NFTs of different rarities
        uint256 commonTokenId = nft.mint(owner);
        mockAppraisal.setMockAppraisal(address(nft), commonTokenId, COMMON_PRICE);
        nft.setApprovalForAll(address(treasury), true);
        treasury.depositNFT(address(nft), commonTokenId);

        uint256 rareTokenId = nft.mint(owner);
        mockAppraisal.setMockAppraisal(address(nft), rareTokenId, RARE_PRICE);
        treasury.depositNFT(address(nft), rareTokenId);

        uint256 legendaryTokenId = nft.mint(owner);
        mockAppraisal.setMockAppraisal(address(nft), legendaryTokenId, LEGENDARY_PRICE);
        treasury.depositNFT(address(nft), legendaryTokenId);
        vm.stopPrank();

        assertEq(treasury.getRarityCount(GachaTreasury.Rarity.Common), 1, "Should have 1 common NFT");
        assertEq(treasury.getRarityCount(GachaTreasury.Rarity.Rare), 1, "Should have 1 rare NFT");
        assertEq(treasury.getRarityCount(GachaTreasury.Rarity.Legendary), 1, "Should have 1 legendary NFT");
        assertEq(treasury.getTotalItemsCount(), 3, "Should have 3 total NFTs");
    }

    /**
     * @notice Test NFT deposit authorization
     * @dev Verifies that only NFT owner can deposit
     */
    function testDepositAuthorization() public {
        _whitelistCollection();

        vm.startPrank(owner);
        uint256 tokenId = nft.mint(user);
        vm.stopPrank();

        vm.startPrank(user);
        nft.setApprovalForAll(address(treasury), true);
        vm.stopPrank();

        vm.startPrank(owner);
        mockAppraisal.setMockAppraisal(address(nft), tokenId, COMMON_PRICE);
        vm.stopPrank();

        vm.startPrank(owner);
        vm.expectRevert(); // Should fail because owner doesn't own the NFT
        treasury.depositNFT(address(nft), tokenId);
        vm.stopPrank();
    }

    /**
     * @notice Test NFT deposit validation
     * @dev Verifies deposit validation logic
     */
    function testDepositValidation() public {
        uint256 tokenId = _mintAndApproveNFT(owner, COMMON_PRICE);

        // Should fail if collection not whitelisted
        vm.startPrank(owner);
        vm.expectRevert(abi.encodeWithSelector(GachaTreasury.CollectionNotWhitelisted.selector));
        treasury.depositNFT(address(nft), tokenId);
        vm.stopPrank();

        // Should succeed after whitelisting
        _whitelistCollection();

        vm.startPrank(owner);
        treasury.depositNFT(address(nft), tokenId);
        vm.stopPrank();

        assertEq(treasury.getRarityCount(GachaTreasury.Rarity.Common), 1, "Deposit should succeed after whitelisting");
    }

    // ========================================================================
    // NFT WITHDRAWAL TESTS
    // ========================================================================

    /**
     * @notice Test NFT withdrawal
     * @dev Verifies that depositor can withdraw their NFT
     */
    function testWithdrawMyNFT() public {
        _whitelistCollection();

        uint256 tokenId = _mintAndApproveNFT(owner, EPIC_PRICE);

        vm.startPrank(owner);
        treasury.depositNFT(address(nft), tokenId);
        vm.stopPrank();

        vm.startPrank(owner);
        treasury.withdrawMyNFT(address(nft), tokenId);
        vm.stopPrank();

        assertEq(treasury.getRarityCount(GachaTreasury.Rarity.Epic), 0, "Should have 0 epic NFTs");
        assertEq(nft.ownerOf(tokenId), owner, "Owner should own withdrawn NFT");
    }

    /**
     * @notice Test NFT withdrawal authorization
     * @dev Verifies that only depositor can withdraw their NFT
     */
    function testWithdrawalAuthorization() public {
        _whitelistCollection();

        uint256 tokenId = _mintAndApproveNFT(owner, COMMON_PRICE);

        vm.startPrank(owner);
        treasury.depositNFT(address(nft), tokenId);
        vm.stopPrank();

        vm.startPrank(user);
        vm.expectRevert(abi.encodeWithSelector(GachaTreasury.NotNFTDepositor.selector));
        treasury.withdrawMyNFT(address(nft), tokenId);
        vm.stopPrank();
    }

    // ========================================================================
    // GACHA INTEGRATION TESTS
    // ========================================================================

    /**
     * @notice Test NFT distribution to winner
     * @dev Verifies that gacha contract can distribute NFTs
     */
    function testSendNFTToWinner() public {
        _whitelistCollection();

        uint256 tokenId = _mintAndApproveNFT(owner, EPIC_PRICE);
        address winner = address(0x456);

        vm.startPrank(owner);
        treasury.depositNFT(address(nft), tokenId);
        treasury.setGachaContract(address(this));
        vm.stopPrank();

        // Check initial deposit counts
        assertEq(treasury.getUserDepositCount(owner, GachaTreasury.Rarity.Epic), 1, "Should have 1 epic deposit");

        // Simulate gacha contract sending NFT to winner
        vm.prank(address(this));
        GachaTreasury.NFTItem memory item = treasury.sendNFTToWinner(GachaTreasury.Rarity.Epic, 0, winner);

        assertEq(treasury.getRarityCount(GachaTreasury.Rarity.Epic), 0, "Should have 0 epic NFTs");
        assertEq(nft.ownerOf(tokenId), winner, "Winner should own NFT");
        assertEq(item.collection, address(nft), "Item should have correct collection");
        assertEq(item.tokenId, tokenId, "Item should have correct token ID");
        assertEq(uint8(item.rarity), uint8(GachaTreasury.Rarity.Epic), "Item should have correct rarity");
        assertEq(item.appraisedPrice, EPIC_PRICE, "Item should have correct price");
    }

    /**
     * @notice Test gacha authorization
     * @dev Verifies that only authorized gacha contract can distribute NFTs
     */
    function testGachaAuthorization() public {
        _whitelistCollection();

        uint256 tokenId = _mintAndApproveNFT(owner, EPIC_PRICE);

        vm.startPrank(owner);
        treasury.depositNFT(address(nft), tokenId);
        vm.stopPrank();

        vm.startPrank(user);
        vm.expectRevert(abi.encodeWithSelector(GachaTreasury.UnauthorizedGachaContract.selector));
        treasury.sendNFTToWinner(GachaTreasury.Rarity.Epic, 0, user);
        vm.stopPrank();
    }

    // ========================================================================
    // RARITY ASSIGNMENT TESTS
    // ========================================================================

    /**
     * @notice Test precise rarity boundary conditions
     * @dev Verifies exact price boundary logic for rarity assignment
     */
    function testPreciseRarityBoundaries() public {
        _whitelistCollection();

        // Test exact boundary values based on new price ranges
        uint256[] memory prices = new uint256[](6);
        GachaTreasury.Rarity[] memory expectedRarities = new GachaTreasury.Rarity[](6);

        prices[0] = 10e18; // Common: $10 (within $0-$15 range)
        expectedRarities[0] = GachaTreasury.Rarity.Common;

        prices[1] = 25e18; // Uncommon: $25 (exact boundary)
        expectedRarities[1] = GachaTreasury.Rarity.Uncommon;

        prices[2] = 70e18; // Rare: $70 (exact boundary)
        expectedRarities[2] = GachaTreasury.Rarity.Rare;

        prices[3] = 300e18; // Epic: $300 (exact boundary)
        expectedRarities[3] = GachaTreasury.Rarity.Epic;

        prices[4] = 1500e18; // Legendary: $1500 (exact boundary)
        expectedRarities[4] = GachaTreasury.Rarity.Legendary;

        prices[5] = 5000e18; // Legendary: $5000 (above boundary)
        expectedRarities[5] = GachaTreasury.Rarity.Legendary;

        // Deposit NFTs and verify rarity assignment
        for (uint256 i = 0; i < prices.length; i++) {
            uint256 tokenId = _mintAndApproveNFT(owner, prices[i]);

            vm.startPrank(owner);
            treasury.depositNFT(address(nft), tokenId);
            vm.stopPrank();

            uint256 expectedCount = (expectedRarities[i] == GachaTreasury.Rarity.Legendary && i == 5) ? 2 : 1;
            assertEq(
                treasury.getRarityCount(expectedRarities[i]),
                expectedCount,
                string(
                    abi.encodePacked(
                        "Should have ", _toString(expectedCount), " ", _rarityToString(expectedRarities[i]), " NFT(s)"
                    )
                )
            );
        }
    }

    /**
     * @notice Test rarity pool management
     * @dev Verifies that rarity pools are managed correctly
     */
    function testRarityPoolManagement() public {
        _whitelistCollection();

        // Deposit multiple NFTs of same rarity
        uint256[] memory tokenIds = new uint256[](3);
        for (uint256 i = 0; i < 3; i++) {
            tokenIds[i] = _mintAndApproveNFT(owner, COMMON_PRICE);

            vm.startPrank(owner);
            treasury.depositNFT(address(nft), tokenIds[i]);
            vm.stopPrank();
        }

        assertEq(treasury.getRarityCount(GachaTreasury.Rarity.Common), 3, "Should have 3 common NFTs");

        // Get treasury items
        GachaTreasury.NFTItem[] memory items = treasury.getTreasuryItems(GachaTreasury.Rarity.Common);
        assertEq(items.length, 3, "Should have 3 items in common pool");

        // Verify item details
        for (uint256 i = 0; i < items.length; i++) {
            assertEq(items[i].collection, address(nft), "Collection should be correct");
            assertEq(items[i].appraisedPrice, COMMON_PRICE, "Price should be correct");
            assertEq(uint8(items[i].rarity), uint8(GachaTreasury.Rarity.Common), "Rarity should be correct");
        }
    }

    // ========================================================================
    // CONFIGURATION TESTS
    // ========================================================================

    /**
     * @notice Test gacha contract update
     * @dev Verifies that owner can update gacha contract
     */
    function testUpdateGachaContract() public {
        address newGachaContract = address(0x123);

        vm.expectEmit(true, true, false, false);
        emit GachaContractUpdated(gachaContract, newGachaContract);

        vm.startPrank(owner);
        treasury.setGachaContract(newGachaContract);
        vm.stopPrank();

        assertEq(treasury.gachaContract(), newGachaContract, "Gacha contract should be updated");
    }

    /**
     * @notice Test ownership transfer
     * @dev Verifies that ownership can be transferred
     */
    function testTransferOwnership() public {
        address newOwner = address(0x3);

        vm.startPrank(owner);
        treasury.transferOwnership(newOwner);
        vm.stopPrank();

        assertEq(treasury.owner(), newOwner, "Ownership should be transferred");
    }

    // ========================================================================
    // AVAILABILITY TESTS
    // ========================================================================

    /**
     * @notice Test gacha availability logic
     * @dev Verifies gacha availability conditions
     */
    function testGachaAvailability() public {
        // Initially should be false (empty whitelist)
        assertFalse(treasury.isGachaAvailable(), "Should not be available with empty whitelist");

        _whitelistCollection();

        // Still false (whitelisted but no NFTs)
        assertFalse(treasury.isGachaAvailable(), "Should not be available with no NFTs");

        // Add NFT
        uint256 tokenId = _mintAndApproveNFT(owner, COMMON_PRICE);

        vm.startPrank(owner);
        treasury.depositNFT(address(nft), tokenId);
        vm.stopPrank();

        // Now should be available
        assertTrue(treasury.isGachaAvailable(), "Should be available with NFTs");
    }

    // ========================================================================
    // EDGE CASE TESTS
    // ========================================================================

    /**
     * @notice Test edge case: empty rarity pool selection
     * @dev Verifies behavior when selecting from empty rarity pool
     */
    function testEmptyRarityPool() public {
        _whitelistCollection();

        // Try to send NFT from empty epic pool
        vm.startPrank(owner);
        treasury.setGachaContract(address(this));
        vm.stopPrank();

        vm.prank(address(this));
        vm.expectRevert(); // Should fail - empty pool
        treasury.sendNFTToWinner(GachaTreasury.Rarity.Epic, 0, user);
    }

    /**
     * @notice Test edge case: maximum NFT deposits
     * @dev Verifies behavior with large number of deposits
     */
    function testMaximumDeposits() public {
        _whitelistCollection();

        // Deposit many NFTs
        uint256 numDeposits = 100;
        for (uint256 i = 0; i < numDeposits; i++) {
            uint256 tokenId = _mintAndApproveNFT(owner, COMMON_PRICE);

            vm.startPrank(owner);
            treasury.depositNFT(address(nft), tokenId);
            vm.stopPrank();
        }

        assertEq(treasury.getRarityCount(GachaTreasury.Rarity.Common), numDeposits, "Should have all deposits");
        assertEq(treasury.getTotalItemsCount(), numDeposits, "Total count should match");
    }

    // ========================================================================
    // HELPER FUNCTIONS
    // ========================================================================

    /**
     * @notice Helper function to whitelist collection
     */
    function _whitelistCollection() internal {
        vm.startPrank(owner);
        treasury.addToWhitelist(address(nft));
        vm.stopPrank();
    }

    /**
     * @notice Helper function to mint and approve NFT
     * @param to Address to mint NFT to
     * @param price Appraisal price for NFT
     * @return tokenId The minted token ID
     */
    function _mintAndApproveNFT(address to, uint256 price) internal returns (uint256) {
        vm.startPrank(to);
        uint256 tokenId = nft.mint(to);
        nft.setApprovalForAll(address(treasury), true);
        vm.stopPrank();

        mockAppraisal.setMockAppraisal(address(nft), tokenId, price);

        return tokenId;
    }

    /**
     * @notice Helper function to convert rarity to string
     * @param rarity The rarity enum value
     * @return String representation of rarity
     */
    function _rarityToString(GachaTreasury.Rarity rarity) internal pure returns (string memory) {
        if (rarity == GachaTreasury.Rarity.Common) return "Common";
        if (rarity == GachaTreasury.Rarity.Uncommon) return "Uncommon";
        if (rarity == GachaTreasury.Rarity.Rare) return "Rare";
        if (rarity == GachaTreasury.Rarity.Epic) return "Epic";
        if (rarity == GachaTreasury.Rarity.Legendary) return "Legendary";
        return "Unknown";
    }

    /**
     * @notice Helper function to convert uint to string
     * @param value The uint value
     * @return String representation of value
     */
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    /**
     * @notice Helper function to get user deposit count
     * @param userAddress User address
     * @param rarity Rarity type
     * @return Deposit count
     */
    function _getUserDepositCount(address userAddress, GachaTreasury.Rarity rarity) internal view returns (uint256) {
        return treasury.getUserDepositCount(userAddress, rarity);
    }

    /**
     * @notice Helper function to get user total deposit count
     * @param userAddress User address
     * @return Total deposit count
     */
    function _getUserTotalDepositCount(address userAddress) internal view returns (uint256) {
        return treasury.getUserTotalDepositCount(userAddress);
    }
}
