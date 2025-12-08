"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/theme-config";

const badgeVariants = cva(
	"inline-flex items-center gap-2 rounded-full border text-[11px] font-semibold uppercase tracking-wide backdrop-blur-xl transition-colors duration-200",
	{
		variants: {
			variant: {
				flat: "bg-content1/30 border-white/20 text-foreground/80",
				solid: "bg-warning text-black border-warning/50",
				ghost: "bg-transparent border-white/10 text-foreground/70",
				success: "bg-success/20 border-success/40 text-success",
				danger: "bg-danger/20 border-danger/40 text-danger",
				warning: "bg-warning/20 border-warning/40 text-warning",
			},
			size: {
				sm: "px-3 py-1",
				md: "px-4 py-1.5",
				lg: "px-5 py-2",
			},
		},
		defaultVariants: {
			variant: "flat",
			size: "md",
		},
	},
);

export interface BadgeProps
	extends React.HTMLAttributes<HTMLSpanElement>,
		VariantProps<typeof badgeVariants> {
	color?: "danger" | "success" | "warning" | "info" | "neutral";
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
	({ className, variant, size, color, children, ...props }, ref) => {
		const resolvedVariant =
			variant ??
			(color === "danger"
				? "danger"
				: color === "success"
					? "success"
					: color === "warning"
						? "warning"
						: "flat");

		return (
			<span
				ref={ref}
				className={cn(
					badgeVariants({ variant: resolvedVariant, size }),
					className,
				)}
				{...props}
			>
				{children}
			</span>
		);
	},
);

Badge.displayName = "Badge";

export { Badge };
