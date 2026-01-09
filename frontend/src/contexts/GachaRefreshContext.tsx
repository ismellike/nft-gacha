"use client";

import {
	createContext,
	useContext,
	useCallback,
	useRef,
	useState,
	type ReactNode,
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
	/**
	 * Current refresh version (increments on each refresh)
	 * Components can use this to force re-renders if needed
	 */
	refreshVersion: number;
}

const GachaRefreshContext = createContext<GachaRefreshContextValue | null>(
	null,
);

interface GachaRefreshProviderProps {
	children: ReactNode;
}

export function GachaRefreshProvider({ children }: GachaRefreshProviderProps) {
	const refetchFunctionsRef = useRef<Set<RefetchFunction>>(new Set());
	const [refreshVersion, setRefreshVersion] = useState(0);

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

		// Increment version to trigger re-renders
		setRefreshVersion((prev) => prev + 1);

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

	const value: GachaRefreshContextValue = {
		registerRefetch,
		triggerRefresh,
		refreshVersion,
	};

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
 * @returns The refresh version for tracking refresh cycles
 */
export function useGachaRefetch(refetchFn: RefetchFunction) {
	const { registerRefetch, refreshVersion } = useGachaRefresh();

	// Register refetch function
	useCallback(() => {
		const cleanup = registerRefetch(refetchFn);
		return cleanup;
	}, [refetchFn, registerRefetch]);

	return { refreshVersion };
}
