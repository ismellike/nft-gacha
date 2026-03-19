"use client";

import {
	BanknotesIcon,
	ChartBarIcon,
	GiftIcon,
} from "@heroicons/react/24/outline";
import type { UserCardGroupedData } from "../../hooks/useCardGroupedVault";
import { formatTokenAmount } from "../../lib/utils";
import { Button } from "../../ui";

interface BalanceOverviewProps {
	depositorUserData: UserCardGroupedData;
	isClaiming: boolean;
	onClaimYield: () => void;
	totalDepositedNFTs: number;
}

export function BalanceOverview({
	depositorUserData,
	isClaiming,
	onClaimYield,
	totalDepositedNFTs,
}: BalanceOverviewProps) {
	return (
		<section
			aria-label="Account Overview"
			className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
		>
			<article className="bg-content1/30 rounded-xl p-4 border border-white/10">
				<div className="flex items-center gap-3">
					<div className="p-2 rounded-lg bg-primary/20">
						<BanknotesIcon className="w-6 h-6 text-primary" aria-hidden="true" />
					</div>
					<div>
						<h3 className="text-sm font-medium text-foreground/60">
							Pending Yield
						</h3>
						<p className="text-xl font-semibold text-foreground">
							{depositorUserData?.pendingYield
								? formatTokenAmount(depositorUserData.pendingYield, 6)
								: "0.000000"}{" "}
							USDC
						</p>
					</div>
				</div>
				<Button
					className="mt-3 w-full"
					color="glassPrimary"
					onPress={onClaimYield}
					isLoading={isClaiming}
					disabled={
						isClaiming ||
						!depositorUserData.pendingYield ||
						depositorUserData.pendingYield <= 0n
					}
					aria-label="Claim pending yield"
				>
					Claim Yield
				</Button>
			</article>

			<article className="bg-content1/30 rounded-xl p-4 border border-white/10">
				<div className="flex items-center gap-3">
					<div className="p-2 rounded-lg bg-success/20">
						<GiftIcon className="w-6 h-6 text-success" aria-hidden="true" />
					</div>
					<div>
						<h3 className="text-sm font-medium text-foreground/60">
							Deposited NFTs
						</h3>
						<p className="text-xl font-semibold text-foreground">
							{totalDepositedNFTs} NFT{totalDepositedNFTs !== 1 ? "s" : ""}
						</p>
					</div>
				</div>
			</article>

			<article className="bg-content1/30 rounded-xl p-4 border border-white/10">
				<div className="flex items-center gap-3">
					<div className="p-2 rounded-lg bg-warning/20">
						<ChartBarIcon className="w-6 h-6 text-warning" aria-hidden="true" />
					</div>
					<div>
						<h3 className="text-sm font-medium text-foreground/60">
							Total Earned
						</h3>
						<p className="text-xl font-semibold text-foreground">
							{depositorUserData?.pendingYield
								? formatTokenAmount(depositorUserData.pendingYield, 6)
								: "0.000000"}{" "}
							USDC
						</p>
					</div>
				</div>
				<p className="text-sm text-foreground/60 mt-2">lifetime yield earnings</p>
			</article>
		</section>
	);
}
