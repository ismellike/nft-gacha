"use client";

import { motion } from "framer-motion";
import { glassCard } from "../../lib/theme-config";
import { Card, Chip } from "../../ui";

interface RevenueSplitVisualizationProps {
	className?: string;
}

export function RevenueSplitVisualization({
	className = "",
}: RevenueSplitVisualizationProps) {
	const contributorPercentage = 95;
	const protocolPercentage = 5;

	return (
		<div className={className}>
			<Card
				className={glassCard({
					variant: "base",
					padding: "lg",
					className: "rounded-3xl border-warning/20",
				})}
			>
				{/* Header */}
				<div className="text-center mb-8">
					<h3 className="text-2xl font-bold mb-2 text-foreground">
						Revenue Distribution
					</h3>
					<p className="text-foreground/70 text-sm">
						How spin fees are distributed between contributors and protocol
					</p>
				</div>

				{/* Donut Chart Visualization */}
				<div className="flex justify-center mb-8">
					<div className="relative w-64 h-64">
						<svg
							className="w-full h-full transform -rotate-90"
							viewBox="0 0 100 100"
							role="img"
							aria-label="Revenue split donut chart"
						>
							<title>Revenue distribution chart</title>
							{/* Background circle */}
							<circle
								cx="50"
								cy="50"
								r="40"
								fill="none"
								stroke="rgba(255, 255, 255, 0.1)"
								strokeWidth="20"
							/>

							{/* Protocol slice (5%) */}
							<motion.circle
								cx="50"
								cy="50"
								r="40"
								fill="none"
								stroke="url(#protocolGradient)"
								strokeWidth="20"
								strokeDasharray={`${2 * Math.PI * 40 * (protocolPercentage / 100)} ${2 * Math.PI * 40}`}
								initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
								animate={{ strokeDashoffset: 0 }}
								transition={{ duration: 1.5, ease: "easeOut" }}
							/>

							{/* Contributors slice (95%) */}
							<motion.circle
								cx="50"
								cy="50"
								r="40"
								fill="none"
								stroke="url(#contributorGradient)"
								strokeWidth="20"
								strokeDasharray={`${2 * Math.PI * 40 * (contributorPercentage / 100)} ${2 * Math.PI * 40}`}
								strokeDashoffset={
									-2 * Math.PI * 40 * (protocolPercentage / 100)
								}
								initial={{ strokeDashoffset: -2 * Math.PI * 40 }}
								animate={{
									strokeDashoffset:
										-2 * Math.PI * 40 * (protocolPercentage / 100),
								}}
								transition={{ duration: 1.5, ease: "easeOut" }}
							/>

							{/* Gradients */}
							<defs>
								<linearGradient
									id="contributorGradient"
									x1="0%"
									y1="0%"
									x2="100%"
									y2="100%"
								>
									<stop
										offset="0%"
										stopColor="rgb(251, 191, 36)"
										stopOpacity={0.8}
									/>
									<stop
										offset="100%"
										stopColor="rgb(251, 146, 60)"
										stopOpacity={0.9}
									/>
								</linearGradient>
								<linearGradient
									id="protocolGradient"
									x1="0%"
									y1="0%"
									x2="100%"
									y2="100%"
								>
									<stop
										offset="0%"
										stopColor="rgb(148, 163, 184)"
										stopOpacity={0.6}
									/>
									<stop
										offset="100%"
										stopColor="rgb(100, 116, 139)"
										stopOpacity={0.8}
									/>
								</linearGradient>
							</defs>
						</svg>

						{/* Center text */}
						<div className="absolute inset-0 flex items-center justify-center">
							<div className="text-center">
								<motion.div
									initial={{ scale: 0 }}
									animate={{ scale: 1 }}
									transition={{ delay: 0.5, duration: 0.5, type: "spring" }}
									className="text-4xl font-bold bg-gradient-to-r from-warning to-orange-400 bg-clip-text text-transparent"
								>
									95%
								</motion.div>
								<motion.p
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									transition={{ delay: 0.8 }}
									className="text-xs text-foreground/60 mt-1"
								>
									to Contributors
								</motion.p>
							</div>
						</div>
					</div>
				</div>

				{/* Legend */}
				<div className="space-y-4">
					{/* Contributors */}
					<motion.div
						initial={{ opacity: 0, x: -20 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
						transition={{ delay: 0.2 }}
						className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-warning/10 to-transparent border border-warning/20"
					>
						<div className="flex items-center gap-3">
							<div className="w-4 h-4 rounded-full bg-gradient-to-r from-warning to-orange-400" />
							<div>
								<p className="font-semibold text-foreground">Contributors</p>
								<p className="text-xs text-foreground/60">
									NFT depositors earning yield
								</p>
							</div>
						</div>
						<Chip color="warning" size="lg" className="rounded-full px-4 py-2">
							95%
						</Chip>
					</motion.div>

					{/* Protocol */}
					<motion.div
						initial={{ opacity: 0, x: -20 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
						transition={{ delay: 0.4 }}
						className="flex items-center justify-between p-4 rounded-xl bg-content1/10 border border-white/10"
					>
						<div className="flex items-center gap-3">
							<div className="w-4 h-4 rounded-full bg-gradient-to-r from-foreground/40 to-foreground/60" />
							<div>
								<p className="font-semibold text-foreground">Protocol</p>
								<p className="text-xs text-foreground/60">
									Development & sustainability
								</p>
							</div>
						</div>
						<Chip color="glass" size="lg" className="rounded-full px-4 py-2">
							5%
						</Chip>
					</motion.div>
				</div>

				{/* Explanation */}
				<div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-success/10 to-transparent border border-success/20">
					<p className="text-sm text-foreground/80 text-center">
						<span className="font-semibold text-success">
							Contributor-friendly:
						</span>{" "}
						This incentive structure aligns the protocol with NFT depositors,
						ensuring the majority of value flows back to the community.
					</p>
				</div>
			</Card>
		</div>
	);
}
