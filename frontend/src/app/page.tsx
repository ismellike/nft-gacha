"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
	Button,
	Card,
	CardBody,
	CardHeader,
	Chip,
	Progress,
} from "@heroui/react";
import { useState } from "react";

export default function Home() {
	const [isSpinning, setIsSpinning] = useState(false);
	const [lastSpin, setLastSpin] = useState<string | null>(null);

	const handleSpin = async () => {
		setIsSpinning(true);
		// Simulate spin delay
		setTimeout(() => {
			setIsSpinning(false);
			setLastSpin("Epic NFT #1337");
		}, 3000);
	};

	const rarityStats = [
		{ name: "Common", percentage: 70, color: "default", count: 1247 },
		{ name: "Uncommon", percentage: 20, color: "primary", count: 892 },
		{ name: "Rare", percentage: 6, color: "secondary", count: 156 },
		{ name: "Epic", percentage: 3, color: "warning", count: 43 },
		{ name: "Legendary", percentage: 1, color: "danger", count: 7 },
	] as const;

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
			{/* Navigation */}
			<nav className="flex justify-between items-center p-6 backdrop-blur-md bg-black/20 border-b border-white/10">
				<div className="flex items-center space-x-2">
					<div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
						<span className="text-white font-bold text-lg">🎰</span>
					</div>
					<h1 className="text-2xl font-bold spin-gradient-text">Spin-Fi</h1>
				</div>
				<ConnectButton />
			</nav>

			<main className="container mx-auto px-6 py-12">
				{/* Hero Section */}
				<div className="text-center mb-16">
					<h1 className="text-6xl font-bold mb-6">
						<span className="spin-gradient-text">Provably Fair</span>
						<br />
						<span className="text-white">NFT Gacha</span>
					</h1>
					<p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
						Every spin is cryptographically guaranteed - no hidden algorithms,
						no manipulation, just pure chance backed by decentralized
						infrastructure.
					</p>
					<Chip
						color="success"
						variant="dot"
						size="lg"
						className="text-green-400 bg-green-400/10"
					>
						WAVS-DRAND Powered
					</Chip>
				</div>

				{/* Main Spin Section */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
					{/* Spin Controls */}
					<div className="lg:col-span-2">
						<Card className="spin-card-glow bg-black/40 border border-white/10">
							<CardHeader className="pb-4">
								<div className="flex justify-between items-center w-full">
									<h2 className="text-2xl font-semibold text-white">
										Gacha Spinner
									</h2>
									<Chip color="primary" variant="flat">
										Fee: 100 TOKENS
									</Chip>
								</div>
							</CardHeader>
							<CardBody className="py-8">
								<div className="flex flex-col items-center space-y-6">
									{/* Spinner Visual */}
									<div
										className={`w-48 h-48 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-yellow-500 p-1 ${isSpinning ? "spin-wobble" : "hover:scale-105 transition-transform"}`}
									>
										<div className="w-full h-full rounded-full bg-black/80 flex items-center justify-center">
											<span className="text-6xl">🎰</span>
										</div>
									</div>

									{/* Spin Button */}
									<Button
										size="lg"
										color="primary"
										variant="shadow"
										className="px-12 py-3 text-lg font-semibold spin-hover-glow"
										isLoading={isSpinning}
										onPress={handleSpin}
									>
										{isSpinning ? "Spinning..." : "SPIN NOW"}
									</Button>

									{/* Last Result */}
									{lastSpin && (
										<Card className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30">
											<CardBody className="py-3">
												<p className="text-center text-yellow-200">
													🎉 Last spin:{" "}
													<span className="font-bold">{lastSpin}</span>
												</p>
											</CardBody>
										</Card>
									)}
								</div>
							</CardBody>
						</Card>
					</div>

					{/* Rarity Breakdown */}
					<div>
						<Card className="bg-black/40 border border-white/10 h-full">
							<CardHeader>
								<h3 className="text-xl font-semibold text-white">Drop Rates</h3>
							</CardHeader>
							<CardBody className="space-y-4">
								{rarityStats.map((rarity) => (
									<div key={rarity.name} className="space-y-2">
										<div className="flex justify-between items-center">
											<Chip color={rarity.color} variant="flat" size="sm">
												{rarity.name}
											</Chip>
											<span className="text-sm text-gray-400">
												{rarity.percentage}% ({rarity.count} items)
											</span>
										</div>
										<Progress
											value={rarity.percentage}
											color={rarity.color}
											size="sm"
											className="max-w-full"
										/>
									</div>
								))}
							</CardBody>
						</Card>
					</div>
				</div>

				{/* Features Grid */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
					<Card className="bg-black/40 border border-white/10 spin-hover-glow">
						<CardHeader>
							<div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-2">
								<span className="text-2xl">🔒</span>
							</div>
							<h3 className="text-xl font-semibold text-white">
								Cryptographically Secure
							</h3>
						</CardHeader>
						<CardBody>
							<p className="text-gray-300">
								WAVS-DRAND provides verifiable randomness that cannot be
								manipulated or predicted.
							</p>
						</CardBody>
					</Card>

					<Card className="bg-black/40 border border-white/10 spin-hover-glow">
						<CardHeader>
							<div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-2">
								<span className="text-2xl">⚡</span>
							</div>
							<h3 className="text-xl font-semibold text-white">
								Instant Results
							</h3>
						</CardHeader>
						<CardBody>
							<p className="text-gray-300">
								Fast, efficient spins with immediate NFT delivery to your
								wallet.
							</p>
						</CardBody>
					</Card>

					<Card className="bg-black/40 border border-white/10 spin-hover-glow">
						<CardHeader>
							<div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center mb-2">
								<span className="text-2xl">💎</span>
							</div>
							<h3 className="text-xl font-semibold text-white">
								Curated Collections
							</h3>
						</CardHeader>
						<CardBody>
							<p className="text-gray-300">
								Premium NFT collections organized by rarity with transparent
								distribution.
							</p>
						</CardBody>
					</Card>
				</div>

				{/* Stats Section */}
				<Card className="bg-black/40 border border-white/10">
					<CardHeader>
						<h3 className="text-2xl font-semibold text-white text-center w-full">
							Platform Statistics
						</h3>
					</CardHeader>
					<CardBody>
						<div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
							<div>
								<p className="text-3xl font-bold spin-gradient-text">2,345</p>
								<p className="text-gray-400">Total NFTs</p>
							</div>
							<div>
								<p className="text-3xl font-bold spin-gradient-text">1,892</p>
								<p className="text-gray-400">Spins Completed</p>
							</div>
							<div>
								<p className="text-3xl font-bold spin-gradient-text">567</p>
								<p className="text-gray-400">Happy Users</p>
							</div>
							<div>
								<p className="text-3xl font-bold spin-gradient-text">99.9%</p>
								<p className="text-gray-400">Uptime</p>
							</div>
						</div>
					</CardBody>
				</Card>
			</main>

			{/* Footer */}
			<footer className="border-t border-white/10 backdrop-blur-md bg-black/20 py-8">
				<div className="container mx-auto px-6 text-center text-gray-400">
					<p>Built with ❤️ on the blockchain • Powered by WAVS-DRAND</p>
				</div>
			</footer>
		</div>
	);
}
