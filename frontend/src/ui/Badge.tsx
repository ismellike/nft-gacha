"use client";

import React from "react";
import { extendVariants } from "@heroui/react";
import { Badge as HeroBadge } from "@heroui/react";

export const GlassBadge = extendVariants(HeroBadge, {
	variants: {
		color: {
			glass: {
				base: "bg-content1/20 backdrop-blur-xl border border-white/20 text-foreground/80",
				badge:
					"bg-content1/30 backdrop-blur-xl border border-white/30 text-foreground",
			},
			primary: {
				base: "bg-gradient-to-r from-warning/20 to-orange-400/20 border border-warning/30 text-warning",
				badge:
					"bg-gradient-to-r from-warning/40 to-orange-400/40 border border-warning/50 text-warning",
			},
			success: {
				base: "bg-success/20 border border-success/30 text-success",
				badge: "bg-success/40 border border-success/50 text-success",
			},
			warning: {
				base: "bg-warning/20 border border-warning/30 text-warning",
				badge: "bg-warning/40 border border-warning/50 text-warning",
			},
			danger: {
				base: "bg-danger/20 border border-danger/30 text-danger",
				badge: "bg-danger/40 border border-danger/50 text-danger",
			},
		},
		variant: {
			flat: {
				base: "bg-content1/20 backdrop-blur-xl border border-white/20 text-foreground/80",
				badge:
					"bg-content1/30 backdrop-blur-xl border border-white/30 text-foreground",
			},
			solid: {
				base: "bg-content1/30 backdrop-blur-xl border border-white/30 text-foreground",
				badge:
					"bg-content1/40 backdrop-blur-xl border border-white/40 text-foreground",
			},
			faded: {
				base: "bg-content1/10 backdrop-blur-xl border border-white/10 text-foreground/60",
				badge:
					"bg-content1/20 backdrop-blur-xl border border-white/20 text-foreground/80",
			},
			shadow: {
				base: "bg-content1/25 backdrop-blur-xl border border-white/25 text-foreground/80 shadow-lg",
				badge:
					"bg-content1/35 backdrop-blur-xl border border-white/35 text-foreground shadow-xl",
			},
		},
		size: {
			sm: {
				base: "text-tiny",
				badge: "min-w-[12px] h-3 text-tiny px-1 text-tiny rounded-sm",
			},
			md: {
				base: "text-small",
				badge: "min-w-[16px] h-4 text-small px-1.5 text-small rounded-md",
			},
			lg: {
				base: "text-medium",
				badge: "min-w-[20px] h-5 text-medium px-2 text-medium rounded-lg",
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
		badge: "transition-all duration-200",
	},
});

export interface BadgeProps extends React.ComponentProps<typeof GlassBadge> {}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>((props, ref) => (
	<GlassBadge ref={ref} {...props} />
));

Badge.displayName = "Badge";

export { Badge };
