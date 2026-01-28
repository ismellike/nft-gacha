"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useSyncExternalStore } from "react";

interface AppRouterInstance {
	push: (href: string, options?: { scroll?: boolean }) => void;
	replace: (href: string, options?: { scroll?: boolean }) => void;
	back: () => void;
	forward: () => void;
	refresh: () => void;
	prefetch: (href: string) => void;
}

// Simplified store for search parameters - less complexity, better performance
class SearchParamsStore {
	private static instance: SearchParamsStore;
	private listeners = new Set<() => void>();
	private params: URLSearchParams;
	private static serverSnapshot: URLSearchParams = new URLSearchParams();

	private constructor() {
		this.params = new URLSearchParams(
			typeof window !== "undefined" ? window.location.search : "",
		);

		// Only set up browser listeners on client
		if (typeof window !== "undefined") {
			window.addEventListener("popstate", this.handlePopState);
		}
	}

	static getInstance(): SearchParamsStore {
		if (!SearchParamsStore.instance) {
			SearchParamsStore.instance = new SearchParamsStore();
		}
		return SearchParamsStore.instance;
	}

	private handlePopState = () => {
		this.syncFromWindow();
	};

	syncFromWindow() {
		if (typeof window === "undefined") return;

		const newParams = new URLSearchParams(window.location.search);
		if (newParams.toString() !== this.params.toString()) {
			this.params = newParams;
			this.notifyListeners();
		}
	}

	private notifyListeners() {
		this.listeners.forEach((listener) => {
			listener();
		});
	}

	subscribe(listener: () => void) {
		this.listeners.add(listener);
		return () => {
			this.listeners.delete(listener);
		};
	}

	getSnapshot() {
		return this.params;
	}

	getServerSnapshot() {
		return SearchParamsStore.serverSnapshot;
	}

	updateParams(
		updates: Record<string, string | null>,
		router: AppRouterInstance,
		pathname: string,
	) {
		// Clone from current window location to avoid stale params
		const currentParams =
			typeof window !== "undefined"
				? new URLSearchParams(window.location.search)
				: new URLSearchParams();

		const newParams = new URLSearchParams(currentParams);

		Object.entries(updates).forEach(([key, value]) => {
			if (value === null) {
				newParams.delete(key);
			} else {
				newParams.set(key, value);
			}
		});

		this.params = newParams;

		// Update URL without scroll or history buildup
		const searchParamsString = newParams.toString();
		const url = searchParamsString
			? `${pathname}?${searchParamsString}`
			: pathname;
		router.replace(url, { scroll: false });

		this.notifyListeners();
	}

	// Cleanup method for testing
	destroy() {
		if (typeof window !== "undefined") {
			window.removeEventListener("popstate", this.handlePopState);
		}
		this.listeners.clear();
	}
}

// Get singleton instance
const searchParamsStore = SearchParamsStore.getInstance();

/**
 * Hook to get all URL search parameters efficiently
 */
function useClientSearchParams(): URLSearchParams {
	return useSyncExternalStore(
		(callback) => {
			const unsubscribe =
				searchParamsStore.subscribe.bind(searchParamsStore)(callback);
			// Sync with current URL on mount to handle cases where router.push/replace
			// was called outside useUpdateSearchParams
			searchParamsStore.syncFromWindow();
			return unsubscribe;
		},
		searchParamsStore.getSnapshot.bind(searchParamsStore),
		searchParamsStore.getServerSnapshot.bind(searchParamsStore),
	);
}

/**
 * Hook to get a specific search parameter
 * @param key - Parameter key to retrieve
 * @returns Parameter value or null if not found
 */
export function useClientSearchParam(key: string): string | null {
	const searchParams = useClientSearchParams();
	return searchParams.get(key);
}

/**
 * Hook to update URL search parameters
 * @returns Function to update search parameters
 */
export function useUpdateSearchParams() {
	const router = useRouter();
	const pathname = usePathname();

	return useCallback(
		(updates: Record<string, string | null>) => {
			searchParamsStore.updateParams(updates, router, pathname);
		},
		[router, pathname],
	);
}
