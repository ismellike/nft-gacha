"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAccount, usePublicClient } from "wagmi";
import { parseAbiItem } from "viem";
import {
	baseErc721Abi,
	useReadBaseErc721BalanceOf,
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
	const { data: userBalance } = useReadBaseErc721BalanceOf({
		address: collectionAddress as `0x${string}`,
		args: userAddress ? [userAddress] : undefined,
		query: { enabled: !!userAddress && !!collectionAddress },
	});

	const fetchUserTokens = useCallback(async () => {
		if (!userAddress || !collectionAddress || !publicClient || userBalance === undefined) {
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
			// Compute ownership from Transfer logs for this user on this collection
			const transferEvent = parseAbiItem(
				"event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
			);

			const [logsTo, logsFrom] = await Promise.all([
				publicClient.getLogs({
					address: collectionAddress as `0x${string}`,
					event: transferEvent,
					args: { to: userAddress as `0x${string}` },
					fromBlock: 0n,
					toBlock: "latest",
				}),
				publicClient.getLogs({
					address: collectionAddress as `0x${string}`,
					event: transferEvent,
					args: { from: userAddress as `0x${string}` },
					fromBlock: 0n,
					toBlock: "latest",
				}),
			]);

			// Merge and sort logs to determine final ownership state per tokenId
			const allLogs = [...logsTo, ...logsFrom].sort((a, b) => {
				if (a.blockNumber !== b.blockNumber) {
					return Number(a.blockNumber - b.blockNumber);
				}
				return Number((a.logIndex ?? 0n) - (b.logIndex ?? 0n));
			});

			const ownership = new Map<bigint, boolean>();
			for (const log of allLogs) {
				const { from, to, tokenId } = log.args as {
					from: `0x${string}`;
					to: `0x${string}`;
					tokenId: bigint;
				};
				if (to?.toLowerCase() === userAddress.toLowerCase()) ownership.set(tokenId, true);
				if (from?.toLowerCase() === userAddress.toLowerCase()) ownership.set(tokenId, false);
			}

			const ownedTokenIds = Array.from(ownership.entries())
				.filter(([, isOwned]) => isOwned)
				.map(([id]) => id);

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

					// Determine owned token IDs via Transfer logs for this user/collection
					const transferEvent = parseAbiItem(
						"event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
					);

					const [logsTo, logsFrom] = await Promise.all([
						publicClient.getLogs({
							address: collectionAddress as `0x${string}`,
							event: transferEvent,
							args: { to: userAddress as `0x${string}` },
							fromBlock: 0n,
							toBlock: "latest",
						}),
						publicClient.getLogs({
							address: collectionAddress as `0x${string}`,
							event: transferEvent,
							args: { from: userAddress as `0x${string}` },
							fromBlock: 0n,
							toBlock: "latest",
						}),
					]);

					const allLogs = [...logsTo, ...logsFrom].sort((a, b) => {
						if (a.blockNumber !== b.blockNumber) {
							return Number(a.blockNumber - b.blockNumber);
						}
						return Number((a.logIndex ?? 0n) - (b.logIndex ?? 0n));
					});

					const ownership = new Map<bigint, boolean>();
					for (const log of allLogs) {
						const { from, to, tokenId } = log.args as {
							from: `0x${string}`;
							to: `0x${string}`;
							tokenId: bigint;
						};
						if (to?.toLowerCase() === userAddress.toLowerCase()) ownership.set(tokenId, true);
						if (from?.toLowerCase() === userAddress.toLowerCase()) ownership.set(tokenId, false);
					}

					for (const [tokenId, isOwned] of ownership.entries()) {
						if (isOwned) {
							allUserNFTs.push({
								collection: collectionAddress,
								tokenId,
								collectionName: collectionName || "",
							});
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
