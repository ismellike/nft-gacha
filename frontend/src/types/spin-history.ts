/**
 * Spin history types and interfaces
 */

export type SpinStatus = "completed" | "refunded" | "reclaimed";

export type SpinStatusFilter = "all" | "completed" | "refunded";

/**
 * Represents a single spin history entry fetched from contract events
 */
export interface SpinHistoryEntry {
	// Unique identifiers
	triggerId: bigint;
	timestamp: number;
	blockNumber: bigint;
	transactionHash: string;

	// Status and type
	status: SpinStatus;

	// Completed spin data (present when status === "completed")
	requester: string;
	rarity?: number; // 0-4 enum (Common, Uncommon, Rare, Epic, Legendary)
	collection?: string;
	tokenId?: string;
	appraisedPrice?: bigint;

	// Refunded spin data (present when status === "refunded" or "reclaimed")
	selectedRarity?: number;
	refundAmount?: bigint;

	// Metadata
	gachaAddress: string;
	gachaId: string;
}

/**
 * Filter options for spin history
 */
export interface SpinHistoryFilters {
	status: SpinStatusFilter;
	dateRange?: {
		start: number;
		end: number;
	};
}

/**
 * Pagination state for spin history
 */
export interface SpinHistoryPagination {
	page: number;
	pageSize: number;
	totalItems: number;
	hasMore: boolean;
	lastFetchedBlock?: bigint;
}

/**
 * Error types for spin history operations
 */
export type SpinHistoryError =
	| { type: "network_error"; message: string }
	| { type: "rpc_error"; message: string }
	| { type: "validation_error"; message: string }
	| { type: "unknown_error"; message: string };

/**
 * Statistics derived from spin history entries
 */
export interface SpinHistoryStats {
	totalSpins: number;
	completedSpins: number;
	refundedSpins: number;
	reclaimedSpins: number;
	winRate: number; // percentage
	totalValueWon: bigint; // total appraised value
	rarityDistribution: Record<number, number>; // count per rarity (0-4)
}
