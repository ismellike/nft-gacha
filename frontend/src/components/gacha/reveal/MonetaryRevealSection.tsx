import { AnimatePresence, motion } from "framer-motion";
import type { NFTMetadata } from "../../../lib/metadataValidation";
import { getRarityConfig } from "../../../lib/rarityConfig";
import SellToTreasury from "../../nft/SellToTreasury";
import SharePullButton from "../SharePullButton";

interface MonetaryRevealSectionProps {
	isMetadataLoading: boolean;
	currentPhase: string | null;
	resultRarity: number;
	rarityName: string;
	nftCollection: string;
	nftTokenId: string;
	enhancedMetadata: NFTMetadata | null;
	appraisalContractAddress: `0x${string}`;
	protocolTreasuryAddress: string;
	gachaTreasuryAddress: string;
}

export function MonetaryRevealSection({
	isMetadataLoading,
	currentPhase,
	resultRarity,
	rarityName,
	nftCollection,
	nftTokenId,
	enhancedMetadata,
	appraisalContractAddress,
	protocolTreasuryAddress,
	gachaTreasuryAddress,
}: MonetaryRevealSectionProps) {
	if (isMetadataLoading || currentPhase !== "monetary") return null;

	const rarityConfig = getRarityConfig(resultRarity);

	return (
		<AnimatePresence>
			<motion.div
				key="monetary-reveal"
				initial={{ opacity: 0, scale: 0.5, y: 50 }}
				animate={{ opacity: 1, scale: 1, y: 0 }}
				exit={{ opacity: 0, scale: 0.8, y: 20 }}
				transition={{
					duration: 0.8,
					type: "spring",
					stiffness: 200,
					damping: 15,
				}}
				className="flex flex-col items-center gap-6 mt-8"
			>
				{/* Dramatic "Value Revealed" Label */}
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2, duration: 0.5 }}
					className="text-center"
				>
					<motion.p
						className={`text-sm uppercase tracking-[0.3em] ${rarityConfig.textColor} font-bold mb-2`}
						animate={{ opacity: [0.5, 1, 0.5] }}
						transition={{ duration: 2, repeat: Infinity }}
					>
						Appraisal Value
					</motion.p>
				</motion.div>

				{/* Action Buttons */}
				<div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
					{/* Sell Button with Dramatic Entrance */}
					<motion.div
						className="z-50 flex justify-center pointer-events-auto"
						initial={{ opacity: 0, scale: 0.8, y: 30 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						transition={{
							delay: 0.4,
							duration: 0.6,
							type: "spring",
							stiffness: 150,
							damping: 12,
						}}
						whileHover={{ scale: 1.05 }}
					>
						<SellToTreasury
							collection={nftCollection}
							tokenId={nftTokenId}
							appraisalContractAddress={appraisalContractAddress}
							protocolTreasuryAddress={protocolTreasuryAddress}
							gachaTreasuryAddress={gachaTreasuryAddress}
							size="lg"
							variant="button"
						/>
					</motion.div>

					{/* Share Button */}
					<SharePullButton
						rarity={resultRarity}
						metadata={enhancedMetadata}
						rarityName={rarityName}
						animationDelay={0.6}
					/>
				</div>

				{/* Sparkle Effects for Value Reveal */}
				{/* Sparkle effects for rare+ (index 2 = Rare in the default 5-rarity system) */}
			{resultRarity >= 2 && (
					<motion.div
						className="absolute inset-0 pointer-events-none -z-10"
						initial={{ opacity: 0 }}
						animate={{ opacity: [0, 0.6, 0.3] }}
						transition={{ duration: 1.5, times: [0, 0.5, 1] }}
					>
						<div
							className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${rarityConfig.bgGradient} opacity-30 blur-2xl`}
						/>
					</motion.div>
				)}
			</motion.div>
		</AnimatePresence>
	);
}
