"use client";

import * as React from "react";
import type { VariantProps } from "tailwind-variants";
import { cn, glassCard } from "../lib/theme-config";

export interface CardProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof glassCard> {
	color?: "glass" | "glassInteractive";
	isPressable?: boolean;
	shadow?: string;
	radius?: string;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
	(
		{
			className,
			variant,
			padding,
			animate,
			color,
			isPressable,
			shadow: _shadow,
			radius: _radius,
			children,
			...props
		},
		ref,
	) => {
		const resolvedVariant =
			variant ??
			(color === "glassInteractive" || isPressable ? "interactive" : "base");

		return (
			<div
				ref={ref}
				className={cn(
					glassCard({ variant: resolvedVariant, padding, animate }),
					className,
				)}
				{...props}
			>
				{children}
			</div>
		);
	},
);

Card.displayName = "Card";

export { Card };
