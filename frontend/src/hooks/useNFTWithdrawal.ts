"use client";

import { useCallback } from "react";
import type { Address } from "viem";
import { useAccount, useWriteContract } from "wagmi";

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

interface WithdrawalRequest {
	collection: Address;
	tokenId: bigint;
}

/**
 * Hook to handle NFT withdrawals from Treasury
 */
export function useNFTWithdrawal(treasury?: Address) {
	const { address: user } = useAccount();
	const { writeContractAsync, isPending } = useWriteContract();

	const withdrawNFT = useCallback(
		async (collection: Address, tokenId: bigint) => {
			if (!treasury || !user) {
				throw new Error("Missing treasury address or user wallet");
			}

			return writeContractAsync({
				address: treasury,
				abi: treasuryAbi,
				functionName: "withdrawMyNFT",
				args: [collection, tokenId],
			});
		},
		[treasury, user, writeContractAsync],
	);

	const withdrawMultipleNFTs = useCallback(
		async (withdrawals: WithdrawalRequest[]) => {
			if (!treasury || !user || withdrawals.length === 0) {
				throw new Error(
					"Missing treasury address, user wallet, or withdrawal requests",
				);
			}

			const hashes = [];
			// Process withdrawals sequentially to avoid gas issues
			for (const withdrawal of withdrawals) {
				hashes.push(
					await withdrawNFT(withdrawal.collection, withdrawal.tokenId),
				);
			}

			return hashes;
		},
		[treasury, user, withdrawNFT],
	);

	return {
		withdrawNFT,
		withdrawMultipleNFTs,
		isPending,
	};
}
