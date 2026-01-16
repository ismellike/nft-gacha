"use client";

import { useCallback } from "react";
import { usePublicClient } from "wagmi";
import { parseAbiItem } from "viem";
import { useSpinHistoryStore } from "../stores/spinHistoryStore";
import type { SpinHistoryEntry } from "../types/spin-history";

// Event ABIs for parsing logs
const SPIN_COMPLETED_EVENT = parseAbiItem(
	"event SpinCompleted(uint256 indexed triggerId, address indexed requester, uint8 rarity, address collection, uint256 tokenId, uint256 appraisedPrice)",
);

const SPIN_REFUNDED_EVENT = parseAbiItem(
	"event SpinRefunded(uint256 indexed triggerId, address indexed requester, uint8 selectedRarity, uint256 refundAmount)",
);

const SPIN_RECLAIMED_EVENT = parseAbiItem(
	"event SpinReclaimed(uint256 indexed triggerId, address indexed requester, uint256 refundAmount)",
);

// Pagination configuration
const INITIAL_BLOCK_LIMIT = 1000n; // Initial: last 1000 blocks
const MAX_BLOCK_RANGE = 10000n; // Max: 10000 blocks per query
const PAGE_SIZE = 20; // Entries per page

/**
 * Custom hook for fetching spin history from contract events
 * Handles pagination, filtering, and error management
 */
export function useSpinHistoryFetcher() {
	const publicClient = usePublicClient();
	const {
		setEntries,
		appendEntries,
		setPagination,
		setLoading,
		setError,
		getEntries,
		getPagination,
	} = useSpinHistoryStore();

	/**
	 * Fetch block timestamps in batch for better performance
	 */
	const fetchBlockTimestamps = useCallback(
		async (blockNumbers: bigint[]): Promise<Record<string, number>> => {
			if (!publicClient) return {};

			const timestamps: Record<string, number> = await Promise.all(
				blockNumbers.map(async (blockNumber) => {
					try {
						const block = await publicClient.getBlock({ blockNumber });
						return [blockNumber.toString(), Number(block.timestamp)];
					} catch (error) {
						console.error(
							`Failed to fetch timestamp for block ${blockNumber}:`,
							error,
						);
						return [blockNumber.toString(), Date.now() / 1000]; // Fallback to now
					}
				}),
			).then((results) =>
				results.reduce((acc, [key, value]) => {
					acc[key] = value as number;
					return acc;
				}, {} as Record<string, number>),
			);

			return timestamps;
		},
		[publicClient],
	);

	/**
	 * Fetch spin history for a user on a gacha contract
	 */
	const fetchHistory = useCallback(
		async (
			userAddress: string,
			gachaAddress: string,
			page = 1,
		): Promise<SpinHistoryEntry[]> => {
			if (!publicClient) {
				throw new Error("Public client not available");
			}

			setLoading(userAddress, gachaAddress, true);
			setError(userAddress, gachaAddress, null);

			try {
				// Get current block number
				const currentBlock = await publicClient.getBlockNumber();

				// Determine block range based on page
				const pagination = getPagination(userAddress, gachaAddress);

				let fromBlock: bigint;
				let toBlock: bigint;

				if (page === 1) {
					// Initial load: fetch recent blocks
					toBlock = currentBlock;
					fromBlock =
						currentBlock - INITIAL_BLOCK_LIMIT > 0n
							? currentBlock - INITIAL_BLOCK_LIMIT
							: 0n;
				} else {
					// Load more: continue from where we left off
					fromBlock =
						pagination.lastFetchedBlock && pagination.lastFetchedBlock > 0n
							? pagination.lastFetchedBlock - MAX_BLOCK_RANGE
							: 0n;
					toBlock = pagination.lastFetchedBlock || currentBlock;
					fromBlock = fromBlock < 0n ? 0n : fromBlock;
				}

				// Fetch events in parallel
				const [completedLogs, refundedLogs, reclaimedLogs] =
					await Promise.all([
						publicClient.getLogs({
							address: gachaAddress as `0x${string}`,
							event: SPIN_COMPLETED_EVENT,
							args: {
								requester: userAddress as `0x${string}`,
							},
							fromBlock,
							toBlock,
						}),
						publicClient.getLogs({
							address: gachaAddress as `0x${string}`,
							event: SPIN_REFUNDED_EVENT,
							args: {
								requester: userAddress as `0x${string}`,
							},
							fromBlock,
							toBlock,
						}),
						publicClient.getLogs({
							address: gachaAddress as `0x${string}`,
							event: SPIN_RECLAIMED_EVENT,
							args: {
								requester: userAddress as `0x${string}`,
							},
							fromBlock,
							toBlock,
						}),
					]);

				// Collect all unique block numbers
				const blockNumbers = new Set<bigint>();
				completedLogs.forEach((log) => blockNumbers.add(log.blockNumber));
				refundedLogs.forEach((log) => blockNumbers.add(log.blockNumber));
				reclaimedLogs.forEach((log) => blockNumbers.add(log.blockNumber));

				// Fetch timestamps in batch
				const timestamps = await fetchBlockTimestamps(
					Array.from(blockNumbers),
				);

				// Process logs into entries
				const entries: SpinHistoryEntry[] = [];

				// Process SpinCompleted events
				for (const log of completedLogs) {
					const { triggerId, requester, rarity, collection, tokenId, appraisedPrice } =
						log.args;
					if (
						triggerId === undefined ||
						requester === undefined ||
						rarity === undefined ||
						collection === undefined ||
						tokenId === undefined ||
						appraisedPrice === undefined
					) {
						continue;
					}

					entries.push({
						triggerId,
						timestamp:
							timestamps[log.blockNumber.toString()] || Date.now() / 1000,
						blockNumber: log.blockNumber,
						transactionHash: log.transactionHash,
						status: "completed",
						requester,
						rarity: Number(rarity),
						collection,
						tokenId: tokenId.toString(),
						appraisedPrice,
						gachaAddress,
						gachaId: gachaAddress, // Can be enhanced to fetch actual gacha ID
					});
				}

				// Process SpinRefunded events
				for (const log of refundedLogs) {
					const { triggerId, requester, selectedRarity, refundAmount } = log.args;
					if (
						triggerId === undefined ||
						requester === undefined ||
						selectedRarity === undefined ||
						refundAmount === undefined
					) {
						continue;
					}

					entries.push({
						triggerId,
						timestamp:
							timestamps[log.blockNumber.toString()] || Date.now() / 1000,
						blockNumber: log.blockNumber,
						transactionHash: log.transactionHash,
						status: "refunded",
						requester,
						selectedRarity: Number(selectedRarity),
						refundAmount,
						gachaAddress,
						gachaId: gachaAddress,
					});
				}

				// Process SpinReclaimed events
				for (const log of reclaimedLogs) {
					const { triggerId, requester, refundAmount } = log.args;
					if (triggerId === undefined || requester === undefined || refundAmount === undefined) {
						continue;
					}

					entries.push({
						triggerId,
						timestamp:
							timestamps[log.blockNumber.toString()] || Date.now() / 1000,
						blockNumber: log.blockNumber,
						transactionHash: log.transactionHash,
						status: "reclaimed",
						requester,
						refundAmount,
						gachaAddress,
						gachaId: gachaAddress,
					});
				}

				// Sort by timestamp descending (newest first)
				entries.sort((a, b) => b.timestamp - a.timestamp);

				// Update store
				if (page === 1) {
					setEntries(userAddress, gachaAddress, entries);
				} else {
					appendEntries(userAddress, gachaAddress, entries);
				}

				// Update pagination
				const totalEntries = getEntries(userAddress, gachaAddress).length;
				setPagination(userAddress, gachaAddress, {
					page,
					pageSize: PAGE_SIZE,
					totalItems: totalEntries,
					hasMore: fromBlock > 0n, // More to load if we haven't reached genesis
					lastFetchedBlock: fromBlock,
				});

				setLoading(userAddress, gachaAddress, false);
				return entries;
			} catch (error) {
				console.error("Failed to fetch spin history:", error);
				const errorMessage =
					error instanceof Error ? error.message : "Unknown error occurred";
				setError(userAddress, gachaAddress, errorMessage);
				setLoading(userAddress, gachaAddress, false);
				throw error;
			}
		},
		[
			publicClient,
			setLoading,
			setError,
			getEntries,
			getPagination,
			setEntries,
			appendEntries,
			setPagination,
			fetchBlockTimestamps,
		],
	);

	/**
	 * Load more entries (pagination)
	 */
	const loadMore = useCallback(
		async (userAddress: string, gachaAddress: string) => {
			const pagination = getPagination(userAddress, gachaAddress);
			if (!pagination.hasMore) {
				return [];
			}
			return fetchHistory(userAddress, gachaAddress, pagination.page + 1);
		},
		[getPagination, fetchHistory],
	);

	return {
		fetchHistory,
		loadMore,
	};
}
