"use client";

import { useState, useImperativeHandle, forwardRef } from "react";
import { Rarity, getRarityConfig } from "../lib/rarityConfig";
import { glassTypography } from "../lib/theme-config";
import { Card } from "./ui";
import {
	useReadGachaTreasuryGetAllRarityCounts,
	useReadGachaGetRarityWeights,
	useReadGachaGetAverageRarityValues,
} from "../generated";
import { useGachaContracts } from "../hooks/useGachaContracts";
import { useGachaId } from "../hooks/useGachaId";
import RarityShowcaseModal from "./RarityShowcaseModal";

interface RarityBreakdownRef {
	refreshCounts: () => void;
}

const RarityBreakdown = forwardRef<RarityBreakdownRef>((_props, ref) => {
	const [selectedRarity, setSelectedRarity] = useState<Rarity | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);

	// Get gacha ID and contract addresses
	const gachaId = useGachaId();
	const contracts = useGachaContracts(gachaId);

	const handleRarityClick = (rarity: Rarity) => {
		setSelectedRarity(rarity);
		setIsModalOpen(true);
	};

	const handleModalOpenChange = (open: boolean) => {
		setIsModalOpen(open);
		if (!open) {
			setSelectedRarity(null);
		}
	};

    // Batch fetch all rarity counts in single RPC call
    const rarityCountsQuery = useReadGachaTreasuryGetAllRarityCounts({
        address: contracts.treasury,
        query: { enabled: !!contracts.treasury },
    } as Parameters<typeof useReadGachaTreasuryGetAllRarityCounts>[0]);
    const allRarityCounts = rarityCountsQuery.data as unknown as readonly bigint[] | undefined;

	// Rarity weights from gacha contract
    const rarityWeightsQuery = useReadGachaGetRarityWeights({
        address: contracts.gacha as `0x${string}` | undefined,
        query: { enabled: !!contracts.gacha },
    } as Parameters<typeof useReadGachaGetRarityWeights>[0]);
    const rarityWeights = rarityWeightsQuery.data as unknown as readonly bigint[] | undefined;

    // Additional treasury data (omitted for now)

    const averageRarityValuesQuery = useReadGachaGetAverageRarityValues({
        address: contracts.gacha as `0x${string}` | undefined,
        query: { enabled: !!contracts.gacha },
    } as Parameters<typeof useReadGachaGetAverageRarityValues>[0]);
    const averageRarityValues = averageRarityValuesQuery.data as unknown as readonly bigint[] | undefined;

	// Expose refresh function to parent component
	useImperativeHandle(ref, () => ({
		refreshCounts: () => {
			console.log("🔄 Refreshing rarity counts after spin completion");
			rarityCountsQuery.refetch();
		},
	}));

	// Convert rarity weights to percentages (weights are in basis points, total 10000)
	const getRarityPercentage = (index: number): number => {
		if (!rarityWeights || rarityWeights.length <= index) return 0;
		return Number(rarityWeights[index]) / 100; // Convert basis points to percentage
	};

	const rarityStats = [
		{
			rarity: Rarity.Common,
			...getRarityConfig(Rarity.Common),
			percentage: getRarityPercentage(0),
			count: Number(allRarityCounts?.[0] || 0),
			avgValue: averageRarityValues?.[0] || BigInt(0),
		},
		{
			rarity: Rarity.Uncommon,
			...getRarityConfig(Rarity.Uncommon),
			percentage: getRarityPercentage(1),
			count: Number(allRarityCounts?.[1] || 0),
			avgValue: averageRarityValues?.[1] || BigInt(0),
		},
		{
			rarity: Rarity.Rare,
			...getRarityConfig(Rarity.Rare),
			percentage: getRarityPercentage(2),
			count: Number(allRarityCounts?.[2] || 0),
			avgValue: averageRarityValues?.[2] || BigInt(0),
		},
		{
			rarity: Rarity.Epic,
			...getRarityConfig(Rarity.Epic),
			percentage: getRarityPercentage(3),
			count: Number(allRarityCounts?.[3] || 0),
			avgValue: averageRarityValues?.[3] || BigInt(0),
		},
		{
			rarity: Rarity.Legendary,
			...getRarityConfig(Rarity.Legendary),
			percentage: getRarityPercentage(4),
			count: Number(allRarityCounts?.[4] || 0),
			avgValue: averageRarityValues?.[4] || BigInt(0),
		},
	] as const;

	return (
		<Card glassVariant="glass" className="h-full">
			<div className="p-6 pb-2 border-b border-white/10">
				<h3 className={glassTypography({ variant: "secondaryHeading" })}>
					Drop Rates
				</h3>
			</div>
			<div className="p-6 pt-4 space-y-4">
				{rarityStats.map((rarity) => (
					<button
						type="button"
						key={rarity.name}
						className="group relative cursor-pointer text-left w-full"
						onClick={() => handleRarityClick(rarity.rarity)}
					>
						{/* Enhanced glow effect */}
						<div
							className={`absolute inset-1 bg-gradient-to-r ${rarity.bgGradient} rounded-xl blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-500 ${rarity.glowColor}`}
						></div>

						{/* Main card with rarity-specific styling */}
						<div
							className={`relative bg-content2/10 backdrop-blur-xl border ${rarity.borderColor} hover:${rarity.borderColor.replace("/50", "/80")} rounded-xl p-4 hover:bg-content2/20 transition-colors duration-300 shadow-md ${rarity.glowColor}`}
						>
							{/* Header with rarity name and stats */}
							<div className="flex justify-between items-center mb-3">
								<div
									className={`px-3 py-1.5 rounded-lg bg-gradient-to-r ${rarity.bgGradient} shadow-lg`}
								>
									<span className="text-sm font-bold text-white drop-shadow-sm flex items-center gap-1">
										<span>{rarity.emoji}</span>
										{rarity.name}
									</span>
								</div>
								<div className="text-right">
									<div
										className={`text-lg font-bold bg-gradient-to-r ${rarity.bgGradient} bg-clip-text text-transparent`}
									>
										{rarity.percentage}%
									</div>
									<div className={`text-xs font-medium ${rarity.textColor}`}>
										{rarity.count} items
									</div>
								</div>
							</div>

							{/* Enhanced progress bar */}
							<div className="relative">
								<div className="h-3 bg-content3/30 backdrop-blur-sm rounded-full overflow-hidden border border-white/5">
									<div
										className={`h-full bg-gradient-to-r ${rarity.bgGradient} rounded-full shadow-lg transition-all duration-1000 ease-out relative overflow-hidden`}
										style={{ width: `${rarity.percentage}%` }}
									>
										{/* Enhanced shimmer effect */}
										<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
									</div>
								</div>
							</div>

							{/* Rarity description */}
							<div className="mt-2 flex justify-between items-center">
								<span className={`text-xs ${rarity.textColor} font-medium`}>
									{rarity.description}
								</span>
								<span className="text-xs text-foreground/50">
									Click to view NFTs →
								</span>
							</div>
						</div>
					</button>
				))}
			</div>

			{/* Rarity Showcase Modal */}
			<RarityShowcaseModal
				isOpen={isModalOpen}
				onOpenChange={handleModalOpenChange}
				rarity={selectedRarity}
			/>
		</Card>
	);
});

RarityBreakdown.displayName = "RarityBreakdown";

export default RarityBreakdown;
