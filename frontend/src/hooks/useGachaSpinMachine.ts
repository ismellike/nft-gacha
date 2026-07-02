"use client";

import { useCallback, useEffect, useRef } from "react";
import { useAccount, useAccountEffect, usePublicClient } from "wagmi";
import { useActorRef, useSelector } from "@xstate/react";
import type { RefundResult, SpinResult } from "../async-utils/gachaSpinMachine";
import {
	loadFromStorage,
	validatePendingSpins,
} from "../async-utils/gachaSpinMachine";
import {
	gachaSpinMachine,
	MAX_RETRIES,
	type GachaSpinContext,
} from "../machines/gachaSpinMachine";
import { createDebugLogger, DEBUG_FLAGS, logger } from "../lib/logger";
import { useGachaStore } from "../stores/gachaStore";
import { useGachaContracts } from "./useGachaContracts";
import { useGachaId } from "./useGachaId";

const debugLog = createDebugLogger(DEBUG_FLAGS.GACHA_SPIN);

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

// Selectors — stable references for useSelector
const selectStateValue = (state: { value: string }) => state.value as string;
const selectContext = (state: { context: GachaSpinContext }) => state.context;

export function useGachaSpinMachine(
	onSpinComplete?: () => void,
	onRefund?: () => void,
): UseGachaSpinMachineReturn {
	const { address: userAddress } = useAccount();
	const publicClient = usePublicClient();
	const gachaId = useGachaId();
	const contracts = useGachaContracts(gachaId);
	const gachaAddress = contracts.gacha;

	const actorRef = useActorRef(gachaSpinMachine);
	const stateValue = useSelector(actorRef, selectStateValue);
	const context = useSelector(actorRef, selectContext);

	// Stable refs for callbacks that shouldn't restart effects
	const onSpinCompleteRef = useRef(onSpinComplete);
	onSpinCompleteRef.current = onSpinComplete;
	const onRefundRef = useRef(onRefund);
	onRefundRef.current = onRefund;

	// Derived state
	const isIdle = stateValue === "idle";
	const isSpinning = stateValue === "spinning";
	const isWaitingForFulfillment = stateValue === "waitingForFulfillment";
	const isRevealing = stateValue === "revealing";
	const isError = stateValue === "error";
	const isTimeout = stateValue === "timeout";
	const isRefunded = stateValue === "refunded";
	const canRetry = context.retryCount < MAX_RETRIES;

	// Persist pending spins to Zustand store on state transitions
	useEffect(() => {
		let prevState = actorRef.getSnapshot().value as string;
		const sub = actorRef.subscribe((snapshot) => {
			const ctx = snapshot.context;
			const val = snapshot.value as string;

			// Only add on first entry to waitingForFulfillment (not on RETRY re-entry)
			if (
				val === "waitingForFulfillment" &&
				prevState !== "waitingForFulfillment" &&
				ctx.triggerId &&
				ctx.userAddress &&
				ctx.gachaAddress
			) {
				useGachaStore.getState().addPendingSpin({
					userAddress: ctx.userAddress,
					gachaAddress: ctx.gachaAddress,
					triggerId: ctx.triggerId,
				});
			}

			if (
				(val === "revealing" || val === "idle" || val === "error" || val === "timeout" || val === "refunded") &&
				ctx.userAddress &&
				ctx.gachaAddress
			) {
				useGachaStore.getState().removePendingSpin(ctx.userAddress, ctx.gachaAddress);
			}

			prevState = val;
		});
		return () => sub.unsubscribe();
	}, [actorRef]);

	// Fire callbacks on revealing/refunded transitions
	useEffect(() => {
		if (isRevealing) {
			onSpinCompleteRef.current?.();
		}
	}, [isRevealing]);

	useEffect(() => {
		if (isRefunded && context.refundResult) {
			onRefundRef.current?.();
		}
	}, [isRefunded, context.refundResult]);

	// NOTE: SpinCompleted/SpinRefunded fulfillment is handled exclusively by the
	// `pollForFulfillment` actor invoked from the `waitingForFulfillment` state
	// in `gachaSpinMachine.ts` (see `pollForSpinFulfillment` in
	// `async-utils/gachaSpinMachine.ts`). It already owns timeout, exponential
	// backoff/retry, and refund detection. A second `useWatchContractEvent`
	// watcher here would poll the same RPC endpoint concurrently for every
	// active spin, doubling load for no benefit — so it has been removed in
	// favor of this single source of truth.

	// Restore state from localStorage on mount/account change
	useEffect(() => {
		if (!userAddress || !publicClient || !isIdle || !gachaAddress) return;

		let stale = false;

		const tryRestore = () => {
			if (stale) return;
			const snapshot = actorRef.getSnapshot();
			if ((snapshot.value as string) !== "idle") return;

			const storedTriggerId = loadFromStorage(userAddress, gachaAddress);
			if (storedTriggerId) {
				debugLog("Restoring pending spin:", storedTriggerId);
				// Start spin then immediately confirm to get into waitingForFulfillment
				actorRef.send({
					type: "START_SPIN",
					userAddress,
					publicClient,
					gachaAddress,
				});
				actorRef.send({
					type: "CONFIRM_TRANSACTION",
					triggerId: storedTriggerId,
				});
			}
		};

		validatePendingSpins(publicClient)
			.then(tryRestore)
			.catch((error) => {
				logger.gachaSpin.warn("Failed to validate pending spins:", error);
				tryRestore();
			});

		return () => {
			stale = true;
		};
	}, [userAddress, publicClient, gachaAddress, isIdle, actorRef]);

	// Reset spin state on account switch or disconnect mid-spin
	const actorRefStable = actorRef;
	useAccountEffect({
		onConnect({ address: newAddress }) {
			const snapshot = actorRefStable.getSnapshot();
			const ctx = snapshot.context;
			if (
				ctx.userAddress &&
				(snapshot.value as string) !== "idle" &&
				ctx.userAddress.toLowerCase() !== newAddress.toLowerCase()
			) {
				logger.gachaSpin.warn("Account switched during active spin, resetting");
				actorRefStable.send({ type: "RESET" });
			}
		},
		onDisconnect() {
			const snapshot = actorRefStable.getSnapshot();
			if ((snapshot.value as string) !== "idle") {
				logger.gachaSpin.warn("Wallet disconnected during active spin, resetting");
				actorRefStable.send({ type: "RESET" });
			}
		},
	});

	// Actions — stable callbacks
	const startSpin = useCallback(() => {
		if (userAddress && publicClient && gachaAddress) {
			actorRef.send({
				type: "START_SPIN",
				userAddress,
				publicClient,
				gachaAddress,
			});
		}
	}, [userAddress, publicClient, gachaAddress, actorRef]);

	const confirmTransaction = useCallback(
		(triggerId: bigint) => {
			debugLog("confirmTransaction:", triggerId.toString());
			actorRef.send({ type: "CONFIRM_TRANSACTION", triggerId });
		},
		[actorRef],
	);

	const fulfillSpin = useCallback(
		(result: SpinResult) => {
			actorRef.send({ type: "FULFILL_SPIN", result });
		},
		[actorRef],
	);

	const closeReveal = useCallback(() => {
		actorRef.send({ type: "CLOSE_REVEAL" });
	}, [actorRef]);

	const retry = useCallback(() => {
		actorRef.send({
			type: "RETRY",
			userAddress: userAddress ?? undefined,
			publicClient: publicClient ?? undefined,
			gachaAddress: gachaAddress ?? undefined,
		});
	}, [userAddress, publicClient, gachaAddress, actorRef]);

	const reset = useCallback(() => {
		actorRef.send({ type: "RESET" });
	}, [actorRef]);

	const timeout = useCallback(() => {
		actorRef.send({ type: "TIMEOUT" });
	}, [actorRef]);

	const setError = useCallback(
		(error: string) => {
			actorRef.send({ type: "SET_ERROR", error });
		},
		[actorRef],
	);

	const clearPendingSpins = useCallback(() => {
		if (userAddress && gachaAddress) {
			useGachaStore.getState().removePendingSpin(userAddress, gachaAddress);
		}
		actorRef.send({ type: "CLEAR_PENDING_SPINS" });
	}, [userAddress, gachaAddress, actorRef]);

	return {
		state: stateValue,
		isIdle,
		isSpinning,
		isWaitingForFulfillment,
		isRevealing,
		isError,
		isTimeout,
		isRefunded,
		canRetry,

		triggerId: context.triggerId,
		spinResult: context.spinResult,
		refundResult: context.refundResult,
		error: context.error,
		retryCount: context.retryCount,

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
