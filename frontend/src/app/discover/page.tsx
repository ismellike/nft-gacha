"use client";

import { motion } from "framer-motion";
import { PlusIcon, ChartBarIcon } from "@heroicons/react/24/outline";
import { Card, Chip } from "../../components/ui";
import { GlassHeader, GachaCard } from "../../components/ui";
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
						{ icon: "trending", text: "Live Analytics", variant: "primary" },
					]}
				></GlassHeader>

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
					<Card className="text-center p-8 md:p-10 bg-content1/20 backdrop-blur-xl border border-warning/30 rounded-2xl shadow-xl shadow-warning/10">
						<div className="space-y-6">
							<div className="w-16 h-16 mx-auto bg-gradient-to-br from-warning/20 to-orange-400/20 rounded-full flex items-center justify-center">
								<PlusIcon className="w-8 h-8 text-warning" />
							</div>
							<div>
								<h3 className="text-2xl font-medium text-foreground mb-3">
									More Card Collections Coming Soon
								</h3>
								<p className="text-foreground/80 max-w-2xl mx-auto">
									We're constantly adding new trading card gacha experiences
									with unique themes, mechanics, and card collections. Stay
									tuned for more exciting opportunities!
								</p>
							</div>
							<Chip
								startContent={<ChartBarIcon className="w-4 h-4" />}
								className="px-3 py-2 bg-gradient-to-r from-warning/20 to-orange-400/20 border border-warning/30 text-warning rounded-xl backdrop-blur-xl"
							>
								New Drops Incoming
							</Chip>
						</div>
					</Card>
				</motion.div>
			</div>
		</div>
	);
}
