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
	GiftIcon,
	FunnelIcon,
	ArrowsUpDownIcon,
	DocumentTextIcon,
	SparklesIcon,
} from "@heroicons/react/24/outline";

import { Card, Button } from "../ui";
import { LoadingState } from ".";
import { UnifiedNFTCard } from "./UnifiedNFTCard";
import { DepositableNFTCard } from "./DepositableNFTCard";
import { useGachaContracts } from "../hooks/useGachaContracts";
import { useGachaId } from "../hooks/useGachaId";
import { formatCurrency } from "../lib/utils";
import { useAppraisalData, type AppraisalFilter, type AppraisalSort } from "../hooks/useAppraisalData";
import type { OptimisticAppraisal } from "../stores/nftAppraisalStore";

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
	nft: AppraisedNFT | OptimisticAppraisal; // Accept both AppraisedNFT and OptimisticAppraisal
	onDepositAction?: (collection: string, tokenId: string, action: string) => void;
}

const NFTAppraisalCard = ({ nft, onDepositAction }: NFTAppraisalCardProps) => {
	const gachaId = useGachaId();
	const contracts = useGachaContracts(gachaId);

	// Check if this is an optimistic appraisal
	const isOptimistic = 'isOptimistic' in nft && nft.isOptimistic;

	const getStatusInfo = (status: number | undefined) => {
		if (isOptimistic) {
			return {
				label: "Submitting Appraisal",
				icon: ClockIcon,
				color: "text-warning",
				bgColor: "from-warning/20 to-yellow-400/20",
				borderColor: "border-warning/30",
			};
		}

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

	const statusInfo = getStatusInfo(isOptimistic ? undefined : (nft as AppraisedNFT).status);
	const StatusIcon = statusInfo.icon;
	const isComplete = !isOptimistic && ((nft as AppraisedNFT).status === 1 || (nft as AppraisedNFT).status === 2);
	const hasValue = !isOptimistic && (nft as AppraisedNFT).priceUSD && (nft as AppraisedNFT).priceUSD > BigInt(0);

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
							{isOptimistic
								? new Date(nft.timestamp).toLocaleDateString()
								: new Date(Number((nft as AppraisedNFT).timestamp) * 1000).toLocaleDateString()
							}
						</div>
					</div>

					{/* NFT Preview */}
					<div className="flex justify-center">
						{contracts.appraisal && (
							<UnifiedNFTCard
								collection={nft.collection}
								tokenId={nft.tokenId}
								variant="compact"
								size="md"
								showAppraisal={false}
								animate={true}
								appraisalContractAddress={contracts.appraisal as `0x${string}`}
							/>
						)}
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
									{formatCurrency((nft as AppraisedNFT).priceUSD.toString(), 18, "USD")}
								</p>
								{!isOptimistic && (nft as AppraisedNFT).lastUpdated > BigInt(0) && (
									<p className="text-xs text-foreground/60">
										Last updated:{" "}
										{new Date(Number((nft as AppraisedNFT).lastUpdated) * 1000).toLocaleString()}
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

					{/* Status Information & Deposit CTA */}
					{isComplete && hasValue && (
						<div className="pt-2">
							<div className="bg-gradient-to-r from-success/20 to-green-400/20 backdrop-blur-xl border border-success/30 rounded-xl p-3">
								<div className="text-center space-y-2">
									<p className="text-sm font-medium text-success">
										Ready for Gacha Deposit
									</p>
									<Button
										className="w-full rounded-xl bg-gradient-to-r from-warning to-orange-400 text-black hover:from-warning/90 hover:to-orange-400/90 transition-all duration-300"
										onPress={() => {
											if (onDepositAction) {
												onDepositAction(nft.collection, nft.tokenId, "deposit");
											}
										}}
									>
										<span className="flex items-center justify-center gap-2">
											<GiftIcon className="w-4 h-4" />
											Deposit to Gacha
										</span>
									</Button>
								</div>
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

	// State for filter and sort controls
	const [filter, setFilter] = useState<AppraisalFilter>("all");
	const [sort, setSort] = useState<AppraisalSort>("newest");

	// Use enhanced hook for appraisal data management with filtering and sorting
	const {
		appraisals,
		loading,
		error,
		refetch,
		stats
	} = useAppraisalData(userAddress, {
		autoRefresh: true,
		refreshInterval: 60000, // 1 minute
		filter,
		sort,
	});

	const appraisedNFTs = appraisals; // Alias for compatibility
	const [depositModalNFT, setDepositModalNFT] = useState<{collection: string; tokenId: string} | null>(null);

	// Fetch appraisals for specific NFTs if provided via props and check for updates
	useEffect(() => {
		if (userSubmittedNFTs.length > 0) {
			// Use the shared hook's method to fetch for specific NFTs
			refetch();
		}
	}, [userSubmittedNFTs, refetch]);

	// Periodically refresh pending appraisals to check for status updates
	useEffect(() => {
		if (!userAddress || loading) return;

		const pendingAppraisals = appraisedNFTs.filter(nft => !('isOptimistic' in nft) && nft.status === 0);
		if (pendingAppraisals.length === 0) return;

		// Refresh every 30 seconds for pending appraisals
		const interval = setInterval(() => {
			refetch();
		}, 30000);

		return () => clearInterval(interval);
	}, [appraisedNFTs, userAddress, loading, refetch]);

	// Handle deposit actions from NFT cards
	const handleDepositAction = useCallback((collection: string, tokenId: string, action: string) => {
		if (action === "deposit") {
			setDepositModalNFT({ collection, tokenId });
		}
	}, []);

	// Handle closing the deposit modal
	const handleCloseDepositModal = useCallback(() => {
		setDepositModalNFT(null);
	}, []);

	// Enhanced loading state with more context
	const loadingMessage = useMemo(() => {
		const pendingAppraisals = appraisedNFTs.filter(nft => !('isOptimistic' in nft) && nft.status === 0);
		if (pendingAppraisals.length > 0) {
			return `Checking status of ${pendingAppraisals.length} pending appraisal${pendingAppraisals.length === 1 ? '' : 's'}...`;
		}
		return "Loading your appraisals...";
	}, [appraisedNFTs]);

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
						<p className="text-foreground/70">{loadingMessage}</p>
						<p className="text-xs text-foreground/50">
							Fetching live data from NFT Appraisal contract...
						</p>
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
								Unable to Connect to Appraisal Contract
							</h3>
							<p className="text-foreground/70 mb-2">{error}</p>
							<p className="text-xs text-foreground/60 mb-4">
								This could be due to network issues or contract problems. Please try again.
							</p>
							<div className="flex gap-3 justify-center">
								<Button
									className="rounded-xl bg-danger/20 border border-danger/30 text-danger hover:bg-danger/30"
									onPress={refetch}
								>
									<span className="flex items-center gap-2">
										<ArrowPathIcon className="w-4 h-4" />
										Retry Connection
									</span>
								</Button>
							</div>
						</div>
					</div>
				</Card>
			</motion.div>
		);
	}

	if (appraisedNFTs.length === 0) {
		const isFilteredView = filter !== "all";

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
								{isFilteredView ? "No Appraisals Match Filter" : "No Appraisals Yet"}
							</h3>
							<p className="text-foreground/70">
								{isFilteredView
									? `No appraisals found for "${filter}" filter. Try a different filter or check back later.`
									: "Submit your NFTs for appraisal to see them here"
								}
							</p>
							{isFilteredView && stats.total > 0 && (
								<Button
									className="mt-4 rounded-xl bg-content1/20 backdrop-blur-xl border border-white/20 text-foreground hover:bg-content1/30"
									onPress={() => setFilter("all")}
								>
									View All Appraisals
								</Button>
							)}
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

		{/* Filter Tabs */}
		<div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-8">
			{/* Status Filter Tabs */}
			<div className="flex flex-wrap gap-2 items-center">
				<span className="text-sm font-medium text-foreground/70 mr-2 flex items-center gap-1">
					<FunnelIcon className="w-4 h-4" />
					Filter:
				</span>
				{[
					{ key: "all", label: "All", icon: DocumentTextIcon },
					{ key: "pending", label: "Pending", icon: ClockIcon },
					{ key: "completed", label: "Completed", icon: CheckBadgeIcon },
					{ key: "recent", label: "Recent (24h)", icon: SparklesIcon },
					{ key: "highValue", label: "High Value", icon: SparklesIcon },
				].map(({ key, label, icon: Icon }) => (
					<Button
						key={key}
						size="sm"
						className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
							filter === key
								? "bg-gradient-to-r from-warning to-orange-400 text-black shadow-lg"
								: "bg-content1/20 backdrop-blur-xl border border-white/10 text-foreground/70 hover:text-foreground hover:bg-content1/30"
						}`}
						onPress={() => setFilter(key as AppraisalFilter)}
					>
						<span className="flex items-center gap-2">
							<Icon className="w-4 h-4" />
							{label}
							{key === "all" && (
								<span className="ml-1 px-2 py-0.5 bg-black/10 rounded-full text-xs">
									{stats.total}
								</span>
							)}
							{key === "pending" && (
								<span className="ml-1 px-2 py-0.5 bg-black/10 rounded-full text-xs">
									{stats.pending}
								</span>
							)}
							{key === "completed" && (
								<span className="ml-1 px-2 py-0.5 bg-black/10 rounded-full text-xs">
									{stats.completed}
								</span>
							)}
							{key === "recent" && (
								<span className="ml-1 px-2 py-0.5 bg-black/10 rounded-full text-xs">
									{stats.recent}
								</span>
							)}
							{key === "highValue" && (
								<span className="ml-1 px-2 py-0.5 bg-black/10 rounded-full text-xs">
									{stats.highValue}
								</span>
							)}
						</span>
					</Button>
				))}
			</div>

			{/* Sort Controls */}
			<div className="flex items-center gap-2">
				<span className="text-sm font-medium text-foreground/70 flex items-center gap-1">
					<ArrowsUpDownIcon className="w-4 h-4" />
					Sort:
				</span>
				<select
					value={sort}
					onChange={(e) => setSort(e.target.value as AppraisalSort)}
					className="bg-content1/20 backdrop-blur-xl border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-warning/50"
				>
					<option value="newest">Newest First</option>
					<option value="oldest">Oldest First</option>
					<option value="highestValue">Highest Value</option>
					<option value="lowestValue">Lowest Value</option>
					<option value="recentlyUpdated">Recently Updated</option>
				</select>
			</div>
		</div>

				{/* Filter Results Summary */}
		<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
			<Card className="p-4 bg-content1/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl">
				<div className="text-center">
					<p className="text-sm text-foreground/60 uppercase tracking-wide mb-2">
						Showing
					</p>
					<p className="text-2xl font-bold text-foreground">
						{appraisedNFTs.length}
					</p>
					<p className="text-xs text-foreground/60">
						of {stats.total} total
					</p>
				</div>
			</Card>

			<Card className="p-4 bg-content1/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl">
				<div className="text-center">
					<p className="text-sm text-foreground/60 uppercase tracking-wide mb-2">
						Total Value
					</p>
					<p className="text-2xl font-bold text-warning">
						{stats.totalValue > BigInt(0) ? formatCurrency(stats.totalValue.toString(), 18, "USD") : "--"}
					</p>
				</div>
			</Card>

			<Card className="p-4 bg-content1/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl">
				<div className="text-center">
					<p className="text-sm text-foreground/60 uppercase tracking-wide mb-2">
						Average Value
					</p>
					<p className="text-2xl font-bold text-info">
						{stats.averageValue > BigInt(0) ? formatCurrency(stats.averageValue.toString(), 18, "USD") : "--"}
					</p>
				</div>
			</Card>

			<Card className="p-4 bg-content1/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl">
				<div className="text-center">
					<p className="text-sm text-foreground/60 uppercase tracking-wide mb-2">
						Ready for Gacha
					</p>
					<p className="text-2xl font-bold text-success">
						{stats.readyForGacha}
					</p>
				</div>
			</Card>
		</div>

		{/* Filtered Appraisals Grid */}
		{appraisedNFTs.length > 0 && (
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<h3 className="text-xl font-medium text-foreground">
						{filter === "all" && "All Appraisals"}
						{filter === "pending" && "Pending Appraisals"}
						{filter === "completed" && "Completed Appraisals"}
						{filter === "recent" && "Recent Appraisals (24h)"}
						{filter === "highValue" && "High Value Appraisals"}
					</h3>
					<p className="text-sm text-foreground/60">
						{appraisedNFTs.length} {appraisedNFTs.length === 1 ? "item" : "items"}
					</p>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					<AnimatePresence>
						{appraisedNFTs.map((nft) => (
							<NFTAppraisalCard
								key={`${nft.collection}:${nft.tokenId}`}
								nft={nft}
								onDepositAction={handleDepositAction}
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
						onPress={refetch}
						isLoading={loading}
					>
						Refresh Status
					</Button>
				</div>
			</div>

			{/* Deposit Modal */}
			<AnimatePresence>
				{depositModalNFT && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
						onClick={handleCloseDepositModal}
					>
						<motion.div
							initial={{ opacity: 0, scale: 0.95, y: 20 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.95, y: 20 }}
							transition={{ duration: 0.3 }}
							className="w-full max-w-md"
							onClick={(e) => e.stopPropagation()}
						>
							<div className="bg-content1/20 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-6">
								<div className="flex items-center justify-between mb-6">
									<h3 className="text-xl font-bold text-foreground">
										Deposit NFT to Gacha
									</h3>
									<Button
										className="rounded-full bg-content1/20 backdrop-blur-xl border border-white/20 text-foreground hover:bg-content1/30 w-8 h-8 p-0"
										onPress={handleCloseDepositModal}
									>
										×
									</Button>
								</div>

								<DepositableNFTCard
									collection={depositModalNFT.collection}
									tokenId={depositModalNFT.tokenId}
									onAction={() => {
										// Handle any action needed (like appraisal if somehow not completed)
										handleCloseDepositModal();
									}}
									onAppraisalStatusChange={() => {
										// Handle appraisal status changes if needed
									}}
									appraisalContractAddress={
										(contracts.appraisal as `0x${string}`) ||
										"0x0000000000000000000000000000000000000000"
									}
								/>
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.div>
	);
}
