"use client";

import type { ElementType } from "react";
import { cn } from "../../../lib/theme-config";
import { Tabs } from "../../../ui";

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
	const activeOption = options.find((o) => o.id === activeId);

	const tabs = options.map(({ id, label, icon: Icon }) => ({
		value: id,
		label,
		icon: Icon ? <Icon className="h-4 w-4" /> : undefined,
	}));

	return (
		<div className={cn("w-full space-y-2", className)}>
			<Tabs
				tabs={tabs}
				activeTab={activeId}
				onChange={onSelect}
				tabListClassName="border-b border-white/10 pb-2 rounded-none bg-transparent border-0 backdrop-blur-none p-0 gap-2"
			/>
			{activeOption?.description && (
				<p className="px-1 text-xs text-foreground/60">
					{activeOption.description}
				</p>
			)}
		</div>
	);
}
