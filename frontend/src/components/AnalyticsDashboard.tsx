"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { GlassCard, GlassButton } from "./ui";
import TreasuryAnalytics from "./TreasuryAnalytics";
import TreasuryItemsExplorer from "./TreasuryItemsExplorer";
import SpinHistory from "./SpinHistory";

type AnalyticsView = "treasury" | "items" | "history";

export default function AnalyticsDashboard() {
	const [activeView, setActiveView] = useState<AnalyticsView>("treasury");

	const views = [
		{
			id: "treasury" as const,
			label: "Treasury Stats",
			icon: "trending",
			description: "Pool analytics and value metrics",
		},
		{
			id: "items" as const,
			label: "Browse Items",
			icon: "gem",
			description: "Explore NFTs in the treasury",
		},
		{
			id: "history" as const,
			label: "Spin History",
			icon: "clock",
			description: "Your gacha spin records",
		},
	];

	return (
		<div className="space-y-8">
			{/* Navigation */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6 }}
			>
				<GlassCard variant="base" className="p-4">
					<div className="flex flex-col sm:flex-row gap-3">
						{views.map((view) => (
							<GlassButton
								key={view.id}
								variant={activeView === view.id ? "primary" : "secondary"}
								size="md"
								onClick={() => setActiveView(view.id)}
								className="flex-1 sm:flex-initial flex items-center justify-center sm:justify-start gap-2 min-w-0"
								animate={true}
								startIcon={view.icon}
							>
								<div className="text-left min-w-0">
									<div className="font-medium text-sm truncate">
										{view.label}
									</div>
									<div className="text-xs text-current/70 hidden sm:block truncate">
										{view.description}
									</div>
								</div>
							</GlassButton>
						))}
					</div>
				</GlassCard>
			</motion.div>

			{/* View Content */}
			<motion.div
				key={activeView}
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4 }}
			>
				{activeView === "treasury" && <TreasuryAnalytics />}
				{activeView === "items" && <TreasuryItemsExplorer />}
				{activeView === "history" && <SpinHistory />}
			</motion.div>
		</div>
	);
}
