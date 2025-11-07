"use client";

import React, { useState, useCallback, useMemo, useDeferredValue } from "react";
import { useAccount, usePublicClient } from "wagmi";
import { motion } from "framer-motion";
import {
	BanknotesIcon,
	ArrowUpTrayIcon,
	ArrowDownTrayIcon,
	GiftIcon,
	WalletIcon,
	ChartBarIcon,
	TrophyIcon,
	ShieldCheckIcon,
	ArrowPathIcon,
	SparklesIcon,
} from "@heroicons/react/24/outline";

import { Button, GlassButton } from "../../ui";
import { GlassCard } from "../../ui/Card";
import { NFTCard } from "../NFTCard";
import { GachaSectionLayout } from "./GachaSectionLayout";
import {
	useDepositorVaultData,
	formatTokenAmount,
	calculateUserSharePercentage,
	useClaimYield,
	type UserDepositorData,
	type DepositorVaultData,
} from "../../hooks/useDepositorVault";
import { formatCurrency } from "../../lib/utils";
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
import type { Rarity } from "../../lib/constants";

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
const RARITY_EMOJIS = ["⚪", "🟢", "🔵", "🟣", "🟡"];
const RARITY_NAMES = ["Common", "Uncommon", "Rare", "Epic", "Legendary"];
const TOAST_CONFIG = {
	duration: 4000,
	position: "bottom-right" as const,
};

// Helper functions
const createNFTKey = (collection: string, tokenId: string | bigint): string =>
	`${collection.toLowerCase()}:${tokenId.toString()}`;

const formatAddress = (address: string): string =>
	`${address.slice(0, 8)}...${address.slice(-6)}`;

const formatShortAddress = (address: string): string =>
	`${address.slice(0, 6)}...${address.slice(-4)}`;

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
		<GlassCard className="text-center p-8">
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
		</GlassCard>
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
			<GlassButton
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
			</GlassButton>
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

const TabNavigation: React.FC<{
	activeTab: VaultTab;
	onTabChange: (tab: VaultTab) => void;
}> = ({ activeTab, onTabChange }) => {
	const tabs = [
		{ id: "deposit" as VaultTab, label: "Deposit NFTs", icon: ArrowUpTrayIcon },
		{
			id: "withdraw" as VaultTab,
			label: "Withdraw NFTs",
			icon: ArrowDownTrayIcon,
		},
		{ id: "yield" as VaultTab, label: "Yield", icon: BanknotesIcon },
	];

	return (
		<div
			role="tablist"
			aria-label="Vault management tabs"
			className="flex flex-wrap gap-2 p-1 bg-content1/20 rounded-xl"
		>
			{tabs.map((tab) => (
				<GlassButton
					key={tab.id}
					color={activeTab === tab.id ? "glass" : "glass"}
					role="tab"
					aria-selected={activeTab === tab.id}
					aria-controls={`${tab.id}-panel`}
					className={`flex-1 min-w-[120px] justify-center gap-2 rounded-lg ${
						activeTab === tab.id
							? "bg-gradient-to-r from-warning to-orange-400 text-black hover:!from-warning hover:!to-orange-400 hover:!text-black"
							: ""
					}`}
					onPress={() => onTabChange(tab.id)}
				>
					<tab.icon className="w-4 h-4" aria-hidden="true" />
					{tab.label}
				</GlassButton>
			))}
		</div>
	);
};

const DepositTab: React.FC<{
	sortedUserOwnedNFTs: UserOwnedNFTMultiCollection[];
	appraisedNFTs: Set<string>;
	appraisalData: Map<string, AppraisalInfo>;
	appraisal: string | undefined;
	getNFTDepositState: (
		collection: string,
		tokenId: string,
	) => {
		isDepositing: boolean;
		stage: string;
		message: string;
	} | null;
	onNFTAction: (
		collection: string,
		tokenId: string,
		hasAppraisal?: boolean,
	) => void;
}> = ({
	sortedUserOwnedNFTs,
	appraisedNFTs,
	appraisalData,
	getNFTDepositState,
	onNFTAction,
	appraisal,
}) => {
	if (sortedUserOwnedNFTs.length === 0) {
		return (
			<section
				id="deposit-panel"
				role="tabpanel"
				aria-labelledby="deposit-tab"
				className="text-center py-12"
			>
				<ArrowUpTrayIcon
					className="w-16 h-16 mx-auto mb-4 text-foreground/30"
					aria-hidden="true"
				/>
				<h3 className="text-lg font-medium text-foreground mb-2">
					No Eligible NFTs
				</h3>
				<p className="text-foreground/60">
					You don't own any NFTs from whitelisted collections.
				</p>
			</section>
		);
	}

	return (
		<section id="deposit-panel" role="tabpanel" aria-labelledby="deposit-tab">
			<h2 className="text-xl font-semibold text-foreground mb-4">
				Deposit NFTs
			</h2>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{sortedUserOwnedNFTs.map((nft) => {
					const nftKey = createNFTKey(nft.collection, nft.tokenId);
					const hasAppraisal = appraisedNFTs.has(nftKey);
					// Get state directly from XState machine - our single source of truth
					const depositState = getNFTDepositState(
						nft.collection,
						nft.tokenId.toString(),
					);
					const isDepositing = !!depositState?.isDepositing;

					// Remove excessive logging - system is working correctly

					// Determine button message based on state
					const getButtonMessage = () => {
						if (depositState?.message) {
							return depositState.message;
						}
						return "Deposit NFT";
					};

					return (
						<article
							key={nftKey}
							className="bg-content1/30 rounded-xl p-4 border border-white/10 flex flex-col h-full"
						>
							<div className="flex-1">
								<NFTCard
									data={{
										collection: nft.collection,
										tokenId: nft.tokenId.toString(),
										appraisalOverride: appraisalData.get(nftKey)
											? {
													hasAppraisal:
														appraisalData.get(nftKey)?.hasAppraisal ?? false,
													priceUSD: appraisalData.get(nftKey)?.priceUSD ?? 0n,
												}
											: undefined,
									}}
									size="md"
									onClick={() =>
										console.log(
											`Vault NFT ${nft.collection}:${nft.tokenId} clicked`,
										)
									}
									appraisalContractAddress={appraisal as `0x${string}`}
								/>
							</div>
							<div className="mt-4 pt-2">
								{hasAppraisal ? (
									<Button
										color="glassPrimary"
										onPress={() =>
											onNFTAction(nft.collection, nft.tokenId.toString(), true)
										}
										disabled={isDepositing}
										isLoading={isDepositing}
										aria-label={`Deposit NFT ${nft.tokenId.toString()}`}
										className="w-full"
										startContent={<ArrowUpTrayIcon className="w-4 h-4" />}
									>
										{getButtonMessage()}
									</Button>
								) : (
									<Button
										color="glass"
										size="sm"
										onPress={() =>
											onNFTAction(nft.collection, nft.tokenId.toString(), false)
										}
										aria-label={`Get NFT ${nft.tokenId.toString()} appraised`}
										className="w-full"
										startContent={<SparklesIcon className="w-4 h-4" />}
									>
										Get Appraised
									</Button>
								)}
							</div>
						</article>
					);
				})}
			</div>
		</section>
	);
};

const YieldTab: React.FC<{
	depositorUserData: UserDepositorData;
	depositorData: DepositorVaultData;
}> = ({ depositorUserData, depositorData }) => (
	<section id="yield-panel" role="tabpanel" aria-labelledby="yield-tab">
		<h2 className="text-xl font-semibold text-foreground mb-4">
			Yield Information
		</h2>
		<div className="space-y-4">
			<article className="bg-content1/30 rounded-xl p-4 border border-white/10">
				<h3 className="font-medium text-foreground mb-3">Yield Summary</h3>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<h4 className="text-sm font-medium text-foreground/60">
							Pending Yield
						</h4>
						<p className="text-lg font-semibold text-success">
							{depositorUserData?.pendingYield
								? formatTokenAmount(depositorUserData.pendingYield, 6)
								: "0.000000"}{" "}
							USDC
						</p>
					</div>
					<div>
						<h4 className="text-sm font-medium text-foreground/60">
							Total Earned
						</h4>
						<p className="text-lg font-semibold text-foreground">
							{depositorUserData?.yieldValue
								? formatTokenAmount(depositorUserData.yieldValue, 6)
								: "0.000000"}{" "}
							USDC
						</p>
					</div>
				</div>
			</article>

			<article className="bg-content1/30 rounded-xl p-4 border border-white/10">
				<h3 className="font-medium text-foreground mb-3">Your Position</h3>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div>
						<h4 className="text-sm font-medium text-foreground/60">
							Your Shares
						</h4>
						<p className="text-lg font-semibold text-foreground">
							{depositorUserData?.shares?.toString() || "0"}
						</p>
					</div>
					<div>
						<h4 className="text-sm font-medium text-foreground/60">
							Total Vault Shares
						</h4>
						<p className="text-lg font-semibold text-foreground">
							{depositorData?.totalShares?.toString() || "0"}
						</p>
					</div>
					<div>
						<h4 className="text-sm font-medium text-foreground/60">
							Share Ownership
						</h4>
						<p className="text-lg font-semibold text-primary">
							{calculateUserSharePercentage(
								depositorUserData?.shares,
								depositorData?.totalShares,
							)}
						</p>
					</div>
				</div>
			</article>
		</div>
	</section>
);

const NFTRarityDisplay: React.FC<{ rarity: number }> = ({ rarity }) => {
	// Ensure rarity is a valid number and within expected range
	const validRarity =
		typeof rarity === "number" && !Number.isNaN(rarity) ? rarity : 0;
	const clampedRarity = Math.max(0, Math.min(4, validRarity));

	const emoji = RARITY_EMOJIS[clampedRarity] || "⚪";
	const name =
		validRarity !== clampedRarity
			? `Unknown (${validRarity})`
			: RARITY_NAMES[clampedRarity] || "Unknown";

	return (
		<div className="flex items-center gap-2">
			<span aria-hidden="true" className="text-lg">
				{emoji}
			</span>
			<span className="text-sm">{name}</span>
		</div>
	);
};

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
	const [withdrawSearch, setWithdrawSearch] = useState("");
	const deferredWithdrawSearch = useDeferredValue(withdrawSearch);
	const [collectionFilter, setCollectionFilter] = useState<string>("all");
	const [sortMode, setSortMode] = useState<"rarity" | "value" | "recent">(
		"rarity",
	);
	const [showSelectedOnly, setShowSelectedOnly] = useState(false);

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
			updateState("appraisedNFTs", new Set());
			updateState("appraisalData", new Map());
			return;
		}

		const validKeys = new Set(
			displayUserNFTs.map((nft) => createNFTKey(nft.collection, nft.tokenId)),
		);
		cleanupOrphanedState(validKeys);
	}, [displayUserNFTs, cleanupOrphanedState, updateState]);

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

	const handleBatchWithdrawal = useCallback(async () => {
		if (state.selectedForWithdrawal.size === 0 || !treasury) {
			return;
		}

		updateState("isBatchWithdrawing", true);

		try {
			const withdrawals: { collection: Address; tokenId: bigint }[] = [];
			const nftsToWithdraw: NFTWithCollection[] = [];

			// Collect all NFTs to withdraw
			for (const nftKey of state.selectedForWithdrawal) {
				const nft = displayDepositedNFTs.find(
					(dep) => createNFTKey(dep.collection, dep.tokenId) === nftKey,
				);
				if (nft) {
					withdrawals.push({
						collection: nft.collection,
						tokenId: nft.tokenId,
					});
					nftsToWithdraw.push(nft);
				}
			}

			if (withdrawals.length === 0) {
				toast.error("No valid NFTs selected for withdrawal", TOAST_CONFIG);
				return;
			}

			// Optimistic updates
			setOptimisticDepositedNFTs((prev) =>
				prev.filter(
					(nft) =>
						!state.selectedForWithdrawal.has(
							createNFTKey(nft.collection, nft.tokenId),
						),
				),
			);

			const userNFTs: UserOwnedNFTMultiCollection[] = nftsToWithdraw.map(
				(nft) => ({
					collection: nft.collection,
					tokenId: nft.tokenId,
					...(nft.collectionName && { collectionName: nft.collectionName }),
				}),
			);
			setOptimisticUserNFTs((prev) => [...prev, ...userNFTs]);

			// Process withdrawals sequentially
			for (const withdrawal of withdrawals) {
				await withdrawNFT(withdrawal.collection, withdrawal.tokenId);
			}

			toast.success(
				`Successfully withdrew ${withdrawals.length} NFTs!`,
				TOAST_CONFIG,
			);
			updateState("selectedForWithdrawal", new Set());

			// Quick refetch of vault data
			refetchDepositorVault();

			// Delayed background refresh
			setTimeout(() => {
				loadDepositedNFTs();
				refetchUserNFTs();
				setOptimisticUserNFTs([]);
				setOptimisticDepositedNFTs([]);
			}, 2000);
		} catch (error) {
			console.error("Error in batch withdrawal:", error);
			toast.error("Failed to complete batch withdrawal", TOAST_CONFIG);
			// Revert optimistic updates on error
			setOptimisticUserNFTs([]);
			setOptimisticDepositedNFTs([]);
		} finally {
			updateState("isBatchWithdrawing", false);
		}
	}, [
		state.selectedForWithdrawal,
		treasury,
		displayDepositedNFTs,
		withdrawNFT,
		refetchDepositorVault,
		loadDepositedNFTs,
		refetchUserNFTs,
		updateState,
	]);

	const toggleNFTSelection = useCallback(
		(collection: Address, tokenId: bigint) => {
			const nftKey = createNFTKey(collection, tokenId);
			const currentSet = state.selectedForWithdrawal;
			const newSet = new Set(currentSet);
			if (newSet.has(nftKey)) {
				newSet.delete(nftKey);
			} else {
				newSet.add(nftKey);
			}
			updateState("selectedForWithdrawal", newSet);
		},
		[updateState, state.selectedForWithdrawal],
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
	const nftsByCollection = useMemo(() => {
		const grouped = new Map<string, NFTWithCollection[]>();

		displayDepositedNFTs.forEach((nft) => {
			const collectionKey = (
				nft.canonicalContractAddress || nft.collection
			).toLowerCase();
			if (!grouped.has(collectionKey)) {
				grouped.set(collectionKey, []);
			}
			grouped.get(collectionKey)?.push(nft);
		});

		return grouped;
	}, [displayDepositedNFTs]);

	const collectionFilterOptions = useMemo(() => {
		return Array.from(nftsByCollection.entries())
			.map(([key, nfts]) => {
				const sample = nfts[0];
				if (!sample) {
					return null;
				}
				const resolvedAddress = (sample.canonicalContractAddress ||
					sample.collection ||
					key) as string;
				return {
					value: key,
					label: sample.collectionName || formatShortAddress(resolvedAddress),
					count: nfts.length,
				};
			})
			.filter(
				(option): option is { value: string; label: string; count: number } =>
					!!option,
			)
			.sort((a, b) => b.count - a.count);
	}, [nftsByCollection]);

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
				default:
					return b.currentRarity - a.currentRarity;
			}
		});

		return filtered;
	}, [
		displayDepositedNFTs,
		deferredWithdrawSearch,
		showSelectedOnly,
		state.selectedForWithdrawal,
		collectionFilter,
		sortMode,
	]);

	const filteredNftsByCollection = useMemo(() => {
		const grouped = new Map<string, NFTWithCollection[]>();

		filteredWithdrawableNFTs.forEach((nft) => {
			const collectionKey = (
				nft.canonicalContractAddress || nft.collection
			).toLowerCase();
			if (!grouped.has(collectionKey)) {
				grouped.set(collectionKey, []);
			}
			grouped.get(collectionKey)?.push(nft);
		});

		return grouped;
	}, [filteredWithdrawableNFTs]);

	const totalFilteredValue = useMemo(() => {
		return filteredWithdrawableNFTs.reduce(
			(acc, nft) => acc + (nft.appraisedPrice || 0n),
			0n,
		);
	}, [filteredWithdrawableNFTs]);

	const filteredSelectedCount = useMemo(() => {
		return filteredWithdrawableNFTs.reduce((count, nft) => {
			const nftKey = createNFTKey(nft.collection, nft.tokenId);
			return count + (state.selectedForWithdrawal.has(nftKey) ? 1 : 0);
		}, 0);
	}, [filteredWithdrawableNFTs, state.selectedForWithdrawal]);

	const hasActiveFilters =
		collectionFilter !== "all" ||
		showSelectedOnly ||
		Boolean(deferredWithdrawSearch.trim()) ||
		sortMode !== "rarity";

	const allFilteredSelected =
		filteredWithdrawableNFTs.length > 0 &&
		filteredWithdrawableNFTs.every((nft) =>
			state.selectedForWithdrawal.has(
				createNFTKey(nft.collection, nft.tokenId),
			),
		);

	const hasDeposits = displayDepositedNFTs.length > 0;

	const handleSelectAllFiltered = useCallback(() => {
		if (!filteredWithdrawableNFTs.length) {
			return;
		}

		const nextSelection = new Set(state.selectedForWithdrawal);

		if (allFilteredSelected) {
			filteredWithdrawableNFTs.forEach((nft) => {
				nextSelection.delete(createNFTKey(nft.collection, nft.tokenId));
			});
		} else {
			filteredWithdrawableNFTs.forEach((nft) => {
				nextSelection.add(createNFTKey(nft.collection, nft.tokenId));
			});
		}

		updateState("selectedForWithdrawal", nextSelection);
	}, [
		filteredWithdrawableNFTs,
		state.selectedForWithdrawal,
		updateState,
		allFilteredSelected,
	]);

	const handleResetWithdrawFilters = useCallback(() => {
		setWithdrawSearch("");
		setCollectionFilter("all");
		setSortMode("rarity");
		setShowSelectedOnly(false);
	}, []);

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

			<TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

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
					<section
						id="withdraw-panel"
						role="tabpanel"
						aria-labelledby="withdraw-tab"
					>
						<header className="mb-6 space-y-4">
							<div className="flex flex-wrap items-center justify-between gap-3">
								<div className="flex flex-wrap items-center gap-3">
									<h2 className="text-xl font-semibold text-foreground">
										Withdraw NFTs
									</h2>
									{hasDeposits && (
										<span className="text-sm text-foreground/60">
											Showing {filteredWithdrawableNFTs.length} of{" "}
											{totalDepositedNFTs} NFT
											{totalDepositedNFTs !== 1 ? "s" : ""}
										</span>
									)}
								</div>
								<div className="flex flex-wrap items-center gap-2">
									{hasDeposits && (
										<GlassButton
											size="sm"
											onPress={handleSelectAllFiltered}
											isDisabled={!filteredWithdrawableNFTs.length}
										>
											{allFilteredSelected
												? "Clear View Selection"
												: "Select View"}
										</GlassButton>
									)}
									{state.selectedForWithdrawal.size > 0 && (
										<>
											<span className="text-sm text-foreground/60">
												{state.selectedForWithdrawal.size} selected
											</span>
											<GlassButton
												size="sm"
												color="glassPrimary"
												onPress={handleBatchWithdrawal}
												isLoading={state.isBatchWithdrawing}
												className="animate-pulse"
											>
												Withdraw Selected
											</GlassButton>
											<Button
												size="sm"
												variant="light"
												onPress={() =>
													updateState("selectedForWithdrawal", new Set())
												}
											>
												Clear Selection
											</Button>
										</>
									)}
								</div>
							</div>

							<div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
								<label className="flex flex-col gap-1">
									<span className="text-xs font-semibold uppercase text-foreground/60">
										Search
									</span>
									<input
										type="text"
										className="w-full rounded-2xl border border-white/10 bg-content2/30 px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:border-primary focus:outline-none"
										placeholder="Token ID, collection, or name"
										value={withdrawSearch}
										onChange={(event) => setWithdrawSearch(event.target.value)}
									/>
								</label>

								<label className="flex flex-col gap-1">
									<span className="text-xs font-semibold uppercase text-foreground/60">
										Collection
									</span>
									<select
										className="w-full rounded-2xl border border-white/10 bg-content2/30 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
										value={collectionFilter}
										onChange={(event) =>
											setCollectionFilter(event.target.value)
										}
									>
										<option value="all">All collections</option>
										{collectionFilterOptions.map((option) => (
											<option key={option.value} value={option.value}>
												{option.label} ({option.count})
											</option>
										))}
									</select>
								</label>

								<label className="flex flex-col gap-1">
									<span className="text-xs font-semibold uppercase text-foreground/60">
										Sort by
									</span>
									<select
										className="w-full rounded-2xl border border-white/10 bg-content2/30 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
										value={sortMode}
										onChange={(event) =>
											setSortMode(
												event.target.value as "rarity" | "recent" | "value",
											)
										}
									>
										<option value="rarity">Rarity (high → low)</option>
										<option value="value">Value (high → low)</option>
										<option value="recent">Recently deposited</option>
									</select>
								</label>

								<div className="flex flex-col gap-1 rounded-2xl border border-white/10 bg-content2/30 px-3 py-2">
									<span className="text-xs font-semibold uppercase text-foreground/60">
										Display
									</span>
									<label className="mt-1 flex items-center gap-2 text-sm text-foreground/80">
										<input
											type="checkbox"
											className="h-4 w-4 rounded border-white/20 bg-content1/60 text-primary focus:ring-2 focus:ring-primary/50"
											checked={showSelectedOnly}
											onChange={(event) =>
												setShowSelectedOnly(event.target.checked)
											}
										/>
										Show selected only
									</label>
								</div>
							</div>

							{hasActiveFilters && (
								<div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-primary/40 bg-primary/5 px-4 py-2 text-sm">
									<span className="text-foreground/70">
										Filters active — {filteredWithdrawableNFTs.length} NFT
										{filteredWithdrawableNFTs.length !== 1 ? "s" : ""} across{" "}
										{filteredNftsByCollection.size} collection
										{filteredNftsByCollection.size !== 1 ? "s" : ""} in view
									</span>
									<Button
										size="sm"
										variant="light"
										onPress={handleResetWithdrawFilters}
									>
										Reset filters
									</Button>
								</div>
							)}
						</header>

						{state.isLoadingWithdrawals ? (
							<div className="py-12 text-center">
								<ArrowPathIcon
									className="mx-auto mb-4 h-16 w-16 animate-spin text-foreground/30"
									aria-hidden="true"
								/>
								<p className="text-foreground/60">
									Loading your deposited NFTs...
								</p>
							</div>
						) : !hasDeposits ? (
							<div className="py-12 text-center">
								<ArrowDownTrayIcon
									className="mx-auto mb-4 h-16 w-16 text-foreground/30"
									aria-hidden="true"
								/>
								<h3 className="mb-2 text-lg font-medium text-foreground">
									No Deposited NFTs
								</h3>
								<p className="mb-6 text-foreground/60">
									No NFTs found in your vault deposits.
								</p>

								<div className="mx-auto max-w-md space-y-4">
									<div className="rounded-lg border border-white/10 bg-content2/20 p-4 text-left">
										<h4 className="mb-2 font-medium text-foreground">
											How to deposit NFTs:
										</h4>
										<ol className="space-y-1 text-sm text-foreground/70">
											<li>1. Switch to the "Deposit NFTs" tab</li>
											<li>2. Get your NFTs appraised (if not already)</li>
											<li>3. Deposit appraised NFTs to start earning yield</li>
											<li>4. Return here to withdraw them anytime</li>
										</ol>
									</div>

									<Button
										variant="light"
										onPress={() => setActiveTab("deposit")}
										className="w-full rounded-xl bg-content2/20 hover:bg-content2/30"
									>
										Go to Deposit NFTs
									</Button>
								</div>
							</div>
						) : (
							<div className="space-y-6">
								<article className="space-y-4 rounded-xl border border-white/10 bg-content2/20 p-4">
									<div className="flex flex-wrap items-center justify-between gap-4">
										<div>
											<h3 className="mb-1 font-semibold text-foreground">
												Your Vault Inventory
											</h3>
											<p className="text-sm text-foreground/70">
												{nftsByCollection.size} collection
												{nftsByCollection.size !== 1 ? "s" : ""} with{" "}
												{totalDepositedNFTs} total NFT
												{totalDepositedNFTs !== 1 ? "s" : ""} deposited
											</p>
											{hasActiveFilters && (
												<p className="text-xs text-foreground/60">
													View focused on {filteredNftsByCollection.size}{" "}
													collection
													{filteredNftsByCollection.size !== 1 ? "s" : ""} /{" "}
													{filteredWithdrawableNFTs.length} NFT
													{filteredWithdrawableNFTs.length !== 1 ? "s" : ""}.
												</p>
											)}
										</div>
										<div className="text-right">
											<div className="text-2xl font-bold text-primary">
												{filteredWithdrawableNFTs.length}
											</div>
											<div className="text-sm text-foreground/60">In View</div>
										</div>
									</div>
									<div className="grid gap-3 md:grid-cols-3">
										<div className="rounded-2xl border border-white/10 bg-content1/30 px-4 py-3">
											<p className="text-xs uppercase text-foreground/50">
												Total Deposits
											</p>
											<p className="text-lg font-semibold text-foreground">
												{totalDepositedNFTs}
											</p>
										</div>
										<div className="rounded-2xl border border-white/10 bg-content1/30 px-4 py-3">
											<p className="text-xs uppercase text-foreground/50">
												Value In View
											</p>
											<p className="text-lg font-semibold text-success">
												{formatCurrency(
													totalFilteredValue.toString(),
													18,
													"USD",
												)}
											</p>
										</div>
										<div className="rounded-2xl border border-white/10 bg-content1/30 px-4 py-3">
											<p className="text-xs uppercase text-foreground/50">
												Selected
											</p>
											<p className="text-lg font-semibold text-foreground">
												{state.selectedForWithdrawal.size} total
												{filteredSelectedCount > 0
													? ` • ${filteredSelectedCount} in view`
													: ""}
											</p>
										</div>
									</div>
								</article>

								{filteredWithdrawableNFTs.length === 0 ? (
									<div className="rounded-xl border border-dashed border-white/10 bg-content2/20 p-8 text-center">
										<p className="mb-2 font-medium text-foreground">
											No NFTs match your filters
										</p>
										<p className="mb-4 text-sm text-foreground/60">
											Adjust or reset your filters to see more of your vault
											inventory.
										</p>
										{hasActiveFilters && (
											<Button
												variant="light"
												onPress={handleResetWithdrawFilters}
											>
												Reset Filters
											</Button>
										)}
									</div>
								) : (
									Array.from(filteredNftsByCollection.entries()).map(
										([collectionAddress, nfts], collectionIndex) => {
											const sampleNFT = nfts[0];
											const resolvedAddress =
												(sampleNFT?.canonicalContractAddress ||
													sampleNFT?.collection ||
													collectionAddress) as string;

											return (
												<motion.div
													key={collectionAddress}
													initial={{ opacity: 0, y: 20 }}
													animate={{ opacity: 1, y: 0 }}
													transition={{
														duration: 0.4,
														delay: collectionIndex * 0.1,
													}}
												>
													<article className="rounded-xl border border-white/10 bg-content1/30 p-6">
														<header className="mb-4 flex flex-wrap items-center justify-between gap-3">
															<div className="flex items-center gap-3">
																<div className="rounded-lg bg-primary/20 p-2">
																	<GiftIcon
																		className="h-6 w-6 text-primary"
																		aria-hidden="true"
																	/>
																</div>
																<div>
																	<h4 className="font-semibold text-foreground">
																		{sampleNFT?.collectionName || "Collection"}
																	</h4>
																	<p className="font-mono text-sm text-foreground/70">
																		{formatAddress(resolvedAddress)}
																	</p>
																	<p className="text-xs text-foreground/50">
																		{nfts.length} NFT
																		{nfts.length !== 1 ? "s" : ""} available
																	</p>
																</div>
															</div>
															<div className="text-right">
																<p className="text-sm text-foreground/60">
																	Withdraw-ready
																</p>
																<p className="font-semibold text-foreground">
																	{nfts.length} NFT
																	{nfts.length !== 1 ? "s" : ""}
																</p>
															</div>
														</header>

														<div className="space-y-2">
															<h5 className="mb-3 text-sm font-medium text-foreground/70">
																Individual NFTs ({nfts.length}):
															</h5>
															<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
																{nfts.map((nft) => {
																	const isWithdrawingThisNFT =
																		state.withdrawingNFT?.collection ===
																			nft.collection &&
																		state.withdrawingNFT?.tokenId ===
																			nft.tokenId;
																	const isSelected =
																		state.selectedForWithdrawal.has(
																			createNFTKey(nft.collection, nft.tokenId),
																		);
																	const nftKey = createNFTKey(
																		nft.collection,
																		nft.tokenId,
																	);

																	return (
																		<article
																			key={nftKey}
																			className={`rounded-xl border bg-content2/10 p-4 transition-all duration-200 ${
																				isSelected
																					? "border-primary/50 bg-content2/20 ring-2 ring-primary/20"
																					: "border-white/5 hover:border-white/10"
																			}`}
																		>
																			<div className="flex h-full flex-col gap-4">
																				<div className="flex items-center justify-between">
																					<div className="flex items-center gap-3">
																						<input
																							type="checkbox"
																							checked={isSelected}
																							onChange={() =>
																								toggleNFTSelection(
																									nft.collection,
																									nft.tokenId,
																								)
																							}
																							className="h-4 w-4 rounded border-white/20 bg-content2/50 text-primary focus:ring-2 focus:ring-primary/50"
																							aria-label={`Select NFT ${nft.tokenId.toString()}`}
																						/>
																						<NFTRarityDisplay
																							rarity={nft.currentRarity}
																						/>
																					</div>
																					<p className="rounded bg-content2/20 px-2 py-1 font-mono text-sm">
																						#{nft.tokenId.toString()}
																					</p>
																				</div>

																				<div className="flex justify-center">
																					<NFTCard
																						data={{
																							collection: nft.collection,
																							tokenId: nft.tokenId.toString(),
																							rarity:
																								nft.currentRarity as Rarity,
																						}}
																						size="sm"
																						onClick={() => {}}
																					/>
																				</div>

																				<div className="flex-1 space-y-2">
																					<div className="flex items-center justify-between">
																						<span className="text-xs text-foreground/60">
																							Collection
																						</span>
																						<span className="font-mono text-xs text-foreground/80">
																							{formatShortAddress(
																								nft.collection,
																							)}
																						</span>
																					</div>
																					<div className="flex items-center justify-between">
																						<span className="text-xs text-foreground/60">
																							Value
																						</span>
																						<span className="text-xs font-semibold text-success">
																							{formatCurrency(
																								nft.appraisedPrice.toString(),
																								18,
																								"USD",
																							)}
																						</span>
																					</div>
																				</div>

																				<div className="flex gap-2">
																					<GlassButton
																						size="sm"
																						color="glassPrimary"
																						onPress={() =>
																							handleWithdrawNFT(
																								nft.collection,
																								nft.tokenId,
																							)
																						}
																						isLoading={isWithdrawingThisNFT}
																						isDisabled={
																							isWithdrawingThisNFT ||
																							state.isBatchWithdrawing
																						}
																						aria-label={`Withdraw NFT ${nft.tokenId.toString()}`}
																						className="flex-1 transition-all duration-300"
																					>
																						<ArrowDownTrayIcon
																							className={`h-4 w-4 ${
																								isWithdrawingThisNFT
																									? "animate-bounce"
																									: ""
																							}`}
																							aria-hidden="true"
																						/>
																						{isWithdrawingThisNFT
																							? "Withdrawing..."
																							: "Withdraw"}
																					</GlassButton>
																				</div>
																			</div>
																		</article>
																	);
																})}
															</div>
														</div>
													</article>
												</motion.div>
											);
										},
									)
								)}

								<footer className="mt-8 p-4 bg-content2/20 rounded-lg border border-white/10">
									<h3 className="font-semibold text-foreground mb-2">
										About NFT Withdrawals
									</h3>
									<ul className="text-sm text-foreground/70 space-y-1">
										<li>
											• You can withdraw any individual NFT you have deposited
										</li>
										<li>
											• NFTs currently being used in gacha spins cannot be
											withdrawn
										</li>
										<li>
											• Withdrawals transfer the NFT back to your wallet
											immediately
										</li>
										<li>• Gas fees apply for withdrawal transactions</li>
										<li>
											• Your yield earnings will remain available to claim
											separately
										</li>
									</ul>
								</footer>
							</div>
						)}
					</section>
				)}

				{activeTab === "yield" && (
					<YieldTab
						depositorUserData={depositorUserData}
						depositorData={depositorData}
					/>
				)}
			</motion.div>
		</GachaSectionLayout>
	);
}
