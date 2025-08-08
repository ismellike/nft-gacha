import { ENV_MODE } from "@/env";
import { LOCAL_GACHA_CONFIGS } from "./gacha-config/local";
import { TESTNET_GACHA_CONFIGS } from "./gacha-config/testnet";
import { MAINNET_GACHA_CONFIGS } from "./gacha-config/mainnet";
import {
	getGachaConfig as getGachaConfigUtil,
	getGachaConfigByAddress as getGachaConfigByAddressUtil,
	getAllActiveGachas as getAllActiveGachasUtil,
	formatGachaAddress,
} from "./gacha-config/utils";

// Re-export types
export type { GachaConfig } from "./gacha-config/types";

// Get current environment's gacha configurations
export const GACHA_CONFIGS = (() => {
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

// Environment-aware utility functions
export function getGachaConfig(id: string) {
	return getGachaConfigUtil(GACHA_CONFIGS, id);
}

export function getGachaConfigByAddress(address: string) {
	return getGachaConfigByAddressUtil(GACHA_CONFIGS, address);
}

export function getAllActiveGachas() {
	return getAllActiveGachasUtil(GACHA_CONFIGS);
}

// Re-export utility
export { formatGachaAddress };
