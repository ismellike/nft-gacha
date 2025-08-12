"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount } from "wagmi";
import { formatUnits } from "viem";
import { formatTokenAmount } from "../lib/utils";
import {
	useReadGachaSpinRequests,
	useReadGachaGetSpinRequest,
	useReadErc20Decimals,
	useReadErc20Symbol,
	useReadGachaFeeToken,
} from "../generated";
import { useGachaContracts } from "../hooks/useGachaContracts";
import { useGachaId } from "../hooks/useGachaId";
import { RARITY_CONFIG, Rarity } from "../lib/rarityConfig";
import { ThemedIcon } from "../lib/icons";
import { GlassCard, GlassButton, GlassBadge } from "./ui";

interface SpinRequest {
	id: bigint;
	spinner: `0x${string}`;
	fulfilled: boolean;
	timestamp: number;
	rarity?: Rarity;
	nftAddress?: `0x${string}`;
	tokenId?: bigint;
}

export default function SpinHistory() {
	const { address: userAddress, isConnected } = useAccount();
	const [spinRequests, setSpinRequests] = useState<SpinRequest[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const gachaId = useGachaId();
	const contracts = useGachaContracts(gachaId);

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

	// Load spin history for the user from contract events
	useEffect(() => {
		if (!userAddress || !contracts.gacha) {
			setIsLoading(false);
			setSpinRequests([]);
			return;
		}

		const loadSpinHistory = async () => {
			setIsLoading(true);
			try {
				// In a real implementation, you would:
				// 1. Query RandomnessRequested events filtered by user address
				// 2. Query SpinCompleted events to get fulfilled spins
				// 3. Match them together to build the spin history
				// 4. Use event logs or a subgraph for efficient querying

				// For now, we'll show an empty state since we need proper event indexing
				setSpinRequests([]);
			} catch (error) {
				console.error("Failed to load spin history:", error);
				setSpinRequests([]);
			} finally {
				setIsLoading(false);
			}
		};

		loadSpinHistory();
	}, [userAddress, contracts.gacha]);

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

	const getRarityConfig = (rarity: Rarity) => RARITY_CONFIG[rarity];

	if (!isConnected) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<GlassCard variant="base" className="p-8 text-center">
					<ThemedIcon
						name="wallet"
						size="xl"
						className="mx-auto mb-4 text-warning"
					/>
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

			{/* Stats Summary */}
			<div className="grid sm:grid-cols-1 md:grid-cols-3 gap-6">
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
								<h3 className="text-3xl font-bold bg-gradient-to-r from-warning to-orange-400 bg-clip-text text-transparent mt-2">
									{spinRequests.length}
								</h3>
							</div>
							<div className="w-16 h-16 bg-gradient-to-br from-warning/20 to-orange-400/20 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center">
								<ThemedIcon name="zap" size="xl" variant="accent" />
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
									{spinRequests.filter((spin) => spin.fulfilled).length}
								</h3>
							</div>
							<div className="w-16 h-16 bg-gradient-to-br from-green-400/20 to-green-600/20 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center">
								<ThemedIcon name="check" size="xl" variant="success" />
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
									{spinRequests.filter((spin) => !spin.fulfilled).length}
								</h3>
							</div>
							<div className="w-16 h-16 bg-gradient-to-br from-blue-400/20 to-blue-600/20 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center">
								<ThemedIcon name="clock" size="xl" className="text-blue-400" />
							</div>
						</div>
					</GlassCard>
				</motion.div>
			</div>

			{/* Spin History List */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.4, duration: 0.6 }}
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
					) : spinRequests.length === 0 ? (
						<div className="p-12 text-center">
							<ThemedIcon
								name="dice"
								size="xl"
								className="mx-auto mb-4 text-foreground/30"
							/>
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
								{spinRequests.map((spin, index) => (
									<motion.div
										key={spin.id.toString()}
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
															spin.fulfilled
																? "bg-green-400/20 border-green-400/30"
																: "bg-blue-400/20 border-blue-400/30"
														}`}
													>
														<ThemedIcon
															name={spin.fulfilled ? "check" : "clock"}
															size="md"
															className={
																spin.fulfilled
																	? "text-green-400"
																	: "text-blue-400"
															}
														/>
													</div>

													{/* Spin details */}
													<div className="space-y-1">
														<div className="flex items-center gap-2">
															<span className="font-medium text-foreground">
																Spin #{spin.id.toString()}
															</span>
															{spin.fulfilled && spin.rarity !== undefined && (
																<GlassBadge
																	variant="primary"
																	className={`text-xs bg-gradient-to-r ${
																		getRarityConfig(spin.rarity).bgGradient
																	}`}
																>
																	{getRarityConfig(spin.rarity).emoji}{" "}
																	{getRarityConfig(spin.rarity).name}
																</GlassBadge>
															)}
														</div>
														<p className="text-sm text-foreground/60">
															{formatTimeAgo(spin.timestamp)}
														</p>
														{spin.fulfilled &&
															spin.nftAddress &&
															spin.tokenId && (
																<p className="text-xs text-foreground/50 font-mono">
																	Token #{spin.tokenId.toString()}
																</p>
															)}
													</div>
												</div>

												{/* Right side - Status */}
												<div className="text-right">
													{spin.fulfilled ? (
														<GlassBadge variant="success" size="sm">
															Fulfilled
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

			{/* Note about data */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.8, duration: 0.6 }}
				className="text-center"
			>
				<GlassCard variant="base" className="p-6">
					<div className="flex items-center justify-center gap-2 text-foreground/60">
						<ThemedIcon name="info" size="sm" />
						<p className="text-sm">
							Spin history requires event indexing to display user transactions.
							Consider implementing with The Graph or event log queries.
						</p>
					</div>
				</GlassCard>
			</motion.div>
		</div>
	);
}
