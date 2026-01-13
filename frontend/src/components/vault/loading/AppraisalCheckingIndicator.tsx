"use client";

import { motion } from "framer-motion";

interface AppraisalCheckingIndicatorProps {
	message?: string;
	className?: string;
}

export function AppraisalCheckingIndicator({
	message = "Checking appraisal...",
	className = "",
}: AppraisalCheckingIndicatorProps) {
	return (
		<motion.div
			className={className}
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
		>
			<motion.div
				className="flex items-center gap-2 text-xs sm:text-sm text-foreground/60"
				initial={{ x: -10 }}
				animate={{ x: 0 }}
				transition={{ type: "spring", stiffness: 300, damping: 20 }}
			>
				{/* Animated pulsing dot */}
				<motion.div
					className="w-2 h-2 bg-warning rounded-full"
					animate={{
						scale: [1, 1.5, 1],
						opacity: [0.5, 1, 0.5],
					}}
					transition={{
						duration: 1.5,
						repeat: Number.POSITIVE_INFINITY,
						ease: "easeInOut",
					}}
				/>
				<span>{message}</span>
			</motion.div>

			{/* Animated progress bar */}
			<motion.div
				className="h-1 bg-content1/30 rounded-full overflow-hidden mt-2"
				initial={{ width: 0 }}
				animate={{ width: "100%" }}
				transition={{ duration: 0.3 }}
			>
				<motion.div
					className="h-full bg-gradient-to-r from-warning/50 to-warning rounded-full"
					initial={{ x: "-100%" }}
					animate={{ x: "100%" }}
					transition={{
						duration: 1.5,
						repeat: Number.POSITIVE_INFINITY,
						ease: "linear",
					}}
				/>
			</motion.div>
		</motion.div>
	);
}
