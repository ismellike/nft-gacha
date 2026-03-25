// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Test} from "forge-std/Test.sol";
import {GachaTreasury} from "../../src/gacha/GachaTreasury.sol";
import {Gacha} from "../../src/gacha/Gacha.sol";
import {NFTAppraisal} from "../../src/appraisal/NFTAppraisal.sol";
import {GachaEconomyManager} from "../../src/economy/GachaEconomyManager.sol";
import {CardGroupedVault} from "../../src/economy/CardGroupedVault.sol";
import {ProtocolTreasury} from "../../src/economy/ProtocolTreasury.sol";
import {MockNFTAppraisal} from "../mocks/MockNFTAppraisal.sol";
import {MockCardGroupedVault} from "../mocks/MockCardGroupedVault.sol";
import {MockProtocolTreasury} from "../mocks/MockProtocolTreasury.sol";
import {MockERC721} from "../mocks/MockERC721.sol";
import {MockERC20} from "../mocks/MockERC20.sol";

/**
 * @title Gas Snapshots Test
 * @notice Gas usage tests for key operations
 * @dev Tracks gas consumption for regression detection
 */
contract GasSnapshots is Test {
    // ========================================================================
    // STATE VARIABLES
    // ========================================================================

    GachaTreasury treasury;
    Gacha gacha;
    NFTAppraisal appraisal;
    GachaEconomyManager economy;
    CardGroupedVault vault;
    ProtocolTreasury protocolTreasury;

    MockNFTAppraisal mockAppraisal;
    MockCardGroupedVault mockVault;
    MockProtocolTreasury mockProtocolTreasury;

    MockERC721 nftCollection;
    MockERC20 usdc;

    address owner = address(this);
    address user = address(0x1);
    address gachaContract = address(0x999);

    uint256 constant COMMON_PRICE = 10e18;
    uint256 constant UNCOMMON_PRICE = 50e18;
    uint256 constant RARE_PRICE = 100e18;
    uint256 constant SPIN_FEE = 0.01 ether;

    // ========================================================================
    // SETUP
    // ========================================================================

    function setUp() public {
        // Deploy mock contracts
        mockAppraisal = new MockNFTAppraisal();
        mockVault = new MockCardGroupedVault(address(0x1));
        mockProtocolTreasury = new MockProtocolTreasury();
        nftCollection = new MockERC721("Mock NFT", "MNFT");
        usdc = new MockERC20("USDC", "USDC", 6);

        // Deploy treasury
        treasury = GachaTreasury(payable(address(new GachaTreasury())));

        // Initialize treasury with price ranges
        uint256[] memory minPrices = new uint256[](5);
        minPrices[0] = uint256(0); // Common
        minPrices[1] = uint256(15.01e18); // Uncommon
        minPrices[2] = uint256(60.01e18); // Rare
        minPrices[3] = uint256(250.01e18); // Epic
        minPrices[4] = uint256(1200.01e18); // Legendary

        uint256[] memory maxPrices = new uint256[](5);
        maxPrices[0] = uint256(15e18); // Common
        maxPrices[1] = uint256(60e18); // Uncommon
        maxPrices[2] = uint256(250e18); // Rare
        maxPrices[3] = uint256(1200e18); // Epic
        maxPrices[4] = uint256(type(uint256).max); // Legendary (no max)

        string[] memory rarityNames = new string[](5);
        rarityNames[0] = "Common";
        rarityNames[1] = "Uncommon";
        rarityNames[2] = "Rare";
        rarityNames[3] = "Epic";
        rarityNames[4] = "Legendary";

        vm.prank(owner);
        treasury.initialize(owner, gachaContract, address(mockAppraisal), uint8(5), rarityNames, minPrices, maxPrices);

        // Set vault and protocol addresses
        vm.prank(owner);
        treasury.setCardGroupedVault(address(mockVault));
        vm.prank(owner);
        treasury.setProtocolTreasury(address(mockProtocolTreasury));

        // Whitelist collection
        vm.prank(owner);
        treasury.addToWhitelist(address(nftCollection));

        // Mint NFTs and tokens
        for (uint256 i = 0; i < 50; i++) {
            nftCollection.mint(user, i);
        }
        usdc.mint(user, type(uint256).max);
    }

    // ========================================================================
    // NFT DEPOSIT GAS TESTS
    // ========================================================================

    /**
     * @notice Gas snapshot: Single NFT deposit
     */
    function testGas_DepositNFT() public {
        uint256 tokenId = 0;
        mockAppraisal.setMockAppraisal(address(nftCollection), tokenId, COMMON_PRICE);

        vm.startPrank(user);
        nftCollection.approve(address(treasury), tokenId);

        treasury.depositNFT(address(nftCollection), tokenId);
        vm.stopPrank();
    }

    /**
     * @notice Gas snapshot: Batch NFT deposit (10 NFTs)
     */
    function testGas_BatchDepositNFT() public {
        uint256[] memory tokenIds = new uint256[](10);
        for (uint256 i = 0; i < 10; i++) {
            tokenIds[i] = i;
            mockAppraisal.setMockAppraisal(address(nftCollection), i, COMMON_PRICE);
        }

        vm.startPrank(user);
        nftCollection.setApprovalForAll(address(treasury), true);

        treasury.batchDepositNFT(_toAddressArray(address(nftCollection), tokenIds.length), tokenIds);
        vm.stopPrank();
    }

    // ========================================================================
    // GACHA SPIN GAS TESTS
    // ========================================================================

    /**
     * @notice Gas snapshot: Gacha spin
     */
    function testGas_Spin() public {
        // Setup gacha contract would go here
        // For now, we'll test the treasury side operations
        uint256 tokenId = 0;
        mockAppraisal.setMockAppraisal(address(nftCollection), tokenId, COMMON_PRICE);

        vm.prank(user);
        nftCollection.approve(address(treasury), tokenId);

        vm.prank(user);
        treasury.depositNFT(address(nftCollection), tokenId);

        // Note: Full spin test would require deployed Gacha contract
        // This is a placeholder showing where the test would go
    }

    // ========================================================================
    // NFT WITHDRAWAL GAS TESTS
    // ========================================================================

    /**
     * @notice Gas snapshot: NFT withdrawal
     */
    function testGas_WithdrawNFT() public {
        uint256 tokenId = 0;
        mockAppraisal.setMockAppraisal(address(nftCollection), tokenId, COMMON_PRICE);

        vm.prank(user);
        nftCollection.approve(address(treasury), tokenId);

        vm.prank(user);
        treasury.depositNFT(address(nftCollection), tokenId);

        vm.prank(user);
        treasury.withdrawMyNFT(address(nftCollection), tokenId);
    }

    // ========================================================================
    // BATCH OPERATIONS GAS TESTS
    // ========================================================================

    /**
     * @notice Gas snapshot: Batch deposit (50 NFTs - max)
     */
    function testGas_BatchDepositMax() public {
        uint256[] memory tokenIds = new uint256[](50);
        for (uint256 i = 0; i < 50; i++) {
            tokenIds[i] = i;
            mockAppraisal.setMockAppraisal(address(nftCollection), i, COMMON_PRICE);
        }

        vm.startPrank(user);
        nftCollection.setApprovalForAll(address(treasury), true);

        treasury.batchDepositNFT(_toAddressArray(address(nftCollection), tokenIds.length), tokenIds);
        vm.stopPrank();
    }

    // ========================================================================
    // YIELD DISTRIBUTION GAS TESTS
    // ========================================================================

    /**
     * @notice Gas snapshot: Yield distribution
     */
    function testGas_YieldDistribution() public {
        // Setup: Deposit NFTs
        uint256[] memory tokenIds = new uint256[](10);
        for (uint256 i = 0; i < 10; i++) {
            tokenIds[i] = i;
            mockAppraisal.setMockAppraisal(address(nftCollection), i, COMMON_PRICE);
        }

        vm.prank(user);
        nftCollection.setApprovalForAll(address(treasury), true);

        vm.prank(user);
        treasury.batchDepositNFT(_toAddressArray(address(nftCollection), tokenIds.length), tokenIds);

        // Note: Full yield distribution test would require economy manager setup
        // This is a placeholder showing where the test would go
    }

    // ========================================================================
    // PRICE MIGRATION GAS TESTS
    // ========================================================================

    /**
     * @notice Gas snapshot: Price migration (card price update)
     */
    function testGas_PriceMigration() public {
        // Setup: Deposit NFTs
        uint256 tokenId = 0;
        mockAppraisal.setMockAppraisal(address(nftCollection), tokenId, COMMON_PRICE);

        vm.prank(user);
        nftCollection.approve(address(treasury), tokenId);

        vm.prank(user);
        treasury.depositNFT(address(nftCollection), tokenId);

        // Update price (this would trigger migration in real system)
        mockAppraisal.setMockAppraisal(address(nftCollection), tokenId, UNCOMMON_PRICE);

        // Note: Full migration test would require appraisal integration
        // This is a placeholder showing where the test would go
    }

    // ========================================================================
    // WHITELIST OPERATIONS GAS TESTS
    // ========================================================================

    /**
     * @notice Gas snapshot: Add to whitelist
     */
    function testGas_AddToWhitelist() public {
        MockERC721 newCollection = new MockERC721("Mock NFT", "MNFT");

        vm.prank(owner);
        treasury.addToWhitelist(address(newCollection));
    }

    /**
     * @notice Gas snapshot: Remove from whitelist
     */
    function testGas_RemoveFromWhitelist() public {
        MockERC721 newCollection = new MockERC721("Mock NFT", "MNFT");

        vm.prank(owner);
        treasury.addToWhitelist(address(newCollection));

        vm.prank(owner);
        treasury.removeFromWhitelist(address(newCollection));
    }

    // ========================================================================
    // VIEW FUNCTION GAS TESTS
    // ========================================================================

    /**
     * @notice Gas snapshot: Query treasury count
     */
    function testGas_QueryTreasuryCount() public {
        // Deposit some NFTs first
        for (uint256 i = 0; i < 10; i++) {
            mockAppraisal.setMockAppraisal(address(nftCollection), i, COMMON_PRICE);
        }

        vm.prank(user);
        nftCollection.setApprovalForAll(address(treasury), true);

        uint256[] memory tokenIds = new uint256[](10);
        for (uint256 i = 0; i < 10; i++) {
            tokenIds[i] = i;
        }

        vm.prank(user);
        treasury.batchDepositNFT(_toAddressArray(address(nftCollection), tokenIds.length), tokenIds);

        // Query counts
        treasury.rarityCount(0);
        treasury.rarityCount(1);
        treasury.rarityCount(2);
    }

    /**
     * @notice Gas snapshot: Query user deposits
     */
    function testGas_QueryUserDeposits() public {
        // Deposit NFTs
        for (uint256 i = 0; i < 10; i++) {
            mockAppraisal.setMockAppraisal(address(nftCollection), i, COMMON_PRICE);
        }

        vm.prank(user);
        nftCollection.setApprovalForAll(address(treasury), true);

        uint256[] memory tokenIds = new uint256[](10);
        for (uint256 i = 0; i < 10; i++) {
            tokenIds[i] = i;
        }

        vm.prank(user);
        treasury.batchDepositNFT(_toAddressArray(address(nftCollection), tokenIds.length), tokenIds);

        // Query user info
        treasury.userTotalDeposits(user);
    }

    // ========================================================================
    // COMPARISON SNAPSHOTS
    // ========================================================================

    /**
     * @notice Gas snapshot comparison: Single vs batch operations
     */
    function testGas_CompareSingleVsBatch() public {
        // Single deposits
        for (uint256 i = 0; i < 10; i++) {
            mockAppraisal.setMockAppraisal(address(nftCollection), i, COMMON_PRICE);
            vm.prank(user);
            nftCollection.approve(address(treasury), i);
            vm.prank(user);
            treasury.depositNFT(address(nftCollection), i);
        }

        // Note: Batch deposit comparison would require state reset
        // This is a placeholder showing where the comparison would go
    }

    // ========================================================================
    // REGRESSION THRESHOLDS
    // ========================================================================

    /**
     * @notice Verify gas usage hasn't regressed beyond acceptable thresholds
     * @dev These thresholds should be updated after initial gas snapshots
     */
    function test_GasRegressionThresholds() public {
        uint256 tokenId = 0;
        mockAppraisal.setMockAppraisal(address(nftCollection), tokenId, COMMON_PRICE);

        vm.prank(user);
        nftCollection.approve(address(treasury), tokenId);

        // Start gas snapshot
        vm.startPrank(user);

        uint256 gasBefore = gasleft();
        treasury.depositNFT(address(nftCollection), tokenId);
        uint256 gasUsed = gasBefore - gasleft();

        vm.stopPrank();

        // Example threshold: deposit should cost less than 1M gas
        // This threshold should be adjusted based on actual measurements
        assertTrue(gasUsed < 1000000, "Deposit gas usage too high");
    }

    // ========================================================================
    // HELPER FUNCTIONS
    // ========================================================================

    /**
     * @notice Helper function to create address array for batch operations
     */
    function _toAddressArray(address collection, uint256 count) internal pure returns (address[] memory) {
        address[] memory arrays = new address[](count);
        for (uint256 i = 0; i < count; i++) {
            arrays[i] = collection;
        }
        return arrays;
    }
}
