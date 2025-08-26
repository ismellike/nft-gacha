"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount } from "wagmi";
import { useClientSearchParam } from "../hooks/useClientSearchParams";
import {
	MagnifyingGlassIcon,
	CheckBadgeIcon,
	InformationCircleIcon,
} from "@heroicons/react/24/outline";

import { GlassCard, GlassButton } from "./ui";
import { NFTAppraisalForm } from "./NFTAppraisalForm";
import { AppraisedNFTsList } from "./AppraisedNFTsList";

interface SubmittedNFT {
	collection: string;
	tokenId: string;
	timestamp: number;
}

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
	const [submittedNFTs, setSubmittedNFTs] = useState<SubmittedNFT[]>([]);
	const [showSuccess, setShowSuccess] = useState(false);
	
	// Get URL params for pre-filled forms
	const collectionParam = useClientSearchParam("collection");
	const tokenIdParam = useClientSearchParam("tokenId");

	// Auto-switch to form mode if URL params are present
	useEffect(() => {
		if ((collectionParam || tokenIdParam) && viewMode === "overview") {
			setViewMode("form");
		}
	}, [collectionParam, tokenIdParam, viewMode]);

	// Load submitted NFTs from localStorage
	useEffect(() => {
		if (!userAddress) return;

		const storageKey = `nft-appraisals-${userAddress.toLowerCase()}`;
		const stored = localStorage.getItem(storageKey);

		if (stored) {
			try {
				const parsed = JSON.parse(stored);
				setSubmittedNFTs(Array.isArray(parsed) ? parsed : []);
			} catch (error) {
				console.warn("Failed to parse stored NFT appraisals:", error);
				setSubmittedNFTs([]);
			}
		}
	}, [userAddress]);

	// Save submitted NFTs to localStorage
	const saveSubmittedNFTs = (nfts: SubmittedNFT[]) => {
		if (!userAddress) return;

		const storageKey = `nft-appraisals-${userAddress.toLowerCase()}`;
		localStorage.setItem(storageKey, JSON.stringify(nfts));
		setSubmittedNFTs(nfts);
	};

	// Handle successful appraisal submission
	const handleAppraisalSuccess = (collection: string, tokenId: string) => {
		const newNFT: SubmittedNFT = {
			collection,
			tokenId,
			timestamp: Date.now(),
		};

		const updatedNFTs = [...submittedNFTs, newNFT];
		saveSubmittedNFTs(updatedNFTs);

		// Show success message and switch to list view
		setShowSuccess(true);
		setTimeout(() => {
			setShowSuccess(false);
			setViewMode("list");
		}, 2000);

		// Success feedback handled by visual state change
	};

	// Statistics
	const totalSubmitted = submittedNFTs.length;
	const recentSubmissions = submittedNFTs.filter(
		(nft) => Date.now() - nft.timestamp < 24 * 60 * 60 * 1000,
	).length;

	if (!isConnected) {
		return (
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className={className}
			>
				<GlassCard variant="base" padding="lg">
					<div className="text-center space-y-4">
						<div className="w-16 h-16 bg-gradient-to-br from-warning/20 to-orange-400/20 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center mx-auto">
							<MagnifyingGlassIcon className="w-8 h-8 text-warning" />
						</div>
						<div>
							<h3 className="text-2xl font-medium text-foreground mb-2">
								Connect Your Wallet
							</h3>
							<p className="text-foreground/70">
								Connect your wallet to access NFT appraisal services
							</p>
						</div>
					</div>
				</GlassCard>
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
				<div className="text-center space-y-4">
					<h1 className="text-4xl font-light tracking-tight">
						<span className="bg-gradient-to-r from-warning to-orange-400 bg-clip-text text-transparent">
							NFT Appraisal Service
						</span>
					</h1>
					<p className="text-xl text-foreground/70 max-w-3xl mx-auto leading-relaxed font-light">
						Get professional valuations for your NFTs to prepare them for gacha
						deposits
					</p>
				</div>

				{/* Navigation */}
				<div className="flex flex-col sm:flex-row gap-3 justify-center">
					<GlassButton
						variant={viewMode === "overview" ? "primary" : "secondary"}
						startIcon="trending"
						onClick={() => setViewMode("overview")}
					>
						Overview
					</GlassButton>
					<GlassButton
						variant={viewMode === "form" ? "primary" : "secondary"}
						startIcon="gem"
						onClick={() => setViewMode("form")}
					>
						Submit NFT
					</GlassButton>
					<GlassButton
						variant={viewMode === "list" ? "primary" : "secondary"}
						startIcon="gift"
						onClick={() => setViewMode("list")}
					>
						My Appraisals ({totalSubmitted})
					</GlassButton>
				</div>

				{/* Content */}
				<AnimatePresence mode="wait">
					{viewMode === "overview" && (
						<motion.div
							key="overview"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -20 }}
							transition={{ duration: 0.4 }}
						>
							<div className="grid gap-8">
								{/* Statistics Cards */}
								<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
									<GlassCard variant="floating" animate={true} padding="lg">
										<div className="flex items-center justify-between">
											<div>
												<p className="text-sm text-foreground/60 uppercase tracking-wide font-medium">
													Total Submitted
												</p>
												<h3 className="text-3xl font-bold text-foreground mt-2">
													{totalSubmitted}
												</h3>
											</div>
											<div className="w-16 h-16 bg-gradient-to-br from-info/20 to-info/20 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center">
												<MagnifyingGlassIcon className="w-8 h-8 text-info" />
											</div>
										</div>
									</GlassCard>

									<GlassCard variant="floating" animate={true} padding="lg">
										<div className="flex items-center justify-between">
											<div>
												<p className="text-sm text-foreground/60 uppercase tracking-wide font-medium">
													Recent (24h)
												</p>
												<h3 className="text-3xl font-bold text-warning mt-2">
													{recentSubmissions}
												</h3>
											</div>
											<div className="w-16 h-16 bg-gradient-to-br from-warning/20 to-orange-400/20 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center">
												<CheckBadgeIcon className="w-8 h-8 text-warning" />
											</div>
										</div>
									</GlassCard>

									<GlassCard variant="floating" animate={true} padding="lg">
										<div className="flex items-center justify-between">
											<div>
												<p className="text-sm text-foreground/60 uppercase tracking-wide font-medium">
													Appraised NFTs
												</p>
												<h3 className="text-3xl font-bold text-success mt-2">
													{/* Count of completed appraisals */}
													{submittedNFTs.length}
												</h3>
											</div>
											<div className="w-16 h-16 bg-gradient-to-br from-success/20 to-green-400/20 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center">
												<CheckBadgeIcon className="w-8 h-8 text-success" />
											</div>
										</div>
									</GlassCard>
								</div>

								{/* How it Works */}
								<GlassCard variant="base" padding="lg">
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
													with the appraisal fee
												</p>
											</div>

											<div className="text-center space-y-3">
												<div className="w-12 h-12 bg-gradient-to-br from-warning/20 to-orange-400/20 backdrop-blur-xl border border-white/20 rounded-xl flex items-center justify-center mx-auto">
													<span className="text-lg font-bold text-warning">
														2
													</span>
												</div>
												<h4 className="text-lg font-medium text-foreground">
													Professional Valuation
												</h4>
												<p className="text-sm text-foreground/70">
													External appraisal service evaluates your NFT using
													market data and rarity analysis
												</p>
											</div>

											<div className="text-center space-y-3">
												<div className="w-12 h-12 bg-gradient-to-br from-success/20 to-green-400/20 backdrop-blur-xl border border-white/20 rounded-xl flex items-center justify-center mx-auto">
													<span className="text-lg font-bold text-success">
														3
													</span>
												</div>
												<h4 className="text-lg font-medium text-foreground">
													Ready for Gacha
												</h4>
												<p className="text-sm text-foreground/70">
													Once appraised, your NFT will be available for gacha
													deposits on the gacha pages
												</p>
											</div>
										</div>
									</div>
								</GlassCard>

								{/* Quick Actions */}
								<div className="flex flex-col sm:flex-row gap-4 justify-center">
									<GlassButton
										variant="primary"
										size="lg"
										startIcon="gem"
										onClick={() => setViewMode("form")}
									>
										Submit Your First NFT
									</GlassButton>
									{totalSubmitted > 0 && (
										<GlassButton
											variant="secondary"
											size="lg"
											startIcon="gift"
											onClick={() => setViewMode("list")}
										>
											View My Appraisals
										</GlassButton>
									)}
								</div>
							</div>
						</motion.div>
					)}

					{viewMode === "form" && (
						<motion.div
							key="form"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -20 }}
							transition={{ duration: 0.4 }}
						>
							<div className="max-w-2xl mx-auto">
								<NFTAppraisalForm
									onSubmissionSuccess={handleAppraisalSuccess}
								/>
							</div>
						</motion.div>
					)}

					{viewMode === "list" && (
						<motion.div
							key="list"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -20 }}
							transition={{ duration: 0.4 }}
						>
							<AppraisedNFTsList userSubmittedNFTs={submittedNFTs} />
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
							<GlassCard variant="success" className="p-4 border-success/20">
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
							</GlassCard>
						</motion.div>
					)}
				</AnimatePresence>

				{/* Info Banner */}
				<GlassCard
					variant="base"
					className="bg-gradient-to-r from-info/10 to-secondary/10 border-info/20"
				>
					<div className="flex items-start gap-3 p-4">
						<InformationCircleIcon className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
						<div className="text-sm text-foreground/70">
							<p className="font-medium text-info mb-1">
								Important Information
							</p>
							<p>
								NFT appraisals are provided by external services and may take
								several minutes to complete. Appraisal fees are non-refundable.
								Once appraised, visit the gacha pages to deposit your NFTs.
							</p>
						</div>
					</div>
				</GlassCard>
			</div>
		</motion.div>
	);
}
