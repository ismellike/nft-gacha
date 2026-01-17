/**
 * Single, comprehensive NFT metadata hook
 * Handles tokenURI fetching, metadata retrieval, and image processing with caching
 */

"use client";

import { useState, useEffect } from "react";
import { useReadErc721TokenUri } from "../generated";
import { usePublicClient } from "wagmi";
import { fetchNFTMetadata, processImageUrl } from "../lib/nft-metadata";
import {
	isCourtyardTokenURI,
	fetchCourtyardMetadata,
	processCourtyardImageUrl,
} from "../lib/courtyard-utils";
import { CACHE_DURATIONS } from "../lib/constants";
import type { NFTWithMetadata, NFTMetadata } from "../types/hooks";
import { logger } from "../lib/logger";

// ERC721 tokenURI ABI
const ERC721_ABI = [
	{
		inputs: [{ name: "tokenId", type: "uint256" }],
		name: "tokenURI",
		outputs: [{ name: "", type: "string" }],
		stateMutability: "view",
		type: "function",
	},
] as const;

interface ImportedMetadata {
	name?: string;
	description?: string;
	image?: string;
	external_url?: string;
	attributes?: readonly unknown[];
	[key: string]: unknown;
}

// Global cache shared across all hook instances
const METADATA_CACHE = new Map<
	string,
	{
		data: NFTWithMetadata;
		timestamp: number;
	}
>();

const TOKEN_URI_CACHE = new Map<
	string,
	{
		tokenURI: string | null;
		timestamp: number;
		promise?: Promise<string | null>;
	}
>();

const CACHE_KEY = (collection: string, tokenId: string) =>
	`${collection}-${tokenId}`;

const isCacheValid = (timestamp: number) =>
	Date.now() - timestamp < CACHE_DURATIONS.MEDIUM;

const cleanupExpiredCache = () => {
	// Clean metadata cache
	for (const [key, entry] of METADATA_CACHE.entries()) {
		if (!isCacheValid(entry.timestamp)) {
			METADATA_CACHE.delete(key);
		}
	}

	// Clean tokenURI cache
	for (const [key, entry] of TOKEN_URI_CACHE.entries()) {
		if (!isCacheValid(entry.timestamp)) {
			TOKEN_URI_CACHE.delete(key);
		}
	}
};

// Fetch metadata with Courtyard optimization
const fetchMetadataFromURI = async (
	tokenURI: string,
): Promise<{ metadata: NFTMetadata | null; imageUrl: string | null }> => {
	const isCourtyard = isCourtyardTokenURI(tokenURI);

	try {
		const importedMetadata = isCourtyard
			? await fetchCourtyardMetadata(tokenURI)
			: await fetchNFTMetadata(tokenURI);

		let imageUrl: string | null = null;
		let metadata: NFTMetadata | null = null;

		if (importedMetadata) {
			// Convert to our standardized NFTMetadata type
			const baseMetadata: NFTMetadata = {
				name: importedMetadata.name || "Unknown",
				tokenURI,
			};

			// Add standard NFT fields if they exist
			if (importedMetadata.description) {
				baseMetadata.description = importedMetadata.description;
			}
			if (importedMetadata.image) {
				baseMetadata.image = importedMetadata.image;
			}
			if (importedMetadata.external_url) {
				baseMetadata.external_url = importedMetadata.external_url;
			}
			if (importedMetadata.attributes) {
				baseMetadata.attributes = importedMetadata.attributes;
			}

			// Add optional extended fields
			const extendedFields = [
				"proof_of_integrity",
				"grading_company",
				"grade",
				"cert_number",
				"set_number",
				"card_number",
				"artist",
			] as const;

			extendedFields.forEach((field) => {
				if (importedMetadata[field as keyof ImportedMetadata]) {
					baseMetadata[field as keyof ImportedMetadata] =
						importedMetadata[field as keyof ImportedMetadata];
				}
			});

			metadata = baseMetadata;

			imageUrl = isCourtyard
				? processCourtyardImageUrl(importedMetadata)
				: processImageUrl(importedMetadata.image, importedMetadata);
		}

		return { metadata, imageUrl };
	} catch (error) {
		logger.nftMetadata.warn(`Failed to fetch metadata from ${tokenURI}:`, error);
		return { metadata: null, imageUrl: null };
	}
};

/**
 * Primary NFT metadata hook - use this for all NFT metadata needs
 * Automatically fetches tokenURI and metadata when collection and tokenId are provided
 * @param collection - NFT collection contract address
 * @param tokenId - Token ID
 * @param options - Configuration options
 * @param options.enabled - Enable/disable the hook (default: true)
 * @param options.skipFetch - Skip metadata fetching, only get tokenURI (default: false)
 * @returns NFT with metadata, loading state, and error information
 */
export function useNFTMetadata(
	collection: string,
	tokenId: string,
	options: {
		enabled?: boolean;
		skipFetch?: boolean; // If true, only fetch tokenURI, not metadata
	} = {},
): NFTWithMetadata {
	const { enabled = true, skipFetch = false } = options;

	const cacheKey = CACHE_KEY(collection, tokenId);

	// Initialize state from cache or default
	const [state, setState] = useState<NFTWithMetadata>(() => {
		const cached = METADATA_CACHE.get(cacheKey);
		if (cached && isCacheValid(cached.timestamp)) {
			return cached.data;
		}

		return {
			collection,
			tokenId,
			tokenURI: null,
			metadata: null,
			imageUrl: null,
			isLoading: false,
			error: null,
		};
	});

	// Get tokenURI using wagmi hook (more efficient than manual calls)
	const {
		data: tokenURI,
		isLoading: isTokenURILoading,
		error: tokenURIError,
	} = useReadErc721TokenUri({
		address: collection as `0x${string}`,
		args: tokenId ? [BigInt(tokenId)] : undefined,
		query: {
			enabled: enabled && !!collection && !!tokenId,
			staleTime: CACHE_DURATIONS.SHORT,
		},
	});

	// Handle tokenURI loading and errors
	useEffect(() => {
		// Skip effect if hook is disabled or inputs are invalid
		if (!enabled || !collection || !tokenId) {
			return;
		}

		if (isTokenURILoading) {
			setState((prev) => ({ ...prev, isLoading: true, error: null }));
			return;
		}

		if (tokenURIError) {
			setState((prev) => ({
				...prev,
				isLoading: false,
				error: `Failed to fetch tokenURI: ${tokenURIError.message}`,
			}));
			return;
		}

		if (!tokenURI) {
			setState((prev) => ({
				...prev,
				isLoading: false,
				error: "No tokenURI available",
			}));
			return;
		}

		setState((prev) => ({ ...prev, tokenURI, isLoading: true, error: null }));
	}, [tokenURI, isTokenURILoading, tokenURIError, enabled, collection, tokenId]);

	// Fetch metadata when tokenURI is available (unless skipFetch is true)
	useEffect(() => {
		if (!tokenURI || !enabled || skipFetch) return;

		// Check cache first
		const cached = METADATA_CACHE.get(cacheKey);
		if (cached && isCacheValid(cached.timestamp)) {
			setState(cached.data);
			return;
		}

		const fetchMetadata = async () => {
			try {
				setState((prev) => ({ ...prev, isLoading: true, error: null }));

				const { metadata, imageUrl } = await fetchMetadataFromURI(tokenURI);

				const result: NFTWithMetadata = {
					collection,
					tokenId,
					tokenURI,
					metadata,
					imageUrl,
					isLoading: false,
					error: null,
				};

				// Cache the result
				METADATA_CACHE.set(cacheKey, {
					data: result,
					timestamp: Date.now(),
				});

				// Cleanup expired entries
				cleanupExpiredCache();

				setState(result);
			} catch (error) {
				setState((prev) => ({
					...prev,
					isLoading: false,
					error:
						error instanceof Error ? error.message : "Failed to fetch metadata",
				}));
			}
		};

		fetchMetadata();
	}, [tokenURI, collection, tokenId, cacheKey, enabled, skipFetch]);

	return state;
}

/**
 * Hook for batch loading multiple NFTs
 * @param requests - Array of { collection, tokenId, options }
 * @returns Record of cache keys to NFTWithMetadata
 */
export function useBatchNFTMetadata(
	requests: Array<{
		collection: string;
		tokenId: string;
		options?: Parameters<typeof useNFTMetadata>[2];
	}>,
): Record<string, NFTWithMetadata> {
	const [results, setResults] = useState<Record<string, NFTWithMetadata>>({});
	const publicClient = usePublicClient();

	useEffect(() => {
		if (requests.length === 0 || !publicClient) return;

		const loadBatch = async () => {
			const newResults: Record<string, NFTWithMetadata> = {};

			// Process requests in parallel with concurrency limit
			const batchSize = 6;
			for (let i = 0; i < requests.length; i += batchSize) {
				const batch = requests.slice(i, i + batchSize);

				const batchPromises = batch.map(async ({ collection, tokenId, options = {} }) => {
					const cacheKey = CACHE_KEY(collection, tokenId);
					const { enabled = true, skipFetch = false } = options;

					// Check cache first
					const cached = METADATA_CACHE.get(cacheKey);
					if (cached && isCacheValid(cached.timestamp)) {
						return { key: cacheKey, data: cached.data };
					}

					// Create loading state
					const loadingState: NFTWithMetadata = {
						collection,
						tokenId,
						tokenURI: null,
						metadata: null,
						imageUrl: null,
						isLoading: true,
						error: null,
					};

					// Skip fetch if disabled or skipFetch is true
					if (!enabled || skipFetch) {
						return { key: cacheKey, data: { ...loadingState, isLoading: false } };
					}

					// Fetch tokenURI and metadata
					try {
						// Fetch tokenURI using contract read
						const tokenURI = await publicClient.readContract({
							address: collection as `0x${string}`,
							abi: ERC721_ABI,
							functionName: "tokenURI",
							args: [BigInt(tokenId)],
						});

						if (!tokenURI) {
							return {
								key: cacheKey,
								data: {
									...loadingState,
									isLoading: false,
									error: "No tokenURI available",
								},
							};
						}

						// Fetch metadata from tokenURI
						const { metadata, imageUrl } = await fetchMetadataFromURI(tokenURI);

						const result: NFTWithMetadata = {
							collection,
							tokenId,
							tokenURI,
							metadata,
							imageUrl,
							isLoading: false,
							error: null,
						};

						// Cache the result
						METADATA_CACHE.set(cacheKey, {
							data: result,
							timestamp: Date.now(),
						});

						return { key: cacheKey, data: result };
					} catch (error) {
						return {
							key: cacheKey,
							data: {
								...loadingState,
								isLoading: false,
								error: error instanceof Error ? error.message : "Failed to fetch metadata",
							},
						};
					}
				});

				const batchResults = await Promise.allSettled(batchPromises);

				batchResults.forEach((result) => {
					if (result.status === "fulfilled") {
						newResults[result.value.key] = result.value.data;
					}
				});

				setResults((prev) => ({ ...prev, ...newResults }));
			}

			// Cleanup expired cache entries
			cleanupExpiredCache();
		};

		loadBatch();
	}, [requests, publicClient]);

	return results;
}

/**
 * Utility functions for cache management
 */
export const NFTMetadataUtils = {
	/**
	 * Clear all cached metadata
	 */
	clearCache: () => {
		METADATA_CACHE.clear();
		TOKEN_URI_CACHE.clear();
	},

	/**
	 * Get cache statistics
	 */
	getCacheStats: () => ({
		metadataCacheSize: METADATA_CACHE.size,
		tokenURICacheSize: TOKEN_URI_CACHE.size,
	}),

	/**
	 * Prefetch NFT metadata
	 */
	prefetch: async (collection: string, tokenId: string) => {
		const cacheKey = CACHE_KEY(collection, tokenId);

		// Check if already cached
		const cached = METADATA_CACHE.get(cacheKey);
		if (cached && isCacheValid(cached.timestamp)) {
			return cached.data;
		}

		// This would trigger a fetch - in practice, you'd call the hook with prefetch: true
		logger.nftMetadata.debug(`Prefetching NFT metadata for ${collection}-${tokenId}`);
		return null;
	},
} as const;

/**
 * Hook to enhance a spin result with metadata
 * Convenience wrapper for useNFTMetadata
 */
export function useEnhancedSpinResult(
	spinResult: { rarity: string; collection: string; tokenId: string } | null,
) {
	const nftData = useNFTMetadata(
		spinResult?.collection || "",
		spinResult?.tokenId || "",
		{ enabled: !!spinResult?.collection && !!spinResult?.tokenId },
	);

	if (!spinResult) {
		return null;
	}

	return {
		rarity: spinResult.rarity,
		collection: spinResult.collection,
		tokenId: spinResult.tokenId,
		metadata: nftData.metadata,
		imageUrl: nftData.imageUrl,
	};
}
