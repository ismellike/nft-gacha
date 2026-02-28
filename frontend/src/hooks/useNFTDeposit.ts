"use client";

import { useCallback } from "react";
import { useAccount, usePublicClient } from "wagmi";
import { useGachaContracts } from "./useGachaContracts";
import { useGachaId } from "./useGachaId";
import { useNFTInteraction } from "./useNFTInteraction";

interface UseNFTDepositParams {
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

export const useNFTDeposit = (params?: UseNFTDepositParams) => {
	const gachaId = useGachaId();
	const contracts = useGachaContracts(gachaId);
	const { address: userAddress } = useAccount();
	const publicClient = usePublicClient();

	const interaction = useNFTInteraction({
		onSuccess: params?.onSuccess,
		onAction: params?.onAction,
		onAppraisalStatusChange: params?.onAppraisalStatusChange,
	});

	const getNFTDepositState = useCallback(
		(collection: string, tokenId: string) => {
			if (interaction.context?.collection !== collection) return null;
			if (interaction.context?.tokenId !== tokenId) return null;

			switch (interaction.status) {
				case "checkingApprovals":
					return {
						isDepositing: true,
						stage: "checking",
						message: "Checking approvals...",
					};
				case "awaitingNFTApprovalSignature":
				case "awaitingNFTApprovalReceipt":
					return {
						isDepositing: true,
						stage: "approval",
						message: "Awaiting approval...",
					};
				case "awaitingInteractionSignature":
					return {
						isDepositing: true,
						stage: "signature",
						message: "Awaiting transaction...",
					};
				case "awaitingInteractionReceipt":
					return {
						isDepositing: true,
						stage: "confirming",
						message: "Confirming transaction...",
					};
				case "completed":
					return {
						isDepositing: false,
						stage: "completed",
						message: "Deposited successfully",
					};
				default:
					return null;
			}
		},
		[
			interaction.context?.collection,
			interaction.context?.tokenId,
			interaction.status,
		],
	);

	const isNFTDepositing = useCallback(
		(collection: string, tokenId: string) =>
			!!getNFTDepositState(collection, tokenId)?.isDepositing,
		[getNFTDepositState],
	);

	const depositNFT = useCallback(
		async (
			collection: `0x${string}`,
			tokenId: bigint,
			options?: { hasAppraisal?: boolean },
		) => {
			if (!contracts.treasury || !userAddress || !publicClient) {
				throw new Error(
					"Missing required deposit parameters: treasury, user address, or public client",
				);
			}

			interaction.startInteraction(collection, tokenId.toString(), "deposit", {
				treasuryAddress: contracts.treasury,
				...(contracts.protocolTreasury
					? { protocolTreasuryAddress: contracts.protocolTreasury }
					: {}),
				...(options?.hasAppraisal !== undefined
					? { hasAppraisal: options.hasAppraisal }
					: {}),
			});
		},
		[
			contracts.protocolTreasury,
			contracts.treasury,
			interaction,
			publicClient,
			userAddress,
		],
	);

	return {
		depositNFT,
		isPending: interaction.isLoading,
		isNFTDepositing,
		getNFTDepositState,
		error: interaction.error,
		interactionState: interaction.status,
		interactionContext: interaction.context,
	};
};
