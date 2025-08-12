import { z } from "zod";

// Address validation is now handled in gacha config system

// Environment modes
export type EnvMode = "LOCAL" | "TESTNET" | "MAINNET";

// Detect current environment mode
export const getEnvMode = (): EnvMode => {
	const nodeEnv = process.env.NODE_ENV;
	const envMode = process.env.NEXT_PUBLIC_ENV_MODE;

	// Explicit env mode takes precedence
	if (
		envMode &&
		["LOCAL", "TESTNET", "MAINNET"].includes(envMode.toUpperCase())
	) {
		return envMode.toUpperCase() as EnvMode;
	}

	// Fallback to NODE_ENV detection
	if (nodeEnv === "development") return "LOCAL";
	if (nodeEnv === "test") return "TESTNET";
	if (nodeEnv === "production") return "MAINNET";

	// Default fallback
	return "LOCAL";
};

export const ENV_MODE = getEnvMode();

// Minimal environment variables schema - only what we need from env
const envSchema = z.object({
	// Chain configuration
	NEXT_PUBLIC_WAVS_CHAIN_RPC_URL: z.string().optional(),

	// Wallet configuration - optional for development
	NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: z.string().optional(),

	// Development flags - optional with defaults
	NEXT_PUBLIC_ENABLE_TESTNETS: z
		.string()
		.transform((val) => val === "true")
		.optional(),
});

// Parse environment variables
const parsedEnv = envSchema.parse({
	NEXT_PUBLIC_WAVS_CHAIN_RPC_URL: process.env.NEXT_PUBLIC_WAVS_CHAIN_RPC_URL,
	NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID:
		process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
	NEXT_PUBLIC_ENABLE_TESTNETS: process.env.NEXT_PUBLIC_ENABLE_TESTNETS,
});

// Export unified configuration based on environment
export const config = {
	// Chain config
	WAVS_CHAIN_RPC_URL: parsedEnv.NEXT_PUBLIC_WAVS_CHAIN_RPC_URL,

	// Other config
	WALLETCONNECT_PROJECT_ID: parsedEnv.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
	ENABLE_TESTNETS: parsedEnv.NEXT_PUBLIC_ENABLE_TESTNETS,

	// Environment info
	ENV_MODE,
} as const;

// Type-safe access to configuration
export type Config = typeof config;

// Contract addresses are now managed through gacha config system
// No validation needed here since addresses come from deploy script output
