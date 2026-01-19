import "../styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import { DM_Serif_Display, Space_Grotesk, IBM_Plex_Mono } from "next/font/google";

import { Providers } from "./providers";
import { Header } from "../components/shared/layout";
import { Footer } from "../components/shared/layout";
import { ClientAnimatedBackground } from "../components/shared/background";
import { ServiceWorkerRegistrar } from "../components/shared/service-worker-registrar";

// Distinctive font trio: elegant serif + geometric sans + technical mono
const dmSerif = DM_Serif_Display({
	subsets: ["latin"],
	weight: ["400"],
	variable: "--font-dm-serif",
	style: "normal",
});

const spaceGrotesk = Space_Grotesk({
	subsets: ["latin"],
	weight: ["300", "400", "500", "600", "700"],
	variable: "--font-space-grotesk",
});

const ibmPlexMono = IBM_Plex_Mono({
	subsets: ["latin"],
	weight: ["400", "500", "600"],
	variable: "--font-ibm-plex-mono",
});

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" className="dark">
			<head>
				{/* Basic Meta Tags */}
				<title>SPINFI - Provably Fair NFT Gacha</title>
				<meta
					name="description"
					content="Experience the future of fair NFT gaming with cryptographically guaranteed randomness powered by WAVS"
				/>
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<meta name="theme-color" content="#f59e0b" />
				<meta name="msapplication-TileColor" content="#f59e0b" />
				<meta name="apple-mobile-web-app-capable" content="yes" />
				<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
				<meta name="apple-mobile-web-app-title" content="SPINFI" />

				{/* Favicon */}
				<link rel="icon" href="/favicon.ico" sizes="any" />
				<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
				<link rel="apple-touch-icon" href="/apple-touch-icon.png" />

				{/* PWA Manifest */}
				<link rel="manifest" href="/site.webmanifest" />

				{/* Open Graph / Social Media */}
				<meta property="og:type" content="website" />
				<meta property="og:title" content="SPINFI - Provably Fair NFT Gacha" />
				<meta
					property="og:description"
					content="Experience the future of fair NFT gaming with cryptographically guaranteed randomness powered by WAVS"
				/>
				<meta property="og:image" content="/logo.webp" />
				<meta property="og:url" content="https://spinfi.xyz" />

				{/* Twitter Card */}
				<meta name="twitter:card" content="summary_large_image" />
				<meta name="twitter:title" content="SPINFI - Provably Fair NFT Gacha" />
				<meta
					name="twitter:description"
					content="Experience the future of fair NFT gaming with cryptographically guaranteed randomness powered by WAVS"
				/>
				<meta name="twitter:image" content="/logo.webp" />

				{/* Additional SEO */}
				<meta
					name="keywords"
					content="NFT, gacha, gaming, blockchain, cryptocurrency, WAVS, provably fair, randomness, DeFi"
				/>
				<meta name="author" content="SPINFI Team" />
			</head>
			<body
				className={`${dmSerif.variable} ${spaceGrotesk.variable} ${ibmPlexMono.variable} font-spin`}
			>
				<ServiceWorkerRegistrar />
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
