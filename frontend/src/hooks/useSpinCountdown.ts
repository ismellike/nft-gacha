"use client";

import { useEffect, useRef, useState } from "react";

interface UseSpinCountdownParams {
	isWaitingForFulfillment: boolean;
	onTimeout: () => void;
	timeoutSeconds: number;
}

interface UseSpinCountdownReturn {
	countdown: number;
}

/**
 * Manages a countdown timer for the spin fulfillment timeout.
 *
 * Starts counting down when `isWaitingForFulfillment` becomes true and calls
 * `onTimeout` when the timer reaches zero. Resets when waiting ends.
 *
 * Uses refs inside the interval to comply with Biome exhaustive-deps rules.
 */
export function useSpinCountdown({
	isWaitingForFulfillment,
	onTimeout,
	timeoutSeconds,
}: UseSpinCountdownParams): UseSpinCountdownReturn {
	const [countdown, setCountdown] = useState(timeoutSeconds);
	const [timeoutStarted, setTimeoutStarted] = useState<number | null>(null);

	// Keep refs for values read inside setInterval to satisfy Biome exhaustive-deps
	const timeoutStartedRef = useRef(timeoutStarted);
	timeoutStartedRef.current = timeoutStarted;
	const onTimeoutRef = useRef(onTimeout);
	onTimeoutRef.current = onTimeout;
	const timeoutSecondsRef = useRef(timeoutSeconds);
	timeoutSecondsRef.current = timeoutSeconds;

	useEffect(() => {
		if (isWaitingForFulfillment) {
			if (!timeoutStarted) {
				setTimeoutStarted(Date.now());
				setCountdown(timeoutSeconds);
			}

			const timer = setInterval(() => {
				const started = timeoutStartedRef.current;
				if (started) {
					const elapsed = Math.floor((Date.now() - started) / 1000);
					const remaining = Math.max(0, timeoutSecondsRef.current - elapsed);
					setCountdown(remaining);

					if (remaining === 0) {
						onTimeoutRef.current();
						clearInterval(timer);
					}
				}
			}, 1000);

			return () => clearInterval(timer);
		}

		setTimeoutStarted(null);
		setCountdown(timeoutSeconds);
		return undefined;
	}, [isWaitingForFulfillment, timeoutStarted, timeoutSeconds]);

	return { countdown };
}
