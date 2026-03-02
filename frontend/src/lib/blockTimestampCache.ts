import type { PublicClient } from "viem";

/**
 * Shared module-level cache for block timestamps.
 * Prevents duplicate getBlock() calls across components that both need
 * to resolve block numbers to timestamps (e.g., spin history, activity feed).
 */
const blockTimestampCache = new Map<string, number>();

/**
 * Fetch the timestamp for a single block, using the shared cache.
 */
async function getBlockTimestamp(
	publicClient: PublicClient,
	blockNumber: bigint,
): Promise<number> {
	const key = blockNumber.toString();
	const cached = blockTimestampCache.get(key);
	if (cached !== undefined) return cached;

	const block = await publicClient.getBlock({ blockNumber });
	const ts = Number(block.timestamp);
	blockTimestampCache.set(key, ts);
	return ts;
}

/**
 * Batch-fetch timestamps for multiple blocks, returning a
 * blockNumber-string → timestamp record.
 */
export async function getBlockTimestamps(
	publicClient: PublicClient,
	blockNumbers: bigint[],
): Promise<Record<string, number>> {
	const results = await Promise.all(
		blockNumbers.map(async (blockNumber): Promise<[string, number]> => {
			try {
				const ts = await getBlockTimestamp(publicClient, blockNumber);
				return [blockNumber.toString(), ts];
			} catch {
				return [blockNumber.toString(), Date.now() / 1000];
			}
		}),
	);

	const timestamps: Record<string, number> = {};
	for (const [key, value] of results) {
		timestamps[key] = value;
	}
	return timestamps;
}
