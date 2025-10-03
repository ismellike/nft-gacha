"use client";

import { useState, useImperativeHandle, forwardRef } from "react";
import { Rarity, getRarityConfig } from "../lib/rarityConfig";
import { Card } from "../ui";
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
	const allRarityCounts = rarityCountsQuery.data as unknown as
		| readonly bigint[]
		| undefined;

	// Rarity weights from gacha contract
	const rarityWeightsQuery = useReadGachaGetRarityWeights({
		address: contracts.gacha as `0x${string}` | undefined,
		query: { enabled: !!contracts.gacha },
	} as Parameters<typeof useReadGachaGetRarityWeights>[0]);
	const rarityWeights = rarityWeightsQuery.data as unknown as
		| readonly bigint[]
		| undefined;

	// Additional treasury data (omitted for now)

	const averageRarityValuesQuery = useReadGachaGetAverageRarityValues({
		address: contracts.gacha as `0x${string}` | undefined,
		query: { enabled: !!contracts.gacha },
	} as Parameters<typeof useReadGachaGetAverageRarityValues>[0]);
	const averageRarityValues = averageRarityValuesQuery.data as unknown as
		| readonly bigint[]
		| undefined;

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

	const totalItems = rarityStats.reduce((sum, item) => sum + item.count, 0);

	return (
		<Card className="relative h-full overflow-hidden border border-white/10 bg-content1/20 p-6 backdrop-blur-2xl">
			<div className="pointer-events-none absolute -top-20 right-0 h-40 w-40 rounded-full bg-primary/15 blur-[140px]" />
			<div className="pointer-events-none absolute -bottom-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-warning/15 blur-3xl" />
			<div className="relative z-10 space-y-6">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
					<div>
						<span className="text-xs uppercase tracking-[0.3em] text-foreground/45">Treasury overview</span>
						<h3 className="mt-1 text-xl font-semibold text-foreground">Rarity Breakdown</h3>
					</div>
					<div className="text-sm text-foreground/60">
						<span className="font-semibold text-foreground">{totalItems}</span> NFTs in rotation
					</div>
				</div>

				<div className="grid gap-3">
					{rarityStats.map((rarity) => (
						<button
							key={rarity.name}
							type="button"
							onClick={() => handleRarityClick(rarity.rarity)}
							className="group relative flex items-center justify-between gap-4 rounded-2xl border border-white/5 bg-gradient-to-r from-content1/40 via-content1/20 to-content1/30 px-4 py-4 text-left transition-transform duration-200 hover:-translate-y-0.5 hover:border-white/15"
						>
							<div className="flex items-center gap-4">
								<div
									className={`flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br ${rarity.bgGradient} text-white shadow-lg`}
								>
									<span className="text-lg">{rarity.emoji}</span>
								</div>
								<div>
									<p className="text-sm font-semibold text-foreground">{rarity.name}</p>
									<p className="text-xs text-foreground/55">{rarity.description}</p>
								</div>
							</div>
							<div className="flex items-center gap-4">
								<div className="text-right">
									<p className="text-sm font-semibold text-foreground">{rarity.count}</p>
									<p className="text-[11px] text-foreground/50">available</p>
								</div>
								<div className="text-right">
									<p className={`text-sm font-semibold bg-gradient-to-r ${rarity.bgGradient} bg-clip-text text-transparent`}>
										{rarity.percentage.toFixed(1)}%
									</p>
									<p className="text-[11px] text-foreground/50">weight</p>
								</div>
								<span className="text-xs text-foreground/40 transition-colors group-hover:text-foreground/60">
									View →
								</span>
							</div>
						</button>
					))}
				</div>
			</div>

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
