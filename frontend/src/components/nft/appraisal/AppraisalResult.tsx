import { CheckBadgeIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { Button } from "../../../ui";

interface AppraisalResultProps {
	onReset: () => void;
}

export function AppraisalResult({ onReset }: AppraisalResultProps) {
	return (
		<motion.div
			initial={{ scale: 0.8, opacity: 0 }}
			animate={{ scale: 1, opacity: 1 }}
			className="space-y-4"
		>
			<div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto">
				<CheckBadgeIcon className="w-10 h-10 text-white" />
			</div>
			<h2 className="text-2xl font-semibold text-success">
				Appraisal Complete!
			</h2>
			<p className="text-foreground/70">
				Your NFT metadata has been analyzed and market data queried. Ready for
				gacha deposits!
			</p>
			<div className="pt-4">
				<Button
					className="w-full bg-gradient-to-r from-success to-emerald-500 text-white font-medium"
					onPress={onReset}
				>
					<span className="flex items-center justify-center gap-2">
						<CheckBadgeIcon className="w-5 h-5" /> Appraised Successfully —
						Start another
					</span>
				</Button>
			</div>
		</motion.div>
	);
}
