"use client";

import { ArrowUpTrayIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { memo } from "react";
import { cn } from "../../../lib/theme-config";
import type { UserOwnedNFTMultiCollection } from "../../../types/hooks";
import { Button } from "../../../ui";
import { NFTCard } from "../../nft";

interface DepositNFTCardProps {
	nft: UserOwnedNFTMultiCollection;
	hasAppraisal: boolean;
	appraisalValue?: bigint | undefined;
	isDepositing: boolean;
	depositState?: {
		isDepositing: boolean;
		stage: string;
		message: string;
	} | null;
	onDeposit: (collection: string, tokenId: string) => void;
	onGetAppraised: (collection: string, tokenId: string) => void;
	appraisalContractAddress?: `0x${string}` | undefined;
	className?: string;
}

function DepositNFTCard({
	nft,
	hasAppraisal,
	appraisalValue,
	isDepositing,
	depositState,
	onDeposit,
	onGetAppraised,
	appraisalContractAddress,
	className = "",
}: DepositNFTCardProps) {
	// Determine button message based on state
	const getButtonMessage = () => {
		if (depositState?.message) {
			return depositState.message;
		}
		return hasAppraisal ? "Deposit NFT" : "Get Appraised";
	};

	return (
		<motion.article
			className={cn(
				"bg-content1/30 backdrop-blur-xl rounded-xl border border-white/10 p-3 sm:p-4 flex flex-col h-full",
				className,
			)}
			whileHover={{
				scale: 1.01,
				borderColor: "rgba(255, 255, 255, 0.2)",
				boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
			}}
			transition={{
				type: "spring",
				stiffness: 400,
				damping: 17,
			}}
			whileTap={{ scale: 0.99 }}
		>
			{/* NFT Card */}
			<div className="flex-1 mb-3 sm:mb-4">
				<NFTCard
					data={{
						collection: nft.collection,
						tokenId: nft.tokenId.toString(),
						// Performance optimization: Override appraisal when already fetched
						appraisalOverride:
							hasAppraisal && appraisalValue
								? {
										hasAppraisal: true,
										priceUSD: appraisalValue,
									}
								: undefined,
					}}
					size="sm"
					onClick={() =>
						console.log(`Vault NFT ${nft.collection}:${nft.tokenId} clicked`)
					}
					{...(appraisalContractAddress && {
						appraisalContractAddress,
					})}
				/>
			</div>

			{/* Action Button */}
			<div className="pt-2">
				{hasAppraisal ? (
					<Button
						color="glassPrimary"
						className="w-full min-h-[44px]"
						onPress={() => onDeposit(nft.collection, nft.tokenId.toString())}
						disabled={isDepositing}
						isLoading={isDepositing}
						aria-label={`Deposit NFT ${nft.tokenId.toString()}`}
						startContent={<ArrowUpTrayIcon className="w-4 h-4" />}
					>
						{getButtonMessage()}
					</Button>
				) : (
					<Button
						color="glass"
						className="w-full min-h-[44px]"
						onPress={() =>
							onGetAppraised(nft.collection, nft.tokenId.toString())
						}
						aria-label={`Get NFT ${nft.tokenId.toString()} appraised`}
						startContent={<SparklesIcon className="w-4 h-4" />}
					>
						Get Appraised
					</Button>
				)}
			</div>

			{/* Status Indicator for active transactions */}
			{depositState?.isDepositing && depositState.message && (
				<motion.div
					className="mt-3 text-center"
					initial={{ opacity: 0, height: 0 }}
					animate={{ opacity: 1, height: "auto" }}
					exit={{ opacity: 0, height: 0 }}
				>
					<div className="flex items-center justify-center gap-2 text-xs text-foreground/60">
						<motion.div
							className="w-2 h-2 bg-primary rounded-full"
							animate={{
								scale: [1, 1.5, 1],
								opacity: [0.5, 1, 0.5],
							}}
							transition={{
								duration: 1.5,
								repeat: Number.POSITIVE_INFINITY,
								ease: "easeInOut",
							}}
						/>
						<span>{depositState.message}</span>
					</div>
				</motion.div>
			)}
		</motion.article>
	);
}

export default memo(DepositNFTCard);
