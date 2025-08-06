import { z } from "zod";

// Helper to transform string to address type
const addressSchema = z
	.string()
	.transform((val): `0x${string}` => val as `0x${string}`);

// Environment variable schema with proper typing - all required
const envSchema = z.object({
	// Contract addresses - properly typed as `0x${string}`
	NEXT_PUBLIC_GACHA_SERVICE_HANDLER_ADDRESS: addressSchema,
	NEXT_PUBLIC_GACHA_CONTRACT_ADDRESS: addressSchema,
	NEXT_PUBLIC_TREASURY_CONTRACT_ADDRESS: addressSchema,
	NEXT_PUBLIC_REWARDS_MANAGER_ADDRESS: addressSchema,

	// WAVS chain configuration
	NEXT_PUBLIC_WAVS_CHAIN_RPC_URL: z.string(),

	// Wallet configuration - optional for development
	NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: z.string().optional(),

	// Development flags - optional with defaults
	NEXT_PUBLIC_ENABLE_TESTNETS: z
		.string()
		.transform((val) => val === "true")
		.optional(),
});

// Export typed environment variables
export const env = envSchema.parse({
	NEXT_PUBLIC_GACHA_SERVICE_HANDLER_ADDRESS:
		process.env.NEXT_PUBLIC_GACHA_SERVICE_HANDLER_ADDRESS,
	NEXT_PUBLIC_GACHA_CONTRACT_ADDRESS:
		process.env.NEXT_PUBLIC_GACHA_CONTRACT_ADDRESS,
	NEXT_PUBLIC_TREASURY_CONTRACT_ADDRESS:
		process.env.NEXT_PUBLIC_TREASURY_CONTRACT_ADDRESS,
	NEXT_PUBLIC_REWARDS_MANAGER_ADDRESS:
		process.env.NEXT_PUBLIC_REWARDS_MANAGER_ADDRESS,
	NEXT_PUBLIC_WAVS_CHAIN_RPC_URL: process.env.NEXT_PUBLIC_WAVS_CHAIN_RPC_URL,
	NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID:
		process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
	NEXT_PUBLIC_ENABLE_TESTNETS: process.env.NEXT_PUBLIC_ENABLE_TESTNETS,
});
