"use client";

import { createNFTKey } from "../../../stores/storeUtils";
import type { UserOwnedNFTMultiCollection } from "../../../types/hooks";
import DepositNFTCard from "../cards/DepositNFTCard";
import NFTGrid from "../cards/NFTGrid";
import { EmptyDepositState } from "../empty-states/EmptyDepositState";

interface AppraisalInfo {
	hasAppraisal: boolean;
	priceUSD: bigint;
}

interface DepositTabProps {
	sortedUserOwnedNFTs: UserOwnedNFTMultiCollection[];
	appraisedNFTs: Set<string>;
	appraisalData: Map<string, AppraisalInfo>;
	appraisal: string | undefined;
	getNFTDepositState: (
		collection: string,
		tokenId: string,
	) => {
		isDepositing: boolean;
		stage: string;
		message: string;
	} | null;
	onNFTAction: (
		collection: string,
		tokenId: string,
		hasAppraisal?: boolean,
	) => void;
}

export function DepositTab({
	sortedUserOwnedNFTs,
	appraisedNFTs,
	appraisalData,
	getNFTDepositState,
	onNFTAction,
	appraisal,
}: DepositTabProps) {
	// Empty state
	if (sortedUserOwnedNFTs.length === 0) {
		return (
			<section id="deposit-panel" role="tabpanel" aria-labelledby="deposit-tab">
				<EmptyDepositState />
			</section>
		);
	}

	return (
		<section
			id="deposit-panel"
			role="tabpanel"
			aria-labelledby="deposit-tab"
			className="space-y-6 sm:space-y-8"
		>
			{/* Header */}
			<header className="space-y-3">
				<h2 className="text-xl sm:text-2xl font-semibold text-foreground">
					Deposit NFTs
				</h2>
				<p className="text-sm sm:text-base text-foreground/60">
					Select NFTs from your wallet to deposit into the vault and start
					earning yield.
				</p>
			</header>

			{/* NFT Grid */}
			<NFTGrid
				nfts={sortedUserOwnedNFTs}
				columns={{ mobile: 1, tablet: 2, desktop: 3 }}
				gap="gap-3 sm:gap-4"
				renderItem={(nft) => {
					const nftKey = createNFTKey(nft.collection, nft.tokenId);
					const hasAppraisal = appraisedNFTs.has(nftKey);
					const depositState = getNFTDepositState(
						nft.collection,
						nft.tokenId.toString(),
					);
					const isDepositing = !!depositState?.isDepositing;

					return (
						<DepositNFTCard
							key={nftKey}
							nft={nft}
							hasAppraisal={hasAppraisal}
							appraisalValue={appraisalData.get(nftKey)?.priceUSD ?? undefined}
							isDepositing={isDepositing}
							depositState={depositState}
							onDeposit={(collection, tokenId) =>
								onNFTAction(collection, tokenId, true)
							}
							onGetAppraised={(collection, tokenId) =>
								onNFTAction(collection, tokenId, false)
							}
							appraisalContractAddress={appraisal as `0x${string}` | undefined}
						/>
					);
				}}
			/>
		</section>
	);
}
