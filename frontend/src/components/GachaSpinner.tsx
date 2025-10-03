"use client";

import { useState, memo, useCallback } from "react";
import SpinControls from "./SpinControls";
import RarityBreakdown from "./RarityBreakdown";
import LastSpinResult from "./LastSpinResult";
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
					appraisalContractAddress={contracts.appraisal}
				/>
			)}

			{/* Main Grid Layout */}
			<div className="grid lg:grid-cols-2 gap-16 items-start">
				{/* Left Column - Spin Controls */}
				<div className="space-y-8">
					<SpinControls
						gachaSpin={gachaSpin}
						onRefund={() => {
							console.log(
								"💰 [GachaSpinner] SpinControls refund callback triggered",
							);
							setRefreshTrigger(REFRESH_TRIGGERS.REFUND);
						}}
					/>

					{/* Last Spin Result - Only show when not revealing */}
					{!gachaSpin.isRevealing && gachaSpin.spinResult && (
						<LastSpinResult result={gachaSpin.spinResult} />
					)}
				</div>

				{/* Right Column - Rarity Information */}
				<div className="space-y-8">
					<RarityBreakdown key={`breakdown-${refreshTrigger}`} />
				</div>
			</div>
		</div>
	);
});
GachaSpinner.displayName = "GachaSpinner";

export default GachaSpinner;
