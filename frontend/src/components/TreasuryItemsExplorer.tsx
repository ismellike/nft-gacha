"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { formatUnits } from "viem";
import { formatTokenAmount } from "../lib/utils";
import {
	useReadGachaTreasuryGetTreasuryItems,
	useReadGachaTreasuryGetTreasuryItem,
	useReadGachaTreasuryGetTotalItemsCount,
	useReadGachaGetAverageRarityValues,
	useReadGachaTreasuryGetNftCurrentRarity,
	useReadErc20Decimals,
	useReadErc20Symbol,
	useReadGachaFeeToken,
} from "../generated";
import { useGachaContracts } from "../hooks/useGachaContracts";
import { useGachaId } from "../hooks/useGachaId";
import { RARITY_CONFIG, Rarity } from "../lib/rarityConfig";
import { ThemedIcon } from "../lib/icons";
import { GlassCard, GlassButton, GlassBadge } from "./ui";

interface TreasuryItem {
	nftAddress: `0x${string}`;
	tokenId: bigint;
	depositor: `0x${string}`;
	rarity: Rarity;
	estimatedValue?: bigint;
}

export default function TreasuryItemsExplorer() {
	const [selectedItems, setSelectedItems] = useState<TreasuryItem[]>([]);
	const [currentPage, setCurrentPage] = useState(0);
	const [isLoading, setIsLoading] = useState(true);
	const [selectedRarityFilter, setSelectedRarityFilter] = useState<Rarity | null>(null);
	
	const gachaId = useGachaId();
	const contracts = useGachaContracts(gachaId);
	const itemsPerPage = 12;

	// Contract reads
	const { data: feeToken } = useReadGachaFeeToken({
		address: contracts.gacha!,
		query: { enabled: !!contracts.gacha },
	});

	const { data: tokenDecimals } = useReadErc20Decimals({
		address: feeToken,
		query: { enabled: !!feeToken },
	});

	const { data: tokenSymbol } = useReadErc20Symbol({
		address: feeToken,
		query: { enabled: !!feeToken },
	});

	const { data: averageRarityValues } = useReadGachaGetAverageRarityValues({
		address: contracts.gacha!,
		query: { enabled: !!contracts.gacha },
	});

	// Get total treasury items count to know how many items to fetch
	const { data: totalItemsCount } = useReadGachaTreasuryGetTotalItemsCount({
		address: contracts.treasury!,
		query: { enabled: !!contracts.treasury },
	});

	// Load treasury items using the actual contract calls
	useEffect(() => {
		if (!contracts.treasury || !totalItemsCount) {
			setIsLoading(false);
			return;
		}

		const loadTreasuryItems = async () => {
			setIsLoading(true);
			try {
				const items: TreasuryItem[] = [];
				const itemCount = Math.min(Number(totalItemsCount), 100); // Limit to 100 items for performance

				// Fetch treasury items in batches to avoid RPC limits
				const batchSize = 20;
				for (let i = 0; i < itemCount; i += batchSize) {
					const batchEnd = Math.min(i + batchSize, itemCount);
					const batchPromises = [];

					for (let j = i; j < batchEnd; j++) {
						// Note: This would require implementing a way to fetch treasury items by index
						// For now, we'll show a message that this needs real implementation
					}
				}

				// Since we don't have a direct way to iterate treasury items,
				// we'll keep this as a placeholder for now
				setSelectedItems([]);
			} catch (error) {
				console.error("Failed to load treasury items:", error);
				setSelectedItems([]);
			} finally {
				setIsLoading(false);
			}
		};

		loadTreasuryItems();
	}, [contracts.treasury, totalItemsCount, averageRarityValues]);

	// Format token amounts
	const formatTokenAmountLocal = (amount: bigint | undefined) => {
		if (!amount || !tokenDecimals) return "0";
		return formatTokenAmount(amount, tokenDecimals, {
			maxDecimals: 2,
			minDecimals: 0,
			useGrouping: true,
			notation: "standard",
		});
	};

	const formatAddress = (address: string) => {
		return `${address.slice(0, 6)}...${address.slice(-4)}`;
	};

	// Filter items by rarity
	const filteredItems = selectedRarityFilter 
		? selectedItems.filter(item => item.rarity === selectedRarityFilter)
		: selectedItems;

	// Paginate items
	const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
	const paginatedItems = filteredItems.slice(
		currentPage * itemsPerPage,
		(currentPage + 1) * itemsPerPage
	);

	// Reset pagination when filter changes
	useEffect(() => {
		setCurrentPage(0);
	}, [selectedRarityFilter]);

	return (
		<div className="space-y-8">
			{/* Header */}
			<motion.div
				className="text-center"
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6 }}
			>
				<h2 className="text-4xl font-light mb-4 tracking-tight">
					<span className="bg-gradient-to-r from-foreground to-warning bg-clip-text text-transparent">
						Treasury Explorer
					</span>
				</h2>
				<p className="text-xl text-foreground/70 max-w-2xl mx-auto leading-relaxed font-light">
					Browse all NFTs currently in the gacha treasury pool
				</p>
			</motion.div>

			{/* Rarity Filter */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.1, duration: 0.6 }}
			>
				<GlassCard variant="base" className="p-6">
					<div className="flex flex-wrap gap-2 justify-center">
						<GlassButton
							variant={selectedRarityFilter === null ? "primary" : "secondary"}
							size="sm"
							onClick={() => setSelectedRarityFilter(null)}
							startIcon="filter"
						>
							All ({selectedItems.length})
						</GlassButton>
						{[Rarity.Common, Rarity.Uncommon, Rarity.Rare, Rarity.Epic, Rarity.Legendary].map((rarity) => {
							const count = selectedItems.filter(item => item.rarity === rarity).length;
							const config = RARITY_CONFIG[rarity];
							return (
								<GlassButton
									key={rarity}
									variant={selectedRarityFilter === rarity ? "primary" : "secondary"}
									size="sm"
									onClick={() => setSelectedRarityFilter(rarity)}
									className="flex items-center gap-2"
								>
									<span>{config.emoji}</span>
									{config.name} ({count})
								</GlassButton>
							);
						})}
					</div>
				</GlassCard>
			</motion.div>

			{/* Items Grid */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.2, duration: 0.6 }}
			>
				{isLoading ? (
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
						{[...Array(12)].map((_, i) => (
							<div key={i} className="bg-content1/20 backdrop-blur-xl rounded-xl p-4 animate-pulse">
								<div className="w-full h-48 bg-content1/30 rounded-lg mb-4"></div>
								<div className="space-y-2">
									<div className="w-20 h-4 bg-content1/30 rounded"></div>
									<div className="w-16 h-3 bg-content1/20 rounded"></div>
									<div className="w-24 h-3 bg-content1/20 rounded"></div>
								</div>
							</div>
						))}
					</div>
				) : paginatedItems.length === 0 ? (
					<GlassCard className="p-12 text-center">
						<ThemedIcon
							name="gem"
							size="xl"
							className="mx-auto mb-4 text-foreground/30"
						/>
						<h4 className="text-lg font-medium text-foreground mb-2">
							No Items Found
						</h4>
						<p className="text-foreground/60">
							{selectedRarityFilter 
								? `No ${RARITY_CONFIG[selectedRarityFilter].name.toLowerCase()} items in the treasury`
								: "The treasury is empty"
							}
						</p>
					</GlassCard>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
						{paginatedItems.map((item, index) => {
							const rarityConfig = RARITY_CONFIG[item.rarity];
							return (
								<motion.div
									key={`${item.nftAddress}-${item.tokenId.toString()}`}
									initial={{ opacity: 0, scale: 0.95 }}
									animate={{ opacity: 1, scale: 1 }}
									transition={{ delay: 0.3 + index * 0.05, duration: 0.6 }}
									className="group relative"
								>
									{/* Background glow */}
									<div
										className={`absolute -inset-1 bg-gradient-to-r ${rarityConfig.bgGradient} rounded-xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300`}
									/>

									{/* Card */}
									<GlassCard variant="interactive" className="relative overflow-hidden h-full">
										{/* NFT Image Placeholder */}
										<div className="w-full h-48 bg-gradient-to-br from-content1/30 to-content1/10 rounded-lg mb-4 flex items-center justify-center">
											<div className="text-6xl">{rarityConfig.emoji}</div>
										</div>

										{/* Item Details */}
										<div className="space-y-3">
											{/* Rarity Badge */}
											<div className="flex items-center justify-between">
												<GlassBadge
													variant="primary"
													className={`bg-gradient-to-r ${rarityConfig.bgGradient} text-xs`}
												>
													{rarityConfig.emoji} {rarityConfig.name}
												</GlassBadge>
											</div>

											{/* Token Info */}
											<div>
												<p className="text-sm font-medium text-foreground">
													Token #{item.tokenId.toString()}
												</p>
												<p className="text-xs text-foreground/60 font-mono">
													{formatAddress(item.nftAddress)}
												</p>
											</div>

											{/* Value */}
											{item.estimatedValue && (
												<div>
													<p className="text-xs text-foreground/60 uppercase tracking-wide">
														Estimated Value
													</p>
													<p className="text-sm font-semibold text-warning">
														{formatTokenAmountLocal(item.estimatedValue)} {tokenSymbol}
													</p>
												</div>
											)}

											{/* Depositor */}
											<div>
												<p className="text-xs text-foreground/60 uppercase tracking-wide">
													Depositor
												</p>
												<p className="text-xs font-mono text-foreground/80">
													{formatAddress(item.depositor)}
												</p>
											</div>
										</div>
									</GlassCard>
								</motion.div>
							);
						})}
					</div>
				)}
			</motion.div>

			{/* Pagination */}
			{totalPages > 1 && (
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4, duration: 0.6 }}
					className="flex justify-center items-center gap-4"
				>
					<GlassButton
						variant="secondary"
						size="sm"
						onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
						isDisabled={currentPage === 0}
						startIcon="left"
					>
						Previous
					</GlassButton>
					
					<div className="flex items-center gap-2">
						{Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
							const pageNum = currentPage < 3 ? i : currentPage - 2 + i;
							if (pageNum >= totalPages) return null;
							return (
								<GlassButton
									key={pageNum}
									variant={pageNum === currentPage ? "primary" : "secondary"}
									size="sm"
									onClick={() => setCurrentPage(pageNum)}
									className="min-w-10"
								>
									{pageNum + 1}
								</GlassButton>
							);
						})}
					</div>

					<GlassButton
						variant="secondary"
						size="sm"
						onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
						isDisabled={currentPage === totalPages - 1}
						startIcon="right"
					>
						Next
					</GlassButton>
				</motion.div>
			)}

			{/* Info Note */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.6, duration: 0.6 }}
				className="text-center"
			>
				<GlassCard variant="base" className="p-4">
					<div className="flex items-center justify-center gap-2 text-foreground/60">
						<ThemedIcon name="info" size="sm" />
						<p className="text-sm">
							Treasury explorer requires additional contract methods to fetch individual NFT data. Currently showing placeholder implementation.
						</p>
					</div>
				</GlassCard>
			</motion.div>
		</div>
	);
}