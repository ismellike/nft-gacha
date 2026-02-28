"use client";

import type * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../lib/theme-config";

const badgeVariants = cva(
	[
		"absolute -top-1.5 -right-1.5 z-10",
		"inline-flex items-center justify-center",
		"rounded-full border backdrop-blur-xl",
		"text-[10px] font-bold leading-none",
		"transition-all duration-200",
	],
	{
		variants: {
			color: {
				primary: [
					"bg-gradient-to-r from-warning/80 to-orange-400/80 border-warning/40 text-black",
				],
				secondary: ["bg-content1/60 border-white/20 text-foreground/80"],
				danger: ["bg-danger/80 border-danger/40 text-white"],
				success: ["bg-success/80 border-success/40 text-white"],
				warning: ["bg-warning/80 border-warning/40 text-black"],
				ghost: ["bg-content1/20 border-white/10 text-foreground/70"],
			},
			dot: {
				true: "h-2.5 w-2.5 p-0",
				false: "min-w-[18px] h-[18px] px-1",
			},
			pulse: {
				true: "animate-pulse",
				false: "",
			},
		},
		defaultVariants: {
			color: "primary",
			dot: false,
			pulse: false,
		},
	},
);

export interface BadgeProps {
	count?: number | undefined;
	max?: number | undefined;
	dot?: boolean | undefined;
	pulse?: boolean | undefined;
	color?:
		| "primary"
		| "secondary"
		| "danger"
		| "success"
		| "warning"
		| "ghost"
		| undefined;
	children: React.ReactNode;
	className?: string | undefined;
	badgeClassName?: string | undefined;
}

const Badge = function Badge({
	count,
	max = 99,
	dot = false,
	pulse = false,
	color = "primary",
	children,
	className,
	badgeClassName,
}: BadgeProps) {
	const shouldShowBadge = dot || (count !== undefined && count > 0);

	const displayCount = (() => {
		if (dot) return null;
		if (count === undefined) return null;
		return count > max ? `${max}+` : String(count);
	})();

	return (
		<div className={cn("relative inline-flex", className)}>
			{children}
			{shouldShowBadge ? (
				<span
					role="status"
					className={cn(
						badgeVariants({ color, dot: dot ? true : false, pulse }),
						badgeClassName,
					)}
					aria-label={
						dot
							? "Notification"
							: count !== undefined
								? `${count} notifications`
								: undefined
					}
				>
					{displayCount}
				</span>
			) : null}
		</div>
	);
};

Badge.displayName = "Badge";

export { Badge };
