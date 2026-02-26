"use client";

import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { memo } from "react";
import type { Address } from "viem";
import { cn } from "../../../lib/theme-config";
import { formatCurrency } from "../../../lib/utils";
import { Button } from "../../../ui";
import { NFTCard } from "../../nft";

interface NFTWithCollection {
	collection: Address;
	tokenId: bigint;
	appraisedPrice: bigint;
	currentRarity?: number | string;
	collectionName?: string;
}

interface WithdrawNFTCardProps {
	nft: NFTWithCollection;
	isWithdrawing: boolean;
	onWithdraw: (collection: Address, tokenId: bigint) => void;
	appraisalContractAddress?: `0x${string}` | undefined;
	className?: string;
	index?: number;
}

function WithdrawNFTCard({
	nft,
	isWithdrawing,
	onWithdraw,
	appraisalContractAddress,
	className = "",
	index = 0,
}: WithdrawNFTCardProps) {
	const formatShortAddress = (address: string): string =>
		`${address.slice(0, 6)}...${address.slice(-4)}`;

	return (
		<motion.article
			className={cn(
				"bg-content1/30 backdrop-blur-xl rounded-xl border border-white/10 p-3 sm:p-4",
				className,
			)}
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.2, delay: index * 0.05 }}
			whileHover={{
				scale: 1.01,
				borderColor: "rgba(255, 255, 255, 0.2)",
			}}
			whileTap={{ scale: 0.99 }}
		>
			{/* Header */}
			<div className="flex items-center justify-between text-xs text-foreground/60 mb-2">
				<span className="font-mono">#{nft.tokenId.toString()}</span>
				<span className="text-foreground/70">
					{formatShortAddress(nft.collection)}
				</span>
			</div>

			{/* NFT Display - sm size for compact list layout */}
			<div className="flex justify-center mb-3">
				<NFTCard
					data={{
						collection: nft.collection,
						tokenId: nft.tokenId.toString(),
						rarity:
							typeof nft.currentRarity === "number"
								? nft.currentRarity
								: undefined,
						appraisedValue: nft.appraisedPrice,
					}}
					size="sm"
					{...(appraisalContractAddress && {
						appraisalContractAddress,
					})}
				/>
			</div>

			{/* Appraised Value */}
			<div className="flex items-center justify-between text-sm text-foreground/70 mb-3 px-1">
				<span>Value</span>
				<span className="font-semibold text-success">
					{formatCurrency(nft.appraisedPrice.toString(), 18, "USD")}
				</span>
			</div>

			{/* Withdraw Button */}
			<Button
				color="glassPrimary"
				className="w-full min-h-[44px]"
				onPress={() => onWithdraw(nft.collection, nft.tokenId)}
				isLoading={isWithdrawing}
				isDisabled={isWithdrawing}
				startContent={<ArrowDownTrayIcon className="w-4 h-4" />}
			>
				{isWithdrawing ? "Withdrawing..." : "Withdraw to wallet"}
			</Button>
		</motion.article>
	);
}

export default memo(WithdrawNFTCard);
