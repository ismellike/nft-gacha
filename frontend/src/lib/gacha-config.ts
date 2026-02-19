import { ENV_MODE } from "./config";
import { LOCAL_GACHA_CONFIGS } from "./gacha-config/local";
import { MAINNET_GACHA_CONFIGS } from "./gacha-config/mainnet";
import { TESTNET_GACHA_CONFIGS } from "./gacha-config/testnet";
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

// Warn about empty contract addresses in non-local environments
if (ENV_MODE !== "LOCAL") {
	for (const [id, config] of Object.entries(GACHA_CONFIGS)) {
		if (!config.address) {
			console.warn(
				`[gacha-config] Gacha "${id}" has no contract address in ${ENV_MODE} mode`,
			);
		}
	}
}

// Environment-aware utility functions
export function getGachaConfig(id: string) {
	return getGachaConfigUtil(GACHA_CONFIGS, id);
}

export function getAllActiveGachas() {
	return getAllActiveGachasUtil(GACHA_CONFIGS);
}
