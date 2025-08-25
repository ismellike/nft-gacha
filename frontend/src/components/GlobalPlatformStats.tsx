"use client";

import { motion } from "framer-motion";
import { formatTokenAmount, formatCurrency } from "../lib/utils";
import { Rarity, getRarityConfig, getAllRarities } from "../lib/rarityConfig";
import { GlassCard } from "./ui";
import { glassTypography } from "../lib/theme-config";
import {
	useReadGachaRewardsManagerGetGlobalAnalytics,
	useReadGachaRewardsManagerTotalFeesDistributed,
	useReadGachaRewardsManagerTotalSpinCount,
	useReadGachaRewardsManagerRarityMultipliers,
	useReadGachaRewardsManagerTotalProtocolFees,
	useReadGachaRewardsManagerRewardsPercentage,
	useReadGachaRewardsManagerProtocolPercentage,
	useReadGachaRewardsManagerPercentageDenominator,
	useReadGachaGetTotalValueLocked,
	useReadGachaTreasuryGetTotalItemsCount,
	useReadGachaFeeToken,
	useReadErc20Symbol,
	useReadErc20Decimals,
} from "../generated";
import { useGachaContracts } from "../hooks/useGachaContracts";
import { useGachaId } from "../hooks/useGachaId";
import {
	GlobeAltIcon,
	CurrencyDollarIcon,
	ChartBarIcon,
	TrophyIcon,
	SparklesIcon,
	BanknotesIcon,
	UsersIcon,
	CogIcon,
} from "@heroicons/react/24/outline";

export const GlobalPlatformStats: React.FC = () => {
	const gachaId = useGachaId();
	const contracts = useGachaContracts(gachaId);
	const rarities = getAllRarities();

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

	// Global stats
	const { data: globalAnalytics } = useReadGachaRewardsManagerGetGlobalAnalytics({
		address: contracts.rewardsManager!,
		query: { enabled: !!contracts.rewardsManager },
	});

	const { data: totalFeesDistributed } = useReadGachaRewardsManagerTotalFeesDistributed({
		address: contracts.rewardsManager!,
		query: { enabled: !!contracts.rewardsManager },
	});

	const { data: totalSpinCount } = useReadGachaRewardsManagerTotalSpinCount({
		address: contracts.rewardsManager!,
		query: { enabled: !!contracts.rewardsManager },
	});

	const { data: rarityMultipliers } = useReadGachaRewardsManagerRarityMultipliers({
		address: contracts.rewardsManager!,
		query: { enabled: !!contracts.rewardsManager },
	});

	const { data: totalProtocolFees } = useReadGachaRewardsManagerTotalProtocolFees({
		address: contracts.rewardsManager!,
		query: { enabled: !!contracts.rewardsManager },
	});

	const { data: rewardsPercentage } = useReadGachaRewardsManagerRewardsPercentage({
		address: contracts.rewardsManager!,
		query: { enabled: !!contracts.rewardsManager },
	});

	const { data: protocolPercentage } = useReadGachaRewardsManagerProtocolPercentage({
		address: contracts.rewardsManager!,
		query: { enabled: !!contracts.rewardsManager },
	});

	const { data: percentageDenominator } = useReadGachaRewardsManagerPercentageDenominator({
		address: contracts.rewardsManager!,
		query: { enabled: !!contracts.rewardsManager },
	});

	const { data: totalValueLocked } = useReadGachaGetTotalValueLocked({
		address: contracts.gacha!,
		query: { enabled: !!contracts.gacha },
	});

	const { data: totalItems } = useReadGachaTreasuryGetTotalItemsCount({
		address: contracts.treasury!,
		query: { enabled: !!contracts.treasury },
	});

	// Calculate percentages
	const rewardsPercentageDisplay = percentageDenominator && rewardsPercentage
		? (Number(rewardsPercentage) / Number(percentageDenominator)) * 100
		: 0;

	const protocolPercentageDisplay = percentageDenominator && protocolPercentage
		? (Number(protocolPercentage) / Number(percentageDenominator)) * 100
		: 0;

	return (
		<div className="space-y-6">
			{/* Platform Overview */}
			<GlassCard
				variant="base"
				header={
					<h2 className={glassTypography({ variant: "mainHeading" })}>
						<GlobeAltIcon className="w-6 h-6 inline mr-2" />
						Global Platform Statistics
					</h2>
				}
			>
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
					{/* Total Spins */}
					<motion.div
						className="bg-content2/30 backdrop-blur-xl border border-rarity-rare-500/30 rounded-xl p-4 hover:bg-content2/40 transition-colors"
						whileHover={{ scale: 1.02 }}
					>
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 bg-gradient-to-br from-rarity-rare-500/20 to-rarity-rare-600/20 rounded-lg flex items-center justify-center">
								<SparklesIcon className="w-5 h-5 text-rarity-rare-200" />
							</div>
							<div>
								<div className="text-lg font-bold text-rarity-rare-200">
									{Number(totalSpinCount || 0).toLocaleString()}
								</div>
								<div className="text-xs text-foreground/60">Total Spins</div>
							</div>
						</div>
					</motion.div>

					{/* Total Value Locked */}
					<motion.div
						className="bg-content2/30 backdrop-blur-xl border border-success/30 rounded-xl p-4 hover:bg-content2/40 transition-colors"
						whileHover={{ scale: 1.02 }}
					>
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 bg-gradient-to-br from-success/20 to-success/30 rounded-lg flex items-center justify-center">
								<BanknotesIcon className="w-5 h-5 text-success" />
							</div>
							<div>
								<div className="text-lg font-bold text-success">
									{formatTokenAmount(totalValueLocked || BigInt(0), tokenDecimals || 18)} {tokenSymbol}
								</div>
								<div className="text-xs text-foreground/60">Total Value Locked</div>
							</div>
						</div>
					</motion.div>

					{/* Total NFTs */}
					<motion.div
						className="bg-content2/30 backdrop-blur-xl border border-info/30 rounded-xl p-4 hover:bg-content2/40 transition-colors"
						whileHover={{ scale: 1.02 }}
					>
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 bg-gradient-to-br from-info/20 to-info/30 rounded-lg flex items-center justify-center">
								<ChartBarIcon className="w-5 h-5 text-info" />
							</div>
							<div>
								<div className="text-lg font-bold text-info">
									{Number(totalItems || 0).toLocaleString()}
								</div>
								<div className="text-xs text-foreground/60">NFTs Available</div>
							</div>
						</div>
					</motion.div>

					{/* Total Fees Distributed */}
					<motion.div
						className="bg-content2/30 backdrop-blur-xl border border-rarity-legendary-500/30 rounded-xl p-4 hover:bg-content2/40 transition-colors"
						whileHover={{ scale: 1.02 }}
					>
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 bg-gradient-to-br from-rarity-legendary-500/20 to-rarity-legendary-600/20 rounded-lg flex items-center justify-center">
								<CurrencyDollarIcon className="w-5 h-5 text-rarity-legendary-200" />
							</div>
							<div>
								<div className="text-lg font-bold text-rarity-legendary-200">
									{formatTokenAmount(totalFeesDistributed || BigInt(0), tokenDecimals || 18)} {tokenSymbol}
								</div>
								<div className="text-xs text-foreground/60">Fees Distributed</div>
							</div>
						</div>
					</motion.div>
				</div>
			</GlassCard>

			<div className="grid lg:grid-cols-2 gap-6">
				{/* Rarity Multipliers */}
				<GlassCard
					variant="base"
					header={
						<h3 className={glassTypography({ variant: "secondaryHeading" })}>
							<TrophyIcon className="w-5 h-5 inline mr-2" />
							Rewards Multipliers by Rarity
						</h3>
					}
				>
					<div className="space-y-3">
						{rarities.map((rarity, index) => {
							const config = getRarityConfig(rarity);
							const multiplier = rarityMultipliers && Array.isArray(rarityMultipliers) 
								? Number(rarityMultipliers[index] || 1) 
								: 1;
							const bonusPercentage = (multiplier - 1) * 100;

							return (
								<motion.div
									key={rarity}
									className="group relative"
									whileHover={{ scale: 1.01 }}
								>
									{/* Glow effect */}
									<div
										className={`absolute inset-0 bg-gradient-to-r ${config.bgGradient} rounded-lg blur-md opacity-0 group-hover:opacity-20 transition-opacity duration-300`}
									/>

									<div
										className={`relative bg-content2/20 border ${config.borderColor} rounded-lg p-3 hover:bg-content2/30 transition-colors`}
									>
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-3">
												<div
													className={`px-2 py-1 rounded-lg bg-gradient-to-r ${config.bgGradient} shadow-sm`}
												>
													<span className="text-xs font-bold text-white flex items-center gap-1">
														<span>{config.emoji}</span>
														{config.name}
													</span>
												</div>
											</div>
											<div className="text-right">
												<div className={`text-lg font-bold ${config.textColor}`}>
													{multiplier}x
												</div>
												<div className="text-xs text-foreground/60">
													{bonusPercentage > 0 ? `+${bonusPercentage.toFixed(0)}%` : "Base rate"}
												</div>
											</div>
										</div>
									</div>
								</motion.div>
							);
						})}
					</div>
				</GlassCard>

				{/* Fee Distribution */}
				<GlassCard
					variant="base"
					header={
						<h3 className={glassTypography({ variant: "secondaryHeading" })}>
							<CogIcon className="w-5 h-5 inline mr-2" />
							Fee Distribution Structure
						</h3>
					}
				>
					<div className="space-y-4">
						{/* Rewards Distribution */}
						<div className="bg-content2/20 border border-success/30 rounded-xl p-4">
							<div className="flex items-center justify-between mb-3">
								<div className="flex items-center gap-3">
									<div className="w-8 h-8 bg-gradient-to-br from-success/20 to-success/30 rounded-lg flex items-center justify-center">
										<UsersIcon className="w-4 h-4 text-success" />
									</div>
									<span className="font-medium text-sm">User Rewards</span>
								</div>
								<span className="text-lg font-bold text-success">{rewardsPercentageDisplay.toFixed(1)}%</span>
							</div>
							<div className="text-xs text-foreground/70 leading-relaxed">
								Percentage of each spin fee distributed as rewards to users based on rarity multipliers
							</div>
						</div>

						{/* Protocol Fees */}
						<div className="bg-content2/20 border border-info/30 rounded-xl p-4">
							<div className="flex items-center justify-between mb-3">
								<div className="flex items-center gap-3">
									<div className="w-8 h-8 bg-gradient-to-br from-info/20 to-info/30 rounded-lg flex items-center justify-center">
										<CogIcon className="w-4 h-4 text-info" />
									</div>
									<span className="font-medium text-sm">Protocol Fees</span>
								</div>
								<span className="text-lg font-bold text-info">{protocolPercentageDisplay.toFixed(1)}%</span>
							</div>
							<div className="text-xs text-foreground/70 leading-relaxed">
								Fees collected for platform maintenance, development, and operations
							</div>
						</div>

						{/* Total Protocol Fees Collected */}
						<div className="bg-content2/20 border border-warning/30 rounded-xl p-4">
							<div className="flex items-center justify-between mb-3">
								<div className="flex items-center gap-3">
									<div className="w-8 h-8 bg-gradient-to-br from-warning/20 to-warning/30 rounded-lg flex items-center justify-center">
										<BanknotesIcon className="w-4 h-4 text-warning" />
									</div>
									<span className="font-medium text-sm">Total Protocol Fees</span>
								</div>
								<span className="text-lg font-bold text-warning">
									{formatTokenAmount(totalProtocolFees || BigInt(0), tokenDecimals || 18)} {tokenSymbol}
								</span>
							</div>
							<div className="text-xs text-foreground/70 leading-relaxed">
								Total protocol fees collected since platform launch
							</div>
						</div>
					</div>
				</GlassCard>
			</div>

			{/* Platform Health Metrics */}
			<GlassCard
				variant="base"
				header={
					<h3 className={glassTypography({ variant: "secondaryHeading" })}>
						<ChartBarIcon className="w-5 h-5 inline mr-2" />
						Platform Health & Activity
					</h3>
				}
			>
				<div className="grid md:grid-cols-3 gap-6">
					{/* Activity Metrics */}
					<div className="space-y-4">
						<h4 className="font-medium text-foreground/80 text-sm">Activity Metrics</h4>
						<div className="space-y-3">
							<div className="flex justify-between items-center">
								<span className="text-sm text-foreground/70">Avg. Daily Spins</span>
								<span className="font-mono text-sm">
									{totalSpinCount ? Math.round(Number(totalSpinCount) / 30).toLocaleString() : "0"}
								</span>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-sm text-foreground/70">Total Revenue</span>
								<span className="font-mono text-sm">
									{formatTokenAmount((totalFeesDistributed || BigInt(0)) + (totalProtocolFees || BigInt(0)), tokenDecimals || 18)} {tokenSymbol}
								</span>
							</div>
						</div>
					</div>

					{/* Treasury Metrics */}
					<div className="space-y-4">
						<h4 className="font-medium text-foreground/80 text-sm">Treasury Health</h4>
						<div className="space-y-3">
							<div className="flex justify-between items-center">
								<span className="text-sm text-foreground/70">Utilization Rate</span>
								<span className="font-mono text-sm">
									{totalItems && totalSpinCount 
										? `${Math.min((Number(totalSpinCount) / Number(totalItems)) * 100, 100).toFixed(1)}%`
										: "0%"
									}
								</span>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-sm text-foreground/70">Avg. Item Value</span>
								<span className="font-mono text-sm">
									{totalValueLocked && totalItems && Number(totalItems) > 0
										? formatTokenAmount(totalValueLocked / BigInt(Number(totalItems)), tokenDecimals || 18)
										: "0"
									} {tokenSymbol}
								</span>
							</div>
						</div>
					</div>

					{/* Economic Metrics */}
					<div className="space-y-4">
						<h4 className="font-medium text-foreground/80 text-sm">Economic Impact</h4>
						<div className="space-y-3">
							<div className="flex justify-between items-center">
								<span className="text-sm text-foreground/70">User Rewards</span>
								<span className="font-mono text-sm text-success">
									{formatTokenAmount(totalFeesDistributed || BigInt(0), tokenDecimals || 18)} {tokenSymbol}
								</span>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-sm text-foreground/70">Protocol Share</span>
								<span className="font-mono text-sm text-info">
									{formatTokenAmount(totalProtocolFees || BigInt(0), tokenDecimals || 18)} {tokenSymbol}
								</span>
							</div>
						</div>
					</div>
				</div>
			</GlassCard>
		</div>
	);
};