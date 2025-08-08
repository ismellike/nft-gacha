"use client";

import { useEffect } from "react";
import { useActor } from "@xstate/react";
import { useAccount, useWatchContractEvent, usePublicClient } from "wagmi";
import {
	gachaSpinMachine,
	loadFromStorage,
} from "../machines/gachaSpinMachine";
import type { SpinResult } from "../machines/gachaSpinMachine";
import { env } from "../env";
import { gachaAbi } from "../generated";

export interface UseGachaSpinMachineReturn {
	// State
	state: string;
	isIdle: boolean;
	isSpinning: boolean;
	isWaitingForFulfillment: boolean;
	isRevealing: boolean;
	isError: boolean;
	canRetry: boolean;

	// Context
	triggerId: bigint | null;
	spinResult: SpinResult | null;
	error: string | null;
	retryCount: number;

	// Actions
	startSpin: () => void;
	confirmTransaction: (triggerId: bigint) => void;
	fulfillSpin: (result: SpinResult) => void;
	closeReveal: () => void;
	retry: () => void;
	reset: () => void;
}

export function useGachaSpinMachine(
	onSpinComplete?: () => void,
): UseGachaSpinMachineReturn {
	const { address: userAddress } = useAccount();
	const publicClient = usePublicClient();

	const [state, send] = useActor(gachaSpinMachine);

	// Watch for SpinCompleted events from the contract
	useWatchContractEvent({
		address: env.NEXT_PUBLIC_GACHA_CONTRACT_ADDRESS,
		abi: gachaAbi,
		eventName: "SpinCompleted",
		args: userAddress ? { requester: userAddress } : undefined,
		enabled: Boolean(userAddress),
		onLogs(logs) {
			if (!state.matches("waitingForFulfillment")) return;

			for (const log of logs) {
				const { triggerId, rarity, collection, tokenId } = log.args;

				// Check if this is the event we're waiting for
				if (triggerId === state.context.triggerId) {
					// Convert rarity enum to string
					const rarityNames = ["Common", "Uncommon", "Rare", "Epic", "Legendary"];
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
		if (!userAddress || !publicClient || !state.matches("idle")) return;

		const storedTriggerId = loadFromStorage(userAddress);
		if (storedTriggerId) {
			send({ type: "START_SPIN", userAddress, publicClient });
			send({ type: "TRANSACTION_CONFIRMED", triggerId: storedTriggerId });
		}
	}, [userAddress, publicClient, state, send]);

	// Actions
	const startSpin = () => {
		if (userAddress && publicClient) {
			send({ type: "START_SPIN", userAddress, publicClient });
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

	// Derived state
	const isIdle = state.matches("idle");
	const isSpinning = state.matches("spinning");
	const isWaitingForFulfillment = state.matches("waitingForFulfillment");
	const isRevealing = state.matches("revealing");
	const isError = state.matches("error");
	const canRetry = state.context.retryCount < 5; // MAX_RETRIES from machine

	return {
		// State
		state: state.value as string,
		isIdle,
		isSpinning,
		isWaitingForFulfillment,
		isRevealing,
		isError,
		canRetry,

		// Context
		triggerId: state.context.triggerId,
		spinResult: state.context.spinResult,
		error: state.context.error,
		retryCount: state.context.retryCount,

		// Actions
		startSpin,
		confirmTransaction,
		fulfillSpin,
		closeReveal,
		retry,
		reset,
	};
}
