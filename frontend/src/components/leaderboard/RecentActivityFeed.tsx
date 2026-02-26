"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { parseAbiItem } from "viem";
import { usePublicClient } from "wagmi";
import type { GachaConfig } from "@/lib/gacha-config/types";
import { getRarityConfig } from "@/lib/rarityConfig";
import { Card, Skeleton } from "@/ui";

const SPIN_COMPLETED_EVENT = parseAbiItem(
	"event SpinCompleted(uint256 indexed triggerId, address indexed requester, uint8 rarity, address collection, uint256 tokenId, uint256 appraisedPrice)",
);

interface RawLogEntry {
	gacha: GachaConfig;
	blockNumber: bigint;
	args: {
		triggerId?: bigint;
		requester?: `0x${string}`;
		rarity?: number;
	};
}

interface ActivityEntry {
	id: string;
	requester: string;
	rarity: number;
	gachaTitle: string;
	timestamp: number;
}

interface RecentActivityFeedProps {
	gachas: GachaConfig[];
	maxItems?: number | undefined;
}

function formatTimeAgo(timestamp: number): string {
	const diffMs = Date.now() - timestamp * 1000;
	const diffSecs = Math.floor(diffMs / 1000);
	if (diffSecs < 60) return `${diffSecs}s ago`;
	const diffMins = Math.floor(diffSecs / 60);
	if (diffMins < 60) return `${diffMins}m ago`;
	const diffHours = Math.floor(diffMins / 60);
	if (diffHours < 24) return `${diffHours}h ago`;
	return `${Math.floor(diffHours / 24)}d ago`;
}

function shortenAddress(address: string): string {
	return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function RecentActivityFeed({
	gachas,
	maxItems = 10,
}: RecentActivityFeedProps) {
	const publicClient = usePublicClient();
	const [activities, setActivities] = useState<ActivityEntry[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	// Store gachas in a ref to avoid dependency in the callback (ref pattern per CLAUDE.md)
	const gachasRef = useRef(gachas);
	gachasRef.current = gachas;
	const maxItemsRef = useRef(maxItems);
	maxItemsRef.current = maxItems;

	const fetchRecentActivity = useCallback(async () => {
		if (!publicClient || gachasRef.current.length === 0) {
			setIsLoading(false);
			return;
		}

		try {
			const currentBlock = await publicClient.getBlockNumber();
			const fromBlock =
				currentBlock > 2000n ? currentBlock - 2000n : 0n;

			// Fetch recent SpinCompleted events from all gachas in parallel
			const results = await Promise.allSettled(
				gachasRef.current.map(async (gacha) => {
					const logs = await publicClient.getLogs({
						address: gacha.address as `0x${string}`,
						event: SPIN_COMPLETED_EVENT,
						fromBlock,
						toBlock: currentBlock,
					});
					return { gacha, logs };
				}),
			);

			// Collect all raw entries for sorting
			const rawEntries: RawLogEntry[] = [];

			for (const result of results) {
				if (result.status === "fulfilled") {
					for (const log of result.value.logs) {
						rawEntries.push({
							gacha: result.value.gacha,
							blockNumber: log.blockNumber,
							args: log.args as RawLogEntry["args"],
						});
					}
				}
			}

			// Sort by block number descending, take maxItems
			rawEntries.sort((a, b) => {
				if (b.blockNumber > a.blockNumber) return 1;
				if (b.blockNumber < a.blockNumber) return -1;
				return 0;
			});
			const top = rawEntries.slice(0, maxItemsRef.current);

			// Fetch timestamps for unique blocks
			const uniqueBlocks = [...new Set(top.map((e) => e.blockNumber))];
			const timestampMap: Record<string, number> = {};
			await Promise.all(
				uniqueBlocks.map(async (blockNumber) => {
					try {
						const block = await publicClient.getBlock({ blockNumber });
						timestampMap[blockNumber.toString()] = Number(block.timestamp);
					} catch {
						timestampMap[blockNumber.toString()] = Date.now() / 1000;
					}
				}),
			);

			const entries: ActivityEntry[] = top
				.map(({ gacha, blockNumber, args }): ActivityEntry | null => {
					if (!args.triggerId || !args.requester || args.rarity === undefined) {
						return null;
					}
					const rarity = args.rarity as number;
					return {
						id: `${gacha.id}-${args.triggerId.toString()}`,
						requester: args.requester as string,
						rarity,
						gachaTitle: gacha.title,
						timestamp:
							timestampMap[blockNumber.toString()] ?? Date.now() / 1000,
					} as ActivityEntry;
				})
				.filter((e): e is ActivityEntry => e !== null);

			setActivities(entries);
			setError(null);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load activity");
		} finally {
			setIsLoading(false);
		}
	}, [publicClient]);

	useEffect(() => {
		fetchRecentActivity();
	}, [fetchRecentActivity]);

	return (
		<Card className="p-6 bg-content1/20 backdrop-blur-xl border border-white/10 rounded-2xl">
			<div className="flex items-center justify-between mb-5">
				<h3 className="text-base font-semibold text-foreground">
					Recent Wins
				</h3>
				{!isLoading && activities.length > 0 && (
					<button
						type="button"
						onClick={fetchRecentActivity}
						className="text-xs text-foreground/40 hover:text-warning transition-colors"
					>
						Refresh
					</button>
				)}
			</div>

			{isLoading && (
				<div className="space-y-3">
					{Array.from({ length: 5 }, (_, i) => `skeleton-${i}`).map((key) => (
						<div
							key={key}
							className="flex items-center gap-3 py-2"
						>
							<Skeleton variant="circle" className="w-10 h-10" />
							<div className="flex-1 space-y-1">
								<Skeleton variant="text" size="h4" className="w-32" />
								<Skeleton variant="text" size="h4" className="w-24" />
							</div>
							<Skeleton variant="text" size="h4" className="w-12" />
						</div>
					))}
				</div>
			)}

			{!isLoading && error && (
				<p className="text-sm text-danger/70 text-center py-4">{error}</p>
			)}

			{!isLoading && !error && activities.length === 0 && (
				<p className="text-sm text-foreground/40 text-center py-8">
					No recent spin activity found. Spin to be the first!
				</p>
			)}

			{!isLoading && !error && activities.length > 0 && (
				<ul className="space-y-1">
					{activities.map((activity) => {
						const config = getRarityConfig(activity.rarity);
						return (
							<li
								key={activity.id}
								className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white/[0.03] transition-colors"
							>
								{/* Rarity badge */}
								<div
									className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm"
									style={{ backgroundColor: `${config.hexColor}20` }}
								>
									{config.emoji}
								</div>

								{/* Details */}
								<div className="flex-1 min-w-0">
									<p className="text-sm font-medium text-foreground/80 truncate">
										<span
											className="font-semibold"
											style={{ color: config.hexColor }}
										>
											{config.name}
										</span>{" "}
										won by{" "}
										<span className="font-mono text-xs text-foreground/60">
											{shortenAddress(activity.requester)}
										</span>
									</p>
									<p className="text-xs text-foreground/40 truncate">
										{activity.gachaTitle}
									</p>
								</div>

								{/* Time */}
								<span className="text-xs text-foreground/30 shrink-0">
									{formatTimeAgo(activity.timestamp)}
								</span>
							</li>
						);
					})}
				</ul>
			)}
		</Card>
	);
}
