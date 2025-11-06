"use client";

import { assign, createMachine, fromPromise } from "xstate";
import type { PublicClient } from "viem";
import { erc721Abi } from "../generated";

export type InteractionMode = "deposit" | "buyback";

export interface NFTInteractionContext {
	collection: string | null;
	tokenId: string | null;
	treasuryAddress: string | null;
	protocolTreasuryAddress: string | null;
	userAddress: string | null;
	publicClient: PublicClient | null;
	mode: InteractionMode;
	// Approval states
	nftApprovalNeeded: boolean;
	nftApprovalTxHash: string | null;
	// Transaction states
	interactionTxHash: string | null;
	error: string | null;
	retryCount: number;
	// Appraisal info for buyback
	hasAppraisal: boolean;
	appraisalPrice: bigint | null;
	payoutAmount: bigint | null;
	// Post-success state
	completedAt: number | null;
	successData: {
		txHash: string;
		payoutAmount?: bigint;
		mode: InteractionMode;
	} | null;
	// Callback functions
	onSuccess: ((txHash: string) => void) | undefined;
	onAction: ((collection: string, tokenId: string, hasValidAppraisal?: boolean) => void) | undefined;
	onAppraisalStatusChange: ((collection: string, tokenId: string, hasValidAppraisal: boolean) => void) | undefined;
	refetchTreasuryCards: (() => Promise<void>) | undefined;
	onBuybackSuccess: ((txHash: string, payoutAmount: bigint) => void) | undefined;
}

export type NFTInteractionEvent =
	| {
			type: "START_INTERACTION";
			collection: string;
			tokenId: string;
			mode: InteractionMode;
			treasuryAddress: string;
			protocolTreasuryAddress?: string;
			userAddress: string;
			publicClient: PublicClient;
			hasAppraisal?: boolean;
			appraisalPrice?: bigint;
			payoutAmount?: bigint;
			onSuccess?: (txHash: string) => void;
			onAction?: (collection: string, tokenId: string, hasValidAppraisal?: boolean) => void;
			onAppraisalStatusChange?: (collection: string, tokenId: string, hasValidAppraisal: boolean) => void;
			refetchTreasuryCards?: () => Promise<void>;
			onBuybackSuccess?: (txHash: string, payoutAmount: bigint) => void;
	  }
	| { type: "NFT_APPROVAL_REQUESTED" }
	| { type: "NFT_APPROVAL_CONFIRMED"; txHash: string }
	| { type: "INTERACTION_REQUESTED" }
	| { type: "INTERACTION_CONFIRMED"; txHash: string }
	| { type: "INTERACTION_CANCELLED"; reason?: string }
	| { type: "FAIL"; error: string }
	| { type: "RESET" };

const MAX_RETRIES = 3;

// Actor to check if NFT approval is needed
const checkNFTApprovalNeeded = fromPromise(
	async ({
		input,
	}: {
		input: {
			collection: string | null;
			operatorAddress: string | null;
			userAddress: string | null;
			publicClient: PublicClient | null;
		};
	}): Promise<boolean> => {
		const { collection, operatorAddress, userAddress, publicClient } = input;

		if (!collection || !operatorAddress || !userAddress || !publicClient) {
			throw new Error("Missing data for NFT approval check");
		}

		try {
			const isApprovedForAll = await publicClient.readContract({
				address: collection as `0x${string}`,
				abi: erc721Abi,
				functionName: "isApprovedForAll",
				args: [userAddress as `0x${string}`, operatorAddress as `0x${string}`],
			});

			return !isApprovedForAll; // Return true if approval needed
		} catch (error) {
			console.error("NFT approval check failed, assuming approval needed:", error);
			return true;
		}
	},
);

export const nftInteractionMachine = createMachine(
	{
		id: "nftInteractionMachine",
		context: {
			collection: null,
			tokenId: null,
			treasuryAddress: null,
			protocolTreasuryAddress: null,
			userAddress: null,
			publicClient: null,
			mode: "deposit" as InteractionMode,
			nftApprovalNeeded: true,
			nftApprovalTxHash: null,
			interactionTxHash: null,
			error: null as string | null,
			retryCount: 0,
			hasAppraisal: false,
			appraisalPrice: null,
			payoutAmount: null,
			completedAt: null,
			successData: null,
			onSuccess: undefined as ((txHash: string) => void) | undefined,
			onAction: undefined as ((collection: string, tokenId: string, hasValidAppraisal?: boolean) => void) | undefined,
			onAppraisalStatusChange: undefined as ((collection: string, tokenId: string, hasValidAppraisal: boolean) => void) | undefined,
			refetchTreasuryCards: undefined as (() => Promise<void>) | undefined,
			onBuybackSuccess: undefined as ((txHash: string, payoutAmount: bigint) => void) | undefined,
		},
		initial: "idle",
		states: {
			idle: {
				entry: "clearState",
				on: {
					START_INTERACTION: {
						target: "checkingApprovals",
						actions: "setInteractionParams",
					},
				},
			},
			checkingApprovals: {
				entry: "determineApprovalNeeds",
				always: [
					{
						target: "checkingNFTApproval",
						guard: ({ context }) =>
							context.nftApprovalNeeded
							&& (
								(context.mode === "deposit" && !!context.treasuryAddress)
								|| (context.mode === "buyback" && !!context.protocolTreasuryAddress)
							),
					},
					{
						target: "awaitingInteractionSignature",
					},
				],
				on: {
					RESET: "idle",
					FAIL: {
						target: "idle",
						actions: "setError",
					},
				},
			},
			checkingNFTApproval: {
				invoke: {
					id: "checkNFTApprovalNeeded",
					src: "checkNFTApprovalNeeded",
					input: ({ context }) => ({
						collection: context.collection,
						operatorAddress: context.mode === "buyback"
							? context.protocolTreasuryAddress
							: context.treasuryAddress,
						userAddress: context.userAddress,
						publicClient: context.publicClient,
					}),
					onDone: [
						{
							target: "awaitingInteractionSignature",
							guard: ({ event }) => !event.output, // If approval NOT needed
							actions: "setNFTApprovalNotNeeded",
						},
						{
							target: "awaitingNFTApprovalSignature",
							guard: ({ event }) => event.output, // If approval needed
							actions: "setNFTApprovalNeeded",
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
			awaitingNFTApprovalSignature: {
				on: {
					NFT_APPROVAL_CONFIRMED: {
						target: "awaitingNFTApprovalReceipt",
						actions: "setNFTApprovalTxHash",
					},
					INTERACTION_CANCELLED: {
						target: "idle",
						actions: ["setInteractionCancelled", "logCancellation"],
					},
					FAIL: {
						target: "idle",
						actions: "setError",
					},
					RESET: "idle",
				},
			},
			awaitingNFTApprovalReceipt: {
				on: {
					NFT_APPROVAL_REQUESTED: {
						target: "awaitingInteractionSignature",
					},
					INTERACTION_CANCELLED: {
						target: "idle",
						actions: ["setInteractionCancelled", "logCancellation"],
					},
					FAIL: {
						target: "idle",
						actions: "setError",
					},
					RESET: "idle",
				},
			},
			awaitingInteractionSignature: {
				on: {
					INTERACTION_CANCELLED: {
						target: "idle",
						actions: ["setInteractionCancelled", "logCancellation"],
					},
					INTERACTION_CONFIRMED: {
						target: "awaitingInteractionReceipt",
						actions: "setInteractionTxHash",
					},
					FAIL: {
						target: "idle",
						actions: "setError",
					},
					RESET: "idle",
				},
			},
						awaitingInteractionReceipt: {
				on: {
					INTERACTION_REQUESTED: {
						target: "confirmingInteraction",
					},
					INTERACTION_CANCELLED: {
						target: "idle",
						actions: ["setInteractionCancelled", "logCancellation"],
					},
					FAIL: {
						target: "idle",
						actions: "setError",
					},
					RESET: "idle",
				},
			},
			confirmingInteraction: {
				invoke: {
					id: "confirmInteraction",
					src: "confirmInteraction",
					input: ({ context }) => ({
						collection: context.collection,
						tokenId: context.tokenId,
						mode: context.mode,
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
				entry: ["clearError", "handleInteractionCompletion", "setSuccessData"],
				after: {
					// Only auto-reset for deposits, not buybacks (buybacks should stay completed)
					3000: {
						target: "idle",
						guard: ({ context }) => context.mode === "deposit"
					},
				},
				on: {
					RESET: "idle",
				},
			},
		},
	},
	{
		actors: {
			checkNFTApprovalNeeded,
			confirmInteraction: fromPromise(
				async ({
					input,
				}: {
					input: {
						collection: string;
						tokenId: string;
						mode: InteractionMode;
						userAddress: string;
						publicClient: PublicClient;
					};
				}): Promise<void> => {
					const { collection, tokenId, mode, userAddress, publicClient } = input;

					try {
						if (mode === "deposit") {
							// For deposit, confirm NFT is now owned by treasury
							const currentOwner = await publicClient.readContract({
								address: collection as `0x${string}`,
								abi: erc721Abi,
								functionName: "ownerOf",
								args: [BigInt(tokenId)],
							});

							const isDeposited = currentOwner?.toLowerCase() !== userAddress.toLowerCase();

							if (!isDeposited) {
								throw new Error("NFT still owned by user - deposit confirmation failed");
							}

													} else if (mode === "buyback") {
							// For buyback, we just need to confirm the transaction was successful
							// The user should still own the NFT after buyback (they get paid USDC)
													}
					} catch (error) {
						console.error(`NFT interaction ${mode} confirmation failed:`, error);
						throw error;
					}
				},
			),
		},
		actions: {
			clearState: assign({
				collection: null,
				tokenId: null,
				treasuryAddress: null,
				protocolTreasuryAddress: null,
				userAddress: null,
				publicClient: null,
				mode: "deposit" as InteractionMode,
				nftApprovalNeeded: true,
				nftApprovalTxHash: null,
				interactionTxHash: null,
				error: null as string | null,
				retryCount: 0,
				hasAppraisal: false,
				appraisalPrice: null,
				payoutAmount: null,
				completedAt: null,
				successData: null,
				onSuccess: undefined as ((txHash: string) => void) | undefined,
				onAction: undefined as ((collection: string, tokenId: string, hasValidAppraisal?: boolean) => void) | undefined,
				onAppraisalStatusChange: undefined as ((collection: string, tokenId: string, hasValidAppraisal: boolean) => void) | undefined,
				refetchTreasuryCards: undefined as (() => Promise<void>) | undefined,
				onBuybackSuccess: undefined as ((txHash: string, payoutAmount: bigint) => void) | undefined,
			}),
				setInteractionParams: assign(({ context, event }: any) => {
			if (event.type === "START_INTERACTION") {
				return {
					collection: event.collection,
					tokenId: event.tokenId,
					treasuryAddress: event.treasuryAddress,
					protocolTreasuryAddress: event.protocolTreasuryAddress || null,
					userAddress: event.userAddress,
					publicClient: event.publicClient,
					mode: event.mode,
					hasAppraisal: event.hasAppraisal || false,
					appraisalPrice: event.appraisalPrice || null,
					payoutAmount: event.payoutAmount || null,
					onSuccess: event.onSuccess,
					onAction: event.onAction,
					onAppraisalStatusChange: event.onAppraisalStatusChange,
					refetchTreasuryCards: event.refetchTreasuryCards,
					onBuybackSuccess: event.onBuybackSuccess,
					retryCount: 0,
					error: null
				};
			}
			return context;
		}),
			determineApprovalNeeds: assign({
				nftApprovalNeeded: true,
			}),
			setNFTApprovalNeeded: assign({
				nftApprovalNeeded: true,
			}),
			setNFTApprovalNotNeeded: assign({
				nftApprovalNeeded: false,
			}),
			setNFTApprovalTxHash: assign({
				nftApprovalTxHash: ({ event }) =>
					event.type === "NFT_APPROVAL_CONFIRMED" ? event.txHash : null,
			}),
			setInteractionTxHash: assign({
				interactionTxHash: ({ event }) =>
					event.type === "INTERACTION_CONFIRMED" ? event.txHash : null,
			}),
			setInteractionCancelled: assign((context, event) => {
				console.log("🚫 NFT interaction cancelled", {
					currentMode: context.mode,
					interactionTxHash: context.interactionTxHash,
					nftApprovalTxHash: context.nftApprovalTxHash,
					eventType: event.type,
				});
				return {
					interactionTxHash: null,
					nftApprovalTxHash: null,
					error: null, // Don't set error for user cancellation - this is normal behavior
					retryCount: 0,
				};
			}),
			logCancellation: () => {
				console.log("NFT interaction cancelled by user");
			},
			setError: assign({
				error: ({ event }) => {
					if (event.type === "FAIL") {
						return event.error;
					}
					if (event.type === "xstate.error.actor.checkNFTApprovalNeeded") {
						return (event.error as Error)?.message || "Failed to check NFT approval";
					}
					if (event.type === "xstate.error.actor.confirmInteraction") {
						return (event.error as Error)?.message || "Failed to confirm interaction";
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
			handleInteractionCompletion: ({ context }) => {
				// Trigger completion callbacks if available
				try {
					if (context.onSuccess && context.interactionTxHash) {
						context.onSuccess(context.interactionTxHash);
					}
					if (context.onAction && context.collection && context.tokenId) {
						context.onAction(context.collection, context.tokenId, context.hasAppraisal);
					}
					if (context.onAppraisalStatusChange && context.collection && context.tokenId) {
						context.onAppraisalStatusChange(context.collection, context.tokenId, context.hasAppraisal);
					}
					if (context.refetchTreasuryCards) {
						context.refetchTreasuryCards();
					}
					// Trigger specific buyback success callback
					if (context.mode === "buyback" && context.onBuybackSuccess && context.interactionTxHash && context.payoutAmount) {
						context.onBuybackSuccess(context.interactionTxHash, context.payoutAmount);
					}
				} catch (error) {
					console.error("Error in completion callbacks:", error);
				}
			},
			setSuccessData: assign(({ context }: any) => ({
				completedAt: Date.now() as any,
				successData: context.interactionTxHash ? {
					txHash: context.interactionTxHash,
					payoutAmount: context.payoutAmount || undefined,
					mode: context.mode,
				} : null
			}) as any),
		},
		guards: {
			canRetry: ({ context }) => context.retryCount < MAX_RETRIES,
		},
	},
);

export type NFTInteractionMachine = typeof nftInteractionMachine;
