import { useAccount } from "wagmi";
import { useCallback } from "react";
import { useGachaContracts } from "./useGachaContracts";
import { useGachaId } from "./useGachaId";

export interface RewardsData {
	// Refetch functions for rewards data
	refetchAllRewardsData: () => Promise<void>;
}

export function useRewardsData(): RewardsData {
	const { address: userAddress } = useAccount();
	const gachaId = useGachaId();
	const contracts = useGachaContracts(gachaId);

	// Simplified consolidated refetch function
	const refetchAllRewardsData = useCallback(async (): Promise<void> => {
		if (!userAddress || !contracts.trackers) {
			console.log(
				"Skipping rewards refetch - missing user address or contracts",
			);
			return;
		}

		console.log("🔄 [useRewardsData] Refetching all rewards data");

		// This is a simplified version - the actual data fetching
		// will be handled by individual components
		// This hook primarily coordinates the refetch logic
	}, [userAddress, contracts.trackers]);

	return {
		refetchAllRewardsData,
	};
}
