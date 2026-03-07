"use client";

import { AnimatePresence, motion } from "framer-motion";
import { createNFTKey } from "../../../stores/storeUtils";
import { Button } from "../../../ui";
import NFTGrid from "../cards/NFTGrid";
import WithdrawNFTCard from "../cards/WithdrawNFTCard";
import { EmptyWithdrawState } from "../empty-states/EmptyWithdrawState";

interface NFTWithCollection {
	collection: `0x${string}`;
	tokenId: bigint;
	appraisedPrice: bigint;
	currentRarity?: number | string;
	collectionName?: string | undefined;
}

interface WithdrawTabProps {
	filteredWithdrawableNFTs: NFTWithCollection[];
	totalDepositedNFTs: number;
	withdrawingNFT: { collection: `0x${string}`; tokenId: bigint } | null;
	onWithdrawNFT: (collection: `0x${string}`, tokenId: bigint) => void;
	onSwitchToDeposit?: () => void;
}

export function WithdrawTab({
	filteredWithdrawableNFTs,
	totalDepositedNFTs,
	withdrawingNFT,
	onWithdrawNFT,
	onSwitchToDeposit,
}: WithdrawTabProps) {
	const hasDeposits = totalDepositedNFTs > 0;

	// Empty state - no deposits at all
	if (!hasDeposits) {
		return (
			<section
				id="withdraw-panel"
				role="tabpanel"
				aria-labelledby="withdraw-tab"
			>
				<header className="mb-6 space-y-2">
					<h2 className="text-xl sm:text-2xl font-semibold text-foreground">
						Withdraw NFTs
					</h2>
					<p className="text-sm sm:text-base text-foreground/60">
						Select an NFT from your vault to withdraw it back to your wallet.
					</p>
				</header>

				<EmptyWithdrawState message="No NFTs found in your vault deposits." />

				{/* Instructions */}
				{onSwitchToDeposit && (
					<motion.div
						className="mx-auto max-w-md space-y-4 mt-6"
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2 }}
					>
						<div className="rounded-xl border border-white/10 bg-content1/20 p-4 text-left">
							<h4 className="mb-2 font-medium text-foreground">
								How to deposit NFTs:
							</h4>
							<ol className="space-y-1 text-sm text-foreground/70">
								<li>1. Switch to the "Deposit NFTs" tab</li>
								<li>2. Get your NFTs appraised (if not already)</li>
								<li>3. Deposit appraised NFTs to start earning yield</li>
								<li>4. Return here to withdraw them anytime</li>
							</ol>
						</div>

						<Button
							color="glass"
							onPress={onSwitchToDeposit}
							className="w-full min-h-[44px] rounded-xl"
						>
							Go to Deposit NFTs
						</Button>
					</motion.div>
				)}
			</section>
		);
	}

	return (
		<section
			id="withdraw-panel"
			role="tabpanel"
			aria-labelledby="withdraw-tab"
			className="space-y-6 sm:space-y-8"
		>
			{/* Header */}
			<header className="space-y-3">
				<h2 className="text-xl sm:text-2xl font-semibold text-foreground">
					Withdraw NFTs
				</h2>
				<p className="text-sm sm:text-base text-foreground/60">
					Select an NFT from your vault to withdraw it back to your wallet.
				</p>
				<p className="text-sm text-foreground/70">
					{filteredWithdrawableNFTs.length} of {totalDepositedNFTs} NFT
					{totalDepositedNFTs !== 1 ? "s" : ""} available.
				</p>
			</header>

			{/* NFTs Grid or Empty State */}
			<AnimatePresence mode="wait">
				{filteredWithdrawableNFTs.length === 0 ? (
					<motion.div
						key="empty"
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						className="rounded-xl border border-dashed border-white/10 bg-content1/20 p-8 sm:p-10 text-center"
					>
						<p className="mb-3 text-base sm:text-lg font-medium text-foreground">
							No NFTs ready to withdraw
						</p>
						<p className="text-sm text-foreground/60">
							Deposit NFTs first, then return here to withdraw them back to your
							wallet.
						</p>
					</motion.div>
				) : (
					<div className="space-y-6">
						<h3 className="text-lg font-semibold text-foreground">
							Your Vault NFTs
						</h3>
						<NFTGrid
							nfts={filteredWithdrawableNFTs}
							columns={{ mobile: 1, tablet: 2, desktop: 3 }}
							gap="gap-4"
							renderItem={(nft, index) => {
								const nftKey = createNFTKey(nft.collection, nft.tokenId);
								const isWithdrawingThisNFT =
									withdrawingNFT?.collection === nft.collection &&
									withdrawingNFT?.tokenId === nft.tokenId;

								return (
									<WithdrawNFTCard
										key={nftKey}
										nft={nft}
										isWithdrawing={isWithdrawingThisNFT}
										onWithdraw={onWithdrawNFT}
										index={index}
									/>
								);
							}}
						/>
					</div>
				)}
			</AnimatePresence>
		</section>
	);
}
