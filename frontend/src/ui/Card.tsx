"use client";

import * as React from "react";
import type { VariantProps } from "tailwind-variants";
import { cn, glassCard } from "../lib/theme-config";

interface CardProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof glassCard> {
	color?: "glass" | "glassInteractive";
	isPressable?: boolean;
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
			children,
			onKeyDown,
			...props
		},
		ref,
	) => {
		const resolvedVariant =
			variant ??
			(color === "glassInteractive" || isPressable ? "interactive" : "base");

		const isInteractive = isPressable || color === "glassInteractive";

		const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
			if (isInteractive && (e.key === "Enter" || e.key === " ")) {
				e.preventDefault();
				e.currentTarget.click();
			}
			onKeyDown?.(e);
		};

		return (
			<div
				ref={ref}
				className={cn(
					glassCard({ variant: resolvedVariant, padding, animate }),
					className,
				)}
				{...(isInteractive
					? { role: "button", tabIndex: 0, onKeyDown: handleKeyDown }
					: { onKeyDown })}
				{...props}
			>
				{children}
			</div>
		);
	},
);

Card.displayName = "Card";

export { Card };
