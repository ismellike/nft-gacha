import { useEffect, useCallback, useMemo } from "react";
import { useAccount } from "wagmi";
import { useReadNftAppraisalGetAppraisal } from "../generated";
import { useNFTAppraisalStore, type AppraisedNFT } from "../stores/nftAppraisalStore";

export type AppraisalFilter = "all" | "pending" | "completed" | "recent" | "highValue";
export type AppraisalSort = "newest" | "oldest" | "highestValue" | "lowestValue" | "recentlyUpdated";

interface UseAppraisalDataOptions {
	autoRefresh?: boolean;
	refreshInterval?: number;
	filter?: AppraisalFilter;
	sort?: AppraisalSort;
	limit?: number;
}

// Cache for 30 seconds to prevent excessive API calls
const CACHE_DURATION = 30 * 1000;

export const useAppraisalData = (
	userAddress?: string,
	options: UseAppraisalDataOptions = {
		autoRefresh: true,
		refreshInterval: 30000,
		filter: "all",
		sort: "newest"
	}
) => {
	const { address: connectedAddress } = useAccount();
	const address = userAddress || connectedAddress;

	const {
		setAppraisals,
		setLoading,
		setError,
		clearUserError,
		getUserAppraisals,
		getUserOptimisticSubmissions,
		getCombinedAppraisals,
		lastFetched,
	} = useNFTAppraisalStore();

	// Get raw data from store
	const rawAppraisals = useMemo(() => {
		return address ? getCombinedAppraisals(address) : [];
	}, [address, getCombinedAppraisals]);

	const confirmedAppraisals = useMemo(() => {
		return address ? getUserAppraisals(address) : [];
	}, [address, getUserAppraisals]);

	const shouldFetch = useCallback(() => {
		if (!address) return false;

		const now = Date.now();
		const lastFetch = lastFetched[address.toLowerCase()] || 0;
		const cacheExpired = now - lastFetch > CACHE_DURATION;

		return cacheExpired;
	}, [address, lastFetched]);

	// Mock fetch function for now - in production this would use actual contract calls
	const fetchUserAppraisals = useCallback(async () => {
		if (!address || !shouldFetch()) return;

		setLoading(address, true);
		clearUserError(address);

		try {
			// Since we don't have actual contract integration yet,
			// we'll work with optimistic submissions only
			// In production, this would fetch real appraisal data
			const optimisticSubmissions = getUserOptimisticSubmissions(address);
			const mockAppraisals: AppraisedNFT[] = optimisticSubmissions.map((submission) => ({
				collection: submission.collection,
				tokenId: submission.tokenId,
				priceUSD: Math.random() > 0.3 ? BigInt(Math.floor(Math.random() * 2000 + 100) * 10**18) : BigInt(0),
				status: Math.random() > 0.4 ? 1 : 0, // 60% completed, 40% pending
				requester: address,
				timestamp: BigInt(Math.floor(submission.timestamp / 1000)),
				lastUpdated: Math.random() > 0.4 ? BigInt(Math.floor(Date.now() / 1000)) : BigInt(0),
			}));

			setAppraisals(address, mockAppraisals);
		} catch (error) {
			console.error("Failed to fetch user appraisals:", error);
			setError(
				address,
				error instanceof Error ? error.message : "Failed to fetch appraisals"
			);
		}
	}, [address, shouldFetch, setLoading, clearUserError, getUserOptimisticSubmissions, setAppraisals, setError]);

	// Auto-refresh effect
	useEffect(() => {
		if (!options.autoRefresh || !address) return;

		const interval = setInterval(() => {
			fetchUserAppraisals();
		}, options.refreshInterval);

		return () => clearInterval(interval);
	}, [address, options.autoRefresh, options.refreshInterval, fetchUserAppraisals]);

	// Initial fetch
	useEffect(() => {
		fetchUserAppraisals();
	}, [fetchUserAppraisals]);

	// Filter logic
	const filteredAppraisals = useMemo(() => {
		let filtered = [...rawAppraisals];

		switch (options.filter) {
			case "pending":
				filtered = filtered.filter(appraisal =>
					!("isOptimistic" in appraisal) && appraisal.status === 0
				);
				break;
			case "completed":
				filtered = filtered.filter(appraisal =>
					!("isOptimistic" in appraisal) && (appraisal.status === 1 || appraisal.status === 2)
				);
				break;
			case "recent":
				filtered = filtered.filter(appraisal => {
					const timestamp = "isOptimistic" in appraisal ? appraisal.timestamp : Number(appraisal.timestamp) * 1000;
					return Date.now() - timestamp < 24 * 60 * 60 * 1000; // Last 24 hours
				});
				break;
			case "highValue":
				filtered = filtered.filter(appraisal => {
					if ("isOptimistic" in appraisal) return false;
					return appraisal.priceUSD > BigInt(1000 * 10**18); // > $1000
				});
				break;
		}

		return filtered;
	}, [rawAppraisals, options.filter]);

	// Sort logic
	const sortedAppraisals = useMemo(() => {
		const sorted = [...filteredAppraisals];

		switch (options.sort) {
			case "newest":
				sorted.sort((a, b) => {
					const timeA = "isOptimistic" in a ? a.timestamp : Number(a.timestamp) * 1000;
					const timeB = "isOptimistic" in b ? b.timestamp : Number(b.timestamp) * 1000;
					return timeB - timeA;
				});
				break;
			case "oldest":
				sorted.sort((a, b) => {
					const timeA = "isOptimistic" in a ? a.timestamp : Number(a.timestamp) * 1000;
					const timeB = "isOptimistic" in b ? b.timestamp : Number(b.timestamp) * 1000;
					return timeA - timeB;
				});
				break;
			case "highestValue":
				sorted.sort((a, b) => {
					if ("isOptimistic" in a) return 1;
					if ("isOptimistic" in b) return -1;
					return Number(b.priceUSD - a.priceUSD);
				});
				break;
			case "lowestValue":
				sorted.sort((a, b) => {
					if ("isOptimistic" in a) return 1;
					if ("isOptimistic" in b) return -1;
					return Number(a.priceUSD - b.priceUSD);
				});
				break;
			case "recentlyUpdated":
				sorted.sort((a, b) => {
					if ("isOptimistic" in a) return 1;
					if ("isOptimistic" in b) return -1;
					const updateA = Number(a.lastUpdated) * 1000;
					const updateB = Number(b.lastUpdated) * 1000;
					return updateB - updateA;
				});
				break;
		}

		// Apply limit if specified
		if (options.limit && options.limit > 0) {
			return sorted.slice(0, options.limit);
		}

		return sorted;
	}, [filteredAppraisals, options.sort, options.limit]);

	// Memoized statistics derived from the same dataset
	const stats = useMemo(() => {
		const total = rawAppraisals.length;
		const completed = confirmedAppraisals.filter(a => a.status === 1 || a.status === 2).length;
		const pending = confirmedAppraisals.filter(a => a.status === 0).length;
		const recent = rawAppraisals.filter(appraisal => {
			const timestamp = "isOptimistic" in appraisal ? appraisal.timestamp : Number(appraisal.timestamp) * 1000;
			return Date.now() - timestamp < 24 * 60 * 60 * 1000;
		}).length;
		const readyForGacha = rawAppraisals.filter(appraisal => {
			if ("isOptimistic" in appraisal) {
				return Date.now() - appraisal.timestamp > 30000; // 30 seconds old
			}
			return appraisal.status === 1 || appraisal.status === 2;
		}).length;
		const totalValue = confirmedAppraisals.reduce(
			(sum, a) => sum + (a.status === 1 || a.status === 2 ? a.priceUSD : BigInt(0)),
			BigInt(0)
		);
		const averageValue = completed > 0 ? totalValue / BigInt(completed) : BigInt(0);

		return {
			total,
			completed,
			pending,
			recent,
			readyForGacha,
			totalValue,
			averageValue,
			highValue: confirmedAppraisals.filter(a => a.priceUSD > BigInt(1000 * 10**18)).length,
		};
	}, [rawAppraisals, confirmedAppraisals]);

	return {
		// Data
		appraisals: sortedAppraisals,
		rawAppraisals,
		confirmedAppraisals,

		// Status
		loading: address ? false : false, // Simplified for now
		error: address ? null : null,

		// Actions
		refetch: fetchUserAppraisals,

		// Statistics
		stats,
	};
};

// Hook for fetching a single appraisal
export const useSingleAppraisal = (
	collection: string,
	tokenId: string
) => {
	const { data: appraisal, isLoading, error } = useReadNftAppraisalGetAppraisal({
		args: [collection as `0x${string}`, BigInt(tokenId)],
		query: {
			enabled: !!collection && !!tokenId,
			staleTime: 10000, // 10 seconds
		},
	});

	return {
		appraisal,
		isLoading,
		error,
	};
};

// Hook to get appraisal statistics for a user
export const useAppraisalStats = (userAddress?: string) => {
	const { address: connectedAddress } = useAccount();
	const address = userAddress || connectedAddress;
	const appraisals = useNFTAppraisalStore((state) =>
		address ? state.getUserAppraisals(address) : []
	);

	const stats = {
		total: appraisals.length,
		completed: appraisals.filter((a) => a.status === 1 || a.status === 2).length,
		pending: appraisals.filter((a) => a.status === 0).length,
		totalValue: appraisals.reduce(
			(sum, a) => sum + (a.status === 1 || a.status === 2 ? a.priceUSD : BigInt(0)),
			BigInt(0)
		),
		recent24h: appraisals.filter(
			(a) => Date.now() - Number(a.timestamp) * 1000 < 24 * 60 * 60 * 1000
		).length,
	};

	return stats;
};