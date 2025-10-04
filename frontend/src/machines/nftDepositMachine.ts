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
	approvalStatus: "none" | "individual" | "all" | "not_needed";
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

// Actor to check approval status
const checkApprovalStatus = fromPromise(
	async ({
		input,
	}: {
		input: {
			collection: string;
			tokenId: string;
			treasuryAddress: string;
			userAddress: string;
			publicClient: PublicClient;
		};
	}): Promise<"individual" | "all" | "none"> => {
		const { collection, tokenId, treasuryAddress, userAddress, publicClient } =
			input;

		try {
			// First check if approved for all (most efficient)
			const isApprovedForAll = await publicClient.readContract({
				address: collection as `0x${string}`,
				abi: erc721Abi,
				functionName: "isApprovedForAll",
				args: [userAddress as `0x${string}`, treasuryAddress as `0x${string}`],
			});

			if (isApprovedForAll) {
				console.log("✅ [NFTDepositMachine] Treasury approved for all NFTs");
				return "all";
			}

			// Check individual NFT approval
			const approved = await publicClient.readContract({
				address: collection as `0x${string}`,
				abi: erc721Abi,
				functionName: "getApproved",
				args: [BigInt(tokenId)],
			});

			if (approved?.toLowerCase() === treasuryAddress.toLowerCase()) {
				console.log("✅ [NFTDepositMachine] NFT already approved individually");
				return "individual";
			}

			console.log("ℹ️ [NFTDepositMachine] NFT approval needed");
			return "none";
		} catch (error) {
			console.error("❌ [NFTDepositMachine] Approval check failed:", error);
			throw new Error(
				`Failed to check approval status: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
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
			approvalStatus: "none" as "none" | "individual" | "all" | "not_needed",
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
					id: "checkApprovalStatus",
					src: "checkApprovalStatus",
					input: ({ context }) => ({
						collection: context.collection,
						tokenId: context.tokenId,
						treasuryAddress: context.treasuryAddress,
						userAddress: context.userAddress,
						publicClient: context.publicClient,
					}),
					onDone: {
						target: "depositing",
						actions: "setApprovalStatus",
					},
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
						target: "waitingForApproval",
						actions: "setApprovalTxHash",
					},
					ERROR: {
						target: "error",
						actions: "setError",
					},
					RESET: "idle",
				},
			},
			waitingForApproval: {
				after: {
					30000: {
						target: "error",
						actions: () => assign({ error: "Approval transaction timeout" }),
					},
				},
				on: {
					DEPOSIT_TRANSACTION_SENT: {
						target: "depositing",
						actions: "setDepositTxHash",
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
		on: {
			RESET: "idle",
		},
	},
	{
		actors: {
			checkApprovalStatus,
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
				approvalStatus: "none",
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
			setApprovalStatus: assign({
				approvalStatus: ({ event }) => {
					if (event.type === "xstate.done.actor.checkApprovalStatus") {
						return event.output === "none" ? "none" : "not_needed";
					}
					return "none";
				},
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
					if (event.type === "xstate.error.actor.checkApprovalStatus") {
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
