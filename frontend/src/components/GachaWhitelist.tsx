"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { GlassCard, GlassButton, LoadingState } from "@/components/ui";
import { UserNFTModal } from "@/components/UserNFTModal";
import {
	useReadGachaTreasuryGetWhitelistedCollections,
	useReadErc721Name,
	useReadErc721Symbol,
} from "@/generated";
import {
	PlusIcon,
	PhotoIcon,
	CheckBadgeIcon,
} from "@heroicons/react/24/outline";
import { formatAddress } from "@/lib/utils";
import { useGachaContracts } from "@/hooks/useGachaContracts";
import { useGachaId } from "@/hooks/useGachaId";

interface GachaWhitelistProps {
	gachaAddress: string;
}

interface CollectionCardProps {
	address: string;
	index: number;
	onDepositClick: (address: string) => void;
}

function CollectionCard({
	address,
	index,
	onDepositClick,
}: CollectionCardProps) {
	const { data: name, isLoading: nameLoading } = useReadErc721Name({
		address: address as `0x${string}`,
	});

	const { data: symbol, isLoading: symbolLoading } = useReadErc721Symbol({
		address: address as `0x${string}`,
	});

	const isLoading = nameLoading || symbolLoading;

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, delay: index * 0.1 }}
		>
			<GlassCard variant="base" className="p-4 lg:p-6 h-full overflow-hidden">
				<div className="space-y-4 max-w-full">
					<div className="text-center">
						<div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-warning/20 to-orange-400/20 rounded-2xl flex items-center justify-center">
							<PhotoIcon className="w-6 h-6 text-warning" />
						</div>

						{isLoading ? (
							<div className="space-y-2">
								<div className="h-5 bg-content1/20 rounded animate-pulse mx-auto max-w-32" />
								<div className="h-4 bg-content1/20 rounded animate-pulse mx-auto max-w-20" />
							</div>
						) : (
							<>
								<h3 className="font-bold text-lg lg:text-xl text-foreground mb-1 break-words overflow-hidden">
									{name || "Unknown Collection"}
								</h3>
								<p className="text-sm text-foreground/60 break-all overflow-hidden text-ellipsis">
									{symbol ? `$${symbol}` : formatAddress(address)}
								</p>
							</>
						)}

						<div className="inline-flex items-center gap-1.5 text-success bg-success/15 px-2.5 py-1 rounded-lg mt-3">
							<CheckBadgeIcon className="w-3.5 h-3.5 flex-shrink-0" />
							<span className="text-xs font-semibold">Verified</span>
						</div>
					</div>

					<div className="p-3 bg-content1/10 rounded-lg border border-content1/20 overflow-hidden">
						<div className="text-center">
							<span className="font-semibold text-foreground text-sm block mb-2">
								Contract Address
							</span>
							<div className="font-mono text-xs bg-content1/10 p-2 rounded break-all overflow-hidden text-ellipsis">
								{formatAddress(address)}
							</div>
						</div>
					</div>

					<GlassButton
						variant="primary"
						size="sm"
						className="w-full h-10"
						onClick={() => onDepositClick(address)}
					>
						<div className="flex items-center justify-center gap-2">
							<PlusIcon className="w-4 h-4 flex-shrink-0" />
							<span className="font-bold text-sm">Deposit NFTs</span>
						</div>
					</GlassButton>
				</div>
			</GlassCard>
		</motion.div>
	);
}

export function GachaWhitelist({ gachaAddress }: GachaWhitelistProps) {
	const [selectedCollection, setSelectedCollection] = useState<string | null>(
		null,
	);
	const gachaId = useGachaId();
	const contracts = useGachaContracts(gachaId);

	const {
		data: whitelistedCollections,
		isLoading,
		error,
	} = useReadGachaTreasuryGetWhitelistedCollections({
		address: contracts.treasury,
		query: { enabled: !!contracts.treasury },
	});

	const handleDepositClick = (collectionAddress: string) => {
		setSelectedCollection(collectionAddress);
	};

	const handleCloseModal = () => {
		setSelectedCollection(null);
	};

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div className="text-center">
					<h2 className="text-2xl font-bold mb-2">Whitelisted Collections</h2>
					<p className="text-default-600">
						Loading whitelisted NFT collections...
					</p>
				</div>
				<LoadingState text="Fetching collections..." />
			</div>
		);
	}

	if (error) {
		return (
			<div className="text-center py-12">
				<div className="w-16 h-16 mx-auto mb-4 bg-danger/20 rounded-full flex items-center justify-center">
					<PhotoIcon className="w-8 h-8 text-danger" />
				</div>
				<h3 className="text-xl font-semibold mb-2">
					Failed to Load Collections
				</h3>
				<p className="text-default-600 mb-4">
					Unable to fetch whitelisted collections.
				</p>
				<GlassButton variant="secondary" size="sm">
					Try Again
				</GlassButton>
			</div>
		);
	}

	const collections = whitelistedCollections || [];

	if (collections.length === 0) {
		return (
			<div className="text-center py-12">
				<div className="w-16 h-16 mx-auto mb-4 bg-warning/20 rounded-full flex items-center justify-center">
					<PhotoIcon className="w-8 h-8 text-warning" />
				</div>
				<h3 className="text-xl font-semibold mb-2">
					No Collections Whitelisted
				</h3>
				<p className="text-default-600">
					This gacha doesn't have any whitelisted NFT collections yet. Check
					back later for updates!
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-16 lg:space-y-20">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6 }}
				className="text-center"
			>
				<h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold mb-6 lg:mb-8 bg-gradient-to-r from-warning to-orange-400 bg-clip-text text-transparent">
					Whitelisted Collections
				</h2>
				<p className="text-foreground/70 text-lg lg:text-xl xl:text-2xl max-w-4xl mx-auto leading-relaxed">
					These NFT collections are eligible for this gacha. You can deposit any
					NFTs from these collections to contribute to the prize pool and earn
					rewards.
				</p>
			</motion.div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 overflow-hidden max-w-full">
				{collections.map((address: string, index: number) => (
					<CollectionCard
						key={address}
						address={address}
						index={index}
						onDepositClick={handleDepositClick}
					/>
				))}
			</div>

			{selectedCollection && (
				<UserNFTModal
					collectionAddress={selectedCollection}
					isOpen={!!selectedCollection}
					onClose={handleCloseModal}
				/>
			)}
		</div>
	);
}
