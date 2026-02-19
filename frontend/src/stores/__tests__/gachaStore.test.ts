import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { useGachaStore } from "../gachaStore";

const USER = "0xUser1";
const GACHA = "0xGacha1";

describe("gachaStore", () => {
	beforeEach(() => {
		useGachaStore.setState({ pendingSpins: {} });
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe("addPendingSpin", () => {
		it("adds a pending spin with current timestamp", () => {
			const store = useGachaStore.getState();
			store.addPendingSpin({
				triggerId: 1n,
				userAddress: USER,
				gachaAddress: GACHA,
			});

			const state = useGachaStore.getState();
			const key = `${USER.toLowerCase()}_${GACHA.toLowerCase()}`;
			expect(state.pendingSpins[key]).toBeDefined();
			expect(state.pendingSpins[key].triggerId).toBe(1n);
			expect(state.pendingSpins[key].timestamp).toBeGreaterThan(0);
		});
	});

	describe("getPendingSpin", () => {
		it("returns spin if exists and not expired", () => {
			const store = useGachaStore.getState();
			store.addPendingSpin({
				triggerId: 42n,
				userAddress: USER,
				gachaAddress: GACHA,
			});

			const spin = useGachaStore.getState().getPendingSpin(USER, GACHA);
			expect(spin).not.toBeNull();
			expect(spin?.triggerId).toBe(42n);
		});

		it("returns null for non-existent spin", () => {
			expect(
				useGachaStore.getState().getPendingSpin("0xNew", GACHA),
			).toBeNull();
		});

		it("returns null and removes spin if expired (>10 min)", () => {
			vi.useFakeTimers();
			const now = Date.now();
			vi.setSystemTime(now);

			const store = useGachaStore.getState();
			store.addPendingSpin({
				triggerId: 1n,
				userAddress: USER,
				gachaAddress: GACHA,
			});

			// Advance past 10 minute timeout
			vi.setSystemTime(now + 10 * 60 * 1000 + 1);

			const spin = useGachaStore.getState().getPendingSpin(USER, GACHA);
			expect(spin).toBeNull();
		});
	});

	describe("removePendingSpin", () => {
		it("removes the spin for the given key", () => {
			const store = useGachaStore.getState();
			store.addPendingSpin({
				triggerId: 1n,
				userAddress: USER,
				gachaAddress: GACHA,
			});

			useGachaStore.getState().removePendingSpin(USER, GACHA);

			const key = `${USER.toLowerCase()}_${GACHA.toLowerCase()}`;
			expect(useGachaStore.getState().pendingSpins[key]).toBeUndefined();
		});
	});

	describe("key generation", () => {
		it("lowercases addresses for key", () => {
			const store = useGachaStore.getState();
			store.addPendingSpin({
				triggerId: 1n,
				userAddress: "0xABCD",
				gachaAddress: "0xEFGH",
			});

			const spin = useGachaStore.getState().getPendingSpin("0xabcd", "0xefgh");
			expect(spin).not.toBeNull();
		});
	});
});
