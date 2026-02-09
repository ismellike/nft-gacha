"use client";

import type { RedemptionWindowState } from "@/hooks/useRedemptionWindow";
import { Chip } from "../../ui/Chip";
import { Skeleton } from "../../ui/Skeleton";

interface RedemptionCountdownProps {
	state: RedemptionWindowState;
	variant?: "full" | "card" | "button";
}

function getProgressColor(progressPercent: number): string {
	if (progressPercent > 50) return "bg-emerald-400";
	if (progressPercent > 20) return "bg-yellow-400";
	return "bg-red-400";
}

function getProgressTrackGlow(progressPercent: number): string {
	if (progressPercent > 50) return "shadow-emerald-400/20";
	if (progressPercent > 20) return "shadow-yellow-400/20";
	return "shadow-red-400/20";
}

function getTextColor(progressPercent: number): string {
	if (progressPercent > 50) return "text-emerald-300";
	if (progressPercent > 20) return "text-yellow-300";
	return "text-red-300";
}

export function RedemptionCountdown({
	state,
	variant = "card",
}: RedemptionCountdownProps) {
	const {
		isEligible,
		isExpired,
		isLoading,
		progressPercent,
		formattedTimeRemaining,
		formattedTotalWindow,
	} = state;

	// Don't render if not eligible (no active redemption window)
	if (!isEligible && !isLoading) return null;

	if (isLoading) {
		if (variant === "button") return null;
		return <Skeleton variant="text" size="h4" className="w-24" />;
	}

	if (variant === "button") {
		if (isExpired) {
			return (
				<Chip color="danger" variant="flat" size="sm">
					Expired
				</Chip>
			);
		}
		return (
			<Chip
				color={progressPercent > 50 ? "success" : progressPercent > 20 ? "warning" : "danger"}
				variant="flat"
				size="sm"
			>
				{formattedTimeRemaining} left
			</Chip>
		);
	}

	if (variant === "card") {
		if (isExpired) {
			return (
				<div className="flex items-center gap-2 text-red-300 text-xs">
					<div className="h-1.5 flex-1 rounded-full bg-white/10 overflow-hidden">
						<div className="h-full w-0 bg-red-400 rounded-full" />
					</div>
					<span className="whitespace-nowrap font-medium">Expired</span>
				</div>
			);
		}

		return (
			<div className="flex items-center gap-2 text-xs">
				<div className="h-1.5 flex-1 rounded-full bg-white/10 overflow-hidden">
					<div
						className={`h-full rounded-full transition-all duration-1000 ease-linear ${getProgressColor(progressPercent)}`}
						style={{ width: `${progressPercent}%` }}
					/>
				</div>
				<span
					className={`whitespace-nowrap font-medium ${getTextColor(progressPercent)}`}
				>
					{formattedTimeRemaining}
				</span>
			</div>
		);
	}

	// Full variant
	if (isExpired) {
		return (
			<div className="space-y-2">
				<div className="flex items-center justify-between">
					<span className="text-white/70 text-sm">Redemption Window</span>
					<span className="text-red-300 font-medium text-sm">
						Window Expired
					</span>
				</div>
				<div className="h-2 rounded-full bg-white/10 overflow-hidden shadow-inner">
					<div className="h-full w-0 bg-red-400 rounded-full" />
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-2">
			<div className="flex items-center justify-between">
				<span className="text-white/70 text-sm">Redemption Window</span>
				<span
					className={`font-medium text-sm ${getTextColor(progressPercent)}`}
				>
					{formattedTimeRemaining} / {formattedTotalWindow}
				</span>
			</div>
			<div
				className={`h-2 rounded-full bg-white/10 overflow-hidden shadow-inner shadow-sm ${getProgressTrackGlow(progressPercent)}`}
			>
				<div
					className={`h-full rounded-full transition-all duration-1000 ease-linear ${getProgressColor(progressPercent)}`}
					style={{ width: `${progressPercent}%` }}
				/>
			</div>
		</div>
	);
}
