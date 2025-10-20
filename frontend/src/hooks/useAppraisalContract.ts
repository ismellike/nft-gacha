"use client";

import { useCallback } from "react";
import { usePublicClient } from "wagmi";
import { nftAppraisalAbi } from "../generated";
import type { Address, Hex } from "viem";

export interface CardInstance {
	collection: Address;
	tokenId: bigint;
}

/**
 * Hook for interacting with the NFT Appraisal contract to get NFT instances from card IDs
 * Uses generated wagmi ABI for type-safe contract interactions
 */
export function useAppraisalContract(appraisalContract?: Address) {
	const publicClient = usePublicClient();

	const getCardInstances = useCallback(
		async (cardIds: Hex[]): Promise<CardInstance[]> => {
			if (!publicClient || !appraisalContract || cardIds.length === 0) {
				console.log("❌ [AppraisalHook] Missing dependencies:", {
					publicClient: !!publicClient,
					appraisalContract,
					cardIdsLength: cardIds.length
				});
				return [];
			}

			try {
				console.log("🔍 [AppraisalHook] Calling getCardInstances with:", {
					contract: appraisalContract,
					cardIds
				});

				const [collections, tokenIds] = await publicClient.readContract({
					address: appraisalContract,
					abi: nftAppraisalAbi,
					functionName: "getCardInstances",
					args: [cardIds],
				});

				console.log("📦 [AppraisalHook] Raw response:", {
					collections,
					tokenIds
				});

				// Convert to CardInstance array, filtering out zero addresses
				const instances: CardInstance[] = [];
				for (let i = 0; i < collections.length; i++) {
					console.log(`🎴 [AppraisalHook] Processing card ${i}:`, {
						cardId: cardIds[i],
						collection: collections[i],
						tokenId: tokenIds[i],
						isZeroAddress: collections[i] === "0x0000000000000000000000000000000000000000"
					});

					if (collections[i] !== "0x0000000000000000000000000000000000000000") {
						instances.push({
							collection: collections[i] as Address,
							tokenId: BigInt(tokenIds[i]),
						});
					}
				}

				console.log("✅ [AppraisalHook] Final instances:", instances);
				return instances;
			} catch (error) {
				console.error("❌ [AppraisalHook] Error calling getCardInstances:", error);
				return [];
			}
		},
		[publicClient, appraisalContract],
	);

	const getCardInstance = useCallback(
		async (cardId: Hex): Promise<CardInstance | null> => {
			if (!publicClient || !appraisalContract) {
				return null;
			}

			try {
				const [collection, tokenId] = await publicClient.readContract({
					address: appraisalContract,
					abi: nftAppraisalAbi,
					functionName: "getCardInstance",
					args: [cardId],
				});

				// Return null if no instance found
				if (collection === "0x0000000000000000000000000000000000000000") {
					return null;
				}

				console.log(`✅ [AppraisalHook] Found instance for card ${cardId}:`, {
					collection,
					tokenId
				});

				return {
					collection: collection as Address,
					tokenId: BigInt(tokenId),
				};
			} catch (error) {
				console.error("❌ [AppraisalHook] Error calling getCardInstance:", error);
				return null;
			}
		},
		[publicClient, appraisalContract],
	);

	return {
		getCardInstances,
		getCardInstance,
	};
}