"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { formatTokenAmount } from "../lib/utils";
import {
	useReadGachaTreasuryIsGachaAvailable,
	useReadGachaTreasuryGetAllRarityCounts,
	useReadGachaTreasuryGetTotalItemsCount,
	useReadGachaSpinFee,
	useReadGachaFeeToken,
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
import { GlassCard, GlassBadge, GachaCardSkeleton } from "./ui";
import { GachaCardHeader } from "./GachaCardHeader";
import type { GachaConfig } from "../lib/gacha-config";

interface GachaCardProps {
	gacha: GachaConfig;
}

export function GachaCard({ gacha }: GachaCardProps) {
	const router = useRouter();

	// Fetch gacha-specific data
	const treasuryAddress = gacha.treasuryAddress as `0x${string}`;
	const { data: isAvailable, isLoading: isAvailableLoading } =
		useReadGachaTreasuryIsGachaAvailable({
			address: treasuryAddress,
		} as Parameters<typeof useReadGachaTreasuryIsGachaAvailable>[0]);

	const { data: totalItemsCount, isLoading: isTotalItemsLoading } =
		useReadGachaTreasuryGetTotalItemsCount({
			address: treasuryAddress,
		} as Parameters<typeof useReadGachaTreasuryGetTotalItemsCount>[0]);

	const { data: rarityCounts, isLoading: isRarityCountsLoading } =
		useReadGachaTreasuryGetAllRarityCounts({
			address: treasuryAddress,
		} as Parameters<typeof useReadGachaTreasuryGetAllRarityCounts>[0]);

	const { data: spinFee, isLoading: isSpinFeeLoading } = useReadGachaSpinFee({
		address: gacha.address as `0x${string}`,
	});

	const { data: feeToken } = useReadGachaFeeToken({
		address: gacha.address as `0x${string}`,
	});

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
	const isLoading =
		isAvailableLoading ||
		isRarityCountsLoading ||
		isSpinFeeLoading ||
		isTotalItemsLoading;

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
			<GlassCard
				variant="interactive"
				padding="none"
				animate={false}
				className="h-full overflow-hidden group border border-white/10 hover:border-warning/30 transition-all duration-300"
			>
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
									transition={{ duration: 2, repeat: Infinity }}
									aria-hidden="true"
								></motion.div>
								<span className="text-white/95 text-sm font-semibold drop-shadow-lg backdrop-blur-sm px-3 py-1.5 rounded-full bg-white/15 border border-white/25">
									{isAvailable ? "Live" : "Offline"}
								</span>
							</div>
							<h3 className="text-2xl font-bold text-white mb-2 drop-shadow-lg leading-tight group-hover:text-warning transition-colors duration-300">
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
									const rarityColors = [
										"from-rarity-common-500 to-rarity-common-600",
										"from-rarity-uncommon-500 to-rarity-uncommon-600",
										"from-rarity-rare-500 to-rarity-rare-600",
										"from-rarity-epic-500 to-rarity-epic-600",
										"from-rarity-legendary-500 to-rarity-legendary-600",
									];
									const rarityKeys = [
										"common",
										"uncommon",
										"rare",
										"epic",
										"legendary",
									];
									const rarityEmojis = ["⚪", "🟢", "🔵", "🟣", "🟠"];
									return (
										<motion.div
											key={rarityKeys[index]}
											className="flex-1 text-center"
											whileHover={{ scale: 1.05 }}
											transition={{ type: "spring", stiffness: 400 }}
										>
											<div className="text-lg mb-1">{rarityEmojis[index]}</div>
											<div
												className={`h-2 bg-gradient-to-r ${rarityColors[index]} rounded-full mb-1 shadow-sm`}
											></div>
											<div className="text-xs text-foreground/70 font-medium">
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
								<GlassBadge variant="danger" className="text-lg px-4 py-2">
									<XCircleIcon className="w-4 h-4 mr-2" />
									Temporarily Unavailable
								</GlassBadge>
							</motion.div>
						)}
					</div>
				</div>
			</GlassCard>
		</motion.button>
	);
}
