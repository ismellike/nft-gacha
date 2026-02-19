"use client";

import { useCallback } from "react";
import { usePublicClient, useReadContracts } from "wagmi";
import {
	depositorVaultAbi,
	useWriteDepositorVaultClaimYield,
} from "@/generated";

export interface DepositorVaultData {
	asset: string | undefined;
	accYieldPerShare: bigint | undefined;
	economyManager: string | undefined;
	owner: string | undefined;
	paused: boolean | undefined;
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
	const isEnabled = enabled && !!contractAddress;
	const addr = contractAddress as `0x${string}`;

	// Static config — rarely changes
	const staticQuery = useReadContracts({
		contracts: [
			{ address: addr, abi: depositorVaultAbi, functionName: "asset" },
			{
				address: addr,
				abi: depositorVaultAbi,
				functionName: "economyManager",
			},
			{ address: addr, abi: depositorVaultAbi, functionName: "owner" },
			{ address: addr, abi: depositorVaultAbi, functionName: "treasury" },
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
			{
				address: addr,
				abi: depositorVaultAbi,
				functionName: "accYieldPerShare",
			},
			{ address: addr, abi: depositorVaultAbi, functionName: "paused" },
			{ address: addr, abi: depositorVaultAbi, functionName: "totalShares" },
			{
				address: addr,
				abi: depositorVaultAbi,
				functionName: "totalYieldClaimed",
			},
			{
				address: addr,
				abi: depositorVaultAbi,
				functionName: "totalYieldDistributed",
			},
			{
				address: addr,
				abi: depositorVaultAbi,
				functionName: "sharesOf",
				args: [userAddr],
			},
			{
				address: addr,
				abi: depositorVaultAbi,
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

	const accYieldPerShare = d?.[0]?.result as bigint | undefined;
	const userShares = hasUser
		? (d?.[5]?.result as bigint | undefined)
		: undefined;
	const userPendingYield = hasUser
		? (d?.[6]?.result as bigint | undefined)
		: undefined;

	const data: DepositorVaultData = {
		asset: s?.[0]?.result as string | undefined,
		accYieldPerShare,
		economyManager: s?.[1]?.result as string | undefined,
		owner: s?.[2]?.result as string | undefined,
		paused: d?.[1]?.result as boolean | undefined,
		totalShares: d?.[2]?.result as bigint | undefined,
		totalYieldClaimed: d?.[3]?.result as bigint | undefined,
		totalYieldDistributed: d?.[4]?.result as bigint | undefined,
		treasury: s?.[3]?.result as string | undefined,
	};

	const userData: UserDepositorData = {
		shares: userShares,
		yieldValue:
			userShares !== undefined && accYieldPerShare !== undefined
				? (userShares * accYieldPerShare) / 10n ** 18n
				: undefined,
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
	} = useWriteDepositorVaultClaimYield();

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
