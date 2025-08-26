"use client";

import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/react";
import { motion } from "framer-motion";
import { useGachaContracts } from "../hooks/useGachaContracts";
import { useGachaId } from "../hooks/useGachaId";
import { type Rarity, getRarityConfig } from "../lib/rarityConfig";
import { useReadGachaTreasuryGetTreasuryItems } from "../generated";
import { GlassBadge, StandardNFTGrid, useTreasuryItemsToGridItems } from "./ui";
import {
	ExclamationTriangleIcon,
	ArchiveBoxIcon,
} from "@heroicons/react/24/outline";
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
        address: contracts.treasury as `0x${string}` | undefined,
        args: rarity !== null ? [rarity] : undefined,
        query: { enabled: rarity !== null && isOpen && !!contracts.treasury },
    });

	// Convert treasury items to grid items format (must be called before any early returns)
	const gridItems = useTreasuryItemsToGridItems(
		nftItems, // Hook will handle undefined internally
		rarity ?? undefined,
	);

	if (rarity === null) return null;

	const rarityConfig = getRarityConfig(rarity);

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
								{gridItems.length} Available
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
									className="w-16 h-16 border-4 border-white/20 border-t-warning rounded-full"
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
					) : (
                        <StandardNFTGrid
                            items={gridItems}
                            appraisalContractAddress={contracts.appraisal as `0x${string}` | undefined}
                            showAppraisal={true}
                            animate={true}
                            enableLazyLoading={true}
							priorityLoadCount={16} // Load first 16 items with high priority
							itemsPerPage={gridItems.length > 50 ? 50 : undefined} // Paginate if many items
						/>
					)}
				</ModalBody>
			</ModalContent>
		</Modal>
	);
}
