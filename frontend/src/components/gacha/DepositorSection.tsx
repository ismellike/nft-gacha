"use client";

import {
	GiftIcon,
	WalletIcon,
	ArrowUpTrayIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { Card } from "../../ui";
import { NFTAvailabilitySection } from "../NFTAvailabilitySection";

interface DepositorSectionProps {
	title: string;
	description: string;
}

export function DepositorSection({
	title,
	description,
}: DepositorSectionProps) {
	return (
		<section className="space-y-8">
			<motion.div
				initial={{ opacity: 0, y: 12 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.45 }}
			>
				<Card className="relative overflow-hidden border border-white/10 bg-content1/30 p-6 backdrop-blur-2xl md:p-8">
					<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(45,212,191,0.16),_transparent_60%)]" />
					<div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
						<div className="max-w-2xl space-y-4">
							<div className="flex items-center gap-3 text-success">
								<span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-success/40 bg-success/10">
									<GiftIcon className="h-5 w-5" />
								</span>
								<span className="text-xs font-medium uppercase tracking-widest text-success/70">
									Depositor Flow
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
						<div className="grid w-full gap-3 rounded-2xl border border-white/10 bg-content1/40 p-4 text-sm text-foreground/80 shadow-inner md:grid-cols-2 lg:w-auto lg:min-w-[320px]">
							<div className="flex items-start gap-3">
								<span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-success/30 bg-success/10 text-success">
									<WalletIcon className="h-4 w-4" />
								</span>
								<p className="text-xs leading-5 text-foreground/60">
									Connect the wallet that holds eligible NFTs. We surface
									whitelisted collections automatically.
								</p>
							</div>
							<div className="flex items-start gap-3">
								<span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-success/30 bg-success/10 text-success">
									<ArrowUpTrayIcon className="h-4 w-4" />
								</span>
								<p className="text-xs leading-5 text-foreground/60">
									Appraise and deposit NFTs in a single flow, with instant
									feedback when treasury balances update.
								</p>
							</div>
						</div>
					</div>
				</Card>
			</motion.div>

			<NFTAvailabilitySection />
		</section>
	);
}
