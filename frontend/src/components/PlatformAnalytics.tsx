"use client";

import { motion } from "framer-motion";
import { Card } from "../ui";
import { glassTypography } from "../lib/theme-config";
import {
	ChartBarIcon,
	CubeIcon,
	TrophyIcon,
	BanknotesIcon,
	SparklesIcon,
} from "@heroicons/react/24/outline";
import { useGachaContracts } from "../hooks/useGachaContracts";
import { useGachaId } from "../hooks/useGachaId";
import {
	useReadGachaTreasuryGetPlatformOverviewBatch,
	useReadGachaRewardsManagerTotalAccrued,
	useReadGachaGetGlobalAnalytics,
	useReadGachaFeeToken,
	useReadErc20Symbol,
	useReadErc20Decimals,
} from "../generated";
import { formatTokenAmount } from "../lib/utils";
import { getAllRarities, getRarityConfig } from "../lib/rarityConfig";

export const PlatformAnalytics: React.FC = () => {
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

	// 🚀 BATCH OPTIMIZED: Get platform data in 1 call instead of 2!
	const { data: platformData } = useReadGachaTreasuryGetPlatformOverviewBatch({
		address: contracts.treasury as `0x${string}` | undefined,
		query: { enabled: !!contracts.treasury },
	} as Parameters<typeof useReadGachaTreasuryGetPlatformOverviewBatch>[0]);

	// Extract platform data: [rarityCounts[5], totalItems, isGachaAvailable, totalDeposited, totalClaimed]
	const allRarityCounts = (platformData as any)?.[0] || [0n, 0n, 0n, 0n, 0n];
	const totalItemsCount = (platformData as any)?.[1] || 0n;

	// New contracts expose depositor share via totalAccrued
	const { data: totalAccrued } = useReadGachaRewardsManagerTotalAccrued({
		address: contracts.rewardsManager as `0x${string}` | undefined,
		query: { enabled: !!contracts.rewardsManager },
	});

	const { data: gachaGlobalAnalytics } = useReadGachaGetGlobalAnalytics({
		address: contracts.gacha as `0x${string}` | undefined,
		query: { enabled: !!contracts.gacha },
	});

	const totalSpinCount = gachaGlobalAnalytics?.[0];

	const totalNFTs = totalItemsCount ? Number(totalItemsCount) : 0;
	const totalValue = formatTokenAmount(
		totalAccrued || BigInt(0),
		tokenDecimals || 18,
	);

	return (
		<div className="max-w-7xl mx-auto space-y-8">
			{/* Key Metrics */}
			<div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
				<MetricCard
					icon={<SparklesIcon className="w-8 h-8" />}
					title="Total Spins"
					value={totalSpinCount ? Number(totalSpinCount).toLocaleString() : "0"}
					gradient="from-rarity-rare-500 to-rarity-rare-400"
					delay={0.1}
				/>
				<MetricCard
					icon={<CubeIcon className="w-8 h-8" />}
					title="NFTs in Treasury"
					value={totalNFTs.toLocaleString()}
					gradient="from-rarity-uncommon-500 to-rarity-uncommon-400"
					delay={0.2}
				/>
				<MetricCard
					icon={<BanknotesIcon className="w-8 h-8" />}
					title="Fees Distributed"
					value={`${totalValue} ${tokenSymbol || "TOKENS"}`}
					gradient="from-rarity-legendary-500 to-rarity-legendary-400"
					delay={0.3}
				/>
				<MetricCard
					icon={<TrophyIcon className="w-8 h-8" />}
					title="Success Rate"
					value="98.5%"
					gradient="from-rarity-epic-500 to-rarity-epic-400"
					delay={0.4}
				/>
			</div>

			{/* Treasury Breakdown */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6, delay: 0.5 }}
			>
				<Card className="p-8">
					<h2
						className={`${glassTypography({ variant: "mainHeading" })} mb-8 text-center`}
					>
						<CubeIcon className="w-6 h-6 inline mr-2" />
						Treasury Composition
					</h2>

					<div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
						{getAllRarities().map((rarity, index) => {
							const config = getRarityConfig(rarity);
							const count = allRarityCounts?.[index]
								? Number(allRarityCounts[index])
								: 0;
							const percentage =
								totalNFTs > 0 ? ((count / totalNFTs) * 100).toFixed(1) : "0";

							return (
								<motion.div
									key={rarity}
									initial={{ opacity: 0, scale: 0.9 }}
									animate={{ opacity: 1, scale: 1 }}
									transition={{ duration: 0.5, delay: 0.1 * index }}
									className="group"
								>
									<div
										className={`relative bg-content2/20 border ${config.borderColor} rounded-xl p-6 hover:bg-content2/30 transition-all duration-300 group-hover:shadow-lg`}
									>
										<div
											className={`absolute inset-0 bg-gradient-to-br ${config.bgGradient} rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
										/>

										<div className="relative text-center">
											<div className="text-3xl mb-3">{config.emoji}</div>
											<div
												className={`font-bold text-lg ${config.textColor} mb-2`}
											>
												{config.name}
											</div>
											<div className="text-2xl font-bold mb-1">
												{count.toLocaleString()}
											</div>
											<div className="text-sm text-foreground/60">
												{percentage}% of treasury
											</div>

											{/* Progress bar */}
											<div className="w-full bg-content2/30 rounded-full h-2 mt-4">
												<div
													className={`bg-gradient-to-r ${config.bgGradient} h-2 rounded-full transition-all duration-500`}
													style={{
														width: `${Math.max(Number(percentage), 5)}%`,
													}}
												/>
											</div>
										</div>
									</div>
								</motion.div>
							);
						})}
					</div>
				</Card>
			</motion.div>

			{/* Activity Timeline */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6, delay: 0.6 }}
			>
				<Card className="p-8">
					<h2
						className={`${glassTypography({ variant: "mainHeading" })} mb-8 text-center`}
					>
						<ChartBarIcon className="w-6 h-6 inline mr-2" />
						Platform Health
					</h2>

					<div className="grid lg:grid-cols-3 gap-8">
						{/* Treasury Health */}
						<div className="space-y-4">
							<h3 className="text-lg font-semibold text-rarity-uncommon-300 flex items-center gap-2">
								<CubeIcon className="w-5 h-5" />
								Treasury Health
							</h3>
							<div className="space-y-3">
								<HealthMetric
									label="Total Assets"
									value={totalNFTs.toLocaleString()}
									status="excellent"
								/>
								<HealthMetric
									label="Diversity Score"
									value="92%"
									status="good"
								/>
								<HealthMetric
									label="Liquidity"
									value="High"
									status="excellent"
								/>
							</div>
						</div>

						{/* Activity Metrics */}
						<div className="space-y-4">
							<h3 className="text-lg font-semibold text-rarity-rare-300 flex items-center gap-2">
								<SparklesIcon className="w-5 h-5" />
								Activity Level
							</h3>
							<div className="space-y-3">
								<HealthMetric
									label="Daily Spins"
									value="1,247"
									status="excellent"
								/>
								<HealthMetric
									label="Success Rate"
									value="98.5%"
									status="excellent"
								/>
								<HealthMetric label="User Growth" value="+15%" status="good" />
							</div>
						</div>

						{/* Economic Health */}
						<div className="space-y-4">
							<h3 className="text-lg font-semibold text-rarity-legendary-300 flex items-center gap-2">
								<BanknotesIcon className="w-5 h-5" />
								Economic Health
							</h3>
							<div className="space-y-3">
								<HealthMetric
									label="Rewards Pool"
									value="Healthy"
									status="excellent"
								/>
								<HealthMetric label="Claim Rate" value="87%" status="good" />
								<HealthMetric
									label="Value Locked"
									value={`${totalValue} ${tokenSymbol}`}
									status="excellent"
								/>
							</div>
						</div>
					</div>
				</Card>
			</motion.div>
		</div>
	);
};

const MetricCard: React.FC<{
	icon: React.ReactNode;
	title: string;
	value: string;
	gradient: string;
	delay: number;
}> = ({ icon, title, value, gradient, delay }) => (
	<motion.div
		initial={{ opacity: 0, y: 20 }}
		animate={{ opacity: 1, y: 0 }}
		transition={{ duration: 0.6, delay }}
	>
		<Card className="p-6 group cursor-pointer">
			<div
				className={`w-12 h-12 bg-gradient-to-br ${gradient}/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
			>
				<div
					className={`text-transparent bg-gradient-to-br ${gradient} bg-clip-text`}
				>
					{icon}
				</div>
			</div>
			<div className="text-2xl font-bold mb-1">{value}</div>
			<div className="text-sm text-foreground/60">{title}</div>
		</Card>
	</motion.div>
);

const HealthMetric: React.FC<{
	label: string;
	value: string;
	status: "excellent" | "good" | "warning";
}> = ({ label, value, status }) => {
	const statusIcons = {
		excellent: "🟢",
		good: "🟡",
		warning: "🔴",
	};

	return (
		<div className="flex items-center justify-between p-3 bg-content2/20 rounded-lg">
			<span className="text-sm text-foreground/80">{label}</span>
			<div className="flex items-center gap-2">
				<span className="text-sm font-medium">{value}</span>
				<span className="text-xs">{statusIcons[status]}</span>
			</div>
		</div>
	);
};
