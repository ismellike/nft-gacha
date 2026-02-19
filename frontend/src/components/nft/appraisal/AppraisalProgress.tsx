import {
	CheckBadgeIcon,
	CpuChipIcon,
	CurrencyDollarIcon,
	MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

type AppraisalStage =
	| "validating"
	| "decoding"
	| "fetching"
	| "appraising"
	| "complete";

interface AppraisalProgressProps {
	appraisalElapsed: number;
	currentStage: AppraisalStage;
}

const STAGES = [
	{ key: "validating", label: "Validating NFT", icon: CheckBadgeIcon },
	{ key: "decoding", label: "Decoding Metadata", icon: CpuChipIcon },
	{
		key: "fetching",
		label: "Fetching Market Data",
		icon: MagnifyingGlassIcon,
	},
	{
		key: "appraising",
		label: "Calculating Appraisal",
		icon: CurrencyDollarIcon,
	},
] as const;

const STAGE_ORDER: AppraisalStage[] = [
	"validating",
	"decoding",
	"fetching",
	"appraising",
];

export function AppraisalProgress({
	appraisalElapsed,
	currentStage,
}: AppraisalProgressProps) {
	const stageIndex = STAGE_ORDER.indexOf(currentStage);

	return (
		<motion.div
			initial={{ scale: 0.8, opacity: 0 }}
			animate={{ scale: 1, opacity: 1 }}
			className="space-y-6"
		>
			<div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto">
				<motion.div
					animate={{ rotate: 360 }}
					transition={{
						duration: 2,
						repeat: Infinity,
						ease: "linear",
					}}
				>
					<CpuChipIcon className="w-10 h-10 text-white" />
				</motion.div>
			</div>
			<h2 className="text-2xl font-semibold text-foreground">
				AVS Processing...
			</h2>
			<p className="text-foreground/70">
				Decoding metadata and querying external APIs for market data
			</p>

			{/* Timer Display */}
			<div className="bg-content1/20 rounded-xl p-4 text-center">
				<p className="text-sm text-foreground/60 mb-1">Time Elapsed</p>
				<p className="text-2xl font-mono font-bold text-warning">
					{Math.floor(appraisalElapsed / 60000)}:
					{Math.floor((appraisalElapsed % 60000) / 1000)
						.toString()
						.padStart(2, "0")}
				</p>
				<p className="text-xs text-foreground/50 mt-2">Expected: 1-3 minutes</p>
			</div>

			{/* Progress Stages */}
			<div className="space-y-3">
				{STAGES.map((stage, index) => {
					const isComplete = stageIndex > index;
					const isCurrent = stage.key === currentStage;
					const StageIcon = stage.icon;

					return (
						<div
							key={stage.key}
							className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
								isCurrent
									? "bg-info/10 border border-info/30"
									: isComplete
										? "bg-success/10"
										: "bg-content1/10"
							}`}
						>
							<div
								className={`w-8 h-8 rounded-full flex items-center justify-center ${
									isComplete
										? "bg-success text-white"
										: isCurrent
											? "bg-info text-white animate-pulse"
											: "bg-content1/30 text-foreground/50"
								}`}
							>
								{isComplete ? (
									<span className="text-sm">✓</span>
								) : (
									<StageIcon className="w-4 h-4" />
								)}
							</div>
							<span
								className={`text-sm font-medium ${
									isCurrent ? "text-foreground" : "text-foreground/60"
								}`}
							>
								{stage.label}
							</span>
						</div>
					);
				})}
			</div>

			{/* Timeout Warning (appears after 3 minutes) */}
			{appraisalElapsed > 3 * 60 * 1000 && (
				<motion.div
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					className="bg-warning/10 border border-warning/30 rounded-lg p-3 text-center"
				>
					<p className="text-sm text-warning">
						This is taking longer than usual. The AVS service may be
						experiencing high load. Your appraisal is still being processed.
					</p>
				</motion.div>
			)}
		</motion.div>
	);
}
