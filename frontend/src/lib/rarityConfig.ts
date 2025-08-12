// Shared rarity configuration for consistent styling across components

export enum Rarity {
	Common = 0,
	Uncommon = 1,
	Rare = 2,
	Epic = 3,
	Legendary = 4,
}

export interface RarityConfigItem {
	name: string;
	percentage: number;
	bgGradient: string;
	borderColor: string;
	textColor: string;
	chipColor:
		| "default"
		| "primary"
		| "secondary"
		| "success"
		| "warning"
		| "danger";
	glowColor: string;
	description: string;
	emoji: string;
}

export const RARITY_CONFIG: Record<Rarity, RarityConfigItem> = {
	[Rarity.Common]: {
		name: "Common",
		percentage: 70,
		bgGradient: "from-zinc-600 to-zinc-700",
		borderColor: "border-zinc-600/50",
		textColor: "text-zinc-200",
		chipColor: "default" as const,
		glowColor: "shadow-zinc-600/20",
		description: "70% drop rate",
		emoji: "⚪",
	},
	[Rarity.Uncommon]: {
		name: "Uncommon",
		percentage: 20,
		bgGradient: "from-green-500 to-emerald-600",
		borderColor: "border-green-500/50",
		textColor: "text-green-200",
		chipColor: "success" as const,
		glowColor: "shadow-green-500/20",
		description: "20% drop rate",
		emoji: "🟢",
	},
	[Rarity.Rare]: {
		name: "Rare",
		percentage: 6,
		bgGradient: "from-blue-500 to-purple-600",
		borderColor: "border-blue-500/50",
		textColor: "text-blue-200",
		chipColor: "primary" as const,
		glowColor: "shadow-blue-500/20",
		description: "6% drop rate",
		emoji: "🔵",
	},
	[Rarity.Epic]: {
		name: "Epic",
		percentage: 3,
		bgGradient: "from-purple-500 to-pink-600",
		borderColor: "border-purple-500/50",
		textColor: "text-purple-200",
		chipColor: "secondary" as const,
		glowColor: "shadow-purple-500/20",
		description: "3% drop rate",
		emoji: "🟣",
	},
	[Rarity.Legendary]: {
		name: "Legendary",
		percentage: 1,
		bgGradient: "from-orange-500 to-red-600",
		borderColor: "border-orange-500/50",
		textColor: "text-orange-200",
		chipColor: "warning" as const,
		glowColor: "shadow-orange-500/20",
		description: "1% drop rate",
		emoji: "🟠",
	},
} as const;

export const getRarityConfig = (rarity: Rarity): RarityConfigItem =>
	RARITY_CONFIG[rarity];

export const getAllRarities = (): Rarity[] =>
	Object.values(Rarity).filter((v) => typeof v === "number") as Rarity[];

// Utility functions for rarity operations
export const getRarityByName = (name: string): Rarity | undefined => {
	return getAllRarities().find(
		(rarity) => RARITY_CONFIG[rarity].name.toLowerCase() === name.toLowerCase(),
	);
};

export const getRarityName = (rarity: Rarity): string => {
	return RARITY_CONFIG[rarity].name;
};

export const getRarityEmoji = (rarity: Rarity): string => {
	return RARITY_CONFIG[rarity].emoji;
};

// Convert numeric rarity from contract events to Rarity enum
export const rarityFromNumber = (rarityNumber: number): Rarity => {
	if (rarityNumber in Rarity) {
		return rarityNumber as Rarity;
	}
	// Default to Common if invalid number
	return Rarity.Common;
};
