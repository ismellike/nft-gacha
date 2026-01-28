"use client";

import {
	useReadProtocolTreasuryAsset,
	useReadProtocolTreasuryOwner,
	useReadProtocolTreasuryPaused,
} from "@/generated";

export interface ProtocolTreasuryData {
	asset: string | undefined;
	owner: string | undefined;
	paused: boolean | undefined;
}

export interface UseProtocolTreasuryProps {
	contractAddress?: string;
	enabled?: boolean;
}

export function useProtocolTreasuryData({
	contractAddress,
	enabled = true,
}: UseProtocolTreasuryProps = {}) {
	const asset = useReadProtocolTreasuryAsset({
		address: contractAddress as `0x${string}`,
		query: {
			enabled: enabled && !!contractAddress,
		},
	});

	const owner = useReadProtocolTreasuryOwner({
		address: contractAddress as `0x${string}`,
		query: {
			enabled: enabled && !!contractAddress,
		},
	});

	const paused = useReadProtocolTreasuryPaused({
		address: contractAddress as `0x${string}`,
		query: {
			enabled: enabled && !!contractAddress,
		},
	});

	const isLoading = asset.isLoading || owner.isLoading || paused.isLoading;

	const isError = asset.isError || owner.isError || paused.isError;

	const data: ProtocolTreasuryData = {
		asset: asset.data,
		owner: owner.data,
		paused: paused.data,
	};

	return {
		data,
		isLoading,
		isError,
		refetch: () => {
			asset.refetch();
			owner.refetch();
			paused.refetch();
		},
	};
}

// Helper function to get treasury status
export function getTreasuryStatus(
	paused: boolean | undefined,
): "active" | "paused" {
	return paused === true ? "paused" : "active";
}

// Helper function to check if address is the owner
export function isOwner(
	owner: string | undefined,
	userAddress: string | undefined,
): boolean {
	if (!owner || !userAddress) return false;
	return owner.toLowerCase() === userAddress.toLowerCase();
}
