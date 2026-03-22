/**
 * Single, comprehensive NFT metadata hook
 * Handles tokenURI fetching, metadata retrieval, and image processing with caching
 */

"use client";

import { useEffect, useState } from "react";
import { useReadBaseErc721TokenUri } from "../generated";
import { CACHE_DURATIONS } from "../lib/constants";
import {
	fetchCourtyardMetadata,
	isCourtyardTokenURI,
	processCourtyardImageUrl,
} from "../lib/courtyard-utils";
import { logger } from "../lib/logger";
import { fetchNFTMetadata, processImageUrl } from "../lib/nft-metadata";
import type { NFTMetadata, NFTWithMetadata } from "../types/hooks";

interface ImportedMetadata {
	name?: string;
	description?: string;
	image?: string;
	external_url?: string;
	attributes?: readonly unknown[];
	[key: string]: unknown;
}

// Global cache shared across all hook instances (LRU-capped at 200 entries)
const MAX_CACHE_SIZE = 200;

const METADATA_CACHE = new Map<
	string,
	{
		data: NFTWithMetadata;
		timestamp: number;
	}
>();

/** Set with LRU eviction: re-inserts on access to keep recently-used entries last. */
const cacheSet = (
	key: string,
	value: { data: NFTWithMetadata; timestamp: number },
) => {
	// Delete first to move existing key to end (Map preserves insertion order)
	METADATA_CACHE.delete(key);
	METADATA_CACHE.set(key, value);

	// Evict oldest entries if over capacity
	if (METADATA_CACHE.size > MAX_CACHE_SIZE) {
		const firstKey = METADATA_CACHE.keys().next().value;
		if (firstKey !== undefined) {
			METADATA_CACHE.delete(firstKey);
		}
	}
};

const CACHE_KEY = (collection: string, tokenId: string) =>
	`${collection}-${tokenId}`;

const isCacheValid = (timestamp: number) =>
	Date.now() - timestamp < CACHE_DURATIONS.MEDIUM;

const cleanupExpiredCache = () => {
	for (const [key, entry] of METADATA_CACHE.entries()) {
		if (!isCacheValid(entry.timestamp)) {
			METADATA_CACHE.delete(key);
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

				// Extract Courtyard-specific fields from attributes array
				// This ensures fields are available as top-level properties for the reveal logic
				const extractAttribute = (traitType: string): string | undefined => {
					const attr = importedMetadata.attributes?.find(
						(a) => a.trait_type?.toLowerCase() === traitType.toLowerCase(),
					);
					return attr?.value?.toString();
				};

				// Extract grading information
				const grader = extractAttribute("Grader");
				if (grader) {
					(baseMetadata as { grading_company?: string }).grading_company =
						grader;
				}

				const grade = extractAttribute("Grade");
				if (grade) {
					(baseMetadata as { grade?: string | number }).grade = grade;
				}

				// Extract card information
				const cardNumber = extractAttribute("Card Number");
				if (cardNumber) {
					(baseMetadata as { card_number?: string }).card_number = cardNumber;
				}

				const set = extractAttribute("Set");
				if (set) {
					(baseMetadata as { set_number?: string }).set_number = set;
				}

				const year = extractAttribute("Year");
				if (year) {
					(baseMetadata as { year?: string | number }).year = year;
				}

				const certNumber = extractAttribute("Serial");
				if (certNumber) {
					(baseMetadata as { cert_number?: string }).cert_number = certNumber;
				}

				const title = extractAttribute("Title/Subject");
				if (title) {
					(baseMetadata as { title?: string }).title = title;
				}
			}

			// Add optional extended fields from direct properties (if not already extracted from attributes)
			const extendedFields = [
				"proof_of_integrity",
				"grading_company",
				"grade",
				"cert_number",
				"set_number",
				"card_number",
				"artist",
				"year",
				"title", // Title/Subject for cards
			] as const;

			extendedFields.forEach((field) => {
				if (
					importedMetadata[field as keyof ImportedMetadata] &&
					!(baseMetadata as Record<string, unknown>)[field]
				) {
					(baseMetadata as Record<string, unknown>)[field] =
						importedMetadata[field as keyof ImportedMetadata];
				}
			});

			// Preserve item_info for Courtyard slab back images
			if (importedMetadata.item_info) {
				(baseMetadata as Record<string, unknown>).item_info =
					importedMetadata.item_info;
			}

			metadata = baseMetadata;

			imageUrl = isCourtyard
				? processCourtyardImageUrl(importedMetadata)
				: processImageUrl(importedMetadata.image, importedMetadata);
		}

		return { metadata, imageUrl };
	} catch (error) {
		logger.nftMetadata.warn(
			`Failed to fetch metadata from ${tokenURI}:`,
			error,
		);
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
			isLoading: enabled !== false,
			error: null,
		};
	});

	// Get tokenURI using wagmi hook (more efficient than manual calls)
	const {
		data: tokenURI,
		isLoading: isTokenURILoading,
		error: tokenURIError,
	} = useReadBaseErc721TokenUri({
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
	}, [
		tokenURI,
		isTokenURILoading,
		tokenURIError,
		enabled,
		collection,
		tokenId,
	]);

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
				cacheSet(cacheKey, {
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
		tokenURI: nftData.tokenURI,
		isLoading: nftData.isLoading,
	};
}
