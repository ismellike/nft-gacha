import "../styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import type { Metadata } from "next";

import { Providers } from "./providers";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

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
			<body>
				<Providers>
					<Header />
					{children}
					<Footer />
				</Providers>
			</body>
		</html>
	);
}
