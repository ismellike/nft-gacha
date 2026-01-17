"use client";

import { motion } from "framer-motion";
import {
	MagnifyingGlassIcon,
	ClockIcon,
	CheckBadgeIcon,
	GiftIcon,
} from "@heroicons/react/24/outline";
import { Card } from "../../ui";

interface WorkflowStep {
	number: number;
	title: string;
	description: string;
	icon: React.ComponentType<{ className?: string }>;
}

const workflowSteps: WorkflowStep[] = [
	{
		number: 1,
		title: "Select an NFT",
		description: "Choose one from your wallet or paste contract address + token ID",
		icon: MagnifyingGlassIcon,
	},
	{
		number: 2,
		title: "Pay Appraisal Fee",
		description: "Small fee to cover metadata decoding and market analysis",
		icon: ClockIcon,
	},
	{
		number: 3,
		title: "Wait ~1 Minute",
		description: "Our AVS analyzes your NFT and posts the value on-chain",
		icon: CheckBadgeIcon,
	},
	{
		number: 4,
		title: "Deposit to Gacha",
		description: "Use your appraised NFT in the gacha system",
		icon: GiftIcon,
	},
];

export function AppraisalWorkflowGuide() {
	return (
		<Card className="p-6 bg-content1/20 backdrop-blur-xl border border-white/10 rounded-2xl">
			<div className="text-center mb-6">
				<h2 className="text-2xl font-semibold text-foreground mb-2">
					How Appraisal Works
				</h2>
				<p className="text-foreground/70 text-sm">
					Get your NFT valued and ready for gacha deposits in 4 simple steps
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				{workflowSteps.map((step, index) => {
					const Icon = step.icon;
					return (
						<motion.div
							key={step.number}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: index * 0.1 }}
							className="relative"
						>
							{/* Connector line (not on last item) */}
							{index < workflowSteps.length - 1 && (
								<div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-warning/50 to-transparent -translate-x-1/2" />
							)}

							<div className="bg-content1/30 backdrop-blur-xl border border-white/10 rounded-xl p-4 h-full">
								<div className="flex flex-col items-center text-center space-y-3">
									{/* Step number & icon */}
									<div className="relative">
										<div className="w-12 h-12 bg-gradient-to-br from-warning to-orange-400 rounded-xl flex items-center justify-center shadow-lg">
											<Icon className="w-6 h-6 text-white" />
										</div>
										<div className="absolute -top-2 -right-2 w-6 h-6 bg-content1 rounded-full flex items-center justify-center border-2 border-warning text-xs font-bold text-warning">
											{step.number}
										</div>
									</div>

									{/* Step text */}
									<div className="space-y-1">
										<h3 className="font-semibold text-foreground text-sm">
											{step.title}
										</h3>
										<p className="text-xs text-foreground/60 leading-relaxed">
											{step.description}
										</p>
									</div>
								</div>
							</div>
						</motion.div>
					);
				})}
			</div>

			{/* Additional info */}
			<div className="mt-6 pt-6 border-t border-white/10">
				<div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-foreground/70">
					<div className="flex items-center gap-2">
						<div className="w-2 h-2 rounded-full bg-success" />
						<span>No approval needed for returning users</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="w-2 h-2 rounded-full bg-info" />
						<span>Results posted on-chain within ~1 minute</span>
					</div>
				</div>
			</div>
		</Card>
	);
}
