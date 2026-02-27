"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/theme-config";

const inputVariants = cva(
	[
		"w-full rounded-xl border bg-content1/20 backdrop-blur-xl text-foreground",
		"transition-all duration-200 outline-none",
		"placeholder:text-foreground/40",
		"disabled:opacity-50 disabled:cursor-not-allowed",
		"focus:bg-content1/30 focus:shadow-[0_0_0_2px_rgba(201,168,108,0.25)]",
	],
	{
		variants: {
			variant: {
				default: [
					"border-white/20",
					"hover:border-white/30 hover:bg-content1/25",
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
				sm: "px-3 py-2 text-sm min-h-[36px]",
				md: "px-4 py-3 text-base min-h-[44px]",
				lg: "px-5 py-4 text-lg min-h-[52px]",
			},
			hasLeftIcon: {
				true: "pl-10",
				false: "",
			},
			hasRightIcon: {
				true: "pr-10",
				false: "",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "md",
			hasLeftIcon: false,
			hasRightIcon: false,
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

export interface InputProps
	extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
		Omit<VariantProps<typeof inputVariants>, "hasLeftIcon" | "hasRightIcon"> {
	label?: string | undefined;
	helperText?: string | undefined;
	errorMessage?: string | undefined;
	leftIcon?: React.ReactNode | undefined;
	rightIcon?: React.ReactNode | undefined;
	wrapperClassName?: string | undefined;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
	(
		{
			className,
			variant,
			size,
			label,
			helperText,
			errorMessage,
			leftIcon,
			rightIcon,
			disabled,
			wrapperClassName,
			id,
			...props
		},
		ref,
	) => {
		const generatedId = React.useId();
		const inputId = id ?? generatedId;
		const helperTextId = `${inputId}-helper`;

		const resolvedVariant = errorMessage ? "error" : (variant ?? "default");
		const displayedHelper = errorMessage ?? helperText;

		return (
			<div className={cn("relative flex w-full flex-col gap-1", wrapperClassName)}>
				{label ? (
					<label
						htmlFor={inputId}
						className={cn(labelVariants({ variant: resolvedVariant }))}
					>
						{label}
					</label>
				) : null}
				<div className="relative flex items-center">
					{leftIcon ? (
						<span
							className="absolute left-3 flex items-center justify-center text-foreground/50 pointer-events-none"
							aria-hidden="true"
						>
							{leftIcon}
						</span>
					) : null}
					<input
						ref={ref}
						id={inputId}
						disabled={disabled}
						aria-invalid={errorMessage ? true : undefined}
						aria-describedby={displayedHelper ? helperTextId : undefined}
						className={cn(
							inputVariants({
								variant: resolvedVariant,
								size,
								hasLeftIcon: leftIcon != null,
								hasRightIcon: rightIcon != null,
							}),
							className,
						)}
						{...props}
					/>
					{rightIcon ? (
						<span
							className="absolute right-3 flex items-center justify-center text-foreground/50 pointer-events-none"
							aria-hidden="true"
						>
							{rightIcon}
						</span>
					) : null}
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

Input.displayName = "Input";

export { Input };
