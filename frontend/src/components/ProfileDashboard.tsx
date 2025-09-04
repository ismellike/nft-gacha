"use client";

import { motion } from "framer-motion";
import { useAccount } from "wagmi";
import { formatTokenAmount } from "../lib/utils";
import { getRarityConfig } from "../lib/rarityConfig";
import { Card } from "./ui";
import { CardRewardsList } from "./CardRewardsList";
import { glassTypography } from "../lib/theme-config";
import {
	useReadGachaTreasuryGetUserAllDepositCounts,
	useReadGachaFeeToken,
	useReadErc20Symbol,
	useReadErc20Decimals,
	useReadGachaGetUserAnalytics,
	useReadUserDividendTrackerWithdrawableFundsOf,
	useReadUserDividendTrackerAccumulativeFundsOf,
} from "../generated";
import { useGachaContracts } from "../hooks/useGachaContracts";
import { useGachaId } from "../hooks/useGachaId";
import {
	UserCircleIcon,
	SparklesIcon,
	GiftIcon,
	CurrencyDollarIcon,
	ClockIcon,
	TrophyIcon,
} from "@heroicons/react/24/outline";

export const ProfileDashboard: React.FC = () => {
	const { address: userAddress } = useAccount();
	const gachaId = useGachaId();
	const contracts = useGachaContracts(gachaId);

	// Fee token info
	const { data: feeTokenAddress } = useReadGachaFeeToken({
		address: contracts.gacha as `0x${string}` | undefined,
		query: { enabled: !!contracts.gacha },
	});

	const { data: tokenSymbol } = useReadErc20Symbol({
		address: feeTokenAddress,
		query: { enabled: !!feeTokenAddress },
	});

	const { data: tokenDecimals } = useReadErc20Decimals({
		address: feeTokenAddress,
		query: { enabled: !!feeTokenAddress },
	});

	// Get comprehensive user analytics from Gacha contract
	const { data: userGachaAnalytics } = useReadGachaGetUserAnalytics({
		address: contracts.gacha as `0x${string}` | undefined,
		args: userAddress ? [userAddress] : undefined,
		query: { enabled: !!contracts.gacha && !!userAddress },
	});


	// Rewards totals via per-rarity UserDividendTrackers
	const { data: withdrawCommon } = useReadUserDividendTrackerWithdrawableFundsOf({
		address: contracts.trackers?.common as `0x${string}` | undefined,
		args: userAddress ? [userAddress] : undefined,
		query: { enabled: !!contracts.trackers?.common && !!userAddress },
	});
	const { data: withdrawUncommon } = useReadUserDividendTrackerWithdrawableFundsOf({
		address: contracts.trackers?.uncommon as `0x${string}` | undefined,
		args: userAddress ? [userAddress] : undefined,
		query: { enabled: !!contracts.trackers?.uncommon && !!userAddress },
	});
	const { data: withdrawRare } = useReadUserDividendTrackerWithdrawableFundsOf({
		address: contracts.trackers?.rare as `0x${string}` | undefined,
		args: userAddress ? [userAddress] : undefined,
		query: { enabled: !!contracts.trackers?.rare && !!userAddress },
	});
	const { data: withdrawEpic } = useReadUserDividendTrackerWithdrawableFundsOf({
		address: contracts.trackers?.epic as `0x${string}` | undefined,
		args: userAddress ? [userAddress] : undefined,
		query: { enabled: !!contracts.trackers?.epic && !!userAddress },
	});
	const { data: withdrawLegendary } = useReadUserDividendTrackerWithdrawableFundsOf({
		address: contracts.trackers?.legendary as `0x${string}` | undefined,
		args: userAddress ? [userAddress] : undefined,
		query: { enabled: !!contracts.trackers?.legendary && !!userAddress },
	});

	const { data: accumCommon } = useReadUserDividendTrackerAccumulativeFundsOf({
		address: contracts.trackers?.common as `0x${string}` | undefined,
		args: userAddress ? [userAddress] : undefined,
		query: { enabled: !!contracts.trackers?.common && !!userAddress },
	});
	const { data: accumUncommon } = useReadUserDividendTrackerAccumulativeFundsOf({
		address: contracts.trackers?.uncommon as `0x${string}` | undefined,
		args: userAddress ? [userAddress] : undefined,
		query: { enabled: !!contracts.trackers?.uncommon && !!userAddress },
	});
	const { data: accumRare } = useReadUserDividendTrackerAccumulativeFundsOf({
		address: contracts.trackers?.rare as `0x${string}` | undefined,
		args: userAddress ? [userAddress] : undefined,
		query: { enabled: !!contracts.trackers?.rare && !!userAddress },
	});
	const { data: accumEpic } = useReadUserDividendTrackerAccumulativeFundsOf({
		address: contracts.trackers?.epic as `0x${string}` | undefined,
		args: userAddress ? [userAddress] : undefined,
		query: { enabled: !!contracts.trackers?.epic && !!userAddress },
	});
	const { data: accumLegendary } = useReadUserDividendTrackerAccumulativeFundsOf({
		address: contracts.trackers?.legendary as `0x${string}` | undefined,
		args: userAddress ? [userAddress] : undefined,
		query: { enabled: !!contracts.trackers?.legendary && !!userAddress },
	});

    const { data: userDepositCounts } = useReadGachaTreasuryGetUserAllDepositCounts({
        address: contracts.treasury as `0x${string}` | undefined,
        args: userAddress ? [userAddress] : undefined,
        query: { enabled: !!contracts.treasury && !!userAddress },
    } as Parameters<typeof useReadGachaTreasuryGetUserAllDepositCounts>[0]);

	// Extract values from analytics tuples
	// userGachaAnalytics: [totalSpins, totalRefunds, totalReclaims, rarityWins[5]]
	const userSpinCount = userGachaAnalytics?.[0] || BigInt(0);
	const userRefundCount = userGachaAnalytics?.[1] || BigInt(0);
	const userReclaimCount = userGachaAnalytics?.[2] || BigInt(0);
	const userRarityWins = userGachaAnalytics?.[3] || [
		BigInt(0),
		BigInt(0),
		BigInt(0),
		BigInt(0),
		BigInt(0),
	];

	// Rewards totals from trackers: claimed = accumulative - withdrawable (sum over rarities)
	const totalClaimableRewards =
		(withdrawCommon || 0n) +
		(withdrawUncommon || 0n) +
		(withdrawRare || 0n) +
		(withdrawEpic || 0n) +
		(withdrawLegendary || 0n);

	const totalAccumulativeRewards =
		(accumCommon || 0n) +
		(accumUncommon || 0n) +
		(accumRare || 0n) +
		(accumEpic || 0n) +
		(accumLegendary || 0n);

	const totalRewardsClaimed =
		totalAccumulativeRewards > totalClaimableRewards
			? totalAccumulativeRewards - totalClaimableRewards
			: 0n;


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

    const depositCountsArr = Array.isArray(userDepositCounts)
        ? (userDepositCounts as readonly bigint[])
        : undefined;
    const totalDeposits = depositCountsArr?.reduce((sum, count) => sum + Number(count || 0), 0) || 0;

	return (
		<div className="max-w-7xl mx-auto space-y-8">
			{/* Stats Grid */}
			<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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
									width: `${Math.min(Number(userSpinCount || 0) * 10, 100)}%`,
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
								style={{ width: `${Math.min(totalDeposits * 5, 100)}%` }}
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
									{formatTokenAmount(
										totalClaimableRewards,
										tokenDecimals || 18,
									)}
								</div>
								<div className="text-sm text-foreground/60">
									{tokenSymbol} Available
								</div>
							</div>
						</div>
						<div className="w-full bg-content2/30 rounded-full h-2">
							<div
								className="bg-gradient-to-r from-rarity-legendary-500 to-rarity-legendary-400 h-2 rounded-full"
								style={{
									width: `${totalClaimableRewards > BigInt(0) ? 100 : 0}%`,
								}}
							/>
						</div>
					</Card>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.4 }}
				>
					<Card className="p-6 hover:bg-content2/30 transition-colors bg-content1/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl">
						<div className="flex items-center justify-between mb-4">
							<div className="w-12 h-12 bg-gradient-to-br from-rarity-epic-500/20 to-rarity-epic-600/20 rounded-lg flex items-center justify-center">
								<ClockIcon className="w-6 h-6 text-rarity-epic-300" />
							</div>
							<div className="text-right">
								<div className="text-2xl font-bold text-rarity-epic-300">
									{formatTokenAmount(totalRewardsClaimed, tokenDecimals || 18)}
								</div>
								<div className="text-sm text-foreground/60">
									{tokenSymbol} Claimed
								</div>
							</div>
						</div>
						<div className="w-full bg-content2/30 rounded-full h-2">
							<div
								className="bg-gradient-to-r from-rarity-epic-500 to-rarity-epic-400 h-2 rounded-full"
								style={{
									width: `${totalRewardsClaimed > BigInt(0) ? 100 : 0}%`,
								}}
							/>
						</div>
					</Card>
				</motion.div>
            </div>


			{/* Rewards by Card */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6, delay: 0.4 }}
			>
				<CardRewardsList />
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
                    {[0,1,2,3,4].map((rarity, index) => {
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
