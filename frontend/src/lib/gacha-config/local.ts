import type { GachaConfig } from "./types";

export const LOCAL_GACHA_CONFIGS: Record<string, GachaConfig> = {
	"graded-pokemon": {
		id: "graded-pokemon",
		address: process.env.NEXT_PUBLIC_GACHA_CONTRACT_ADDRESS as `0x${string}`,
		title: "Graded Pokémon Cards",
		description:
			"Collect professionally graded Pokémon trading cards from five distinct rarity tiers. Each spin unlocks authentic cards with verified grades and pristine condition ratings.",
		longDescription: `Welcome to Graded Pokémon Cards – our flagship gacha experience featuring professionally graded Pokémon trading cards with verified authenticity and condition ratings.

Each Pokémon card belongs to one of five carefully balanced rarity tiers:
• **Common** (70%) – Great starter cards for building your collection
• **Uncommon** (20%) – Solid cards with moderate rarity and value
• **Rare** (6%) – Sought-after cards with notable collectible appeal
• **Epic** (3%) – Premium cards that serious collectors treasure
• **Legendary** (1%) – The ultimate prize every Pokémon collector dreams of owning

**Key Features:**
• Transparent on-chain rarity system ensures fair distribution
• All cards feature verified PSA/BGS grading standards
• Instant NFT ownership with authentic provenance tracking
• Community-driven marketplace for trading and collecting

🚧 **Development Environment Active**
This is a test environment using local contracts and test tokens for development purposes.`,
		theme: "from-blue-500 to-yellow-500",
		treasuryAddress: process.env.NEXT_PUBLIC_TREASURY_CONTRACT_ADDRESS as `0x${string}`,
		isActive: true,
		createdAt: "2024-01-01",
		// Required contract addresses
		appraisalAddress: process.env.NEXT_PUBLIC_NFT_APPRAISAL_CONTRACT_ADDRESS as `0x${string}`,
		rewardsManagerAddress: process.env.NEXT_PUBLIC_REWARDS_MANAGER_ADDRESS as `0x${string}`,
		trackerAddresses: {
			common: process.env.NEXT_PUBLIC_COMMON_TRACKER_ADDRESS as `0x${string}`,
			uncommon: process.env.NEXT_PUBLIC_UNCOMMON_TRACKER_ADDRESS as `0x${string}`,
			rare: process.env.NEXT_PUBLIC_RARE_TRACKER_ADDRESS as `0x${string}`,
			epic: process.env.NEXT_PUBLIC_EPIC_TRACKER_ADDRESS as `0x${string}`,
			legendary: process.env.NEXT_PUBLIC_LEGENDARY_TRACKER_ADDRESS as `0x${string}`,
		},
	},
};