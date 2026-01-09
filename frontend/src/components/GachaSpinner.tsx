"use client";

import { memo, useCallback } from "react";
import SpinControls from "./SpinControls";
import RarityBreakdown from "./RarityBreakdown";
import { PricingBreakdown } from "./PricingBreakdown";
import NFTRevealModal from "./NFTRevealModal";
import { useGachaSpinMachine } from "../hooks/useGachaSpinMachine";
import { useGachaContracts } from "../hooks/useGachaContracts";
import { useGachaId } from "../hooks/useGachaId";
import { useGachaRefresh } from "../contexts/GachaRefreshContext";

const GachaSpinner = memo(() => {
	const gachaId = useGachaId();
	const contracts = useGachaContracts(gachaId);
	const { triggerRefresh } = useGachaRefresh();

	// Use the new state machine hook
	const gachaSpin = useGachaSpinMachine(
		() => {
			// onSpinComplete - trigger refresh for all data
			console.log("🎯 [GachaSpinner] Spin completed, refreshing all data");
			triggerRefresh();
		},
		() => {
			// onRefund - trigger refresh for all data
			console.log("💰 [GachaSpinner] Refund detected, refreshing all data");
			triggerRefresh();
		},
	);

	const handleCloseReveal = useCallback(() => {
		gachaSpin.closeReveal();
		// Refresh all data after reveal closes
		console.log("🎉 [GachaSpinner] Reveal closed, refreshing all data");
		triggerRefresh();
	}, [gachaSpin, triggerRefresh]);

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
			<div className="space-y-8 md:space-y-12 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-8 xl:gap-12 lg:items-start">
				{/* Top-pinned Actions on Mobile */}
				<div className="lg:hidden sticky top-20 z-30 bg-background/80 backdrop-blur-xl -mx-4 px-4 py-4 border-b border-white/10">
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
							triggerRefresh();
						}}
					/>
				</div>

				{/* Left Column - Rarity Info & Pricing */}
				<div className="space-y-8">
					<RarityBreakdown />
					<PricingBreakdown />
				</div>

				{/* Desktop Left Column - Spin Controls */}
				<div className="hidden lg:block space-y-8">
					<SpinControls
						gachaSpin={gachaSpin}
						onRefund={() => {
							console.log(
								"💰 [GachaSpinner] SpinControls refund callback triggered",
							);
							triggerRefresh();
						}}
					/>
				</div>
			</div>
		</div>
	);
});
GachaSpinner.displayName = "GachaSpinner";

export default GachaSpinner;
