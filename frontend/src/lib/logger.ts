import { env } from "./env";

type LogLevel = "log" | "info" | "warn" | "error" | "debug";

const DEBUG_FLAGS = {
	GENERAL: env.NEXT_PUBLIC_DEBUG_GENERAL,
	GACHA_SPIN: env.NEXT_PUBLIC_DEBUG_GACHA_SPIN,
	NFT_METADATA: env.NEXT_PUBLIC_DEBUG_NFT_METADATA,
	CONTRACTS: env.NEXT_PUBLIC_DEBUG_CONTRACTS,
	STATE: env.NEXT_PUBLIC_DEBUG_STATE,
	NETWORK: env.NEXT_PUBLIC_DEBUG_NETWORK,
	ALL: env.NEXT_PUBLIC_DEBUG_ALL,
} as const;

type DebugCategory = keyof typeof DEBUG_FLAGS;

// In production, all debug flags are false
const isProd = process.env.NODE_ENV === "production";

/**
 * Creates a logger function for a specific debug category
 * @param category - The debug category to check
 * @param level - The log level (defaults to 'log')
 * @returns A function that logs when debug is enabled for that category
 */
function createLogger(category: DebugCategory, level: LogLevel = "log") {
	// In production, return a no-op function for all logs except errors
	if (isProd) {
		return level === "error"
			? (...args: unknown[]) => console.error(...args)
			: () => {};
	}

	// In development, check if debug is enabled for this category
	const isEnabled = DEBUG_FLAGS[category] || DEBUG_FLAGS.ALL;

	if (!isEnabled) {
		return () => {};
	}

	// Return the appropriate console method based on log level
	return (...args: unknown[]) => {
		const timestamp = new Date().toISOString();
		const prefix = `[${category}]`;

		switch (level) {
			case "error":
				console.error(timestamp, prefix, ...args);
				break;
			case "warn":
				console.warn(timestamp, prefix, ...args);
				break;
			case "info":
				console.info(timestamp, prefix, ...args);
				break;
			case "debug":
				console.debug(timestamp, prefix, ...args);
				break;
			default:
				console.log(timestamp, prefix, ...args);
		}
	};
}

/**
 * Logger instances for different categories
 * Each category has log, info, warn, error, and debug methods
 */
export const logger = {
	general: {
		log: createLogger("GENERAL", "log"),
		info: createLogger("GENERAL", "info"),
		warn: createLogger("GENERAL", "warn"),
		error: createLogger("GENERAL", "error"),
		debug: createLogger("GENERAL", "debug"),
	},
	gachaSpin: {
		log: createLogger("GACHA_SPIN", "log"),
		info: createLogger("GACHA_SPIN", "info"),
		warn: createLogger("GACHA_SPIN", "warn"),
		error: createLogger("GACHA_SPIN", "error"),
		debug: createLogger("GACHA_SPIN", "debug"),
	},
	nftMetadata: {
		log: createLogger("NFT_METADATA", "log"),
		info: createLogger("NFT_METADATA", "info"),
		warn: createLogger("NFT_METADATA", "warn"),
		error: createLogger("NFT_METADATA", "error"),
		debug: createLogger("NFT_METADATA", "debug"),
	},
	contracts: {
		log: createLogger("CONTRACTS", "log"),
		info: createLogger("CONTRACTS", "info"),
		warn: createLogger("CONTRACTS", "warn"),
		error: createLogger("CONTRACTS", "error"),
		debug: createLogger("CONTRACTS", "debug"),
	},
	state: {
		log: createLogger("STATE", "log"),
		info: createLogger("STATE", "info"),
		warn: createLogger("STATE", "warn"),
		error: createLogger("STATE", "error"),
		debug: createLogger("STATE", "debug"),
	},
	network: {
		log: createLogger("NETWORK", "log"),
		info: createLogger("NETWORK", "info"),
		warn: createLogger("NETWORK", "warn"),
		error: createLogger("NETWORK", "error"),
		debug: createLogger("NETWORK", "debug"),
	},
};

// Export the DEBUG_FLAGS for external use
export { DEBUG_FLAGS };
export const createDebugLogger =
	(enabled: boolean) =>
	(...args: unknown[]) => {
		if (isProd) return; // Never log in production
		if (!enabled) return;
		console.log(...args);
	};
