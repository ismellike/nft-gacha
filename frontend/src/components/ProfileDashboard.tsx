"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAccount } from "wagmi";
import { formatTokenAmount } from "../lib/utils";
import { getRarityConfig } from "../lib/rarityConfig";
import { Card, Button } from "../ui";
import { CardRewardsList } from "./CardRewardsList";
import { NFTWithdrawal } from "./NFTWithdrawal";
import { glassTypography } from "../lib/theme-config";
import {
	useReadGachaTreasuryGetUserProfileBatch,
	useReadGachaGetUserGachaBatch,
} from "../generated";
import { useGachaContracts } from "../hooks/useGachaContracts";
import { useGachaId } from "../hooks/useGachaId";
import { useRegisterRewardsRefetch } from "../hooks/useRewardsData";
import {
	UserCircleIcon,
	SparklesIcon,
	GiftIcon,
	CurrencyDollarIcon,
	ClockIcon,
	TrophyIcon,
	ArrowLeftOnRectangleIcon,
} from "@heroicons/react/24/outline";

export const ProfileDashboard: React.FC = () => {
	const { address: userAddress } = useAccount();
	const gachaId = useGachaId();
	const contracts = useGachaContracts(gachaId);
	const [activeTab, setActiveTab] = useState<"rewards" | "withdrawal">("rewards");

	// 🚀 BATCH OPTIMIZED: Get all user data in 2 calls instead of 3!
	const { data: userProfileData, refetch: refetchUserProfile } =
		useReadGachaTreasuryGetUserProfileBatch({
			address: contracts.treasury as `0x${string}` | undefined,
			args: userAddress ? [userAddress] : undefined,
			query: { enabled: !!contracts.treasury && !!userAddress },
		} as Parameters<typeof useReadGachaTreasuryGetUserProfileBatch>[0]);

	const { data: userGachaData, refetch: refetchUserGacha } =
		useReadGachaGetUserGachaBatch({
			address: contracts.gacha as `0x${string}` | undefined,
			args: userAddress ? [userAddress] : undefined,
			query: { enabled: !!contracts.gacha && !!userAddress },
		} as Parameters<typeof useReadGachaGetUserGachaBatch>[0]);

	// Register refetch functions with the rewards system
	useRegisterRewardsRefetch("userProfile", refetchUserProfile);
	useRegisterRewardsRefetch("userGacha", refetchUserGacha);

	// Extract data from batch calls
	// userProfileData: [depositCounts[5], totalDeposits, lifetimeClaimed, lifetimeDeposited, lifetimeWithdrawn, netContribution]
	const userTotalDeposits = (userProfileData as any)?.[1] || 0n;
	const lifetimeClaimed = (userProfileData as any)?.[2] || 0n;

	// userGachaData: [totalSpins, totalRefunds, totalReclaims, rarityWins[5], spinCount]
	const userSpinCount = (userGachaData as any)?.[0] || BigInt(0);
	const userRefundCount = (userGachaData as any)?.[1] || BigInt(0);
	const userReclaimCount = (userGachaData as any)?.[2] || BigInt(0);
	const userRarityWins = (userGachaData as any)?.[3] || [
		BigInt(0),
		BigInt(0),
		BigInt(0),
		BigInt(0),
		BigInt(0),
	];

	if (!userAddress) {
		return (
			<div className="flex items-center justify-center min-h-[60vh]">
				<motion.div
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.5 }}
				>
					<Card className="text-center p-12 max-w-md bg-content1/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
						<UserCircleIcon className="w-20 h-20 mx-auto mb-6 text-foreground/30" />
						<h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
							Connect Wallet
						</h2>
						<p className="text-foreground/60 leading-relaxed">
							Connect your wallet to view your profile, track rewards, and
							manage your NFT collection.
						</p>
					</Card>
				</motion.div>
			</div>
		);
	}

	const totalDeposits = Number(userTotalDeposits);

	return (
		<div className="max-w-7xl mx-auto space-y-8">
			{/* Tab Navigation */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
			>
				<Card className="p-2 bg-content1/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl">
					<div className="flex space-x-2">
						<Button
							className={`flex-1 rounded-xl transition-all duration-300 ${
								activeTab === "rewards"
									? "bg-gradient-to-r from-primary to-secondary text-white shadow-lg"
									: "bg-content2/20 text-foreground/70 hover:bg-content2/30"
							}`}
							onPress={() => setActiveTab("rewards")}
							variant="light"
						>
							<span className="flex items-center justify-center gap-2">
								<TrophyIcon className="w-4 h-4" />
								Rewards
							</span>
						</Button>
						<Button
							className={`flex-1 rounded-xl transition-all duration-300 ${
								activeTab === "withdrawal"
									? "bg-gradient-to-r from-primary to-secondary text-white shadow-lg"
									: "bg-content2/20 text-foreground/70 hover:bg-content2/30"
							}`}
							onPress={() => setActiveTab("withdrawal")}
							variant="light"
						>
							<span className="flex items-center justify-center gap-2">
								<ArrowLeftOnRectangleIcon className="w-4 h-4" />
								Withdraw NFTs
							</span>
						</Button>
					</div>
				</Card>
			</motion.div>

			{/* Enhanced Stats Grid */}
			<div className="grid md:grid-cols-3 gap-6">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.1 }}
				>
					<Card className="p-6 hover:bg-content2/30 transition-colors bg-content1/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl">
						<div className="flex items-center justify-between mb-4">
							<div className="w-12 h-12 bg-gradient-to-br from-rarity-rare-500/20 to-rarity-rare-600/20 rounded-lg flex items-center justify-center">
								<SparklesIcon className="w-6 h-6 text-rarity-rare-300" />
							</div>
							<div className="text-right">
								<div className="text-2xl font-bold text-rarity-rare-300">
									{userSpinCount ? Number(userSpinCount).toLocaleString() : "0"}
								</div>
								<div className="text-sm text-foreground/60">Total Spins</div>
							</div>
						</div>
						<div className="w-full bg-content2/30 rounded-full h-2">
							<div
								className="bg-gradient-to-r from-rarity-rare-500 to-rarity-rare-400 h-2 rounded-full"
								style={{
									width: `${Math.min(Number(userSpinCount || 0) * 2, 100)}%`,
								}}
							/>
						</div>
					</Card>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.2 }}
				>
					<Card className="p-6 hover:bg-content2/30 transition-colors bg-content1/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl">
						<div className="flex items-center justify-between mb-4">
							<div className="w-12 h-12 bg-gradient-to-br from-rarity-uncommon-500/20 to-rarity-uncommon-600/20 rounded-lg flex items-center justify-center">
								<GiftIcon className="w-6 h-6 text-rarity-uncommon-300" />
							</div>
							<div className="text-right">
								<div className="text-2xl font-bold text-rarity-uncommon-300">
									{totalDeposits.toLocaleString()}
								</div>
								<div className="text-sm text-foreground/60">NFTs Deposited</div>
							</div>
						</div>
						<div className="w-full bg-content2/30 rounded-full h-2">
							<div
								className="bg-gradient-to-r from-rarity-uncommon-500 to-rarity-uncommon-400 h-2 rounded-full"
								style={{ width: `${Math.min(totalDeposits * 3, 100)}%` }}
							/>
						</div>
					</Card>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.3 }}
				>
					<Card className="p-6 hover:bg-content2/30 transition-colors bg-content1/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl">
						<div className="flex items-center justify-between mb-4">
							<div className="w-12 h-12 bg-gradient-to-br from-rarity-legendary-500/20 to-rarity-legendary-600/20 rounded-lg flex items-center justify-center">
								<CurrencyDollarIcon className="w-6 h-6 text-rarity-legendary-300" />
							</div>
							<div className="text-right">
								<div className="text-2xl font-bold text-rarity-legendary-300">
									{lifetimeClaimed
										? formatTokenAmount(lifetimeClaimed, 18, { maxDecimals: 2 })
										: "0"}
								</div>
								<div className="text-sm text-foreground/60">
									Lifetime Claimed
								</div>
							</div>
						</div>
						<div className="w-full bg-content2/30 rounded-full h-2">
							<div
								className="bg-gradient-to-r from-rarity-legendary-500 to-rarity-legendary-400 h-2 rounded-full"
								style={{
									width: `${lifetimeClaimed && lifetimeClaimed > 0n ? 100 : 0}%`,
								}}
							/>
						</div>
						<div className="mt-2 text-xs text-foreground/50">
							Total rewards claimed across all time
						</div>
					</Card>
				</motion.div>
			</div>

			{/* Dynamic Content Section */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6, delay: 0.5 }}
			>
				{activeTab === "rewards" ? <CardRewardsList /> : <NFTWithdrawal />}
			</motion.div>

			{/* Advanced Statistics */}
			{(userRefundCount > BigInt(0) || userReclaimCount > BigInt(0)) && (
				<div className="grid md:grid-cols-2 gap-6">
					{userRefundCount > BigInt(0) && (
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.5 }}
						>
							<Card className="p-6 border border-warning/30 bg-content1/20 backdrop-blur-xl rounded-2xl shadow-xl">
								<div className="flex items-center justify-between mb-4">
									<div className="w-12 h-12 bg-gradient-to-br from-warning/20 to-warning/30 rounded-lg flex items-center justify-center">
										<SparklesIcon className="w-6 h-6 text-warning" />
									</div>
									<div className="text-right">
										<div className="text-2xl font-bold text-warning">
											{Number(userRefundCount).toLocaleString()}
										</div>
										<div className="text-sm text-foreground/60">
											Refunded Spins
										</div>
									</div>
								</div>
								<div className="text-xs text-foreground/70 leading-relaxed">
									Spins automatically refunded when selected rarity pools were
									empty
								</div>
							</Card>
						</motion.div>
					)}

					{userReclaimCount > BigInt(0) && (
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.6 }}
						>
							<Card className="p-6 border border-danger/30 bg-content1/20 backdrop-blur-xl rounded-2xl shadow-xl">
								<div className="flex items-center justify-between mb-4">
									<div className="w-12 h-12 bg-gradient-to-br from-danger/20 to-danger/30 rounded-lg flex items-center justify-center">
										<ClockIcon className="w-6 h-6 text-danger" />
									</div>
									<div className="text-right">
										<div className="text-2xl font-bold text-danger">
											{Number(userReclaimCount).toLocaleString()}
										</div>
										<div className="text-sm text-foreground/60">
											Reclaimed Spins
										</div>
									</div>
								</div>
								<div className="text-xs text-foreground/70 leading-relaxed">
									Spins manually reclaimed due to timeout or service issues
								</div>
							</Card>
						</motion.div>
					)}
				</div>
			)}

			{/* Rarity Wins Breakdown */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6, delay: 0.7 }}
			>
				<Card className="p-8 bg-content1/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
					<h2
						className={`${glassTypography({ variant: "mainHeading" })} mb-8 text-center`}
					>
						<TrophyIcon className="w-6 h-6 inline mr-2" />
						Rarity Win Statistics
					</h2>

					<div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
						{[0, 1, 2, 3, 4].map((rarity, index) => {
							const config = getRarityConfig(rarity as 0 | 1 | 2 | 3 | 4);
							const winCount = Number(userRarityWins[index] || 0);
							const totalSpins = Number(userSpinCount);
							const winRate =
								totalSpins > 0
									? ((winCount / totalSpins) * 100).toFixed(1)
									: "0.0";

							return (
								<motion.div
									key={rarity}
									initial={{ opacity: 0, scale: 0.95 }}
									animate={{ opacity: 1, scale: 1 }}
									transition={{ duration: 0.5, delay: 0.1 * index }}
								>
									<div className="group relative">
										<div
											className={`absolute inset-0 bg-gradient-to-br ${config.bgGradient} rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300 blur-sm`}
										/>

										<div
											className={`relative bg-content2/20 border ${config.borderColor} rounded-xl p-4 hover:bg-content2/30 transition-all duration-300`}
										>
											<div className="text-center">
												<div className="text-3xl mb-2">{config.emoji}</div>
												<div
													className={`font-bold text-sm ${config.textColor} mb-2`}
												>
													{config.name}
												</div>
												<div className="text-2xl font-bold mb-1">
													{winCount.toLocaleString()}
												</div>
												<div className="text-xs text-foreground/60 mb-2">
													Wins
												</div>
												<div
													className={`text-sm font-medium ${config.textColor}`}
												>
													{winRate}% rate
												</div>
											</div>
										</div>
									</div>
								</motion.div>
							);
						})}
					</div>
				</Card>
			</motion.div>

			{/* Rewards by Rarity removed in favor of Rewards by Card */}
		</div>
	);
};

// RarityRewardCard removed
