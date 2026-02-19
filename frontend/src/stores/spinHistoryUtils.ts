import type {
	SpinHistoryEntry,
	SpinHistoryFilters,
	SpinHistoryStats,
} from "../types/spin-history";

/**
 * Mutex for preventing race conditions in concurrent updates
 */
export class Mutex {
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

/**
 * Simple memoization cache for computed values per key
 */
interface CacheEntry<T> {
	entries: SpinHistoryEntry[];
	filters: SpinHistoryFilters;
	result: T;
}

export class MemoizedCache<T> {
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

// Singleton caches
export const filteredEntriesCache = new MemoizedCache<SpinHistoryEntry[]>();
export const statsCache = new MemoizedCache<SpinHistoryStats>();

/**
 * Invalidate cache for a specific key
 */
export function invalidateCache(key: string): void {
	filteredEntriesCache.delete(key);
	statsCache.delete(key);
}

/**
 * Filter entries based on filter criteria
 */
export function filterEntries(
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

/**
 * Compute statistics from spin history entries
 */
export function computeStats(
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
