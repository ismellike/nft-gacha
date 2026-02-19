"use client";

import { useEffect } from "react";
import type { PublicClient } from "viem";
import type { UserOwnedNFTMultiCollection } from "../types/hooks";

const createNFTKey = (collection: string, tokenId: string | bigint): string =>
	`${collection.toLowerCase()}:${tokenId.toString()}`;

const appraisalABI = [
	{
		name: "hasAppraisal",
		type: "function",
		stateMutability: "view",
		inputs: [
			{ name: "collection", type: "address" },
			{ name: "tokenId", type: "uint256" },
		],
		outputs: [{ name: "", type: "bool" }],
	},
	{
		name: "getAppraisedPrice",
		type: "function",
		stateMutability: "view",
		inputs: [
			{ name: "collection", type: "address" },
			{ name: "tokenId", type: "uint256" },
		],
		outputs: [
			{ name: "priceUSD", type: "uint256" },
			{ name: "status", type: "uint8" },
		],
	},
] as const;

export function useAppraisalChecker(
	userOwnedNFTs: UserOwnedNFTMultiCollection[],
	appraisal: string | undefined,
	publicClient: PublicClient | undefined,
	updateAppraisedStatus: (
		collection: string,
		tokenId: string,
		hasValidAppraisal?: boolean,
		priceUSD?: bigint,
	) => void,
) {
	useEffect(() => {
		if (!userOwnedNFTs.length || !appraisal || !publicClient) return;

		const abortController = new AbortController();
		const signal = abortController.signal;

		const checkAppraisals = async () => {

			try {
				// Try batch multicall first
				const contracts = userOwnedNFTs.flatMap((nft) => [
					{
						address: appraisal as `0x${string}`,
						abi: appraisalABI,
						functionName: "hasAppraisal" as const,
						args: [nft.collection as `0x${string}`, nft.tokenId],
					},
					{
						address: appraisal as `0x${string}`,
						abi: appraisalABI,
						functionName: "getAppraisedPrice" as const,
						args: [nft.collection as `0x${string}`, nft.tokenId],
					},
				]);

				let results:
					| Array<{
							status: "success" | "failure";
							result?: unknown;
					  }>
					| undefined;

				try {
					results = await publicClient.multicall({
						contracts,
						allowFailure: true,
					});
				} catch (multicallError) {
					// Fallback to sequential calls if multicall isn't supported (e.g., local Anvil chain)
					console.warn(
						"Multicall not supported, falling back to sequential calls:",
						multicallError,
					);

					// Sequential fallback
					const sequentialPromises = userOwnedNFTs.map(async (nft) => {
						if (signal.aborted) return null;

						try {
							const hasAppraisalResult = (await publicClient.readContract({
								address: appraisal as `0x${string}`,
								abi: appraisalABI,
								functionName: "hasAppraisal",
								args: [nft.collection as `0x${string}`, nft.tokenId],
							})) as boolean;

							let hasValidAppraisal = hasAppraisalResult;
							let priceUSD: bigint = 0n;

							if (hasAppraisalResult) {
								try {
									const appraisalData = (await publicClient.readContract({
										address: appraisal as `0x${string}`,
										abi: appraisalABI,
										functionName: "getAppraisedPrice",
										args: [nft.collection as `0x${string}`, nft.tokenId],
									})) as readonly [bigint, number];

									const [appraisedPrice, status] = appraisalData;
									const statusAsNumber = Number(status);
									hasValidAppraisal =
										appraisedPrice > 0n &&
										(statusAsNumber === 1 || statusAsNumber === 2);
									priceUSD = appraisedPrice;
								} catch (priceError) {
									console.warn(
										`Failed to fetch appraisal details for ${createNFTKey(nft.collection, nft.tokenId)}:`,
										priceError,
									);
								}
							}

							updateAppraisedStatus(
								nft.collection,
								nft.tokenId.toString(),
								hasValidAppraisal,
								priceUSD,
							);
							return null;
						} catch (error) {
							console.error(
								`Error checking appraisal for ${createNFTKey(nft.collection, nft.tokenId)}:`,
								error,
							);
							updateAppraisedStatus(
								nft.collection,
								nft.tokenId.toString(),
								false,
								0n,
							);
							return null;
						}
					});

					await Promise.allSettled(sequentialPromises);
					return;
				}

				// Process multicall results in pairs (hasAppraisal + getAppraisedPrice)
				if (results) {
					for (let i = 0; i < userOwnedNFTs.length; i++) {
						if (signal.aborted) return;

						const nft = userOwnedNFTs[i];
						const hasAppraisalResult = results[i * 2];
						const appraisalPriceResult = results[i * 2 + 1];

						let hasValidAppraisal = false;
						let priceUSD: bigint = 0n;

						if (
							hasAppraisalResult.status === "success" &&
							hasAppraisalResult.result === true
						) {
							if (
								appraisalPriceResult.status === "success" &&
								appraisalPriceResult.result
							) {
								const [appraisedPrice, status] =
									appraisalPriceResult.result as [bigint, number];
								const statusAsNumber = Number(status);
								hasValidAppraisal =
									appraisedPrice > 0n &&
									(statusAsNumber === 1 || statusAsNumber === 2);
								priceUSD = appraisedPrice;
							}
						}

						updateAppraisedStatus(
							nft.collection,
							nft.tokenId.toString(),
							hasValidAppraisal,
							priceUSD,
						);
					}
				}
			} catch (error) {
				if (!signal.aborted) {
					console.error("Error in batch appraisal check:", error);
				}
			}
		};

		checkAppraisals();

		return () => abortController.abort();
	}, [userOwnedNFTs, appraisal, publicClient, updateAppraisedStatus]);
}
