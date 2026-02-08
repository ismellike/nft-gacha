import { usePathname } from "next/navigation";
import { generateMetadata } from "../lib/seo";

interface PageSEO {
	title: string;
	description: string;
	image?: string;
}

const pageSEO: Record<string, PageSEO> = {
	"/": {
		title: "Home",
		description:
			"Discover and spin provably fair NFT gachas. Win rare NFTs with transparent odds powered by WAVS-DRAND randomness.",
	},
	"/discover": {
		title: "Discover Gachas",
		description:
			"Browse all available NFT gachas. View rarity breakdowns, spin fees, and prize pools before you play.",
	},
	"/appraisal": {
		title: "NFT Appraisal",
		description:
			"Get your NFTs professionally appraised by our AVS-powered oracle system. Deposit appraised NFTs to earn yield.",
	},
};

export function useSeo() {
	const pathname = usePathname();

	// Match the most specific route
	const seo = pageSEO[pathname] ||
		Object.entries(pageSEO).find(([route]) =>
			pathname.startsWith(route),
		)?.[1] || {
			title: "SPINFI",
			description:
				"Spin for NFT rewards with provably fair randomness powered by WAVS-DRAND.",
		};

	return generateMetadata({
		...seo,
		url: pathname,
	});
}
