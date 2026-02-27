"use client";

import type { MutableRefObject } from "react";
import {
	useWatchNftAppraisalAppraisalStatusChanged,
	useWatchNftAppraisalServiceHandlerAppraisalErrorReceived,
	useWatchNftAppraisalServiceHandlerAppraisalProcessed,
} from "../generated";
import { useNFTAppraisalStore } from "../stores/nftAppraisalStore";
import type { AppraisalResult } from "../async-utils/nftAppraisalMachine";

type AppraisalStatus =
	| "idle"
	| "approving"
	| "submitting"
	| "waitingForCompletion"
	| "completed"
	| "error";

type SubmissionOutcome = "pending" | "success" | "refunded" | "failed" | null;

interface SubmittedNFT {
	collection: string;
	tokenId: string;
}

interface UseAppraisalEventsParams {
	appraisalServiceHandlerAddress: `0x${string}` | undefined;
	appraisalContractAddress: `0x${string}` | undefined;
	lastSubmittedRef: MutableRefObject<SubmittedNFT | null>;
	appraisalFee: bigint | undefined;
	userAddress: `0x${string}` | undefined;
	onStatusChange: (status: AppraisalStatus) => void;
	onAppraisalResult: (result: AppraisalResult) => void;
	onError: (message: string) => void;
	onOutcomeChange: (outcome: SubmissionOutcome) => void;
}

/**
 * Subscribes to the three appraisal-related contract events and dispatches
 * state updates via callbacks.
 *
 * Events watched:
 * - AppraisalProcessed (service handler) – oracle confirmed result
 * - AppraisalErrorReceived (service handler) – oracle error
 * - AppraisalStatusChanged (appraisal contract) – on-chain status update
 */
export function useAppraisalEvents({
	appraisalServiceHandlerAddress,
	appraisalContractAddress,
	lastSubmittedRef,
	appraisalFee,
	userAddress,
	onStatusChange,
	onAppraisalResult,
	onError,
	onOutcomeChange,
}: UseAppraisalEventsParams): void {
	// Oracle: successful appraisal
	useWatchNftAppraisalServiceHandlerAppraisalProcessed({
		address: appraisalServiceHandlerAddress,
		enabled: !!appraisalServiceHandlerAddress && !!lastSubmittedRef.current,
		onLogs: (logs: unknown[]) => {
			const latest = lastSubmittedRef.current;
			if (!latest) return;

			for (const log of logs) {
				const { collection, tokenId, priceUSD, success, timestamp } = ((
					log as { args?: unknown }
				).args || {}) as {
					collection?: `0x${string}`;
					tokenId?: bigint;
					priceUSD?: bigint;
					success?: boolean;
					timestamp?: bigint;
				};

				const matchesCollection =
					collection?.toLowerCase() === latest.collection.toLowerCase();
				const matchesToken =
					tokenId !== undefined &&
					BigInt(tokenId).toString() === BigInt(latest.tokenId).toString();

				if (!matchesCollection || !matchesToken) continue;

				if (success) {
					onOutcomeChange("success");
					onStatusChange("completed");
					onAppraisalResult({
						collection: latest.collection,
						tokenId: latest.tokenId,
						appraisalData: [
							true,
							priceUSD ?? BigInt(0),
							BigInt(0),
							"",
							BigInt(timestamp ?? Math.floor(Date.now() / 1000)),
						],
					});
					if (userAddress) {
						useNFTAppraisalStore.getState().refreshUserAppraisals(userAddress);
					}
				} else {
					onOutcomeChange("failed");
					onError("Appraisal processing failed.");
					onStatusChange("error");
					if (userAddress) {
						useNFTAppraisalStore.getState().refreshUserAppraisals(userAddress);
					}
				}

				lastSubmittedRef.current = null;
				break;
			}
		},
	});

	// Oracle: error received
	useWatchNftAppraisalServiceHandlerAppraisalErrorReceived({
		address: appraisalServiceHandlerAddress,
		enabled: !!appraisalServiceHandlerAddress && !!lastSubmittedRef.current,
		onLogs: (logs: unknown[]) => {
			const latest = lastSubmittedRef.current;
			if (!latest) return;

			for (const log of logs) {
				const { contractAddress, tokenId, error } = ((log as { args?: unknown })
					.args || {}) as {
					contractAddress?: `0x${string}`;
					tokenId?: bigint;
					error?: string;
				};

				const matchesCollection =
					contractAddress?.toLowerCase() === latest.collection.toLowerCase();
				const matchesToken =
					tokenId !== undefined &&
					BigInt(tokenId).toString() === BigInt(latest.tokenId).toString();

				if (!matchesCollection || !matchesToken) continue;

				onOutcomeChange("failed");
				onError(
					error ? `Appraisal error: ${error}` : "Appraisal failed to process.",
				);
				onStatusChange("error");
				if (userAddress) {
					useNFTAppraisalStore.getState().refreshUserAppraisals(userAddress);
				}
				lastSubmittedRef.current = null;
				break;
			}
		},
	});

	// On-chain: appraisal status changed
	useWatchNftAppraisalAppraisalStatusChanged({
		address: appraisalContractAddress,
		enabled: !!appraisalContractAddress && !!lastSubmittedRef.current,
		onLogs: (logs: unknown[]) => {
			const latest = lastSubmittedRef.current;
			if (!latest) return;

			for (const log of logs) {
				const { collection, tokenId, newStatus } = ((log as { args?: unknown })
					.args || {}) as {
					collection?: `0x${string}`;
					tokenId?: bigint;
					newStatus?: bigint | number;
				};

				const matchesCollection =
					collection?.toLowerCase() === latest.collection.toLowerCase();
				const matchesToken =
					tokenId !== undefined &&
					BigInt(tokenId).toString() === BigInt(latest.tokenId).toString();

				if (!matchesCollection || !matchesToken) continue;
				if (newStatus === undefined) continue;

				const statusValue = Number(newStatus);
				// 1 = Completed, 2 = OwnerOverride
				if (statusValue === 1 || statusValue === 2) {
					onOutcomeChange("success");
					onStatusChange("completed");
					onAppraisalResult({
						collection: latest.collection,
						tokenId: latest.tokenId,
						appraisalData: [
							true,
							appraisalFee ?? BigInt(0),
							BigInt(0),
							"",
							BigInt(Date.now()),
						],
					});
				} else if (statusValue === 0) {
					// Still pending; keep waiting
					continue;
				} else {
					// Refunded/failed
					onOutcomeChange("refunded");
					onError(
						"Appraisal was not completed and the fee should be refunded.",
					);
					onStatusChange("error");
				}

				lastSubmittedRef.current = null;
				break;
			}
		},
	});
}
