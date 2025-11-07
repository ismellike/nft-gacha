"use client";

import { assign, createMachine, fromPromise } from "xstate";
import type { PublicClient } from "viem";
import { useGachaStore } from "../stores/gachaStore";
import { rarityBigIntToName } from "../lib/rarity-utils";
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

const MAX_RETRIES = 5;
const POLLING_INTERVAL = 3000; // 3 seconds
const BASE_TIMEOUT = 10000; // 10 minutes
const MAX_POLLING_TIME = BASE_TIMEOUT * 6; // 10 minutes at 3-second intervals

// Utility function for exponential backoff with jitter
const getPollingDelay = (attempt: number, baseInterval: number): number => {
	const exponentialDelay = baseInterval * 2 ** Math.min(attempt / 10, 5);
	const jitter = Math.random() * 0.1 * exponentialDelay; // 10% jitter
	return Math.min(exponentialDelay + jitter, 30000); // Max 30 seconds
};

// Actor to poll for SpinFulfilled events with improved error handling
const pollForSpinFulfillment = fromPromise(
	async ({
		input,
	}: {
		input: {
			triggerId: bigint;
			userAddress: string;
			publicClient: PublicClient;
			gachaAddress: string;
		};
	}): Promise<SpinResult> => {
		const { triggerId, userAddress, publicClient, gachaAddress } = input;
		const startTime = Date.now();
		let timeoutId: NodeJS.Timeout | null = null;

		return new Promise((resolve, reject) => {
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

			// Set up overall timeout
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

				// Check both attempt count and overall time
				if (attempts > maxAttempts || elapsed > MAX_POLLING_TIME) {
					cleanup();
					reject(
						new Error(
							`Polling timeout: ${attempts} attempts over ${elapsed}ms`,
						),
					);
					return;
				}

				try {
					// Validate inputs before polling
					if (!publicClient || !gachaAddress || !userAddress || !triggerId) {
						cleanup();
						reject(new Error("Invalid polling parameters"));
						return;
					}

					const currentBlock = await publicClient.getBlockNumber();
					const fromBlock =
						currentBlock > BigInt(1000)
							? currentBlock - BigInt(1000)
							: BigInt(0);

					// Check for SpinCompleted events
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

					if (completedLogs.length > 0) {
						const log = completedLogs[0];
						const { rarity, collection, tokenId } = log.args;

						// Validate the log data
						if (rarity === undefined || rarity === null || !collection || tokenId === undefined) {
							throw new Error("Invalid SpinCompleted event data");
						}

						const result: SpinResult = {
							rarity: rarityBigIntToName(rarity),
							collection: collection || "",
							tokenId: tokenId?.toString() || "",
						};

						console.log(
							"🎉 [GachaSpinMachine] SpinCompleted event found:",
							result,
						);
						cleanup();
						resolve(result);
						return;
					}

					// Check for refunds after delay
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

					// Continue polling with exponential backoff
					if (!isDestroyed) {
						const delay = getPollingDelay(attempts, POLLING_INTERVAL);
						timeoutId = setTimeout(poll, delay);
					}
				} catch (error) {
					console.error(
						`[GachaSpinMachine] Polling error (attempt ${attempts}):`,
						error,
					);

					// Continue polling on errors unless we've hit max attempts
					if (attempts < maxAttempts && !isDestroyed) {
						const delay = getPollingDelay(attempts, POLLING_INTERVAL);
						timeoutId = setTimeout(poll, delay);
					} else {
						cleanup();
						reject(
							error instanceof Error
								? error
								: new Error("Unknown polling error"),
						);
					}
				}
			};

			// Start polling immediately
			poll();
		});
	},
);

// Persistence helpers using Zustand store
const saveToStorage = (
	userAddress: string,
	gachaAddress: string,
	triggerId: bigint,
) => {
	useGachaStore.getState().addPendingSpin({
		userAddress,
		gachaAddress,
		triggerId,
	});
};

const removeFromStorage = (userAddress: string, gachaAddress: string) => {
	useGachaStore.getState().removePendingSpin(userAddress, gachaAddress);
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

export const gachaSpinMachine = createMachine(
	{
		/** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAOlwGIBlAFQG0AGAXUVAAcB7WKgFz3YgAPRAFoANCAAeiAOwBmAEwB2eQA4ALPOXyAjAHYA7EoXaAvu-1osufIRLkKVGrXoNQkPeDBQBbJOvwBCAHJQ9iwUCXgQLgwAFrEAtlSJyfFm4Va29o7OCA70SoYGKqKuAGzmBQUqqnmlWnrICGACfOp6ShX1BiryBgYmFmIAFJTc3IzqBiNKg8rqKjNTBibqijNZBa64Fj3e2BB+AcGhNggOyckYaYkpGVm51pQdBQBKXV1+fQNDirJFaLJTIJHY7KSLbYZGp6bT2BR-X4gP5A0GJGE7RGpDbJRLJeLsJIcXJFEplRglcq3G5vZTqbQKZQeTw+RRKfxM6qlQL0uxTJQ6bSJVpOMBSEJsIhIOl0w5IxaouHJOSpXa4gm7A7HMlnA6gK5Uu53R4U6r057vZkfepNH4cvy84YuUYGAz2cJiSxdQzOSY68QWNEaHq6MKmfT9CxGh2xE2I1L2ilUrbO47HTkOl1sz3cv38hqUJQmIVKPM+0UjcKGEx62JiJyGJTlyvZGvpVLO5LOt1kz2YWkOhBOxtGfOzBQNgzmQf2CLNOw13NR8RGYT6BoKTyLgzTJQi5xKgvLyuy2JuJXTWyIjOy4xRyzaB+IZQZKzqNQmeaJJ2l5PTB2KUdjR6aN+iNMV3WtXJK3ybJCm0eRIi9OYzE0BFNGzdRNBMI8y02Cshx2MsgNfM1LwgV1oNFX4JRgtQWgnRRJh0LQTTLSxVF0eZdDMJQ8yQ3clVw3YCOKLxN2lT05wnZU6LfBj3nKH5jCWIwKSQpF2UQjsZQQrE2g7VIplMSw1G7WZkVHZZYjY-kSNuKhBLdYTlxI98yKuClgSDQxyXMHSv06X9jOmOZDAWYw2jMNQzGMbsVAWKZ8w5Yku29HUd3KJdHKgVz3M8rUjUPKhmkUYx4lMJQgxKSYC1MJCEjHdE0vEvdj1KI8L1FByb2bCDIJsiJJkQ8lJhtboC2UJCOhfWzWgLJQWosyYHCRTqGKwRrxGwqJiawqGqOp6XqNM0LT0nAaUfRxJmWC8KvHI9eosE1rADJJZ3mZQjDMItBXQ21rRjRN7sWJ6n0g7R8NG7qCqO-bJhfFQVgNBlPq0cHvum+6EJM37aNa2cWsfJRNDnJRkIGQwDpGdFDxKCxZlWJCrp2l6vrcojhOqySwD8mlyamXGZfW30OVzTI8x1vU5gWELwdYCx1Fy1tqKKz6CLXV11wjDg4wZpD5gMMwkcgF9ym6RY+qR1bMfW5z2CJ6Txs6sTxOgPxZfMVFUKWUwilK-n2hK8xbBkBJDZhV8K1kNQMhcLtYz9rvqP2xH3Jlkrw66Sx3N0bRUJGcdQw0aP5DGAJnE7J2tC7rQ2RiWPpekMaYkY9tNDmeY7dGc2zs2FYJjdgmyfWSmq9OjUWJzEtsn7GCumWdFlE5KaA9mEcBcGSJJNHCeLDPJM3fDz3j8m49rsmctJhJUKFQ-Gmi6QhGAY1IMSp0KYRYEGgNEabUQ5hxKmjKWJJSFN5A8TNEMUabJbBwGQcgzAqAACi9gAHrPgTNNNuoB9AlAUJGKy6hOx6OLKYFYTwZimGLJmAsrBJ6ACIQAj5gDAFAJ3iPA+lAOgOBEBEfBYjJHyFPJI-AhjCAKJ0VoGQ5hTz9GoWYOADBZCJCSDsM0J8uzWGRKYAwmAaH4KWtIzB2BeCMOYdoGQe9F4Vg0OYDsJ4EgZiWCgrgJgNDhI8YnbxvjfGGP8fYgJnipEiOkQUZhWkBAAE6c-sJgPAtJC5zAmOZKYcwJhyw1nmYJOZQlsNOhw-Bq9d5bwONvDK+8j5zGfFYDQ6I0RKJRCQX+qTJhHzybUpAOT8kp0KaUlJO9ymVOqXo2p9SlD1LVEI9E-Skn6CwWQSIr58Qni8vAVq2QjbGDnEaI0ZgaLGgZO5apjS0kPNebUnp9SBBC2oqUo8mz5m2LaTYY8Fhbx1K0H2KJhZ8TfnlBYY8NgnhNJGf1FpQxRnjKmRMrJHS8lUruZQp5+AnkvJOXgNpXcDnHkPIeRAx5jyncUGCo0YLYShCZFWSJHCuw6HiJc34JJrAJHSKizBOLRlAt6QSuF+AkUorRZi6+uK5ALxJQ8hVfSKkkFSjojEGZCz6nlBECakFfAGAnNIQsRYsKVhwhaIsPLF6aqwCAA */
		id: "gachaSpinMachine",
		context: {
			triggerId: null,
			spinResult: null,
			refundResult: null as RefundResult | null,
			userAddress: null,
			publicClient: null,
			gachaAddress: null,
			error: null as string | null,
			retryCount: 0,
		},
		initial: "idle",
		states: {
			idle: {
				entry: "clearError",
				on: {
					START_SPIN: {
						target: "spinning",
						actions: "setUserAndClient",
					},
					TRANSACTION_CONFIRMED: {
						target: "waitingForFulfillment",
						actions: ["setTriggerId", "persistToStorage"],
					},
				},
			},
			spinning: {
				on: {
					TRANSACTION_CONFIRMED: {
						target: "waitingForFulfillment",
						actions: ["setTriggerId", "persistToStorage"],
					},
					TRANSACTION_CANCELED: "idle",
					ERROR: {
						target: "error",
						actions: "setError",
					},
					RESET: "idle",
				},
			},
			waitingForFulfillment: {
				invoke: {
					id: "pollForSpinFulfillment",
					src: "pollForSpinFulfillment",
					input: ({ context }) => {
						if (
							!context.triggerId ||
							!context.userAddress ||
							!context.publicClient ||
							!context.gachaAddress
						) {
							throw new Error(
								"Missing required context for spin fulfillment polling",
							);
						}
						return {
							triggerId: context.triggerId,
							userAddress: context.userAddress as `0x${string}`,
							publicClient: context.publicClient,
							gachaAddress: context.gachaAddress as `0x${string}`,
						};
					},
					onDone: {
						target: "revealing",
						actions: ["setSpinResult", "clearFromStorage"],
					},
					onError: [
						{
							target: "refunded",
							guard: ({ event }) => {
								const errorMessage = (event.error as Error)?.message || "";
								return errorMessage.startsWith("REFUND:");
							},
							actions: ["setRefundFromError", "clearFromStorage"],
						},
						{
							target: "error",
							actions: "setPollingError",
						},
					],
				},
				on: {
					SPIN_FULFILLED: {
						target: "revealing",
						actions: ["setSpinResult", "clearFromStorage"],
					},
					SPIN_REFUNDED: {
						target: "refunded",
						actions: ["setRefundResult", "clearFromStorage"],
					},
					TIMEOUT: {
						target: "timeout",
						actions: "setTimeoutError",
					},
					TRANSACTION_CANCELED: "idle",
					RESET: "idle",
					RETRY: {
						target: "waitingForFulfillment",
						guard: "canRetry",
						actions: "incrementRetry",
					},
				},
			},
			revealing: {
				on: {
					CLOSE_REVEAL: "idle",
					RESET: "idle",
				},
			},
			timeout: {
				on: {
					RESET: "idle",
				},
			},
			error: {
				on: {
					RETRY: {
						target: "waitingForFulfillment",
						guard: "canRetry",
						actions: "incrementRetry",
					},
					RESET: "idle",
				},
			},
			refunded: {
				on: {
					RESET: "idle",
				},
			},
		},
	},
	{
		actors: {
			pollForSpinFulfillment,
		},
		actions: {
			setUserAndClient: assign({
				userAddress: ({ event }) =>
					event.type === "START_SPIN" ? event.userAddress : null,
				publicClient: ({ event }) =>
					event.type === "START_SPIN" ? event.publicClient : null,
				gachaAddress: ({ event }) =>
					event.type === "START_SPIN" ? event.gachaAddress : null,
				retryCount: 0,
			}),
			setTriggerId: assign({
				triggerId: ({ event }) =>
					event.type === "TRANSACTION_CONFIRMED" ? event.triggerId : null,
			}),
			setSpinResult: assign({
				spinResult: ({ event }) => {
					console.log(
						"🎯 [GachaSpinMachine] Setting spin result for event:",
						event.type,
					);
					if (event.type === "SPIN_FULFILLED") {
						console.log(
							"✅ [GachaSpinMachine] SPIN_FULFILLED event:",
							event.result,
						);
						return event.result;
					}
					// Handle actor completion
					if (event.type === "xstate.done.actor.pollForSpinFulfillment") {
						console.log(
							"✅ [GachaSpinMachine] Polling actor completed:",
							event.output,
						);
						return event.output;
					}
					return null;
				},
			}),
			setRefundResult: assign({
				refundResult: ({ event }) => {
					console.log(
						"💰 [GachaSpinMachine] Setting refund result for event:",
						event.type,
					);
					if (event.type === "SPIN_REFUNDED") {
						console.log(
							"✅ [GachaSpinMachine] SPIN_REFUNDED event:",
							event.refundResult,
						);
						return event.refundResult;
					}
					return null;
				},
			}),
			setError: assign({
				error: ({ event }) => (event.type === "ERROR" ? event.error : null),
			}),
			setPollingError: assign({
				error: ({ event }) => {
					if (event.type === "xstate.error.actor.pollForSpinFulfillment") {
						const errorMessage =
							(event.error as Error)?.message || "Polling failed";
						// Check if this is a refund error
						if (errorMessage.startsWith("REFUND:")) {
							// This is handled by setRefundFromError action
							return null;
						}
						return errorMessage;
					}
					return "Unknown polling error";
				},
			}),
			setRefundFromError: assign({
				refundResult: ({ event }) => {
					if (event.type === "xstate.error.actor.pollForSpinFulfillment") {
						const errorMessage = (event.error as Error)?.message || "";
						if (errorMessage.startsWith("REFUND:")) {
							try {
								const refundJson = errorMessage.substring(7);
								const refundData = JSON.parse(refundJson) as {
									selectedRarity: string;
									refundAmount: string;
								};

								// Validate the parsed data
								if (
									!refundData.selectedRarity ||
									typeof refundData.refundAmount !== "string"
								) {
									throw new Error("Invalid refund data structure");
								}

								return {
									selectedRarity: refundData.selectedRarity,
									refundAmount: BigInt(refundData.refundAmount),
								} as RefundResult;
							} catch (e) {
								console.error("Failed to parse refund data:", e);
								return null;
							}
						}
					}
					return null;
				},
			}),
			setTimeoutError: assign({
				error: () =>
					"Randomness generation timed out. You can reclaim your funds or try again.",
			}),
			clearError: assign({
				error: () => null,
			}),
			incrementRetry: assign({
				retryCount: ({ context }) => context.retryCount + 1,
			}),
			persistToStorage: ({ context }) => {
				if (context.userAddress && context.gachaAddress && context.triggerId) {
					saveToStorage(
						context.userAddress,
						context.gachaAddress,
						context.triggerId,
					);
				}
			},
			clearFromStorage: ({ context }) => {
				if (context.userAddress && context.gachaAddress) {
					removeFromStorage(context.userAddress, context.gachaAddress);
				}
			},
		},
		guards: {
			canRetry: ({ context }) => context.retryCount < MAX_RETRIES,
		},
	},
);

export type GachaSpinMachine = typeof gachaSpinMachine;
