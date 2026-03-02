/**
 * Zod-based environment variable validation for the NFT Gacha frontend.
 *
 * All NEXT_PUBLIC_* variables are validated at module-init time so that
 * missing / malformed config surfaces as a clear error rather than a
 * silent undefined deep inside the app.
 *
 * NOTE: Next.js only inlines NEXT_PUBLIC_* via *literal* `process.env.FOO`
 * expressions at build time.  Dynamic access like `process.env[key]` works
 * only in Node (server) contexts.  We therefore enumerate every variable with
 * its own literal here and pass the resulting object to Zod.
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Validates a string as a 0x-prefixed Ethereum address.
 * Accepts both checksummed and lowercase forms; the app is responsible for
 * checksum normalisation where needed.
 */
const hexAddress = z
	.string()
	.regex(/^0x[0-9a-fA-F]{40}$/, "Must be a valid 0x-prefixed Ethereum address");

/**
 * Coerces "true"/"false" strings (or undefined) to a boolean,
 * defaulting to false when the variable is absent.
 */
const boolFlag = z
	.enum(["true", "false"])
	.optional()
	.transform((v) => v === "true");

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const envSchema = z.object({
	// ------------------------------------------------------------------
	// Network
	// ------------------------------------------------------------------

	/** Deployment mode: LOCAL | TESTNET | MAINNET */
	NEXT_PUBLIC_ENV_MODE: z
		.enum(["LOCAL", "TESTNET", "MAINNET"])
		.optional()
		.default("LOCAL"),

	/** Numeric chain ID (e.g. 31337 for local Anvil). */
	NEXT_PUBLIC_CHAIN_ID: z.coerce
		.number()
		.int()
		.positive()
		.optional()
		.default(31337),

	/** HTTP RPC endpoint for the selected network. */
	NEXT_PUBLIC_RPC_URL: z.string().url().optional(),

	// ------------------------------------------------------------------
	// WalletConnect
	// ------------------------------------------------------------------

	/** WalletConnect project ID – falls back to "placeholder" so the app
	 *  can boot without a real key during local development. */
	NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: z
		.string()
		.optional()
		.default("placeholder"),

	// ------------------------------------------------------------------
	// Core contract addresses
	// ------------------------------------------------------------------

	NEXT_PUBLIC_GACHA_ADDRESS: hexAddress.optional(),
	NEXT_PUBLIC_GACHA_TREASURY_ADDRESS: hexAddress.optional(),
	NEXT_PUBLIC_NFT_APPRAISAL_ADDRESS: hexAddress.optional(),
	NEXT_PUBLIC_ECONOMY_MANAGER_ADDRESS: hexAddress.optional(),
	NEXT_PUBLIC_GACHA_SERVICE_HANDLER_ADDRESS: hexAddress.optional(),
	NEXT_PUBLIC_APPRAISAL_SERVICE_HANDLER_ADDRESS: hexAddress.optional(),
	NEXT_PUBLIC_CARD_GROUPED_VAULT_ADDRESS: hexAddress.optional(),
	NEXT_PUBLIC_BUYBACK_VAULT_ADDRESS: hexAddress.optional(),
	NEXT_PUBLIC_PROTOCOL_TREASURY_ADDRESS: hexAddress.optional(),

	// ------------------------------------------------------------------
	// Rarity tracker contracts
	// ------------------------------------------------------------------

	NEXT_PUBLIC_COMMON_TRACKER_ADDRESS: hexAddress.optional(),
	NEXT_PUBLIC_UNCOMMON_TRACKER_ADDRESS: hexAddress.optional(),
	NEXT_PUBLIC_RARE_TRACKER_ADDRESS: hexAddress.optional(),
	NEXT_PUBLIC_EPIC_TRACKER_ADDRESS: hexAddress.optional(),
	NEXT_PUBLIC_LEGENDARY_TRACKER_ADDRESS: hexAddress.optional(),

	// ------------------------------------------------------------------
	// Token / collection contracts
	// ------------------------------------------------------------------

	NEXT_PUBLIC_USDC_ADDRESS: hexAddress.optional(),

	// ------------------------------------------------------------------
	// Admin / rewards (optional – only needed in admin UIs)
	// ------------------------------------------------------------------

	NEXT_PUBLIC_REWARDS_MANAGER_ADDRESS: hexAddress.optional(),

	// ------------------------------------------------------------------
	// Debug flags (all default to false)
	// ------------------------------------------------------------------

	NEXT_PUBLIC_DEBUG_GENERAL: boolFlag,
	NEXT_PUBLIC_DEBUG_GACHA_SPIN: boolFlag,
	NEXT_PUBLIC_DEBUG_NFT_METADATA: boolFlag,
	NEXT_PUBLIC_DEBUG_CONTRACTS: boolFlag,
	NEXT_PUBLIC_DEBUG_STATE: boolFlag,
	NEXT_PUBLIC_DEBUG_NETWORK: boolFlag,
	NEXT_PUBLIC_DEBUG_ALL: boolFlag,
});

// ---------------------------------------------------------------------------
// Parse – fail loudly at startup if config is invalid
// ---------------------------------------------------------------------------

/**
 * Raw object built from literal `process.env.NEXT_PUBLIC_*` reads so that
 * Next.js can statically inline the values into the client bundle.
 */
const rawEnv = {
	// Network
	NEXT_PUBLIC_ENV_MODE: process.env.NEXT_PUBLIC_ENV_MODE,
	NEXT_PUBLIC_CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID,
	NEXT_PUBLIC_RPC_URL: process.env.NEXT_PUBLIC_RPC_URL,

	// WalletConnect
	NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID:
		process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,

	// Core contracts
	NEXT_PUBLIC_GACHA_ADDRESS: process.env.NEXT_PUBLIC_GACHA_ADDRESS,
	NEXT_PUBLIC_GACHA_TREASURY_ADDRESS:
		process.env.NEXT_PUBLIC_GACHA_TREASURY_ADDRESS,
	NEXT_PUBLIC_NFT_APPRAISAL_ADDRESS:
		process.env.NEXT_PUBLIC_NFT_APPRAISAL_ADDRESS,
	NEXT_PUBLIC_ECONOMY_MANAGER_ADDRESS:
		process.env.NEXT_PUBLIC_ECONOMY_MANAGER_ADDRESS,
	NEXT_PUBLIC_GACHA_SERVICE_HANDLER_ADDRESS:
		process.env.NEXT_PUBLIC_GACHA_SERVICE_HANDLER_ADDRESS,
	NEXT_PUBLIC_APPRAISAL_SERVICE_HANDLER_ADDRESS:
		process.env.NEXT_PUBLIC_APPRAISAL_SERVICE_HANDLER_ADDRESS,
	NEXT_PUBLIC_CARD_GROUPED_VAULT_ADDRESS:
		process.env.NEXT_PUBLIC_CARD_GROUPED_VAULT_ADDRESS,
	NEXT_PUBLIC_BUYBACK_VAULT_ADDRESS:
		process.env.NEXT_PUBLIC_BUYBACK_VAULT_ADDRESS,
	NEXT_PUBLIC_PROTOCOL_TREASURY_ADDRESS:
		process.env.NEXT_PUBLIC_PROTOCOL_TREASURY_ADDRESS,

	// Rarity trackers
	NEXT_PUBLIC_COMMON_TRACKER_ADDRESS:
		process.env.NEXT_PUBLIC_COMMON_TRACKER_ADDRESS,
	NEXT_PUBLIC_UNCOMMON_TRACKER_ADDRESS:
		process.env.NEXT_PUBLIC_UNCOMMON_TRACKER_ADDRESS,
	NEXT_PUBLIC_RARE_TRACKER_ADDRESS:
		process.env.NEXT_PUBLIC_RARE_TRACKER_ADDRESS,
	NEXT_PUBLIC_EPIC_TRACKER_ADDRESS:
		process.env.NEXT_PUBLIC_EPIC_TRACKER_ADDRESS,
	NEXT_PUBLIC_LEGENDARY_TRACKER_ADDRESS:
		process.env.NEXT_PUBLIC_LEGENDARY_TRACKER_ADDRESS,

	// Token contracts
	NEXT_PUBLIC_USDC_ADDRESS: process.env.NEXT_PUBLIC_USDC_ADDRESS,

	// Admin
	NEXT_PUBLIC_REWARDS_MANAGER_ADDRESS:
		process.env.NEXT_PUBLIC_REWARDS_MANAGER_ADDRESS,

	// Debug flags
	NEXT_PUBLIC_DEBUG_GENERAL: process.env.NEXT_PUBLIC_DEBUG_GENERAL,
	NEXT_PUBLIC_DEBUG_GACHA_SPIN: process.env.NEXT_PUBLIC_DEBUG_GACHA_SPIN,
	NEXT_PUBLIC_DEBUG_NFT_METADATA: process.env.NEXT_PUBLIC_DEBUG_NFT_METADATA,
	NEXT_PUBLIC_DEBUG_CONTRACTS: process.env.NEXT_PUBLIC_DEBUG_CONTRACTS,
	NEXT_PUBLIC_DEBUG_STATE: process.env.NEXT_PUBLIC_DEBUG_STATE,
	NEXT_PUBLIC_DEBUG_NETWORK: process.env.NEXT_PUBLIC_DEBUG_NETWORK,
	NEXT_PUBLIC_DEBUG_ALL: process.env.NEXT_PUBLIC_DEBUG_ALL,
};

const parsed = envSchema.safeParse(rawEnv);

if (!parsed.success) {
	const issues = parsed.error.issues
		.map((issue) => `  ${issue.path.join(".")}: ${issue.message}`)
		.join("\n");
	throw new Error(`Invalid environment configuration:\n${issues}`);
}

/**
 * Validated, typed environment variables.
 *
 * Import this instead of reading `process.env` directly in application code.
 *
 * @example
 * import { env } from "@/lib/env";
 *
 * const chainId = env.NEXT_PUBLIC_CHAIN_ID;          // number
 * const gacha   = env.NEXT_PUBLIC_GACHA_ADDRESS;     // `0x${string}` | undefined
 * const debug   = env.NEXT_PUBLIC_DEBUG_ALL;         // boolean
 */
export const env = parsed.data;
