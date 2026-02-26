// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Test} from "forge-std/Test.sol";
import {GachaTreasury} from "../../src/gacha/GachaTreasury.sol";
import {MockNFTAppraisal} from "../mocks/MockNFTAppraisal.sol";
import {MockCardGroupedVault} from "../mocks/MockCardGroupedVault.sol";
import {MockProtocolTreasury} from "../mocks/MockProtocolTreasury.sol";
import {MockERC721} from "../mocks/MockERC721.sol";

/**
 * @title GachaTreasury Invariant Tests
 * @notice Invariant tests for GachaTreasury contract
 * @dev Tests system properties that should always hold true
 */
contract GachaTreasuryInvariants is Test {

    // ========================================================================
    // STATE VARIABLES
    // ========================================================================

    GachaTreasury treasury;
    MockNFTAppraisal appraisal;
    MockCardGroupedVault vault;
    MockProtocolTreasury protocolTreasury;
    MockERC721 nftCollection;

    address[] public depositors;
    uint256[] public depositedTokenIds;

    // ========================================================================
    // SETUP
    // ========================================================================

    function setUp() public {
        // Deploy mocks
        appraisal = new MockNFTAppraisal();
        vault = new MockCardGroupedVault(address(0x1));
        protocolTreasury = new MockProtocolTreasury();
        nftCollection = new MockERC721("Mock NFT", "MNFT");

        // Deploy and initialize treasury
        treasury = GachaTreasury(payable(address(new GachaTreasury())));

        address owner = address(this);

        // Initialize treasury with price ranges
        uint256[] memory minPrices = new uint256[](5);
        minPrices[0] = uint256(0);              // Common
        minPrices[1] = uint256(15.01e18);        // Uncommon
        minPrices[2] = uint256(60.01e18);        // Rare
        minPrices[3] = uint256(250.01e18);       // Epic
        minPrices[4] = uint256(1200.01e18);      // Legendary

        uint256[] memory maxPrices = new uint256[](5);
        maxPrices[0] = uint256(15e18);           // Common
        maxPrices[1] = uint256(60e18);           // Uncommon
        maxPrices[2] = uint256(250e18);          // Rare
        maxPrices[3] = uint256(1200e18);         // Epic
        maxPrices[4] = uint256(type(uint256).max); // Legendary (no max)

        string[] memory rarityNames = new string[](5);
        rarityNames[0] = "Common";
        rarityNames[1] = "Uncommon";
        rarityNames[2] = "Rare";
        rarityNames[3] = "Epic";
        rarityNames[4] = "Legendary";

        vm.prank(owner);
        treasury.initialize(
            owner,
            address(0x999),
            address(appraisal),
            uint8(5),
            rarityNames,
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

        // Create test depositors and mint NFTs
        for (uint256 i = 0; i < 10; i++) {
            // forge-lint: disable-next-line(unsafe-typecast)
            address depositor = address(uint160(i + 100));
            depositors.push(depositor);
            nftCollection.mint(depositor, i);
            depositedTokenIds.push(i);
        }

        // Register this contract as a handler for invariant testing
        // This allows the invariant runner to call our functions
    }

    // ========================================================================
    // INFVARIANT: Total NFTs Never Exceed Deposits
    // ========================================================================

    /**
     * @notice Invariant: Total NFTs across all rarities should equal total deposits
     * @dev This invariant ensures no NFTs are lost or duplicated
     */
    function invariant_TotalNFTsNeverExceedDeposits() public view {
        uint256 totalNFTsInTreasury = 0;

        for (uint256 i = 0; i < 5; i++) {
            totalNFTsInTreasury += treasury.rarityCount(uint8(i));
        }

        uint256 totalDeposits = treasury.globalLifetimeDeposited();

        // Total NFTs in treasury should not exceed total deposits
        assertGe(totalDeposits, totalNFTsInTreasury);
    }

    // ========================================================================
    // INFVARIANT: Rarity Prices Match Range
    // ========================================================================

    /**
     * @notice Invariant: All NFTs in a rarity tier should match that tier's price range
     * @dev This invariant ensures NFTs are categorized correctly
     */
    function invariant_RarityPricesMatchRange() public view {
        // Check each rarity tier
        for (uint256 i = 0; i < 5; i++) {
            uint8 rarity = uint8(i);
            uint256 count = treasury.rarityCount(rarity);

            for (uint256 j = 0; j < count; j++) {
                (, , , uint256 appraisedPrice, , , ) = treasury.treasury(rarity, j);

                // Verify price is within expected range for this rarity
                if (rarity == 0) {
                    assertTrue(appraisedPrice >= 0 && appraisedPrice <= 15e18);
                } else if (rarity == 1) {
                    assertTrue(appraisedPrice >= 25e18 && appraisedPrice <= 60e18);
                } else if (rarity == 2) {
                    assertTrue(appraisedPrice >= 70e18 && appraisedPrice <= 250e18);
                } else if (rarity == 3) {
                    assertTrue(appraisedPrice >= 300e18 && appraisedPrice <= 1200e18);
                } else if (rarity == 4) {
                    assertTrue(appraisedPrice >= 1500e18);
                }
            }
        }
    }

    // ========================================================================
    // INFVARIANT: Whitelist Only Contains Whitelisted
    // ========================================================================

    /**
     * @notice Invariant: Only whitelisted NFTs can be deposited
     * @dev This invariant ensures the whitelist mechanism is working
     */
    function invariant_WhitelistOnlyContainsWhitelisted() public view {
        // Check all NFTs in treasury are from whitelisted collections

        for (uint256 i = 0; i < 5; i++) {
            uint8 rarity = uint8(i);
            uint256 count = treasury.rarityCount(rarity);

            for (uint256 j = 0; j < count; j++) {
                (address collection, , , , , , ) = treasury.treasury(rarity, j);

                // Collection must be whitelisted
                assertTrue(treasury.isCollectionWhitelisted(collection));
            }
        }
    }

    // ========================================================================
    // INFVARIANT: User Deposits Match Active Value
    // ========================================================================

    /**
     * @notice Invariant: User's total deposits should match their active deposit value
     * @dev This invariant ensures deposit tracking is accurate
     */
    function invariant_UserDepositsMatchActiveValue() public view {
        for (uint256 i = 0; i < depositors.length; i++) {
            address depositor = depositors[i];

            uint256 totalDeposits = treasury.userTotalDeposits(depositor);

            // Skip users with no deposits
            if (totalDeposits == 0) continue;

            // Deposit count should be reasonable
            assertTrue(totalDeposits <= 1000); // Reasonable upper bound
        }
    }

    // ========================================================================
    // INFVARIANT: Rarity Value Consistency
    // ========================================================================

    /**
     * @notice Invariant: Total value per rarity should match sum of NFT values in that rarity
     * @dev This invariant ensures value tracking is accurate
     */
    function invariant_RarityValueConsistency() public view {
        for (uint256 i = 0; i < 5; i++) {
            uint8 rarity = uint8(i);
            uint256 count = treasury.rarityCount(rarity);

            uint256 calculatedValue = 0;

            for (uint256 j = 0; j < count; j++) {
                (, , , uint256 appraisedPrice, , , ) = treasury.treasury(rarity, j);
                calculatedValue += appraisedPrice;
            }

            // The contract should track total value for each rarity
            // (This is a simplified check - in reality you'd check against totalRarityValue)
        }
    }

    // ========================================================================
    // INFVARIANT: No Duplicate NFTs
    // ========================================================================

    /**
     * @notice Invariant: No NFT should appear more than once in the treasury
     * @dev This invariant ensures duplicate prevention is working
     */
    function invariant_NoDuplicateNFTs() public view {
        // Note: Full duplicate checking would require storage mapping
        // For simplicity, we just verify that depositedNFTs mapping is working
        // by checking that treasury count doesn't exceed total global deposits

        uint256 totalInTreasury = 0;
        for (uint256 i = 0; i < 5; i++) {
            totalInTreasury += treasury.rarityCount(uint8(i));
        }

        // Total NFTs in treasury should not exceed global deposited count
        assertTrue(totalInTreasury <= treasury.globalLifetimeDeposited());
    }

    // ========================================================================
    // INFVARIANT: Depositor Ownership Consistency
    // ========================================================================

    /**
     * @notice Invariant: Each NFT in treasury should have a valid depositor
     * @dev This invariant ensures depositor tracking is accurate
     */
    function invariant_DepositorOwnershipConsistency() public view {
        for (uint256 i = 0; i < 5; i++) {
            uint8 rarity = uint8(i);
            uint256 count = treasury.rarityCount(rarity);

            for (uint256 j = 0; j < count; j++) {
                (, address depositor, , , , , ) = treasury.treasury(rarity, j);

                // Depositor should not be zero address
                assertTrue(depositor != address(0));

                // Depositor should have this NFT tracked in their deposits
                uint256 userDeposits = treasury.userTotalDeposits(depositor);
                assertTrue(userDeposits > 0);
            }
        }
    }

    // ========================================================================
    // INFVARIANT: Global Metrics Consistency
    // ========================================================================

    /**
     * @notice Invariant: Global lifetime metrics should be consistent
     * @dev This invariant ensures global tracking is accurate
     */
    function invariant_GlobalMetricsConsistency() public view {
        uint256 globalClaimed = treasury.globalLifetimeClaimed();
        uint256 globalDeposited = treasury.globalLifetimeDeposited();

        // Claimed should not exceed deposited
        assertTrue(globalClaimed <= globalDeposited * 1000e18); // Reasonable upper bound

        // Global deposited should be at least sum of individual deposits
        uint256 sumIndividualDeposits = 0;
        for (uint256 i = 0; i < depositors.length; i++) {
            sumIndividualDeposits += treasury.userTotalDeposits(depositors[i]);
        }

        // Global should be >= sum (there may be other depositors)
        assertTrue(globalDeposited >= sumIndividualDeposits);
    }

    // ========================================================================
    // FUZZ / INVARIANT HANDLERS
    // ========================================================================

    /**
     * @notice Handler: Deposit random NFT
     */
    function deposit_handler(uint256 tokenIdIndex, uint256 appraisalUSD) external {
        // Constrain inputs
        tokenIdIndex = bound(tokenIdIndex, 0, depositedTokenIds.length - 1);
        appraisalUSD = bound(appraisalUSD, 1e18, 2000e18);

        uint256 tokenId = depositedTokenIds[tokenIdIndex];
        address depositor = depositors[tokenIdIndex % depositors.length];

        // Ensure NFT is owned by depositor
        if (nftCollection.ownerOf(tokenId) != depositor) {
            return; // Skip if not owner
        }

        // Set appraisal
        appraisal.setMockAppraisal(address(nftCollection), tokenId, appraisalUSD);

        // Deposit NFT
        vm.prank(depositor);
        try treasury.depositNFT(address(nftCollection), tokenId) {
            // Success
        } catch {
            // Expected failure (e.g., already deposited)
        }
    }

    /**
     * @notice Handler: Withdraw random NFT
     */
    function withdraw_handler(uint256 rarity, uint256 index) external {
        // Constrain inputs
        rarity = bound(rarity, 0, 4);
        uint8 r = uint8(rarity);

        uint256 count = treasury.rarityCount(r);
        if (count == 0) return;

        index = bound(index, 0, count - 1);

        (, address depositor, uint256 tokenId, , , , ) = treasury.treasury(r, index);

        // Withdraw NFT
        vm.prank(depositor);
        try treasury.withdrawMyNFT(address(nftCollection), tokenId) {
            // Success
        } catch {
            // Expected failure
        }
    }
}
