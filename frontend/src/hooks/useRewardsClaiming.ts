"use client";

import { useCallback } from "react";
import { useAccount, useWriteContract, usePublicClient } from "wagmi";
import type { Address, Hex } from "viem";
import { RARITY_VALUES } from "../lib/constants";
import type { Rarity } from "../lib/constants";

export type { Rarity };

// Modern ABI for card-based rewards claiming
const rewardsClaimingAbi = [
	{
		type: "function",
		name: "claimCardRewards",
		stateMutability: "nonpayable",
		inputs: [
			{ name: "rarity", type: "uint8" },
			{ name: "cardId", type: "bytes32" },
		],
		outputs: [],
	},
	{
		type: "function",
		name: "claimRewardsForCards",
		stateMutability: "nonpayable",
		inputs: [
			{ name: "rarity", type: "uint8" },
			{ name: "cardIds", type: "bytes32[]" },
		],
		outputs: [],
	},
	{
		type: "function",
		name: "claimRewardsForMultipleRarities",
		stateMutability: "nonpayable",
		inputs: [
			{ name: "rarities", type: "uint8[]" },
			{ name: "cardIdsByRarity", type: "bytes32[][]" },
		],
		outputs: [],
	},
	{
		type: "function",
		name: "getTotalClaimableForUser",
		stateMutability: "view",
		inputs: [
			{ name: "rarities", type: "uint8[]" },
			{ name: "cardIdsByRarity", type: "bytes32[][]" },
		],
		outputs: [{ name: "total", type: "uint256" }],
	},
	{
		type: "function",
		name: "findActiveCardRarity",
		stateMutability: "view",
		inputs: [{ name: "cardId", type: "bytes32" }],
		outputs: [
			{ name: "activeRarity", type: "uint8" },
			{ name: "found", type: "bool" },
		],
	},
] as const;

export function useRewardsClaiming(rewardsManager?: Address) {
	const { address: user } = useAccount();
	const { writeContract, isPending } = useWriteContract();
	const publicClient = usePublicClient();

	const claimForCard = useCallback(
		async (cardId: Hex, rarity: Rarity) => {
			if (!rewardsManager || !user) {
				throw new Error("Missing rewards manager or user address");
			}

			// Validate rarity
			if (!Object.values(RARITY_VALUES).includes(rarity)) {
				throw new Error(`Invalid rarity: ${rarity}`);
			}

			await writeContract({
				address: rewardsManager,
				abi: rewardsClaimingAbi,
				functionName: "claimCardRewards",
				args: [rarity, cardId],
			});
		},
		[rewardsManager, user, writeContract],
	);

	const claimForRarity = useCallback(
		async (rarity: Rarity, cardIds: Hex[]) => {
			if (!rewardsManager || !user || cardIds.length === 0) return;
			await writeContract({
				address: rewardsManager,
				abi: rewardsClaimingAbi,
				functionName: "claimRewardsForCards",
				args: [rarity, cardIds],
			});
		},
		[rewardsManager, user, writeContract],
	);

	const claimForCards = useCallback(
		async (cardIds: Hex[]) => {
			if (!rewardsManager || !user || !publicClient || cardIds.length === 0)
				return;

			// Group cards by their active rarity
			const cardsByRarity: Record<number, Hex[]> = {};

			for (const cardId of cardIds) {
				try {
					const [rarity, found] = (await publicClient.readContract({
						address: rewardsManager,
						abi: rewardsClaimingAbi,
						functionName: "findActiveCardRarity",
						args: [cardId],
					})) as [number, boolean];

					if (found && rarity >= 0 && rarity <= 4) {
						if (!cardsByRarity[rarity]) {
							cardsByRarity[rarity] = [];
						}
						cardsByRarity[rarity].push(cardId);
					}
				} catch (error) {
					console.warn("Failed to find rarity for card", cardId, error);
				}
			}

			// Use new cross-rarity batch claim function
			const rarities = Object.keys(cardsByRarity).map(Number) as Rarity[];
			const cardIdsByRarity = rarities.map((rarity) => cardsByRarity[rarity]);

			if (rarities.length > 0) {
				await writeContract({
					address: rewardsManager,
					abi: rewardsClaimingAbi,
					functionName: "claimRewardsForMultipleRarities",
					args: [rarities, cardIdsByRarity],
				});
			}
		},
		[rewardsManager, user, publicClient, writeContract],
	);

	const claimAllUserCards = useCallback(
		async (cardsByRarity: Record<Rarity, Hex[]>) => {
			if (!rewardsManager || !user || Object.keys(cardsByRarity).length === 0)
				return;

			const rarities = Object.keys(cardsByRarity).map(Number) as Rarity[];
			const cardIdsByRarity = rarities.map((rarity) => cardsByRarity[rarity]);

			await writeContract({
				address: rewardsManager,
				abi: rewardsClaimingAbi,
				functionName: "claimRewardsForMultipleRarities",
				args: [rarities, cardIdsByRarity],
			});
		},
		[rewardsManager, user, writeContract],
	);

	const getTotalClaimable = useCallback(
		async (cardsByRarity: Record<Rarity, Hex[]>): Promise<bigint> => {
			if (
				!rewardsManager ||
				!user ||
				!publicClient ||
				Object.keys(cardsByRarity).length === 0
			) {
				return 0n;
			}

			const rarities = Object.keys(cardsByRarity).map(Number) as Rarity[];
			const cardIdsByRarity = rarities.map((rarity) => cardsByRarity[rarity]);

			try {
				const total = (await publicClient.readContract({
					address: rewardsManager,
					abi: rewardsClaimingAbi,
					functionName: "getTotalClaimableForUser",
					args: [rarities, cardIdsByRarity],
				})) as bigint;

				return total;
			} catch (error) {
				console.warn("Failed to get total claimable", error);
				return 0n;
			}
		},
		[rewardsManager, user, publicClient],
	);

	return {
		claimForCard,
		claimForRarity,
		claimForCards,
		claimAllUserCards,
		getTotalClaimable,
		isPending,
	};
}
