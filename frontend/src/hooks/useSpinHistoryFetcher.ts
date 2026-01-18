"use client";

import { useCallback } from "react";
import { usePublicClient } from "wagmi";
import { parseAbiItem } from "viem";
import { useSpinHistoryStore } from "../stores/spinHistoryStore";
import type { SpinHistoryEntry } from "../types/spin-history";
import { logger } from "../lib/logger";

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

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000; // Base delay between retries

/**
 * Sleep utility for retry delays
 */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Retry wrapper with exponential backoff
 */
async function retryWithBackoff<T>(
	fn: () => Promise<T>,
	maxRetries: number = MAX_RETRIES,
): Promise<T> {
	let lastError: Error | undefined;

	for (let attempt = 0; attempt <= maxRetries; attempt++) {
		try {
			return await fn();
		} catch (error) {
			lastError = error instanceof Error ? error : new Error(String(error));

			// Don't retry if this is the last attempt
			if (attempt >= maxRetries) {
				break;
			}

			// Exponential backoff: wait longer with each attempt
			const delay = RETRY_DELAY_MS * Math.pow(2, attempt);
			logger.network.warn(
				`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`,
				lastError.message,
			);
			await sleep(delay);
		}
	}

	throw lastError;
}

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
						logger.network.error(
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
			// Handle missing public client gracefully
			if (!publicClient) {
				logger.network.warn("Public client not available for fetchHistory");
				setError(userAddress, gachaAddress, "Public client not available");
				return [];
			}

			setLoading(userAddress, gachaAddress, true);
			setError(userAddress, gachaAddress, null);

			try {
				// Get current block number with retry
				const currentBlock = await retryWithBackoff(() =>
					publicClient.getBlockNumber()
				);

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

				// Fetch events in parallel with individual retry and error handling
				const [completedResult, refundedResult, reclaimedResult] =
					await Promise.allSettled([
						retryWithBackoff(() =>
							publicClient.getLogs({
								address: gachaAddress as `0x${string}`,
								event: SPIN_COMPLETED_EVENT,
								args: {
									requester: userAddress as `0x${string}`,
								},
								fromBlock,
								toBlock,
							})
						),
						retryWithBackoff(() =>
							publicClient.getLogs({
								address: gachaAddress as `0x${string}`,
								event: SPIN_REFUNDED_EVENT,
								args: {
									requester: userAddress as `0x${string}`,
								},
								fromBlock,
								toBlock,
							})
						),
						retryWithBackoff(() =>
							publicClient.getLogs({
								address: gachaAddress as `0x${string}`,
								event: SPIN_RECLAIMED_EVENT,
								args: {
									requester: userAddress as `0x${string}`,
								},
								fromBlock,
								toBlock,
							})
						),
					]);

				// Extract results or use empty arrays on failure
				const completedLogs =
					completedResult.status === "fulfilled" ? completedResult.value : [];
				const refundedLogs =
					refundedResult.status === "fulfilled" ? refundedResult.value : [];
				const reclaimedLogs =
					reclaimedResult.status === "fulfilled" ? reclaimedResult.value : [];

				// Log any errors but continue processing
				if (completedResult.status === "rejected") {
					logger.network.error("Failed to fetch completed logs:", completedResult.reason);
				}
				if (refundedResult.status === "rejected") {
					logger.network.error("Failed to fetch refunded logs:", refundedResult.reason);
				}
				if (reclaimedResult.status === "rejected") {
					logger.network.error("Failed to fetch reclaimed logs:", reclaimedResult.reason);
				}

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
					});
				}

				// Sort by timestamp descending (newest first)
				entries.sort((a, b) => b.timestamp - a.timestamp);

				// Update store
				if (page === 1) {
					setEntries(userAddress, gachaAddress, entries);
				} else {
					await appendEntries(userAddress, gachaAddress, entries);
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
				logger.network.error("Failed to fetch spin history:", error);
				const errorMessage =
					error instanceof Error ? error.message : "Unknown error occurred";
				setError(userAddress, gachaAddress, errorMessage);
				setLoading(userAddress, gachaAddress, false);
				// Return empty array instead of throwing to allow graceful degradation
				return [];
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
