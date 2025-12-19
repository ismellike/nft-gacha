"use client";

import { motion } from "framer-motion";
import {
	BoltIcon,
	ClockIcon,
	ChartBarIcon,
	CheckBadgeIcon,
} from "@heroicons/react/24/outline";
import { useAccount } from "wagmi";

import { NFTAppraisalDashboard } from "../../components/NFTAppraisalDashboard";
import { Card, Button, Skeleton } from "../../ui";
import { InlineRetryMessage } from "../../components/InlineRetryMessage";
import {
	ContractStatusAnnouncer,
	useContractStatusAnnouncer,
} from "../../components/ContractStatusAnnouncer";
import { useAppraisalData } from "../../hooks/useAppraisalData";
import { formatCurrency } from "../../lib/utils";

export default function AppraisalPage() {
	const { address } = useAccount();
	const { status: contractStatus } = useContractStatusAnnouncer();
	const { stats, appraisalFee, loading, error } = useAppraisalData(address, {
		autoRefresh: true,
		filter: "all",
		sort: "newest",
	});

	const heroStats = [
		{
			label: "Completed appraisals",
			value: stats.completed,
			icon: CheckBadgeIcon,
		},
		{
			label: "Pending right now",
			value: stats.pending,
			icon: ClockIcon,
		},
		{
			label: "Total value appraised",
			value:
				stats.totalValue > BigInt(0)
					? formatCurrency(stats.totalValue.toString(), 18, "USD")
					: "--",
			icon: ChartBarIcon,
		},
	];

	const statusSkeletonKeys = Array.from(
		{ length: 4 },
		(_, idx) => `status-skeleton-${idx}`,
	);

	return (
		<div className="min-h-screen bg-transparent">
			{/* Global contract status announcer */}
			<div className="fixed top-4 right-4 z-50 max-w-sm">
				<ContractStatusAnnouncer status={contractStatus} compact />
			</div>

			<motion.section
				initial={{ opacity: 0, y: 24 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6 }}
				className="relative z-10 container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12"
			>
				<div className="space-y-8">
					<div className="space-y-4">
						<div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-content1/20 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-warning">
							Appraisal flow
						</div>
						<h1 className="text-4xl sm:text-5xl font-semibold leading-tight text-foreground">
							Appraise any NFT in one clean path
						</h1>
						<p className="text-base sm:text-lg text-foreground/70 max-w-3xl">
							Enter a contract and token, preview the NFT, pay the single
							appraisal fee, and follow the live status until your valuation
							lands in the treasury.
						</p>
						<div className="flex flex-wrap items-center gap-3">
							<Button asChild color="glassPrimary" size="lg" animate>
								<a href="#appraisal-workbench">Start appraisal</a>
							</Button>
							{loading ? (
								<div className="flex items-center gap-2 rounded-full border border-white/10 bg-content1/30 px-3 py-2">
									<Skeleton variant="circle" size="w4 h4" />
									<Skeleton size="h4 w24" />
								</div>
							) : appraisalFee ? (
								<div className="flex items-center gap-2 rounded-full border border-white/10 bg-content1/30 px-3 py-2 text-sm text-foreground/70">
									<BoltIcon className="h-4 w-4 text-warning" />
									<span>
										Current fee:{" "}
										{formatCurrency(appraisalFee.toString(), 6, "USDC")}
									</span>
								</div>
							) : null}
							<p className="text-xs sm:text-sm text-foreground/60">
								If USDC isn’t approved yet, we’ll prompt approval first, then
								submit the appraisal in one flow—no extra steps needed.
							</p>
						</div>
					</div>

					<div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
						<Card
							id="appraisal-workbench"
							className="relative overflow-hidden rounded-3xl border border-white/10 bg-content1/30 p-4 sm:p-6 lg:p-8 shadow-2xl"
						>
							<div className="pointer-events-none absolute inset-0 opacity-40">
								<div className="absolute -left-10 top-10 h-32 w-32 rounded-full bg-warning/5 blur-3xl" />
								<div className="absolute bottom-0 right-0 h-40 w-40 rounded-full bg-orange-400/10 blur-3xl" />
							</div>

							<div className="relative flex flex-col gap-6">
								<div className="flex flex-col gap-3">
									<p className="text-xs uppercase tracking-wide text-warning">
										Appraisal workbench
									</p>
									<h3 className="text-2xl font-semibold text-foreground">
										Enter NFT → Preview card → Pay fee → Track result
									</h3>
									<p className="text-sm text-foreground/70 max-w-3xl">
										The full flow lives here. Submit contract + token ID, see
										the NFT card, pay the appraisal fee, and watch status update
										in place. No extra navigation.
									</p>
								</div>

								<NFTAppraisalDashboard variant="compact" className="mt-2" />
							</div>
						</Card>

						<div className="flex flex-col gap-4">
							<Card className="rounded-3xl border border-white/10 bg-content1/30 p-5">
								<div className="flex items-center justify-between">
									<h3 className="text-lg font-semibold text-foreground">
										Status & fee
									</h3>
									{loading ? (
										<div className="h-6 w-20 rounded-full bg-white/10" />
									) : appraisalFee ? (
										<span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-xs font-semibold text-warning">
											<BoltIcon className="h-4 w-4" />
											{formatCurrency(appraisalFee.toString(), 6, "USDC")}
										</span>
									) : null}
								</div>
								<div className="mt-4 grid gap-3">
									{loading ? (
										statusSkeletonKeys.map((skeletonKey) => (
											<div
												key={skeletonKey}
												className="flex items-center gap-3 rounded-2xl border border-white/10 bg-content1/40 p-3"
											>
												<Skeleton variant="circle" size="w10 h10" />
												<div className="flex-1">
													<Skeleton size="h4 w20 mb-1" />
													<Skeleton size="h6 w16" />
												</div>
											</div>
										))
									) : (
										<>
											{heroStats.map((item) => (
												<div
													key={item.label}
													className="flex items-center gap-3 rounded-2xl border border-white/10 bg-content1/40 p-3"
												>
													<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
														<item.icon className="h-5 w-5 text-warning" />
													</div>
													<div>
														<p className="text-xs uppercase tracking-wide text-foreground/50">
															{item.label}
														</p>
														<p className="text-lg font-semibold text-foreground">
															{item.value}
														</p>
													</div>
												</div>
											))}
											<div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-content1/40 p-3">
												<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
													<ClockIcon className="h-5 w-5 text-warning" />
												</div>
												<div>
													<p className="text-xs uppercase tracking-wide text-foreground/50">
														Ready to spin
													</p>
													<p className="text-lg font-semibold text-foreground">
														{stats.readyForGacha}
													</p>
												</div>
											</div>
										</>
									)}
								</div>

								{/* Error message for appraisal data */}
								{error && (
									<InlineRetryMessage
										type="contract"
										message="Failed to load appraisal statistics"
										className="mt-4"
										compact
									/>
								)}
							</Card>
						</div>
					</div>
				</div>
			</motion.section>
		</div>
	);
}
