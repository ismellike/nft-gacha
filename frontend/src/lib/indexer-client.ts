import { env } from "./env";
import { logger } from "./logger";

/** Base URL for the self-hosted event indexer. `undefined` means disabled. */
const INDEXER_URL = env.NEXT_PUBLIC_INDEXER_URL;

export const isIndexerEnabled = (): boolean => !!INDEXER_URL;

interface IndexerSpinCompleted {
	trigger_id: string;
	requester: string;
	rarity: number;
	collection: string;
	token_id: string;
	appraised_price: string;
	block_number: number;
	tx_hash: string;
	log_index: number;
	timestamp: number;
}

interface IndexerSpinRefunded {
	trigger_id: string;
	requester: string;
	selected_rarity: number;
	refund_amount: string;
	block_number: number;
	tx_hash: string;
	log_index: number;
	timestamp: number;
}

interface IndexerSpinReclaimed {
	trigger_id: string;
	requester: string;
	refund_amount: string;
	block_number: number;
	tx_hash: string;
	log_index: number;
	timestamp: number;
}

export interface IndexerSpinsResponse {
	completed: IndexerSpinCompleted[];
	refunded: IndexerSpinRefunded[];
	reclaimed: IndexerSpinReclaimed[];
}

export interface IndexerSpinLookup {
	status: "completed" | "refunded" | "reclaimed";
	completed: IndexerSpinCompleted | null;
	refunded: IndexerSpinRefunded | null;
	reclaimed: IndexerSpinReclaimed | null;
}

export interface IndexerStatsResponse {
	totalSpins: number;
	totalRefunds: number;
	totalReclaims: number;
	totalDeposits: number;
	rarityBreakdown: { rarity: number; count: number }[];
}

async function fetchIndexer<T>(path: string): Promise<T | null> {
	if (!INDEXER_URL) return null;

	try {
		const res = await fetch(`${INDEXER_URL}${path}`, {
			signal: AbortSignal.timeout(5_000),
		});
		if (!res.ok) {
			logger.network.warn(
				`Indexer returned ${res.status} for ${path}`,
			);
			return null;
		}
		return (await res.json()) as T;
	} catch (err) {
		logger.network.warn("Indexer fetch failed, will fallback to RPC:", err);
		return null;
	}
}

/**
 * Fetch spin history for a user from the indexer.
 * Returns `null` if the indexer is unavailable (caller should fallback to RPC).
 */
export async function fetchSpinHistory(
	userAddress: string,
	limit = 50,
	offset = 0,
): Promise<IndexerSpinsResponse | null> {
	return fetchIndexer<IndexerSpinsResponse>(
		`/api/spins/${userAddress}?limit=${limit}&offset=${offset}`,
	);
}

/**
 * Look up a single spin by trigger ID.
 * Returns `null` if unavailable.
 */
export async function fetchSpinByTriggerId(
	triggerId: string,
): Promise<IndexerSpinLookup | null> {
	return fetchIndexer<IndexerSpinLookup>(`/api/spin/${triggerId}`);
}

/**
 * Fetch global stats from the indexer.
 */
export async function fetchIndexerStats(): Promise<IndexerStatsResponse | null> {
	return fetchIndexer<IndexerStatsResponse>("/api/stats");
}
