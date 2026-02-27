"use client";

import { motion } from "framer-motion";
import {
	calculateUserSharePercentage,
	type CardGroupedVaultData,
	type UserCardGroupedData,
	useClaimYield,
} from "../../../hooks/useCardGroupedVault";
import { logger } from "../../../lib/logger";
import { formatTokenAmount } from "../../../lib/utils";
import { Button } from "../../../ui";

interface YieldTabProps {
	depositorUserData: UserCardGroupedData;
	depositorData: CardGroupedVaultData;
	treasuryAddress?: `0x${string}` | undefined;
}

export function YieldTab({
	depositorUserData,
	depositorData,
	treasuryAddress,
}: YieldTabProps) {
	const { claimYield, isClaiming } = useClaimYield();

	const handleClaimYield = async () => {
		if (!treasuryAddress) {
			logger.contracts.error("Treasury address not available");
			return;
		}
		try {
			await claimYield({
				address: treasuryAddress,
				args: [treasuryAddress],
			});
		} catch (error) {
			logger.contracts.error("Error claiming yield:", error);
		}
	};

	return (
		<section
			id="yield-panel"
			role="tabpanel"
			aria-labelledby="yield-tab"
			className="space-y-6 sm:space-y-8"
		>
			{/* Header */}
			<header className="space-y-3">
				<h2 className="text-xl sm:text-2xl font-semibold text-foreground">
					Yield Information
				</h2>
				<p className="text-sm sm:text-base text-foreground/60">
					View your earned yield and claim rewards.
				</p>
			</header>

			<div className="space-y-6">
				{/* Yield Summary Card */}
				<motion.article
					className="bg-content1/30 backdrop-blur-xl rounded-xl p-6 sm:p-8 border border-white/10"
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1 }}
				>
					<div className="flex items-center justify-between mb-6">
						<h3 className="text-base sm:text-lg font-medium text-foreground">
							Yield Summary
						</h3>
						{(depositorUserData?.pendingYield ?? 0n) > 0n && (
							<Button
								color="glassPrimary"
								className="min-h-[44px] px-4 sm:px-6"
								onPress={handleClaimYield}
								isLoading={isClaiming}
								disabled={
									isClaiming || (depositorUserData?.pendingYield ?? 0n) === 0n
								}
							>
								Claim Yield
							</Button>
						)}
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
						<div className="space-y-2">
							<h4 className="text-xs sm:text-sm font-medium text-foreground/60">
								Pending Yield
							</h4>
							<p className="text-lg sm:text-xl font-semibold text-success">
								{depositorUserData?.pendingYield
									? formatTokenAmount(depositorUserData.pendingYield, 6)
									: "0.000000"}{" "}
								USDC
							</p>
						</div>
						<div className="space-y-2">
							<h4 className="text-xs sm:text-sm font-medium text-foreground/60">
								Total Earned
							</h4>
							<p className="text-lg sm:text-xl font-semibold text-foreground">
								{depositorUserData?.pendingYield
									? formatTokenAmount(depositorUserData.pendingYield, 6)
									: "0.000000"}{" "}
								USDC
							</p>
						</div>
					</div>
				</motion.article>

				{/* Your Position Card */}
				<motion.article
					className="bg-content1/30 backdrop-blur-xl rounded-xl p-6 sm:p-8 border border-white/10"
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
				>
					<h3 className="text-base sm:text-lg font-medium text-foreground mb-6">
						Your Position
					</h3>
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
						<div className="space-y-2">
							<h4 className="text-xs sm:text-sm font-medium text-foreground/60">
								Your Shares
							</h4>
							<p className="text-lg sm:text-xl font-semibold text-foreground">
								{depositorUserData?.shares?.toString() || "0"}
							</p>
						</div>
						<div className="space-y-2">
							<h4 className="text-xs sm:text-sm font-medium text-foreground/60">
								Total Vault Shares
							</h4>
							<p className="text-lg sm:text-xl font-semibold text-foreground">
								{depositorData?.totalShares?.toString() || "0"}
							</p>
						</div>
						<div className="space-y-2">
							<h4 className="text-xs sm:text-sm font-medium text-foreground/60">
								Share Ownership
							</h4>
							<p className="text-lg sm:text-xl font-semibold text-primary">
								{calculateUserSharePercentage(
									depositorUserData?.shares,
									depositorData?.totalShares,
								)}
							</p>
						</div>
					</div>
				</motion.article>
			</div>
		</section>
	);
}
