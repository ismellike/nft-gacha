"use client";

import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { glassCard } from "../../lib/theme-config";
import { Card } from "../../ui";
import { ScrollReveal } from "./ScrollReveal";

interface DifferentiatorCardProps {
	icon: React.ReactNode;
	title: string;
	description: string;
	delay: number;
}

function DifferentiatorCard({
	icon,
	title,
	description,
	delay,
}: DifferentiatorCardProps) {
	return (
		<ScrollReveal delay={delay}>
			<motion.div
				className="h-full"
				whileHover={{ y: -8 }}
				transition={{ duration: 0.2 }}
			>
				<Card
					className={glassCard({
						variant: "base",
						padding: "lg",
						className:
							"h-full rounded-3xl hover:border-warning/40 transition-all duration-300 bg-gradient-to-br from-content1/30 to-warning/5",
					})}
				>
					<div className="w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br from-warning/20 to-orange-400/20 flex items-center justify-center text-warning">
						{icon}
					</div>
					<h3 className="text-2xl font-bold mb-3 text-foreground">{title}</h3>
					<p className="text-foreground/70 leading-relaxed">{description}</p>
				</Card>
			</motion.div>
		</ScrollReveal>
	);
}

interface ComparisonItem {
	feature: string;
	traditional: boolean;
	spinfi: boolean;
	details?: string;
}

// Condensed to 5 rows (was 7)
const comparisonData: ComparisonItem[] = [
	{
		feature: "Provably Fair Randomness",
		traditional: false,
		spinfi: true,
		details: "DRAND cryptographic randomness",
	},
	{
		feature: "On-Chain Verification",
		traditional: false,
		spinfi: true,
		details: "Every spin publicly verifiable",
	},
	{
		feature: "Transparent Odds",
		traditional: false,
		spinfi: true,
		details: "Dynamic odds based on inventory",
	},
	{
		feature: "Contributor Yield",
		traditional: false,
		spinfi: true,
		details: "Earn 95% of spin fees",
	},
	{
		feature: "Hidden Manipulation",
		traditional: true,
		spinfi: false,
		details: "Black box algorithms",
	},
];

interface TheWhySectionProps {
	className?: string;
}

/**
 * TheWhySection - Merges "Why Different" + "Features" into one focused section.
 * Shows 3 key differentiators + condensed comparison table (5 rows instead of 7).
 */
export function TheWhySection({ className = "" }: TheWhySectionProps) {
	return (
		<section
			id="why"
			className={`py-16 md:py-24 lg:py-32 px-4 relative bg-gradient-to-b from-content1/5 to-transparent ${className}`}
			aria-labelledby="why-heading"
		>
			<div className="max-w-7xl mx-auto">
				{/* Section Header */}
				<div className="text-center mb-16">
					<ScrollReveal>
						<h2
							id="why-heading"
							className="text-3xl sm:text-4xl md:text-6xl font-black mb-6"
						>
							<span className="bg-gradient-to-r from-warning via-orange-400 to-yellow-500 bg-clip-text text-transparent">
								Why This is Different
							</span>
						</h2>
						<p className="text-xl text-foreground/80 max-w-3xl mx-auto">
							Traditional gacha systems operate in black boxes. We bring
							everything on-chain with cryptographic proof.
						</p>
					</ScrollReveal>
				</div>

				{/* 3 Key Differentiators */}
				<div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-12 sm:mb-16 max-w-6xl mx-auto">
					<DifferentiatorCard
						icon={
							<svg
								className="w-8 h-8"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								aria-label="Shield icon"
							>
								<title>Security shield</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
								/>
							</svg>
						}
						title="Provably Fair"
						description="Cryptographic randomness from DRAND ensures every spin is verifiably random and tamper-proof."
						delay={0.1}
					/>
					<DifferentiatorCard
						icon={
							<svg
								className="w-8 h-8"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								aria-label="Currency coin icon"
							>
								<title>Yield coin</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
						}
						title="95% Contributor Yield"
						description="NFT depositors earn 95% of all spin fees as passive income. The protocol takes only 5%."
						delay={0.2}
					/>
					<DifferentiatorCard
						icon={
							<svg
								className="w-8 h-8"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								aria-label="Eye icon"
							>
								<title>Transparent visibility</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
								/>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
								/>
							</svg>
						}
						title="Zero Trust Required"
						description="Everything is on-chain. Verify randomness, appraisals, and payouts directly on the blockchain."
						delay={0.3}
					/>
				</div>

				{/* Condensed Comparison Table */}
				<div className="max-w-5xl mx-auto">
					<ScrollReveal delay={0.4}>
						<Card
							className={glassCard({
								variant: "base",
								padding: "lg",
								className: "rounded-3xl border-warning/20 overflow-hidden",
							})}
						>
							{/* Header */}
							<div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-white/10">
								<div className="text-left">
									<h4 className="text-xs sm:text-lg font-semibold text-foreground/80">
										Feature
									</h4>
								</div>
								<div className="text-center">
									<h4 className="text-xs sm:text-lg font-semibold text-foreground/60">
										Traditional
									</h4>
								</div>
								<div className="text-center">
									<h4 className="text-xs sm:text-xl font-bold bg-gradient-to-r from-warning to-orange-400 bg-clip-text text-transparent">
										SPINFI
									</h4>
								</div>
							</div>

							{/* Comparison Items */}
							<div className="space-y-3">
								{comparisonData.map((item, index) => (
									<motion.div
										key={item.feature}
										className="grid grid-cols-3 gap-2 sm:gap-4 items-center p-2 sm:p-3 rounded-xl transition-all duration-200 hover:bg-content1/10"
										whileHover={{ scale: 1.01 }}
										initial={{ opacity: 0, y: 20 }}
										whileInView={{ opacity: 1, y: 0 }}
										viewport={{ once: true }}
										transition={{ delay: 0.5 + index * 0.1 }}
									>
										{/* Feature Name */}
										<div>
											<p className="text-xs sm:text-sm font-medium text-foreground mb-1">
												{item.feature}
											</p>
											{item.details && (
												<p className="text-xs text-foreground/60">
													{item.details}
												</p>
											)}
										</div>

										{/* Traditional */}
										<div className="flex justify-center">
											{item.traditional ? (
												<div className="w-8 h-8 rounded-full bg-danger/20 flex items-center justify-center">
													<XMarkIcon className="w-5 h-5 text-danger" />
												</div>
											) : item.spinfi ? (
												<div className="w-8 h-8 rounded-full bg-content1/20 flex items-center justify-center">
													<XMarkIcon className="w-5 h-5 text-foreground/40" />
												</div>
											) : (
												<div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center">
													<CheckIcon className="w-5 h-5 text-success" />
												</div>
											)}
										</div>

										{/* SPINFI */}
										<div className="flex justify-center">
											{item.spinfi ? (
												<motion.div
													className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center"
													animate={{
														boxShadow: [
															"0 0 0px rgba(34, 197, 94, 0.3)",
															"0 0 15px rgba(34, 197, 94, 0.5)",
															"0 0 0px rgba(34, 197, 94, 0.3)",
														],
													}}
													transition={{
														duration: 2,
														repeat: Number.POSITIVE_INFINITY,
														delay: index * 0.2,
													}}
												>
													<CheckIcon className="w-5 h-5 text-success" />
												</motion.div>
											) : (
												<div className="w-8 h-8 rounded-full bg-content1/20 flex items-center justify-center">
													<XMarkIcon className="w-5 h-5 text-foreground/40" />
												</div>
											)}
										</div>
									</motion.div>
								))}
							</div>

							{/* Footer Note */}
							<div className="mt-6 pt-6 border-t border-white/10 text-center">
								<p className="text-sm text-foreground/60">
									<span className="text-warning font-semibold">
										Zero trust required
									</span>
									{" - "}Verify everything on-chain
								</p>
							</div>
						</Card>
					</ScrollReveal>
				</div>
			</div>
		</section>
	);
}
