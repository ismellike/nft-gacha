/**
 * Unit tests for gachaSpinMachine utility
 */

import type { PublicClient } from "viem";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	clearAllPendingSpins,
	getPollingDelay,
	pollForSpinFulfillment,
} from "@/async-utils/gachaSpinMachine";
import { useGachaStore } from "@/stores/gachaStore";

// Mock the dependencies
vi.mock("@/stores/gachaStore", () => ({
	useGachaStore: {
		getState: vi.fn(),
		setState: vi.fn(),
	},
}));

vi.mock("@/lib/logger", () => ({
	createDebugLogger: () => vi.fn(),
	DEBUG_FLAGS: {
		GACHA_SPIN: true,
	},
}));

vi.mock("@/lib/rarity-utils", () => ({
	rarityBigIntToName: (rarity: bigint) => {
		const rarityMap: Record<number, string> = {
			0: "Common",
			1: "Uncommon",
			2: "Rare",
			3: "Epic",
			4: "Legendary",
		};
		return rarityMap[Number(rarity)] || "Unknown";
	},
}));

describe("gachaSpinMachine", () => {
	describe("getPollingDelay", () => {
		it("should return base interval for first attempt", () => {
			const baseInterval = 3000;
			const delay = getPollingDelay(0, baseInterval);
			expect(delay).toBeGreaterThanOrEqual(baseInterval);
			expect(delay).toBeLessThan(baseInterval * 1.2); // Allow 20% jitter
		});

		it("should implement exponential backoff", () => {
			const baseInterval = 3000;
			const delay1 = getPollingDelay(5, baseInterval);
			const delay2 = getPollingDelay(10, baseInterval);
			expect(delay2).toBeGreaterThan(delay1);
		});

		it("should cap maximum delay at 30 seconds", () => {
			const baseInterval = 3000;
			const delay = getPollingDelay(100, baseInterval);
			expect(delay).toBeLessThanOrEqual(30000);
		});

		it("should add jitter to prevent thundering herd", () => {
			const baseInterval = 3000;
			const delays = Array.from({ length: 10 }, () =>
				getPollingDelay(5, baseInterval),
			);
			const uniqueDelays = new Set(delays);
			// Not all delays should be the same due to jitter
			expect(uniqueDelays.size).toBeGreaterThan(1);
		});
	});

	describe("pollForSpinFulfillment", () => {
		const mockTriggerId = BigInt(12345);
		const mockUserAddress = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb";
		const mockGachaAddress = "0xce59c4705b86d3E1c28a07A8bcB803A4CCf3a292";

		let mockPublicClient: PublicClient;
		let mockGetLogs: ReturnType<typeof vi.fn>;

		beforeEach(() => {
			vi.useFakeTimers();

			// Mock public client
			mockGetLogs = vi.fn();
			mockPublicClient = {
				getLogs: mockGetLogs,
				getBlockNumber: vi.fn().mockResolvedValue(BigInt(10000)),
			} as unknown as PublicClient;
		});

		afterEach(() => {
			vi.useRealTimers();
			vi.clearAllMocks();
		});

		it("should resolve when SpinCompleted event is found", async () => {
			const mockResult = {
				rarity: BigInt(2), // Rare
				collection: "0x1234567890123456789012345678901234567890",
				tokenId: BigInt(1),
			};

			mockGetLogs.mockResolvedValueOnce([
				{
					args: mockResult,
				},
			]);

			const promise = pollForSpinFulfillment({
				triggerId: mockTriggerId,
				userAddress: mockUserAddress,
				publicClient: mockPublicClient,
				gachaAddress: mockGachaAddress,
			});

			const result = await promise;

			expect(result.type).toBe("completed");
			if (result.type === "completed") {
				expect(result.result).toEqual({
					rarity: "Rare",
					collection: mockResult.collection,
					tokenId: "1",
				});
			}
			expect(mockGetLogs).toHaveBeenCalledTimes(1);
		});

		it("should resolve with refund result when SpinRefunded event is found", async () => {
			// With refundCheckDelay = 3:
			// Attempt 1: getLogs SpinCompleted (empty) - no refund check
			// Attempt 2: getLogs SpinCompleted (empty) - no refund check
			// Attempt 3: getLogs SpinCompleted (empty) + getLogs SpinRefunded (found!)
			// Total: 4 getLogs calls

			// Calls 1-2: SpinCompleted checks return empty (attempts 1-2)
			mockGetLogs.mockResolvedValueOnce([]);
			mockGetLogs.mockResolvedValueOnce([]);

			// Call 3: SpinCompleted check in attempt 3 returns empty
			mockGetLogs.mockResolvedValueOnce([]);

			// Call 4: SpinRefunded check in attempt 3 returns refund data
			const mockRefundData = {
				selectedRarity: BigInt(1), // Uncommon
				refundAmount: BigInt("1000000000"),
			};

			mockGetLogs.mockResolvedValueOnce([
				{
					args: mockRefundData,
				},
			]);

			const promise = pollForSpinFulfillment({
				triggerId: mockTriggerId,
				userAddress: mockUserAddress,
				publicClient: mockPublicClient,
				gachaAddress: mockGachaAddress,
			});

			// Advance timers in increments to trigger polling attempts
			// Each polling attempt has a delay that starts at 3000ms
			// We need enough time for 3 attempts
			for (let i = 0; i < 6; i++) {
				await vi.advanceTimersByTimeAsync(5000);
			}

			const result = await promise;
			expect(result.type).toBe("refunded");
			if (result.type === "refunded") {
				expect(result.refundResult.selectedRarity).toBe("Uncommon");
				expect(result.refundResult.refundAmount).toBe(BigInt("1000000000"));
			}
		}, 20000);

		it("should timeout after MAX_POLLING_TIME if no event found", async () => {
			mockGetLogs.mockResolvedValue([]);

			const promise = pollForSpinFulfillment({
				triggerId: mockTriggerId,
				userAddress: mockUserAddress,
				publicClient: mockPublicClient,
				gachaAddress: mockGachaAddress,
			});

			// Attach handler before advancing timers to prevent unhandled rejection warning
			const assertion = expect(promise).rejects.toThrow(/Polling timeout/);

			// Advance timers past the max polling time (10 minutes)
			await vi.advanceTimersByTimeAsync(10 * 60 * 1000 + 1000);

			await assertion;
		});

		it("should handle invalid parameters", async () => {
			await expect(
				pollForSpinFulfillment({
					triggerId: BigInt(0),
					userAddress: "",
					publicClient: null as unknown as PublicClient,
					gachaAddress: "",
				}),
			).rejects.toThrow(/Invalid polling parameters/);
		});

		it("should retry on network errors", async () => {
			let attempts = 0;
			mockGetLogs.mockImplementation(() => {
				attempts++;
				if (attempts < 3) {
					return Promise.reject(new Error("Network error"));
				}
				return Promise.resolve([
					{
						args: {
							rarity: BigInt(1),
							collection: "0x1234567890123456789012345678901234567890",
							tokenId: BigInt(1),
						},
					},
				]);
			});

			const promise = pollForSpinFulfillment({
				triggerId: mockTriggerId,
				userAddress: mockUserAddress,
				publicClient: mockPublicClient,
				gachaAddress: mockGachaAddress,
			});

			// Fast-forward through retries
			for (let i = 0; i < 5; i++) {
				await vi.advanceTimersByTimeAsync(5000);
			}

			const result = await promise;
			expect(result.type).toBe("completed");
			if (result.type === "completed") {
				expect(result.result.rarity).toBe("Uncommon");
			}
		});
	});

	describe("clearAllPendingSpins", () => {
		it("should clear all pending spins from store", () => {
			vi.mocked(useGachaStore).setState = vi.fn();
			vi.mocked(useGachaStore).getState = vi.fn().mockReturnValue({
				pendingSpins: {
					"0xuser1": { triggerId: BigInt(1) },
					"0xuser2": { triggerId: BigInt(2) },
				},
			});

			clearAllPendingSpins();

			expect(useGachaStore.setState).toHaveBeenCalledWith({
				pendingSpins: {},
			});
		});
	});
});
