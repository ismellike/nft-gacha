"use client";

import { UserCircleIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useAccount } from "wagmi";
import { useUserLeaderboardStats } from "@/hooks/useLeaderboardAnalytics";
import { DEFAULT_RARITY_CONFIG, getRarityConfig } from "@/lib/rarityConfig";
import { Button, Card, Skeleton } from "@/ui";

interface UserStatsCardProps {
	gachaAddress: string | undefined;
	gachaId: string;
	gachaTitle: string;
}

const RARITIES = DEFAULT_RARITY_CONFIG.map((_, i) => i);

export function UserStatsCard({
	gachaAddress,
	gachaId,
	gachaTitle,
}: UserStatsCardProps) {
	const { address, isConnected } = useAccount();

	const { data: batchRaw, isLoading } = useUserLeaderboardStats(
		gachaAddress,
		address,
	);

	const batchData = batchRaw as
		| [bigint, bigint, bigint, readonly bigint[], bigint]
		| undefined;

	const totalSpins = batchData?.[0] ?? 0n;
	const totalRefunds = batchData?.[1] ?? 0n;
	const totalReclaims = batchData?.[2] ?? 0n;
	const rarityWins = batchData?.[3] ?? [];
	const totalWins = rarityWins.reduce((sum, c) => sum + c, 0n);

	if (!isConnected) {
		return (
			<Card className="p-6 bg-content1/20 backdrop-blur-xl border border-white/10 rounded-2xl">
				<div className="flex flex-col items-center justify-center gap-4 py-4 text-center">
					<div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-content1/30">
						<UserCircleIcon className="h-6 w-6 text-foreground/40" />
					</div>
					<div>
						<p className="font-medium text-foreground/70 text-sm">
							Your Stats for {gachaTitle}
						</p>
						<p className="text-xs text-foreground/40 mt-1">
							Connect your wallet to see your personal statistics
						</p>
					</div>
					<Link href={`/gacha/?id=${gachaId}&section=spin`}>
						<Button color="glassPrimary" size="sm">
							Play Now
						</Button>
					</Link>
				</div>
			</Card>
		);
	}

	return (
		<Card className="p-6 bg-content1/20 backdrop-blur-xl border border-white/10 rounded-2xl">
			{/* Header */}
			<div className="flex items-center justify-between mb-5">
				<div className="flex items-center gap-3">
					<div className="flex h-9 w-9 items-center justify-center rounded-xl border border-warning/30 bg-warning/10">
						<UserCircleIcon className="h-5 w-5 text-warning" />
					</div>
					<div>
						<p className="text-sm font-semibold text-foreground">
							Your {gachaTitle} Stats
						</p>
						{address && (
							<p className="text-xs text-foreground/40 font-mono">
								{address.slice(0, 6)}...{address.slice(-4)}
							</p>
						)}
					</div>
				</div>
				<Link
					href={`/gacha/?id=${gachaId}&section=history`}
					className="text-xs text-foreground/40 hover:text-warning transition-colors underline underline-offset-2"
				>
					View history
				</Link>
			</div>

			{/* Stats grid */}
			<div className="grid grid-cols-3 gap-3 mb-5">
				{[
					{
						label: "Spins",
						value: isLoading ? null : Number(totalSpins).toLocaleString(),
					},
					{
						label: "NFTs Won",
						value: isLoading ? null : Number(totalWins).toLocaleString(),
					},
					{
						label: "Refunds",
						value: isLoading
							? null
							: Number(totalRefunds + totalReclaims).toLocaleString(),
					},
				].map(({ label, value }) => (
					<div
						key={label}
						className="rounded-xl border border-white/5 bg-content1/30 p-3 text-center"
					>
						<p className="text-xs uppercase tracking-wide text-foreground/40 mb-1">
							{label}
						</p>
						{value === null ? (
							<Skeleton variant="text" size="h6" className="w-10 mx-auto" />
						) : (
							<p className="text-lg font-bold text-foreground">{value}</p>
						)}
					</div>
				))}
			</div>

			{/* Rarity wins breakdown */}
			<div className="space-y-2">
				<p className="text-xs uppercase tracking-wide text-foreground/40 mb-2">
					Wins by rarity
				</p>
				{RARITIES.map((rarity) => {
					const config = getRarityConfig(rarity);
					const wins = rarityWins[rarity] ?? 0n;

					return (
						<div
							key={rarity}
							className="flex items-center justify-between text-sm"
						>
							<span className="flex items-center gap-2 text-foreground/60">
								<span className="text-base leading-none">{config.emoji}</span>
								{config.name}
							</span>
							{isLoading ? (
								<Skeleton variant="text" size="h4" className="w-8" />
							) : (
								<span
									className="font-mono font-semibold"
									style={{ color: wins > 0n ? config.hexColor : undefined }}
								>
									{Number(wins).toLocaleString()}
								</span>
							)}
						</div>
					);
				})}
			</div>
		</Card>
	);
}
