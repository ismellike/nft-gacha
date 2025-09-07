"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { HeroUIProvider } from "@heroui/react";
import { useRouter } from "next/navigation";
import { config } from "../wagmi";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000, // reduce churn for onchain reads
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: 2,
    },
    mutations: {
      retry: 0,
    },
  },
});

const customDarkTheme = darkTheme({
	accentColor: "#eab308",
	accentColorForeground: "#422006",
	borderRadius: "large",
	fontStack: "system",
	overlayBlur: "large",
});

export function Providers({ children }: { children: React.ReactNode }) {
	const router = useRouter();

	return (
		<WagmiProvider config={config}>
			<QueryClientProvider client={queryClient}>
				<RainbowKitProvider theme={customDarkTheme} modalSize="compact">
					<HeroUIProvider navigate={router.push}>{children}</HeroUIProvider>
				</RainbowKitProvider>
			</QueryClientProvider>
		</WagmiProvider>
	);
}
