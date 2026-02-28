import { create } from "zustand";

export interface AppraisedNFT {
	collection: string;
	tokenId: string;
	priceUSD: bigint;
	status: number; // 0: Pending, 1: Completed, 2: OwnerOverride
	requester: string;
	timestamp: bigint;
	lastUpdated: bigint;
}

interface OptimisticAppraisal {
	collection: string;
	tokenId: string;
	timestamp: number;
	isOptimistic: boolean;
}

interface NFTAppraisalStore {
	// State
	appraisals: Record<string, AppraisedNFT[]>; // keyed by user address
	optimisticSubmissions: Record<string, OptimisticAppraisal[]>; // keyed by user address
	loading: Record<string, boolean>; // keyed by user address
	error: Record<string, string | null>; // keyed by user address
	lastFetched: Record<string, number>; // keyed by user address

	// Actions
	setAppraisals: (userAddress: string, appraisals: AppraisedNFT[]) => void;
	addOptimisticSubmission: (
		userAddress: string,
		collection: string,
		tokenId: string,
	) => void;
	removeOptimisticSubmission: (
		userAddress: string,
		collection: string,
		tokenId: string,
	) => void;
	setLoading: (userAddress: string, loading: boolean) => void;
	setError: (userAddress: string, error: string | null) => void;
	clearUserError: (userAddress: string) => void;
	getUserAppraisals: (userAddress: string) => AppraisedNFT[];
	getUserOptimisticSubmissions: (userAddress: string) => OptimisticAppraisal[];
	getCombinedAppraisals: (
		userAddress: string,
	) => (AppraisedNFT | OptimisticAppraisal)[];
	refreshUserAppraisals: (userAddress: string) => void;
}

// Helper function to create a unique key for an NFT
const getNFTKey = (collection: string, tokenId: string) =>
	`${collection.toLowerCase()}:${tokenId}`;

export const useNFTAppraisalStore = create<NFTAppraisalStore>()((set, get) => ({
	appraisals: {},
	optimisticSubmissions: {},
	loading: {},
	error: {},
	lastFetched: {},

	setAppraisals: (userAddress, appraisals) => {
		set((state) => ({
			appraisals: {
				...state.appraisals,
				[userAddress.toLowerCase()]: appraisals,
			},
			lastFetched: {
				...state.lastFetched,
				[userAddress.toLowerCase()]: Date.now(),
			},
			loading: {
				...state.loading,
				[userAddress.toLowerCase()]: false,
			},
			error: {
				...state.error,
				[userAddress.toLowerCase()]: null,
			},
		}));
	},

	addOptimisticSubmission: (userAddress, collection, tokenId) => {
		const address = userAddress.toLowerCase();
		const nftKey = getNFTKey(collection, tokenId);

		set((state) => {
			const existingOptimistic = state.optimisticSubmissions[address] || [];
			const nftExists = existingOptimistic.some(
				(nft) => getNFTKey(nft.collection, nft.tokenId) === nftKey,
			);

			if (nftExists) return state; // Don't add duplicates

			return {
				optimisticSubmissions: {
					...state.optimisticSubmissions,
					[address]: [
						...existingOptimistic,
						{
							collection,
							tokenId,
							timestamp: Date.now(),
							isOptimistic: true,
						},
					],
				},
			};
		});
	},

	removeOptimisticSubmission: (userAddress, collection, tokenId) => {
		const address = userAddress.toLowerCase();
		const nftKey = getNFTKey(collection, tokenId);

		set((state) => {
			const existingOptimistic = state.optimisticSubmissions[address] || [];
			const filtered = existingOptimistic.filter(
				(nft) => getNFTKey(nft.collection, nft.tokenId) !== nftKey,
			);

			return {
				optimisticSubmissions: {
					...state.optimisticSubmissions,
					[address]: filtered,
				},
			};
		});
	},

	setLoading: (userAddress, loading) => {
		set((state) => ({
			loading: {
				...state.loading,
				[userAddress.toLowerCase()]: loading,
			},
		}));
	},

	setError: (userAddress, error) => {
		set((state) => ({
			error: {
				...state.error,
				[userAddress.toLowerCase()]: error,
			},
			loading: {
				...state.loading,
				[userAddress.toLowerCase()]: false,
			},
		}));
	},

	clearUserError: (userAddress) => {
		set((state) => ({
			error: {
				...state.error,
				[userAddress.toLowerCase()]: null,
			},
		}));
	},

	getUserAppraisals: (userAddress) => {
		return get().appraisals[userAddress.toLowerCase()] || [];
	},

	getUserOptimisticSubmissions: (userAddress) => {
		return get().optimisticSubmissions[userAddress.toLowerCase()] || [];
	},

	getCombinedAppraisals: (userAddress) => {
		const confirmedAppraisals = get().getUserAppraisals(userAddress);
		const optimisticSubmissions =
			get().getUserOptimisticSubmissions(userAddress);

		// Remove any optimistic submissions that already exist in confirmed appraisals
		const filteredOptimistic = optimisticSubmissions.filter((optimistic) => {
			const nftKey = getNFTKey(optimistic.collection, optimistic.tokenId);
			return !confirmedAppraisals.some(
				(confirmed) =>
					getNFTKey(confirmed.collection, confirmed.tokenId) === nftKey,
			);
		});

		// Combine confirmed appraisals with optimistic submissions
		const combined = [...confirmedAppraisals, ...filteredOptimistic];

		// Sort by timestamp (newest first)
		return combined.sort(
			(
				a: AppraisedNFT | OptimisticAppraisal,
				b: AppraisedNFT | OptimisticAppraisal,
			) => {
				const timeA =
					"timestamp" in a
						? Number(a.timestamp)
						: (a as OptimisticAppraisal).timestamp;
				const timeB =
					"timestamp" in b
						? Number(b.timestamp)
						: (b as OptimisticAppraisal).timestamp;
				return timeB - timeA;
			},
		);
	},

	refreshUserAppraisals: (userAddress) => {
		set((state) => ({
			lastFetched: {
				...state.lastFetched,
				[userAddress.toLowerCase()]: 0, // Reset to force refresh
			},
		}));
	},
}));

