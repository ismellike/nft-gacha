"use client";

import { RARITY_CONFIG, Rarity } from "@/lib/rarityConfig";
import { Card, Skeleton } from "@/ui";

interface RarityDistributionChartProps {
	/** Win counts per rarity tier [common, uncommon, rare, epic, legendary] */
	rarityWinCounts: readonly bigint[] | bigint[];
	/** Treasury item counts per rarity tier */
	rarityCounts?: readonly bigint[] | undefined;
	title?: string | undefined;
	isLoading: boolean;
}

const RARITIES = [
	Rarity.Common,
	Rarity.Uncommon,
	Rarity.Rare,
	Rarity.Epic,
	Rarity.Legendary,
] as const;

// Bar colors that map from rarity hex colors (using inline styles for dynamic values)
const RARITY_BAR_COLORS: Record<Rarity, string> = {
	[Rarity.Common]: "#9CA3AF",
	[Rarity.Uncommon]: "#10B981",
	[Rarity.Rare]: "#3B82F6",
	[Rarity.Epic]: "#8B5CF6",
	[Rarity.Legendary]: "#F59E0B",
};

export function RarityDistributionChart({
	rarityWinCounts,
	rarityCounts,
	title = "Rarity Win Distribution",
	isLoading,
}: RarityDistributionChartProps) {
	const totalWins = RARITIES.reduce(
		(sum, r) => sum + (rarityWinCounts[r] ?? 0n),
		0n,
	);

	if (isLoading) {
		return (
			<Card className="p-6 bg-content1/20 backdrop-blur-xl border border-white/10 rounded-2xl">
				<Skeleton variant="text" size="h6" className="w-48 mb-6" />
				<div className="space-y-4">
					{RARITIES.map((r) => (
						<div key={r} className="space-y-1">
							<div className="flex justify-between">
								<Skeleton variant="text" size="h4" className="w-20" />
								<Skeleton variant="text" size="h4" className="w-12" />
							</div>
							<Skeleton variant="default" size="h6" className="w-full rounded-full" />
						</div>
					))}
				</div>
			</Card>
		);
	}

	return (
		<Card className="p-6 bg-content1/20 backdrop-blur-xl border border-white/10 rounded-2xl">
			<h3 className="text-base font-semibold text-foreground mb-6">{title}</h3>

			<div className="space-y-4">
				{RARITIES.map((rarity) => {
					const config = RARITY_CONFIG[rarity];
					const wins = rarityWinCounts[rarity] ?? 0n;
					const available = rarityCounts ? (rarityCounts[rarity] ?? 0n) : null;
					const pct =
						totalWins > 0n
							? Number((wins * 10000n) / totalWins) / 100
							: 0;
					const barColor = RARITY_BAR_COLORS[rarity];

					return (
						<div key={rarity} className="space-y-1.5">
							<div className="flex items-center justify-between text-sm">
								<span className="flex items-center gap-2 font-medium text-foreground/80">
									<span className="text-base leading-none">{config.emoji}</span>
									{config.name}
								</span>
								<div className="flex items-center gap-3 text-foreground/60 text-xs">
									<span className="font-mono">
										{Number(wins).toLocaleString()} wins
									</span>
									{available !== null && (
										<span className="font-mono text-foreground/40">
											/ {Number(available).toLocaleString()} avail.
										</span>
									)}
									<span
										className="font-semibold min-w-[3.5rem] text-right"
										style={{ color: barColor }}
									>
										{pct.toFixed(1)}%
									</span>
								</div>
							</div>

							{/* Bar track */}
							<div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
								<div
									className="h-full rounded-full transition-all duration-700"
									style={{
										width: `${pct}%`,
										background: barColor,
										boxShadow: `0 0 8px ${barColor}60`,
									}}
								/>
							</div>
						</div>
					);
				})}
			</div>

			{totalWins === 0n && (
				<p className="text-center text-sm text-foreground/40 mt-4">
					No wins recorded yet. Be the first to spin!
				</p>
			)}
		</Card>
	);
}
