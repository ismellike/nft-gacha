"use client";

import { useState } from "react";
import { parseUnits } from "viem";
import {
	useReadGachaGetCurrentSpinFee,
	useReadGachaMaxSpinFee,
	useReadGachaMinSpinFee,
	useReadGachaPricingPremiumBps,
	useWriteGachaSetPricingConfig,
} from "@/generated";
import type { GachaConfig } from "@/lib/gacha-config";
import { formatPercentage, formatTokenAmount } from "@/lib/utils";
import { Button, Card } from "../../../ui";

export function SpinFeesSection({ gacha }: { gacha: GachaConfig }) {
	const [newMinFee, setNewMinFee] = useState("");
	const [newMaxFee, setNewMaxFee] = useState("");
	const [newPremiumBps, setNewPremiumBps] = useState("");

	const { data: currentFee } = useReadGachaGetCurrentSpinFee({
		address: gacha.address as `0x${string}`,
	});

	const { data: minSpinFee } = useReadGachaMinSpinFee({
		address: gacha.address as `0x${string}`,
	});

	const { data: maxSpinFee } = useReadGachaMaxSpinFee({
		address: gacha.address as `0x${string}`,
	});

	const { data: pricingPremiumBps } = useReadGachaPricingPremiumBps({
		address: gacha.address as `0x${string}`,
	});

	const { writeContract: setPricingConfig, isPending } =
		useWriteGachaSetPricingConfig();

	const handleSave = () => {
		if (!newMinFee || !newMaxFee || !newPremiumBps) return;

		try {
			const minFeeInWei = parseUnits(newMinFee, 18);
			const maxFeeInWei = parseUnits(newMaxFee, 18);
			const premiumBps = BigInt(Number(newPremiumBps));

			setPricingConfig({
				address: gacha.address as `0x${string}`,
				args: [premiumBps, minFeeInWei, maxFeeInWei],
			});
		} catch (error) {
			console.error("Invalid pricing config:", error);
		}
	};

	return (
		<Card className="p-8 bg-content1/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
			<div className="mb-8">
				<h2 className="text-2xl font-bold text-foreground mb-2">
					Spin Fee Configuration
				</h2>
				<p className="text-foreground/70">
					Set the token amount required for each gacha spin.
				</p>
			</div>

			<div className="space-y-6">
				<div>
					<div className="block text-sm font-medium text-foreground mb-2">
						Current Spin Fee
					</div>
					<div className="bg-content1/10 border border-white/10 rounded-xl p-4">
						<div className="text-2xl font-bold text-warning">
							{currentFee
								? formatTokenAmount(currentFee, 18, {
										maxDecimals: 4,
										suffix: " TOKENS",
									})
								: "0 TOKENS"}
						</div>
						<div className="mt-2 text-xs text-foreground/60">
							Min:{" "}
							{minSpinFee
								? formatTokenAmount(minSpinFee, 18, {
										maxDecimals: 4,
										suffix: " TOKENS",
									})
								: "0 TOKENS"}{" "}
							• Max:{" "}
							{maxSpinFee
								? formatTokenAmount(maxSpinFee, 18, {
										maxDecimals: 4,
										suffix: " TOKENS",
									})
								: "0 TOKENS"}{" "}
							• Premium:{" "}
							{pricingPremiumBps
								? formatPercentage(Number(pricingPremiumBps) / 100, 2, true)
								: "0%"}
						</div>
					</div>
				</div>

				<div>
					<label
						htmlFor="newMinSpinFee"
						className="block text-sm font-medium text-foreground mb-2"
					>
						New Min Spin Fee (in TOKENS)
					</label>
					<input
						id="newMinSpinFee"
						type="number"
						value={newMinFee}
						onChange={(e) => setNewMinFee(e.target.value)}
						className="w-full bg-content1/20 backdrop-blur-xl border border-white/20 rounded-xl px-4 py-3 text-foreground focus:border-warning/50 focus:outline-none transition-colors"
						placeholder="Enter min fee (e.g., 10.5)"
						step="0.01"
						min="0"
					/>
				</div>

				<div>
					<label
						htmlFor="newMaxSpinFee"
						className="block text-sm font-medium text-foreground mb-2"
					>
						New Max Spin Fee (in TOKENS)
					</label>
					<input
						id="newMaxSpinFee"
						type="number"
						value={newMaxFee}
						onChange={(e) => setNewMaxFee(e.target.value)}
						className="w-full bg-content1/20 backdrop-blur-xl border border-white/20 rounded-xl px-4 py-3 text-foreground focus:border-warning/50 focus:outline-none transition-colors"
						placeholder="Enter max fee (e.g., 10.5)"
						step="0.01"
						min="0"
					/>
				</div>

				<div>
					<label
						htmlFor="newPremiumBps"
						className="block text-sm font-medium text-foreground mb-2"
					>
						Pricing Premium (BPS)
					</label>
					<input
						id="newPremiumBps"
						type="number"
						value={newPremiumBps}
						onChange={(e) => setNewPremiumBps(e.target.value)}
						className="w-full bg-content1/20 backdrop-blur-xl border border-white/20 rounded-xl px-4 py-3 text-foreground focus:border-warning/50 focus:outline-none transition-colors"
						placeholder="Enter premium bps (e.g., 500)"
						step="1"
						min="0"
					/>
				</div>

				<div className="flex justify-end gap-4">
					<Button
						color="glass"
						onPress={() => {
							setNewMinFee("");
							setNewMaxFee("");
							setNewPremiumBps("");
						}}
					>
						Clear
					</Button>
					<Button
						color="glassPrimary"
						onPress={handleSave}
						disabled={!newMinFee || !newMaxFee || !newPremiumBps}
						isLoading={isPending}
					>
						Update Fee
					</Button>
				</div>
			</div>
		</Card>
	);
}
