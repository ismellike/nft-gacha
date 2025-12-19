import type { GachaConfig } from "./types";

// Mainnet configurations - placeholder for now
export const MAINNET_GACHA_CONFIGS: Record<string, GachaConfig> = {
	// Mainnet contracts not yet deployed - placeholder configuration
	// Populate with real values when deploying to mainnet
	"placeholder-mainnet": {
		id: "placeholder-mainnet",
		address: "" as `0x${string}`,
		title: "Mainnet Placeholder",
		description: "",
		longDescription: "",
		theme: "from-secondary to-warning-500",
		treasuryAddress: "" as `0x${string}`,
		isActive: false,
		createdAt: "",
		appraisalAddress: "" as `0x${string}`,
		economyManagerAddress: "" as `0x${string}`,
		gachaServiceHandlerAddress: "" as `0x${string}`,
		appraisalServiceHandlerAddress: "" as `0x${string}`,
		depositorVaultAddress: "" as `0x${string}`,
		buybackVaultAddress: "" as `0x${string}`,
		protocolTreasuryAddress: "" as `0x${string}`,
		trackerAddresses: {
			common: "" as `0x${string}`,
			uncommon: "" as `0x${string}`,
			rare: "" as `0x${string}`,
			epic: "" as `0x${string}`,
			legendary: "" as `0x${string}`,
		},
	},
};
