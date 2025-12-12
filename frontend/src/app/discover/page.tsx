"use client";

import { motion } from "framer-motion";
import {
	PlusIcon,
	ChartBarIcon,
	ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { Card, Chip } from "../../ui";
import { GachaCard } from "../../components/GachaCard";
import { getAllActiveGachas } from "../../lib/gacha-config";

export default function DiscoverPage() {
	const gachas = getAllActiveGachas();

	return (
		<div className="min-h-screen bg-transparent">
			<div className="container mx-auto px-4 pt-16 pb-16 max-w-7xl">
				{/* Streamlined Header */}
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					className="text-center mb-12"
				>
					<div className="inline-flex items-center gap-2 px-4 py-2 bg-content1/10 backdrop-blur-sm rounded-full border border-white/20 mb-8">
						<ShieldCheckIcon className="w-4 h-4 text-warning" />
						<span className="text-sm font-medium text-foreground/80">
							Discover Collections
						</span>
					</div>

					<h1 className="text-5xl md:text-7xl font-black mb-6">
						<span className="bg-gradient-to-r from-warning via-orange-400 to-yellow-500 bg-clip-text text-transparent">
							Card Collections
						</span>
					</h1>

					<p className="text-xl text-foreground/80 max-w-3xl mx-auto leading-relaxed mb-8">
						Explore our collection of provably fair trading card gacha systems.
						Each collection features authentic graded cards with transparent
						rarity mechanics.
					</p>

					<div className="flex flex-wrap justify-center gap-3">
						{[
							{
								icon: <ShieldCheckIcon className="w-4 h-4" />,
								text: "Provably Fair",
							},
							{
								icon: <ChartBarIcon className="w-4 h-4" />,
								text: "Live Analytics",
							},
						].map((badge) => (
							<div
								key={badge.text}
								className="flex items-center gap-2 px-4 py-2 bg-content1/10 backdrop-blur-sm rounded-full border border-white/20"
							>
								<span className="text-warning">{badge.icon}</span>
								<span className="text-sm font-medium text-foreground/80">
									{badge.text}
								</span>
							</div>
						))}
					</div>
				</motion.div>

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
