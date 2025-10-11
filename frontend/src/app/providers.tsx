"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { HeroUIProvider } from "@heroui/react";
import { useRouter } from "next/navigation";
import { config } from "../wagmi";
import { RewardsRefetchProvider } from "../hooks/useRewardsData";

const customDarkTheme = darkTheme({
	accentColor: "#eab308",
	accentColorForeground: "#422006",
	borderRadius: "large",
	fontStack: "system",
	overlayBlur: "large",
});

export function Providers({ children }: { children: React.ReactNode }) {
	const router = useRouter();

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
				<RainbowKitProvider theme={customDarkTheme} modalSize="compact">
					<HeroUIProvider navigate={router.push}>
						<RewardsRefetchProvider>{children}</RewardsRefetchProvider>
					</HeroUIProvider>
				</RainbowKitProvider>
			</QueryClientProvider>
		</WagmiProvider>
	);
}
