import "../styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import type { Metadata } from "next";

import { Providers } from "./providers";

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
		<html lang="en">
			<head>
				<link href="/logo.svg" type="image/svg+xml" rel="icon" />
			</head>
			<body>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
