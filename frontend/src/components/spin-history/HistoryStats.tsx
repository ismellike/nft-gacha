"use client";

import { memo } from "react";
import { formatCurrency } from "@/lib/utils";
import { useSpinHistoryStore } from "@/stores/spinHistoryStore";
import { Card } from "@/ui/Card";

interface HistoryStatsProps {
	userAddress: string;
	gachaAddress: string;
}

const HistoryStats = memo(
	({ userAddress, gachaAddress }: HistoryStatsProps) => {
		const { getStats } = useSpinHistoryStore();
		const stats = getStats(userAddress, gachaAddress);

		return (
			<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
				<Card variant="base" padding="md">
					<div className="flex flex-col">
						<span className="text-xs text-foreground/60">Total Spins</span>
						<span className="mt-1 text-2xl font-semibold text-foreground">
							{stats.totalSpins}
						</span>
						<div className="mt-1 flex gap-2 text-[11px]">
							<span className="text-success/80">
								{stats.completedSpins} Won
							</span>
							<span className="text-warning/80">
								{stats.refundedSpins} Refunded
							</span>
						</div>
					</div>
				</Card>

				<Card variant="base" padding="md">
					<div className="flex flex-col">
						<span className="text-xs text-foreground/60">Win Rate</span>
						<span className="mt-1 text-2xl font-semibold text-foreground">
							{stats.winRate.toFixed(1)}%
						</span>
						<span className="mt-1 text-[11px] text-foreground/40">
							{stats.totalSpins > 0
								? `${stats.completedSpins} of ${stats.totalSpins} spins`
								: "No spins yet"}
						</span>
					</div>
				</Card>

				<Card variant="base" padding="md">
					<div className="flex flex-col">
						<span className="text-xs text-foreground/60">Total Value Won</span>
						<span className="mt-1 text-2xl font-semibold text-foreground">
							{stats.totalValueWon > 0n
								? formatCurrency(stats.totalValueWon, 18)
								: "$0.00"}
						</span>
						<span className="mt-1 text-[11px] text-foreground/40">
							{stats.completedSpins > 0 ? "Total appraised value" : "—"}
						</span>
					</div>
				</Card>
			</div>
		);
	},
);

HistoryStats.displayName = "HistoryStats";

export { HistoryStats };
