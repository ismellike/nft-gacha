"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAccount } from "wagmi";
import { formatTokenAmount } from "../lib/utils";
import { toast } from "react-hot-toast";
import type { Address } from "viem";
import { Card, Button } from "../ui";
import { glassTypography } from "../lib/theme-config";
import { useGachaContracts } from "../hooks/useGachaContracts";
import { useGachaId } from "../hooks/useGachaId";
import {
	useTreasuryUserCards,
	type UserCardDeposit,
} from "../hooks/useTreasuryUserCards";
import {
	useRarityTracker,
	type CardAppraisalInfo,
} from "../hooks/useRarityTracker";
import { useNFTWithdrawal } from "../hooks/useNFTWithdrawal";
import {
	useUserDepositedNFTs,
	type DepositedNFT,
} from "../hooks/useUserDepositedNFTs";
import {
	ArrowLeftOnRectangleIcon,
	ArrowPathIcon,
	ExclamationTriangleIcon,
	SparklesIcon,
	TrophyIcon,
} from "@heroicons/react/24/outline";
import { getRarityConfig } from "../lib/rarityConfig";

interface WithdrawableCard extends UserCardDeposit {
	appraisalInfo: CardAppraisalInfo | null;
	nfts: DepositedNFT[]; // Specific NFTs that can be withdrawn
}

export const NFTWithdrawal: React.FC = () => {
	const { address: userAddress } = useAccount();
	const gachaId = useGachaId();
	const contracts = useGachaContracts(gachaId);

	const [isLoading, setIsLoading] = useState(true);
	const [withdrawingNFT, setWithdrawingNFT] = useState<{
		collection: Address;
		tokenId: bigint;
	} | null>(null);

	// Use existing hooks to get user's deposited cards
	const treasury = contracts.treasury as `0x${string}` | undefined;
	const rarityTracker = contracts.trackers?.common as `0x${string}` | undefined;
	const { getAllUserCardDeposits } = useTreasuryUserCards(treasury);
	const { getBatchCardInfo } = useRarityTracker(rarityTracker);
	const { withdrawNFT, isPending: isWithdrawing } = useNFTWithdrawal(treasury);
	const { getUserDepositedNFTsByCardId } = useUserDepositedNFTs(treasury);

	// State for user's deposited cards
	const [userCards, setUserCards] = useState<WithdrawableCard[]>([]);

	// Format USD values
	const formatUSD = (amount: bigint) => {
		return formatTokenAmount(amount, 6, {
			maxDecimals: 2,
			minDecimals: 2,
			suffix: " USD",
		});
	};

	// Load user's deposited cards
	useEffect(() => {
		const loadUserCards = async () => {
			if (!treasury || !rarityTracker || !userAddress) {
				setUserCards([]);
				setIsLoading(false);
				return;
			}

			setIsLoading(true);
			try {
				// Get user's card deposits
				const deposits = await getAllUserCardDeposits();

				if (deposits.length === 0) {
					setUserCards([]);
					setIsLoading(false);
					return;
				}

				// Get appraisal info for all cards
				const cardIds = deposits.map((d) => d.cardId);
				const appraisalInfos = await getBatchCardInfo(cardIds);

				// Get specific NFTs for each card ID
				const cardsWithNFTs: WithdrawableCard[] = [];

				for (let i = 0; i < deposits.length; i++) {
					const deposit = deposits[i];
					const nfts = await getUserDepositedNFTsByCardId(deposit.cardId);

					cardsWithNFTs.push({
						...deposit,
						appraisalInfo: appraisalInfos[i] || null,
						nfts: nfts,
					});
				}

				setUserCards(cardsWithNFTs);
			} catch (error) {
				console.error("Error loading user cards:", error);
				setUserCards([]);
			} finally {
				setIsLoading(false);
			}
		};

		loadUserCards();
	}, [
		treasury,
		rarityTracker,
		userAddress,
		getAllUserCardDeposits,
		getBatchCardInfo,
		getUserDepositedNFTsByCardId,
	]);

	const handleWithdraw = async (
		collection: Address,
		tokenId: bigint,
		_cardId: string,
	) => {
		if (!treasury) {
			toast.error("Treasury contract not available");
			return;
		}

		// Prevent double withdrawals
		if (
			withdrawingNFT?.collection === collection &&
			withdrawingNFT?.tokenId === tokenId
		) {
			return;
		}

		setWithdrawingNFT({ collection, tokenId });

		try {
			console.log(
				`🔄 [NFTWithdrawal] Withdrawing NFT: ${collection} #${tokenId.toString()}`,
			);
			await withdrawNFT(collection, tokenId);

			// Refetch the user's deposited NFTs after successful withdrawal
			setTimeout(async () => {
				try {
					// Trigger the useEffect to reload user cards
					const deposits = await getAllUserCardDeposits();
					if (deposits.length === 0) {
						setUserCards([]);
						return;
					}

					// Get appraisal info for all cards
					const cardIds = deposits.map((d) => d.cardId);
					const appraisalInfos = await getBatchCardInfo(cardIds);

					// Get specific NFTs for each card ID
					const cardsWithNFTs: WithdrawableCard[] = [];

					for (let i = 0; i < deposits.length; i++) {
						const deposit = deposits[i];
						const nfts = await getUserDepositedNFTsByCardId(deposit.cardId);

						cardsWithNFTs.push({
							...deposit,
							appraisalInfo: appraisalInfos[i] || null,
							nfts: nfts,
						});
					}

					setUserCards(cardsWithNFTs);
				} catch (error) {
					console.error("Error refetching user cards after withdrawal:", error);
				}
			}, 3000);
		} catch (error) {
			console.error("Withdrawal failed:", error);
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error occurred";
			toast.error(`Failed to withdraw NFT: ${errorMessage}`);
		} finally {
			// Clear withdrawing states after a delay
			setTimeout(() => {
				setWithdrawingNFT(null);
			}, 2000);
		}
	};

	const canWithdrawCard = (card: WithdrawableCard) => {
		return card.depositCount > 0n && card.nfts.length > 0;
	};

	const canWithdrawSpecificNFT = (
		card: WithdrawableCard,
		nft: DepositedNFT,
	) => {
		return (
			card.depositCount > 0n && nft.collection && nft.tokenId !== undefined
		);
	};

	if (!userAddress) {
		return (
			<Card className="text-center p-12 bg-content1/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
				<SparklesIcon className="w-20 h-20 mx-auto mb-6 text-foreground/30" />
				<h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
					Connect Wallet
				</h2>
				<p className="text-foreground/60 leading-relaxed">
					Connect your wallet to view and withdraw your deposited NFTs.
				</p>
			</Card>
		);
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6 }}
		>
			<Card className="p-8 bg-content1/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
				<div className="flex items-center gap-3 mb-8">
					<ArrowLeftOnRectangleIcon className="w-6 h-6" />
					<h2 className={glassTypography({ variant: "mainHeading" })}>
						Withdraw Your NFTs
					</h2>
				</div>

				{isLoading ? (
					<div className="flex items-center justify-center py-12">
						<div className="flex items-center gap-3">
							<ArrowPathIcon className="w-6 h-6 animate-spin text-primary" />
							<span className="text-foreground/70">
								Loading your deposited NFTs...
							</span>
						</div>
					</div>
				) : userCards.length === 0 ? (
					<div className="text-center py-12">
						<TrophyIcon className="w-16 h-16 mx-auto mb-4 text-foreground/30" />
						<h3 className="text-xl font-semibold text-foreground mb-2">
							No Deposited NFTs
						</h3>
						<p className="text-foreground/60 mb-6">
							You don't have any NFTs deposited in the vault. Deposit some NFTs
							to start earning yield!
						</p>
						<Button
							variant="light"
							onPress={() => {
								window.location.hash = "deposits";
							}}
							className="rounded-xl bg-content2/20 hover:bg-content2/30"
						>
							Deposit NFTs
						</Button>
					</div>
				) : (
					<div className="space-y-8">
						{/* Summary Section */}
						<Card className="p-6 bg-content2/20 border border-white/10">
							<div className="flex items-center justify-between">
								<div>
									<h3 className="font-semibold text-foreground mb-1">
										Your Vault Inventory
									</h3>
									<p className="text-sm text-foreground/70">
										{userCards.length} unique NFT
										{userCards.length !== 1 ? "s" : ""} deposited
									</p>
								</div>
								<div className="text-right">
									<div className="text-2xl font-bold text-primary">
										{userCards
											.reduce((sum, card) => sum + card.depositCount, 0n)
											.toString()}
									</div>
									<div className="text-sm text-foreground/60">
										Total Deposits
									</div>
								</div>
							</div>
						</Card>

						{/* NFTs Grid */}
						<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
							{userCards.map((card, index) => {
								const rarityConfig = card.appraisalInfo
									? getRarityConfig(
											card.appraisalInfo.currentRarity as 0 | 1 | 2 | 3 | 4,
										)
									: null;

								const canWithdraw = canWithdrawCard(card);

								return (
									<motion.div
										key={card.cardId}
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.4, delay: index * 0.1 }}
									>
										<Card
											className={`p-6 border ${canWithdraw ? "border-white/20 hover:bg-content2/10" : "border-warning/30 bg-warning/10"} transition-all duration-300`}
										>
											<div className="space-y-4">
												{/* NFT Card Preview */}
												<div className="flex justify-center">
													<div className="w-32 h-32 bg-content2/40 rounded-xl flex items-center justify-center border border-white/10">
														<div className="text-center">
															{rarityConfig ? (
																<>
																	<div className="text-4xl mb-2">
																		{rarityConfig.emoji}
																	</div>
																	<div
																		className={`text-xs font-medium ${rarityConfig.textColor}`}
																	>
																		{rarityConfig.name}
																	</div>
																</>
															) : (
																<div className="text-foreground/50">
																	<SparklesIcon className="w-8 h-8 mx-auto mb-2" />
																	<div className="text-xs">NFT</div>
																</div>
															)}
														</div>
													</div>
												</div>

												{/* Card Details */}
												<div className="space-y-2">
													<div className="flex justify-between items-center">
														<span className="text-sm text-foreground/70">
															Card ID:
														</span>
														<span className="text-xs font-mono bg-content2/40 px-2 py-1 rounded">
															{card.cardId.slice(0, 10)}...
														</span>
													</div>

													<div className="flex justify-between items-center">
														<span className="text-sm text-foreground/70">
															Deposits:
														</span>
														<span className="font-semibold text-foreground">
															{card.depositCount.toString()}
														</span>
													</div>

													{card.appraisalInfo && (
														<div className="flex justify-between items-center">
															<span className="text-sm text-foreground/70">
																Value:
															</span>
															<span className="font-semibold text-primary">
																{formatUSD(
																	card.appraisalInfo.appraisedValueUsd,
																)}
															</span>
														</div>
													)}

													{/* Show individual NFTs that can be withdrawn */}
													{card.nfts.length > 0 && (
														<div className="mt-3 space-y-2">
															<div className="text-sm text-foreground/70 mb-2">
																Available NFTs ({card.nfts.length}):
															</div>
															{card.nfts.map((nft) => {
																const canWithdrawThisNFT =
																	canWithdrawSpecificNFT(card, nft);
																const isWithdrawingThisNFT =
																	withdrawingNFT?.collection ===
																		nft.collection &&
																	withdrawingNFT?.tokenId === nft.tokenId;

																return (
																	<div
																		key={`${nft.collection}-${nft.tokenId}`}
																		className="flex items-center justify-between p-2 bg-content2/10 rounded-lg border border-white/5"
																	>
																		<div className="flex items-center gap-2">
																			<div className="text-xs font-mono bg-content2/20 px-2 py-1 rounded">
																				Token #{nft.tokenId.toString()}
																			</div>
																			<div className="text-xs text-foreground/50">
																				{nft.collection.slice(0, 8)}...
																				{nft.collection.slice(-6)}
																			</div>
																		</div>
																		<Button
																			size="sm"
																			className={`rounded-lg text-xs px-3 py-1 transition-all duration-300 ${
																				canWithdrawThisNFT
																					? "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:scale-105"
																					: "bg-content2/20 text-foreground/50 cursor-not-allowed"
																			}`}
																			onPress={() =>
																				handleWithdraw(
																					nft.collection,
																					nft.tokenId,
																					card.cardId,
																				)
																			}
																			isDisabled={
																				!canWithdrawThisNFT || isWithdrawing
																			}
																			isLoading={isWithdrawingThisNFT}
																		>
																			{isWithdrawingThisNFT ? (
																				<span className="flex items-center gap-1">
																					<ArrowPathIcon className="w-3 h-3 animate-spin" />
																					Withdrawing
																				</span>
																			) : (
																				<span className="flex items-center gap-1">
																					<ArrowLeftOnRectangleIcon className="w-3 h-3" />
																					Withdraw
																				</span>
																			)}
																		</Button>
																	</div>
																);
															})}
														</div>
													)}

													{/* Fallback button if no NFTs available */}
													{card.nfts.length === 0 && (
														<div className="mt-3 text-center p-3 bg-warning/10 rounded-lg border border-warning/20">
															<div className="flex items-center justify-center gap-2 text-warning text-sm">
																<ExclamationTriangleIcon className="w-4 h-4" />
																<span>No withdrawable NFTs found</span>
															</div>
														</div>
													)}
												</div>
											</div>
										</Card>
									</motion.div>
								);
							})}
						</div>

						{/* Information Section */}
						<div className="mt-8 p-4 bg-content2/20 rounded-lg border border-white/10">
							<h3 className="font-semibold text-foreground mb-2">
								About NFT Withdrawals
							</h3>
							<ul className="text-sm text-foreground/70 space-y-1">
								<li>
									• You can only withdraw NFTs that you originally deposited
								</li>
								<li>
									• NFTs currently being used in gacha spins cannot be withdrawn
								</li>
								<li>
									• Withdrawals transfer the NFT back to your wallet immediately
								</li>
								<li>• Gas fees apply for withdrawal transactions</li>
								<li>
									• Your yield earnings will remain available to claim
									separately
								</li>
							</ul>
						</div>
					</div>
				)}
			</Card>
		</motion.div>
	);
};
