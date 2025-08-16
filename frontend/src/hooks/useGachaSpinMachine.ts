"use client";

import { useEffect } from "react";
import { useActor } from "@xstate/react";
import { useAccount, useWatchContractEvent, usePublicClient } from "wagmi";
import {
	gachaSpinMachine,
	loadFromStorage,
	clearAllPendingSpins,
	validatePendingSpins,
} from "../machines/gachaSpinMachine";
import { useGachaStore } from '../stores/gachaStore';
import type { SpinResult, RefundResult } from "../machines/gachaSpinMachine";
import { useGachaContracts } from "./useGachaContracts";
import { useGachaId } from "./useGachaId";
import { gachaAbi } from "../generated";

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

export function useGachaSpinMachine(
	onSpinComplete?: () => void,
	onRefund?: () => void,
): UseGachaSpinMachineReturn {
	const { address: userAddress } = useAccount();
	const publicClient = usePublicClient();
	const gachaId = useGachaId();
	const contracts = useGachaContracts(gachaId);

	const [state, send] = useActor(gachaSpinMachine);

	// Watch for SpinCompleted events from the contract
	useWatchContractEvent({
		address: contracts.gacha!,
		enabled: !!contracts.gacha && Boolean(userAddress),
		abi: gachaAbi,
		eventName: "SpinCompleted",
		args: userAddress ? { requester: userAddress } : undefined,
		onLogs(logs) {
			if (!state.matches("waitingForFulfillment")) return;

			for (const log of logs) {
				const { triggerId, rarity, collection, tokenId } = log.args;

				// Check if this is the event we're waiting for
				if (triggerId === state.context.triggerId) {
					// Convert rarity enum to string
					const rarityNames = [
						"Common",
						"Uncommon",
						"Rare",
						"Epic",
						"Legendary",
					];
					const rarityName = rarityNames[Number(rarity)] || "Unknown";

					const result: SpinResult = {
						rarity: rarityName,
						collection: collection || "",
						tokenId: tokenId?.toString() || "",
					};

					send({ type: "SPIN_FULFILLED", result });
					onSpinComplete?.();
					break;
				}
			}
		},
	});

	// Restore state from localStorage on mount/account change
	useEffect(() => {
		if (!userAddress || !publicClient || !state.matches("idle") || !contracts.gacha) return;

		// First, validate and clean expired/invalid pending spins
		validatePendingSpins(publicClient).then(() => {
			const storedTriggerId = loadFromStorage(userAddress, contracts.gacha!);
			if (storedTriggerId) {
				// Only restore if we have a valid stored trigger ID
				console.log("🔄 [useGachaSpinMachine] Restoring pending spin:", storedTriggerId);
				send({
					type: "START_SPIN",
					userAddress,
					publicClient,
					gachaAddress: contracts.gacha,
				});
				send({ type: "TRANSACTION_CONFIRMED", triggerId: storedTriggerId });
			}
		}).catch(error => {
			console.warn("Failed to validate pending spins:", error);
			// Continue with normal operation even if validation fails
			const storedTriggerId = loadFromStorage(userAddress, contracts.gacha!);
			if (storedTriggerId) {
				console.log("🔄 [useGachaSpinMachine] Restoring pending spin (validation failed):", storedTriggerId);
				send({
					type: "START_SPIN",
					userAddress,
					publicClient,
					gachaAddress: contracts.gacha!,
				});
				send({ type: "TRANSACTION_CONFIRMED", triggerId: storedTriggerId });
			}
		});
	}, [userAddress, publicClient, contracts.gacha, state, send]);

	// Actions
	const startSpin = () => {
		if (userAddress && publicClient && contracts.gacha) {
			send({
				type: "START_SPIN",
				userAddress,
				publicClient,
				gachaAddress: contracts.gacha,
			});
		}
	};

	const confirmTransaction = (triggerId: bigint) => {
		send({ type: "TRANSACTION_CONFIRMED", triggerId });
	};

	const fulfillSpin = (result: SpinResult) => {
		send({ type: "SPIN_FULFILLED", result });
		onSpinComplete?.();
	};

	const closeReveal = () => send({ type: "CLOSE_REVEAL" });
	const retry = () => send({ type: "RETRY" });
	const reset = () => send({ type: "RESET" });
	const timeout = () => send({ type: "TIMEOUT" });
	const clearPendingSpins = () => {
		// Clear just this gacha's pending spins, not all
		if (userAddress && contracts.gacha) {
			useGachaStore.getState().removePendingSpin(userAddress, contracts.gacha);
		}
		reset();
	};

	// Derived state
	const isIdle = state.matches("idle");
	const isSpinning = state.matches("spinning");
	const isWaitingForFulfillment = state.matches("waitingForFulfillment");
	const isRevealing = state.matches("revealing");
	const isError = state.matches("error");
	const isTimeout = state.matches("timeout");
	const isRefunded = state.matches("refunded");
	const canRetry = state.context.retryCount < 5; // MAX_RETRIES from machine

	// Handle refund completion
	useEffect(() => {
		if (isRefunded && state.context.refundResult) {
			console.log("💰 [useGachaSpinMachine] Refund completed, triggering balance refresh");
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
