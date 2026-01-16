"use client";

import { memo } from "react";
import { Button } from "@/ui/Button";
import { useSpinHistoryStore } from "@/stores/spinHistoryStore";
import type { SpinStatusFilter } from "@/types/spin-history";

interface HistoryFiltersProps {
	userAddress: string;
	gachaAddress: string;
}

const FILTER_OPTIONS: { value: SpinStatusFilter; label: string }[] = [
	{ value: "all", label: "All" },
	{ value: "completed", label: "Completed" },
	{ value: "refunded", label: "Refunded" },
];

const HistoryFilters = memo(({ userAddress, gachaAddress }: HistoryFiltersProps) => {
	const { getFilters, setFilter } = useSpinHistoryStore();
	const filters = getFilters(userAddress, gachaAddress);

	const handleFilterChange = (newFilter: SpinStatusFilter) => {
		setFilter(userAddress, gachaAddress, { status: newFilter });
	};

	return (
		<div className="flex items-center gap-2">
			<span className="mr-2 text-sm text-foreground/60">Filter:</span>
			{FILTER_OPTIONS.map((option) => (
				<Button
					key={option.value}
					size="sm"
					variant={filters.status === option.value ? "primary" : "ghost"}
					onClick={() => handleFilterChange(option.value)}
					className="min-w-[80px]"
				>
					{option.label}
				</Button>
			))}
		</div>
	);
});

HistoryFilters.displayName = "HistoryFilters";

export { HistoryFilters };
