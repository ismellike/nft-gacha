import { useSearchParams } from "next/navigation";
import { DEFAULT_GACHA_ID } from "../lib/gacha-config/contracts";

/**
 * Hook to get the current gacha ID from URL query parameters
 * Falls back to default gacha if not specified
 */
export function useGachaId(): string {
	const searchParams = useSearchParams();
	const gachaId = searchParams.get("id") || DEFAULT_GACHA_ID;

	return gachaId;
}
