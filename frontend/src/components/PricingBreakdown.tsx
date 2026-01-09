"use client";

import { Card } from "../ui";
import { useGachaContracts } from "../hooks/useGachaContracts";
import { useGachaId } from "../hooks/useGachaId";
import {
	useReadGachaGetExpectedValueUsd,
	useReadGachaPricingPremiumBps,
	useReadGachaMinSpinFee,
	useReadGachaMaxSpinFee,
} from "../generated";
import { formatCurrency } from "../lib/utils";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import { useGachaRefresh } from "../contexts/GachaRefreshContext";

interface PricingBreakdownProps {
	className?: string;
}

export function PricingBreakdown({ className = "" }: PricingBreakdownProps) {
	const gachaId = useGachaId();
	const contracts = useGachaContracts(gachaId);
	const [showDetails, setShowDetails] = useState(false);
	const { registerRefetch } = useGachaRefresh();

	// Read pricing data from contract
	const expectedValueQuery = useReadGachaGetExpectedValueUsd({
		address: contracts.gacha as `0x${string}` | undefined,
		query: { enabled: !!contracts.gacha },
	});
	const expectedValueUSD = expectedValueQuery.data;

	const premiumBpsQuery = useReadGachaPricingPremiumBps({
		address: contracts.gacha as `0x${string}` | undefined,
		query: { enabled: !!contracts.gacha },
	});
	const premiumBps = premiumBpsQuery.data;

	const minSpinFeeQuery = useReadGachaMinSpinFee({
		address: contracts.gacha as `0x${string}` | undefined,
		query: { enabled: !!contracts.gacha },
	});
	const minSpinFee = minSpinFeeQuery.data;

	const maxSpinFeeQuery = useReadGachaMaxSpinFee({
		address: contracts.gacha as `0x${string}` | undefined,
		query: { enabled: !!contracts.gacha },
	});
	const maxSpinFee = maxSpinFeeQuery.data;

	// Register refetch functions with the refresh context
	useEffect(() => {
		const refetchAllPricing = async () => {
			console.log("🔄 [PricingBreakdown] Refetching all pricing data");
			await Promise.all([
				expectedValueQuery.refetch(),
				premiumBpsQuery.refetch(),
				minSpinFeeQuery.refetch(),
				maxSpinFeeQuery.refetch(),
			]);
		};

		const cleanup = registerRefetch(refetchAllPricing);
		return cleanup;
	}, [
		registerRefetch,
		expectedValueQuery,
		premiumBpsQuery,
		minSpinFeeQuery,
		maxSpinFeeQuery,
	]);

	// Calculate premium percentage
	const premiumPercent = premiumBps ? Number(premiumBps) / 100 : 0;

	// Format expected value (USD uses 18 decimals)
	const formatExpectedValue = () => {
		if (!expectedValueUSD) return "$0.00";
		return `$${formatCurrency(expectedValueUSD, 18, "", "standard")}`;
	};

	// Format min/max fees (using token decimals - assuming 6 for USDC)
	const formatFeeBound = (fee: bigint | undefined) => {
		if (!fee || fee === 0n) return "None";
		return formatCurrency(fee, 6, "USDC");
	};

	return (
		<Card
			className={`border border-white/10 bg-content1/20 backdrop-blur-xl ${className}`}
		>
			{/* Header */}
			<div className="flex items-center justify-between p-4 border-b border-white/10">
				<div className="flex items-center gap-2">
					<svg
						className="w-5 h-5 text-warning"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						strokeWidth={2}
					>
						<title>Pricing Info</title>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
						/>
					</svg>
					<h3 className="text-sm font-semibold text-foreground">
						Dynamic Pricing
					</h3>
				</div>
				<button
					onClick={() => setShowDetails(!showDetails)}
					className="text-foreground/50 hover:text-foreground transition-colors"
					aria-label={showDetails ? "Hide details" : "Show details"}
				>
					<InformationCircleIcon className="w-5 h-5" />
				</button>
			</div>

			{/* Summary */}
			<div className="p-4 space-y-3">
				{/* Expected Value */}
				<div className="flex items-center justify-between">
					<span className="text-xs text-foreground/60">Expected Value</span>
					<span className="text-sm font-semibold text-success">
						{formatExpectedValue()}
					</span>
				</div>

				{/* Premium */}
				<div className="flex items-center justify-between">
					<span className="text-xs text-foreground/60">Premium</span>
					<span className="text-sm font-semibold text-warning">
						+{premiumPercent.toFixed(1)}%
					</span>
				</div>

				{/* Fee Bounds */}
				<div className="flex items-center justify-between">
					<span className="text-xs text-foreground/60">Fee Range</span>
					<span className="text-sm font-semibold text-foreground">
						{formatFeeBound(minSpinFee)} - {formatFeeBound(maxSpinFee)}
					</span>
				</div>
			</div>

			{/* Detailed Explanation */}
			{showDetails && (
				<div className="p-4 border-t border-white/10 space-y-3 bg-content1/10">
					<p className="text-xs text-foreground/70 leading-relaxed">
						<strong className="text-foreground">How pricing works:</strong>{" "}
						Spin fees are dynamically calculated based on the average value of
						NFTs in the treasury. The expected value (EV) represents the fair
						market value of a spin, and a premium is added for protocol revenue.
					</p>

					<div className="space-y-2 text-xs text-foreground/60">
						<div className="flex items-start gap-2">
							<div className="w-1.5 h-1.5 rounded-full bg-success mt-1 flex-shrink-0" />
							<span>
								<strong className="text-foreground/80">Expected Value:</strong>{" "}
								Average value across all rarity tiers weighted by drop
								probabilities
							</span>
						</div>
						<div className="flex items-start gap-2">
							<div className="w-1.5 h-1.5 rounded-full bg-warning mt-1 flex-shrink-0" />
							<span>
								<strong className="text-foreground/80">Premium:</strong>{" "}
								Percentage added to EV for protocol revenue and depositor yield
							</span>
						</div>
						<div className="flex items-start gap-2">
							<div className="w-1.5 h-1.5 rounded-full bg-foreground/40 mt-1 flex-shrink-0" />
							<span>
								<strong className="text-foreground/80">Fee Bounds:</strong>{" "}
								Minimum and maximum limits to ensure pricing remains fair
							</span>
						</div>
					</div>

					<div className="p-2 rounded-lg bg-warning/5 border border-warning/20">
						<p className="text-xs text-warning/80">
							<strong>💡 Tip:</strong> Fees adjust automatically based on
							treasury inventory. When rare NFTs are added, expected value
							increases.
						</p>
					</div>
				</div>
			)}
		</Card>
	);
}
