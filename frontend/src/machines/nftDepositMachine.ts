"use client";

import { assign, createMachine } from "xstate";
import type { PublicClient } from "viem";
import {
	checkApprovalNeeded,
	confirmNFTOwnershipChange,
	createMachineLogger,
	validateAddress,
	validateTokenId,
	validateUserAddress,
	MachineError,
	ErrorCodes,
} from "./shared-actors";

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
	onAction?: (
		collection: string,
		tokenId: string,
		hasValidAppraisal?: boolean,
	) => void;
	onAppraisalStatusChange?: (
		collection: string,
		tokenId: string,
		hasValidAppraisal: boolean,
	) => void;
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
			onAction?: (
				collection: string,
				tokenId: string,
				hasValidAppraisal?: boolean,
			) => void;
			onAppraisalStatusChange?: (
				collection: string,
				tokenId: string,
				hasValidAppraisal: boolean,
			) => void;
			refetchTreasuryCards?: () => Promise<void>;
	  }
	| { type: "APPROVAL_REQUESTED" }
	| { type: "APPROVAL_CONFIRMED"; txHash: string }
	| { type: "DEPOSIT_REQUESTED" }
	| { type: "DEPOSIT_CONFIRMED"; txHash: string }
	| { type: "FAIL"; error: string }
	| { type: "RESET" };

const MAX_RETRIES = 3;
const logger = createMachineLogger("NFTDepositMachine");

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
				entry: () => logger.logInfo("Checking NFT approval requirements"),
				invoke: {
					id: "checkApprovalNeeded",
					src: checkApprovalNeeded,
					input: ({ context }) => {
						if (
							!validateAddress(context.collection) ||
							!validateAddress(context.treasuryAddress) ||
							!validateUserAddress(context.userAddress) ||
							!context.publicClient
						) {
							throw new MachineError(
								"Missing or invalid context for approval check",
								ErrorCodes.VALIDATION_ERROR,
								{ context },
							);
						}
						return {
							collection: context.collection,
							operatorAddress: context.treasuryAddress,
							userAddress: context.userAddress,
							publicClient: context.publicClient,
						};
					},
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
				entry: () => logger.logInfo("Confirming NFT deposit"),
				invoke: {
					id: "confirmNFTDeposit",
					src: confirmNFTOwnershipChange,
					input: ({ context }) => {
						if (
							!validateAddress(context.collection) ||
							!validateTokenId(context.tokenId) ||
							!validateUserAddress(context.userAddress) ||
							!context.publicClient
						) {
							throw new MachineError(
								"Missing or invalid context for deposit confirmation",
								ErrorCodes.VALIDATION_ERROR,
								{ context },
							);
						}
						return {
							collection: context.collection,
							tokenId: context.tokenId,
							userAddress: context.userAddress,
							publicClient: context.publicClient,
						};
					},
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
			confirmNFTDeposit: confirmNFTOwnershipChange,
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
			setDepositParams: assign(({ event, context }) => {
				if (event.type === "START_DEPOSIT") {
					// Validate inputs
					if (
						!validateAddress(event.collection) ||
						!validateTokenId(event.tokenId) ||
						!validateAddress(event.treasuryAddress) ||
						!validateUserAddress(event.userAddress) ||
						!event.publicClient
					) {
						throw new MachineError(
							"Invalid parameters for deposit",
							ErrorCodes.VALIDATION_ERROR,
							{ event },
						);
					}

					logger.logInfo("Starting NFT deposit", {
						collection: event.collection,
						tokenId: event.tokenId,
						treasuryAddress: event.treasuryAddress,
						userAddress: event.userAddress,
					});

					return {
						...context,
						collection: event.collection,
						tokenId: event.tokenId,
						treasuryAddress: event.treasuryAddress,
						userAddress: event.userAddress,
						publicClient: event.publicClient,
						onAction: event.onAction,
						onAppraisalStatusChange: event.onAppraisalStatusChange,
						refetchTreasuryCards: event.refetchTreasuryCards,
						retryCount: 0,
						error: null,
					} as NFTDepositContext;
				}
				return {};
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
					let errorMessage = "Unknown error occurred";

					if (event.type === "FAIL") {
						errorMessage = event.error;
					} else if (event.type === "error.platform.checkApprovalNeeded") {
						errorMessage =
							(event.error as Error)?.message || "Failed to check approval";
					} else if (event.type === "error.platform.confirmNFTDeposit") {
						errorMessage =
							(event.error as Error)?.message || "Failed to confirm deposit";
					}

					// Log error for debugging
					logger.logError("Deposit error", { error: event, errorMessage });
					return errorMessage;
				},
			}),
			clearError: assign({
				error: null,
			}),
			incrementRetry: assign({
				retryCount: ({ context }) => context.retryCount + 1,
			}),
			handleDepositCompletion: ({ context }) => {
				logger.logSuccess("Deposit completed successfully", {
					collection: context.collection,
					tokenId: context.tokenId,
				});

				// Trigger completion callbacks if available
				try {
					if (
						typeof context.onAction === "function" &&
						context.collection &&
						context.tokenId
					) {
						(
							context.onAction as (
								collection: string,
								tokenId: string,
								hasValidAppraisal?: boolean,
							) => void
						)(context.collection, context.tokenId, true);
					}
					if (
						typeof context.onAppraisalStatusChange === "function" &&
						context.collection &&
						context.tokenId
					) {
						(
							context.onAppraisalStatusChange as (
								collection: string,
								tokenId: string,
								hasValidAppraisal: boolean,
							) => void
						)(context.collection, context.tokenId, true);
					}
					if (typeof context.refetchTreasuryCards === "function") {
						(context.refetchTreasuryCards as () => Promise<void>)();
					}
				} catch (error) {
					logger.logError("Error in completion callbacks", error as Error);
				}
			},
		},
		guards: {
			canRetry: ({ context }) => context.retryCount < MAX_RETRIES,
		},
	},
);

export type NFTDepositMachine = typeof nftDepositMachine;
