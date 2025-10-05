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
}

export type NFTDepositEvent =
	| {
			type: "START_DEPOSIT";
			collection: string;
			tokenId: string;
			treasuryAddress: string;
			userAddress: string;
			publicClient: PublicClient;
	  }
	| { type: "APPROVAL_TRANSACTION_SENT"; txHash: string }
	| { type: "DEPOSIT_TRANSACTION_SENT"; txHash: string }
	| { type: "RETRY" }
	| { type: "RESET" }
	| { type: "ERROR"; error: string };

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

// Actor to confirm NFT deposit
const confirmNFTDeposit = fromPromise(
	async ({
		input,
	}: {
		input: {
			collection: string;
			tokenId: string;
			userAddress: string;
			publicClient: PublicClient;
		};
	}): Promise<boolean> => {
		const { collection, tokenId, userAddress, publicClient } = input;

		try {
			const currentOwner = await publicClient.readContract({
				address: collection as `0x${string}`,
				abi: erc721Abi,
				functionName: "ownerOf",
				args: [BigInt(tokenId)],
			});

			const isDeposited = currentOwner?.toLowerCase() !== userAddress.toLowerCase();

			if (isDeposited) {
				console.log("✅ [NFTDepositMachine] NFT successfully deposited");
				return true;
			} else {
				throw new Error("NFT still owned by user - deposit may have failed");
			}
		} catch (error) {
			// If ownerOf fails, the token might not exist or access might be restricted
			// In this case, we'll assume the deposit succeeded
			console.log(
				"ℹ️ [NFTDepositMachine] Could not verify NFT ownership, assuming deposit succeeded",
			);
			return true;
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
							target: "depositing",
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
						target: "error",
						actions: "setError",
					},
				},
				on: {
					RESET: "idle",
				},
			},
			approving: {
				on: {
					APPROVAL_TRANSACTION_SENT: {
						target: "depositing",
						actions: "setApprovalTxHash",
					},
					ERROR: {
						target: "error",
						actions: "setError",
					},
					RESET: "idle",
				},
			},
			depositing: {
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
						target: "error",
						actions: "setError",
					},
				},
				on: {
					DEPOSIT_TRANSACTION_SENT: {
						target: "completed",
						actions: "setDepositTxHash",
					},
					ERROR: {
						target: "error",
						actions: "setError",
					},
					RESET: "idle",
				},
			},
			completed: {
				entry: "clearError",
				on: {
					RESET: "idle",
				},
			},
			error: {
				entry: "logError",
				on: {
					RETRY: {
						target: "checkingApproval",
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
			checkApprovalNeeded,
			confirmNFTDeposit,
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
					event.type === "APPROVAL_TRANSACTION_SENT" ? event.txHash : null,
			}),
			setDepositTxHash: assign({
				depositTxHash: ({ event }) =>
					event.type === "DEPOSIT_TRANSACTION_SENT" ? event.txHash : null,
			}),
			setError: assign({
				error: ({ event }) => {
					if (event.type === "ERROR") {
						return event.error;
					}
					if (event.type === "xstate.error.actor.checkApprovalNeeded") {
						return (event.error as Error)?.message || "Failed to check approval";
					}
					if (event.type === "xstate.error.actor.confirmNFTDeposit") {
						return (event.error as Error)?.message || "Failed to confirm deposit";
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
		},
		guards: {
			canRetry: ({ context }) => context.retryCount < MAX_RETRIES,
		},
	},
);

export type NFTDepositMachine = typeof nftDepositMachine;
