import { createGachaConfig } from "./factory";
import type { GachaConfig } from "./types";

/**
 * TESTNET CONFIGURATION — Polygon Amoy
 *
 * All contract addresses are read from NEXT_PUBLIC_* environment variables.
 * The `emptyFallback: true` option lets the app start even when an env var is
 * missing; missing addresses resolve to an empty string and are caught by
 * `validateTestnetConfig` / the warning loop in gacha-config.ts.
 *
 * Required environment variables (set in root .env, prefixed automatically):
 *
 *   NEXT_PUBLIC_GACHA_ADDRESS                   — Gacha.sol (main game logic)
 *   NEXT_PUBLIC_GACHA_TREASURY_ADDRESS          — GachaTreasury.sol (NFT storage)
 *   NEXT_PUBLIC_NFT_APPRAISAL_ADDRESS           — NFTAppraisal.sol (price oracle)
 *   NEXT_PUBLIC_ECONOMY_MANAGER_ADDRESS         — GachaEconomyManager.sol (fees/yield)
 *   NEXT_PUBLIC_GACHA_SERVICE_HANDLER_ADDRESS   — WAVS service handler for gacha
 *   NEXT_PUBLIC_APPRAISAL_SERVICE_HANDLER_ADDRESS — WAVS service handler for appraisal
 *   NEXT_PUBLIC_DEPOSITOR_VAULT_ADDRESS         — Depositor vault (yield source)
 *   NEXT_PUBLIC_BUYBACK_VAULT_ADDRESS           — Buyback vault (token buybacks)
 *   NEXT_PUBLIC_PROTOCOL_TREASURY_ADDRESS       — Protocol fee recipient
 *   NEXT_PUBLIC_COMMON_TRACKER_ADDRESS          — Common rarity spin-counter tracker
 *   NEXT_PUBLIC_UNCOMMON_TRACKER_ADDRESS        — Uncommon rarity spin-counter tracker
 *   NEXT_PUBLIC_RARE_TRACKER_ADDRESS            — Rare rarity spin-counter tracker
 *   NEXT_PUBLIC_EPIC_TRACKER_ADDRESS            — Epic rarity spin-counter tracker
 *   NEXT_PUBLIC_LEGENDARY_TRACKER_ADDRESS       — Legendary rarity spin-counter tracker
 */
export const TESTNET_GACHA_CONFIGS = createGachaConfig({
	title: "Graded Pokemon Cards (Testnet)",
	description:
		"Collect professionally graded Pokemon trading cards on Polygon Amoy testnet. Test the full gacha experience with free test tokens before the mainnet launch.",
	longDescription: `Welcome to Graded Pokemon Cards on Polygon Amoy Testnet — a full-featured preview of the production gacha system running on the Amoy test network.

Each Pokemon card belongs to one of five rarity tiers mirroring the mainnet distribution:
- **Common** (70%) - Great starter cards for building your collection
- **Uncommon** (20%) - Solid cards with moderate rarity and value
- **Rare** (6%) - Sought-after cards with notable collectible appeal
- **Epic** (3%) - Premium cards that serious collectors treasure
- **Legendary** (1%) - The ultimate prize every Pokemon collector dreams of owning

**Testnet Environment Notes:**
- Uses Polygon Amoy testnet — obtain free MATIC from the Amoy faucet
- Contract addresses are deployed via the task runner: \`task contracts:deploy\`
- Randomness is provided by the WAVS-DRAND infrastructure running against the Amoy chain
- NFTs minted here have no real-world value and may be reset between deployments
- All on-chain behaviour is identical to mainnet — this is the canonical staging environment`,
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
	return addr === "" || addr === "0x0" || addr === "0x0000000000000000000000000000000000000000";
}

/**
 * Returns the list of address fields that still contain placeholder values for
 * the given config.  An empty array means the config is deployment-ready.
 */
export function getMissingTestnetAddresses(config: GachaConfig): string[] {
	const missing: string[] = [];

	if (isPlaceholder(config.address)) missing.push("NEXT_PUBLIC_GACHA_ADDRESS");
	if (isPlaceholder(config.treasuryAddress)) missing.push("NEXT_PUBLIC_GACHA_TREASURY_ADDRESS");
	if (isPlaceholder(config.appraisalAddress)) missing.push("NEXT_PUBLIC_NFT_APPRAISAL_ADDRESS");
	if (isPlaceholder(config.economyManagerAddress)) missing.push("NEXT_PUBLIC_ECONOMY_MANAGER_ADDRESS");
	if (isPlaceholder(config.gachaServiceHandlerAddress)) missing.push("NEXT_PUBLIC_GACHA_SERVICE_HANDLER_ADDRESS");
	if (isPlaceholder(config.appraisalServiceHandlerAddress)) missing.push("NEXT_PUBLIC_APPRAISAL_SERVICE_HANDLER_ADDRESS");
	if (isPlaceholder(config.depositorVaultAddress)) missing.push("NEXT_PUBLIC_DEPOSITOR_VAULT_ADDRESS");
	if (isPlaceholder(config.buybackVaultAddress)) missing.push("NEXT_PUBLIC_BUYBACK_VAULT_ADDRESS");
	if (isPlaceholder(config.protocolTreasuryAddress)) missing.push("NEXT_PUBLIC_PROTOCOL_TREASURY_ADDRESS");
	if (isPlaceholder(config.trackerAddresses.common)) missing.push("NEXT_PUBLIC_COMMON_TRACKER_ADDRESS");
	if (isPlaceholder(config.trackerAddresses.uncommon)) missing.push("NEXT_PUBLIC_UNCOMMON_TRACKER_ADDRESS");
	if (isPlaceholder(config.trackerAddresses.rare)) missing.push("NEXT_PUBLIC_RARE_TRACKER_ADDRESS");
	if (isPlaceholder(config.trackerAddresses.epic)) missing.push("NEXT_PUBLIC_EPIC_TRACKER_ADDRESS");
	if (isPlaceholder(config.trackerAddresses.legendary)) missing.push("NEXT_PUBLIC_LEGENDARY_TRACKER_ADDRESS");

	return missing;
}

/**
 * Validates all testnet configs and logs a warning for each config that still
 * has un-populated contract addresses.  Call this at startup to surface
 * misconfiguration early.
 *
 * Returns `true` when every config is fully populated (deployment-ready).
 */
export function validateTestnetConfig(
	configs: Record<string, GachaConfig>,
): boolean {
	let allValid = true;

	for (const [id, config] of Object.entries(configs)) {
		const missing = getMissingTestnetAddresses(config);
		if (missing.length > 0) {
			allValid = false;
			console.warn(
				`[gacha-config/testnet] Gacha "${id}" is missing ${missing.length} address(es).\n` +
				`  Set the following env vars before deploying to testnet:\n` +
				missing.map((v) => `    ${v}`).join("\n"),
			);
		}
	}

	return allValid;
}
