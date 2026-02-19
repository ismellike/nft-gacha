import type { GachaConfig } from "./types";

/**
 * Read an env-var as a hex address. When `fallback` is true (testnet/mainnet),
 * missing variables resolve to `""` so the app can still start—validation in
 * gacha-config.ts will log a warning instead.
 */
function addr(key: string, fallback: boolean): `0x${string}` {
	const value = process.env[key];
	return (fallback ? (value ?? "") : value) as `0x${string}`;
}

interface ConfigOverrides {
	title: string;
	description: string;
	longDescription: string;
	/** Use `?? ""` fallback for env vars (default: false). */
	emptyFallback?: boolean | undefined;
}

export function createGachaConfig(
	overrides: ConfigOverrides,
): Record<string, GachaConfig> {
	const fb = overrides.emptyFallback ?? false;

	return {
		"graded-pokemon": {
			id: "graded-pokemon",
			address: addr("NEXT_PUBLIC_GACHA_ADDRESS", fb),
			title: overrides.title,
			description: overrides.description,
			longDescription: overrides.longDescription,
			theme: "from-secondary to-warning-500",
			treasuryAddress: addr("NEXT_PUBLIC_GACHA_TREASURY_ADDRESS", fb),
			isActive: true,
			createdAt: "2024-01-01",
			appraisalAddress: addr("NEXT_PUBLIC_NFT_APPRAISAL_ADDRESS", fb),
			economyManagerAddress: addr(
				"NEXT_PUBLIC_ECONOMY_MANAGER_ADDRESS",
				fb,
			),
			gachaServiceHandlerAddress: addr(
				"NEXT_PUBLIC_GACHA_SERVICE_HANDLER_ADDRESS",
				fb,
			),
			appraisalServiceHandlerAddress: ((process.env
				.NEXT_PUBLIC_APPRAISAL_SERVICE_HANDLER_ADDRESS ||
				process.env.APPRAISAL_SERVICE_HANDLER_ADDRESS) ??
				(fb ? "" : undefined)) as `0x${string}`,
			depositorVaultAddress: addr(
				"NEXT_PUBLIC_DEPOSITOR_VAULT_ADDRESS",
				fb,
			),
			buybackVaultAddress: addr("NEXT_PUBLIC_BUYBACK_VAULT_ADDRESS", fb),
			protocolTreasuryAddress: addr(
				"NEXT_PUBLIC_PROTOCOL_TREASURY_ADDRESS",
				fb,
			),
			trackerAddresses: {
				common: addr("NEXT_PUBLIC_COMMON_TRACKER_ADDRESS", fb),
				uncommon: addr("NEXT_PUBLIC_UNCOMMON_TRACKER_ADDRESS", fb),
				rare: addr("NEXT_PUBLIC_RARE_TRACKER_ADDRESS", fb),
				epic: addr("NEXT_PUBLIC_EPIC_TRACKER_ADDRESS", fb),
				legendary: addr("NEXT_PUBLIC_LEGENDARY_TRACKER_ADDRESS", fb),
			},
		},
	};
}
