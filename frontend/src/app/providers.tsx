"use client";

import { darkTheme, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { WagmiProvider } from "wagmi";
import { RewardsRefetchProvider } from "../hooks/useRewardsData";
import { config } from "../wagmi";
import { ErrorBoundary } from "../components/shared/ErrorBoundary";
import { Toaster } from "../components/shared/Toaster";

const customDarkTheme = darkTheme({
	accentColor: "#eab308",
	accentColorForeground: "#422006",
	borderRadius: "large",
	fontStack: "system",
	overlayBlur: "large",
});

export function Providers({ children }: { children: React.ReactNode }) {
	// Create QueryClient lazily to prevent cross-session cache sharing
	const [queryClient] = useState(
		() =>
			new QueryClient({
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
			}),
	);

	return (
		<WagmiProvider config={config}>
			<QueryClientProvider client={queryClient}>
				<ErrorBoundary>
					<RainbowKitProvider
						theme={customDarkTheme}
						modalSize="compact"
					>
						<RewardsRefetchProvider>{children}</RewardsRefetchProvider>
					</RainbowKitProvider>
					<Toaster />
				</ErrorBoundary>
			</QueryClientProvider>
		</WagmiProvider>
	);
}
