import { env } from "@/env";
import type { GachaConfig } from "./types";

export const MAINNET_GACHA_CONFIGS: Record<string, GachaConfig> = {
	"graded-pokemon": {
		id: "graded-pokemon",
		address: env.NEXT_PUBLIC_GACHA_CONTRACT_ADDRESS,
		title: "Graded Pokemon Cards",
		description:
			"Collect graded Pokemon cards from different rarities. Each spin unlocks authentic Pokemon trading cards with verified grades and pristine condition.",
		longDescription: `
      Welcome to Graded Pokemon Cards - our flagship gacha experience featuring professionally graded Pokemon trading cards with verified authenticity and condition.
      
      Each Pokemon card belongs to one of five rarity tiers, with increasing scarcity and collectible value. Common cards provide great entry points for any collection,
      while Legendary cards are the holy grail that every Pokemon collector dreams of owning.
      
      The rarity system is completely transparent and verifiable on-chain, ensuring fair distribution across all participants.
    `,
		theme: "from-blue-500 to-yellow-500",
		treasuryAddress: env.NEXT_PUBLIC_TREASURY_CONTRACT_ADDRESS,
		isActive: true,
		createdAt: "2024-01-01",
	},
};
