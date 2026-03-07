/**
 * Unit tests for useNFTWithdrawal hook
 */

import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useNFTWithdrawal } from "../useNFTWithdrawal";

vi.mock("wagmi", () => ({
	useAccount: vi.fn(),
	useWriteContract: vi.fn(),
}));

const TREASURY_ADDRESS = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0" as const;
const USER_ADDRESS = "0xce59c4705b86d3E1c28a07A8bcB803A4CCf3a292" as const;
const COLLECTION_ADDRESS = "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2" as const;
const TOKEN_ID = BigInt(42);

describe("useNFTWithdrawal", () => {
	let useAccountMock: ReturnType<typeof vi.fn>;
	let useWriteContractMock: ReturnType<typeof vi.fn>;
	let writeContractAsync: ReturnType<typeof vi.fn>;

	beforeEach(async () => {
		vi.clearAllMocks();

		const wagmi = await import("wagmi");
		useAccountMock = vi.mocked(wagmi.useAccount);
		useWriteContractMock = vi.mocked(wagmi.useWriteContract);

		writeContractAsync = vi.fn().mockResolvedValue("0xdeadbeef");

		useAccountMock.mockReturnValue({ address: USER_ADDRESS });
		useWriteContractMock.mockReturnValue({
			writeContractAsync,
			isPending: false,
		});
	});

	describe("withdrawNFT", () => {
		it("calls writeContractAsync with correct parameters", async () => {
			const { result } = renderHook(() => useNFTWithdrawal(TREASURY_ADDRESS));

			let txHash: string | undefined;
			await act(async () => {
				txHash = await result.current.withdrawNFT(
					COLLECTION_ADDRESS,
					TOKEN_ID,
				);
			});

			expect(writeContractAsync).toHaveBeenCalledWith({
				address: TREASURY_ADDRESS,
				abi: expect.arrayContaining([
					expect.objectContaining({ name: "withdrawMyNFT" }),
				]),
				functionName: "withdrawMyNFT",
				args: [COLLECTION_ADDRESS, TOKEN_ID],
			});
			expect(txHash).toBe("0xdeadbeef");
		});

		it("throws when treasury address is missing", async () => {
			const { result } = renderHook(() => useNFTWithdrawal(undefined));

			await expect(
				act(async () => {
					await result.current.withdrawNFT(COLLECTION_ADDRESS, TOKEN_ID);
				}),
			).rejects.toThrow("Missing treasury address or user wallet");
		});

		it("throws when user wallet is not connected", async () => {
			useAccountMock.mockReturnValue({ address: undefined });
			const { result } = renderHook(() => useNFTWithdrawal(TREASURY_ADDRESS));

			await expect(
				act(async () => {
					await result.current.withdrawNFT(COLLECTION_ADDRESS, TOKEN_ID);
				}),
			).rejects.toThrow("Missing treasury address or user wallet");
		});

		it("propagates contract errors", async () => {
			writeContractAsync.mockRejectedValue(new Error("Contract reverted"));
			const { result } = renderHook(() => useNFTWithdrawal(TREASURY_ADDRESS));

			await expect(
				act(async () => {
					await result.current.withdrawNFT(COLLECTION_ADDRESS, TOKEN_ID);
				}),
			).rejects.toThrow("Contract reverted");
		});
	});

	describe("withdrawMultipleNFTs", () => {
		it("processes each withdrawal sequentially and returns all hashes", async () => {
			writeContractAsync
				.mockResolvedValueOnce("0xhash1")
				.mockResolvedValueOnce("0xhash2");

			const { result } = renderHook(() => useNFTWithdrawal(TREASURY_ADDRESS));

			let hashes: string[] | undefined;
			await act(async () => {
				hashes = await result.current.withdrawMultipleNFTs([
					{ collection: COLLECTION_ADDRESS, tokenId: BigInt(1) },
					{ collection: COLLECTION_ADDRESS, tokenId: BigInt(2) },
				]);
			});

			expect(hashes).toEqual(["0xhash1", "0xhash2"]);
			expect(writeContractAsync).toHaveBeenCalledTimes(2);
		});

		it("throws when treasury address is missing", async () => {
			const { result } = renderHook(() => useNFTWithdrawal(undefined));

			await expect(
				act(async () => {
					await result.current.withdrawMultipleNFTs([
						{ collection: COLLECTION_ADDRESS, tokenId: TOKEN_ID },
					]);
				}),
			).rejects.toThrow(
				"Missing treasury address, user wallet, or withdrawal requests",
			);
		});

		it("throws when withdrawal list is empty", async () => {
			const { result } = renderHook(() => useNFTWithdrawal(TREASURY_ADDRESS));

			await expect(
				act(async () => {
					await result.current.withdrawMultipleNFTs([]);
				}),
			).rejects.toThrow(
				"Missing treasury address, user wallet, or withdrawal requests",
			);
		});

		it("throws when user wallet is not connected", async () => {
			useAccountMock.mockReturnValue({ address: undefined });
			const { result } = renderHook(() => useNFTWithdrawal(TREASURY_ADDRESS));

			await expect(
				act(async () => {
					await result.current.withdrawMultipleNFTs([
						{ collection: COLLECTION_ADDRESS, tokenId: TOKEN_ID },
					]);
				}),
			).rejects.toThrow(
				"Missing treasury address, user wallet, or withdrawal requests",
			);
		});
	});

	describe("isPending", () => {
		it("returns false when no transaction is in flight", () => {
			const { result } = renderHook(() => useNFTWithdrawal(TREASURY_ADDRESS));
			expect(result.current.isPending).toBe(false);
		});

		it("returns true when a transaction is pending", () => {
			useWriteContractMock.mockReturnValue({
				writeContractAsync,
				isPending: true,
			});

			const { result } = renderHook(() => useNFTWithdrawal(TREASURY_ADDRESS));
			expect(result.current.isPending).toBe(true);
		});
	});
});
