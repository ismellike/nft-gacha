"use client";

import { motion } from "framer-motion";
import RewardsDashboard from "../../components/RewardsDashboard";

export default function RewardsPage() {
	return (
		<div className="min-h-screen bg-background">
			<main className="container mx-auto px-4 py-16 max-w-7xl">
				{/* Hero Section */}
				<motion.div 
					className="text-center mb-16"
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
				>
					<h1 className="text-5xl md:text-6xl font-light mb-6 tracking-tight leading-tight">
						<span className="bg-gradient-to-r from-foreground to-warning bg-clip-text text-transparent font-extralight">
							Rewards
						</span>
						<br />
						<span className="text-foreground font-light">Dashboard</span>
					</h1>
					<p className="text-lg md:text-xl text-foreground/70 max-w-3xl mx-auto leading-relaxed font-light">
						Track your NFT deposits and accumulated rewards with complete transparency.
						<br className="hidden sm:block" />
						Every contribution earns dividends automatically distributed from spin fees.
					</p>
				</motion.div>

				{/* Dashboard Content */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3, duration: 0.6 }}
				>
					<RewardsDashboard />
				</motion.div>
			</main>
		</div>
	);
}