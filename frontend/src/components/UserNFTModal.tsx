"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount } from "wagmi";
import { GlassButton, LoadingState, GlassCard } from "@/components/ui";
import { UnifiedNFTCard } from "@/components/ui/UnifiedNFTCard";
import {
	useReadErc721Name,
	useReadErc721Symbol,
	useReadErc721BalanceOf,
} from "@/generated";
import {
	XMarkIcon,
	CheckIcon,
	ArrowUpTrayIcon,
	SparklesIcon,
	PhotoIcon,
} from "@heroicons/react/24/outline";
import { formatAddress } from "@/lib/utils";
import { useUserOwnedNFTs } from "@/hooks/useUserOwnedNFTs";
import { useGachaContracts } from "@/hooks/useGachaContracts";
import { useGachaId } from "@/hooks/useGachaId";

interface UserNFTModalProps {
	collectionAddress: string;
	isOpen: boolean;
	onClose: () => void;
}

interface SelectableNFTCardProps {
	collectionAddress: string;
	tokenId: bigint;
	isSelected: boolean;
	onToggleSelect: (tokenId: bigint) => void;
}

function SelectableNFTCard({
	collectionAddress,
	tokenId,
	isSelected,
	onToggleSelect,
}: SelectableNFTCardProps) {
	const gachaId = useGachaId();
	const contracts = useGachaContracts(gachaId);

	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.9 }}
			animate={{ opacity: 1, scale: 1 }}
			exit={{ opacity: 0, scale: 0.9 }}
			transition={{ duration: 0.3 }}
			className="relative"
		>
			<UnifiedNFTCard
				collection={collectionAddress}
				tokenId={tokenId.toString()}
				size="md"
				variant="detailed"
				showAppraisal={true}
				appraisalContractAddress={contracts.appraisal!}
				animate={true}
				priority={5}
				onClick={() => onToggleSelect(tokenId)}
				className={`transition-all duration-200 ${
					isSelected
						? "ring-2 ring-yellow-400 ring-opacity-60 shadow-lg shadow-yellow-400/20"
						: "hover:scale-105"
				}`}
			/>

			{isSelected && (
				<motion.div
					initial={{ opacity: 0, scale: 0.8 }}
					animate={{ opacity: 1, scale: 1 }}
					className="absolute top-3 right-3 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center z-20 shadow-lg"
				>
					<CheckIcon className="w-4 h-4 text-black" />
				</motion.div>
			)}
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
	const gachaId = useGachaId();
	const contracts = useGachaContracts(gachaId);

	const { data: collectionName } = useReadErc721Name({
		address: collectionAddress as `0x${string}`,
	});

	const { data: balance, isLoading: balanceLoading } = useReadErc721BalanceOf({
		address: collectionAddress as `0x${string}`,
		args: address ? [address] : undefined,
		query: { enabled: !!address },
	});

	// Use the new hook to fetch all user-owned NFTs including gacha wins
	const {
		tokens: userTokens,
		isLoading: tokensLoading,
		error: tokensError,
		refetch: refetchTokens,
	} = useUserOwnedNFTs(collectionAddress);

	// Reset selected tokens when modal opens/closes or tokens change
	useEffect(() => {
		if (!isOpen) {
			setSelectedTokens(new Set());
		}
	}, [isOpen]);

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
								{tokensLoading ? (
									<LoadingState text="Loading your NFTs..." />
								) : tokensError ? (
									<div className="text-center py-12">
										<div className="w-16 h-16 mx-auto mb-4 bg-danger/20 rounded-full flex items-center justify-center">
											<XMarkIcon className="w-8 h-8 text-danger" />
										</div>
										<h4 className="text-lg font-semibold mb-2">
											Error Loading NFTs
										</h4>
										<p className="text-default-600 mb-4">{tokensError}</p>
										<GlassButton variant="secondary" onClick={refetchTokens}>
											Try Again
										</GlassButton>
									</div>
								) : userTokens.length === 0 ? (
									<div className="text-center py-12">
										<div className="w-16 h-16 mx-auto mb-4 bg-warning/20 rounded-full flex items-center justify-center">
											<PhotoIcon className="w-8 h-8 text-warning" />
										</div>
										<h4 className="text-lg font-semibold mb-2">
											No NFTs Found
										</h4>
										<p className="text-default-600 mb-2">
											You don't own any NFTs from this collection.
										</p>
										<p className="text-default-500 text-sm">
											Try spinning the gacha to win some NFTs!
										</p>
									</div>
								) : (
									<>
										<div className="flex items-center justify-between mb-4">
											<div className="flex items-center gap-2">
												<p className="text-sm text-default-600">
													Found {userTokens.length} NFT
													{userTokens.length !== 1 ? "s" : ""}
													{selectedTokens.size > 0 &&
														` • ${selectedTokens.size} selected`}
												</p>
												<div className="flex items-center gap-1 text-xs text-warning bg-warning/10 px-2 py-1 rounded-full">
													<SparklesIcon className="w-3 h-3" />
													<span>Including gacha wins</span>
												</div>
											</div>
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
												<SelectableNFTCard
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
