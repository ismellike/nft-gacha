"use client";

/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useState, useCallback, useMemo } from "react";
import { useAccount, usePublicClient } from "wagmi";
import { motion } from "framer-motion";
import {
	BanknotesIcon,
	GiftIcon,
	WalletIcon,
	ChartBarIcon,
	TrophyIcon,
	ShieldCheckIcon,
} from "@heroicons/react/24/outline";

import { Button } from "../../ui";
import { Card } from "../../ui";
import { GachaSectionLayout } from "./GachaSectionLayout";
import {
	VaultTabNavigation,
	DepositTab,
	WithdrawTab,
	YieldTab,
} from "../../components/vault";
import {
	useDepositorVaultData,
	formatTokenAmount,
	useClaimYield,
	type UserDepositorData,
} from "../../hooks/useDepositorVault";
import { useNFTWithdrawal } from "../../hooks/useNFTWithdrawal";
import {
	useUserDepositedNFTs,
	type DepositedNFT,
} from "../../hooks/useUserDepositedNFTs";
import { useNFTDeposit } from "../../hooks/useNFTDeposit";
import { useUserOwnedNFTsMultipleCollections } from "../../hooks/useUserOwnedNFTs";
import type { UserOwnedNFTMultiCollection } from "../../types/hooks";
import { useGachaContracts } from "../../hooks/useGachaContracts";
import { useGachaId } from "../../hooks/useGachaId";
import { getGachaConfig } from "../../lib/gacha-config";
import { useReadGachaTreasuryGetWhitelistedCollections } from "../../generated";
import { toast } from "react-hot-toast";
import type { Address, PublicClient } from "viem";

// Types
interface VaultSectionProps {
	title: string;
	description: string;
}

type VaultTab = "deposit" | "withdraw" | "yield";

interface NFTWithCollection extends DepositedNFT {
	collectionName?: string;
}

interface AppraisalInfo {
	hasAppraisal: boolean;
	priceUSD: bigint;
}

interface VaultState {
	appraisedNFTs: Set<string>;
	appraisalData: Map<string, AppraisalInfo>;
	depositedNFTs: NFTWithCollection[];
	isLoadingWithdrawals: boolean;
	withdrawingNFT: { collection: Address; tokenId: bigint } | null;
	selectedForWithdrawal: Set<string>; // Multi-select for batch withdrawal
	isBatchWithdrawing: boolean;
}

// Constants
const TOAST_CONFIG = {
	duration: 4000,
	position: "bottom-right" as const,
};

// Helper functions
const createNFTKey = (collection: string, tokenId: string | bigint): string =>
	`${collection.toLowerCase()}:${tokenId.toString()}`;

// Custom hooks
function useVaultState(initialState: Partial<VaultState> = {}) {
	const [state, setState] = useState<VaultState>({
		appraisedNFTs: new Set(),
		appraisalData: new Map(),
		depositedNFTs: [],
		isLoadingWithdrawals: false,
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

				if (hasValidAppraisal && priceUSD) {
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

function useAppraisalChecker(
	userOwnedNFTs: UserOwnedNFTMultiCollection[],
	appraisal: string | undefined,
	publicClient: PublicClient | undefined,
	updateAppraisedStatus: (
		collection: string,
		tokenId: string,
		hasValidAppraisal?: boolean,
		priceUSD?: bigint,
	) => void,
) {
	React.useEffect(() => {
		if (!userOwnedNFTs.length || !appraisal || !publicClient) return;

		const checkAppraisals = async () => {
			const appraisalABI = [
				{
					name: "hasAppraisal",
					type: "function",
					stateMutability: "view",
					inputs: [
						{ name: "collection", type: "address" },
						{ name: "tokenId", type: "uint256" },
					],
					outputs: [{ name: "", type: "bool" }],
				},
				{
					name: "getAppraisedPrice",
					type: "function",
					stateMutability: "view",
					inputs: [
						{ name: "collection", type: "address" },
						{ name: "tokenId", type: "uint256" },
					],
					outputs: [
						{ name: "priceUSD", type: "uint256" },
						{ name: "status", type: "uint8" },
					],
				},
			];

			const checkPromises = userOwnedNFTs.map(async (nft) => {
				const key = createNFTKey(nft.collection, nft.tokenId);

				try {
					const hasAppraisalResult = (await publicClient.readContract({
						address: appraisal as `0x${string}`,
						abi: appraisalABI,
						functionName: "hasAppraisal",
						args: [nft.collection as `0x${string}`, nft.tokenId],
					})) as boolean;

					let hasValidAppraisal = hasAppraisalResult;
					let priceUSD: bigint = 0n;

					if (hasAppraisalResult) {
						try {
							const appraisalData = (await publicClient.readContract({
								address: appraisal as `0x${string}`,
								abi: appraisalABI,
								functionName: "getAppraisedPrice",
								args: [nft.collection as `0x${string}`, nft.tokenId],
							})) as readonly [bigint, number];

							const [appraisedPrice, status] = appraisalData;
							const statusAsNumber = Number(status);
							hasValidAppraisal =
								appraisedPrice > 0n &&
								(statusAsNumber === 1 || statusAsNumber === 2);
							priceUSD = appraisedPrice;
						} catch (error) {
							console.warn(
								`Failed to fetch appraisal details for ${key}:`,
								error,
							);
						}
					}

					updateAppraisedStatus(
						nft.collection,
						nft.tokenId.toString(),
						hasValidAppraisal,
						priceUSD,
					);
				} catch (error) {
					console.error(`Error checking appraisal for ${key}:`, error);
					updateAppraisedStatus(
						nft.collection,
						nft.tokenId.toString(),
						false,
						0n,
					);
				}
			});

			await Promise.allSettled(checkPromises);
		};

		checkAppraisals();
	}, [userOwnedNFTs, appraisal, publicClient, updateAppraisedStatus]);
}

// Components
const WalletConnectPrompt: React.FC = () => (
	<section role="alert" aria-live="polite">
		<Card className="text-center p-8">
			<WalletIcon
				className="w-16 h-16 mx-auto mb-4 text-foreground/50"
				aria-hidden="true"
			/>
			<h2 className="text-xl font-medium text-foreground mb-2">
				Connect Your Wallet
			</h2>
			<p className="text-foreground/70">
				Please connect your wallet to view your vault.
			</p>
		</Card>
	</section>
);

const BalanceOverview: React.FC<{
	depositorUserData: UserDepositorData;
	isClaiming: boolean;
	onClaimYield: () => void;
	totalDepositedNFTs: number;
}> = ({ depositorUserData, isClaiming, onClaimYield, totalDepositedNFTs }) => (
	<section
		aria-label="Account Overview"
		className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
	>
		<article className="bg-content1/30 rounded-xl p-4 border border-white/10">
			<div className="flex items-center gap-3">
				<div className="p-2 rounded-lg bg-primary/20">
					<BanknotesIcon className="w-6 h-6 text-primary" aria-hidden="true" />
				</div>
				<div>
					<h3 className="text-sm font-medium text-foreground/60">
						Pending Yield
					</h3>
					<p className="text-xl font-semibold text-foreground">
						{depositorUserData?.pendingYield
							? formatTokenAmount(depositorUserData.pendingYield, 6)
							: "0.000000"}{" "}
						USDC
					</p>
				</div>
			</div>
			<Button
				className="mt-3 w-full"
				color="glassPrimary"
				onPress={onClaimYield}
				isLoading={isClaiming}
				disabled={
					isClaiming ||
					!depositorUserData.pendingYield ||
					depositorUserData.pendingYield <= 0n
				}
				aria-label="Claim pending yield"
			>
				Claim Yield
			</Button>
		</article>

		<article className="bg-content1/30 rounded-xl p-4 border border-white/10">
			<div className="flex items-center gap-3">
				<div className="p-2 rounded-lg bg-success/20">
					<GiftIcon className="w-6 h-6 text-success" aria-hidden="true" />
				</div>
				<div>
					<h3 className="text-sm font-medium text-foreground/60">
						Deposited NFTs
					</h3>
					<p className="text-xl font-semibold text-foreground">
						{totalDepositedNFTs} NFT{totalDepositedNFTs !== 1 ? "s" : ""}
					</p>
				</div>
			</div>
		</article>

		<article className="bg-content1/30 rounded-xl p-4 border border-white/10">
			<div className="flex items-center gap-3">
				<div className="p-2 rounded-lg bg-warning/20">
					<ChartBarIcon className="w-6 h-6 text-warning" aria-hidden="true" />
				</div>
				<div>
					<h3 className="text-sm font-medium text-foreground/60">
						Total Earned
					</h3>
					<p className="text-xl font-semibold text-foreground">
						{depositorUserData?.yieldValue
							? formatTokenAmount(depositorUserData.yieldValue, 6)
							: "0.000000"}{" "}
						USDC
					</p>
				</div>
			</div>
			<p className="text-sm text-foreground/60 mt-2">lifetime yield earnings</p>
		</article>
	</section>
);

// Main component
export function VaultSection({ title, description }: VaultSectionProps) {
	const { address } = useAccount();
	const publicClient = usePublicClient();
	const gachaId = useGachaId();
	const contracts = useGachaContracts(gachaId);
	const gachaConfig = getGachaConfig(gachaId);

	// State management
	const [activeTab, setActiveTab] = useState<VaultTab>("deposit");
	const { state, updateState, updateAppraisedStatus, cleanupOrphanedState } =
		useVaultState();
	const withdrawSearch = "";
	const deferredWithdrawSearch = withdrawSearch;
	const collectionFilter = "all";
	const sortMode: "rarity" | "value" | "recent" = "rarity" as
		| "rarity"
		| "value"
		| "recent";
	const showSelectedOnly = false;

	// Contract data
	const depositorVaultProps = useMemo(
		() => ({
			contractAddress: gachaConfig?.depositorVaultAddress || "",
			...(address && { userAddress: address }),
		}),
		[gachaConfig?.depositorVaultAddress, address],
	);

	const {
		data: depositorData,
		userData: depositorUserData,
		refetch: refetchDepositorVault,
	} = useDepositorVaultData(depositorVaultProps);

	// Yield functionality
	const { claimYield, isClaiming } = useClaimYield();

	// NFT functionality
	const treasury = contracts.treasury as `0x${string}` | undefined;
	const appraisal = contracts.appraisal as `0x${string}` | undefined;
	const { withdrawNFT } = useNFTWithdrawal(treasury);
	const { getUserDepositedNFTs, getCanonicalNFTData } =
		useUserDepositedNFTs(treasury);

	// Whitelisted collections
	const whitelistedCollectionsQuery =
		useReadGachaTreasuryGetWhitelistedCollections({
			address: treasury,
			query: { enabled: !!treasury },
		} as Parameters<typeof useReadGachaTreasuryGetWhitelistedCollections>[0]);
	const whitelistedCollections: `0x${string}`[] =
		(whitelistedCollectionsQuery.data as `0x${string}`[]) || [];

	// Local cache for optimistic updates
	const [optimisticUserNFTs, setOptimisticUserNFTs] = useState<
		UserOwnedNFTMultiCollection[]
	>([]);
	const [optimisticDepositedNFTs, setOptimisticDepositedNFTs] = useState<
		NFTWithCollection[]
	>([]);

	const { nfts: userOwnedNFTs, refetch: refetchUserNFTs } =
		useUserOwnedNFTsMultipleCollections(whitelistedCollections);

	// Merge actual and optimistic data
	const displayUserNFTs = useMemo(() => {
		if (optimisticUserNFTs.length > 0) {
			return optimisticUserNFTs;
		}
		return userOwnedNFTs;
	}, [userOwnedNFTs, optimisticUserNFTs]);

	const displayDepositedNFTs = useMemo(() => {
		return [...optimisticDepositedNFTs, ...state.depositedNFTs].reduce(
			(acc, nft) => {
				const key = createNFTKey(nft.collection, nft.tokenId);
				if (
					!acc.some(
						(existing) =>
							createNFTKey(existing.collection, existing.tokenId) === key,
					)
				) {
					acc.push(nft);
				}
				return acc;
			},
			[] as NFTWithCollection[],
		);
	}, [state.depositedNFTs, optimisticDepositedNFTs]);

	// NFT deposit hooks
	const { depositNFT, getNFTDepositState } = useNFTDeposit({
		onSuccess: () => {
			toast.success("NFT deposited successfully!", TOAST_CONFIG);

			refetchDepositorVault();
			refetchUserNFTs();
			loadDepositedNFTs();
		},
		onAction: updateAppraisedStatus,
		onAppraisalStatusChange: updateAppraisedStatus,
	});

	// No local state monitoring needed - XState machine is our single source of truth

	// Appraisal checking
	useAppraisalChecker(
		displayUserNFTs,
		appraisal,
		publicClient,
		updateAppraisedStatus,
	);

	// Sort NFTs by appraisal status
	const sortedUserOwnedNFTs = useMemo(() => {
		if (!displayUserNFTs.length) return [];

		const appraised: typeof displayUserNFTs = [];
		const needsAppraisal: typeof displayUserNFTs = [];

		for (const nft of displayUserNFTs) {
			const key = createNFTKey(nft.collection, nft.tokenId);
			if (state.appraisedNFTs.has(key)) {
				appraised.push(nft);
			} else {
				needsAppraisal.push(nft);
			}
		}

		return [...appraised, ...needsAppraisal];
	}, [displayUserNFTs, state.appraisedNFTs]);

	// Cleanup orphaned state
	React.useEffect(() => {
		if (!displayUserNFTs.length) {
			// Avoid infinite loops: only clear when we actually have cached entries
			if (state.appraisedNFTs.size > 0) {
				updateState("appraisedNFTs", new Set());
			}
			if (state.appraisalData.size > 0) {
				updateState("appraisalData", new Map());
			}
			return;
		}

		const validKeys = new Set(
			displayUserNFTs.map((nft) => createNFTKey(nft.collection, nft.tokenId)),
		);
		cleanupOrphanedState(validKeys);
	}, [
		displayUserNFTs,
		cleanupOrphanedState,
		state.appraisedNFTs.size,
		state.appraisalData.size,
		updateState,
	]);

	// Manual refresh function for external calls
	const loadDepositedNFTs = useCallback(async () => {
		if (!treasury || !address) {
			updateState("depositedNFTs", []);
			updateState("isLoadingWithdrawals", false);
			return;
		}

		updateState("isLoadingWithdrawals", true);

		try {
			const nfts = await getUserDepositedNFTs();

			if (nfts.length === 0) {
				updateState("depositedNFTs", []);
				setOptimisticDepositedNFTs([]);
				return;
			}

			// Fetch canonical data for each NFT via appraisal contract
			const nftsWithCanonicalData = await Promise.all(
				nfts.map(async (nft) => {
					if (!appraisal) {
						console.warn("No appraisal contract available");
						return { ...nft };
					}

					const canonicalData = await getCanonicalNFTData(
						appraisal as Address,
						nft.collection,
						nft.tokenId,
					);

					return {
						...nft,
						...canonicalData,
					};
				}),
			);

			const nftsWithCollections: NFTWithCollection[] =
				nftsWithCanonicalData.map((nft) => ({ ...nft }));
			updateState("depositedNFTs", nftsWithCollections);
			setOptimisticDepositedNFTs([]);
		} catch (error) {
			console.error("Error loading deposited NFTs:", error);
			toast.error("Failed to load deposited NFTs", TOAST_CONFIG);
			updateState("depositedNFTs", []);
		} finally {
			updateState("isLoadingWithdrawals", false);
		}
	}, [
		treasury,
		address,
		getUserDepositedNFTs,
		appraisal,
		getCanonicalNFTData,
		updateState,
	]);

	React.useEffect(() => {
		loadDepositedNFTs();
	}, [loadDepositedNFTs]);

	React.useEffect(() => {
		if (activeTab !== "withdraw") {
			// Clear selection when switching away from withdraw tab
			updateState("selectedForWithdrawal", new Set());
			updateState("isBatchWithdrawing", false);
		}
		// Clear optimistic state when switching tabs
		setOptimisticUserNFTs([]);
		setOptimisticDepositedNFTs([]);
	}, [activeTab, updateState]);

	// Clear optimistic state when user NFTs change (real data loaded)
	React.useEffect(() => {
		if (userOwnedNFTs.length > 0) {
			setOptimisticUserNFTs([]);
		}
	}, [userOwnedNFTs]);

	// Event handlers
	const handleClaimYield = useCallback(async () => {
		if (
			!address ||
			!depositorUserData.pendingYield ||
			depositorUserData.pendingYield <= 0n
		)
			return;

		try {
			await claimYield({
				address: gachaConfig?.depositorVaultAddress as `0x${string}`,
				args: [address as `0x${string}`],
			});

			toast.success("Yield claimed successfully!", TOAST_CONFIG);
			refetchDepositorVault();

			setTimeout(() => {
				refetchDepositorVault();
			}, 2000);
		} catch (error) {
			console.error("Error claiming yield:", error);
			toast.error("Failed to claim yield", TOAST_CONFIG);
		}
	}, [
		address,
		depositorUserData.pendingYield,
		claimYield,
		gachaConfig?.depositorVaultAddress,
		refetchDepositorVault,
	]);

	const handleWithdrawNFT = useCallback(
		async (collection: Address, tokenId: bigint) => {
			if (!treasury) {
				toast.error("Treasury contract not available", TOAST_CONFIG);
				return;
			}

			if (
				state.withdrawingNFT?.collection === collection &&
				state.withdrawingNFT?.tokenId === tokenId
			) {
				return;
			}

			updateState("withdrawingNFT", { collection, tokenId });

			try {
				const nftKey = createNFTKey(collection, tokenId);

				// Optimistic updates before the actual withdrawal
				const nftToWithdraw = displayDepositedNFTs.find(
					(nft) => createNFTKey(nft.collection, nft.tokenId) === nftKey,
				);

				if (nftToWithdraw) {
					// Remove from deposited NFTs optimistically
					setOptimisticDepositedNFTs((prev) =>
						prev.filter(
							(nft) => createNFTKey(nft.collection, nft.tokenId) !== nftKey,
						),
					);

					// Add to user-owned NFTs optimistically
					const userNFT: UserOwnedNFTMultiCollection = {
						collection: collection,
						tokenId: tokenId,
						...(nftToWithdraw.collectionName && {
							collectionName: nftToWithdraw.collectionName,
						}),
					};
					setOptimisticUserNFTs((prev) => [...prev, userNFT]);
				}

				await withdrawNFT(collection, tokenId);
				toast.success("NFT withdrawal submitted successfully!", TOAST_CONFIG);

				// Quick refetch of vault data (cheaper than full NFT refresh)
				refetchDepositorVault();

				// Delayed background refresh to ensure data consistency
				setTimeout(() => {
					loadDepositedNFTs();
					refetchUserNFTs();
					// Clear optimistic state after real data loads
					setOptimisticUserNFTs([]);
					setOptimisticDepositedNFTs([]);
				}, 2000);
			} catch (error) {
				console.error("Error withdrawing NFT:", error);
				const errorMessage =
					error instanceof Error ? error.message : "Unknown error occurred";
				toast.error(`Failed to withdraw NFT: ${errorMessage}`, TOAST_CONFIG);
				// Revert optimistic updates on error
				setOptimisticUserNFTs([]);
				setOptimisticDepositedNFTs([]);
			} finally {
				// Clear withdrawing state with a small delay for UX
				setTimeout(() => {
					updateState("withdrawingNFT", null);
				}, 1000);
			}
		},
		[
			treasury,
			state.withdrawingNFT,
			withdrawNFT,
			loadDepositedNFTs,
			refetchDepositorVault,
			refetchUserNFTs,
			updateState,
			displayDepositedNFTs,
		],
	);

	const handleDepositNFT = useCallback(
		async (collection: string, tokenId: string, hasAppraisal = false) => {
			const nftKey = createNFTKey(collection, tokenId);

			try {
				// Optimistic updates before the actual deposit
				const nftToRemove = displayUserNFTs.find(
					(nft) => createNFTKey(nft.collection, nft.tokenId) === nftKey,
				);

				if (nftToRemove) {
					// Remove from user-owned NFTs optimistically
					setOptimisticUserNFTs((prev) =>
						prev.filter(
							(nft) => createNFTKey(nft.collection, nft.tokenId) !== nftKey,
						),
					);

					// Add to deposited NFTs optimistically if we have appraisal info
					const appraiseInfo = state.appraisalData.get(nftKey);
					if (appraiseInfo) {
						const depositedNFT: NFTWithCollection = {
							collection: collection as Address,
							tokenId: BigInt(tokenId),
							depositor: address as Address,
							currentRarity: 0, // Will be updated when actual data loads
							appraisedPrice: appraiseInfo.priceUSD,
							...(nftToRemove.collectionName && {
								collectionName: nftToRemove.collectionName,
							}),
						};
						setOptimisticDepositedNFTs((prev) => [...prev, depositedNFT]);
					}
				}

				await depositNFT(collection as `0x${string}`, BigInt(tokenId), {
					hasAppraisal,
				});
			} catch (error) {
				console.error("Error depositing NFT:", error);
				toast.error("Failed to deposit NFT", TOAST_CONFIG);
				// Revert optimistic updates on error
				setOptimisticUserNFTs([]);
				setOptimisticDepositedNFTs([]);
			}
		},
		[depositNFT, state.appraisalData, displayUserNFTs, address],
	);

	const handleNFTAction = useCallback(
		(collection: string, tokenId: string, hasAppraisal?: boolean) => {
			if (hasAppraisal) {
				// Let the XState machine handle all state management
				handleDepositNFT(collection, tokenId, true);
			} else {
				const appraisalUrl = `/appraisal?collection=${encodeURIComponent(
					collection,
				)}&tokenId=${encodeURIComponent(tokenId)}`;
				window.location.href = appraisalUrl;
			}
		},
		[handleDepositNFT],
	);

	// Computed values
	const totalDepositedNFTs = displayDepositedNFTs.length;

	const filteredWithdrawableNFTs = useMemo(() => {
		const normalizedSearch = deferredWithdrawSearch.trim().toLowerCase();

		const filtered = displayDepositedNFTs.filter((nft) => {
			const nftKey = createNFTKey(nft.collection, nft.tokenId);
			if (showSelectedOnly && !state.selectedForWithdrawal.has(nftKey)) {
				return false;
			}

			if (collectionFilter !== "all") {
				const collectionKey = (
					nft.canonicalContractAddress || nft.collection
				).toLowerCase();
				if (collectionKey !== collectionFilter) {
					return false;
				}
			}

			if (!normalizedSearch) {
				return true;
			}

			const tokenMatch = nft.tokenId.toString().includes(normalizedSearch);
			const collectionMatch = nft.collection
				.toLowerCase()
				.includes(normalizedSearch);
			const canonicalMatch = nft.canonicalContractAddress
				? nft.canonicalContractAddress.toLowerCase().includes(normalizedSearch)
				: false;
			const nameMatch = nft.collectionName
				? nft.collectionName.toLowerCase().includes(normalizedSearch)
				: false;

			return tokenMatch || collectionMatch || canonicalMatch || nameMatch;
		});

		filtered.sort((a, b) => {
			switch (sortMode) {
				case "value": {
					if (a.appraisedPrice === b.appraisedPrice) return 0;
					return a.appraisedPrice > b.appraisedPrice ? -1 : 1;
				}
				case "recent": {
					const aTime = Number(a.depositTimestamp ?? 0n);
					const bTime = Number(b.depositTimestamp ?? 0n);
					return bTime - aTime;
				}
				case "rarity":
					return b.currentRarity - a.currentRarity;
				default: {
					const exhaustiveCheck: never = sortMode;
					return exhaustiveCheck;
				}
			}
		});

		return filtered;
	}, [
		displayDepositedNFTs,
		deferredWithdrawSearch,
		state.selectedForWithdrawal,
	]);

	// Early return if not connected
	if (!address) {
		return <WalletConnectPrompt />;
	}

	return (
		<GachaSectionLayout
			tone="deposits"
			icon={TrophyIcon}
			label="Vault Management"
			title={title}
			description={description}
			highlights={[
				{
					icon: ShieldCheckIcon,
					title: "Secure Deposits",
					description:
						"Deposit your appraised NFTs to earn yield from the protocol. Your assets remain secure while generating passive income.",
				},
				{
					icon: BanknotesIcon,
					title: "Yield Generation",
					description:
						"Earn USDC yield on your deposited NFTs based on their appraised value. Claim your earnings at any time.",
				},
			]}
		>
			<BalanceOverview
				depositorUserData={depositorUserData}
				isClaiming={isClaiming}
				onClaimYield={handleClaimYield}
				totalDepositedNFTs={totalDepositedNFTs}
			/>

			<VaultTabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

			<motion.div
				key={activeTab}
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.2 }}
				className="mt-6"
			>
				{activeTab === "deposit" && (
					<DepositTab
						sortedUserOwnedNFTs={sortedUserOwnedNFTs}
						appraisedNFTs={state.appraisedNFTs}
						appraisalData={state.appraisalData}
						appraisal={appraisal}
						getNFTDepositState={getNFTDepositState}
						onNFTAction={handleNFTAction}
					/>
				)}

				{activeTab === "withdraw" && (
					<WithdrawTab
						filteredWithdrawableNFTs={filteredWithdrawableNFTs}
						totalDepositedNFTs={totalDepositedNFTs}
						isLoadingWithdrawals={state.isLoadingWithdrawals}
						withdrawingNFT={state.withdrawingNFT}
						onWithdrawNFT={handleWithdrawNFT}
						onSwitchToDeposit={() => setActiveTab("deposit")}
					/>
				)}

				{activeTab === "yield" && (
					<YieldTab
						depositorUserData={depositorUserData}
						depositorData={depositorData}
						treasuryAddress={treasury}
					/>
				)}
			</motion.div>
		</GachaSectionLayout>
	);
}
