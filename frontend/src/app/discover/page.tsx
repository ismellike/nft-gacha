"use client";

import { motion } from "framer-motion";
import { PlusIcon } from "@heroicons/react/24/outline";
import {
	GlassCard,
	GlassBadge,
	GlassHeader,
	GachaCard,
} from "../../components/ui";
import { getAllActiveGachas } from "../../lib/gacha-config";

export default function DiscoverPage() {
	const gachas = getAllActiveGachas();

	return (
		<div className="min-h-screen bg-transparent">
			<div className="container mx-auto px-4 py-16 max-w-7xl">
				{/* Hero Section */}
				<GlassHeader
					title="Discover"
					subtitle="Card Collections"
					description="Explore our collection of provably fair trading card gacha systems. Each collection features authentic graded cards with transparent rarity mechanics."
					badges={[
						{ icon: "shield-check", text: "Provably Fair", variant: "success" },
						{ icon: "gem", text: "Authentic Graded Cards", variant: "primary" },
						{ icon: "trending", text: "Live Analytics", variant: "info" },
					]}
				>
					{/* Platform Stats */}
					<motion.div
						className="flex flex-wrap justify-center gap-8"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, delay: 0.4 }}
					>
						<div className="text-center">
							<div className="text-4xl font-bold text-warning mb-2">
								{gachas.length}
							</div>
							<div className="text-sm text-foreground/60 uppercase tracking-wide">
								Card Collections
							</div>
						</div>
						<div className="text-center">
							<div className="text-4xl font-bold text-warning mb-2">100%</div>
							<div className="text-sm text-foreground/60 uppercase tracking-wide">
								Provably Fair
							</div>
						</div>
						<div className="text-center">
							<div className="text-4xl font-bold text-warning mb-2">∞</div>
							<div className="text-sm text-foreground/60 uppercase tracking-wide">
								Possibilities
							</div>
						</div>
					</motion.div>
				</GlassHeader>

				{/* Gacha Grid */}
				<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-16">
					{gachas.map((gacha, index) => (
						<motion.div
							key={gacha.id}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: index * 0.1, duration: 0.6 }}
						>
							<GachaCard gacha={gacha} />
						</motion.div>
					))}
				</div>

				{/* Coming Soon Section */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4, duration: 0.6 }}
				>
					<GlassCard variant="base" padding="lg" className="text-center">
						<div className="space-y-6">
							<div className="w-16 h-16 mx-auto bg-gradient-to-br from-warning/20 to-orange-400/20 rounded-full flex items-center justify-center">
								<PlusIcon className="w-8 h-8 text-warning" />
							</div>
							<div>
								<h3 className="text-2xl font-medium text-foreground mb-3">
									More Card Collections Coming Soon
								</h3>
								<p className="text-foreground/70 max-w-2xl mx-auto">
									We're constantly adding new trading card gacha experiences
									with unique themes, mechanics, and card collections. Stay
									tuned for more exciting opportunities!
								</p>
							</div>
							<GlassBadge variant="info">🚀 Next Launch: Q2 2024</GlassBadge>
						</div>
					</GlassCard>
				</motion.div>
			</div>
		</div>
	);
}
