"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAccount, usePublicClient } from "wagmi";
import { baseErc721Abi } from "../generated";
import { logger } from "../lib/logger";
import type {
	UserOwnedNFTMultiCollection,
	UseUserOwnedNFTsMultiResult,
} from "../types/hooks";

/**
 * Hook to fetch all NFTs owned by the current user from multiple collections
 * Efficiently queries each collection to find all owned tokens
 */
export function useUserOwnedNFTsMultipleCollections(
	collectionAddresses: string[],
): UseUserOwnedNFTsMultiResult {
	const { address: userAddress } = useAccount();
	const publicClient = usePublicClient();
	const [nfts, setNfts] = useState<UserOwnedNFTMultiCollection[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Normalize and key by contents to avoid identity churn across renders
	const collectionsKey = useMemo(
		() =>
			JSON.stringify(
				(collectionAddresses || []).map((a) => a.toLowerCase()).sort(),
			),
		[collectionAddresses],
	);
	const normalizedCollections = useMemo(
		() => JSON.parse(collectionsKey) as string[],
		[collectionsKey],
	);

	const fetchUserNFTs = useCallback(async () => {
		if (!userAddress || !publicClient || normalizedCollections.length === 0) {
			setNfts([]);
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			const allUserNFTs: UserOwnedNFTMultiCollection[] = [];

			// Process each collection
			for (const collectionAddress of normalizedCollections) {
				try {
					// Get user's balance for this collection
					const userBalance = await publicClient.readContract({
						address: collectionAddress as `0x${string}`,
						abi: baseErc721Abi,
						functionName: "balanceOf",
						args: [userAddress],
					});

					// If user has no tokens in this collection, skip
					if (userBalance === BigInt(0)) {
						continue;
					}

					// Get collection name for display
					let collectionName: string | undefined;
					try {
						collectionName = await publicClient.readContract({
							address: collectionAddress as `0x${string}`,
							abi: baseErc721Abi,
							functionName: "name",
						});
					} catch {
						// Name is optional, continue without it
					}

					// Prefer ERC721Enumerable to enumerate token IDs
					let enumerable = false;
					try {
						enumerable = (await publicClient.readContract({
							address: collectionAddress as `0x${string}`,
							abi: baseErc721Abi,
							functionName: "supportsInterface",
							args: ["0x780e9d63"],
						})) as boolean;
					} catch {}

					if (enumerable) {
						for (let i = 0n; i < (userBalance as bigint); i++) {
							try {
								const tokenId = (await publicClient.readContract({
									address: collectionAddress as `0x${string}`,
									abi: baseErc721Abi,
									functionName: "tokenOfOwnerByIndex",
									args: [userAddress as `0x${string}`, i],
								})) as bigint;
								allUserNFTs.push({
									collection: collectionAddress,
									tokenId,
									collectionName: collectionName || "",
								});
							} catch {}
						}
					}
				} catch (collectionError) {
					logger.network.warn(
						`Error processing collection ${collectionAddress}:`,
						collectionError,
					);
				}
			}

			setNfts(allUserNFTs);
		} catch (err) {
			logger.network.error(
				"Error fetching user NFTs from multiple collections:",
				err,
			);
			setError(err instanceof Error ? err.message : "Failed to fetch NFTs");
			setNfts([]);
		} finally {
			setIsLoading(false);
		}
	}, [userAddress, publicClient, normalizedCollections]);

	// Fetch NFTs when dependencies change
	useEffect(() => {
		fetchUserNFTs();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [fetchUserNFTs]);

	return {
		nfts,
		isLoading,
		error,
		refetch: fetchUserNFTs,
	};
}
