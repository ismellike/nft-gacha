"use client";

import { memo, useMemo, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { cn } from "../lib/theme-config";
import type { Rarity } from "../lib/rarityConfig";
import { UnifiedNFTCard } from "./UnifiedNFTCard";

// NFT item interface for grid display
interface NFTGridItem {
	collection: string;
	tokenId: string;
	rarity?: Rarity;
	imageUrl?: string;
	priority?: number;
}

// Grid layout options
type GridLayout = "compact" | "comfortable" | "spacious";
type GridSize = "sm" | "md" | "lg";

// Grid component props
interface NFTGridProps {
	items: NFTGridItem[];
	appraisalContractAddress: `0x${string}`;
	onItemClick?: (item: NFTGridItem) => void;
	layout?: GridLayout;
	size?: GridSize;
	showAppraisal?: boolean;
	animate?: boolean;
	className?: string;
	// Performance options
	virtualizeThreshold?: number; // Start virtualizing after this many items
	itemsPerPage?: number; // For pagination
	enableLazyLoading?: boolean;
	priorityLoadCount?: number; // How many items to load with high priority
}

// Grid layout configurations
const GRID_CONFIGS = {
	compact: {
		sm: {
			cols: "grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10",
			gap: "gap-2",
			cardSize: "xs" as const,
		},
		md: {
			cols: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8",
			gap: "gap-3",
			cardSize: "sm" as const,
		},
		lg: {
			cols: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6",
			gap: "gap-4",
			cardSize: "md" as const,
		},
	},
	comfortable: {
		sm: {
			cols: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8",
			gap: "gap-3",
			cardSize: "sm" as const,
		},
		md: {
			cols: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6",
			gap: "gap-4",
			cardSize: "md" as const,
		},
		lg: {
			cols: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
			gap: "gap-6",
			cardSize: "lg" as const,
		},
	},
	spacious: {
		sm: {
			cols: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6",
			gap: "gap-4",
			cardSize: "md" as const,
		},
		md: {
			cols: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
			gap: "gap-6",
			cardSize: "lg" as const,
		},
		lg: {
			cols: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
			gap: "gap-8",
			cardSize: "xl" as const,
		},
	},
};

// Simple virtualized grid item component
const VirtualizedGridItem = memo<{
	item: NFTGridItem;
	index: number;
	config: (typeof GRID_CONFIGS)[GridLayout][GridSize];
	appraisalContractAddress: `0x${string}`;
	showAppraisal: boolean;
	animate: boolean;
	priorityLoadCount: number;
	enableLazyLoading: boolean;
	onItemClick?: (item: NFTGridItem) => void;
}>(
	({
		item,
		index,
		config,
		appraisalContractAddress,
		showAppraisal,
		animate,
		priorityLoadCount,
		enableLazyLoading: _,
		onItemClick,
	}) => {
		// Use stable references for click handler to prevent unnecessary rerenders
		const handleClick = useCallback(() => {
			onItemClick?.(item);
		}, [onItemClick, item]);

		// Calculate priority based on position in grid
		const priority = useMemo(() => {
			if (index < priorityLoadCount) return 8;
			if (index < priorityLoadCount * 2) return 5;
			if (index < priorityLoadCount * 3) return 3;
			return 1;
		}, [index, priorityLoadCount]);

		// Memoize animation props to prevent recreation
		const shouldAnimate = animate;
		const animationDelay = Math.min(index * 0.05, 1);

		// Memoize NFT card props to prevent unnecessary prop changes
		const nftCardProps = useMemo(() => ({
			collection: item.collection,
			tokenId: item.tokenId,
			...(item.imageUrl && { imageUrl: item.imageUrl }),
			...(item.rarity && { rarity: item.rarity }),
			size: config.cardSize,
			variant: "detailed",
			showAppraisal,
			enableTraitExpansion: true,
			appraisalContractAddress,
			animate,
			priority,
			onClick: handleClick,
		}), [
			item.collection,
			item.tokenId,
			item.imageUrl,
			item.rarity,
			config.cardSize,
			showAppraisal,
			appraisalContractAddress,
			animate,
			priority,
			handleClick,
		]);

		return (
			<motion.div
				initial={shouldAnimate ? { opacity: 0, y: 20, scale: 0.9 } : undefined}
				animate={shouldAnimate ? { opacity: 1, y: 0, scale: 1 } : undefined}
				transition={shouldAnimate ? {
					duration: 0.3,
					delay: animationDelay,
					ease: [0.4, 0.0, 0.2, 1],
				} : undefined}
			>
				<UnifiedNFTCard {...nftCardProps} />
			</motion.div>
		);
	},
);
VirtualizedGridItem.displayName = "VirtualizedGridItem";

// Main NFT grid component
const NFTGrid = memo<NFTGridProps>(
	({
		items,
		appraisalContractAddress,
		onItemClick,
		layout = "comfortable",
		size = "md",
		showAppraisal = true,
		animate = true,
		className,
		itemsPerPage,
		enableLazyLoading = true,
		priorityLoadCount = 12,
	}) => {
		const [currentPage, setCurrentPage] = useState(0);

		// Get grid configuration (stable reference)
		const config = useMemo(() => GRID_CONFIGS[layout][size], [layout, size]);

		// Handle pagination if enabled
		const paginatedItems = useMemo(() => {
			if (!itemsPerPage) return items;

			const start = currentPage * itemsPerPage;
			const end = start + itemsPerPage;
			return items.slice(start, end);
		}, [items, currentPage, itemsPerPage]);

		// Calculate total pages for pagination
		const totalPages = useMemo(() => {
			return itemsPerPage ? Math.ceil(items.length / itemsPerPage) : 1;
		}, [items.length, itemsPerPage]);

		// Memoize grid items to prevent recreation on every render
		const gridItems = useMemo(() => {
			return paginatedItems.map((item, index) => {
				const itemIndex = currentPage * (itemsPerPage || 0) + index;
				return (
					<VirtualizedGridItem
						key={`${item.collection}-${item.tokenId}`}
						item={item}
						index={itemIndex}
						config={config}
						appraisalContractAddress={appraisalContractAddress}
						showAppraisal={showAppraisal}
						animate={animate}
						priorityLoadCount={priorityLoadCount}
						enableLazyLoading={enableLazyLoading}
						{...(onItemClick && { onItemClick })}
					/>
				);
			});
		}, [
			paginatedItems,
			currentPage,
			itemsPerPage,
			config,
			appraisalContractAddress,
			showAppraisal,
			animate,
			priorityLoadCount,
			enableLazyLoading,
			onItemClick,
		]);

		// Memoize grid content to prevent recreation
		const gridContent = useMemo(() => (
			<div className={cn("grid", config.cols, config.gap, className)}>
				{gridItems}
			</div>
		), [gridItems, config.cols, config.gap, className]);

		// Memoize animation wrapper
		const animatedGridContent = useMemo(() => {
			if (!animate) return gridContent;

			return (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.5 }}
				>
					{gridContent}
				</motion.div>
			);
		}, [animate, gridContent]);

		// Memoize pagination controls
		const paginationControls = useMemo(() => {
			if (!itemsPerPage || totalPages <= 1) return null;

			return (
				<div className="flex justify-center items-center gap-2 mt-8">
					<button
						type="button"
						onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
						disabled={currentPage === 0}
						className={cn(
							"px-4 py-2 rounded-lg transition-all duration-200",
							"bg-white/10 border border-white/20 text-white/80",
							"hover:bg-white/20 hover:border-white/30 disabled:opacity-50 disabled:cursor-not-allowed",
						)}
					>
						Previous
					</button>

					<span className="px-4 py-2 text-white/70 text-sm">
						Page {currentPage + 1} of {totalPages}
					</span>

					<button
						type="button"
						onClick={() =>
							setCurrentPage((p) => Math.min(totalPages - 1, p + 1))
						}
						disabled={currentPage === totalPages - 1}
						className={cn(
							"px-4 py-2 rounded-lg transition-all duration-200",
							"bg-white/10 border border-white/20 text-white/80",
							"hover:bg-white/20 hover:border-white/30 disabled:opacity-50 disabled:cursor-not-allowed",
						)}
					>
						Next
					</button>
				</div>
			);
		}, [itemsPerPage, totalPages, currentPage]);

		return (
			<div className="space-y-6">
				{/* Grid content */}
				{animatedGridContent}

				{/* Pagination controls */}
				{paginationControls}
			</div>
		);
	},
);
NFTGrid.displayName = "NFTGrid";

// Convenience exports for specific use cases
const CompactNFTGrid = memo<Omit<NFTGridProps, "layout" | "size">>((props) => (
	<NFTGrid {...props} layout="compact" size="sm" />
));
CompactNFTGrid.displayName = "CompactNFTGrid";

export const StandardNFTGrid = memo<Omit<NFTGridProps, "layout" | "size">>(
	(props) => <NFTGrid {...props} layout="comfortable" size="md" />,
);
StandardNFTGrid.displayName = "StandardNFTGrid";

const ShowcaseNFTGrid = memo<Omit<NFTGridProps, "layout" | "size">>((props) => (
	<NFTGrid {...props} layout="spacious" size="lg" />
));
ShowcaseNFTGrid.displayName = "ShowcaseNFTGrid";

// Hook for converting treasury data to grid items
export function useTreasuryItemsToGridItems(
	treasuryItems:
		| readonly {
			collection: string;
			tokenId: bigint;
			depositor: string;
			[key: string]: unknown;
		}[]
		| undefined,
	rarity?: Rarity,
): NFTGridItem[] {
	return useMemo(() => {
		if (!treasuryItems) return [];

		return treasuryItems.map((item, index) => ({
			collection: item.collection,
			tokenId: item.tokenId.toString(),
			...(rarity && { rarity }),
			priority: index < 20 ? 8 : index < 50 ? 5 : 2, // Higher priority for first items
		}));
	}, [treasuryItems, rarity]);
}
