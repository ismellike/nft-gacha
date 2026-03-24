"use client";

import {
	ArrowPathIcon,
	CheckBadgeIcon,
	GiftIcon,
	InformationCircleIcon,
	SparklesIcon,
} from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useAccount } from "wagmi";
import { AppraisalWorkflowGuide } from "../../components/nft/AppraisalWorkflowGuide";
import { NFTAppraisalForm } from "../../components/nft/NFTAppraisalForm";
import { PfpMintButton } from "../../components/nft/PfpMintButton";
import { TestnetMintButton } from "../../components/nft/TestnetMintButton";
import {
	type SelectedNFT,
	WalletNFTPicker,
} from "../../components/nft/WalletNFTPicker";
import { useAppraisalData } from "../../hooks/useAppraisalData";
import { ENV_MODE } from "../../lib/config";
import { formatCurrency } from "../../lib/utils";
import { Button, Card, Skeleton } from "../../ui";

type AppraisalStage = "select" | "appraise" | "complete";

export default function StreamlinedAppraisalPage() {
	const { address } = useAccount();
	const [stage, setStage] = useState<AppraisalStage>("select");
	const [selectedNFT, setSelectedNFT] = useState<SelectedNFT | null>(null);
	const [appraisedNFT, setAppraisedNFT] = useState<SelectedNFT | null>(null);

	const { appraisalFee, loading, error, refetch } = useAppraisalData(address, {
		autoRefresh: true,
		filter: "all",
		sort: "newest",
	});

	const handleNFTSelect = (nft: SelectedNFT) => {
		setSelectedNFT(nft);
		setStage("appraise");
	};

	const handleAppraisalSuccess = (collection: string, tokenId: string) => {
		setAppraisedNFT({ collection, tokenId });
		setStage("complete");

		// Reset after 5 seconds to allow another appraisal
		setTimeout(() => {
			setStage("select");
			setSelectedNFT(null);
			setAppraisedNFT(null);
		}, 5000);
	};

	const handleStartOver = () => {
		setStage("select");
		setSelectedNFT(null);
		setAppraisedNFT(null);
	};

	return (
		<div className="min-h-screen bg-transparent">
			<motion.section
				initial={{ opacity: 0, y: 24 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6 }}
				className="relative z-10 container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12"
			>
				<div className="space-y-8">
					{/* Hero Section */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="text-center space-y-4"
					>
						<div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-content1/20 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-warning">
							<SparklesIcon className="w-4 h-4" />
							NFT Appraisal
						</div>
						<h1 className="text-4xl sm:text-5xl font-semibold leading-tight text-foreground">
							Get Your NFT Valued in{" "}
							<span className="text-warning">~1 Minute</span>
						</h1>
						<p className="text-base sm:text-lg text-foreground/70 max-w-2xl mx-auto">
							Select an NFT from your wallet, pay a small fee, and get an
							on-chain appraisal ready for gacha deposits
						</p>

						{/* Quick stats */}
						<div className="flex flex-wrap justify-center gap-4 pt-4">
							{loading ? (
								<div className="flex items-center gap-2 rounded-full border border-white/10 bg-content1/30 px-4 py-2">
									<Skeleton variant="circle" size="w4 h4" />
									<Skeleton size="h4 w16" />
								</div>
							) : appraisalFee ? (
								<div className="flex items-center gap-2 rounded-full border border-white/10 bg-content1/30 px-4 py-2 text-sm text-foreground/70">
									<SparklesIcon className="w-4 h-4 text-warning" />
									<span>
										Fee: {formatCurrency(appraisalFee.toString(), 6, "USDC")}
									</span>
								</div>
							) : null}
						</div>
					</motion.div>

					{/* Workflow Guide */}
					<AppraisalWorkflowGuide />

					{/* Main Content Area */}
					<Card className="relative overflow-hidden rounded-3xl border border-white/10 bg-content1/30 p-4 sm:p-6 lg:p-8 shadow-2xl">
						{/* Background effects */}
						<div className="pointer-events-none absolute inset-0 opacity-40">
							<div className="absolute -left-10 top-10 h-32 w-32 rounded-full bg-warning/5 blur-3xl" />
							<div className="absolute bottom-0 right-0 h-40 w-40 rounded-full bg-orange-400/10 blur-3xl" />
						</div>

						<div className="relative">
							{/* Stage 1: Select NFT */}
							<AnimatePresence mode="wait">
								{stage === "select" && (
									<motion.div
										key="select"
										initial={{ opacity: 0, x: -20 }}
										animate={{ opacity: 1, x: 0 }}
										exit={{ opacity: 0, x: 20 }}
										transition={{ duration: 0.3 }}
										className="space-y-6"
									>
										<div className="text-center">
											<h2 className="text-2xl font-semibold text-foreground mb-2">
												Step 1: Select Your NFT
											</h2>
											<p className="text-foreground/70">
												Choose which NFT you want to get appraised
											</p>
										</div>

										{ENV_MODE !== "MAINNET" && (
											<TestnetMintButton />
										)}

										<PfpMintButton />

										<WalletNFTPicker
											onSelect={handleNFTSelect}
											selectedNFT={null}
										/>
									</motion.div>
								)}

								{/* Stage 2: Appraise */}
								{stage === "appraise" && selectedNFT && (
									<motion.div
										key="appraise"
										initial={{ opacity: 0, x: -20 }}
										animate={{ opacity: 1, x: 0 }}
										exit={{ opacity: 0, x: 20 }}
										transition={{ duration: 0.3 }}
										className="space-y-6"
									>
										<div className="flex items-center justify-between">
											<div>
												<h2 className="text-2xl font-semibold text-foreground mb-2">
													Step 2: Complete Appraisal
												</h2>
												<p className="text-foreground/70">
													Pay the fee and wait for the on-chain appraisal
												</p>
											</div>
											<Button color="glass" size="sm" onPress={handleStartOver}>
												Back
											</Button>
										</div>

										{/* Show selected NFT info */}
										<Card className="p-4 bg-success/10 border border-success/20">
											<p className="text-xs text-success font-medium mb-3 text-center">
												Selected NFT
											</p>
											<div className="flex items-center justify-center gap-4 text-foreground/70">
												<p className="font-mono text-sm">
													{selectedNFT.collection.slice(0, 10)}...
													{selectedNFT.collection.slice(-8)}
												</p>
												<p className="text-sm">#{selectedNFT.tokenId}</p>
											</div>
										</Card>

										{/* Pre-fill the form with selected NFT */}
										<NFTAppraisalForm
											onSubmissionSuccess={handleAppraisalSuccess}
										/>
									</motion.div>
								)}

								{/* Stage 3: Complete */}
								{stage === "complete" && appraisedNFT && (
									<motion.div
										key="complete"
										initial={{ opacity: 0, scale: 0.95 }}
										animate={{ opacity: 1, scale: 1 }}
										exit={{ opacity: 0, scale: 0.95 }}
										transition={{ duration: 0.3 }}
										className="space-y-6"
									>
										<div className="text-center space-y-4">
											<div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto">
												<CheckBadgeIcon className="w-10 h-10 text-white" />
											</div>

											<div>
												<h2 className="text-3xl font-bold text-success mb-2">
													Appraisal Complete!
												</h2>
												<p className="text-foreground/70">
													Your NFT has been valued and is now ready for gacha
													deposits
												</p>
											</div>

											{/* Success details */}
											<Card className="max-w-md mx-auto p-4 bg-content1/20 border border-white/10">
												<div className="space-y-3">
													<div className="flex items-center justify-between text-sm">
														<span className="text-foreground/60">
															Collection
														</span>
														<span className="font-mono">
															{appraisedNFT.collection.slice(0, 8)}...
															{appraisedNFT.collection.slice(-6)}
														</span>
													</div>
													<div className="flex items-center justify-between text-sm">
														<span className="text-foreground/60">Token ID</span>
														<span className="font-semibold">
															#{appraisedNFT.tokenId}
														</span>
													</div>
													<div className="border-t border-white/10 pt-3 mt-3">
														<div className="flex items-center gap-2 text-success text-sm font-medium">
															<GiftIcon className="w-4 h-4" />
															<span>Ready for gacha deposits</span>
														</div>
													</div>
												</div>
											</Card>

											<div className="flex gap-3 justify-center">
												<Button
													color="glassPrimary"
													className="min-w-[160px]"
													onPress={handleStartOver}
												>
													Appraise Another NFT
												</Button>
											</div>

											<p className="text-xs text-foreground/50">
												Redirecting back to selection in 5 seconds...
											</p>
										</div>
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					</Card>

					{/* Info Banner */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.4 }}
					>
						<Card className="bg-gradient-to-r from-info/10 to-secondary/10 border border-info/20 rounded-2xl">
							<div className="flex items-start gap-3 p-4">
								<InformationCircleIcon className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
								<div className="text-sm text-foreground/70">
									<p className="font-medium text-info mb-1">
										How Appraisal Works
									</p>
									<p>
										Our AVS (Active Validated Service) decodes your NFT
										metadata, queries external APIs for market data and
										comparable sales, then posts the appraisal on-chain. This
										typically completes within 1 minute. Once appraised, your
										NFT can be deposited into the gacha system.
									</p>
								</div>
							</div>
						</Card>
					</motion.div>

					{/* Error handling */}
					{error && (
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							className="flex justify-center"
						>
							<Card className="max-w-md p-4 bg-danger/10 border border-danger/20 rounded-xl">
								<div className="flex items-center gap-3 text-sm">
									<p className="text-danger flex-1">{error}</p>
									<Button
										color="glass"
										size="sm"
										isLoading={loading}
										onPress={() => refetch()}
									>
										<ArrowPathIcon className="w-4 h-4" />
									</Button>
								</div>
							</Card>
						</motion.div>
					)}
				</div>
			</motion.section>
		</div>
	);
}
