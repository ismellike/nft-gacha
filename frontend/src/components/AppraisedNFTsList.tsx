"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount } from "wagmi";
import {
	ClockIcon,
	CheckBadgeIcon,
	ExclamationTriangleIcon,
	MagnifyingGlassIcon,
	ArrowPathIcon,
} from "@heroicons/react/24/outline";

import { Card, Button } from "../ui";
import { LoadingState } from "./ui";
import { UnifiedNFTCard } from "./ui/UnifiedNFTCard";
import { useGachaContracts } from "../hooks/useGachaContracts";
import { useGachaId } from "../hooks/useGachaId";
import { formatCurrency } from "../lib/utils";

interface AppraisedNFT {
	collection: string;
	tokenId: string;
	priceUSD: bigint;
	status: number; // 0: Pending, 1: Completed, 2: OwnerOverride
	requester: string;
	timestamp: bigint;
	lastUpdated: bigint;
}

interface AppraisedNFTsListProps {
	userSubmittedNFTs?: Array<{
		collection: string;
		tokenId: string;
		timestamp?: number;
	}>;
	className?: string;
}

interface NFTAppraisalCardProps {
	nft: AppraisedNFT;
}

const NFTAppraisalCard = ({ nft }: NFTAppraisalCardProps) => {
	const gachaId = useGachaId();
	const contracts = useGachaContracts(gachaId);

	const getStatusInfo = (status: number) => {
		switch (status) {
			case 0:
				return {
					label: "Pending Appraisal",
					icon: ClockIcon,
					color: "text-warning",
					bgColor: "from-warning/20 to-yellow-400/20",
					borderColor: "border-warning/30",
				};
			case 1:
				return {
					label: "Appraisal Complete",
					icon: CheckBadgeIcon,
					color: "text-success",
					bgColor: "from-success/20 to-green-400/20",
					borderColor: "border-success/30",
				};
			case 2:
				return {
					label: "Owner Override",
					icon: ExclamationTriangleIcon,
					color: "text-secondary-400",
					bgColor: "from-secondary/20 to-secondary/20",
					borderColor: "border-secondary/30",
				};
			default:
				return {
					label: "Unknown Status",
					icon: ExclamationTriangleIcon,
					color: "text-foreground/60",
					bgColor: "from-content1/20 to-content1/10",
					borderColor: "border-white/20",
				};
		}
	};

	const statusInfo = getStatusInfo(nft.status);
	const StatusIcon = statusInfo.icon;
	const isComplete = nft.status === 1 || nft.status === 2;
	const hasValue = nft.priceUSD && nft.priceUSD > BigInt(0);

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4 }}
			className="group"
		>
			<Card className="h-full bg-content1/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl">
				<div className="p-6 space-y-4">
					{/* Status Badge */}
					<div className="flex items-center justify-between">
						<div
							className={`inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r ${statusInfo.bgColor} backdrop-blur-xl border ${statusInfo.borderColor} rounded-full`}
						>
							<StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
							<span className={`text-sm font-medium ${statusInfo.color}`}>
								{statusInfo.label}
							</span>
						</div>

						{/* Timestamp */}
						<div className="text-xs text-foreground/60">
							{new Date(Number(nft.timestamp) * 1000).toLocaleDateString()}
						</div>
					</div>

					{/* NFT Preview */}
					<div className="flex justify-center">
						<div className="w-48 h-48">
							{contracts.appraisal && (
								<UnifiedNFTCard
									collection={nft.collection}
									tokenId={nft.tokenId}
									variant="compact"
									showAppraisal={false}
									animate={true}
									appraisalContractAddress={contracts.appraisal}
									className="w-full h-full"
								/>
							)}
						</div>
					</div>

					{/* NFT Details */}
					<div className="space-y-3">
						<div>
							<p className="text-xs text-foreground/60 uppercase tracking-wide mb-1">
								Collection
							</p>
							<p className="text-sm font-mono text-foreground break-all">
								{nft.collection.slice(0, 6)}...{nft.collection.slice(-4)}
							</p>
						</div>
						<div>
							<p className="text-xs text-foreground/60 uppercase tracking-wide mb-1">
								Token ID
							</p>
							<p className="text-sm font-bold text-foreground">
								#{nft.tokenId}
							</p>
						</div>
					</div>

					{/* Appraised Value */}
					{isComplete && hasValue && (
						<div className="bg-gradient-to-r from-warning/20 to-orange-400/20 backdrop-blur-xl border border-warning/30 rounded-xl p-4">
							<div className="text-center space-y-2">
								<p className="text-xs text-foreground/60 uppercase tracking-wide">
									Appraised Value
								</p>
								<p className="text-2xl font-bold text-warning">
									{formatCurrency(nft.priceUSD.toString(), 18, "USD")}
								</p>
								{nft.lastUpdated > BigInt(0) && (
									<p className="text-xs text-foreground/60">
										Last updated:{" "}
										{new Date(Number(nft.lastUpdated) * 1000).toLocaleString()}
									</p>
								)}
							</div>
						</div>
					)}

					{/* Pending State */}
					{!isComplete && (
						<div className="bg-gradient-to-r from-content1/40 to-content1/20 backdrop-blur-xl border border-white/20 rounded-xl p-4">
							<div className="text-center space-y-2">
								<div className="flex items-center justify-center gap-2">
									<motion.div
										animate={{ rotate: 360 }}
										transition={{
											duration: 2,
											repeat: Infinity,
											ease: "linear",
										}}
									>
										<ArrowPathIcon className="w-5 h-5 text-warning" />
									</motion.div>
									<p className="text-sm font-medium text-foreground">
										Processing Appraisal
									</p>
								</div>
								<p className="text-xs text-foreground/60">
									External service is evaluating your NFT. This may take a few
									minutes.
								</p>
							</div>
						</div>
					)}

					{/* Status Information */}
					{isComplete && hasValue && (
						<div className="pt-2">
							<div className="bg-gradient-to-r from-success/20 to-green-400/20 backdrop-blur-xl border border-success/30 rounded-xl p-3 text-center">
								<p className="text-sm font-medium text-success">
									Ready for Gacha Deposit
								</p>
								<p className="text-xs text-foreground/60 mt-1">
									Visit the gacha pages to deposit this NFT
								</p>
							</div>
						</div>
					)}
				</div>
			</Card>
		</motion.div>
	);
};

export function AppraisedNFTsList({
	userSubmittedNFTs = [],
	className,
}: AppraisedNFTsListProps) {
	const { address: userAddress } = useAccount();
	const gachaId = useGachaId();
	const contracts = useGachaContracts(gachaId);
	const [appraisedNFTs, setAppraisedNFTs] = useState<AppraisedNFT[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Fetch appraisal data for each submitted NFT
	const fetchAppraisalData = useCallback(async () => {
		if (!contracts.appraisal || userSubmittedNFTs.length === 0) {
			setLoading(false);
			return;
		}

		setLoading(true);
		setError(null);

		try {
			const appraisals: AppraisedNFT[] = [];

			for (const nft of userSubmittedNFTs) {
				try {
					// For now, we'll create mock data since we don't have the actual contract integration set up
					// In a real implementation, this would use the useReadNftAppraisalGetAppraisal hook
					const mockStatus = Math.random() > 0.5 ? 1 : 0; // Random status for demo
					const mockPrice =
						mockStatus === 1
							? BigInt(Math.floor(Math.random() * 1000) + 100) *
								BigInt(10 ** 18)
							: BigInt(0);

					const appraisal: AppraisedNFT = {
						collection: nft.collection,
						tokenId: nft.tokenId,
						priceUSD: mockPrice,
						status: mockStatus,
						requester: userAddress || "",
						timestamp: BigInt(Math.floor((nft.timestamp || Date.now()) / 1000)),
						lastUpdated:
							mockStatus === 1
								? BigInt(Math.floor(Date.now() / 1000))
								: BigInt(0),
					};

					appraisals.push(appraisal);
				} catch (err) {
					console.warn(
						`Failed to fetch appraisal for ${nft.collection}:${nft.tokenId}`,
						err,
					);
				}
			}

			setAppraisedNFTs(appraisals);
		} catch (err) {
			console.error("Failed to fetch appraisal data:", err);
			setError("Failed to load appraisal data. Please try again.");
		} finally {
			setLoading(false);
		}
	}, [contracts.appraisal, userSubmittedNFTs, userAddress]);

	useEffect(() => {
		fetchAppraisalData();
	}, [fetchAppraisalData]);

	const completedAppraisals = useMemo(
		() => appraisedNFTs.filter((nft) => nft.status === 1 || nft.status === 2),
		[appraisedNFTs],
	);

	const pendingAppraisals = useMemo(
		() => appraisedNFTs.filter((nft) => nft.status === 0),
		[appraisedNFTs],
	);

	if (loading) {
		return (
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				className={className}
			>
				<Card className="p-6 bg-content1/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
					<div className="text-center space-y-4">
						<LoadingState size="lg" />
						<p className="text-foreground/70">Loading your appraisals...</p>
					</div>
				</Card>
			</motion.div>
		);
	}

	if (error) {
		return (
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				className={className}
			>
				<Card className="p-6 bg-danger/10 border border-danger/20 rounded-2xl shadow-lg">
					<div className="text-center space-y-4">
						<ExclamationTriangleIcon className="w-12 h-12 text-danger mx-auto" />
						<div>
							<h3 className="text-lg font-medium text-danger mb-2">
								Error Loading Appraisals
							</h3>
							<p className="text-foreground/70 mb-4">{error}</p>
							<Button
								className="rounded-xl bg-danger/20 border border-danger/30 text-danger hover:bg-danger/30"
								onPress={fetchAppraisalData}
							>
								Try Again
							</Button>
						</div>
					</div>
				</Card>
			</motion.div>
		);
	}

	if (appraisedNFTs.length === 0) {
		return (
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className={className}
			>
				<Card className="p-6 bg-content1/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
					<div className="text-center space-y-4">
						<div className="w-16 h-16 bg-gradient-to-br from-content1/20 to-content1/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center mx-auto">
							<MagnifyingGlassIcon className="w-8 h-8 text-foreground/60" />
						</div>
						<div>
							<h3 className="text-xl font-medium text-foreground mb-2">
								No Appraisals Yet
							</h3>
							<p className="text-foreground/70">
								Submit your NFTs for appraisal to see them here
							</p>
						</div>
					</div>
				</Card>
			</motion.div>
		);
	}

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.6 }}
			className={className}
		>
			<div className="space-y-8">
				{/* Header */}
				<div className="text-center">
					<h2 className="text-3xl font-light mb-4 tracking-tight">
						<span className="bg-gradient-to-r from-warning to-orange-400 bg-clip-text text-transparent">
							Your NFT Appraisals
						</span>
					</h2>
					<p className="text-foreground/70 max-w-2xl mx-auto">
						Track the status and values of your submitted NFTs
					</p>
				</div>

				{/* Statistics */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<Card className="p-4 bg-content1/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl">
						<div className="text-center">
							<p className="text-sm text-foreground/60 uppercase tracking-wide mb-2">
								Total Submitted
							</p>
							<p className="text-2xl font-bold text-foreground">
								{appraisedNFTs.length}
							</p>
						</div>
					</Card>

					<Card className="p-4 bg-content1/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl">
						<div className="text-center">
							<p className="text-sm text-foreground/60 uppercase tracking-wide mb-2">
								Completed
							</p>
							<p className="text-2xl font-bold text-success">
								{completedAppraisals.length}
							</p>
						</div>
					</Card>

					<Card className="p-4 bg-content1/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl">
						<div className="text-center">
							<p className="text-sm text-foreground/60 uppercase tracking-wide mb-2">
								Pending
							</p>
							<p className="text-2xl font-bold text-warning">
								{pendingAppraisals.length}
							</p>
						</div>
					</Card>
				</div>

				{/* Completed Appraisals */}
				{completedAppraisals.length > 0 && (
					<div className="space-y-4">
						<h3 className="text-xl font-medium text-foreground flex items-center gap-2">
							<CheckBadgeIcon className="w-6 h-6 text-success" />
							Appraisal Complete
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							<AnimatePresence>
								{completedAppraisals.map((nft) => (
									<NFTAppraisalCard
										key={`${nft.collection}:${nft.tokenId}`}
										nft={nft}
									/>
								))}
							</AnimatePresence>
						</div>
					</div>
				)}

				{/* Pending Appraisals */}
				{pendingAppraisals.length > 0 && (
					<div className="space-y-4">
						<h3 className="text-xl font-medium text-foreground flex items-center gap-2">
							<ClockIcon className="w-6 h-6 text-warning" />
							Processing
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							<AnimatePresence>
								{pendingAppraisals.map((nft) => (
									<NFTAppraisalCard
										key={`${nft.collection}:${nft.tokenId}`}
										nft={nft}
									/>
								))}
							</AnimatePresence>
						</div>
					</div>
				)}

				{/* Refresh Button */}
				<div className="flex justify-center pt-4">
					<Button
						className="rounded-xl bg-content1/20 backdrop-blur-xl border border-white/20 text-foreground hover:bg-content1/30"
						onPress={fetchAppraisalData}
						isLoading={loading}
					>
						Refresh Status
					</Button>
				</div>
			</div>
		</motion.div>
	);
}
