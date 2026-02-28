"use client";

import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import type { GachaAnalytics } from "@/hooks/useLeaderboardAnalytics";
import { DEFAULT_RARITY_CONFIG, getRarityConfig } from "@/lib/rarityConfig";
import { Card, Skeleton } from "@/ui";

interface GachaLeaderboardTableProps {
	gachas: GachaAnalytics[];
	isLoading: boolean;
}

const RARITIES = DEFAULT_RARITY_CONFIG.map((_, i) => i);

function LoadingRow() {
	return (
		<tr className="border-b border-white/5">
			<td className="py-4 px-4">
				<Skeleton variant="text" size="h4" className="w-32" />
			</td>
			<td className="py-4 px-4 text-right">
				<Skeleton variant="text" size="h4" className="w-16 ml-auto" />
			</td>
			<td className="py-4 px-4 text-right">
				<Skeleton variant="text" size="h4" className="w-16 ml-auto" />
			</td>
			{RARITIES.map((r) => (
				<td key={r} className="py-4 px-4 text-right hidden md:table-cell">
					<Skeleton variant="text" size="h4" className="w-10 ml-auto" />
				</td>
			))}
			<td className="py-4 px-4 text-right">
				<Skeleton variant="text" size="h4" className="w-20 ml-auto" />
			</td>
		</tr>
	);
}

function _GachaLeaderboardTable({
	gachas,
	isLoading,
}: GachaLeaderboardTableProps) {
	return (
		<Card className="bg-content1/20 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
			<div className="p-6 border-b border-white/10">
				<h3 className="text-base font-semibold text-foreground">
					Collection Performance
				</h3>
				<p className="text-sm text-foreground/50 mt-1">
					Spin activity and NFT win distribution across all collections
				</p>
			</div>

			<div className="overflow-x-auto">
				<table className="w-full text-sm">
					<thead>
						<tr className="border-b border-white/10 text-foreground/50 text-xs uppercase tracking-wider">
							<th className="text-left py-3 px-4 font-medium">Collection</th>
							<th className="text-right py-3 px-4 font-medium">Total Spins</th>
							<th className="text-right py-3 px-4 font-medium">NFTs Won</th>
							{RARITIES.map((r) => (
								<th
									key={r}
									className="text-right py-3 px-4 font-medium hidden md:table-cell"
								>
									{getRarityConfig(r).emoji}
								</th>
							))}
							<th className="text-right py-3 px-4 font-medium">Avail. Items</th>
						</tr>
					</thead>
					<tbody>
						{isLoading ? (
							<>
								<LoadingRow />
								<LoadingRow />
							</>
						) : gachas.length === 0 ? (
							<tr>
								<td
									colSpan={8}
									className="py-12 text-center text-foreground/40 text-sm"
								>
									No gacha collections found.
								</td>
							</tr>
						) : (
							gachas.map((gacha, index) => {
								const totalWins = RARITIES.reduce(
									(sum, r) => sum + (gacha.globalRarityWinCounts[r] ?? 0n),
									0n,
								);
								const winRate =
									gacha.totalSpins > 0n
										? (
												(Number(totalWins) / Number(gacha.totalSpins)) *
												100
											).toFixed(1)
										: "—";

								return (
									<tr
										key={gacha.config.id}
										className={`border-b border-white/5 hover:bg-white/[0.02] transition-colors ${
											index % 2 === 0 ? "bg-transparent" : "bg-white/[0.01]"
										}`}
									>
										{/* Collection name */}
										<td className="py-4 px-4">
											<div className="flex items-center gap-2">
												<div className="flex flex-col">
													<span className="font-medium text-foreground">
														{gacha.config.title}
													</span>
													<span className="text-xs text-foreground/40">
														ID: {gacha.config.id}
													</span>
												</div>
												<Link
													href={`/gacha/?id=${gacha.config.id}&section=spin`}
													className="ml-1 text-foreground/30 hover:text-warning transition-colors"
													aria-label={`Open ${gacha.config.title}`}
												>
													<ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
												</Link>
											</div>
										</td>

										{/* Total spins */}
										<td className="py-4 px-4 text-right font-mono text-foreground/80">
											{Number(gacha.totalSpins).toLocaleString()}
											{gacha.totalSpins > 0n && (
												<span className="block text-xs text-foreground/40">
													{winRate}% won
												</span>
											)}
										</td>

										{/* NFTs won */}
										<td className="py-4 px-4 text-right font-mono text-foreground/80">
											{Number(totalWins).toLocaleString()}
										</td>

										{/* Per-rarity wins */}
										{RARITIES.map((r) => (
											<td
												key={r}
												className="py-4 px-4 text-right font-mono text-foreground/60 hidden md:table-cell"
											>
												{Number(
													gacha.globalRarityWinCounts[r] ?? 0n,
												).toLocaleString()}
											</td>
										))}

										{/* Available items */}
										<td className="py-4 px-4 text-right font-mono text-foreground/80">
											{Number(gacha.totalItems).toLocaleString()}
										</td>
									</tr>
								);
							})
						)}
					</tbody>
				</table>
			</div>
		</Card>
	);
}
