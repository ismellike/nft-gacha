import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import type { Chain } from "viem";
import { localhost, mainnet, polygonAmoy } from "wagmi/chains";
import { ENV_MODE } from "./lib/config";

const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;

function getChain(): Chain {
	switch (ENV_MODE) {
		case "TESTNET": {
			if (!rpcUrl) return polygonAmoy;
			return {
				...polygonAmoy,
				rpcUrls: {
					default: { http: [rpcUrl] },
				},
			};
		}
		case "MAINNET": {
			if (!rpcUrl) return mainnet;
			return {
				...mainnet,
				rpcUrls: {
					default: { http: [rpcUrl] },
				},
			};
		}
		default: {
			// LOCAL
			const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 17000);
			const localRpc = rpcUrl || "http://localhost:8548";
			return {
				...localhost,
				id: chainId,
				name: `Local ${chainId}`,
				rpcUrls: {
					default: { http: [localRpc] },
				},
			};
		}
	}
}

export const config = getDefaultConfig({
	appName: "Spin-Fi",
	projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "placeholder",
	chains: [getChain()],
	ssr: false,
});
