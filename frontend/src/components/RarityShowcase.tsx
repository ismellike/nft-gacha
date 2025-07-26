"use client";

import { Button, Card, CardBody, CardHeader, Image, Chip } from "@heroui/react";
import { useState } from "react";
import { env } from "../env";
import { Rarity, RARITY_CONFIG, getRarityConfig, getAllRarities } from "../lib/rarityConfig";
import {
	useReadGachaTreasuryGetTreasuryItems,
} from "../generated";

// NFT Item type matching the contract
interface NFTItem {
	collection: string;
	depositor: string;
	rarity: number;
	tokenId: bigint;
}

export default function RarityShowcase() {
	const [selectedRarity, setSelectedRarity] = useState<Rarity>(Rarity.Common);

	// Fetch NFTs for the selected rarity
	const { data: nftItems, isLoading } = useReadGachaTreasuryGetTreasuryItems({
		address: env.NEXT_PUBLIC_TREASURY_CONTRACT_ADDRESS,
		args: [selectedRarity],
	});

	const rarityData = getAllRarities().map(rarity => ({
		rarity,
		...getRarityConfig(rarity),
	}));

	const currentRarity = rarityData[selectedRarity];

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
		<div className="space-y-8">
			{/* Header */}
			<div className="text-center">
				<h2 className="text-4xl font-light text-foreground tracking-tight mb-4">
					Rarity Showcase
				</h2>
				<p className="text-foreground/70 max-w-2xl mx-auto">
					Discover the NFTs available in each rarity tier. Browse through different rarities to see what treasures await in your next spin!
				</p>
			</div>

			{/* Rarity Selection */}
			<Card className="bg-content1/20 backdrop-blur-xl border border-white/10 shadow-2xl">
				<CardHeader className="pb-4">
					<h3 className="text-2xl font-light text-foreground tracking-tight">
						Select Rarity
					</h3>
				</CardHeader>
				<CardBody>
					<div className="flex flex-wrap gap-3">
						{rarityData.map((rarity) => (
							<Button
								key={rarity.rarity}
								variant={selectedRarity === rarity.rarity ? "solid" : "bordered"}
								color={selectedRarity === rarity.rarity ? rarity.chipColor : "default"}
								onPress={() => setSelectedRarity(rarity.rarity)}
								className={`flex-1 min-w-[120px] ${
									selectedRarity === rarity.rarity 
										? `bg-gradient-to-r ${rarity.bgGradient} text-white border-transparent` 
										: `border-2 ${rarity.borderColor} hover:${rarity.borderColor.replace('/50', '/80')} ${rarity.textColor} hover:bg-gradient-to-r hover:${rarity.bgGradient} hover:text-white transition-all duration-300`
								}`}
							>
								<div className="text-center">
									<div className="font-semibold flex items-center justify-center gap-1">
										<span>{rarity.emoji}</span>
										{rarity.name}
									</div>
									<div className={`text-xs ${selectedRarity === rarity.rarity ? 'opacity-70' : 'opacity-60'}`}>
										{rarity.description}
									</div>
								</div>
							</Button>
						))}
					</div>
				</CardBody>
			</Card>

			{/* Selected Rarity Display */}
			<Card className="bg-content1/20 backdrop-blur-xl border border-white/10 shadow-2xl">
				<CardHeader className="pb-6">
					<div className="flex items-center justify-between w-full">
						<div className="flex items-center space-x-4">
							<div
								className={`px-4 py-2 rounded-lg bg-gradient-to-r ${currentRarity.bgGradient} shadow-lg ${currentRarity.glowColor}`}
							>
								<span className="text-lg font-bold text-white drop-shadow-sm flex items-center gap-2">
									<span>{currentRarity.emoji}</span>
									{currentRarity.name}
								</span>
							</div>
							<Chip
								variant="flat"
								size="lg"
								className={`border ${currentRarity.borderColor} ${currentRarity.textColor} bg-gradient-to-r ${currentRarity.bgGradient} bg-opacity-10`}
								style={{
									backgroundColor: `transparent`,
									color: `inherit`,
								}}
							>
								{formattedItems.length} NFTs Available
							</Chip>
						</div>
					</div>
				</CardHeader>
				<CardBody>
					{isLoading ? (
						<div className="flex justify-center items-center py-12">
							<div className="text-center">
								<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
								<p className="text-foreground/70">Loading NFTs...</p>
							</div>
						</div>
					) : formattedItems.length === 0 ? (
						<div className="text-center py-12">
							<div className="text-6xl mb-4">📦</div>
							<h4 className="text-xl font-semibold text-foreground mb-2">
								No NFTs Available
							</h4>
							<p className="text-foreground/70">
								There are currently no NFTs in the {currentRarity.name} rarity tier.
							</p>
						</div>
					) : (
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
							{formattedItems.map((item, index) => (
								<Card
									key={`${item.collection}-${item.tokenId}`}
									className={`group bg-content2/10 backdrop-blur-xl border ${currentRarity.borderColor} hover:${currentRarity.borderColor.replace('/50', '/80')} transition-all duration-300 hover:shadow-lg ${currentRarity.glowColor}`}
								>
									<CardBody className="p-0">
										{/* NFT Image */}
										<div className="relative overflow-hidden rounded-t-lg">
											<Image
												src={item.imageUrl}
												alt={`NFT ${item.tokenId}`}
												className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
												loading="lazy"
											/>
											<div className="absolute top-2 right-2">
												<Chip
													color={currentRarity.chipColor}
													variant="solid"
													size="sm"
													className={`text-xs font-bold bg-gradient-to-r ${currentRarity.bgGradient} text-white border-transparent`}
												>
													<span className="flex items-center gap-1">
														<span>{currentRarity.emoji}</span>
														{currentRarity.name}
													</span>
												</Chip>
											</div>
											{/* Rarity glow overlay */}
											<div className={`absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-300 bg-gradient-to-br ${currentRarity.bgGradient}`}></div>
										</div>

										{/* NFT Details */}
										<div className="p-4">
											<h5 className={`font-semibold ${currentRarity.textColor} mb-2`}>
												NFT #{item.tokenId}
											</h5>
											<div className="space-y-1 text-sm">
												<div className="flex justify-between">
													<span className="text-foreground/60">Collection:</span>
													<span className="text-foreground font-mono text-xs">
														{item.collection.slice(0, 6)}...{item.collection.slice(-4)}
													</span>
												</div>
												<div className="flex justify-between">
													<span className="text-foreground/60">Depositor:</span>
													<span className="text-foreground font-mono text-xs">
														{item.depositor.slice(0, 6)}...{item.depositor.slice(-4)}
													</span>
												</div>
											</div>
										</div>
									</CardBody>
								</Card>
							))}
						</div>
					)}
				</CardBody>
			</Card>
		</div>
	);
}