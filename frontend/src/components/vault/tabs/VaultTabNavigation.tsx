"use client";

import type React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	ArrowUpTrayIcon,
	ArrowDownTrayIcon,
	BanknotesIcon,
} from "@heroicons/react/24/outline";
import { Button } from "../../../ui";
import { cn } from "../../../lib/theme-config";

type VaultTab = "deposit" | "withdraw" | "yield";

interface VaultTabNavigationProps {
	activeTab: VaultTab;
	onTabChange: (tab: VaultTab) => void;
	className?: string;
}

interface TabConfig {
	id: VaultTab;
	label: string;
	icon: React.ComponentType<{ className?: string }>;
}

const tabs: TabConfig[] = [
	{ id: "deposit", label: "Deposit NFTs", icon: ArrowUpTrayIcon },
	{ id: "withdraw", label: "Withdraw NFTs", icon: ArrowDownTrayIcon },
	{ id: "yield", label: "Yield", icon: BanknotesIcon },
];

export function VaultTabNavigation({
	activeTab,
	onTabChange,
	className = "",
}: VaultTabNavigationProps) {
	return (
		<div
			role="tablist"
			aria-label="Vault management tabs"
			className={cn(
				"flex flex-wrap gap-3 sm:gap-4 p-1 bg-content1/20 rounded-xl mb-6 sm:mb-8",
				className,
			)}
		>
			{tabs.map((tab) => {
				const isActive = activeTab === tab.id;
				const Icon = tab.icon;

				return (
					<Button
						key={tab.id}
						color="glass"
						role="tab"
						aria-selected={isActive}
						aria-controls={`${tab.id}-panel`}
						className={cn(
							"flex-1 min-w-[100px] sm:min-w-[120px] justify-center gap-2 rounded-lg min-h-[44px] transition-all duration-200",
							isActive
								? "bg-gradient-to-r from-warning to-orange-400 text-black hover:!from-warning hover:!to-orange-400 hover:!text-black scale-105"
								: "text-foreground/70 hover:text-foreground hover:bg-content1/30",
						)}
						onPress={() => onTabChange(tab.id)}
					>
						<AnimatePresence mode="wait" initial={false}>
							<motion.div
								key={isActive ? "active" : "inactive"}
								initial={{ rotate: isActive ? -180 : 0, opacity: 0 }}
								animate={{ rotate: 0, opacity: 1 }}
								exit={{ rotate: 180, opacity: 0 }}
								transition={{ duration: 0.2 }}
							>
								<Icon className="w-4 h-4" aria-hidden="true" />
							</motion.div>
						</AnimatePresence>
						<span className="text-sm sm:text-base">{tab.label}</span>
					</Button>
				);
			})}
		</div>
	);
}
