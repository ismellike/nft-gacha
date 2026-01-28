"use client";

import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
} from "react";

/**
 * GachaRefreshContext provides a centralized mechanism for refetching data
 * across all gacha-related components after mutations (spins, deposits, etc.)
 *
 * This follows React Query best practices for invalidating data after mutations.
 */

type RefetchFunction = () => void | Promise<void>;

interface GachaRefreshContextValue {
	/**
	 * Register a refetch function to be called when data needs refreshing
	 * Returns a cleanup function to unregister
	 */
	registerRefetch: (refetchFn: RefetchFunction) => () => void;
	/**
	 * Trigger all registered refetch functions
	 */
	triggerRefresh: () => Promise<void>;
}

const GachaRefreshContext = createContext<GachaRefreshContextValue | null>(
	null,
);

interface GachaRefreshProviderProps {
	children: ReactNode;
}

export function GachaRefreshProvider({ children }: GachaRefreshProviderProps) {
	const refetchFunctionsRef = useRef<Set<RefetchFunction>>(new Set());

	const registerRefetch = useCallback((refetchFn: RefetchFunction) => {
		refetchFunctionsRef.current.add(refetchFn);

		// Return cleanup function
		return () => {
			refetchFunctionsRef.current.delete(refetchFn);
		};
	}, []);

	const triggerRefresh = useCallback(async () => {
		console.log(
			`🔄 [GachaRefresh] Triggering refresh for ${refetchFunctionsRef.current.size} registered functions`,
		);

		// Execute all registered refetch functions
		const refetchPromises = Array.from(refetchFunctionsRef.current).map(
			async (fn) => {
				try {
					await fn();
				} catch (error) {
					console.error("Error in refetch function:", error);
				}
			},
		);

		await Promise.all(refetchPromises);
		console.log("✅ [GachaRefresh] All refetch functions completed");
	}, []);

	// Memoize context value to prevent unnecessary rerenders
	const value: GachaRefreshContextValue = useMemo(
		() => ({
			registerRefetch,
			triggerRefresh,
		}),
		[registerRefetch, triggerRefresh],
	);

	return (
		<GachaRefreshContext.Provider value={value}>
			{children}
		</GachaRefreshContext.Provider>
	);
}

/**
 * Hook to access the gacha refresh context
 * Throws an error if used outside of GachaRefreshProvider
 */
export function useGachaRefresh(): GachaRefreshContextValue {
	const context = useContext(GachaRefreshContext);
	if (!context) {
		throw new Error(
			"useGachaRefresh must be used within a GachaRefreshProvider",
		);
	}
	return context;
}

/**
 * Hook to automatically register a refetch function
 * Cleans up on unmount
 *
 * @param refetchFn - The refetch function to register
 */
export function useGachaRefetch(refetchFn: RefetchFunction) {
	const { registerRefetch } = useGachaRefresh();

	// Store latest refetchFn in ref to avoid dependency issues
	const latestRefetchFn = useRef(refetchFn);
	latestRefetchFn.current = refetchFn;

	// Register refetch function on mount, cleanup on unmount
	useEffect(() => {
		const cleanup = registerRefetch(latestRefetchFn.current);
		return cleanup;
	}, [registerRefetch]);
}
