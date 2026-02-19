"use client";

import { useCallback, useState } from "react";
import type { Address } from "viem";
import type { DepositedNFT } from "./useUserDepositedNFTs";

export interface AppraisalInfo {
	hasAppraisal: boolean;
	priceUSD: bigint;
}

interface NFTWithCollection extends DepositedNFT {
	collectionName?: string;
}

export interface VaultState {
	appraisedNFTs: Set<string>;
	appraisalData: Map<string, AppraisalInfo>;
	depositedNFTs: NFTWithCollection[];
	withdrawingNFT: { collection: Address; tokenId: bigint } | null;
	selectedForWithdrawal: Set<string>;
	isBatchWithdrawing: boolean;
}

const createNFTKey = (collection: string, tokenId: string | bigint): string =>
	`${collection.toLowerCase()}:${tokenId.toString()}`;

export function useVaultState(initialState: Partial<VaultState> = {}) {
	const [state, setState] = useState<VaultState>({
		appraisedNFTs: new Set(),
		appraisalData: new Map(),
		depositedNFTs: [],
		withdrawingNFT: null,
		selectedForWithdrawal: new Set(),
		isBatchWithdrawing: false,
		...initialState,
	});

	const updateState = useCallback(
		<K extends keyof VaultState>(key: K, value: VaultState[K]) => {
			setState((prev) => ({ ...prev, [key]: value }));
		},
		[],
	);

	const updateAppraisedStatus = useCallback(
		(
			collection: string,
			tokenId: string,
			hasValidAppraisal?: boolean,
			priceUSD?: bigint,
		) => {
			const key = createNFTKey(collection, tokenId);

			setState((prev) => {
				const newAppraised = new Set(prev.appraisedNFTs);
				const newAppraisalData = new Map(prev.appraisalData);

				// Use explicit undefined check instead of truthy check to handle 0n values
				if (hasValidAppraisal && priceUSD !== undefined) {
					newAppraised.add(key);
					newAppraisalData.set(key, { hasAppraisal: true, priceUSD });
				} else {
					newAppraised.delete(key);
					newAppraisalData.delete(key);
				}

				return {
					...prev,
					appraisedNFTs: newAppraised,
					appraisalData: newAppraisalData,
				};
			});
		},
		[],
	);

	const cleanupOrphanedState = useCallback((validKeys: Set<string>) => {
		setState((prev) => {
			const newAppraised = new Set<string>();
			const newAppraisalData = new Map();

			prev.appraisedNFTs.forEach((key) => {
				if (validKeys.has(key)) newAppraised.add(key);
			});

			prev.appraisalData.forEach((value, key) => {
				if (validKeys.has(key)) newAppraisalData.set(key, value);
			});

			return {
				...prev,
				appraisedNFTs: newAppraised,
				appraisalData: newAppraisalData,
			};
		});
	}, []);

	return {
		state,
		updateState,
		updateAppraisedStatus,
		cleanupOrphanedState,
	};
}
