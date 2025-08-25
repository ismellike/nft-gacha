"use client";

import { motion } from "framer-motion";
import { Rarity, getRarityConfig, getRarityTailwindClasses, getAllRarities } from "../lib/rarityConfig";

export const RarityThemeShowcase: React.FC = () => {
	const rarities = getAllRarities();

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
			{rarities.map((rarity) => {
				const config = getRarityConfig(rarity);
				const classes = getRarityTailwindClasses(rarity);
				
				return (
					<motion.div
						key={rarity}
						className="group relative"
						whileHover={{ scale: 1.02 }}
						transition={{ type: "spring", stiffness: 400 }}
					>
						{/* Glow effect */}
						<div
							className={`absolute inset-0 bg-gradient-to-r ${config.bgGradient} rounded-xl blur-md opacity-0 group-hover:opacity-40 transition-opacity duration-500`}
						/>
						
						{/* Main card */}
						<div
							className={`relative bg-content2/10 backdrop-blur-xl border ${config.borderColor} rounded-xl p-4 hover:bg-content2/20 transition-all duration-300 ${config.glowColor}`}
						>
							{/* Header */}
							<div className="flex items-center justify-between mb-3">
								<div
									className={`px-3 py-1.5 rounded-lg bg-gradient-to-r ${config.bgGradient} shadow-lg`}
								>
									<span className="text-sm font-bold text-white drop-shadow-sm flex items-center gap-1">
										<span>{config.emoji}</span>
										{config.name}
									</span>
								</div>
								<div className={`text-lg font-bold ${config.textColor}`}>
									{config.percentage}%
								</div>
							</div>
							
							{/* Color demonstration */}
							<div className="space-y-2">
								<div className="flex gap-1">
									<div className={`w-4 h-4 rounded ${classes.bg}`} title="Primary" />
									<div className={`w-4 h-4 rounded ${classes.bgLight}`} title="Light" />
									<div className={`w-4 h-4 rounded ${classes.bgDark}`} title="Dark" />
								</div>
								<div className={`text-xs ${config.textColor} font-medium`}>
									{config.description}
								</div>
							</div>
							
							{/* Progress bar example */}
							<div className="mt-3">
								<div className="h-2 bg-content3/30 backdrop-blur-sm rounded-full overflow-hidden">
									<div
										className={`h-full bg-gradient-to-r ${config.bgGradient} rounded-full shadow-sm transition-all duration-1000 ease-out`}
										style={{ width: `${config.percentage}%` }}
									/>
								</div>
							</div>
						</div>
					</motion.div>
				);
			})}
		</div>
	);
};