"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { formatTokenAmount } from "../lib/utils";
import {
	useReadGachaTreasuryGetPlatformOverviewBatch,
	useReadGachaGetGachaConfigBatch,
	useReadErc20Symbol,
	useReadErc20Decimals,
} from "../generated";
import {
	GiftIcon,
	BoltIcon,
	ArrowRightIcon,
	XCircleIcon,
	ChartBarIcon,
} from "@heroicons/react/24/outline";
import { Card, Chip } from "../ui";
import { GachaCardSkeleton } from "./ui";
import { GachaCardHeader } from "./GachaCardHeader";
import { RarityBadge } from "./ui/RaritySystem";
import { getAllRarities } from "../lib/rarityConfig";
import type { GachaConfig } from "../lib/gacha-config";

interface GachaCardProps {
	gacha: GachaConfig;
}

export function GachaCard({ gacha }: GachaCardProps) {
	const router = useRouter();

	// 🚀 BATCH OPTIMIZED: Get all data in 2 calls instead of 5!
	const treasuryAddress = gacha.treasuryAddress as `0x${string}`;

	const { data: platformData, isLoading: isPlatformLoading } =
		useReadGachaTreasuryGetPlatformOverviewBatch({
			address: treasuryAddress,
		} as Parameters<typeof useReadGachaTreasuryGetPlatformOverviewBatch>[0]);

	const { data: gachaConfig, isLoading: isGachaConfigLoading } =
		useReadGachaGetGachaConfigBatch({
			address: gacha.address as `0x${string}`,
		} as Parameters<typeof useReadGachaGetGachaConfigBatch>[0]);

	// Extract platform data: [rarityCounts[5], totalItems, isGachaAvailable, totalDeposited, totalClaimed]
	const rarityCounts = (platformData as any)?.[0] || [0n, 0n, 0n, 0n, 0n];
	const totalItemsCount = (platformData as any)?.[1] || 0n;
	const isAvailable = (platformData as any)?.[2] || false;

	// Extract gacha config: [feeTokenAddr, spinFeeAmount, isPaused, rarityWeights[5], totalWeight, isAvailable]
	const feeToken = (gachaConfig as any)?.[0];
	const spinFee = (gachaConfig as any)?.[1] || 0n;

	const { data: feeTokenSymbol } = useReadErc20Symbol({
		address: feeToken,
		query: { enabled: !!feeToken },
	});

	const { data: feeTokenDecimals } = useReadErc20Decimals({
		address: feeToken,
		query: { enabled: !!feeToken },
	});

	const totalNFTs = totalItemsCount ? Number(totalItemsCount) : 0;

	const formattedSpinFee =
		spinFee && feeTokenDecimals && feeTokenSymbol
			? formatTokenAmount(spinFee, feeTokenDecimals, {
					maxDecimals: 4,
					suffix: ` ${feeTokenSymbol}`,
					useGrouping: true,
				})
			: "Loading...";

	const rarityCountsArray: readonly bigint[] = Array.isArray(rarityCounts)
		? (rarityCounts as readonly bigint[])
		: [];

	const handleExplore = useCallback(() => {
		router.push(`/gacha?id=${gacha.id}&section=spin`);
	}, [router, gacha.id]);

	// Show skeleton while essential data is loading
	const isLoading = isPlatformLoading || isGachaConfigLoading;

	if (isLoading) {
		return <GachaCardSkeleton />;
	}

	return (
		<motion.button
			className="h-full cursor-pointer"
			onClick={handleExplore}
			whileHover={{ scale: 1.02 }}
			whileTap={{ scale: 0.98 }}
			transition={{ type: "spring", stiffness: 300, damping: 20 }}
			aria-label={`Explore ${gacha.title} gacha with ${totalNFTs} cards available`}
			data-testid={`explore-gacha-${gacha.id}`}
		>
			<Card className="h-full overflow-hidden group cursor-pointer">
				{/* Enhanced Header */}
				<GachaCardHeader theme={gacha.theme}>
					<div className="flex justify-between items-start mb-6">
						<div className="flex-1">
							<div className="flex items-center gap-3 mb-3">
								<motion.div
									className={`w-3 h-3 rounded-full ${isAvailable ? "bg-green-400 shadow-green-400/50" : "bg-red-400 shadow-red-400/50"} shadow-lg`}
									animate={{
										scale: [1, 1.3, 1],
										boxShadow: isAvailable
											? [
													"0 0 4px rgba(34, 197, 94, 0.5)",
													"0 0 12px rgba(34, 197, 94, 0.8)",
													"0 0 4px rgba(34, 197, 94, 0.5)",
												]
											: [
													"0 0 4px rgba(248, 113, 113, 0.5)",
													"0 0 12px rgba(248, 113, 113, 0.8)",
													"0 0 4px rgba(248, 113, 113, 0.5)",
												],
									}}
									transition={{ duration: 2, repeat: 999 }}
									aria-hidden="true"
								></motion.div>
								<span className="text-white/95 text-sm font-semibold drop-shadow-lg backdrop-blur-sm px-3 py-1.5 rounded-full bg-white/15 border border-white/25">
									{isAvailable ? "Live" : "Offline"}
								</span>
							</div>
							<h3 className="text-2xl font-bold text-white mb-2 drop-shadow-lg leading-tight group-hover:text-warning transition-colors duration-300 font-orbitron">
								{gacha.title}
							</h3>
						</div>
						<div className="text-right ml-4">
							<motion.div
								className="text-3xl font-bold text-white drop-shadow-lg mb-2"
								whileHover={{ scale: 1.1 }}
								transition={{ type: "spring", stiffness: 400 }}
							>
								{totalNFTs}
							</motion.div>
							<div className="text-white/90 text-xs uppercase tracking-wider font-medium backdrop-blur-sm px-3 py-1.5 rounded-full bg-white/15 border border-white/20">
								Cards
							</div>
						</div>
					</div>
				</GachaCardHeader>

				{/* Enhanced Content Section */}
				<div className="p-6 relative bg-gradient-to-b from-transparent via-white/2 to-white/5">
					<div className="space-y-5">
						{/* Description */}
						<p className="text-foreground/85 leading-relaxed text-sm font-medium">
							{gacha.description}
						</p>

						{/* Key Stats Row */}
						<div className="flex items-center justify-between p-4 bg-gradient-to-r from-content1/30 via-content1/20 to-content1/30 backdrop-blur-sm rounded-xl border border-white/15 shadow-lg">
							<div className="text-center flex-1">
								<div className="text-sm text-foreground/60 uppercase tracking-wide font-medium mb-1">
									Entry Fee
								</div>
								<div className="text-lg font-bold text-warning">
									{formattedSpinFee}
								</div>
							</div>
							<div className="w-px h-8 bg-white/20 mx-4"></div>
							<div className="text-center flex-1">
								<div className="text-sm text-foreground/60 uppercase tracking-wide font-medium mb-1">
									Collection
								</div>
								<div className="text-lg font-bold text-foreground flex items-center justify-center gap-2">
									<GiftIcon className="w-4 h-4 text-warning" />
									{totalNFTs}
								</div>
							</div>
						</div>

						{/* Compact Rarity Distribution */}
						<div className="space-y-3">
							<div className="text-sm font-semibold text-foreground/80 flex items-center gap-2">
								<ChartBarIcon className="w-4 h-4 text-warning" />
								Rarity Distribution
							</div>
							<div className="flex gap-2">
								{rarityCountsArray.map((count: bigint, index: number) => {
									const rarity = getAllRarities()[index];
									if (!rarity) return null;

									return (
										<motion.div
											key={rarity}
											className="flex-1 text-center"
											whileHover={{ scale: 1.05 }}
											transition={{ type: "spring", stiffness: 400 }}
										>
											<RarityBadge rarity={rarity} showEmoji={true} size="sm" />
											<div className="text-xs text-foreground/70 font-medium mt-1">
												{Number(count)}
											</div>
										</motion.div>
									);
								})}
							</div>
						</div>

						{/* Call to Action */}
						<motion.div
							className="mt-6 p-4 bg-gradient-to-r from-warning/10 via-orange-400/5 to-warning/10 backdrop-blur-sm rounded-xl border border-warning/20 text-center"
							whileHover={{
								borderColor: "rgba(255, 191, 0, 0.4)",
								backgroundColor: "rgba(255, 191, 0, 0.1)",
							}}
							transition={{ duration: 0.2 }}
						>
							<div className="flex items-center justify-center gap-2 text-warning font-semibold">
								<BoltIcon className="w-4 h-4" />
								<span>Click to Explore</span>
								<motion.div
									animate={{ x: [0, 4, 0] }}
									transition={{ duration: 1.5, repeat: Infinity }}
								>
									<ArrowRightIcon className="w-4 h-4" />
								</motion.div>
							</div>
						</motion.div>

						{/* Unavailable Badge */}
						{!isAvailable && (
							<motion.div
								initial={{ opacity: 0, scale: 0.95 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ delay: 0.2 }}
								className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-2xl flex items-center justify-center"
							>
								<Chip className="px-4 py-2 bg-danger/20 border-danger/30 text-danger">
									<XCircleIcon className="w-4 h-4 mr-2" />
									Temporarily Unavailable
								</Chip>
							</motion.div>
						)}
					</div>
				</div>
			</Card>
		</motion.button>
	);
}
