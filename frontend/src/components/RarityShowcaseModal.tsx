"use client";

import {
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Button,
	Card,
	CardBody,
	Image,
	Chip,
	Spinner,
} from "@heroui/react";
import { env } from "../env";
import { Rarity, getRarityConfig } from "../lib/rarityConfig";
import { useReadGachaTreasuryGetTreasuryItems } from "../generated";

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
	// Fetch NFTs for the selected rarity
	const {
		data: nftItems,
		isLoading,
		error,
	} = useReadGachaTreasuryGetTreasuryItems({
		address: env.NEXT_PUBLIC_TREASURY_CONTRACT_ADDRESS,
		args: rarity !== null ? [rarity] : undefined,
		query: { enabled: rarity !== null && isOpen },
	});

	if (rarity === null) return null;

	const rarityConfig = getRarityConfig(rarity);

	// Format NFT display data
	const formatNFTItems = (items: readonly NFTItem[] | undefined) => {
		if (!items) return [];
		return items.map((item) => ({
			collection: item.collection,
			tokenId: item.tokenId.toString(),
			depositor: item.depositor,
			// Generate a placeholder image URL based on contract and tokenId
			imageUrl: `https://via.placeholder.com/200x200/6366f1/ffffff?text=NFT%20${item.tokenId}`,
		}));
	};

	const formattedItems = formatNFTItems(nftItems);

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
							{formattedItems.map((item, index) => (
								<Card
									key={`${item.collection}-${item.tokenId}`}
									className={`group bg-content2/10 backdrop-blur-xl border ${rarityConfig.borderColor} hover:${rarityConfig.borderColor.replace("/50", "/80")} transition-all duration-300 hover:shadow-lg ${rarityConfig.glowColor}`}
								>
									<CardBody className="p-0">
										{/* NFT Image */}
										<div className="relative overflow-hidden rounded-t-lg">
											<Image
												src={item.imageUrl}
												alt={`NFT ${item.tokenId}`}
												className="w-full h-36 object-cover transition-all duration-300"
												loading="lazy"
											/>
											<div className="absolute top-2 right-2">
												<Chip
													color={rarityConfig.chipColor}
													variant="solid"
													size="sm"
													className={`text-xs font-bold bg-gradient-to-r ${rarityConfig.bgGradient} text-white border-transparent`}
												>
													<span className="flex items-center gap-1">
														<span>{rarityConfig.emoji}</span>
														{rarityConfig.name}
													</span>
												</Chip>
											</div>
											{/* Rarity glow overlay */}
											<div
												className={`absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-300 bg-gradient-to-br ${rarityConfig.bgGradient}`}
											></div>
										</div>

										{/* NFT Details */}
										<div className="p-3">
											<h5
												className={`font-semibold ${rarityConfig.textColor} mb-2 text-sm`}
											>
												NFT #{item.tokenId}
											</h5>
											<div className="space-y-1 text-xs">
												<div className="flex justify-between">
													<span className="text-foreground/60">
														Collection:
													</span>
													<span className="text-foreground font-mono">
														{item.collection.slice(0, 6)}...
														{item.collection.slice(-4)}
													</span>
												</div>
												<div className="flex justify-between">
													<span className="text-foreground/60">Depositor:</span>
													<span className="text-foreground font-mono">
														{item.depositor.slice(0, 6)}...
														{item.depositor.slice(-4)}
													</span>
												</div>
											</div>
										</div>
									</CardBody>
								</Card>
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
