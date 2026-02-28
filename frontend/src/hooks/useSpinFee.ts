"use client";

import { useEffect, useRef, useState } from "react";
import { useReadContract } from "wagmi";
import { logger } from "../lib/logger";

const SPIN_FEE_ABI = [
	{
		type: "function",
		name: "getCurrentSpinFee",
		stateMutability: "view",
		inputs: [],
		outputs: [{ name: "fee", type: "uint256" }],
	},
] as const;

interface UseSpinFeeParams {
	gachaAddress: `0x${string}` | undefined;
	registerRefetch: (fn: () => void | Promise<void>) => () => void;
}

interface UseSpinFeeReturn {
	spinFee: bigint | undefined;
	feeStale: boolean;
	isFetching: boolean;
	refetch: () => Promise<unknown> | undefined;
}

/**
 * Manages the spin fee query with staleness detection and refresh context registration.
 *
 * Polls the contract every 10 seconds and marks the fee as stale after 15 seconds
 * without a successful update. Uses refs for the interval ticker to comply with
 * Biome exhaustive-deps rules.
 */
export function useSpinFee({
	gachaAddress,
	registerRefetch,
}: UseSpinFeeParams): UseSpinFeeReturn {
	const [lastFeeUpdate, setLastFeeUpdate] = useState<number>(Date.now());
	const [feeStale, setFeeStale] = useState(false);

	const spinFeeQuery = useReadContract({
		address: gachaAddress,
		abi: SPIN_FEE_ABI,
		functionName: "getCurrentSpinFee",
		query: {
			enabled: !!gachaAddress,
			refetchInterval: 10000, // Poll every 10 seconds
		},
	});

	// Update last fee update time on every successful fetch
	useEffect(() => {
		if (spinFeeQuery.dataUpdatedAt > 0) {
			setLastFeeUpdate(spinFeeQuery.dataUpdatedAt);
			setFeeStale(false);
		}
	}, [spinFeeQuery.dataUpdatedAt]);

	// Mark fee as stale after 15 seconds without updates.
	// Use refs for all values read inside the interval to satisfy Biome exhaustive-deps.
	const lastFeeUpdateRef = useRef(lastFeeUpdate);
	lastFeeUpdateRef.current = lastFeeUpdate;
	const isFetchingRef = useRef(spinFeeQuery.isFetching);
	isFetchingRef.current = spinFeeQuery.isFetching;
	const feeStaleRef = useRef(feeStale);
	feeStaleRef.current = feeStale;

	useEffect(() => {
		const interval = setInterval(() => {
			if (
				Date.now() - lastFeeUpdateRef.current > 15000 &&
				!isFetchingRef.current
			) {
				setFeeStale(true);
			} else if (isFetchingRef.current && feeStaleRef.current) {
				// Clear stale flag if we're actively fetching fresh data
				setFeeStale(false);
			}
		}, 1000);

		return () => clearInterval(interval);
	}, []); // Empty deps - reads state via refs

	// Register spin fee refetch with the GachaRefreshContext
	useEffect(() => {
		const refetchSpinFee = async () => {
			logger.gachaSpin.debug("Refetching spin fee");
			await spinFeeQuery.refetch();
		};

		return registerRefetch(refetchSpinFee);
	}, [registerRefetch, spinFeeQuery.refetch]);

	return {
		spinFee: spinFeeQuery.data,
		feeStale,
		isFetching: spinFeeQuery.isFetching,
		refetch: spinFeeQuery.refetch,
	};
}
