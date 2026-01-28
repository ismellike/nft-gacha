import { create } from "zustand";
import type {
	SpinHistoryEntry,
	SpinHistoryFilters,
	SpinHistoryPagination,
	SpinHistoryStats,
} from "../types/spin-history";

/**
 * Mutex for preventing race conditions in concurrent updates
 */
class Mutex {
	private locked = false;
	private waitQueue: Array<() => void> = [];

	async acquire(): Promise<void> {
		if (!this.locked) {
			this.locked = true;
			return;
		}

		return new Promise((resolve) => {
			this.waitQueue.push(resolve);
		});
	}

	release(): void {
		if (this.waitQueue.length > 0) {
			// biome-ignore lint/style/noNonNullAssertion: waitQueue.length > 0 is checked above
			const resolve = this.waitQueue.shift()!;
			resolve();
		} else {
			this.locked = false;
		}
	}
}

// Create a mutex instance for spin history updates
const appendMutex = new Mutex();

/**
 * Simple memoization cache for computed values per key
 */
interface CacheEntry<T> {
	entries: SpinHistoryEntry[];
	filters: SpinHistoryFilters;
	result: T;
}

class MemoizedCache<T> {
	private cache: Map<string, CacheEntry<T>> = new Map();

	get(
		key: string,
		entries: SpinHistoryEntry[],
		filters: SpinHistoryFilters,
	): T | null {
		const cached = this.cache.get(key);
		if (cached && cached.entries === entries && cached.filters === filters) {
			return cached.result;
		}
		return null;
	}

	set(
		key: string,
		entries: SpinHistoryEntry[],
		filters: SpinHistoryFilters,
		result: T,
	): void {
		this.cache.set(key, { entries, filters, result });
	}

	delete(key: string): void {
		this.cache.delete(key);
	}

	clear(): void {
		this.cache.clear();
	}
}

// Create memoized caches for each key
const filteredEntriesCache = new MemoizedCache<SpinHistoryEntry[]>();
const statsCache = new MemoizedCache<SpinHistoryStats>();

/**
 * Invalidate cache for a specific key
 */
function invalidateCache(key: string): void {
	filteredEntriesCache.delete(key);
	statsCache.delete(key);
}

/**
 * Generate a unique key for user + gacha contract combination
 */
const getSpinKey = (userAddress: string, gachaAddress: string) =>
	`${userAddress.toLowerCase()}_${gachaAddress.toLowerCase()}`;

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

/**
 * Compute statistics from spin history entries
 */
function computeStats(
	entries: SpinHistoryEntry[],
	filters: SpinHistoryFilters,
): SpinHistoryStats {
	const filteredEntries = filterEntries(entries, filters);

	const totalSpins = filteredEntries.length;
	const completedSpins = filteredEntries.filter(
		(e) => e.status === "completed",
	).length;
	const refundedSpins = filteredEntries.filter(
		(e) => e.status === "refunded",
	).length;
	const reclaimedSpins = filteredEntries.filter(
		(e) => e.status === "reclaimed",
	).length;

	const winRate = totalSpins > 0 ? (completedSpins / totalSpins) * 100 : 0;

	const totalValueWon = filteredEntries.reduce(
		(acc, entry) => acc + (entry.appraisedPrice || 0n),
		0n,
	);

	const rarityDistribution: Record<number, number> = {
		0: 0, // Common
		1: 0, // Uncommon
		2: 0, // Rare
		3: 0, // Epic
		4: 0, // Legendary
	};

	for (const entry of filteredEntries) {
		if (entry.rarity !== undefined) {
			rarityDistribution[entry.rarity]++;
		}
	}

	return {
		totalSpins,
		completedSpins,
		refundedSpins,
		reclaimedSpins,
		winRate,
		totalValueWon,
		rarityDistribution,
	};
}

/**
 * Filter entries based on filter criteria
 */
function filterEntries(
	entries: SpinHistoryEntry[],
	filters: SpinHistoryFilters,
): SpinHistoryEntry[] {
	let filtered = entries;

	// Filter by status
	if (filters.status !== "all") {
		filtered = filtered.filter((e) => e.status === filters.status);
	}

	// Filter by date range
	if (filters.dateRange) {
		const { start, end } = filters.dateRange;
		filtered = filtered.filter(
			(e) => e.timestamp >= start && e.timestamp <= end,
		);
	}

	return filtered;
}

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
