"use client";

import { assign, createMachine, fromPromise } from "xstate";
import type { PublicClient } from "viem";
import { env } from "../env";

export interface SpinResult {
	rarity: string;
	collection: string;
	tokenId: string;
}

export interface GachaSpinContext {
	triggerId: bigint | null;
	spinResult: SpinResult | null;
	userAddress: string | null;
	publicClient: PublicClient | null;
	error: string | null;
	retryCount: number;
}

export type GachaSpinEvent =
	| { type: "START_SPIN"; userAddress: string; publicClient: PublicClient }
	| { type: "TRANSACTION_CONFIRMED"; triggerId: bigint }
	| { type: "SPIN_FULFILLED"; result: SpinResult }
	| { type: "CLOSE_REVEAL" }
	| { type: "RESET" }
	| { type: "RETRY" }
	| { type: "ERROR"; error: string };

const STORAGE_PREFIX = "pendingSpin_";
const PENDING_SPIN_TIMEOUT = 10 * 60 * 1000; // 10 minutes
const MAX_RETRIES = 5;
const POLLING_INTERVAL = 3000; // 3 seconds

// Actor to poll for SpinFulfilled events
const pollForSpinFulfillment = fromPromise(
	async ({
		input,
	}: {
		input: {
			triggerId: bigint;
			userAddress: string;
			publicClient: PublicClient;
		};
	}): Promise<SpinResult> => {
		const { triggerId, userAddress, publicClient } = input;

		return new Promise((resolve, reject) => {
			let attempts = 0;
			const maxAttempts = 200; // 10 minutes at 3-second intervals

			const poll = async () => {
				attempts++;

				if (attempts > maxAttempts) {
					reject(new Error("Polling timeout: SpinFulfilled event not found"));
					return;
				}

				try {
					// Get current block number
					const currentBlock = await publicClient.getBlockNumber();
					// Search last 1000 blocks to catch recent events
					const fromBlock =
						currentBlock > BigInt(1000)
							? currentBlock - BigInt(1000)
							: BigInt(0);

					// Query SpinFulfilled events for this specific trigger ID
					const logs = await publicClient.getLogs({
						address: env.NEXT_PUBLIC_GACHA_CONTRACT_ADDRESS,
						event: {
							type: "event",
							name: "SpinCompleted",
							inputs: [
								{ name: "triggerId", type: "uint256", indexed: true },
								{ name: "requester", type: "address", indexed: true },
								{ name: "rarity", type: "uint8", indexed: false },
								{ name: "collection", type: "address", indexed: false },
								{ name: "tokenId", type: "uint256", indexed: false },
							],
						},
						args: {
							triggerId: triggerId,
							requester: userAddress as `0x${string}`,
						},
						fromBlock: fromBlock,
						toBlock: currentBlock,
					});

					if (logs.length > 0) {
						const log = logs[0];
						const { rarity, collection, tokenId } = log.args;

						// Convert rarity enum to string
						const rarityNames = [
							"Common",
							"Uncommon",
							"Rare",
							"Epic",
							"Legendary",
						];
						const rarityName = rarityNames[Number(rarity)] || "Unknown";

						const result: SpinResult = {
							rarity: rarityName,
							collection: collection || "",
							tokenId: tokenId?.toString() || "",
						};

						console.log(
							"🎉 [GachaSpinMachine] SpinFulfilled event found:",
							result,
						);
						resolve(result);
						return;
					}

					// Continue polling
					setTimeout(poll, POLLING_INTERVAL);
				} catch (error) {
					console.error("[GachaSpinMachine] Polling error:", error);
					// Continue polling on errors, but count attempts
					setTimeout(poll, POLLING_INTERVAL);
				}
			};

			// Start polling immediately
			poll();
		});
	},
);

// Persistence helpers
const saveToStorage = (userAddress: string, triggerId: bigint) => {
	if (typeof window === "undefined") return;

	const storageKey = `${STORAGE_PREFIX}${userAddress}`;
	try {
		localStorage.setItem(
			storageKey,
			JSON.stringify({
				triggerId: triggerId.toString(),
				timestamp: Date.now(),
			}),
		);
	} catch (error) {
		console.warn("Failed to save to localStorage:", error);
	}
};

const removeFromStorage = (userAddress: string) => {
	if (typeof window === "undefined") return;

	const storageKey = `${STORAGE_PREFIX}${userAddress}`;
	try {
		localStorage.removeItem(storageKey);
	} catch (error) {
		console.warn("Failed to remove from localStorage:", error);
	}
};

export const loadFromStorage = (userAddress: string): bigint | null => {
	if (typeof window === "undefined") return null;

	const storageKey = `${STORAGE_PREFIX}${userAddress}`;
	const stored = localStorage.getItem(storageKey);
	if (!stored) return null;

	try {
		const { triggerId, timestamp } = JSON.parse(stored);

		// Only restore if it's less than timeout period
		if (Date.now() - timestamp < PENDING_SPIN_TIMEOUT) {
			return BigInt(triggerId);
		} else {
			localStorage.removeItem(storageKey);
			return null;
		}
	} catch (error) {
		console.error("Failed to parse stored spin state:", error);
		localStorage.removeItem(storageKey);
		return null;
	}
};

export const gachaSpinMachine = createMachine(
	{
		/** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAOlwGIBlAFQG0AGAXUVAAcB7WKgFz3YgAPRAFoANCAAeiAOwBmAEwB2eQA4ALPOXyAjAHYA7EoXaAvu-1osufIRLkKVGrXoNQkPeDBQBbJOvwBCAHJQ9iwUCXgQLgwAFrEAtlSJyfFm4Va29o7OCA70SoYGKqKuAGzmBQUqqnmlWnrICGACfOp6ShX1BiryBgYmFmIAFJTc3IzqBiNKg8rqKjNTBibqijNZBa64Fj3e2BB+AcGhNggOyckYaYkpGVm51pQdBQBKXV1+fQNDirJFaLJTIJHY7KSLbYZGp6bT2BR-X4gP5A0GJGE7RGpDbJRLJeLsJIcXJFEplRglcq3G5vZTqbQKZQeTw+RRKfxM6qlQL0uxTJQ6bSJVpOMBSEJsIhIOl0w5IxaouHJOSpXa4gm7A7HMlnA6gK5Uu53R4U6r057vZkfepNH4cvy84YuUYGAz2cJiSxdQzOSY68QWNEaHq6MKmfT9CxGh2xE2I1L2ilUrbO47HTkOl1sz3cv38hqUJQmIVKPM+0UjcKGEx62JiJyGJTlyvZGvpVLO5LOt1kz2YWkOhBOxtGfOzBQNgzmQf2CLNOw13NR8RGYT6BoKTyLgzTJQi5xKgvLyuy2JuJXTWyIjOy4xRyzaB+IZQZKzqNQmeaJJ2l5PTB2KUdjR6aN+iNMV3WtXJK3ybJCm0eRIi9OYzE0BFNGzdRNBMI8y02Cshx2MsgNfM1LwgV1oNFX4JRgtQWgnRRJh0LQTTLSxVF0eZdDMJQ8yQ3clVw3YCOKLxN2lT05wnZU6LfBj3nKH5jCWIwKSQpF2UQjsZQQrE2g7VIplMSw1G7WZkVHZZYjY-kSNuKhBLdYTlxI98yKuClgSDQxyXMHSv06X9jOmOZDAWYw2jMNQzGMbsVAWKZ8w5Yku29HUd3KJdHKgVz3M8rUjUPKhmkUYx4lMJQgxKSYC1MJCEjHdE0vEvdj1KI8L1FByb2bCDIJsiJJkQ8lJhtboC2UJCOhfWzWgLJQWosyYHCRTqGKwRrxGwqJiawqGqOp6XqNM0LT0nAaUfRxJmWC8KvHI9eosE1rADJJZ3mZQjDMItBXQ21rRjRN7sWJ6n0g7R8NG7qCqO-bJhfFQVgNBlPq0cHvum+6EJM37aNa2cWsfJRNDnJRkIGQwDpGdFDxKCxZlWJCrp2l6vrcojhOqySwD8mlyamXGZfW30OVzTI8x1vU5gWELwdYCx1Fy1tqKKz6CLXV11wjDg4wZpD5gMMwkcgF9ym6RY+qR1bMfW5z2CJ6Txs6sTxOgPxZfMVFUKWUwilK-n2hK8xbBkBJDZhV8K1kNQMhcLtYz9rvqP2xH3Jlkrw66Sx3N0bRUJGcdQw0aP5DGAJnE7J2tC7rQ2RiWPpekMaYkY9tNDmeY7dGc2zs2FYJjdgmyfWSmq9OjUWJzEtsn7GCumWdFlE5KaA9mEcBcGSJJNHCeLDPJM3fDz3j8m49rsmctJhJUKFQ-Gmi6QhGAY1IMSp0KYRYEGgNEabUQ5hxKmjKWJJSFN5A8TNEMUabJbBwGQcgzAqAACi9gAHrPgTNNNuoB9AlAUJGKy6hOx6OLKYFYTwZimGLJmAsrBJ6ACIQAj5gDAFAJ3iPA+lAOgOBEBEfBYjJHyFPJI-AhjCAKJ0VoGQ5hTz9GoWYOADBZCJCSDsM0J8uzWGRKYAwmAaH4KWtIzB2BeCMOYdoGQe9F4Vg0OYDsJ4EgZiWCgrgJgNDhI8YnbxvjfGGP8fYgJnipEiOkQUZhWkBAAE6c-sJgPAtJC5zAmOZKYcwJhyw1nmYJOZQlsNOhw-Bq9d5bwONvDK+8j5zGfFYDQ6I0RKJRCQX+qTJhHzybUpAOT8kp0KaUlJO9ymVOqXo2p9SlD1LVEI9E-Skn6CwWQSIr58Qni8vAVq2QjbGDnEaI0ZgaLGgZO5apjS0kPNebUnp9SBBC2oqUo8mz5m2LaTYY8Fhbx1K0H2KJhZ8TfnlBYY8NgnhNJGf1FpQxRnjKmRMrJHS8lUruZQp5+AnkvJOXgNpXcDnHkPIeRAx5jyncUGCo0YLYShCZFWSJHCuw6HiJc34JJrAJHSKizBOLRlAt6QSuF+AkUorRZi6+uK5ALxJQ8hVfSKkkFSjojEGZCz6nlBECakFfAGAnNIQsRYsKVhwhaIsPLF6aqwCAA */
		id: "gachaSpinMachine",
		context: {
			triggerId: null,
			spinResult: null,
			userAddress: null,
			publicClient: null,
			error: null,
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
					input: ({ context }) => ({
						triggerId: context.triggerId!,
						userAddress: context.userAddress!,
						publicClient: context.publicClient!,
					}),
					onDone: {
						target: "revealing",
						actions: ["setSpinResult", "clearFromStorage"],
					},
					onError: {
						target: "error",
						actions: "setPollingError",
					},
				},
				on: {
					SPIN_FULFILLED: {
						target: "revealing",
						actions: ["setSpinResult", "clearFromStorage"],
					},
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
			setError: assign({
				error: ({ event }) => (event.type === "ERROR" ? event.error : null),
			}),
			setPollingError: assign({
				error: ({ event }) => {
					if (event.type === "xstate.error.actor.pollForSpinFulfillment") {
						return event.error.message || "Polling failed";
					}
					return "Unknown polling error";
				},
			}),
			clearError: assign({
				error: null,
			}),
			incrementRetry: assign({
				retryCount: ({ context }) => context.retryCount + 1,
			}),
			persistToStorage: ({ context }) => {
				if (context.userAddress && context.triggerId) {
					saveToStorage(context.userAddress, context.triggerId);
				}
			},
			clearFromStorage: ({ context }) => {
				if (context.userAddress) {
					removeFromStorage(context.userAddress);
				}
			},
		},
		guards: {
			canRetry: ({ context }) => context.retryCount < MAX_RETRIES,
		},
	},
);

export type GachaSpinMachine = typeof gachaSpinMachine;
