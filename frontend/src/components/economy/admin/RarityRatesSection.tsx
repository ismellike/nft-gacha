"use client";

import { useReadContract } from "wagmi";
import type { GachaConfig } from "@/lib/gacha-config";
import { DEFAULT_RARITY_CONFIG } from "@/lib/rarityConfig";
import { formatPercentage } from "@/lib/utils";
import { Card, Chip } from "../../../ui";

export function RarityRatesSection({ gacha }: { gacha: GachaConfig }) {
	// Live odds from the gacha contract: draws are uniform-over-pool, so
	// `getCurrentRarityWeights()` returns the honest, real-time probability of
	// drawing each rarity tier (counts[i]/total), verifiable on-chain. There is
	// no separate "reference"/target configuration anymore - this is read-only.
	const { data: currentWeights } = useReadContract({
		address: gacha.address as `0x${string}`,
		abi: [
			{
				type: "function",
				name: "getCurrentRarityWeights",
				stateMutability: "view",
				inputs: [],
				outputs: [{ name: "weights", type: "uint256[]" }],
			},
		],
		functionName: "getCurrentRarityWeights",
	});
	const weights = currentWeights as unknown as readonly bigint[] | undefined;

	const totalWeight = (weights ?? []).reduce(
		(sum, w) => sum + Number(w),
		0,
	);

	return (
		<Card className="p-4 sm:p-8 bg-content1/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
			<div className="flex items-center justify-between mb-8">
				<div>
					<h2 className="text-2xl font-bold text-foreground mb-2">
						Live Draw Odds{" "}
						<span className="text-sm font-normal text-foreground/50">
							(current pool composition)
						</span>
					</h2>
					<p className="text-foreground/70">
						Draws are uniform-over-pool: player odds always equal the live pool
						composition below, read directly from the contract. There is no
						separate configurable target distribution.
					</p>
				</div>
				<Chip className="px-3 py-1.5 rounded-xl backdrop-blur-xl bg-success/20 border border-success/30 text-success">
					Total: {totalWeight.toLocaleString()}/10,000
				</Chip>
			</div>

			<div className="grid gap-6 lg:grid-cols-2">
				{(weights ?? []).map((weight, index) => {
					const rarity = DEFAULT_RARITY_CONFIG[index];
					if (!rarity) return null;
					const percentage = formatPercentage(Number(weight) / 100, 2, true);

					return (
						<div key={rarity.name} className="space-y-3">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<span className="text-xl">{rarity.emoji}</span>
									<div>
										<div className="font-semibold text-foreground">
											{rarity.name}
										</div>
										<div className="text-sm text-foreground/60">
											{percentage} live odds
										</div>
									</div>
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</Card>
	);
}
