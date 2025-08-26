/**
 * Skeleton Loading Components
 * Provides better UX with content-aware loading states
 */

import { motion } from "framer-motion";
import { cn } from "../../lib/theme-config";

interface SkeletonProps {
	className?: string;
	animate?: boolean;
}

function Skeleton({ className, animate = true }: SkeletonProps) {
	const baseClasses = "bg-content1/20 rounded animate-pulse";

	if (animate) {
		return (
			<motion.div
				className={cn(baseClasses, className)}
				initial={{ opacity: 0.6 }}
				animate={{ opacity: [0.6, 1, 0.6] }}
				transition={{
					duration: 1.5,
					repeat: Infinity,
					ease: "easeInOut",
				}}
			/>
		);
	}

	return <div className={cn(baseClasses, className)} />;
}

// Gacha Card Skeleton
export function GachaCardSkeleton() {
	return (
		<div className="bg-content1/20 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl overflow-hidden h-full">
			{/* Header */}
			<div className="bg-gradient-to-br from-content1/30 to-content1/10 p-6">
				<div className="flex justify-between items-start mb-4">
					<div className="flex-1">
						<Skeleton className="h-6 w-3/4 mb-2" />
						<div className="flex items-center gap-2">
							<Skeleton className="w-3 h-3 rounded-full" />
							<Skeleton className="h-4 w-16" />
						</div>
					</div>
					<div className="text-right">
						<Skeleton className="h-8 w-12 mb-1" />
						<Skeleton className="h-3 w-20" />
					</div>
				</div>
			</div>

			{/* Content */}
			<div className="p-6 space-y-6">
				<div className="space-y-2">
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-4/5" />
				</div>

				{/* Stats Grid */}
				<div className="grid grid-cols-2 gap-4">
					<div className="text-center p-3 bg-content1/20 rounded-xl">
						<Skeleton className="h-6 w-8 mx-auto mb-1" />
						<Skeleton className="h-3 w-16 mx-auto" />
					</div>
					<div className="text-center p-3 bg-content1/20 rounded-xl">
						<Skeleton className="h-6 w-12 mx-auto mb-1" />
						<Skeleton className="h-3 w-12 mx-auto" />
					</div>
				</div>

				{/* Rarity Distribution */}
				<div className="space-y-2">
					<Skeleton className="h-4 w-24" />
                    <div className="grid grid-cols-5 gap-1">
                        {Array.from({ length: 5 }, (_, i) => `slot-${i}`).map((id) => (
                            <div key={id} className="text-center">
                                <Skeleton className="h-2 w-full rounded-full mb-1" />
                                <Skeleton className="h-3 w-4 mx-auto" />
                            </div>
                        ))}
                    </div>
				</div>

				{/* Button */}
				<Skeleton className="h-12 w-full rounded-xl" />
			</div>
		</div>
	);
}

// Rewards Card Skeleton
function RewardsCardSkeleton() {
	return (
		<div className="bg-content1/20 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-6">
			<div className="flex items-center justify-between">
				<div className="flex-1">
					<Skeleton className="h-3 w-24 mb-2" />
					<Skeleton className="h-8 w-32" />
				</div>
				<div className="w-16 h-16 bg-content1/20 rounded-2xl flex items-center justify-center">
					<Skeleton className="w-8 h-8" />
				</div>
			</div>
		</div>
	);
}

// Rarity Breakdown Skeleton
export function RarityBreakdownSkeleton() {
	return (
		<div className="space-y-3">
            {["common","uncommon","rare","epic","legendary"].map((key) => (
                <div key={key} className="relative group">
                    <div className="bg-content1/20 backdrop-blur-xl rounded-lg border border-white/20 p-4 shadow-lg">
                        <div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div className="flex items-center gap-2 px-3 py-1 bg-content1/30 rounded-full">
									<Skeleton className="w-4 h-4 rounded-full" />
									<Skeleton className="h-4 w-16" />
								</div>
							</div>
							<div className="flex items-center gap-6 text-right">
								<div>
									<Skeleton className="h-3 w-12 mb-1" />
									<Skeleton className="h-5 w-8" />
								</div>
								<div>
									<Skeleton className="h-3 w-16 mb-1" />
									<Skeleton className="h-4 w-12" />
								</div>
							</div>
						</div>
					</div>
				</div>
			))}
		</div>
	);
}

// Stats Grid Skeleton
export function StatsGridSkeleton({ columns = 3 }: { columns?: number }) {
    return (
        <div
            className={`grid gap-6 ${columns === 2 ? "md:grid-cols-2" : columns === 3 ? "sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}
        >
            {Array.from({ length: columns }, (_, i) => `col-${i}`).map((id) => (
                <RewardsCardSkeleton key={id} />
            ))}
        </div>
    );
}

// (removed unused local skeleton component to satisfy TS noUnusedLocals)
