"use client";

import { useCallback } from "react";
import { useAccount, useWriteContract } from "wagmi";
import type { Address, Hex } from "viem";
import { toast } from "react-hot-toast";

// Contract interface for Treasury withdrawal
const treasuryAbi = [
	{
		type: "function",
		name: "withdrawMyNFT",
		stateMutability: "nonpayable",
		inputs: [
			{ name: "cardId", type: "bytes32" },
			{ name: "quantity", type: "uint256" },
		],
		outputs: [],
	},
] as const;

export interface WithdrawalRequest {
	cardId: Hex;
	quantity: bigint;
}

/**
 * Hook to handle NFT withdrawals from Treasury
 */
export function useNFTWithdrawal(treasury?: Address) {
	const { address: user } = useAccount();
	const { writeContract, isPending } = useWriteContract();

	const withdrawNFT = useCallback(
		async (cardId: Hex, quantity: bigint = 1n) => {
			if (!treasury || !user) {
				toast.error("Missing treasury address or user wallet");
				return;
			}

			try {
				await writeContract({
					address: treasury,
					abi: treasuryAbi,
					functionName: "withdrawMyNFT",
					args: [cardId, quantity],
				});

				toast.success("NFT withdrawal initiated successfully!");
			} catch (error) {
				console.error("Failed to withdraw NFT:", error);
				toast.error("Failed to withdraw NFT");
				throw error;
			}
		},
		[treasury, user, writeContract],
	);

	const withdrawMultipleNFTs = useCallback(
		async (withdrawals: WithdrawalRequest[]) => {
			if (!treasury || !user || withdrawals.length === 0) {
				toast.error("Missing treasury address, user wallet, or withdrawal requests");
				return;
			}

			try {
				// Process withdrawals sequentially to avoid gas issues
				for (const withdrawal of withdrawals) {
					await withdrawNFT(withdrawal.cardId, withdrawal.quantity);
				}

				toast.success(`Successfully initiated ${withdrawals.length} NFT withdrawals!`);
			} catch (error) {
				console.error("Failed to withdraw multiple NFTs:", error);
				toast.error("Failed to process NFT withdrawals");
				throw error;
			}
		},
		[treasury, user, withdrawNFT],
	);

	return {
		withdrawNFT,
		withdrawMultipleNFTs,
		isPending,
	};
}