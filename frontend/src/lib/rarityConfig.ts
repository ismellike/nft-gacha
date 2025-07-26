// Shared rarity configuration for consistent styling across components

export enum Rarity {
	Common = 0,
	Uncommon = 1,
	Rare = 2,
	Epic = 3,
	Legendary = 4,
}

export const RARITY_CONFIG = {
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

export const getRarityConfig = (rarity: Rarity) => RARITY_CONFIG[rarity];

export const getAllRarities = () => Object.values(Rarity).filter(v => typeof v === 'number') as Rarity[];