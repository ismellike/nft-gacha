"use client";

import { useUserOnChainStats } from "@/hooks/useUserOnChainStats";
import { getAllRarities, getRarityConfig } from "@/lib/rarityConfig";
import { formatCurrency } from "@/lib/utils";
import { Card, Chip, StatsSkeleton } from "@/ui";
import { useAccount } from "wagmi";

interface OnChainStatsProps {
	gachaAddress?: string | undefined;
	treasuryAddress?: string | undefined;
}

function RarityBar({ rarityWins }: { rarityWins: readonly bigint[] }) {
	const rarities = getAllRarities();
	const total = rarityWins.reduce((sum, v) => sum + Number(v), 0);

	if (total === 0) {
		return (
			<div className="text-white/50 text-xs text-center py-2">
				No wins recorded yet
			</div>
		);
	}

	return (
		<div className="space-y-2">
			{/* Segmented bar */}
			<div className="flex h-3 rounded-full overflow-hidden bg-white/10">
				{rarities.map((rarity) => {
					const count = Number(rarityWins[rarity] ?? 0n);
					if (count === 0) return null;
					const percent = (count / total) * 100;
					const config = getRarityConfig(rarity);
					return (
						<div
							key={rarity}
							className="h-full transition-all duration-500"
							style={{
								width: `${percent}%`,
								backgroundColor: config.hexColor,
							}}
							title={`${config.name}: ${count} (${percent.toFixed(1)}%)`}
						/>
					);
				})}
			</div>
			{/* Legend */}
			<div className="flex flex-wrap gap-2">
				{rarities.map((rarity) => {
					const count = Number(rarityWins[rarity] ?? 0n);
					if (count === 0) return null;
					const config = getRarityConfig(rarity);
					return (
						<div
							key={rarity}
							className="flex items-center gap-1 text-xs text-white/70"
						>
							<span
								className="inline-block w-2 h-2 rounded-full"
								style={{ backgroundColor: config.hexColor }}
							/>
							<span>
								{config.emoji} {config.name}: {count}
							</span>
						</div>
					);
				})}
			</div>
		</div>
	);
}

function StatCard({
	label,
	value,
	subtitle,
}: {
	label: string;
	value: string;
	subtitle?: string | undefined;
}) {
	return (
		<Card color="glass" className="p-3">
			<p className="text-white/60 text-xs mb-1">{label}</p>
			<p className="text-white font-bold text-lg">{value}</p>
			{subtitle && <p className="text-white/50 text-xs mt-0.5">{subtitle}</p>}
		</Card>
	);
}

export function OnChainStats({
	gachaAddress,
	treasuryAddress,
}: OnChainStatsProps) {
	const { address } = useAccount();
	const { spinAnalytics, globalAnalytics, depositProfile, isLoading, isError } =
		useUserOnChainStats({ gachaAddress, treasuryAddress });

	if (!address) return null;
	if (isError) return null;

	if (isLoading) {
		return (
			<div className="space-y-4">
				<h3 className="text-white/80 font-semibold text-sm uppercase tracking-wide">
					On-Chain Analytics
				</h3>
				<StatsSkeleton className="grid-cols-3" />
			</div>
		);
	}

	if (!spinAnalytics) return null;

	const userSpins = Number(spinAnalytics.totalSpins);
	const globalSpins = globalAnalytics ? Number(globalAnalytics.totalSpins) : 0;
	const spinPercent =
		globalSpins > 0 ? ((userSpins / globalSpins) * 100).toFixed(1) : "0";
	const refundRate =
		userSpins > 0
			? ((Number(spinAnalytics.totalRefunds) / userSpins) * 100).toFixed(1)
			: "0";
	const reclaimRate =
		userSpins > 0
			? ((Number(spinAnalytics.totalReclaims) / userSpins) * 100).toFixed(1)
			: "0";

	const mapChipColor = (
		chipColor: string,
	): "primary" | "secondary" | "success" | "warning" | "danger" | "glass" => {
		return chipColor as
			| "primary"
			| "secondary"
			| "success"
			| "warning"
			| "danger"
			| "glass";
	};

	return (
		<div className="space-y-4">
			<h3 className="text-white/80 font-semibold text-sm uppercase tracking-wide">
				On-Chain Analytics
			</h3>

			{/* Spin Analytics */}
			<div className="space-y-3">
				<div className="grid grid-cols-3 gap-3">
					<StatCard
						label="On-Chain Spins"
						value={userSpins.toLocaleString()}
						subtitle={`${spinPercent}% of global`}
					/>
					<StatCard
						label="Total Refunds"
						value={Number(spinAnalytics.totalRefunds).toLocaleString()}
						subtitle={`${refundRate}% refund rate`}
					/>
					<StatCard
						label="Total Reclaims"
						value={Number(spinAnalytics.totalReclaims).toLocaleString()}
						subtitle={`${reclaimRate}% reclaim rate`}
					/>
				</div>

				{/* Rarity Win Distribution */}
				<Card color="glass" className="p-3">
					<p className="text-white/60 text-xs mb-2">Rarity Win Distribution</p>
					<RarityBar rarityWins={spinAnalytics.rarityWins} />
				</Card>
			</div>

			{/* Deposit Profile */}
			{treasuryAddress && depositProfile && (
				<div className="space-y-3">
					<h4 className="text-white/60 text-xs uppercase tracking-wide">
						Deposit Profile
					</h4>
					<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
						<Card color="glass" className="p-3">
							<p className="text-white/60 text-xs mb-1">Total Deposits</p>
							<p className="text-white font-bold text-lg">
								{Number(depositProfile.totalDeposits).toLocaleString()}
							</p>
							<div className="flex flex-wrap gap-1 mt-1">
								{getAllRarities().map((rarity) => {
									const count = Number(
										depositProfile.depositCounts[rarity] ?? 0n,
									);
									if (count === 0) return null;
									const config = getRarityConfig(rarity);
									return (
										<Chip
											key={rarity}
											size="sm"
											variant="flat"
											color={mapChipColor(config.chipColor)}
										>
											{config.emoji} {count}
										</Chip>
									);
								})}
							</div>
						</Card>
						<StatCard
							label="Lifetime Deposited"
							value={formatCurrency(
								depositProfile.lifetimeDeposited.toString(),
								18,
								"USD",
							)}
						/>
						<StatCard
							label="Lifetime Claimed"
							value={formatCurrency(
								depositProfile.lifetimeClaimed.toString(),
								18,
								"USD",
							)}
						/>
						<StatCard
							label="Lifetime Withdrawn"
							value={formatCurrency(
								depositProfile.lifetimeWithdrawn.toString(),
								18,
								"USD",
							)}
						/>
						<StatCard
							label="Net Contribution"
							value={formatCurrency(
								depositProfile.netContribution.toString(),
								18,
								"USD",
							)}
							subtitle={
								depositProfile.netContribution > 0n
									? "Positive"
									: depositProfile.netContribution < 0n
										? "Negative"
										: undefined
							}
						/>
					</div>
				</div>
			)}
		</div>
	);
}
