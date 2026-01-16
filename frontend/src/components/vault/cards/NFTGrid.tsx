"use client";

import type React from "react";
import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../../lib/theme-config";

export interface NFTGridProps<T> {
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
				{Array.from({ length: 6 }).map((_, i) => (
					<div
						key={`skeleton-${i}`}
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
			if (typeof nft === "object" && nft !== null) {
				// Check for triggerId first (for spin history entries)
				if ("triggerId" in nft && typeof (nft as any).triggerId === "bigint") {
					return `spin-${(nft as any).triggerId.toString()}`;
				}
				// Fall back to collection-tokenId for regular NFTs
				if ("collection" in nft && "tokenId" in nft) {
					return `${(nft as any).collection}-${(nft as any).tokenId}`;
				}
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
			<div key={`item-${index}`} className="h-full">
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
