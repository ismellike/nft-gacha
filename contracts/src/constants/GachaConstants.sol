// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

/**
 * @title GachaConstants
 * @notice Shared constants used across the NFT Gacha system
 * @dev Centralizes constant definitions to reduce duplication and improve maintainability
 * @author NFT Gacha Team
 */
abstract contract GachaConstants {
    /// @notice Basis points constants (10000 = 100%)
    uint256 internal constant BASIS_POINTS = 10_000;
    uint256 internal constant PERCENT_BPS = 100;

    /// @notice Protocol fee split constants
    uint256 internal constant DEPOSITOR_SPLIT_BPS = 9_500; // 95%
    uint256 internal constant PROTOCOL_SPLIT_BPS = 500;   // 5%

    /// @notice Redemption constants
    uint256 internal constant REDEMPTION_PAYOUT_BPS = 8_000; // 80% of appraised value
    uint256 internal constant REDEMPTION_FEE_BPS = 2_000;    // 20% protocol fee

    /// @notice Time constants
    uint256 internal constant SECONDS_PER_MINUTE = 60;
    uint256 internal constant SECONDS_PER_HOUR = 3_600;
    uint256 internal constant SECONDS_PER_DAY = 86_400;
    uint256 internal constant DEFAULT_REDEMPTION_WINDOW = 1 hours;

    /// @notice Price constants
    uint256 internal constant USD_TO_USDC_CONVERSION = 1e12; // Convert 18 decimals to 6 decimals
    uint256 internal constant PRECISION = 1e18;
    uint256 internal constant USDC_PRECISION = 1e6;

    /// @notice Rarity probability constants (in basis points)
    uint256 internal constant DEFAULT_COMMON_BPS = 7_000;      // 70%
    uint256 internal constant DEFAULT_UNCOMMON_BPS = 2_000;    // 20%
    uint256 internal constant DEFAULT_RARE_BPS = 600;          // 6%
    uint256 internal constant DEFAULT_EPIC_BPS = 300;          // 3%
    uint256 internal constant DEFAULT_LEGENDARY_BPS = 100;     // 1%

    /// @notice Gacha configuration constants
    uint256 internal constant DEFAULT_SPIN_PREMIUM_BPS = 500;  // 5% premium over EV
    uint256 internal constant DEFAULT_SPIN_TIMEOUT = 30;       // 30 seconds
    uint256 internal constant MAX_SPIN_FEE_MULTIPLIER = 10;    // Safety cap: 10x base fee

    /// @notice Batch operation limits
    uint256 internal constant MAX_BATCH_DEPOSIT = 50;
    uint256 internal constant MAX_BATCH_WITHDRAW = 20;
    uint256 internal constant MAX_MIGRATION_BATCH = 50;
    uint256 internal constant MAX_BATCH_QUERY = 100;

    /// @notice Gas optimization constants
    uint256 internal constant BATCH_GAS_THRESHOLD = 100_000;
    uint256 internal constant ARRAY_SEARCH_LIMIT = 1_000;

    /// @notice Safety constants
    uint256 internal constant MAX_UINT256 = type(uint256).max;
    uint256 internal constant MAX_PRICE_USD = 10_000 * PRECISION; // $10,000 max appraisal
    uint256 internal constant MIN_PRICE_USD = 1 * PRECISION / 100; // $0.01 min appraisal

    /// @notice Access control role identifiers (for future use with Roles mod)
    bytes32 internal constant DEFAULT_ADMIN_ROLE = 0x00;
    bytes32 internal constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 internal constant MANAGER_ROLE = keccak256("MANAGER_ROLE");
    bytes32 internal constant APPRAISER_ROLE = keccak256("APPRAISER_ROLE");

    /// @notice ERC165 interface IDs
    bytes4 internal constant ERC165_INTERFACE_ID = 0x01ffc9a7;
    bytes4 internal constant ERC721_INTERFACE_ID = 0x80ac58cd;
    bytes4 internal constant ERC721_METADATA_INTERFACE_ID = 0x5b5e139f;
    bytes4 internal constant ERC721_ENUMERABLE_INTERFACE_ID = 0x780e9d63;
    bytes4 internal constant ERC1155_INTERFACE_ID = 0xd9b67a26;
    bytes4 internal constant ERC1155_METADATA_INTERFACE_ID = 0x0e89341c;

    /**
     * @notice Gets the default rarity distribution array
     * @return rarityBps Array of rarity basis points [Common, Uncommon, Rare, Epic, Legendary]
     */
    function getDefaultRarityBps() internal pure returns (uint256[5] memory rarityBps) {
        rarityBps[0] = DEFAULT_COMMON_BPS;
        rarityBps[1] = DEFAULT_UNCOMMON_BPS;
        rarityBps[2] = DEFAULT_RARE_BPS;
        rarityBps[3] = DEFAULT_EPIC_BPS;
        rarityBps[4] = DEFAULT_LEGENDARY_BPS;
    }

    /**
     * @notice Validates that basis points sum to BASIS_POINTS
     * @param bps Array of basis points to validate
     */
    function validateBasisPoints(uint256[] memory bps) internal pure {
        uint256 total;
        uint256 length = bps.length;
        for (uint256 i = 0; i < length; ++i) {
            total += bps[i];
        }
        require(total == BASIS_POINTS, "Invalid basis points sum");
    }

    /**
     * @notice Validates that rarity basis points are valid
     * @param rarityBps Array of rarity basis points [Common, Uncommon, Rare, Epic, Legendary]
     */
    function validateRarityBps(uint256[5] memory rarityBps) internal pure {
        uint256 total;
        for (uint256 i = 0; i < 5; ++i) {
            total += rarityBps[i];
        }
        require(total == BASIS_POINTS, "Invalid rarity distribution");
    }

    /**
     * @notice Converts USD amount (18 decimals) to USDC amount (6 decimals)
     * @param amountUSD Amount in USD (18 decimals)
     * @return amountUSDC Equivalent amount in USDC (6 decimals)
     */
    function usdToUsdc(uint256 amountUSD) internal pure returns (uint256 amountUSDC) {
        return amountUSD / USD_TO_USDC_CONVERSION;
    }

    /**
     * @notice Converts USDC amount (6 decimals) to USD amount (18 decimals)
     * @param amountUSDC Amount in USDC (6 decimals)
     * @return amountUSD Equivalent amount in USD (18 decimals)
     */
    function usdcToUsd(uint256 amountUSDC) internal pure returns (uint256 amountUSD) {
        return amountUSDC * USD_TO_USDC_CONVERSION;
    }
}