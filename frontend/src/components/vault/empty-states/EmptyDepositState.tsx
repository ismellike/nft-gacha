"use client";

import { ArrowUpTrayIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { Button } from "../../../ui";

interface EmptyDepositStateProps {
	message?: string;
	showAction?: boolean;
	actionLabel?: string;
	onAction?: () => void;
	className?: string;
}

export function EmptyDepositState({
	message = "You don't own any NFTs from whitelisted collections. Get some NFTs from supported collections to start earning yield!",
	showAction = false,
	actionLabel = "Explore Collections",
	onAction,
	className = "",
}: EmptyDepositStateProps) {
	return (
		<motion.div
			className={className}
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -20 }}
			transition={{ type: "spring", stiffness: 300, damping: 20 }}
		>
			<div className="text-center py-12 sm:py-16 px-4">
				{/* Icon */}
				<motion.div
					className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-content1/20 mb-6"
					initial={{ scale: 0 }}
					animate={{ scale: 1 }}
					transition={{
						type: "spring",
						stiffness: 200,
						damping: 15,
						delay: 0.1,
					}}
				>
					<ArrowUpTrayIcon className="w-8 h-8 sm:w-10 sm:h-10 text-foreground/40" />
				</motion.div>

				{/* Title */}
				<motion.h3
					className="text-xl sm:text-2xl font-semibold text-foreground mb-3"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.2 }}
				>
					No Eligible NFTs Found
				</motion.h3>

				{/* Description */}
				<motion.p
					className="text-sm sm:text-base text-foreground/60 mb-8 max-w-md mx-auto"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.3 }}
				>
					{message}
				</motion.p>

				{/* Action Button */}
				{showAction && onAction && (
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.4 }}
					>
						<Button
							color="glassPrimary"
							className="min-h-[44px] px-6"
							onPress={onAction}
						>
							{actionLabel}
						</Button>
					</motion.div>
				)}
			</div>
		</motion.div>
	);
}
