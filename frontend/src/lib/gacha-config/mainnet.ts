import { createGachaConfig } from "./factory";

export const MAINNET_GACHA_CONFIGS = createGachaConfig({
	title: "Graded Pokemon Cards",
	description:
		"Collect professionally graded Pokemon trading cards with provably fair distribution on Polygon.",
	longDescription:
		"Polygon mainnet deployment of the Graded Pokemon Cards gacha system.",
	emptyFallback: true,
});
