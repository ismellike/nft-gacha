import "../styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import {
	DM_Serif_Display,
	IBM_Plex_Mono,
	Space_Grotesk,
} from "next/font/google";
import { ClientAnimatedBackground } from "../components/shared/background";
import { Footer, Header } from "../components/shared/layout";
import { SkipToContent } from "../components/shared/SkipToContent";
import { ServiceWorkerRegistrar } from "../components/shared/service-worker-registrar";
import {
	generateOrganizationStructuredData,
	generateWebsiteStructuredData,
} from "../lib/structuredData";
import { Providers } from "./providers";

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

// Export metadata for Next.js App Router
export const metadata = {
	title: "SPINFI - Provably Fair NFT Gacha on WAVS",
	description:
		"Spin for NFT rewards with provably fair randomness powered by WAVS-DRAND. Deposit appraised NFTs to earn yield.",
	keywords: [
		"NFT",
		"gacha",
		"gaming",
		"blockchain",
		"cryptocurrency",
		"WAVS",
		"provably fair",
		"randomness",
		"DeFi",
		"yield",
		"Web3",
	],
	authors: [{ name: "SPINFI Team" }],
	creator: "SPINFI",
	publisher: "SPINFI",

	openGraph: {
		type: "website",
		locale: "en_US",
		url: "https://spinfi.com",
		title: "SPINFI - Provably Fair NFT Gacha on WAVS",
		description:
			"Spin for NFT rewards with provably fair randomness powered by WAVS-DRAND. Deposit appraised NFTs to earn yield.",
		siteName: "SPINFI",
		images: [
			{
				url: "/og-image.png",
				width: 1200,
				height: 630,
				alt: "SPINFI - Provably Fair NFT Gacha",
			},
		],
	},

	twitter: {
		card: "summary_large_image",
		title: "SPINFI - Provably Fair NFT Gacha on WAVS",
		description:
			"Spin for NFT rewards with provably fair randomness powered by WAVS-DRAND. Deposit appraised NFTs to earn yield.",
		images: ["/og-image.png"],
		creator: "@spinfiapp",
	},

	icons: {
		icon: "/favicon.ico",
		shortcut: "/favicon-16x16.png",
		apple: "/apple-touch-icon.png",
	},

	manifest: "/site.webmanifest",

	other: {
		"theme-color": "#f59e0b",
		"msapplication-TileColor": "#f59e0b",
		"apple-mobile-web-app-capable": "yes",
		"apple-mobile-web-app-status-bar-style": "black-translucent",
		"apple-mobile-web-app-title": "SPINFI",
	},

	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},

	verification: {
		// Add your verification codes here when available
		// google: "your-google-verification-code",
		// yandex: "your-yandex-verification-code",
	},
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" className="dark">
			<head>
				{/* Structured Data */}
				<script
					type="application/ld+json"
					// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data is safe
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(generateWebsiteStructuredData()),
					}}
				/>
				<script
					type="application/ld+json"
					// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data is safe
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(generateOrganizationStructuredData()),
					}}
				/>
			</head>
			<body
				className={`${dmSerif.variable} ${spaceGrotesk.variable} ${ibmPlexMono.variable} font-spin`}
			>
				<ServiceWorkerRegistrar />
				<SkipToContent />
				<Providers>
					<ClientAnimatedBackground />
					<div className="relative z-10 bg-transparent">
						<Header />
						<main id="main-content" tabIndex={-1}>
							{children}
						</main>
						<Footer />
					</div>
				</Providers>
			</body>
		</html>
	);
}
