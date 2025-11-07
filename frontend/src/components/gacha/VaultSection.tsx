"use client";

import React, { useState, useCallback, useMemo } from "react";
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
import { UnifiedNFTCard } from "../UnifiedNFTCard";
import { GachaSectionLayout } from "./GachaSectionLayout";
import {
	useDepositorVaultData,
	formatTokenAmount,
	calculateUserSharePercentage,
	useClaimYield,
	useSimulateClaimYield,
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
	depositingNFTs: Set<string>;
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
		depositingNFTs: new Set(),
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
	canClaim: boolean;
	isClaiming: boolean;
	onClaimYield: () => void;
	totalDepositedNFTs: number;
}> = ({
	depositorUserData,
	canClaim,
	isClaiming,
	onClaimYield,
	totalDepositedNFTs,
}) => (
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
			{canClaim && (
				<GlassButton
					className="mt-3 w-full"
					color="glassPrimary"
					onPress={onClaimYield}
					isLoading={isClaiming}
					aria-label="Claim pending yield"
				>
					Claim Yield
				</GlassButton>
			)}
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
	depositingNFTs: Set<string>;
	isNFTDepositing: (collection: string, tokenId: string) => boolean;
	onNFTAction: (
		collection: string,
		tokenId: string,
		hasAppraisal?: boolean,
	) => void;
}> = ({
	sortedUserOwnedNFTs,
	appraisedNFTs,
	appraisalData,
	appraisal,
	depositingNFTs,
	isNFTDepositing,
	onNFTAction,
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
					const appraiseInfo = appraisalData.get(nftKey);
					const isDepositing =
						depositingNFTs.has(nftKey) ||
						isNFTDepositing(nft.collection, nft.tokenId.toString());

					return (
						<article
							key={nftKey}
							className="bg-content1/30 rounded-xl p-4 border border-white/10 flex flex-col h-full"
						>
							<div className="flex-1">
								<UnifiedNFTCard
									collection={nft.collection}
									tokenId={nft.tokenId.toString()}
									appraisalContractAddress={
										(appraisal as `0x${string}`) ||
										"0x0000000000000000000000000000000000000000"
									}
									variant="detailed"
									size="md"
									showAppraisal={true}
									{...(appraiseInfo && {
										appraisalOverride: {
											hasAppraisal: appraiseInfo.hasAppraisal,
											priceUSD: appraiseInfo.priceUSD,
										},
									})}
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
										Deposit NFT
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
	const validRarity = typeof rarity === "number" && !isNaN(rarity) ? rarity : 0;
	const clampedRarity = Math.max(0, Math.min(4, validRarity));

	const emoji = RARITY_EMOJIS[clampedRarity] || "⚪";
	const name = validRarity !== clampedRarity
		? `Unknown (${validRarity})`
		: (RARITY_NAMES[clampedRarity] || "Unknown");

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
	const { canClaim } = useSimulateClaimYield({
		contractAddress: gachaConfig?.depositorVaultAddress || "",
		account: address || "",
		recipient: address || "",
	});

	// NFT functionality
	const treasury = contracts.treasury as `0x${string}` | undefined;
	const appraisal = contracts.appraisal as `0x${string}` | undefined;
	const { withdrawNFT } = useNFTWithdrawal(treasury);
	const { getUserDepositedNFTs, getCanonicalNFTData } = useUserDepositedNFTs(treasury);

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
	const {
		depositNFT,
		isNFTDepositing,
		reset: resetDeposit,
		forceReset: forceResetDeposit,
	} = useNFTDeposit({
		onSuccess: () => {
			toast.success("NFT deposited successfully!", TOAST_CONFIG);

			// Update depositing state immediately
			updateState("depositingNFTs", new Set());

			// Quick refetch of vault data (cheaper than full NFT refresh)
			refetchDepositorVault();

			// Delayed background refresh to ensure data consistency
			setTimeout(() => {
				refetchUserNFTs();
				loadDepositedNFTs();
				// Clear optimistic state after real data loads
				setOptimisticUserNFTs([]);
				setOptimisticDepositedNFTs([]);
			}, 2000);
		},
		onAction: updateAppraisedStatus,
		onAppraisalStatusChange: updateAppraisedStatus,
	});

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

	// Load deposited NFTs
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
				return;
			}

			// Fetch canonical data for each NFT via appraisal contract
			const nftsWithCanonicalData = await Promise.all(
				nfts.map(async (nft) => {
					console.log(`🔍 [VaultSection] Fetching canonical data for NFT:`, {
						depositedCollection: nft.collection,
						depositedTokenId: nft.tokenId.toString(),
						currentRarity: nft.currentRarity,
						appraisedPrice: nft.appraisedPrice.toString(),
					});

					if (!appraisal) {
						console.warn("No appraisal contract available");
						return { ...nft };
					}

					const canonicalData = await getCanonicalNFTData(
						appraisal as Address,
						nft.collection,
						nft.tokenId,
					);

					console.log(`✅ [VaultSection] Canonical data received:`, {
						canonicalContractAddress: canonicalData.canonicalContractAddress,
						canonicalTokenId: canonicalData.canonicalTokenId?.toString(),
					});

					return {
						...nft,
						...canonicalData,
					};
				}),
			);

			// Log the final grouping by canonical collections
			console.log(`📦 [VaultSection] Final grouping by canonical collections:`);
			const canonicalCollections = new Map<string, number>();
			nftsWithCanonicalData.forEach(nft => {
				const collection = nft.canonicalContractAddress || nft.collection;
				canonicalCollections.set(collection, (canonicalCollections.get(collection) || 0) + 1);
			});
			canonicalCollections.forEach((count, collection) => {
				console.log(`  ${collection}: ${count} NFTs`);
			});
			console.log(`📋 [VaultSection] Total unique canonical collections: ${canonicalCollections.size}`);

			const nftsWithCollections: NFTWithCollection[] = nftsWithCanonicalData.map((nft) => ({ ...nft }));
			updateState("depositedNFTs", nftsWithCollections);
		} catch (error) {
			console.error("Error loading deposited NFTs:", error);
			toast.error("Failed to load deposited NFTs", TOAST_CONFIG);
			updateState("depositedNFTs", []);
		} finally {
			updateState("isLoadingWithdrawals", false);
		}
	}, [treasury, address, getUserDepositedNFTs, updateState]);

	// Effects
	React.useEffect(() => {
		loadDepositedNFTs();
	}, [loadDepositedNFTs]);

	React.useEffect(() => {
		if (activeTab !== "deposit") {
			resetDeposit();
		}
		if (activeTab !== "withdraw") {
			// Clear selection when switching away from withdraw tab
			updateState("selectedForWithdrawal", new Set());
			updateState("isBatchWithdrawing", false);
		}
		// Clear optimistic state when switching tabs
		setOptimisticUserNFTs([]);
		setOptimisticDepositedNFTs([]);
	}, [activeTab, resetDeposit, updateState]);

	React.useEffect(() => {
		return () => {
			forceResetDeposit();
		};
	}, [forceResetDeposit]);

	// Clear optimistic state when user NFTs change (real data loaded)
	React.useEffect(() => {
		if (userOwnedNFTs.length > 0) {
			setOptimisticUserNFTs([]);
		}
	}, [userOwnedNFTs]);

	// Event handlers
	const handleClaimYield = useCallback(async () => {
		if (!address || !canClaim) return;

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
		canClaim,
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
					(nft) => createNFTKey(nft.collection, nft.tokenId) === nftKey
				);

				if (nftToWithdraw) {
					// Remove from deposited NFTs optimistically
					setOptimisticDepositedNFTs(prev =>
						prev.filter(nft => createNFTKey(nft.collection, nft.tokenId) !== nftKey)
					);

					// Add to user-owned NFTs optimistically
					const userNFT: UserOwnedNFTMultiCollection = {
						collection: collection,
						tokenId: tokenId,
						...(nftToWithdraw.collectionName && { collectionName: nftToWithdraw.collectionName }),
					};
					setOptimisticUserNFTs(prev => [...prev, userNFT]);
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
				updateState("depositingNFTs", new Set());
				// Revert optimistic updates on error
				setOptimisticUserNFTs([]);
				setOptimisticDepositedNFTs([]);
			}
		},
		[
			depositNFT,
			updateState,
			state.depositingNFTs,
			state.appraisalData,
			displayUserNFTs,
			address,
		],
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
					(dep) => createNFTKey(dep.collection, dep.tokenId) === nftKey
				);
				if (nft) {
					withdrawals.push({ collection: nft.collection, tokenId: nft.tokenId });
					nftsToWithdraw.push(nft);
				}
			}

			if (withdrawals.length === 0) {
				toast.error("No valid NFTs selected for withdrawal", TOAST_CONFIG);
				return;
			}

			// Optimistic updates
			setOptimisticDepositedNFTs(prev =>
				prev.filter(nft => !state.selectedForWithdrawal.has(createNFTKey(nft.collection, nft.tokenId)))
			);

			const userNFTs: UserOwnedNFTMultiCollection[] = nftsToWithdraw.map(nft => ({
				collection: nft.collection,
				tokenId: nft.tokenId,
				...(nft.collectionName && { collectionName: nft.collectionName }),
			}));
			setOptimisticUserNFTs(prev => [...prev, ...userNFTs]);

			// Process withdrawals sequentially
			for (const withdrawal of withdrawals) {
				await withdrawNFT(withdrawal.collection, withdrawal.tokenId);
			}

			toast.success(`Successfully withdrew ${withdrawals.length} NFTs!`, TOAST_CONFIG);
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

	const toggleNFTSelection = useCallback((collection: Address, tokenId: bigint) => {
		const nftKey = createNFTKey(collection, tokenId);
		const currentSet = state.selectedForWithdrawal;
		const newSet = new Set(currentSet);
		if (newSet.has(nftKey)) {
			newSet.delete(nftKey);
		} else {
			newSet.add(nftKey);
		}
		updateState("selectedForWithdrawal", newSet);
	}, [updateState, state.selectedForWithdrawal]);

	const handleNFTAction = useCallback(
		(collection: string, tokenId: string, hasAppraisal?: boolean) => {
			if (hasAppraisal) {
				const nftKey = createNFTKey(collection, tokenId);

				if (isNFTDepositing(collection, tokenId)) {
					return;
				}

				const newDepositingSet = new Set(state.depositingNFTs).add(nftKey);
				updateState("depositingNFTs", newDepositingSet);
				handleDepositNFT(collection, tokenId, true);
			} else {
				const appraisalUrl = `/appraisal?collection=${encodeURIComponent(
					collection,
				)}&tokenId=${encodeURIComponent(tokenId)}`;
				window.location.href = appraisalUrl;
			}
		},
		[isNFTDepositing, handleDepositNFT, updateState, state.depositingNFTs],
	);

	// Computed values
	const totalDepositedNFTs = displayDepositedNFTs.length;
	const nftsByCollection = useMemo(() => {
		const grouped = new Map<string, NFTWithCollection[]>();

		displayDepositedNFTs.forEach((nft) => {
			const collectionKey = nft.collection.toLowerCase();
			if (!grouped.has(collectionKey)) {
				grouped.set(collectionKey, []);
			}
			grouped.get(collectionKey)?.push(nft);
		});

		return grouped;
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
				canClaim={!!canClaim}
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
						depositingNFTs={state.depositingNFTs}
						isNFTDepositing={isNFTDepositing}
						onNFTAction={handleNFTAction}
					/>
				)}

				{activeTab === "withdraw" && (
					<section
						id="withdraw-panel"
						role="tabpanel"
						aria-labelledby="withdraw-tab"
					>
						<header className="flex items-center justify-between mb-4">
							<div className="flex items-center gap-4">
								<h2 className="text-xl font-semibold text-foreground">
									Withdraw NFTs
								</h2>
								{state.selectedForWithdrawal.size > 0 && (
									<div className="flex items-center gap-2">
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
											onPress={() => updateState("selectedForWithdrawal", new Set())}
										>
											Clear Selection
										</Button>
									</div>
								)}
							</div>
							{displayDepositedNFTs.length > 0 && (
								<Button
									size="sm"
									variant="light"
									onPress={() => {
										const allKeys = displayDepositedNFTs.map(nft => createNFTKey(nft.collection, nft.tokenId));
										updateState("selectedForWithdrawal", new Set(allKeys));
									}}
								>
									Select All
								</Button>
							)}
						</header>

						{state.isLoadingWithdrawals ? (
							<div className="text-center py-12">
								<ArrowPathIcon
									className="w-16 h-16 mx-auto mb-4 text-foreground/30 animate-spin"
									aria-hidden="true"
								/>
								<p className="text-foreground/60">
									Loading your deposited NFTs...
								</p>
							</div>
						) : state.depositedNFTs.length === 0 ? (
							<div className="text-center py-12">
								<ArrowDownTrayIcon
									className="w-16 h-16 mx-auto mb-4 text-foreground/30"
									aria-hidden="true"
								/>
								<h3 className="text-lg font-medium text-foreground mb-2">
									No Deposited NFTs
								</h3>
								<p className="text-foreground/60 mb-6">
									No NFTs found in your vault deposits.
								</p>

								<div className="space-y-4 max-w-md mx-auto">
									<div className="bg-content2/20 rounded-lg p-4 border border-white/10 text-left">
										<h4 className="font-medium text-foreground mb-2">
											How to deposit NFTs:
										</h4>
										<ol className="text-sm text-foreground/70 space-y-1">
											<li>1. Switch to the "Deposit NFTs" tab</li>
											<li>2. Get your NFTs appraised (if not already)</li>
											<li>3. Deposit appraised NFTs to start earning yield</li>
											<li>4. Return here to withdraw them anytime</li>
										</ol>
									</div>

									<Button
										variant="light"
										onPress={() => setActiveTab("deposit")}
										className="rounded-xl bg-content2/20 hover:bg-content2/30 w-full"
									>
										Go to Deposit NFTs
									</Button>
								</div>
							</div>
						) : (
							<div className="space-y-6">
								<article className="bg-content2/20 rounded-xl p-4 border border-white/10">
									<div className="flex items-center justify-between">
										<div>
											<h3 className="font-semibold text-foreground mb-1">
												Your Vault Inventory
											</h3>
											<p className="text-sm text-foreground/70">
												{nftsByCollection.size} collection
												{nftsByCollection.size !== 1 ? "s" : ""} with{" "}
												{totalDepositedNFTs} total NFT
												{totalDepositedNFTs !== 1 ? "s" : ""} deposited
											</p>
										</div>
										<div className="text-right">
											<div className="text-2xl font-bold text-primary">
												{totalDepositedNFTs}
											</div>
											<div className="text-sm text-foreground/60">
												Total Deposits
											</div>
										</div>
									</div>
								</article>

								{Array.from(nftsByCollection.entries()).map(
									([collectionAddress, nfts], collectionIndex) => (
										<motion.div
											key={collectionAddress}
											initial={{ opacity: 0, y: 20 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{
												duration: 0.4,
												delay: collectionIndex * 0.1,
											}}
										>
											<article className="bg-content1/30 rounded-xl p-6 border border-white/10">
												<header className="flex items-center justify-between mb-4">
													<div className="flex items-center gap-3">
														<div className="p-2 rounded-lg bg-primary/20">
															<GiftIcon
																className="w-6 h-6 text-primary"
																aria-hidden="true"
															/>
														</div>
														<div>
															<h4 className="font-semibold text-foreground">
																Collection
															</h4>
															<p className="text-sm text-foreground/70 font-mono">
																{formatAddress(collectionAddress)}
															</p>
														</div>
													</div>
													<div className="text-right">
														<p className="text-sm text-foreground/60">
															NFTs in Collection
														</p>
														<p className="font-semibold text-foreground">
															{nfts.length} NFT{nfts.length !== 1 ? "s" : ""}
														</p>
													</div>
												</header>

												<div className="space-y-2">
													<h5 className="text-sm font-medium text-foreground/70 mb-3">
														Individual NFTs ({nfts.length}):
													</h5>
													<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
														{nfts.map((nft) => {
															const isWithdrawingThisNFT =
																state.withdrawingNFT?.collection ===
																	nft.collection &&
																state.withdrawingNFT?.tokenId === nft.tokenId;
															const isSelected = state.selectedForWithdrawal.has(
																createNFTKey(nft.collection, nft.tokenId)
															);
															const nftKey = createNFTKey(
																nft.collection,
																nft.tokenId,
															);

															return (
																<article
																	key={nftKey}
																	className={`bg-content2/10 rounded-xl p-4 border transition-all duration-200 ${
																		isSelected
																			? "border-primary/50 ring-2 ring-primary/20 bg-content2/20"
																			: "border-white/5 hover:border-white/10"
																	}`}
																>
																	<div className="flex flex-col h-full gap-4">
																		{/* Selection Checkbox and Rarity */}
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
																					className="w-4 h-4 rounded border-white/20 bg-content2/50 text-primary focus:ring-2 focus:ring-primary/50"
																					aria-label={`Select NFT ${nft.tokenId.toString()}`}
																				/>
																				<NFTRarityDisplay
																					rarity={nft.currentRarity}
																				/>
																			</div>
																			<p className="text-sm font-mono bg-content2/20 px-2 py-1 rounded">
																				#{nft.tokenId.toString()}
																			</p>
																		</div>

																		{/* NFT Image - UnifiedNFTCard will use appraisal contract to get canonical NFT data */}
																		<div className="flex justify-center">
																			<UnifiedNFTCard
																				collection={nft.collection}
																				tokenId={nft.tokenId.toString()}
																				appraisalContractAddress={
																					(appraisal as `0x${string}`) ||
																					"0x0000000000000000000000000000000000000000"
																				}
																				rarity={nft.currentRarity as any}
																				size="sm"
																				variant="compact"
																				showAppraisal={false}
																				appraisalOverride={{
																					hasAppraisal: nft.appraisedPrice > 0n,
																					priceUSD: nft.appraisedPrice,
																				}}
																				onClick={() => {}}
																			/>
																		</div>

																		{/* NFT Details */}
																		<div className="space-y-2 flex-1">
																			<div className="flex items-center justify-between">
																				<span className="text-xs text-foreground/60">
																					Collection
																				</span>
																				<span className="text-xs font-mono text-foreground/80">
																					{formatShortAddress(nft.collection)}
																				</span>
																			</div>
																			<div className="flex items-center justify-between">
																				<span className="text-xs text-foreground/60">
																					Value
																				</span>
																				<span className="text-xs font-semibold text-success">
																					{formatCurrency(
																						nft.appraisedPrice.toString(),
																						0, // Appraised price is already in USD cents
																						"USD",
																					)}
																				</span>
																			</div>
																		</div>

																		{/* Withdraw Button */}
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
																				isDisabled={isWithdrawingThisNFT || state.isBatchWithdrawing}
																				aria-label={`Withdraw NFT ${nft.tokenId.toString()}`}
																				className="flex-1 transition-all duration-300"
																			>
																				<ArrowDownTrayIcon
																					className={`w-4 h-4 ${isWithdrawingThisNFT ? "animate-bounce" : ""}`}
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
									),
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
