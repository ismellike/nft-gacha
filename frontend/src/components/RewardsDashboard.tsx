"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardBody } from "@heroui/react";
import { useAccount } from "wagmi";
import { formatUnits } from "viem";
import {
	useReadGachaRewardsManagerGetUserTotalClaimableRewards,
	useReadGachaRewardsManagerGetUserRarityClaimableRewards,
	useReadGachaRewardsManagerGetUserAnalytics,
	useReadGachaRewardsManagerGetGlobalAnalytics,
	useReadGachaTreasuryGetUserAllDepositCounts,
	useReadErc20Decimals,
	useReadErc20Symbol,
	useWriteGachaRewardsManagerClaimAllRewards,
	useReadGachaFeeToken,
} from "../generated";
import { env } from "../env";
import { RARITY_CONFIG, Rarity } from "../lib/rarityConfig";
import { ThemedIcon } from "../lib/icons";
import { GlassCard, GlassButton, GlassBadge } from "./ui";

interface RarityReward {
	rarity: string;
	amount: string;
	deposits: number;
	emoji: string;
	color: string;
}

export default function RewardsDashboard() {
	const { address: userAddress, isConnected } = useAccount();
	const [refreshKey, setRefreshKey] = useState(0);

	// Contract reads
	const { data: feeToken } = useReadGachaFeeToken({
		address: env.NEXT_PUBLIC_GACHA_CONTRACT_ADDRESS,
	});

	const { data: tokenDecimals } = useReadErc20Decimals({
		address: feeToken,
		query: { enabled: !!feeToken },
	});

	const { data: tokenSymbol } = useReadErc20Symbol({
		address: feeToken,
		query: { enabled: !!feeToken },
	});

	const { data: userAnalytics, refetch: refetchUserAnalytics } =
		useReadGachaRewardsManagerGetUserAnalytics({
			address: env.NEXT_PUBLIC_REWARDS_MANAGER_ADDRESS,
			args: userAddress ? [userAddress] : undefined,
			query: { enabled: !!userAddress },
		});

	const { data: globalAnalytics } =
		useReadGachaRewardsManagerGetGlobalAnalytics({
			address: env.NEXT_PUBLIC_REWARDS_MANAGER_ADDRESS,
		});

	const { data: totalClaimable, refetch: refetchClaimable } =
		useReadGachaRewardsManagerGetUserTotalClaimableRewards({
			address: env.NEXT_PUBLIC_REWARDS_MANAGER_ADDRESS,
			args: userAddress ? [userAddress] : undefined,
			query: { enabled: !!userAddress },
		});

	const { data: depositCounts } = useReadGachaTreasuryGetUserAllDepositCounts({
		address: env.NEXT_PUBLIC_TREASURY_CONTRACT_ADDRESS,
		args: userAddress ? [userAddress] : undefined,
		query: { enabled: !!userAddress },
	});

	// Individual rarity claimable amounts
	const { data: commonClaimable } =
		useReadGachaRewardsManagerGetUserRarityClaimableRewards({
			address: env.NEXT_PUBLIC_REWARDS_MANAGER_ADDRESS,
			args: userAddress ? [userAddress, 0] : undefined, // 0 = Common
			query: { enabled: !!userAddress },
		});

	const { data: uncommonClaimable } =
		useReadGachaRewardsManagerGetUserRarityClaimableRewards({
			address: env.NEXT_PUBLIC_REWARDS_MANAGER_ADDRESS,
			args: userAddress ? [userAddress, 1] : undefined, // 1 = Uncommon
			query: { enabled: !!userAddress },
		});

	const { data: rareClaimable } =
		useReadGachaRewardsManagerGetUserRarityClaimableRewards({
			address: env.NEXT_PUBLIC_REWARDS_MANAGER_ADDRESS,
			args: userAddress ? [userAddress, 2] : undefined, // 2 = Rare
			query: { enabled: !!userAddress },
		});

	const { data: epicClaimable } =
		useReadGachaRewardsManagerGetUserRarityClaimableRewards({
			address: env.NEXT_PUBLIC_REWARDS_MANAGER_ADDRESS,
			args: userAddress ? [userAddress, 3] : undefined, // 3 = Epic
			query: { enabled: !!userAddress },
		});

	const { data: legendaryClaimable } =
		useReadGachaRewardsManagerGetUserRarityClaimableRewards({
			address: env.NEXT_PUBLIC_REWARDS_MANAGER_ADDRESS,
			args: userAddress ? [userAddress, 4] : undefined, // 4 = Legendary
			query: { enabled: !!userAddress },
		});

	// Claim rewards mutation
	const {
		writeContract: claimRewards,
		isPending: isClaimPending,
		isSuccess: isClaimSuccess,
		error: claimError,
	} = useWriteGachaRewardsManagerClaimAllRewards();

	// Format token amounts
	const formatTokenAmount = (amount: bigint | undefined) => {
		if (!amount || !tokenDecimals) return "0";
		return formatUnits(amount, tokenDecimals);
	};

	// Prepare rarity rewards data using official config
	const rarityRewards: RarityReward[] = [
		{
			rarity: RARITY_CONFIG[Rarity.Common].name,
			amount: formatTokenAmount(commonClaimable),
			deposits: depositCounts ? Number(depositCounts[0]) : 0,
			emoji: RARITY_CONFIG[Rarity.Common].emoji,
			color: RARITY_CONFIG[Rarity.Common].bgGradient,
		},
		{
			rarity: RARITY_CONFIG[Rarity.Uncommon].name,
			amount: formatTokenAmount(uncommonClaimable),
			deposits: depositCounts ? Number(depositCounts[1]) : 0,
			emoji: RARITY_CONFIG[Rarity.Uncommon].emoji,
			color: RARITY_CONFIG[Rarity.Uncommon].bgGradient,
		},
		{
			rarity: RARITY_CONFIG[Rarity.Rare].name,
			amount: formatTokenAmount(rareClaimable),
			deposits: depositCounts ? Number(depositCounts[2]) : 0,
			emoji: RARITY_CONFIG[Rarity.Rare].emoji,
			color: RARITY_CONFIG[Rarity.Rare].bgGradient,
		},
		{
			rarity: RARITY_CONFIG[Rarity.Epic].name,
			amount: formatTokenAmount(epicClaimable),
			deposits: depositCounts ? Number(depositCounts[3]) : 0,
			emoji: RARITY_CONFIG[Rarity.Epic].emoji,
			color: RARITY_CONFIG[Rarity.Epic].bgGradient,
		},
		{
			rarity: RARITY_CONFIG[Rarity.Legendary].name,
			amount: formatTokenAmount(legendaryClaimable),
			deposits: depositCounts ? Number(depositCounts[4]) : 0,
			emoji: RARITY_CONFIG[Rarity.Legendary].emoji,
			color: RARITY_CONFIG[Rarity.Legendary].bgGradient,
		},
	];

	// Handle claim success
	useEffect(() => {
		if (isClaimSuccess) {
			setRefreshKey((prev) => prev + 1);
			refetchUserAnalytics();
			refetchClaimable();
		}
	}, [isClaimSuccess, refetchUserAnalytics, refetchClaimable]);

	const handleClaimRewards = () => {
		if (!userAddress) return;
		claimRewards({
			address: env.NEXT_PUBLIC_REWARDS_MANAGER_ADDRESS,
		});
	};

	if (!isConnected) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<Card className="bg-content1/20 backdrop-blur-xl border border-white/10 shadow-2xl">
					<CardBody className="text-center p-8">
						<h3 className="text-xl font-light text-foreground mb-4">
							Connect Your Wallet
						</h3>
						<p className="text-foreground/70">
							Connect your wallet to view your rewards dashboard
						</p>
					</CardBody>
				</Card>
			</div>
		);
	}

	return (
		<div className="space-y-8">
			{/* Header */}
			<motion.div
				className="text-center"
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6 }}
			>
				<h2 className="text-4xl font-light mb-4 tracking-tight">
					<span className="bg-gradient-to-r from-foreground to-warning bg-clip-text text-transparent">
						Rewards Dashboard
					</span>
				</h2>
				<p className="text-xl text-foreground/70 max-w-2xl mx-auto leading-relaxed font-light">
					Track your NFT deposits and accumulated rewards with elegant
					transparency
				</p>
			</motion.div>

			{/* Summary Cards */}
			<div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{/* Total Claimable */}
				<motion.div
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ delay: 0.1, duration: 0.6 }}
				>
					<GlassCard variant="floating" animate={true} padding="lg">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-foreground/60 uppercase tracking-wide font-medium">
									Available to Claim
								</p>
								<h3 className="text-3xl font-bold bg-gradient-to-r from-warning to-orange-400 bg-clip-text text-transparent mt-2">
									{formatTokenAmount(totalClaimable)} {tokenSymbol || "TOKENS"}
								</h3>
							</div>
							<div className="w-16 h-16 bg-gradient-to-br from-warning/20 to-orange-400/20 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center">
								<ThemedIcon name="coins" size="xl" variant="accent" />
							</div>
						</div>
					</GlassCard>
				</motion.div>

				{/* Total Claimed */}
				<motion.div
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ delay: 0.2, duration: 0.6 }}
				>
					<GlassCard variant="floating" animate={true} padding="lg">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-foreground/60 uppercase tracking-wide font-medium">
									Total Claimed
								</p>
								<h3 className="text-3xl font-bold text-foreground mt-2">
									{userAnalytics ? formatTokenAmount(userAnalytics[0]) : "0"}{" "}
									{tokenSymbol || "TOKENS"}
								</h3>
							</div>
							<div className="w-16 h-16 bg-gradient-to-br from-green-400/20 to-green-600/20 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center">
								<ThemedIcon name="check" size="xl" variant="success" />
							</div>
						</div>
					</GlassCard>
				</motion.div>

				{/* Total Deposits */}
				<motion.div
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ delay: 0.3, duration: 0.6 }}
				>
					<GlassCard variant="floating" animate={true} padding="lg">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-foreground/60 uppercase tracking-wide font-medium">
									NFTs Deposited
								</p>
								<h3 className="text-3xl font-bold text-foreground mt-2">
									{depositCounts
										? depositCounts.reduce(
												(sum, count) => sum + Number(count),
												0,
											)
										: 0}
								</h3>
							</div>
							<div className="w-16 h-16 bg-gradient-to-br from-purple-400/20 to-purple-600/20 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center">
								<ThemedIcon name="gem" size="xl" className="text-purple-400" />
							</div>
						</div>
					</GlassCard>
				</motion.div>
			</div>

			{/* Rarity Breakdown */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.4, duration: 0.6 }}
			>
				<GlassCard
					variant="base"
					padding="none"
					header={
						<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-4">
							<h3 className="text-2xl font-light text-foreground tracking-tight">
								Rewards by Rarity
							</h3>
							<GlassButton
								size="lg"
								variant="primary"
								className="w-full sm:w-auto"
								isLoading={isClaimPending}
								loadingText="Claiming..."
								onClick={handleClaimRewards}
								isDisabled={!totalClaimable || totalClaimable === BigInt(0)}
								animate={true}
							>
								Claim All Rewards
							</GlassButton>
						</div>
					}
				>
					{/* Desktop/Tablet: Horizontal Layout */}
					<div className="hidden sm:block pt-8 pb-4">
						<div className="flex flex-wrap gap-4 justify-center">
							{rarityRewards.map((rarity, index) => (
								<motion.div
									key={rarity.rarity}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.5 + index * 0.1, duration: 0.6 }}
									className="relative group flex-1 min-w-[180px] max-w-[220px]"
								>
									{/* Background glow */}
									<div
										className={`absolute -inset-2 bg-gradient-to-r ${rarity.color} rounded-xl blur-md opacity-20 group-hover:opacity-30 transition-opacity duration-300`}
									/>

									{/* Card */}
									<div className="relative bg-gradient-to-br from-content1/40 via-background/95 to-content1/30 backdrop-blur-xl rounded-xl border border-white/20 p-4 shadow-xl h-full">
										<div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-xl" />

										<div className="relative z-10 text-center space-y-3">
											{/* Rarity badge */}
											<div className="inline-flex items-center gap-2 px-2 py-1 bg-gradient-to-r from-content1/50 to-content1/30 backdrop-blur-xl border border-white/30 rounded-full">
												<span className="text-sm">{rarity.emoji}</span>
												<span className="text-xs font-medium text-foreground">
													{rarity.rarity}
												</span>
											</div>

											{/* Stats in compact layout */}
											<div className="space-y-2">
												<div>
													<p className="text-xs text-foreground/60 uppercase tracking-wide">
														Deposits
													</p>
													<p className="text-lg font-bold text-foreground">
														{rarity.deposits}
													</p>
												</div>
												<div>
													<p className="text-xs text-foreground/60 uppercase tracking-wide">
														Claimable
													</p>
													<p
														className={`text-sm font-semibold bg-gradient-to-r ${rarity.color} bg-clip-text text-transparent`}
													>
														{parseFloat(rarity.amount).toFixed(2)} {tokenSymbol}
													</p>
												</div>
											</div>
										</div>
									</div>
								</motion.div>
							))}
						</div>
					</div>

					{/* Mobile: Vertical List Layout */}
					<div className="block sm:hidden space-y-3 pt-6 pb-2">
						{rarityRewards.map((rarity, index) => (
							<motion.div
								key={rarity.rarity}
								initial={{ opacity: 0, x: -20 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: 0.5 + index * 0.1, duration: 0.6 }}
								className="relative group"
							>
								{/* Background glow */}
								<div
									className={`absolute -inset-1 bg-gradient-to-r ${rarity.color} rounded-lg blur-sm opacity-20 group-hover:opacity-30 transition-opacity duration-300`}
								/>

								{/* Card */}
								<div className="relative bg-gradient-to-r from-content1/40 to-content1/20 backdrop-blur-xl rounded-lg border border-white/20 p-4 shadow-lg">
									<div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-lg" />

									<div className="relative z-10 flex items-center justify-between">
										{/* Left side - Rarity info */}
										<div className="flex items-center gap-3">
											<div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-content1/50 to-content1/30 backdrop-blur-xl border border-white/30 rounded-full">
												<span className="text-sm">{rarity.emoji}</span>
												<span className="text-sm font-medium text-foreground">
													{rarity.rarity}
												</span>
											</div>
										</div>

										{/* Right side - Stats */}
										<div className="flex items-center gap-6 text-right">
											<div>
												<p className="text-xs text-foreground/60 uppercase tracking-wide">
													Deposits
												</p>
												<p className="text-lg font-bold text-foreground">
													{rarity.deposits}
												</p>
											</div>
											<div>
												<p className="text-xs text-foreground/60 uppercase tracking-wide">
													Claimable
												</p>
												<p
													className={`text-sm font-semibold bg-gradient-to-r ${rarity.color} bg-clip-text text-transparent`}
												>
													{parseFloat(rarity.amount).toFixed(2)} {tokenSymbol}
												</p>
											</div>
										</div>
									</div>
								</div>
							</motion.div>
						))}
					</div>
				</GlassCard>
			</motion.div>

			{/* Error Display */}
			<AnimatePresence>
				{claimError && (
					<motion.div
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.95 }}
						className="fixed bottom-8 right-8 z-50"
					>
						<Card className="bg-danger/10 border border-danger/20 shadow-xl backdrop-blur-xl">
							<CardBody className="p-4">
								<p className="text-danger text-sm">
									Failed to claim rewards. Please try again.
								</p>
							</CardBody>
						</Card>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Global Platform Statistics */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.8, duration: 0.6 }}
			>
				<Card className="bg-content1/10 backdrop-blur-xl border border-white/5 shadow-xl">
					<CardBody className="p-6">
						<h4 className="text-lg font-light text-foreground/80 mb-4">
							Platform Statistics
						</h4>
						<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
							<div>
								<p className="text-2xl font-bold text-foreground">
									{globalAnalytics ? globalAnalytics[0].toString() : "0"}
								</p>
								<p className="text-sm text-foreground/60">Total Spins</p>
							</div>
							<div>
								<p className="text-2xl font-bold text-foreground">
									{globalAnalytics
										? formatTokenAmount(globalAnalytics[1])
										: "0"}{" "}
									{tokenSymbol}
								</p>
								<p className="text-sm text-foreground/60">Total Distributed</p>
							</div>
							<div>
								<p className="text-2xl font-bold text-foreground">
									{globalAnalytics
										? formatTokenAmount(globalAnalytics[2])
										: "0"}{" "}
									{tokenSymbol}
								</p>
								<p className="text-sm text-foreground/60">Protocol Fees</p>
							</div>
						</div>
					</CardBody>
				</Card>
			</motion.div>
		</div>
	);
}
