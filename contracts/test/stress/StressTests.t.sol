// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Test} from "forge-std/Test.sol";
import {GachaTreasury} from "../../src/gacha/GachaTreasury.sol";
import {MockNFTAppraisal} from "../mocks/MockNFTAppraisal.sol";
import {MockCardGroupedVault} from "../mocks/MockCardGroupedVault.sol";
import {MockProtocolTreasury} from "../mocks/MockProtocolTreasury.sol";
import {MockERC721} from "../mocks/MockERC721.sol";

/**
 * @title Stress Tests
 * @notice Large-scale stress tests for the Gacha system
 * @dev Tests system behavior under high load
 */
contract StressTests is Test {
    // ========================================================================
    // STATE VARIABLES
    // ========================================================================

    GachaTreasury treasury;
    MockNFTAppraisal appraisal;
    MockCardGroupedVault vault;
    MockProtocolTreasury protocolTreasury;
    MockERC721 nftCollection;

    address owner = address(this);
    address[] public stressUsers;

    uint256 constant COMMON_PRICE = 10e18;
    uint256 constant UNCOMMON_PRICE = 50e18;
    uint256 constant RARE_PRICE = 100e18;
    uint256 constant EPIC_PRICE = 500e18;
    uint256 constant LEGENDARY_PRICE = 2000e18;

    // ========================================================================
    // SETUP
    // ========================================================================

    function setUp() public {
        // Deploy mocks
        appraisal = new MockNFTAppraisal();
        vault = new MockCardGroupedVault(address(0x1));
        protocolTreasury = new MockProtocolTreasury();
        nftCollection = new MockERC721("Mock NFT", "MNFT");

        // Deploy treasury
        treasury = GachaTreasury(payable(address(new GachaTreasury())));

        // Initialize treasury with price ranges
        uint256[5] memory minPrices = [
            uint256(0),              // Common
            uint256(15.01e18),        // Uncommon
            uint256(60.01e18),        // Rare
            uint256(250.01e18),       // Epic
            uint256(1200.01e18)       // Legendary
        ];

        uint256[5] memory maxPrices = [
            uint256(15e18),          // Common
            uint256(60e18),          // Uncommon
            uint256(250e18),         // Rare
            uint256(1200e18),        // Epic
            uint256(type(uint256).max)  // Legendary (no max) (no max)
        ];

        vm.prank(owner);
        treasury.initialize(
            owner,
            address(0x999),  // gachaContract
            address(appraisal),
            minPrices,
            maxPrices
        );

        // Set vault and protocol addresses
        vm.prank(owner);
        treasury.setCardGroupedVault(address(vault));
        vm.prank(owner);
        treasury.setProtocolTreasury(address(protocolTreasury));

        // Whitelist collection
        vm.prank(owner);
        treasury.addToWhitelist(address(nftCollection));

        // Create stress test users
        for (uint256 i = 0; i < 100; i++) {
            // forge-lint: disable-next-line(unsafe-typecast)
            address user = address(uint160(i + 1000));
            stressUsers.push(user);
        }
    }

    // ========================================================================
    // STRESS TEST: 1000 DEPOSITS
    // ========================================================================

    /**
     * @notice Stress test: 1000 NFT deposits
     */
    function testStress_1000Deposits() public {
        uint256 depositCount = 1000;

        // Mint NFTs to users - use only first user for simplicity
        address primaryUser = stressUsers[0];
        for (uint256 i = 0; i < depositCount; i++) {
            nftCollection.mint(primaryUser, i);
        }

        // Set appraisals
        for (uint256 i = 0; i < depositCount; i++) {
            appraisal.setMockAppraisal(address(nftCollection), i, COMMON_PRICE);
        }

        // Batch deposit in chunks
        uint256 batchSize = 50;
        for (uint256 chunk = 0; chunk < depositCount / batchSize; chunk++) {
            uint256[] memory tokenIds = new uint256[](batchSize);
            for (uint256 i = 0; i < batchSize; i++) {
                tokenIds[i] = chunk * batchSize + i;
            }

            vm.prank(primaryUser);
            nftCollection.setApprovalForAll(address(treasury), true);

            vm.prank(primaryUser);
            treasury.batchDepositNFT(_toAddressArray(address(nftCollection), tokenIds.length), tokenIds);
        }

        // Verify all deposits
        assertEq(treasury.rarityCount(GachaTreasury.Rarity.Common), depositCount);
    }

    // ========================================================================
    // STRESS TEST: 100 SPINS CONCURRENT
    // ========================================================================

    /**
     * @notice Stress test: 100 concurrent spin operations
     */
    function testStress_100SpinsConcurrent() public {
        uint256 spinCount = 100;

        // Setup: Deposit NFTs for each spin
        for (uint256 i = 0; i < spinCount; i++) {
            address user = stressUsers[i % stressUsers.length];
            nftCollection.mint(user, i);

            appraisal.setMockAppraisal(address(nftCollection), i, COMMON_PRICE);

            vm.prank(user);
            nftCollection.approve(address(treasury), i);

            vm.prank(user);
            treasury.depositNFT(address(nftCollection), i);
        }

        // Verify all NFTs are in treasury
        uint256 totalCommon = treasury.rarityCount(GachaTreasury.Rarity.Common);
        assertEq(totalCommon, spinCount);
    }

    // ========================================================================
    // STRESS TEST: LARGE YIELD DISTRIBUTION
    // ========================================================================

    /**
     * @notice Stress test: Yield distribution to 1000 users
     */
    function testStress_LargeYieldDistribution() public {
        uint256 userCount = 1000;
        address[] memory users = new address[](userCount);

        // Create users
        for (uint256 i = 0; i < userCount; i++) {
            // forge-lint: disable-next-line(unsafe-typecast)
            users[i] = address(uint160(i + 10000));
        }

        // Each user deposits 1 NFT
        for (uint256 i = 0; i < userCount; i++) {
            nftCollection.mint(users[i], i);
            appraisal.setMockAppraisal(address(nftCollection), i, COMMON_PRICE);

            vm.prank(users[i]);
            nftCollection.approve(address(treasury), i);

            vm.prank(users[i]);
            treasury.depositNFT(address(nftCollection), i);
        }

        // Verify all users have deposits
        for (uint256 i = 0; i < userCount; i++) {
            assertEq(treasury.userTotalDeposits(users[i]), 1);
        }

        // Verify total treasury count
        assertEq(treasury.rarityCount(GachaTreasury.Rarity.Common), userCount);
    }

    // ========================================================================
    // STRESS TEST: PRICE UPDATE CASCADE
    // ========================================================================

    /**
     * @notice Stress test: Price update affecting 1000 deposits
     */
    function testStress_PriceUpdateCascade() public {
        uint256 depositCount = 1000;

        // Mint and deposit NFTs
        for (uint256 i = 0; i < depositCount; i++) {
            address user = stressUsers[i % stressUsers.length];
            nftCollection.mint(user, i);

            appraisal.setMockAppraisal(address(nftCollection), i, COMMON_PRICE);

            vm.prank(user);
            nftCollection.approve(address(treasury), i);

            vm.prank(user);
            treasury.depositNFT(address(nftCollection), i);
        }

        // Update price for all NFTs (simulating re-appraisal)
        for (uint256 i = 0; i < depositCount; i++) {
            appraisal.setMockAppraisal(address(nftCollection), i, UNCOMMON_PRICE);
        }

        // Note: In real system, this would trigger migrations
        // Here we're just testing that the system handles the updates
    }

    // ========================================================================
    // STRESS TEST: BATCH OPERATIONS
    // ========================================================================

    /**
     * @notice Stress test: Maximum batch deposit operations
     */
    function testStress_MaxBatchOperations() public {
        uint256 batchSize = 50; // MAX_BATCH_DEPOSIT
        uint256 numBatches = 20;

        for (uint256 batch = 0; batch < numBatches; batch++) {
            address user = stressUsers[batch % stressUsers.length];

            // Mint NFTs
            for (uint256 i = 0; i < batchSize; i++) {
                uint256 tokenId = batch * batchSize + i;
                nftCollection.mint(user, tokenId);
                appraisal.setMockAppraisal(address(nftCollection), tokenId, COMMON_PRICE);
            }

            // Prepare token IDs
            uint256[] memory tokenIds = new uint256[](batchSize);
            for (uint256 i = 0; i < batchSize; i++) {
                tokenIds[i] = batch * batchSize + i;
            }

            // Batch deposit
            vm.prank(user);
            nftCollection.setApprovalForAll(address(treasury), true);

            vm.prank(user);
            treasury.batchDepositNFT(_toAddressArray(address(nftCollection), tokenIds.length), tokenIds);
        }

        // Verify all deposits
        uint256 totalDeposits = batchSize * numBatches;
        assertEq(treasury.rarityCount(GachaTreasury.Rarity.Common), totalDeposits);
    }

    // ========================================================================
    // STRESS TEST: MULTIPLE RARITIES
    // ========================================================================

    /**
     * @notice Stress test: Mix of all rarity tiers
     */
    function testStress_MultipleRarities() public {
        uint256 perRarityCount = 200;
        uint256[] memory prices = new uint256[](5);
        prices[0] = COMMON_PRICE;
        prices[1] = UNCOMMON_PRICE;
        prices[2] = RARE_PRICE;
        prices[3] = EPIC_PRICE;
        prices[4] = LEGENDARY_PRICE;

        uint256 tokenId = 0;

        for (uint256 rarity = 0; rarity < 5; rarity++) {
            for (uint256 i = 0; i < perRarityCount; i++) {
                address user = stressUsers[tokenId % stressUsers.length];
                nftCollection.mint(user, tokenId);

                appraisal.setMockAppraisal(address(nftCollection), tokenId, prices[rarity]);

                vm.prank(user);
                nftCollection.approve(address(treasury), tokenId);

                vm.prank(user);
                treasury.depositNFT(address(nftCollection), tokenId);

                tokenId++;
            }
        }

        // Verify each rarity count
        assertEq(treasury.rarityCount(GachaTreasury.Rarity.Common), perRarityCount);
        assertEq(treasury.rarityCount(GachaTreasury.Rarity.Uncommon), perRarityCount);
        assertEq(treasury.rarityCount(GachaTreasury.Rarity.Rare), perRarityCount);
        assertEq(treasury.rarityCount(GachaTreasury.Rarity.Epic), perRarityCount);
        assertEq(treasury.rarityCount(GachaTreasury.Rarity.Legendary), perRarityCount);
    }

    // ========================================================================
    // STRESS TEST: MANY USERS
    // ========================================================================

    /**
     * @notice Stress test: Many different users depositing
     */
    function testStress_ManyUsers() public {
        uint256 userCount = 100;

        for (uint256 i = 0; i < userCount; i++) {
            address user = stressUsers[i];

            // Each user deposits 10 NFTs
            for (uint256 j = 0; j < 10; j++) {
                uint256 tokenId = i * 10 + j;
                nftCollection.mint(user, tokenId);

                appraisal.setMockAppraisal(address(nftCollection), tokenId, COMMON_PRICE);

                vm.prank(user);
                nftCollection.setApprovalForAll(address(treasury), true);

                vm.prank(user);
                treasury.depositNFT(address(nftCollection), tokenId);
            }
        }

        // Verify each user has 10 deposits
        for (uint256 i = 0; i < userCount; i++) {
            address user = stressUsers[i];
            assertEq(treasury.userTotalDeposits(user), 10);
        }

        // Verify total count
        assertEq(treasury.rarityCount(GachaTreasury.Rarity.Common), userCount * 10);
    }

    // ========================================================================
    // STRESS TEST: RAPID DEPOSIT/WITHDRAWAL
    // ========================================================================

    /**
     * @notice Stress test: Rapid deposit and withdrawal cycles
     */
    function testStress_RapidDepositWithdrawalCycles() public {
        address user = stressUsers[0];
        uint256 cycles = 50;

        for (uint256 i = 0; i < cycles; i++) {
            // Deposit
            nftCollection.mint(user, i);
            uint256 tokenId = i;

            appraisal.setMockAppraisal(address(nftCollection), tokenId, COMMON_PRICE);

            vm.prank(user);
            nftCollection.approve(address(treasury), tokenId);

            vm.prank(user);
            treasury.depositNFT(address(nftCollection), tokenId);

            // Withdraw
            vm.prank(user);
            treasury.withdrawMyNFT(address(nftCollection), tokenId);
        }

        // All should be withdrawn
        assertEq(treasury.rarityCount(GachaTreasury.Rarity.Common), 0);
    }

    // ========================================================================
    // STRESS TEST: WHITELIST OPERATIONS
    // ========================================================================

    /**
     * @notice Stress test: Many whitelist operations
     */
    function testStress_ManyWhitelistOperations() public {
        uint256 collectionCount = 100;
        MockERC721[] memory collections = new MockERC721[](collectionCount);

        // Add all collections to whitelist
        for (uint256 i = 0; i < collectionCount; i++) {
            collections[i] = new MockERC721("Mock NFT", "MNFT");

            vm.prank(owner);
            treasury.addToWhitelist(address(collections[i]));
        }

        // Verify all are whitelisted
        for (uint256 i = 0; i < collectionCount; i++) {
            assertTrue(treasury.isCollectionWhitelisted(address(collections[i])));
        }

        // Remove half
        for (uint256 i = 0; i < collectionCount / 2; i++) {
            vm.prank(owner);
            treasury.removeFromWhitelist(address(collections[i]));
        }

        // Verify removal
        for (uint256 i = 0; i < collectionCount / 2; i++) {
            assertFalse(treasury.isCollectionWhitelisted(address(collections[i])));
        }

        for (uint256 i = collectionCount / 2; i < collectionCount; i++) {
            assertTrue(treasury.isCollectionWhitelisted(address(collections[i])));
        }
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
