"use client";

import { motion } from "framer-motion";
import { RevenueSplitVisualization } from "./RevenueSplitVisualization";
import { ScrollReveal } from "./ScrollReveal";

interface StepProps {
	stepNumber: number;
	title: string;
	description: string;
	delay: number;
}

function Step({ stepNumber, title, description, delay }: StepProps) {
	return (
		<ScrollReveal delay={delay}>
			<motion.div
				className="relative"
				initial={{ opacity: 0, y: 30 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true }}
				transition={{ duration: 0.5, delay }}
			>
				{/* Step Number Badge */}
				<div className="w-16 h-16 rounded-2xl bg-warning flex items-center justify-center mb-6 shadow-lg shadow-warning/30">
					<span className="text-2xl font-black text-black">{stepNumber}</span>
				</div>

				{/* Content */}
				<h3 className="text-xl font-bold mb-2 text-foreground">{title}</h3>
				<p className="text-foreground/70 leading-relaxed">{description}</p>

				{/* Arrow (except for last step) */}
				{stepNumber < 3 && (
					<div className="hidden md:block absolute top-8 left-20 w-full h-0.5 bg-gradient-to-r from-warning/50 to-transparent" />
				)}
			</motion.div>
		</ScrollReveal>
	);
}

interface HowItWorksProps {
	className?: string;
}

/**
 * HowItWorks - Merges Economic Model + Technology into simple 3-step flows.
 * Shows revenue donut chart + minimal user journey for Players and Contributors.
 */
export function HowItWorks({ className = "" }: HowItWorksProps) {
	return (
		<section
			id="how-it-works"
			className={`py-16 md:py-24 lg:py-32 px-4 relative ${className}`}
			aria-labelledby="how-heading"
		>
			<div className="max-w-7xl mx-auto">
				{/* Section Header */}
				<div className="text-center mb-16">
					<ScrollReveal>
						<h2
							id="how-heading"
							className="text-3xl sm:text-4xl md:text-6xl font-black mb-6"
						>
							<span className="bg-gradient-to-r from-warning via-orange-400 to-yellow-500 bg-clip-text text-transparent">
								How It Works
							</span>
						</h2>
						<p className="text-xl text-foreground/80 max-w-3xl mx-auto">
							Simple paths to play and earn
						</p>
					</ScrollReveal>
				</div>

				<div className="grid lg:grid-cols-2 gap-12 items-start mb-16">
					{/* For Players */}
					<div>
						<ScrollReveal>
							<div className="flex items-center gap-3 mb-8">
								<div className="w-12 h-12 rounded-xl bg-gradient-to-br from-warning/20 to-orange-400/20 flex items-center justify-center">
									<svg
										className="w-6 h-6 text-warning"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										aria-label="Happy face icon"
									>
										<title>Happy player</title>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
										/>
									</svg>
								</div>
								<h3 className="text-2xl font-bold text-foreground">
									For Players
								</h3>
							</div>
						</ScrollReveal>

						<div className="space-y-8 md:space-y-0 md:grid md:grid-cols-3 md:gap-6">
							<Step
								stepNumber={1}
								title="Connect Wallet"
								description="Link your Web3 wallet to get started"
								delay={0.1}
							/>
							<Step
								stepNumber={2}
								title="Spin & Win"
								description="Provably fair gacha with verified randomness"
								delay={0.2}
							/>
							<Step
								stepNumber={3}
								title="Get NFTs"
								description="Instant reveal with on-chain verification"
								delay={0.3}
							/>
						</div>
					</div>

					{/* For Contributors */}
					<div>
						<ScrollReveal delay={0.2}>
							<div className="flex items-center gap-3 mb-8">
								<div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400/20 to-yellow-500/20 flex items-center justify-center">
									<svg
										className="w-6 h-6 text-orange-400"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										aria-label="Currency coin icon"
									>
										<title>Money earnings</title>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
										/>
									</svg>
								</div>
								<h3 className="text-2xl font-bold text-foreground">
									For Contributors
								</h3>
							</div>
						</ScrollReveal>

						<div className="space-y-8 md:space-y-0 md:grid md:grid-cols-3 md:gap-6">
							<Step
								stepNumber={1}
								title="Deposit NFTs"
								description="Add your NFTs to the treasury pool"
								delay={0.3}
							/>
							<Step
								stepNumber={2}
								title="Earn 95%"
								description="Receive 95% of all spin fees automatically"
								delay={0.4}
							/>
							<Step
								stepNumber={3}
								title="Passive Income"
								description="Watch your yield grow automatically"
								delay={0.5}
							/>
						</div>
					</div>
				</div>

				{/* Revenue Split Visualization */}
				<div className="max-w-3xl mx-auto">
					<ScrollReveal delay={0.6}>
						<RevenueSplitVisualization />
					</ScrollReveal>
				</div>
			</div>
		</section>
	);
}
