"use client";

import { useMemo } from "react";
import { useReadContract } from "wagmi";
import { gachaAbi, gachaTreasuryAbi } from "@/generated";
import { getAllActiveGachas } from "@/lib/gacha-config";
import type { GachaConfig } from "@/lib/gacha-config/types";

interface GachaAnalytics {
	config: GachaConfig;
	totalSpins: bigint;
	totalRefunds: bigint;
	totalReclaims: bigint;
	globalRarityWinCounts: readonly bigint[];
	rarityCounts: readonly bigint[];
	rarityTotalValues: readonly bigint[];
	totalItems: bigint;
	totalValueLocked: bigint;
	isLoading: boolean;
	isError: boolean;
}

interface AggregatedAnalytics {
	totalSpins: bigint;
	totalRefunds: bigint;
	totalReclaims: bigint;
	totalNftsWon: bigint;
	globalRarityWinCounts: bigint[];
	totalItems: bigint;
	totalValueLocked: bigint;
	perGacha: GachaAnalytics[];
	isLoading: boolean;
	isError: boolean;
}

const ZERO_ADDRESS =
	"0x0000000000000000000000000000000000000000" as `0x${string}`;

const PLACEHOLDER_CONFIG: GachaConfig = {
	id: "",
	address: ZERO_ADDRESS,
	title: "",
	description: "",
	longDescription: "",
	theme: "",
	treasuryAddress: ZERO_ADDRESS,
	treasuryReaderAddress: ZERO_ADDRESS,
	isActive: false,
	createdAt: "",
	appraisalAddress: ZERO_ADDRESS,
	economyManagerAddress: ZERO_ADDRESS,
	gachaServiceHandlerAddress: ZERO_ADDRESS,
	appraisalServiceHandlerAddress: ZERO_ADDRESS,
	cardGroupedVaultAddress: ZERO_ADDRESS,
	buybackVaultAddress: ZERO_ADDRESS,
	protocolTreasuryAddress: ZERO_ADDRESS,
	trackerAddresses: [
		ZERO_ADDRESS,
		ZERO_ADDRESS,
		ZERO_ADDRESS,
		ZERO_ADDRESS,
		ZERO_ADDRESS,
	],
	rarityNames: [],
};

/**
 * Fetches analytics for a single gacha instance.
 * Must always be called (hooks rule) — use enabled flags to gate real fetches.
 */
function useGachaAnalyticsSingle(
	config: GachaConfig,
	enabled: boolean,
): GachaAnalytics {
	const gachaAddr = config.address as `0x${string}`;
	const treasuryAddr = config.treasuryAddress as `0x${string}`;

	const {
		data: globalAnalyticsRaw,
		isLoading: isLoadingGlobal,
		isError: isGlobalError,
	} = useReadContract({
		address: gachaAddr,
		abi: gachaAbi,
		functionName: "getGlobalAnalytics",
		query: { enabled, refetchInterval: 60000 },
	});

	const {
		data: rarityCountsRaw,
		isLoading: isLoadingCounts,
		isError: isCountsError,
	} = useReadContract({
		address: treasuryAddr,
		abi: gachaTreasuryAbi,
		functionName: "getAllRarityCounts",
		query: { enabled, refetchInterval: 60000 },
	});

	const {
		data: rarityValuesRaw,
		isLoading: isLoadingValues,
		isError: isValuesError,
	} = useReadContract({
		address: treasuryAddr,
		abi: gachaTreasuryAbi,
		functionName: "getAllRarityTotalValues",
		query: { enabled, refetchInterval: 60000 },
	});

	const {
		data: tvlRaw,
		isLoading: isLoadingTvl,
		isError: isTvlError,
	} = useReadContract({
		address: gachaAddr,
		abi: gachaAbi,
		functionName: "getTotalValueLocked",
		query: { enabled, refetchInterval: 60000 },
	});

	const analyticsData = globalAnalyticsRaw as unknown as
		| [bigint, bigint, bigint, readonly bigint[]]
		| undefined;
	const rarityCounts = (rarityCountsRaw as unknown as readonly bigint[]) ?? [];
	const rarityTotalValues =
		(rarityValuesRaw as unknown as readonly bigint[]) ?? [];
	const totalItems = rarityCounts.reduce((sum, c) => sum + c, 0n);
	const globalRarityWinCounts = analyticsData?.[3] ?? ([] as readonly bigint[]);

	return {
		config,
		totalSpins: analyticsData?.[0] ?? 0n,
		totalRefunds: analyticsData?.[1] ?? 0n,
		totalReclaims: analyticsData?.[2] ?? 0n,
		globalRarityWinCounts,
		rarityCounts,
		rarityTotalValues,
		totalItems,
		totalValueLocked: (tvlRaw as bigint | undefined) ?? 0n,
		isLoading:
			enabled &&
			(isLoadingGlobal || isLoadingCounts || isLoadingValues || isLoadingTvl),
		isError: isGlobalError || isCountsError || isValuesError || isTvlError,
	};
}

/**
 * Aggregated analytics hook for the leaderboard/analytics page.
 * Fetches data from all active gachas and merges them.
 *
 * Supports up to 5 simultaneous gachas via fixed hook slots.
 */
export function useLeaderboardAnalytics(): AggregatedAnalytics {
	const allGachas = useMemo(() => getAllActiveGachas(), []);

	// Fixed slots — hooks must always be called in the same order.
	// `enabled` gates real network calls so placeholder slots are no-ops.
	const g0 = useGachaAnalyticsSingle(
		allGachas[0] ?? PLACEHOLDER_CONFIG,
		allGachas.length > 0,
	);
	const g1 = useGachaAnalyticsSingle(
		allGachas[1] ?? PLACEHOLDER_CONFIG,
		allGachas.length > 1,
	);
	const g2 = useGachaAnalyticsSingle(
		allGachas[2] ?? PLACEHOLDER_CONFIG,
		allGachas.length > 2,
	);
	const g3 = useGachaAnalyticsSingle(
		allGachas[3] ?? PLACEHOLDER_CONFIG,
		allGachas.length > 3,
	);
	const g4 = useGachaAnalyticsSingle(
		allGachas[4] ?? PLACEHOLDER_CONFIG,
		allGachas.length > 4,
	);

	const slots = [g0, g1, g2, g3, g4];

	// biome-ignore lint/correctness/useExhaustiveDependencies: slots is derived from g0-g4 already in deps
	return useMemo(() => {
		const perGacha = slots.slice(0, allGachas.length);

		const totalSpins = perGacha.reduce((sum, g) => sum + g.totalSpins, 0n);
		const totalRefunds = perGacha.reduce((sum, g) => sum + g.totalRefunds, 0n);
		const totalReclaims = perGacha.reduce(
			(sum, g) => sum + g.totalReclaims,
			0n,
		);
		const totalItems = perGacha.reduce((sum, g) => sum + g.totalItems, 0n);
		const totalValueLocked = perGacha.reduce(
			(sum, g) => sum + g.totalValueLocked,
			0n,
		);

		// Aggregate rarity wins across all gachas (5 tiers)
		const globalRarityWinCounts: bigint[] = [0n, 0n, 0n, 0n, 0n];
		for (const g of perGacha) {
			for (let i = 0; i < 5; i++) {
				globalRarityWinCounts[i] =
					(globalRarityWinCounts[i] ?? 0n) + (g.globalRarityWinCounts[i] ?? 0n);
			}
		}

		const totalNftsWon = globalRarityWinCounts.reduce((sum, c) => sum + c, 0n);

		const isLoading = perGacha.some((g) => g.isLoading);
		const isError = perGacha.some((g) => g.isError);

		return {
			totalSpins,
			totalRefunds,
			totalReclaims,
			totalNftsWon,
			globalRarityWinCounts,
			totalItems,
			totalValueLocked,
			perGacha,
			isLoading,
			isError,
		};
	}, [g0, g1, g2, g3, g4, allGachas]);
}
