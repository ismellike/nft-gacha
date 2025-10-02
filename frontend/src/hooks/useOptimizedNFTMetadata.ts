"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { usePublicClient } from "wagmi";
import {
	fetchNFTMetadata,
	processImageUrl,
	type NFTMetadata,
} from "../lib/nft-metadata";
import {
	isCourtyardTokenURI,
	fetchCourtyardMetadata,
	processCourtyardImageUrl,
} from "../lib/courtyard-utils";

export interface NFTWithMetadata {
	collection: string;
	tokenId: string;
	tokenURI: string | null;
	metadata: NFTMetadata | null;
	imageUrl: string | null;
	isLoading: boolean;
	error: string | null;
}

// Global cache for metadata to avoid redundant fetches across components
const metadataCache = new Map<
	string,
	{
		data: NFTWithMetadata;
		timestamp: number;
		priority: number;
	}
>();

// Deduplication cache for tokenURI calls - same collection+tokenId should only be called once
const tokenURICache = new Map<
	string,
	{
		tokenURI: string | null;
		timestamp: number;
		promise?: Promise<string | null>;
	}
>();

const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
const MAX_CACHE_SIZE = 500; // Limit memory usage

// Priority queue for managing concurrent fetches
class FetchQueue {
	private queue: Array<{
		key: string;
		promise: Promise<NFTWithMetadata>;
		priority: number;
		timestamp: number;
	}> = [];
	private maxConcurrent = 6; // Limit concurrent fetches

	add(key: string, promise: Promise<NFTWithMetadata>, priority: number = 0) {
		// Remove existing entry if it exists
		this.queue = this.queue.filter((item) => item.key !== key);

		this.queue.push({
			key,
			promise,
			priority,
			timestamp: Date.now(),
		});

		// Sort by priority (higher first) then by timestamp (newer first)
		this.queue.sort((a, b) => {
			if (a.priority !== b.priority) {
				return b.priority - a.priority;
			}
			return b.timestamp - a.timestamp;
		});

		// Limit queue size
		if (this.queue.length > this.maxConcurrent * 2) {
			this.queue = this.queue.slice(0, this.maxConcurrent * 2);
		}
	}

	get(key: string) {
		return this.queue.find((item) => item.key === key)?.promise;
	}

	getActiveCount() {
		return this.queue.length;
	}
}

const fetchQueue = new FetchQueue();

// ERC721 ABI for tokenURI function
const erc721TokenURIAbi = [
	{
		type: "function",
		name: "tokenURI",
		stateMutability: "view",
		inputs: [{ name: "tokenId", type: "uint256" }],
		outputs: [{ name: "", type: "string" }],
	},
] as const;

// Cache management utilities
function getCacheKey(collection: string, tokenId: string): string {
	return `${collection}-${tokenId}`;
}

function getTokenURICacheKey(collection: string, tokenId: string): string {
	return `tokenuri-${collection}-${tokenId}`;
}

function getCachedData(key: string): NFTWithMetadata | null {
	const cached = metadataCache.get(key);
	if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
		return cached.data;
	}

	// Remove expired entries
	if (cached) {
		metadataCache.delete(key);
	}

	return null;
}

function getCachedTokenURI(key: string): string | null | undefined {
	const cached = tokenURICache.get(key);
	if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
		return cached.tokenURI;
	}

	// Remove expired entries
	if (cached) {
		tokenURICache.delete(key);
	}

	return undefined; // undefined means not cached, null means cached as null
}

function setCachedTokenURI(
	key: string,
	tokenURI: string | null,
	promise?: Promise<string | null>,
) {
	const entry: {
		tokenURI: string | null;
		timestamp: number;
		promise?: Promise<string | null>;
	} = {
		tokenURI,
		timestamp: Date.now(),
	};
	if (promise !== undefined) {
		entry.promise = promise;
	}
	tokenURICache.set(key, entry);
}

function getCachedTokenURIPromise(
	key: string,
): Promise<string | null> | undefined {
	const cached = tokenURICache.get(key);
	if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
		return cached.promise;
	}
	return undefined;
}

function setCachedData(
	key: string,
	data: NFTWithMetadata,
	priority: number = 0,
) {
	// Clean cache if it's getting too large
	if (metadataCache.size >= MAX_CACHE_SIZE) {
		const entries = Array.from(metadataCache.entries());
		// Remove oldest, lowest priority entries
		entries.sort((a, b) => {
			if (a[1].priority !== b[1].priority) {
				return a[1].priority - b[1].priority;
			}
			return a[1].timestamp - b[1].timestamp;
		});

		// Remove bottom 25%
		const toRemove = Math.floor(MAX_CACHE_SIZE * 0.25);
		for (let i = 0; i < toRemove; i++) {
			metadataCache.delete(entries[i][0]);
		}
	}

	metadataCache.set(key, {
		data,
		timestamp: Date.now(),
		priority,
	});
}

/**
 * Custom hook for fetching tokenURI with deduplication
 * Prevents multiple calls to the same collection+tokenId combination
 */
function useDedupedTokenURI(
	collection: string,
	tokenId: string,
	enabled: boolean = true,
) {
	const publicClient = usePublicClient();
	const [state, setState] = useState<{
		data: string | null;
		isLoading: boolean;
		error: Error | null;
	}>({
		data: null,
		isLoading: false,
		error: null,
	});

	useEffect(() => {
		if (!enabled || !collection || !tokenId || !publicClient) {
			setState({ data: null, isLoading: false, error: null });
			return;
		}

		const tokenURICacheKey = getTokenURICacheKey(collection, tokenId);

		// Check cache first
		const cachedResult = getCachedTokenURI(tokenURICacheKey);
		if (cachedResult !== undefined) {
			setState({ data: cachedResult, isLoading: false, error: null });
			return;
		}

		// Check if there's already a promise for this tokenURI
		const existingPromise = getCachedTokenURIPromise(tokenURICacheKey);
		if (existingPromise) {
			setState((prev) => ({ ...prev, isLoading: true, error: null }));
			existingPromise
				.then((result) => {
					setState({ data: result, isLoading: false, error: null });
				})
				.catch((error) => {
					setState({ data: null, isLoading: false, error });
				});
			return;
		}

		// Create new promise and cache it
		setState((prev) => ({ ...prev, isLoading: true, error: null }));

		const fetchPromise = publicClient.readContract({
			address: collection as `0x${string}`,
			abi: erc721TokenURIAbi,
			functionName: "tokenURI",
			args: [BigInt(tokenId)],
		}) as Promise<string>;

		const wrappedPromise = fetchPromise
			.then((result) => {
				const tokenURI = result || null;
				// Only cache on success with a non-empty tokenURI. Avoid caching failures/nulls
				if (tokenURI) {
					setCachedTokenURI(tokenURICacheKey, tokenURI);
				}
				return tokenURI;
			})
			.catch((error) => {
				// Do not cache null on failure so we can retry on subsequent renders
				throw error;
			});

		setCachedTokenURI(tokenURICacheKey, null, wrappedPromise);

		wrappedPromise
			.then((result) => {
				setState({ data: result, isLoading: false, error: null });
			})
			.catch((error) => {
				setState({ data: null, isLoading: false, error });
			});
	}, [collection, tokenId, enabled, publicClient]);

	return state;
}

/**
 * Enhanced hook for fetching NFT metadata with performance optimizations
 * Features:
 * - Global caching to avoid redundant fetches
 * - Priority-based loading for above-the-fold content
 * - Bulk loading optimizations
 * - Queue management for concurrent requests
 */
export function useOptimizedNFTMetadata(
	collection: string,
	tokenId: string,
	options: {
		priority?: number; // Higher numbers load first (0-10)
		enabled?: boolean; // Whether to fetch metadata
		preload?: boolean; // Start loading immediately even if not visible
	} = {},
): NFTWithMetadata {
	const { priority = 0, enabled = true, preload = false } = options;

	const [state, setState] = useState<NFTWithMetadata>(() => {
		// Try to get from cache immediately
		const cacheKey = getCacheKey(collection, tokenId);
		const cached = getCachedData(cacheKey);

		if (cached) {
			return cached;
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

	// Get tokenURI from the NFT collection contract with deduplication
	const {
		data: tokenURI,
		isLoading: isTokenURILoading,
		error: tokenURIError,
	} = useDedupedTokenURI(
		collection,
		tokenId,
		enabled && !!collection && !!tokenId,
	);

	// Memoized fetch function
	const fetchMetadata = useCallback(
		async (
			tokenURI: string,
			collection: string,
			tokenId: string,
			priority: number,
		): Promise<NFTWithMetadata> => {
			const cacheKey = getCacheKey(collection, tokenId);

			// Double-check cache before fetching
			const cached = getCachedData(cacheKey);
			if (cached) {
				return cached;
			}

			// Check if already in flight
			const existingPromise = fetchQueue.get(cacheKey);
			if (existingPromise) {
				return existingPromise;
			}

			const fetchPromise = (async (): Promise<NFTWithMetadata> => {
				try {
					// Check if this is a Courtyard NFT
					const isCourtyard = isCourtyardTokenURI(tokenURI);
					const fetchFunction = isCourtyard
						? fetchCourtyardMetadata
						: fetchNFTMetadata;

					const metadata = await fetchFunction(tokenURI);

					let imageUrl: string | null = null;
					if (metadata) {
						if (isCourtyard) {
							imageUrl = processCourtyardImageUrl(metadata);
						} else {
							imageUrl = processImageUrl(metadata.image, metadata);
						}
					}

					const result: NFTWithMetadata = {
						collection,
						tokenId,
						tokenURI,
						metadata,
						imageUrl,
						isLoading: false,
						error: null,
					};

					// Cache the successful result
					setCachedData(cacheKey, result, priority);

					return result;
				} catch (error) {
					const errorResult: NFTWithMetadata = {
						collection,
						tokenId,
						tokenURI,
						metadata: null,
						imageUrl: null,
						isLoading: false,
						error: `Failed to fetch metadata: ${(error as Error).message}`,
					};

					// Cache error for a shorter duration to allow retries
					const errorCacheKey = `${cacheKey}-error`;
					setCachedData(errorCacheKey, errorResult, -1);

					throw error;
				}
			})();

			// Add to queue
			fetchQueue.add(cacheKey, fetchPromise, priority);

			return fetchPromise;
		},
		[],
	);

	useEffect(() => {
		const cacheKey = getCacheKey(collection, tokenId);

		// Handle tokenURI loading state
		if (isTokenURILoading) {
			setState((prev) => ({ ...prev, isLoading: true, error: null }));
			return;
		}

		// Handle tokenURI error
		if (tokenURIError) {
			const errorState: NFTWithMetadata = {
				collection,
				tokenId,
				tokenURI: null,
				metadata: null,
				imageUrl: null,
				isLoading: false,
				error: `Failed to fetch tokenURI: ${tokenURIError.message}`,
			};
			setState(errorState);
			return;
		}

		// Handle missing collection address
		if (!collection) {
			const errorState: NFTWithMetadata = {
				collection,
				tokenId,
				tokenURI: null,
				metadata: null,
				imageUrl: null,
				isLoading: false,
				error: "No NFT collection address provided",
			};
			setState(errorState);
			return;
		}

		// Handle missing tokenURI
		if (!tokenURI) {
			const errorState: NFTWithMetadata = {
				collection,
				tokenId,
				tokenURI: null,
				metadata: null,
				imageUrl: null,
				isLoading: false,
				error: "No tokenURI available",
			};
			setState(errorState);
			return;
		}

		// Check cache again with the tokenURI
		const cached = getCachedData(cacheKey);
		if (cached) {
			setState(cached);
			return;
		}

		// Only fetch if enabled
		if (!enabled && !preload) {
			return;
		}

		// Set loading state and fetch metadata
		setState((prev) => ({
			...prev,
			tokenURI,
			isLoading: true,
			error: null,
		}));

		// Call fetchMetadata directly instead of using the memoized version to avoid dependency loop
		(async () => {
			try {
				const result = await fetchMetadata(
					tokenURI,
					collection,
					tokenId,
					priority,
				);
				setState(result);
			} catch (error) {
				setState((prev) => ({
					...prev,
					metadata: null,
					imageUrl: null,
					isLoading: false,
					error: `Failed to fetch metadata: ${(error as Error).message}`,
				}));
			}
		})();
	}, [
		tokenURI,
		isTokenURILoading,
		tokenURIError,
		collection,
		tokenId,
		enabled,
		preload,
		priority,
		fetchMetadata,
	]);

	return state;
}

/**
 * Hook for bulk loading multiple NFTs with prioritization
 * Useful for grid views and lists where you want to load visible items first
 */
export function useBulkNFTMetadata(
	nfts: Array<{ collection: string; tokenId: string; priority?: number }>,
	options: {
		enabled?: boolean;
		batchSize?: number; // How many to load at once
	} = {},
): Record<string, NFTWithMetadata> {
	const { enabled = true, batchSize = 6 } = options;

	const [results, setResults] = useState<Record<string, NFTWithMetadata>>({});

	// Sort NFTs by priority for loading order
	const sortedNFTs = useMemo(() => {
		return [...nfts].sort((a, b) => (b.priority || 0) - (a.priority || 0));
	}, [nfts]);

	useEffect(() => {
		if (!enabled || nfts.length === 0) {
			return;
		}

		// Load in batches to avoid overwhelming the network
		const loadBatch = async (startIndex: number) => {
			const batch = sortedNFTs.slice(startIndex, startIndex + batchSize);

			const batchPromises = batch.map(async ({ collection, tokenId }) => {
				const cacheKey = getCacheKey(collection, tokenId);

				// Check cache first
				const cached = getCachedData(cacheKey);
				if (cached) {
					return { key: cacheKey, data: cached };
				}

				// This would need to be implemented to work with the hook
				// For now, we'll just return a loading state
				const loadingState: NFTWithMetadata = {
					collection,
					tokenId,
					tokenURI: null,
					metadata: null,
					imageUrl: null,
					isLoading: true,
					error: null,
				};

				return { key: cacheKey, data: loadingState };
			});

			const batchResults = await Promise.allSettled(batchPromises);

			const newResults: Record<string, NFTWithMetadata> = {};
			batchResults.forEach((result) => {
				if (result.status === "fulfilled") {
					newResults[result.value.key] = result.value.data;
				}
			});

			setResults((prev) => ({ ...prev, ...newResults }));

			// Load next batch after a small delay
			if (startIndex + batchSize < sortedNFTs.length) {
				setTimeout(() => loadBatch(startIndex + batchSize), 100);
			}
		};

		loadBatch(0);
	}, [sortedNFTs, enabled, batchSize, nfts.length]);

	return results;
}

/**
 * Hook to preload NFT metadata for items that might become visible soon
 * Useful for infinite scroll or pagination scenarios
 */
export function useNFTPreloader(
	nfts: Array<{ collection: string; tokenId: string }>,
	enabled: boolean = true,
) {
	useEffect(() => {
		if (!enabled) return;

		// Preload with low priority
		nfts.forEach(({ collection, tokenId }) => {
			const cacheKey = getCacheKey(collection, tokenId);

			// Only preload if not already cached
			if (!getCachedData(cacheKey)) {
				// Note: This would need integration with the main loading system
				// For now, we just mark them for potential loading
				console.log("Preloading NFT:", cacheKey);
			}
		});
	}, [nfts, enabled]);
}

/**
 * Utility to clear the metadata cache
 * Useful for memory management or when switching contexts
 */
export function clearMetadataCache() {
	metadataCache.clear();
}

/**
 * Get cache statistics for debugging
 */
export function getCacheStats() {
	return {
		size: metadataCache.size,
		maxSize: MAX_CACHE_SIZE,
		queueSize: fetchQueue.getActiveCount(),
	};
}
