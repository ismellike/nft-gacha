"use client";

import { motion } from "framer-motion";
import { useChainId } from "wagmi";
import { formatCurrency, getBlockExplorerTxUrl } from "@/lib/utils";
import { Button } from "../../ui/Button";
import { Chip } from "../../ui/Chip";

export interface BuybackSuccessData {
	txHash: string;
	payoutAmount?: bigint | undefined;
	completedAt?: number | undefined;
}

interface BuybackSuccessViewProps {
	variant: "full" | "card" | "button";
	successData: BuybackSuccessData | null;
	/** Fallback payout amount when successData.payoutAmount is missing */
	payoutAmount: bigint | null;
	successTimestamp: string | null;
	showTreasuryRestock?: boolean | undefined;
	/** Extra className forwarded to the Chip in the "button" variant */
	chipClassName?: string | undefined;
	/** Called when the user clicks "Start New Transaction" (full variant only) */
	onReset?: (() => void) | undefined;
}

function CheckmarkSvg({ className }: { className: string }) {
	return (
		<svg
			className={className}
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
			aria-label="Success checkmark"
		>
			<title>Success</title>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M5 13l4 4L19 7"
			/>
		</svg>
	);
}

function resolvedPayout(
	successData: BuybackSuccessData | null,
	payoutAmount: bigint | null,
): string {
	return formatCurrency(
		successData?.payoutAmount?.toString() ||
			payoutAmount?.toString() ||
			"0",
		6,
		"USDC",
	);
}

/**
 * Renders the success state for a completed NFT buyback across all three display variants.
 *
 * - "full"   — Animated motion card with large checkmark, payout headline, timestamp,
 *              treasury restock notice, and action buttons (view tx / start new).
 * - "card"   — Compact centred layout with medium checkmark, payout, and optional restock line.
 * - "button" — Single success Chip with embedded checkmark icon and sold-for label.
 */
export function BuybackSuccessView({
	variant,
	successData,
	payoutAmount,
	successTimestamp,
	showTreasuryRestock = true,
	chipClassName,
	onReset,
}: BuybackSuccessViewProps) {
	const chainId = useChainId();

	if (variant === "full") {
		return (
			<motion.div
				initial={{ opacity: 0, scale: 0.9 }}
				animate={{ opacity: 1, scale: 1 }}
				className="text-center space-y-4"
			>
				<div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
					<CheckmarkSvg className="w-8 h-8 text-emerald-400" />
				</div>
				<div>
					<h4 className="text-white font-bold text-lg mb-2">
						Buyback Successful!
					</h4>
					<p className="text-emerald-300 font-semibold text-xl mb-2">
						You received {resolvedPayout(successData, payoutAmount)}
					</p>
					{successTimestamp && (
						<p className="text-white/60 text-xs mb-2">
							Completed: {successTimestamp}
						</p>
					)}
					{showTreasuryRestock && (
						<p className="text-white/70 text-sm">
							Your NFT has been restocked in the treasury for other players to
							win
						</p>
					)}
				</div>
				{successData?.txHash && (
					<div className="flex flex-col gap-2">
						{getBlockExplorerTxUrl(chainId, successData.txHash) && (
							<Button
								size="md"
								color="glassPrimary"
								onPress={() =>
									window.open(
										getBlockExplorerTxUrl(chainId, successData.txHash)!,
										"_blank",
									)
								}
							>
								View Transaction
							</Button>
						)}
						{onReset && (
							<Button size="md" color="glassPrimary" onPress={onReset}>
								Start New Transaction
							</Button>
						)}
					</div>
				)}
			</motion.div>
		);
	}

	if (variant === "card") {
		return (
			<div className="text-center space-y-2">
				<div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
					<CheckmarkSvg className="w-6 h-6 text-emerald-400" />
				</div>
				<p className="text-emerald-300 font-bold">
					Sold for {resolvedPayout(successData, payoutAmount)}
				</p>
				{successTimestamp && (
					<p className="text-white/50 text-xs">Completed: {successTimestamp}</p>
				)}
				{showTreasuryRestock && (
					<p className="text-white/60 text-xs">NFT restocked in treasury</p>
				)}
			</div>
		);
	}

	// button variant — compact Chip
	return (
		<div className="flex flex-col items-center space-y-2">
			<Chip
				color="success"
				variant="flat"
				size="sm"
				className={chipClassName}
				startContent={<CheckmarkSvg className="w-4 h-4" />}
			>
				Sold for {resolvedPayout(successData, payoutAmount)}
			</Chip>
		</div>
	);
}
