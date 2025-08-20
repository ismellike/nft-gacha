"use client";

import { useState, useEffect } from "react";
import { useReadErc721TokenUri } from "../generated";
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
// Removed getAllActiveGachas import - collections are now dynamic

export interface NFTWithMetadata {
	collection: string;
	tokenId: string;
	tokenURI: string | null;
	metadata: NFTMetadata | null;
	imageUrl: string | null;
	isLoading: boolean;
	error: string | null;
}

/**
 * Hook to fetch NFT metadata including image URL from tokenURI
 * Specifically designed for gacha spin results and NFT displays
 */
export function useNFTWithMetadata(
	collection: string,
	tokenId: string,
): NFTWithMetadata {
	const [state, setState] = useState<
		Omit<NFTWithMetadata, "collection" | "tokenId">
	>({
		tokenURI: null,
		metadata: null,
		imageUrl: null,
		isLoading: false,
		error: null,
	});

	// The 'collection' parameter is the actual NFT collection address
	// We no longer use hardcoded nftCollectionAddress from gacha config
	// Collections are dynamically fetched from treasury whitelist
	const nftCollectionAddress = collection;

	// Get tokenURI from the actual NFT collection contract
	const {
		data: tokenURI,
		isLoading: isTokenURILoading,
		error: tokenURIError,
	} = useReadErc721TokenUri({
		address: nftCollectionAddress as `0x${string}`,
		args: tokenId ? [BigInt(tokenId)] : undefined,
		query: {
			enabled: !!nftCollectionAddress && !!tokenId,
			staleTime: 60000, // Cache for 1 minute
			retry: 2,
		},
	});

	useEffect(() => {
		// Handle tokenURI loading state
		if (isTokenURILoading) {
			setState((prev) => ({ ...prev, isLoading: true, error: null }));
			return;
		}

		// Handle tokenURI error
		if (tokenURIError) {
			setState((prev) => ({
				...prev,
				isLoading: false,
				error: `Failed to fetch tokenURI: ${tokenURIError.message}`,
			}));
			return;
		}

		// Handle missing NFT collection address
		if (!nftCollectionAddress) {
			setState((prev) => ({
				...prev,
				tokenURI: null,
				metadata: null,
				imageUrl: null,
				isLoading: false,
				error: "No NFT collection address configured",
			}));
			return;
		}

		// Handle missing tokenURI
		if (!tokenURI) {
			setState((prev) => ({
				...prev,
				tokenURI: null,
				metadata: null,
				imageUrl: null,
				isLoading: false,
				error: "No tokenURI available",
			}));
			return;
		}

		// Fetch metadata from tokenURI - optimize for Courtyard
		setState((prev) => ({ ...prev, tokenURI, isLoading: true, error: null }));

		// Check if this is a Courtyard NFT and use optimized fetching
		const isCourtyard = isCourtyardTokenURI(tokenURI);
		const fetchFunction = isCourtyard
			? fetchCourtyardMetadata
			: fetchNFTMetadata;

		fetchFunction(tokenURI)
			.then((metadata) => {
				let imageUrl: string | null = null;

				if (metadata) {
					// Use Courtyard-specific image processing if it's a Courtyard NFT
					if (isCourtyard) {
						imageUrl = processCourtyardImageUrl(metadata);
					} else {
						imageUrl = processImageUrl(metadata.image, metadata);
					}
				}

				setState((prev) => ({
					...prev,
					metadata,
					imageUrl,
					isLoading: false,
					error: null,
				}));
			})
			.catch((error) => {
				setState((prev) => ({
					...prev,
					metadata: null,
					imageUrl: null,
					isLoading: false,
					error: `Failed to fetch metadata: ${error.message}`,
				}));
			});
	}, [tokenURI, isTokenURILoading, tokenURIError, nftCollectionAddress]);

	return {
		collection,
		tokenId,
		...state,
	};
}

/**
 * Enhanced SpinResult interface that includes metadata
 */
export interface EnhancedSpinResult {
	rarity: string;
	collection: string;
	tokenId: string;
	metadata?: NFTMetadata | null;
	imageUrl?: string | null;
}

/**
 * Hook to enhance a spin result with metadata
 */
export function useEnhancedSpinResult(
	spinResult: { rarity: string; collection: string; tokenId: string } | null,
): EnhancedSpinResult | null {
	const nftData = useNFTWithMetadata(
		spinResult?.collection || "",
		spinResult?.tokenId || "",
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
