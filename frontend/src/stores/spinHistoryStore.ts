import { create } from "zustand";
import type {
	SpinHistoryEntry,
	SpinHistoryFilters,
	SpinHistoryPagination,
	SpinHistoryStats,
} from "../types/spin-history";
import {
	Mutex,
	computeStats,
	filterEntries,
	filteredEntriesCache,
	invalidateCache,
	statsCache,
} from "./spinHistoryUtils";
import { getSpinKey } from "./storeUtils";

// Create a mutex instance for spin history updates
const appendMutex = new Mutex();

/**
 * Default pagination settings
 */
const DEFAULT_PAGINATION: SpinHistoryPagination = {
	page: 1,
	pageSize: 20,
	totalItems: 0,
	hasMore: true,
};

/**
 * Default filters
 */
const DEFAULT_FILTERS: SpinHistoryFilters = {
	status: "all",
};

export interface SpinHistoryStore {
	// State per user+gacha combination
	entries: Record<string, SpinHistoryEntry[]>;
	filters: Record<string, SpinHistoryFilters>;
	pagination: Record<string, SpinHistoryPagination>;
	isLoading: Record<string, boolean>;
	error: Record<string, string | null>;

	// Actions
	setEntries: (
		userAddress: string,
		gachaAddress: string,
		entries: SpinHistoryEntry[],
	) => void;
	appendEntries: (
		userAddress: string,
		gachaAddress: string,
		entries: SpinHistoryEntry[],
	) => Promise<void>;
	setPagination: (
		userAddress: string,
		gachaAddress: string,
		pagination: Partial<SpinHistoryPagination>,
	) => void;
	setFilter: (
		userAddress: string,
		gachaAddress: string,
		filter: Partial<SpinHistoryFilters>,
	) => void;
	setLoading: (
		userAddress: string,
		gachaAddress: string,
		isLoading: boolean,
	) => void;
	setError: (
		userAddress: string,
		gachaAddress: string,
		error: string | null,
	) => void;

	// Getters
	getEntries: (userAddress: string, gachaAddress: string) => SpinHistoryEntry[];
	getFilteredEntries: (
		userAddress: string,
		gachaAddress: string,
	) => SpinHistoryEntry[];
	getStats: (userAddress: string, gachaAddress: string) => SpinHistoryStats;
	getFilters: (userAddress: string, gachaAddress: string) => SpinHistoryFilters;
	getPagination: (
		userAddress: string,
		gachaAddress: string,
	) => SpinHistoryPagination;
	getIsLoading: (userAddress: string, gachaAddress: string) => boolean;
	getError: (userAddress: string, gachaAddress: string) => string | null;

	// Clear
	clearHistory: (userAddress: string, gachaAddress: string) => void;
}

export const useSpinHistoryStore = create<SpinHistoryStore>((set, get) => ({
	// Initial state
	entries: {},
	filters: {},
	pagination: {},
	isLoading: {},
	error: {},

	// Actions
	setEntries: (userAddress, gachaAddress, newEntries) => {
		const key = getSpinKey(userAddress, gachaAddress);
		invalidateCache(key);
		set((state) => ({
			entries: {
				...state.entries,
				[key]: newEntries,
			},
		}));
	},

	appendEntries: async (userAddress, gachaAddress, newEntries) => {
		const key = getSpinKey(userAddress, gachaAddress);

		// Acquire mutex lock to prevent concurrent updates
		await appendMutex.acquire();

		try {
			// Invalidate cache before updating entries
			invalidateCache(key);
			set((state) => {
				const existing = state.entries[key] || [];
				// Merge entries, avoiding duplicates by triggerId
				const merged = [...existing];
				for (const entry of newEntries) {
					if (!merged.some((e) => e.triggerId === entry.triggerId)) {
						merged.push(entry);
					}
				}
				// Sort by timestamp descending
				merged.sort((a, b) => b.timestamp - a.timestamp);
				return {
					entries: {
						...state.entries,
						[key]: merged,
					},
				};
			});
		} finally {
			// Always release the mutex
			appendMutex.release();
		}
	},

	setPagination: (userAddress, gachaAddress, partialPagination) => {
		const key = getSpinKey(userAddress, gachaAddress);
		set((state) => {
			const current = state.pagination[key] || DEFAULT_PAGINATION;
			return {
				pagination: {
					...state.pagination,
					[key]: { ...current, ...partialPagination },
				},
			};
		});
	},

	setFilter: (userAddress, gachaAddress, partialFilter) => {
		const key = getSpinKey(userAddress, gachaAddress);
		set((state) => {
			const current = state.filters[key] || DEFAULT_FILTERS;
			return {
				filters: {
					...state.filters,
					[key]: { ...current, ...partialFilter },
				},
			};
		});
	},

	setLoading: (userAddress, gachaAddress, loading) => {
		const key = getSpinKey(userAddress, gachaAddress);
		set((state) => ({
			isLoading: {
				...state.isLoading,
				[key]: loading,
			},
		}));
	},

	setError: (userAddress, gachaAddress, error) => {
		const key = getSpinKey(userAddress, gachaAddress);
		set((state) => ({
			error: {
				...state.error,
				[key]: error,
			},
		}));
	},

	// Getters
	getEntries: (userAddress, gachaAddress) => {
		const key = getSpinKey(userAddress, gachaAddress);
		return get().entries[key] || [];
	},

	getFilteredEntries: (userAddress, gachaAddress) => {
		const key = getSpinKey(userAddress, gachaAddress);
		const entries = get().getEntries(userAddress, gachaAddress);
		const filters = get().getFilters(userAddress, gachaAddress);

		// Check cache first
		const cached = filteredEntriesCache.get(key, entries, filters);
		if (cached !== null) {
			return cached;
		}

		// Compute and cache result
		const result = filterEntries(entries, filters);
		filteredEntriesCache.set(key, entries, filters, result);
		return result;
	},

	getStats: (userAddress, gachaAddress) => {
		const key = getSpinKey(userAddress, gachaAddress);
		const entries = get().getEntries(userAddress, gachaAddress);
		const filters = get().getFilters(userAddress, gachaAddress);

		// Check cache first
		const cached = statsCache.get(key, entries, filters);
		if (cached !== null) {
			return cached;
		}

		// Compute and cache result
		const result = computeStats(entries, filters);
		statsCache.set(key, entries, filters, result);
		return result;
	},

	getFilters: (userAddress, gachaAddress) => {
		const key = getSpinKey(userAddress, gachaAddress);
		return get().filters[key] || DEFAULT_FILTERS;
	},

	getPagination: (userAddress, gachaAddress) => {
		const key = getSpinKey(userAddress, gachaAddress);
		return get().pagination[key] || DEFAULT_PAGINATION;
	},

	getIsLoading: (userAddress, gachaAddress) => {
		const key = getSpinKey(userAddress, gachaAddress);
		return get().isLoading[key] || false;
	},

	getError: (userAddress, gachaAddress) => {
		const key = getSpinKey(userAddress, gachaAddress);
		return get().error[key] || null;
	},

	// Clear
	clearHistory: (userAddress, gachaAddress) => {
		const key = getSpinKey(userAddress, gachaAddress);
		invalidateCache(key);
		set((state) => {
			const { [key]: _removed, ...remainingEntries } = state.entries;
			const { [key]: _removedFilters, ...remainingFilters } = state.filters;
			const { [key]: _removedPagination, ...remainingPagination } =
				state.pagination;
			const { [key]: _removedLoading, ...remainingLoading } = state.isLoading;
			const { [key]: _removedError, ...remainingError } = state.error;
			return {
				entries: remainingEntries,
				filters: remainingFilters,
				pagination: remainingPagination,
				isLoading: remainingLoading,
				error: remainingError,
			};
		});
	},
}));
