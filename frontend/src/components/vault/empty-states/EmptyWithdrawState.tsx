"use client";

import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

interface EmptyWithdrawStateProps {
	message?: string;
	className?: string;
}

export function EmptyWithdrawState({
	message = "You haven't deposited any NFTs yet. Deposit some NFTs to start earning yield!",
	className = "",
}: EmptyWithdrawStateProps) {
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
					<ArrowDownTrayIcon className="w-8 h-8 sm:w-10 sm:h-10 text-foreground/40" />
				</motion.div>

				{/* Title */}
				<motion.h3
					className="text-xl sm:text-2xl font-semibold text-foreground mb-3"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.2 }}
				>
					No Deposited NFTs
				</motion.h3>

				{/* Description */}
				<motion.p
					className="text-sm sm:text-base text-foreground/60 max-w-md mx-auto"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.3 }}
				>
					{message}
				</motion.p>
			</div>
		</motion.div>
	);
}
