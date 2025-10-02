"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Modal, ModalContent, ModalBody } from "@heroui/react";
import { glassModalClasses } from "../ui/modals";
import { Rarity, getRarityConfig } from "../lib/rarityConfig";
import { NFTHeroCard } from "./ui";
import { useEnhancedSpinResult } from "../hooks/useNFTWithMetadata";

interface SpinResult {
	rarity: string;
	collection: string;
	tokenId: string;
	imageUrl?: string;
}

interface NFTRevealModalProps {
	isVisible: boolean;
	nftResult: SpinResult;
	onClose: () => void;
	appraisalContractAddress: `0x${string}`;
}

export default function NFTRevealModal({
	isVisible,
	nftResult,
	onClose,
	appraisalContractAddress,
}: NFTRevealModalProps) {
	const [showCard, setShowCard] = useState(false);

	// Get enhanced spin result with metadata
	const enhancedResult = useEnhancedSpinResult(nftResult);

	useEffect(() => {
		if (isVisible) {
			// Add dramatic delay before showing the NFT card
			const timer = setTimeout(() => {
				setShowCard(true);
			}, 1500);
			return () => clearTimeout(timer);
		} else {
			setShowCard(false);
		}
	}, [isVisible]);

	const resultRarity =
		Rarity[nftResult.rarity as keyof typeof Rarity] || Rarity.Common;
	const rarityConfig = getRarityConfig(resultRarity);

	return (
		<Modal
			isOpen={isVisible}
			onClose={onClose}
			size="full"
			hideCloseButton
			classNames={{
				backdrop: glassModalClasses.backdrop,
				base: glassModalClasses.contentDark,
				body: glassModalClasses.body,
			}}
			placement="center"
		>
			<ModalContent>
				<ModalBody className="relative overflow-hidden p-0 min-h-screen flex items-center justify-center">
					{/* Close Button - Top Right of Modal */}
					<motion.button
						onClick={onClose}
						className="absolute top-8 right-8 z-50 w-12 h-12 bg-content1/60 hover:bg-content1/80 rounded-xl border border-white/30 shadow-xl backdrop-blur-xl flex items-center justify-center group transition-colors"
						initial={{ opacity: 0, scale: 0 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ delay: showCard ? 1 : 0, duration: 0.5 }}
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

					{/* Dramatic Background Glow */}
					<motion.div
						className="absolute inset-0 overflow-hidden"
						initial={{ opacity: 0 }}
						animate={{ opacity: showCard ? 1 : 0 }}
						transition={{ duration: 2 }}
					>
						<motion.div
							className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
							initial={{ scale: 0 }}
							animate={{ scale: showCard ? 1 : 0 }}
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

					{/* NFT Card */}
					<div className="relative z-10 flex items-center justify-center min-h-screen">
						<AnimatePresence>
							{showCard && (
								<motion.div
									initial={{
										opacity: 0,
										scale: 0.3,
										rotateY: -180,
									}}
									animate={{
										opacity: 1,
										scale: 1,
										rotateY: 0,
									}}
									exit={{
										opacity: 0,
										scale: 0.8,
									}}
									transition={{
										duration: 1.2,
										ease: "easeOut",
										type: "spring",
										damping: 20,
										stiffness: 100,
									}}
									className="relative"
									style={{ perspective: 1000 }}
								>
									{/* NFT Card - Using same size as rarity showcase */}
									<div className="flex flex-col items-center">
										<NFTHeroCard
											collection={nftResult.collection}
											tokenId={nftResult.tokenId}
											imageUrl={
												enhancedResult?.imageUrl || nftResult.imageUrl || ""
											}
											showAppraisal={true}
											appraisalContractAddress={appraisalContractAddress}
											animate={true}
											rarity={resultRarity}
										/>
									</div>
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				</ModalBody>
			</ModalContent>
		</Modal>
	);
}
