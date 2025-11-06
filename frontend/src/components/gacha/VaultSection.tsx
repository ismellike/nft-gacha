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
import {
	useUserOwnedNFTsMultipleCollections,
} from "../../hooks/useUserOwnedNFTs";
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
					color="primary"
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
				<Button
					key={tab.id}
					variant={activeTab === tab.id ? "solid" : "light"}
					role="tab"
					aria-selected={activeTab === tab.id}
					aria-controls={`${tab.id}-panel`}
					className={`flex-1 min-w-[120px] justify-center gap-2 rounded-lg ${
						activeTab === tab.id
							? "bg-gradient-to-r from-warning to-orange-400 text-black hover:!from-warning hover:!to-orange-400 hover:!text-black"
							: "text-foreground/70 hover:text-foreground hover:bg-content1/30"
					}`}
					onPress={() => onTabChange(tab.id)}
				>
					<tab.icon className="w-4 h-4" aria-hidden="true" />
					{tab.label}
				</Button>
			))}
		</div>
	);
};

const DepositTab: React.FC<{
	userOwnedNFTs: UserOwnedNFTMultiCollection[];
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
	userOwnedNFTs,
	sortedUserOwnedNFTs,
	appraisedNFTs,
	appraisalData,
	appraisal,
	depositingNFTs,
	isNFTDepositing,
	onNFTAction,
}) => {
	if (userOwnedNFTs.length === 0) {
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
										color="glassPrimary"
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
	const emoji = RARITY_EMOJIS[rarity] || "⚪";
	const name = RARITY_NAMES[rarity] || "Unknown";

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
	const { getUserDepositedNFTs } = useUserDepositedNFTs(treasury);

	// Whitelisted collections
	const whitelistedCollectionsQuery =
		useReadGachaTreasuryGetWhitelistedCollections({
			address: treasury,
			query: { enabled: !!treasury },
		} as Parameters<typeof useReadGachaTreasuryGetWhitelistedCollections>[0]);
	const whitelistedCollections: `0x${string}`[] =
		(whitelistedCollectionsQuery.data as `0x${string}`[]) || [];

	// NFT deposit hooks
	const {
		depositNFT,
		isNFTDepositing,
		reset: resetDeposit,
		forceReset: forceResetDeposit,
	} = useNFTDeposit({
		onSuccess: () => {
			toast.success("NFT deposited successfully!", TOAST_CONFIG);
			updateState("depositingNFTs", new Set());
			refetchUserNFTs();
			refetchDepositorVault();
		},
		onAction: updateAppraisedStatus,
		onAppraisalStatusChange: updateAppraisedStatus,
	});

	const { nfts: userOwnedNFTs, refetch: refetchUserNFTs } =
		useUserOwnedNFTsMultipleCollections(whitelistedCollections);

	// Appraisal checking
	useAppraisalChecker(
		userOwnedNFTs,
		appraisal,
		publicClient,
		updateAppraisedStatus,
	);

	// Sort NFTs by appraisal status
	const sortedUserOwnedNFTs = useMemo(() => {
		if (!userOwnedNFTs.length) return [];

		const appraised: typeof userOwnedNFTs = [];
		const needsAppraisal: typeof userOwnedNFTs = [];

		for (const nft of userOwnedNFTs) {
			const key = createNFTKey(nft.collection, nft.tokenId);
			if (state.appraisedNFTs.has(key)) {
				appraised.push(nft);
			} else {
				needsAppraisal.push(nft);
			}
		}

		return [...appraised, ...needsAppraisal];
	}, [userOwnedNFTs, state.appraisedNFTs]);

	// Cleanup orphaned state
	React.useEffect(() => {
		if (!userOwnedNFTs.length) {
			updateState("appraisedNFTs", new Set());
			updateState("appraisalData", new Map());
			return;
		}

		const validKeys = new Set(
			userOwnedNFTs.map((nft) => createNFTKey(nft.collection, nft.tokenId)),
		);
		cleanupOrphanedState(validKeys);
	}, [userOwnedNFTs, cleanupOrphanedState, updateState]);

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

			const nftsWithCollections: NFTWithCollection[] = nfts.map((nft) => {
				const result: NFTWithCollection = { ...nft };
				if (nft.collectionName) {
					result.collectionName = nft.collectionName;
				}
				return result;
			});

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
	}, [activeTab, resetDeposit]);

	React.useEffect(() => {
		return () => {
			forceResetDeposit();
		};
	}, [forceResetDeposit]);

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
				await withdrawNFT(collection, tokenId);
				toast.success("NFT withdrawal submitted successfully!", TOAST_CONFIG);

				setTimeout(() => {
					loadDepositedNFTs();
					refetchDepositorVault();
				}, 3000);
			} catch (error) {
				console.error("Error withdrawing NFT:", error);
				const errorMessage =
					error instanceof Error ? error.message : "Unknown error occurred";
				toast.error(`Failed to withdraw NFT: ${errorMessage}`, TOAST_CONFIG);
			} finally {
				setTimeout(() => {
					updateState("withdrawingNFT", null);
				}, 2000);
			}
		},
		[
			treasury,
			state.withdrawingNFT,
			withdrawNFT,
			loadDepositedNFTs,
			refetchDepositorVault,
			updateState,
		],
	);

	const handleDepositNFT = useCallback(
		async (collection: string, tokenId: string, hasAppraisal = false) => {
			const nftKey = createNFTKey(collection, tokenId);

			try {
				await depositNFT(collection as `0x${string}`, BigInt(tokenId), {
					hasAppraisal,
				});

				setTimeout(() => {
					const newSet = new Set(state.depositingNFTs);
					newSet.delete(nftKey);
					updateState("depositingNFTs", newSet);
				}, 3000);
			} catch (error) {
				console.error("Error depositing NFT:", error);
				toast.error("Failed to deposit NFT", TOAST_CONFIG);
				updateState("depositingNFTs", new Set());
			}
		},
	[depositNFT, updateState, state.depositingNFTs],
	);

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
	const totalDepositedNFTs = state.depositedNFTs.length;
	const nftsByCollection = useMemo(() => {
		const grouped = new Map<string, NFTWithCollection[]>();

		state.depositedNFTs.forEach((nft) => {
			const collectionKey = nft.collection.toLowerCase();
			if (!grouped.has(collectionKey)) {
				grouped.set(collectionKey, []);
			}
			grouped.get(collectionKey)?.push(nft);
		});

		return grouped;
	}, [state.depositedNFTs]);

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
						userOwnedNFTs={userOwnedNFTs}
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
							<h2 className="text-xl font-semibold text-foreground">
								Withdraw NFTs
							</h2>
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
													<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
														{nfts.map((nft) => {
															const isWithdrawingThisNFT =
																state.withdrawingNFT?.collection ===
																	nft.collection &&
																state.withdrawingNFT?.tokenId === nft.tokenId;
															const nftKey = createNFTKey(
																nft.collection,
																nft.tokenId,
															);

															return (
																<article
																	key={nftKey}
																	className="bg-content2/10 rounded-lg p-4 border border-white/5"
																>
																	<div className="flex flex-col h-full">
																		<header className="flex items-center justify-between mb-3">
																			<NFTRarityDisplay
																				rarity={nft.currentRarity}
																			/>
																			<p className="text-sm font-mono bg-content2/20 px-2 py-1 rounded">
																				Token #{nft.tokenId.toString()}
																			</p>
																		</header>

																		<div className="flex-1 space-y-2 mb-4">
																			<div className="flex items-center gap-2">
																				<span className="text-xs text-foreground/60">
																					Collection:
																				</span>
																				<span className="text-xs font-mono text-foreground/80">
																					{formatShortAddress(nft.collection)}
																				</span>
																			</div>
																			<div className="flex items-center gap-2">
																				<span className="text-xs text-foreground/60">
																					Value:
																				</span>
																				<span className="text-xs font-semibold text-success">
																					{formatCurrency(
																						nft.appraisedPrice.toString(),
																						18,
																						"USD",
																					)}
																				</span>
																			</div>
																			<div className="flex items-center gap-2">
																				<span className="text-xs text-foreground/60">
																					Rarity:
																				</span>
																				<NFTRarityDisplay
																					rarity={nft.currentRarity}
																				/>
																			</div>
																		</div>

																		<GlassButton
																			size="sm"
																			color="glass"
																			onPress={() =>
																				handleWithdrawNFT(
																					nft.collection,
																					nft.tokenId,
																				)
																			}
																			isLoading={isWithdrawingThisNFT}
																			isDisabled={isWithdrawingThisNFT}
																			aria-label={`Withdraw NFT ${nft.tokenId.toString()}`}
																			className="w-full transition-all duration-300"
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
