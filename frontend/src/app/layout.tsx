import "../styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import { Inter, JetBrains_Mono, Orbitron } from "next/font/google";

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

const orbitron = Orbitron({
	subsets: ["latin"],
	weight: ["400", "500", "600", "700", "800", "900"],
	variable: "--font-orbitron",
});

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" className="dark">
			<head>
				<title>SPINFI - Provably Fair NFT Gacha</title>
				<meta
					name="description"
					content="Experience the future of fair NFT gaming with cryptographically guaranteed randomness"
				/>
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link href="/logo.svg" type="image/svg+xml" rel="icon" />
			</head>
			<body className={`${inter.variable} ${jetbrainsMono.variable} ${orbitron.variable} font-spin`}>
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
