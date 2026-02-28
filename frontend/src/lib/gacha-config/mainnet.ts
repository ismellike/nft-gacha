import { logger } from "../logger";
import { createGachaConfig } from "./factory";
import type { GachaConfig } from "./types";

/**
 * MAINNET CONFIGURATION — Polygon PoS
 *
 * PRODUCTION DEPLOYMENT REQUIREMENTS
 * ===================================
 * All contract addresses MUST be set to real, audited deployment addresses
 * before going live.  The `emptyFallback: true` option keeps the build from
 * crashing during CI, but missing addresses will be flagged by
 * `validateMainnetConfig` and the warning loop in gacha-config.ts.
 *
 * Deployment checklist (complete before setting ENV_MODE=MAINNET):
 *   [ ] Smart contracts audited and deployed to Polygon mainnet
 *   [ ] All NEXT_PUBLIC_* env vars set to mainnet contract addresses
 *   [ ] WAVS operator running and connected to Polygon mainnet RPC
 *   [ ] DRAND randomness endpoint reachable from WAVS operator
 *   [ ] validateMainnetConfig() returns true with zero warnings
 *   [ ] End-to-end spin flow tested on mainnet with a small amount
 *
 * Required environment variables (set in root .env, prefixed automatically):
 *
 *   NEXT_PUBLIC_GACHA_ADDRESS                   — Gacha.sol (main game logic)
 *   NEXT_PUBLIC_GACHA_TREASURY_ADDRESS          — GachaTreasury.sol (NFT storage)
 *   NEXT_PUBLIC_NFT_APPRAISAL_ADDRESS           — NFTAppraisal.sol (price oracle)
 *   NEXT_PUBLIC_ECONOMY_MANAGER_ADDRESS         — GachaEconomyManager.sol (fees/yield)
 *   NEXT_PUBLIC_GACHA_SERVICE_HANDLER_ADDRESS   — WAVS service handler for gacha
 *   NEXT_PUBLIC_APPRAISAL_SERVICE_HANDLER_ADDRESS — WAVS service handler for appraisal
 *   NEXT_PUBLIC_CARD_GROUPED_VAULT_ADDRESS       — Card-grouped vault (yield source)
 *   NEXT_PUBLIC_BUYBACK_VAULT_ADDRESS           — Buyback vault (token buybacks)
 *   NEXT_PUBLIC_PROTOCOL_TREASURY_ADDRESS       — Protocol fee recipient
 *   NEXT_PUBLIC_COMMON_TRACKER_ADDRESS          — Common rarity spin-counter tracker
 *   NEXT_PUBLIC_UNCOMMON_TRACKER_ADDRESS        — Uncommon rarity spin-counter tracker
 *   NEXT_PUBLIC_RARE_TRACKER_ADDRESS            — Rare rarity spin-counter tracker
 *   NEXT_PUBLIC_EPIC_TRACKER_ADDRESS            — Epic rarity spin-counter tracker
 *   NEXT_PUBLIC_LEGENDARY_TRACKER_ADDRESS       — Legendary rarity spin-counter tracker
 */
export const MAINNET_GACHA_CONFIGS = createGachaConfig({
	title: "Graded Pokemon Cards",
	description:
		"Collect professionally graded Pokemon trading cards with provably fair on-chain distribution powered by WAVS-DRAND randomness on Polygon.",
	longDescription: `Welcome to Graded Pokemon Cards — the premier on-chain gacha experience for Pokemon card collectors.

Every spin is powered by WAVS-DRAND cryptographic randomness: a decentralised, verifiable random function that makes each outcome provably fair and manipulation-resistant.  All cards are stored as NFTs on Polygon with full on-chain provenance.

Rarity tiers with transparent on-chain weights:
- **Common** (70%) - Great starter cards for building your collection
- **Uncommon** (20%) - Solid cards with moderate rarity and value
- **Rare** (6%) - Sought-after cards with notable collectible appeal
- **Epic** (3%) - Premium cards that serious collectors treasure
- **Legendary** (1%) - The ultimate prize every Pokemon collector dreams of owning

**Key Features:**
- Provably fair randomness via WAVS-DRAND — every spin is verifiable on-chain
- Transparent rarity weights published in the Gacha contract
- Instant NFT ownership with full on-chain provenance and authentic grading metadata
- Economy system: spin fees fund buybacks and protocol treasury sustainably
- Automatic refund if a rarity pool is exhausted — no spin is ever wasted`,
	emptyFallback: true,
});

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

/**
 * A contract address is considered a placeholder (not yet configured) when it
 * is an empty string (the `emptyFallback` sentinel from factory.ts) or the
 * zero address.
 */
function isPlaceholder(addr: string): boolean {
	return (
		addr === "" ||
		addr === "0x0" ||
		addr === "0x0000000000000000000000000000000000000000"
	);
}

/**
 * Returns the list of address fields that still contain placeholder values for
 * the given config.  An empty array means the config is deployment-ready.
 */
export function getMissingMainnetAddresses(config: GachaConfig): string[] {
	const missing: string[] = [];

	if (isPlaceholder(config.address)) missing.push("NEXT_PUBLIC_GACHA_ADDRESS");
	if (isPlaceholder(config.treasuryAddress))
		missing.push("NEXT_PUBLIC_GACHA_TREASURY_ADDRESS");
	if (isPlaceholder(config.appraisalAddress))
		missing.push("NEXT_PUBLIC_NFT_APPRAISAL_ADDRESS");
	if (isPlaceholder(config.economyManagerAddress))
		missing.push("NEXT_PUBLIC_ECONOMY_MANAGER_ADDRESS");
	if (isPlaceholder(config.gachaServiceHandlerAddress))
		missing.push("NEXT_PUBLIC_GACHA_SERVICE_HANDLER_ADDRESS");
	if (isPlaceholder(config.appraisalServiceHandlerAddress))
		missing.push("NEXT_PUBLIC_APPRAISAL_SERVICE_HANDLER_ADDRESS");
	if (isPlaceholder(config.cardGroupedVaultAddress))
		missing.push("NEXT_PUBLIC_CARD_GROUPED_VAULT_ADDRESS");
	if (isPlaceholder(config.buybackVaultAddress))
		missing.push("NEXT_PUBLIC_BUYBACK_VAULT_ADDRESS");
	if (isPlaceholder(config.protocolTreasuryAddress))
		missing.push("NEXT_PUBLIC_PROTOCOL_TREASURY_ADDRESS");
	const trackerEnvNames = [
		"NEXT_PUBLIC_COMMON_TRACKER_ADDRESS",
		"NEXT_PUBLIC_UNCOMMON_TRACKER_ADDRESS",
		"NEXT_PUBLIC_RARE_TRACKER_ADDRESS",
		"NEXT_PUBLIC_EPIC_TRACKER_ADDRESS",
		"NEXT_PUBLIC_LEGENDARY_TRACKER_ADDRESS",
	];
	for (let i = 0; i < config.trackerAddresses.length; i++) {
		if (isPlaceholder(config.trackerAddresses[i]) && trackerEnvNames[i]) {
			missing.push(trackerEnvNames[i]);
		}
	}

	return missing;
}

/**
 * Validates all mainnet configs and logs a warning for each config that still
 * has un-populated contract addresses.  In a MAINNET build this is treated as
 * an error — the app should not be deployed with placeholder addresses.
 *
 * Returns `true` when every config is fully populated (deployment-ready).
 */
export function validateMainnetConfig(
	configs: Record<string, GachaConfig>,
): boolean {
	let allValid = true;

	for (const [id, config] of Object.entries(configs)) {
		const missing = getMissingMainnetAddresses(config);
		if (missing.length > 0) {
			allValid = false;
			// Use logger.contracts.error on mainnet — this is a blocking deployment issue.
			logger.contracts.error(
				`[gacha-config/mainnet] DEPLOYMENT BLOCKED: Gacha "${id}" is missing ${missing.length} mainnet address(es).\n` +
					"  The following env vars must be set to real mainnet contract addresses:\n" +
					missing.map((v) => `    ${v}`).join("\n"),
			);
		}
	}

	return allValid;
}
