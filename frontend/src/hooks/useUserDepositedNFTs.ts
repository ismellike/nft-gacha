"use client";

import { useCallback } from "react";
import type { Address } from "viem";
import { useAccount, usePublicClient } from "wagmi";

export interface DepositedNFT {
	collection: Address;
	tokenId: bigint;
	depositor: Address;
	appraisedPrice: bigint;
	currentRarity: number; // 0-4 for Common-Legendary
	collectionName?: string; // Optional collection name for display
	depositTimestamp?: bigint; // Block timestamp when NFT was deposited
	// Canonical NFT information from appraisal system
	canonicalContractAddress?: Address; // Canonical contract if different from deposited
	canonicalTokenId?: bigint; // Canonical token ID if different from deposited
}

const depositedNFTsAbi = [
	{
		type: "function",
		name: "getUserDepositedNFTs",
		stateMutability: "view",
		inputs: [{ name: "user", type: "address" }],
		outputs: [
			{
				name: "items",
				type: "tuple[]",
				components: [
					{ name: "collection", type: "address" },
					{ name: "depositor", type: "address" },
					{ name: "tokenId", type: "uint256" },
					{ name: "appraisedPrice", type: "uint256" },
					{ name: "rarity", type: "uint8" },
					{ name: "depositTime", type: "uint256" },
					{ name: "receiveTime", type: "uint256" },
				],
			},
		],
	},
] as const;

const tokenCardIdsAbi = [
	{
		type: "function",
		name: "tokenCardIds",
		stateMutability: "view",
		inputs: [
			{ name: "collection", type: "address" },
			{ name: "tokenId", type: "uint256" },
		],
		outputs: [{ name: "", type: "bytes32" }],
	},
] as const;

const getCardAppraisalAbi = [
	{
		type: "function",
		name: "getCardAppraisal",
		stateMutability: "view",
		inputs: [{ name: "cardId", type: "bytes32" }],
		outputs: [
			{
				name: "",
				type: "tuple",
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

/**
 * Simple hook to get deposited NFTs - no complex logic, let UnifiedNFTCard handle canonical data
 */
export function useUserDepositedNFTs(treasury?: Address) {
	const { address: user } = useAccount();
	const publicClient = usePublicClient();

	const getUserDepositedNFTs = useCallback(async (): Promise<
		DepositedNFT[]
	> => {
		if (!publicClient || !treasury || !user) {
			return [];
		}

		try {
			const items = await publicClient.readContract({
				address: treasury,
				abi: depositedNFTsAbi,
				functionName: "getUserDepositedNFTs",
				args: [user],
			});

			if (!Array.isArray(items) || items.length === 0) {
				return [];
			}

			return items.map((item) => {
				const depositedNFT: DepositedNFT = {
					collection: item.collection as Address,
					tokenId: BigInt(item.tokenId),
					depositor: item.depositor as Address,
					appraisedPrice: BigInt(item.appraisedPrice || 0),
					currentRarity: Number(item.rarity || 0),
					depositTimestamp: BigInt(item.depositTime || 0),
				};

				return depositedNFT;
			});
		} catch (error) {
			console.error("Error fetching deposited NFTs:", error);
			return [];
		}
	}, [publicClient, treasury, user]);

	/**
	 * Gets canonical NFT data from appraisal contract for a deposited NFT
	 */
	const getCanonicalNFTData = useCallback(
		async (
			appraisal: Address,
			collection: Address,
			tokenId: bigint,
		): Promise<{
			canonicalContractAddress?: Address;
			canonicalTokenId?: bigint;
		}> => {
			if (!publicClient) return {};

			try {
				const cardId = await publicClient.readContract({
					address: appraisal,
					abi: tokenCardIdsAbi,
					functionName: "tokenCardIds",
					args: [collection, tokenId],
				});

				if (
					!cardId ||
					cardId ===
						"0x0000000000000000000000000000000000000000000000000000000000000000"
				) {
					return {};
				}

				const cardAppraisal = await publicClient.readContract({
					address: appraisal,
					abi: getCardAppraisalAbi,
					functionName: "getCardAppraisal",
					args: [cardId],
				});

				if (cardAppraisal && typeof cardAppraisal === "object") {
					const appraisalData = cardAppraisal as {
						canonicalContractAddress: Address;
						canonicalTokenId: bigint;
					};
					return {
						canonicalContractAddress: appraisalData.canonicalContractAddress,
						canonicalTokenId: BigInt(appraisalData.canonicalTokenId || 0),
					};
				}

				return {};
			} catch {
				return {};
			}
		},
		[publicClient],
	);

	return {
		getUserDepositedNFTs,
		getCanonicalNFTData,
	};
}
