"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Card } from "@/ui/Card";
import { Chip } from "@/ui/Chip";
import { NFTCard, type NFTCardData } from "@/components/nft";
import BuybackComponent from "@/components/economy/BuybackComponent";
import { getRarityConfig, type Rarity } from "@/lib/rarityConfig";
import {
	formatAddress,
	formatTokenId,
	formatCurrency,
	getRelativeTime,
} from "@/lib/utils";
import type { SpinHistoryEntry } from "@/types/spin-history";

interface SpinHistoryCardProps {
	entry: SpinHistoryEntry;
	appraisalContractAddress?: string | undefined;
	protocolTreasuryAddress?: string | undefined;
	gachaId?: string | undefined;
	onBuybackSuccess?: (txHash: string, payoutAmount: bigint) => void;
	uniqueId?: string; // Unique identifier (triggerId) to distinguish duplicate NFTs
}

const SpinHistoryCard = memo(
	({
		entry,
		appraisalContractAddress,
		protocolTreasuryAddress,
		gachaId,
		onBuybackSuccess,
		uniqueId,
	}: SpinHistoryCardProps) => {
		const rarityConfig =
			entry.rarity !== undefined
				? getRarityConfig(entry.rarity as Rarity)
				: null;

		// Map "default" rarity color to "glass" for Chip compatibility
		const rarityColor =
			rarityConfig?.chipColor === "default" ? "glass" : (rarityConfig?.chipColor ?? "glass");

		const statusVariant =
			entry.status === "completed"
				? "success"
				: entry.status === "refunded"
					? "warning"
					: "danger";

		const statusLabel =
			entry.status === "completed"
				? "Completed"
				: entry.status === "refunded"
					? "Refunded"
					: "Reclaimed";

		// NFT card data (only for completed spins with NFT data)
		const nftCardData: NFTCardData | null =
			entry.status === "completed" &&
			entry.collection &&
			entry.tokenId &&
			entry.rarity !== undefined
				? {
						collection: entry.collection,
						tokenId: entry.tokenId,
						rarity: entry.rarity as Rarity,
						appraisedValue: entry.appraisedPrice,
					}
				: null;

		return (
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
				className="h-full"
			>
				<Card
					variant="interactive"
					padding="lg"
					className="flex h-full flex-col gap-4"
				>
					{/* Header: Status and Rarity */}
					<div className="flex items-start justify-between gap-2">
						<div className="flex flex-wrap items-center gap-2">
							<Chip size="sm" variant={statusVariant}>
								{statusLabel}
							</Chip>
							{rarityConfig && (
								<Chip
									size="sm"
									color={rarityColor}
									startContent={rarityConfig.emoji}
								>
									{rarityConfig.name}
								</Chip>
							)}
						</div>
						<Chip size="sm" variant="glass">
							{getRelativeTime(entry.timestamp)}
						</Chip>
					</div>

					{/* NFT Preview (completed spins only) */}
					{nftCardData && appraisalContractAddress ? (
						<div className="flex-1">
							<NFTCard
								data={nftCardData}
								size="sm"
								appraisalContractAddress={
									appraisalContractAddress as `0x${string}`
								}
								{...(protocolTreasuryAddress && {
									protocolTreasuryAddress,
								})}
								{...(gachaId && { gachaId })}
								{...(onBuybackSuccess && {
									onBuybackSuccess: (txHash: string) =>
										onBuybackSuccess(txHash, 0n),
								})}
							/>
						</div>
					) : (
						// Refunded/Reclaimed spin display
						<div className="flex-1">
							<div className="flex h-full min-h-[160px] items-center justify-center rounded-xl bg-content1/10 backdrop-blur-sm">
								<div className="text-center">
									<p className="text-sm text-foreground/60">
										{entry.status === "refunded"
											? "Rarity pool was empty"
											: "Randomness timeout"}
									</p>
									{entry.refundAmount && (
										<p className="mt-2 text-lg font-semibold text-foreground">
											{formatCurrency(entry.refundAmount, 6)}
											{" "}
											Refunded
										</p>
									)}
								</div>
							</div>
						</div>
					)}

					{/* Appraised Value (completed spins) */}
					{entry.status === "completed" && entry.appraisedPrice && (
						<div className="flex items-center justify-between rounded-lg bg-content1/10 px-3 py-2">
							<span className="text-xs text-foreground/60">Appraised Value</span>
							<span className="text-sm font-semibold text-foreground">
								{formatCurrency(entry.appraisedPrice, 18, "USD")}
							</span>
						</div>
					)}

					{/* Footer: Transaction details */}
					<div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3">
						<div className="flex flex-col gap-1">
							<span className="text-[11px] text-foreground/40">
								Trigger ID: #{entry.triggerId.toString()}
							</span>
							{nftCardData && (
								<span className="text-[11px] text-foreground/40">
									{formatAddress(nftCardData.collection)} • {formatTokenId(nftCardData.tokenId)}
								</span>
							)}
						</div>
						<a
							href={`https://etherscan.io/tx/${entry.transactionHash}`}
							target="_blank"
							rel="noopener noreferrer"
							className="text-[11px] !text-white/80 hover:!text-white hover:underline transition-colors"
						>
							View Transaction →
						</a>
					</div>

					{/* Buyback Action (completed spins with NFT and treasury) */}
					{nftCardData &&
						appraisalContractAddress &&
						protocolTreasuryAddress &&
						rarityConfig &&
						onBuybackSuccess && (
							<BuybackComponent
								collection={nftCardData.collection}
								tokenId={nftCardData.tokenId}
								appraisalContractAddress={appraisalContractAddress}
								protocolTreasuryAddress={protocolTreasuryAddress}
								rarity={rarityConfig.name}
								historicalAppraisedPrice={entry.appraisedPrice}
								uniqueId={uniqueId || entry.triggerId.toString()}
								onBuybackSuccess={onBuybackSuccess}
								variant="button"
								showTreasuryRestock={false}
							/>
						)}
				</Card>
			</motion.div>
		);
	},
);

SpinHistoryCard.displayName = "SpinHistoryCard";

export { SpinHistoryCard };
