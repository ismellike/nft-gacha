"use client";

import { useCallback } from "react";
import { useAccount, usePublicClient } from "wagmi";
import type { Address, Hex } from "viem";

// Contract interfaces for RarityTracker
const rarityTrackerAbi = [
	{
		type: "function",
		name: "getCardInfo",
		stateMutability: "view",
		inputs: [{ name: "cardId", type: "bytes32" }],
		outputs: [
			{
				name: "info",
				type: "tuple",
				components: [
					{ name: "cardId", type: "bytes32" },
					{ name: "currentRarity", type: "uint8" },
					{ name: "totalDepositedCount", type: "uint256" },
					{ name: "appraisedValueUsd", type: "uint256" },
					{ name: "depositorCount", type: "uint256" },
					{ name: "lastUpdated", type: "uint256" },
				],
			},
		],
	},
	{
		type: "function",
		name: "getDepositorValue",
		stateMutability: "view",
		inputs: [
			{ name: "depositor", type: "address" },
			{ name: "cardId", type: "bytes32" },
		],
		outputs: [{ name: "valueUsd", type: "uint256" }],
	},
	{
		type: "function",
		name: "getStatistics",
		stateMutability: "view",
		inputs: [],
		outputs: [
			{
				name: "stats",
				type: "tuple",
				components: [
					{ name: "totalDepositedCount", type: "uint256" },
					{ name: "totalAppraisedValueUsd", type: "uint256" },
					{ name: "totalWins", type: "uint256" },
					{ name: "totalRewards", type: "uint256" },
					{ name: "totalNftsWon", type: "uint256" },
				],
			},
		],
	},
] as const;

export interface CardAppraisalInfo {
	cardId: Hex;
	currentRarity: number;
	totalDepositedCount: number;
	appraisedValueUsd: bigint;
	depositorCount: number;
	lastUpdated: bigint;
}

export interface UserCardValue {
	cardId: Hex;
	valueUsd: bigint;
}

/**
 * Hook to interact with RarityTracker contract for card appraisal and value information
 */
export function useRarityTracker(rarityTracker?: Address) {
	const { address: user } = useAccount();
	const publicClient = usePublicClient();

	const getCardInfo = useCallback(
		async (cardId: Hex): Promise<CardAppraisalInfo | null> => {
			if (!publicClient || !rarityTracker) return null;

			try {
				const info = await publicClient.readContract({
					address: rarityTracker,
					abi: rarityTrackerAbi,
					functionName: "getCardInfo",
					args: [cardId],
				});

				// Handle both tuple and object response formats
				if (Array.isArray(info)) {
					const [
						cardIdResult,
						currentRarity,
						totalDepositedCount,
						appraisedValueUsd,
						depositorCount,
						lastUpdated,
					] = info as unknown as [Hex, number, bigint, bigint, bigint, bigint];

					return {
						cardId: cardIdResult,
						currentRarity,
						totalDepositedCount: Number(totalDepositedCount),
						appraisedValueUsd,
						depositorCount: Number(depositorCount),
						lastUpdated,
					};
				} else if (info && typeof info === "object") {
					const infoObj = info as {
						cardId: Hex;
						currentRarity: number;
						totalDepositedCount: bigint;
						appraisedValueUsd: bigint;
						depositorCount: bigint;
						lastUpdated: bigint;
					};

					return {
						cardId: infoObj.cardId,
						currentRarity: infoObj.currentRarity,
						totalDepositedCount: Number(infoObj.totalDepositedCount),
						appraisedValueUsd: infoObj.appraisedValueUsd,
						depositorCount: Number(infoObj.depositorCount),
						lastUpdated: infoObj.lastUpdated,
					};
				}

				return null;
			} catch (error) {
				console.error("Failed to get card info:", error);
				return null;
			}
		},
		[publicClient, rarityTracker],
	);

	const getBatchCardInfo = useCallback(
		async (cardIds: Hex[]): Promise<CardAppraisalInfo[]> => {
			if (!publicClient || !rarityTracker || cardIds.length === 0) return [];

			try {
				const results = await publicClient.multicall({
					allowFailure: true,
					contracts: cardIds.map((cardId) => ({
						address: rarityTracker as `0x${string}`,
						abi: rarityTrackerAbi,
						functionName: "getCardInfo",
						args: [cardId],
					})),
				});

				return results
					.filter((result) => result.status === "success" && result.result)
					.map((result) => {
						const [
							cardIdResult,
							currentRarity,
							totalDepositedCount,
							appraisedValueUsd,
							depositorCount,
							lastUpdated,
						] = result.result as unknown as [
							Hex,
							number,
							bigint,
							bigint,
							bigint,
							bigint,
						];

						return {
							cardId: cardIdResult,
							currentRarity,
							totalDepositedCount: Number(totalDepositedCount),
							appraisedValueUsd,
							depositorCount: Number(depositorCount),
							lastUpdated,
						};
					});
			} catch (error) {
				console.error("Failed to get batch card info:", error);
				return [];
			}
		},
		[publicClient, rarityTracker],
	);

	const getUserCardValue = useCallback(
		async (cardId: Hex): Promise<bigint> => {
			if (!publicClient || !rarityTracker || !user) return 0n;

			try {
				const value = (await publicClient.readContract({
					address: rarityTracker,
					abi: rarityTrackerAbi,
					functionName: "getDepositorValue",
					args: [user, cardId],
				})) as bigint;

				return value;
			} catch (error) {
				console.error("Failed to get user card value:", error);
				return 0n;
			}
		},
		[publicClient, rarityTracker, user],
	);

	const getBatchUserCardValues = useCallback(
		async (cardIds: Hex[]): Promise<UserCardValue[]> => {
			if (!publicClient || !rarityTracker || !user || cardIds.length === 0)
				return [];

			try {
				const results = await publicClient.multicall({
					allowFailure: true,
					contracts: cardIds.map((cardId) => ({
						address: rarityTracker as `0x${string}`,
						abi: rarityTrackerAbi,
						functionName: "getDepositorValue",
						args: [user as Address, cardId],
					})),
				});

				return results
					.filter(
						(result) =>
							result.status === "success" && result.result !== undefined,
					)
					.map((result, index) => ({
						cardId: cardIds[index],
						valueUsd: result.result as unknown as bigint,
					}));
			} catch (error) {
				console.error("Failed to get batch user card values:", error);
				return [];
			}
		},
		[publicClient, rarityTracker, user],
	);

	const getStatistics = useCallback(async () => {
		if (!publicClient || !rarityTracker) return null;

		try {
			const stats = await publicClient.readContract({
				address: rarityTracker,
				abi: rarityTrackerAbi,
				functionName: "getStatistics",
				args: [],
			});

			// Handle both tuple and object response formats
			if (Array.isArray(stats)) {
				const [
					totalDepositedCount,
					totalAppraisedValueUsd,
					totalWins,
					totalRewards,
					totalNftsWon,
				] = stats as unknown as [bigint, bigint, bigint, bigint, bigint];

				return {
					totalDepositedCount,
					totalAppraisedValueUsd,
					totalWins,
					totalRewards,
					totalNftsWon,
				};
			} else if (stats && typeof stats === "object") {
				return stats as {
					totalDepositedCount: bigint;
					totalAppraisedValueUsd: bigint;
					totalWins: bigint;
					totalRewards: bigint;
					totalNftsWon: bigint;
				};
			}

			return null;
		} catch (error) {
			console.error("Failed to get statistics:", error);
			return null;
		}
	}, [publicClient, rarityTracker]);

	const getUserTotalInventoryValue = useCallback(
		async (cardIds: Hex[]): Promise<bigint> => {
			const userValues = await getBatchUserCardValues(cardIds);
			return userValues.reduce((total, card) => total + card.valueUsd, 0n);
		},
		[getBatchUserCardValues],
	);

	return {
		getCardInfo,
		getBatchCardInfo,
		getUserCardValue,
		getBatchUserCardValues,
		getStatistics,
		getUserTotalInventoryValue,
	};
}
