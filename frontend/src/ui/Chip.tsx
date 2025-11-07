"use client";

import React from "react";
import { extendVariants } from "@heroui/react";
import { Chip as HeroChip } from "@heroui/react";

export const GlassChip = extendVariants(HeroChip, {
	variants: {
		color: {
			glass: {
				base: "bg-content1/20 backdrop-blur-xl border border-white/20 text-foreground/80",
			},
			primary: {
				base: "bg-gradient-to-r from-warning/20 to-orange-400/20 border border-warning/30 text-warning",
			},
			success: {
				base: "bg-success/20 border border-success/30 text-success",
			},
			warning: {
				base: "bg-warning/20 border border-warning/30 text-warning",
			},
			danger: {
				base: "bg-danger/20 border border-danger/30 text-danger",
			},
		},
		variant: {
			flat: {
				base: "bg-content1/20 backdrop-blur-xl border border-white/20 text-foreground/80",
			},
			bordered: {
				base: "bg-content1/10 backdrop-blur-xl border border-white/30 text-foreground/80",
			},
			light: {
				base: "bg-content1/5 backdrop-blur-xl border border-white/10 text-foreground/60",
			},
		},
		size: {
			sm: {
				base: "h-6 min-w-12 px-2 text-tiny rounded-lg",
				content: "text-tiny",
			},
			md: {
				base: "h-8 min-w-16 px-3 text-small rounded-xl",
				content: "text-small",
			},
			lg: {
				base: "h-10 min-w-20 px-4 text-medium rounded-xl",
				content: "text-medium",
			},
		},
	},
	defaultVariants: {
		color: "glass",
		variant: "flat",
		size: "md",
	},
	slots: {
		base: "transition-all duration-200",
		closeButton: "text-foreground/60 hover:text-foreground",
	},
});

export interface ChipProps extends React.ComponentProps<typeof GlassChip> {}

const Chip = React.forwardRef<HTMLDivElement, ChipProps>(
	({ ...props }, ref) => <GlassChip {...props} ref={ref as never} />,
);

Chip.displayName = "Chip";

export { Chip };
