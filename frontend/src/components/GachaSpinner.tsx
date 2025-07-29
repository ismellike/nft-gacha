"use client";

import { useState } from "react";
import { useAccount, useWatchContractEvent } from "wagmi";
import { env } from "../env";
import { gachaAbi } from "../generated";
import SpinControls from "./SpinControls";
import RarityBreakdown from "./RarityBreakdown";
import LastSpinResult from "./LastSpinResult";
import NFTRevealModal from "./NFTRevealModal";

export default function GachaSpinner() {
	const { address: userAddress } = useAccount();
	const [lastSpin, setLastSpin] = useState<{
		rarity: string;
		collection: string;
		tokenId: string;
	} | null>(null);
	const [pendingSpinId, setPendingSpinId] = useState<bigint | null>(null);
	const [isWaitingForRandomness, setIsWaitingForRandomness] = useState(false);
	const [showReveal, setShowReveal] = useState(false);

	// Watch for SpinCompleted events
	useWatchContractEvent({
		address: env.NEXT_PUBLIC_GACHA_CONTRACT_ADDRESS,
		abi: gachaAbi,
		eventName: 'SpinCompleted',
		onLogs(logs) {
			for (const log of logs) {
				const { triggerId, requester, rarity, collection, tokenId } = log.args;
				if (triggerId && requester === userAddress && triggerId === pendingSpinId) {
					// Convert rarity enum to string
					const rarityNames = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];
					const rarityName = rarityNames[Number(rarity)] || 'Unknown';
					
					setLastSpin({
						rarity: rarityName,
						collection: collection || '',
						tokenId: tokenId?.toString() || '',
					});
					
					setIsWaitingForRandomness(false);
					setPendingSpinId(null);
					setShowReveal(true);
					
					// Hide reveal after 4 seconds
					setTimeout(() => setShowReveal(false), 4000);
					
					console.log('🎉 Spin completed for trigger ID:', triggerId, '- randomness fulfilled!', { rarityName, collection, tokenId });
					console.log('🔄 Setting isWaitingForRandomness to false');
				}
			}
		},
	});

	const handleSpinStart = () => {
		// Reset all spin-related state when starting a new spin
		setIsWaitingForRandomness(false);
		setPendingSpinId(null);
		setShowReveal(false);
		console.log('🆕 New spin started - resetting all states');
	};

	const handleSpinComplete = (triggerId: bigint) => {
		// This is called when the transaction is confirmed and we have the trigger ID
		setPendingSpinId(triggerId);
		setIsWaitingForRandomness(true);
		console.log('🎯 Spin confirmed, awaiting randomness for trigger ID:', triggerId);
	};

	return (
		<>
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-24">
				{/* Spin Controls */}
				<div className="lg:col-span-2">
					<SpinControls
						isWaitingForRandomness={isWaitingForRandomness}
						onSpinStart={handleSpinStart}
						onSpinComplete={handleSpinComplete}
					/>
					
					{/* Last Spin Result */}
					{lastSpin && !showReveal && (
						<div className="mt-10">
							<LastSpinResult result={lastSpin} />
						</div>
					)}
				</div>

				{/* Rarity Breakdown */}
				<div>
					<RarityBreakdown />
				</div>
			</div>

			{/* NFT Reveal Modal */}
			{showReveal && lastSpin && (
				<NFTRevealModal isVisible={showReveal} nftResult={lastSpin} />
			)}
		</>
	);
}
