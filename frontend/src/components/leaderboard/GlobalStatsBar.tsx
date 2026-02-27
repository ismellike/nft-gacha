"use client";

import {
	BoltIcon,
	CubeIcon,
	FireIcon,
	TrophyIcon,
} from "@heroicons/react/24/outline";
import { Card, Skeleton } from "@/ui";

interface StatCardProps {
	icon: typeof BoltIcon;
	label: string;
	value: string;
	sublabel?: string | undefined;
	iconColor: string;
	borderColor: string;
	isLoading: boolean;
}

function StatCard({
	icon: Icon,
	label,
	value,
	sublabel,
	iconColor,
	borderColor,
	isLoading,
}: StatCardProps) {
	return (
		<Card
			className={`p-5 border ${borderColor} bg-content1/20 backdrop-blur-xl rounded-2xl`}
		>
			<div className="flex items-start gap-4">
				<div
					className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${borderColor} bg-content1/30`}
				>
					<Icon className={`h-5 w-5 ${iconColor}`} />
				</div>
				<div className="min-w-0 flex-1">
					<p className="text-xs uppercase tracking-[0.25em] text-foreground/50 mb-1">
						{label}
					</p>
					{isLoading ? (
						<Skeleton variant="text" size="h8" className="w-24 mt-1" />
					) : (
						<p className="text-2xl font-bold text-foreground truncate">
							{value}
						</p>
					)}
					{sublabel && (
						<p className="text-xs text-foreground/40 mt-1">{sublabel}</p>
					)}
				</div>
			</div>
		</Card>
	);
}

export interface GlobalStats {
	totalSpins: number;
	totalNftsWon: number;
	totalItems: number;
	activeGachas: number;
	isLoading: boolean;
}

interface GlobalStatsBarProps {
	stats: GlobalStats;
}

export function GlobalStatsBar({ stats }: GlobalStatsBarProps) {
	const { totalSpins, totalNftsWon, totalItems, activeGachas, isLoading } =
		stats;

	const winRate =
		totalSpins > 0
			? ((totalNftsWon / totalSpins) * 100).toFixed(1)
			: "0.0";

	const statCards: StatCardProps[] = [
		{
			icon: BoltIcon,
			label: "Total Spins",
			value: totalSpins.toLocaleString(),
			sublabel: "All-time across all gachas",
			iconColor: "text-warning",
			borderColor: "border-warning/20",
			isLoading,
		},
		{
			icon: TrophyIcon,
			label: "NFTs Won",
			value: totalNftsWon.toLocaleString(),
			sublabel: `${winRate}% win rate`,
			iconColor: "text-success",
			borderColor: "border-success/20",
			isLoading,
		},
		{
			icon: CubeIcon,
			label: "Treasury Items",
			value: totalItems.toLocaleString(),
			sublabel: "Available for spins",
			iconColor: "text-primary",
			borderColor: "border-primary/20",
			isLoading,
		},
		{
			icon: FireIcon,
			label: "Active Gachas",
			value: activeGachas.toLocaleString(),
			sublabel: "Live collections",
			iconColor: "text-danger",
			borderColor: "border-danger/20",
			isLoading: false,
		},
	];

	return (
		<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
			{statCards.map((stat) => (
				<StatCard key={stat.label} {...stat} />
			))}
		</div>
	);
}
