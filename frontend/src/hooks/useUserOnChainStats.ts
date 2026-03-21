"use client";

import { useCallback, useMemo } from "react";
import { useAccount } from "wagmi";
import {
	useReadGachaGetGlobalAnalytics,
	useReadGachaGetUserAnalytics,
	useReadGachaTreasuryReaderGetUserProfileBatch,
} from "@/generated";

interface UserSpinAnalytics {
	totalSpins: bigint;
	totalRefunds: bigint;
	totalReclaims: bigint;
	rarityWins: readonly bigint[];
}

interface GlobalAnalytics {
	totalSpins: bigint;
	totalRefunds: bigint;
	totalReclaims: bigint;
	globalRarityWinCounts: readonly bigint[];
}

interface UserDepositProfile {
	depositCounts: readonly bigint[];
	totalDeposits: bigint;
	lifetimeClaimed: bigint;
	lifetimeDeposited: bigint;
	lifetimeWithdrawn: bigint;
	netContribution: bigint;
}

interface UseUserOnChainStatsResult {
	spinAnalytics: UserSpinAnalytics | null;
	globalAnalytics: GlobalAnalytics | null;
	depositProfile: UserDepositProfile | null;
	isLoading: boolean;
	isError: boolean;
	refetch: () => void;
}

interface UseUserOnChainStatsParams {
	gachaAddress?: string | undefined;
	treasuryReaderAddress?: string | undefined;
}

export function useUserOnChainStats({
	gachaAddress,
	treasuryReaderAddress,
}: UseUserOnChainStatsParams): UseUserOnChainStatsResult {
	const { address } = useAccount();

	const gachaAddr = gachaAddress as `0x${string}` | undefined;
	const treasuryReaderAddr = treasuryReaderAddress as `0x${string}` | undefined;
	const userAddr = address as `0x${string}` | undefined;

	const {
		data: userAnalyticsRaw,
		isLoading: isLoadingUser,
		isError: isUserError,
		refetch: refetchUser,
	} = useReadGachaGetUserAnalytics({
		address: gachaAddr,
		args: userAddr ? [userAddr] : undefined,
		query: {
			enabled: !!address && !!gachaAddress,
			refetchInterval: 60000,
		},
	} as Parameters<typeof useReadGachaGetUserAnalytics>[0]);

	const {
		data: globalAnalyticsRaw,
		isLoading: isLoadingGlobal,
		isError: isGlobalError,
		refetch: refetchGlobal,
	} = useReadGachaGetGlobalAnalytics({
		address: gachaAddr,
		query: {
			enabled: !!gachaAddress,
			refetchInterval: 60000,
		},
	} as Parameters<typeof useReadGachaGetGlobalAnalytics>[0]);

	const {
		data: profileRaw,
		isLoading: isLoadingProfile,
		isError: isProfileError,
		refetch: refetchProfile,
	} = useReadGachaTreasuryReaderGetUserProfileBatch({
		address: treasuryReaderAddr,
		args: userAddr ? [userAddr] : undefined,
		query: {
			enabled: !!address && !!treasuryReaderAddress,
			refetchInterval: 60000,
		},
	} as Parameters<typeof useReadGachaTreasuryReaderGetUserProfileBatch>[0]);

	const spinAnalytics = useMemo<UserSpinAnalytics | null>(() => {
		if (!userAnalyticsRaw) return null;
		const [totalSpins, totalRefunds, totalReclaims, rarityWins] =
			userAnalyticsRaw as unknown as [
				bigint,
				bigint,
				bigint,
				readonly bigint[],
			];
		return { totalSpins, totalRefunds, totalReclaims, rarityWins };
	}, [userAnalyticsRaw]);

	const globalAnalytics = useMemo<GlobalAnalytics | null>(() => {
		if (!globalAnalyticsRaw) return null;
		const [totalSpins, totalRefunds, totalReclaims, globalRarityWinCounts] =
			globalAnalyticsRaw as unknown as [
				bigint,
				bigint,
				bigint,
				readonly bigint[],
			];
		return {
			totalSpins,
			totalRefunds,
			totalReclaims,
			globalRarityWinCounts,
		};
	}, [globalAnalyticsRaw]);

	const depositProfile = useMemo<UserDepositProfile | null>(() => {
		if (!profileRaw) return null;
		const raw = profileRaw as unknown as [
			readonly bigint[],
			bigint,
			bigint,
			bigint,
			bigint,
			bigint,
		];
		return {
			depositCounts: raw[0],
			totalDeposits: raw[1],
			lifetimeClaimed: raw[2],
			lifetimeDeposited: raw[3],
			lifetimeWithdrawn: raw[4],
			netContribution: raw[5],
		};
	}, [profileRaw]);

	const isLoading = isLoadingUser || isLoadingGlobal || isLoadingProfile;
	const isError = isUserError || isGlobalError || isProfileError;

	const refetch = useCallback(() => {
		refetchUser();
		refetchGlobal();
		refetchProfile();
	}, [refetchUser, refetchGlobal, refetchProfile]);

	return {
		spinAnalytics,
		globalAnalytics,
		depositProfile,
		isLoading,
		isError,
		refetch,
	};
}
