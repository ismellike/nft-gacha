"use client";

import { useCallback } from "react";
import { toast } from "react-hot-toast";
import { useNFTInteraction } from "./useNFTInteraction";
import { useGachaContracts } from "./useGachaContracts";
import { useGachaId } from "./useGachaId";

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

const DEPOSIT_IN_PROGRESS_STATES: ReadonlySet<string> = new Set([
	"checkingApprovals",
	"checkingNFTApproval",
	"awaitingNFTApprovalSignature",
	"awaitingNFTApprovalReceipt",
	"awaitingInteractionSignature",
	"awaitingInteractionReceipt",
	"confirmingInteraction",
]);

export const useNFTDeposit = (params?: UseNFTDepositParams) => {
	const gachaId = useGachaId();
	const contracts = useGachaContracts(gachaId);
	
	const {
		startInteraction,
		isLoading,
		error,
		reset,
		forceReset,
		context,
		currentState,
	} = useNFTInteraction({
		...(params?.onSuccess && { onSuccess: params.onSuccess }),
		...(params?.onAction && { onAction: params.onAction }),
		...(params?.onAppraisalStatusChange && { onAppraisalStatusChange: params.onAppraisalStatusChange }),
	});

	// Check if a specific NFT is currently being deposited
	const isNFTDepositing = useCallback(
		(collection: string, tokenId: string) => {
			if (!isLoading) return false;
			if (!('collection' in context) || !('tokenId' in context)) return false;
			if (context.collection !== collection || context.tokenId !== tokenId)
				return false;
			return DEPOSIT_IN_PROGRESS_STATES.has(currentState);
		},
		[isLoading, context, currentState],
	);

	const depositNFT = useCallback(
		async (
			collection: `0x${string}`,
			tokenId: bigint,
			options?: { hasAppraisal?: boolean },
		) => {
			if (!contracts.treasury) {
				toast.error("Treasury contract not found");
				return;
			}

			try {
				await startInteraction(collection, tokenId.toString(), "deposit", {
					treasuryAddress: contracts.treasury,
					...(contracts.protocolTreasury && {
						protocolTreasuryAddress: contracts.protocolTreasury,
					}),
					hasAppraisal: options?.hasAppraisal ?? false,
				});
			} catch (error) {
				console.error("Error starting deposit interaction:", error);
				toast.error("Failed to start deposit process");
			}
		},
		[contracts, startInteraction],
	);

	return {
		depositNFT,
		isPending: isLoading,
		isNFTDepositing,
		error,
		reset,
		forceReset,
	};
};
