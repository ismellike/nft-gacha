import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
	arbitrum,
	base,
	mainnet,
	optimism,
	polygon,
	sepolia,
	localhost,
} from "wagmi/chains";

// WAVS local chain configuration
const wavsLocal = {
	...localhost,
	id: 31337,
	name: 'WAVS Local',
	rpcUrls: {
		default: { http: ['http://localhost:8548'] },
		public: { http: ['http://localhost:8548'] },
	},
} as const;

// Create config once as a singleton to prevent multiple WalletConnect initializations
let _config: ReturnType<typeof getDefaultConfig> | undefined;

export const config = (() => {
	if (_config) return _config;

	_config = getDefaultConfig({
		appName: "Spin-Fi",
		projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "test",
		chains: [
			wavsLocal,
			mainnet,
			polygon,
			optimism,
			arbitrum,
			base,
			...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === "true" ? [sepolia] : []),
		],
		ssr: true,
	});

	return _config;
})();
