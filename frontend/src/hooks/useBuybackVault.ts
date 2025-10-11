"use client";

import {
	useReadBuybackVaultBuybackPayoutBps,
	useReadBuybackVaultAppraisalOracle,
	useReadBuybackVaultAsset,
	useReadBuybackVaultAvailableLiquidity,
	useReadBuybackVaultDepositorVault,
	useReadBuybackVaultEconomyManager,
	useReadBuybackVaultMaxStakeBps,
	useReadBuybackVaultOwner,
	useReadBuybackVaultPaused,
	useReadBuybackVaultStakedPrincipal,
	useReadBuybackVaultTotalManagedLiquidity,
	useReadBuybackVaultTreasury,
} from "@/generated";

export interface BuybackVaultData {
	asset: string | undefined;
	buybackPayoutBps: bigint | undefined;
	appraisalOracle: string | undefined;
	availableLiquidity: bigint | undefined;
	depositorVault: string | undefined;
	economyManager: string | undefined;
	maxStakeBps: bigint | undefined;
	owner: string | undefined;
	paused: boolean | undefined;
	stakedPrincipal: bigint | undefined;
	totalManagedLiquidity: bigint | undefined;
	treasury: string | undefined;
}

export interface UseBuybackVaultProps {
	contractAddress?: string;
	enabled?: boolean;
}

export function useBuybackVaultData({
	contractAddress,
	enabled = true,
}: UseBuybackVaultProps = {}) {
	const asset = useReadBuybackVaultAsset({
		address: contractAddress as `0x${string}`,
		query: {
			enabled: enabled && !!contractAddress,
		},
	});

	const buybackPayoutBps = useReadBuybackVaultBuybackPayoutBps({
		address: contractAddress as `0x${string}`,
		query: {
			enabled: enabled && !!contractAddress,
		},
	});

	const appraisalOracle = useReadBuybackVaultAppraisalOracle({
		address: contractAddress as `0x${string}`,
		query: {
			enabled: enabled && !!contractAddress,
		},
	});

	const availableLiquidity = useReadBuybackVaultAvailableLiquidity({
		address: contractAddress as `0x${string}`,
		query: {
			enabled: enabled && !!contractAddress,
		},
	});

	const depositorVault = useReadBuybackVaultDepositorVault({
		address: contractAddress as `0x${string}`,
		query: {
			enabled: enabled && !!contractAddress,
		},
	});

	const economyManager = useReadBuybackVaultEconomyManager({
		address: contractAddress as `0x${string}`,
		query: {
			enabled: enabled && !!contractAddress,
		},
	});

	const maxStakeBps = useReadBuybackVaultMaxStakeBps({
		address: contractAddress as `0x${string}`,
		query: {
			enabled: enabled && !!contractAddress,
		},
	});

	const owner = useReadBuybackVaultOwner({
		address: contractAddress as `0x${string}`,
		query: {
			enabled: enabled && !!contractAddress,
		},
	});

	const paused = useReadBuybackVaultPaused({
		address: contractAddress as `0x${string}`,
		query: {
			enabled: enabled && !!contractAddress,
		},
	});

	const stakedPrincipal = useReadBuybackVaultStakedPrincipal({
		address: contractAddress as `0x${string}`,
		query: {
			enabled: enabled && !!contractAddress,
		},
	});

	const totalManagedLiquidity = useReadBuybackVaultTotalManagedLiquidity({
		address: contractAddress as `0x${string}`,
		query: {
			enabled: enabled && !!contractAddress,
		},
	});

	const treasury = useReadBuybackVaultTreasury({
		address: contractAddress as `0x${string}`,
		query: {
			enabled: enabled && !!contractAddress,
		},
	});

	const isLoading =
		asset.isLoading ||
		buybackPayoutBps.isLoading ||
		appraisalOracle.isLoading ||
		availableLiquidity.isLoading ||
		depositorVault.isLoading ||
		economyManager.isLoading ||
		maxStakeBps.isLoading ||
		owner.isLoading ||
		paused.isLoading ||
		stakedPrincipal.isLoading ||
		totalManagedLiquidity.isLoading ||
		treasury.isLoading;

	const isError =
		asset.isError ||
		buybackPayoutBps.isError ||
		appraisalOracle.isError ||
		availableLiquidity.isError ||
		depositorVault.isError ||
		economyManager.isError ||
		maxStakeBps.isError ||
		owner.isError ||
		paused.isError ||
		stakedPrincipal.isError ||
		totalManagedLiquidity.isError ||
		treasury.isError;

	const data: BuybackVaultData = {
		asset: asset.data,
		buybackPayoutBps: buybackPayoutBps.data,
		appraisalOracle: appraisalOracle.data,
		availableLiquidity: availableLiquidity.data,
		depositorVault: depositorVault.data,
		economyManager: economyManager.data,
		maxStakeBps: maxStakeBps.data,
		owner: owner.data,
		paused: paused.data,
		stakedPrincipal: stakedPrincipal.data,
		totalManagedLiquidity: totalManagedLiquidity.data,
		treasury: treasury.data,
	};

	// Calculate utilization rate
	const utilizationRate =
		stakedPrincipal.data &&
		totalManagedLiquidity.data &&
		totalManagedLiquidity.data > 0n
			? (Number(stakedPrincipal.data) / Number(totalManagedLiquidity.data)) *
				100
			: 0;

	// Calculate available capacity
	const availableCapacity =
		totalManagedLiquidity.data && stakedPrincipal.data
			? totalManagedLiquidity.data - stakedPrincipal.data
			: 0n;

	return {
		data,
		utilizationRate,
		availableCapacity,
		isLoading,
		isError,
		refetch: () => {
			asset.refetch();
			buybackPayoutBps.refetch();
			appraisalOracle.refetch();
			availableLiquidity.refetch();
			depositorVault.refetch();
			economyManager.refetch();
			maxStakeBps.refetch();
			owner.refetch();
			paused.refetch();
			stakedPrincipal.refetch();
			totalManagedLiquidity.refetch();
			treasury.refetch();
		},
	};
}

// Helper function to calculate buyback payout percentage
export function calculateBuybackPayoutPercentage(
	payoutBps: bigint | undefined,
): string {
	if (payoutBps === undefined) return "0%";
	return `${Number(payoutBps) / 100}%`;
}

// Helper function to calculate maximum stake percentage
export function calculateMaxStakePercentage(
	maxStakeBps: bigint | undefined,
): string {
	if (maxStakeBps === undefined) return "0%";
	return `${Number(maxStakeBps) / 100}%`;
}

// Helper function to check if vault has capacity for more staking
export function hasStakingCapacity(
	availableCapacity: bigint,
	maxStakeBps: bigint,
	totalManagedLiquidity: bigint,
	stakedPrincipal: bigint,
): boolean {
	if (totalManagedLiquidity === 0n) return true;
	const maxStakeAmount = (totalManagedLiquidity * maxStakeBps) / 10000n;
	return availableCapacity > 0n && stakedPrincipal <= maxStakeAmount;
}

// Helper function to get vault status
export function getVaultStatus(
	paused: boolean | undefined,
	utilizationRate: number,
): "active" | "paused" | "high-utilization" {
	if (paused === true) return "paused";
	if (utilizationRate > 90) return "high-utilization";
	return "active";
}
