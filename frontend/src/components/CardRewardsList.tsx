"use client";

import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import type { Address } from "viem";
import { Card, Button } from "../ui";
import {
	BanknotesIcon,
	ArrowPathIcon,
	TrophyIcon,
} from "@heroicons/react/24/outline";
import { cn, glassTypography } from "../lib/theme-config";
import { Rarity, getRarityConfig, rarityFromNumber } from "../lib/rarityConfig";
import { useGachaId } from "../hooks/useGachaId";
import { useGachaContracts } from "../hooks/useGachaContracts";
import { formatTokenAmount } from "../lib/utils";
import {
	useTreasuryUserCards,
	type UserCardDeposit,
} from "../hooks/useTreasuryUserCards";
import {
	useRarityTracker,
	type CardAppraisalInfo,
} from "../hooks/useRarityTracker";
import { useAccount } from "wagmi";
import { useRegisterRewardsRefetch } from "../hooks/useRewardsData";
import {
	useBatchCardAppraisal,
	type CardAppraisal,
} from "../hooks/useBatchCardAppraisal";
import { NFTCard } from "./NFTCard";

interface CardInventoryInfo extends UserCardDeposit {
	appraisalInfo: CardAppraisalInfo | null;
	appraisal: CardAppraisal | null;
	userValueUsd: bigint;
	isLoadingValue: boolean;
}

type DetailItem = { label: string; value: string; highlight?: boolean };

export function CardRewardsList() {
	const gachaId = useGachaId();
	const contracts = useGachaContracts(gachaId);
	const treasury = contracts.treasury as Address | undefined;
	const rarityTracker = contracts.trackers?.common as Address | undefined;
	const { getAllUserCardDeposits } = useTreasuryUserCards(treasury);
	const { getBatchCardInfo, getBatchUserCardValues } =
		useRarityTracker(rarityTracker);
	const { address: user } = useAccount();
	const { fetchCardAppraisals } = useBatchCardAppraisal(
		contracts.appraisal as Address | undefined,
	);
	const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

	const [cards, setCards] = useState<CardInventoryInfo[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [currentPage, setCurrentPage] = useState(0);
	const pageSize = 12;
	const hasLoadedRef = useRef(false);
	const lastUserRef = useRef<string | null>(null);

	// Register treasury cards refetch function
	useRegisterRewardsRefetch("treasuryCards", async () => {
		// Force reload of user cards
		setCards([]);
		hasLoadedRef.current = false;
	});

	// Format USD values
	const formatUSD = (amount: bigint) => {
		return formatTokenAmount(amount, 6, {
			maxDecimals: 2,
			minDecimals: 2,
			suffix: " USD",
		});
	};

	const paginatedCards = useMemo(() => {
		const start = currentPage * pageSize;
		return cards.slice(start, start + pageSize);
	}, [cards, currentPage]);

	const totalPages = useMemo(() => {
		return Math.ceil(cards.length / pageSize);
	}, [cards.length]);

	// Note: auto-fetch moved below after fetchClaimable is defined

	useEffect(() => {
		console.log("[CardRewardsList] mount/useEffect deps", {
			hasTreasury: !!treasury,
			hasRarityTracker: !!rarityTracker,
			hasUser: !!user,
		});
		if (!treasury || !rarityTracker || !user) {
			hasLoadedRef.current = false;
			return;
		}

		// Reset loading state if user changed
		if (lastUserRef.current !== user) {
			hasLoadedRef.current = false;
			lastUserRef.current = user;
		}

		// Prevent duplicate loading
		if (hasLoadedRef.current) return;

		const loadUserCards = async () => {
			console.log("[CardRewardsList] loadUserCards start", {
				treasury,
				rarityTracker,
				user,
			});
			hasLoadedRef.current = true;
			setIsLoading(true);
			try {
				// Load all user's card deposits from Treasury
				const deposits = await getAllUserCardDeposits();
				console.log("[CardRewardsList] deposits loaded", {
					count: deposits.length,
					sample: deposits.slice(0, 5),
				});

				if (deposits.length === 0) {
					setCards([]);
					setIsLoading(false);
					return;
				}

				const cardIds = deposits.map((d) => d.cardId);

				// Fetch card appraisal info from RarityTracker
				const appraisalInfos = await getBatchCardInfo(cardIds);
				console.log("[CardRewardsList] appraisalInfos loaded", {
					count: appraisalInfos.length,
					sample: appraisalInfos.slice(0, 3),
				});

				// Fetch user's specific values for each card
				const userValues = await getBatchUserCardValues(cardIds);
				console.log("[CardRewardsList] userValues loaded", {
					count: userValues.length,
					sample: userValues.slice(0, 3),
				});

				// Build card inventory info list
				const appraisalMap = await fetchCardAppraisals(cardIds);
				console.log("[CardRewardsList] appraisalMap loaded", {
					cardCount: Object.keys(appraisalMap).length,
				});

				const cardInventoryInfos: CardInventoryInfo[] = deposits.map(
					(deposit) => {
						const appraisalInfo =
							appraisalInfos.find((info) => info.cardId === deposit.cardId) ||
							null;
						const userValue =
							userValues.find((value) => value.cardId === deposit.cardId)
								?.valueUsd || 0n;
						const cardAppraisal = appraisalMap?.[deposit.cardId] ?? null;

						return {
							...deposit,
							appraisalInfo,
							appraisal: cardAppraisal,
							userValueUsd: userValue,
							isLoadingValue: false,
						};
					},
				);

				setCards(cardInventoryInfos);
				console.log("[CardRewardsList] cardInventoryInfos built", {
					count: cardInventoryInfos.length,
					sample: cardInventoryInfos.slice(0, 3),
				});
			} catch (error) {
				console.error("Failed to load user cards:", error);
			} finally {
				setIsLoading(false);
			}
		};

		loadUserCards().catch((error) => {
			console.error("Error in loadUserCards:", error);
			setIsLoading(false);
			hasLoadedRef.current = false;
		});
	}, [
		treasury,
		rarityTracker,
		user,
		getAllUserCardDeposits,
		getBatchCardInfo,
		getBatchUserCardValues,
		fetchCardAppraisals,
	]);

	// Calculate total inventory value
	const totalInventoryValue = useMemo(
		() => cards.reduce((sum, c) => sum + c.userValueUsd, 0n),
		[cards],
	);

	const refreshInventory = useCallback(() => {
		setCards([]);
		hasLoadedRef.current = false;
	}, []);

	if (isLoading) {
		return (
			<Card className="p-6 bg-content1/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl">
				<div className="space-y-4">
					<div className="h-6 w-40 bg-white/10 rounded animate-pulse" />
					<div className="grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
						{Array.from({ length: pageSize }).map((_, i) => (
							<div
								key={`skeleton-${currentPage}-${pageSize}-${i * 13}`}
								className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-4"
							>
								<div className="h-40 w-full bg-white/10 rounded-xl animate-pulse mb-3" />
								<div className="h-4 w-2/3 bg-white/10 rounded animate-pulse mb-2" />
								<div className="h-4 w-1/2 bg-white/10 rounded animate-pulse" />
							</div>
						))}
					</div>
				</div>
			</Card>
		);
	}

	return (
		<Card className="p-6 bg-content1/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl">
			<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
				<div>
					<h2 className={glassTypography({ variant: "mainHeading" })}>
						💎 Card Inventory & Value
					</h2>
					<div className="mt-2 text-sm text-foreground/70">
						{cards.length} unique cards deposited • Total inventory value:{" "}
						{formatUSD(totalInventoryValue)}
					</div>
				</div>
				<div className="flex flex-col sm:items-end gap-3">
					<div className="flex flex-wrap items-center gap-3">
						<div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2">
							<BanknotesIcon className="w-5 h-5 text-success" />
							<div className="text-right">
								<div className="text-sm font-bold text-foreground">
									{formatUSD(totalInventoryValue)}
								</div>
								<div className="text-xs text-foreground/60">
									{cards.length} cards total
								</div>
							</div>
						</div>
						<Button
							size="sm"
							onPress={refreshInventory}
							className="rounded-lg bg-content2 hover:bg-content3"
						>
							<ArrowPathIcon className="w-4 h-4" />
						</Button>
					</div>
					{totalPages > 1 && (
						<div className="flex items-center gap-2">
							<Button
								size="sm"
								isDisabled={currentPage === 0}
								onPress={() => setCurrentPage((p) => Math.max(0, p - 1))}
							>
								Prev
							</Button>
							<span className="text-sm text-foreground/60">
								{currentPage + 1} / {totalPages}
							</span>
							<Button
								size="sm"
								isDisabled={currentPage === totalPages - 1}
								onPress={() =>
									setCurrentPage((p) => Math.min(totalPages - 1, p + 1))
								}
							>
								Next
							</Button>
						</div>
					)}
				</div>
			</div>

			{cards.length === 0 ? (
				<p className="text-foreground/60">
					No deposited cards found for this wallet.
				</p>
			) : (
				<div className="space-y-4">
					<div className="flex justify-center">
						<div className="text-sm text-foreground/60 inline-flex items-center gap-2">
							<TrophyIcon className="w-4 h-4" /> {paginatedCards.length} cards
							on this page • Total value:{" "}
							{formatUSD(
								paginatedCards.reduce((sum, c) => sum + c.userValueUsd, 0n),
							)}
						</div>
					</div>

					<div className="grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
						{paginatedCards.map((card) => {
							const appraisalInfo = card.appraisalInfo;
							const cardAppraisal = card.appraisal;
							const rarityEnum = appraisalInfo
								? rarityFromNumber(appraisalInfo.currentRarity)
								: Rarity.Common;
							const rarityConfig = getRarityConfig(rarityEnum);

							const detailRows: DetailItem[] = [
								{
									label: "Card ID",
									value: card.cardId.slice(2, 10).toUpperCase(),
								},
								{
									label: "Deposited",
									value: card.depositCount.toString(),
								},
								{
									label: "Your Value",
									value: card.isLoadingValue
										? "Loading..."
										: formatUSD(card.userValueUsd),
									highlight: !card.isLoadingValue,
								},
							];

							if (appraisalInfo) {
								detailRows.push({
									label: "Total Deposited",
									value: appraisalInfo.totalDepositedCount.toString(),
								});
							}

							const canonicalAddress = cardAppraisal?.canonicalContractAddress;
							if (
								cardAppraisal &&
								canonicalAddress &&
								canonicalAddress !== ZERO_ADDRESS
							) {
								const collection = canonicalAddress as `0x${string}`;
								const tokenId = cardAppraisal.canonicalTokenId.toString();

								return (
									<NFTCard
										key={card.cardId}
										data={{
											collection,
											tokenId,
											rarity: rarityEnum,
										}}
										size="sm"
										onClick={() => console.log(`Card ${card.cardId} clicked`)}
									/>
								);
							}

							return (
								<Card
									key={card.cardId}
									className="flex flex-col gap-3 rounded-xl border border-white/15 bg-content1/30 p-4 backdrop-blur"
								>
									<div className="flex items-center gap-2">
										<span
											className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r ${rarityConfig.bgGradient} text-base`}
										>
											{rarityConfig.emoji}
										</span>
										<div>
											<p className="text-sm font-semibold text-foreground">
												Card #{card.cardId.slice(2, 10).toUpperCase()}
											</p>
											<p className="text-xs text-foreground/60">
												Metadata pending - appraisal required for full display.
											</p>
										</div>
									</div>
									<div className="grid gap-2 sm:grid-cols-2">
										{detailRows.map(({ label, value, highlight }) => (
											<div
												key={`${card.cardId}-${label}`}
												className={cn(
													"flex flex-col rounded-lg border border-white/10 bg-content1/20 p-3 text-xs",
													highlight &&
														"border-warning/40 bg-warning/5 text-warning",
												)}
											>
												<span className="text-foreground/60 uppercase tracking-wide">
													{label}
												</span>
												<span className="text-foreground font-medium">
													{value}
												</span>
											</div>
										))}
									</div>
								</Card>
							);
						})}
					</div>
				</div>
			)}
		</Card>
	);
}

// (Removed) CardRewardDisplay with NFT fetching; we now derive display solely from groupId
