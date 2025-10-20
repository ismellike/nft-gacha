import { useEffect, useCallback, useMemo } from "react";
import { useAccount } from "wagmi";
import { useReadNftAppraisalGetAppraisal } from "../generated";
import {
	useNFTAppraisalStore,
	type AppraisedNFT,
} from "../stores/nftAppraisalStore";

interface UseAppraisalsOptions {
	autoRefresh?: boolean;
	refreshInterval?: number;
	enablePolling?: boolean;
	pollingInterval?: number;
}

// Cache configuration
const DEFAULT_CACHE_DURATION = 30 * 1000; // 30 seconds
const DEFAULT_REFRESH_INTERVAL = 60 * 1000; // 1 minute
const DEFAULT_POLLING_INTERVAL = 10 * 1000; // 10 seconds for pending appraisals

export const useAppraisals = (
	userAddress?: string,
	options: UseAppraisalsOptions = {
		autoRefresh: true,
		refreshInterval: DEFAULT_REFRESH_INTERVAL,
		enablePolling: true,
		pollingInterval: DEFAULT_POLLING_INTERVAL,
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
		refreshUserAppraisals,
		lastFetched,
		loading,
		error,
	} = useNFTAppraisalStore();

	// Get combined appraisals (confirmed + optimistic)
	const combinedAppraisals = useMemo(() => {
		return address ? getCombinedAppraisals(address) : [];
	}, [address, getCombinedAppraisals]);

	// Get confirmed appraisals only
	const confirmedAppraisals = useMemo(() => {
		return address ? getUserAppraisals(address) : [];
	}, [address, getUserAppraisals]);

	// Get optimistic submissions only
	const optimisticSubmissions = useMemo(() => {
		return address ? getUserOptimisticSubmissions(address) : [];
	}, [address, getUserOptimisticSubmissions]);

	// Check if cache is expired
	const isCacheExpired = useCallback(() => {
		if (!address) return true;

		const now = Date.now();
		const lastFetch = lastFetched[address.toLowerCase()] || 0;
		return now - lastFetch > DEFAULT_CACHE_DURATION;
	}, [address, lastFetched]);

	// Fetch single appraisal
	const fetchSingleAppraisal = useCallback(async (
		collection: string,
		tokenId: string
	): Promise<AppraisedNFT | null> => {
		try {
			// For now, we need to mock this since the contract integration isn't complete
			// In a real implementation, this would use the actual contract call
			const mockStatus = Math.random() > 0.5 ? 1 : 0;
			const mockPrice = mockStatus === 1
				? BigInt(Math.floor(Math.random() * 1000) + 100) * BigInt(10 ** 18)
				: BigInt(0);

			const appraisal: AppraisedNFT = {
				collection,
				tokenId,
				priceUSD: mockPrice,
				status: mockStatus,
				requester: address || "",
				timestamp: BigInt(Math.floor(Date.now() / 1000)),
				lastUpdated: mockStatus === 1 ? BigInt(Math.floor(Date.now() / 1000)) : BigInt(0),
			};

			return appraisal;
		} catch (error) {
			console.error(`Failed to fetch appraisal for ${collection}:${tokenId}:`, error);
			return null;
		}
	}, [address]);

	// Fetch all appraisals for user
	const fetchUserAppraisals = useCallback(async () => {
		if (!address || !isCacheExpired()) return;

		setLoading(address, true);
		clearUserError(address);

		try {
			const appraisals: AppraisedNFT[] = [];

			// Since we don't have a direct way to get all user appraisals from the contract,
			// we'll need to fetch them individually based on the optimistic submissions
			// In a real implementation, you would have a contract function to get all user appraisals
			const optimisticSubmissions = getUserOptimisticSubmissions(address);

			for (const submission of optimisticSubmissions) {
				const appraisal = await fetchSingleAppraisal(submission.collection, submission.tokenId);
				if (appraisal) {
					appraisals.push(appraisal);
				}
			}

			setAppraisals(address, appraisals);
		} catch (error) {
			console.error("Failed to fetch user appraisals:", error);
			setError(
				address,
				error instanceof Error ? error.message : "Failed to fetch appraisals"
			);
		} finally {
			setLoading(address, false);
		}
	}, [
		address,
		isCacheExpired,
		setLoading,
		clearUserError,
		getUserOptimisticSubmissions,
		fetchSingleAppraisal,
		setAppraisals,
		setError,
	]);

	// Fetch appraisals for specific NFTs (used when we have a list of NFTs to check)
	const fetchAppraisalsForNFTs = useCallback(async (
		nfts: Array<{ collection: string; tokenId: string }>
	) => {
		if (!address || nfts.length === 0) return;

		setLoading(address, true);
		clearUserError(address);

		try {
			const appraisals: AppraisedNFT[] = [];

			for (const nft of nfts) {
				const appraisal = await fetchSingleAppraisal(nft.collection, nft.tokenId);
				if (appraisal) {
					appraisals.push(appraisal);
				}
			}

			// Merge with existing appraisals
			const existingAppraisals = getUserAppraisals(address);
			const mergedAppraisals = [...existingAppraisals];

			for (const newAppraisal of appraisals) {
				const existingIndex = mergedAppraisals.findIndex(
					(a) => a.collection.toLowerCase() === newAppraisal.collection.toLowerCase() &&
					a.tokenId === newAppraisal.tokenId
				);

				if (existingIndex >= 0) {
					mergedAppraisals[existingIndex] = newAppraisal;
				} else {
					mergedAppraisals.push(newAppraisal);
				}
			}

			setAppraisals(address, mergedAppraisals);
		} catch (error) {
			console.error("Failed to fetch appraisals for NFTs:", error);
			setError(
				address,
				error instanceof Error ? error.message : "Failed to fetch appraisals"
			);
		} finally {
			setLoading(address, false);
		}
	}, [
		address,
		setLoading,
		clearUserError,
		getUserAppraisals,
		fetchSingleAppraisal,
		setAppraisals,
		setError,
	]);

	// Poll for pending appraisals (more frequent updates)
	const pollPendingAppraisals = useCallback(async () => {
		if (!address || !options.enablePolling) return;

		const pendingAppraisals = confirmedAppraisals.filter(a => a.status === 0);
		if (pendingAppraisals.length === 0) return;

		try {
			const updatedAppraisals: AppraisedNFT[] = [];

			for (const appraisal of pendingAppraisals) {
				const updated = await fetchSingleAppraisal(appraisal.collection, appraisal.tokenId);
				if (updated) {
					updatedAppraisals.push(updated);
				}
			}

			// Update only the appraisals that have changed
			if (updatedAppraisals.length > 0) {
				const existingAppraisals = getUserAppraisals(address);
				const finalAppraisals = [...existingAppraisals];

				for (const updated of updatedAppraisals) {
					const index = finalAppraisals.findIndex(
						(a) => a.collection.toLowerCase() === updated.collection.toLowerCase() &&
						a.tokenId === updated.tokenId
					);

					if (index >= 0) {
						finalAppraisals[index] = updated;
					}
				}

				setAppraisals(address, finalAppraisals);
			}
		} catch (error) {
			console.error("Failed to poll pending appraisals:", error);
		}
	}, [
		address,
		options.enablePolling,
		confirmedAppraisals,
		fetchSingleAppraisal,
		getUserAppraisals,
		setAppraisals,
	]);

	// Auto-refresh effect
	useEffect(() => {
		if (!options.autoRefresh || !address) return;

		const interval = setInterval(() => {
			fetchUserAppraisals();
		}, options.refreshInterval);

		return () => clearInterval(interval);
	}, [address, options.autoRefresh, options.refreshInterval, fetchUserAppraisals]);

	// Polling effect for pending appraisals
	useEffect(() => {
		if (!options.enablePolling || !address) return;

		const interval = setInterval(() => {
			pollPendingAppraisals();
		}, options.pollingInterval);

		return () => clearInterval(interval);
	}, [address, options.enablePolling, options.pollingInterval, pollPendingAppraisals]);

	// Initial fetch
	useEffect(() => {
		if (address && isCacheExpired()) {
			fetchUserAppraisals();
		}
	}, [address, isCacheExpired, fetchUserAppraisals]);

	// Computed values
	const isLoading = address ? loading[address.toLowerCase()] || false : false;
	const currentError = address ? error[address.toLowerCase()] || null : null;

	// Statistics
	const stats = useMemo(() => {
		return {
			total: combinedAppraisals.length,
			completed: confirmedAppraisals.filter(a => a.status === 1 || a.status === 2).length,
			pending: confirmedAppraisals.filter(a => a.status === 0).length,
			optimistic: optimisticSubmissions.length,
			totalValue: confirmedAppraisals.reduce(
				(sum, a) => sum + (a.status === 1 || a.status === 2 ? a.priceUSD : BigInt(0)),
				BigInt(0)
			),
			recent24h: combinedAppraisals.filter(nft => {
				const timestamp = "timestamp" in nft
					? ("isOptimistic" in nft ? nft.timestamp : Number(nft.timestamp) * 1000)
					: nft.timestamp;
				return Date.now() - timestamp < 24 * 60 * 60 * 1000;
			}).length,
			readyForGacha: combinedAppraisals.filter(nft => {
				// Check if appraisal is complete or if it's an optimistic submission older than 30 seconds
				if ("isOptimistic" in nft) {
					return Date.now() - nft.timestamp > 30000;
				}
				return nft.status === 1 || nft.status === 2;
			}).length,
		};
	}, [combinedAppraisals, confirmedAppraisals, optimisticSubmissions]);

	// Actions
	const invalidateCache = useCallback(() => {
		if (address) {
			refreshUserAppraisals(address);
		}
	}, [address, refreshUserAppraisals]);

	const refresh = useCallback(() => {
		fetchUserAppraisals();
	}, [fetchUserAppraisals]);

	return {
		// Data
		appraisals: confirmedAppraisals,
		combinedAppraisals,
		optimisticSubmissions,

		// Status
		isLoading,
		error: currentError,

		// Actions
		refetch: refresh,
		invalidateCache,
		fetchAppraisalsForNFTs,
		refresh,

		// Statistics
		stats,

		// Utilities
		isCacheExpired: isCacheExpired(),
	};
};

// Hook for a single appraisal
export const useSingleAppraisal = (collection: string, tokenId: string) => {
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

// Hook to get appraisal statistics for a user (alias for consistency)
export const useAppraisalStats = (userAddress?: string) => {
	const { stats } = useAppraisals(userAddress, { autoRefresh: false });
	return stats;
};