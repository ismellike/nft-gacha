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
	hexColor: string; // Added explicit hex color for glow effects
	description: string;
	emoji: string;
}

export const RARITY_CONFIG: Record<Rarity, RarityConfigItem> = {
	[Rarity.Common]: {
		name: "Common",
		percentage: 70,
		bgGradient: "from-rarity-common-500 to-rarity-common-600",
		borderColor: "border-rarity-common-500/50",
		textColor: "text-rarity-common-200",
		chipColor: "default" as const,
		glowColor: "shadow-rarity-common-500/20",
		hexColor: "#9CA3AF", // Gray
		description: "Standard cards with steady rewards and high availability",
		emoji: "⚪",
	},
	[Rarity.Uncommon]: {
		name: "Uncommon",
		percentage: 20,
		bgGradient: "from-rarity-uncommon-500 to-rarity-uncommon-600",
		borderColor: "border-rarity-uncommon-500/50",
		textColor: "text-rarity-uncommon-200",
		chipColor: "success" as const,
		glowColor: "shadow-rarity-uncommon-500/20",
		hexColor: "#10B981", // Green
		description: "Enhanced cards with improved reward multipliers",
		emoji: "🟢",
	},
	[Rarity.Rare]: {
		name: "Rare",
		percentage: 6,
		bgGradient: "from-rarity-rare-500 to-rarity-rare-600",
		borderColor: "border-rarity-rare-500/50",
		textColor: "text-rarity-rare-200",
		chipColor: "primary" as const,
		glowColor: "shadow-rarity-rare-500/20",
		hexColor: "#3B82F6", // Blue
		description: "Valuable cards with significant reward bonuses",
		emoji: "🔵",
	},
	[Rarity.Epic]: {
		name: "Epic",
		percentage: 3,
		bgGradient: "from-rarity-epic-500 to-rarity-epic-600",
		borderColor: "border-rarity-epic-500/50",
		textColor: "text-rarity-epic-200",
		chipColor: "secondary" as const,
		glowColor: "shadow-rarity-epic-500/20",
		hexColor: "#8B5CF6", // Purple
		description: "Premium cards with substantial reward amplification",
		emoji: "🟣",
	},
	[Rarity.Legendary]: {
		name: "Legendary",
		percentage: 1,
		bgGradient: "from-rarity-legendary-500 to-rarity-legendary-600",
		borderColor: "border-rarity-legendary-500/50",
		textColor: "text-rarity-legendary-200",
		chipColor: "warning" as const,
		glowColor: "shadow-rarity-legendary-500/20",
		hexColor: "#F59E0B", // Orange/Amber
		description: "Elite cards with maximum reward potential",
		emoji: "🟠",
	},
} as const;

export const getRarityConfig = (rarity: Rarity): RarityConfigItem =>
	RARITY_CONFIG[rarity];

export const getAllRarities = (): Rarity[] => [
	Rarity.Common,
	Rarity.Uncommon,
	Rarity.Rare,
	Rarity.Epic,
	Rarity.Legendary,
];

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

// Get rarity color hex values for programmatic use
export const getRarityColorHex = (
	rarity: Rarity,
	shade: 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950 = 500,
): string => {
	const rarityName = getRarityConfig(rarity).name.toLowerCase();
	const colorMap = {
		common: {
			50: "#fafafa",
			100: "#f4f4f5",
			200: "#e4e4e7",
			300: "#d4d4d8",
			400: "#a1a1aa",
			500: "#71717a",
			600: "#52525b",
			700: "#3f3f46",
			800: "#27272a",
			900: "#18181b",
			950: "#09090b",
		},
		uncommon: {
			50: "#f0fdf4",
			100: "#dcfce7",
			200: "#bbf7d0",
			300: "#86efac",
			400: "#4ade80",
			500: "#22c55e",
			600: "#16a34a",
			700: "#15803d",
			800: "#166534",
			900: "#14532d",
			950: "#052e16",
		},
		rare: {
			50: "#eff6ff",
			100: "#dbeafe",
			200: "#bfdbfe",
			300: "#93c5fd",
			400: "#60a5fa",
			500: "#3b82f6",
			600: "#2563eb",
			700: "#1d4ed8",
			800: "#1e40af",
			900: "#1e3a8a",
			950: "#172554",
		},
		epic: {
			50: "#faf5ff",
			100: "#f3e8ff",
			200: "#e9d5ff",
			300: "#d8b4fe",
			400: "#c084fc",
			500: "#a855f7",
			600: "#9333ea",
			700: "#7c3aed",
			800: "#6b21a8",
			900: "#581c87",
			950: "#3b0764",
		},
		legendary: {
			50: "#fef7ed",
			100: "#fdedd3",
			200: "#fcd9a5",
			300: "#fbbf6d",
			400: "#f89b32",
			500: "#f57c00",
			600: "#e65100",
			700: "#bf360c",
			800: "#8d2a00",
			900: "#5d1f00",
			950: "#3e0e00",
		},
	};

	return (
		colorMap[rarityName as keyof typeof colorMap]?.[shade] ||
		colorMap.common[500]
	);
};
