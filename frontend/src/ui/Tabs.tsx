"use client";

import type * as React from "react";
import { cn } from "../lib/theme-config";

export interface TabItem {
	label: string;
	value: string;
	icon?: React.ReactNode | undefined;
	disabled?: boolean | undefined;
}

export interface TabsProps {
	tabs: TabItem[];
	activeTab: string;
	onChange: (value: string) => void;
	className?: string | undefined;
	tabListClassName?: string | undefined;
}

const Tabs = function Tabs({ tabs, activeTab, onChange, className, tabListClassName }: TabsProps) {
	return (
		<div className={cn("w-full", className)} role="tablist" aria-label="Tabs">
			<div
				className={cn(
					"flex overflow-x-auto scrollbar-hide",
					"bg-content1/10 backdrop-blur-xl border border-white/10 rounded-xl p-1 gap-1",
					tabListClassName,
				)}
			>
				{tabs.map((tab) => {
					const isActive = tab.value === activeTab;
					return (
						<button
							key={tab.value}
							role="tab"
							type="button"
							aria-selected={isActive}
							aria-disabled={tab.disabled}
							disabled={tab.disabled}
							onClick={() => {
								if (!tab.disabled) {
									onChange(tab.value);
								}
							}}
							className={cn(
								"relative flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium",
								"transition-all duration-200 outline-none whitespace-nowrap",
								"focus-visible:ring-2 focus-visible:ring-warning/50 focus-visible:ring-offset-1 focus-visible:ring-offset-transparent",
								"disabled:opacity-40 disabled:cursor-not-allowed",
								isActive
									? [
											"bg-content1/40 backdrop-blur-xl border border-white/20 border-b-2 border-b-warning/70 text-warning",
											"shadow-[0_0_12px_rgba(201,168,108,0.15)]",
										]
									: [
											"text-foreground/60",
											"hover:bg-content1/20 hover:text-foreground/80",
										],
							)}
						>
							{tab.icon ? (
								<span className="inline-flex items-center" aria-hidden="true">
									{tab.icon}
								</span>
							) : null}
							{tab.label}
						</button>
					);
				})}
			</div>
		</div>
	);
};

Tabs.displayName = "Tabs";

export { Tabs };
