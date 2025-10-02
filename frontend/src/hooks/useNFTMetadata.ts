"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import { usePublicClient } from "wagmi";
import type { Address } from "viem";

export interface NFTMetadata {
	name: string;
	description?: string;
	image?: string;
	tokenURI?: string;
}

interface NFTMetadataResult {
	metadata: Record<string, NFTMetadata | null>;
	isLoading: boolean;
	error: string | null;
	fetchNFTMetadata: (
		contractAddress: Address,
		tokenId: bigint,
	) => Promise<void>;
	fetchBatchNFTMetadata: (
		nfts: Array<{ contract: Address; tokenId: bigint; key: string }>,
	) => Promise<void>;
}

const erc721Abi = [
	{
		type: "function",
		name: "tokenURI",
		stateMutability: "view",
		inputs: [{ name: "tokenId", type: "uint256" }],
		outputs: [{ name: "", type: "string" }],
	},
] as const;

export function useNFTMetadata(): NFTMetadataResult {
	const [metadata, setMetadata] = useState<Record<string, NFTMetadata | null>>(
		{},
	);
	const metadataRef = useRef<Record<string, NFTMetadata | null>>({});
	useEffect(() => {
		metadataRef.current = metadata;
	}, [metadata]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const publicClient = usePublicClient();

	const fetchMetadataFromURI = useCallback(
		async (tokenURI: string): Promise<NFTMetadata | null> => {
			try {
				// Handle IPFS URLs
				let fetchURL = tokenURI;
				if (tokenURI.startsWith("ipfs://")) {
					fetchURL = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/");
				}

				const response = await fetch(fetchURL);
				if (!response.ok) {
					throw new Error(`HTTP ${response.status}: ${response.statusText}`);
				}

				const metadata = await response.json();
				return {
					name: metadata.name || "Unknown NFT",
					description: metadata.description,
					image: metadata.image
						? metadata.image.startsWith("ipfs://")
							? metadata.image.replace("ipfs://", "https://ipfs.io/ipfs/")
							: metadata.image
						: undefined,
					tokenURI,
				};
			} catch (err) {
				console.warn("Failed to fetch metadata from URI:", tokenURI, err);
				return null;
			}
		},
		[],
	);

	const fetchNFTMetadata = useCallback(
		async (contractAddress: Address, tokenId: bigint) => {
			if (!publicClient) return;

			const key = `${contractAddress}-${tokenId}`;

			// Check if already cached without using metadata state to avoid infinite loop
			setMetadata((prev) => {
				if (prev[key] !== undefined) {
					return prev; // Already fetched or attempted
				}

				// Start fetching in async manner
				(async () => {
					setIsLoading(true);
					setError(null);

					try {
						// Get tokenURI from contract
						const tokenURI = await publicClient.readContract({
							address: contractAddress,
							abi: erc721Abi,
							functionName: "tokenURI",
							args: [tokenId],
						});

						if (!tokenURI) {
							setMetadata((prev) => ({ ...prev, [key]: null }));
							return;
						}

						// Fetch metadata from URI
						const nftMetadata = await fetchMetadataFromURI(tokenURI);
						setMetadata((prev) => ({ ...prev, [key]: nftMetadata }));
					} catch (err) {
						console.error("Failed to fetch NFT metadata:", err);
						setMetadata((prev) => ({ ...prev, [key]: null }));
						setError(
							err instanceof Error
								? err.message
								: "Failed to fetch NFT metadata",
						);
					} finally {
						setIsLoading(false);
					}
				})();

				return prev;
			});
		},
		[publicClient, fetchMetadataFromURI],
	);

	const fetchBatchNFTMetadata = useCallback(
		async (
			nfts: Array<{ contract: Address; tokenId: bigint; key: string }>,
		) => {
			if (!publicClient || nfts.length === 0) return;

			setIsLoading(true);
			setError(null);

			try {
				const promises = nfts.map(async ({ contract, tokenId, key }) => {
					// Check current metadata state without dependency
					const currentMetadata = metadataRef.current[key];
					if (currentMetadata !== undefined) {
						return { key, metadata: currentMetadata };
					}

					try {
						const tokenURI = await publicClient.readContract({
							address: contract,
							abi: erc721Abi,
							functionName: "tokenURI",
							args: [tokenId],
						});

						if (!tokenURI) {
							return { key, metadata: null };
						}

						const nftMetadata = await fetchMetadataFromURI(tokenURI);
						return { key, metadata: nftMetadata };
					} catch (err) {
						console.warn("Failed to fetch metadata for", key, err);
						return { key, metadata: null };
					}
				});

				const results = await Promise.allSettled(promises);
				const newMetadata: Record<string, NFTMetadata | null> = {};

				results.forEach((result, index) => {
					if (result.status === "fulfilled") {
						newMetadata[result.value.key] = result.value.metadata;
					} else {
						newMetadata[nfts[index].key] = null;
					}
				});

				setMetadata((prev) => ({ ...prev, ...newMetadata }));
			} catch (err) {
				console.error("Failed to fetch batch NFT metadata:", err);
				setError(
					err instanceof Error ? err.message : "Failed to fetch NFT metadata",
				);
			} finally {
				setIsLoading(false);
			}
		},
		[publicClient, fetchMetadataFromURI],
	);

	return {
		metadata,
		isLoading,
		error,
		fetchNFTMetadata,
		fetchBatchNFTMetadata,
	};
}
