"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAccount, usePublicClient } from "wagmi";
import { baseErc721Abi, useReadBaseErc721BalanceOf } from "../generated";
import { ERC721_INTERFACES } from "../lib/constants";
import { ERC721_ABI_FRAGMENTS } from "../lib/contract-utils";
import type {
	UserOwnedNFTMultiCollection,
	UseUserOwnedNFTsMultiResult,
	UseUserOwnedNFTsResult,
} from "../types/hooks";

export interface UserOwnedNFT {
	tokenId: bigint;
	contractAddress: string;
}

/**
 * Hook to fetch all NFTs owned by the current user from a specific collection
 * Uses standard ERC721 methods (balanceOf, totalSupply, ownerOf) for efficient ownership tracking
 */
export function useUserOwnedNFTs(
	collectionAddress: string,
): UseUserOwnedNFTsResult {
	const { address: userAddress } = useAccount();
	const publicClient = usePublicClient();
	const [tokens, setTokens] = useState<bigint[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Get user's balance to optimize the search
	const { data: userBalance } = useReadBaseErc721BalanceOf({
		address: collectionAddress as `0x${string}`,
		args: userAddress ? [userAddress] : undefined,
		query: { enabled: !!userAddress && !!collectionAddress },
	});

	const fetchUserTokens = useCallback(async () => {
		if (
			!userAddress ||
			!collectionAddress ||
			!publicClient ||
			userBalance === undefined
		) {
			setTokens([]);
			return;
		}

		// Early return if user has no tokens
		if (userBalance === 0n) {
			setTokens([]);
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			const ownedTokenIds: bigint[] = [];

			// Check if contract supports ERC721Enumerable for efficient enumeration
			const enumerable = (await publicClient.readContract({
				address: collectionAddress as `0x${string}`,
				abi: [ERC721_ABI_FRAGMENTS.SUPPORTS_INTERFACE],
				functionName: "supportsInterface",
				args: [ERC721_INTERFACES.ENUMERABLE],
			})) as boolean;

			if (enumerable) {
				// Use tokenOfOwnerByIndex for efficient enumeration
				const tokenPromises = [];
				for (let i = 0n; i < userBalance; i++) {
					tokenPromises.push(
						publicClient.readContract({
							address: collectionAddress as `0x${string}`,
							abi: [ERC721_ABI_FRAGMENTS.TOKEN_OF_OWNER_BY_INDEX],
							functionName: "tokenOfOwnerByIndex",
							args: [userAddress as `0x${string}`, i],
						}) as Promise<bigint>,
					);
				}

				const tokenIds = await Promise.allSettled(tokenPromises);
				ownedTokenIds.push(
					...tokenIds
						.filter(
							(result): result is PromiseFulfilledResult<bigint> =>
								result.status === "fulfilled",
						)
						.map((result) => result.value),
				);
			} else {
				console.warn(
					`Collection ${collectionAddress} does not support ERC721Enumerable, cannot efficiently enumerate tokens`,
				);
				setError("Collection does not support token enumeration");
			}

			setTokens(ownedTokenIds);
		} catch (err) {
			console.error("Error fetching user NFTs:", err);
			setError(err instanceof Error ? err.message : "Failed to fetch NFTs");
			setTokens([]);
		} finally {
			setIsLoading(false);
		}
	}, [userAddress, collectionAddress, publicClient, userBalance]);

	// Fetch tokens when dependencies change
	useEffect(() => {
		fetchUserTokens();
	}, [fetchUserTokens]);

	return {
		tokens,
		isLoading,
		error,
		refetch: fetchUserTokens,
	};
}

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
					console.warn(
						`Error processing collection ${collectionAddress}:`,
						collectionError,
					);
				}
			}

			setNfts(allUserNFTs);
		} catch (err) {
			console.error("Error fetching user NFTs from multiple collections:", err);
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
