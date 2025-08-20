"use client";

// Backwards compatibility export - redirects to UnifiedNFTCard
export {
	UnifiedNFTCard as NFTCard,
	NFTThumbnail,
	NFTGridCard,
	NFTListCard,
	NFTShowcaseCard,
	NFTHeroCard,
	// Keep old component names for compatibility
	NFTThumbnail as NFTInventoryCard,
	NFTShowcaseCard as NFTRevealCard,
	// Export the image component
	UnifiedNFTCard as NFTImage,
	type UnifiedNFTCardProps as NFTCardProps,
} from "./ui/UnifiedNFTCard";

// Export other types that might be needed
export type { UnifiedNFTCardProps } from "./ui/UnifiedNFTCard";
