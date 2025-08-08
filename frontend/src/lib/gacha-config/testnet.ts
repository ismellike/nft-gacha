import { env } from "@/env";
import type { GachaConfig } from "./types";

export const TESTNET_GACHA_CONFIGS: Record<string, GachaConfig> = {
	"graded-pokemon": {
		id: "graded-pokemon",
		address: env.NEXT_PUBLIC_GACHA_CONTRACT_ADDRESS,
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

🧪 **Testnet Environment Active**
This is a testing environment using testnet contracts and test tokens. No real value transactions occur here.`,
		theme: "from-blue-500 to-yellow-500",
		treasuryAddress: env.NEXT_PUBLIC_TREASURY_CONTRACT_ADDRESS,
		isActive: true,
		createdAt: "2024-01-01",
	},
};