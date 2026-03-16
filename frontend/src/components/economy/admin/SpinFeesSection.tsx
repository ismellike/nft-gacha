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
import { logger } from "@/lib/logger";
import { formatPercentage, formatTokenAmount } from "@/lib/utils";
import { Button, Card, Input } from "../../../ui";

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

	const {
		writeContract: setPricingConfig,
		isPending,
		isError,
		error: writeError,
	} = useWriteGachaSetPricingConfig();

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
			logger.contracts.error("Invalid pricing config:", error);
		}
	};

	return (
		<Card className="p-4 sm:p-8 bg-content1/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
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

				<Input
					id="newMinSpinFee"
					type="number"
					label="New Min Spin Fee (in TOKENS)"
					value={newMinFee}
					onChange={(e) => setNewMinFee(e.target.value)}
					placeholder="Enter min fee (e.g., 10.5)"
					step="0.01"
					min="0"
				/>

				<Input
					id="newMaxSpinFee"
					type="number"
					label="New Max Spin Fee (in TOKENS)"
					value={newMaxFee}
					onChange={(e) => setNewMaxFee(e.target.value)}
					placeholder="Enter max fee (e.g., 10.5)"
					step="0.01"
					min="0"
				/>

				<Input
					id="newPremiumBps"
					type="number"
					label="Pricing Premium (BPS)"
					value={newPremiumBps}
					onChange={(e) => setNewPremiumBps(e.target.value)}
					placeholder="Enter premium bps (e.g., 500)"
					step="1"
					min="0"
				/>

				{isError && (
					<div className="bg-danger/10 border border-danger/20 rounded-xl p-4 text-danger text-sm">
						Transaction failed: {writeError?.message?.slice(0, 200)}
					</div>
				)}

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
