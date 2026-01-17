"use client";

export interface NFTMetadata {
	name?: string;
	description?: string;
	image?: string;
	external_url?: string;
	attributes?: Array<{
		trait_type: string;
		value: string | number;
	}>;
	[key: string]: unknown;
}

export interface NFTMetadataResult {
	metadata: NFTMetadata | null;
	imageUrl: string | null;
	isLoading: boolean;
	error: string | null;
}

/**
 * Cache for storing fetched metadata to avoid redundant API calls
 */
const metadataCache = new Map<
	string,
	{ data: NFTMetadata; timestamp: number }
>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Fetches and parses NFT metadata from a tokenURI with retry logic
 * Handles Courtyard API URLs, IPFS URLs, and other HTTP URLs
 */
export async function fetchNFTMetadata(
	tokenURI: string,
): Promise<NFTMetadata | null> {
	if (!tokenURI) {
		return null;
	}

	// Check cache first
	const cached = metadataCache.get(tokenURI);
	if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
		return cached.data;
	}

	try {
		const url = tokenURI; // try direct first

		// Handle IPFS URLs - try multiple gateways for better reliability
		if (tokenURI.startsWith("ipfs://")) {
			const hash = tokenURI.replace("ipfs://", "");
			const gateways = [
				`https://ipfs.io/ipfs/${hash}`,
				`https://cloudflare-ipfs.com/ipfs/${hash}`,
				`https://gateway.pinata.cloud/ipfs/${hash}`,
			];

			// Try each gateway until one works
			for (const gateway of gateways) {
				try {
					const metadata = await fetchWithRetry(gateway);
					if (metadata) {
						metadataCache.set(tokenURI, {
							data: metadata,
							timestamp: Date.now(),
						});
						return metadata;
					}
				} catch (error) {
					logger.nftMetadata.warn(`IPFS gateway ${gateway} failed:`, error);
				}
			}
			throw new Error("All IPFS gateways failed");
		}

		// Handle data URLs (base64 encoded JSON)
		if (tokenURI.startsWith("data:application/json;base64,")) {
			const base64Data = tokenURI.split(",")[1];
			const jsonData = atob(base64Data);
			const metadata = JSON.parse(jsonData) as NFTMetadata;

			// Cache the result
			metadataCache.set(tokenURI, { data: metadata, timestamp: Date.now() });
			return metadata;
		}

		// Handle data URLs (plain JSON)
		if (tokenURI.startsWith("data:application/json,")) {
			const jsonData = decodeURIComponent(tokenURI.split(",")[1]);
			const metadata = JSON.parse(jsonData) as NFTMetadata;

			// Cache the result
			metadataCache.set(tokenURI, { data: metadata, timestamp: Date.now() });
			return metadata;
		}

		// Fetch from HTTP(S) endpoint (including Courtyard API)
		// For static export, no proxy fallback available
		const metadata = await fetchWithRetry(url);
		if (metadata) {
			metadataCache.set(tokenURI, { data: metadata, timestamp: Date.now() });

			// Log successful fetch for debugging
			logger.nftMetadata.debug("Successfully fetched metadata:", {
				tokenURI: url,
				name: metadata.name,
				hasImage: !!metadata.image,
				imageUrl: metadata.image,
				isCourtyard: url.includes("api.courtyard.io"),
			});
		}

		return metadata;
	} catch (error) {
		logger.nftMetadata.error("Failed to fetch NFT metadata from", tokenURI, error);
		throw error;
	}
}

/**
 * Helper function to fetch with retry logic and proper error handling
 */
async function fetchWithRetry(
	url: string,
	maxRetries = 3,
): Promise<NFTMetadata | null> {
	let lastError: unknown;

	for (let attempt = 1; attempt <= maxRetries; attempt++) {
		try {
			const timeoutMs = 8000 + attempt * 2000; // Increase timeout with each retry

			const response = await fetch(url, {
				method: "GET",
				// Use only safe headers to avoid triggering CORS preflight
				headers: {
					Accept: "application/json",
				},
				signal: AbortSignal.timeout(timeoutMs),
			});

			if (!response.ok) {
				if (response.status === 429) {
					// Rate limited - wait before retry
					const delay = Math.min(1000 * 2 ** attempt, 5000);
					await new Promise((resolve) => setTimeout(resolve, delay));
					throw new Error(`Rate limited (${response.status})`);
				}

				if (response.status >= 400 && response.status < 500) {
					// Client error - don't retry
					throw new Error(`HTTP ${response.status}: ${response.statusText}`);
				}

				// Server error - retry
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			const contentType = response.headers.get("content-type");
			if (!contentType?.includes("application/json")) {
				throw new Error(`Expected JSON response, got ${contentType}`);
			}

			const text = await response.text();
			if (!text.trim()) {
				throw new Error("Empty response body");
			}

			const metadata = JSON.parse(text) as NFTMetadata;

			// Basic validation
			if (typeof metadata !== "object" || metadata === null) {
				throw new Error("Invalid metadata format");
			}

			return metadata;
		} catch (error) {
			lastError = error;

			// Don't retry for certain errors
			const errorObj = error as Error;
			if (errorObj.name === "AbortError") {
				throw new Error(`Request timeout after ${8000 + attempt * 2000}ms`);
			}

			if (
				errorObj.message.includes("HTTP 4") &&
				!errorObj.message.includes("429")
			) {
				throw errorObj; // Don't retry client errors except rate limiting
			}

			// Wait before retry (exponential backoff)
			if (attempt < maxRetries) {
				const delay = Math.min(1000 * 2 ** attempt, 3000);
				await new Promise((resolve) => setTimeout(resolve, delay));
			}
		}
	}

	if (lastError instanceof Error) throw lastError;
	throw new Error(String(lastError ?? "Unknown error"));
}

/**
 * Processes image URL from metadata, handling IPFS, Courtyard, and other formats
 * Prioritizes metadata.image field for Courtyard NFTs
 */
export function processImageUrl(
	imageUrl: string | undefined,
	metadata?: NFTMetadata,
): string | null {
	// Enhanced debug logging for Courtyard NFTs
	const isCourtyard =
		metadata && JSON.stringify(metadata).includes("courtyard");

	if (isCourtyard) {
		logger.nftMetadata.debug("Processing Courtyard NFT image URL:", {
			providedImageUrl: imageUrl,
			metadataImage: metadata?.image,
			metadataKeys: metadata ? Object.keys(metadata) : [],
			hasAttributes: !!metadata?.attributes?.length,
		});
	}

	// If we have a direct image URL, process it immediately (this is the most reliable)
	if (imageUrl) {
		// Handle IPFS URLs
		if (imageUrl.startsWith("ipfs://")) {
			const processedUrl = imageUrl.replace("ipfs://", "https://ipfs.io/ipfs/");
			logger.nftMetadata.debug(`Processed IPFS URL: ${imageUrl} -> ${processedUrl}`);
			return processedUrl;
		}

		// Return HTTP(S) URLs as-is (including Courtyard images)
		if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
			logger.nftMetadata.debug("Using direct HTTP(S) image URL:", imageUrl);
			return imageUrl;
		}

		// Handle relative URLs by assuming they're relative to IPFS
		if (imageUrl.startsWith("/")) {
			const processedUrl = `https://ipfs.io/ipfs${imageUrl}`;
			logger.nftMetadata.debug(`Processed relative URL: ${imageUrl} -> ${processedUrl}`);
			return processedUrl;
		}

		// Return as-is for other formats
		logger.nftMetadata.debug("Using image URL as-is:", imageUrl);
		return imageUrl;
	}

	// If no direct imageUrl provided, try to extract from metadata
	if (metadata) {
		logger.nftMetadata.debug(
			"No direct imageUrl provided, searching metadata for image sources...",
		);

		// Check attributes for image URLs
		if (metadata.attributes) {
			for (const attr of metadata.attributes) {
				if (
					attr.trait_type?.toLowerCase().includes("image") &&
					typeof attr.value === "string" &&
					(attr.value.startsWith("http://") ||
						attr.value.startsWith("https://"))
				) {
					logger.nftMetadata.debug("Found image URL in attributes:", attr.value);
					return attr.value;
				}
			}
		}

		// Check external_url as fallback if it looks like an image
		if (
			metadata.external_url &&
			(metadata.external_url.includes(".jpg") ||
				metadata.external_url.includes(".jpeg") ||
				metadata.external_url.includes(".png") ||
				metadata.external_url.includes(".gif") ||
				metadata.external_url.includes(".webp"))
		) {
			logger.nftMetadata.debug(
				"Using external_url as image fallback:",
				metadata.external_url,
			);
			return metadata.external_url;
		}

		if (isCourtyard) {
			logger.nftMetadata.warn("No valid image URL found in Courtyard metadata:", {
				metadataKeys: Object.keys(metadata),
				hasImage: !!metadata.image,
				hasExternalUrl: !!metadata.external_url,
				attributeCount: metadata.attributes?.length || 0,
			});
		}
	}

	logger.nftMetadata.debug("No image URL found in provided parameters or metadata");
	return null;
}

/**
 * React hook for fetching NFT metadata with loading and error states
 */
export function useNFTMetadata(
	tokenURI: string | undefined,
): NFTMetadataResult {
	const [state, setState] = React.useState<NFTMetadataResult>({
		metadata: null,
		imageUrl: null,
		isLoading: false,
		error: null,
	});

	React.useEffect(() => {
		if (!tokenURI) {
			setState({
				metadata: null,
				imageUrl: null,
				isLoading: false,
				error: null,
			});
			return;
		}

		setState((prev) => ({ ...prev, isLoading: true, error: null }));

		fetchNFTMetadata(tokenURI)
			.then((metadata) => {
				const imageUrl = metadata
					? processImageUrl(metadata.image, metadata)
					: null;
				setState({
					metadata,
					imageUrl,
					isLoading: false,
					error: null,
				});
			})
			.catch((error) => {
				setState({
					metadata: null,
					imageUrl: null,
					isLoading: false,
					error: error.message || "Failed to fetch metadata",
				});
			});
	}, [tokenURI]);

	return state;
}

// Import React for the hook
import React from "react";
import { logger } from "./logger";
