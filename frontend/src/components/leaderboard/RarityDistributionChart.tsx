"use client";

import { DEFAULT_RARITY_CONFIG, getRarityConfig } from "@/lib/rarityConfig";
import { Card, Skeleton } from "@/ui";

interface RarityDistributionChartProps {
	/** Win counts per rarity tier (as numbers, converted from BigInt at page level) */
	rarityWinCounts: readonly number[] | number[];
	title?: string | undefined;
	isLoading: boolean;
}

const RARITIES = DEFAULT_RARITY_CONFIG.map((_, i) => i);

// Bar colors derived from the default rarity config hex colors
const RARITY_BAR_COLORS: string[] = DEFAULT_RARITY_CONFIG.map(
	(c) => c.hexColor,
);

export function RarityDistributionChart({
	rarityWinCounts,
	title = "Rarity Win Distribution",
	isLoading,
}: RarityDistributionChartProps) {
	const totalWins = RARITIES.reduce(
		(sum, r) => sum + (rarityWinCounts[r] ?? 0),
		0,
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
					const config = getRarityConfig(rarity);
					const wins = rarityWinCounts[rarity] ?? 0;
					const pct =
						totalWins > 0
							? (wins / totalWins) * 100
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
										{wins.toLocaleString()} wins
									</span>
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

			{totalWins === 0 && (
				<p className="text-center text-sm text-foreground/40 mt-4">
					No wins recorded yet. Be the first to spin!
				</p>
			)}
		</Card>
	);
}
