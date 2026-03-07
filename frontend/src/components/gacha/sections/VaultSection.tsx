"use client";

import {
	BanknotesIcon,
	ShieldCheckIcon,
	TrophyIcon,
} from "@heroicons/react/24/outline";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Address } from "viem";
import { useAccount, usePublicClient, useReadContract } from "wagmi";
import { gachaTreasuryAbi } from "../../../generated";
import {
	useClaimYield,
	useCardGroupedVaultData,
} from "../../../hooks/useCardGroupedVault";
import { useGachaRefetch } from "../../../contexts/GachaRefreshContext";
import { useAppraisalChecker } from "../../../hooks/useAppraisalChecker";
import { useGachaContracts } from "../../../hooks/useGachaContracts";
import { useGachaId } from "../../../hooks/useGachaId";
import { useNFTDeposit } from "../../../hooks/useNFTDeposit";
import { useNFTWithdrawal } from "../../../hooks/useNFTWithdrawal";
import {
	type NFTWithCollection,
	useUserDepositedNFTs,
} from "../../../hooks/useUserDepositedNFTs";
import { useUserOwnedNFTsMultipleCollections } from "../../../hooks/useUserOwnedNFTs";
import { useVaultState } from "../../../hooks/useVaultState";
import { getGachaConfig } from "../../../lib/gacha-config";
import { logger } from "../../../lib/logger";
import { toastError, toastSuccess } from "../../../lib/toast";
import { createNFTKey } from "../../../stores/storeUtils";
import type { UserOwnedNFTMultiCollection } from "../../../types/hooks";
import {
	BalanceOverview,
	VaultTabContent,
	WalletConnectPrompt,
} from "../../vault";
import { GachaSectionLayout } from "./GachaSectionLayout";

interface VaultSectionProps {
	title: string;
	description: string;
}

type VaultTab = "deposit" | "withdraw" | "yield";

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

	// Contract data
	const cardGroupedVaultProps = useMemo(
		() => ({
			contractAddress: gachaConfig?.cardGroupedVaultAddress || "",
			...(address && { userAddress: address }),
		}),
		[gachaConfig?.cardGroupedVaultAddress, address],
	);

	const {
		data: depositorData,
		userData: depositorUserData,
		refetch: refetchCardGroupedVault,
	} = useCardGroupedVaultData(cardGroupedVaultProps);

	// Register vault refetch so yield updates after spins
	useGachaRefetch(refetchCardGroupedVault);

	// Yield functionality
	const { claimYield, isClaiming } = useClaimYield();

	// NFT functionality
	const treasury = contracts.treasury as `0x${string}` | undefined;
	const appraisal = contracts.appraisal as `0x${string}` | undefined;
	const { withdrawNFT } = useNFTWithdrawal(treasury);
	const { getUserDepositedNFTs, getCanonicalNFTData } =
		useUserDepositedNFTs(treasury);

	// Whitelisted collections - use useReadContract directly to avoid deep type instantiation
	const whitelistedCollectionsQuery = useReadContract({
		abi: gachaTreasuryAbi,
		address: treasury,
		functionName: "getWhitelistedCollections",
		query: { enabled: !!treasury },
	});
	const whitelistedCollections: `0x${string}`[] =
		(whitelistedCollectionsQuery.data as `0x${string}`[]) || [];

	// Local cache for optimistic updates
	const [optimisticUserNFTAdds, setOptimisticUserNFTAdds] = useState<
		UserOwnedNFTMultiCollection[]
	>([]);
	const [optimisticUserNFTRemovals, setOptimisticUserNFTRemovals] = useState<
		Set<string>
	>(new Set());
	const [optimisticDepositedNFTs, setOptimisticDepositedNFTs] = useState<
		NFTWithCollection[]
	>([]);
	const [optimisticWithdrawals, setOptimisticWithdrawals] = useState<
		Set<string>
	>(new Set());

	const { nfts: userOwnedNFTs, refetch: refetchUserNFTs } =
		useUserOwnedNFTsMultipleCollections(whitelistedCollections);

	// Merge actual and optimistic data
	const displayUserNFTs = useMemo(() => {
		const filteredBase = userOwnedNFTs.filter((nft) => {
			const key = createNFTKey(nft.collection, nft.tokenId);
			return !optimisticUserNFTRemovals.has(key);
		});

		if (optimisticUserNFTAdds.length === 0) {
			return filteredBase;
		}

		const merged = [...filteredBase];
		for (const nft of optimisticUserNFTAdds) {
			const key = createNFTKey(nft.collection, nft.tokenId);
			if (
				!merged.some(
					(existing) =>
						createNFTKey(existing.collection, existing.tokenId) === key,
				)
			) {
				merged.push(nft);
			}
		}
		return merged;
	}, [userOwnedNFTs, optimisticUserNFTAdds, optimisticUserNFTRemovals]);

	const displayDepositedNFTs = useMemo(() => {
		return [...optimisticDepositedNFTs, ...state.depositedNFTs]
			.filter((nft) => {
				// Exclude NFTs being optimistically withdrawn
				const key = createNFTKey(nft.collection, nft.tokenId);
				return !optimisticWithdrawals.has(key);
			})
			.reduce((acc, nft) => {
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
			}, [] as NFTWithCollection[]);
	}, [state.depositedNFTs, optimisticDepositedNFTs, optimisticWithdrawals]);

	// NFT deposit hooks
	const {
		depositNFT,
		getNFTDepositState,
		interactionState,
		interactionContext,
	} = useNFTDeposit({
		onSuccess: () => {
			toastSuccess("NFT deposited successfully!");

			refetchCardGroupedVault();
			refetchUserNFTs();
			loadDepositedNFTs();
		},
		onAction: updateAppraisedStatus,
		onAppraisalStatusChange: updateAppraisedStatus,
	});
	const [pendingDepositKey, setPendingDepositKey] = useState<string | null>(
		null,
	);

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
	useEffect(() => {
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
	// Use ref for updateState to avoid dependency issues
	const updateStateRef = useRef(updateState);
	updateStateRef.current = updateState;

	const loadDepositedNFTs = useCallback(async () => {
		if (!treasury || !address) {
			updateStateRef.current("depositedNFTs", []);
			return;
		}

		try {
			const nfts = await getUserDepositedNFTs();

			if (nfts.length === 0) {
				updateStateRef.current("depositedNFTs", []);
				setOptimisticDepositedNFTs([]);
				return;
			}

			// Fetch canonical data for each NFT via appraisal contract
			const nftsWithCanonicalData = await Promise.all(
				nfts.map(async (nft) => {
					if (!appraisal) {
						logger.contracts.warn("No appraisal contract available");
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
			updateStateRef.current("depositedNFTs", nftsWithCollections);
			setOptimisticDepositedNFTs([]);
		} catch (error) {
			logger.contracts.error("Error loading deposited NFTs:", error);
			toastError("Failed to load deposited NFTs");
			updateStateRef.current("depositedNFTs", []);
		} finally {
			// No full-grid loading state needed.
		}
	}, [treasury, address, getUserDepositedNFTs, appraisal, getCanonicalNFTData]);

	useEffect(() => {
		loadDepositedNFTs();
	}, [loadDepositedNFTs]);

	useEffect(() => {
		if (activeTab !== "withdraw") {
			// Clear selection when switching away from withdraw tab
			updateState("selectedForWithdrawal", new Set());
			updateState("isBatchWithdrawing", false);
		}
	}, [activeTab, updateState]);

	// Reconcile optimistic user-owned state when real data changes
	useEffect(() => {
		if (
			optimisticUserNFTAdds.length === 0 &&
			optimisticUserNFTRemovals.size === 0
		) {
			return;
		}

		const ownedKeys = new Set(
			userOwnedNFTs.map((nft) => createNFTKey(nft.collection, nft.tokenId)),
		);

		setOptimisticUserNFTAdds((prev) =>
			prev.filter(
				(nft) => !ownedKeys.has(createNFTKey(nft.collection, nft.tokenId)),
			),
		);

		setOptimisticUserNFTRemovals((prev) => {
			const next = new Set([...prev].filter((key) => ownedKeys.has(key)));
			return next.size === prev.size ? prev : next;
		});
	}, [
		userOwnedNFTs,
		optimisticUserNFTAdds.length,
		optimisticUserNFTRemovals.size,
	]);

	useEffect(() => {
		if (optimisticWithdrawals.size === 0) return;

		const depositedKeys = new Set(
			state.depositedNFTs.map((nft) =>
				createNFTKey(nft.collection, nft.tokenId),
			),
		);

		setOptimisticWithdrawals((prev) => {
			const next = new Set([...prev].filter((key) => depositedKeys.has(key)));
			return next.size === prev.size ? prev : next;
		});
	}, [state.depositedNFTs, optimisticWithdrawals.size]);

	useEffect(() => {
		if (!pendingDepositKey) return;
		if (
			!interactionContext ||
			!interactionContext.collection ||
			!interactionContext.tokenId
		) {
			if (interactionState === "idle") {
				setPendingDepositKey(null);
			}
			return;
		}

		const key = createNFTKey(
			interactionContext.collection,
			interactionContext.tokenId,
		);
		if (key !== pendingDepositKey) {
			if (interactionState === "idle") {
				setPendingDepositKey(null);
			}
			return;
		}

		if (
			interactionState === "awaitingInteractionReceipt" ||
			interactionState === "completed"
		) {
			if (!optimisticUserNFTRemovals.has(key)) {
				setOptimisticUserNFTRemovals((prev) => {
					const next = new Set(prev);
					next.add(key);
					return next;
				});
			}

			if (
				!optimisticDepositedNFTs.some(
					(nft) => createNFTKey(nft.collection, nft.tokenId) === key,
				)
			) {
				const appraiseInfo = state.appraisalData.get(key);
				if (appraiseInfo && address) {
					const sourceNFT = displayUserNFTs.find(
						(nft) => createNFTKey(nft.collection, nft.tokenId) === key,
					);
					setOptimisticDepositedNFTs((prev) => [
						...prev,
						{
							collection: interactionContext?.collection as Address,
							tokenId: BigInt(interactionContext?.tokenId ?? "0"),
							depositor: address as Address,
							currentRarity: 0,
							appraisedPrice: appraiseInfo.priceUSD,
							...(sourceNFT?.collectionName && {
								collectionName: sourceNFT.collectionName,
							}),
						},
					]);
				}
			}
		}

		if (interactionState === "completed") {
			setPendingDepositKey(null);
			return;
		}

		if (interactionState === "error" || interactionState === "idle") {
			setOptimisticUserNFTRemovals((prev) => {
				const next = new Set(prev);
				next.delete(key);
				return next;
			});
			setOptimisticDepositedNFTs((prev) =>
				prev.filter((nft) => createNFTKey(nft.collection, nft.tokenId) !== key),
			);
			setPendingDepositKey(null);
		}
	}, [
		pendingDepositKey,
		interactionContext?.collection,
		interactionContext?.tokenId,
		interactionState,
		optimisticUserNFTRemovals,
		optimisticDepositedNFTs,
		state.appraisalData,
		displayUserNFTs,
		address,
		interactionContext,
	]);

	// Event handlers
	const handleClaimYield = useCallback(async () => {
		if (
			!address ||
			!depositorUserData.pendingYield ||
			depositorUserData.pendingYield <= 0n
		)
			return;

		try {
			const receipt = await claimYield({
				address: gachaConfig?.cardGroupedVaultAddress as `0x${string}`,
				args: [address as `0x${string}`],
			});

			if (receipt?.status === "success") {
				toastSuccess("Yield claimed successfully!");
				refetchCardGroupedVault();
			}
		} catch (error) {
			logger.contracts.error("Error claiming yield:", error);
			toastError(
				error instanceof Error ? error.message : "Failed to claim yield",
			);
		}
	}, [
		address,
		depositorUserData.pendingYield,
		claimYield,
		gachaConfig?.cardGroupedVaultAddress,
		refetchCardGroupedVault,
	]);

	const handleWithdrawNFT = useCallback(
		async (collection: Address, tokenId: bigint) => {
			if (!treasury) {
				toastError("Treasury contract not available");
				return;
			}

			const nftKey = createNFTKey(collection, tokenId);

			if (optimisticWithdrawals.has(nftKey)) {
				return;
			}

			updateState("withdrawingNFT", { collection, tokenId });

			let receiptConfirmed = false;
			let optimisticApplied = false;

			try {
				// Submit the transaction (user confirms in wallet here)
				const hash = await withdrawNFT(collection, tokenId);
				toastSuccess("NFT withdrawal submitted!");

				setOptimisticWithdrawals((prev) => new Set([...prev, nftKey]));
				setOptimisticUserNFTAdds((prev) => {
					if (
						prev.some(
							(existing) =>
								createNFTKey(existing.collection, existing.tokenId) === nftKey,
						)
					) {
						return prev;
					}
					return [...prev, { collection, tokenId }];
				});
				optimisticApplied = true;

				if (publicClient && hash) {
					const receipt = await publicClient.waitForTransactionReceipt({
						hash,
					});
					if (receipt.status !== "success") {
						throw new Error("Withdrawal transaction failed");
					}
					receiptConfirmed = true;
				}

				// Refetch to get updated data from chain
				await Promise.all([
					refetchCardGroupedVault(),
					refetchUserNFTs(),
					loadDepositedNFTs(),
				]);
			} catch (error) {
				logger.contracts.error("Error withdrawing NFT:", error);
				const errorMessage =
					error instanceof Error ? error.message : "Unknown error occurred";
				toastError(`Failed to withdraw NFT: ${errorMessage}`);
				// Clear optimistic state on error (if applied)
				if (optimisticApplied) {
					setOptimisticUserNFTAdds((prev) =>
						prev.filter(
							(nft) => createNFTKey(nft.collection, nft.tokenId) !== nftKey,
						),
					);
					setOptimisticWithdrawals((prev) => {
						const next = new Set(prev);
						next.delete(nftKey);
						return next;
					});
				}
			} finally {
				updateState("withdrawingNFT", null);
				if (optimisticApplied && receiptConfirmed) {
					setOptimisticUserNFTAdds((prev) =>
						prev.filter(
							(nft) => createNFTKey(nft.collection, nft.tokenId) !== nftKey,
						),
					);
					setOptimisticWithdrawals((prev) => {
						const next = new Set(prev);
						next.delete(nftKey);
						return next;
					});
				}
			}
		},
		[
			treasury,
			optimisticWithdrawals,
			withdrawNFT,
			loadDepositedNFTs,
			publicClient,
			refetchCardGroupedVault,
			refetchUserNFTs,
			updateState,
		],
	);

	const handleDepositNFT = useCallback(
		async (collection: string, tokenId: string, hasAppraisal = false) => {
			const nftKey = createNFTKey(collection, tokenId);
			if (
				interactionState !== "idle" &&
				interactionState !== "completed" &&
				interactionContext?.collection &&
				interactionContext?.tokenId
			) {
				const activeKey = createNFTKey(
					interactionContext.collection,
					interactionContext.tokenId,
				);
				if (activeKey !== nftKey) {
					toastError("Another deposit is already in progress");
					return;
				}
			}

			setPendingDepositKey(nftKey);
			try {
				await depositNFT(collection as `0x${string}`, BigInt(tokenId), {
					hasAppraisal,
				});
			} catch (error) {
				logger.contracts.error("Error depositing NFT:", error);
				toastError("Failed to deposit NFT");
				setPendingDepositKey(null);
			}
		},
		[
			depositNFT,
			interactionContext?.collection,
			interactionContext?.tokenId,
			interactionState,
		],
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
		return [...displayDepositedNFTs].sort(
			(a, b) => b.currentRarity - a.currentRarity,
		);
	}, [displayDepositedNFTs]);

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

			<VaultTabContent
				activeTab={activeTab}
				onTabChange={setActiveTab}
				sortedUserOwnedNFTs={sortedUserOwnedNFTs}
				appraisedNFTs={state.appraisedNFTs}
				appraisalData={state.appraisalData}
				appraisal={appraisal}
				getNFTDepositState={getNFTDepositState}
				onNFTAction={handleNFTAction}
				filteredWithdrawableNFTs={filteredWithdrawableNFTs}
				totalDepositedNFTs={totalDepositedNFTs}
				withdrawingNFT={state.withdrawingNFT}
				onWithdrawNFT={handleWithdrawNFT}
				depositorUserData={depositorUserData}
				depositorData={depositorData}
				treasuryAddress={treasury}
			/>
		</GachaSectionLayout>
	);
}
