/**
 * Centralized constants for hooks and utilities
 */

// Cache durations
export const CACHE_DURATIONS = {
	SHORT: 1 * 60 * 1000, // 1 minute
	MEDIUM: 10 * 60 * 1000, // 10 minutes
	LONG: 60 * 60 * 1000, // 1 hour
} as const;

// Interface IDs for ERC721
export const ERC721_INTERFACES = {
	ENUMERABLE: "0x780e9d63" as const,
	METADATA: "0x5b5e139f" as const,
} as const;

// Rarity values
export const RARITY_VALUES = {
	COMMON: 0 as const,
	UNCOMMON: 1 as const,
	RARE: 2 as const,
	EPIC: 3 as const,
	LEGENDARY: 4 as const,
} as const;

export type Rarity = (typeof RARITY_VALUES)[keyof typeof RARITY_VALUES];

// Batch sizes for operations
export const BATCH_SIZES = {
	NFT_METADATA: 6,
	CARD_APPRAISAL: 50,
	USER_NFTS: 100,
} as const;

// Request timeouts
export const TIMEOUTS = {
	METADATA_FETCH: 10000, // 10 seconds
	CONTRACT_READ: 30000, // 30 seconds
	BATCH_OPERATION: 60000, // 1 minute
} as const;

// Cache limits
export const CACHE_LIMITS = {
	METADATA_CACHE_SIZE: 500,
	TOKEN_URI_CACHE_SIZE: 1000,
} as const;

// Default retry counts
export const RETRY_COUNTS = {
	DEFAULT: 2,
	METADATA: 3,
	CONTRACT_CALL: 1,
} as const;

// Network request priorities
export const PRIORITIES = {
	HIGH: 10,
	MEDIUM: 5,
	LOW: 1,
	PRELOAD: 0,
} as const;
