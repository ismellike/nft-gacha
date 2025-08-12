import "../styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";

import { Providers } from "./providers";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { ClientAnimatedBackground } from "../components/ClientAnimatedBackground";

// Optimize font loading
const inter = Inter({
	subsets: ["latin"],
	weight: ["300", "400", "500", "600", "700", "800"],
	variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
	subsets: ["latin"],
	weight: ["400", "500", "600"],
	variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
	title: "Spin-Fi - Provably Fair NFT Gacha",
	description:
		"Experience the future of fair NFT gaming with cryptographically guaranteed randomness",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" className="dark">
			<head>
				<link href="/logo.svg" type="image/svg+xml" rel="icon" />
			</head>
			<body className={`${inter.variable} ${jetbrainsMono.variable} font-spin`}>
				<Providers>
					<ClientAnimatedBackground />
					<div className="relative z-10 bg-transparent">
						<Header />
						{children}
						<Footer />
					</div>
				</Providers>
			</body>
		</html>
	);
}
