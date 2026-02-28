/**
 * Utility functions for handling rarity conversions and common operations
 */

import { DEFAULT_RARITY_NAMES } from "./rarityConfig";

/**
 * Convert rarity index to readable name
 */
export function rarityIndexToName(
	rarityIndex: number,
	names: readonly string[] = DEFAULT_RARITY_NAMES,
): string {
	return names[rarityIndex] ?? "Unknown";
}

/**
 * Convert rarity bigint to readable name
 */
export function rarityBigIntToName(
	rarity: bigint | undefined | number,
	names: readonly string[] = DEFAULT_RARITY_NAMES,
): string {
	if (rarity === undefined) return "Unknown";
	return rarityIndexToName(Number(rarity), names);
}

/**
 * Validate if a string is a valid rarity name
 */
export function isValidRarityName(
	name: string,
	names: readonly string[] = DEFAULT_RARITY_NAMES,
): boolean {
	return names.includes(name);
}

/**
 * Get rarity index from name (inverse operation)
 */
export function rarityNameToIndex(
	name: string,
	names: readonly string[] = DEFAULT_RARITY_NAMES,
): number {
	return names.indexOf(name);
}
