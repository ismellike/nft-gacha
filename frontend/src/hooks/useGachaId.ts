"use client";

import { useClientSearchParam } from "./useClientSearchParams";
import { DEFAULT_GACHA_ID } from "../lib/gacha-config/contracts";

/**
 * Hook to get the current gacha ID from URL query parameters
 * Falls back to default gacha if not specified
 * @returns Valid gacha ID string
 */
export function useGachaId(): string {
	const gachaIdParam = useClientSearchParam("id");
	const gachaId = gachaIdParam || DEFAULT_GACHA_ID;

	// Validate that we have a valid gacha ID
	if (!gachaId) {
		console.warn("No valid gacha ID found, using default");
		return DEFAULT_GACHA_ID;
	}

	return gachaId;
}
