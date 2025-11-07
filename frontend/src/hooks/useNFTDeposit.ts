"use client";

import { useCallback } from "react";
import { useAccount, usePublicClient } from "wagmi";
import { useGachaContracts } from "./useGachaContracts";
import { useGachaId } from "./useGachaId";
import { useNFTInteraction } from "./useNFTInteraction";

export interface UseNFTDepositParams {
	onSuccess?: (txHash: string) => void;
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
}

// No longer needed since we use interactionState.matches() directly

/**
 * Simplified deposit hook that relies on the XState machine
 * No local state management - single source of truth
 */
export const useNFTDeposit = (params?: UseNFTDepositParams) => {
	const gachaId = useGachaId();
	const contracts = useGachaContracts(gachaId);
	const { address: userAddress } = useAccount();
	const publicClient = usePublicClient();

	// Transaction execution and success tracking happens in useNFTInteraction

	// Use the XState machine directly - this is our single source of truth
	const {
		sendInteractionEvent,
		interactionState,
		isLoading,
		error,
		context,
	} = useNFTInteraction({
		...(params?.onSuccess && { onSuccess: params.onSuccess }),
		...(params?.onAction && { onAction: params.onAction }),
		...(params?.onAppraisalStatusChange && { onAppraisalStatusChange: params.onAppraisalStatusChange }),
	});

	// Get the state for a specific NFT - this is the only state we need
	const getNFTDepositState = useCallback(
		(collection: string, tokenId: string) => {
			if (!("collection" in context) || !("tokenId" in context)) return null;
			if (context.collection !== collection || context.tokenId !== tokenId)
				return null;

			// Check each state using interactionState.matches() for proper XState state detection
			if (interactionState.matches("checkingApprovals") || interactionState.matches("checkingNFTApproval")) {
				return {
					isDepositing: true,
					stage: "checking",
					message: "Checking approvals...",
				};
			}

			if (interactionState.matches("awaitingNFTApprovalSignature")) {
				return {
					isDepositing: true,
					stage: "awaiting_approval",
					message: "Awaiting approval...",
				};
			}

			if (interactionState.matches("awaitingNFTApprovalReceipt")) {
				return {
					isDepositing: true,
					stage: "confirming_approval",
					message: "Confirming approval...",
				};
			}

			// Transaction states
			if (interactionState.matches("awaitingInteractionSignature")) {
				return {
					isDepositing: true,
					stage: "awaiting_transaction",
					message: "Awaiting transaction...",
				};
			}

			if (interactionState.matches("awaitingInteractionReceipt")) {
				return {
					isDepositing: true,
					stage: "confirming_transaction",
					message: "Confirming transaction...",
				};
			}

			if (interactionState.matches("confirmingInteraction")) {
				return {
					isDepositing: true,
					stage: "finalizing",
					message: "Finalizing deposit...",
				};
			}

			// NFT is not being processed
			return null;
		},
		[context, interactionState],
	);

	// Backward compatibility helper
	const isNFTDepositing = useCallback(
		(collection: string, tokenId: string) => {
			return !!getNFTDepositState(collection, tokenId)?.isDepositing;
		},
		[getNFTDepositState],
	);

	const depositNFT = useCallback(
		async (
			collection: `0x${string}`,
			tokenId: bigint,
			options?: { hasAppraisal?: boolean },
		) => {
			if (!contracts.treasury) {
				console.error("Treasury contract not found");
				return;
			}

			if (!userAddress) {
				console.error("User wallet not connected");
				return;
			}

			if (!publicClient) {
				console.error("Public client not available");
				return;
			}

			console.log("🚀 Starting deposit interaction...");

			// Start the state machine interaction - the actual wagmi transaction
			// will be executed by the machine's automatic action execution logic
			sendInteractionEvent({
				type: "START_INTERACTION",
				collection,
				tokenId: tokenId.toString(),
				mode: "deposit",
				userAddress,
				publicClient,
				treasuryAddress: contracts.treasury,
				...(contracts.protocolTreasury && {
					protocolTreasuryAddress: contracts.protocolTreasury,
				}),
				hasAppraisal: options?.hasAppraisal ?? false,
			});
		},
		[contracts, sendInteractionEvent, userAddress, publicClient],
	);

	return {
		depositNFT,
		isPending: isLoading,
		isNFTDepositing,
		getNFTDepositState,
		error,
		interactionState, // Expose the raw state machine for advanced usage
	};
};