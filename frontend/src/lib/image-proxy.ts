"use client";

/**
 * Image proxy utilities for handling CORS and other image loading issues
 * Particularly useful for Courtyard and other external NFT image services
 */

/**
 * Image proxy services that can be used as fallbacks
 * Ordered by reliability and performance
 */
const IMAGE_PROXY_SERVICES = [
	// Weserv.nl - reliable image processing and CORS proxy
	(url: string) =>
		`https://images.weserv.nl/?url=${encodeURIComponent(url)}&w=800&h=800&fit=inside&we`,
	// Fallback with smaller size for faster loading
	(url: string) =>
		`https://images.weserv.nl/?url=${encodeURIComponent(url)}&w=400&h=400&fit=inside&we`,
	// Direct CORS proxy (may be rate limited)
	(url: string) => `https://cors-anywhere.herokuapp.com/${url}`,
	// Add more proxy services as needed
];

/**
 * Courtyard-specific image URL processing
 * Handles known URL patterns and optimizations
 */
function processCourtyadImageUrl(originalUrl: string): string[] {
	const alternatives: string[] = [originalUrl];

	// Check if this is a Courtyard static image URL
	if (originalUrl.includes("static.courtyard.io")) {
		// Try different size variants if available
		const baseUrl = originalUrl.split("?")[0]; // Remove existing query params

		// Add different resolution variants
		alternatives.push(`${baseUrl}?w=800&h=800&fit=cover`);
		alternatives.push(`${baseUrl}?w=400&h=400&fit=cover`);

		// Try without any query parameters
		alternatives.push(baseUrl);

		// Try with cache busting
		alternatives.push(`${baseUrl}?v=${Date.now()}`);
	}

	return alternatives;
}

/**
 * Checks if an image URL is accessible without CORS issues
 * Uses multiple strategies to test image accessibility
 */
export async function testImageAccess(
	imageUrl: string,
	timeoutMs = 5000,
): Promise<boolean> {
	if (!imageUrl) return false;

	try {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

		// Strategy 1: Try HEAD request for quick CORS check
		try {
			const response = await fetch(imageUrl, {
				method: "HEAD",
				mode: "cors",
				signal: controller.signal,
				cache: "no-cache",
				headers: {
					Accept: "image/*",
				},
			});

			clearTimeout(timeoutId);
			if (response.ok) return true;
		} catch (headError) {
			console.warn("HEAD request failed, trying Image loading:", headError);
		}

		// Strategy 2: Try loading via Image element (bypasses some CORS restrictions)
		return new Promise<boolean>((resolve) => {
			const img = new Image();
			img.crossOrigin = "anonymous";

			const cleanup = () => {
				clearTimeout(timeoutId);
				img.onload = null;
				img.onerror = null;
			};

			img.onload = () => {
				cleanup();
				resolve(true);
			};

			img.onerror = () => {
				cleanup();
				resolve(false);
			};

			setTimeout(() => {
				cleanup();
				resolve(false);
			}, timeoutMs);

			img.src = imageUrl;
		});
	} catch (error) {
		console.warn("Image access test failed:", imageUrl, error);
		return false;
	}
}

/**
 * Gets alternative image URLs including proxy options
 * Handles Courtyard-specific optimizations
 */
export function getImageUrlAlternatives(originalUrl: string): string[] {
	if (!originalUrl) return [];

	let alternatives: string[] = [];

	// Add Courtyard-specific alternatives first
	if (originalUrl.includes("courtyard.io")) {
		alternatives = processCourtyadImageUrl(originalUrl);
	} else {
		alternatives = [originalUrl];
	}

	// Add proxy alternatives for each base URL
	const originalAlternatives = [...alternatives];
	for (const baseUrl of originalAlternatives) {
		for (const proxyFn of IMAGE_PROXY_SERVICES) {
			try {
				const proxyUrl = proxyFn(baseUrl);
				if (
					proxyUrl &&
					proxyUrl !== baseUrl &&
					!alternatives.includes(proxyUrl)
				) {
					alternatives.push(proxyUrl);
				}
			} catch (error) {
				console.warn("Failed to generate proxy URL:", error);
			}
		}
	}

	// Add cache busting version of original
	const separator = originalUrl.includes("?") ? "&" : "?";
	const cacheBustedUrl = `${originalUrl}${separator}_cb=${Date.now()}`;
	if (!alternatives.includes(cacheBustedUrl)) {
		alternatives.push(cacheBustedUrl);
	}

	// Remove duplicates while preserving order
	return Array.from(new Set(alternatives));
}

/**
 * Attempts to load an image with fallback options
 */
export async function loadImageWithFallbacks(
	originalUrl: string,
	onProgress?: (attempt: number, url: string) => void,
): Promise<string | null> {
	const alternatives = getImageUrlAlternatives(originalUrl);

	for (let i = 0; i < alternatives.length; i++) {
		const url = alternatives[i];

		try {
			onProgress?.(i + 1, url);

			// Test if the image can be loaded
			const isAccessible = await testImageAccess(url, 8000);
			if (isAccessible) {
				console.log(`Image loaded successfully on attempt ${i + 1}:`, url);
				return url;
			}
		} catch (error) {
			console.warn(`Image load attempt ${i + 1} failed:`, url, error);
		}
	}

	console.error("All image load attempts failed for:", originalUrl);
	return null;
}

/**
 * React hook for loading images with fallback handling
 */
export function useImageWithFallbacks(imageUrl: string | null | undefined) {
	const [state, setState] = React.useState<{
		finalUrl: string | null;
		isLoading: boolean;
		error: string | null;
		attempt: number;
	}>({
		finalUrl: null,
		isLoading: false,
		error: null,
		attempt: 0,
	});

	React.useEffect(() => {
		if (!imageUrl) {
			setState({
				finalUrl: null,
				isLoading: false,
				error: "No image URL provided",
				attempt: 0,
			});
			return;
		}

		setState((prev) => ({ ...prev, isLoading: true, error: null }));

		loadImageWithFallbacks(imageUrl, (attempt) => {
			setState((prev) => ({ ...prev, attempt }));
		})
			.then((finalUrl) => {
				setState({
					finalUrl,
					isLoading: false,
					error: finalUrl ? null : "All image load attempts failed",
					attempt: 0,
				});
			})
			.catch((error) => {
				setState({
					finalUrl: null,
					isLoading: false,
					error: error.message || "Failed to load image",
					attempt: 0,
				});
			});
	}, [imageUrl]);

	return state;
}

// Import React for the hook
import React from "react";
