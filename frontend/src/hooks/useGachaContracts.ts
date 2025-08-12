import { useMemo } from "react";
import { getGachaContracts } from "../lib/gacha-config/contracts";

/**
 * Hook to get contract addresses for a specific gacha
 * @param gachaId - The gacha ID to get contracts for (required)
 */
export function useGachaContracts(gachaId: string) {
	const contracts = useMemo(() => {
		if (!gachaId) {
			return {
				gacha: undefined,
				treasury: undefined,
				appraisal: undefined,
				rewardsManager: undefined,
				trackers: undefined,
			};
		}

		try {
			return getGachaContracts(gachaId);
		} catch (error) {
			console.error(`Failed to get contracts for gacha ${gachaId}:`, error);
			// Return undefined contracts for non-existent gachas
			return {
				gacha: undefined,
				treasury: undefined,
				appraisal: undefined,
				rewardsManager: undefined,
				trackers: undefined,
			};
		}
	}, [gachaId]);

	return contracts;
}
