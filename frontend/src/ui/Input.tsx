"use client";

import * as React from "react";
import type { VariantProps } from "tailwind-variants";
import { glassInput, cn } from "../lib/theme-config";

export interface InputProps
	extends React.InputHTMLAttributes<HTMLInputElement>,
		VariantProps<typeof glassInput> {
	isDisabled?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
	(
		{ className, variant, size, isInvalid, isDisabled, disabled, ...props },
		ref,
	) => {
		return (
			<input
				ref={ref}
				className={cn(glassInput({ variant, size, isInvalid }), className)}
				disabled={disabled || isDisabled}
				{...props}
			/>
		);
	},
);

Input.displayName = "Input";

// Alias kept for compatibility
const GlassInput = Input;

export { Input, GlassInput };
