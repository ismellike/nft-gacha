"use client";

import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/react";
import { motion } from "framer-motion";
import { useGachaContracts } from "../hooks/useGachaContracts";
import { useGachaId } from "../hooks/useGachaId";
import { Rarity, getRarityConfig } from "../lib/rarityConfig";
import { useReadGachaTreasuryGetTreasuryItems } from "../generated";
import { NFTInventoryCard, GlassBadge } from "./ui";
import { ThemedIcon } from "../lib/icons";
import { glassModal } from "../lib/theme-config";

interface RarityShowcaseModalProps {
	isOpen: boolean;
	onClose: () => void;
	rarity: Rarity | null;
}

export default function RarityShowcaseModal({
	isOpen,
	onClose,
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
		address: contracts.treasury!,
		args: rarity !== null ? [rarity] : undefined,
		query: { enabled: rarity !== null && isOpen && !!contracts.treasury },
	});

	if (rarity === null) return null;

	const rarityConfig = getRarityConfig(rarity);

	// Format NFT display data
	const formattedItems = nftItems
		? nftItems.map((item) => ({
				collection: item.collection,
				tokenId: item.tokenId.toString(),
				depositor: item.depositor,
				// Generate a placeholder image URL based on contract and tokenId
				imageUrl: `https://via.placeholder.com/200x200/6366f1/ffffff?text=NFT%20${item.tokenId}`,
			}))
		: [];

	const modalStyles = glassModal({ size: "7xl" });

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			size="full"
			scrollBehavior="inside"
			classNames={{
				wrapper: modalStyles.wrapper(),
				backdrop: modalStyles.backdrop(),
				base: modalStyles.base(),
				header: modalStyles.header(),
				body: modalStyles.body(),
				footer: modalStyles.footer(),
			}}
			motionProps={{
				variants: {
					enter: {
						scale: 1,
						opacity: 1,
						transition: {
							type: "spring",
							stiffness: 300,
							damping: 30,
						},
					},
					exit: {
						scale: 0.95,
						opacity: 0,
						transition: {
							duration: 0.2,
						},
					},
				},
			}}
		>
			<ModalContent>
				<ModalHeader className="flex-col gap-3">
					<div className="flex items-center space-x-4">
						<motion.div
							className={`px-4 py-2 rounded-lg bg-gradient-to-r ${rarityConfig.bgGradient} shadow-lg border border-white/20`}
							whileHover={{ scale: 1.02 }}
							transition={{ type: "spring", stiffness: 400 }}
						>
							<span className="text-lg font-bold text-white drop-shadow-sm flex items-center gap-2">
								<span className="text-xl">{rarityConfig.emoji}</span>
								{rarityConfig.name} NFTs
							</span>
						</motion.div>
						{!isLoading && (
							<GlassBadge variant="primary" size="md">
								{formattedItems.length} Available
							</GlassBadge>
						)}
					</div>
					<p className="text-sm text-foreground/70 font-normal max-w-2xl text-left">
						{rarityConfig.description}
					</p>
				</ModalHeader>

				<ModalBody>
					{isLoading ? (
						<motion.div
							className="flex flex-col items-center justify-center py-32"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
						>
							<div className="relative">
								<motion.div
									className="w-16 h-16 border-4 border-white/20 border-t-yellow-400 rounded-full"
									animate={{ rotate: 360 }}
									transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
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
							<ThemedIcon
								name="alert-triangle"
								size="2xl"
								className="text-danger mb-6 mx-auto"
							/>
							<h4 className="text-2xl font-semibold text-danger mb-4">
								Failed to Load NFTs
							</h4>
							<p className="text-foreground/70 text-lg">
								Unable to fetch {rarityConfig.name} NFTs. Please try again.
							</p>
						</motion.div>
					) : formattedItems.length === 0 ? (
						<motion.div
							className="text-center py-32"
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
						>
							<ThemedIcon
								name="archive"
								size="2xl"
								className="text-foreground/50 mb-6 mx-auto"
							/>
							<h4 className="text-2xl font-semibold text-foreground mb-4">
								No NFTs Available
							</h4>
							<p className="text-foreground/70 text-lg">
								There are currently no NFTs in the {rarityConfig.name} rarity
								tier.
							</p>
						</motion.div>
					) : (
						<motion.div
							className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6 gap-6"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ staggerChildren: 0.03 }}
						>
							{formattedItems.map((item, index) => (
								<motion.div
									key={`${item.collection}-${item.tokenId}`}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: index * 0.03 }}
								>
									<NFTInventoryCard
										collection={item.collection}
										tokenId={item.tokenId}
										showAppraisal={true}
										imageUrl={item.imageUrl}
										appraisalContractAddress={contracts.appraisal!}
										animate={true}
										rarity={rarity}
									/>
								</motion.div>
							))}
						</motion.div>
					)}
				</ModalBody>
			</ModalContent>
		</Modal>
	);
}
