"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import type { VariantProps } from "tailwind-variants";
import { glassButton, cn } from "../lib/theme-config";

export interface ButtonProps
	extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color">,
		VariantProps<typeof glassButton> {
	asChild?: boolean;
	color?:
		| "glass"
		| "glassPrimary"
		| "primary"
		| "secondary"
		| "danger"
		| "ghost"
		| "warning"
		| "default";
	isDisabled?: boolean;
	onPress?: React.MouseEventHandler<HTMLButtonElement>;
	startContent?: React.ReactNode;
	endContent?: React.ReactNode;
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
			startContent,
			endContent,
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
					: color === "warning"
						? "primary"
						: color === "default"
							? "secondary"
							: color === "danger"
								? "danger"
								: color === "ghost"
									? "ghost"
									: color === "secondary"
										? "secondary"
										: "primary");

		if (asChild) {
			// When asChild is true, Slot expects exactly one child
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
		}

		// Normal rendering with startContent and endContent
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
				{startContent ? (
					<span className="mr-2 inline-flex items-center">{startContent}</span>
				) : null}
				{children}
				{endContent ? (
					<span className="ml-2 inline-flex items-center">{endContent}</span>
				) : null}
			</Comp>
		);
	},
);

Button.displayName = "Button";

export { Button };
