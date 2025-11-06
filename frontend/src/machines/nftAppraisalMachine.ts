"use client";

import { assign, createMachine, fromPromise } from "xstate";
import type { PublicClient } from "viem";
import { isAddress } from "viem";

export interface AppraisalResult {
	collection: string;
	tokenId: string;
	appraisalData: readonly [boolean, bigint, bigint, string, bigint]; // [exists, appraisedPrice, rarityScore, metadata, lastUpdated]
}

export interface AppraisalCallbacks {
	approveTokens: (params: {
		address: `0x${string}`;
		abi: readonly unknown[];
		functionName: string;
		args: readonly unknown[];
	}) => Promise<`0x${string}`>;
	requestAppraisal: (params: {
		address: `0x${string}`;
		abi: readonly unknown[];
		functionName: string;
		args: readonly unknown[];
	}) => Promise<`0x${string}`>;
}

export interface NFTAppraisalContext {
	collection: string;
	tokenId: string;
	userAddress: string | null;
	publicClient: PublicClient | null;
	appraisalContractAddress: string | null;
	feeTokenAddress: string | null;
	appraisalFee: bigint | null;
	approvalTxHash: string | null;
	submissionTxHash: string | null;
	appraisalResult: AppraisalResult | null;
	error: string | null;
	retryCount: number;
	pollingIntervalId: NodeJS.Timeout | null;
	callbacks: AppraisalCallbacks | null;
	approvalNeeded: boolean;
}

export type NFTAppraisalEvent =
	| {
			type: "START_APPRAISAL";
			collection: string;
			tokenId: string;
			userAddress: string;
			publicClient: PublicClient;
			appraisalContractAddress: string;
			feeTokenAddress: string;
			appraisalFee: bigint;
			callbacks: AppraisalCallbacks;
	  }
	| { type: "APPROVAL_CONFIRMED"; txHash: string }
	| { type: "SUBMISSION_CONFIRMED"; txHash: string }
	| { type: "APPRAISAL_COMPLETED"; result: AppraisalResult }
	| { type: "RESET" }
	| { type: "RETRY" }
	| { type: "ERROR"; error: string }
	| { type: "CANCEL" }
	| { type: "POLLING_TIMEOUT" }
	| { type: "CLEAR_TX_HASHES" };

const MAX_RETRIES = 3;
const POLLING_INTERVAL = 5000; // 5 seconds
const MAX_POLLING_TIME = 300000; // 5 minutes

// Utility function for exponential backoff with jitter
const getPollingDelay = (attempt: number, baseInterval: number): number => {
	const exponentialDelay = baseInterval * 2 ** Math.min(attempt / 10, 5);
	const jitter = Math.random() * 0.1 * exponentialDelay; // 10% jitter
	return Math.min(exponentialDelay + jitter, 30000); // Max 30 seconds
};

// Actor to check if approval is needed
const checkApprovalNeeded = fromPromise(
	async ({
		input,
	}: {
		input: {
			feeTokenAddress: string | undefined;
			appraisalContractAddress: string | undefined;
			appraisalFee: bigint | undefined;
			userAddress: string | undefined;
			publicClient: PublicClient | undefined;
		};
	}): Promise<boolean> => {
		const {
			feeTokenAddress,
			appraisalContractAddress,
			appraisalFee,
			userAddress,
			publicClient,
		} = input;

		// Validate inputs
		if (
			!feeTokenAddress ||
			!appraisalContractAddress ||
			!appraisalFee ||
			!userAddress ||
			!publicClient
		) {
			console.error(
				"[NFTAppraisalMachine] Missing required inputs for approval check",
			);
			return true; // Assume approval needed on missing inputs
		}

		try {
			// Check current allowance
			const currentAllowance = await publicClient.readContract({
				address: feeTokenAddress as `0x${string}`,
				abi: [
					{
						name: "allowance",
						type: "function",
						stateMutability: "view",
						inputs: [
							{ name: "owner", type: "address" },
							{ name: "spender", type: "address" },
						],
						outputs: [{ name: "", type: "uint256" }],
					},
				],
				functionName: "allowance",
				args: [
					userAddress as `0x${string}`,
					appraisalContractAddress as `0x${string}`,
				],
			});

			// Return true if current allowance is less than required appraisal fee
			return currentAllowance < appraisalFee;
		} catch (error) {
			console.error("[NFTAppraisalMachine] Approval check failed:", error);
			return true; // Assume approval needed on error
		}
	},
);

// Actor to handle token approval
const handleTokenApproval = fromPromise(
	async ({
		input,
	}: {
		input: {
			feeTokenAddress: `0x${string}` | undefined;
			appraisalContractAddress: `0x${string}` | undefined;
			appraisalFee: bigint | undefined;
			callbacks: AppraisalCallbacks | undefined;
		};
	}): Promise<{ txHash: string }> => {
		const {
			feeTokenAddress,
			appraisalContractAddress,
			appraisalFee,
			callbacks,
		} = input;

		// Validate inputs
		if (
			!feeTokenAddress ||
			!appraisalContractAddress ||
			!appraisalFee ||
			!callbacks
		) {
			throw new Error("Missing required inputs for token approval");
		}

		try {
			// Call the approveTokens callback with approval parameters
			const result = await callbacks.approveTokens({
				address: feeTokenAddress,
				abi: [
					{
						name: "approve",
						type: "function",
						stateMutability: "nonpayable",
						inputs: [
							{ name: "spender", type: "address" },
							{ name: "amount", type: "uint256" },
						],
						outputs: [{ name: "", type: "bool" }],
					},
				],
				functionName: "approve",
				args: [appraisalContractAddress, appraisalFee],
			});

			return { txHash: result };
		} catch (error) {
			console.error("[NFTAppraisalMachine] Token approval failed:", error);
			throw error;
		}
	},
);

// Actor to handle appraisal submission
const handleAppraisalSubmission = fromPromise(
	async ({
		input,
	}: {
		input: {
			appraisalContractAddress: `0x${string}` | undefined;
			collection: string;
			tokenId: string;
			callbacks: AppraisalCallbacks | undefined;
		};
	}): Promise<{ txHash: string }> => {
		const { appraisalContractAddress, collection, tokenId, callbacks } = input;

		// Validate inputs
		if (!appraisalContractAddress || !callbacks) {
			throw new Error("Missing required inputs for appraisal submission");
		}

		try {
			// Call the requestAppraisal callback with submission parameters
			const result = await callbacks.requestAppraisal({
				address: appraisalContractAddress,
				abi: [
					{
						name: "requestAppraisal",
						type: "function",
						stateMutability: "payable",
						inputs: [
							{ name: "collection", type: "address" },
							{ name: "tokenId", type: "uint256" },
						],
						outputs: [],
					},
				],
				functionName: "requestAppraisal",
				args: [collection as `0x${string}`, BigInt(tokenId)],
			});

			return { txHash: result };
		} catch (error) {
			console.error(
				"[NFTAppraisalMachine] Appraisal submission failed:",
				error,
			);
			throw error;
		}
	},
);

// Actor to poll for appraisal completion with improved error handling
const pollForAppraisalCompletion = fromPromise(
	async ({
		input,
	}: {
		input: {
			collection: string;
			tokenId: string;
			publicClient: PublicClient;
			appraisalContractAddress: string;
		};
	}): Promise<AppraisalResult> => {
		const { collection, tokenId, publicClient, appraisalContractAddress } =
			input;
		const startTime = Date.now();
		let timeoutId: NodeJS.Timeout | null = null;

		return new Promise((resolve, reject) => {
			let attempts = 0;
			const maxAttempts = Math.floor(MAX_POLLING_TIME / POLLING_INTERVAL);
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
						new Error(`Appraisal polling timeout after ${MAX_POLLING_TIME}ms`),
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
							`Appraisal polling timeout: ${attempts} attempts over ${elapsed}ms`,
						),
					);
					return;
				}

				try {
					// Validate inputs before polling
					if (
						!publicClient ||
						!appraisalContractAddress ||
						!collection ||
						!tokenId
					) {
						cleanup();
						reject(new Error("Invalid polling parameters"));
						return;
					}

					// Validate token ID format
					const tokenIdNum = Number(tokenId);
					if (Number.isNaN(tokenIdNum) || tokenIdNum < 0) {
						cleanup();
						reject(new Error("Invalid token ID format"));
						return;
					}

					const appraisalData = await publicClient.readContract({
						address: appraisalContractAddress as `0x${string}`,
						abi: [
							{
								name: "getAppraisal",
								type: "function",
								stateMutability: "view",
								inputs: [
									{ name: "collection", type: "address" },
									{ name: "tokenId", type: "uint256" },
								],
								outputs: [
									{ name: "exists", type: "bool" },
									{ name: "appraisedPrice", type: "uint256" },
									{ name: "rarityScore", type: "uint256" },
									{ name: "metadata", type: "string" },
									{ name: "lastUpdated", type: "uint256" },
								],
							},
						],
						functionName: "getAppraisal",
						args: [collection as `0x${string}`, BigInt(tokenId)],
					});

					const [exists, appraisedPrice, rarityScore, metadata, lastUpdated] =
						appraisalData as [boolean, bigint, bigint, string, bigint];

					// If appraisal exists and has meaningful data, consider it complete
					if (exists && appraisedPrice > BigInt(0)) {
						const result: AppraisalResult = {
							collection,
							tokenId,
							appraisalData: [
								exists,
								appraisedPrice,
								rarityScore,
								metadata || "",
								lastUpdated,
							],
						};

						console.log(
							"✅ [NFTAppraisalMachine] Appraisal completed:",
							result,
						);
						cleanup();
						resolve(result);
						return;
					}

					// Continue polling with exponential backoff
					if (!isDestroyed) {
						const delay = getPollingDelay(attempts, POLLING_INTERVAL);
						timeoutId = setTimeout(poll, delay);
					}
				} catch (error) {
					console.error(
						`[NFTAppraisalMachine] Polling error (attempt ${attempts}):`,
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
								: new Error("Unknown appraisal polling error"),
						);
					}
				}
			};

			// Start polling immediately
			poll();
		});
	},
);

export const nftAppraisalMachine = createMachine(
	{
		/** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAOlwGIBlAFQG0AGAXUVAAcB7WKgFz3YgAPRAFoANCAAeiAOwBmAEwB2eQA4ALPOXyAjAHYA7EoXaAvu-1osufIRLkKVGrXoNQkPeDBQBbJOvwBCAHJQ9iwUCXgQLgwAFrEAtlSJyfFm4Va29o7OCA70SoYGKqKuAGzmBQUqqnmlWnrICGACfOp6ShX1BiryBgYmFmIAFJTc3IzqBiNKg8rqKjNTBibqijNZBa64Fj3e2BB+AcGhNggOyckYaYkpGVm51pQdBQBKXV1+fQNDirJFaLJTIJHY7KSLbYZGp6bT2BR-X4gP5A0GJGE7RGpDbJRLJeLsJIcXJFEplRglcq3G5vZTqbQKZQeTw+RRKfxM6qlQL0uxTJQ6bSJVpOMBSEJsIhIOl0w5IxaouHJOSpXa4gm7A7HMlnA6gK5Uu53R4U6r057vZkfepNH4cvy84YuUYGAz2cJiSxdQzOSY68QWNEaHq6MKmfT9CxGh2xE2I1L2ilUrbO47HTkOl1sz3cv38hqUJQmIVKPM+0UjcKGEx62JiJyGJTlyvZGvpVLO5LOt1kz2YWkOhBOxtGfOzBQNgzmQf2CLNOw13NR8RGYT6BoKTyLgzTJQi5xKgvLyuy2JuJXTWyIjOy4xRyzaB+IZQZKzqNQmeaJJ2l5PTB2KUdjR6aN+iNMV3WtXJK3ybJCm0eRIi9OYzE0BFNGzdRNBMI8y02Cshx2MsgNfM1LwgV1oNFX4JRgtQWgnRRJh0LQTTLSxVF0eZdDMJQ8yQ3clVw3YCOKLxN2lT05wnZU6LfBj3nKH5jCWIwKSQpF2UQjsZQQrE2g7VIplMSw1G7WZkVHZZYjY-kSNuKhBLdYTlxI98yKuClgSDQxyXMHSv06X9jOmOZDAWYw2jMNQzGMbsVAWKZ8w5Yku29HUd3KJdHKgVz3M8rUjUPKhmkUYx4lMJQgxKSYC1MJCEjHdE0vEvdj1KI8L1FByb2bCDIJsiJJkQ8lJhtboC2UJCOhfWzWgLJQWosyYHCRTqGKwRrxGwqJiawqGqOp6XqNM0LT0nAaUfRxJmWC8KvHI9eosE1rADJJZ3mZQjDMItBXQ21rRjRN7sWJ6n0g7R8NG7qCqO-bJhfFQVgNBlPq0cHvum+6EJM37aNa2cWsfJRNDnJRkIGQwDpGdFDxKCxZlWJCrp2l6vrcojhOqySwD8mlyamXGZfW30OVzTI8x1vU5gWELwdYCx1Fy1tqKKz6CLXV11wjDg4wZpD5gMMwkcgF9ym6RY+qR1bMfW5z2CJ6Txs6sTxOgPxZfMVFUKWUwilK-n2hK8xbBkBJDZhV8K1kNQMhcLtYz9rvqP2xH3Jlkrw66Sx3N0bRUJGcdQw0aP5DGAJnE7J2tC7rQ2RiWPpekMaYkY9tNDmeY7dGc2zs2FYJjdgmyfWSmq9OjUWJzEtsn7GCumWdFlE5KaA9mEcBcGSJJNHCeLDPJM3fDz3j8m49rsmctJhJUKFQ-Gmi6QhGAY1IMSp0KYRYEGgNEabUQ5hxKmjKWJJSFN5A8TNEMUabJbBwGQcgzAqAACi9gAHrPgTNNNuoB9AlAUJGKy6hOx6OLKYFYTwZimGLJmAsrBJ6ACIQAj5gDAFAJ3iPA+lAOgOBEBEfBYjJHyFPJI-AhjCAKJ0VoGQ5hTz9GoWYOADBZCJCSDsM0J8uzWGRKYAwmAaH4KWtIzB2BeCMOYdoGQe9F4Vg0OYDsJ4EgZiWCgrgJgNDhI8YnbxvjfGGP8fYgJnipEiOkQUZhWkBAAE6c-sJgPAtJC5zAmOZKYcwJhyw1nmYJOZQlsNOhw-Bq9d5bwONvDK+8j5zGfFYDQ6I0RKJRCQX+qTJhHzybUpAOT8kp0KaUlJO9ymVOqXo2p9SlD1LVEI9E-Skn6CwWQSIr58Qni8vAVq2QjbGDnEaI0ZgaLGgZO5apjS0kPNebUnp9SBBC2oqUo8mz5m2LaTYY8Fhbx1K0H2KJhZ8TfnlBYY8NgnhNJGf1FpQxRnjKmRMrJHS8lUruZQp5+AnkvJOXgNpXcDnHkPIeRAx5jyncUGCo0YLYShCZFWSJHCuw6HiJc34JJrAJHSKizBOLRlAt6QSuF+AkUorRZi6+uK5ALxJQ8hVfSKkkFSjojEGZCz6nlBECakFfAGAnNIQsRYsKVhwhaIsPLF6aqwCAA */
		id: "nftAppraisalMachine",
		context: {
			collection: "",
			tokenId: "",
			userAddress: null,
			publicClient: null,
			appraisalContractAddress: null,
			feeTokenAddress: null,
			appraisalFee: null,
			approvalTxHash: null,
			submissionTxHash: null,
			appraisalResult: null,
			error: null as string | null,
			retryCount: 0,
			pollingIntervalId: null,
			callbacks: null,
			approvalNeeded: true,
		},
		initial: "idle",
		states: {
			idle: {
				entry: "clearError",
				on: {
					START_APPRAISAL: {
						target: "validating",
						actions: "setAppraisalParams",
					},
				},
			},
			validating: {
				invoke: {
					id: "checkApprovalNeeded",
					src: "checkApprovalNeeded",
					input: ({ context }) => {
						if (
							!context.feeTokenAddress ||
							!context.appraisalContractAddress ||
							!context.appraisalFee ||
							!context.userAddress ||
							!context.publicClient
						) {
							throw new Error("Missing required context for approval check");
						}
						return {
							feeTokenAddress: context.feeTokenAddress,
							appraisalContractAddress: context.appraisalContractAddress,
							appraisalFee: context.appraisalFee,
							userAddress: context.userAddress,
							publicClient: context.publicClient,
						};
					},
					onDone: [
						{
							target: "submitting",
							guard: ({ event }) => !event.output, // If approval NOT needed
							actions: "setApprovalNotNeeded",
						},
						{
							target: "approving",
							guard: ({ event }) => event.output, // If approval needed
							actions: "setApprovalNeeded",
						},
					],
					onError: {
						target: "approving", // Default to approving on error
						actions: ["setApprovalNeeded", "setError"],
					},
				},
				on: {
					CANCEL: "idle",
				},
			},
			approving: {
				invoke: {
					id: "handleTokenApproval",
					src: "handleTokenApproval",
					input: ({ context }) => {
						if (
							!context.feeTokenAddress ||
							!context.appraisalContractAddress ||
							!context.appraisalFee ||
							!context.callbacks
						) {
							throw new Error("Missing required context for token approval");
						}
						return {
							feeTokenAddress: context.feeTokenAddress as `0x${string}`,
							appraisalContractAddress:
								context.appraisalContractAddress as `0x${string}`,
							appraisalFee: context.appraisalFee,
							callbacks: context.callbacks,
						};
					},
					onDone: {
						target: "submitting",
						actions: ({ event }) => ({
							type: "setApprovalTxHash",
							approvalTxHash: event.output.txHash,
						}),
					},
					onError: {
						target: "error",
						actions: ({ event }) => ({
							type: "setError",
							error: (event.error as Error)?.message || "Token approval failed",
						}),
					},
				},
				on: {
					CANCEL: "idle",
				},
			},
			submitting: {
				invoke: {
					id: "handleAppraisalSubmission",
					src: "handleAppraisalSubmission",
					input: ({ context }) => {
						if (!context.appraisalContractAddress || !context.callbacks) {
							throw new Error(
								"Missing required context for appraisal submission",
							);
						}
						return {
							appraisalContractAddress:
								context.appraisalContractAddress as `0x${string}`,
							collection: context.collection,
							tokenId: context.tokenId,
							callbacks: context.callbacks,
						};
					},
					onDone: {
						target: "waitingForCompletion",
						actions: ({ event }) => ({
							type: "setSubmissionTxHash",
							submissionTxHash: event.output.txHash,
						}),
					},
					onError: {
						target: "error",
						actions: ({ event }) => ({
							type: "setError",
							error:
								(event.error as Error)?.message ||
								"Appraisal submission failed",
						}),
					},
				},
				on: {
					CANCEL: "idle",
				},
			},
			waitingForCompletion: {
				invoke: {
					id: "pollForAppraisalCompletion",
					src: "pollForAppraisalCompletion",
					input: ({ context }) => {
						if (
							!context.publicClient ||
							!context.appraisalContractAddress ||
							!context.collection ||
							!context.tokenId
						) {
							throw new Error("Missing required context for appraisal polling");
						}
						return {
							collection: context.collection,
							tokenId: context.tokenId,
							publicClient: context.publicClient,
							appraisalContractAddress: context.appraisalContractAddress,
						};
					},
					onDone: {
						target: "completed",
						actions: "setAppraisalResult",
					},
					onError: [
						{
							target: "retrying",
							guard: "canRetry",
							actions: ["setError", "incrementRetry"],
						},
						{
							target: "error",
							actions: "setError",
						},
					],
				},
				on: {
					APPRAISAL_COMPLETED: {
						target: "completed",
						actions: "setAppraisalResult",
					},
					POLLING_TIMEOUT: {
						target: "error",
						actions: "setTimeoutError",
					},
					CANCEL: "idle",
					RETRY: {
						target: "waitingForCompletion",
						guard: "canRetry",
						actions: "incrementRetry",
					},
				},
			},
			completed: {
				on: {
					RESET: "idle",
					CLEAR_TX_HASHES: {
						actions: "clearTxHashes",
					},
				},
			},
			retrying: {
				after: {
					3000: {
						target: "waitingForCompletion",
						actions: "clearError",
					},
				},
				on: {
					CANCEL: "idle",
				},
			},
			error: {
				on: {
					RETRY: {
						target: "validating",
						guard: "canRetry",
						actions: ["clearError", "resetRetry"],
					},
					RESET: "idle",
					CANCEL: "idle",
				},
			},
		},
	},
	{
		actors: {
			checkApprovalNeeded,
			handleTokenApproval,
			handleAppraisalSubmission,
			pollForAppraisalCompletion,
		},
		actions: {
			setAppraisalParams: assign({
				collection: ({ event }) =>
					event.type === "START_APPRAISAL" ? event.collection : "",
				tokenId: ({ event }) =>
					event.type === "START_APPRAISAL" ? event.tokenId : "",
				userAddress: ({ event }) =>
					event.type === "START_APPRAISAL" ? event.userAddress : null,
				publicClient: ({ event }) =>
					event.type === "START_APPRAISAL" ? event.publicClient : null,
				appraisalContractAddress: ({ event }) =>
					event.type === "START_APPRAISAL"
						? event.appraisalContractAddress
						: null,
				feeTokenAddress: ({ event }) =>
					event.type === "START_APPRAISAL" ? event.feeTokenAddress : null,
				appraisalFee: ({ event }) =>
					event.type === "START_APPRAISAL" ? event.appraisalFee : null,
				callbacks: ({ event }) =>
					event.type === "START_APPRAISAL" ? event.callbacks : null,
				retryCount: 0,
			}),
			setApprovalNeeded: assign({
				approvalNeeded: true,
			}),
			setApprovalNotNeeded: assign({
				approvalNeeded: false,
			}),
			setApprovalTxHash: assign({
				approvalTxHash: ({ event }) => {
					if (event.type === "APPROVAL_CONFIRMED") {
						return event.txHash;
					}
					// Handle actor completion
					if (event.type === "done.invoke.handleTokenApproval") {
						return event.output.txHash;
					}
					return null;
				},
			}),
			setSubmissionTxHash: assign({
				submissionTxHash: ({ event }) => {
					if (event.type === "SUBMISSION_CONFIRMED") {
						return event.txHash;
					}
					// Handle actor completion
					if (event.type === "done.invoke.handleAppraisalSubmission") {
						return event.output.txHash;
					}
					return null;
				},
			}),
			setAppraisalResult: assign({
				appraisalResult: ({ event }) => {
					if (event.type === "APPRAISAL_COMPLETED") {
						return event.result;
					}
					// Handle actor completion
					if (event.type === "xstate.done.actor.pollForAppraisalCompletion") {
						console.log(
							"✅ [NFTAppraisalMachine] Appraisal actor completed:",
							event.output,
						);
						return event.output;
					}
					return null;
				},
			}),
			setError: assign({
				error: ({ event }) => {
					if (event.type === "ERROR") {
						return event.error;
					}
					if (event.type === "error.platform.checkApprovalNeeded") {
						const errorMessage =
							(event.error as Error)?.message || "Approval check failed";
						return errorMessage;
					}
					if (event.type === "error.platform.handleTokenApproval") {
						const errorMessage =
							(event.error as Error)?.message || "Token approval failed";
						return errorMessage;
					}
					if (event.type === "error.platform.handleAppraisalSubmission") {
						const errorMessage =
							(event.error as Error)?.message || "Appraisal submission failed";
						return errorMessage;
					}
					if (event.type === "error.platform.pollForAppraisalCompletion") {
						const errorMessage =
							(event.error as Error)?.message || "Appraisal polling failed";
						return errorMessage;
					}
					return "Unknown error";
				},
			}),
			setValidationError: assign({
				error: () => "Invalid collection address or token ID",
			}),
			setTimeoutError: assign({
				error: () => "Appraisal timed out. Please try again.",
			}),
			clearError: assign({
				error: () => null,
			}),
			incrementRetry: assign({
				retryCount: ({ context }) => context.retryCount + 1,
			}),
			resetRetry: assign({
				retryCount: 0,
			}),
			clearTxHashes: assign({
				approvalTxHash: () => null,
				submissionTxHash: () => null,
			}),
		},
		guards: {
			canRetry: ({ context }) => context.retryCount < MAX_RETRIES,
			invalidInput: ({ context }) => {
				return (
					!context.collection ||
					!context.tokenId ||
					!isAddress(context.collection) ||
					Number.isNaN(Number(context.tokenId)) ||
					Number(context.tokenId) < 0
				);
			},
		},
	},
);

export type NFTAppraisalMachine = typeof nftAppraisalMachine;
