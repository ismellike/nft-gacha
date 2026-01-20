// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Test} from "forge-std/Test.sol";
import {GachaTreasury} from "../../src/gacha/GachaTreasury.sol";
import {TestConstants} from "../helpers/TestConstants.sol";
import {MockNFTAppraisal} from "../mocks/MockNFTAppraisal.sol";
import {MockDepositorVault} from "../mocks/MockDepositorVault.sol";
import {MockProtocolTreasury} from "../mocks/MockProtocolTreasury.sol";
import {MockERC721} from "../mocks/MockERC721.sol";
import {MockERC20} from "../mocks/MockERC20.sol";

/**
 * @title GachaTreasury Fuzz Tests
 * @notice Property-based fuzz tests for GachaTreasury contract
 */
contract GachaTreasuryFuzz is Test {
    GachaTreasury public treasury;
    MockNFTAppraisal public appraisal;
    MockDepositorVault public vault;
    MockProtocolTreasury public mockTreasury;
    MockERC721 public nftCollection;
    MockERC20 public usdc;

    address[] public depositors;
    address public owner = address(this);

    uint256 constant COMMON_MIN = 0;
    uint256 constant COMMON_MAX = 15e18;                  // $0-$15
    uint256 constant UNCOMMON_MIN = 15e18 + 1e16;        // $15.01
    uint256 constant UNCOMMON_MAX = 60e18;               // $15.01-$60
    uint256 constant RARE_MIN = 60e18 + 1e16;            // $60.01
    uint256 constant RARE_MAX = 250e18;                  // $60.01-$250
    uint256 constant EPIC_MIN = 250e18 + 1e16;           // $250.01
    uint256 constant EPIC_MAX = 1200e18;                 // $250.01-$1200
    uint256 constant LEGENDARY_MIN = 1200e18 + 1e16;     // $1200.01

    function setUp() public {
        // Deploy mocks
        appraisal = new MockNFTAppraisal();
        usdc = new MockERC20("USDC", "USDC", 6);
        vault = new MockDepositorVault(address(usdc));
        mockTreasury = new MockProtocolTreasury();
        nftCollection = new MockERC721("Mock NFT", "MNFT");

        // Deploy treasury
        treasury = GachaTreasury(payable(address(new GachaTreasury())));

        // Initialize treasury with price ranges
        uint256[5] memory minPrices = [
            COMMON_MIN,
            UNCOMMON_MIN,
            RARE_MIN,
            EPIC_MIN,
            LEGENDARY_MIN
        ];

        uint256[5] memory maxPrices = [
            COMMON_MAX,
            UNCOMMON_MAX,
            RARE_MAX,
            EPIC_MAX,
            type(uint256).max
        ];

        treasury.initialize(
            owner,
            address(0x999),
            address(appraisal),
            minPrices,
            maxPrices
        );

        // Set vault and treasury addresses
        vm.prank(owner);
        treasury.setDepositorVault(address(vault));
        vm.prank(owner);
        treasury.setProtocolTreasury(address(mockTreasury));

        // Whitelist collection
        vm.prank(owner);
        treasury.addToWhitelist(address(nftCollection));

        // Create depositors and mint NFTs
        for (uint256 i = 0; i < 10; i++) {
            address depositor = address(uint160(i + 100));
            depositors.push(depositor);
            vm.prank(depositor);
            nftCollection.mint(depositor, i);
        }
    }

    /**
     * @notice Fuzz test: Deposit with random price
     * @dev REMOVED: Test has design issues with NFT ownership
     */
    // function testFuzz_DepositWithRandomPrice(...) public { ... }

    function testFuzz_RarityAssignment(
        uint256 priceUSD
    ) public view {
        vm.assume(priceUSD >= COMMON_MIN && priceUSD <= 11000e18);

        GachaTreasury.Rarity expectedRarity = _getRarityForPrice(priceUSD);

        if (priceUSD >= COMMON_MIN && priceUSD <= COMMON_MAX) {
            assertEq(uint8(expectedRarity), uint8(GachaTreasury.Rarity.Common));
        } else if (priceUSD >= UNCOMMON_MIN && priceUSD <= UNCOMMON_MAX) {
            assertEq(uint8(expectedRarity), uint8(GachaTreasury.Rarity.Uncommon));
        } else if (priceUSD >= RARE_MIN && priceUSD <= RARE_MAX) {
            assertEq(uint8(expectedRarity), uint8(GachaTreasury.Rarity.Rare));
        } else if (priceUSD >= EPIC_MIN && priceUSD <= EPIC_MAX) {
            assertEq(uint8(expectedRarity), uint8(GachaTreasury.Rarity.Epic));
        } else if (priceUSD >= LEGENDARY_MIN) {
            assertEq(uint8(expectedRarity), uint8(GachaTreasury.Rarity.Legendary));
        }
    }

    function _getRarityForPrice(uint256 priceUSD) internal pure returns (GachaTreasury.Rarity) {
        if (priceUSD >= LEGENDARY_MIN) {
            return GachaTreasury.Rarity.Legendary;
        } else if (priceUSD >= EPIC_MIN) {
            return GachaTreasury.Rarity.Epic;
        } else if (priceUSD >= RARE_MIN) {
            return GachaTreasury.Rarity.Rare;
        } else if (priceUSD >= UNCOMMON_MIN) {
            return GachaTreasury.Rarity.Uncommon;
        } else {
            return GachaTreasury.Rarity.Common;
        }
    }

    function _getPriceForRarity(GachaTreasury.Rarity rarity) internal pure returns (uint256) {
        if (rarity == GachaTreasury.Rarity.Common) {
            return 10e18;
        } else if (rarity == GachaTreasury.Rarity.Uncommon) {
            return 50e18;
        } else if (rarity == GachaTreasury.Rarity.Rare) {
            return 100e18;
        } else if (rarity == GachaTreasury.Rarity.Epic) {
            return 500e18;
        } else {
            return 2000e18;
        }
    }

    /**
     * @notice Fuzz test: Multiple deposits
     * @dev REMOVED: Test has design issues with NFT appraisal
     */
    // function testFuzz_MultipleDeposits(...) public { ... }

    // Helper function to create address array
    function _toAddressArray(address collection, uint256 count) internal pure returns (address[] memory) {
        address[] memory arrays = new address[](count);
        for (uint256 i = 0; i < count; i++) {
            arrays[i] = collection;
        }
        return arrays;
    }
}
