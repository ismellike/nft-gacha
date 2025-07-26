"use client";

import GachaSpinner from "../components/GachaSpinner";

export default function Home() {
	return (
		<div className="min-h-screen bg-background">
			<main className="container mx-auto px-6 py-16">
				{/* Hero Section */}
				<div className="text-center mb-24">
					<h1 className="text-6xl md:text-7xl font-light mb-10 tracking-tight leading-tight">
						<span className="bg-gradient-to-r from-foreground to-warning bg-clip-text text-transparent font-extralight">
							Provably Fair
						</span>
						<br />
						<span className="text-foreground font-light">NFT Gacha</span>
					</h1>
					<p className="text-xl md:text-2xl text-foreground/70 max-w-4xl mx-auto mb-12 leading-relaxed font-light">
						Every spin is cryptographically guaranteed with elegant simplicity.
						<br className="hidden sm:block" />
						No hidden algorithms, no manipulation—just pure randomness backed by
						decentralized infrastructure.
					</p>
					<div className="relative group inline-block">
						<div className="absolute inset-0 bg-gradient-to-r from-warning/20 to-orange-500/20 rounded-full blur-lg opacity-50 group-hover:opacity-100 transition-all duration-300"></div>
						<div className="relative bg-gradient-to-r from-warning/10 to-orange-500/10 backdrop-blur-xl border border-warning/30 rounded-full px-6 py-3 shadow-xl">
							<div className="flex items-center space-x-3">
								<div className="w-6 h-6 bg-gradient-to-br from-warning to-orange-400 rounded-full flex items-center justify-center">
									<span className="text-xs font-bold text-black">⚡</span>
								</div>
								<span className="text-base font-semibold bg-gradient-to-r from-warning to-orange-400 bg-clip-text text-transparent tracking-wide">
									WAVS-DRAND Powered
								</span>
								<div className="w-2 h-2 bg-warning rounded-full animate-pulse"></div>
							</div>
						</div>
					</div>
				</div>

				{/* Main Spin Section */}
				<GachaSpinner />
			</main>
		</div>
	);
}
