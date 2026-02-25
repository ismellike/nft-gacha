import { ENV_MODE } from "./config";
import { LOCAL_GACHA_CONFIGS } from "./gacha-config/local";
import {
	MAINNET_GACHA_CONFIGS,
	getMissingMainnetAddresses,
	validateMainnetConfig,
} from "./gacha-config/mainnet";
import {
	TESTNET_GACHA_CONFIGS,
	getMissingTestnetAddresses,
	validateTestnetConfig,
} from "./gacha-config/testnet";
import type { GachaConfig } from "./gacha-config/types";
import {
	getAllActiveGachas as getAllActiveGachasUtil,
	getGachaConfig as getGachaConfigUtil,
} from "./gacha-config/utils";

// Re-export types
export type { GachaConfig } from "./gacha-config/types";

// Get current environment's gacha configurations
const GACHA_CONFIGS = (() => {
	switch (ENV_MODE) {
		case "LOCAL":
			return LOCAL_GACHA_CONFIGS;
		case "TESTNET":
			return TESTNET_GACHA_CONFIGS;
		case "MAINNET":
			return MAINNET_GACHA_CONFIGS;
		default:
			return LOCAL_GACHA_CONFIGS;
	}
})();

// Run environment-specific validation at module load time.
// LOCAL configs are always fully populated via the task runner so no check
// is needed there.
if (ENV_MODE === "TESTNET") {
	validateTestnetConfig(GACHA_CONFIGS);
} else if (ENV_MODE === "MAINNET") {
	validateMainnetConfig(GACHA_CONFIGS);
}

// Environment-aware utility functions
export function getGachaConfig(id: string) {
	return getGachaConfigUtil(GACHA_CONFIGS, id);
}

export function getAllActiveGachas() {
	return getAllActiveGachasUtil(GACHA_CONFIGS);
}

// ---------------------------------------------------------------------------
// Cross-environment validation utilities
// ---------------------------------------------------------------------------

/**
 * Returns the list of environment variable names that still hold placeholder
 * values (empty string or zero address) for the given config.
 *
 * This is environment-aware: it delegates to the correct per-environment
 * helper so the caller doesn't need to know which env is active.
 */
export function getMissingAddresses(config: GachaConfig): string[] {
	switch (ENV_MODE) {
		case "TESTNET":
			return getMissingTestnetAddresses(config);
		case "MAINNET":
			return getMissingMainnetAddresses(config);
		default:
			// LOCAL configs are always fully populated; nothing to validate.
			return [];
	}
}

/**
 * Returns `true` when the given config has all contract addresses populated
 * with non-placeholder values and is therefore safe to use for live
 * interactions (reads, writes, etc.).
 */
export function isConfigDeploymentReady(config: GachaConfig): boolean {
	return getMissingAddresses(config).length === 0;
}

/**
 * Validates every config in the active environment and returns `true` when
 * all are deployment-ready.  Warnings / errors are emitted to the console for
 * any configs that are missing addresses.
 *
 * Useful as a pre-flight check in server components or middleware.
 */
export function validateConfig(
	configs: Record<string, GachaConfig> = GACHA_CONFIGS,
): boolean {
	switch (ENV_MODE) {
		case "TESTNET":
			return validateTestnetConfig(configs);
		case "MAINNET":
			return validateMainnetConfig(configs);
		default:
			// LOCAL is always considered valid.
			return true;
	}
}
