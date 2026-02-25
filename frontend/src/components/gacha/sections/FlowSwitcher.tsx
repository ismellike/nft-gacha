"use client";

import { motion } from "framer-motion";
import type { ElementType } from "react";
import { cn } from "../../../lib/theme-config";

interface FlowOption {
	id: string;
	label: string;
	icon?: ElementType;
	description?: string;
}

interface FlowSwitcherProps {
	options: FlowOption[];
	activeId: string;
	onSelect: (id: string) => void;
	className?: string;
}

export function FlowSwitcher({
	options,
	activeId,
	onSelect,
	className,
}: FlowSwitcherProps) {
	return (
		<div
			role="tablist"
			className={cn(
				"relative flex w-full flex-wrap gap-2 border-b border-white/10 pb-2",
				className,
			)}
		>
			{options.map(({ id, label, icon: Icon, description }) => {
				const isActive = id === activeId;

				return (
					<button
						key={id}
						type="button"
						role="tab"
						aria-selected={isActive}
						onClick={() => onSelect(id)}
						className={cn(
							"group relative flex min-h-[3.5rem] flex-1 items-center gap-3 rounded-xl px-4 py-3 text-left transition",
							"cursor-pointer text-sm text-foreground/70 hover:text-foreground hover:bg-content1/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warning/60 focus-visible:bg-content1/10 group-hover:-translate-y-0.5",
						)}
					>
						{isActive && (
							<motion.span
								layoutId="flow-pill"
								className="absolute inset-0 rounded-xl bg-gradient-to-r from-warning/20 via-orange-400/10 to-warning/20 shadow-[0_8px_24px_rgba(255,180,0,0.08)]"
								transition={{ type: "spring", stiffness: 380, damping: 30 }}
							/>
						)}
						<span className="relative flex flex-1 items-center gap-3">
							{Icon && (
								<span
									className={cn(
										"flex h-9 w-9 items-center justify-center rounded-xl border text-sm transition-colors",
										isActive
											? "border-warning/50 bg-warning/20 text-warning"
											: "border-white/5 bg-transparent text-foreground/60",
									)}
								>
									<Icon className="h-4 w-4" />
								</span>
							)}
							<span className="flex flex-col">
								<span
									className={cn(
										"text-sm font-medium",
										isActive ? "text-foreground" : "text-foreground/80",
									)}
								>
									{label}
								</span>
								{description && (
									<span className="text-xs text-foreground/60">
										{description}
									</span>
								)}
							</span>
						</span>
					</button>
				);
			})}
		</div>
	);
}
