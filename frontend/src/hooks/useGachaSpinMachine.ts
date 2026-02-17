"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAccount, usePublicClient, useWatchContractEvent } from "wagmi";
import type { RefundResult, SpinResult } from "../async-utils/gachaSpinMachine";
import {
	loadFromStorage,
	MAX_RETRIES,
	pollForSpinFulfillment,
	validatePendingSpins,
} from "../async-utils/gachaSpinMachine";
import { gachaAbi } from "../generated";
import { createDebugLogger, DEBUG_FLAGS } from "../lib/logger";
import { rarityBigIntToName } from "../lib/rarity-utils";
import { useGachaStore } from "../stores/gachaStore";
import { useGachaContracts } from "./useGachaContracts";
import { useGachaId } from "./useGachaId";

export interface UseGachaSpinMachineReturn {
	// State
	state: string;
	isIdle: boolean;
	isSpinning: boolean;
	isWaitingForFulfillment: boolean;
	isRevealing: boolean;
	isError: boolean;
	isTimeout: boolean;
	isRefunded: boolean;
	canRetry: boolean;

	// Context
	triggerId: bigint | null;
	spinResult: SpinResult | null;
	refundResult: RefundResult | null;
	error: string | null;
	retryCount: number;

	// Actions
	startSpin: () => void;
	confirmTransaction: (triggerId: bigint) => void;
	fulfillSpin: (result: SpinResult) => void;
	closeReveal: () => void;
	retry: () => void;
	reset: () => void;
	timeout: () => void;
	setError: (error: string) => void;
	clearPendingSpins: () => void;
}

type GachaSpinStatus =
	| "idle"
	| "spinning"
	| "waitingForFulfillment"
	| "revealing"
	| "error"
	| "timeout"
	| "refunded";

interface GachaSpinLocalState {
	value: GachaSpinStatus;
	context: {
		triggerId: bigint | null;
		spinResult: SpinResult | null;
		refundResult: RefundResult | null;
		userAddress: string | null;
		publicClient: ReturnType<typeof usePublicClient> | undefined;
		gachaAddress: string | null;
		error: string | null;
		retryCount: number;
	};
	matches: (status: GachaSpinStatus) => boolean;
}

const buildState = (
	value: GachaSpinStatus,
	context: GachaSpinLocalState["context"],
): GachaSpinLocalState => ({
	value,
	context,
	matches: (status: GachaSpinStatus) => status === value,
});

const buildSpinResult = (args: {
	rarity?: bigint | number;
	collection?: string;
	tokenId?: bigint;
}): SpinResult | null => {
	if (
		args.rarity === undefined ||
		!args.collection ||
		args.tokenId === undefined
	) {
		return null;
	}

	return {
		rarity: rarityBigIntToName(args.rarity),
		collection: args.collection,
		tokenId: args.tokenId.toString(),
	};
};

export function useGachaSpinMachine(
	onSpinComplete?: () => void,
	onRefund?: () => void,
): UseGachaSpinMachineReturn {
	const debugLog = createDebugLogger(DEBUG_FLAGS.GACHA_SPIN);
	const { address: userAddress } = useAccount();
	const publicClient = usePublicClient();
	const gachaId = useGachaId();
	const contracts = useGachaContracts(gachaId);

	const [state, setState] = useState<GachaSpinLocalState>(() =>
		buildState("idle", {
			triggerId: null,
			spinResult: null,
			refundResult: null,
			userAddress: null,
			publicClient: undefined,
			gachaAddress: null,
			error: null,
			retryCount: 0,
		}),
	);
	const pollingRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const isPollingRef = useRef(false);
	const isMountedRef = useRef(true);
	const pollingAbortRef = useRef<AbortController | null>(null);
	const hasTransitionedToRevealRef = useRef(false);

	const updateState = useCallback(
		(
			value: GachaSpinStatus,
			patch: Partial<GachaSpinLocalState["context"]> = {},
		) =>
			setState((prev) =>
				buildState(value, {
					...prev.context,
					...patch,
				}),
			),
		[],
	);

	const shouldAcceptSpinCompletedLog = useCallback(
		(triggerId?: bigint) => {
			// Never accept if we're already done with this flow
			if (state.matches("revealing") || state.matches("idle")) {
				return false;
			}

			// Must have a triggerId in the log
			if (!triggerId) {
				return false;
			}

			// Only accept logs if we're in "waitingForFulfillment" state with a matching triggerId
			// This prevents accepting logs for other pending spins or old sessions
			if (state.matches("waitingForFulfillment")) {
				return triggerId === state.context.triggerId;
			}

			// Don't accept logs while "spinning" - wait for confirmTransaction to set the triggerId
			// The polling mechanism will handle fulfillment once we have the triggerId
			return false;
		},
		[state.matches, state.context.triggerId],
	);

	// Watch for SpinCompleted events from the contract
	useWatchContractEvent({
		address: contracts.gacha as `0x${string}` | undefined,
		enabled: !!contracts.gacha && Boolean(userAddress),
		pollingInterval: 3000, // Poll every 3 seconds - more frequent for active spins
		abi: gachaAbi,
		eventName: "SpinCompleted",
		args: userAddress ? { requester: userAddress } : undefined,
		onLogs(logs) {
			debugLog("🔍 [useWatchContractEvent] SpinCompleted logs received:", {
				logCount: logs.length,
				currentState: state.value,
				currentTriggerId: state.context.triggerId?.toString(),
				userAddress,
			});

			// Process logs - only accept if they match the active triggerId
			for (const log of logs) {
				const { triggerId, rarity, collection, tokenId } = log.args;

				debugLog("📋 [useWatchContractEvent] Processing log:", {
					logTriggerId: triggerId?.toString(),
					rarity,
					collection,
					tokenId: tokenId?.toString(),
				});

				// Only accept the event if it matches our active triggerId
				if (shouldAcceptSpinCompletedLog(triggerId)) {
					// Build result object with only defined values to avoid exactOptionalPropertyTypes issues
					const resultArgs: {
						rarity?: number | bigint;
						collection?: string;
						tokenId?: bigint;
					} = {};
					if (rarity !== undefined) resultArgs.rarity = rarity;
					if (collection !== undefined) resultArgs.collection = collection;
					if (tokenId !== undefined) resultArgs.tokenId = tokenId;

					const result = buildSpinResult(resultArgs);

					if (!result) {
						console.warn(
							"[useWatchContractEvent] SpinCompleted log missing fields",
						);
						continue;
					}

					if (hasTransitionedToRevealRef.current) break;
					hasTransitionedToRevealRef.current = true;
					debugLog(
						"✅ [useWatchContractEvent] Accepting SpinCompleted! Updating to revealing:",
						result,
					);
					updateState("revealing", {
						spinResult: result,
						refundResult: null,
						error: null,
					});
					onSpinComplete?.();

					// Clean up pending spins if we have user info
					if (state.context.userAddress && state.context.gachaAddress) {
						useGachaStore
							.getState()
							.removePendingSpin(
								state.context.userAddress,
								state.context.gachaAddress,
							);
					}
					break;
				} else {
					debugLog(
						"⏭️ [useWatchContractEvent] Skipping log - conditions not met:",
						{
							hasTriggerId: !!triggerId,
							hasContextTriggerId: !!state.context.triggerId,
							triggerIdMatch: triggerId === state.context.triggerId,
							isSpinning: state.matches("spinning"),
							isWaiting: state.matches("waitingForFulfillment"),
							isRevealing: state.matches("revealing"),
							isIdle: state.matches("idle"),
						},
					);
				}
			}
		},
	});

	// Restore state from localStorage on mount/account change
	// Extract gachaAddress to avoid unstable dependency on contracts object
	const gachaAddress = contracts.gacha;

	useEffect(() => {
		if (
			!userAddress ||
			!publicClient ||
			!state.matches("idle") ||
			!gachaAddress
		)
			return;

		// First, validate and clean expired/invalid pending spins
		validatePendingSpins(publicClient)
			.then(() => {
				const storedTriggerId = gachaAddress
					? loadFromStorage(userAddress, gachaAddress)
					: null;
				if (storedTriggerId) {
					// Only restore if we have a valid stored trigger ID
					debugLog(
						"🔄 [useGachaSpinMachine] Restoring pending spin:",
						storedTriggerId,
					);
					updateState("waitingForFulfillment", {
						userAddress,
						publicClient,
						gachaAddress,
						triggerId: storedTriggerId,
					});
				}
			})
			.catch((error) => {
				console.warn("Failed to validate pending spins:", error);
				// Continue with normal operation even if validation fails
				const storedTriggerId = gachaAddress
					? loadFromStorage(userAddress, gachaAddress)
					: null;
				if (storedTriggerId) {
					debugLog(
						"🔄 [useGachaSpinMachine] Restoring pending spin (validation failed):",
						storedTriggerId,
					);
					updateState("waitingForFulfillment", {
						userAddress,
						publicClient,
						gachaAddress,
						triggerId: storedTriggerId,
					});
				}
			});
	}, [
		userAddress,
		publicClient,
		gachaAddress,
		state.matches,
		updateState,
		debugLog,
	]);

	// Actions
	const startSpin = () => {
		if (userAddress && publicClient && contracts.gacha) {
			hasTransitionedToRevealRef.current = false;
			updateState("spinning", {
				userAddress,
				publicClient,
				gachaAddress: contracts.gacha,
				error: null,
				retryCount: 0,
				spinResult: null,
				refundResult: null,
			});
		}
	};

	const confirmTransaction = (triggerId: bigint) => {
		debugLog(
			"📝 [confirmTransaction] Called with triggerId:",
			triggerId.toString(),
		);
		if (state.context.userAddress && state.context.gachaAddress) {
			useGachaStore.getState().addPendingSpin({
				userAddress: state.context.userAddress,
				gachaAddress: state.context.gachaAddress,
				triggerId,
			});
			debugLog("✅ [confirmTransaction] Added to pending spins", {
				userAddress: state.context.userAddress,
				gachaAddress: state.context.gachaAddress,
				triggerId: triggerId.toString(),
			});
		}
		updateState("waitingForFulfillment", {
			triggerId,
			retryCount: 0,
		});
		debugLog("🔄 [confirmTransaction] State updated to waitingForFulfillment");
	};

	const fulfillSpin = (result: SpinResult) => {
		updateState("revealing", {
			spinResult: result,
			refundResult: null,
			error: null,
		});
		onSpinComplete?.();
	};

	const closeReveal = () => {
		hasTransitionedToRevealRef.current = false;
		updateState("idle", { spinResult: null, triggerId: null });
	};
	const retry = () => {
		if (state.context.retryCount < MAX_RETRIES) {
			updateState("waitingForFulfillment", {
				retryCount: state.context.retryCount + 1,
				error: null,
			});
		}
	};
	const reset = () => {
		hasTransitionedToRevealRef.current = false;
		updateState("idle", {
			triggerId: null,
			spinResult: null,
			refundResult: null,
			error: null,
			retryCount: 0,
		});
	};
	const timeout = () =>
		updateState("timeout", {
			error:
				"Randomness generation timed out. You can reclaim your funds or try again.",
		});
	const setError = (errorMessage: string) =>
		updateState("error", { error: errorMessage });
	const clearPendingSpins = () => {
		// Clear just this gacha's pending spins, not all
		if (userAddress && contracts.gacha) {
			useGachaStore.getState().removePendingSpin(userAddress, contracts.gacha);
		}
		reset();
	};

	// Kick off polling while waiting for fulfillment
	useEffect(() => {
		if (
			!state.matches("waitingForFulfillment") ||
			!state.context.triggerId ||
			!state.context.userAddress ||
			!state.context.publicClient ||
			!state.context.gachaAddress
		) {
			return;
		}

		// Use atomic check with immediate set to prevent race conditions
		if (isPollingRef.current) return;
		isPollingRef.current = true;

		// Create abort controller for this polling session
		const abortController = new AbortController();
		pollingAbortRef.current = abortController;
		const signal = abortController.signal;

		// Capture current context to avoid closure issues
		const currentContext = {
			triggerId: state.context.triggerId,
			userAddress: state.context.userAddress,
			publicClient: state.context.publicClient,
			gachaAddress: state.context.gachaAddress,
		};

		pollForSpinFulfillment({
			triggerId: currentContext.triggerId,
			userAddress: currentContext.userAddress,
			publicClient: currentContext.publicClient,
			gachaAddress: currentContext.gachaAddress,
			signal,
		})
			.then((pollingResult) => {
				if (!signal.aborted && isMountedRef.current) {
					if (pollingResult.type === "completed") {
						if (hasTransitionedToRevealRef.current) return;
						hasTransitionedToRevealRef.current = true;
						updateState("revealing", {
							spinResult: pollingResult.result,
							refundResult: null,
							error: null,
						});
						onSpinComplete?.();
					} else {
						updateState("refunded", {
							refundResult: pollingResult.refundResult,
							error: null,
						});
					}
					if (currentContext.userAddress && currentContext.gachaAddress) {
						useGachaStore
							.getState()
							.removePendingSpin(
								currentContext.userAddress,
								currentContext.gachaAddress,
							);
					}
				}
			})
			.catch((error) => {
				if (!signal.aborted && isMountedRef.current) {
					const errorMessage = (error as Error)?.message || "Polling failed";
					updateState("error", { error: errorMessage });
				}
			})
			.finally(() => {
				// Only clear polling ref if this is still the active polling session
				if (pollingAbortRef.current === abortController) {
					isPollingRef.current = false;
				}
			});

		// Cleanup function - abort any ongoing polling
		return () => {
			if (pollingRef.current) clearTimeout(pollingRef.current);
			if (pollingAbortRef.current === abortController) {
				abortController.abort();
				pollingAbortRef.current = null;
				isPollingRef.current = false;
			}
		};
	}, [
		state.matches,
		state.context.triggerId,
		state.context.userAddress,
		state.context.publicClient,
		state.context.gachaAddress,
		onSpinComplete,
		updateState,
	]);

	// Derived state
	const isIdle = state.matches("idle");
	const isSpinning = state.matches("spinning");
	const isWaitingForFulfillment = state.matches("waitingForFulfillment");
	const isRevealing = state.matches("revealing");
	const isError = state.matches("error");
	const isTimeout = state.matches("timeout");
	const isRefunded = state.matches("refunded");
	const canRetry = state.context.retryCount < MAX_RETRIES;

	// Handle refund completion
	useEffect(() => {
		if (isRefunded && state.context.refundResult) {
			debugLog(
				"💰 [useGachaSpinMachine] Refund completed, triggering balance refresh",
			);
			onRefund?.();
		}
	}, [isRefunded, state.context.refundResult, onRefund, debugLog]);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			isMountedRef.current = false;
		};
	}, []);

	return {
		// State
		state: state.value as string,
		isIdle,
		isSpinning,
		isWaitingForFulfillment,
		isRevealing,
		isError,
		isTimeout,
		isRefunded,
		canRetry,

		// Context
		triggerId: state.context.triggerId,
		spinResult: state.context.spinResult,
		refundResult: state.context.refundResult,
		error: state.context.error,
		retryCount: state.context.retryCount,

		// Actions
		startSpin,
		confirmTransaction,
		fulfillSpin,
		closeReveal,
		retry,
		reset,
		timeout,
		setError,
		clearPendingSpins,
	};
}
