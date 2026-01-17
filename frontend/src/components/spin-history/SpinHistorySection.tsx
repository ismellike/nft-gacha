"use client";

import { useEffect, useCallback, useState } from "react";
import { useAccount } from "wagmi";
import { Card } from "@/ui/Card";
import { HistoryFilters } from "./HistoryFilters";
import { HistoryStats } from "./HistoryStats";
import { HistoryGrid } from "./HistoryGrid";
import { useSpinHistoryStore } from "@/stores/spinHistoryStore";
import { useSpinHistoryFetcher } from "@/hooks/useSpinHistoryFetcher";
import { InlineRetryMessage } from "@/components/InlineRetryMessage";
import { logger } from "@/lib/logger";

interface SpinHistorySectionProps {
	gachaAddress: string;
	gachaId?: string;
	appraisalContractAddress?: string | undefined;
	protocolTreasuryAddress?: string | undefined;
}

const SpinHistorySection = ({
	gachaAddress,
	gachaId,
	appraisalContractAddress,
	protocolTreasuryAddress,
}: SpinHistorySectionProps) => {
	const { address } = useAccount();
	const { fetchHistory, loadMore } = useSpinHistoryFetcher();
	const {
		getFilteredEntries,
		getIsLoading,
		getError,
		getPagination,
		clearHistory,
	} = useSpinHistoryStore();

	const [isInitialLoad, setIsInitialLoad] = useState(true);
	const [previousAddress, setPreviousAddress] = useState<string | undefined>(address);

	const isLoading = address ? getIsLoading(address, gachaAddress) : false;
	const error = address ? getError(address, gachaAddress) : null;
	const entries = address ? getFilteredEntries(address, gachaAddress) : [];
	const pagination = address
		? getPagination(address, gachaAddress)
		: { hasMore: false };

	// Fetch history on mount or when address changes
	useEffect(() => {
		if (address) {
			setIsInitialLoad(true);
			fetchHistory(address, gachaAddress, 1)
				.catch(() => {
					// Error is handled by the store
				})
				.finally(() => {
					setIsInitialLoad(false);
				});
			// Update previous address when we have a connected address
			setPreviousAddress(address);
		} else {
			// Clear history for the previous address when wallet disconnects
			if (previousAddress) {
				clearHistory(previousAddress, gachaAddress);
			}
		}
	}, [address, gachaAddress, fetchHistory, clearHistory, previousAddress]);

	// Handle buyback success
	const handleBuybackSuccess = useCallback(
		(txHash: string, payoutAmount: bigint) => {
			logger.general.log(
				`Buyback successful: ${txHash}, payout: ${payoutAmount.toString()}`,
			);
			// Optionally refresh history to show updated state
		},
		[],
	);

	// Handle load more
	const handleLoadMore = useCallback(() => {
		if (address && pagination.hasMore && !isLoading) {
			loadMore(address, gachaAddress).catch(() => {
				// Error is handled by the store
			});
		}
	}, [address, gachaAddress, pagination.hasMore, isLoading, loadMore]);

	// Handle retry
	const handleRetry = useCallback(() => {
		if (address) {
			setIsInitialLoad(true);
			fetchHistory(address, gachaAddress, 1)
				.catch(() => {
					// Error is handled by the store
				})
				.finally(() => {
					setIsInitialLoad(false);
				});
		}
	}, [address, gachaAddress, fetchHistory]);

	// Don't render if no wallet connected
	if (!address) {
		return (
			<Card variant="base" padding="lg" className="text-center">
				<p className="text-foreground/60">Connect your wallet to view spin history</p>
			</Card>
		);
	}

	// Show loading state on initial load
	if (isInitialLoad && isLoading) {
		return (
			<Card variant="base" padding="lg" className="text-center">
				<p className="text-foreground/60">Loading spin history...</p>
			</Card>
		);
	}

	// Show error state
	if (error && isInitialLoad) {
		return (
			<InlineRetryMessage
				type="general"
				message="Failed to load spin history"
				onRetry={handleRetry}
			/>
		);
	}

	const isEmpty = entries.length === 0 && !isLoading;

	return (
		<div className="flex flex-col gap-6">
			{/* Filters and Stats */}
			<div className="flex flex-col gap-4">
				<HistoryFilters userAddress={address} gachaAddress={gachaAddress} />
				<HistoryStats userAddress={address} gachaAddress={gachaAddress} />
			</div>

			{/* History Grid */}
			<HistoryGrid
				entries={entries}
				isLoading={isLoading}
				isEmpty={isEmpty}
				appraisalContractAddress={appraisalContractAddress}
				protocolTreasuryAddress={protocolTreasuryAddress}
				gachaId={gachaId}
				onBuybackSuccess={handleBuybackSuccess}
			/>

			{/* Load More Button */}
			{!isEmpty && pagination.hasMore && (
				<div className="flex justify-center">
					<button
						onClick={handleLoadMore}
						disabled={isLoading}
						className="rounded-lg bg-content1/20 px-6 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-content1/30 disabled:cursor-not-allowed disabled:opacity-50"
					>
						{isLoading ? "Loading..." : "Load More"}
					</button>
				</div>
			)}
		</div>
	);
};

export { SpinHistorySection };
