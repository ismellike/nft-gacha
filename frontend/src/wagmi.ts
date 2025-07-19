import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
	arbitrum,
	base,
	mainnet,
	optimism,
	polygon,
	sepolia,
} from "wagmi/chains";

// Create config once as a singleton to prevent multiple WalletConnect initializations
let _config: ReturnType<typeof getDefaultConfig> | undefined;

export const config = (() => {
	if (_config) return _config;

	_config = getDefaultConfig({
		appName: "Spin-Fi",
		projectId: "YOUR_PROJECT_ID",
		chains: [
			mainnet,
			polygon,
			optimism,
			arbitrum,
			base,
			...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === "true" ? [sepolia] : []),
		],
		ssr: true,
		walletConnectOptions: {
			projectId: "YOUR_PROJECT_ID",
		},
	});

	return _config;
})();
