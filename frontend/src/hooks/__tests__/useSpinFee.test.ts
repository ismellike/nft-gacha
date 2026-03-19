/**
 * Unit tests for useSpinFee hook
 */

import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useSpinFee } from "../useSpinFee";

// We mock the generated hook so it's under our control
vi.mock("@/generated", () => ({
	useReadGachaGetCurrentSpinFee: vi.fn(),
}));

vi.mock("@/lib/logger", () => {
	const noop = vi.fn();
	const category = {
		log: noop,
		info: noop,
		warn: noop,
		error: noop,
		debug: noop,
	};
	return {
		logger: {
			general: category,
			gachaSpin: category,
			nftMetadata: category,
			contracts: category,
			state: category,
			network: category,
		},
	};
});

const GACHA_ADDRESS = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0" as const;

describe("useSpinFee", () => {
	let useReadGachaGetCurrentSpinFeeMock: ReturnType<typeof vi.fn>;
	let mockRefetch: ReturnType<typeof vi.fn>;
	// registerRefetch must satisfy the hook's parameter type:
	// (fn: () => void | Promise<void>) => () => void
	// We keep the raw mock around so we can inspect .mock.calls in tests.
	let registerRefetchMock: ReturnType<typeof vi.fn>;
	let registerRefetch: (fn: () => void | Promise<void>) => () => void;
	let deregister: ReturnType<typeof vi.fn>;

	beforeEach(async () => {
		vi.useFakeTimers();
		vi.clearAllMocks();

		const generated = await import("@/generated");
		useReadGachaGetCurrentSpinFeeMock = vi.mocked(
			generated.useReadGachaGetCurrentSpinFee,
		);

		mockRefetch = vi.fn().mockResolvedValue(undefined);
		deregister = vi.fn();
		registerRefetchMock = vi.fn().mockReturnValue(deregister);
		registerRefetch = registerRefetchMock as unknown as (
			fn: () => void | Promise<void>,
		) => () => void;

		// Default: fee query returns a value
		useReadGachaGetCurrentSpinFeeMock.mockReturnValue({
			data: BigInt("1000000000000000000"), // 1 ETH in wei
			isFetching: false,
			refetch: mockRefetch,
			dataUpdatedAt: Date.now(),
		});
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("returns the spin fee from contract query", () => {
		const { result } = renderHook(() =>
			useSpinFee({ gachaAddress: GACHA_ADDRESS, registerRefetch }),
		);

		expect(result.current.spinFee).toBe(BigInt("1000000000000000000"));
	});

	it("returns undefined spinFee when contract query has no data", () => {
		useReadGachaGetCurrentSpinFeeMock.mockReturnValue({
			data: undefined,
			isFetching: false,
			refetch: mockRefetch,
			dataUpdatedAt: 0,
		});

		const { result } = renderHook(() =>
			useSpinFee({ gachaAddress: undefined, registerRefetch }),
		);

		expect(result.current.spinFee).toBeUndefined();
	});

	it("reflects isFetching state from contract query", () => {
		useReadGachaGetCurrentSpinFeeMock.mockReturnValue({
			data: undefined,
			isFetching: true,
			refetch: mockRefetch,
			dataUpdatedAt: 0,
		});

		const { result } = renderHook(() =>
			useSpinFee({ gachaAddress: GACHA_ADDRESS, registerRefetch }),
		);

		expect(result.current.isFetching).toBe(true);
	});

	it("exposes refetch function from contract query", () => {
		const { result } = renderHook(() =>
			useSpinFee({ gachaAddress: GACHA_ADDRESS, registerRefetch }),
		);

		result.current.refetch?.();
		expect(mockRefetch).toHaveBeenCalledTimes(1);
	});

	it("feeStale starts as false", () => {
		const { result } = renderHook(() =>
			useSpinFee({ gachaAddress: GACHA_ADDRESS, registerRefetch }),
		);

		expect(result.current.feeStale).toBe(false);
	});

	it("marks fee as stale after FEE_STALENESS_MS without update", async () => {
		// Set dataUpdatedAt to a time in the past (before staleness threshold)
		const OLD_TIMESTAMP = Date.now() - 20_000; // 20 seconds ago
		useReadGachaGetCurrentSpinFeeMock.mockReturnValue({
			data: BigInt("1000000000000000000"),
			isFetching: false,
			refetch: mockRefetch,
			dataUpdatedAt: OLD_TIMESTAMP,
		});

		const { result } = renderHook(() =>
			useSpinFee({ gachaAddress: GACHA_ADDRESS, registerRefetch }),
		);

		// FEE_STALENESS_MS is 15_000ms; advance 16 seconds to trigger stale check
		await act(async () => {
			await vi.advanceTimersByTimeAsync(16_000);
		});

		expect(result.current.feeStale).toBe(true);
	});

	it("clears stale flag when fetching starts", async () => {
		const OLD_TIMESTAMP = Date.now() - 20_000;
		useReadGachaGetCurrentSpinFeeMock.mockReturnValue({
			data: BigInt("1000000000000000000"),
			isFetching: false,
			refetch: mockRefetch,
			dataUpdatedAt: OLD_TIMESTAMP,
		});

		const { result, rerender } = renderHook(() =>
			useSpinFee({ gachaAddress: GACHA_ADDRESS, registerRefetch }),
		);

		// First make it stale
		await act(async () => {
			await vi.advanceTimersByTimeAsync(16_000);
		});
		expect(result.current.feeStale).toBe(true);

		// Now simulate a fetch starting
		useReadGachaGetCurrentSpinFeeMock.mockReturnValue({
			data: BigInt("1000000000000000000"),
			isFetching: true,
			refetch: mockRefetch,
			dataUpdatedAt: OLD_TIMESTAMP,
		});
		rerender();

		// The interval will pick up the isFetching=true via ref and clear stale flag
		await act(async () => {
			await vi.advanceTimersByTimeAsync(2_000);
		});

		expect(result.current.feeStale).toBe(false);
	});

	it("registers refetch function with context", () => {
		renderHook(() =>
			useSpinFee({ gachaAddress: GACHA_ADDRESS, registerRefetch }),
		);

		expect(registerRefetchMock).toHaveBeenCalledTimes(1);
		expect(typeof (registerRefetchMock as ReturnType<typeof vi.fn>).mock.calls[0][0]).toBe("function");
	});

	it("calls deregister cleanup when unmounting", () => {
		const { unmount } = renderHook(() =>
			useSpinFee({ gachaAddress: GACHA_ADDRESS, registerRefetch }),
		);

		unmount();

		expect(deregister).toHaveBeenCalled();
	});

	it("disables query when gachaAddress is undefined", () => {
		renderHook(() =>
			useSpinFee({ gachaAddress: undefined, registerRefetch }),
		);

		// Check that useReadContract was called with enabled: false
		const callArgs = useReadGachaGetCurrentSpinFeeMock.mock.calls[0][0];
		expect(callArgs.query.enabled).toBe(false);
	});

	it("enables query when gachaAddress is defined", () => {
		renderHook(() =>
			useSpinFee({ gachaAddress: GACHA_ADDRESS, registerRefetch }),
		);

		const callArgs = useReadGachaGetCurrentSpinFeeMock.mock.calls[0][0];
		expect(callArgs.query.enabled).toBe(true);
	});
});
