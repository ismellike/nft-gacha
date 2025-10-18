"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
import { isAddress } from "viem";
import { formatTokenAmount } from "../lib/utils";
import { Card, Button, Input } from "../ui";
import { glassTypography } from "../lib/theme-config";
import {
	useReadGachaTreasuryIsNftDeposited,
	useReadGachaTreasuryNftCurrentRarity,
	useReadGachaTreasuryNftReceiveTimes,
	useReadGachaTreasuryGetTreasuryItem,
	useWriteGachaTreasuryWithdrawMyNft,
} from "../generated";
import { useGachaContracts } from "../hooks/useGachaContracts";
import { useGachaId } from "../hooks/useGachaId";
import {
	ArrowLeftOnRectangleIcon,
	ArrowPathIcon,
	CheckIcon,
	ExclamationTriangleIcon,
	SparklesIcon,
	InformationCircleIcon,
	MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { UnifiedNFTCard } from "./UnifiedNFTCard";
import { getRarityConfig } from "../lib/rarityConfig";

export const NFTWithdrawal: React.FC = () => {
	const { address: userAddress } = useAccount();
	const gachaId = useGachaId();
	const contracts = useGachaContracts(gachaId);

	const [collectionAddress, setCollectionAddress] = useState("");
	const [tokenId, setTokenId] = useState("");
	const [searchedNFT, setSearchedNFT] = useState<{ collection: string; tokenId: bigint } | null>(null);
	const [withdrawingNFT, setWithdrawingNFT] = useState<{ collection: string; tokenId: bigint } | null>(null);

	// Check if NFT is deposited
	const isDepositedEnabled = !!(contracts.treasury && searchedNFT);
	const { data: isDeposited } = useReadGachaTreasuryIsNftDeposited({
		address: contracts.treasury as `0x${string}`,
		args: [searchedNFT!.collection as `0x${string}`, searchedNFT!.tokenId],
		query: { enabled: isDepositedEnabled },
	});

	// Get NFT's current rarity if deposited
	const rarityEnabled = isDepositedEnabled && !!isDeposited;
	const { data: currentRarity } = useReadGachaTreasuryNftCurrentRarity({
		address: contracts.treasury as `0x${string}`,
		args: [searchedNFT!.collection as `0x${string}`, searchedNFT!.tokenId],
		query: { enabled: rarityEnabled },
	});

	// Get NFT's receive time (0 if not won yet)
	const { data: receiveTime } = useReadGachaTreasuryNftReceiveTimes({
		address: contracts.treasury as `0x${string}`,
		args: [searchedNFT!.collection as `0x${string}`, searchedNFT!.tokenId],
		query: { enabled: rarityEnabled },
	});

	// Get NFT details from treasury - using a simplified approach
	const detailsEnabled = rarityEnabled && currentRarity !== undefined;
	const { data: nftDetails } = useReadGachaTreasuryGetTreasuryItem({
		address: contracts.treasury as `0x${string}`,
		args: [currentRarity!, BigInt(0)],
		query: { enabled: detailsEnabled },
	});

	// Withdrawal contract write
	const {
		writeContract: withdrawNFT,
		isSuccess: isWithdrawSuccess,
		isError: isWithdrawError,
		error: withdrawError,
		data: withdrawTxHash,
	} = useWriteGachaTreasuryWithdrawMyNft();

	// Transaction receipt
	const { data: withdrawReceipt } = useWaitForTransactionReceipt({
		hash: withdrawTxHash as `0x${string}`,
		query: {
			enabled: !!withdrawTxHash,
		},
	});

	const handleSearch = () => {
		if (!collectionAddress || !tokenId) return;

		const isValidAddress = isAddress(collectionAddress);
		if (!isValidAddress) {
			alert("Please enter a valid collection address");
			return;
		}

		const tokenIdNum = parseInt(tokenId);
		if (isNaN(tokenIdNum) || tokenIdNum < 0) {
			alert("Please enter a valid token ID");
			return;
		}

		setSearchedNFT({
			collection: collectionAddress,
			tokenId: BigInt(tokenIdNum),
		});

		// Reset withdrawal state
		setWithdrawingNFT(null);
	};

	const handleWithdraw = async () => {
		if (!searchedNFT || !contracts.treasury) return;

		// Verify user is the depositor
		if (nftDetails && nftDetails.depositor.toLowerCase() !== userAddress?.toLowerCase()) {
			alert("You can only withdraw NFTs that you deposited");
			return;
		}

		// Verify NFT hasn't been won (receiveTime should be 0)
		if (receiveTime && receiveTime > BigInt(0)) {
			alert("This NFT has already been won from the gacha and cannot be withdrawn");
			return;
		}

		setWithdrawingNFT(searchedNFT);

		try {
			withdrawNFT({
				address: contracts.treasury as `0x${string}`,
				args: [searchedNFT.collection as `0x${string}`, searchedNFT.tokenId],
			});
		} catch (error) {
			console.error("Withdrawal failed:", error);
			setWithdrawingNFT(null);
		}
	};

	// Reset withdrawal state on transaction success or error
	if (isWithdrawSuccess || isWithdrawError) {
		if (withdrawReceipt) {
			setWithdrawingNFT(null);
			setSearchedNFT(null);
			setCollectionAddress("");
			setTokenId("");
		}
	}

	const canWithdraw =
		searchedNFT &&
		isDeposited &&
		nftDetails &&
		nftDetails.depositor.toLowerCase() === userAddress?.toLowerCase() &&
		receiveTime === BigInt(0);

	const rarityConfig = currentRarity !== undefined ? getRarityConfig(currentRarity as 0 | 1 | 2 | 3 | 4) : null;

	if (!userAddress) {
		return (
			<Card className="text-center p-12 bg-content1/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
				<SparklesIcon className="w-20 h-20 mx-auto mb-6 text-foreground/30" />
				<h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
					Connect Wallet
				</h2>
				<p className="text-foreground/60 leading-relaxed">
					Connect your wallet to withdraw your deposited NFTs.
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
						Withdraw NFTs
					</h2>
				</div>

				{/* Search Form */}
				<div className="space-y-6 mb-8">
					<div>
						<label className="block text-sm font-medium text-foreground/80 mb-2">
							Collection Address
						</label>
						<Input
							type="text"
							placeholder="0x..."
							value={collectionAddress}
							onChange={(e) => setCollectionAddress(e.target.value)}
							className="w-full"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-foreground/80 mb-2">
							Token ID
						</label>
						<Input
							type="number"
							placeholder="1"
							value={tokenId}
							onChange={(e) => setTokenId(e.target.value)}
							className="w-full"
						/>
					</div>

					<Button
						className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
						onPress={handleSearch}
						isDisabled={!collectionAddress || !tokenId}
					>
						<span className="flex items-center justify-center gap-2">
							<MagnifyingGlassIcon className="w-4 h-4" />
							Check NFT Status
						</span>
					</Button>
				</div>

				{/* NFT Status Display */}
				{searchedNFT && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.4 }}
						className="space-y-6"
					>
						{/* NFT Card */}
						<div className="flex justify-center">
							<UnifiedNFTCard
								collection={searchedNFT.collection}
								tokenId={searchedNFT.tokenId.toString()}
								size="lg"
								variant="detailed"
								showAppraisal={true}
								priority={8}
								animate={true}
								appraisalContractAddress={
									(contracts.appraisal as `0x${string}`) ||
									"0x0000000000000000000000000000000000000000"
								}
							/>
						</div>

						{/* Status Information */}
						<Card className="p-6 bg-content2/20 border border-white/10">
							<h3 className="font-semibold text-foreground mb-4">NFT Status</h3>

							<div className="space-y-3">
								<div className="flex justify-between items-center">
									<span className="text-foreground/70">Deposited:</span>
									<span className={`font-medium ${isDeposited ? 'text-success' : 'text-danger'}`}>
										{isDeposited ? 'Yes' : 'No'}
									</span>
								</div>

								{isDeposited && nftDetails && (
									<>
										<div className="flex justify-between items-center">
											<span className="text-foreground/70">Your NFT:</span>
											<span className={`font-medium ${
												nftDetails.depositor.toLowerCase() === userAddress.toLowerCase()
													? 'text-success'
													: 'text-danger'
											}`}>
												{nftDetails.depositor.toLowerCase() === userAddress.toLowerCase()
													? 'Yes'
													: 'No'}
											</span>
										</div>

										<div className="flex justify-between items-center">
											<span className="text-foreground/70">Status:</span>
											<span className={`font-medium ${
												receiveTime === BigInt(0) ? 'text-success' : 'text-warning'
											}`}>
												{receiveTime === BigInt(0) ? 'Available' : 'Already Won'}
											</span>
										</div>

										{currentRarity !== undefined && rarityConfig && (
											<div className="flex justify-between items-center">
												<span className="text-foreground/70">Rarity:</span>
												<span className={`font-medium ${rarityConfig.textColor}`}>
													{rarityConfig.emoji} {rarityConfig.name}
												</span>
											</div>
										)}

										{nftDetails.appraisedPrice > BigInt(0) && (
											<div className="flex justify-between items-center">
												<span className="text-foreground/70">Appraised Value:</span>
												<span className="font-medium">
													${formatTokenAmount(nftDetails.appraisedPrice, 18, { maxDecimals: 2 })}
												</span>
											</div>
										)}
									</>
								)}
							</div>
						</Card>

						{/* Withdrawal Button */}
						{canWithdraw && (
							<div className="space-y-4">
								<Button
									className="w-full rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 disabled:opacity-50"
									onPress={handleWithdraw}
									isDisabled={withdrawingNFT !== null || isWithdrawSuccess}
									isLoading={withdrawingNFT !== null}
								>
									<span className="flex items-center justify-center gap-2">
										{withdrawingNFT ? (
											<>
												<ArrowPathIcon className="w-4 h-4 animate-spin" />
												Withdrawing...
											</>
										) : isWithdrawSuccess ? (
											<>
												<CheckIcon className="w-4 h-4" />
												Withdrawal Successful!
											</>
										) : (
											<>
												<ArrowLeftOnRectangleIcon className="w-4 h-4" />
												Withdraw NFT
											</>
										)}
									</span>
								</Button>

								{isWithdrawError && withdrawError && (
									<div className="bg-danger/20 border border-danger/30 rounded-lg p-3">
										<div className="flex items-center gap-2 text-danger text-sm">
											<ExclamationTriangleIcon className="w-4 h-4" />
											<span>
												{withdrawError.message || "Withdrawal failed. Please try again."}
											</span>
										</div>
									</div>
								)}
							</div>
						)}

						{searchedNFT && !canWithdraw && (
							<Card className="p-4 bg-warning/20 border border-warning/30">
								<div className="flex items-start gap-3">
									<InformationCircleIcon className="w-5 h-5 text-warning mt-0.5" />
									<div className="text-sm text-foreground/80">
										{!isDeposited && "This NFT is not deposited in the treasury."}
										{isDeposited && nftDetails && nftDetails.depositor.toLowerCase() !== userAddress?.toLowerCase() && "You can only withdraw NFTs that you deposited."}
										{isDeposited && receiveTime && receiveTime > BigInt(0) && "This NFT has already been won from the gacha and cannot be withdrawn."}
									</div>
								</div>
							</Card>
						)}
					</motion.div>
				)}

				{/* Information Section */}
				<div className="mt-8 p-4 bg-content2/20 rounded-lg border border-white/10">
					<h3 className="font-semibold text-foreground mb-2">How to Withdraw NFTs</h3>
					<ul className="text-sm text-foreground/70 space-y-1">
						<li>• Enter the collection address and token ID of your deposited NFT</li>
						<li>• You can only withdraw NFTs that you originally deposited</li>
						<li>• NFTs that have been won from the gacha cannot be withdrawn</li>
						<li>• The NFT will be transferred back to your wallet immediately</li>
						<li>• Gas fees apply for withdrawal transactions</li>
					</ul>
				</div>
			</Card>
		</motion.div>
	);
};