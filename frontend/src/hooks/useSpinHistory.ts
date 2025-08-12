import { useState, useEffect, useCallback, useMemo } from "react";
import { usePublicClient, useAccount } from "wagmi";
import { Address, parseAbi, Log } from "viem";
import { gachaAbi } from "../generated";
import { Rarity, rarityFromNumber } from "../lib/rarityConfig";
import {
	SpinHistoryEntry,
	SpinHistoryResult,
	SpinStatus,
	RandomnessRequestedEvent,
	SpinCompletedEvent,
	SpinRefundedEvent,
	EventQueryParams,
	EventQueryResult,
} from "./types/spinHistory";

// Event signatures for filtering
const RANDOMNESS_REQUESTED_SIGNATURE =
	"0x9c9b539af8db4e7ca6cf9b9e8a2da3e7cdba7ea74a1c59d3e83a5e4ead18bfc1";
const SPIN_COMPLETED_SIGNATURE =
	"0x8d1c3b2e5c9a8f4b3c5e6a7b9d8c1e4f2a5b8c9d3e6f1a4b7c8d9e2f5a6b3c7d";
const SPIN_REFUNDED_SIGNATURE =
	"0x5f8c2b1e9d7a4c6f3e8b5a2d9c7e4f1b6a8c5d2e9f7b3a6c8d1e4f7a9b2c5d8e";

/**
 * Hook to query RandomnessRequested events from the Gacha contract
 */
export function useRandomnessRequestedEvents(
	contractAddress: Address | undefined,
	params: EventQueryParams = {},
): EventQueryResult<RandomnessRequestedEvent> {
	const publicClient = usePublicClient();
	const [data, setData] = useState<RandomnessRequestedEvent[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	const refetch = useCallback(async () => {
		if (!publicClient || !contractAddress) {
			setData([]);
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			const fromBlock =
				params.fromBlock ||
				BigInt(Math.max(0, Number(await publicClient.getBlockNumber()) - 5000));
			const toBlock = params.toBlock || "latest";

			console.log("Querying RandomnessRequested events:", {
				contractAddress,
				fromBlock: fromBlock.toString(),
				toBlock,
				userAddress: params.userAddress,
			});

			const logs = await publicClient.getLogs({
				address: contractAddress,
				event: {
					type: "event",
					name: "RandomnessRequested",
					inputs: [
						{
							name: "triggerId",
							type: "uint256",
							indexed: true,
						},
					],
				},
				args: {},
				fromBlock,
				toBlock,
			});

			console.log("Found RandomnessRequested logs:", logs.length, logs);

			// Process logs and add block data
			const eventsWithBlockData = await Promise.all(
				logs.map(async (log) => {
					const block = await publicClient.getBlock({
						blockHash: log.blockHash!,
					});
					const transaction = await publicClient.getTransaction({
						hash: log.transactionHash!,
					});

					return {
						triggerId: log.args.triggerId!,
						blockNumber: log.blockNumber!,
						blockHash: log.blockHash!,
						transactionHash: log.transactionHash!,
						timestamp: Number(block.timestamp) * 1000, // Convert to milliseconds
						requester: transaction.from,
					} as RandomnessRequestedEvent;
				}),
			);

			// Filter by user address if specified
			const filteredEvents = params.userAddress
				? eventsWithBlockData.filter(
						(event) => {
							const match = event.requester.toLowerCase() === params.userAddress!.toLowerCase();
							console.log("Filtering event:", event.requester, "vs", params.userAddress, "match:", match);
							return match;
						}
					)
				: eventsWithBlockData;

			console.log("Events after filtering:", filteredEvents.length, filteredEvents);

			// Sort by block number descending (newest first)
			const sortedEvents = filteredEvents.sort(
				(a, b) => Number(b.blockNumber) - Number(a.blockNumber),
			);

			// Apply limit if specified
			const limitedEvents = params.limit
				? sortedEvents.slice(0, params.limit)
				: sortedEvents;

			setData(limitedEvents);
		} catch (err) {
			console.error("Failed to fetch RandomnessRequested events:", err);
			setError(
				err instanceof Error ? err : new Error("Failed to fetch events"),
			);
		} finally {
			setIsLoading(false);
		}
	}, [publicClient, contractAddress, params.fromBlock, params.toBlock, params.userAddress, params.limit]);

	useEffect(() => {
		refetch();
	}, [refetch]);

	return { data, isLoading, error, refetch };
}

/**
 * Hook to query SpinCompleted events from the Gacha contract
 */
export function useSpinCompletedEvents(
	contractAddress: Address | undefined,
	params: EventQueryParams = {},
): EventQueryResult<SpinCompletedEvent> {
	const publicClient = usePublicClient();
	const [data, setData] = useState<SpinCompletedEvent[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	const refetch = useCallback(async () => {
		if (!publicClient || !contractAddress) {
			setData([]);
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			const fromBlock =
				params.fromBlock ||
				BigInt(Math.max(0, Number(await publicClient.getBlockNumber()) - 5000));
			const toBlock = params.toBlock || "latest";

			const logs = await publicClient.getLogs({
				address: contractAddress,
				event: {
					type: "event",
					name: "SpinCompleted",
					inputs: [
						{ name: "triggerId", type: "uint256", indexed: true },
						{ name: "requester", type: "address", indexed: true },
						{ name: "rarity", type: "uint8", indexed: false },
						{ name: "collection", type: "address", indexed: false },
						{ name: "tokenId", type: "uint256", indexed: false },
						{ name: "appraisedPrice", type: "uint256", indexed: false },
					],
				},
				args: params.userAddress ? { requester: params.userAddress } : {},
				fromBlock,
				toBlock,
			});

			// Process logs and add block data
			const eventsWithBlockData = await Promise.all(
				logs.map(async (log) => {
					const block = await publicClient.getBlock({
						blockHash: log.blockHash!,
					});

					return {
						triggerId: log.args.triggerId!,
						requester: log.args.requester!,
						rarity: rarityFromNumber(Number(log.args.rarity!)),
						collection: log.args.collection!,
						tokenId: log.args.tokenId!,
						appraisedPrice: log.args.appraisedPrice!,
						blockNumber: log.blockNumber!,
						blockHash: log.blockHash!,
						transactionHash: log.transactionHash!,
						timestamp: Number(block.timestamp) * 1000, // Convert to milliseconds
					} as SpinCompletedEvent;
				}),
			);

			// Sort by block number descending (newest first)
			const sortedEvents = eventsWithBlockData.sort(
				(a, b) => Number(b.blockNumber) - Number(a.blockNumber),
			);

			// Apply limit if specified
			const limitedEvents = params.limit
				? sortedEvents.slice(0, params.limit)
				: sortedEvents;

			setData(limitedEvents);
		} catch (err) {
			console.error("Failed to fetch SpinCompleted events:", err);
			setError(
				err instanceof Error ? err : new Error("Failed to fetch events"),
			);
		} finally {
			setIsLoading(false);
		}
	}, [publicClient, contractAddress, params.fromBlock, params.toBlock, params.userAddress, params.limit]);

	useEffect(() => {
		refetch();
	}, [refetch]);

	return { data, isLoading, error, refetch };
}

/**
 * Hook to query SpinRefunded events from the Gacha contract
 */
export function useSpinRefundedEvents(
	contractAddress: Address | undefined,
	params: EventQueryParams = {},
): EventQueryResult<SpinRefundedEvent> {
	const publicClient = usePublicClient();
	const [data, setData] = useState<SpinRefundedEvent[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	const refetch = useCallback(async () => {
		if (!publicClient || !contractAddress) {
			setData([]);
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			const fromBlock =
				params.fromBlock ||
				BigInt(Math.max(0, Number(await publicClient.getBlockNumber()) - 5000));
			const toBlock = params.toBlock || "latest";

			const logs = await publicClient.getLogs({
				address: contractAddress,
				event: {
					type: "event",
					name: "SpinRefunded",
					inputs: [
						{ name: "triggerId", type: "uint256", indexed: true },
						{ name: "requester", type: "address", indexed: true },
						{ name: "selectedRarity", type: "uint8", indexed: false },
						{ name: "refundAmount", type: "uint256", indexed: false },
					],
				},
				args: params.userAddress ? { requester: params.userAddress } : {},
				fromBlock,
				toBlock,
			});

			// Process logs and add block data
			const eventsWithBlockData = await Promise.all(
				logs.map(async (log) => {
					const block = await publicClient.getBlock({
						blockHash: log.blockHash!,
					});

					return {
						triggerId: log.args.triggerId!,
						requester: log.args.requester!,
						selectedRarity: rarityFromNumber(Number(log.args.selectedRarity!)),
						refundAmount: log.args.refundAmount!,
						blockNumber: log.blockNumber!,
						blockHash: log.blockHash!,
						transactionHash: log.transactionHash!,
						timestamp: Number(block.timestamp) * 1000, // Convert to milliseconds
					} as SpinRefundedEvent;
				}),
			);

			// Sort by block number descending (newest first)
			const sortedEvents = eventsWithBlockData.sort(
				(a, b) => Number(b.blockNumber) - Number(a.blockNumber),
			);

			// Apply limit if specified
			const limitedEvents = params.limit
				? sortedEvents.slice(0, params.limit)
				: sortedEvents;

			setData(limitedEvents);
		} catch (err) {
			console.error("Failed to fetch SpinRefunded events:", err);
			setError(
				err instanceof Error ? err : new Error("Failed to fetch events"),
			);
		} finally {
			setIsLoading(false);
		}
	}, [publicClient, contractAddress, params.fromBlock, params.toBlock, params.userAddress, params.limit]);

	useEffect(() => {
		refetch();
	}, [refetch]);

	return { data, isLoading, error, refetch };
}

/**
 * Main hook to build comprehensive spin history by combining all event types
 */
export function useSpinHistory(
	contractAddress: Address | undefined,
	userAddress?: Address,
): SpinHistoryResult {
	// Query all event types
	const randomnessEvents = useRandomnessRequestedEvents(contractAddress, {
		userAddress,
		limit: 100, // Reasonable limit for performance
	});

	const completedEvents = useSpinCompletedEvents(contractAddress, {
		userAddress,
		limit: 100,
	});

	const refundedEvents = useSpinRefundedEvents(contractAddress, {
		userAddress,
		limit: 100,
	});

	// Combine loading states
	const isLoading =
		randomnessEvents.isLoading ||
		completedEvents.isLoading ||
		refundedEvents.isLoading;

	// Combine errors
	const error =
		randomnessEvents.error || completedEvents.error || refundedEvents.error;

	// Process and combine all events into spin history entries
	const spins = useMemo((): SpinHistoryEntry[] => {
		if (isLoading || error) return [];

		// Create a map of trigger IDs to spin history entries
		const spinMap = new Map<string, SpinHistoryEntry>();

		// First, process all RandomnessRequested events (these are the initiating events)
		randomnessEvents.data.forEach((event) => {
			const triggerIdStr = event.triggerId.toString();
			spinMap.set(triggerIdStr, {
				triggerId: event.triggerId,
				requester: event.requester,
				status: SpinStatus.Pending,
				timestamp: event.timestamp,
				blockNumber: event.blockNumber,
				transactionHash: event.transactionHash,
			});
		});

		// Then, process SpinCompleted events and update corresponding entries
		completedEvents.data.forEach((event) => {
			const triggerIdStr = event.triggerId.toString();
			const existingSpin = spinMap.get(triggerIdStr);

			if (existingSpin) {
				existingSpin.status = SpinStatus.Completed;
				existingSpin.completion = {
					rarity: event.rarity,
					collection: event.collection,
					tokenId: event.tokenId,
					appraisedPrice: event.appraisedPrice,
					completionTransactionHash: event.transactionHash,
					completionTimestamp: event.timestamp,
				};
			} else {
				// Create a new entry if we don't have the RandomnessRequested event
				// (this shouldn't happen in normal operation, but provides fallback)
				spinMap.set(triggerIdStr, {
					triggerId: event.triggerId,
					requester: event.requester,
					status: SpinStatus.Completed,
					timestamp: event.timestamp,
					blockNumber: event.blockNumber,
					transactionHash: event.transactionHash,
					completion: {
						rarity: event.rarity,
						collection: event.collection,
						tokenId: event.tokenId,
						appraisedPrice: event.appraisedPrice,
						completionTransactionHash: event.transactionHash,
						completionTimestamp: event.timestamp,
					},
				});
			}
		});

		// Finally, process SpinRefunded events and update corresponding entries
		refundedEvents.data.forEach((event) => {
			const triggerIdStr = event.triggerId.toString();
			const existingSpin = spinMap.get(triggerIdStr);

			if (existingSpin) {
				existingSpin.status = SpinStatus.Refunded;
				existingSpin.refund = {
					selectedRarity: event.selectedRarity,
					refundAmount: event.refundAmount,
					refundTransactionHash: event.transactionHash,
					refundTimestamp: event.timestamp,
				};
			} else {
				// Create a new entry if we don't have the RandomnessRequested event
				spinMap.set(triggerIdStr, {
					triggerId: event.triggerId,
					requester: event.requester,
					status: SpinStatus.Refunded,
					timestamp: event.timestamp,
					blockNumber: event.blockNumber,
					transactionHash: event.transactionHash,
					refund: {
						selectedRarity: event.selectedRarity,
						refundAmount: event.refundAmount,
						refundTransactionHash: event.transactionHash,
						refundTimestamp: event.timestamp,
					},
				});
			}
		});

		// Convert map to array and sort by timestamp (newest first)
		const spinsArray = Array.from(spinMap.values()).sort(
			(a, b) => b.timestamp - a.timestamp,
		);

		return spinsArray;
	}, [
		randomnessEvents.data,
		completedEvents.data,
		refundedEvents.data,
		isLoading,
		error,
	]);

	// Calculate statistics
	const totalSpins = spins.length;
	const completedSpins = spins.filter(
		(spin) => spin.status === SpinStatus.Completed,
	).length;
	const refundedSpins = spins.filter(
		(spin) => spin.status === SpinStatus.Refunded,
	).length;
	const pendingSpins = spins.filter(
		(spin) => spin.status === SpinStatus.Pending,
	).length;

	// Refetch function that triggers all queries
	const refetch = useCallback(() => {
		randomnessEvents.refetch();
		completedEvents.refetch();
		refundedEvents.refetch();
	}, [
		randomnessEvents.refetch,
		completedEvents.refetch,
		refundedEvents.refetch,
	]);

	return {
		spins,
		totalSpins,
		completedSpins,
		refundedSpins,
		pendingSpins,
		isLoading,
		error,
		refetch,
	};
}

/**
 * Convenience hook that automatically uses the current connected user's address
 */
export function useUserSpinHistory(
	contractAddress: Address | undefined,
): SpinHistoryResult {
	const { address } = useAccount();
	return useSpinHistory(contractAddress, address);
}
