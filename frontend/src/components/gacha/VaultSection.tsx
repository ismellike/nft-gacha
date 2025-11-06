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
} from "../../hooks/useDepositorVault";
import { formatCurrency } from "../../lib/utils";
import { useNFTWithdrawal } from "../../hooks/useNFTWithdrawal";
import { useUserDepositedNFTs, type DepositedNFT } from "../../hooks/useUserDepositedNFTs";
import { useNFTDeposit } from "../../hooks/useNFTDeposit";
import { useUserOwnedNFTsMultipleCollections } from "../../hooks/useUserOwnedNFTs";
import { useGachaContracts } from "../../hooks/useGachaContracts";
import { useGachaId } from "../../hooks/useGachaId";
import { getGachaConfig } from "../../lib/gacha-config";
import { useReadGachaTreasuryGetWhitelistedCollections } from "../../generated";
import { toast } from "react-hot-toast";
import type { Address } from "viem";

interface VaultSectionProps {
	title: string;
	description: string;
}

type VaultTab = "deposit" | "withdraw" | "yield";

interface NFTWithCollection extends DepositedNFT {
	collectionName?: string; // Optional collection name for display
}

export function VaultSection({ title, description }: VaultSectionProps) {
	const { address } = useAccount();
	const publicClient = usePublicClient();
	const gachaId = useGachaId();
	const contracts = useGachaContracts(gachaId);
	const gachaConfig = getGachaConfig(gachaId);

	// Tab management
	const [activeTab, setActiveTab] = useState<VaultTab>("deposit");

	// Depositor Vault data
	const depositorVaultProps = {
		contractAddress: gachaConfig?.depositorVaultAddress || "",
		...(address && { userAddress: address }),
	};

	const {
		data: depositorData,
		userData: depositorUserData,
		refetch: refetchDepositorVault,
	} = useDepositorVaultData(depositorVaultProps);

	// Claim yield functionality
	const { claimYield, isClaiming } = useClaimYield();
	const { canClaim } = useSimulateClaimYield({
		contractAddress: gachaConfig?.depositorVaultAddress || "",
		account: address || "",
		recipient: address || "",
	});

	// NFT Withdrawal functionality
	const treasury = contracts.treasury as `0x${string}` | undefined;
	const appraisal = contracts.appraisal as `0x${string}` | undefined;
	const { withdrawNFT } = useNFTWithdrawal(treasury);
	const { getUserDepositedNFTs } = useUserDepositedNFTs(treasury);


	// Whitelisted collections
	const whitelistedCollectionsQuery = useReadGachaTreasuryGetWhitelistedCollections({
		address: treasury,
		query: { enabled: !!treasury }
	} as Parameters<typeof useReadGachaTreasuryGetWhitelistedCollections>[0]);
	const whitelistedCollections: `0x${string}`[] = (whitelistedCollectionsQuery.data as `0x${string}`[]) || [];

	// Create a map to track which NFTs have appraisals for sorting
	const [appraisedNFTs, setAppraisedNFTs] = useState<Set<string>>(new Set());
	// Store appraisal data with prices to pass to UnifiedNFTCard
	const [appraisalData, setAppraisalData] = useState<Map<string, { hasAppraisal: boolean; priceUSD: bigint }>>(new Map());

	// Track which NFTs are currently being deposited to prevent duplicates
	const [depositingNFTs, setDepositingNFTs] = useState<Set<string>>(new Set());

	// Update appraised NFTs when we get appraisal data
	const updateAppraisedStatus = useCallback((collection: string, tokenId: string, hasAppraisal: boolean, priceUSD?: bigint) => {
		const normalizedTokenId = tokenId.toString();
		const key = `${collection.toLowerCase()}:${normalizedTokenId}`;

		setAppraisedNFTs(prev => {
			const newSet = new Set(prev);
			if (hasAppraisal) {
				newSet.add(key);
			} else {
				newSet.delete(key);
			}
			return newSet;
		});
		// Update appraisal data with price
		setAppraisalData(prev => {
			const newMap = new Map(prev);
			if (hasAppraisal && priceUSD) {
				newMap.set(key, { hasAppraisal: true, priceUSD });
			} else {
				newMap.delete(key);
			}
			return newMap;
		});
	}, []);

	// NFT Deposit functionality
	const {
		depositNFT,
		isNFTDepositing,
		reset: resetDeposit,
		forceReset: forceResetDeposit,
	} = useNFTDeposit({
		onSuccess: () => {
			toast.success("NFT deposited successfully!");
			// Clear all depositing NFTs on success (clean slate for next deposits)
			setDepositingNFTs(new Set());

			// Refetch user's NFTs to remove deposited NFT from the list
			refetchUserNFTs();

			// Also refetch vault data
			refetchDepositorVault();
		},
		onAction: (collection, tokenId, hasValidAppraisal) =>
			updateAppraisedStatus(collection, tokenId, !!hasValidAppraisal),
		onAppraisalStatusChange: updateAppraisedStatus,
	});
	const { nfts: userOwnedNFTs, refetch: refetchUserNFTs } = useUserOwnedNFTsMultipleCollections(whitelistedCollections);

	// Check appraisal status when component mounts or NFTs change
	React.useEffect(() => {
		if (!userOwnedNFTs.length || !appraisal || !publicClient) return;

		const checkAppraisals = async () => {
			for (const nft of userOwnedNFTs) {
				const key = `${nft.collection}:${nft.tokenId}`;

				try {
					const hasAppraisalResult = await publicClient.readContract({
						address: appraisal as `0x${string}`,
						abi: [
							{
								name: "hasAppraisal",
								type: "function",
								stateMutability: "view",
								inputs: [
									{ name: "collection", type: "address" },
									{ name: "tokenId", type: "uint256" }
								],
								outputs: [{ name: "", type: "bool" }]
							}
						],
						functionName: "hasAppraisal",
						args: [nft.collection as `0x${string}`, nft.tokenId]
					}) as boolean;

					let hasValidAppraisal = hasAppraisalResult;
					let priceUSD: bigint = 0n;
					let status: number = 0;

					if (hasAppraisalResult) {
						try {
							const appraisalData = await publicClient.readContract({
								address: appraisal as `0x${string}`,
								abi: [
									{
										name: "getAppraisedPrice",
										type: "function",
										stateMutability: "view",
										inputs: [
											{ name: "collection", type: "address" },
											{ name: "tokenId", type: "uint256" }
										],
										outputs: [
											{ name: "priceUSD", type: "uint256" },
											{ name: "status", type: "uint8" }
										]
									}
								],
								functionName: "getAppraisedPrice",
								args: [nft.collection as `0x${string}`, nft.tokenId]
							}) as readonly [bigint, number];

							[priceUSD, status] = appraisalData;
							const statusAsNumber = Number(status);
							hasValidAppraisal = priceUSD > 0n && (statusAsNumber === 1 || statusAsNumber === 2);
						} catch (error) {
							console.warn(`Failed to fetch appraisal details for ${key}:`, error);
						}
					}

					updateAppraisedStatus(nft.collection, nft.tokenId.toString(), hasValidAppraisal, priceUSD);
				} catch (error) {
					console.error(`Error checking appraisal for ${key}:`, error);
					updateAppraisedStatus(nft.collection, nft.tokenId.toString(), false, 0n);
				}
			}
		};

		checkAppraisals();
	}, [userOwnedNFTs, appraisal, publicClient, updateAppraisedStatus]);

	// Sort NFTs to show appraised ones first
	const sortedUserOwnedNFTs = useMemo(() => {
		if (!userOwnedNFTs.length) return [];

		const appraised: typeof userOwnedNFTs = [];
		const needsAppraisal: typeof userOwnedNFTs = [];

		for (const nft of userOwnedNFTs) {
			const key = `${nft.collection.toLowerCase()}:${nft.tokenId.toString()}`;
			if (appraisedNFTs.has(key)) {
				appraised.push(nft);
			} else {
				needsAppraisal.push(nft);
			}
		}

		return [...appraised, ...needsAppraisal];
	}, [userOwnedNFTs, appraisedNFTs]);

	// Clean up appraisal state when NFT list changes
	React.useEffect(() => {
		if (!userOwnedNFTs.length) {
			setAppraisedNFTs(new Set());
			setAppraisalData(new Map());
			return;
		}

		const validKeys = new Set(
			userOwnedNFTs.map((nft) => `${nft.collection.toLowerCase()}:${nft.tokenId.toString()}`),
		);

		setAppraisedNFTs((prev) => {
			const next = new Set<string>();
			prev.forEach((key) => {
				if (validKeys.has(key)) {
					next.add(key);
				}
			});
			return next;
		});

		setAppraisalData((prev) => {
			const next = new Map();
			prev.forEach((value, key) => {
				if (validKeys.has(key)) {
					next.set(key, value);
				}
			});
			return next;
		});
	}, [userOwnedNFTs]);

	// State for NFT lists
	const [depositedNFTs, setDepositedNFTs] = useState<NFTWithCollection[]>([]);
	const [isLoadingWithdrawals, setIsLoadingWithdrawals] = useState(false);
	const [withdrawingNFT, setWithdrawingNFT] = useState<{collection: Address, tokenId: bigint} | null>(null);

	// Debug function to manually test withdrawal functionality
	const debugWithdrawal = useCallback(async () => {
		if (!treasury || !address) {
			console.log("🔍 [Vault] Debug: Missing treasury or address");
			console.log("🔍 [Vault] Debug info:", { treasury, address });
			return;
		}

		console.log("🐛 [Vault] Starting withdrawal debug...");
		console.log("🔍 [Vault] Debug info:", {
			treasury,
			address,
			gachaId,
			gachaConfig
		});

		try {
			// Test 1: Verify contract exists
			console.log("🔍 [Vault] Test 1: Verifying contract exists...");
			const code = await publicClient.getBytecode({ address: treasury });
			console.log("🔍 [Vault] Contract bytecode length:", code.length);
			console.log("🔍 [Vault] Contract exists:", code !== '0x');

			if (code === '0x') {
				console.error("❌ [Vault] No contract found at treasury address!");
				alert(`No contract found at treasury address: ${treasury}`);
				return;
			}

			// Test 2: Check if we can call the contract
			console.log("🔍 [Vault] Test 2: Checking contract connectivity...");
			const nfts = await getUserDepositedNFTs();
			console.log("📦 [Vault] Contract call successful, got NFTs:", nfts);

			// Test 3: Check individual NFT details
			if (nfts.length > 0) {
				console.log("🎯 [Vault] Test 3: Examining first NFT...");
				const firstNFT = nfts[0];
				console.log("First NFT details:", {
					collection: firstNFT.collection,
					tokenId: firstNFT.tokenId.toString(),
					depositor: firstNFT.depositor,
					appraisedPrice: firstNFT.appraisedPrice.toString(),
					currentRarity: firstNFT.currentRarity
				});

				// Alert the user that we found NFTs
				alert(`Found ${nfts.length} deposited NFT(s)! Check console for details.`);
			} else {
				console.log("📋 [Vault] No NFTs found - trying additional checks...");

				// Try some alternative approaches
				console.log("🔄 [Vault] Trying to understand the issue...");

				// Let's check if there are any other functions we can call
				try {
					const balance = await publicClient.readContract({
						address: treasury,
						abi: [
							{
								type: "function",
								name: "balanceOf",
								stateMutability: "view",
								inputs: [{ name: "account", type: "address" }],
								outputs: [{ name: "", type: "uint256" }],
							},
						],
						functionName: "balanceOf",
						args: [address],
					});
					console.log("💰 [Vault] User balance (if available):", balance.toString());
				} catch (_e) {
					console.log("ℹ️ [Vault] Balance function not available or failed");
				}

				alert(`No deposited NFTs found for address: ${address}. This could mean:\n\n1. You haven't deposited NFTs in this specific vault\n2. The NFTs are in a different contract\n3. The contract function name has changed\n\nCheck console for detailed debugging information.`);
			}

			// Test 4: Check if the withdrawal function exists
			console.log("🔍 [Vault] Test 4: Checking withdrawal function availability...");
			console.log("Withdraw function available:", typeof withdrawNFT);

		} catch (error) {
			console.error("❌ [Vault] Debug failed:", error);
			alert(`Debug failed: ${error instanceof Error ? error.message : 'Unknown error'}. Check console for details.`);
		}
	}, [treasury, address, publicClient, getUserDepositedNFTs, withdrawNFT, gachaId, gachaConfig]);

	// Load all deposited NFTs
	const loadDepositedNFTs = useCallback(async () => {
		if (!treasury || !address) {
			console.log("🔍 [Vault] No treasury or address available", { treasury, address });
			setDepositedNFTs([]);
			setIsLoadingWithdrawals(false);
			return;
		}

		setIsLoadingWithdrawals(true);
		console.log("🔍 [Vault] Loading deposited NFTs for:", { treasury, address });

		try {
			const nfts = await getUserDepositedNFTs();
			console.log("📦 [Vault] Individual NFTs from treasury:", nfts);

			if (nfts.length === 0) {
				console.log("📋 [Vault] No deposited NFTs found - checking if user has deposited at all");

				setDepositedNFTs([]);
				setIsLoadingWithdrawals(false);
				return;
			}

			// Group NFTs by collection for better organization
			const nftsWithCollections: NFTWithCollection[] = nfts.map(nft => ({
				...nft,
				collectionName: nft.collectionName || undefined, // Ensure proper type
			}));

			console.log("🎴 [Vault] Final deposited NFTs:", nftsWithCollections);
			setDepositedNFTs(nftsWithCollections);
		} catch (error) {
			console.error("❌ [Vault] Error loading deposited NFTs:", error);
			console.error("❌ [Vault] Error details:", {
				message: error instanceof Error ? error.message : 'Unknown error',
				cause: error instanceof Error ? error.cause : 'No cause available'
			});
			setDepositedNFTs([]);
		} finally {
			setIsLoadingWithdrawals(false);
		}
	}, [treasury, address, getUserDepositedNFTs]);

	// Load deposited NFTs on component mount
	React.useEffect(() => {
		loadDepositedNFTs();
	}, [loadDepositedNFTs]);

	// Load data on tab change
	React.useEffect(() => {
		if (activeTab !== "deposit") {
			// Reset deposit state when leaving deposit tab
			resetDeposit();
		}
	}, [activeTab, resetDeposit]);

	// Cleanup on unmount to reset any stuck states
	React.useEffect(() => {
		return () => {
			forceResetDeposit();
		};
	}, [forceResetDeposit]);

	// Handle yield claim
	const handleClaimYield = async () => {
		if (!address || !canClaim) return;

		try {
			await claimYield({
				address: gachaConfig?.depositorVaultAddress as `0x${string}`,
				args: [address as `0x${string}`, address as `0x${string}`],
			});

			toast.success("Yield claimed successfully!");

			// Refetch immediately and then again after a short delay to ensure UI updates
			refetchDepositorVault();
			setTimeout(() => {
				refetchDepositorVault();
			}, 2000);
		} catch (error) {
			console.error("Error claiming yield:", error);
			toast.error("Failed to claim yield");
		}
	};

	// Handle NFT withdrawal
	const handleWithdrawNFT = async (collection: Address, tokenId: bigint) => {
		if (!treasury) {
			toast.error("Treasury contract not available");
			return;
		}

		// Prevent double withdrawals
		if (withdrawingNFT?.collection === collection && withdrawingNFT?.tokenId === tokenId) {
			return;
		}

		// Set the specific NFT being withdrawn
		setWithdrawingNFT({ collection, tokenId });

		try {
			console.log(`🔄 [Vault] Withdrawing NFT: ${collection} #${tokenId.toString()}`);
			await withdrawNFT(collection, tokenId);
			toast.success("NFT withdrawal submitted successfully!");

			// Refetch after a delay to allow transaction to process
			setTimeout(() => {
				console.log("🔄 [Vault] Refetching deposited NFTs after withdrawal");
				loadDepositedNFTs();
				refetchDepositorVault();
			}, 3000); // Increased delay for transaction confirmation
		} catch (error) {
			console.error("Error withdrawing NFT:", error);
			const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
			toast.error(`Failed to withdraw NFT: ${errorMessage}`);
		} finally {
			// Clear the withdrawing NFT state after a reasonable delay
			setTimeout(() => {
				setWithdrawingNFT(null);
			}, 2000); // Increased delay to match refetch
		}
	};

	// Handle NFT deposit
	const handleDepositNFT = useCallback(async (collection: string, tokenId: string, hasAppraisal = false) => {
		const nftKey = `${collection}:${tokenId}`;

		try {
			await depositNFT(collection as `0x${string}`, BigInt(tokenId), {
				hasAppraisal,
			});

			// Set a timeout to ensure the loading state clears even if onSuccess doesn't fire
			setTimeout(() => {
				setDepositingNFTs(prev => {
					const newSet = new Set(prev);
					newSet.delete(nftKey);
					return newSet;
				});
			}, 3000); // 3 second timeout as safety net
		} catch (error) {
			console.error("Error depositing NFT:", error);
			toast.error("Failed to deposit NFT");
			// Clear all depositing NFTs on error
			setDepositingNFTs(new Set());
		}
	}, [depositNFT]);

	// Handle NFT actions (deposit vs get appraised)
	const handleNFTAction = useCallback(
		(collection: string, tokenId: string, hasAppraisal?: boolean) => {
			if (hasAppraisal) {
				const nftKey = `${collection}:${tokenId}`;

				// Check if the NFT interaction hook says this NFT is currently being deposited
				// This is more reliable than our manual tracking
				if (isNFTDepositing(collection, tokenId)) {
					return; // Already depositing, skip
				}

				// Add to depositing set for UI feedback
				setDepositingNFTs(prev => new Set(prev).add(nftKey));

				// Deposit the NFT
				handleDepositNFT(collection, tokenId, true);
			} else {
				// Redirect to appraisal page
				const appraisalUrl = `/appraisal?collection=${encodeURIComponent(
					collection,
				)}&tokenId=${encodeURIComponent(tokenId)}`;
				window.location.href = appraisalUrl;
			}
		},
		[isNFTDepositing, handleDepositNFT],
	);

	// Calculate total deposited NFTs
	const totalDepositedNFTs = useMemo(() => {
		return depositedNFTs.length;
	}, [depositedNFTs]);

	// Group NFTs by collection for better organization
	const nftsByCollection = useMemo(() => {
		const grouped = new Map<string, NFTWithCollection[]>();

		depositedNFTs.forEach(nft => {
			const collectionKey = nft.collection.toLowerCase();
			if (!grouped.has(collectionKey)) {
				grouped.set(collectionKey, []);
			}
			grouped.get(collectionKey)?.push(nft);
		});

		return grouped;
	}, [depositedNFTs]);

	// Tab configuration
	const tabs = [
		{ id: "deposit", label: "Deposit NFTs", icon: ArrowUpTrayIcon },
		{ id: "withdraw", label: "Withdraw NFTs", icon: ArrowDownTrayIcon },
		{ id: "yield", label: "Yield", icon: BanknotesIcon },
	] as const;


	if (!address) {
		return (
			<GlassCard className="text-center p-8">
				<WalletIcon className="w-16 h-16 mx-auto mb-4 text-foreground/50" />
				<h3 className="text-xl font-medium text-foreground mb-2">Connect Your Wallet</h3>
				<p className="text-foreground/70">Please connect your wallet to view your vault.</p>
			</GlassCard>
		);
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
			{/* Balance Overview */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
				<div className="bg-content1/30 rounded-xl p-4 border border-white/10">
					<div className="flex items-center gap-3">
						<div className="p-2 rounded-lg bg-primary/20">
							<BanknotesIcon className="w-6 h-6 text-primary" />
						</div>
						<div>
							<p className="text-sm text-foreground/60">Pending Yield</p>
							<p className="text-xl font-semibold text-foreground">
								{depositorUserData?.pendingYield
									? formatTokenAmount(depositorUserData.pendingYield, 6)
									: "0.000000"} USDC
							</p>
						</div>
					</div>
					{canClaim && (
						<GlassButton
							className="mt-3 w-full"
							color="primary"
							onPress={handleClaimYield}
							isLoading={isClaiming}
						>
							Claim Yield
						</GlassButton>
					)}
				</div>

				<div className="bg-content1/30 rounded-xl p-4 border border-white/10">
					<div className="flex items-center gap-3">
						<div className="p-2 rounded-lg bg-success/20">
							<GiftIcon className="w-6 h-6 text-success" />
						</div>
						<div>
							<p className="text-sm text-foreground/60">Deposited NFTs</p>
							<p className="text-xl font-semibold text-foreground">
								{totalDepositedNFTs} NFTs
							</p>
						</div>
					</div>
				</div>

				<div className="bg-content1/30 rounded-xl p-4 border border-white/10">
					<div className="flex items-center gap-3">
						<div className="p-2 rounded-lg bg-warning/20">
							<ChartBarIcon className="w-6 h-6 text-warning" />
						</div>
						<div>
							<p className="text-sm text-foreground/60">Total Earned</p>
							<p className="text-xl font-semibold text-foreground">
								{depositorUserData?.yieldValue
									? formatTokenAmount(depositorUserData.yieldValue, 6)
									: "0.000000"} USDC
							</p>
						</div>
					</div>
					<p className="text-sm text-foreground/60 mt-2">
						lifetime yield earnings
					</p>
				</div>
			</div>

			{/* Tab Navigation */}
			<div className="flex flex-wrap gap-2 p-1 bg-content1/20 rounded-xl">
				{tabs.map((tab) => (
					<Button
						key={tab.id}
						variant={activeTab === tab.id ? "solid" : "light"}
						className={`flex-1 min-w-[120px] justify-center gap-2 rounded-lg ${activeTab === tab.id
							? "bg-gradient-to-r from-warning to-orange-400 text-black hover:!from-warning hover:!to-orange-400 hover:!text-black"
							: "text-foreground/70 hover:text-foreground hover:bg-content1/30"
							}`}
						onPress={() => setActiveTab(tab.id)}
					>
						<tab.icon className="w-4 h-4" />
						{tab.label}
					</Button>
				))}
			</div>

			{/* Tab Content */}
			<motion.div
				key={activeTab}
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.2 }}
				className="mt-6"
			>
				{activeTab === "deposit" && (
					<div>
						<h3 className="text-xl font-semibold text-foreground mb-4">Deposit NFTs</h3>
						{userOwnedNFTs.length === 0 ? (
							<div className="text-center py-12">
								<ArrowUpTrayIcon className="w-16 h-16 mx-auto mb-4 text-foreground/30" />
								<h4 className="text-lg font-medium text-foreground mb-2">No Eligible NFTs</h4>
								<p className="text-foreground/60">
									You don't own any NFTs from whitelisted collections.
								</p>
							</div>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
								{sortedUserOwnedNFTs.map((nft) => {
									const nftKey = `${nft.collection.toLowerCase()}:${nft.tokenId.toString()}`;
									const hasAppraisal = appraisedNFTs.has(nftKey);
									const appraiseInfo = appraisalData.get(nftKey);

									return (
										<div key={nftKey} className="bg-content1/30 rounded-xl p-4 border border-white/10 flex flex-col h-full">
											<div className="flex-1">
												<UnifiedNFTCard
													collection={nft.collection}
													tokenId={nft.tokenId.toString()}
													appraisalContractAddress={appraisal || "0x0000000000000000000000000000000000000000"}
													variant="detailed"
													size="md"
													showAppraisal={true}
													{...(appraiseInfo && {
														appraisalOverride: {
															hasAppraisal: appraiseInfo.hasAppraisal,
															priceUSD: appraiseInfo.priceUSD
														}
													})}
												/>
											</div>
											<div className="mt-4 pt-2">
												{hasAppraisal ? (
													<Button
														variant="solid"
														onPress={() => handleNFTAction(nft.collection, nft.tokenId.toString(), true)}
														disabled={depositingNFTs.has(`${nft.collection}:${nft.tokenId.toString()}`) || isNFTDepositing(nft.collection, nft.tokenId.toString())}
														isLoading={depositingNFTs.has(`${nft.collection}:${nft.tokenId.toString()}`) || isNFTDepositing(nft.collection, nft.tokenId.toString())}
														className="relative bg-gradient-to-r from-warning via-warning/90 to-orange-400 text-black font-bold border-2 border-warning/40 shadow-2xl shadow-warning/30 backdrop-blur-xl transition-all duration-300 hover:shadow-3xl hover:shadow-warning/40 hover:border-warning/60 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-2xl disabled:hover:border-warning/40 rounded-2xl px-6 py-3 w-full"
														startContent={<ArrowUpTrayIcon className="w-4 h-4" />}
													>
														Deposit NFT
													</Button>
												) : (
													<GlassButton
														color="warning"
														size="sm"
														onPress={() => handleNFTAction(nft.collection, nft.tokenId.toString(), false)}
														className="w-full"
														startContent={<SparklesIcon className="w-4 h-4" />}
													>
														Get Appraised
													</GlassButton>
												)}
											</div>
										</div>
									);
								})}
							</div>
						)}
					</div>
				)}

				{activeTab === "withdraw" && (
					<div>
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-xl font-semibold text-foreground">Withdraw NFTs</h3>
							{/* Debug button for development */}
							{process.env.NODE_ENV === 'development' && (
								<Button
									variant="light"
									size="sm"
									onPress={debugWithdrawal}
									className="text-xs"
								>
									🐛 Debug Withdrawal
								</Button>
							)}
						</div>
						{isLoadingWithdrawals ? (
							<div className="text-center py-12">
								<ArrowPathIcon className="w-16 h-16 mx-auto mb-4 text-foreground/30 animate-spin" />
								<p className="text-foreground/60">Loading your deposited NFTs...</p>
							</div>
						) : depositedNFTs.length === 0 ? (
							<div className="text-center py-12">
								<ArrowDownTrayIcon className="w-16 h-16 mx-auto mb-4 text-foreground/30" />
								<h4 className="text-lg font-medium text-foreground mb-2">No Deposited NFTs</h4>
								<p className="text-foreground/60 mb-6">
									{isLoadingWithdrawals
										? "Checking for your deposited NFTs..."
										: "No NFTs found in your vault deposits."
									}
								</p>
								<div className="space-y-4">
									{/* Debug information panel */}
									<div className="bg-content2/20 rounded-lg p-4 border border-white/10 text-left">
										<h5 className="font-medium text-foreground mb-2 flex items-center gap-2">
											<SparklesIcon className="w-4 h-4" />
											Debug Information
										</h5>
										<div className="text-xs text-foreground/70 space-y-1 font-mono">
											<div>Treasury: {treasury ? `${treasury.slice(0, 8)}...${treasury.slice(-6)}` : 'Not available'}</div>
											<div>Your Address: {address ? `${address.slice(0, 8)}...${address.slice(-6)}` : 'Not connected'}</div>
											<div>Gacha ID: {gachaId || 'Not available'}</div>
											{process.env.NODE_ENV === 'development' && (
												<div className="mt-2 pt-2 border-t border-white/10">
													<div>🔍 Click the debug button above for detailed analysis</div>
												</div>
											)}
										</div>
									</div>

									<div className="bg-content2/20 rounded-lg p-4 border border-white/10">
										<h5 className="font-medium text-foreground mb-2">How to deposit NFTs:</h5>
										<ol className="text-sm text-foreground/70 text-left space-y-1">
											<li>1. Switch to the "Deposit NFTs" tab</li>
											<li>2. Get your NFTs appraised (if not already)</li>
											<li>3. Deposit appraised NFTs to start earning yield</li>
											<li>4. Return here to withdraw them anytime</li>
										</ol>
									</div>
									<Button
										variant="light"
										onPress={() => setActiveTab("deposit")}
										className="rounded-xl bg-content2/20 hover:bg-content2/30"
									>
										Go to Deposit NFTs
									</Button>
								</div>
							</div>
						) : (
							<div className="space-y-6">
								{/* Summary Section */}
								<div className="bg-content2/20 rounded-xl p-4 border border-white/10">
									<div className="flex items-center justify-between">
										<div>
											<h3 className="font-semibold text-foreground mb-1">Your Vault Inventory</h3>
											<p className="text-sm text-foreground/70">
												{nftsByCollection.size} collection{nftsByCollection.size !== 1 ? 's' : ''} with {totalDepositedNFTs} total NFT{totalDepositedNFTs !== 1 ? 's' : ''} deposited
											</p>
										</div>
										<div className="text-right">
											<div className="text-2xl font-bold text-primary">
												{totalDepositedNFTs}
											</div>
											<div className="text-sm text-foreground/60">Total Deposits</div>
										</div>
									</div>
								</div>

								{/* NFTs grouped by Collection */}
								{Array.from(nftsByCollection.entries()).map(([collectionAddress, nfts], collectionIndex) => (
									<motion.div
										key={collectionAddress}
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.4, delay: collectionIndex * 0.1 }}
									>
										<div className="bg-content1/30 rounded-xl p-6 border border-white/10">
											{/* Collection Header */}
											<div className="flex items-center justify-between mb-4">
												<div className="flex items-center gap-3">
													<div className="p-2 rounded-lg bg-primary/20">
														<GiftIcon className="w-6 h-6 text-primary" />
													</div>
													<div>
														<h4 className="font-semibold text-foreground">Collection</h4>
														<p className="text-sm text-foreground/70 font-mono">
															{collectionAddress.slice(0, 8)}...{collectionAddress.slice(-6)}
														</p>
													</div>
												</div>
												<div className="text-right">
													<p className="text-sm text-foreground/60">NFTs in Collection</p>
													<p className="font-semibold text-foreground">
														{nfts.length} NFT{nfts.length !== 1 ? 's' : ''}
													</p>
												</div>
											</div>

											{/* Individual NFTs in this collection */}
											<div className="space-y-2">
												<p className="text-sm text-foreground/70 mb-3">
													Individual NFTs ({nfts.length}):
												</p>
												<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
													{nfts.map((nft) => {
														const isWithdrawingThisNFT = withdrawingNFT?.collection === nft.collection && withdrawingNFT?.tokenId === nft.tokenId;
														const nftKey = `${nft.collection}:${nft.tokenId.toString()}`;
														const rarityEmojis = ['⚪', '🟢', '🔵', '🟣', '🟡']; // Common, Uncommon, Rare, Epic, Legendary
														const rarityEmoji = rarityEmojis[nft.currentRarity] || '⚪';

														return (
															<div key={nftKey} className="bg-content2/10 rounded-lg p-4 border border-white/5">
																<div className="flex flex-col h-full">
																	{/* NFT Header */}
																	<div className="flex items-center justify-between mb-3">
																		<div className="flex items-center gap-2">
																			<span className="text-lg">{rarityEmoji}</span>
																			<p className="text-sm font-mono bg-content2/20 px-2 py-1 rounded">
																				Token #{nft.tokenId.toString()}
																			</p>
																		</div>
																	</div>

																	{/* NFT Details */}
																	<div className="flex-1 space-y-2 mb-4">
																		<div className="flex items-center gap-2">
																			<p className="text-xs text-foreground/60">Collection:</p>
																			<p className="text-xs font-mono text-foreground/80">
																				{nft.collection.slice(0, 6)}...{nft.collection.slice(-4)}
																			</p>
																		</div>
																		<div className="flex items-center gap-2">
																			<p className="text-xs text-foreground/60">Value:</p>
																			<p className="text-xs font-semibold text-success">
																				{formatCurrency(nft.appraisedPrice.toString(), 18, "USD")}
																			</p>
																		</div>
																		<div className="flex items-center gap-2">
																			<p className="text-xs text-foreground/60">Rarity:</p>
																			<p className="text-xs font-semibold text-foreground">
																				{['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'][nft.currentRarity] || 'Unknown'}
																			</p>
																		</div>
																	</div>

																	{/* Withdraw Button */}
																	<GlassButton
																		size="sm"
																		color="glass"
																		onPress={() => handleWithdrawNFT(nft.collection, nft.tokenId)}
																		isLoading={isWithdrawingThisNFT}
																		isDisabled={isWithdrawingThisNFT}
																		className="w-full transition-all duration-300"
																	>
																		<ArrowDownTrayIcon className={`w-4 h-4 ${isWithdrawingThisNFT ? 'animate-bounce' : ''}`} />
																		{isWithdrawingThisNFT ? "Withdrawing..." : "Withdraw"}
																	</GlassButton>
																</div>
															</div>
														);
													})}
												</div>
											</div>
										</div>
									</motion.div>
								))}

								{/* Information Section */}
								<div className="mt-8 p-4 bg-content2/20 rounded-lg border border-white/10">
									<h3 className="font-semibold text-foreground mb-2">About NFT Withdrawals</h3>
									<ul className="text-sm text-foreground/70 space-y-1">
										<li>• You can withdraw any individual NFT you have deposited</li>
										<li>• NFTs currently being used in gacha spins cannot be withdrawn</li>
										<li>• Withdrawals transfer the NFT back to your wallet immediately</li>
										<li>• Gas fees apply for withdrawal transactions</li>
										<li>• Your yield earnings will remain available to claim separately</li>
									</ul>
								</div>
							</div>
						)}
					</div>
				)}

				{activeTab === "yield" && (
					<div>
						<h3 className="text-xl font-semibold text-foreground mb-4">Yield Information</h3>
						<div className="space-y-4">
							<div className="bg-content1/30 rounded-xl p-4 border border-white/10">
								<h4 className="font-medium text-foreground mb-3">Yield Summary</h4>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<p className="text-sm text-foreground/60">Pending Yield</p>
										<p className="text-lg font-semibold text-success">
											{depositorUserData?.pendingYield
												? formatTokenAmount(depositorUserData.pendingYield, 6)
												: "0.000000"} USDC
										</p>
									</div>
									<div>
										<p className="text-sm text-foreground/60">Total Earned</p>
										<p className="text-lg font-semibold text-foreground">
											{depositorUserData?.yieldValue
												? formatTokenAmount(depositorUserData.yieldValue, 6)
												: "0.000000"} USDC
										</p>
									</div>
								</div>
							</div>

							<div className="bg-content1/30 rounded-xl p-4 border border-white/10">
								<h4 className="font-medium text-foreground mb-3">Your Position</h4>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<div>
										<p className="text-sm text-foreground/60">Your Shares</p>
										<p className="text-lg font-semibold text-foreground">
											{depositorUserData?.shares?.toString() || "0"}
										</p>
									</div>
									<div>
										<p className="text-sm text-foreground/60">Total Vault Shares</p>
										<p className="text-lg font-semibold text-foreground">
											{depositorData?.totalShares?.toString() || "0"}
										</p>
									</div>
									<div>
										<p className="text-sm text-foreground/60">Share Ownership</p>
										<p className="text-lg font-semibold text-primary">
											{calculateUserSharePercentage(depositorUserData?.shares, depositorData?.totalShares)}
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}
			</motion.div>
		</GachaSectionLayout>
	);
}
