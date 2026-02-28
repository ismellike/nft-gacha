"use client";

import { CheckIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { useReadContract, useWriteContract } from "wagmi";
import type { GachaConfig } from "@/lib/gacha-config";
import { DEFAULT_RARITY_CONFIG } from "@/lib/rarityConfig";
import { formatPercentage } from "@/lib/utils";
import { Button, Card, Chip, Input } from "../../../ui";

export function RarityRatesSection({ gacha }: { gacha: GachaConfig }) {
	const [weights, setWeights] = useState([7000, 2000, 600, 300, 100]);

	const { data: currentWeights } = useReadContract({
		address: gacha.address as `0x${string}`,
		abi: [
			{
				type: "function",
				name: "getTargetRarityBps",
				stateMutability: "view",
				inputs: [],
				outputs: [{ name: "targetBps", type: "uint256[]" }],
			},
		],
		functionName: "getTargetRarityBps",
	});
	const targetWeights = currentWeights as unknown as
		| readonly bigint[]
		| undefined;

	const { writeContract: setRarityWeights, isPending } = useWriteContract();

	useEffect(() => {
		if (targetWeights) {
			setWeights(targetWeights.map((w: bigint) => Number(w)));
		}
	}, [targetWeights]);

	const handleWeightChange = (index: number, value: string) => {
		const newWeights = [...weights];
		newWeights[index] = parseInt(value, 10) || 0;
		setWeights(newWeights);
	};

	const totalWeight = weights.reduce((sum, w) => sum + w, 0);
	const isValidTotal = totalWeight === 10000;

	const handleSave = () => {
		if (!isValidTotal) return;

		setRarityWeights({
			address: gacha.address as `0x${string}`,
			abi: [
				{
					type: "function",
					name: "setDynamicWeightsConfig",
					stateMutability: "nonpayable",
					inputs: [{ name: "targetBps", type: "uint256[]" }],
					outputs: [],
				},
			],
			functionName: "setDynamicWeightsConfig",
			args: [weights.map((w: number) => BigInt(w))],
		});
	};

	return (
		<Card className="p-8 bg-content1/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
			<div className="flex items-center justify-between mb-8">
				<div>
					<h2 className="text-2xl font-bold text-foreground mb-2">
						Rarity Drop Rates
					</h2>
					<p className="text-foreground/70">
						Configure the probability weights for each rarity tier. Total must
						equal 10,000.
					</p>
				</div>
				<Chip
					className={`px-3 py-1.5 rounded-xl backdrop-blur-xl ${isValidTotal ? "bg-success/20 border border-success/30 text-success" : "bg-danger/20 border border-danger/30 text-danger"}`}
				>
					Total: {totalWeight.toLocaleString()}/10,000
				</Chip>
			</div>

			<div className="grid gap-6 mb-8 lg:grid-cols-2">
				{weights.map((weight, index) => {
					const rarity = DEFAULT_RARITY_CONFIG[index];
					const percentage = formatPercentage(weight / 100, 2, true);

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
											{percentage} drop rate
										</div>
									</div>
								</div>
							</div>

							<Input
								type="number"
								value={weight}
								onChange={(e) => handleWeightChange(index, e.target.value)}
								placeholder="Weight (0-10000)"
								min="0"
								max="10000"
								rightIcon={
									<span className="text-sm text-foreground/60">/ 10,000</span>
								}
							/>
						</div>
					);
				})}
			</div>

			<div className="flex justify-end gap-4">
				<Button
					color="glass"
					onPress={() =>
						currentWeights &&
						setWeights(currentWeights.map((w: bigint) => Number(w)))
					}
				>
					Reset to Current
				</Button>
				<Button
					color="glassPrimary"
					onPress={handleSave}
					isDisabled={!isValidTotal}
					isLoading={isPending}
				>
					<span className="inline-flex items-center gap-2">
						<CheckIcon className="w-4 h-4" /> Save Changes
					</span>
				</Button>
			</div>
		</Card>
	);
}
