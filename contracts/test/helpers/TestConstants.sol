// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

/**
 * @title Test Constants
 * @notice Centralized constants for all test contracts
 * @dev Eliminates duplication across test files
 * @author NFT Gacha Team
 */
library TestConstants {
    // ========================================================================
    // RARITY PRICES (USD with 18 decimals)
    // ========================================================================

    /// @dev Common tier: $0-$15 range
    uint256 public constant COMMON_PRICE = 10e18; // $10
    uint256 public constant COMMON_MAX = 15e18; // $15

    /// @dev Uncommon tier: $25-$60 range
    uint256 public constant UNCOMMON_PRICE = 50e18; // $50
    uint256 public constant UNCOMMON_MIN = 25e18; // $25
    uint256 public constant UNCOMMON_MAX = 60e18; // $60

    /// @dev Rare tier: $70-$250 range
    uint256 public constant RARE_PRICE = 100e18; // $100
    uint256 public constant RARE_MIN = 70e18; // $70
    uint256 public constant RARE_MAX = 250e18; // $250

    /// @dev Epic tier: $300-$1,200 range
    uint256 public constant EPIC_PRICE = 500e18; // $500
    uint256 public constant EPIC_MIN = 300e18; // $300
    uint256 public constant EPIC_MAX = 1200e18; // $1,200

    /// @dev Legendary tier: $1,500+ range
    uint256 public constant LEGENDARY_PRICE = 2000e18; // $2,000
    uint256 public constant LEGENDARY_MIN = 1500e18; // $1,500

    // ========================================================================
    // TEST ADDRESSES
    // ========================================================================

    /// @dev Standard test addresses
    address public constant OWNER = address(0x1);
    address public constant USER = address(0x2);
    address public constant UNAUTHORIZED_USER = address(0x3);
    address public constant DEPOSITOR = address(0x4);
    address public constant SPINNER = address(0x5);
    address public constant ORACLE = address(0x6);
    address public constant PROTOCOL_TREASURY = address(0x7);
    address public constant GACHA_CONTRACT = address(0x999);

    // ========================================================================
    // SPIN CONFIGURATION
    // ========================================================================

    /// @dev Gacha spin configuration
    uint256 public constant SPIN_FEE = 0.01 ether; // 0.01 ETH spin fee
    uint256 public constant SPIN_TIMEOUT = 1 hours; // 1 hour timeout

    /// @dev Rarity weights (must sum to 1000)
    uint256 public constant COMMON_WEIGHT = 700; // 70%
    uint256 public constant UNCOMMON_WEIGHT = 200; // 20%
    uint256 public constant RARE_WEIGHT = 60; // 6%
    uint256 public constant EPIC_WEIGHT = 30; // 3%
    uint256 public constant LEGENDARY_WEIGHT = 10; // 1%

    // ========================================================================
    // TOKEN CONFIGURATIONS
    // ========================================================================

    /// @dev ERC20 token decimals and constants
    uint256 public constant USDC_DECIMALS = 6;
    uint256 public constant TOKEN_DECIMALS = 18;

    /// @dev Fee configurations
    uint256 public constant APPRAISAL_FEE = 10e18; // 10 tokens
    uint256 public constant UPDATED_FEE = 20e18; // 20 tokens

    // ========================================================================
    // ECONOMY CONFIGURATION
    // ========================================================================

    /// @dev Basis points (10000 = 100%)
    uint256 public constant DEPOSITOR_SHARE_BPS = 9500; // 95%
    uint256 public constant PROTOCOL_SHARE_BPS = 500; // 5%
    uint256 public constant MAX_BPS = 10000; // 100%

    /// @dev Yield configuration
    uint256 public constant MIN_YIELD_TO_CLAIM = 1e15; // 0.001 tokens
    uint256 public constant CLAIM_THRESHOLD = 1e16; // 0.01 tokens

    // ========================================================================
    // PRICE STEP CONFIGURATION
    // ========================================================================

    /// @dev Price step for treasury min price calculations
    uint256 public constant PRICE_STEP = 1e16; // 0.01

    /// @dev Default number of rarity tiers
    uint8 public constant DEFAULT_NUM_RARITIES = 5;

    /// @dev Rarity tier constants
    uint8 public constant COMMON = 0;
    uint8 public constant UNCOMMON = 1;
    uint8 public constant RARE = 2;
    uint8 public constant EPIC = 3;
    uint8 public constant LEGENDARY = 4;

    /// @dev Min prices array [Common, Uncommon, Rare, Epic, Legendary]
    function getMinPrices() internal pure returns (uint256[] memory minPrices) {
        minPrices = new uint256[](5);
        minPrices[0] = 0;
        minPrices[1] = uint256(15 * 1e18) + PRICE_STEP;
        minPrices[2] = uint256(60 * 1e18) + PRICE_STEP;
        minPrices[3] = uint256(250 * 1e18) + PRICE_STEP;
        minPrices[4] = uint256(1_200 * 1e18) + PRICE_STEP;
    }

    /// @dev Max prices array [Common, Uncommon, Rare, Epic, Legendary]
    function getMaxPrices() internal pure returns (uint256[] memory maxPrices) {
        maxPrices = new uint256[](5);
        maxPrices[0] = uint256(15 * 1e18);
        maxPrices[1] = uint256(60 * 1e18);
        maxPrices[2] = uint256(250 * 1e18);
        maxPrices[3] = uint256(1_200 * 1e18);
        maxPrices[4] = type(uint256).max;
    }

    /// @dev Default rarity names
    function getDefaultRarityNames() internal pure returns (string[] memory names) {
        names = new string[](5);
        names[0] = "Common";
        names[1] = "Uncommon";
        names[2] = "Rare";
        names[3] = "Epic";
        names[4] = "Legendary";
    }

    // ========================================================================
    // TEST TOKEN IDS
    // ========================================================================

    uint256 public constant TOKEN_ID_1 = 1;
    uint256 public constant TOKEN_ID_2 = 2;
    uint256 public constant TOKEN_ID_3 = 3;
    uint256 public constant INVALID_TOKEN_ID = 999;

    // ========================================================================
    // TEST CARD IDS
    // ========================================================================

    bytes32 public constant CARD_ID_1 = keccak256("card-1");
    bytes32 public constant CARD_ID_2 = keccak256("card-2");
    bytes32 public constant CARD_ID_OVERRIDE = keccak256("card-override");

    // ========================================================================
    // HELPER FUNCTIONS
    // ========================================================================

    /**
     * @notice Calculate rarity from appraised price
     * @param priceUSD The appraised price in USD (18 decimals)
     * @return rarity The corresponding rarity tier
     */
    function getRarityFromPrice(uint256 priceUSD)
        internal
        pure
        returns (
            uint8 /* rarity as uint8 */
        )
    {
        if (priceUSD <= COMMON_MAX) {
            return 0; // Common
        } else if (priceUSD >= UNCOMMON_MIN && priceUSD <= UNCOMMON_MAX) {
            return 1; // Uncommon
        } else if (priceUSD >= RARE_MIN && priceUSD <= RARE_MAX) {
            return 2; // Rare
        } else if (priceUSD >= EPIC_MIN && priceUSD <= EPIC_MAX) {
            return 3; // Epic
        } else {
            return 4; // Legendary
        }
    }
}
