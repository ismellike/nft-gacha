"use client";

import { memo } from "react";
import { Rarity } from "../../lib/rarityConfig";
import {
	UnifiedNFTCard,
	NFTThumbnail as UnifiedNFTThumbnail,
	NFTGridCard as UnifiedNFTGridCard,
	NFTListCard as UnifiedNFTListCard,
	NFTShowcaseCard as UnifiedNFTShowcaseCard,
	NFTHeroCard as UnifiedNFTHeroCard,
	type UnifiedNFTCardProps,
} from "./UnifiedNFTCard";

// Enhanced props for the optimized NFT card - extends UnifiedNFTCardProps for compatibility
export interface OptimizedNFTCardProps extends UnifiedNFTCardProps {
	// All props are now inherited from UnifiedNFTCardProps
}

// Main optimized NFT card component - now uses UnifiedNFTCard under the hood
export const OptimizedNFTCard = memo<OptimizedNFTCardProps>((props) => {
	// Direct wrapper around UnifiedNFTCard with all the same optimizations built-in
	return <UnifiedNFTCard {...props} />;
});
OptimizedNFTCard.displayName = "OptimizedNFTCard";

// Convenience exports for specific use cases - now using unified components
export const NFTGridCard = UnifiedNFTGridCard;
export const NFTListCard = UnifiedNFTListCard;
export const NFTHeroCard = UnifiedNFTHeroCard;
export const NFTThumbnail = UnifiedNFTThumbnail;
