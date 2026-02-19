import { createGachaConfig } from "./factory";

export const TESTNET_GACHA_CONFIGS = createGachaConfig({
	title: "Graded Pokemon Cards (Testnet)",
	description:
		"Collect professionally graded Pokemon trading cards on Polygon Amoy testnet.",
	longDescription:
		"Polygon Amoy testnet deployment of the Graded Pokemon Cards gacha system.",
	emptyFallback: true,
});
