/**
 * Unit tests for useGachaContracts hook
 */

import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useGachaContracts } from "../useGachaContracts";

const VALID_ADDRESS = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0" as const;
const VALID_ADDRESS_2 = "0xce59c4705b86d3E1c28a07A8bcB803A4CCf3a292" as const;

const MOCK_CONTRACTS = {
	gacha: VALID_ADDRESS,
	treasury: VALID_ADDRESS_2,
	appraisal: VALID_ADDRESS,
	economyManager: VALID_ADDRESS_2,
	gachaServiceHandler: VALID_ADDRESS,
	appraisalServiceHandler: VALID_ADDRESS_2,
	cardGroupedVault: VALID_ADDRESS,
	buybackVault: VALID_ADDRESS_2,
	protocolTreasury: VALID_ADDRESS,
	trackers: [VALID_ADDRESS, VALID_ADDRESS_2],
	rarityNames: ["Common", "Uncommon", "Rare", "Epic", "Legendary"],
};

vi.mock("@/lib/gacha-config/contracts", () => ({
	getGachaContracts: vi.fn(),
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

describe("useGachaContracts", () => {
	let getGachaContractsMock: ReturnType<typeof vi.fn>;

	beforeEach(async () => {
		vi.clearAllMocks();
		const mod = await import("@/lib/gacha-config/contracts");
		getGachaContractsMock = vi.mocked(mod.getGachaContracts);
	});

	it("returns contract addresses for a valid gacha ID", () => {
		getGachaContractsMock.mockReturnValue(MOCK_CONTRACTS);

		const { result } = renderHook(() => useGachaContracts("graded-pokemon"));

		expect(result.current.gacha).toBe(VALID_ADDRESS);
		expect(result.current.treasury).toBe(VALID_ADDRESS_2);
		expect(result.current.rarityNames).toEqual([
			"Common",
			"Uncommon",
			"Rare",
			"Epic",
			"Legendary",
		]);
		expect(getGachaContractsMock).toHaveBeenCalledWith("graded-pokemon");
	});

	it("returns empty contracts when gacha ID is empty string", () => {
		const { result } = renderHook(() => useGachaContracts(""));

		expect(result.current.gacha).toBeUndefined();
		expect(result.current.treasury).toBeUndefined();
		expect(result.current.trackers).toEqual([]);
		expect(result.current.rarityNames).toEqual([]);
		// Should not call getGachaContracts for empty ID
		expect(getGachaContractsMock).not.toHaveBeenCalled();
	});

	it("returns empty contracts when getGachaContracts throws", () => {
		getGachaContractsMock.mockImplementation(() => {
			throw new Error("Config not found");
		});

		const { result } = renderHook(() => useGachaContracts("unknown-gacha"));

		expect(result.current.gacha).toBeUndefined();
		expect(result.current.treasury).toBeUndefined();
		expect(result.current.trackers).toEqual([]);
		expect(result.current.rarityNames).toEqual([]);
	});

	it("memoizes result - does not recompute on re-render with same gacha ID", () => {
		getGachaContractsMock.mockReturnValue(MOCK_CONTRACTS);

		const { result, rerender } = renderHook(
			({ id }) => useGachaContracts(id),
			{ initialProps: { id: "graded-pokemon" } },
		);

		const firstResult = result.current;
		rerender({ id: "graded-pokemon" });
		const secondResult = result.current;

		// Reference equality proves memoization worked
		expect(firstResult).toBe(secondResult);
		expect(getGachaContractsMock).toHaveBeenCalledTimes(1);
	});

	it("recomputes when gacha ID changes", () => {
		getGachaContractsMock.mockReturnValue(MOCK_CONTRACTS);

		const { rerender } = renderHook(
			({ id }) => useGachaContracts(id),
			{ initialProps: { id: "graded-pokemon" } },
		);

		rerender({ id: "another-gacha" });

		expect(getGachaContractsMock).toHaveBeenCalledTimes(2);
		expect(getGachaContractsMock).toHaveBeenNthCalledWith(1, "graded-pokemon");
		expect(getGachaContractsMock).toHaveBeenNthCalledWith(2, "another-gacha");
	});

	it("includes all expected contract fields", () => {
		getGachaContractsMock.mockReturnValue(MOCK_CONTRACTS);

		const { result } = renderHook(() => useGachaContracts("graded-pokemon"));

		expect(result.current).toHaveProperty("gacha");
		expect(result.current).toHaveProperty("treasury");
		expect(result.current).toHaveProperty("appraisal");
		expect(result.current).toHaveProperty("economyManager");
		expect(result.current).toHaveProperty("gachaServiceHandler");
		expect(result.current).toHaveProperty("appraisalServiceHandler");
		expect(result.current).toHaveProperty("cardGroupedVault");
		expect(result.current).toHaveProperty("buybackVault");
		expect(result.current).toHaveProperty("protocolTreasury");
		expect(result.current).toHaveProperty("trackers");
		expect(result.current).toHaveProperty("rarityNames");
	});

	it("tracker addresses are passed through correctly", () => {
		getGachaContractsMock.mockReturnValue(MOCK_CONTRACTS);

		const { result } = renderHook(() => useGachaContracts("graded-pokemon"));

		expect(result.current.trackers).toHaveLength(2);
		expect(result.current.trackers[0]).toBe(VALID_ADDRESS);
		expect(result.current.trackers[1]).toBe(VALID_ADDRESS_2);
	});
});
