"use client";

import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useReadContract } from "wagmi";
import { gachaTreasuryAbi } from "@/generated";
import type { GachaAnalytics } from "@/hooks/useLeaderboardAnalytics";
import { cn } from "@/lib/theme-config";
import { RARITY_CONFIG, Rarity } from "@/lib/rarityConfig";
import { Card, Skeleton } from "@/ui";

const RARITIES = [
	Rarity.Common,
	Rarity.Uncommon,
	Rarity.Rare,
	Rarity.Epic,
	Rarity.Legendary,
] as const;

interface TreasuryCardProps {
	gacha: GachaAnalytics;
}

function TreasuryCard({ gacha }: TreasuryCardProps) {
	const { data: globalStatsRaw, isLoading: isLoadingStats } = useReadContract({
		address: gacha.config.treasuryAddress as `0x${string}`,
		abi: gachaTreasuryAbi,
		functionName: "getGlobalStats",
		query: {
			enabled: !!gacha.config.treasuryAddress,
			refetchInterval: 60000,
		},
	});

	const globalStats = globalStatsRaw as
		| [bigint, bigint, bigint]
		| undefined;
	const totalDeposited = globalStats?.[0] ?? 0n;
	const totalClaimed = globalStats?.[1] ?? 0n;

	return (
		<Card className="p-5 bg-content1/20 backdrop-blur-xl border border-white/10 rounded-2xl">
			{/* Header */}
			<div className="flex items-start justify-between mb-5">
				<div>
					<h4 className="font-semibold text-foreground text-sm">
						{gacha.config.title}
					</h4>
					<p className="text-xs text-foreground/40 mt-0.5">
						{Number(gacha.totalItems).toLocaleString()} items available
					</p>
				</div>
				<Link
					href={`/gacha/?id=${gacha.config.id}&section=vault`}
					className="text-foreground/30 hover:text-warning transition-colors"
					aria-label={`View ${gacha.config.title} vault`}
				>
					<ArrowTopRightOnSquareIcon className="h-4 w-4" />
				</Link>
			</div>

			{/* Rarity pool breakdown */}
			<div className="space-y-2 mb-5">
				{RARITIES.map((rarity) => {
					const config = RARITY_CONFIG[rarity];
					const count = gacha.rarityCounts[rarity] ?? 0n;
					const total = gacha.totalItems;
					const pct =
						total > 0n ? Number((count * 100n) / total) : 0;

					return (
						<div key={rarity} className="flex items-center gap-2">
							<span className="w-5 text-center text-sm leading-none">
								{config.emoji}
							</span>
							<div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
								<div
									className="h-full rounded-full"
									style={{
										width: `${pct}%`,
										backgroundColor: config.hexColor,
										opacity: count === 0n ? 0.2 : 1,
									}}
								/>
							</div>
							<span
								className={cn(
									"text-xs font-mono w-8 text-right",
									count === 0n
										? "text-foreground/20"
										: "text-foreground/60",
								)}
							>
								{Number(count)}
							</span>
						</div>
					);
				})}
			</div>

			{/* Deposit stats */}
			<div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
				<div>
					<p className="text-xs uppercase tracking-wide text-foreground/40 mb-1">
						Deposited
					</p>
					{isLoadingStats ? (
						<Skeleton variant="text" size="h4" className="w-16" />
					) : (
						<p className="text-sm font-mono font-semibold text-foreground">
							{Number(totalDeposited).toLocaleString()}
						</p>
					)}
				</div>
				<div>
					<p className="text-xs uppercase tracking-wide text-foreground/40 mb-1">
						Claimed
					</p>
					{isLoadingStats ? (
						<Skeleton variant="text" size="h4" className="w-16" />
					) : (
						<p className="text-sm font-mono font-semibold text-foreground">
							{Number(totalClaimed).toLocaleString()}
						</p>
					)}
				</div>
			</div>
		</Card>
	);
}

interface TreasuryStatsGridProps {
	gachas: GachaAnalytics[];
	isLoading: boolean;
}

export function TreasuryStatsGrid({ gachas, isLoading }: TreasuryStatsGridProps) {
	if (isLoading) {
		return (
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{[0, 1, 2].map((i) => (
					<Card
						key={i}
						className="p-5 bg-content1/20 backdrop-blur-xl border border-white/10 rounded-2xl"
					>
						<Skeleton variant="text" size="h6" className="w-36 mb-4" />
						<div className="space-y-2 mb-4">
							{RARITIES.map((r) => (
								<Skeleton key={r} variant="default" size="h4" className="w-full" />
							))}
						</div>
						<div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
							<Skeleton variant="text" size="h4" className="w-16" />
							<Skeleton variant="text" size="h4" className="w-16" />
						</div>
					</Card>
				))}
			</div>
		);
	}

	if (gachas.length === 0) {
		return (
			<Card className="p-8 text-center bg-content1/20 backdrop-blur-xl border border-white/10 rounded-2xl">
				<p className="text-foreground/40 text-sm">
					No gacha collections configured.
				</p>
			</Card>
		);
	}

	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
			{gachas.map((gacha) => (
				<TreasuryCard key={gacha.config.id} gacha={gacha} />
			))}
		</div>
	);
}
