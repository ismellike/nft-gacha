"use client";

import { motion } from "framer-motion";
import { memo } from "react";
import { cn } from "../../../lib/theme-config";

interface NFTGridSkeletonProps {
	count?: number;
	columns?: {
		mobile?: 1 | 2;
		tablet?: 2 | 3;
		desktop?: 3 | 4;
	};
	gap?: string;
	className?: string;
}

function NFTCardSkeleton({ index }: { index: number }) {
	return (
		<motion.div
			className="bg-content1/20 backdrop-blur-xl rounded-xl border border-white/10 p-3 sm:p-4 flex flex-col h-full"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ delay: index * 0.05 }}
		>
			{/* Image skeleton */}
			<div className="relative w-full aspect-square rounded-lg bg-content1/30 mb-3 sm:mb-4 overflow-hidden">
				<motion.div
					className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
					animate={{
						x: ["-100%", "100%"],
					}}
					transition={{
						duration: 1.5,
						repeat: Number.POSITIVE_INFINITY,
						ease: "linear",
						delay: index * 0.1,
					}}
				/>
			</div>

			{/* Title skeleton */}
			<div className="h-4 w-3/4 bg-content1/30 rounded mb-2" />

			{/* Subtitle skeleton */}
			<div className="h-3 w-1/2 bg-content1/30 rounded mb-1" />

			{/* Value skeleton */}
			<div className="h-5 w-2/3 bg-content1/30 rounded mb-3 sm:mb-4 mt-auto" />

			{/* Button skeleton */}
			<div className="h-11 w-full bg-content1/30 rounded-lg min-h-[44px]" />
		</motion.div>
	);
}

function NFTGridSkeleton({
	count = 6,
	columns = { mobile: 1, tablet: 2, desktop: 3 },
	gap = "gap-3 sm:gap-4",
	className,
}: NFTGridSkeletonProps) {
	const gridClasses = cn(
		"grid",
		`grid-cols-${columns.mobile}`,
		columns.tablet && `sm:grid-cols-${columns.tablet}`,
		columns.desktop && `lg:grid-cols-${columns.desktop}`,
		gap,
		className,
	);

	return (
		<div className={gridClasses}>
			{Array.from({ length: count }, (_, i) => i).map((index) => (
				<NFTCardSkeleton key={`skeleton-${index}`} index={index} />
			))}
		</div>
	);
}

export default memo(NFTGridSkeleton);
