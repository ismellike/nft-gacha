"use client";

import { memo } from "react";
import { useAccount } from "wagmi";
import NFTGrid from "@/components/vault/cards/NFTGrid";
import type { SpinHistoryEntry } from "@/types/spin-history";
import { Card } from "@/ui/Card";
import { SpinHistoryCard } from "./SpinHistoryCard";

interface HistoryGridProps {
	entries: SpinHistoryEntry[];
	isLoading: boolean;
	isEmpty: boolean;
	appraisalContractAddress?: string | undefined;
	protocolTreasuryAddress?: string | undefined;
	gachaId?: string | undefined;
	onBuybackSuccess?: (txHash: string, payoutAmount: bigint) => void;
}

const HistoryGrid = memo(
	({
		entries,
		isLoading,
		isEmpty,
		appraisalContractAddress,
		protocolTreasuryAddress,
		gachaId,
		onBuybackSuccess,
	}: HistoryGridProps) => {
		const { address } = useAccount();

		// Empty state component
		const emptyState = isEmpty ? (
			<Card
				variant="base"
				padding="lg"
				className="mx-auto max-w-md text-center"
			>
				<div className="flex flex-col items-center gap-4">
					<div className="text-6xl">🎰</div>
					<div>
						<h3 className="text-lg font-semibold text-foreground">
							No Spin History Yet
						</h3>
						<p className="mt-2 text-sm text-foreground/60">
							{address
								? "Your completed and refunded spins will appear here. Start spinning to see your history!"
								: "Connect your wallet to view your spin history."}
						</p>
					</div>
				</div>
			</Card>
		) : null;

		return (
			<NFTGrid<SpinHistoryEntry>
				nfts={entries}
				loading={isLoading}
				emptyState={emptyState}
				columns={{ mobile: 1, tablet: 2, desktop: 3 }}
				renderItem={(entry) => (
					<SpinHistoryCard
						key={`spin-${entry.triggerId.toString()}`}
						entry={entry}
						uniqueId={entry.triggerId.toString()}
						{...(appraisalContractAddress && {
							appraisalContractAddress,
						})}
						{...(protocolTreasuryAddress && {
							protocolTreasuryAddress,
						})}
						{...(gachaId && { gachaId })}
						{...(onBuybackSuccess && { onBuybackSuccess })}
					/>
				)}
			/>
		);
	},
);

HistoryGrid.displayName = "HistoryGrid";

export { HistoryGrid };
