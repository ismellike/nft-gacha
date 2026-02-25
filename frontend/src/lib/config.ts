import { env } from "./env";

// Environment modes used throughout the app
type EnvMode = "LOCAL" | "TESTNET" | "MAINNET";

const getEnvMode = (): EnvMode => {
	// env.NEXT_PUBLIC_ENV_MODE is already validated as "LOCAL" | "TESTNET" | "MAINNET"
	// with a default of "LOCAL", so we can use it directly.
	const validated = env.NEXT_PUBLIC_ENV_MODE;

	// Still honour NODE_ENV as a secondary signal when NEXT_PUBLIC_ENV_MODE
	// was not explicitly set (i.e. it resolved to the "LOCAL" default).
	if (validated !== "LOCAL") return validated;

	const nodeEnv = process.env.NODE_ENV;
	if (nodeEnv === "test") return "TESTNET";
	if (nodeEnv === "production") return "MAINNET";

	return "LOCAL";
};

export const ENV_MODE: EnvMode = getEnvMode();
