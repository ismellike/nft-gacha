import { createGachaConfig } from "./factory";
import type { GachaConfig } from "./types";

/**
 * TESTNET CONFIGURATION
 *
 * Supports any EVM testnet (Holesky, Sepolia, Polygon Amoy, etc.).
 * The target chain is determined by NEXT_PUBLIC_CHAIN_ID and NEXT_PUBLIC_RPC_URL.
 *
 * All contract addresses are read from NEXT_PUBLIC_* environment variables.
 * The `emptyFallback: true` option lets the app start even when an env var is
 * missing; missing addresses resolve to an empty string and are caught by
 * `validateTestnetConfig` / the warning loop in gacha-config.ts.
 *
 * After deploying contracts with `DeployTestnet.s.sol`, copy the generated
 * `.env.testnet` into the root `.env.local` and run `task frontend:sync-env`
 * to populate these variables.
 *
 * Required environment variables (set in root .env.local, prefixed automatically):
 *
 *   NEXT_PUBLIC_CHAIN_ID                        — Target chain ID (e.g. 17000, 11155111, 80002)
 *   NEXT_PUBLIC_RPC_URL                         — RPC endpoint for the target chain
 *   NEXT_PUBLIC_GACHA_ADDRESS                   — Gacha.sol (main game logic)
 *   NEXT_PUBLIC_GACHA_TREASURY_ADDRESS          — GachaTreasury.sol (NFT storage)
 *   NEXT_PUBLIC_NFT_APPRAISAL_ADDRESS           — NFTAppraisal.sol (price oracle)
 *   NEXT_PUBLIC_ECONOMY_MANAGER_ADDRESS         — GachaEconomyManager.sol (fees/yield)
 *   NEXT_PUBLIC_GACHA_SERVICE_HANDLER_ADDRESS   — WAVS service handler for gacha
 *   NEXT_PUBLIC_APPRAISAL_SERVICE_HANDLER_ADDRESS — WAVS service handler for appraisal
 *   NEXT_PUBLIC_CARD_GROUPED_VAULT_ADDRESS       — Card-grouped vault (yield source)
 *   NEXT_PUBLIC_BUYBACK_VAULT_ADDRESS           — Buyback vault (token buybacks)
 *   NEXT_PUBLIC_PROTOCOL_TREASURY_ADDRESS       — Protocol fee recipient
 *   NEXT_PUBLIC_USDC_ADDRESS                    — USDC/stablecoin token address
 *   NEXT_PUBLIC_COMMON_TRACKER_ADDRESS          — Common rarity spin-counter tracker (optional)
 *   NEXT_PUBLIC_UNCOMMON_TRACKER_ADDRESS        — Uncommon rarity spin-counter tracker (optional)
 *   NEXT_PUBLIC_RARE_TRACKER_ADDRESS            — Rare rarity spin-counter tracker (optional)
 *   NEXT_PUBLIC_EPIC_TRACKER_ADDRESS            — Epic rarity spin-counter tracker (optional)
 *   NEXT_PUBLIC_LEGENDARY_TRACKER_ADDRESS       — Legendary rarity spin-counter tracker (optional)
 */
export const TESTNET_GACHA_CONFIGS = createGachaConfig({
	title: "Graded Pokemon Cards (Testnet)",
	description:
		"Collect professionally graded Pokemon trading cards on testnet. Test the full gacha experience with test tokens before the mainnet launch.",
	longDescription: `Welcome to Graded Pokemon Cards Testnet — a full-featured preview of the production gacha system running on a public test network.

Each Pokemon card belongs to one of five rarity tiers mirroring the mainnet distribution:
- **Common** (70%) - Great starter cards for building your collection
- **Uncommon** (20%) - Solid cards with moderate rarity and value
- **Rare** (6%) - Sought-after cards with notable collectible appeal
- **Epic** (3%) - Premium cards that serious collectors treasure
- **Legendary** (1%) - The ultimate prize every Pokemon collector dreams of owning

**Testnet Environment Notes:**
- Contract addresses are set via environment variables after deployment
- Deploy contracts with \`DeployTestnet.s.sol\`, then run \`task frontend:sync-env\`
- Randomness is provided by the WAVS-DRAND infrastructure
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

	// Required addresses — deployed by DeployTestnet.s.sol
	if (isPlaceholder(config.address)) missing.push("NEXT_PUBLIC_GACHA_ADDRESS");
	if (isPlaceholder(config.treasuryAddress)) missing.push("NEXT_PUBLIC_GACHA_TREASURY_ADDRESS");
	if (isPlaceholder(config.appraisalAddress)) missing.push("NEXT_PUBLIC_NFT_APPRAISAL_ADDRESS");
	if (isPlaceholder(config.economyManagerAddress)) missing.push("NEXT_PUBLIC_ECONOMY_MANAGER_ADDRESS");
	if (isPlaceholder(config.gachaServiceHandlerAddress)) missing.push("NEXT_PUBLIC_GACHA_SERVICE_HANDLER_ADDRESS");
	if (isPlaceholder(config.appraisalServiceHandlerAddress)) missing.push("NEXT_PUBLIC_APPRAISAL_SERVICE_HANDLER_ADDRESS");
	if (isPlaceholder(config.cardGroupedVaultAddress)) missing.push("NEXT_PUBLIC_CARD_GROUPED_VAULT_ADDRESS");
	if (isPlaceholder(config.protocolTreasuryAddress)) missing.push("NEXT_PUBLIC_PROTOCOL_TREASURY_ADDRESS");

	// Optional addresses — not deployed by DeployTestnet.s.sol yet
	// Buyback vault and tracker contracts are logged as warnings, not blockers
	return missing;
}

/**
 * Returns the list of optional address fields that are not yet configured.
 * These are non-critical for initial testnet operation.
 */
export function getOptionalMissingAddresses(config: GachaConfig): string[] {
	const optional: string[] = [];

	if (isPlaceholder(config.buybackVaultAddress)) optional.push("NEXT_PUBLIC_BUYBACK_VAULT_ADDRESS");

	const trackerEnvNames = [
		"NEXT_PUBLIC_COMMON_TRACKER_ADDRESS",
		"NEXT_PUBLIC_UNCOMMON_TRACKER_ADDRESS",
		"NEXT_PUBLIC_RARE_TRACKER_ADDRESS",
		"NEXT_PUBLIC_EPIC_TRACKER_ADDRESS",
		"NEXT_PUBLIC_LEGENDARY_TRACKER_ADDRESS",
	];
	for (let i = 0; i < config.trackerAddresses.length; i++) {
		if (isPlaceholder(config.trackerAddresses[i]) && trackerEnvNames[i]) {
			optional.push(trackerEnvNames[i]);
		}
	}

	return optional;
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
				`[gacha-config/testnet] Gacha "${id}" is missing ${missing.length} required address(es).\n` +
				"  Set the following env vars before deploying to testnet:\n" +
				missing.map((v) => `    ${v}`).join("\n"),
			);
		}

		const optional = getOptionalMissingAddresses(config);
		if (optional.length > 0) {
			console.info(
				`[gacha-config/testnet] Gacha "${id}" has ${optional.length} optional address(es) not configured.\n` +
				"  These features will be disabled until set:\n" +
				optional.map((v) => `    ${v}`).join("\n"),
			);
		}
	}

	return allValid;
}
