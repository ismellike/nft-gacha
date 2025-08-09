"use client";

import {
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Button,
	Chip,
	Spinner,
} from "@heroui/react";
import { useGachaContracts } from "../hooks/useGachaContracts";
import { useGachaId } from "../hooks/useGachaId";
import { Rarity, getRarityConfig } from "../lib/rarityConfig";
import { useReadGachaTreasuryGetTreasuryItems } from "../generated";
import { NFTInventoryCard } from "./ui";

// NFT Item type matching the contract
interface NFTItem {
	collection: string;
	depositor: string;
	rarity: number;
	tokenId: bigint;
}

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

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			size="5xl"
			scrollBehavior="inside"
			classNames={{
				base: "bg-background/95 backdrop-blur-xl border border-white/10",
				header: "border-b border-white/10",
				body: "py-6",
				footer: "border-t border-white/10",
			}}
		>
			<ModalContent>
				<ModalHeader className="flex flex-col gap-1">
					<div className="flex items-center space-x-4">
						<div
							className={`px-4 py-2 rounded-lg bg-gradient-to-r ${rarityConfig.bgGradient} shadow-lg ${rarityConfig.glowColor}`}
						>
							<span className="text-lg font-bold text-white drop-shadow-sm flex items-center gap-2">
								<span>{rarityConfig.emoji}</span>
								{rarityConfig.name} NFTs
							</span>
						</div>
						{!isLoading && (
							<Chip
								variant="flat"
								size="lg"
								className={`border ${rarityConfig.borderColor} ${rarityConfig.textColor} bg-gradient-to-r ${rarityConfig.bgGradient} bg-opacity-10`}
							>
								{formattedItems.length} Available
							</Chip>
						)}
					</div>
					<p className="text-sm text-foreground/70 font-normal">
						{rarityConfig.description}
					</p>
				</ModalHeader>

				<ModalBody>
					{isLoading ? (
						<div className="flex flex-col items-center justify-center py-20">
							<Spinner
								size="lg"
								color="primary"
								classNames={{
									circle1: rarityConfig.borderColor.replace(
										"border-",
										"border-t-",
									),
									circle2: rarityConfig.borderColor.replace(
										"border-",
										"border-b-",
									),
								}}
							/>
							<p className="text-foreground/70 mt-4">
								Loading {rarityConfig.name} NFTs...
							</p>
						</div>
					) : error ? (
						<div className="text-center py-20">
							<div className="text-6xl mb-4">⚠️</div>
							<h4 className="text-xl font-semibold text-danger mb-2">
								Failed to Load NFTs
							</h4>
							<p className="text-foreground/70">
								Unable to fetch {rarityConfig.name} NFTs. Please try again.
							</p>
						</div>
					) : formattedItems.length === 0 ? (
						<div className="text-center py-20">
							<div className="text-6xl mb-4">📦</div>
							<h4 className="text-xl font-semibold text-foreground mb-2">
								No NFTs Available
							</h4>
							<p className="text-foreground/70">
								There are currently no NFTs in the {rarityConfig.name} rarity
								tier.
							</p>
						</div>
					) : (
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
							{formattedItems.map((item) => (
								<NFTInventoryCard
									key={`${item.collection}-${item.tokenId}`}
									collection={item.collection}
									tokenId={item.tokenId}
									showAppraisal={true}
									imageUrl={item.imageUrl}
									appraisalContractAddress={
										contracts.appraisal!
									}
									animate={true}
								/>
							))}
						</div>
					)}
				</ModalBody>

				<ModalFooter>
					<Button
						color="primary"
						variant="light"
						onPress={onClose}
						className="hover:bg-primary/10"
					>
						Close
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}
