"use client";

import { useState } from "react";
import SpinControls from "./SpinControls";
import RarityBreakdown from "./RarityBreakdown";
import LastSpinResult from "./LastSpinResult";
import NFTRevealModal from "./NFTRevealModal";
import { useGachaSpinMachine } from "../hooks/useGachaSpinMachine";

export default function GachaSpinner() {
	const [refreshKey, setRefreshKey] = useState(0);

	// Use the new state machine hook
	const gachaSpin = useGachaSpinMachine();

	return (
		<div className="space-y-16">
			{/* NFT Reveal Modal */}
			{gachaSpin.isRevealing && gachaSpin.spinResult && (
				<NFTRevealModal
					isVisible={true}
					nftResult={gachaSpin.spinResult}
					onClose={() => {
						gachaSpin.closeReveal();
						// Refresh rarity counts after reveal closes
						setRefreshKey((prev) => prev + 1);
					}}
				/>
			)}

			{/* Main Grid Layout */}
			<div className="grid lg:grid-cols-2 gap-16 items-start">
				{/* Left Column - Spin Controls */}
				<div className="space-y-8">
					<SpinControls
						gachaSpin={gachaSpin}
					/>

					{/* Last Spin Result - Only show when not revealing */}
					{!gachaSpin.isRevealing && gachaSpin.spinResult && (
						<LastSpinResult result={gachaSpin.spinResult} />
					)}
				</div>

				{/* Right Column - Rarity Information */}
				<div className="space-y-8">
					<RarityBreakdown key={`breakdown-${refreshKey}`} />
				</div>
			</div>
		</div>
	);
}
