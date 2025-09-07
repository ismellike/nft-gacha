import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { localhost } from "wagmi/chains";

// WAVS local chain configuration
const wavsLocal = {
	...localhost,
	id: 17000,
	name: "WAVS Local",
	rpcUrls: {
		default: { http: ["http://localhost:8548"] },
		public: { http: ["http://localhost:8548"] },
	},
	contracts: {
		...localhost.contracts,
		multicall3: {
			address: "0xcA11bde05977b3631167028862bE2a173976CA11",
			blockCreated: 0,
		},
	},
} as const;

export const config = getDefaultConfig({
	appName: "Spin-Fi",
	projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "placeholder",
	chains: [wavsLocal],
	ssr: false, // This is a SPA, no SSR
});
