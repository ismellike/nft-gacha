"use client";

import React, { useState } from "react";
import { useAccount } from "wagmi";
import type { Hex } from "viem";
import { GlassCard } from "@/ui/Card";
import { TokenAmountDisplay } from "./TokenDisplay";
import { Skeleton } from "./SkeletonLoader";
import {
	useDepositorVaultData,
	calculateUserSharePercentage,
	formatTokenAmount,
	useClaimYield,
	useSimulateClaimYield,
} from "@/hooks/useDepositorVault";
import {
	useTreasuryUserCards,
	type UserCardDeposit,
} from "@/hooks/useTreasuryUserCards";
import { useRarityTracker, type CardAppraisalInfo } from "@/hooks/useRarityTracker";
import { useNFTWithdrawal } from "@/hooks/useNFTWithdrawal";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { toast } from "react-hot-toast";
import {
	BanknotesIcon,
	ArrowPathIcon,
	ArrowDownTrayIcon,
	GiftIcon
} from "@heroicons/react/24/outline";
import { useGachaId } from "@/hooks/useGachaId";
import { useGachaContracts } from "@/hooks/useGachaContracts";
import { getRarityConfig } from "@/lib/rarityConfig";
import type { GachaConfig } from "@/lib/gacha-config/types";
import { useRegisterRewardsRefetch } from "@/hooks/useRewardsData";

interface VaultTabProps {
	gachaConfig: GachaConfig;
}

interface WithdrawableCard extends UserCardDeposit {
	cardId: Hex;
	appraisalInfo: CardAppraisalInfo | null;
}

export function VaultTab({ gachaConfig }: VaultTabProps) {
	const { address } = useAccount();
	const gachaId = useGachaId();
	const contracts = useGachaContracts(gachaId);

	// Depositor Vault data
	const depositorVaultProps: any = {
		contractAddress: gachaConfig.depositorVaultAddress,
	};
	if (address) {
		depositorVaultProps.userAddress = address;
	}
	const {
		data: depositorData,
		userData: depositorUserData,
		isLoading: depositorLoading,
		refetch: refetchDepositorVault,
	} = useDepositorVaultData(depositorVaultProps);

	// Claim yield functionality
	const { claimYield, isClaiming, claimError } = useClaimYield();

	const { canClaim } = useSimulateClaimYield({
		contractAddress: gachaConfig.depositorVaultAddress,
		account: address || "",
		recipient: address || "",
	});

	const handleClaimYield = async () => {
		if (!address) {
			toast.error("Please connect your wallet");
			return;
		}

		if (!canClaim) {
			toast.error("Cannot claim yield at this time");
			return;
		}

		try {
			await claimYield({
				address: gachaConfig.depositorVaultAddress as `0x${string}`,
				args: [address as `0x${string}`, address as `0x${string}`],
			});

			toast.success("Yield claimed successfully!");
			refetchDepositorVault();
		} catch (error) {
			console.error("Error claiming yield:", error);
			toast.error("Failed to claim yield");
		}
	};

	// Register refetch function with the rewards system
	useRegisterRewardsRefetch("depositorVault", refetchDepositorVault);

	// NFT Withdrawal functionality
	const treasury = contracts.treasury as `0x${string}` | undefined;
	const rarityTracker = contracts.trackers?.common as `0x${string}` | undefined;
	const { getAllUserCardDeposits } = useTreasuryUserCards(treasury);
	const { getBatchCardInfo } = useRarityTracker(rarityTracker);
	const { withdrawNFT, isPending: isWithdrawing } = useNFTWithdrawal(treasury);

	const [withdrawableCards, setWithdrawableCards] = useState<WithdrawableCard[]>([]);
	const [isLoadingWithdrawals, setIsLoadingWithdrawals] = useState(true);

	// Load withdrawable cards
	const loadWithdrawableCards = React.useCallback(async () => {
			if (!treasury || !rarityTracker || !address) {
				setWithdrawableCards([]);
				setIsLoadingWithdrawals(false);
				return;
			}

			setIsLoadingWithdrawals(true);
			try {
				const deposits = await getAllUserCardDeposits();

				if (deposits.length === 0) {
					setWithdrawableCards([]);
					setIsLoadingWithdrawals(false);
					return;
				}

				const cardIds = deposits.map(d => d.cardId);
				const appraisalInfos = await getBatchCardInfo(cardIds);

				const cards: WithdrawableCard[] = deposits.map((deposit, index) => ({
					...deposit,
					appraisalInfo: appraisalInfos[index] || null,
				}));

				setWithdrawableCards(cards);
			} catch (error) {
				console.error("Error loading withdrawable cards:", error);
				setWithdrawableCards([]);
			} finally {
				setIsLoadingWithdrawals(false);
			}
		}, [treasury, rarityTracker, address, getAllUserCardDeposits, getBatchCardInfo]);

	React.useEffect(() => {
		loadWithdrawableCards();
	}, [loadWithdrawableCards]);

	const handleWithdrawNFT = async (cardId: string, depositCount: bigint) => {
		if (!treasury) return;

		try {
			await withdrawNFT(cardId as `0x${string}`, depositCount);
			toast.success("NFT withdrawal successful!");

			// Reload the data
			loadWithdrawableCards();
			refetchDepositorVault();
		} catch (error) {
			console.error("Error withdrawing NFT:", error);
			toast.error("Failed to withdraw NFT");
		}
	};

	const formatUSD = (amount: bigint) => {
		return formatTokenAmount(amount, 6, {
			maxDecimals: 2,
			minDecimals: 2,
			suffix: " USD",
		});
	};

	if (depositorLoading) {
		return (
			<div className="space-y-6">
				{[
					{ id: "vault-info-skeleton" },
					{ id: "user-shares-skeleton" },
					{ id: "yield-info-skeleton" },
				].map((skeleton) => (
					<GlassCard key={skeleton.id} className="p-6">
						<Skeleton className="h-4 w-3/4 mb-4" />
						<Skeleton className="h-8 w-1/2 mb-2" />
						<Skeleton className="h-3 w-full" />
					</GlassCard>
				))}
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Vault Overview */}
			<GlassCard className="p-6">
				<div className="flex justify-between items-center mb-6">
					<h3 className="text-xl font-bold text-white">Depositor Vault</h3>
					<div className="flex items-center gap-3">
						<div className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">
							Active
						</div>
						<Button
							size="sm"
							onPress={refetchDepositorVault}
							className="rounded-lg bg-content2 hover:bg-content3"
						>
							<ArrowPathIcon className="w-4 h-4" />
						</Button>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
					<Card className="p-4 text-center">
						<div className="text-3xl mb-2">🏦</div>
						<div className="text-sm text-gray-400 mb-1">Total Shares</div>
						<div className="text-2xl font-bold text-blue-400">
							{formatTokenAmount(depositorData.totalShares)}
						</div>
					</Card>

					<Card className="p-4 text-center">
						<div className="text-3xl mb-2">👤</div>
						<div className="text-sm text-gray-400 mb-1">Your Shares</div>
						<div className="text-2xl font-bold text-purple-400">
							{formatTokenAmount(depositorUserData.shares)}
						</div>
					</Card>
				</div>

				<Card className="p-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
					<div className="flex justify-between items-center">
						<span className="text-gray-300">Your Share Percentage</span>
						<span className="text-xl font-bold text-white">
							{calculateUserSharePercentage(
								depositorUserData.shares || 0n,
								depositorData.totalShares || 0n,
							)}
						</span>
					</div>
				</Card>
			</GlassCard>

			{/* Yield Information */}
			<GlassCard className="p-6">
				<div className="flex justify-between items-center mb-6">
					<h3 className="text-xl font-bold text-white">Yield Information</h3>
					<div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2">
						<BanknotesIcon className="w-5 h-5 text-success" />
						<div className="text-right">
							<div className="text-sm font-bold text-foreground">
								<TokenAmountDisplay
									amount={depositorUserData.pendingYield}
									showUsd={true}
								/>
							</div>
							<div className="text-xs text-foreground/60">Pending Yield</div>
						</div>
					</div>
				</div>

				<div className="space-y-4">
					<div className="flex justify-between">
						<span className="text-gray-400">Pending Yield</span>
						<span className="text-green-400 font-medium">
							<TokenAmountDisplay
								amount={depositorUserData.pendingYield}
								showUsd={true}
							/>
						</span>
					</div>

					<div className="flex justify-between">
						<span className="text-gray-400">Est. Total Yield</span>
						<span className="text-green-400 font-medium">
							<TokenAmountDisplay
								amount={depositorUserData.yieldValue}
								showUsd={true}
							/>
						</span>
					</div>

					<div className="flex justify-between">
						<span className="text-gray-400">Total Yield Distributed</span>
						<span className="text-blue-400 font-medium">
							<TokenAmountDisplay
								amount={depositorData.totalYieldDistributed}
								showUsd={true}
							/>
						</span>
					</div>

					<div className="flex justify-between">
						<span className="text-gray-400">Total Yield Claimed</span>
						<span className="text-purple-400 font-medium">
							<TokenAmountDisplay
								amount={depositorData.totalYieldClaimed}
								showUsd={true}
							/>
						</span>
					</div>
				</div>

				{/* Claim Yield Button */}
				{address && (
					<div className="mt-6 pt-4 border-t border-white/10">
						<Button
							onClick={handleClaimYield}
							disabled={
								!depositorUserData.pendingYield ||
								depositorUserData.pendingYield <= 0n ||
								isClaiming
							}
							className="w-full h-12 font-semibold rounded-xl bg-gradient-to-r from-success to-emerald-500 hover:from-success/90 hover:to-emerald-500/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
						>
							{isClaiming ? (
								<span className="flex items-center justify-center gap-2">
									<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
									Claiming...
								</span>
							) : depositorUserData.pendingYield &&
							  depositorUserData.pendingYield > 0n ? (
								`Claim ${formatTokenAmount(depositorUserData.pendingYield)} USDC`
							) : (
								"No Yield Available"
							)}
						</Button>

						{claimError && (
							<p className="text-red-400 text-sm mt-2 text-center">
								{claimError.message}
							</p>
						)}
					</div>
				)}
			</GlassCard>

			{/* NFT Withdrawal Section */}
			<GlassCard className="p-6">
				<div className="flex justify-between items-center mb-6">
					<h3 className="text-xl font-bold text-white">NFT Withdrawals</h3>
					<div className="flex items-center gap-3">
						<div className="px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full text-sm">
							{withdrawableCards.length} Available
						</div>
						<Button
							size="sm"
							onClick={() => loadWithdrawableCards()}
							className="rounded-lg bg-content2 hover:bg-content3"
						>
							<ArrowPathIcon className="w-4 h-4" />
						</Button>
					</div>
				</div>

				{isLoadingWithdrawals ? (
					<div className="space-y-4">
						{Array.from({ length: 3 }).map((_, i) => (
							<div key={i} className="p-4 bg-white/5 backdrop-blur-md border border-white/20 rounded-xl">
								<div className="flex items-center gap-4">
									<div className="w-16 h-16 bg-white/10 rounded-lg animate-pulse" />
									<div className="flex-1 space-y-2">
										<div className="h-4 bg-white/10 rounded animate-pulse w-1/3" />
										<div className="h-3 bg-white/10 rounded animate-pulse w-1/2" />
										<div className="h-3 bg-white/10 rounded animate-pulse w-1/4" />
									</div>
									<div className="w-24 h-8 bg-white/10 rounded animate-pulse" />
								</div>
							</div>
						))}
					</div>
				) : withdrawableCards.length === 0 ? (
					<div className="text-center py-8">
						<GiftIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
						<p className="text-gray-400">No NFTs available for withdrawal</p>
						<p className="text-gray-500 text-sm mt-2">
							Deposit NFTs into the treasury to see them here
						</p>
					</div>
				) : (
					<div className="space-y-4">
						{withdrawableCards.map((card) => {
							const appraisalInfo = card.appraisalInfo;
							const rarityConfig = appraisalInfo
								? getRarityConfig(appraisalInfo.currentRarity)
								: null;

							return (
								<div
									key={card.cardId}
									className="p-4 bg-white/5 backdrop-blur-md border border-white/20 rounded-xl"
								>
									<div className="flex items-center gap-4">
										<div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
											<span className="text-2xl">
												{rarityConfig?.emoji || "🎴"}
											</span>
										</div>
										<div className="flex-1">
											<h4 className="text-white font-medium text-sm mb-1">
												Card #{card.cardId.slice(2, 10).toUpperCase()}
											</h4>
											<div className="flex items-center gap-4 text-xs text-gray-400">
												<span>Deposited: {card.depositCount.toString()}</span>
												{rarityConfig && (
													<span className={`px-2 py-1 rounded-full ${rarityConfig.textColor} ${rarityConfig.borderColor} border`}>
														{rarityConfig.name}
													</span>
												)}
												{appraisalInfo && (
													<span>Value: {formatUSD(appraisalInfo.appraisedValueUsd)}</span>
												)}
											</div>
										</div>
										<Button
											size="sm"
											isLoading={isWithdrawing}
											onClick={() => handleWithdrawNFT(card.cardId, card.depositCount)}
											className="rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white flex items-center gap-2"
										>
											<ArrowDownTrayIcon className="w-3 h-3" />
											Withdraw
										</Button>
									</div>
								</div>
							);
						})}
					</div>
				)}
			</GlassCard>
		</div>
	);
}