import { describe, it, expect, beforeEach } from "vitest";
import { useSpinHistoryStore } from "../spinHistoryStore";
import type { SpinHistoryEntry } from "../../types/spin-history";

const USER = "0xUser1";
const GACHA = "0xGacha1";

let nextId = 1;
const makeEntry = (
	overrides: Partial<SpinHistoryEntry> = {},
): SpinHistoryEntry => ({
	triggerId: BigInt(nextId++),
	timestamp: Date.now(),
	blockNumber: 100n,
	transactionHash: "0xabc",
	status: "completed",
	requester: USER,
	gachaAddress: GACHA,
	...overrides,
});

describe("spinHistoryStore", () => {
	beforeEach(() => {
		nextId = 1;
		useSpinHistoryStore.setState({
			entries: {},
			filters: {},
			pagination: {},
			isLoading: {},
			error: {},
		});
	});

	describe("setEntries / getEntries", () => {
		it("stores and retrieves entries for a user+gacha key", () => {
			const entries = [makeEntry(), makeEntry()];
			const store = useSpinHistoryStore.getState();
			store.setEntries(USER, GACHA, entries);
			expect(store.getEntries(USER, GACHA)).toEqual(entries);
		});

		it("returns empty array for unknown key", () => {
			const store = useSpinHistoryStore.getState();
			expect(store.getEntries("0xUnknown", GACHA)).toEqual([]);
		});
	});

	describe("appendEntries", () => {
		it("adds new entries and sorts by timestamp descending", async () => {
			const store = useSpinHistoryStore.getState();
			const e1 = makeEntry({ timestamp: 1000 });
			const e2 = makeEntry({ timestamp: 3000 });
			const e3 = makeEntry({ timestamp: 2000 });

			store.setEntries(USER, GACHA, [e1]);
			await store.appendEntries(USER, GACHA, [e2, e3]);

			const result = useSpinHistoryStore.getState().getEntries(USER, GACHA);
			expect(result).toHaveLength(3);
			expect(result[0].timestamp).toBe(3000);
			expect(result[1].timestamp).toBe(2000);
			expect(result[2].timestamp).toBe(1000);
		});

		it("deduplicates by triggerId", async () => {
			const store = useSpinHistoryStore.getState();
			const e1 = makeEntry({ triggerId: 100n });
			const e2 = makeEntry({ triggerId: 100n, timestamp: 9999 });

			store.setEntries(USER, GACHA, [e1]);
			await store.appendEntries(USER, GACHA, [e2]);

			const result = useSpinHistoryStore.getState().getEntries(USER, GACHA);
			expect(result).toHaveLength(1);
		});
	});

	describe("filters", () => {
		it("sets and retrieves filters", () => {
			const store = useSpinHistoryStore.getState();
			store.setFilter(USER, GACHA, { status: "completed" });
			expect(store.getFilters(USER, GACHA).status).toBe("completed");
		});

		it("returns default filters for unknown key", () => {
			const store = useSpinHistoryStore.getState();
			expect(store.getFilters("0xNew", GACHA).status).toBe("all");
		});
	});

	describe("getFilteredEntries", () => {
		it("filters by status", () => {
			const store = useSpinHistoryStore.getState();
			store.setEntries(USER, GACHA, [
				makeEntry({ status: "completed" }),
				makeEntry({ status: "refunded" }),
				makeEntry({ status: "completed" }),
			]);
			store.setFilter(USER, GACHA, { status: "completed" });

			const filtered = useSpinHistoryStore
				.getState()
				.getFilteredEntries(USER, GACHA);
			expect(filtered).toHaveLength(2);
			expect(filtered.every((e) => e.status === "completed")).toBe(true);
		});

		it("filters by date range", () => {
			const store = useSpinHistoryStore.getState();
			store.setEntries(USER, GACHA, [
				makeEntry({ timestamp: 1000 }),
				makeEntry({ timestamp: 2000 }),
				makeEntry({ timestamp: 3000 }),
			]);
			store.setFilter(USER, GACHA, {
				status: "all",
				dateRange: { start: 1500, end: 2500 },
			});

			const filtered = useSpinHistoryStore
				.getState()
				.getFilteredEntries(USER, GACHA);
			expect(filtered).toHaveLength(1);
			expect(filtered[0].timestamp).toBe(2000);
		});
	});

	describe("getStats", () => {
		it("computes correct statistics", () => {
			const store = useSpinHistoryStore.getState();
			store.setEntries(USER, GACHA, [
				makeEntry({ status: "completed", rarity: 0, appraisedPrice: 100n }),
				makeEntry({ status: "completed", rarity: 2, appraisedPrice: 200n }),
				makeEntry({ status: "refunded" }),
				makeEntry({ status: "reclaimed" }),
			]);

			const stats = useSpinHistoryStore.getState().getStats(USER, GACHA);
			expect(stats.totalSpins).toBe(4);
			expect(stats.completedSpins).toBe(2);
			expect(stats.refundedSpins).toBe(1);
			expect(stats.reclaimedSpins).toBe(1);
			expect(stats.winRate).toBe(50);
			expect(stats.totalValueWon).toBe(300n);
			expect(stats.rarityDistribution[0]).toBe(1);
			expect(stats.rarityDistribution[2]).toBe(1);
		});
	});

	describe("loading and error", () => {
		it("sets and gets loading state", () => {
			const store = useSpinHistoryStore.getState();
			store.setLoading(USER, GACHA, true);
			expect(store.getIsLoading(USER, GACHA)).toBe(true);
			store.setLoading(USER, GACHA, false);
			expect(useSpinHistoryStore.getState().getIsLoading(USER, GACHA)).toBe(
				false,
			);
		});

		it("sets and gets error state", () => {
			const store = useSpinHistoryStore.getState();
			store.setError(USER, GACHA, "Network error");
			expect(store.getError(USER, GACHA)).toBe("Network error");
		});
	});

	describe("clearHistory", () => {
		it("removes all data for a key", () => {
			const store = useSpinHistoryStore.getState();
			store.setEntries(USER, GACHA, [makeEntry()]);
			store.setLoading(USER, GACHA, true);
			store.setError(USER, GACHA, "err");

			store.clearHistory(USER, GACHA);

			const s = useSpinHistoryStore.getState();
			expect(s.getEntries(USER, GACHA)).toEqual([]);
			expect(s.getIsLoading(USER, GACHA)).toBe(false);
			expect(s.getError(USER, GACHA)).toBeNull();
		});
	});

	describe("concurrent appendEntries", () => {
		it("does not lose data from concurrent appends", async () => {
			const store = useSpinHistoryStore.getState();
			const e1 = makeEntry({ triggerId: 1n, timestamp: 1000 });
			const e2 = makeEntry({ triggerId: 2n, timestamp: 2000 });

			await Promise.all([
				store.appendEntries(USER, GACHA, [e1]),
				store.appendEntries(USER, GACHA, [e2]),
			]);

			const result = useSpinHistoryStore.getState().getEntries(USER, GACHA);
			expect(result).toHaveLength(2);
		});
	});
});
