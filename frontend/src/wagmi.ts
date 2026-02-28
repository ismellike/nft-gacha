import type { ChainAdapter } from "@reown/appkit";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import {
	type AppKitNetwork,
	defineChain,
	polygon,
	polygonAmoy,
} from "@reown/appkit/networks";
import { createAppKit } from "@reown/appkit/react";
import { ENV_MODE } from "./lib/config";
import { env } from "./lib/env";

function getNetwork(): AppKitNetwork {
	switch (ENV_MODE) {
		case "TESTNET": {
			if (!env.NEXT_PUBLIC_RPC_URL) return polygonAmoy;
			return defineChain({
				...polygonAmoy,
				caipNetworkId: "eip155:80002",
				chainNamespace: "eip155",
				rpcUrls: {
					default: { http: [env.NEXT_PUBLIC_RPC_URL] },
				},
			});
		}
		case "MAINNET": {
			if (!env.NEXT_PUBLIC_RPC_URL) return polygon;
			return defineChain({
				...polygon,
				caipNetworkId: "eip155:137",
				chainNamespace: "eip155",
				rpcUrls: {
					default: { http: [env.NEXT_PUBLIC_RPC_URL] },
				},
			});
		}
		default: {
			// LOCAL
			const chainId = env.NEXT_PUBLIC_CHAIN_ID;
			const localRpc = env.NEXT_PUBLIC_RPC_URL ?? "http://localhost:8548";
			return defineChain({
				id: chainId,
				caipNetworkId: `eip155:${chainId}`,
				chainNamespace: "eip155",
				name: `Local ${chainId}`,
				nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
				rpcUrls: {
					default: { http: [localRpc] },
				},
			});
		}
	}
}

const network = getNetwork();

/** The chain ID the app is configured for (based on ENV_MODE). */
export const expectedChainId = network.id as number;

/** The human-readable name of the expected network. */
export const expectedNetworkName = "name" in network ? (network.name as string) : `Chain ${expectedChainId}`;

const wagmiAdapter = new WagmiAdapter({
	projectId: env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
	networks: [network],
	ssr: false,
});

createAppKit({
	adapters: [wagmiAdapter as unknown as ChainAdapter],
	projectId: env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
	networks: [network],
	defaultNetwork: network,
	themeMode: "dark",
	themeVariables: {
		"--w3m-accent": "#eab308",
	},
	features: {
		analytics: false,
	},
});

export const config = wagmiAdapter.wagmiConfig;
