"use client";

import { useMemo } from "react";
import { useReadContract } from "wagmi";
import { gachaAbi } from "../generated";
import {
	type RarityConfigItem,
	DEFAULT_RARITY_CONFIG,
	buildRarityConfig,
} from "../lib/rarityConfig";

type Address = `0x${string}`;

export interface RarityConfigResult {
	/** The rarity config array (falls back to DEFAULT_RARITY_CONFIG while loading) */
	config: RarityConfigItem[];
	/** Rarity names */
	names: string[];
	/** Number of rarity tiers */
	numRarities: number;
	/** Whether the config has been built from static data */
	isLoaded: boolean;
}

/**
 * Hook to build rarity configuration from static gacha config names
 * and optional on-chain weights.
 *
 * Rarity names are immutable after deployment, so they come from
 * the static GachaConfig rather than an RPC call.
 *
 * @param rarityNames - Static rarity names from GachaConfig
 * @param gachaAddress - Gacha contract address (optional, for weights)
 */
export function useRarityConfig(
	rarityNames: string[],
	gachaAddress?: Address | undefined,
): RarityConfigResult {
	// Read target rarity weights from gacha contract (optional)
	const { data: targetBps } = useReadContract({
		address: gachaAddress,
		abi: gachaAbi,
		functionName: "getTargetRarityBps",
		query: { enabled: !!gachaAddress },
	});

	const result = useMemo((): RarityConfigResult => {
		if (!rarityNames.length) {
			return {
				config: DEFAULT_RARITY_CONFIG,
				names: DEFAULT_RARITY_CONFIG.map((c) => c.name),
				numRarities: DEFAULT_RARITY_CONFIG.length,
				isLoaded: false,
			};
		}

		const weights = targetBps
			? targetBps.map((bps) => Number(bps) / 10)
			: undefined;

		const config = buildRarityConfig(rarityNames, weights);

		return {
			config,
			names: rarityNames,
			numRarities: rarityNames.length,
			isLoaded: true,
		};
	}, [rarityNames, targetBps]);

	return result;
}
