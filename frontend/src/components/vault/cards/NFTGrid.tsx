"use client";

import { AnimatePresence, motion } from "framer-motion";
import type React from "react";
import { memo } from "react";
import { cn } from "../../../lib/theme-config";

// Type guards for different NFT types
interface HasTriggerId {
	triggerId: bigint;
}

interface HasCollectionAndTokenId {
	collection: string;
	tokenId: string | bigint;
}

function isSpinHistoryEntry(nft: unknown): nft is HasTriggerId {
	return (
		typeof nft === "object" &&
		nft !== null &&
		"triggerId" in nft &&
		typeof (nft as HasTriggerId).triggerId === "bigint"
	);
}

function hasCollectionAndTokenId(nft: unknown): nft is HasCollectionAndTokenId {
	return (
		typeof nft === "object" &&
		nft !== null &&
		"collection" in nft &&
		"tokenId" in nft &&
		typeof (nft as HasCollectionAndTokenId).collection === "string" &&
		(typeof (nft as HasCollectionAndTokenId).tokenId === "string" ||
			typeof (nft as HasCollectionAndTokenId).tokenId === "bigint")
	);
}

interface NFTGridProps<T> {
	nfts: T[];
	renderItem: (nft: T, index: number) => React.ReactNode;
	loading?: boolean;
	emptyState?: React.ReactNode;
	columns?: {
		mobile?: 1 | 2;
		tablet?: 2 | 3;
		desktop?: 3 | 4;
	};
	gap?: string;
	className?: string;
	enableAnimation?: boolean;
}

function NFTGrid<T>({
	nfts,
	renderItem,
	loading = false,
	emptyState,
	columns = { mobile: 1, tablet: 2, desktop: 3 },
	gap = "gap-3 sm:gap-4",
	className,
	enableAnimation = true,
}: NFTGridProps<T>) {
	// Build responsive grid classes
	const gridClasses = cn(
		"grid",
		`grid-cols-${columns.mobile}`,
		columns.tablet && `sm:grid-cols-${columns.tablet}`,
		columns.desktop && `lg:grid-cols-${columns.desktop}`,
		gap,
		className,
	);

	// Animation variants for staggered children
	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.05,
				delayChildren: 0.1,
			},
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 20, scale: 0.95 },
		visible: {
			opacity: 1,
			y: 0,
			scale: 1,
			transition: {
				type: "spring" as const,
				stiffness: 300,
				damping: 20,
			},
		},
	};

	// Render loading state
	if (loading) {
		return (
			<div className={gridClasses}>
				{Array.from({ length: 6 }, (_, i) => `skeleton-${i}`).map((key) => (
					<div
						key={key}
						className="bg-content1/20 backdrop-blur-xl rounded-xl border border-white/10 p-4 animate-pulse"
					>
						<div className="w-full aspect-square rounded-lg bg-content1/30 mb-3" />
						<div className="h-4 w-2/3 bg-content1/30 rounded mb-2" />
						<div className="h-3 w-1/2 bg-content1/30 rounded mb-4" />
						<div className="h-11 w-full bg-content1/30 rounded" />
					</div>
				))}
			</div>
		);
	}

	// Render empty state
	if (nfts.length === 0) {
		return <>{emptyState}</>;
	}

	// Render grid with optional animation
	const content = nfts.map((nft, index) => {
		const itemContent = renderItem(nft, index);

		// Generate key: prefer triggerId (spin history), then collection-tokenId, then index
		const getItemKey = () => {
			// Check for triggerId first (for spin history entries)
			if (isSpinHistoryEntry(nft)) {
				return `spin-${nft.triggerId.toString()}`;
			}
			// Fall back to collection-tokenId for regular NFTs
			if (hasCollectionAndTokenId(nft)) {
				const tokenIdStr =
					typeof nft.tokenId === "bigint"
						? nft.tokenId.toString()
						: nft.tokenId;
				return `${nft.collection}-${tokenIdStr}`;
			}
			// Final fallback to index
			return `item-${index}`;
		};

		if (enableAnimation) {
			return (
				<motion.div
					key={getItemKey()}
					variants={itemVariants}
					className="h-full"
				>
					{itemContent}
				</motion.div>
			);
		}

		return (
			<div key={getItemKey()} className="h-full">
				{itemContent}
			</div>
		);
	});

	if (enableAnimation) {
		return (
			<motion.div
				className={gridClasses}
				initial="hidden"
				animate="visible"
				variants={containerVariants}
			>
				<AnimatePresence mode="popLayout">{content}</AnimatePresence>
			</motion.div>
		);
	}

	return <div className={gridClasses}>{content}</div>;
}

export default memo(NFTGrid) as <T>(
	props: NFTGridProps<T>,
) => React.ReactElement;
