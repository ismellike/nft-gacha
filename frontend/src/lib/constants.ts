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
