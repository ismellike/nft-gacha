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

// Base props for all NFT card variants - extends UnifiedNFTCardProps for compatibility
export interface BaseNFTCardProps
	extends Omit<UnifiedNFTCardProps, "priority"> {
	priority?: boolean; // For optimizing loading order (converted to number in implementation)
}

// Size variants for different use cases
export type NFTCardSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface NFTCardProps extends BaseNFTCardProps {
	size?: NFTCardSize;
	variant?: "minimal" | "compact" | "detailed" | "showcase";
}

// Main base NFT card component - now uses UnifiedNFTCard under the hood
export const BaseNFTCard = memo<NFTCardProps>(({ priority, ...props }) => {
	// Convert boolean priority to number for UnifiedNFTCard
	const priorityNumber = priority ? 8 : 0;

	return <UnifiedNFTCard {...props} priority={priorityNumber} />;
});
BaseNFTCard.displayName = "BaseNFTCard";

// Convenience exports for specific use cases - now using unified components
export const NFTThumbnail = UnifiedNFTThumbnail;
export const NFTCompactCard = UnifiedNFTGridCard;
export const NFTDetailCard = UnifiedNFTListCard;
export const NFTShowcaseCard = UnifiedNFTShowcaseCard;
export const NFTHeroCard = UnifiedNFTHeroCard;
