import { createGachaConfig } from "./factory";

export const LOCAL_GACHA_CONFIGS = createGachaConfig({
	title: "Graded Pokemon Cards",
	description:
		"Collect professionally graded Pokemon trading cards from five distinct rarity tiers. Each spin unlocks authentic cards with verified grades and pristine condition ratings.",
	longDescription: `Welcome to Graded Pokemon Cards - our flagship gacha experience featuring professionally graded Pokemon trading cards with verified authenticity and condition ratings.

Each Pokemon card belongs to one of five carefully balanced rarity tiers:
- **Common** (70%) - Great starter cards for building your collection
- **Uncommon** (20%) - Solid cards with moderate rarity and value
- **Rare** (6%) - Sought-after cards with notable collectible appeal
- **Epic** (3%) - Premium cards that serious collectors treasure
- **Legendary** (1%) - The ultimate prize every Pokemon collector dreams of owning

**Key Features:**
- Transparent on-chain rarity system ensures fair distribution
- All cards feature verified PSA/BGS grading standards
- Instant NFT ownership with authentic provenance tracking
- Community-driven marketplace for trading and collecting

**Development Environment Active**
This is a test environment using local contracts and test tokens for development purposes.`,
});
