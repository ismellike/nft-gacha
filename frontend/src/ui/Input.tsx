"use client";

import React from "react";
import { extendVariants } from "@heroui/react";
import { Input as HeroInput } from "@heroui/react";

export const GlassInput = extendVariants(HeroInput, {
	variants: {
		variant: {
			flat: {
				base: "bg-content1/20 backdrop-blur-xl border border-white/20 transition-all duration-200",
				inputWrapper:
					"focus-within:bg-content1/30 focus-within:border-warning/50 focus-within:ring-2 focus-within:ring-warning/20 hover:bg-content1/25",
			},
			bordered: {
				base: "bg-content1/10 backdrop-blur-xl border-2 border-white/30 transition-all duration-200",
				inputWrapper:
					"focus-within:bg-content1/20 focus-within:border-warning/50 focus-within:ring-2 focus-within:ring-warning/20 hover:bg-content1/15",
			},
			faded: {
				base: "bg-content1/5 backdrop-blur-xl border border-white/10 transition-all duration-200",
				inputWrapper:
					"focus-within:bg-content1/25 focus-within:border-warning/40 focus-within:ring-1 focus-within:ring-warning/10 hover:bg-content1/10",
			},
		},
		color: {
			glass: {
				input: "text-foreground placeholder:text-foreground/40",
				label: "text-foreground",
				description: "text-foreground/60",
				errorMessage: "text-danger",
			},
			primary: {
				inputWrapper: "focus-within:border-warning focus-within:ring-warning",
				label: "text-warning",
			},
		},
		size: {
			sm: {
				base: "h-8 text-small",
				inputWrapper: "px-3 py-2 rounded-lg",
				input: "text-small",
				label: "text-small",
			},
			md: {
				base: "h-10 text-medium",
				inputWrapper: "px-4 py-3 rounded-xl",
				input: "text-medium",
				label: "text-medium",
			},
			lg: {
				base: "h-12 text-large",
				inputWrapper: "px-5 py-4 rounded-xl",
				input: "text-large",
				label: "text-large",
			},
		},
	},
	defaultVariants: {
		variant: "flat",
		color: "glass",
		size: "md",
	},
	slots: {
		base: "w-full",
		mainWrapper: "relative",
		inputWrapper:
			"group-data-[focus=true]:ring-2 group-data-[focus=true]:ring-warning/20 group-data-[focus=true]:border-warning/50 transition-all duration-200",
		input: "bg-transparent text-foreground placeholder:text-foreground/40",
		label: "text-foreground",
		description: "text-foreground/60",
		errorMessage: "text-danger",
	},
});

export interface InputProps extends React.ComponentProps<typeof GlassInput> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => (
	<GlassInput {...props} ref={ref as any} />
));

Input.displayName = "Input";

export { Input };
