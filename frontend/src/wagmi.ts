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
} as const;

export const config = getDefaultConfig({
	appName: "Spin-Fi",
	projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "placeholder",
	chains: [wavsLocal],
	ssr: false, // This is a SPA, no SSR
});
