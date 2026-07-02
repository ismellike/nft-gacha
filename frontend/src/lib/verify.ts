"use client";

import { useEffect, useState } from "react";
import { parseAbiItem } from "viem";
import { usePublicClient } from "wagmi";
import { BLOCK_LOOKBACK } from "./constants";

/**
 * "Provably fair" verification helpers for the spin reveal.
 *
 * Two independent things a user can check for any completed spin:
 *  1. The on-chain fulfillment transaction - the tx where WAVS delivered the
 *     signed randomness envelope and `Gacha.fulfillRandomness` actually
 *     selected the NFT (`SpinCompleted` is emitted here). This is fully
 *     recoverable client-side via `useSpinFulfillmentTx` below and links out
 *     through the existing `getBlockExplorerTxUrl` helper in `./utils`.
 *  2. The DRAND beacon round that seeded that randomness. The gacha contracts
 *     never store the DRAND round number on-chain (only the derived
 *     `bytes32 randomness`, see `RandomnessReceived` in
 *     `GachaServiceHandler.sol`). The WAVS-DRAND component derives the round
 *     deterministically from the *spin request* block timestamp
 *     (`packages/wavs-drand/src/trigger.rs::calculate_drand_round`), but doing
 *     that math client-side would require the DRAND chain's genesis time and
 *     period, which are not currently part of the frontend's config surface.
 *     Until that config is exposed, we link to the general DRAND beacon
 *     explorer instead of a deep link to the exact round.
 */

const SPIN_COMPLETED_EVENT = parseAbiItem(
	"event SpinCompleted(uint256 indexed triggerId, address indexed requester, uint8 rarity, address collection, uint256 tokenId, uint256 appraisedPrice)",
);

/** General DRAND beacon explainer/explorer. Not round-specific (see note above). */
export const DRAND_LEARN_MORE_URL = "https://drand.love/";

export interface SpinFulfillmentInfo {
	transactionHash: `0x${string}`;
	blockNumber: bigint;
}

export interface UseSpinFulfillmentTxResult {
	data: SpinFulfillmentInfo | null;
	isLoading: boolean;
	error: string | null;
}

/**
 * Recovers the `SpinCompleted` fulfillment transaction for a given
 * `triggerId` so the reveal UI can link to it on a block explorer.
 *
 * This intentionally re-derives the log with its own bounded `getLogs` call
 * (same pattern as `useSpinHistoryFetcher`/`pollForSpinFulfillment`) rather
 * than reusing the spin machine's in-flight poll, since the machine only
 * surfaces the decoded `SpinResult` (rarity/collection/tokenId) - not the
 * underlying log's transaction hash or block number.
 */
export function useSpinFulfillmentTx({
	triggerId,
	gachaAddress,
	userAddress,
	enabled = true,
}: {
	triggerId: bigint | null | undefined;
	gachaAddress: `0x${string}` | undefined;
	userAddress: `0x${string}` | undefined;
	enabled?: boolean | undefined;
}): UseSpinFulfillmentTxResult {
	const publicClient = usePublicClient();
	const [data, setData] = useState<SpinFulfillmentInfo | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (
			!enabled ||
			!publicClient ||
			!gachaAddress ||
			!userAddress ||
			triggerId === null ||
			triggerId === undefined
		) {
			return;
		}

		let cancelled = false;
		setIsLoading(true);
		setError(null);

		(async () => {
			try {
				const currentBlock = await publicClient.getBlockNumber();
				const fromBlock =
					currentBlock > BLOCK_LOOKBACK ? currentBlock - BLOCK_LOOKBACK : 0n;

				const logs = await publicClient.getLogs({
					address: gachaAddress,
					event: SPIN_COMPLETED_EVENT,
					args: { triggerId, requester: userAddress },
					fromBlock,
					toBlock: currentBlock,
				});

				if (cancelled) return;

				const log = logs[0];
				setData(
					log
						? {
								transactionHash: log.transactionHash,
								blockNumber: log.blockNumber,
							}
						: null,
				);
			} catch (err) {
				if (!cancelled) {
					setError(
						err instanceof Error
							? err.message
							: "Failed to locate fulfillment transaction",
					);
				}
			} finally {
				if (!cancelled) {
					setIsLoading(false);
				}
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [enabled, publicClient, gachaAddress, userAddress, triggerId]);

	return { data, isLoading, error };
}
