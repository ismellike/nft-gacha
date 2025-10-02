"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePublicClient } from "wagmi";
import type { Address, Hex } from "viem";

export interface CardAppraisal {
	priceUSD: bigint;
	status: number; // AppraisalStatus enum
	firstTimestamp: bigint;
	lastUpdated: bigint;
	canonicalContractAddress: Address;
	canonicalTokenId: bigint;
}

interface BatchCardAppraisalResult {
	cardAppraisals: Record<Hex, CardAppraisal | null>;
	isLoading: boolean;
	error: string | null;
	fetchCardAppraisals: (
		cardIds: Hex[],
	) => Promise<Record<Hex, CardAppraisal | null>>;
}

const appraisalContractAbi = [
	{
		type: "function",
		name: "getCardAppraisals",
		stateMutability: "view",
		inputs: [
			{
				name: "cardIds",
				type: "bytes32[]",
			},
		],
		outputs: [
			{
				name: "appraisals",
				type: "tuple[]",
				components: [
					{ name: "priceUSD", type: "uint256" },
					{ name: "status", type: "uint8" },
					{ name: "firstTimestamp", type: "uint256" },
					{ name: "lastUpdated", type: "uint256" },
					{ name: "canonicalContractAddress", type: "address" },
					{ name: "canonicalTokenId", type: "uint256" },
				],
			},
		],
	},
] as const;

export function useBatchCardAppraisal(
	appraisalContract?: Address,
): BatchCardAppraisalResult {
	const [cardAppraisals, setCardAppraisals] = useState<
		Record<Hex, CardAppraisal | null>
	>({});
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const publicClient = usePublicClient();

	const fetchCardAppraisals = useCallback(
		async (cardIds: Hex[]): Promise<Record<Hex, CardAppraisal | null>> => {
			if (!appraisalContract || !publicClient || cardIds.length === 0) {
				return {};
			}

			setIsLoading(true);
			setError(null);

			try {
				console.log(
					"🔍 Fetching batch card appraisals for",
					cardIds.length,
					"cards:",
					cardIds,
				);
				console.log("📍 From appraisal contract:", appraisalContract);

				const result = await publicClient.readContract({
					address: appraisalContract,
					abi: appraisalContractAbi,
					functionName: "getCardAppraisals",
					args: [cardIds],
				});

				console.log("📦 Raw contract result:", result);

				const appraisalsMap: Record<Hex, CardAppraisal | null> = {};

				// Map results back to card IDs
				cardIds.forEach((cardId, index) => {
					const rawAppraisal = result?.[index];
					console.log(`🔍 Card ${cardId}:`, rawAppraisal);

					if (rawAppraisal && rawAppraisal.firstTimestamp > 0n) {
						// Only consider it a valid appraisal if firstTimestamp > 0
						appraisalsMap[cardId] = {
							priceUSD: rawAppraisal.priceUSD,
							status: rawAppraisal.status,
							firstTimestamp: rawAppraisal.firstTimestamp,
							lastUpdated: rawAppraisal.lastUpdated,
							canonicalContractAddress: rawAppraisal.canonicalContractAddress,
							canonicalTokenId: rawAppraisal.canonicalTokenId,
						};
						console.log(
							`✅ Valid appraisal for ${cardId}:`,
							appraisalsMap[cardId],
						);
					} else {
						appraisalsMap[cardId] = null;
						console.log(
							`❌ No valid appraisal for ${cardId} - firstTimestamp:`,
							rawAppraisal?.firstTimestamp,
						);
					}
				});

				setCardAppraisals((prev) => ({ ...prev, ...appraisalsMap }));
				console.log("✅ Final appraisals map:", appraisalsMap);
				return appraisalsMap;
			} catch (err) {
				console.error("❌ Failed to fetch card appraisals:", err);
				setError(
					err instanceof Error
						? err.message
						: "Failed to fetch card appraisals",
				);
				return {};
			} finally {
				setIsLoading(false);
			}
		},
		[appraisalContract, publicClient],
	);

	// Reset state when contract changes (track previous via ref to satisfy lints)
	const prevContractRef = useRef<Address | undefined>(undefined);
	useEffect(() => {
		if (prevContractRef.current !== appraisalContract) {
			prevContractRef.current = appraisalContract;
			setCardAppraisals({});
			setError(null);
		}
	});

	return {
		cardAppraisals,
		isLoading,
		error,
		fetchCardAppraisals,
	};
}
