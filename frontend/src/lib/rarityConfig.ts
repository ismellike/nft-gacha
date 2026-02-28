// Shared rarity configuration for consistent styling across components

export interface RarityConfigItem {
	index: number;
	name: string;
	percentage: number;
	bgGradient: string;
	borderColor: string;
	textColor: string;
	chipColor:
		| "glass"
		| "primary"
		| "secondary"
		| "success"
		| "warning"
		| "danger";
	glowColor: string;
	hexColor: string;
	description: string;
	emoji: string;
}

// 10-slot color palette for styling any number of rarity tiers (2-10)
// Each entry has hardcoded Tailwind classes so they survive purging
const RARITY_PALETTE: Omit<
	RarityConfigItem,
	"index" | "name" | "percentage" | "description"
>[] = [
	// Slot 0: Gray (lowest tier)
	{
		bgGradient: "from-rarity-common-500 to-rarity-common-600",
		borderColor: "border-rarity-common-500/50",
		textColor: "text-rarity-common-200",
		chipColor: "glass",
		glowColor: "shadow-rarity-common-500/20",
		hexColor: "#9CA3AF",
		emoji: "⚪",
	},
	// Slot 1: Green
	{
		bgGradient: "from-rarity-uncommon-500 to-rarity-uncommon-600",
		borderColor: "border-rarity-uncommon-500/50",
		textColor: "text-rarity-uncommon-200",
		chipColor: "success",
		glowColor: "shadow-rarity-uncommon-500/20",
		hexColor: "#10B981",
		emoji: "🟢",
	},
	// Slot 2: Blue
	{
		bgGradient: "from-rarity-rare-500 to-rarity-rare-600",
		borderColor: "border-rarity-rare-500/50",
		textColor: "text-rarity-rare-200",
		chipColor: "primary",
		glowColor: "shadow-rarity-rare-500/20",
		hexColor: "#3B82F6",
		emoji: "🔵",
	},
	// Slot 3: Purple
	{
		bgGradient: "from-rarity-epic-500 to-rarity-epic-600",
		borderColor: "border-rarity-epic-500/50",
		textColor: "text-rarity-epic-200",
		chipColor: "secondary",
		glowColor: "shadow-rarity-epic-500/20",
		hexColor: "#8B5CF6",
		emoji: "🟣",
	},
	// Slot 4: Amber
	{
		bgGradient: "from-rarity-legendary-500 to-rarity-legendary-600",
		borderColor: "border-rarity-legendary-500/50",
		textColor: "text-rarity-legendary-200",
		chipColor: "warning",
		glowColor: "shadow-rarity-legendary-500/20",
		hexColor: "#F59E0B",
		emoji: "🟠",
	},
	// Slot 5: Pink/Rose
	{
		bgGradient: "from-pink-500 to-pink-600",
		borderColor: "border-pink-500/50",
		textColor: "text-pink-200",
		chipColor: "danger",
		glowColor: "shadow-pink-500/20",
		hexColor: "#EC4899",
		emoji: "🩷",
	},
	// Slot 6: Teal
	{
		bgGradient: "from-teal-500 to-teal-600",
		borderColor: "border-teal-500/50",
		textColor: "text-teal-200",
		chipColor: "success",
		glowColor: "shadow-teal-500/20",
		hexColor: "#14B8A6",
		emoji: "💎",
	},
	// Slot 7: Indigo
	{
		bgGradient: "from-indigo-500 to-indigo-600",
		borderColor: "border-indigo-500/50",
		textColor: "text-indigo-200",
		chipColor: "primary",
		glowColor: "shadow-indigo-500/20",
		hexColor: "#6366F1",
		emoji: "💜",
	},
	// Slot 8: Red/Crimson
	{
		bgGradient: "from-red-500 to-red-600",
		borderColor: "border-red-500/50",
		textColor: "text-red-200",
		chipColor: "danger",
		glowColor: "shadow-red-500/20",
		hexColor: "#EF4444",
		emoji: "🔴",
	},
	// Slot 9: Gold (supreme tier)
	{
		bgGradient: "from-yellow-500 to-yellow-600",
		borderColor: "border-yellow-500/50",
		textColor: "text-yellow-200",
		chipColor: "warning",
		glowColor: "shadow-yellow-500/20",
		hexColor: "#EAB308",
		emoji: "👑",
	},
];

// Default descriptions for the standard 5-tier system
const DEFAULT_DESCRIPTIONS = [
	"Standard cards with steady rewards and high availability",
	"Enhanced cards with improved reward multipliers",
	"Valuable cards with significant reward bonuses",
	"Premium cards with substantial reward amplification",
	"Elite cards with maximum reward potential",
];

// Default rarity names (used before contract data loads)
export const DEFAULT_RARITY_NAMES = [
	"Common",
	"Uncommon",
	"Rare",
	"Epic",
	"Legendary",
];

// Default percentages for the standard 5-tier system
const DEFAULT_PERCENTAGES = [70, 20, 6, 3, 1];

/**
 * Build rarity config array from on-chain names and optional weights
 */
export function buildRarityConfig(
	names: string[],
	weights?: number[],
): RarityConfigItem[] {
	const numRarities = names.length;
	return names.map((name, i) => ({
		index: i,
		name,
		percentage:
			weights?.[i] ??
			(i < DEFAULT_PERCENTAGES.length
				? DEFAULT_PERCENTAGES[i]
				: Math.round(100 / numRarities)),
		description:
			i < DEFAULT_DESCRIPTIONS.length
				? DEFAULT_DESCRIPTIONS[i]
				: `Tier ${i + 1} cards`,
		...RARITY_PALETTE[i % RARITY_PALETTE.length],
	}));
}

// Default 5-rarity config (used before contract data loads)
export const DEFAULT_RARITY_CONFIG: RarityConfigItem[] = buildRarityConfig(
	DEFAULT_RARITY_NAMES,
	DEFAULT_PERCENTAGES,
);

/**
 * Get config for a specific rarity index
 */
export const getRarityConfig = (
	rarityIndex: number,
	config: RarityConfigItem[] = DEFAULT_RARITY_CONFIG,
): RarityConfigItem => config[rarityIndex] ?? config[0];

/**
 * Get all rarity indices as array
 */
export const getAllRarities = (
	numRarities = DEFAULT_RARITY_CONFIG.length,
): number[] => Array.from({ length: numRarities }, (_, i) => i);

/**
 * Get emoji for a rarity index
 */
export const getRarityEmoji = (
	rarityIndex: number,
	config: RarityConfigItem[] = DEFAULT_RARITY_CONFIG,
): string => getRarityConfig(rarityIndex, config).emoji;

/**
 * Convert numeric rarity from contract events to validated index
 */
export const rarityFromNumber = (
	rarityNumber: number,
	numRarities = DEFAULT_RARITY_CONFIG.length,
): number => {
	if (rarityNumber >= 0 && rarityNumber < numRarities) {
		return rarityNumber;
	}
	return 0;
};

// Hex color shades for the 10 palette slots (for programmatic use)
const PALETTE_COLOR_SHADES: Record<number, Record<number, string>> = {
	0: {
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
	1: {
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
	2: {
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
	3: {
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
	4: {
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
	5: {
		50: "#fdf2f8",
		100: "#fce7f3",
		200: "#fbcfe8",
		300: "#f9a8d4",
		400: "#f472b6",
		500: "#ec4899",
		600: "#db2777",
		700: "#be185d",
		800: "#9d174d",
		900: "#831843",
		950: "#500724",
	},
	6: {
		50: "#f0fdfa",
		100: "#ccfbf1",
		200: "#99f6e4",
		300: "#5eead4",
		400: "#2dd4bf",
		500: "#14b8a6",
		600: "#0d9488",
		700: "#0f766e",
		800: "#115e59",
		900: "#134e4a",
		950: "#042f2e",
	},
	7: {
		50: "#eef2ff",
		100: "#e0e7ff",
		200: "#c7d2fe",
		300: "#a5b4fc",
		400: "#818cf8",
		500: "#6366f1",
		600: "#4f46e5",
		700: "#4338ca",
		800: "#3730a3",
		900: "#312e81",
		950: "#1e1b4b",
	},
	8: {
		50: "#fef2f2",
		100: "#fee2e2",
		200: "#fecaca",
		300: "#fca5a5",
		400: "#f87171",
		500: "#ef4444",
		600: "#dc2626",
		700: "#b91c1c",
		800: "#991b1b",
		900: "#7f1d1d",
		950: "#450a0a",
	},
	9: {
		50: "#fefce8",
		100: "#fef9c3",
		200: "#fef08a",
		300: "#fde047",
		400: "#facc15",
		500: "#eab308",
		600: "#ca8a04",
		700: "#a16207",
		800: "#854d0e",
		900: "#713f12",
		950: "#422006",
	},
};

/**
 * Get rarity color hex values for programmatic use
 */
export const getRarityColorHex = (
	rarityIndex: number,
	shade: 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950 = 500,
): string => {
	const paletteIndex = rarityIndex % RARITY_PALETTE.length;
	return (
		PALETTE_COLOR_SHADES[paletteIndex]?.[shade] ?? PALETTE_COLOR_SHADES[0][500]
	);
};
