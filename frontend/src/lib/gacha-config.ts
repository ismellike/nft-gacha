import { ENV_MODE } from "./config";
import { LOCAL_GACHA_CONFIGS } from "./gacha-config/local";
import {
	MAINNET_GACHA_CONFIGS,
	validateMainnetConfig,
} from "./gacha-config/mainnet";
import {
	TESTNET_GACHA_CONFIGS,
	validateTestnetConfig,
} from "./gacha-config/testnet";
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

