/**
 * Utility functions for handling rarity conversions and common operations
 */

export const RARITY_NAMES = [
	"Common",
	"Uncommon",
	"Rare",
	"Epic",
	"Legendary",
] as const;
export type ValidRarityName = (typeof RARITY_NAMES)[number];
export type RarityName = ValidRarityName | "Unknown";

/**
 * Convert rarity enum number to readable name
 */
export function rarityIndexToName(rarityIndex: number): RarityName {
	return RARITY_NAMES[rarityIndex] || "Unknown";
}

/**
 * Convert rarity enum bigint to readable name
 */
export function rarityBigIntToName(
	rarity: bigint | undefined | number,
): RarityName {
	if (rarity === undefined) return "Unknown";
	return rarityIndexToName(Number(rarity));
}

/**
 * Validate if a string is a valid rarity name
 */
export function isValidRarityName(name: string): name is ValidRarityName {
	return RARITY_NAMES.includes(name as ValidRarityName);
}

/**
 * Get rarity index from name (inverse operation)
 */
export function rarityNameToIndex(name: string): number {
	return RARITY_NAMES.indexOf(name as ValidRarityName);
}
