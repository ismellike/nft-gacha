"use client";

import { logger } from "../lib/logger";
import { DEFAULT_GACHA_ID } from "../lib/gacha-config/contracts";
import { useClientSearchParam } from "./useClientSearchParams";

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
		logger.general.warn("No valid gacha ID found, using default");
		return DEFAULT_GACHA_ID;
	}

	return gachaId;
}
