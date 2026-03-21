/**
 * Unit tests for useGachaSpinMachine hook
 *
 * Tests state transitions, action handlers, and derived state flags.
 * Heavy wagmi / async-utils dependencies are mocked so tests run in isolation.
 */

import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useGachaSpinMachine } from "../useGachaSpinMachine";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("wagmi", () => ({
	useAccount: vi.fn(),
	usePublicClient: vi.fn(),
	useWatchContractEvent: vi.fn(),
	useAccountEffect: vi.fn(),
}));

vi.mock("@/hooks/useGachaContracts", () => ({
	useGachaContracts: vi.fn(),
}));

vi.mock("@/hooks/useGachaId", () => ({
	useGachaId: vi.fn(),
}));

vi.mock("@/stores/gachaStore", () => ({
	useGachaStore: {
		getState: vi.fn(),
		setState: vi.fn(),
	},
}));

// pollForSpinFulfillment must return a real Promise - it's called with .then()
// By default it returns a never-resolving promise so tests that don't care about
// polling completion won't observe unexpected state changes.
vi.mock("@/async-utils/gachaSpinMachine", () => ({
	loadFromStorage: vi.fn().mockReturnValue(null),
	validatePendingSpins: vi.fn().mockResolvedValue(undefined),
	pollForSpinFulfillment: vi.fn().mockReturnValue(new Promise(() => {})),
	MAX_RETRIES: 5,
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
		createDebugLogger: () => vi.fn(),
		DEBUG_FLAGS: { GACHA_SPIN: false },
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

vi.mock("@/lib/rarity-utils", () => ({
	rarityBigIntToName: (rarity: bigint) => {
		const map: Record<number, string> = {
			0: "Common",
			1: "Uncommon",
			2: "Rare",
			3: "Epic",
			4: "Legendary",
		};
		return map[Number(rarity)] ?? "Unknown";
	},
}));

// Stub the generated ABI import
vi.mock("@/generated", () => ({
	gachaAbi: [],
}));

// Stub constants
vi.mock("@/lib/constants", () => ({
	POLLING_INTERVAL_MS: 3000,
}));

// ---------------------------------------------------------------------------
// Test setup helpers
// ---------------------------------------------------------------------------

const USER_ADDRESS = "0xce59c4705b86d3E1c28a07A8bcB803A4CCf3a292" as const;
const GACHA_ADDRESS = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0" as const;

async function setupMocks({
	address = USER_ADDRESS as `0x${string}` | undefined,
	hasGacha = true,
}: {
	address?: `0x${string}` | undefined;
	hasGacha?: boolean;
} = {}) {
	const wagmi = await import("wagmi");
	vi.mocked(wagmi.useAccount).mockReturnValue({ address } as ReturnType<
		typeof wagmi.useAccount
	>);
	vi.mocked(wagmi.usePublicClient).mockReturnValue({} as ReturnType<
		typeof wagmi.usePublicClient
	>);
	vi.mocked(wagmi.useWatchContractEvent).mockReturnValue(undefined);
	vi.mocked(wagmi.useAccountEffect).mockReturnValue(undefined);

	const { useGachaContracts } = await import("@/hooks/useGachaContracts");
	vi.mocked(useGachaContracts).mockReturnValue({
		gacha: hasGacha ? GACHA_ADDRESS : undefined,
		treasury: undefined,
		treasuryReader: undefined,
		appraisal: undefined,
		economyManager: undefined,
		gachaServiceHandler: undefined,
		appraisalServiceHandler: undefined,
		cardGroupedVault: undefined,
		buybackVault: undefined,
		protocolTreasury: undefined,
		trackers: [],
		rarityNames: [],
	});

	const { useGachaId } = await import("@/hooks/useGachaId");
	vi.mocked(useGachaId).mockReturnValue("graded-pokemon");

	const { useGachaStore } = await import("@/stores/gachaStore");
	vi.mocked(useGachaStore).getState = vi.fn().mockReturnValue({
		addPendingSpin: vi.fn(),
		removePendingSpin: vi.fn(),
		getPendingSpin: vi.fn().mockReturnValue(null),
	});
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("useGachaSpinMachine", () => {
	beforeEach(async () => {
		vi.clearAllMocks();
		await setupMocks();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe("initial state", () => {
		it("starts in idle state", () => {
			const { result } = renderHook(() => useGachaSpinMachine());

			expect(result.current.state).toBe("idle");
			expect(result.current.isIdle).toBe(true);
			expect(result.current.isSpinning).toBe(false);
			expect(result.current.isWaitingForFulfillment).toBe(false);
			expect(result.current.isRevealing).toBe(false);
			expect(result.current.isError).toBe(false);
			expect(result.current.isTimeout).toBe(false);
			expect(result.current.isRefunded).toBe(false);
		});

		it("has null context values initially", () => {
			const { result } = renderHook(() => useGachaSpinMachine());

			expect(result.current.triggerId).toBeNull();
			expect(result.current.spinResult).toBeNull();
			expect(result.current.refundResult).toBeNull();
			expect(result.current.error).toBeNull();
			expect(result.current.retryCount).toBe(0);
		});

		it("canRetry is true initially (retryCount < MAX_RETRIES)", () => {
			const { result } = renderHook(() => useGachaSpinMachine());
			expect(result.current.canRetry).toBe(true);
		});
	});

	describe("startSpin", () => {
		it("transitions to spinning when user address and gacha are available", () => {
			const { result } = renderHook(() => useGachaSpinMachine());

			act(() => {
				result.current.startSpin();
			});

			expect(result.current.state).toBe("spinning");
			expect(result.current.isSpinning).toBe(true);
			expect(result.current.isIdle).toBe(false);
		});

		it("resets spin context when starting a new spin", () => {
			const { result } = renderHook(() => useGachaSpinMachine());

			// First transition to error state
			act(() => {
				result.current.setError("previous error");
			});
			expect(result.current.error).toBe("previous error");

			// Then start a new spin - error should clear
			act(() => {
				result.current.startSpin();
			});

			expect(result.current.error).toBeNull();
			expect(result.current.retryCount).toBe(0);
			expect(result.current.spinResult).toBeNull();
			expect(result.current.refundResult).toBeNull();
		});

		it("does nothing when user address is missing", async () => {
			// Reconfigure useAccount before renderHook so the hook sees no address
			const wagmi = await import("wagmi");
			vi.mocked(wagmi.useAccount).mockReturnValue({ address: undefined } as ReturnType<typeof wagmi.useAccount>);

			const { result } = renderHook(() => useGachaSpinMachine());

			act(() => {
				result.current.startSpin();
			});

			expect(result.current.state).toBe("idle");
		});

		it("does nothing when gacha address is missing", async () => {
			await setupMocks({ hasGacha: false });
			const { result } = renderHook(() => useGachaSpinMachine());

			act(() => {
				result.current.startSpin();
			});

			expect(result.current.state).toBe("idle");
		});
	});

	describe("confirmTransaction", () => {
		it("transitions to waitingForFulfillment with the given triggerId", () => {
			const { result } = renderHook(() => useGachaSpinMachine());
			const triggerId = BigInt(99);

			act(() => {
				result.current.startSpin();
			});
			act(() => {
				result.current.confirmTransaction(triggerId);
			});

			expect(result.current.state).toBe("waitingForFulfillment");
			expect(result.current.isWaitingForFulfillment).toBe(true);
			expect(result.current.triggerId).toBe(triggerId);
			expect(result.current.retryCount).toBe(0);
		});
	});

	describe("fulfillSpin", () => {
		it("transitions to revealing with the provided spin result", () => {
			const { result } = renderHook(() => useGachaSpinMachine());
			const spinResult = {
				rarity: "Rare",
				collection: "0x1234567890123456789012345678901234567890",
				tokenId: "7",
			};

			act(() => {
				result.current.startSpin();
			});
			act(() => {
				result.current.fulfillSpin(spinResult);
			});

			expect(result.current.state).toBe("revealing");
			expect(result.current.isRevealing).toBe(true);
			expect(result.current.spinResult).toEqual(spinResult);
			expect(result.current.error).toBeNull();
		});

		it("calls onSpinComplete callback on fulfillment", () => {
			const onSpinComplete = vi.fn();
			const { result } = renderHook(() =>
				useGachaSpinMachine(onSpinComplete),
			);
			const spinResult = {
				rarity: "Common",
				collection: "0x1234567890123456789012345678901234567890",
				tokenId: "1",
			};

			act(() => {
				result.current.fulfillSpin(spinResult);
			});

			expect(onSpinComplete).toHaveBeenCalledTimes(1);
		});
	});

	describe("closeReveal", () => {
		it("resets to idle from revealing state", () => {
			const { result } = renderHook(() => useGachaSpinMachine());
			const spinResult = {
				rarity: "Epic",
				collection: "0x1234567890123456789012345678901234567890",
				tokenId: "99",
			};

			act(() => {
				result.current.fulfillSpin(spinResult);
			});
			expect(result.current.state).toBe("revealing");

			act(() => {
				result.current.closeReveal();
			});

			expect(result.current.state).toBe("idle");
			expect(result.current.spinResult).toBeNull();
			expect(result.current.triggerId).toBeNull();
		});
	});

	describe("retry", () => {
		it("transitions back to waitingForFulfillment from error and increments retryCount", () => {
			const { result } = renderHook(() => useGachaSpinMachine());

			act(() => {
				result.current.startSpin();
			});
			act(() => {
				result.current.confirmTransaction(BigInt(1));
			});
			act(() => {
				result.current.setError("transient error");
			});

			const retryCountBefore = result.current.retryCount;

			act(() => {
				result.current.retry();
			});

			expect(result.current.state).toBe("waitingForFulfillment");
			expect(result.current.retryCount).toBe(retryCountBefore + 1);
			expect(result.current.error).toBeNull();
		});

		it("does not retry when MAX_RETRIES has been reached", () => {
			const { result } = renderHook(() => useGachaSpinMachine());

			// Exhaust all retries (MAX_RETRIES = 5)
			act(() => { result.current.startSpin(); });
			act(() => { result.current.confirmTransaction(BigInt(1)); });

			// Simulate 5 retries by calling retry repeatedly through the error path
			for (let i = 0; i < 5; i++) {
				act(() => { result.current.setError("err"); });
				act(() => { result.current.retry(); });
			}

			// One more setError to push us back to error state
			act(() => { result.current.setError("final err"); });

			// At this point retryCount === 5 === MAX_RETRIES, canRetry should be false
			expect(result.current.canRetry).toBe(false);

			const stateBefore = result.current.state;
			act(() => {
				result.current.retry();
			});

			// State must not change to waitingForFulfillment
			expect(result.current.state).toBe(stateBefore);
		});
	});

	describe("reset", () => {
		it("returns to idle from any state and clears all context", () => {
			const { result } = renderHook(() => useGachaSpinMachine());

			act(() => {
				result.current.startSpin();
			});
			act(() => {
				result.current.confirmTransaction(BigInt(5));
			});
			act(() => {
				result.current.setError("something failed");
			});

			act(() => {
				result.current.reset();
			});

			expect(result.current.state).toBe("idle");
			expect(result.current.isIdle).toBe(true);
			expect(result.current.triggerId).toBeNull();
			expect(result.current.error).toBeNull();
			expect(result.current.retryCount).toBe(0);
			expect(result.current.spinResult).toBeNull();
			expect(result.current.refundResult).toBeNull();
		});
	});

	describe("timeout", () => {
		it("transitions to timeout state with an error message", () => {
			const { result } = renderHook(() => useGachaSpinMachine());

			act(() => {
				result.current.timeout();
			});

			expect(result.current.state).toBe("timeout");
			expect(result.current.isTimeout).toBe(true);
			expect(result.current.error).toMatch(/timed out/i);
		});
	});

	describe("setError", () => {
		it("transitions to error state with the provided message", () => {
			const { result } = renderHook(() => useGachaSpinMachine());

			act(() => {
				result.current.setError("Custom error message");
			});

			expect(result.current.state).toBe("error");
			expect(result.current.isError).toBe(true);
			expect(result.current.error).toBe("Custom error message");
		});
	});

	describe("clearPendingSpins", () => {
		it("resets state to idle", () => {
			const { result } = renderHook(() => useGachaSpinMachine());

			act(() => {
				result.current.startSpin();
			});
			act(() => {
				result.current.clearPendingSpins();
			});

			expect(result.current.state).toBe("idle");
		});

		it("calls removePendingSpin on the store when user and gacha addresses are available", async () => {
			const { useGachaStore } = await import("@/stores/gachaStore");
			const removePendingSpin = vi.fn();
			vi.mocked(useGachaStore).getState = vi.fn().mockReturnValue({
				addPendingSpin: vi.fn(),
				removePendingSpin,
				getPendingSpin: vi.fn().mockReturnValue(null),
			});

			const { result } = renderHook(() => useGachaSpinMachine());

			act(() => {
				result.current.clearPendingSpins();
			});

			expect(removePendingSpin).toHaveBeenCalledWith(
				USER_ADDRESS,
				GACHA_ADDRESS,
			);
		});
	});

	describe("exposed action surface", () => {
		it("returns all expected action functions", () => {
			const { result } = renderHook(() => useGachaSpinMachine());

			expect(typeof result.current.startSpin).toBe("function");
			expect(typeof result.current.confirmTransaction).toBe("function");
			expect(typeof result.current.fulfillSpin).toBe("function");
			expect(typeof result.current.closeReveal).toBe("function");
			expect(typeof result.current.retry).toBe("function");
			expect(typeof result.current.reset).toBe("function");
			expect(typeof result.current.timeout).toBe("function");
			expect(typeof result.current.setError).toBe("function");
			expect(typeof result.current.clearPendingSpins).toBe("function");
		});
	});
});
