"use client";

import { useCallback } from "react";
import { useAccount, useWriteContract } from "wagmi";
import type { Address } from "viem";
import { toast } from "react-hot-toast";

// Contract interface for Treasury withdrawal
const treasuryAbi = [
	{
		type: "function",
		name: "withdrawMyNFT",
		stateMutability: "nonpayable",
		inputs: [
			{ name: "collection", type: "address" },
			{ name: "tokenId", type: "uint256" },
		],
		outputs: [],
	},
] as const;

export interface WithdrawalRequest {
	collection: Address;
	tokenId: bigint;
}

/**
 * Hook to handle NFT withdrawals from Treasury
 */
export function useNFTWithdrawal(treasury?: Address) {
	const { address: user } = useAccount();
	const { writeContract, isPending } = useWriteContract();

	const withdrawNFT = useCallback(
		async (collection: Address, tokenId: bigint) => {
			if (!treasury || !user) {
				toast.error("Missing treasury address or user wallet");
				return;
			}

			try {
				await writeContract({
					address: treasury,
					abi: treasuryAbi,
					functionName: "withdrawMyNFT",
					args: [collection, tokenId],
				});

				toast.success("NFT withdrawal transaction submitted!");
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
				toast.error(
					"Missing treasury address, user wallet, or withdrawal requests",
				);
				return;
			}

			try {
				// Process withdrawals sequentially to avoid gas issues
				for (const withdrawal of withdrawals) {
					await withdrawNFT(withdrawal.collection, withdrawal.tokenId);
				}

				toast.success(
					`Successfully initiated ${withdrawals.length} NFT withdrawals!`,
				);
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
