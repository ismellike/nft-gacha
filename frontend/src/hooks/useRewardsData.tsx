"use client";

import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useRef,
} from "react";
import { useAccount } from "wagmi";
import { useGachaContracts } from "./useGachaContracts";
import { useGachaId } from "./useGachaId";

// Registry for refetch callbacks from child components/hooks
type RefetchFunction = () => Promise<void> | void;

interface RefetchCallbacks {
	userProfile?: RefetchFunction;
	userGacha?: RefetchFunction;
	feeToken?: RefetchFunction;
	tokenDetails?: RefetchFunction;
	rarityRewards?: RefetchFunction;
	treasuryCards?: RefetchFunction;
	economyData?: RefetchFunction;
	cardGroupedVault?: RefetchFunction;
	buybackVault?: RefetchFunction;
	protocolTreasury?: RefetchFunction;
	[key: string]: RefetchFunction | undefined;
}

const RewardsRefetchContext = createContext<{
	registerRefetch: (key: string, refetchFn: RefetchFunction) => void;
	unregisterRefetch: (key: string) => void;
	triggerAllRefetches: () => Promise<void>;
} | null>(null);

export function RewardsRefetchProvider({ children }: { children: ReactNode }) {
	const refetchCallbacks = useRef<RefetchCallbacks>({});

	const registerRefetch = useCallback(
		(key: string, refetchFn: RefetchFunction) => {
			refetchCallbacks.current[key] = refetchFn;
		},
		[],
	);

	const unregisterRefetch = useCallback((key: string) => {
		delete refetchCallbacks.current[key];
	}, []);

	const triggerAllRefetches = useCallback(async () => {
		const promises = Object.values(refetchCallbacks.current).map(
			async (refetchFn, index) => {
				if (refetchFn) {
					try {
						const result = refetchFn();
						// Handle both Promise and void return types
						if (result && typeof result.then === "function") {
							await result;
						}
					} catch (error) {
						console.warn(`❌ Refetch callback ${index} failed:`, error);
					}
				}
			},
		);

		await Promise.allSettled(promises);
	}, []);

	return (
		<RewardsRefetchContext.Provider
			value={{ registerRefetch, unregisterRefetch, triggerAllRefetches }}
		>
			{children}
		</RewardsRefetchContext.Provider>
	);
}

export function useRewardsRefetchContext() {
	const context = useContext(RewardsRefetchContext);
	if (!context) {
		throw new Error(
			"useRewardsRefetchContext must be used within RewardsRefetchProvider",
		);
	}
	return context;
}

export interface RewardsData {
	// Refetch functions for rewards data
	refetchAllRewardsData: () => Promise<void>;
	// Helper to register individual refetch functions
	registerRefetch: (key: string, refetchFn: RefetchFunction) => void;
	unregisterRefetch: (key: string) => void;
}

export function useRewardsData(): RewardsData {
	const { address: userAddress } = useAccount();
	const gachaId = useGachaId();
	const contracts = useGachaContracts(gachaId);
	const {
		registerRefetch: register,
		unregisterRefetch: unregister,
		triggerAllRefetches,
	} = useRewardsRefetchContext();

	// Register refetch functions from this hook
	const registerRefetch = useCallback(
		(key: string, refetchFn: RefetchFunction) => {
			register(key, refetchFn);
		},
		[register],
	);

	const unregisterRefetch = useCallback(
		(key: string) => {
			unregister(key);
		},
		[unregister],
	);

	// Main refetch function that triggers all registered callbacks
	const refetchAllRewardsData = useCallback(async (): Promise<void> => {
		if (!userAddress || !contracts.trackers) {
			return;
		}

		// Trigger all registered refetch callbacks
		await triggerAllRefetches();
	}, [userAddress, contracts.trackers, triggerAllRefetches]);

	return {
		refetchAllRewardsData,
		registerRefetch,
		unregisterRefetch,
	};
}

// Helper hook for child components to register their refetch functions
export function useRegisterRewardsRefetch(
	key: string,
	refetchFn: RefetchFunction,
) {
	const { registerRefetch, unregisterRefetch } = useRewardsRefetchContext();

	// Store latest refetchFn in ref
	const latestRefetchFn = useRef(refetchFn);
	latestRefetchFn.current = refetchFn;

	// Create stable callback wrapper
	const stableRefetchFn = useCallback(() => {
		latestRefetchFn.current?.();
	}, []);

	// Register refetch function when component mounts or dependencies change
	useEffect(() => {
		registerRefetch(key, stableRefetchFn);
		return () => unregisterRefetch(key);
	}, [key, registerRefetch, unregisterRefetch, stableRefetchFn]);

	// Return cleanup function for manual unregistration
	return useCallback(() => {
		unregisterRefetch(key);
	}, [key, unregisterRefetch]);
}
