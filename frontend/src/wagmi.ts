import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import type { Chain } from "viem";
import { localhost, polygon, polygonAmoy } from "wagmi/chains";
import { ENV_MODE } from "./lib/config";
import { env } from "./lib/env";

function getChain(): Chain {
	switch (ENV_MODE) {
		case "TESTNET": {
			if (!env.NEXT_PUBLIC_RPC_URL) return polygonAmoy;
			return {
				...polygonAmoy,
				rpcUrls: {
					default: { http: [env.NEXT_PUBLIC_RPC_URL] },
				},
			};
		}
		case "MAINNET": {
			if (!env.NEXT_PUBLIC_RPC_URL) return polygon;
			return {
				...polygon,
				rpcUrls: {
					default: { http: [env.NEXT_PUBLIC_RPC_URL] },
				},
			};
		}
		default: {
			// LOCAL
			const chainId = env.NEXT_PUBLIC_CHAIN_ID;
			const localRpc = env.NEXT_PUBLIC_RPC_URL ?? "http://localhost:8548";
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
	projectId: env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
	chains: [getChain()],
	ssr: false,
});
