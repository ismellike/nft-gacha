"use client";

import { useState, memo, useCallback } from "react";
import SpinControls from "./SpinControls";
import RarityBreakdown from "./RarityBreakdown";
import NFTRevealModal from "./NFTRevealModal";
import { useGachaSpinMachine } from "../hooks/useGachaSpinMachine";
import { useGachaContracts } from "../hooks/useGachaContracts";
import { useGachaId } from "../hooks/useGachaId";

// Constants for refresh tracking
const REFRESH_TRIGGERS = {
	SPIN_COMPLETE: "spin_complete",
	REFUND: "refund",
	REVEAL_CLOSE: "reveal_close",
} as const;

const GachaSpinner = memo(() => {
	const [refreshTrigger, setRefreshTrigger] = useState<string | null>(null);
	const gachaId = useGachaId();
	const contracts = useGachaContracts(gachaId);

	// Use the new state machine hook
	const gachaSpin = useGachaSpinMachine(
		() => {
			// onSpinComplete - trigger refresh for rarity counts
			console.log("🎯 [GachaSpinner] Spin completed, refreshing rarity data");
			setRefreshTrigger(REFRESH_TRIGGERS.SPIN_COMPLETE);
		},
		() => {
			// onRefund - trigger refresh for balance updates
			console.log("💰 [GachaSpinner] Refund detected, refreshing UI");
			setRefreshTrigger(REFRESH_TRIGGERS.REFUND);
		},
	);

	const handleCloseReveal = useCallback(() => {
		gachaSpin.closeReveal();
		// Refresh rarity counts after reveal closes
		setRefreshTrigger(REFRESH_TRIGGERS.REVEAL_CLOSE);
	}, [gachaSpin]);

	return (
		<div className="space-y-16">
			{/* NFT Reveal Modal */}
			{gachaSpin.isRevealing && gachaSpin.spinResult && contracts.appraisal && (
				<NFTRevealModal
					isVisible={true}
					nftResult={gachaSpin.spinResult}
					onClose={handleCloseReveal}
					appraisalContractAddress={contracts.appraisal as `0x${string}`}
					gachaId={gachaId}
				/>
			)}

			{/* Main Grid Layout - Mobile First, Single Column */}
			<div className="space-y-16 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-16 lg:items-start">
				{/* Top-pinned Actions on Mobile */}
				<div className="lg:hidden sticky top-20 z-30 bg-background/80 backdrop-blur-md -mx-4 px-4 py-4 border-b border-white/10">
					<output aria-live="polite" aria-atomic="true" className="sr-only">
						{gachaSpin.isSpinning && "Starting spin..."}
						{gachaSpin.isWaitingForFulfillment && "Awaiting randomness..."}
						{gachaSpin.isRevealing && "Revealing your NFT..."}
						{gachaSpin.isError && `Error: ${gachaSpin.error}`}
						{gachaSpin.isRefunded && "Spin refunded due to empty rarity pool"}
						{gachaSpin.isTimeout &&
							"Randomness timeout - you can reclaim your funds"}
					</output>
					<SpinControls
						gachaSpin={gachaSpin}
						onRefund={() => {
							console.log(
								"💰 [GachaSpinner] SpinControls refund callback triggered",
							);
							setRefreshTrigger(REFRESH_TRIGGERS.REFUND);
						}}
					/>
				</div>

				{/* Rarity Information - Mobile First */}
				<div className="space-y-8">
					<RarityBreakdown key={`breakdown-${refreshTrigger}`} />
				</div>

				{/* Desktop Left Column - Spin Controls */}
				<div className="hidden lg:block space-y-8">
					<SpinControls
						gachaSpin={gachaSpin}
						onRefund={() => {
							console.log(
								"💰 [GachaSpinner] SpinControls refund callback triggered",
							);
							setRefreshTrigger(REFRESH_TRIGGERS.REFUND);
						}}
					/>
				</div>
			</div>
		</div>
	);
});
GachaSpinner.displayName = "GachaSpinner";

export default GachaSpinner;
