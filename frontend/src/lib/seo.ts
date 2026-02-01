interface SEOProps {
	title?: string;
	description?: string;
	image?: string;
	url?: string;
	type?: "website" | "article";
	noIndex?: boolean;
}

const defaultSEO = {
	title: "SPINFI - Provably Fair NFT Gacha on WAVS",
	description:
		"Spin for NFT rewards with provably fair randomness powered by WAVS-DRAND. Deposit appraised NFTs to earn yield.",
	image: "/og-image.png",
	url: "https://spinfi.com",
};

export function generateMetadata(props: SEOProps = {}) {
	const title = props.title
		? `${props.title} | SPINFI`
		: defaultSEO.title;
	const description = props.description || defaultSEO.description;
	const image = props.image
		? `https://spinfi.com${props.image}`
		: defaultSEO.image;
	const url = props.url
		? `https://spinfi.com${props.url}`
		: defaultSEO.url;

	return {
		title,
		description,
		openGraph: {
			title,
			description,
			url,
			siteName: "SPINFI",
			images: [
				{
					url: image,
					width: 1200,
					height: 630,
					alt: title,
				},
			],
			locale: "en_US",
			type: props.type || "website",
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
			images: [image],
		},
		robots: {
			index: !props.noIndex,
			follow: !props.noIndex,
			googleBot: {
				index: !props.noIndex,
				follow: !props.noIndex,
				"max-video-preview": -1,
				"max-image-preview": "large",
				"max-snippet": -1,
			},
		},
		icons: {
			icon: "/favicon.ico",
			apple: "/apple-touch-icon.png",
		},
		manifest: "/site.webmanifest",
	};
}
