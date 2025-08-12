"use client";

import { motion } from "framer-motion";
import { formatUnits } from "viem";
import { formatTokenAmount } from "../lib/utils";
import {
	useReadGachaRewardsManagerGetGlobalAnalytics,
	useReadErc20Decimals,
	useReadErc20Symbol,
	useReadGachaFeeToken,
} from "../generated";
import { useGachaContracts } from "../hooks/useGachaContracts";
import { useGachaId } from "../hooks/useGachaId";
import { ThemedIcon } from "../lib/icons";
import { GlassCard } from "./ui";

export default function GlobalStats() {
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

	const { data: globalAnalytics } = useReadGachaRewardsManagerGetGlobalAnalytics({
		address: contracts.rewardsManager,
		query: { enabled: !!contracts.rewardsManager },
	});

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

	const stats = [
		{
			icon: "zap",
			label: "Total Platform Spins",
			value: globalAnalytics ? globalAnalytics[0].toString() : "0",
			color: "from-warning/20 to-orange-400/20",
			iconColor: "text-warning",
		},
		{
			icon: "coins",
			label: "Total Rewards Distributed",
			value: `${formatTokenAmountLocal(globalAnalytics?.[1])} ${tokenSymbol}`,
			color: "from-green-400/20 to-green-600/20",
			iconColor: "text-green-400",
		},
		{
			icon: "trending",
			label: "Protocol Fees Collected",
			value: `${formatTokenAmountLocal(globalAnalytics?.[2])} ${tokenSymbol}`,
			color: "from-blue-400/20 to-blue-600/20",
			iconColor: "text-blue-400",
		},
	];

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.8, duration: 0.6 }}
		>
			<GlassCard variant="base" className="p-6">
				<h4 className="text-lg font-light text-foreground/80 mb-4">
					Platform Statistics
				</h4>
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
					{stats.map((stat, index) => (
						<motion.div
							key={stat.label}
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ delay: 0.9 + index * 0.1, duration: 0.6 }}
							className="text-center"
						>
							<div className={`w-16 h-16 mx-auto mb-3 bg-gradient-to-br ${stat.color} backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center`}>
								<ThemedIcon name={stat.icon} size="lg" className={stat.iconColor} />
							</div>
							<p className="text-2xl font-bold text-foreground mb-1">
								{stat.value}
							</p>
							<p className="text-sm text-foreground/60">{stat.label}</p>
						</motion.div>
					))}
				</div>
			</GlassCard>
		</motion.div>
	);
}