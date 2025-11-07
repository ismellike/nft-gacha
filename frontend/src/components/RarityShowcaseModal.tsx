"use client";

import { GlassModal } from "../ui";
import { ModalContent, ModalBody } from "@heroui/react";
import { motion } from "framer-motion";
import { useGachaContracts } from "../hooks/useGachaContracts";
import { useGachaId } from "../hooks/useGachaId";
import { type Rarity, getRarityConfig } from "../lib/rarityConfig";
import { useReadGachaTreasuryGetTreasuryItems } from "../generated";
import { NFTGrid, useTreasuryItemsToGridItems } from ".";
import {
	ExclamationTriangleIcon,
	ArchiveBoxIcon,
} from "@heroicons/react/24/outline";

interface RarityShowcaseModalProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	rarity: Rarity | null;
}

export default function RarityShowcaseModal({
	isOpen,
	onOpenChange,
	rarity,
}: RarityShowcaseModalProps) {
	// Get gacha ID and contract addresses
	const gachaId = useGachaId();
	const contracts = useGachaContracts(gachaId);

	// Fetch NFTs for the selected rarity
	const {
		data: nftItems,
		isLoading,
		error,
	} = useReadGachaTreasuryGetTreasuryItems({
		address: contracts.treasury as `0x${string}` | undefined,
		args: rarity !== null ? [rarity] : undefined,
		query: { enabled: rarity !== null && isOpen && !!contracts.treasury },
	} as Parameters<typeof useReadGachaTreasuryGetTreasuryItems>[0]);

	// Convert treasury items to grid items format (must be called before any early returns)
	const treasuryItemsNormalized = Array.isArray(nftItems)
		? (nftItems as readonly {
				collection: string;
				tokenId: bigint;
				depositor: string;
				[key: string]: unknown;
			}[])
		: undefined;

	const gridItems = useTreasuryItemsToGridItems(
		treasuryItemsNormalized,
		rarity ?? undefined,
	);

	if (rarity === null) return null;

	const rarityConfig = getRarityConfig(rarity);

	return (
		<GlassModal
			isOpen={isOpen}
			onOpenChange={onOpenChange}
			size="full"
			hideCloseButton
			placement="center"
		>
			<ModalContent>
				<ModalBody className="relative overflow-hidden p-0 h-[95vh] flex flex-col">
					{/* Floating Close Button - Top Right */}
					<motion.button
						onClick={() => onOpenChange(false)}
						className="absolute top-8 right-8 z-50 w-12 h-12 bg-content1/60 hover:bg-content1/80 rounded-xl border border-white/30 shadow-xl backdrop-blur-xl flex items-center justify-center group transition-colors"
						initial={{ opacity: 0, scale: 0 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.5 }}
						whileHover={{ scale: 1.1 }}
						whileTap={{ scale: 0.95 }}
					>
						<svg
							className="w-6 h-6 text-foreground/70 group-hover:text-foreground transition-colors"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							strokeWidth={2.5}
						>
							<title>Close</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</motion.button>

					{/* Header Content */}
					<div className="relative z-10 flex items-center justify-between pt-8 pb-4 px-8">
						{/* Rarity on the left */}
						<div
							className={`px-4 py-2 rounded-xl bg-gradient-to-r ${rarityConfig.bgGradient} shadow-lg border border-white/20`}
						>
							<span className="text-lg font-bold text-white drop-shadow flex items-center gap-2">
								<span className="text-xl">{rarityConfig.emoji}</span>
								{rarityConfig.name} NFTs
							</span>
						</div>

						{/* NFT count centered */}
						{!isLoading && (
							<div className="flex justify-center flex-1">
								<div className="flex flex-col items-center gap-1">
									<p className="text-2xl font-bold text-foreground">
										{gridItems.length}
									</p>
									<p className="text-xs text-foreground/50">Available</p>
								</div>
							</div>
						)}

						{/* Spacer for balance */}
						<div className="w-32" />
					</div>
					{/* Dramatic Background Glow */}
					<motion.div
						className="absolute inset-0 overflow-hidden"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 2 }}
					>
						<motion.div
							className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
							initial={{ scale: 0 }}
							animate={{ scale: 1 }}
							transition={{ duration: 1.5, ease: "easeOut" }}
						>
							<motion.div
								className={`w-96 h-96 ${rarityConfig.bgGradient} rounded-full blur-3xl`}
								animate={{
									scale: [1, 1.1, 1],
									opacity: [0.3, 0.5, 0.3],
								}}
								transition={{
									duration: 4,
									repeat: Infinity,
									ease: "easeInOut",
								}}
							/>
						</motion.div>
					</motion.div>
					<div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-content1/20 via-content1/10 to-content1/30" />
					{/* Body Content */}
					<div className="relative z-10 w-full flex-1 px-6 pb-6 flex flex-col overflow-hidden">
						{isLoading ? (
							<motion.div
								className="flex flex-col items-center justify-center py-32"
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
							>
								<div className="relative">
									<motion.div
										className="w-16 h-16 border-4 border-white/20 border-t-warning rounded-full"
										animate={{ rotate: 360 }}
										transition={{
											duration: 1,
											repeat: Infinity,
											ease: "linear",
										}}
									/>
								</div>
								<p className="text-foreground/70 mt-6 text-lg">
									Loading {rarityConfig.name} NFTs...
								</p>
							</motion.div>
						) : error ? (
							<motion.div
								className="text-center py-32"
								initial={{ opacity: 0, scale: 0.95 }}
								animate={{ opacity: 1, scale: 1 }}
							>
								<ExclamationTriangleIcon className="w-10 h-10 text-danger mb-6 mx-auto" />
								<h4 className="text-2xl font-semibold text-danger mb-4">
									Failed to Load NFTs
								</h4>
								<p className="text-foreground/70 text-lg">
									Unable to fetch {rarityConfig.name} NFTs. Please try again.
								</p>
							</motion.div>
						) : gridItems.length === 0 ? (
							<motion.div
								className="text-center py-32"
								initial={{ opacity: 0, scale: 0.95 }}
								animate={{ opacity: 1, scale: 1 }}
							>
								<ArchiveBoxIcon className="w-10 h-10 text-foreground/50 mb-6 mx-auto" />
								<h4 className="text-2xl font-semibold text-foreground mb-4">
									No NFTs Available
								</h4>
								<p className="text-foreground/70 text-lg">
									There are currently no NFTs in the {rarityConfig.name} rarity
									tier.
								</p>
							</motion.div>
						) : contracts.appraisal ? (
							<div className="w-full h-full overflow-y-auto">
								<NFTGrid
									items={gridItems}
									size="comfortable"
									layout="grid"
									theme="glass"
									gap="md"
									showAppraisal={false}
									showTraits={false}
									animate={true}
									virtualize={false}
									lazyLoad={true}
									className="w-full"
								/>
							</div>
						) : null}
					</div>
				</ModalBody>
			</ModalContent>
		</GlassModal>
	);
}
