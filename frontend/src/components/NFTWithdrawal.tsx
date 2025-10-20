"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAccount } from "wagmi";
import { formatTokenAmount } from "../lib/utils";
import { Card, Button } from "../ui";
import { glassTypography } from "../lib/theme-config";
import { useGachaContracts } from "../hooks/useGachaContracts";
import { useGachaId } from "../hooks/useGachaId";
import {
	useTreasuryUserCards,
	type UserCardDeposit,
} from "../hooks/useTreasuryUserCards";
import { useRarityTracker, type CardAppraisalInfo } from "../hooks/useRarityTracker";
import { useNFTWithdrawal } from "../hooks/useNFTWithdrawal";
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
}

export const NFTWithdrawal: React.FC = () => {
	const { address: userAddress } = useAccount();
	const gachaId = useGachaId();
	const contracts = useGachaContracts(gachaId);

	const [isLoading, setIsLoading] = useState(true);
	const [withdrawingCardId, setWithdrawingCardId] = useState<string | null>(null);

	// Use existing hooks to get user's deposited cards
	const treasury = contracts.treasury as `0x${string}` | undefined;
	const rarityTracker = contracts.trackers?.common as `0x${string}` | undefined;
	const { getAllUserCardDeposits } = useTreasuryUserCards(treasury);
	const { getBatchCardInfo } = useRarityTracker(rarityTracker);
	const { withdrawNFT, isPending: isWithdrawing } = useNFTWithdrawal(treasury);

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
				const cardIds = deposits.map(d => d.cardId);
				const appraisalInfos = await getBatchCardInfo(cardIds);

				// Combine the data
				const cards: WithdrawableCard[] = deposits.map((deposit, index) => ({
					...deposit,
					appraisalInfo: appraisalInfos[index] || null,
				}));

				setUserCards(cards);
			} catch (error) {
				console.error("Error loading user cards:", error);
				setUserCards([]);
			} finally {
				setIsLoading(false);
			}
		};

		loadUserCards();
	}, [treasury, rarityTracker, userAddress, getAllUserCardDeposits, getBatchCardInfo]);

	const handleWithdraw = async (cardId: string) => {
		if (!treasury) return;

		setWithdrawingCardId(cardId);
		try {
			await withdrawNFT(cardId as `0x${string}`, 1n);
		} catch (error) {
			console.error("Withdrawal failed:", error);
		} finally {
			setWithdrawingCardId(null);
		}
	};

	const canWithdrawCard = (card: WithdrawableCard) => {
		return card.depositCount > 0n;
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
							<span className="text-foreground/70">Loading your deposited NFTs...</span>
						</div>
					</div>
				) : userCards.length === 0 ? (
					<div className="text-center py-12">
						<TrophyIcon className="w-16 h-16 mx-auto mb-4 text-foreground/30" />
						<h3 className="text-xl font-semibold text-foreground mb-2">
							No Deposited NFTs
						</h3>
						<p className="text-foreground/60 mb-6">
							You don't have any NFTs deposited in the vault. Deposit some NFTs to start earning yield!
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
									<h3 className="font-semibold text-foreground mb-1">Your Vault Inventory</h3>
									<p className="text-sm text-foreground/70">
										{userCards.length} unique NFT{userCards.length !== 1 ? 's' : ''} deposited
									</p>
								</div>
								<div className="text-right">
									<div className="text-2xl font-bold text-primary">
										{userCards.reduce((sum, card) => sum + card.depositCount, 0n).toString()}
									</div>
									<div className="text-sm text-foreground/60">Total Deposits</div>
								</div>
							</div>
						</Card>

						{/* NFTs Grid */}
						<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
							{userCards.map((card, index) => {
								const rarityConfig = card.appraisalInfo
									? getRarityConfig(card.appraisalInfo.currentRarity as 0 | 1 | 2 | 3 | 4)
									: null;

								const canWithdraw = canWithdrawCard(card);
								const isCurrentlyWithdrawing = withdrawingCardId === card.cardId;

								return (
									<motion.div
										key={card.cardId}
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.4, delay: index * 0.1 }}
									>
										<Card className={`p-6 border ${canWithdraw ? 'border-white/20 hover:bg-content2/10' : 'border-warning/30 bg-warning/10'} transition-all duration-300`}>
											<div className="space-y-4">
												{/* NFT Card Preview */}
												<div className="flex justify-center">
													<div className="w-32 h-32 bg-content2/40 rounded-xl flex items-center justify-center border border-white/10">
														<div className="text-center">
															{rarityConfig ? (
																<>
																	<div className="text-4xl mb-2">{rarityConfig.emoji}</div>
																	<div className={`text-xs font-medium ${rarityConfig.textColor}`}>
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
														<span className="text-sm text-foreground/70">Card ID:</span>
														<span className="text-xs font-mono bg-content2/40 px-2 py-1 rounded">
															{card.cardId.slice(0, 10)}...
														</span>
													</div>

													<div className="flex justify-between items-center">
														<span className="text-sm text-foreground/70">Deposits:</span>
														<span className="font-semibold text-foreground">
															{card.depositCount.toString()}
														</span>
													</div>

													{card.appraisalInfo && (
														<div className="flex justify-between items-center">
															<span className="text-sm text-foreground/70">Value:</span>
															<span className="font-semibold text-primary">
																{formatUSD(card.appraisalInfo.appraisedValueUsd)}
															</span>
														</div>
													)}
												</div>

												{/* Withdraw Button */}
												<Button
													className={`w-full rounded-xl transition-all duration-300 ${
														canWithdraw
															? "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
															: "bg-content2/20 text-foreground/50 cursor-not-allowed"
													}`}
													onPress={() => handleWithdraw(card.cardId)}
													isDisabled={!canWithdraw || isWithdrawing}
													isLoading={isCurrentlyWithdrawing}
												>
													<span className="flex items-center justify-center gap-2">
														{isCurrentlyWithdrawing ? (
															<>
																<ArrowPathIcon className="w-4 h-4 animate-spin" />
																Withdrawing...
															</>
														) : canWithdraw ? (
															<>
																<ArrowLeftOnRectangleIcon className="w-4 h-4" />
																Withdraw
															</>
														) : (
															<>
																<ExclamationTriangleIcon className="w-4 h-4" />
																Unavailable
															</>
														)}
													</span>
												</Button>
											</div>
										</Card>
									</motion.div>
								);
							})}
						</div>

						{/* Information Section */}
						<div className="mt-8 p-4 bg-content2/20 rounded-lg border border-white/10">
							<h3 className="font-semibold text-foreground mb-2">About NFT Withdrawals</h3>
							<ul className="text-sm text-foreground/70 space-y-1">
								<li>• You can only withdraw NFTs that you originally deposited</li>
								<li>• NFTs currently being used in gacha spins cannot be withdrawn</li>
								<li>• Withdrawals transfer the NFT back to your wallet immediately</li>
								<li>• Gas fees apply for withdrawal transactions</li>
								<li>• Your yield earnings will remain available to claim separately</li>
							</ul>
						</div>
					</div>
				)}
			</Card>
		</motion.div>
	);
};