"use client";

import { useEffect, useState } from "react";
import { useAccount, useWatchContractEvent, usePublicClient } from "wagmi";
import { env } from "../env";
import { gachaAbi } from "../generated";

export interface SpinResult {
	rarity: string;
	collection: string;
	tokenId: string;
}

export interface GachaSpinState {
	// Core state
	pendingSpinId: bigint | null;
	isWaitingForRandomness: boolean;
	lastSpin: SpinResult | null;
	showReveal: boolean;

	// Derived state for UI
	isSpinning: boolean;
	canStartNewSpin: boolean;

	// Actions
	startSpin: () => void;
	completeSpin: (triggerId: bigint) => void;
	resetSpin: () => void;
	closeReveal: () => void;
}

const STORAGE_PREFIX = "pendingSpin_";
const PENDING_SPIN_TIMEOUT = 10 * 60 * 1000; // 10 minutes

export function useGachaSpin(onSpinComplete?: () => void): GachaSpinState {
	const { address: userAddress } = useAccount();
	const publicClient = usePublicClient();

	// Core state
	const [pendingSpinId, setPendingSpinId] = useState<bigint | null>(null);
	const [isWaitingForRandomness, setIsWaitingForRandomness] = useState(false);
	const [lastSpin, setLastSpin] = useState<SpinResult | null>(null);
	const [showReveal, setShowReveal] = useState(false);

	// Derived state
	const isSpinning = isWaitingForRandomness;
	const canStartNewSpin = !isWaitingForRandomness;

	// Helper function to handle spin completion
	const handleSpinCompletion = (
		triggerId: bigint,
		rarity: number,
		collection: string,
		tokenId: bigint,
	) => {
		if (
			!pendingSpinId ||
			triggerId !== pendingSpinId ||
			!isWaitingForRandomness
		) {
			return false; // Don't process if not our pending spin
		}

		console.log("🎯 [useGachaSpin] Processing spin completion:", triggerId);

		// Convert rarity enum to string
		const rarityNames = ["Common", "Uncommon", "Rare", "Epic", "Legendary"];
		const rarityName = rarityNames[Number(rarity)] || "Unknown";

		const result: SpinResult = {
			rarity: rarityName,
			collection: collection || "",
			tokenId: tokenId?.toString() || "",
		};

		console.log("🎉 [useGachaSpin] Spin completed:", result);

		// Update state
		setLastSpin(result);
		setIsWaitingForRandomness(false);
		setPendingSpinId(null);
		setShowReveal(true);

		// Clear localStorage
		if (userAddress) {
			const storageKey = `${STORAGE_PREFIX}${userAddress}`;
			localStorage.removeItem(storageKey);
		}

		// Call completion callback
		if (onSpinComplete) {
			onSpinComplete();
		}

		// Don't auto-hide - let user close manually

		return true; // Successfully processed
	};

	// Watch for SpinCompleted events - always enabled to catch events immediately
	useWatchContractEvent({
		address: env.NEXT_PUBLIC_GACHA_CONTRACT_ADDRESS,
		abi: gachaAbi,
		eventName: "SpinCompleted",
		args: userAddress
			? {
					requester: userAddress,
				}
			: undefined,
		enabled: Boolean(userAddress),
		onLogs(logs) {
			console.log("🎉 [useGachaSpin] Received SpinCompleted event:", logs);

			for (const log of logs) {
				const { triggerId, rarity, collection, tokenId } = log.args;

				if (
					triggerId &&
					tokenId &&
					handleSpinCompletion(
						triggerId,
						Number(rarity),
						collection || "",
						tokenId,
					)
				) {
					break; // Stop processing once we find our event
				}
			}
		},
	});

	// Check for historical SpinCompleted events when pendingSpinId changes
	useEffect(() => {
		if (
			!pendingSpinId ||
			!userAddress ||
			!publicClient ||
			!isWaitingForRandomness
		) {
			return;
		}

		const checkHistoricalEvents = async () => {
			try {
				console.log(
					"🔍 [useGachaSpin] Checking for historical SpinCompleted events:",
					pendingSpinId,
				);

				// Get current block number
				const currentBlock = await publicClient.getBlockNumber();
				// Search last 1000 blocks (should cover recent events)
				const fromBlock =
					currentBlock > BigInt(1000) ? currentBlock - BigInt(1000) : BigInt(0);

				// Query SpinCompleted events for this specific trigger ID and user
				const logs = await publicClient.getLogs({
					address: env.NEXT_PUBLIC_GACHA_CONTRACT_ADDRESS,
					event: {
						type: "event",
						name: "SpinCompleted",
						inputs: [
							{ name: "triggerId", type: "uint256", indexed: true },
							{ name: "requester", type: "address", indexed: true },
							{ name: "rarity", type: "uint8", indexed: false },
							{ name: "collection", type: "address", indexed: false },
							{ name: "tokenId", type: "uint256", indexed: false },
						],
					},
					args: {
						triggerId: pendingSpinId,
						requester: userAddress,
					},
					fromBlock,
					toBlock: currentBlock,
				});

				console.log(
					`🔍 [useGachaSpin] Found ${logs.length} historical SpinCompleted events for trigger ${pendingSpinId}`,
				);

				if (logs.length > 0) {
					const log = logs[0];
					const { rarity, collection, tokenId } = log.args;

					console.log("🎉 [useGachaSpin] Found historical event:", {
						pendingSpinId,
						rarity,
						collection,
						tokenId,
					});

					if (tokenId) {
						handleSpinCompletion(
							pendingSpinId,
							Number(rarity),
							collection || "",
							tokenId,
						);
					}
				}
			} catch (error) {
				console.error(
					"[useGachaSpin] Error checking historical events:",
					error,
				);
			}
		};

		// Check immediately, and then after a short delay in case the event is still being mined
		checkHistoricalEvents();

		const timeoutId = setTimeout(checkHistoricalEvents, 2000);
		return () => clearTimeout(timeoutId);
	}, [pendingSpinId, userAddress, publicClient, isWaitingForRandomness]);

	// Actions
	const startSpin = () => {
		console.log("🆕 [useGachaSpin] Starting new spin - resetting all states");

		// Reset state
		setPendingSpinId(null);
		setIsWaitingForRandomness(false);
		setLastSpin(null);
		setShowReveal(false);

		// Clear localStorage for all users
		try {
			const keys = Object.keys(localStorage);
			keys.forEach((key) => {
				if (key.startsWith(STORAGE_PREFIX)) {
					localStorage.removeItem(key);
				}
			});
		} catch (error) {
			console.warn("Failed to clear localStorage:", error);
		}
	};

	const completeSpin = (triggerId: bigint) => {
		console.log(
			"🎯 [useGachaSpin] Spin transaction confirmed, awaiting randomness:",
			triggerId,
		);

		setPendingSpinId(triggerId);
		setIsWaitingForRandomness(true);

		// Store pending spin state in localStorage
		if (userAddress) {
			const storageKey = `${STORAGE_PREFIX}${userAddress}`;
			try {
				localStorage.setItem(
					storageKey,
					JSON.stringify({
						triggerId: triggerId.toString(),
						timestamp: Date.now(),
					}),
				);
			} catch (error) {
				console.warn("Failed to store pending spin:", error);
			}
		}
	};

	const resetSpin = () => {
		console.log("🔄 [useGachaSpin] Resetting spin state");

		setPendingSpinId(null);
		setIsWaitingForRandomness(false);
		setLastSpin(null);
		setShowReveal(false);

		// Clear localStorage
		if (userAddress) {
			const storageKey = `${STORAGE_PREFIX}${userAddress}`;
			try {
				localStorage.removeItem(storageKey);
			} catch (error) {
				console.warn("Failed to clear localStorage:", error);
			}
		}
	};

	const closeReveal = () => {
		console.log("🔄 [useGachaSpin] Closing reveal modal");
		setShowReveal(false);
	};

	// Restore pending spin state from localStorage on mount
	useEffect(() => {
		if (!userAddress) return;

		const storageKey = `${STORAGE_PREFIX}${userAddress}`;
		const stored = localStorage.getItem(storageKey);
		if (!stored) return;

		try {
			const { triggerId, timestamp } = JSON.parse(stored);

			// Only restore if it's less than timeout period
			if (Date.now() - timestamp < PENDING_SPIN_TIMEOUT) {
				completeSpin(BigInt(triggerId));
				console.log(
					"🔄 [useGachaSpin] Restored pending spin from localStorage:",
					triggerId,
				);
			} else {
				localStorage.removeItem(storageKey);
				console.log(
					"⌛ [useGachaSpin] Expired pending spin removed from localStorage",
				);
			}
		} catch (error) {
			console.error("[useGachaSpin] Failed to parse stored spin state:", error);
			localStorage.removeItem(storageKey);
		}
	}, [userAddress]);

	return {
		// Core state
		pendingSpinId,
		isWaitingForRandomness,
		lastSpin,
		showReveal,

		// Derived state
		isSpinning,
		canStartNewSpin,

		// Actions
		startSpin,
		completeSpin,
		resetSpin,
		closeReveal,
	};
}
