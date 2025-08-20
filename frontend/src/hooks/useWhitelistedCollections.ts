"use client";

import { useReadGachaTreasuryGetWhitelistedCollections } from "../generated";

/**
 * Hook to fetch whitelisted collections from the treasury contract
 * @param treasuryAddress Treasury contract address
 * @param enabled Whether the query should be enabled
 * @returns Query result with whitelisted collections
 */
export function useWhitelistedCollections(
	treasuryAddress: `0x${string}` | undefined,
	enabled = true,
) {
	return useReadGachaTreasuryGetWhitelistedCollections({
		address: treasuryAddress,
		query: {
			enabled: enabled && !!treasuryAddress,
			staleTime: 30000, // Cache for 30 seconds
			retry: 3,
		},
	});
}

/**
 * Hook to get whitelisted collections for a specific gacha
 * Uses the gacha config to get the treasury address
 * @param gachaId The gacha configuration ID
 * @param enabled Whether the query should be enabled
 */
export function useGachaWhitelistedCollections(
	gachaId?: string,
	enabled = true,
) {
	// Import here to avoid circular dependency
	const { getGachaConfig } = require("../lib/gacha-config");
	const gachaConfig = gachaId ? getGachaConfig(gachaId) : null;
	const treasuryAddress = gachaConfig?.treasuryAddress as
		| `0x${string}`
		| undefined;

	return useWhitelistedCollections(treasuryAddress, enabled && !!gachaConfig);
}
