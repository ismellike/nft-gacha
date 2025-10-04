"use client";

import { SparklesIcon, BoltIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import GachaSpinner from "../GachaSpinner";
import { Card } from "../../ui";

interface SpinSectionProps {
	title: string;
	description: string;
}

export function SpinSection({ title, description }: SpinSectionProps) {
	return (
		<section className="space-y-8">
			<motion.div
				initial={{ opacity: 0, y: 12 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.45 }}
			>
				<Card className="relative overflow-hidden border border-white/10 bg-content1/30 p-6 backdrop-blur-2xl md:p-8">
					<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,200,87,0.18),_transparent_55%)]" />
					<div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
						<div className="max-w-2xl space-y-4">
							<div className="flex items-center gap-3 text-warning">
								<span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-warning/30 bg-warning/10">
									<SparklesIcon className="h-5 w-5" />
								</span>
								<span className="text-xs font-medium uppercase tracking-widest text-warning/70">
									Spin Flow
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
						<div className="flex w-full flex-col gap-3 rounded-2xl border border-white/10 bg-content1/40 p-4 text-sm text-foreground/80 shadow-inner md:w-auto md:min-w-[240px]">
							<div className="flex items-center gap-3">
								<span className="flex h-9 w-9 items-center justify-center rounded-xl border border-warning/30 bg-warning/10 text-warning">
									<BoltIcon className="h-4 w-4" />
								</span>
								<div className="flex flex-col">
									<span className="text-xs uppercase tracking-wide text-foreground/50">
										Primary Action
									</span>
									<span className="text-sm font-medium text-foreground">
										Spin & Reveal NFT
									</span>
								</div>
							</div>
							<p className="text-xs leading-5 text-foreground/60">
								Connect your wallet, approve the fee token once, and you will
								receive live feedback while the randomness request resolves.
							</p>
						</div>
					</div>
				</Card>
			</motion.div>

			<GachaSpinner />
		</section>
	);
}
