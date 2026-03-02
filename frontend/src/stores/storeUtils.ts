/**
 * Shared store utilities used by multiple Zustand stores.
 */

/**
 * Generate a unique key for a user + gacha contract address combination.
 * Normalises both addresses to lower-case so the key is case-insensitive.
 */
export const getSpinKey = (userAddress: string, gachaAddress: string) =>
	`${userAddress.toLowerCase()}_${gachaAddress.toLowerCase()}`;

/**
 * Generate a unique key for an NFT identified by collection address + token ID.
 * Normalises the collection address to lower-case for case-insensitive lookups.
 */
export const createNFTKey = (
	collection: string,
	tokenId: string | bigint,
): string => `${collection.toLowerCase()}:${tokenId.toString()}`;
