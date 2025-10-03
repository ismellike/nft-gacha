import { useCallback, useSyncExternalStore } from "react";
import { useRouter, usePathname } from "next/navigation";

// Simplified store for search parameters - less complexity, better performance
class SearchParamsStore {
	private static instance: SearchParamsStore;
	private listeners = new Set<() => void>();
	private params: URLSearchParams;

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
		const newParams = new URLSearchParams(window.location.search);
		if (newParams.toString() !== this.params.toString()) {
			this.params = newParams;
			this.notifyListeners();
		}
	};

	private notifyListeners() {
		this.listeners.forEach((listener) => listener());
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
		return new URLSearchParams();
	}

	updateParams(
		updates: Record<string, string | null>,
		router: any,
		pathname: string,
	) {
		const newParams = new URLSearchParams(this.params);

		Object.entries(updates).forEach(([key, value]) => {
			if (value === null) {
				newParams.delete(key);
			} else {
				newParams.set(key, value);
			}
		});

		this.params = newParams;

		// Update URL without scroll
		router.push(`${pathname}?${newParams.toString()}`, { scroll: false });

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
export function useClientSearchParams(): URLSearchParams {
	return useSyncExternalStore(
		searchParamsStore.subscribe.bind(searchParamsStore),
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
