"use client";

import type { PublicClient } from "viem";

// Minimal type exports kept for backward compatibility after removing XState.
export interface AppraisalResult {
	collection: string;
	tokenId: string;
	appraisalData: readonly [boolean, bigint, bigint, string, bigint];
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
		value?: bigint;
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
