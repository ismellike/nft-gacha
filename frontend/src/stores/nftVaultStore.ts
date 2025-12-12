import { create } from "zustand";

export type VaultActionType = "deposit" | "withdraw" | "appraise";

export type VaultNFT = {
	collection: string;
	tokenId: string;
	collectionName?: string;
	rarity?: string;
	isAppraised?: boolean;
	canWithdraw?: boolean;
	depositCount?: bigint;
	appraisedValue?: bigint;
};

type VaultState = {
	walletNFTs: VaultNFT[];
	depositedNFTs: VaultNFT[];
	loadingWallet: boolean;
	loadingDeposited: boolean;
	processing: Record<string, VaultActionType>;
	error?: string;
};

type VaultActions = {
	setWalletNFTs: (nfts: VaultNFT[]) => void;
	setDepositedNFTs: (nfts: VaultNFT[]) => void;
	setLoadingWallet: (loading: boolean) => void;
	setLoadingDeposited: (loading: boolean) => void;
	startProcessing: (id: string, action: VaultActionType) => void;
	stopProcessing: (id: string) => void;
	removeWalletNFT: (id: string) => void;
	removeDepositedNFT: (id: string) => void;
	addWalletNFT: (nft: VaultNFT) => void;
	addDepositedNFT: (nft: VaultNFT) => void;
	setError: (message?: string) => void;
	reset: () => void;
};

const initialState: VaultState = {
	walletNFTs: [],
	depositedNFTs: [],
	loadingWallet: false,
	loadingDeposited: false,
	processing: {},
	error: undefined,
};

export const useNFTVaultStore = create<VaultState & VaultActions>((set, get) => ({
	...initialState,

	setWalletNFTs: (nfts) => set({ walletNFTs: nfts }),
	setDepositedNFTs: (nfts) => set({ depositedNFTs: nfts }),
	setLoadingWallet: (loading) => set({ loadingWallet: loading }),
	setLoadingDeposited: (loading) => set({ loadingDeposited: loading }),
	startProcessing: (id, action) =>
		set((state) => ({
			processing: { ...state.processing, [id]: action },
			error: undefined,
		})),
	stopProcessing: (id) =>
		set((state) => {
			const next = { ...state.processing };
			delete next[id];
			return { processing: next };
		}),
	removeWalletNFT: (id) =>
		set((state) => ({
			walletNFTs: state.walletNFTs.filter(
				(nft) => `${nft.collection}:${nft.tokenId}` !== id,
			),
		})),
	removeDepositedNFT: (id) =>
		set((state) => ({
			depositedNFTs: state.depositedNFTs.filter(
				(nft) => `${nft.collection}:${nft.tokenId}` !== id,
			),
		})),
	addWalletNFT: (nft) =>
		set((state) => ({
			walletNFTs: [...state.walletNFTs, nft],
		})),
	addDepositedNFT: (nft) =>
		set((state) => ({
			depositedNFTs: [...state.depositedNFTs, nft],
		})),
	setError: (message) => set({ error: message }),
	reset: () => set(initialState),
}));
