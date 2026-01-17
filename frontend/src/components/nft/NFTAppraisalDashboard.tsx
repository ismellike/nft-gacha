"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount } from "wagmi";
import { useClientSearchParam } from "../../hooks/useClientSearchParams";
import {
	MagnifyingGlassIcon,
	CheckBadgeIcon,
	InformationCircleIcon,
	ClockIcon,
	DocumentTextIcon,
	TrophyIcon,
	SparklesIcon,
} from "@heroicons/react/24/outline";
import { ConnectButton } from "@rainbow-me/rainbowkit";

import { Card, Button } from "../../ui";
import { NFTAppraisalForm } from "./NFTAppraisalForm";
import { AppraisedNFTsList } from "./AppraisedNFTsList";
import { useAppraisalData } from "../../hooks/useAppraisalData";
import { useNFTAppraisalStore } from "../../stores/nftAppraisalStore";
import { formatCurrency } from "../../lib/utils";

interface NFTAppraisalDashboardProps {
	className?: string;
	variant?: "full" | "compact";
}

type ViewMode = "form" | "list" | "overview";

export function NFTAppraisalDashboard({
	className,
	variant = "full",
}: NFTAppraisalDashboardProps) {
	const { address: userAddress, isConnected } = useAccount();

	// State management
	const [viewMode, setViewMode] = useState<ViewMode>("form");
	const [showSuccess, setShowSuccess] = useState(false);
	const [hasMounted, setHasMounted] = useState(false);

	useEffect(() => {
		setHasMounted(true);
	}, []);

	// Enhanced hook with memoized dataset and statistics
	const { stats, appraisalFee } = useAppraisalData(userAddress, {
		autoRefresh: true,
		refreshInterval: 60000,
		filter: "all",
		sort: "newest",
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
		? formatCurrency(appraisalFee.toString(), 6, "USDC")
		: "--";

	// Avoid hydration mismatches when wallet state differs between server and client
	if (!hasMounted) {
		return (
			<div className={className}>
				<Card className="p-6 rounded-2xl border border-white/10 bg-content1/30">
					<div className="space-y-3 text-sm text-foreground/60">
						<div className="h-4 w-32 rounded bg-white/10" />
						<div className="h-3 w-full rounded bg-white/5" />
						<div className="h-3 w-2/3 rounded bg-white/5" />
					</div>
				</Card>
			</div>
		);
	}

	if (!isConnected) {
		return (
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8 }}
				className={className}
			>
				<Card className="max-w-xl mx-auto p-8 bg-content1/20 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
					<div className="space-y-6 text-center">
						<div className="w-16 h-16 bg-gradient-to-br from-warning/20 to-orange-400/20 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center mx-auto">
							<MagnifyingGlassIcon className="w-8 h-8 text-warning" />
						</div>
						<h2 className="text-2xl font-semibold text-foreground">
							Connect to start an appraisal
						</h2>
						<p className="text-foreground/70">
							Enter a contract and token ID, preview the NFT, pay the appraisal
							fee, and see the valuation show up in seconds.
						</p>
						<div className="flex justify-center">
							<ConnectButton />
						</div>
					</div>
				</Card>
			</motion.div>
		);
	}

	// Compact layout: show form + list without extra navigation or banners
	if (variant === "compact") {
		return (
			<div className={className}>
				<div className="flex flex-col gap-6">
					<NFTAppraisalForm onSubmissionSuccess={handleAppraisalSuccess} />
					<div className="rounded-2xl border border-white/10 bg-content1/20 p-4">
						<div className="flex items-center justify-between mb-3">
							<h3 className="text-lg font-semibold text-foreground">
								Your appraisals
							</h3>
							<span className="text-xs uppercase tracking-wide text-foreground/50">
								{totalSubmitted} total
							</span>
						</div>
						<AppraisedNFTsList />
					</div>
				</div>
			</div>
		);
	}

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.8 }}
			className={className}
		>
			{/* Header */}
			<motion.div
				initial={{ opacity: 0, y: 30 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8 }}
				className="mb-10"
			>
				<div className="flex flex-col gap-4">
					<div>
						<h1 className="text-4xl md:text-5xl font-semibold text-foreground">
							NFT Appraisal
						</h1>
						<p className="text-foreground/70 max-w-2xl mt-3 text-lg">
							Submit your contract + token ID to get a clean, defensible value.
							Stay on top of pending and completed appraisals without extra
							noise.
						</p>
					</div>
					<div className="flex flex-wrap gap-3">
						<Button color="glassPrimary" onPress={() => setViewMode("form")}>
							Start an appraisal
						</Button>
						<Button color="glass" onPress={() => setViewMode("list")}>
							View my appraisals
						</Button>
					</div>
				</div>
			</motion.div>

			{/* Navigation Pills */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8, delay: 0.2 }}
				className="flex justify-center mb-8"
			>
				<div className="inline-flex bg-content1/20 border border-white/10 rounded-full p-1">
					{(["overview", "form", "list"] as ViewMode[]).map((mode) => {
						const active = viewMode === mode;
						const label =
							mode === "overview"
								? "Overview"
								: mode === "form"
									? "Appraise"
									: `My Appraisals (${totalSubmitted})`;
						return (
							<button
								key={mode}
								type="button"
								onClick={() => setViewMode(mode)}
								className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
									active
										? "bg-warning text-black shadow-lg"
										: "text-foreground/70 hover:text-foreground"
								}`}
							>
								{label}
							</button>
						);
					})}
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
						{/* Core Stats */}
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
							<motion.div
								initial={{ opacity: 0, scale: 0.9 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ duration: 0.5, delay: 0.1 }}
							>
								<Card className="p-5 border border-white/10 rounded-xl bg-content1/30">
									<div className="flex items-center justify-between">
										<p className="text-sm text-foreground/60">
											Total appraisals
										</p>
										<DocumentTextIcon className="w-5 h-5 text-info" />
									</div>
									<h3 className="text-3xl font-semibold mt-2">
										{totalSubmitted}
									</h3>
									<p className="text-xs text-foreground/60 mt-1">
										{stats.completed} completed • {stats.pending} pending
									</p>
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
											{totalValue > BigInt(0)
												? formatCurrency(totalValue.toString(), 18, "USD")
												: "--"}
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
											{averageValue > BigInt(0)
												? formatCurrency(averageValue.toString(), 18, "USD")
												: "--"}
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
								<div className="space-y-4">
									<h3 className="text-xl font-semibold text-foreground">
										How it works
									</h3>
									<ol className="space-y-3 text-sm text-foreground/80 list-decimal list-inside">
										<li>
											Submit contract + token ID and pay the fee (
											{formattedAppraisalFee}).
										</li>
										<li>
											We decode metadata and pull market comps and rarity data.
										</li>
										<li>
											Get your valuation; re-appraise anytime if the market
											moves.
										</li>
									</ol>
								</div>
							</Card>
						</motion.div>

						{/* Quick Actions */}
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<Button color="glassPrimary" onPress={() => setViewMode("form")}>
								Submit Your First NFT
							</Button>
							{totalSubmitted > 0 && (
								<Button color="glass" onPress={() => setViewMode("list")}>
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
