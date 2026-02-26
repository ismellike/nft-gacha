"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
	playCardReveal,
	playRarityReveal,
	playSkipSound,
	playSpinClick,
	playTraitDing,
	playValueReveal,
} from "../lib/soundConfig";
import type { RevealPhase } from "../lib/revealAnimationConfig";

const STORAGE_KEY = "spinfi-sound-muted";

/** Map reveal phases to ascending step indices for trait dings */
const PHASE_STEP_MAP: Partial<Record<RevealPhase, number>> = {
	year: 0,
	setName: 1,
	name: 2,
	grading: 3,
	rarity: 4,
};

function getStoredMuted(): boolean {
	if (typeof window === "undefined") return true;
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored !== null) return stored === "true";
	} catch {
		// localStorage unavailable
	}
	// Default to muted if prefers-reduced-motion
	return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useSoundEffects() {
	const ctxRef = useRef<AudioContext | null>(null);
	const [isMuted, setIsMuted] = useState(getStoredMuted);
	const isMutedRef = useRef(isMuted);

	// Keep ref in sync with state
	useEffect(() => {
		isMutedRef.current = isMuted;
	}, [isMuted]);

	// Persist mute state
	useEffect(() => {
		try {
			localStorage.setItem(STORAGE_KEY, String(isMuted));
		} catch {
			// localStorage unavailable
		}
	}, [isMuted]);

	// Lazy AudioContext creation (avoids autoplay policy issues)
	const getCtx = useCallback((): AudioContext | null => {
		if (isMutedRef.current) return null;
		if (!ctxRef.current) {
			try {
				ctxRef.current = new AudioContext();
			} catch {
				return null;
			}
		}
		// Resume if suspended (browser autoplay policy)
		if (ctxRef.current.state === "suspended") {
			ctxRef.current.resume();
		}
		return ctxRef.current;
	}, []);

	// Cleanup AudioContext on unmount
	useEffect(() => {
		return () => {
			ctxRef.current?.close();
			ctxRef.current = null;
		};
	}, []);

	const toggleMute = useCallback(() => {
		setIsMuted((prev) => !prev);
	}, []);

	const handlePlaySpinClick = useCallback(() => {
		const ctx = getCtx();
		if (ctx) playSpinClick(ctx);
	}, [getCtx]);

	const handlePlayTraitReveal = useCallback(
		(phase: RevealPhase) => {
			const ctx = getCtx();
			if (!ctx) return;
			const step = PHASE_STEP_MAP[phase];
			if (step !== undefined) {
				playTraitDing(ctx, step);
			}
		},
		[getCtx],
	);

	const handlePlayRarityReveal = useCallback(
		(rarityIndex: number) => {
			const ctx = getCtx();
			if (ctx) playRarityReveal(ctx, rarityIndex);
		},
		[getCtx],
	);

	const handlePlayCardReveal = useCallback(
		(rarityIndex: number) => {
			const ctx = getCtx();
			if (ctx) playCardReveal(ctx, rarityIndex);
		},
		[getCtx],
	);

	const handlePlayValueReveal = useCallback(() => {
		const ctx = getCtx();
		if (ctx) playValueReveal(ctx);
	}, [getCtx]);

	const handlePlaySkip = useCallback(() => {
		const ctx = getCtx();
		if (ctx) playSkipSound(ctx);
	}, [getCtx]);

	return {
		playSpinClick: handlePlaySpinClick,
		playTraitReveal: handlePlayTraitReveal,
		playRarityReveal: handlePlayRarityReveal,
		playCardReveal: handlePlayCardReveal,
		playValueReveal: handlePlayValueReveal,
		playSkip: handlePlaySkip,
		isMuted,
		toggleMute,
	};
}
