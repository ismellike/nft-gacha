import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { localhost } from "wagmi/chains";

const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 17000);
const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || "http://localhost:8548";

// Local chain configuration driven by env so it matches the deployed contracts
const localChain = {
	...localhost,
	id: chainId,
	name: `Local ${chainId}`,
	rpcUrls: {
		default: { http: [rpcUrl] },
		public: { http: [rpcUrl] },
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
	chains: [localChain],
	ssr: false, // This is a SPA, no SSR
});
