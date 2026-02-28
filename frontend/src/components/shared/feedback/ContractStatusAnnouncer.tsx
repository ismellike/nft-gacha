"use client";

import {
	CheckCircleIcon,
	ClockIcon,
	ExclamationTriangleIcon,
	InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { useRef, useState } from "react";
import { cn } from "../../../lib/theme-config";

export type ContractStatusType = "success" | "error" | "pending" | "info";

interface ContractStatusUpdate {
	type: ContractStatusType;
	message: string;
	timestamp?: number;
	persistent?: boolean; // If true, message stays in DOM longer
}

interface ContractStatusAnnouncerProps {
	status?: ContractStatusUpdate | null;
	className?: string;
	compact?: boolean;
}

export function ContractStatusAnnouncer({
	status,
	className,
	compact = false,
}: ContractStatusAnnouncerProps) {
	const statusRef = useRef<HTMLOutputElement>(null);

	if (!status) return null;

	const icons = {
		success: CheckCircleIcon,
		error: ExclamationTriangleIcon,
		pending: ClockIcon,
		info: InformationCircleIcon,
	};

	const Icon = icons[status.type];

	if (compact) {
		return (
			<output
				ref={statusRef}
				className={cn(
					"flex items-center gap-2 text-sm animate-fade-in",
					status.type === "success" && "text-success/80",
					status.type === "error" && "text-danger/80",
					status.type === "pending" && "text-warning/80",
					status.type === "info" && "text-foreground/60",
					className,
				)}
				aria-live={status.type === "error" ? "assertive" : "polite"}
				aria-atomic="true"
			>
				<Icon className="w-4 h-4 flex-shrink-0" />
				<span>{status.message}</span>
			</output>
		);
	}

	return (
		<output
			ref={statusRef}
			className={cn(
				"rounded-xl border p-4 animate-fade-in",
				status.type === "success" && "border-success/20 bg-success/5",
				status.type === "error" && "border-danger/20 bg-danger/5",
				status.type === "pending" && "border-warning/20 bg-warning/5",
				status.type === "info" && "border-foreground/20 bg-content1/10",
				className,
			)}
			aria-live={status.type === "error" ? "assertive" : "polite"}
			aria-atomic="true"
		>
			<div className="flex items-center gap-3">
				<Icon
					className={cn(
						"w-5 h-5 flex-shrink-0",
						status.type === "success" && "text-success",
						status.type === "error" && "text-danger",
						status.type === "pending" && "text-warning",
						status.type === "info" && "text-foreground/60",
					)}
				/>
				<p className="text-sm text-foreground/80">{status.message}</p>
			</div>
		</output>
	);
}

// Hook for managing contract status announcements
export function useContractStatusAnnouncer() {
	const [status, setStatus] = useState<ContractStatusUpdate | null>(null);

	const announceStatus = (update: Omit<ContractStatusUpdate, "timestamp">) => {
		setStatus({
			...update,
			timestamp: Date.now(),
		});

		// Auto-clear non-persistent messages after 5 seconds
		if (!update.persistent) {
			setTimeout(() => {
				setStatus(null);
			}, 5000);
		}
	};

	const clearStatus = () => setStatus(null);

	return {
		status,
		announceStatus,
		clearStatus,
	};
}
