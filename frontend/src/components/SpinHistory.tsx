"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount } from "wagmi";
import { formatUnits } from "viem";
import { formatTokenAmount } from "../lib/utils";
import {
	useReadErc20Decimals,
	useReadErc20Symbol,
	useReadGachaFeeToken,
	useWatchGachaSpinStatusUpdate,
	useWatchGachaRandomnessRequested,
	useWatchGachaSpinRefunded,
} from "../generated";
import { useGachaContracts } from "../hooks/useGachaContracts";
import { useGachaId } from "../hooks/useGachaId";
import { useUserSpinHistory } from "../hooks/useSpinHistory";
import { RARITY_CONFIG, Rarity, getRarityConfig } from "../lib/rarityConfig";
import { SpinStatus } from "../hooks/types/spinHistory";
import {
	BoltIcon,
	CheckIcon,
	ClockIcon,
	XMarkIcon,
	ExclamationTriangleIcon,
	InformationCircleIcon,
	WalletIcon,
	StarIcon,
	CubeIcon,
	ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { GlassCard, GlassButton, GlassBadge } from "./ui";

export default function SpinHistory() {
	const { address: userAddress, isConnected } = useAccount();
	const gachaId = useGachaId();
	const contracts = useGachaContracts(gachaId);

	// Use the new spin history hook
	const {
		spins,
		totalSpins,
		completedSpins,
		refundedSpins,
		pendingSpins,
		isLoading,
		error: spinHistoryError,
		refetch,
	} = useUserSpinHistory(contracts.gacha);

	// Contract reads
	const { data: feeToken } = useReadGachaFeeToken({
		address: contracts.gacha!,
		query: { enabled: !!contracts.gacha },
	});

	const { data: tokenDecimals } = useReadErc20Decimals({
		address: feeToken,
		query: { enabled: !!feeToken },
	});

	const { data: tokenSymbol } = useReadErc20Symbol({
		address: feeToken,
		query: { enabled: !!feeToken },
	});

	// Real-time event watchers for live updates
	const [latestSpinUpdate, setLatestSpinUpdate] = useState<{
		triggerId: bigint;
		status: string;
		timestamp: number;
	} | null>(null);

	// Watch for new spin status updates
	useWatchGachaSpinStatusUpdate({
		address: contracts.gacha,
		args: userAddress ? { requester: userAddress } : undefined,
		onLogs: (logs) => {
			// Process the latest status update
			if (logs.length > 0) {
				const latestLog = logs[logs.length - 1];
				setLatestSpinUpdate({
					triggerId: latestLog.args.triggerId!,
					status: latestLog.args.status!,
					timestamp: Date.now(),
				});

				// Trigger a refetch to update the spin history
				setTimeout(() => refetch(), 1000);
			}
		},
		enabled: !!contracts.gacha && !!userAddress,
	});

	// Watch for new randomness requests (new spins)
	useWatchGachaRandomnessRequested({
		address: contracts.gacha,
		onLogs: (logs) => {
			if (logs.length > 0) {
				// Auto-refresh when user starts new spins
				setTimeout(() => refetch(), 500);
			}
		},
		enabled: !!contracts.gacha && !!userAddress,
	});

	// Watch for refunded spins for immediate updates
	useWatchGachaSpinRefunded({
		address: contracts.gacha,
		args: userAddress ? { requester: userAddress } : undefined,
		onLogs: (logs) => {
			if (logs.length > 0) {
				const latestLog = logs[logs.length - 1];
				console.log("💰 [SpinHistory] Detected spin refund:", latestLog.args);
				setLatestSpinUpdate({
					triggerId: latestLog.args.triggerId!,
					status: "refunded",
					timestamp: Date.now(),
				});

				// Immediate refresh for refunds to update balance and history
				setTimeout(() => refetch(), 500);
			}
		},
		enabled: !!contracts.gacha && !!userAddress,
	});

	// Handle error display
	useEffect(() => {
		if (spinHistoryError) {
			console.error("Spin history error:", spinHistoryError);
		}
	}, [spinHistoryError]);

	const formatTimeAgo = (timestamp: number) => {
		const now = Date.now();
		const diff = now - timestamp;
		const minutes = Math.floor(diff / 60000);
		const hours = Math.floor(diff / 3600000);
		const days = Math.floor(diff / 86400000);

		if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
		if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
		if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
		return "Just now";
	};

	if (!isConnected) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<GlassCard variant="base" className="p-8 text-center">
					<WalletIcon className="w-8 h-8 mx-auto mb-4 text-warning" />
					<h3 className="text-xl font-medium text-foreground mb-4">
						Connect Your Wallet
					</h3>
					<p className="text-foreground/70">
						Connect your wallet to view your spin history
					</p>
				</GlassCard>
			</div>
		);
	}

	return (
		<div className="space-y-8">
			{/* Header */}
			<motion.div
				className="text-center"
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6 }}
			>
				<h2 className="text-4xl font-light mb-4 tracking-tight">
					<span className="bg-gradient-to-r from-foreground to-warning bg-clip-text text-transparent">
						Spin History
					</span>
				</h2>
				<p className="text-xl text-foreground/70 max-w-2xl mx-auto leading-relaxed font-light">
					Track all your gacha spins and results
				</p>
			</motion.div>

			{/* Real-time Status Update Notification */}
			{latestSpinUpdate && (
				<motion.div
					initial={{ opacity: 0, y: -20, scale: 0.95 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					exit={{ opacity: 0, y: -20, scale: 0.95 }}
					transition={{ duration: 0.3 }}
					className="mb-6"
				>
					<GlassCard
						variant="floating"
						className="p-4 border-l-4 border-warning bg-gradient-to-r from-warning/10 to-warning/10"
					>
						<div className="flex items-center gap-3">
							<motion.div
								animate={{ rotate: 360 }}
								transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
								className="w-6 h-6 rounded-full bg-gradient-to-r from-warning to-warning flex items-center justify-center"
							>
								<BoltIcon className="w-3 h-3 text-white" />
							</motion.div>
							<div>
								<p className="text-sm font-medium text-foreground">
									Spin #{latestSpinUpdate.triggerId.toString()} status updated
									to{" "}
									<span className="text-warning font-bold capitalize">
										{latestSpinUpdate.status}
									</span>
								</p>
								<p className="text-xs text-foreground/60">
									{formatTimeAgo(latestSpinUpdate.timestamp)}
								</p>
							</div>
						</div>
					</GlassCard>
				</motion.div>
			)}

			{/* Stats Summary */}
			<div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				<motion.div
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ delay: 0.1, duration: 0.6 }}
				>
					<GlassCard variant="floating" animate={true} padding="lg">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-foreground/60 uppercase tracking-wide font-medium">
									Total Spins
								</p>
								<h3 className="text-3xl font-bold bg-gradient-to-r from-warning to-warning bg-clip-text text-transparent mt-2">
									{totalSpins}
								</h3>
							</div>
							<div className="w-16 h-16 bg-gradient-to-br from-warning/20 to-orange-400/20 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center">
								<BoltIcon className="w-8 h-8 text-warning" />
							</div>
						</div>
					</GlassCard>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ delay: 0.2, duration: 0.6 }}
				>
					<GlassCard variant="floating" animate={true} padding="lg">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-foreground/60 uppercase tracking-wide font-medium">
									Successful Spins
								</p>
								<h3 className="text-3xl font-bold text-foreground mt-2">
									{completedSpins}
								</h3>
							</div>
							<div className="w-16 h-16 bg-gradient-to-br from-green-400/20 to-green-600/20 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center">
								<CheckIcon className="w-8 h-8 text-success" />
							</div>
						</div>
					</GlassCard>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ delay: 0.3, duration: 0.6 }}
				>
					<GlassCard variant="floating" animate={true} padding="lg">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-foreground/60 uppercase tracking-wide font-medium">
									Pending Spins
								</p>
								<h3 className="text-3xl font-bold text-foreground mt-2">
									{pendingSpins}
								</h3>
							</div>
						<div className="w-16 h-16 bg-gradient-to-br from-info/20 to-info/20 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center">
							<ClockIcon className="w-8 h-8 text-info" />
							</div>
						</div>
					</GlassCard>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ delay: 0.4, duration: 0.6 }}
				>
					<GlassCard variant="floating" animate={true} padding="lg">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-foreground/60 uppercase tracking-wide font-medium">
									Refunded Spins
								</p>
								<h3 className="text-3xl font-bold text-foreground mt-2">
									{refundedSpins}
								</h3>
							</div>
							<div className="w-16 h-16 bg-gradient-to-br from-red-400/20 to-red-600/20 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center">
								<XMarkIcon className="w-8 h-8 text-red-400" />
							</div>
						</div>
					</GlassCard>
				</motion.div>
			</div>

			{/* Spin History List */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.5, duration: 0.6 }}
			>
				<GlassCard
					variant="base"
					padding="none"
					header={
						<h3 className="text-2xl font-light text-foreground tracking-tight">
							Recent Spins
						</h3>
					}
				>
					{isLoading ? (
						<div className="p-8 space-y-4">
							{[...Array(5)].map((_, i) => (
								<div
									key={i}
									className="bg-content1/20 rounded-lg p-4 animate-pulse"
								>
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											<div className="w-12 h-12 bg-content1/30 rounded-full"></div>
											<div className="space-y-2">
												<div className="w-24 h-4 bg-content1/30 rounded"></div>
												<div className="w-32 h-3 bg-content1/20 rounded"></div>
											</div>
										</div>
										<div className="w-20 h-6 bg-content1/30 rounded"></div>
									</div>
								</div>
							))}
						</div>
					) : spins.length === 0 ? (
						<div className="p-12 text-center">
							<CubeIcon className="w-8 h-8 mx-auto mb-4 text-foreground/30" />
							<h4 className="text-lg font-medium text-foreground mb-2">
								No Spins Yet
							</h4>
							<p className="text-foreground/60">
								Start spinning to see your history here
							</p>
						</div>
					) : (
						<div className="p-6 space-y-4">
							<AnimatePresence>
								{spins.map((spin, index) => (
									<motion.div
										key={spin.triggerId.toString()}
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: 0.5 + index * 0.1, duration: 0.6 }}
										className="relative group"
									>
										<div className="bg-gradient-to-r from-content1/40 to-content1/20 backdrop-blur-xl rounded-lg border border-white/10 p-4 group-hover:bg-content1/30 transition-colors duration-300">
											<div className="flex items-center justify-between">
												{/* Left side - Spin info */}
												<div className="flex items-center gap-4">
													{/* Status icon */}
													<div
														className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-xl border ${
															spin.status === SpinStatus.Completed
																? "bg-green-400/20 border-green-400/30"
																: spin.status === SpinStatus.Refunded
																	? "bg-red-400/20 border-red-400/30"
																	: "bg-info/20 border-info/30"
														}`}
													>
														{spin.status === SpinStatus.Completed && (
															<CheckIcon className="w-5 h-5 text-green-400" />
														)}
														{spin.status === SpinStatus.Refunded && (
															<XMarkIcon className="w-5 h-5 text-red-400" />
														)}
														{spin.status === SpinStatus.Pending && (
								<ClockIcon className="w-5 h-5 text-info" />
														)}
													</div>

													{/* Spin details */}
													<div className="space-y-1">
														<div className="flex items-center gap-2">
															<span className="font-medium text-foreground">
																Spin #{spin.triggerId.toString()}
															</span>
															{spin.completion && (
																<GlassBadge
																	variant="primary"
																	className={`text-xs bg-gradient-to-r ${
																		getRarityConfig(spin.completion.rarity)
																			.bgGradient
																	}`}
																>
																	{
																		getRarityConfig(spin.completion.rarity)
																			.emoji
																	}{" "}
																	{getRarityConfig(spin.completion.rarity).name}
																</GlassBadge>
															)}
															{spin.refund && (
																<GlassBadge
																	variant="danger"
																	className={`text-xs bg-gradient-to-r ${
																		getRarityConfig(spin.refund.selectedRarity)
																			.bgGradient
																	}`}
																>
																	{
																		getRarityConfig(spin.refund.selectedRarity)
																			.emoji
																	}{" "}
																	{
																		getRarityConfig(spin.refund.selectedRarity)
																			.name
																	}{" "}
																	Refunded
																</GlassBadge>
															)}
														</div>
														<p className="text-sm text-foreground/60">
															{formatTimeAgo(spin.timestamp)}
														</p>
														{spin.completion && (
															<div className="space-y-1">
																<p className="text-xs text-foreground/50 font-mono">
																	Token #{spin.completion.tokenId.toString()}
																</p>
																<p className="text-xs text-foreground/50">
																	Appraised:{" "}
																	{formatUnits(
																		spin.completion.appraisedPrice,
																		tokenDecimals || 18,
																	)}{" "}
																	{tokenSymbol || ""}
																</p>
															</div>
														)}
														{spin.refund && (
															<p className="text-xs text-foreground/50">
																Refund:{" "}
																{formatUnits(
																	spin.refund.refundAmount,
																	tokenDecimals || 18,
																)}{" "}
																{tokenSymbol || ""}
															</p>
														)}
													</div>
												</div>

												{/* Right side - Status */}
												<div className="text-right">
													{spin.status === SpinStatus.Completed ? (
														<GlassBadge variant="success" size="sm">
															Completed
														</GlassBadge>
													) : spin.status === SpinStatus.Refunded ? (
														<GlassBadge variant="danger" size="sm">
															Refunded
														</GlassBadge>
													) : (
														<GlassBadge variant="info" size="sm">
															Pending
														</GlassBadge>
													)}
												</div>
											</div>
										</div>
									</motion.div>
								))}
							</AnimatePresence>
						</div>
					)}
				</GlassCard>
			</motion.div>

			{/* Actions and Status */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.9, duration: 0.6 }}
				className="text-center space-y-4"
			>
				{spinHistoryError && (
					<GlassCard variant="base" className="p-6">
						<div className="flex items-center justify-center gap-2 text-red-400">
							<ExclamationTriangleIcon className="w-4 h-4" />
							<p className="text-sm">
								Error loading spin history: {spinHistoryError.message}
							</p>
						</div>
					</GlassCard>
				)}

				<GlassCard variant="base" className="p-6">
					<div className="flex items-center justify-center gap-4 text-foreground/60">
						<div className="flex items-center gap-2">
							<InformationCircleIcon className="w-4 h-4" />
							<p className="text-sm">
								Spin history loaded from blockchain events (last 5000 blocks)
							</p>
						</div>
						<GlassButton
							variant="secondary"
							size="sm"
							onClick={refetch}
							isDisabled={isLoading}
						>
							<ArrowPathIcon
								className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
							/>
							Refresh
						</GlassButton>
					</div>
				</GlassCard>
			</motion.div>
		</div>
	);
}
