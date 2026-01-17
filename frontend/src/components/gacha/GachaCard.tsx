"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import type { Address } from "viem";
import { formatTokenAmount } from "../../lib/utils";
import {
	useReadGachaTreasuryGetPlatformOverviewBatch,
	useReadGachaGetGachaConfigBatch,
	useReadErc20Symbol,
	useReadErc20Decimals,
} from "../../generated";
import {
	GiftIcon,
	BoltIcon,
	ArrowRightIcon,
	XCircleIcon,
	ChartBarIcon,
} from "@heroicons/react/24/outline";
import { Card, Chip } from "../../ui";
import { GachaCardSkeleton } from "../shared/loading/SkeletonLoader";
import { GachaCardHeader } from "./GachaCardHeader";
import { getAllRarities, getRarityEmoji } from "../../lib/rarityConfig";
import type { GachaConfig } from "../../lib/gacha-config";

interface GachaCardProps {
	gacha: GachaConfig;
}

export function GachaCard({ gacha }: GachaCardProps) {
	const router = useRouter();

	// 🚀 BATCH OPTIMIZED: Get all data in 2 calls instead of 5!
	const treasuryAddress = gacha.treasuryAddress as `0x${string}`;

	// Types based on contract return values
	type PlatformOverviewBatch = readonly [
		rarityCounts: readonly bigint[], // [5]
		totalItems: bigint,
		gachaAvailable: boolean,
		totalDeposited: bigint,
		totalClaimed: bigint,
	];

	type GachaConfigBatch = readonly [
		feeTokenAddr: Address,
		spinFeeAmount: bigint,
		isPaused: boolean,
		rarityWeights: readonly bigint[], // [5]
		totalWeight: bigint,
		isAvailable: boolean,
	];

	const { data: platformData, isLoading: isPlatformLoading } =
		useReadGachaTreasuryGetPlatformOverviewBatch({
			address: treasuryAddress,
		} as Parameters<typeof useReadGachaTreasuryGetPlatformOverviewBatch>[0]);

	const { data: gachaConfig, isLoading: isGachaConfigLoading } =
		useReadGachaGetGachaConfigBatch({
			address: gacha.address as `0x${string}`,
		} as Parameters<typeof useReadGachaGetGachaConfigBatch>[0]);

	// Extract platform data: [rarityCounts[5], totalItems, isGachaAvailable, totalDeposited, totalClaimed]
	const rarityCounts = (platformData as PlatformOverviewBatch)?.[0] || [
		0n,
		0n,
		0n,
		0n,
		0n,
	];
	const totalItemsCount = (platformData as PlatformOverviewBatch)?.[1] || 0n;
	const isAvailable = (platformData as PlatformOverviewBatch)?.[2] || false;

	// Extract gacha config: [feeTokenAddr, spinFeeAmount, isPaused, rarityWeights[5], totalWeight, isAvailable]
	const feeToken = (gachaConfig as GachaConfigBatch)?.[0];
	const spinFee = (gachaConfig as GachaConfigBatch)?.[1] || 0n;

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

	const isLoading = isPlatformLoading || isGachaConfigLoading;

	if (isLoading) {
		return <GachaCardSkeleton />;
	}

	return (
		<motion.button
			className="h-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-warning/50 focus:ring-offset-2 focus:ring-offset-background rounded-2xl"
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
								<span className="text-white text-sm font-semibold drop-shadow-lg backdrop-blur-sm px-3 py-1.5 rounded-full bg-white/20 border border-white/30">
									{isAvailable ? "Live" : "Offline"}
								</span>
							</div>
							<h3 className="text-lg md:text-xl lg:text-2xl font-bold text-white mb-2 drop-shadow-lg leading-tight group-hover:text-warning transition-colors duration-300 font-orbitron">
								{gacha.title}
							</h3>
						</div>
						<div className="text-right ml-4">
							<motion.div
								className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg mb-2"
								whileHover={{ scale: 1.1 }}
								transition={{ type: "spring", stiffness: 400 }}
							>
								{totalNFTs}
							</motion.div>
							<div className="text-white/90 text-xs uppercase tracking-wider font-medium backdrop-blur-sm px-3 py-1.5 rounded-full bg-white/20 border border-white/20">
								Cards
							</div>
						</div>
					</div>
				</GachaCardHeader>

				{/* Compact Content Section */}
				<div className="p-4 relative bg-gradient-to-b from-transparent via-white/2 to-white/5">
					<div className="space-y-4">
						{/* Compact Description */}
						<p className="text-foreground/80 leading-relaxed text-xs font-medium line-clamp-2">
							{gacha.description}
						</p>

						{/* Compact Stats */}
						<div className="flex items-center justify-between p-3 bg-content1/20 backdrop-blur-sm rounded-lg border border-white/10">
							<div className="flex items-center gap-3">
								<div>
									<div className="text-xs text-foreground/60 mb-1">Fee</div>
									<div className="text-sm font-bold text-warning">
										{formattedSpinFee}
									</div>
								</div>
								<div className="w-px h-6 bg-white/20"></div>
								<div>
									<div className="text-xs text-foreground/60 mb-1">Cards</div>
									<div className="text-sm font-bold text-foreground flex items-center gap-1">
										<GiftIcon className="w-3 h-3 text-warning" />
										{totalNFTs}
									</div>
								</div>
							</div>
						</div>

						{/* Compact Rarity Distribution */}
						<div className="space-y-2">
							<div className="text-xs font-semibold text-foreground/70 flex items-center gap-1">
								<ChartBarIcon className="w-3 h-3 text-warning" />
								Rarities
							</div>
							<div className="grid grid-cols-5 gap-1">
								{getAllRarities().map((rarity, index) => {
									const count = rarityCountsArray[index] || 0n;
									const hasCards = count > 0n;

									return (
										<div
											key={rarity}
											className="text-center p-1 rounded bg-content1/10 border border-white/5"
										>
											<div
												className={`text-lg mb-1 ${hasCards ? "opacity-100" : "opacity-30"}`}
											>
												{getRarityEmoji(rarity)}
											</div>
											<div className="text-xs text-foreground/60 font-medium">
												{Number(count)}
											</div>
										</div>
									);
								})}
							</div>
						</div>

						{/* Compact CTA */}
						<motion.div
							className="p-3 bg-gradient-to-r from-warning/10 to-orange-400/10 backdrop-blur-sm rounded-lg border border-warning/20 text-center"
							whileHover={{
								borderColor: "rgba(255, 191, 0, 0.4)",
								backgroundColor: "rgba(255, 191, 0, 0.1)",
							}}
							transition={{ duration: 0.2 }}
						>
							<div className="flex items-center justify-center gap-2 text-warning font-semibold text-sm">
								<BoltIcon className="w-3 h-3" />
								<span>Explore</span>
								<motion.div
									animate={{ x: [0, 3, 0] }}
									transition={{
										duration: 1.5,
										repeat: Infinity,
									}}
								>
									<ArrowRightIcon className="w-3 h-3" />
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
								<Chip
									startContent={<XCircleIcon className="w-3 h-3" />}
									className="px-3 py-1 bg-danger/20 border-danger/30 text-danger text-sm"
								>
									Offline
								</Chip>
							</motion.div>
						)}
					</div>
				</div>
			</Card>
		</motion.button>
	);
}
