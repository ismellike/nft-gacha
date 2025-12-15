"use client";

import { Card, Button } from "../ui";
import Link from "next/link";
import {
	BoltIcon,
	SparklesIcon,
	ShieldCheckIcon,
	GiftIcon,
	ArrowRightIcon,
	CpuChipIcon,
	FingerPrintIcon,
	ChartBarIcon,
} from "@heroicons/react/24/outline";
import { SimpleRarityShowcase } from "../components/RaritySystem";
import { getRarityColorHex, Rarity } from "../lib/rarityConfig";

// Helper function to create radial gradient with concrete hex values
const createRarityGradient = (rarity: Rarity): string => {
	const colorHex = getRarityColorHex(rarity, 500); // Use 500 shade for main color
	const colorWithAlpha = `${colorHex}14`; // Add 8% alpha (0.14 in hex)
	return `radial-gradient(circle, ${colorWithAlpha} 0%, transparent 70%)`;
};

// Core value propositions - consolidated and refined
const valueProps = [
	{
		icon: <CpuChipIcon className="w-8 h-8" />,
		title: "WAVS-Powered Randomness",
		description:
			"Enterprise-grade verifiable randomness with on-chain cryptographic proofs",
		highlight: "No Manipulation Possible",
	},
	{
		icon: <FingerPrintIcon className="w-8 h-8" />,
		title: "Automated Appraisals",
		description:
			"WAVS components provide instant, verified card valuations on-chain",
		highlight: "Real-time Fair Market Value",
	},
	{
		icon: <ShieldCheckIcon className="w-8 h-8" />,
		title: "100% Transparent Treasury",
		description:
			"Every deposit, spin, and reward is publicly verifiable on-chain",
		highlight: "Zero Black Boxes",
	},
];

// Simplified user journey
const userFlow = [
	{
		title: "Deposit NFTs",
		description:
			"Contribute graded cards to the treasury and earn yield from every spin",
		benefit: "Passive income stream",
	},
	{
		title: "Spin & Win",
		description: "Use WAVS-verified randomness to pull cards at true odds",
		benefit: "Guaranteed fair outcomes",
	},
	{
		title: "Verify Everything",
		description: "Check cryptographic proofs for every spin and transaction",
		benefit: "Complete transparency",
	},
];

export default function LandingPage() {
	const rarities = [Rarity.Common, Rarity.Uncommon, Rarity.Rare]; // Use enum values for clarity

	return (
		<div className="min-h-screen bg-transparent">
			{/* Skip navigation link for accessibility */}
			<a
				href="#main-content"
				className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-warning text-black px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-black"
			>
				Skip to main content
			</a>
			<main id="main-content">
				{/* Hero Section - Streamlined & Impactful */}
				<section
					id="hero"
					className="relative min-h-screen flex items-center justify-center overflow-hidden px-4"
					aria-labelledby="hero-heading"
				>
					{/* Subtle Animated Background */}
					<div className="absolute inset-0 opacity-30" aria-hidden="true">
						{rarities.slice(0, 3).map((rarity, i) => {
							return (
								<div
									key={rarity}
									className="absolute w-[600px] h-[600px] rounded-full"
									style={{
										background: createRarityGradient(rarity),
										left: `${25 + i * 20}%`,
										top: `${20 + i * 15}%`,
									}}
								/>
							);
						})}
					</div>

					<div className="relative z-10 text-center max-w-6xl mx-auto">
						{/* WAVS Technology Badge */}
						<div className="mb-12">
							<a
								href="https://www.wavs.xyz"
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-3 px-5 py-2.5 bg-gradient-to-r from-warning/10 via-orange-400/5 to-warning/10 backdrop-blur-xl border border-warning/30 rounded-2xl hover:border-warning/50 transition-all duration-300"
							>
								<CpuChipIcon className="w-5 h-5 text-warning" />
								<span className="text-warning font-semibold">
									Powered by WAVS
								</span>
							</a>
						</div>

						{/* Main Headline - More Impactful */}
						<div className="mb-8">
							<h1
								id="hero-heading"
								className="text-6xl md:text-8xl lg:text-9xl font-black mb-6 leading-tight font-orbitron"
							>
								<span className="bg-gradient-to-r from-warning via-orange-400 to-yellow-500 bg-clip-text text-transparent drop-shadow-2xl">
									Provably Fair
								</span>
								<br />
								<span className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground/90">
									Gacha Protocol
								</span>
							</h1>
						</div>

						{/* Refined Value Proposition */}
						<p className="text-xl md:text-2xl text-foreground/80 mb-16 max-w-4xl mx-auto leading-relaxed font-medium">
							Verifiably fair randomness and automated appraisals powered by
							WAVS components.
							<br className="hidden md:block" />
							<span className="text-warning font-semibold">
								No manipulation. No black boxes. Just cryptographic proof.
							</span>
						</p>

						{/* Primary CTA */}
						<nav
							className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20"
							aria-label="Primary navigation"
						>
							<Link
								href="/gacha/?id=graded-pokemon&section=spin"
								aria-describedby="play-description"
							>
								<Button
									color="glassPrimary"
									size="lg"
									className="min-w-64 sm:min-w-80 transition-transform duration-200 hover:scale-[1.02]"
								>
									<span className="flex items-center gap-3">
										<SparklesIcon className="w-6 h-6" aria-hidden="true" />
										Experience Fair Gaming
										<ArrowRightIcon className="w-5 h-5" aria-hidden="true" />
									</span>
								</Button>
							</Link>
							<div id="play-description" className="sr-only">
								Start playing provably fair NFT gacha games with WAVS-powered
								randomness
							</div>

							<Link href="/appraisal" aria-describedby="deposit-description">
								<Button
									color="glass"
									size="lg"
									className="min-w-64 sm:min-w-80"
								>
									<span className="flex items-center gap-3">
										<GiftIcon className="w-6 h-6" aria-hidden="true" />
										Deposit & Earn Yield
									</span>
								</Button>
							</Link>
							<div id="deposit-description" className="sr-only">
								Deposit your NFTs to earn yield from the gacha protocol treasury
							</div>
						</nav>

						{/* Quick Trust Signals */}
						<ul
							className="flex flex-wrap justify-center gap-6"
							aria-label="Trust indicators"
						>
							{[
								{
									id: "wavs-secured",
									icon: (
										<ShieldCheckIcon className="w-5 h-5" aria-hidden="true" />
									),
									text: "WAVS Secured",
								},
								{
									id: "on-chain-verifiable",
									icon: (
										<FingerPrintIcon className="w-5 h-5" aria-hidden="true" />
									),
									text: "On-Chain Verifiable",
								},
								{
									id: "automated-appraisals",
									icon: <ChartBarIcon className="w-5 h-5" aria-hidden="true" />,
									text: "Automated Appraisals",
								},
							].map((signal) => (
								<li
									key={signal.id}
									className="flex items-center gap-2 px-4 py-2 bg-content1/10 backdrop-blur-sm rounded-full border border-white/20"
								>
									<span className="text-warning">{signal.icon}</span>
									<span className="text-sm font-medium text-foreground/80">
										{signal.text}
									</span>
								</li>
							))}
						</ul>
					</div>
				</section>

				{/* Technology Deep Dive */}
				<section
					id="technology"
					className="py-32 px-4 relative bg-gradient-to-b from-content1/5 to-transparent"
					aria-labelledby="tech-heading"
				>
					<div className="max-w-7xl mx-auto">
						<div className="text-center mb-20">
							<h2
								id="tech-heading"
								className="text-5xl md:text-7xl font-black mb-6"
							>
								<span className="bg-gradient-to-r from-warning via-orange-400 to-yellow-500 bg-clip-text text-transparent">
									WAVS Technology
								</span>
							</h2>
							<p className="text-xl text-foreground/80 max-w-4xl mx-auto leading-relaxed font-medium">
								Enterprise-grade infrastructure providing verifiable randomness
								and automated appraisals
							</p>
						</div>

						<div className="grid lg:grid-cols-3 gap-12">
							{valueProps.map((prop) => (
								<div key={prop.title}>
									<Card className="h-full p-10 text-center bg-content1/10 backdrop-blur-xl border border-white/10 rounded-3xl hover:border-warning/30 transition-all duration-500 group">
										{/* Icon Container */}
										<div className="w-20 h-20 mx-auto mb-8 bg-gradient-to-br from-warning/20 via-orange-400/10 to-warning/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
											<div className="text-warning">{prop.icon}</div>
										</div>

										{/* Content */}
										<div>
											<h3 className="text-2xl font-bold text-foreground mb-4">
												{prop.title}
											</h3>
											<p className="text-foreground/80 leading-relaxed text-lg mb-6">
												{prop.description}
											</p>
											<div className="inline-flex px-4 py-2 bg-gradient-to-r from-warning/20 to-orange-400/20 rounded-xl border border-warning/30">
												<span className="text-warning font-semibold text-sm">
													{prop.highlight}
												</span>
											</div>
										</div>
									</Card>
								</div>
							))}
						</div>
					</div>
				</section>

				{/* User Journey */}
				<section
					id="how-it-works"
					className="py-32 px-4 relative text-foreground"
					aria-labelledby="journey-heading"
				>
					<div className="max-w-6xl mx-auto">
						<div className="text-center mb-20">
							<h2
								id="journey-heading"
								className="text-5xl md:text-7xl font-black mb-6 text-foreground"
							>
								How It Works
							</h2>
							<p className="text-xl text-foreground/80 max-w-3xl mx-auto leading-relaxed font-medium">
								Three steps to transparent, verifiable gaming
							</p>
						</div>

						<div className="grid md:grid-cols-3 gap-8">
							{userFlow.map((step, index) => (
								<div key={step.title} className="relative">
									{/* Step Number */}
									<div className="absolute -top-2 -left-2 w-10 h-10 bg-gradient-to-r from-warning to-orange-400 rounded-full flex items-center justify-center text-black font-bold text-sm shadow-lg z-10">
										{index + 1}
									</div>

									<Card className="h-full p-8 bg-content1/20 backdrop-blur-xl border border-white/10 rounded-2xl hover:border-warning/30 transition-all duration-300">
										<h3 className="text-xl font-bold text-foreground mb-4">
											{step.title}
										</h3>
										<p className="text-foreground/80 leading-relaxed mb-4">
											{step.description}
										</p>
										<div className="text-sm font-semibold text-warning bg-warning/10 px-3 py-1.5 rounded-lg">
											{step.benefit}
										</div>
									</Card>

									{/* Connection Line */}
									{index < userFlow.length - 1 && (
										<div className="hidden md:block absolute top-8 -right-4 w-8 h-0.5 bg-gradient-to-r from-warning/50 to-transparent" />
									)}
								</div>
							))}
						</div>
					</div>
				</section>

				{/* Simple Rarity Showcase */}
				<section
					id="rarity-system"
					className="py-24 px-4 relative"
					aria-labelledby="rarity-heading"
				>
					<div className="max-w-7xl mx-auto">
						<h2 id="rarity-heading" className="sr-only">
							NFT Rarity System
						</h2>
						<SimpleRarityShowcase />
					</div>
				</section>

				{/* Final CTA - Streamlined */}
				<section
					id="cta"
					className="py-32 px-4 relative"
					aria-labelledby="cta-heading"
				>
					<div className="max-w-5xl mx-auto">
						<Card className="p-16 text-center bg-gradient-to-br from-content1/20 via-content1/10 to-content1/20 backdrop-blur-xl border border-warning/30 rounded-3xl shadow-2xl shadow-warning/10">
							<div className="w-20 h-20 mx-auto mb-8 bg-gradient-to-r from-warning via-orange-400 to-yellow-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-warning/40">
								<BoltIcon className="w-10 h-10 text-black" aria-hidden="true" />
							</div>

							<h2
								id="cta-heading"
								className="text-4xl md:text-6xl font-black mb-6 font-orbitron"
							>
								<span className="bg-gradient-to-r from-warning via-orange-400 to-yellow-500 bg-clip-text text-transparent">
									Experience True Fairness
								</span>
							</h2>

							<p className="text-xl text-foreground/80 mb-12 max-w-3xl mx-auto leading-relaxed">
								Join the protocol where every spin is verifiable and every
								reward is transparent.
							</p>

							<div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
								<Link
									href="/gacha/?id=graded-pokemon&section=spin"
									aria-label="Start playing provably fair gacha games"
								>
									<Button
										color="glassPrimary"
										size="lg"
										className="min-w-56 sm:min-w-72 transition-transform duration-200 hover:scale-[1.02]"
									>
										<span className="flex items-center gap-3">
											<SparklesIcon className="w-6 h-6" aria-hidden="true" />
											Start Playing
											<ArrowRightIcon className="w-5 h-5" aria-hidden="true" />
										</span>
									</Button>
								</Link>
							</div>

							{/* Trust Indicators */}
							<ul
								className="flex items-center justify-center gap-8 mt-12 text-foreground/60"
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
									<FingerPrintIcon
										className="w-5 h-5 text-warning"
										aria-hidden="true"
									/>
									<span className="text-sm font-medium">
										Cryptographically Verifiable
									</span>
								</li>
							</ul>
						</Card>
					</div>
				</section>
			</main>
		</div>
	);
}
