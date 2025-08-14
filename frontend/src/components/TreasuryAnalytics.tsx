"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardBody } from "@heroui/react";
import { formatUnits } from "viem";
import { formatTokenAmount } from "../lib/utils";
import {
	useReadGachaTreasuryGetTotalItemsCount,
	useReadGachaGetTotalValueLocked,
	useReadGachaTreasuryGetAllPriceRanges,
	useReadGachaTreasuryGetWhitelistedCollections,
	useReadGachaTreasuryGetWhitelistLength,
	useReadErc20Decimals,
	useReadErc20Symbol,
	useReadGachaFeeToken,
} from "../generated";
import { useGachaContracts } from "../hooks/useGachaContracts";
import { useGachaId } from "../hooks/useGachaId";
import { CurrencyDollarIcon, GiftIcon, TrophyIcon, ChartBarIcon } from "@heroicons/react/24/outline";
import { GlassCard, GlassButton, GlassBadge } from "./ui";
import GlobalStats from "./GlobalStats";

export default function TreasuryAnalytics() {
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

	const { data: totalValueLocked } = useReadGachaGetTotalValueLocked({
		address: contracts.gacha!,
		query: { enabled: !!contracts.gacha },
	});

	const { data: totalItemsCount } = useReadGachaTreasuryGetTotalItemsCount({
		address: contracts.treasury!,
		query: { enabled: !!contracts.treasury },
	});

	const { data: whitelistLength } = useReadGachaTreasuryGetWhitelistLength({
		address: contracts.treasury!,
		query: { enabled: !!contracts.treasury },
	});

	const { data: priceRanges } = useReadGachaTreasuryGetAllPriceRanges({
		address: contracts.treasury!,
		query: { enabled: !!contracts.treasury },
	});

	// Constants for detecting unbounded values
	const UINT256_MAX = BigInt(
		"115792089237316195423570985008687907853269984665640564039457584007913129639935",
	);
	const VERY_LARGE_THRESHOLD = BigInt("1000000000000000000000000000000000000"); // Much smaller than uint256 max but still very large

	// Format token amounts
	const formatTokenAmountLocal = (amount: bigint | undefined) => {
		if (!amount || !tokenDecimals) return "0";
		return formatTokenAmount(amount, tokenDecimals, {
			maxDecimals: 2,
			minDecimals: 0,
			useGrouping: true,
			notation: "standard",
		});
	};

	// Format price range values with unbounded detection
	const formatPriceRangeValue = (
		amount: bigint | undefined,
		isMaxValue: boolean = false,
	) => {
		if (!amount || !tokenDecimals) return "0";

		// Check if this is an unbounded/max value
		if (
			isMaxValue &&
			(amount >= VERY_LARGE_THRESHOLD || amount === UINT256_MAX)
		) {
			return "∞";
		}

		return formatTokenAmount(amount, tokenDecimals, {
			maxDecimals: 2,
			minDecimals: 0,
			useGrouping: true,
			notation: "standard",
		});
	};

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
						Treasury Analytics
					</span>
				</h2>
				<p className="text-xl text-foreground/70 max-w-2xl mx-auto leading-relaxed font-light">
					Real-time insights into the gacha treasury pool and asset valuations
				</p>
			</motion.div>

			{/* Main Stats */}
			<div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				{/* Total Value Locked */}
				<motion.div
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ delay: 0.1, duration: 0.6 }}
				>
					<GlassCard variant="floating" animate={true} padding="lg">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-foreground/60 uppercase tracking-wide font-medium">
									Total Value Locked
								</p>
								<h3 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-warning to-orange-400 bg-clip-text text-transparent mt-2">
									{formatTokenAmountLocal(totalValueLocked)}{" "}
									{tokenSymbol || "TOKENS"}
								</h3>
							</div>
							<div className="w-14 h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-warning/20 to-orange-400/20 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center">
								<CurrencyDollarIcon className="w-6 h-6 text-warning" />
							</div>
						</div>
					</GlassCard>
				</motion.div>

				{/* Total Items */}
				<motion.div
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ delay: 0.2, duration: 0.6 }}
				>
					<GlassCard variant="floating" animate={true} padding="lg">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-foreground/60 uppercase tracking-wide font-medium">
									NFTs in Pool
								</p>
								<h3 className="text-2xl lg:text-3xl font-bold text-foreground mt-2">
									{totalItemsCount ? totalItemsCount.toString() : "0"}
								</h3>
							</div>
							<div className="w-14 h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-purple-400/20 to-purple-600/20 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center">
								<GiftIcon className="w-6 h-6 text-purple-400" />
							</div>
						</div>
					</GlassCard>
				</motion.div>

				{/* Whitelisted Collections */}
				<motion.div
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ delay: 0.3, duration: 0.6 }}
				>
					<GlassCard variant="floating" animate={true} padding="lg">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-foreground/60 uppercase tracking-wide font-medium">
									Collections
								</p>
								<h3 className="text-2xl lg:text-3xl font-bold text-foreground mt-2">
									{whitelistLength ? whitelistLength.toString() : "0"}
								</h3>
							</div>
							<div className="w-14 h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-400/20 to-blue-600/20 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center">
								<TrophyIcon className="w-6 h-6 text-blue-400" />
							</div>
						</div>
					</GlassCard>
				</motion.div>

				{/* Average Value Per NFT */}
				<motion.div
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ delay: 0.4, duration: 0.6 }}
				>
					<GlassCard variant="floating" animate={true} padding="lg">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-foreground/60 uppercase tracking-wide font-medium">
									Avg Value/NFT
								</p>
								<h3 className="text-2xl lg:text-3xl font-bold text-foreground mt-2">
									{totalValueLocked &&
									totalItemsCount &&
									Number(totalItemsCount) > 0
										? formatTokenAmountLocal(
												totalValueLocked / BigInt(Number(totalItemsCount)),
											)
										: "0"}{" "}
									{tokenSymbol}
								</h3>
							</div>
							<div className="w-14 h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-green-400/20 to-green-600/20 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center">
								<ChartBarIcon className="w-6 h-6 text-green-400" />
							</div>
						</div>
					</GlassCard>
				</motion.div>
			</div>

			{/* Price Ranges */}
			{priceRanges && priceRanges.length > 0 && (
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.5, duration: 0.6 }}
				>
					<GlassCard
						variant="base"
						padding="lg"
						header={
							<h3 className="text-2xl font-light text-foreground tracking-tight">
								Price Range Distribution
							</h3>
						}
					>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{priceRanges.map((range, index) => (
								<motion.div
									key={index}
									initial={{ opacity: 0, scale: 0.95 }}
									animate={{ opacity: 1, scale: 1 }}
									transition={{ delay: 0.6 + index * 0.1, duration: 0.6 }}
									className="bg-content1/20 backdrop-blur-xl rounded-xl border border-white/10 p-4 hover:bg-content1/30 transition-all duration-300"
								>
									<div className="flex justify-between items-center">
										<div>
											<p className="text-sm text-foreground/60 font-medium">
												Range {index + 1}
											</p>
											<p className="text-lg font-semibold text-foreground">
												{formatPriceRangeValue(range.minPriceUSD)} -{" "}
												{formatPriceRangeValue(range.maxPriceUSD, true)}
												{range.maxPriceUSD &&
												(range.maxPriceUSD >= VERY_LARGE_THRESHOLD ||
													range.maxPriceUSD === UINT256_MAX)
													? ""
													: ` ${tokenSymbol}`}
											</p>
										</div>
									</div>
								</motion.div>
							))}
						</div>
					</GlassCard>
				</motion.div>
			)}

			{/* Global Platform Statistics */}
			<GlobalStats />
		</div>
	);
}
