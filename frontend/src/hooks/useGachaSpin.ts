"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount, useWatchContractEvent } from "wagmi";
import { decodeEventLog } from "viem";
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
}

const STORAGE_PREFIX = "pendingSpin_";
const PENDING_SPIN_TIMEOUT = 10 * 60 * 1000; // 10 minutes

export function useGachaSpin(onSpinComplete?: () => void): GachaSpinState {
	const { address: userAddress } = useAccount();
	
	// Core state
	const [pendingSpinId, setPendingSpinId] = useState<bigint | null>(null);
	const [isWaitingForRandomness, setIsWaitingForRandomness] = useState(false);
	const [lastSpin, setLastSpin] = useState<SpinResult | null>(null);
	const [showReveal, setShowReveal] = useState(false);
	
	// Storage key for current user
	const storageKey = userAddress ? `${STORAGE_PREFIX}${userAddress}` : null;
	
	// Restore pending spin state from localStorage on mount
	useEffect(() => {
		if (!userAddress || !storageKey) return;
		
		const stored = localStorage.getItem(storageKey);
		if (!stored) return;
		
		try {
			const { triggerId, timestamp } = JSON.parse(stored);
			
			// Only restore if it's less than timeout period
			if (Date.now() - timestamp < PENDING_SPIN_TIMEOUT) {
				setPendingSpinId(BigInt(triggerId));
				setIsWaitingForRandomness(true);
				console.log('🔄 [useGachaSpin] Restored pending spin:', triggerId);
			} else {
				localStorage.removeItem(storageKey);
				console.log('⌛ [useGachaSpin] Expired pending spin removed');
			}
		} catch (error) {
			console.error('[useGachaSpin] Failed to parse stored spin state:', error);
			localStorage.removeItem(storageKey);
		}
	}, [userAddress, storageKey]);
	
	// Watch for SpinCompleted events
	useWatchContractEvent({
		address: env.NEXT_PUBLIC_GACHA_CONTRACT_ADDRESS,
		abi: gachaAbi,
		eventName: 'SpinCompleted',
		onLogs(logs) {
			for (const log of logs) {
				const { triggerId, requester, rarity, collection, tokenId } = log.args;
				
				// Accept any SpinCompleted event for this user that matches our pending spin
				if (triggerId && requester === userAddress && triggerId === pendingSpinId) {
					// Convert rarity enum to string
					const rarityNames = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];
					const rarityName = rarityNames[Number(rarity)] || 'Unknown';
					
					const result: SpinResult = {
						rarity: rarityName,
						collection: collection || '',
						tokenId: tokenId?.toString() || '',
					};
					
					setLastSpin(result);
					setIsWaitingForRandomness(false);
					setPendingSpinId(null);
					setShowReveal(true);
					
					// Clear stored pending spin state
					if (storageKey) {
						localStorage.removeItem(storageKey);
					}
					
					// Call completion callback if provided (to refresh counts)
					if (onSpinComplete) {
						onSpinComplete();
					}
					
					// Hide reveal after 4 seconds
					setTimeout(() => setShowReveal(false), 4000);
					
					console.log('🎉 [useGachaSpin] Spin completed:', { triggerId, rarityName, collection, tokenId });
				}
			}
		},
	});
	
	// Actions
	const startSpin = useCallback(() => {
		console.log('🆕 [useGachaSpin] Starting new spin - resetting all states');
		setIsWaitingForRandomness(false);
		setPendingSpinId(null);
		setShowReveal(false);
		
		// Clear any stored state
		if (storageKey) {
			localStorage.removeItem(storageKey);
		}
	}, [storageKey]);
	
	const completeSpin = useCallback((triggerId: bigint) => {
		console.log('🎯 [useGachaSpin] Spin transaction confirmed, awaiting randomness:', triggerId);
		
		setPendingSpinId(triggerId);
		setIsWaitingForRandomness(true);
		
		// Store pending spin state in localStorage
		if (storageKey) {
			localStorage.setItem(storageKey, JSON.stringify({
				triggerId: triggerId.toString(),
				timestamp: Date.now()
			}));
		}
	}, [storageKey]);
	
	const resetSpin = useCallback(() => {
		console.log('🔄 [useGachaSpin] Resetting spin state');
		setIsWaitingForRandomness(false);
		setPendingSpinId(null);
		setShowReveal(false);
		
		if (storageKey) {
			localStorage.removeItem(storageKey);
		}
	}, [storageKey]);
	
	// Derived state
	const isSpinning = isWaitingForRandomness;
	const canStartNewSpin = !isSpinning;
	
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
	};
}