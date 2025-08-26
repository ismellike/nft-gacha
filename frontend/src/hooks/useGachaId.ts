import { useClientSearchParam } from "./useClientSearchParams";
import { DEFAULT_GACHA_ID } from "../lib/gacha-config/contracts";

/**
 * Hook to get the current gacha ID from URL query parameters
 * Falls back to default gacha if not specified
 */
export function useGachaId(): string {
	const gachaId = useClientSearchParam("id") || DEFAULT_GACHA_ID;

	return gachaId;
}
