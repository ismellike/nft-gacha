"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAccount, useWatchContractEvent, usePublicClient } from "wagmi";
import {
	loadFromStorage,
	pollForSpinFulfillment,
	validatePendingSpins,
	MAX_RETRIES,
} from "../machines/gachaSpinMachine";
import { useGachaStore } from "../stores/gachaStore";
import type { SpinResult, RefundResult } from "../machines/gachaSpinMachine";
import { useGachaContracts } from "./useGachaContracts";
import { useGachaId } from "./useGachaId";
import { gachaAbi } from "../generated";
import { rarityBigIntToName } from "../lib/rarity-utils";

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

export function useGachaSpinMachine(
	onSpinComplete?: () => void,
	onRefund?: () => void,
): UseGachaSpinMachineReturn {
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

	// Watch for SpinCompleted events from the contract
	useWatchContractEvent({
		address: contracts.gacha as `0x${string}` | undefined,
		enabled: !!contracts.gacha && Boolean(userAddress),
		pollingInterval: 3000, // Poll every 3 seconds - more frequent for active spins
		abi: gachaAbi,
		eventName: "SpinCompleted",
		args: userAddress ? { requester: userAddress } : undefined,
		onLogs(logs) {
			console.log("🔍 [useWatchContractEvent] SpinCompleted logs received:", {
				logCount: logs.length,
				currentState: state.value,
				currentTriggerId: state.context.triggerId?.toString(),
				userAddress,
			});

			// Process logs even if not strictly in waitingForFulfillment state
			// This handles race conditions where the event fires before confirmTransaction is called
			for (const log of logs) {
				const { triggerId, rarity, collection, tokenId } = log.args;

				console.log("📋 [useWatchContractEvent] Processing log:", {
					logTriggerId: triggerId?.toString(),
					rarity,
					collection,
					tokenId: tokenId?.toString(),
				});

				// Accept the event if:
				// 1. We have a triggerId in the log
				// 2. We either have a matching triggerId in state OR we're in spinning/waiting state
				// 3. We haven't already revealed or gone to idle
				if (
					triggerId &&
					!state.matches("revealing") &&
					!state.matches("idle") &&
					(state.matches("spinning") ||
						state.matches("waitingForFulfillment") ||
						triggerId === state.context.triggerId)
				) {
					const result: SpinResult = {
						rarity: rarityBigIntToName(rarity),
						collection: collection || "",
						tokenId: tokenId?.toString() || "",
					};

					console.log("✅ [useWatchContractEvent] Accepting SpinCompleted! Updating to revealing:", result);
					updateState("revealing", {
						spinResult: result,
						refundResult: null,
						error: null,
						triggerId: triggerId, // Update triggerId in state too
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
					console.log("⏭️ [useWatchContractEvent] Skipping log - conditions not met:", {
						hasTriggerId: !!triggerId,
						hasContextTriggerId: !!state.context.triggerId,
						triggerIdMatch: triggerId === state.context.triggerId,
						isSpinning: state.matches("spinning"),
						isWaiting: state.matches("waitingForFulfillment"),
						isRevealing: state.matches("revealing"),
						isIdle: state.matches("idle"),
					});
				}
			}
		},
	});

	// Restore state from localStorage on mount/account change
	useEffect(() => {
		if (
			!userAddress ||
			!publicClient ||
			!state.matches("idle") ||
			!contracts.gacha
		)
			return;

		// First, validate and clean expired/invalid pending spins
		validatePendingSpins(publicClient)
			.then(() => {
				const storedTriggerId = contracts.gacha
					? loadFromStorage(userAddress, contracts.gacha)
					: null;
				if (storedTriggerId) {
					// Only restore if we have a valid stored trigger ID
					console.log(
						"🔄 [useGachaSpinMachine] Restoring pending spin:",
						storedTriggerId,
					);
					if (contracts.gacha) {
						updateState("waitingForFulfillment", {
							userAddress,
							publicClient,
							gachaAddress: contracts.gacha,
							triggerId: storedTriggerId,
						});
					}
				}
			})
			.catch((error) => {
				console.warn("Failed to validate pending spins:", error);
				// Continue with normal operation even if validation fails
				const storedTriggerId = contracts.gacha
					? loadFromStorage(userAddress, contracts.gacha)
					: null;
				if (storedTriggerId) {
					console.log(
						"🔄 [useGachaSpinMachine] Restoring pending spin (validation failed):",
						storedTriggerId,
					);
					if (contracts.gacha) {
						updateState("waitingForFulfillment", {
							userAddress,
							publicClient,
							gachaAddress: contracts.gacha,
							triggerId: storedTriggerId,
						});
					}
				}
			});
	}, [userAddress, publicClient, contracts.gacha, state.matches, updateState]);

	// Actions
	const startSpin = () => {
		if (userAddress && publicClient && contracts.gacha) {
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
		console.log("📝 [confirmTransaction] Called with triggerId:", triggerId.toString());
		if (state.context.userAddress && state.context.gachaAddress) {
			useGachaStore.getState().addPendingSpin({
				userAddress: state.context.userAddress,
				gachaAddress: state.context.gachaAddress,
				triggerId,
			});
			console.log("✅ [confirmTransaction] Added to pending spins", {
				userAddress: state.context.userAddress,
				gachaAddress: state.context.gachaAddress,
				triggerId: triggerId.toString(),
			});
		}
		updateState("waitingForFulfillment", {
			triggerId,
			retryCount: 0,
		});
		console.log("🔄 [confirmTransaction] State updated to waitingForFulfillment");
	};

	const fulfillSpin = (result: SpinResult) => {
		updateState("revealing", {
			spinResult: result,
			refundResult: null,
			error: null,
		});
		onSpinComplete?.();
	};

	const closeReveal = () => updateState("idle", { spinResult: null });
	const retry = () => {
		if (state.context.retryCount < MAX_RETRIES) {
			updateState("waitingForFulfillment", {
				retryCount: state.context.retryCount + 1,
				error: null,
			});
		}
	};
	const reset = () =>
		updateState("idle", {
			triggerId: null,
			spinResult: null,
			refundResult: null,
			error: null,
			retryCount: 0,
		});
	const timeout = () =>
		updateState("timeout", {
			error:
				"Randomness generation timed out. You can reclaim your funds or try again.",
		});
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

		if (isPollingRef.current) return;
		isPollingRef.current = true;

		pollForSpinFulfillment({
			triggerId: state.context.triggerId,
			userAddress: state.context.userAddress,
			publicClient: state.context.publicClient,
			gachaAddress: state.context.gachaAddress,
		})
			.then((result) => {
				updateState("revealing", {
					spinResult: result,
					refundResult: null,
					error: null,
				});
				onSpinComplete?.();
				if (state.context.userAddress && state.context.gachaAddress) {
					useGachaStore
						.getState()
						.removePendingSpin(
							state.context.userAddress,
							state.context.gachaAddress,
						);
				}
			})
			.catch((error) => {
				const errorMessage = (error as Error)?.message || "";
				if (errorMessage.startsWith("REFUND:")) {
					try {
						const payload = JSON.parse(errorMessage.slice("REFUND:".length));
						updateState("refunded", {
							refundResult: {
								selectedRarity: payload.selectedRarity,
								refundAmount: BigInt(payload.refundAmount),
							},
							error: null,
						});
						if (state.context.userAddress && state.context.gachaAddress) {
							useGachaStore
								.getState()
								.removePendingSpin(
									state.context.userAddress,
									state.context.gachaAddress,
								);
						}
					} catch (parseError) {
						console.error("Failed to parse refund payload", parseError);
						updateState("error", { error: errorMessage });
					}
				} else {
					updateState("error", { error: errorMessage || "Polling failed" });
				}
			})
			.finally(() => {
				isPollingRef.current = false;
			});

		return () => {
			if (pollingRef.current) clearTimeout(pollingRef.current);
			isPollingRef.current = false;
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
			console.log(
				"💰 [useGachaSpinMachine] Refund completed, triggering balance refresh",
			);
			onRefund?.();
		}
	}, [isRefunded, state.context.refundResult, onRefund]);

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
		clearPendingSpins,
	};
}
