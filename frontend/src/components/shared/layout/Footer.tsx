export function Footer() {
	return (
		<footer className="border-t border-white/10 bg-content1/20 backdrop-blur-xl py-20 shadow-inner">
			<div className="container mx-auto px-6 max-w-6xl">
				<div className="grid md:grid-cols-3 gap-12 text-center md:text-left">
					{/* Product Info */}
					<div className="space-y-4">
						<h2 className="text-xl font-semibold bg-gradient-to-r from-foreground to-warning bg-clip-text text-transparent">
							Spin-Fi Gacha
						</h2>
						<p className="text-foreground/70 font-light leading-relaxed">
							The future of fair NFT distribution. Every spin is provably random
							with complete transparency.
						</p>
					</div>

					{/* Features */}
					<div className="space-y-4">
						<h3 className="text-lg font-medium text-foreground">
							Why Choose Spin-Fi?
						</h3>
						<ul className="space-y-3 text-foreground/70">
							<li className="flex items-center justify-center md:justify-start gap-3">
								<div className="w-2 h-2 bg-warning rounded-full"></div>
								<span className="font-light">Provably Fair Randomness</span>
							</li>
							<li className="flex items-center justify-center md:justify-start gap-3">
								<div className="w-2 h-2 bg-warning rounded-full"></div>
								<span className="font-light">Transparent Rarity System</span>
							</li>
							<li className="flex items-center justify-center md:justify-start gap-3">
								<div className="w-2 h-2 bg-warning rounded-full"></div>
								<span className="font-light">Decentralized Infrastructure</span>
							</li>
						</ul>
					</div>

					{/* Call to Action */}
					<div className="space-y-6">
						<h3 className="text-lg font-medium text-foreground">
							Ready to Spin?
						</h3>
						<p className="text-foreground/70 font-light leading-relaxed">
							Experience the next generation of NFT gacha with complete fairness
							and transparency.
						</p>
						<div className="flex justify-center md:justify-start">
							<div className="bg-gradient-to-r from-warning/20 to-warning/20 backdrop-blur-xl border border-warning/30 rounded-xl px-4 py-2 shadow-lg">
								<span className="text-sm font-medium bg-gradient-to-r from-warning to-orange-400 bg-clip-text text-transparent">
									Start Spinning Today
								</span>
							</div>
						</div>
					</div>
				</div>

				{/* Bottom Section */}
				<div className="mt-16 pt-8 border-t border-white/10">
					<div className="flex flex-col md:flex-row justify-between items-center gap-4">
						<p className="text-foreground/60 font-light text-sm">
							© 2024 Spin-Fi. Built on blockchain technology.
						</p>
						<div className="flex items-center gap-6 text-foreground/60">
							<div className="flex items-center gap-2">
								<div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
								<span className="text-sm font-light">Live Network</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
}
