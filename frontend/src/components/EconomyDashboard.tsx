"use client";
import { Card, GlassCard } from "@/ui/Card";
import { TokenAmountDisplay, RevenueDisplay } from "./TokenDisplay";
import { Skeleton } from "./SkeletonLoader";
import {
	useGachaEconomyManagerData,
	calculateRevenueShares,
} from "@/hooks/useGachaEconomyManager";
import {
	useProtocolTreasuryData,
	getTreasuryStatus,
} from "@/hooks/useProtocolTreasury";
import { useRegisterRewardsRefetch } from "@/hooks/useRewardsData";
import type { GachaConfig } from "@/lib/gacha-config/types";
import {
	useReadErc20Decimals,
	useReadErc20Symbol,
	useReadErc20BalanceOf,
} from "@/generated";

interface EconomyDashboardProps {
	gachaConfig: GachaConfig;
}

export function EconomyDashboard({ gachaConfig }: EconomyDashboardProps) {

	// Economy Manager data
	const {
		data: economyData,
		isLoading: economyLoading,
		refetch: refetchEconomyData,
	} = useGachaEconomyManagerData({
		contractAddress: gachaConfig.economyManagerAddress,
	});

	// Protocol Treasury data
	const {
		data: protocolData,
		isLoading: protocolLoading,
		refetch: refetchProtocolTreasury,
	} = useProtocolTreasuryData({
		contractAddress: gachaConfig.protocolTreasuryAddress,
	});

	// Token information for revenue display
	const { data: tokenDecimals } = useReadErc20Decimals({
		address: economyData.feeToken as `0x${string}`,
		query: {
			enabled: !!economyData.feeToken,
		},
	});

	const { data: tokenSymbol } = useReadErc20Symbol({
		address: economyData.feeToken as `0x${string}`,
		query: {
			enabled: !!economyData.feeToken,
		},
	});

	// Protocol Treasury Balance
	const { data: treasuryBalance } = useReadErc20BalanceOf({
		address: economyData.feeToken as `0x${string}`,
		args: [gachaConfig.protocolTreasuryAddress],
		query: {
			enabled: !!economyData.feeToken && !!gachaConfig.protocolTreasuryAddress,
		},
	});

	// Register refetch functions with the rewards system
	useRegisterRewardsRefetch("economyData", refetchEconomyData);
	useRegisterRewardsRefetch("protocolTreasury", refetchProtocolTreasury);

	// Progressive loading: render sections as they become available
	const canShowRevenueOverview = !economyLoading;
	const canShowProtocolTreasury = !protocolLoading;

	const revenueShares = calculateRevenueShares(
		economyData.depositorShareBps || 0n,
		economyData.protocolShareBps || 0n,
	);

	const treasuryStatus = getTreasuryStatus(protocolData.paused);

	return (
		<div className="space-y-8">
			{/* Revenue Distribution Overview */}
			{canShowRevenueOverview ? (
				<GlassCard className="p-6 animate-in fade-in duration-500">
					<h3 className="text-xl font-bold text-white mb-6">
						Revenue Distribution
					</h3>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
						<Card className="p-4 text-center">
							<div className="text-3xl mb-2">🏦</div>
							<div className="text-sm text-gray-400 mb-1">Depositors</div>
							<div className="text-2xl font-bold text-blue-400">
								{revenueShares.depositor}
							</div>
						</Card>

						<Card className="p-4 text-center">
							<div className="text-3xl mb-2">🏛️</div>
							<div className="text-sm text-gray-400 mb-1">Protocol</div>
							<div className="text-2xl font-bold text-purple-400">
								{revenueShares.protocol}
							</div>
						</Card>
					</div>

					{/* Total Revenue Processed */}
					<Card className="p-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
						<div className="flex justify-between items-center">
							<span className="text-gray-300">Total Revenue Processed</span>
							<span className="text-xl font-bold text-white">
								<TokenAmountDisplay
									amount={economyData.totalRevenueProcessed}
									showUsd={true}
								/>
							</span>
						</div>
					</Card>
				</GlassCard>
			) : (
				<GlassCard className="p-6">
					<div className="flex items-center justify-center h-32">
						<div className="flex flex-col items-center space-y-2">
							<Skeleton className="h-6 w-32" />
							<Skeleton className="h-8 w-48" />
						</div>
					</div>
				</GlassCard>
			)}

			{/* Protocol Treasury */}
			{canShowProtocolTreasury ? (
				<GlassCard className="p-6 animate-in fade-in duration-500 delay-300">
					<div className="flex justify-between items-center mb-6">
						<h3 className="text-lg font-bold text-white">Protocol Treasury</h3>
						<div
							className={`px-3 py-1 rounded-full text-sm ${
								treasuryStatus === "active"
									? "bg-green-500/20 text-green-300"
									: "bg-red-500/20 text-red-300"
							}`}
						>
							{treasuryStatus.charAt(0).toUpperCase() + treasuryStatus.slice(1)}
						</div>
					</div>

					{/* Treasury Balance */}
					<Card className="p-4 bg-gradient-to-r from-purple-900/20 to-blue-900/20 mb-4">
						<div className="flex justify-between items-center">
							<span className="text-gray-300">Treasury Balance</span>
							<span className="text-xl font-bold text-white">
								<RevenueDisplay
									amount={treasuryBalance}
									tokenSymbol={tokenSymbol}
									decimals={tokenDecimals !== undefined ? Number(tokenDecimals) : undefined}
									compact={false}
								/>
							</span>
						</div>
					</Card>

					{/* Treasury Information */}
					<Card className="p-4">
						<div className="space-y-3">
							<div className="flex justify-between">
								<span className="text-gray-400">Treasury Address</span>
								<span className="text-sm text-white font-mono bg-gray-800 px-2 py-1 rounded">
									{gachaConfig.protocolTreasuryAddress?.slice(0, 6)}...
									{gachaConfig.protocolTreasuryAddress?.slice(-4)}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-gray-400">Asset Token</span>
								<span className="text-sm text-white font-mono bg-gray-800 px-2 py-1 rounded">
									{tokenSymbol || 'Loading...'}
								</span>
							</div>
						</div>
					</Card>
				</GlassCard>
			) : (
				<GlassCard className="p-6">
					<div className="flex items-center justify-center h-48">
						<div className="flex flex-col items-center space-y-3">
							<Skeleton className="h-5 w-32" />
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-3 w-40" />
							<div className="w-full max-w-sm space-y-2">
								<Skeleton className="h-3 w-full" />
								<Skeleton className="h-3 w-3/4" />
							</div>
						</div>
					</div>
				</GlassCard>
			)}

			{/* Revenue by Rarity */}
			{canShowRevenueOverview && economyData.revenueByRarity && (
				<GlassCard className="p-6 animate-in fade-in duration-500 delay-450">
					<div className="flex justify-between items-center mb-4">
						<h3 className="text-lg font-bold text-white">
							Revenue by Rarity
						</h3>
						{tokenSymbol && (
							<div className="text-sm text-gray-400">
								Values in {tokenSymbol}
							</div>
						)}
					</div>
					<div className="grid grid-cols-2 md:grid-cols-5 gap-4">
						{[
							{ name: "Common", color: "text-gray-400", icon: "⚪" },
							{ name: "Uncommon", color: "text-green-400", icon: "🟢" },
							{ name: "Rare", color: "text-blue-400", icon: "🔵" },
							{ name: "Epic", color: "text-purple-400", icon: "🟣" },
							{ name: "Legendary", color: "text-yellow-400", icon: "🟡" },
						].map((rarity, index) => (
							<Card key={rarity.name} className="p-4 text-center">
								<div className="text-2xl mb-2">{rarity.icon}</div>
								<div className="text-sm text-gray-400 mb-1">{rarity.name}</div>
								<div className={`text-lg font-bold ${rarity.color}`}>
									<RevenueDisplay
										amount={economyData.revenueByRarity?.[index]}
										tokenSymbol={tokenSymbol || undefined}
										decimals={tokenDecimals !== undefined ? Number(tokenDecimals) : undefined}
										compact={true}
									/>
								</div>
							</Card>
						))}
					</div>
				</GlassCard>
			)}
		</div>
	);
}
