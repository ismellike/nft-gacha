// Environment modes used throughout the app
type EnvMode = "LOCAL" | "TESTNET" | "MAINNET";

const getEnvMode = (): EnvMode => {
	const nodeEnv = process.env.NODE_ENV;
	const envMode = process.env.NEXT_PUBLIC_ENV_MODE;

	if (
		envMode &&
		["LOCAL", "TESTNET", "MAINNET"].includes(envMode.toUpperCase())
	) {
		return envMode.toUpperCase() as EnvMode;
	}

	if (nodeEnv === "development") return "LOCAL";
	if (nodeEnv === "test") return "TESTNET";
	if (nodeEnv === "production") return "MAINNET";

	return "LOCAL";
};

export const ENV_MODE: EnvMode = getEnvMode();
