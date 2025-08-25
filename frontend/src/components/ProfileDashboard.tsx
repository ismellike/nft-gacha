"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";
import { useAccount } from "wagmi";
import { formatTokenAmount } from "../lib/utils";
import { Rarity, getRarityConfig, getAllRarities } from "../lib/rarityConfig";
import { GlassCard, GlassButton } from "./ui";
import { glassTypography } from "../lib/theme-config";
import {
	useReadGachaRewardsManagerGetUserAnalytics,
	useReadGachaTreasuryGetUserAllDepositCounts,
	useReadGachaRewardsManagerGetUserRarityClaimableRewards,
	useReadGachaFeeToken,
	useReadErc20Symbol,
	useReadErc20Decimals,
} from "../generated";
import { useGachaContracts } from "../hooks/useGachaContracts";
import { useGachaId } from "../hooks/useGachaId";
import {
	UserCircleIcon,
	SparklesIcon,
	GiftIcon,
	CurrencyDollarIcon,
	ClockIcon,
} from "@heroicons/react/24/outline";

export const ProfileDashboard: React.FC = () => {
	const { address: userAddress } = useAccount();
	const gachaId = useGachaId();
	const contracts = useGachaContracts(gachaId);

	// Fee token info
	const { data: feeTokenAddress } = useReadGachaFeeToken({
		address: contracts.gacha!,
		query: { enabled: !!contracts.gacha },
	});

	const { data: tokenSymbol } = useReadErc20Symbol({
		address: feeTokenAddress!,
		query: { enabled: !!feeTokenAddress },
	});

	const { data: tokenDecimals } = useReadErc20Decimals({
		address: feeTokenAddress!,
		query: { enabled: !!feeTokenAddress },
	});

	// Use the same getUserAnalytics function that the main gacha page uses
	const { data: userAnalytics } = useReadGachaRewardsManagerGetUserAnalytics({
		address: contracts.rewardsManager!,
		args: userAddress ? [userAddress] : undefined,
		query: { enabled: !!contracts.rewardsManager && !!userAddress },
	});

	const { data: userDepositCounts } = useReadGachaTreasuryGetUserAllDepositCounts({
		address: contracts.treasury!,
		args: userAddress ? [userAddress] : undefined,
		query: { enabled: !!contracts.treasury && !!userAddress },
	});

	// Extract values from userAnalytics tuple: [totalClaimed, totalClaimable, spinCount]
	const totalRewardsClaimed = userAnalytics?.[0] || BigInt(0);
	const totalClaimableRewards = userAnalytics?.[1] || BigInt(0);
	const userSpinCount = userAnalytics?.[2] || BigInt(0);

	if (!userAddress) {
		return (
			<div className="flex items-center justify-center min-h-[60vh]">
				<motion.div
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.5 }}
				>
					<GlassCard className="text-center p-12 max-w-md">
						<UserCircleIcon className="w-20 h-20 mx-auto mb-6 text-foreground/30" />
						<h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
							Connect Wallet
						</h2>
						<p className="text-foreground/60 leading-relaxed">
							Connect your wallet to view your profile, track rewards, and
							manage your NFT collection.
						</p>
					</GlassCard>
				</motion.div>
			</div>
		);
	}

	const totalDeposits =
		userDepositCounts?.reduce((sum, count) => sum + Number(count || 0), 0) || 0;

	// Debug logging to understand what's happening with the data
	useEffect(() => {
		if (userAddress) {
			console.log("🔍 ProfileDashboard Debug:", {
				userAddress,
				userAnalytics,
				userSpinCount: userSpinCount.toString(),
				userDepositCounts: userDepositCounts?.map(c => c?.toString()),
				totalDeposits,
				totalClaimableRewards: totalClaimableRewards.toString(),
				totalRewardsClaimed: totalRewardsClaimed.toString(),
				contracts: {
					rewardsManager: contracts.rewardsManager,
					treasury: contracts.treasury,
				}
			});
		}
	}, [userAddress, userAnalytics, userSpinCount, userDepositCounts, totalDeposits, totalClaimableRewards, totalRewardsClaimed, contracts]);

	return (
		<div className="max-w-6xl mx-auto space-y-8">
			{/* Profile Header */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6 }}
			>
				<div className="text-center mb-12">
					<div className="relative inline-block mb-6">
						<div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center border border-primary/30">
							<UserCircleIcon className="w-12 h-12 text-primary" />
						</div>
						<div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
							<div className="bg-success/20 border border-success/50 rounded-full px-3 py-1">
								<span className="text-xs font-medium text-success">
									Connected
								</span>
							</div>
						</div>
					</div>
					<h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
						My Profile
					</h1>
					<div className="inline-flex items-center gap-2 bg-content2/30 backdrop-blur-xl border border-white/10 rounded-full px-4 py-2">
						<div className="w-2 h-2 bg-success rounded-full animate-pulse" />
						<span className="text-sm font-mono text-foreground/80">
							{userAddress.slice(0, 6)}...{userAddress.slice(-4)}
						</span>
					</div>
				</div>
			</motion.div>

			{/* Stats Grid */}
			<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.1 }}
				>
					<GlassCard className="p-6 hover:bg-content2/30 transition-colors">
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
									width: `${Math.min(Number(userSpinCount || 0) * 10, 100)}%`,
								}}
							/>
						</div>
					</GlassCard>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.2 }}
				>
					<GlassCard className="p-6 hover:bg-content2/30 transition-colors">
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
								style={{ width: `${Math.min(totalDeposits * 5, 100)}%` }}
							/>
						</div>
					</GlassCard>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.3 }}
				>
					<GlassCard className="p-6 hover:bg-content2/30 transition-colors">
						<div className="flex items-center justify-between mb-4">
							<div className="w-12 h-12 bg-gradient-to-br from-rarity-legendary-500/20 to-rarity-legendary-600/20 rounded-lg flex items-center justify-center">
								<CurrencyDollarIcon className="w-6 h-6 text-rarity-legendary-300" />
							</div>
							<div className="text-right">
								<div className="text-2xl font-bold text-rarity-legendary-300">
									{formatTokenAmount(
										totalClaimableRewards,
										tokenDecimals || 18,
									)}
								</div>
								<div className="text-sm text-foreground/60">{tokenSymbol} Available</div>
							</div>
						</div>
						<div className="w-full bg-content2/30 rounded-full h-2">
							<div 
								className="bg-gradient-to-r from-rarity-legendary-500 to-rarity-legendary-400 h-2 rounded-full"
								style={{ width: `${totalClaimableRewards > BigInt(0) ? 100 : 0}%` }}
							/>
						</div>
					</GlassCard>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.4 }}
				>
					<GlassCard className="p-6 hover:bg-content2/30 transition-colors">
						<div className="flex items-center justify-between mb-4">
							<div className="w-12 h-12 bg-gradient-to-br from-rarity-epic-500/20 to-rarity-epic-600/20 rounded-lg flex items-center justify-center">
								<ClockIcon className="w-6 h-6 text-rarity-epic-300" />
							</div>
							<div className="text-right">
								<div className="text-2xl font-bold text-rarity-epic-300">
									{formatTokenAmount(
										totalRewardsClaimed,
										tokenDecimals || 18,
									)}
								</div>
								<div className="text-sm text-foreground/60">{tokenSymbol} Claimed</div>
							</div>
						</div>
						<div className="w-full bg-content2/30 rounded-full h-2">
							<div 
								className="bg-gradient-to-r from-rarity-epic-500 to-rarity-epic-400 h-2 rounded-full"
								style={{ width: `${totalRewardsClaimed > BigInt(0) ? 100 : 0}%` }}
							/>
						</div>
					</GlassCard>
				</motion.div>
			</div>

			{/* Rewards by Rarity */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6, delay: 0.4 }}
			>
				<GlassCard className="p-8">
					<h2
						className={`${glassTypography({ variant: "mainHeading" })} mb-8 text-center`}
					>
						<CurrencyDollarIcon className="w-6 h-6 inline mr-2" />
						Rewards by Rarity
					</h2>

					<div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
						{getAllRarities().map((rarity, index) => (
							<motion.div
								key={rarity}
								initial={{ opacity: 0, scale: 0.95 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ duration: 0.5, delay: 0.1 * index }}
							>
								<RarityRewardCard
									rarity={rarity}
									userAddress={userAddress}
									rewardsManagerAddress={contracts.rewardsManager!}
									tokenSymbol={tokenSymbol}
									tokenDecimals={tokenDecimals}
								/>
							</motion.div>
						))}
					</div>
				</GlassCard>
			</motion.div>
		</div>
	);
};

const RarityRewardCard: React.FC<{
	rarity: Rarity;
	userAddress: `0x${string}`;
	rewardsManagerAddress: `0x${string}`;
	tokenSymbol?: string;
	tokenDecimals?: number;
}> = ({
	rarity,
	userAddress,
	rewardsManagerAddress,
	tokenSymbol,
	tokenDecimals,
}) => {
	const config = getRarityConfig(rarity);

	const { data: claimableAmount } =
		useReadGachaRewardsManagerGetUserRarityClaimableRewards({
			address: rewardsManagerAddress,
			args: [userAddress, rarity],
			query: { enabled: !!rewardsManagerAddress && !!userAddress },
		});

	const amount = Number(claimableAmount || 0);
	const formattedAmount = formatTokenAmount(
		claimableAmount || BigInt(0),
		tokenDecimals || 18,
	);
	const hasRewards = amount > 0;

	return (
		<div className="group relative">
			<div
				className={`absolute inset-0 bg-gradient-to-br ${config.bgGradient} rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300 blur-sm`}
			/>

			<div
				className={`relative bg-content2/20 border ${config.borderColor} rounded-xl p-4 hover:bg-content2/30 transition-all duration-300 ${hasRewards ? "hover:shadow-lg hover:shadow-" + config.name.toLowerCase() + "/20" : ""}`}
			>
				<div className="text-center">
					<div className="text-3xl mb-2">{config.emoji}</div>
					<div className={`font-bold text-sm ${config.textColor} mb-1`}>
						{config.name}
					</div>
					<div className="text-lg font-bold mb-3">
						{formattedAmount}
						<span className="text-xs text-foreground/60 ml-1">
							{tokenSymbol}
						</span>
					</div>
					<GlassButton
						variant={hasRewards ? "primary" : "secondary"}
						size="sm"
						className="w-full"
						disabled={!hasRewards}
					>
						{hasRewards ? "Claim" : "No rewards"}
					</GlassButton>
				</div>
			</div>
		</div>
	);
};
