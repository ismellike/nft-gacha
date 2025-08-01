"use client";

import { useRef } from "react";
import { useGachaSpin } from "../hooks/useGachaSpin";
import SpinControls from "./SpinControls";
import RarityBreakdown, { RarityBreakdownRef } from "./RarityBreakdown";
import LastSpinResult from "./LastSpinResult";
import NFTRevealModal from "./NFTRevealModal";

export default function GachaSpinner() {
	const rarityBreakdownRef = useRef<RarityBreakdownRef>(null);
	
	const handleSpinComplete = () => {
		// Refresh rarity counts when a spin completes
		rarityBreakdownRef.current?.refreshCounts();
	};
	
	const gachaSpin = useGachaSpin(handleSpinComplete);

	return (
		<>
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-24">
				{/* Spin Controls */}
				<div className="lg:col-span-2">
					<SpinControls gachaSpin={gachaSpin} />
					
					{/* Last Spin Result */}
					{gachaSpin.lastSpin && !gachaSpin.showReveal && (
						<div className="mt-10">
							<LastSpinResult result={gachaSpin.lastSpin} />
						</div>
					)}
				</div>

				{/* Rarity Breakdown */}
				<div>
					<RarityBreakdown ref={rarityBreakdownRef} />
				</div>
			</div>

			{/* NFT Reveal Modal */}
			{gachaSpin.showReveal && gachaSpin.lastSpin && (
				<NFTRevealModal isVisible={gachaSpin.showReveal} nftResult={gachaSpin.lastSpin} />
			)}
		</>
	);
}
