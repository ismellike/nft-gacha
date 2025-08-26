"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAccount, usePublicClient } from "wagmi";
import {
	useReadSimpleErc721BalanceOf,
	useReadSimpleErc721TotalSupply,
	simpleErc721Abi,
} from "../generated";

export interface UserOwnedNFT {
	tokenId: bigint;
	contractAddress: string;
}

export interface UseUserOwnedNFTsResult {
	tokens: bigint[];
	isLoading: boolean;
	error: string | null;
	refetch: () => void;
}

export interface UserOwnedNFTMultiCollection {
	collection: string;
	tokenId: bigint;
	collectionName?: string;
}

export interface UseUserOwnedNFTsMultiResult {
	nfts: UserOwnedNFTMultiCollection[];
	isLoading: boolean;
	error: string | null;
	refetch: () => void;
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
	const { data: userBalance } = useReadSimpleErc721BalanceOf({
		address: collectionAddress as `0x${string}`,
		args: userAddress ? [userAddress] : undefined,
		query: { enabled: !!userAddress && !!collectionAddress },
	});

	// Get total supply to know the range of token IDs to check
	const { data: totalSupply } = useReadSimpleErc721TotalSupply({
		address: collectionAddress as `0x${string}`,
		query: { enabled: !!collectionAddress },
	});

	const fetchUserTokens = useCallback(async () => {
		if (
			!userAddress ||
			!collectionAddress ||
			!publicClient ||
			totalSupply === undefined ||
			userBalance === undefined
		) {
			setTokens([]);
			return;
		}

		// If user has no tokens, return early
		if (userBalance === BigInt(0)) {
			setTokens([]);
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			const ownedTokenIds: bigint[] = [];

			// Iterate through all possible token IDs (0 to totalSupply-1)
			// This is efficient for reasonably sized collections
			for (
				let i = 0;
				i < Number(totalSupply) && ownedTokenIds.length < Number(userBalance);
				i++
			) {
				const tokenId = BigInt(i);

				try {
					// Use publicClient to call ownerOf directly
					const owner = await publicClient.readContract({
						address: collectionAddress as `0x${string}`,
						abi: simpleErc721Abi,
						functionName: "ownerOf",
						args: [tokenId],
					});

					// Check if the current user owns this token
					if (owner.toLowerCase() === userAddress.toLowerCase()) {
						ownedTokenIds.push(tokenId);
					}
				} catch (_ownershipError) { }
			}

			setTokens(ownedTokenIds);
		} catch (err) {
			console.error("Error fetching user NFTs:", err);
			setError(err instanceof Error ? err.message : "Failed to fetch NFTs");
			setTokens([]);
		} finally {
			setIsLoading(false);
		}
	}, [userAddress, collectionAddress, publicClient, totalSupply, userBalance]);

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
				(collectionAddresses || [])
					.map((a) => a.toLowerCase())
					.sort(),
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
						abi: simpleErc721Abi,
						functionName: "balanceOf",
						args: [userAddress],
					});

					// If user has no tokens in this collection, skip
					if (userBalance === BigInt(0)) {
						continue;
					}

					// Get total supply to know the range of token IDs to check
					const totalSupply = await publicClient.readContract({
						address: collectionAddress as `0x${string}`,
						abi: simpleErc721Abi,
						functionName: "totalSupply",
					});

					// Get collection name for display
					let collectionName: string | undefined;
					try {
						collectionName = await publicClient.readContract({
							address: collectionAddress as `0x${string}`,
							abi: simpleErc721Abi,
							functionName: "name",
						});
					} catch {
						// Name is optional, continue without it
					}

					const ownedTokenIds: bigint[] = [];

					// Iterate through all possible token IDs (0 to totalSupply-1)
					for (
						let i = 0;
						i < Number(totalSupply) &&
						ownedTokenIds.length < Number(userBalance);
						i++
					) {
						const tokenId = BigInt(i);

						try {
							// Check if the current user owns this token
							const owner = await publicClient.readContract({
								address: collectionAddress as `0x${string}`,
								abi: simpleErc721Abi,
								functionName: "ownerOf",
								args: [tokenId],
							});

							if (owner.toLowerCase() === userAddress.toLowerCase()) {
								allUserNFTs.push({
									collection: collectionAddress,
									tokenId,
									collectionName: collectionName || "",
								});
								ownedTokenIds.push(tokenId);
							}
						} catch (_ownershipError) { }
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
