/**
 * Reusable Glass Button Component
 * Implements glassmorphism styling using HeroUI's custom variants system
 */

import { Button } from "@heroui/react";
import { motion } from "framer-motion";
import { ReactNode } from "react";
import { glassButton } from "../../lib/theme-config";
import { ArrowPathIcon as Loader2 } from "@heroicons/react/24/outline";
import { ThemedIcon } from "../../lib/icons";
import type { IconSize } from "../../lib/icons";

export interface GlassButtonProps {
	children: ReactNode;
	variant?: "primary" | "secondary" | "danger" | "ghost";
	size?: "sm" | "md" | "lg";
	isLoading?: boolean;
	isDisabled?: boolean;
	className?: string;
	animate?: boolean;
	onClick?: () => void;
	loadingText?: string;
	// Icon props
	startIcon?: string;
	endIcon?: string;
	iconSize?: IconSize;
	iconVariant?:
		| "default"
		| "muted"
		| "accent"
		| "success"
		| "warning"
		| "danger";
	// Accessibility props - Enhanced with stricter typing
	"aria-label"?: string;
	"aria-labelledby"?: string;
	"aria-describedby"?: string;
	"aria-expanded"?: boolean;
	"aria-controls"?: string;
	"aria-pressed"?: boolean;
	"aria-haspopup"?:
		| boolean
		| "false"
		| "true"
		| "menu"
		| "listbox"
		| "tree"
		| "grid"
		| "dialog";
	role?: "button" | "tab" | "menuitem" | "link" | "switch";
	type?: "button" | "submit" | "reset";
	"data-testid"?: string;
	tabIndex?: number;
	// Form-related props
	form?: string;
	formAction?: string;
	formMethod?: "get" | "post";
	formTarget?: string;
}

export function GlassButton({
	children,
	variant = "primary",
	size = "md",
	isLoading = false,
	isDisabled = false,
	className,
	animate = true,
	onClick,
	loadingText,
	startIcon,
	endIcon,
	iconSize,
	iconVariant = "default",
	"aria-label": ariaLabel,
	"aria-labelledby": ariaLabelledBy,
	"aria-describedby": ariaDescribedBy,
	"aria-expanded": ariaExpanded,
	"aria-controls": ariaControls,
	"aria-pressed": ariaPressed,
	"aria-haspopup": ariaHasPopup,
	role,
	type = "button",
	"data-testid": dataTestId,
	tabIndex,
	form,
	formAction,
	formMethod,
	formTarget,
}: GlassButtonProps) {
	// Generate classes using our custom variant system
	const buttonStyles = glassButton({
		variant,
		size,
		isLoading,
		animate,
		className,
	});

	const ButtonComponent = animate ? motion(Button) : Button;

	const motionProps =
		animate && !isLoading && !isDisabled
			? {
					whileHover: { scale: 1.02 },
					whileTap: { scale: 0.98 },
					transition: { type: "spring" as const, stiffness: 400, damping: 17 },
				}
			: {};

	// Determine icon size based on button size if not explicitly set
	const effectiveIconSize: IconSize =
		iconSize || (size === "sm" ? "sm" : size === "lg" ? "md" : "sm");

	// Content to display
	const buttonContent = isLoading ? (
		<div className="flex items-center justify-center space-x-2">
			<Loader2 className="w-4 h-4 animate-spin" />
			<span>{loadingText || "Loading..."}</span>
		</div>
	) : (
		<div className="flex items-center justify-center space-x-2">
			{startIcon && (
				<ThemedIcon
					name={startIcon}
					size={effectiveIconSize}
					variant={iconVariant}
				/>
			)}
			<span>{children}</span>
			{endIcon && (
				<ThemedIcon
					name={endIcon}
					size={effectiveIconSize}
					variant={iconVariant}
				/>
			)}
		</div>
	);

	return (
		<ButtonComponent
			className={buttonStyles}
			isLoading={false} // Handle loading state manually for better control
			isDisabled={isDisabled || isLoading}
			onPress={onClick}
			aria-label={ariaLabel}
			aria-labelledby={ariaLabelledBy}
			aria-describedby={ariaDescribedBy}
			aria-expanded={ariaExpanded}
			aria-controls={ariaControls}
			aria-pressed={ariaPressed}
			aria-haspopup={ariaHasPopup}
			role={role}
			data-testid={dataTestId}
			tabIndex={tabIndex}
			form={form}
			formAction={formAction}
			formMethod={formMethod}
			formTarget={formTarget}
			{...motionProps}
		>
			{/* Shimmer effect for primary variant */}
			{variant === "primary" && !isLoading && !isDisabled && (
				<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700 ease-in-out" />
			)}

			<span className="relative z-10">{buttonContent}</span>
		</ButtonComponent>
	);
}
