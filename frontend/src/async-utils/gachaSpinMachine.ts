"use client";

import type { PublicClient } from "viem";
import { BASE_SPIN_POLLING_TIMEOUT_MS, BLOCK_LOOKBACK, POLLING_INTERVAL_MS } from "../lib/constants";
import { createDebugLogger, DEBUG_FLAGS, logger } from "../lib/logger";
import { rarityBigIntToName } from "../lib/rarity-utils";
import { useGachaStore } from "../stores/gachaStore";
// Gacha contract address is now passed as context rather than imported

export interface SpinResult {
	rarity: string;
	collection: string;
	tokenId: string;
	imageUrl?: string; // Optional - will be fetched from metadata if not provided
}

export interface RefundResult {
	selectedRarity: string;
	refundAmount: bigint;
}

type PollingResult =
	| { type: "completed"; result: SpinResult }
	| { type: "refunded"; refundResult: RefundResult };


export const MAX_RETRIES = 5;
const MAX_POLLING_TIME = BASE_SPIN_POLLING_TIMEOUT_MS;

const debugLog = createDebugLogger(DEBUG_FLAGS.GACHA_SPIN);

// Utility function for exponential backoff with jitter
export const getPollingDelay = (
	attempt: number,
	baseIntervalMs: number,
): number => {
	const exponentialDelay =
		baseIntervalMs * 2 ** Math.min(Math.floor(attempt / 3), 5);
	const jitter = Math.random() * 0.1 * exponentialDelay; // 10% jitter
	return Math.min(exponentialDelay + jitter, 30000); // Max 30 seconds
};

// Poll for SpinFulfilled events with improved error handling
export const pollForSpinFulfillment = async ({
	triggerId,
	userAddress,
	publicClient,
	gachaAddress,
	signal,
}: {
	triggerId: bigint;
	userAddress: string;
	publicClient: PublicClient;
	gachaAddress: string;
	signal?: AbortSignal;
}): Promise<PollingResult> => {
	debugLog("🔄 [pollForSpinFulfillment] Starting poll for:", {
		triggerId: triggerId.toString(),
		userAddress,
		gachaAddress,
	});
	return new Promise((resolve, reject) => {
		const startTime = Date.now();
		let timeoutId: NodeJS.Timeout | null = null;
		let attempts = 0;
		const maxAttempts = 200;
		const refundCheckDelay = 3;
		let isDestroyed = false;

		const cleanup = () => {
			if (timeoutId) {
				clearTimeout(timeoutId);
				timeoutId = null;
			}
			isDestroyed = true;
		};

		// Listen for abort signal so the promise settles immediately
		// and the internal timeout is cancelled (no zombie promises).
		if (signal) {
			const onAbort = () => {
				if (!isDestroyed) {
					cleanup();
					reject(new DOMException("Polling aborted", "AbortError"));
				}
			};
			if (signal.aborted) {
				cleanup();
				reject(new DOMException("Polling aborted", "AbortError"));
				return;
			}
			signal.addEventListener("abort", onAbort, { once: true });
		}

		timeoutId = setTimeout(() => {
			if (!isDestroyed) {
				cleanup();
				reject(
					new Error(
						`Polling timeout: No event found after ${MAX_POLLING_TIME}ms`,
					),
				);
			}
		}, MAX_POLLING_TIME);

		const poll = async () => {
			if (isDestroyed || signal?.aborted) return;

			attempts++;
			const elapsed = Date.now() - startTime;

			if (attempts > maxAttempts || elapsed > MAX_POLLING_TIME) {
				cleanup();
				reject(
					new Error(`Polling timeout: ${attempts} attempts over ${elapsed}ms`),
				);
				return;
			}

			try {
				if (!publicClient || !gachaAddress || !userAddress || !triggerId) {
					cleanup();
					reject(new Error("Invalid polling parameters"));
					return;
				}

				const currentBlock = await publicClient.getBlockNumber();
				const fromBlock =
					currentBlock > BLOCK_LOOKBACK ? currentBlock - BLOCK_LOOKBACK : 0n;

				debugLog(`🔍 [pollForSpinFulfillment] Polling attempt ${attempts}:`, {
					currentBlock: currentBlock.toString(),
					fromBlock: fromBlock.toString(),
					triggerId: triggerId.toString(),
				});

				const completedLogs = await publicClient.getLogs({
					address: gachaAddress as `0x${string}`,
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
					args: {
						triggerId: triggerId,
						requester: userAddress as `0x${string}`,
					},
					fromBlock,
					toBlock: currentBlock,
				});

				debugLog(
					`📋 [pollForSpinFulfillment] Found ${completedLogs.length} SpinCompleted logs`,
				);

				if (completedLogs.length > 0) {
					const log = completedLogs[0];
					const { rarity, collection, tokenId } = log.args;

					debugLog("📋 [pollForSpinFulfillment] Processing log:", {
						rarity,
						collection,
						tokenId: tokenId?.toString(),
					});

					if (
						rarity === undefined ||
						rarity === null ||
						!collection ||
						tokenId === undefined
					) {
						throw new Error("Invalid SpinCompleted event data");
					}

					const result: SpinResult = {
						rarity: rarityBigIntToName(rarity),
						collection: collection || "",
						tokenId: tokenId?.toString() || "",
					};

					debugLog(
						"🎉 [pollForSpinFulfillment] SpinCompleted event found, resolving:",
						result,
					);
					cleanup();
					resolve({ type: "completed", result });
					return;
				}

				if (attempts >= refundCheckDelay) {
					const refundedLogs = await publicClient.getLogs({
						address: gachaAddress as `0x${string}`,
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
						args: {
							triggerId: triggerId,
							requester: userAddress as `0x${string}`,
						},
						fromBlock,
						toBlock: currentBlock,
					});

					if (refundedLogs.length > 0) {
						const log = refundedLogs[0];
						const { selectedRarity, refundAmount } = log.args;

						if (selectedRarity === undefined || refundAmount === undefined) {
							throw new Error("Invalid SpinRefunded event data");
						}

						const rarityName = rarityBigIntToName(selectedRarity);

						debugLog("💰 [GachaSpinMachine] SpinRefunded event found:", {
							selectedRarity: rarityName,
							refundAmount,
						});

						cleanup();
						resolve({
							type: "refunded",
							refundResult: {
								selectedRarity: rarityName,
								refundAmount: refundAmount,
							},
						});
						return;
					}
				}

				if (!isDestroyed && !signal?.aborted) {
					const delay = getPollingDelay(attempts, POLLING_INTERVAL_MS);
					timeoutId = setTimeout(poll, delay);
				}
			} catch (error) {
				// Don't retry aborted requests
				if (error instanceof DOMException && error.name === "AbortError") {
					cleanup();
					reject(error);
					return;
				}

				// Don't retry non-retryable errors (contract reverts)
				const errorMsg = error instanceof Error ? error.message : "";
				const isNonRetryable =
					errorMsg.includes("execution reverted") ||
					errorMsg.includes("invalid opcode") ||
					errorMsg.includes("out of gas");

				logger.gachaSpin.error(
					`[GachaSpinMachine] Polling error (attempt ${attempts}):`,
					error,
				);

				if (
					!isNonRetryable &&
					attempts < maxAttempts &&
					!isDestroyed &&
					!signal?.aborted
				) {
					const delay = getPollingDelay(attempts, POLLING_INTERVAL_MS);
					timeoutId = setTimeout(poll, delay);
				} else {
					cleanup();
					reject(
						error instanceof Error ? error : new Error("Unknown polling error"),
					);
				}
			}
		};

		poll();
	});
};

export const loadFromStorage = (
	userAddress: string,
	gachaAddress: string,
): bigint | null => {
	const pendingSpin = useGachaStore
		.getState()
		.getPendingSpin(userAddress, gachaAddress);
	return pendingSpin?.triggerId ?? null;
};

// Utility function to clear all pending spins
export const clearAllPendingSpins = () => {
	useGachaStore.setState({ pendingSpins: {} });
};

// Utility function to validate pending spins against contract
export const validatePendingSpins = async (publicClient: PublicClient) => {
	await useGachaStore.getState().validateAndCleanPendingSpins(publicClient);
};

// The old XState machine is replaced by helpers for Zustand-driven flows.
// Consumers should orchestrate state with these utilities instead of relying on XState.
