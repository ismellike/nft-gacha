import type { UseAccountReturnType, UseWriteContractReturnType } from "wagmi";
import type { ReadContractReturnType } from "wagmi/actions";
import { vi } from "vitest";

/**
 * Mock useAccount hook return values for testing
 */
export function mockUseAccount(
	overrides?: Partial<UseAccountReturnType>,
): UseAccountReturnType {
	return {
		address: "0x1234567890123456789012345678901234567890" as `0x${string}`,
		addresses: ["0x1234567890123456789012345678901234567890" as `0x${string}`],
		chain: undefined,
		chainId: 17000,
		connector: undefined,
		isConnected: true,
		isConnecting: false,
		isDisconnected: false,
		isReconnecting: false,
		status: "connected",
		...overrides,
	} as UseAccountReturnType;
}

/**
 * Mock useReadContract hook return values for testing
 */
export function mockUseReadContract<TData = unknown>(overrides?: {
	data?: TData | undefined;
	isLoading?: boolean | undefined;
	isError?: boolean | undefined;
	error?: Error | null | undefined;
	refetch?: (() => void) | undefined;
}) {
	return {
		data: undefined,
		dataUpdatedAt: 0,
		error: null,
		errorUpdateCount: 0,
		errorUpdatedAt: 0,
		failureCount: 0,
		failureReason: null,
		fetchStatus: "idle",
		isError: false,
		isFetched: false,
		isFetchedAfterMount: false,
		isFetching: false,
		isLoading: false,
		isLoadingError: false,
		isPaused: false,
		isPending: false,
		isPlaceholderData: false,
		isRefetchError: false,
		isRefetching: false,
		isStale: false,
		isSuccess: false,
		queryKey: [],
		refetch: vi.fn(),
		status: "pending",
		...overrides,
	};
}

/**
 * Mock useWriteContract hook return values for testing
 */
export function mockUseWriteContract(
	overrides?: Partial<UseWriteContractReturnType>,
): UseWriteContractReturnType {
	return {
		data: undefined,
		error: null,
		failureCount: 0,
		failureReason: null,
		isPending: false,
		isError: false,
		isIdle: true,
		isSuccess: false,
		reset: vi.fn(),
		status: "idle",
		submittedAt: 0,
		variables: undefined,
		writeContract: vi.fn(),
		writeContractAsync: vi.fn(),
		...overrides,
	} as UseWriteContractReturnType;
}

/**
 * Mock PublicClient for testing contract reads
 */
export function mockPublicClient<TData = unknown>(readContractReturn?: TData) {
	return {
		readContract: vi.fn(
			async () => readContractReturn as ReadContractReturnType,
		),
		getBlockNumber: vi.fn(async () => 12345n),
		getBlock: vi.fn(async () => ({
			number: 12345n,
			timestamp: BigInt(Date.now() / 1000),
			hash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
		})),
		getTransactionReceipt: vi.fn(async () => ({
			transactionHash:
				"0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
			status: "success" as const,
			blockNumber: 12345n,
		})),
		getLogs: vi.fn(async () => []),
		watchBlockNumber: vi.fn(() => vi.fn()),
		watchContractEvent: vi.fn(() => vi.fn()),
	};
}
