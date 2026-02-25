"use client";

import {
	ArrowDownTrayIcon,
	ArrowUpTrayIcon,
	BanknotesIcon,
} from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "framer-motion";
import type React from "react";
import { useMemo } from "react";
import { cn } from "../../../lib/theme-config";
import { Tabs } from "../../../ui";

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

const TAB_CONFIGS: TabConfig[] = [
	{ id: "deposit", label: "Deposit NFTs", icon: ArrowUpTrayIcon },
	{ id: "withdraw", label: "Withdraw NFTs", icon: ArrowDownTrayIcon },
	{ id: "yield", label: "Yield", icon: BanknotesIcon },
];

export function VaultTabNavigation({
	activeTab,
	onTabChange,
	className = "",
}: VaultTabNavigationProps) {
	const tabs = useMemo(
		() =>
			TAB_CONFIGS.map((tab) => {
				const isActive = activeTab === tab.id;
				const Icon = tab.icon;
				return {
					value: tab.id,
					label: tab.label,
					icon: (
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
					),
				};
			}),
		[activeTab],
	);

	return (
		<Tabs
			tabs={tabs}
			activeTab={activeTab}
			onChange={(value) => onTabChange(value as VaultTab)}
			className={cn("mb-6 sm:mb-8", className)}
		/>
	);
}
