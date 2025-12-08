"use client";

import type { PublicClient } from "viem";

export type InteractionMode = "deposit" | "buyback";

export interface NFTInteractionContext {
	collection: string | null;
	tokenId: string | null;
	treasuryAddress: string | null;
	protocolTreasuryAddress: string | null;
	userAddress: string | null;
	publicClient: PublicClient | null;
	mode: InteractionMode;
	nftApprovalNeeded: boolean;
	nftApprovalTxHash: string | null;
	interactionTxHash: string | null;
	error: string | null;
	retryCount: number;
	hasAppraisal: boolean;
	appraisalPrice: bigint | null;
	payoutAmount: bigint | null;
	completedAt: number | null;
	successData: {
		txHash: string;
		payoutAmount?: bigint;
		mode: InteractionMode;
	} | null;
	onSuccess?: ((txHash: string) => void) | undefined;
	onAction?:
		| ((
				collection: string,
				tokenId: string,
				hasValidAppraisal?: boolean,
		  ) => void)
		| undefined;
	onAppraisalStatusChange?:
		| ((
				collection: string,
				tokenId: string,
				hasValidAppraisal: boolean,
		  ) => void)
		| undefined;
	refetchTreasuryCards?: (() => Promise<void>) | undefined;
	onBuybackSuccess?: ((txHash: string, payoutAmount: bigint) => void) | undefined;
}
