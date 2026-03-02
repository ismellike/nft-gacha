import { useCallback, useEffect, useMemo, useRef } from "react";
import { useAccount } from "wagmi";
import { logger } from "../lib/logger";
import {
	useReadNftAppraisalAppraisalFee,
	useReadNftAppraisalGetBatchAppraisals,
	useWatchNftAppraisalServiceHandlerAppraisalErrorReceived,
	useWatchNftAppraisalServiceHandlerAppraisalProcessed,
} from "../generated";
import {
	type AppraisedNFT,
	useNFTAppraisalStore,
} from "../stores/nftAppraisalStore";
import { HIGH_VALUE_THRESHOLD } from "../lib/constants";
import { useGachaContracts } from "./useGachaContracts";
import { useGachaId } from "./useGachaId";

type AppraisalFilter =
	| "all"
	| "pending"
	| "completed"
	| "recent"
	| "highValue";
type AppraisalSort =
	| "newest"
	| "oldest"
	| "highestValue"
	| "lowestValue"
	| "recentlyUpdated";

interface UseAppraisalDataOptions {
	autoRefresh?: boolean;
	refreshInterval?: number;
	filter?: AppraisalFilter;
	sort?: AppraisalSort;
	limit?: number;
	knownNFTs?: Array<{ collection: string; tokenId: string }>;
	enableEventDiscovery?: boolean;
}

// Cache for 30 seconds to prevent excessive API calls
const CACHE_DURATION = 30 * 1000;

export const useAppraisalData = (
	userAddress?: string,
	options: UseAppraisalDataOptions = {
		autoRefresh: true,
		refreshInterval: 30000,
		filter: "all",
		sort: "newest",
	},
) => {
	const { address: connectedAddress } = useAccount();
	const address = userAddress || connectedAddress;
	const gachaId = useGachaId();
	const contracts = useGachaContracts(gachaId);

	const {
		setAppraisals,
		setLoading,
		setError,
		clearUserError,
		getUserAppraisals,
		getUserOptimisticSubmissions,
		getCombinedAppraisals,
		lastFetched,
		addOptimisticSubmission,
	} = useNFTAppraisalStore();

	// Combine known NFTs with optimistic submissions
	const allKnownNFTs = useMemo(() => {
		if (!address) return [];

		const optimisticNFTs = getUserOptimisticSubmissions(address);
		const knownNFTs = options.knownNFTs || [];

		// Create a map to deduplicate NFTs
		const nftMap = new Map<string, { collection: string; tokenId: string }>();

		// Add optimistic NFTs
		optimisticNFTs.forEach((nft) => {
			const key = `${nft.collection.toLowerCase()}:${nft.tokenId}`;
			nftMap.set(key, { collection: nft.collection, tokenId: nft.tokenId });
		});

		// Add known NFTs (don't overwrite optimistic)
		knownNFTs.forEach((nft) => {
			const key = `${nft.collection.toLowerCase()}:${nft.tokenId}`;
			if (!nftMap.has(key)) {
				nftMap.set(key, { collection: nft.collection, tokenId: nft.tokenId });
			}
		});

		return Array.from(nftMap.values());
	}, [address, options.knownNFTs, getUserOptimisticSubmissions]);

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

	const knownKeys = useMemo(() => {
		const keys = new Set<string>();
		allKnownNFTs.forEach((nft) => {
			keys.add(`${nft.collection.toLowerCase()}:${nft.tokenId}`);
		});
		return keys;
	}, [allKnownNFTs]);

	// Get appraisal fee information
	const { data: appraisalFee } = useReadNftAppraisalAppraisalFee({
		address: contracts.appraisal as `0x${string}` | undefined,
		query: {
			enabled: !!contracts.appraisal,
			staleTime: 300000, // 5 minutes cache
		},
	});

	// Prepare batch query data - use all known NFTs for comprehensive coverage
	const batchQueryArgs = useMemo(() => {
		if (allKnownNFTs.length === 0) return null;

		return {
			collections: allKnownNFTs.map((nft) => nft.collection as `0x${string}`),
			tokenIds: allKnownNFTs.map((nft) => BigInt(nft.tokenId)),
		};
	}, [allKnownNFTs]);

	// Use the batch appraisal function with wagmi
	const {
		data: batchResults,
		isLoading: isBatchLoading,
		error: batchError,
	} = useReadNftAppraisalGetBatchAppraisals({
		args: batchQueryArgs
			? [batchQueryArgs.collections, batchQueryArgs.tokenIds]
			: undefined,
		query: {
			enabled: !!batchQueryArgs && shouldFetch(),
			staleTime: CACHE_DURATION,
		},
	});

	// Process batch results and update store
	const processBatchResults = useCallback(() => {
		if (!address || !batchResults || !allKnownNFTs.length) return;

		setLoading(address, true);
		clearUserError(address);

		try {
			// batchResults is a tuple [prices, statuses]
			if (
				batchResults &&
				Array.isArray(batchResults) &&
				batchResults.length === 2
			) {
				const [prices, statuses] = batchResults;

				// Validate array lengths match the number of NFTs
				if (
					prices.length !== allKnownNFTs.length ||
					statuses.length !== allKnownNFTs.length
				) {
					logger.contracts.warn(
						"Batch results length mismatch with NFTs array",
					);
					return;
				}

				// Convert batch results to our format, using optimistic submission timestamps when available
				const currentOptimistic = address
					? useNFTAppraisalStore
							.getState()
							.getUserOptimisticSubmissions(address)
					: [];
				const appraisedNFTs: AppraisedNFT[] = allKnownNFTs.map((nft, index) => {
					const price = prices[index];
					const status = statuses[index];

					// Try to get timestamp from optimistic submissions
					const optimisticSubmission = currentOptimistic.find(
						(sub) =>
							sub.collection.toLowerCase() === nft.collection.toLowerCase() &&
							sub.tokenId === nft.tokenId,
					);

					// Get current timestamp for lastUpdated
					const currentTime = BigInt(Math.floor(Date.now() / 1000));

					return {
						collection: nft.collection,
						tokenId: nft.tokenId,
						priceUSD: price ?? BigInt(0),
						status: Number(status) || 0,
						requester: address,
						timestamp: optimisticSubmission
							? BigInt(Math.floor(optimisticSubmission.timestamp / 1000))
							: BigInt(0),
						lastUpdated: (Number(status) || 0) === 0 ? BigInt(0) : currentTime,
					};
				});

				// Filter out NFTs that are still pending (no appraisal yet) but keep those with status updates
				const completedAppraisals = appraisedNFTs.filter(
					(nft) => nft.priceUSD > BigInt(0) || nft.status !== 0,
				);

				setAppraisals(address, completedAppraisals);

				// Remove optimistic submissions that are now appraised
				currentOptimistic.forEach((submission) => {
					const isAppraised = completedAppraisals.some(
						(appraised) =>
							appraised.collection.toLowerCase() ===
								submission.collection.toLowerCase() &&
							appraised.tokenId === submission.tokenId,
					);
					if (isAppraised) {
						useNFTAppraisalStore
							.getState()
							.removeOptimisticSubmission(
								address,
								submission.collection,
								submission.tokenId,
							);
					}
				});
			}
		} catch (error) {
			logger.contracts.error("Failed to process batch results:", error);
			setError(
				address,
				error instanceof Error ? error.message : "Failed to process appraisals",
			);
		} finally {
			setLoading(address, false);
		}
	}, [
		address,
		batchResults,
		allKnownNFTs,
		setLoading,
		clearUserError,
		setAppraisals,
		setError,
	]);

	// Process results whenever they change
	useEffect(() => {
		processBatchResults();
	}, [processBatchResults]);

	// Fetch appraisals for known NFTs using batch calls
	const fetchUserAppraisals = useCallback(() => {
		// The actual fetching is now handled by wagmi's useReadNftAppraisalGetBatchAppraisals
		// We just trigger a refetch by updating the query key
		if (address) {
			processBatchResults();
		}
	}, [address, processBatchResults]);

	// Update loading state based on batch query
	useEffect(() => {
		if (address) {
			setLoading(address, isBatchLoading);
		}
	}, [address, isBatchLoading, setLoading]);

	// Auto-refresh effect
	// Use a ref to avoid dependency on the callback
	const fetchRef = useRef(fetchUserAppraisals);
	fetchRef.current = fetchUserAppraisals;

	useEffect(() => {
		if (!options.autoRefresh || !address) return;

		const interval = setInterval(() => {
			fetchRef.current();
		}, options.refreshInterval);

		return () => clearInterval(interval);
	}, [address, options.autoRefresh, options.refreshInterval]);

	// React to service handler events for the user's known NFTs
	useWatchNftAppraisalServiceHandlerAppraisalProcessed({
		address: contracts.appraisalServiceHandler as `0x${string}` | undefined,
		enabled: !!contracts.appraisalServiceHandler && !!address,
		onLogs: (logs: unknown[]) => {
			const shouldRefetch = logs.some((log: unknown) => {
				const { collection, tokenId } = ((log as { args?: unknown }).args ||
					{}) as {
					collection?: `0x${string}`;
					tokenId?: bigint;
				};
				if (!collection || tokenId === undefined) return false;
				const key = `${collection.toLowerCase()}:${BigInt(tokenId).toString()}`;
				return knownKeys.has(key);
			});

			if (shouldRefetch) {
				fetchUserAppraisals();
			}
		},
	});

	useWatchNftAppraisalServiceHandlerAppraisalErrorReceived({
		address: contracts.appraisalServiceHandler as `0x${string}` | undefined,
		enabled: !!contracts.appraisalServiceHandler && !!address,
		onLogs: (logs: unknown[]) => {
			const shouldRefetch = logs.some((log: unknown) => {
				const { contractAddress, tokenId } = ((log as { args?: unknown })
					.args || {}) as {
					contractAddress?: `0x${string}`;
					tokenId?: bigint;
				};
				if (!contractAddress || tokenId === undefined) return false;
				const key = `${contractAddress.toLowerCase()}:${BigInt(tokenId).toString()}`;
				return knownKeys.has(key);
			});

			if (shouldRefetch) {
				// Mark a user-visible error, then trigger a refresh so UI can drop optimistic entries
				if (address) {
					setError(address, "Appraisal failed to process");
				}
				fetchUserAppraisals();
			}
		},
	});

	// Initial fetch is handled by the wagmi query automatically

	// Filter logic
	const filteredAppraisals = useMemo(() => {
		let filtered = [...rawAppraisals];

		switch (options.filter) {
			case "pending":
				filtered = filtered.filter(
					(appraisal) =>
						!("isOptimistic" in appraisal) && appraisal.status === 0,
				);
				break;
			case "completed":
				filtered = filtered.filter(
					(appraisal) =>
						!("isOptimistic" in appraisal) &&
						(appraisal.status === 1 || appraisal.status === 2),
				);
				break;
			case "recent":
				filtered = filtered.filter((appraisal) => {
					const timestamp =
						"isOptimistic" in appraisal
							? appraisal.timestamp
							: Number(appraisal.timestamp) * 1000;
					return Date.now() - timestamp < 24 * 60 * 60 * 1000; // Last 24 hours
				});
				break;
			case "highValue":
				filtered = filtered.filter((appraisal) => {
					if ("isOptimistic" in appraisal) return false;
					return appraisal.priceUSD > HIGH_VALUE_THRESHOLD; // > $1000
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
					const timeA =
						"isOptimistic" in a ? a.timestamp : Number(a.timestamp) * 1000;
					const timeB =
						"isOptimistic" in b ? b.timestamp : Number(b.timestamp) * 1000;
					return timeB - timeA;
				});
				break;
			case "oldest":
				sorted.sort((a, b) => {
					const timeA =
						"isOptimistic" in a ? a.timestamp : Number(a.timestamp) * 1000;
					const timeB =
						"isOptimistic" in b ? b.timestamp : Number(b.timestamp) * 1000;
					return timeA - timeB;
				});
				break;
			case "highestValue":
				sorted.sort((a, b) => {
					if ("isOptimistic" in a) return 1;
					if ("isOptimistic" in b) return -1;
					return b.priceUSD > a.priceUSD ? -1 : b.priceUSD < a.priceUSD ? 1 : 0;
				});
				break;
			case "lowestValue":
				sorted.sort((a, b) => {
					if ("isOptimistic" in a) return 1;
					if ("isOptimistic" in b) return -1;
					return a.priceUSD > b.priceUSD ? -1 : a.priceUSD < b.priceUSD ? 1 : 0;
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
		const completed = confirmedAppraisals.filter(
			(a) => a.status === 1 || a.status === 2,
		).length;
		const pending = confirmedAppraisals.filter((a) => a.status === 0).length;
		const recent = rawAppraisals.filter((appraisal) => {
			const timestamp =
				"isOptimistic" in appraisal
					? appraisal.timestamp
					: Number(appraisal.timestamp) * 1000;
			return Date.now() - timestamp < 24 * 60 * 60 * 1000;
		}).length;
		const readyForGacha = rawAppraisals.filter((appraisal) => {
			if ("isOptimistic" in appraisal) {
				return Date.now() - appraisal.timestamp > 30000; // 30 seconds old
			}
			return appraisal.status === 1 || appraisal.status === 2;
		}).length;
		const totalValue = confirmedAppraisals.reduce(
			(sum, a) =>
				sum + (a.status === 1 || a.status === 2 ? a.priceUSD : BigInt(0)),
			BigInt(0),
		);
		const averageValue =
			completed > 0 ? totalValue / BigInt(completed) : BigInt(0);

		return {
			total,
			completed,
			pending,
			recent,
			readyForGacha,
			totalValue,
			averageValue,
			highValue: confirmedAppraisals.filter(
				(a) => a.priceUSD > HIGH_VALUE_THRESHOLD,
			).length,
		};
	}, [rawAppraisals, confirmedAppraisals]);

	return {
		// Data
		appraisals: sortedAppraisals,
		rawAppraisals,
		confirmedAppraisals,
		knownNFTs: allKnownNFTs,

		// Status
		loading: address ? isBatchLoading : false,
		error: address
			? batchError
				? batchError instanceof Error
					? batchError.message
					: "Failed to fetch appraisals"
				: null
			: null,

		// Actions
		refetch: fetchUserAppraisals,
		addKnownNFT: (collection: string, tokenId: string) => {
			if (address) {
				addOptimisticSubmission(address, collection, tokenId);
			}
		},
		checkHasAppraisal: (collection: string, tokenId: string) => {
			// Quick check to see if we already have data for this NFT
			return rawAppraisals.some(
				(appraisal) =>
					appraisal.collection.toLowerCase() === collection.toLowerCase() &&
					appraisal.tokenId === tokenId,
			);
		},

		// Contract data
		appraisalFee,

		// Statistics
		stats,
	};
};
