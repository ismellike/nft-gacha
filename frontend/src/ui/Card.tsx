"use client";

import React from "react";
import { extendVariants } from "@heroui/react";
import { Card as HeroCard } from "@heroui/react";

export const GlassCard = extendVariants(HeroCard, {
	variants: {
		isHoverable: {
			true: {
				base: "hover:bg-content1/30 hover:border-white/20 hover:shadow-3xl transition-all duration-300 cursor-pointer",
			},
		},
		isPressable: {
			true: {
				base: "cursor-pointer hover:bg-content1/30 hover:border-white/20 hover:shadow-3xl focus:outline-none focus:ring-2 focus:ring-warning/50 focus:ring-offset-2 focus:ring-offset-background data-[pressed=true]:scale-[0.98] transition-all duration-300",
			},
		},
	},
	defaultVariants: {
		shadow: "lg",
		radius: "lg",
	},
	slots: {
		base: "bg-content1/20 backdrop-blur-xl border border-white/10 transition-all duration-300 rounded-2xl shadow-2xl",
	},
});

export interface CardProps extends React.ComponentProps<typeof GlassCard> {
	// Override to ensure default glass styling
	className?: string;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
	({ className = "", ...props }, ref) => (
		<GlassCard
			ref={ref}
			className={`bg-content1/20 backdrop-blur-xl border border-white/10 transition-all duration-300 rounded-2xl shadow-2xl ${className}`}
			{...props}
		/>
	),
);

Card.displayName = "Card";

export { Card };
