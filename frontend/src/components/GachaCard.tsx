"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { memo, useCallback } from "react";
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
import { ThemedIcon } from "../lib/icons";
import { GlassCard, GlassBadge, GachaCardSkeleton } from "./ui";
import { GachaCardHeader } from "./GachaCardHeader";
import { type GachaConfig } from "../lib/gacha-config";

interface GachaCardProps {
	gacha: GachaConfig;
}

export const GachaCard = memo<GachaCardProps>(({ gacha }) => {
	const router = useRouter();

	// Fetch gacha-specific data
	const { data: isAvailable, isLoading: isAvailableLoading } =
		useReadGachaTreasuryIsGachaAvailable({
			address: gacha.treasuryAddress as `0x${string}`,
		});

	const { data: totalItemsCount, isLoading: isTotalItemsLoading } =
		useReadGachaTreasuryGetTotalItemsCount({
			address: gacha.treasuryAddress as `0x${string}`,
		});

	const { data: rarityCounts, isLoading: isRarityCountsLoading } =
		useReadGachaTreasuryGetAllRarityCounts({
			address: gacha.treasuryAddress as `0x${string}`,
		});

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
		<motion.div
			className="h-full cursor-pointer"
			onClick={handleExplore}
			whileHover={{ scale: 1.02 }}
			whileTap={{ scale: 0.98 }}
			transition={{ type: "spring", stiffness: 300, damping: 20 }}
			role="button"
			tabIndex={0}
			aria-label={`Explore ${gacha.title} gacha with ${totalNFTs} cards available`}
			data-testid={`explore-gacha-${gacha.id}`}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					handleExplore();
				}
			}}
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
									<ThemedIcon name="gem" size="sm" className="text-warning" />
									{totalNFTs}
								</div>
							</div>
						</div>

						{/* Compact Rarity Distribution */}
						<div className="space-y-3">
							<div className="text-sm font-semibold text-foreground/80 flex items-center gap-2">
								<ThemedIcon
									name="trending"
									size="sm"
									className="text-warning"
								/>
								Rarity Distribution
							</div>
							<div className="flex gap-2">
								{rarityCounts?.map((count, index) => {
									const rarityColors = [
										"from-gray-500 to-gray-600",
										"from-green-500 to-green-600",
										"from-blue-500 to-blue-600",
										"from-purple-500 to-purple-600",
										"from-yellow-500 to-yellow-600",
									];
									const rarityEmojis = ["⚪", "🟢", "🔵", "🟣", "🟡"];
									return (
										<motion.div
											key={index}
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
								<ThemedIcon name="zap" size="sm" />
								<span>Click to Explore</span>
								<motion.div
									animate={{ x: [0, 4, 0] }}
									transition={{ duration: 1.5, repeat: Infinity }}
								>
									<ThemedIcon name="arrow-right" size="sm" />
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
									<ThemedIcon name="x-circle" size="sm" className="mr-2" />
									Temporarily Unavailable
								</GlassBadge>
							</motion.div>
						)}
					</div>
				</div>
			</GlassCard>
		</motion.div>
	);
});
GachaCard.displayName = "GachaCard";
