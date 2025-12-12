import type { GachaConfig } from "./types";
import { getAllActiveGachas, getGachaConfig } from "../gacha-config";

const FALLBACK_GACHA_ID = "graded-pokemon";
const defaultGacha = getGachaConfig(FALLBACK_GACHA_ID) || getAllActiveGachas()[0];

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
	depositorVault: undefined,
	buybackVault: undefined,
	protocolTreasury: undefined,
	trackers: emptyTrackers,
};

export function getGachaContracts(gachaId: string) {
	const config: GachaConfig | undefined =
		getGachaConfig(gachaId) || defaultGacha;

	if (!config) {
		return emptyContracts;
	}

	return {
		gacha: config.address,
		treasury: config.treasuryAddress,
		appraisal: config.appraisalAddress,
		economyManager: config.economyManagerAddress,
		gachaServiceHandler: config.gachaServiceHandlerAddress,
		depositorVault: config.depositorVaultAddress,
		buybackVault: config.buybackVaultAddress,
		protocolTreasury: config.protocolTreasuryAddress,
		trackers: config.trackerAddresses,
	};
}
