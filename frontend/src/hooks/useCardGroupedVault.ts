"use client";

import { useCallback } from "react";
import { usePublicClient, useReadContracts } from "wagmi";
import {
	cardGroupedVaultAbi,
	useWriteCardGroupedVaultClaimYield,
} from "@/generated";

export interface CardGroupedVaultData {
	asset: string | undefined;
	economyManager: string | undefined;
	owner: string | undefined;
	paused: boolean | undefined;
	totalShares: bigint | undefined;
	totalYieldClaimed: bigint | undefined;
	totalYieldDistributed: bigint | undefined;
	treasury: string | undefined;
}

export interface UserCardGroupedData {
	shares: bigint | undefined;
	pendingYield: bigint | undefined;
}

interface UseCardGroupedVaultProps {
	contractAddress?: string;
	userAddress?: string;
	enabled?: boolean;
}

export function useCardGroupedVaultData({
	contractAddress,
	userAddress,
	enabled = true,
}: UseCardGroupedVaultProps = {}) {
	const isEnabled = enabled && !!contractAddress;
	const addr = contractAddress as `0x${string}`;

	// Static config — rarely changes
	const staticQuery = useReadContracts({
		contracts: [
			{ address: addr, abi: cardGroupedVaultAbi, functionName: "asset" },
			{
				address: addr,
				abi: cardGroupedVaultAbi,
				functionName: "economyManager",
			},
			{ address: addr, abi: cardGroupedVaultAbi, functionName: "owner" },
			{ address: addr, abi: cardGroupedVaultAbi, functionName: "treasury" },
		] as const,
		query: {
			enabled: isEnabled,
			staleTime: 5 * 60_000,
		},
	});

	const hasUser = isEnabled && !!userAddress;
	const userAddr = (userAddress ?? addr) as `0x${string}`;

	// Dynamic data — default refresh interval
	const dynamicQuery = useReadContracts({
		contracts: [
			{ address: addr, abi: cardGroupedVaultAbi, functionName: "paused" },
			{ address: addr, abi: cardGroupedVaultAbi, functionName: "totalShares" },
			{
				address: addr,
				abi: cardGroupedVaultAbi,
				functionName: "totalYieldClaimed",
			},
			{
				address: addr,
				abi: cardGroupedVaultAbi,
				functionName: "totalYieldDistributed",
			},
			{
				address: addr,
				abi: cardGroupedVaultAbi,
				functionName: "sharesOf",
				args: [userAddr],
			},
			{
				address: addr,
				abi: cardGroupedVaultAbi,
				functionName: "pendingYield",
				args: [userAddr],
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

	const userShares = hasUser
		? (d?.[4]?.result as bigint | undefined)
		: undefined;
	const userPendingYield = hasUser
		? (d?.[5]?.result as bigint | undefined)
		: undefined;

	const data: CardGroupedVaultData = {
		asset: s?.[0]?.result as string | undefined,
		economyManager: s?.[1]?.result as string | undefined,
		owner: s?.[2]?.result as string | undefined,
		paused: d?.[0]?.result as boolean | undefined,
		totalShares: d?.[1]?.result as bigint | undefined,
		totalYieldClaimed: d?.[2]?.result as bigint | undefined,
		totalYieldDistributed: d?.[3]?.result as bigint | undefined,
		treasury: s?.[3]?.result as string | undefined,
	};

	const userData: UserCardGroupedData = {
		shares: userShares,
		pendingYield: userPendingYield,
	};

	return {
		data,
		userData,
		isLoading,
		isError,
		refetch: async () => {
			await Promise.all([staticQuery.refetch(), dynamicQuery.refetch()]);
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

// Hook for claiming yield
export function useClaimYield() {
	const publicClient = usePublicClient();
	const {
		writeContractAsync: claimYieldAsync,
		isPending: isClaiming,
		error: claimError,
	} = useWriteCardGroupedVaultClaimYield();

	const claimYield = useCallback(
		async (
			args: Parameters<typeof claimYieldAsync>[0],
		): Promise<import("viem").TransactionReceipt | undefined> => {
			if (!publicClient) {
				throw new Error("Public client not available");
			}

			const hash = await claimYieldAsync(args);

			// Wait for receipt to confirm success
			const receipt = await publicClient.waitForTransactionReceipt({
				hash,
			});

			if (receipt.status === "reverted") {
				throw new Error("Transaction reverted on-chain");
			}

			return receipt;
		},
		[claimYieldAsync, publicClient],
	);

	return {
		claimYield,
		isClaiming,
		claimError,
	};
}
