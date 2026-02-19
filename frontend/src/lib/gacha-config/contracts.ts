import { ENV_MODE } from "../config";
import { LOCAL_GACHA_CONFIGS } from "./local";
import { MAINNET_GACHA_CONFIGS } from "./mainnet";
import { TESTNET_GACHA_CONFIGS } from "./testnet";
import type { GachaConfig } from "./types";
import { getAllActiveGachas, getGachaConfig } from "./utils";

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

const FALLBACK_GACHA_ID = "graded-pokemon";
const defaultGacha =
	getGachaConfig(GACHA_CONFIGS, FALLBACK_GACHA_ID) ||
	getAllActiveGachas(GACHA_CONFIGS)[0];

export const DEFAULT_GACHA_ID = defaultGacha?.id || FALLBACK_GACHA_ID;

const emptyTrackers = {
	common: undefined,
	uncommon: undefined,
	rare: undefined,
	epic: undefined,
	legendary: undefined,
} as const;

const emptyContracts = {
	gacha: undefined,
	treasury: undefined,
	appraisal: undefined,
	economyManager: undefined,
	gachaServiceHandler: undefined,
	appraisalServiceHandler: undefined,
	depositorVault: undefined,
	buybackVault: undefined,
	protocolTreasury: undefined,
	trackers: emptyTrackers,
};

export function getGachaContracts(gachaId: string) {
	const config: GachaConfig | undefined =
		getGachaConfig(GACHA_CONFIGS, gachaId) || defaultGacha;

	if (!config) {
		return emptyContracts;
	}

	return {
		gacha: config.address,
		treasury: config.treasuryAddress,
		appraisal: config.appraisalAddress,
		economyManager: config.economyManagerAddress,
		gachaServiceHandler: config.gachaServiceHandlerAddress,
		appraisalServiceHandler: config.appraisalServiceHandlerAddress,
		depositorVault: config.depositorVaultAddress,
		buybackVault: config.buybackVaultAddress,
		protocolTreasury: config.protocolTreasuryAddress,
		trackers: config.trackerAddresses,
	};
}
