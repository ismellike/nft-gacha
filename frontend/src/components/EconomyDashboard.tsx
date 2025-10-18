"use client";

import React from "react";
import { useAccount } from "wagmi";
import { Card, GlassCard } from "@/ui/Card";
import { TokenAmountDisplay } from "./TokenDisplay";
import { Skeleton } from "./SkeletonLoader";
import {
	useGachaEconomyManagerData,
	calculateRevenueShares,
} from "@/hooks/useGachaEconomyManager";
import {
	useDepositorVaultData,
	calculateUserSharePercentage,
	formatTokenAmount,
	useClaimYield,
	useSimulateClaimYield,
} from "@/hooks/useDepositorVault";
import {
	useProtocolTreasuryData,
	getTreasuryStatus,
	isOwner,
} from "@/hooks/useProtocolTreasury";
import { useRegisterRewardsRefetch } from "@/hooks/useRewardsData";
import type { GachaConfig } from "@/lib/gacha-config/types";
import { Button } from "../ui/Button";
import { toast } from "react-hot-toast";

interface EconomyDashboardProps {
	gachaConfig: GachaConfig;
}

export function EconomyDashboard({ gachaConfig }: EconomyDashboardProps) {
	const { address } = useAccount();

	// Economy Manager data
	const {
		data: economyData,
		isLoading: economyLoading,
		refetch: refetchEconomyData,
	} = useGachaEconomyManagerData({
		contractAddress: gachaConfig.economyManagerAddress,
	});

	// Depositor Vault data
	const depositorVaultProps: any = {
		contractAddress: gachaConfig.depositorVaultAddress,
	};
	if (address) {
		depositorVaultProps.userAddress = address;
	}
	const {
		data: depositorData,
		userData: depositorUserData,
		isLoading: depositorLoading,
		refetch: refetchDepositorVault,
	} = useDepositorVaultData(depositorVaultProps);

	
	// Protocol Treasury data
	const {
		data: protocolData,
		isLoading: protocolLoading,
		refetch: refetchProtocolTreasury,
	} = useProtocolTreasuryData({
		contractAddress: gachaConfig.protocolTreasuryAddress,
	});

	// Claim yield functionality
	const { claimYield, isClaiming, claimError } = useClaimYield();

	const { canClaim } = useSimulateClaimYield({
		contractAddress: gachaConfig.depositorVaultAddress,
		account: address || "",
		recipient: address || "",
	});

	const handleClaimYield = async () => {
		if (!address) {
			toast.error("Please connect your wallet");
			return;
		}

		if (!canClaim) {
			toast.error("Cannot claim yield at this time");
			return;
		}

		try {
			await claimYield({
				address: gachaConfig.depositorVaultAddress as `0x${string}`,
				args: [address as `0x${string}`, address as `0x${string}`],
			});

			toast.success("Yield claimed successfully!");
			refetchDepositorVault();
		} catch (error) {
			console.error("Error claiming yield:", error);
			toast.error("Failed to claim yield");
		}
	};

	// Register refetch functions with the rewards system
	useRegisterRewardsRefetch("economyData", refetchEconomyData);
	useRegisterRewardsRefetch("depositorVault", refetchDepositorVault);
	useRegisterRewardsRefetch("protocolTreasury", refetchProtocolTreasury);

	const isLoading =
		economyLoading || depositorLoading || protocolLoading;

	if (isLoading) {
		return (
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				{[
					{ id: "depositor-vault-skeleton" },
					{ id: "protocol-treasury-skeleton" },
					{ id: "revenue-overview-skeleton" },
				].map((skeleton) => (
					<GlassCard key={skeleton.id} className="p-6">
						<Skeleton className="h-4 w-3/4 mb-4" />
						<Skeleton className="h-8 w-1/2 mb-2" />
						<Skeleton className="h-3 w-full" />
					</GlassCard>
				))}
			</div>
		);
	}

	const revenueShares = calculateRevenueShares(
		economyData.depositorShareBps || 0n,
		economyData.buybackShareBps || 0n,
		economyData.protocolShareBps || 0n,
	);

	const treasuryStatus = getTreasuryStatus(protocolData.paused);
	const userIsOwner = isOwner(protocolData.owner, address);

	return (
		<div className="space-y-8">
			{/* Revenue Distribution Overview */}
			<GlassCard className="p-6">
				<h3 className="text-xl font-bold text-white mb-6">
					Revenue Distribution
				</h3>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
					<Card className="p-4 text-center">
						<div className="text-3xl mb-2">🏦</div>
						<div className="text-sm text-gray-400 mb-1">Depositors</div>
						<div className="text-2xl font-bold text-blue-400">
							{revenueShares.depositor}
						</div>
					</Card>

					<Card className="p-4 text-center">
						<div className="text-3xl mb-2">🔄</div>
						<div className="text-sm text-gray-400 mb-1">Buyback</div>
						<div className="text-2xl font-bold text-green-400">
							{revenueShares.buyback}
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

			{/* Depositor Vault */}
			<GlassCard className="p-6">
				<div className="flex justify-between items-center mb-4">
					<h3 className="text-lg font-bold text-white">Depositor Vault</h3>
					<div className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
						Active
					</div>
				</div>

				<div className="space-y-4">
					<div className="flex justify-between">
						<span className="text-gray-400">Total Shares</span>
						<span className="text-white font-medium">
							{formatTokenAmount(depositorData.totalShares)}
						</span>
					</div>

					<div className="flex justify-between">
						<span className="text-gray-400">Your Shares</span>
						<span className="text-white font-medium">
							{formatTokenAmount(depositorUserData.shares)}
						</span>
					</div>

					<div className="flex justify-between">
						<span className="text-gray-400">Your Share %</span>
						<span className="text-white font-medium">
							{calculateUserSharePercentage(
								depositorUserData.shares || 0n,
								depositorData.totalShares || 0n,
							)}
						</span>
					</div>

					<div className="flex justify-between">
						<span className="text-gray-400">Your Pending Yield</span>
						<span className="text-green-400 font-medium">
							<TokenAmountDisplay
								amount={depositorUserData.pendingYield}
								showUsd={true}
							/>
						</span>
					</div>

					<div className="flex justify-between">
						<span className="text-gray-400">Your Est. Yield</span>
						<span className="text-green-400 font-medium">
							<TokenAmountDisplay
								amount={depositorUserData.yieldValue}
								showUsd={true}
							/>
						</span>
					</div>

					{/* Claim Yield Button */}
					{address && (
						<div className="mt-4 pt-4 border-t border-white/10">
							<Button
								onClick={handleClaimYield}
								disabled={!depositorUserData.pendingYield || depositorUserData.pendingYield <= 0n || isClaiming}
								className="w-full h-12 font-semibold rounded-xl bg-gradient-to-r from-success to-emerald-500 hover:from-success/90 hover:to-emerald-500/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
							>
								{isClaiming ? (
									<span className="flex items-center justify-center gap-2">
										<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
										Claiming...
									</span>
								) : depositorUserData.pendingYield && depositorUserData.pendingYield > 0n ? (
									`Claim ${formatTokenAmount(depositorUserData.pendingYield)} USDC`
								) : (
									"No Yield Available"
								)}
							</Button>

							{claimError && (
								<p className="text-red-400 text-sm mt-2">
									{claimError.message}
								</p>
							)}
						</div>
					)}
				</div>
			</GlassCard>

			{/* Protocol Treasury */}
			<GlassCard className="p-6">
				<div className="flex justify-between items-center mb-4">
					<h3 className="text-lg font-bold text-white">Protocol Treasury</h3>
					<div className="flex items-center gap-2">
						<div
							className={`px-3 py-1 rounded-full text-sm ${
								treasuryStatus === "active"
									? "bg-green-500/20 text-green-300"
									: "bg-red-500/20 text-red-300"
							}`}
						>
							{treasuryStatus.charAt(0).toUpperCase() + treasuryStatus.slice(1)}
						</div>
						{userIsOwner && (
							<div className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
								Owner
							</div>
						)}
					</div>
				</div>

				<Card className="p-4">
					<div className="space-y-3">
						<div className="flex justify-between">
							<span className="text-gray-400">Treasury Address</span>
							<span className="text-sm text-white font-mono bg-gray-800 px-2 py-1 rounded">
								{protocolData.owner?.slice(0, 6)}...
								{protocolData.owner?.slice(-4)}
							</span>
						</div>
					</div>
				</Card>
			</GlassCard>

			{/* Revenue by Rarity */}
			{economyData.revenueByRarity && (
				<GlassCard className="p-6">
					<h3 className="text-lg font-bold text-white mb-4">
						Revenue by Rarity
					</h3>
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
									<TokenAmountDisplay
										amount={economyData.revenueByRarity?.[index]}
										showUsd={false}
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
