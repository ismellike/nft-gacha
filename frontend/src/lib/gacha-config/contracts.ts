import { getGachaConfig } from "../gacha-config";
import type { GachaContracts } from "@/types/contracts";

/**
 * Get contract addresses for a specific gacha by ID
 */
export function getGachaContracts(gachaId: string): GachaContracts {
	const gachaConfig = getGachaConfig(gachaId);

	if (!gachaConfig) {
		throw new Error(`Gacha config not found for ID: ${gachaId}`);
	}

	return {
		gacha: gachaConfig.address as `0x${string}`,
		treasury: gachaConfig.treasuryAddress as `0x${string}`,
		appraisal: gachaConfig.appraisalAddress as `0x${string}`,
		economyManager: gachaConfig.economyManagerAddress as `0x${string}`,
		gachaServiceHandler:
			gachaConfig.gachaServiceHandlerAddress as `0x${string}`,
		depositorVault: gachaConfig.depositorVaultAddress as `0x${string}`,
		buybackVault: gachaConfig.buybackVaultAddress as `0x${string}`,
		protocolTreasury: gachaConfig.protocolTreasuryAddress as `0x${string}`,
		trackers: {
			common: gachaConfig.trackerAddresses.common as `0x${string}`,
			uncommon: gachaConfig.trackerAddresses.uncommon as `0x${string}`,
			rare: gachaConfig.trackerAddresses.rare as `0x${string}`,
			epic: gachaConfig.trackerAddresses.epic as `0x${string}`,
			legendary: gachaConfig.trackerAddresses.legendary as `0x${string}`,
		},
	};
}

/**
 * Default gacha ID for the application
 * In the future this could come from route params or user selection
 */
export const DEFAULT_GACHA_ID = "graded-pokemon";

/**
 * Get contracts for the default gacha
 */
export function getDefaultGachaContracts() {
	return getGachaContracts(DEFAULT_GACHA_ID);
}
