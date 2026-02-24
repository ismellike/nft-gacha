"use client";

import { gachaEconomyManagerAbi } from "@/generated";
import { useReadContracts } from "wagmi";

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
	contractAddress?: `0x${string}`;
	enabled?: boolean;
}

export function useGachaEconomyManagerData({
	contractAddress,
	enabled = true,
}: UseGachaEconomyManagerProps = {}) {
	const isEnabled = enabled && !!contractAddress;
	const addr = contractAddress as `0x${string}`;

	// Static config — rarely changes
	const staticQuery = useReadContracts({
		contracts: [
			{
				address: addr,
				abi: gachaEconomyManagerAbi,
				functionName: "feeToken",
			},
			{
				address: addr,
				abi: gachaEconomyManagerAbi,
				functionName: "depositorShareBps",
			},
			{
				address: addr,
				abi: gachaEconomyManagerAbi,
				functionName: "protocolShareBps",
			},
		] as const,
		query: {
			enabled: isEnabled,
			staleTime: 5 * 60_000,
		},
	});

	// Dynamic revenue data — refreshes at default interval
	const dynamicQuery = useReadContracts({
		contracts: [
			{
				address: addr,
				abi: gachaEconomyManagerAbi,
				functionName: "totalRevenueProcessed",
			},
			{
				address: addr,
				abi: gachaEconomyManagerAbi,
				functionName: "totalToDepositors",
			},
			{
				address: addr,
				abi: gachaEconomyManagerAbi,
				functionName: "totalToProtocol",
			},
			{
				address: addr,
				abi: gachaEconomyManagerAbi,
				functionName: "revenueByRarity",
				args: [0],
			},
			{
				address: addr,
				abi: gachaEconomyManagerAbi,
				functionName: "revenueByRarity",
				args: [1],
			},
			{
				address: addr,
				abi: gachaEconomyManagerAbi,
				functionName: "revenueByRarity",
				args: [2],
			},
			{
				address: addr,
				abi: gachaEconomyManagerAbi,
				functionName: "revenueByRarity",
				args: [3],
			},
			{
				address: addr,
				abi: gachaEconomyManagerAbi,
				functionName: "revenueByRarity",
				args: [4],
			},
		] as const,
		query: {
			enabled: isEnabled,
		},
	});

	const isLoading = staticQuery.isLoading || dynamicQuery.isLoading;
	const isError = staticQuery.isError || dynamicQuery.isError;

	const s = staticQuery.data;
	const d = dynamicQuery.data;

	const data: EconomyManagerData = {
		feeToken: s?.[0]?.result as string | undefined,
		depositorShareBps: s?.[1]?.result as bigint | undefined,
		protocolShareBps: s?.[2]?.result as bigint | undefined,
		totalRevenueProcessed: d?.[0]?.result as bigint | undefined,
		totalToDepositors: d?.[1]?.result as bigint | undefined,
		totalToProtocol: d?.[2]?.result as bigint | undefined,
		revenueByRarity: [
			(d?.[3]?.result as bigint | undefined) || 0n,
			(d?.[4]?.result as bigint | undefined) || 0n,
			(d?.[5]?.result as bigint | undefined) || 0n,
			(d?.[6]?.result as bigint | undefined) || 0n,
			(d?.[7]?.result as bigint | undefined) || 0n,
		],
	};

	return {
		data,
		isLoading,
		isError,
		refetch: async () => {
			await Promise.all([staticQuery.refetch(), dynamicQuery.refetch()]);
		},
	};
}

// Helper function to format basis points to percentage
function formatBpsToPercentage(bps: bigint | undefined): string {
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
