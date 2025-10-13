"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount } from "wagmi";
import { useClientSearchParam } from "../hooks/useClientSearchParams";
import {
	MagnifyingGlassIcon,
	CheckBadgeIcon,
	InformationCircleIcon,
	SparklesIcon,
	ClockIcon,
	DocumentTextIcon,
	TrophyIcon,
} from "@heroicons/react/24/outline";

import { Card, Button } from "../ui";
import { NFTAppraisalForm } from "./NFTAppraisalForm";
import { AppraisedNFTsList } from "./AppraisedNFTsList";
import { useAppraisalData } from "../hooks/useAppraisalData";
import { useNFTAppraisalStore } from "../stores/nftAppraisalStore";
import { formatCurrency } from "../lib/utils";

interface NFTAppraisalDashboardProps {
	className?: string;
}

type ViewMode = "form" | "list" | "overview";

export function NFTAppraisalDashboard({
	className,
}: NFTAppraisalDashboardProps) {
	const { address: userAddress, isConnected } = useAccount();

	// State management
	const [viewMode, setViewMode] = useState<ViewMode>("overview");
	const [showSuccess, setShowSuccess] = useState(false);

	// Enhanced hook with memoized dataset and statistics
	const { stats, appraisalFee } = useAppraisalData(userAddress, {
		autoRefresh: true,
		refreshInterval: 60000,
		filter: "all",
		sort: "newest"
	});
	const { addOptimisticSubmission } = useNFTAppraisalStore();

	// Get URL params for pre-filled forms
	const collectionParam = useClientSearchParam("collection");
	const tokenIdParam = useClientSearchParam("tokenId");

	// Auto-switch to form mode if URL params are present (only on initial load)
	useEffect(() => {
		if (collectionParam || tokenIdParam) {
			setViewMode("form");
		}
	}, [collectionParam, tokenIdParam]); // Only depend on URL params, not viewMode

	// Handle successful appraisal submission with optimistic update
	const handleAppraisalSuccess = (collection: string, tokenId: string) => {
		if (!userAddress) return;

		// Add optimistic submission to store
		addOptimisticSubmission(userAddress, collection, tokenId);

		// Show success message and switch to list view
		setShowSuccess(true);
		setTimeout(() => {
			setShowSuccess(false);
			setViewMode("list");
		}, 2000);
	};

	// Statistics from memoized dataset
	const totalSubmitted = stats.total;
	const recentSubmissions = stats.recent;
	const readyForGacha = stats.readyForGacha;
	const totalValue = stats.totalValue;
	const averageValue = stats.averageValue;

	// Format appraisal fee for display
	const formattedAppraisalFee = appraisalFee
		? formatCurrency(appraisalFee.toString(), 18, "ETH")
		: "--";

	if (!isConnected) {
		return (
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8 }}
				className={className}
			>
				<Card className="max-w-md mx-auto p-8 bg-content1/20 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
					<div className="text-center space-y-6">
						<div className="w-20 h-20 bg-gradient-to-br from-warning/20 to-orange-400/20 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center mx-auto">
							<MagnifyingGlassIcon className="w-10 h-10 text-warning" />
						</div>
						<h2 className="text-3xl font-bold text-foreground mb-4">
							Unlock Your NFT's Potential
						</h2>
						<p className="text-foreground/70 mb-8">
							Connect your wallet to discover the true value of your digital
							assets through our professional appraisal service
						</p>
						<div className="flex items-center justify-center space-x-2 text-foreground/60">
							<SparklesIcon className="w-5 h-5" />
							<span className="text-sm">
								Professional valuations powered by AI
							</span>
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
			transition={{ duration: 0.8 }}
			className={className}
		>
			{/* Hero Section */}
			<motion.div
				initial={{ opacity: 0, y: 30 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8 }}
				className="text-center mb-12"
			>
				<h1 className="text-5xl md:text-6xl font-bold mb-6">
					<span className="bg-gradient-to-r from-warning to-orange-400 bg-clip-text text-transparent">
						NFT Appraisal
					</span>
				</h1>
				<p className="text-xl md:text-2xl text-foreground/70 max-w-4xl mx-auto leading-relaxed">
					Our AVS decodes NFT metadata and queries multiple data sources to
					provide accurate, real-time valuations
				</p>
			</motion.div>

			{/* Navigation Pills */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8, delay: 0.2 }}
				className="flex justify-center mb-8"
			>
				<div className="inline-flex bg-content1/20 backdrop-blur-xl border border-white/10 rounded-full p-1">
					<button
						onClick={() => setViewMode("overview")}
						className={`px-6 py-3 rounded-full transition-all duration-300 font-medium ${
							viewMode === "overview"
								? "bg-gradient-to-r from-warning to-orange-400 text-black shadow-lg"
								: "text-foreground/70 hover:text-foreground hover:bg-content1/30"
						}`}
					>
						Overview
					</button>
					<button
						onClick={() => setViewMode("form")}
						className={`px-6 py-3 rounded-full transition-all duration-300 font-medium ${
							viewMode === "form"
								? "bg-gradient-to-r from-warning to-orange-400 text-black shadow-lg"
								: "text-foreground/70 hover:text-foreground hover:bg-content1/30"
						}`}
					>
						Appraise NFT
					</button>
					<button
						onClick={() => setViewMode("list")}
						className={`px-6 py-3 rounded-full transition-all duration-300 font-medium ${
							viewMode === "list"
								? "bg-gradient-to-r from-warning to-orange-400 text-black shadow-lg"
								: "text-foreground/70 hover:text-foreground hover:bg-content1/30"
						}`}
					>
						My Appraisals ({totalSubmitted})
					</button>
				</div>
			</motion.div>

			{/* Content */}
			<AnimatePresence mode="wait">
				{viewMode === "overview" && (
					<motion.div
						key="overview"
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -30 }}
						transition={{ duration: 0.5 }}
						className="space-y-12"
					>
						{/* Enhanced Stats Cards */}
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
							<motion.div
								initial={{ opacity: 0, scale: 0.9 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ duration: 0.5, delay: 0.1 }}
							>
								<Card className="p-6 bg-content1/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl hover:bg-content1/30 transition-all duration-300">
									<div className="flex flex-col space-y-4">
										<div className="flex items-center justify-between">
											<p className="text-sm text-foreground/60 uppercase tracking-wide font-medium">
												Total Appraisals
											</p>
											<div className="w-12 h-12 bg-gradient-to-br from-info/20 to-info/20 backdrop-blur-xl border border-white/20 rounded-xl flex items-center justify-center">
												<DocumentTextIcon className="w-6 h-6 text-info" />
											</div>
										</div>
										<h3 className="text-3xl font-bold text-foreground">
											{totalSubmitted}
										</h3>
										<p className="text-xs text-foreground/60">
											{stats.completed} completed • {stats.pending} pending
										</p>
									</div>
								</Card>
							</motion.div>

							<motion.div
								initial={{ opacity: 0, scale: 0.9 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ duration: 0.5, delay: 0.2 }}
							>
								<Card className="p-6 bg-content1/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl hover:bg-content1/30 transition-all duration-300">
									<div className="flex flex-col space-y-4">
										<div className="flex items-center justify-between">
											<p className="text-sm text-foreground/60 uppercase tracking-wide font-medium">
												Total Value
											</p>
											<div className="w-12 h-12 bg-gradient-to-br from-warning/20 to-orange-400/20 backdrop-blur-xl border border-white/20 rounded-xl flex items-center justify-center">
												<TrophyIcon className="w-6 h-6 text-warning" />
											</div>
										</div>
										<h3 className="text-3xl font-bold text-warning">
											{totalValue > BigInt(0) ? formatCurrency(totalValue.toString(), 18, "USD") : "--"}
										</h3>
										<p className="text-xs text-foreground/60">
											Across all completed appraisals
										</p>
									</div>
								</Card>
							</motion.div>

							<motion.div
								initial={{ opacity: 0, scale: 0.9 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ duration: 0.5, delay: 0.3 }}
							>
								<Card className="p-6 bg-content1/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl hover:bg-content1/30 transition-all duration-300">
									<div className="flex flex-col space-y-4">
										<div className="flex items-center justify-between">
											<p className="text-sm text-foreground/60 uppercase tracking-wide font-medium">
												Average Value
											</p>
											<div className="w-12 h-12 bg-gradient-to-br from-success/20 to-green-400/20 backdrop-blur-xl border border-white/20 rounded-xl flex items-center justify-center">
												<SparklesIcon className="w-6 h-6 text-success" />
											</div>
										</div>
										<h3 className="text-3xl font-bold text-success">
											{averageValue > BigInt(0) ? formatCurrency(averageValue.toString(), 18, "USD") : "--"}
										</h3>
										<p className="text-xs text-foreground/60">
											Per completed appraisal
										</p>
									</div>
								</Card>
							</motion.div>

							<motion.div
								initial={{ opacity: 0, scale: 0.9 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ duration: 0.5, delay: 0.4 }}
							>
								<Card className="p-6 bg-content1/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl hover:bg-content1/30 transition-all duration-300">
									<div className="flex flex-col space-y-4">
										<div className="flex items-center justify-between">
											<p className="text-sm text-foreground/60 uppercase tracking-wide font-medium">
												Ready for Gacha
											</p>
											<div className="w-12 h-12 bg-gradient-to-br from-info/20 to-info/20 backdrop-blur-xl border border-white/20 rounded-xl flex items-center justify-center">
												<ClockIcon className="w-6 h-6 text-info" />
											</div>
										</div>
										<h3 className="text-3xl font-bold text-info">
											{readyForGacha}
										</h3>
										<p className="text-xs text-foreground/60">
											{recentSubmissions} recent (24h)
										</p>
									</div>
								</Card>
							</motion.div>
						</div>

						{/* How It Works */}
						<motion.div
							initial={{ opacity: 0, y: 30 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.4 }}
						>
							<Card className="p-6 bg-content1/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
								<div className="space-y-6">
									<h3 className="text-2xl font-light text-foreground text-center">
										How NFT Appraisal Works
									</h3>

									<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
										<div className="text-center space-y-3">
											<div className="w-12 h-12 bg-gradient-to-br from-info/20 to-info/20 backdrop-blur-xl border border-white/20 rounded-xl flex items-center justify-center mx-auto">
												<span className="text-lg font-bold text-info">1</span>
											</div>
											<h4 className="text-lg font-medium text-foreground">
												Submit NFT
											</h4>
											<p className="text-sm text-foreground/70">
												Provide your NFT's contract address and token ID along
												with the appraisal fee ({formattedAppraisalFee})
											</p>
										</div>

										<div className="text-center space-y-3">
											<div className="w-12 h-12 bg-gradient-to-br from-warning/20 to-orange-400/20 backdrop-blur-xl border border-white/20 rounded-xl flex items-center justify-center mx-auto">
												<span className="text-lg font-bold text-warning">
													2
												</span>
											</div>
											<h4 className="text-lg font-medium text-foreground">
												Data Analysis
											</h4>
											<p className="text-sm text-foreground/70">
												Our AVS decodes your NFT metadata and queries multiple
												APIs for market data and comparable sales
											</p>
										</div>

										<div className="text-center space-y-3">
											<div className="w-12 h-12 bg-gradient-to-br from-success/20 to-green-400/20 backdrop-blur-xl border border-white/20 rounded-xl flex items-center justify-center mx-auto">
												<span className="text-lg font-bold text-success">
													3
												</span>
											</div>
											<h4 className="text-lg font-medium text-foreground">
												Valuation Complete
											</h4>
											<p className="text-sm text-foreground/70">
												Receive your appraisal and request re-appraisals anytime
												for updated market data (fees apply)
											</p>
										</div>
									</div>
								</div>
							</Card>
						</motion.div>

						{/* Quick Actions */}
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<Button
								className="rounded-xl bg-gradient-to-r from-warning to-orange-400 text-black"
								onPress={() => setViewMode("form")}
							>
								Submit Your First NFT
							</Button>
							{totalSubmitted > 0 && (
								<Button
									className="rounded-xl bg-content1/20 backdrop-blur-xl border border-white/20 text-foreground hover:bg-content1/30"
									onPress={() => setViewMode("list")}
								>
									View My Appraisals
								</Button>
							)}
						</div>
					</motion.div>
				)}

				{viewMode === "form" && (
					<motion.div
						key="form"
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -30 }}
						transition={{ duration: 0.5 }}
					>
						<div className="max-w-4xl mx-auto">
							<NFTAppraisalForm onSubmissionSuccess={handleAppraisalSuccess} />
						</div>
					</motion.div>
				)}

				{viewMode === "list" && (
					<motion.div
						key="list"
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -30 }}
						transition={{ duration: 0.5 }}
					>
						<AppraisedNFTsList />
					</motion.div>
				)}
			</AnimatePresence>

			{/* Success Toast */}
			<AnimatePresence>
				{showSuccess && (
					<motion.div
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.95 }}
						className="fixed bottom-8 right-8 z-50 max-w-sm"
					>
						<Card className="p-4 bg-success/10 border border-success/20 rounded-xl shadow-lg">
							<div className="flex items-center gap-3">
								<CheckBadgeIcon className="w-6 h-6 text-success flex-shrink-0" />
								<div>
									<h4 className="font-semibold text-success text-sm">
										Success!
									</h4>
									<p className="text-success/80 text-sm">
										Your NFT has been submitted for appraisal
									</p>
								</div>
							</div>
						</Card>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Info Banner */}
			<motion.div
				initial={{ opacity: 0, y: 30 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8, delay: 1.0 }}
				className="mt-12"
			>
				<Card className="bg-gradient-to-r from-info/10 to-secondary/10 border border-info/20 rounded-2xl shadow-xl">
					<div className="flex items-start gap-3 p-4">
						<InformationCircleIcon className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
						<div className="text-sm text-foreground/70">
							<p className="font-medium text-info mb-1">
								Important Information
							</p>
							<p>
								Our AVS decodes NFT metadata and queries multiple external APIs
								for market data, comparable sales, and rarity analysis.
								Appraisals typically complete within seconds. You can request
								re-appraisals at any time for updated market data (fees apply).
							</p>
						</div>
					</div>
				</Card>
			</motion.div>
		</motion.div>
	);
}
