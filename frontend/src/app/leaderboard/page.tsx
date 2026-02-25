"use client";

import {
	ChartBarIcon,
	CubeTransparentIcon,
	RocketLaunchIcon,
	TrophyIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { useMemo } from "react";
import {
	GachaLeaderboardTable,
	GlobalStatsBar,
	RarityDistributionChart,
	RecentActivityFeed,
	TreasuryStatsGrid,
	UserStatsCard,
} from "../../components/leaderboard";
import { useLeaderboardAnalytics } from "../../hooks/useLeaderboardAnalytics";
import { getAllActiveGachas } from "../../lib/gacha-config";

function SectionHeader({
	icon: Icon,
	label,
	title,
	description,
}: {
	icon: typeof ChartBarIcon;
	label: string;
	title: string;
	description: string;
}) {
	return (
		<div className="flex items-start gap-3 mb-6">
			<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-warning/30 bg-warning/10">
				<Icon className="h-5 w-5 text-warning" />
			</div>
			<div>
				<p className="text-xs uppercase tracking-[0.3em] text-warning/70 font-medium mb-1">
					{label}
				</p>
				<h2 className="text-xl font-semibold text-foreground">{title}</h2>
				<p className="text-sm text-foreground/60 mt-0.5">{description}</p>
			</div>
		</div>
	);
}

export default function LeaderboardPage() {
	const analytics = useLeaderboardAnalytics();
	const allGachas = useMemo(() => getAllActiveGachas(), []);

	// Use the first gacha for user stats when multiple exist
	const primaryGacha = allGachas[0];

	return (
		<div className="min-h-screen bg-transparent">
			<div className="mx-auto w-full max-w-7xl px-4 pt-12 pb-20 sm:px-6 lg:px-8">
				{/* Page header */}
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="mb-12 text-center"
				>
					<div className="inline-flex items-center gap-2 px-4 py-2 bg-content1/10 backdrop-blur-sm rounded-full border border-white/20 mb-6">
						<TrophyIcon className="w-4 h-4 text-warning" />
						<span className="text-sm font-medium text-foreground/80">
							Protocol Analytics
						</span>
					</div>

					<h1 className="text-4xl md:text-6xl font-black mb-4">
						<span className="bg-gradient-to-r from-warning via-orange-400 to-yellow-500 bg-clip-text text-transparent">
							Leaderboard
						</span>{" "}
						<span className="text-foreground/90">&amp; Analytics</span>
					</h1>

					<p className="text-lg text-foreground/70 max-w-2xl mx-auto leading-relaxed">
						Live protocol statistics, rarity distributions, and treasury health
						across all SPINFI gacha collections.
					</p>
				</motion.div>

				<div className="space-y-12">
					{/* ─── Global Stats ─── */}
					<motion.section
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.1 }}
						aria-label="Global Protocol Stats"
					>
						<SectionHeader
							icon={ChartBarIcon}
							label="Overview"
							title="Global Protocol Stats"
							description="Aggregated metrics across all active gacha collections"
						/>
						<GlobalStatsBar analytics={analytics} />
					</motion.section>

					{/* ─── Rarity Distribution + Activity Feed ─── */}
					<motion.section
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.2 }}
						aria-label="Rarity Distribution"
					>
						<SectionHeader
							icon={RocketLaunchIcon}
							label="Win Data"
							title="Rarity Distribution"
							description="How NFT wins are distributed across rarity tiers"
						/>
						<div className="grid gap-6 lg:grid-cols-5">
							<div className="lg:col-span-3">
								<RarityDistributionChart
									rarityWinCounts={analytics.globalRarityWinCounts}
									rarityCounts={
										analytics.perGacha.length > 0
											? analytics.perGacha[0]?.rarityCounts
											: undefined
									}
									isLoading={analytics.isLoading}
								/>
							</div>
							<div className="lg:col-span-2">
								<RecentActivityFeed
									gachas={allGachas}
									maxItems={8}
								/>
							</div>
						</div>
					</motion.section>

					{/* ─── Collection Performance ─── */}
					<motion.section
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.3 }}
						aria-label="Collection Performance"
					>
						<SectionHeader
							icon={TrophyIcon}
							label="Collections"
							title="Collection Performance"
							description="Spin activity and NFT win rates per gacha collection"
						/>
						<GachaLeaderboardTable
							gachas={analytics.perGacha}
							isLoading={analytics.isLoading}
						/>
					</motion.section>

					{/* ─── Treasury Health ─── */}
					<motion.section
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.4 }}
						aria-label="Treasury Health"
					>
						<SectionHeader
							icon={CubeTransparentIcon}
							label="Treasury"
							title="Treasury Health"
							description="NFT pool availability and deposit stats per collection"
						/>
						<TreasuryStatsGrid
							gachas={analytics.perGacha}
							isLoading={analytics.isLoading}
						/>
					</motion.section>

					{/* ─── Your Stats ─── */}
					{primaryGacha && (
						<motion.section
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.5 }}
							aria-label="Your Personal Statistics"
						>
							<SectionHeader
								icon={TrophyIcon}
								label="Personal"
								title="Your Statistics"
								description="Your personal spin history and rarity win breakdown"
							/>
							<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
								{allGachas.map((gacha) => (
									<UserStatsCard
										key={gacha.id}
										gachaAddress={gacha.address}
										gachaId={gacha.id}
										gachaTitle={gacha.title}
									/>
								))}
							</div>
						</motion.section>
					)}
				</div>
			</div>
		</div>
	);
}
