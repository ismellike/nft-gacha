"use client";

import {
	useReadDepositorVaultAccYieldPerShare,
	useReadDepositorVaultAsset,
	useReadDepositorVaultEconomyManager,
	useReadDepositorVaultOwner,
	useReadDepositorVaultPaused,
	useReadDepositorVaultPendingYield,
	useReadDepositorVaultSharesOf,
	useReadDepositorVaultTotalShares,
	useReadDepositorVaultTotalYieldClaimed,
	useReadDepositorVaultTotalYieldDistributed,
	useReadDepositorVaultTreasury,
	useWriteDepositorVaultClaimYield,
} from "@/generated";

export interface DepositorVaultData {
	asset: string | undefined;
	accYieldPerShare: bigint | undefined;
	economyManager: string | undefined;
	owner: string | undefined;
	paused: boolean | undefined;
	pendingYield: bigint | undefined;
	totalShares: bigint | undefined;
	totalYieldClaimed: bigint | undefined;
	totalYieldDistributed: bigint | undefined;
	treasury: string | undefined;
}

export interface UserDepositorData {
	shares: bigint | undefined;
	yieldValue: bigint | undefined;
	pendingYield: bigint | undefined;
}

export interface UseDepositorVaultProps {
	contractAddress?: string;
	userAddress?: string;
	enabled?: boolean;
}

export function useDepositorVaultData({
	contractAddress,
	userAddress,
	enabled = true,
}: UseDepositorVaultProps = {}) {
	// Contract-level data
	const asset = useReadDepositorVaultAsset({
		address: contractAddress as `0x${string}`,
		query: {
			enabled: enabled && !!contractAddress,
		},
	});

	const accYieldPerShare = useReadDepositorVaultAccYieldPerShare({
		address: contractAddress as `0x${string}`,
		query: {
			enabled: enabled && !!contractAddress,
		},
	});

	const economyManager = useReadDepositorVaultEconomyManager({
		address: contractAddress as `0x${string}`,
		query: {
			enabled: enabled && !!contractAddress,
		},
	});

	const owner = useReadDepositorVaultOwner({
		address: contractAddress as `0x${string}`,
		query: {
			enabled: enabled && !!contractAddress,
		},
	});

	const paused = useReadDepositorVaultPaused({
		address: contractAddress as `0x${string}`,
		query: {
			enabled: enabled && !!contractAddress,
		},
	});

	const pendingYield = useReadDepositorVaultPendingYield({
		address: contractAddress as `0x${string}`,
		query: {
			enabled: enabled && !!contractAddress,
		},
	});

	// User-specific pending yield
	const userPendingYield = useReadDepositorVaultPendingYield({
		address: contractAddress as `0x${string}`,
		args: [userAddress as `0x${string}`],
		query: {
			enabled: enabled && !!contractAddress && !!userAddress,
		},
	});

	const totalShares = useReadDepositorVaultTotalShares({
		address: contractAddress as `0x${string}`,
		query: {
			enabled: enabled && !!contractAddress,
		},
	});

	const totalYieldClaimed = useReadDepositorVaultTotalYieldClaimed({
		address: contractAddress as `0x${string}`,
		query: {
			enabled: enabled && !!contractAddress,
		},
	});

	const totalYieldDistributed = useReadDepositorVaultTotalYieldDistributed({
		address: contractAddress as `0x${string}`,
		query: {
			enabled: enabled && !!contractAddress,
		},
	});

	const treasury = useReadDepositorVaultTreasury({
		address: contractAddress as `0x${string}`,
		query: {
			enabled: enabled && !!contractAddress,
		},
	});

	// User-specific data
	const userShares = useReadDepositorVaultSharesOf({
		address: contractAddress as `0x${string}`,
		args: [userAddress as `0x${string}`],
		query: {
			enabled: enabled && !!contractAddress && !!userAddress,
		},
	});

	const isLoading =
		asset.isLoading ||
		accYieldPerShare.isLoading ||
		economyManager.isLoading ||
		owner.isLoading ||
		paused.isLoading ||
		pendingYield.isLoading ||
		totalShares.isLoading ||
		totalYieldClaimed.isLoading ||
		totalYieldDistributed.isLoading ||
		treasury.isLoading ||
		userShares.isLoading ||
		userPendingYield.isLoading;

	const isError =
		asset.isError ||
		accYieldPerShare.isError ||
		economyManager.isError ||
		owner.isError ||
		paused.isError ||
		pendingYield.isError ||
		totalShares.isError ||
		totalYieldClaimed.isError ||
		totalYieldDistributed.isError ||
		treasury.isError ||
		userShares.isError ||
		userPendingYield.isError;

	const data: DepositorVaultData = {
		asset: asset.data,
		accYieldPerShare: accYieldPerShare.data,
		economyManager: economyManager.data,
		owner: owner.data,
		paused: paused.data,
		pendingYield: pendingYield.data,
		totalShares: totalShares.data,
		totalYieldClaimed: totalYieldClaimed.data,
		totalYieldDistributed: totalYieldDistributed.data,
		treasury: treasury.data,
	};

	const userData: UserDepositorData = {
		shares: userShares.data,
		yieldValue:
			userShares.data !== undefined && accYieldPerShare.data !== undefined
				? (userShares.data * accYieldPerShare.data) / 10n ** 18n
				: undefined,
		pendingYield: userPendingYield.data,
	};

	return {
		data,
		userData,
		isLoading,
		isError,
		refetch: () => {
			asset.refetch();
			accYieldPerShare.refetch();
			economyManager.refetch();
			owner.refetch();
			paused.refetch();
			pendingYield.refetch();
			totalShares.refetch();
			totalYieldClaimed.refetch();
			totalYieldDistributed.refetch();
			treasury.refetch();
			userShares.refetch();
			userPendingYield.refetch();
		},
	};
}

// Helper function to calculate user's share percentage
export function calculateUserSharePercentage(
	userShares: bigint | undefined,
	totalShares: bigint | undefined,
): string {
	if (!userShares || !totalShares || totalShares === 0n) return "0%";
	const percentage = (Number(userShares) / Number(totalShares)) * 100;
	return `${percentage.toFixed(4)}%`;
}

// Helper function to format token amounts
export function formatTokenAmount(
	amount: bigint | undefined,
	decimals: number = 6,
): string {
	if (amount === undefined) return "0";
	const divisor = 10n ** BigInt(decimals);
	const formatted = Number(amount) / Number(divisor);
	return formatted.toLocaleString(undefined, {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});
}

// Hook for claiming yield
export function useClaimYield() {
	const {
		writeContract: claimYield,
		isPending: isClaiming,
		error: claimError,
	} = useWriteDepositorVaultClaimYield();

	return {
		claimYield,
		isClaiming,
		claimError,
	};
}
