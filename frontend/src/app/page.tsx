"use client";

import {
	ArrowRightIcon,
	BoltIcon,
	GiftIcon,
	ShieldCheckIcon,
	SparklesIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
// Import streamlined landing components
import {
	HowItWorks,
	ScrollReveal,
	SubtleHeroBackground,
	TheWhySection,
	UserTypeCards,
} from "../components/landing";
import { SimpleRarityShowcase } from "../components/rarity";
import { glassBadge, glassCard } from "../lib/theme-config";
import { Button, Card } from "../ui";

export default function LandingPage() {
	return (
		<div className="min-h-screen bg-transparent">
			{/* Skip navigation link for accessibility */}
			<a
				href="#main-content"
				className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-warning text-black px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-warning/50 focus:ring-offset-2 focus:ring-offset-background"
			>
				Skip to main content
			</a>
			<main id="main-content">
				{/* ============================================ */}
				{/* SECTION 1: Simplified Hero */}
				{/* ============================================ */}
				<section
					id="hero"
					className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-20"
					aria-labelledby="hero-heading"
				>
					{/* Subtle Animated Background */}
					<SubtleHeroBackground />

					<div className="relative z-10 text-center max-w-6xl mx-auto">
						{/* WAVS Technology Badge */}
						<ScrollReveal delay={0.1}>
							<div className="mb-10">
								<a
									href="https://www.wavs.xyz"
									target="_blank"
									rel="noopener noreferrer"
									className={glassBadge({
										variant: "primary",
										size: "lg",
										className:
											"hover:border-warning/50 gap-3 px-5 py-2.5 rounded-2xl inline-flex items-center",
									})}
								>
									<BoltIcon className="w-5 h-5 text-warning" />
									<span className="text-warning font-semibold">
										Powered by WAVS
									</span>
								</a>
							</div>
						</ScrollReveal>

						{/* Main Headline */}
						<ScrollReveal delay={0.2}>
							<div className="mb-8">
								<h1
									id="hero-heading"
									className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight font-orbitron"
								>
									<span className="bg-gradient-to-r from-warning via-orange-400 to-yellow-500 bg-clip-text text-transparent drop-shadow-2xl">
										Fair Spins.
									</span>
									<br />
									<span className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground/90">
										Real Yield.
									</span>
								</h1>
							</div>
						</ScrollReveal>

						{/* Value Proposition - Simplified */}
						<ScrollReveal delay={0.3}>
							<p className="text-xl md:text-2xl text-foreground/80 mb-12 max-w-4xl mx-auto leading-relaxed font-medium">
								Everything verified on-chain.{" "}
								<span className="text-warning font-semibold">
									Zero manipulation. Zero trust required.
								</span>
							</p>
						</ScrollReveal>

						{/* User Type Cards */}
						<ScrollReveal delay={0.4}>
							<div className="mb-12">
								<UserTypeCards />
							</div>
						</ScrollReveal>
					</div>
				</section>

				{/* ============================================ */}
				{/* SECTION 2: The Why (Differentiators + Comparison) */}
				{/* ============================================ */}
				<TheWhySection />

				{/* ============================================ */}
				{/* SECTION 3: How It Works (3-step flows + Revenue) */}
				{/* ============================================ */}
				<HowItWorks />

				{/* ============================================ */}
				{/* SECTION 4: Rarity Showcase */}
				{/* ============================================ */}
				<section
					id="rarity-system"
					className="py-16 md:py-24 lg:py-32 px-4 relative bg-gradient-to-b from-content1/5 to-transparent"
					aria-labelledby="rarity-heading"
				>
					<div className="max-w-7xl mx-auto">
						<div className="text-center">
							<ScrollReveal>
								<h2 id="rarity-heading" className="sr-only">
									NFT Rarity System
								</h2>
								<SimpleRarityShowcase />
							</ScrollReveal>
						</div>
					</div>
				</section>

				{/* ============================================ */}
				{/* SECTION 5: Final CTA */}
				{/* ============================================ */}
				<section
					id="cta"
					className="py-16 md:py-24 lg:py-32 px-4 relative"
					aria-labelledby="cta-heading"
				>
					<div className="max-w-5xl mx-auto">
						<ScrollReveal>
							<Card
								className={glassCard({
									variant: "base",
									padding: "lg",
									className:
										"text-center rounded-3xl border-warning/30 shadow-2xl shadow-warning/10 bg-gradient-to-br from-content1/20 via-warning/5 to-content1/20",
								})}
							>
								{/* Icon */}
								<div className="w-20 h-20 mx-auto mb-8 bg-gradient-to-r from-warning via-orange-400 to-yellow-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-warning/40">
									<BoltIcon
										className="w-10 h-10 text-black"
										aria-hidden="true"
									/>
								</div>

								<h2
									id="cta-heading"
									className="text-4xl md:text-6xl font-black mb-6 font-orbitron"
								>
									<span className="bg-gradient-to-r from-warning via-orange-400 to-yellow-500 bg-clip-text text-transparent">
										Be Among the First
									</span>
								</h2>

								<p className="text-xl text-foreground/80 mb-12 max-w-3xl mx-auto leading-relaxed">
									Experience the future of provably fair gaming. Join us in
									pioneering cryptographic transparency in NFT gacha systems.
								</p>

								{/* CTAs */}
								<div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
									<Link href="/gacha/?id=graded-pokemon&section=spin">
										<Button
											color="glassPrimary"
											size="lg"
											className="min-w-56 sm:min-w-72 transition-transform duration-200 hover:scale-[1.02]"
										>
											<span className="flex items-center gap-3">
												<SparklesIcon className="w-6 h-6" aria-hidden="true" />
												Start Playing
												<ArrowRightIcon
													className="w-5 h-5"
													aria-hidden="true"
												/>
											</span>
										</Button>
									</Link>
									<Link href="/appraisal">
										<Button
											color="glass"
											size="lg"
											className="min-w-56 sm:min-w-72"
										>
											<span className="flex items-center gap-3">
												<GiftIcon className="w-6 h-6" aria-hidden="true" />
												Deposit & Earn
											</span>
										</Button>
									</Link>
								</div>

								{/* Trust Indicators */}
								<ul
									className="flex items-center justify-center gap-8 text-foreground/60"
									aria-label="Security features"
								>
									<li className="flex items-center gap-2">
										<ShieldCheckIcon
											className="w-5 h-5 text-success-400"
											aria-hidden="true"
										/>
										<span className="text-sm font-medium">WAVS Secured</span>
									</li>
									<li className="flex items-center gap-2">
										<BoltIcon
											className="w-5 h-5 text-warning"
											aria-hidden="true"
										/>
										<span className="text-sm font-medium">
											Cryptographically Verifiable
										</span>
									</li>
								</ul>
							</Card>
						</ScrollReveal>
					</div>
				</section>
			</main>
		</div>
	);
}
