"use client";

import type { CourtyardMetadata } from "./types";

/**
 * Detects if a tokenURI is from Courtyard
 * Simplified to just check for the official API domain
 */
export function isCourtyardTokenURI(tokenURI: string): boolean {
	if (!tokenURI) return false;
	return tokenURI.includes("api.courtyard.io");
}

/**
 * Fetches Courtyard metadata directly from tokenURI with enhanced error handling
 * and retry logic for better reliability
 */
export async function fetchCourtyardMetadata(
	tokenURI: string,
): Promise<CourtyardMetadata | null> {
	if (!tokenURI || !isCourtyardTokenURI(tokenURI)) {
		console.warn("Invalid Courtyard tokenURI:", tokenURI);
		return null;
	}

	const maxRetries = 3;
	let lastError: Error | undefined;

	for (let attempt = 1; attempt <= maxRetries; attempt++) {
		try {
			const timeoutMs = 10000 + attempt * 3000; // Increase timeout with each retry
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

			// Try direct fetch first with safe headers, then proxy as fallback
			const doFetch = async (url: string) =>
				fetch(url, {
					method: "GET",
					headers: { Accept: "application/json" },
					signal: controller.signal,
					cache: "default",
				});

			const response = await doFetch(tokenURI);
			// No proxy fallback for static export - must succeed directly

			clearTimeout(timeoutId);

			if (!response.ok) {
				if (response.status === 404) {
					console.error("Courtyard metadata not found (404):", tokenURI);
					throw new Error(`Courtyard metadata not found: ${tokenURI}`);
				}
				if (response.status === 403) {
					console.error("Courtyard access forbidden (403):", tokenURI);
					throw new Error("Access to Courtyard metadata forbidden");
				}
				if (response.status >= 500) {
					// Server error - retry
					throw new Error(
						`Courtyard server error ${response.status}: ${response.statusText}`,
					);
				}
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			const contentType = response.headers.get("content-type");
			if (!contentType?.includes("application/json")) {
				throw new Error(
					`Expected JSON response from Courtyard, got ${contentType}`,
				);
			}

			const text = await response.text();
			if (!text.trim()) {
				throw new Error("Empty response from Courtyard API");
			}

			const metadata = JSON.parse(text) as CourtyardMetadata;

			// Validate that we got valid metadata
			if (typeof metadata !== "object" || metadata === null) {
				throw new Error("Invalid Courtyard metadata format");
			}

			return metadata;
		} catch (error) {
			lastError = error as Error;

			// Don't retry for certain errors
			if (error instanceof Error) {
				if (error.name === "AbortError") {
					console.error(
						`Courtyard request timeout after ${10000 + attempt * 3000}ms`,
					);
					throw new Error("Courtyard request timeout");
				}

				if (error.message.includes("404") || error.message.includes("403")) {
					throw error; // Don't retry for not found or forbidden
				}
			}

			console.warn(`Courtyard fetch attempt ${attempt} failed:`, error);

			// Wait before retry (exponential backoff)
			if (attempt < maxRetries) {
				const delay = Math.min(1000 * 2 ** attempt, 5000);
				await new Promise((resolve) => setTimeout(resolve, delay));
			}
		}
	}

	console.error(
		"Failed to fetch Courtyard metadata after all retries:",
		lastError,
	);
	throw lastError || new Error("Failed to fetch Courtyard metadata");
}
