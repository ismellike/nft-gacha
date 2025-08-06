"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount } from "wagmi";
import { GlassCard, GlassButton, LoadingState } from "@/components/ui";
import {
	useReadErc721Name,
	useReadErc721Symbol,
	useReadErc721BalanceOf,
	useReadErc721TokenUri,
} from "@/generated";
import {
	XMarkIcon,
	PhotoIcon,
	CheckIcon,
	ArrowUpTrayIcon,
} from "@heroicons/react/24/outline";
import { formatAddress } from "@/lib/utils";

interface UserNFTModalProps {
	collectionAddress: string;
	isOpen: boolean;
	onClose: () => void;
}

interface NFTCardProps {
	collectionAddress: string;
	tokenId: bigint;
	isSelected: boolean;
	onToggleSelect: (tokenId: bigint) => void;
}

function NFTCard({
	collectionAddress,
	tokenId,
	isSelected,
	onToggleSelect,
}: NFTCardProps) {
	const { data: tokenUri } = useReadErc721TokenUri({
		address: collectionAddress as `0x${string}`,
		args: [tokenId],
	});

	const [metadata, setMetadata] = useState<any>(null);
	const [imageUrl, setImageUrl] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!tokenUri) {
			setLoading(false);
			return;
		}

		const fetchMetadata = async () => {
			try {
				// Handle IPFS URLs
				let url = tokenUri;
				if (tokenUri.startsWith("ipfs://")) {
					url = tokenUri.replace("ipfs://", "https://ipfs.io/ipfs/");
				}

				const response = await fetch(url);
				const data = await response.json();
				setMetadata(data);

				// Handle image URL
				let imgUrl = data.image;
				if (imgUrl?.startsWith("ipfs://")) {
					imgUrl = imgUrl.replace("ipfs://", "https://ipfs.io/ipfs/");
				}
				setImageUrl(imgUrl);
			} catch (error) {
				console.error("Failed to fetch NFT metadata:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchMetadata();
	}, [tokenUri]);

	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.9 }}
			animate={{ opacity: 1, scale: 1 }}
			exit={{ opacity: 0, scale: 0.9 }}
			transition={{ duration: 0.3 }}
			className="relative"
		>
			<GlassCard
				variant="base"
				className={`p-4 cursor-pointer transition-all duration-200 ${
					isSelected
						? "ring-2 ring-warning bg-warning/10"
						: "hover:bg-content1/30"
				}`}
				onClick={() => onToggleSelect(tokenId)}
			>
				<div className="aspect-square mb-3 relative bg-content1/20 rounded-xl overflow-hidden">
					{loading ? (
						<div className="w-full h-full flex items-center justify-center">
							<div className="w-8 h-8 border-2 border-warning border-t-transparent rounded-full animate-spin" />
						</div>
					) : imageUrl ? (
						<img
							src={imageUrl}
							alt={metadata?.name || `Token #${tokenId}`}
							className="w-full h-full object-cover"
							onError={(e) => {
								e.currentTarget.style.display = "none";
								e.currentTarget.nextElementSibling?.classList.remove("hidden");
							}}
						/>
					) : null}

					<div className="hidden w-full h-full flex items-center justify-center bg-content1/20">
						<PhotoIcon className="w-12 h-12 text-default-400" />
					</div>

					{isSelected && (
						<motion.div
							initial={{ opacity: 0, scale: 0.8 }}
							animate={{ opacity: 1, scale: 1 }}
							className="absolute top-2 right-2 w-6 h-6 bg-warning rounded-full flex items-center justify-center"
						>
							<CheckIcon className="w-4 h-4 text-black" />
						</motion.div>
					)}
				</div>

				<div className="text-center">
					<h4 className="font-medium text-sm truncate">
						{metadata?.name || `Token #${tokenId}`}
					</h4>
					<p className="text-xs text-default-600 mt-1">
						ID: {tokenId.toString()}
					</p>
				</div>
			</GlassCard>
		</motion.div>
	);
}

export function UserNFTModal({
	collectionAddress,
	isOpen,
	onClose,
}: UserNFTModalProps) {
	const { address } = useAccount();
	const [selectedTokens, setSelectedTokens] = useState<Set<bigint>>(new Set());
	const [userTokens, setUserTokens] = useState<bigint[]>([]);

	const { data: collectionName } = useReadErc721Name({
		address: collectionAddress as `0x${string}`,
	});

	const { data: balance, isLoading: balanceLoading } = useReadErc721BalanceOf({
		address: collectionAddress as `0x${string}`,
		args: address ? [address] : undefined,
		query: { enabled: !!address },
	});

	// Fetch user's token IDs
	useEffect(() => {
		if (!balance || !address || balance === BigInt(0)) {
			setUserTokens([]);
			return;
		}

		const fetchTokens = async () => {
			const tokens: bigint[] = [];
			const balanceNumber = Number(balance);

			// Limit to first 20 tokens to avoid overwhelming the UI
			const limit = Math.min(balanceNumber, 20);

			for (let i = 0; i < limit; i++) {
				try {
					// Note: This assumes the contract implements tokenOfOwnerByIndex
					// If not available, we'd need to use a different approach
					const tokenId = await fetch(
						`/api/nft/${collectionAddress}/owner/${address}/index/${i}`,
					);
					// This is a placeholder - in practice you'd use a proper indexing service
					tokens.push(BigInt(i)); // Simplified for demo
				} catch (error) {
					console.error(`Failed to fetch token at index ${i}:`, error);
				}
			}

			setUserTokens(tokens);
		};

		fetchTokens();
	}, [balance, address, collectionAddress]);

	const handleToggleSelect = (tokenId: bigint) => {
		setSelectedTokens((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(tokenId)) {
				newSet.delete(tokenId);
			} else {
				newSet.add(tokenId);
			}
			return newSet;
		});
	};

	const handleDeposit = async () => {
		if (selectedTokens.size === 0) return;

		// TODO: Implement actual deposit logic
		console.log("Depositing tokens:", Array.from(selectedTokens));

		// Reset selections and close modal
		setSelectedTokens(new Set());
		onClose();
	};

	if (!address) {
		return (
			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-background/95 backdrop-blur-xl z-50 flex items-center justify-center p-4"
					>
						<motion.div
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.9 }}
							className="w-full max-w-md"
						>
							<GlassCard variant="base" className="p-8 text-center">
								<h3 className="text-xl font-semibold mb-4">Connect Wallet</h3>
								<p className="text-default-600 mb-6">
									Please connect your wallet to view and deposit your NFTs.
								</p>
								<GlassButton variant="secondary" onClick={onClose}>
									Close
								</GlassButton>
							</GlassCard>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		);
	}

	return (
		<AnimatePresence>
			{isOpen && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className="fixed inset-0 bg-background/95 backdrop-blur-xl z-50 flex items-center justify-center p-4"
				>
					<motion.div
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.9 }}
						className="w-full max-w-4xl max-h-[90vh] overflow-hidden"
					>
						<GlassCard variant="base" className="p-6">
							<div className="flex items-center justify-between mb-6">
								<div>
									<h3 className="text-2xl font-bold">Your NFTs</h3>
									<p className="text-default-600">
										{collectionName || formatAddress(collectionAddress)}
									</p>
								</div>
								<GlassButton variant="secondary" size="sm" onClick={onClose}>
									<XMarkIcon className="w-4 h-4 mr-2" />
									Close
								</GlassButton>
							</div>

							<div className="mb-6">
								{balanceLoading ? (
									<LoadingState text="Loading your NFTs..." />
								) : balance === BigInt(0) ? (
									<div className="text-center py-12">
										<div className="w-16 h-16 mx-auto mb-4 bg-warning/20 rounded-full flex items-center justify-center">
											<PhotoIcon className="w-8 h-8 text-warning" />
										</div>
										<h4 className="text-lg font-semibold mb-2">
											No NFTs Found
										</h4>
										<p className="text-default-600">
											You don't own any NFTs from this collection.
										</p>
									</div>
								) : (
									<>
										<div className="flex items-center justify-between mb-4">
											<p className="text-sm text-default-600">
												Found {balance?.toString()} NFT
												{balance !== BigInt(1) ? "s" : ""}
												{selectedTokens.size > 0 &&
													` • ${selectedTokens.size} selected`}
											</p>
											{selectedTokens.size > 0 && (
												<GlassButton
													variant="secondary"
													size="sm"
													onClick={() => setSelectedTokens(new Set())}
												>
													Clear Selection
												</GlassButton>
											)}
										</div>

										<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 max-h-96 overflow-y-auto">
											{userTokens.map((tokenId) => (
												<NFTCard
													key={tokenId.toString()}
													collectionAddress={collectionAddress}
													tokenId={tokenId}
													isSelected={selectedTokens.has(tokenId)}
													onToggleSelect={handleToggleSelect}
												/>
											))}
										</div>
									</>
								)}
							</div>

							{selectedTokens.size > 0 && (
								<motion.div
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									className="border-t border-white/10 pt-6"
								>
									<div className="flex items-center justify-between">
										<div>
											<p className="font-medium">
												Ready to deposit {selectedTokens.size} NFT
												{selectedTokens.size !== 1 ? "s" : ""}
											</p>
											<p className="text-sm text-default-600">
												These will be added to the gacha pool
											</p>
										</div>
										<GlassButton variant="primary" onClick={handleDeposit}>
											<ArrowUpTrayIcon className="w-4 h-4 mr-2" />
											Deposit Selected
										</GlassButton>
									</div>
								</motion.div>
							)}
						</GlassCard>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
