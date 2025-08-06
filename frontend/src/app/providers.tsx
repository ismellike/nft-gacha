"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { HeroUIProvider } from "@heroui/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { config } from "../wagmi";

const queryClient = new QueryClient();

const customDarkTheme = darkTheme({
	accentColor: "#eab308",
	accentColorForeground: "#422006",
	borderRadius: "large",
	fontStack: "system",
	overlayBlur: "large",
});

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<WagmiProvider config={config}>
			<QueryClientProvider client={queryClient}>
				<RainbowKitProvider theme={customDarkTheme} modalSize="compact">
					<HeroUIProvider>
						<NextThemesProvider attribute="class" defaultTheme="dark">
							{children}
						</NextThemesProvider>
					</HeroUIProvider>
				</RainbowKitProvider>
			</QueryClientProvider>
		</WagmiProvider>
	);
}
