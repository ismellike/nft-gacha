"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/theme-config";

const chipVariants = cva(
	"inline-flex items-center gap-2 rounded-xl border text-xs font-medium backdrop-blur-xl transition-colors duration-200",
	{
		variants: {
			variant: {
				glass: "bg-content1/20 border-white/20 text-foreground/80",
				flat: "bg-content1/20 border-white/20 text-foreground/80",
				primary:
					"bg-gradient-to-r from-warning/20 to-orange-400/20 border-warning/30 text-warning",
				secondary: "bg-content1/30 border-white/20 text-foreground/70",
				success: "bg-success/20 border-success/30 text-success",
				warning: "bg-warning/20 border-warning/30 text-warning",
				danger: "bg-danger/20 border-danger/30 text-danger",
				ghost: "bg-transparent border-white/10 text-foreground/70",
			},
			size: {
				sm: "px-2 py-1 text-[11px]",
				md: "px-3 py-1.5 text-xs",
				lg: "px-4 py-2 text-sm",
			},
		},
		defaultVariants: {
			variant: "glass",
			size: "md",
		},
	},
);

export interface ChipProps
	extends React.HTMLAttributes<HTMLSpanElement>,
		VariantProps<typeof chipVariants> {
	color?:
		| "glass"
		| "primary"
		| "secondary"
		| "success"
		| "warning"
		| "danger"
		| "ghost";
	startContent?: React.ReactNode;
	endContent?: React.ReactNode;
}

const Chip = React.forwardRef<HTMLSpanElement, ChipProps>(
	(
		{
			className,
			variant,
			size,
			color,
			startContent,
			endContent,
			children,
			...props
		},
		ref,
	) => {
		const resolvedVariant =
			variant ??
			(color === "primary"
				? "primary"
				: color === "success"
					? "success"
					: color === "warning"
						? "warning"
						: color === "danger"
							? "danger"
							: color === "ghost"
								? "ghost"
								: color === "secondary"
									? "secondary"
									: "glass");

		return (
			<span
				ref={ref}
				className={cn(
					chipVariants({ variant: resolvedVariant, size }),
					className,
				)}
				{...props}
			>
				{startContent ? (
					<span className="mr-2 inline-flex items-center">{startContent}</span>
				) : null}
				{children}
				{endContent ? (
					<span className="ml-2 inline-flex items-center">{endContent}</span>
				) : null}
			</span>
		);
	},
);

Chip.displayName = "Chip";

export { Chip };
