"use client";

import { lazy, memo, Suspense, useCallback } from "react";
import { useGachaRefresh } from "../../contexts/GachaRefreshContext";
import { useGachaContracts } from "../../hooks/useGachaContracts";
import { useGachaId } from "../../hooks/useGachaId";
import { useGachaSpinMachine } from "../../hooks/useGachaSpinMachine";
import { logger } from "../../lib/logger";
import { PricingBreakdown } from "./PricingBreakdown";
import RarityBreakdown from "./RarityBreakdown";
import SpinControls from "./SpinControls";

// Lazy load the heavy NFTRevealModal component
const NFTRevealModal = lazy(() => import("./NFTRevealModal"));

const GachaSpinner = memo(() => {
	const gachaId = useGachaId();
	const contracts = useGachaContracts(gachaId);
	const { triggerRefresh } = useGachaRefresh();

	// Stable callbacks — avoid inline arrows that change every render
	// and cause the polling effect to restart (aborting in-flight polls).
	const handleSpinComplete = useCallback(() => {
		logger.gachaSpin.log("[GachaSpinner] Spin completed, refreshing all data");
		triggerRefresh();
	}, [triggerRefresh]);

	const handleRefundComplete = useCallback(() => {
		logger.gachaSpin.log("[GachaSpinner] Refund detected, refreshing all data");
		triggerRefresh();
	}, [triggerRefresh]);

	// Use the new state machine hook
	const gachaSpin = useGachaSpinMachine(
		handleSpinComplete,
		handleRefundComplete,
	);

	const handleCloseReveal = useCallback(() => {
		gachaSpin.closeReveal();
		// Refresh all data after reveal closes
		logger.gachaSpin.log("[GachaSpinner] Reveal closed, refreshing all data");
		triggerRefresh();
	}, [gachaSpin.closeReveal, triggerRefresh]);

	const handleRefund = useCallback(() => {
		logger.gachaSpin.log(
			"[GachaSpinner] SpinControls refund callback triggered",
		);
		triggerRefresh();
	}, [triggerRefresh]);

	return (
		<div className="space-y-16">
			{/* NFT Reveal Modal */}
			{gachaSpin.isRevealing && gachaSpin.spinResult && contracts.appraisal && (
				<Suspense
					fallback={
						<div className="flex items-center justify-center p-8">
							<div className="w-8 h-8 border-4 border-warning/30 border-t-warning rounded-full animate-spin" />
						</div>
					}
				>
					<NFTRevealModal
						isVisible={true}
						nftResult={gachaSpin.spinResult}
						onClose={handleCloseReveal}
						appraisalContractAddress={contracts.appraisal as `0x${string}`}
						gachaId={gachaId}
					/>
				</Suspense>
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
					<SpinControls gachaSpin={gachaSpin} onRefund={handleRefund} />
				</div>

				{/* Left Column - Rarity Info & Pricing */}
				<div className="space-y-8">
					<RarityBreakdown />
					<PricingBreakdown />
				</div>

				{/* Desktop Left Column - Spin Controls */}
				<div className="hidden lg:block space-y-8">
					<SpinControls gachaSpin={gachaSpin} onRefund={handleRefund} />
				</div>
			</div>
		</div>
	);
});
GachaSpinner.displayName = "GachaSpinner";

export default GachaSpinner;
