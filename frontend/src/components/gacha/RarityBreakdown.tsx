"use client";

import { forwardRef, memo, useImperativeHandle, useState } from "react";
import { useReadContract } from "wagmi";
import { useGachaRefetch } from "../../contexts/GachaRefreshContext";
import {
	gachaTreasuryAbi,
	useReadGachaGetAverageRarityValues,
} from "../../generated";
import { useGachaContracts } from "../../hooks/useGachaContracts";
import { useGachaId } from "../../hooks/useGachaId";
import { getAllRarities, getRarityConfig } from "../../lib/rarityConfig";
import { Card } from "../../ui";
import RarityShowcaseModal from "./RarityShowcaseModal";

interface RarityBreakdownRef {
	refreshCounts: () => void;
}

const RarityBreakdown = forwardRef<RarityBreakdownRef>((_props, ref) => {
	const [selectedRarity, setSelectedRarity] = useState<number | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);

	// Get gacha ID and contract addresses
	const gachaId = useGachaId();
	const contracts = useGachaContracts(gachaId);

	const handleRarityClick = (rarity: number) => {
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
	// Use useReadContract directly to avoid deep type instantiation with generated hook
	const rarityCountsQuery = useReadContract({
		abi: gachaTreasuryAbi,
		address: contracts.treasury as `0x${string}` | undefined,
		functionName: "getAllRarityCounts",
		query: { enabled: !!contracts.treasury },
	});
	const allRarityCounts = rarityCountsQuery.data as unknown as
		| readonly bigint[]
		| undefined;

	// Rarity weights from gacha contract
	const rarityWeightsQuery = useReadContract({
		address: contracts.gacha as `0x${string}` | undefined,
		abi: [
			{
				type: "function",
				name: "getCurrentRarityWeights",
				stateMutability: "view",
				inputs: [],
				outputs: [{ name: "weights", type: "uint256[5]" }],
			},
		],
		functionName: "getCurrentRarityWeights",
		query: { enabled: !!contracts.gacha },
	});
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
			rarityCountsQuery.refetch();
		},
	}));

	// Register refetch functions with the refresh context
	useGachaRefetch(async () => {
		await Promise.all([
			rarityCountsQuery.refetch(),
			rarityWeightsQuery.refetch(),
			averageRarityValuesQuery.refetch(),
		]);
	});

	// Convert rarity weights to percentages (weights are in basis points, total 10000)
	const getRarityPercentage = (index: number): number => {
		if (!rarityWeights || rarityWeights.length <= index) return 0;
		return Number(rarityWeights[index]) / 100; // Convert basis points to percentage
	};

	const numRarities = allRarityCounts ? allRarityCounts.length : 5;
	const rarityStats = getAllRarities(numRarities).map((rarityIndex) => ({
		rarity: rarityIndex,
		...getRarityConfig(rarityIndex),
		percentage: getRarityPercentage(rarityIndex),
		count: Number(allRarityCounts?.[rarityIndex] ?? 0),
		avgValue: averageRarityValues?.[rarityIndex] ?? 0n,
	}));

	const totalItems = rarityStats.reduce((sum, item) => sum + item.count, 0);

	return (
		<Card className="relative overflow-hidden border border-white/10 bg-content1/30 p-4 sm:p-8 backdrop-blur-2xl">
			{/* Enhanced background gradient matching spinner */}
			<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,200,87,0.15),_transparent_60%)]" />
			<div className="pointer-events-none absolute -top-20 right-0 h-40 w-40 rounded-full bg-primary/20 blur-[140px]" />
			<div className="pointer-events-none absolute -bottom-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-warning/20 blur-3xl" />

			<div className="relative z-10 space-y-6">
				{/* Enhanced header matching spinner design */}
				<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
					<div className="space-y-2">
						<span className="text-xs uppercase tracking-[0.3em] text-foreground/50">
							Treasury overview
						</span>
						<h3 className="text-xl font-semibold text-foreground">
							Rarity Breakdown
						</h3>
						<p className="text-sm text-foreground/60">
							Current NFT distribution and drop rates
						</p>
					</div>

					{/* Enhanced total count display */}
					<div className="flex flex-col gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-4 shadow-inner min-w-[140px]">
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/30 bg-primary/10">
								<svg
									className="w-5 h-5 text-primary"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									strokeWidth={2}
								>
									<title>Treasury</title>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
									/>
								</svg>
							</div>
							<div>
								<p className="text-xs uppercase tracking-wide text-primary/70 font-medium">
									Total NFTs
								</p>
								<p className="text-xl font-bold text-primary">{totalItems}</p>
							</div>
						</div>
						<p className="text-xs text-primary/60">Available for spins</p>
					</div>
				</div>

				<div className="grid gap-3">
					{rarityStats.map((rarity) => (
						<button
							key={rarity.name}
							type="button"
							onClick={() => handleRarityClick(rarity.rarity)}
							className="group relative flex items-center justify-between gap-2 sm:gap-4 rounded-2xl border border-white/5 bg-gradient-to-r from-content1/40 via-content1/20 to-content1/30 px-3 sm:px-4 py-3 sm:py-4 text-left transition-transform duration-200 hover:-translate-y-0.5 hover:border-white/20"
						>
							<div className="flex items-center gap-2 sm:gap-4 min-w-0">
								<div
									className={`flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br ${rarity.bgGradient} text-white shadow-lg`}
								>
									<span className="text-base sm:text-lg">{rarity.emoji}</span>
								</div>
								<div className="min-w-0">
									<p className="text-sm font-semibold text-foreground truncate">
										{rarity.name}
									</p>
									<p className="text-xs text-foreground/60 hidden sm:block truncate">
										{rarity.description}
									</p>
								</div>
							</div>
							<div className="flex items-center gap-2 sm:gap-4 shrink-0">
								<div className="text-right hidden sm:block">
									<p className="text-sm font-semibold text-foreground">
										{rarity.count}
									</p>
									<p className="text-[11px] text-foreground/50">available</p>
								</div>
								<div className="text-right">
									<p
										className={`text-sm font-semibold bg-gradient-to-r ${rarity.bgGradient} bg-clip-text text-transparent`}
									>
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

const MemoizedRarityBreakdown = memo(RarityBreakdown);
MemoizedRarityBreakdown.displayName = "RarityBreakdown";

export default MemoizedRarityBreakdown;
