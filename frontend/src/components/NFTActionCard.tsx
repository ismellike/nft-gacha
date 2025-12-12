"use client";

import { motion } from "framer-motion";
import { NFTCard } from "./NFTCard";
import { Button } from "../ui";
import { Chip } from "../ui/Chip";

export interface SimpleNFT {
	collection: string;
	tokenId: string;
	collectionName?: string;
	rarity?: string;
	isAppraised?: boolean;
	canWithdraw?: boolean;
	depositCount?: bigint;
	appraisedValue?: bigint;
}

interface NFTActionCardProps {
	nft: SimpleNFT;
	mode: "deposit" | "withdraw";
	onAction: (nft: SimpleNFT) => void;
	isProcessing?: boolean;
}

export function NFTActionCard({
	nft,
	mode,
	onAction,
	isProcessing = false,
}: NFTActionCardProps) {
	const id = `${nft.collection}:${nft.tokenId}`;

	const getActionConfig = () => {
		if (mode === "deposit") {
			return nft.isAppraised
				? { text: "Deposit to vault", color: "primary" as const }
				: { text: "Appraisal required", color: "warning" as const };
		} else {
			return nft.canWithdraw
				? { text: "Withdraw from vault", color: "primary" as const }
				: {
						text: "Locked in Gacha",
						color: "default" as const,
						disabled: true,
					};
		}
	};

	const config = getActionConfig();

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3 }}
			whileHover={{ scale: 1.02 }}
			className="group"
		>
			<div className="relative bg-content1/20 backdrop-blur-xl border border-white/10 rounded-2xl p-4 space-y-3 hover:border-white/20 transition-all duration-200">
				<div className="flex items-center justify-between text-foreground/70 text-xs">
					<span className="truncate" title={nft.collectionName || nft.collection}>
						{nft.collectionName || id}
					</span>
					<Chip
						size="sm"
						variant="flat"
						color="primary"
						className="text-xs"
					>
						{mode === "deposit" ? "Wallet NFT" : "Vault NFT"}
					</Chip>
				</div>

				{/* NFT Card - consistent layout across deposit/withdraw */}
				<NFTCard
					data={{
						collection: nft.collection,
						tokenId: nft.tokenId,
						rarity: nft.rarity as any,
						appraisedValue: nft.appraisedValue,
					}}
					size="lg"
					showCollectionName={true}
				/>

				<div className="flex items-center justify-between text-foreground/60 text-sm">
					<span>Token #{nft.tokenId}</span>
					{nft.appraisedValue ? (
						<span className="text-foreground/80">
							Appraised: {nft.appraisedValue.toString()}
						</span>
					) : (
						<span className="text-foreground/50">
							{mode === "deposit" ? "Awaiting appraisal" : "No appraisal data"}
						</span>
					)}
				</div>

				{/* Simple Action Button */}
				<Button
					className="w-full"
					color={config.color}
					onPress={() => onAction(nft)}
					isDisabled={config.disabled || isProcessing}
					isLoading={isProcessing}
					size="sm"
				>
					{config.text}
				</Button>

				{/* Hover effect overlay */}
				<div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
			</div>
		</motion.div>
	);
}
