import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { localhost } from "wagmi/chains";

const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 17000);
const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || "http://localhost:8548";

// Extend localhost chain with custom RPC
const localChain = {
	...localhost,
	id: chainId,
	name: `Local ${chainId}`,
	rpcUrls: {
		default: { http: [rpcUrl] },
		public: { http: [rpcUrl] },
	},
};

export const config = getDefaultConfig({
	appName: "Spin-Fi",
	projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "placeholder",
	chains: [localChain],
	ssr: false,
});
