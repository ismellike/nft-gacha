"use client";

import type { PublicClient } from "viem";
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

export interface GachaSpinContext {
	triggerId: bigint | null;
	spinResult: SpinResult | null;
	refundResult: RefundResult | null;
	userAddress: string | null;
	publicClient: PublicClient | null;
	gachaAddress: string | null;
	error: string | null;
	retryCount: number;
}

export type GachaSpinEvent =
	| {
			type: "START_SPIN";
			userAddress: string;
			publicClient: PublicClient;
			gachaAddress: string;
	  }
	| { type: "TRANSACTION_CONFIRMED"; triggerId: bigint }
	| { type: "SPIN_FULFILLED"; result: SpinResult }
	| { type: "SPIN_REFUNDED"; refundResult: RefundResult }
	| { type: "CLOSE_REVEAL" }
	| { type: "RESET" }
	| { type: "RETRY" }
	| { type: "ERROR"; error: string }
	| { type: "TIMEOUT" }
	| { type: "TRANSACTION_CANCELED" };

export const MAX_RETRIES = 5;
const POLLING_INTERVAL = 3000; // 3 seconds
const BASE_TIMEOUT = 10000; // 10 minutes
const MAX_POLLING_TIME = BASE_TIMEOUT * 6; // 10 minutes at 3-second intervals

// Utility function for exponential backoff with jitter
const getPollingDelay = (attempt: number, baseInterval: number): number => {
	const exponentialDelay = baseInterval * 2 ** Math.min(attempt / 10, 5);
	const jitter = Math.random() * 0.1 * exponentialDelay; // 10% jitter
	return Math.min(exponentialDelay + jitter, 30000); // Max 30 seconds
};

// Poll for SpinFulfilled events with improved error handling
export const pollForSpinFulfillment = async ({
	triggerId,
	userAddress,
	publicClient,
	gachaAddress,
}: {
	triggerId: bigint;
	userAddress: string;
	publicClient: PublicClient;
	gachaAddress: string;
}): Promise<SpinResult> => {
	console.log("🔄 [pollForSpinFulfillment] Starting poll for:", {
		triggerId: triggerId.toString(),
		userAddress,
		gachaAddress,
	});
	return new Promise((resolve, reject) => {
		const startTime = Date.now();
		let timeoutId: NodeJS.Timeout | null = null;
		let attempts = 0;
		const maxAttempts = 200;
		const refundCheckDelay = 10;
		let isDestroyed = false;

		const cleanup = () => {
			if (timeoutId) {
				clearTimeout(timeoutId);
				timeoutId = null;
			}
			isDestroyed = true;
		};

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
			if (isDestroyed) return;

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
					currentBlock > BigInt(1000) ? currentBlock - BigInt(1000) : BigInt(0);

				console.log(
					`🔍 [pollForSpinFulfillment] Polling attempt ${attempts}:`,
					{
						currentBlock: currentBlock.toString(),
						fromBlock: fromBlock.toString(),
						triggerId: triggerId.toString(),
					},
				);

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

				console.log(
					`📋 [pollForSpinFulfillment] Found ${completedLogs.length} SpinCompleted logs`,
				);

				if (completedLogs.length > 0) {
					const log = completedLogs[0];
					const { rarity, collection, tokenId } = log.args;

					console.log("📋 [pollForSpinFulfillment] Processing log:", {
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

					console.log(
						"🎉 [pollForSpinFulfillment] SpinCompleted event found, resolving:",
						result,
					);
					cleanup();
					resolve(result);
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

						if (!selectedRarity || refundAmount === undefined) {
							throw new Error("Invalid SpinRefunded event data");
						}

						const rarityName = rarityBigIntToName(selectedRarity);

						console.log("💰 [GachaSpinMachine] SpinRefunded event found:", {
							selectedRarity: rarityName,
							refundAmount,
						});

						const refundData = {
							selectedRarity: rarityName,
							refundAmount: refundAmount?.toString() || "0",
						};

						cleanup();
						reject(new Error(`REFUND:${JSON.stringify(refundData)}`));
						return;
					}
				}

				if (!isDestroyed) {
					const delay = getPollingDelay(attempts, POLLING_INTERVAL);
					timeoutId = setTimeout(poll, delay);
				}
			} catch (error) {
				console.error(
					`[GachaSpinMachine] Polling error (attempt ${attempts}):`,
					error,
				);

				if (attempts < maxAttempts && !isDestroyed) {
					const delay = getPollingDelay(attempts, POLLING_INTERVAL);
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
	return pendingSpin?.triggerId || null;
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
