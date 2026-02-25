"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/theme-config";

const selectVariants = cva(
	[
		"w-full appearance-none rounded-xl border bg-content1/20 backdrop-blur-xl text-foreground",
		"transition-all duration-200 outline-none cursor-pointer",
		"disabled:opacity-50 disabled:cursor-not-allowed",
		"focus:bg-content1/30 focus:shadow-[0_0_0_2px_rgba(255,191,0,0.2)]",
	],
	{
		variants: {
			variant: {
				default: [
					"border-white/20",
					"hover:border-white/30",
					"focus:border-warning/50",
				],
				ghost: [
					"border-transparent bg-transparent",
					"hover:border-white/10 hover:bg-content1/10",
					"focus:border-warning/30 focus:bg-content1/20",
				],
				error: [
					"border-danger/40 bg-danger/5",
					"hover:border-danger/50",
					"focus:border-danger/60 focus:shadow-[0_0_0_2px_rgba(239,68,68,0.15)]",
				],
			},
			size: {
				sm: "pl-3 pr-9 py-2 text-sm min-h-[36px]",
				md: "pl-4 pr-10 py-3 text-base min-h-[44px]",
				lg: "pl-5 pr-11 py-4 text-lg min-h-[52px]",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "md",
		},
	},
);

const labelVariants = cva("text-sm font-medium text-foreground/70", {
	variants: {
		variant: {
			default: "",
			ghost: "",
			error: "text-danger/80",
		},
	},
	defaultVariants: {
		variant: "default",
	},
});

const helperVariants = cva("text-xs", {
	variants: {
		variant: {
			default: "text-foreground/50",
			ghost: "text-foreground/50",
			error: "text-danger/80",
		},
	},
	defaultVariants: {
		variant: "default",
	},
});

export interface SelectOption {
	value: string;
	label: string;
	disabled?: boolean | undefined;
}

export interface SelectProps
	extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size">,
		VariantProps<typeof selectVariants> {
	options: SelectOption[];
	placeholder?: string | undefined;
	label?: string | undefined;
	helperText?: string | undefined;
	errorMessage?: string | undefined;
	wrapperClassName?: string | undefined;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
	(
		{
			className,
			variant,
			size,
			options,
			placeholder,
			label,
			helperText,
			errorMessage,
			disabled,
			wrapperClassName,
			id,
			...props
		},
		ref,
	) => {
		const generatedId = React.useId();
		const selectId = id ?? generatedId;
		const helperTextId = `${selectId}-helper`;

		const resolvedVariant = errorMessage ? "error" : (variant ?? "default");
		const displayedHelper = errorMessage ?? helperText;

		const chevronSize =
			size === "sm" ? "w-4 h-4" : size === "lg" ? "w-5 h-5" : "w-4 h-4";
		const chevronRight =
			size === "sm" ? "right-2" : size === "lg" ? "right-3.5" : "right-3";

		return (
			<div className={cn("relative flex w-full flex-col gap-1", wrapperClassName)}>
				{label ? (
					<label
						htmlFor={selectId}
						className={cn(labelVariants({ variant: resolvedVariant }))}
					>
						{label}
					</label>
				) : null}
				<div className="relative flex items-center">
					<select
						ref={ref}
						id={selectId}
						disabled={disabled}
						aria-invalid={errorMessage ? true : undefined}
						aria-describedby={displayedHelper ? helperTextId : undefined}
						className={cn(
							selectVariants({ variant: resolvedVariant, size }),
							className,
						)}
						{...props}
					>
						{placeholder ? (
							<option value="" disabled>
								{placeholder}
							</option>
						) : null}
						{options.map((option) => (
							<option
								key={option.value}
								value={option.value}
								disabled={option.disabled}
							>
								{option.label}
							</option>
						))}
					</select>
					<span
						className={cn(
							"absolute pointer-events-none flex items-center justify-center text-foreground/50",
							chevronRight,
						)}
						aria-hidden="true"
					>
						<svg
							className={chevronSize}
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<title>Expand</title>
							<path d="m6 9 6 6 6-6" />
						</svg>
					</span>
				</div>
				{displayedHelper ? (
					<p
						id={helperTextId}
						className={cn(helperVariants({ variant: resolvedVariant }))}
					>
						{displayedHelper}
					</p>
				) : null}
			</div>
		);
	},
);

Select.displayName = "Select";

export { Select };
