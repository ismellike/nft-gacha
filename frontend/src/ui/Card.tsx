"use client";

import React from "react";
import { extendVariants } from "@heroui/react";
import { Card as HeroCard } from "@heroui/react";

export const GlassCard = extendVariants(HeroCard, {
	variants: {
		color: {
			glass: {
				base: "bg-content1/20 backdrop-blur-xl border border-white/10 shadow-xl transition-all duration-300",
				hover: "bg-content1/30 hover:border-white/20 hover:shadow-2xl",
			},
			glassInteractive: {
				base: "bg-content1/20 backdrop-blur-xl border border-white/10 shadow-xl transition-all duration-300 cursor-pointer",
				hover:
					"bg-content1/30 hover:border-white/20 hover:shadow-2xl hover:scale-[1.02]",
				focus:
					"outline-none focus:ring-2 focus:ring-warning/50 focus:ring-offset-2 focus:ring-offset-background",
				active: "scale-[0.98]",
			},
		},
	},
	defaultVariants: {
		color: "glass",
		shadow: "md",
		radius: "lg",
	},
});

export interface CardProps extends React.ComponentProps<typeof GlassCard> {
	// Override to ensure default glass styling
	className?: string;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
	({ className, ...props }, ref) => (
		<GlassCard
			className={`bg-content1/20 backdrop-blur-xl border border-white/10 transition-all duration-300 rounded-2xl shadow-2xl ${className || ""}`}
			{...props}
			ref={ref as never}
		/>
	),
);

Card.displayName = "Card";

export { Card };
