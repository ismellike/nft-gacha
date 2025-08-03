"use client";

import GachaSpinner from "../components/GachaSpinner";

export default function Home() {
	return (
		<div className="min-h-screen bg-background">
			<main className="container mx-auto px-4 py-16 max-w-7xl">
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
				</div>

				{/* Main Gacha Section */}
				<GachaSpinner />
			</main>
		</div>
	);
}
