import { Address } from "viem";
import { Rarity } from "../../lib/rarityConfig";

/**
 * Status of a spin request
 */
export enum SpinStatus {
	Pending = "pending",
	Completed = "completed",
	Refunded = "refunded",
}

/**
 * Raw event data from RandomnessRequested
 */
export interface RandomnessRequestedEvent {
	triggerId: bigint;
	blockNumber: bigint;
	blockHash: string;
	transactionHash: string;
	timestamp: number;
	requester: Address;
}

/**
 * Raw event data from SpinCompleted
 */
export interface SpinCompletedEvent {
	triggerId: bigint;
	requester: Address;
	rarity: Rarity;
	collection: Address;
	tokenId: bigint;
	appraisedPrice: bigint;
	blockNumber: bigint;
	blockHash: string;
	transactionHash: string;
	timestamp: number;
}

/**
 * Raw event data from SpinRefunded
 */
export interface SpinRefundedEvent {
	triggerId: bigint;
	requester: Address;
	selectedRarity: Rarity;
	refundAmount: bigint;
	blockNumber: bigint;
	blockHash: string;
	transactionHash: string;
	timestamp: number;
}

/**
 * Comprehensive spin history entry
 */
export interface SpinHistoryEntry {
	/** Unique identifier for the spin */
	triggerId: bigint;
	/** Address that initiated the spin */
	requester: Address;
	/** Current status of the spin */
	status: SpinStatus;
	/** Timestamp when the spin was initiated */
	timestamp: number;
	/** Block number where spin was initiated */
	blockNumber: bigint;
	/** Transaction hash for the spin request */
	transactionHash: string;
	/** Completion data if spin was completed */
	completion?: {
		rarity: Rarity;
		collection: Address;
		tokenId: bigint;
		appraisedPrice: bigint;
		completionTransactionHash: string;
		completionTimestamp: number;
	};
	/** Refund data if spin was refunded */
	refund?: {
		selectedRarity: Rarity;
		refundAmount: bigint;
		refundTransactionHash: string;
		refundTimestamp: number;
	};
}

/**
 * Event query parameters for filtering
 */
export interface EventQueryParams {
	/** User address to filter events by */
	userAddress?: Address;
	/** Starting block number for query range */
	fromBlock?: bigint;
	/** Ending block number for query range */
	toBlock?: bigint;
	/** Maximum number of events to return */
	limit?: number;
}

/**
 * Hook return type for event queries
 */
export interface EventQueryResult<T> {
	/** Event data */
	data: T[];
	/** Loading state */
	isLoading: boolean;
	/** Error state */
	error: Error | null;
	/** Refetch function */
	refetch: () => void;
}

/**
 * Spin history query result
 */
export interface SpinHistoryResult {
	/** Array of spin history entries */
	spins: SpinHistoryEntry[];
	/** Total number of spins */
	totalSpins: number;
	/** Number of completed spins */
	completedSpins: number;
	/** Number of refunded spins */
	refundedSpins: number;
	/** Number of pending spins */
	pendingSpins: number;
	/** Loading state */
	isLoading: boolean;
	/** Error state */
	error: Error | null;
	/** Refetch function */
	refetch: () => void;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
	/** Page size */
	pageSize?: number;
	/** Current page (0-indexed) */
	page?: number;
}

/**
 * Spin history with pagination
 */
export interface PaginatedSpinHistoryResult extends SpinHistoryResult {
	/** Current page number */
	currentPage: number;
	/** Total number of pages */
	totalPages: number;
	/** Whether there's a next page */
	hasNextPage: boolean;
	/** Whether there's a previous page */
	hasPreviousPage: boolean;
}
