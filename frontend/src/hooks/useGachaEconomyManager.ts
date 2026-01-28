"use client";

import {
	useReadGachaEconomyManagerDepositorShareBps,
	useReadGachaEconomyManagerFeeToken,
	useReadGachaEconomyManagerProtocolShareBps,
	useReadGachaEconomyManagerRevenueByRarity,
	useReadGachaEconomyManagerTotalRevenueProcessed,
	useReadGachaEconomyManagerTotalToDepositors,
	useReadGachaEconomyManagerTotalToProtocol,
} from "@/generated";

export interface EconomyManagerData {
	feeToken: string | undefined;
	depositorShareBps: bigint | undefined;
	protocolShareBps: bigint | undefined;
	totalRevenueProcessed: bigint | undefined;
	totalToDepositors: bigint | undefined;
	totalToProtocol: bigint | undefined;
	revenueByRarity: bigint[] | undefined;
}

export interface UseGachaEconomyManagerProps {
	contractAddress?: string;
	enabled?: boolean;
}

export function useGachaEconomyManagerData({
	contractAddress,
	enabled = true,
}: UseGachaEconomyManagerProps = {}) {
	const feeToken = useReadGachaEconomyManagerFeeToken({
		address: contractAddress as `0x${string}`,
		query: {
			enabled: enabled && !!contractAddress,
		},
	});

	const depositorShareBps = useReadGachaEconomyManagerDepositorShareBps({
		address: contractAddress as `0x${string}`,
		query: {
			enabled: enabled && !!contractAddress,
		},
	});

	const protocolShareBps = useReadGachaEconomyManagerProtocolShareBps({
		address: contractAddress as `0x${string}`,
		query: {
			enabled: enabled && !!contractAddress,
		},
	});

	const totalRevenueProcessed = useReadGachaEconomyManagerTotalRevenueProcessed(
		{
			address: contractAddress as `0x${string}`,
			query: {
				enabled: enabled && !!contractAddress,
			},
		},
	);

	const totalToDepositors = useReadGachaEconomyManagerTotalToDepositors({
		address: contractAddress as `0x${string}`,
		query: {
			enabled: enabled && !!contractAddress,
		},
	});

	const totalToProtocol = useReadGachaEconomyManagerTotalToProtocol({
		address: contractAddress as `0x${string}`,
		query: {
			enabled: enabled && !!contractAddress,
		},
	});

	// Fetch revenue for each rarity level
	const revenueCommon = useReadGachaEconomyManagerRevenueByRarity({
		address: contractAddress as `0x${string}`,
		args: [0], // Common
		query: {
			enabled: enabled && !!contractAddress,
		},
	});

	const revenueUncommon = useReadGachaEconomyManagerRevenueByRarity({
		address: contractAddress as `0x${string}`,
		args: [1], // Uncommon
		query: {
			enabled: enabled && !!contractAddress,
		},
	});

	const revenueRare = useReadGachaEconomyManagerRevenueByRarity({
		address: contractAddress as `0x${string}`,
		args: [2], // Rare
		query: {
			enabled: enabled && !!contractAddress,
		},
	});

	const revenueEpic = useReadGachaEconomyManagerRevenueByRarity({
		address: contractAddress as `0x${string}`,
		args: [3], // Epic
		query: {
			enabled: enabled && !!contractAddress,
		},
	});

	const revenueLegendary = useReadGachaEconomyManagerRevenueByRarity({
		address: contractAddress as `0x${string}`,
		args: [4], // Legendary
		query: {
			enabled: enabled && !!contractAddress,
		},
	});

	const isLoading =
		feeToken.isLoading ||
		depositorShareBps.isLoading ||
		protocolShareBps.isLoading ||
		totalRevenueProcessed.isLoading ||
		totalToDepositors.isLoading ||
		totalToProtocol.isLoading ||
		revenueCommon.isLoading ||
		revenueUncommon.isLoading ||
		revenueRare.isLoading ||
		revenueEpic.isLoading ||
		revenueLegendary.isLoading;

	const isError =
		feeToken.isError ||
		depositorShareBps.isError ||
		protocolShareBps.isError ||
		totalRevenueProcessed.isError ||
		totalToDepositors.isError ||
		totalToProtocol.isError ||
		revenueCommon.isError ||
		revenueUncommon.isError ||
		revenueRare.isError ||
		revenueEpic.isError ||
		revenueLegendary.isError;

	const data: EconomyManagerData = {
		feeToken: feeToken.data,
		depositorShareBps: depositorShareBps.data,
		protocolShareBps: protocolShareBps.data,
		totalRevenueProcessed: totalRevenueProcessed.data,
		totalToDepositors: totalToDepositors.data,
		totalToProtocol: totalToProtocol.data,
		revenueByRarity: [
			revenueCommon.data || BigInt(0),
			revenueUncommon.data || BigInt(0),
			revenueRare.data || BigInt(0),
			revenueEpic.data || BigInt(0),
			revenueLegendary.data || BigInt(0),
		],
	};

	return {
		data,
		isLoading,
		isError,
		refetch: () => {
			feeToken.refetch();
			depositorShareBps.refetch();
			protocolShareBps.refetch();
			totalRevenueProcessed.refetch();
			totalToDepositors.refetch();
			totalToProtocol.refetch();
			revenueCommon.refetch();
			revenueUncommon.refetch();
			revenueRare.refetch();
			revenueEpic.refetch();
			revenueLegendary.refetch();
		},
	};
}

// Helper function to format basis points to percentage
export function formatBpsToPercentage(bps: bigint | undefined): string {
	if (bps === undefined) return "0%";
	return `${Number(bps) / 100}%`;
}

// Helper function to calculate revenue share percentages
export function calculateRevenueShares(
	depositorBps: bigint | undefined,
	protocolBps: bigint | undefined,
) {
	const safeDepositorBps = depositorBps || 0n;
	const safeProtocolBps = protocolBps || 0n;

	return {
		depositor: formatBpsToPercentage(safeDepositorBps),
		protocol: formatBpsToPercentage(safeProtocolBps),
		total: formatBpsToPercentage(safeDepositorBps + safeProtocolBps),
	};
}
