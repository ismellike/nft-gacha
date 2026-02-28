"use client";

import type { MutableRefObject } from "react";
import type { PublicClient } from "viem";
import { useWriteContract } from "wagmi";
import { isUserRejectedError } from "../lib/transactionErrors";
import { useNFTAppraisalStore } from "../stores/nftAppraisalStore";

type AppraisalStatus =
	| "idle"
	| "approving"
	| "submitting"
	| "waitingForCompletion"
	| "completed"
	| "error";

type SubmissionOutcome = "pending" | "success" | "refunded" | "failed" | null;

interface UseNFTApprovalParams {
	publicClient: PublicClient | undefined;
	appraisalContractAddress: `0x${string}` | undefined;
	feeTokenAddress: `0x${string}` | undefined;
	appraisalFee: bigint | undefined;
	currentAllowance: bigint | undefined;
	userAddress: `0x${string}` | undefined;
	lastSubmittedRef: MutableRefObject<{
		collection: string;
		tokenId: string;
	} | null>;
	onStatusChange: (status: AppraisalStatus) => void;
	onApprovalTxHash: (hash: string) => void;
	onSubmissionTxHash: (hash: string) => void;
	onOutcomeChange: (outcome: SubmissionOutcome) => void;
	onError: (message: string) => void;
	onClearError: () => void;
}

interface FormData {
	collection: string;
	tokenId: string;
}

export interface UseNFTApprovalReturn {
	/** Call to approve the fee token (if needed) and submit the appraisal request */
	submitAppraisal: (formData: FormData) => Promise<void>;
	isApproving: boolean;
	isRequestingAppraisal: boolean;
}

const APPROVE_ABI = [
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
] as const;

const ALLOWANCE_ABI = [
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
] as const;

const REQUEST_APPRAISAL_ABI = [
	{
		name: "requestAppraisal",
		type: "function",
		stateMutability: "nonpayable",
		inputs: [
			{ name: "collection", type: "address" },
			{ name: "tokenId", type: "uint256" },
		],
		outputs: [],
	},
] as const;

/**
 * Encapsulates the token approval + appraisal request submission flow.
 *
 * Handles:
 * - Fresh allowance fetch to avoid unnecessary approvals
 * - ERC-20 approval transaction (if needed)
 * - requestAppraisal transaction submission
 * - Optimistic store update
 * - Error handling (user cancellation, already appraised, etc.)
 */
export function useNFTApproval({
	publicClient,
	appraisalContractAddress,
	feeTokenAddress,
	appraisalFee,
	currentAllowance,
	userAddress,
	lastSubmittedRef,
	onStatusChange,
	onApprovalTxHash,
	onSubmissionTxHash,
	onOutcomeChange,
	onError,
	onClearError,
}: UseNFTApprovalParams): UseNFTApprovalReturn {
	const { writeContractAsync: approveTokensAsync, isPending: isApproving } =
		useWriteContract();
	const {
		writeContractAsync: requestAppraisalAsync,
		isPending: isRequestingAppraisal,
	} = useWriteContract();

	const submitAppraisal = async (formData: FormData) => {
		if (
			!userAddress ||
			!publicClient ||
			!appraisalContractAddress ||
			!feeTokenAddress ||
			!appraisalFee
		) {
			onError("Missing required parameters");
			return;
		}

		try {
			onClearError();
			onOutcomeChange("pending");

			// Track this submission optimistically
			useNFTAppraisalStore
				.getState()
				.addOptimisticSubmission(
					userAddress,
					formData.collection,
					formData.tokenId,
				);

			// Fetch a fresh allowance to avoid unnecessary approvals
			let allowance = currentAllowance;
			if (allowance === undefined) {
				allowance = (await publicClient.readContract({
					address: feeTokenAddress,
					abi: ALLOWANCE_ABI,
					functionName: "allowance",
					args: [userAddress, appraisalContractAddress],
				})) as bigint;
			}

			const approvalNeeded =
				appraisalFee !== undefined && allowance !== undefined
					? allowance < appraisalFee
					: true;

			if (approvalNeeded) {
				onStatusChange("approving");
				const hash = await approveTokensAsync({
					address: feeTokenAddress,
					abi: APPROVE_ABI,
					functionName: "approve",
					args: [appraisalContractAddress, appraisalFee],
				});
				onApprovalTxHash(hash);
				await publicClient.waitForTransactionReceipt({ hash });
			}

			onStatusChange("submitting");
			const submissionHash = await requestAppraisalAsync({
				address: appraisalContractAddress,
				abi: REQUEST_APPRAISAL_ABI,
				functionName: "requestAppraisal",
				args: [formData.collection as `0x${string}`, BigInt(formData.tokenId)],
			});
			onSubmissionTxHash(submissionHash);
			const submissionReceipt = await publicClient.waitForTransactionReceipt({
				hash: submissionHash,
			});

			lastSubmittedRef.current = {
				collection: formData.collection,
				tokenId: formData.tokenId,
			};

			if (submissionReceipt.status !== "success") {
				onOutcomeChange("failed");
				onError(
					"Appraisal transaction did not complete successfully (refunded or failed).",
				);
				onStatusChange("error");
				return;
			}

			onOutcomeChange("success");
			onStatusChange("waitingForCompletion");
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : String(error);
			onError(
				isUserRejectedError(error)
					? "Transaction cancelled"
					: message.includes("already exists")
						? "This NFT was already appraised"
						: "Something went wrong, please try again",
			);
			onStatusChange("error");
		}
	};

	return {
		submitAppraisal,
		isApproving,
		isRequestingAppraisal,
	};
}
