import type { GachaConfig } from "./types";

// Testnet configurations - reads from environment variables (same pattern as local.ts)
export const TESTNET_GACHA_CONFIGS: Record<string, GachaConfig> = {
	"graded-pokemon": {
		id: "graded-pokemon",
		address: (process.env.NEXT_PUBLIC_GACHA_ADDRESS ?? "") as `0x${string}`,
		title: "Graded Pokemon Cards (Testnet)",
		description:
			"Collect professionally graded Pokemon trading cards on Polygon Amoy testnet.",
		longDescription:
			"Polygon Amoy testnet deployment of the Graded Pokemon Cards gacha system.",
		theme: "from-secondary to-warning-500",
		treasuryAddress: (process.env.NEXT_PUBLIC_GACHA_TREASURY_ADDRESS ??
			"") as `0x${string}`,
		isActive: true,
		createdAt: "2024-01-01",
		appraisalAddress: (process.env.NEXT_PUBLIC_NFT_APPRAISAL_ADDRESS ??
			"") as `0x${string}`,
		economyManagerAddress: (process.env.NEXT_PUBLIC_ECONOMY_MANAGER_ADDRESS ??
			"") as `0x${string}`,
		gachaServiceHandlerAddress: (process.env
			.NEXT_PUBLIC_GACHA_SERVICE_HANDLER_ADDRESS ?? "") as `0x${string}`,
		appraisalServiceHandlerAddress: ((process.env
			.NEXT_PUBLIC_APPRAISAL_SERVICE_HANDLER_ADDRESS ||
			process.env.APPRAISAL_SERVICE_HANDLER_ADDRESS) ??
			"") as `0x${string}`,
		depositorVaultAddress: (process.env.NEXT_PUBLIC_DEPOSITOR_VAULT_ADDRESS ??
			"") as `0x${string}`,
		buybackVaultAddress: (process.env.NEXT_PUBLIC_BUYBACK_VAULT_ADDRESS ??
			"") as `0x${string}`,
		protocolTreasuryAddress: (process.env
			.NEXT_PUBLIC_PROTOCOL_TREASURY_ADDRESS ?? "") as `0x${string}`,
		trackerAddresses: {
			common: (process.env.NEXT_PUBLIC_COMMON_TRACKER_ADDRESS ??
				"") as `0x${string}`,
			uncommon: (process.env.NEXT_PUBLIC_UNCOMMON_TRACKER_ADDRESS ??
				"") as `0x${string}`,
			rare: (process.env.NEXT_PUBLIC_RARE_TRACKER_ADDRESS ??
				"") as `0x${string}`,
			epic: (process.env.NEXT_PUBLIC_EPIC_TRACKER_ADDRESS ??
				"") as `0x${string}`,
			legendary: (process.env.NEXT_PUBLIC_LEGENDARY_TRACKER_ADDRESS ??
				"") as `0x${string}`,
		},
	},
};
