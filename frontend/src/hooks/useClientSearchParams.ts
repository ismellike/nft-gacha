import { useCallback, useSyncExternalStore } from "react";
import { useRouter, usePathname } from "next/navigation";

// Singleton store for search parameters
class SearchParamsStore {
	private listeners = new Set<() => void>();
	private searchParams = new URLSearchParams();

	constructor() {
		if (typeof window !== "undefined") {
			this.searchParams = new URLSearchParams(window.location.search);

			// Listen to browser navigation (back/forward)
			window.addEventListener("popstate", () => {
				this.updateFromLocation();
			});
		}
	}

	private updateFromLocation() {
		if (typeof window !== "undefined") {
			const newParams = new URLSearchParams(window.location.search);
			if (newParams.toString() !== this.searchParams.toString()) {
				this.searchParams = newParams;
				this.notifyListeners();
			}
		}
	}

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
		return this.searchParams;
	}

	getServerSnapshot() {
		return new URLSearchParams();
	}

	// Update params and sync with URL
	updateParams(
		updates: Record<string, string | null>,
		router: ReturnType<typeof useRouter>,
		pathname: string,
	) {
		const newParams = new URLSearchParams(this.searchParams);

		Object.entries(updates).forEach(([key, value]) => {
			if (value === null) {
				newParams.delete(key);
			} else {
				newParams.set(key, value);
			}
		});

		const newUrl = `${pathname}?${newParams.toString()}`;

		// Update internal state first
		this.searchParams = newParams;

		// Then update URL
		router.push(newUrl, { scroll: false });

		// Notify listeners
		this.notifyListeners();
	}
}

// Create singleton instance
const searchParamsStore = new SearchParamsStore();

/**
 * Hook to get all URL search parameters using React 18's useSyncExternalStore
 * More efficient than useState + useEffect pattern
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
 * Uses the same store for consistency
 */
export function useClientSearchParam(key: string): string | null {
	const searchParams = useClientSearchParams();
	return searchParams.get(key);
}

/**
 * Hook to update URL search parameters in SPA mode
 * Uses the centralized store to avoid race conditions
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
