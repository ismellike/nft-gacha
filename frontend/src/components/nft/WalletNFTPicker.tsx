"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAccount } from "wagmi";
import { WalletIcon } from "@heroicons/react/24/outline";
import { Card, Button } from "../../ui";
import { NFTCard } from "./NFTCard";
import { useGachaContracts } from "../../hooks/useGachaContracts";
import { useGachaId } from "../../hooks/useGachaId";
import { useClientSearchParam } from "../../hooks/useClientSearchParams";

export interface SelectedNFT {
	collection: string;
	tokenId: string;
}

interface WalletNFTPickerProps {
	onSelect: (nft: SelectedNFT) => void;
	selectedNFT?: SelectedNFT | null;
	className?: string;
}

export function WalletNFTPicker({
	onSelect,
	selectedNFT,
	className,
}: WalletNFTPickerProps) {
	const { isConnected } = useAccount();
	const collectionParam = useClientSearchParam("collection");
	const tokenIdParam = useClientSearchParam("tokenId");
	const gachaId = useGachaId();
	const contracts = useGachaContracts(gachaId);

	const [collection, setCollection] = useState("");
	const [tokenId, setTokenId] = useState("");

	// Read URL params for pre-population and auto-select
	useEffect(() => {
		if (collectionParam && tokenIdParam) {
			setCollection(collectionParam);
			setTokenId(tokenIdParam);

			// Auto-select immediately if URL params present
			const timer = setTimeout(() => {
				onSelect({ collection: collectionParam, tokenId: tokenIdParam });
			}, 500);

			return () => clearTimeout(timer);
		}
	}, [collectionParam, tokenIdParam, onSelect]);

	// If we have a selected NFT passed in, sync state
	useEffect(() => {
		if (selectedNFT) {
			setCollection(selectedNFT.collection);
			setTokenId(selectedNFT.tokenId);
		}
	}, [selectedNFT]);

	const handleSelect = (nftCollection: string, nftTokenId: string) => {
		onSelect({ collection: nftCollection, tokenId: nftTokenId });
	};

	const handleSubmit = () => {
		if (collection && tokenId) {
			handleSelect(collection, tokenId);
		}
	};

	if (!isConnected) {
		return (
			<Card className={`${className} p-6 bg-content1/20 backdrop-blur-xl border border-white/10 rounded-2xl`}>
				<div className="text-center space-y-4">
					<div className="w-16 h-16 bg-gradient-to-br from-content1/30 to-content1/10 rounded-full flex items-center justify-center mx-auto">
						<WalletIcon className="w-8 h-8 text-foreground/60" />
					</div>
					<div>
						<h3 className="text-lg font-semibold text-foreground mb-2">
							Connect Your Wallet
						</h3>
						<p className="text-sm text-foreground/70">
							Connect to view your NFTs and start the appraisal process
						</p>
					</div>
				</div>
			</Card>
		);
	}

	return (
		<div className={className}>
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
			>
				<Card className="p-6 bg-content1/20 backdrop-blur-xl border border-white/10 rounded-2xl">
					{/* Header */}
					<div className="mb-6">
						<h3 className="text-lg font-semibold text-foreground mb-1">
							Enter NFT Details
						</h3>
						<p className="text-sm text-foreground/70">
							Paste the contract address and token ID of the NFT you want to
							appraise
						</p>
					</div>

					{/* Entry form */}
					<div className="space-y-4">
								<div>
									<label className="block text-sm font-medium text-foreground mb-2">
										Collection Address
									</label>
									<input
										type="text"
										placeholder="0x..."
										value={collection}
										onChange={(e) => setCollection(e.target.value)}
										className="w-full rounded-lg border border-white/10 bg-content1/50 px-4 py-3 text-foreground placeholder:text-foreground/40 focus:border-warning focus:ring-2 focus:ring-warning/30 focus:outline-none transition-all"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-foreground mb-2">
										Token ID
									</label>
									<input
										type="text"
										placeholder="123"
										value={tokenId}
										onChange={(e) => setTokenId(e.target.value)}
										className="w-full rounded-lg border border-white/10 bg-content1/50 px-4 py-3 text-foreground placeholder:text-foreground/40 focus:border-warning focus:ring-2 focus:ring-warning/30 focus:outline-none transition-all"
									/>
								</div>

								{/* Preview */}
								{collection &&
									tokenId &&
									contracts.appraisal && (
										<div className="bg-success/10 border border-success/20 rounded-xl p-4">
											<p className="text-xs text-success font-medium mb-3 text-center">
												NFT Preview
											</p>
											<div className="flex justify-center">
												<div className="w-48">
													<NFTCard
														data={{
															collection: collection as `0x${string}`,
															tokenId,
														}}
														size="sm"
														showCollectionName={false}
														appraisalContractAddress={
															contracts.appraisal as `0x${string}`
														}
													/>
												</div>
											</div>
										</div>
									)}

								{/* Action buttons */}
								<div className="pt-2">
									<Button
										color="glassPrimary"
										className="w-full"
										isDisabled={!collection || !tokenId}
										onPress={handleSubmit}
									>
										Continue to Appraisal
									</Button>
								</div>

								{/* Info text */}
								<div className="bg-info/10 border border-info/20 rounded-lg p-3">
									<p className="text-xs text-foreground/70 text-center">
										💡 Enter the contract address and token ID of any ERC-721 NFT
										you own to get it appraised
									</p>
								</div>
							</div>
				</Card>
			</motion.div>
		</div>
	);
}
