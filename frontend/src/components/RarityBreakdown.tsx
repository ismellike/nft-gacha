"use client";

import { Card, CardBody, CardHeader } from "@heroui/react";
import { Rarity, getRarityConfig } from "../lib/rarityConfig";
import { 
	useReadGachaTreasuryGetRarityCount,
	useReadGachaGetRarityWeights 
} from "../generated";
import { env } from "../env";

export default function RarityBreakdown() {
	// Rarity counts from treasury
	const { data: commonCount } = useReadGachaTreasuryGetRarityCount({
		address: env.NEXT_PUBLIC_TREASURY_CONTRACT_ADDRESS,
		args: [Rarity.Common],
	});

	const { data: uncommonCount } = useReadGachaTreasuryGetRarityCount({
		address: env.NEXT_PUBLIC_TREASURY_CONTRACT_ADDRESS,
		args: [Rarity.Uncommon],
	});

	const { data: rareCount } = useReadGachaTreasuryGetRarityCount({
		address: env.NEXT_PUBLIC_TREASURY_CONTRACT_ADDRESS,
		args: [Rarity.Rare],
	});

	const { data: epicCount } = useReadGachaTreasuryGetRarityCount({
		address: env.NEXT_PUBLIC_TREASURY_CONTRACT_ADDRESS,
		args: [Rarity.Epic],
	});

	const { data: legendaryCount } = useReadGachaTreasuryGetRarityCount({
		address: env.NEXT_PUBLIC_TREASURY_CONTRACT_ADDRESS,
		args: [Rarity.Legendary],
	});

	// Rarity weights from gacha contract
	const { data: rarityWeights } = useReadGachaGetRarityWeights({
		address: env.NEXT_PUBLIC_GACHA_CONTRACT_ADDRESS,
	});

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
			count: Number(commonCount || 0),
		},
		{
			rarity: Rarity.Uncommon,
			...getRarityConfig(Rarity.Uncommon),
			percentage: getRarityPercentage(1),
			count: Number(uncommonCount || 0),
		},
		{
			rarity: Rarity.Rare,
			...getRarityConfig(Rarity.Rare),
			percentage: getRarityPercentage(2),
			count: Number(rareCount || 0),
		},
		{
			rarity: Rarity.Epic,
			...getRarityConfig(Rarity.Epic),
			percentage: getRarityPercentage(3),
			count: Number(epicCount || 0),
		},
		{
			rarity: Rarity.Legendary,
			...getRarityConfig(Rarity.Legendary),
			percentage: getRarityPercentage(4),
			count: Number(legendaryCount || 0),
		},
	] as const;

	return (
		<Card className="bg-content1/20 backdrop-blur-xl h-full border border-white/10 shadow-2xl">
			<CardHeader className="pb-6">
				<h3 className="text-2xl font-light text-foreground tracking-tight">
					Drop Rates
				</h3>
			</CardHeader>
			<CardBody className="space-y-4">
				{rarityStats.map((rarity) => (
					<div key={rarity.name} className="group relative">
						{/* Enhanced glow effect */}
						<div
							className={`absolute inset-0 bg-gradient-to-r ${rarity.bgGradient} rounded-xl blur-lg opacity-0 group-hover:opacity-40 transition-all duration-500 scale-95 group-hover:scale-100 ${rarity.glowColor}`}
						></div>

						{/* Main card with rarity-specific styling */}
						<div className={`relative bg-content2/10 backdrop-blur-xl border ${rarity.borderColor} hover:${rarity.borderColor.replace('/50', '/80')} rounded-xl p-4 hover:bg-content2/20 transition-all duration-300 group-hover:shadow-lg ${rarity.glowColor}`}>
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
							<div className="mt-2 text-center">
								<span className={`text-xs ${rarity.textColor} font-medium`}>
									{rarity.description}
								</span>
							</div>
						</div>
					</div>
				))}
			</CardBody>
		</Card>
	);
}