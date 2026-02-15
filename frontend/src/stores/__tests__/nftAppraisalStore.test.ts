import { describe, it, expect, beforeEach } from "vitest";
import { useNFTAppraisalStore } from "../nftAppraisalStore";
import type { AppraisedNFT } from "../nftAppraisalStore";

const USER = "0xUser1";
const COLLECTION = "0xCollection1";

const makeAppraisal = (
	overrides: Partial<AppraisedNFT> = {},
): AppraisedNFT => ({
	collection: COLLECTION,
	tokenId: "1",
	priceUSD: 1000n,
	status: 1,
	requester: USER,
	timestamp: BigInt(Date.now()),
	lastUpdated: BigInt(Date.now()),
	...overrides,
});

describe("nftAppraisalStore", () => {
	beforeEach(() => {
		useNFTAppraisalStore.setState({
			appraisals: {},
			optimisticSubmissions: {},
			loading: {},
			error: {},
			lastFetched: {},
		});
	});

	describe("setAppraisals / getUserAppraisals", () => {
		it("stores and retrieves appraisals for a user", () => {
			const appraisals = [makeAppraisal(), makeAppraisal({ tokenId: "2" })];
			const store = useNFTAppraisalStore.getState();
			store.setAppraisals(USER, appraisals);

			expect(store.getUserAppraisals(USER)).toEqual(appraisals);
		});

		it("sets lastFetched, clears loading and error", () => {
			const store = useNFTAppraisalStore.getState();
			store.setLoading(USER, true);
			store.setError(USER, "old error");
			store.setAppraisals(USER, []);

			const state = useNFTAppraisalStore.getState();
			expect(state.loading[USER.toLowerCase()]).toBe(false);
			expect(state.error[USER.toLowerCase()]).toBeNull();
			expect(state.lastFetched[USER.toLowerCase()]).toBeGreaterThan(0);
		});

		it("returns empty array for unknown user", () => {
			expect(
				useNFTAppraisalStore.getState().getUserAppraisals("0xNew"),
			).toEqual([]);
		});
	});

	describe("addOptimisticSubmission", () => {
		it("adds new optimistic entry", () => {
			const store = useNFTAppraisalStore.getState();
			store.addOptimisticSubmission(USER, COLLECTION, "5");

			const subs = useNFTAppraisalStore
				.getState()
				.getUserOptimisticSubmissions(USER);
			expect(subs).toHaveLength(1);
			expect(subs[0].collection).toBe(COLLECTION);
			expect(subs[0].tokenId).toBe("5");
			expect(subs[0].isOptimistic).toBe(true);
		});

		it("does not duplicate same collection+tokenId", () => {
			const store = useNFTAppraisalStore.getState();
			store.addOptimisticSubmission(USER, COLLECTION, "5");
			store.addOptimisticSubmission(USER, COLLECTION, "5");

			expect(
				useNFTAppraisalStore
					.getState()
					.getUserOptimisticSubmissions(USER),
			).toHaveLength(1);
		});
	});

	describe("removeOptimisticSubmission", () => {
		it("removes matching entry", () => {
			const store = useNFTAppraisalStore.getState();
			store.addOptimisticSubmission(USER, COLLECTION, "5");
			store.addOptimisticSubmission(USER, COLLECTION, "6");

			useNFTAppraisalStore
				.getState()
				.removeOptimisticSubmission(USER, COLLECTION, "5");

			const subs = useNFTAppraisalStore
				.getState()
				.getUserOptimisticSubmissions(USER);
			expect(subs).toHaveLength(1);
			expect(subs[0].tokenId).toBe("6");
		});
	});

	describe("getCombinedAppraisals", () => {
		it("merges confirmed and optimistic, deduplicates", () => {
			const store = useNFTAppraisalStore.getState();
			store.setAppraisals(USER, [
				makeAppraisal({ tokenId: "1", timestamp: 5000n }),
			]);
			store.addOptimisticSubmission(USER, COLLECTION, "1"); // duplicate
			store.addOptimisticSubmission(USER, COLLECTION, "2"); // new

			const combined = useNFTAppraisalStore
				.getState()
				.getCombinedAppraisals(USER);
			expect(combined).toHaveLength(2); // confirmed #1 + optimistic #2
		});

		it("sorts by timestamp descending", () => {
			const store = useNFTAppraisalStore.getState();
			store.setAppraisals(USER, [
				makeAppraisal({ tokenId: "1", timestamp: 1000n }),
				makeAppraisal({ tokenId: "2", timestamp: 3000n }),
			]);

			const combined = useNFTAppraisalStore
				.getState()
				.getCombinedAppraisals(USER);
			expect(Number((combined[0] as AppraisedNFT).timestamp)).toBe(3000);
		});
	});

	describe("setLoading / setError", () => {
		it("sets loading state", () => {
			const store = useNFTAppraisalStore.getState();
			store.setLoading(USER, true);
			expect(
				useNFTAppraisalStore.getState().loading[USER.toLowerCase()],
			).toBe(true);
		});

		it("sets error and clears loading", () => {
			const store = useNFTAppraisalStore.getState();
			store.setLoading(USER, true);
			store.setError(USER, "Network error");

			const state = useNFTAppraisalStore.getState();
			expect(state.error[USER.toLowerCase()]).toBe("Network error");
			expect(state.loading[USER.toLowerCase()]).toBe(false);
		});
	});

	describe("clearUserError", () => {
		it("clears error for user", () => {
			const store = useNFTAppraisalStore.getState();
			store.setError(USER, "err");
			store.clearUserError(USER);
			expect(
				useNFTAppraisalStore.getState().error[USER.toLowerCase()],
			).toBeNull();
		});
	});

	describe("refreshUserAppraisals", () => {
		it("resets lastFetched to 0", () => {
			const store = useNFTAppraisalStore.getState();
			store.setAppraisals(USER, []);
			store.refreshUserAppraisals(USER);
			expect(
				useNFTAppraisalStore.getState().lastFetched[USER.toLowerCase()],
			).toBe(0);
		});
	});
});
