"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import type { VariantProps } from "tailwind-variants";
import { glassButton, cn } from "../lib/theme-config";

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof glassButton> {
	asChild?: boolean;
	color?:
		| "glass"
		| "glassPrimary"
		| "primary"
		| "secondary"
		| "danger"
		| "ghost";
	isDisabled?: boolean;
	onPress?: React.MouseEventHandler<HTMLButtonElement>;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{
			className,
			variant,
			size,
			isLoading,
			animate,
			color,
			asChild = false,
			isDisabled,
			disabled,
			onPress,
			onClick,
			children,
			...props
		},
		ref,
	) => {
		const Comp = asChild ? Slot : "button";
		const derivedVariant =
			variant ??
			(color === "glassPrimary"
				? "primary"
				: color === "glass"
					? "secondary"
					: color === "danger"
						? "danger"
						: color === "ghost"
							? "ghost"
							: color === "secondary"
								? "secondary"
								: "primary");

		return (
			<Comp
				className={cn(
					glassButton({ variant: derivedVariant, size, isLoading, animate }),
					className,
				)}
				disabled={disabled || isDisabled || isLoading}
				onClick={onPress ?? onClick}
				ref={ref}
				aria-busy={isLoading || undefined}
				{...props}
			>
				{children}
			</Comp>
		);
	},
);

Button.displayName = "Button";

export { Button };
