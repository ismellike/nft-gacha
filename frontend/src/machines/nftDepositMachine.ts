"use client";

import { assign, createMachine, fromPromise } from "xstate";
import type { PublicClient } from "viem";
import { erc721Abi } from "../generated";

export interface NFTDepositContext {
	collection: string | null;
	tokenId: string | null;
	treasuryAddress: string | null;
	userAddress: string | null;
	publicClient: PublicClient | null;
	approvalTxHash: string | null;
	depositTxHash: string | null;
	error: string | null;
	retryCount: number;
	approvalNeeded: boolean;
	// Callback functions for deposit completion
	onAction?: (collection: string, tokenId: string, hasValidAppraisal?: boolean) => void;
	onAppraisalStatusChange?: (collection: string, tokenId: string, hasValidAppraisal: boolean) => void;
	refetchTreasuryCards?: () => Promise<void>;
}

export type NFTDepositEvent =
	| {
			type: "START_DEPOSIT";
			collection: string;
			tokenId: string;
			treasuryAddress: string;
			userAddress: string;
			publicClient: PublicClient;
			onAction?: (collection: string, tokenId: string, hasValidAppraisal?: boolean) => void;
			onAppraisalStatusChange?: (collection: string, tokenId: string, hasValidAppraisal: boolean) => void;
			refetchTreasuryCards?: () => Promise<void>;
	  }
	| { type: "APPROVAL_REQUESTED" }
	| { type: "APPROVAL_CONFIRMED"; txHash: string }
	| { type: "DEPOSIT_REQUESTED" }
	| { type: "DEPOSIT_CONFIRMED"; txHash: string }
	| { type: "FAIL"; error: string }
	| { type: "RESET" };

const MAX_RETRIES = 3;

// Actor to check if approval is needed
const checkApprovalNeeded = fromPromise(
	async ({
		input,
	}: {
		input: {
			collection: string;
			treasuryAddress: string;
			userAddress: string;
			publicClient: PublicClient;
		};
	}): Promise<boolean> => {
		const { collection, treasuryAddress, userAddress, publicClient } = input;

		try {
			// Check if already approved for all (standard EVM pattern)
			const isApprovedForAll = await publicClient.readContract({
				address: collection as `0x${string}`,
				abi: erc721Abi,
				functionName: "isApprovedForAll",
				args: [userAddress as `0x${string}`, treasuryAddress as `0x${string}`],
			});

			return !isApprovedForAll; // Return true if approval needed
		} catch (error) {
			console.error("Approval check failed, assuming approval needed:", error);
			return true; // Assume approval needed on error
		}
	},
);


export const nftDepositMachine = createMachine(
	{
		id: "nftDepositMachine",
		context: {
			collection: null,
			tokenId: null,
			treasuryAddress: null,
			userAddress: null,
			publicClient: null,
			approvalTxHash: null,
			depositTxHash: null,
			error: null as string | null,
			retryCount: 0,
			approvalNeeded: true,
			onAction: undefined,
			onAppraisalStatusChange: undefined,
			refetchTreasuryCards: undefined,
		},
		initial: "idle",
		states: {
			idle: {
				entry: "clearState",
				on: {
					START_DEPOSIT: {
						target: "checkingApproval",
						actions: "setDepositParams",
					},
				},
			},
			checkingApproval: {
				invoke: {
					id: "checkApprovalNeeded",
					src: "checkApprovalNeeded",
					input: ({ context }) => ({
						collection: context.collection,
						treasuryAddress: context.treasuryAddress,
						userAddress: context.userAddress,
						publicClient: context.publicClient,
					}),
					onDone: [
						{
							target: "awaitingDepositSignature",
							guard: ({ event }) => !event.output, // If approval NOT needed
							actions: "setApprovalNotNeeded",
						},
						{
							target: "awaitingApprovalSignature",
							guard: ({ event }) => event.output, // If approval needed
							actions: "setApprovalNeeded",
						},
					],
					onError: {
						target: "idle",
						actions: "setError",
					},
				},
				on: {
					RESET: "idle",
					FAIL: {
						target: "idle",
						actions: "setError",
					},
				},
			},
			awaitingApprovalSignature: {
				on: {
					APPROVAL_CONFIRMED: {
						target: "awaitingApprovalReceipt",
						actions: "setApprovalTxHash",
					},
					FAIL: {
						target: "idle",
						actions: "setError",
					},
					RESET: "idle",
				},
			},
			awaitingApprovalReceipt: {
				on: {
					APPROVAL_REQUESTED: {
						target: "awaitingDepositSignature",
					},
					FAIL: {
						target: "idle",
						actions: "setError",
					},
					RESET: "idle",
				},
			},
			awaitingDepositSignature: {
				on: {
					DEPOSIT_CONFIRMED: {
						target: "awaitingDepositReceipt",
						actions: "setDepositTxHash",
					},
					FAIL: {
						target: "idle",
						actions: "setError",
					},
					RESET: "idle",
				},
			},
			awaitingDepositReceipt: {
				on: {
					DEPOSIT_REQUESTED: {
						target: "confirmingDeposit",
					},
					FAIL: {
						target: "idle",
						actions: "setError",
					},
					RESET: "idle",
				},
			},
			confirmingDeposit: {
				invoke: {
					id: "confirmNFTDeposit",
					src: "confirmNFTDeposit",
					input: ({ context }) => ({
						collection: context.collection,
						tokenId: context.tokenId,
						userAddress: context.userAddress,
						publicClient: context.publicClient,
					}),
					onDone: {
						target: "completed",
					},
					onError: {
						target: "idle",
						actions: "setError",
					},
				},
				on: {
					FAIL: {
						target: "idle",
						actions: "setError",
					},
					RESET: "idle",
				},
			},
			completed: {
				entry: ["clearError", "handleDepositCompletion"],
				on: {
					RESET: "idle",
				},
			},
		},
	},
	{
		actors: {
			checkApprovalNeeded,
			confirmNFTDeposit: fromPromise(
				async ({
					input,
				}: {
					input: {
						collection: string;
						tokenId: string;
						userAddress: string;
						publicClient: PublicClient;
					};
				}): Promise<void> => {
					const { collection, tokenId, userAddress, publicClient } = input;

					try {
						const currentOwner = await publicClient.readContract({
							address: collection as `0x${string}`,
							abi: erc721Abi,
							functionName: "ownerOf",
							args: [BigInt(tokenId)],
						});

						const isDeposited =
							currentOwner?.toLowerCase() !== userAddress.toLowerCase();

						if (!isDeposited) {
							throw new Error("NFT still owned by user - deposit confirmation failed");
						}

						console.log("✅ [NFTDepositMachine] NFT deposit confirmed");
					} catch (error) {
						console.error("❌ [NFTDepositMachine] Deposit confirmation failed:", error);
						throw error; // Don't default to success - surface the error
					}
				},
			),
		},
		actions: {
			clearState: assign({
				collection: null,
				tokenId: null,
				treasuryAddress: null,
				userAddress: null,
				publicClient: null,
				approvalTxHash: null,
				depositTxHash: null,
				error: null,
				retryCount: 0,
				approvalNeeded: true,
				onAction: undefined,
				onAppraisalStatusChange: undefined,
				refetchTreasuryCards: undefined,
			}),
			setDepositParams: assign({
				collection: ({ event }) =>
					event.type === "START_DEPOSIT" ? event.collection : null,
				tokenId: ({ event }) =>
					event.type === "START_DEPOSIT" ? event.tokenId : null,
				treasuryAddress: ({ event }) =>
					event.type === "START_DEPOSIT" ? event.treasuryAddress : null,
				userAddress: ({ event }) =>
					event.type === "START_DEPOSIT" ? event.userAddress : null,
				publicClient: ({ event }) =>
					event.type === "START_DEPOSIT" ? event.publicClient : null,
				onAction: ({ event }) =>
					event.type === "START_DEPOSIT" ? event.onAction : undefined,
				onAppraisalStatusChange: ({ event }) =>
					event.type === "START_DEPOSIT" ? event.onAppraisalStatusChange : undefined,
				refetchTreasuryCards: ({ event }) =>
					event.type === "START_DEPOSIT" ? event.refetchTreasuryCards : undefined,
				retryCount: 0,
				error: null,
			}),
			setApprovalNeeded: assign({
				approvalNeeded: true,
			}),
			setApprovalNotNeeded: assign({
				approvalNeeded: false,
			}),
			setApprovalTxHash: assign({
				approvalTxHash: ({ event }) =>
					event.type === "APPROVAL_CONFIRMED" ? event.txHash : null,
			}),
			setDepositTxHash: assign({
				depositTxHash: ({ event }) =>
					event.type === "DEPOSIT_CONFIRMED" ? event.txHash : null,
			}),
			setError: assign({
				error: ({ event }) => {
					if (event.type === "FAIL") {
						return event.error;
					}
					if (event.type === "xstate.error.actor.checkApprovalNeeded") {
						return (
							(event.error as Error)?.message || "Failed to check approval"
						);
					}
					if (event.type === "xstate.error.actor.confirmNFTDeposit") {
						return (
							(event.error as Error)?.message || "Failed to confirm deposit"
						);
					}
					return "Unknown error occurred";
				},
			}),
			clearError: assign({
				error: null,
			}),
			incrementRetry: assign({
				retryCount: ({ context }) => context.retryCount + 1,
			}),
			logError: ({ context }) => {
				console.error("❌ [NFTDepositMachine] Error:", context.error);
			},
			handleDepositCompletion: ({ context }) => {
				console.log("✅ [NFTDepositMachine] Deposit completed successfully");
				// Trigger completion callbacks if available
				try {
					if (context.onAction && context.collection && context.tokenId) {
						(context.onAction as any)(context.collection, context.tokenId, true);
					}
					if (context.onAppraisalStatusChange && context.collection && context.tokenId) {
						(context.onAppraisalStatusChange as any)(context.collection, context.tokenId, true);
					}
					if (context.refetchTreasuryCards) {
						(context.refetchTreasuryCards as any)();
					}
				} catch (error) {
					console.error("❌ [NFTDepositMachine] Error in completion callbacks:", error);
				}
			},
		},
		guards: {
			canRetry: ({ context }) => context.retryCount < MAX_RETRIES,
		},
	},
);

export type NFTDepositMachine = typeof nftDepositMachine;
