"use client";

import { UserCircleIcon, CheckBadgeIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { Card } from "../../ui";
import { ProfileDashboard } from "../ProfileDashboard";

interface ProfileSectionProps {
	title: string;
	description: string;
}

export function ProfileSection({ title, description }: ProfileSectionProps) {
	return (
		<section className="space-y-8">
			<motion.div
				initial={{ opacity: 0, y: 12 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.45 }}
			>
				<Card className="relative overflow-hidden border border-white/10 bg-content1/30 p-6 backdrop-blur-2xl md:p-8">
					<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(208,191,255,0.16),_transparent_60%)]" />
					<div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
						<div className="max-w-2xl space-y-4">
							<div className="flex items-center gap-3 text-rarity-legendary-300">
								<span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-rarity-legendary-500/40 bg-rarity-legendary-500/10">
									<UserCircleIcon className="h-5 w-5" />
								</span>
								<span className="text-xs font-medium uppercase tracking-widest text-rarity-legendary-500/70">
									Rewards & Claiming
								</span>
							</div>
							<div className="space-y-2">
								<h2 className="text-2xl font-semibold text-foreground md:text-3xl">
									{title}
								</h2>
								<p className="text-sm text-foreground/70 md:text-base">
									{description}
								</p>
							</div>
						</div>
						<div className="flex w-full flex-col gap-3 rounded-2xl border border-white/10 bg-content1/40 p-4 text-sm text-foreground/80 shadow-inner md:w-auto md:min-w-[260px]">
							<div className="flex items-center gap-3">
								<span className="flex h-9 w-9 items-center justify-center rounded-xl border border-rarity-legendary-500/40 bg-rarity-legendary-500/10 text-rarity-legendary-300">
									<CheckBadgeIcon className="h-4 w-4" />
								</span>
								<div className="flex flex-col">
									<span className="text-xs uppercase tracking-wide text-foreground/50">
										Claim Credits
									</span>
									<span className="text-sm font-medium text-foreground">
										Withdraw winnings & deposits
									</span>
								</div>
							</div>
							<p className="text-xs leading-5 text-foreground/60">
								Claim rewards across rarity tiers and keep track of treasury
								shares with on-chain receipts for every action.
							</p>
						</div>
					</div>
				</Card>
			</motion.div>

			<ProfileDashboard />
		</section>
	);
}
