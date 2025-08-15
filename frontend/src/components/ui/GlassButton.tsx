/**
 * Reusable Glass Button Component
 * Implements glassmorphism styling using HeroUI's custom variants system
 */

import { Button } from "@heroui/react";
import { motion } from "framer-motion";
import { ReactNode } from "react";
import { glassButton } from "../../lib/theme-config";
import {
	ArrowPathIcon as Loader2,
	ChartBarIcon,
	GiftIcon,
	ClockIcon,
	CheckIcon,
	CurrencyDollarIcon,
	XCircleIcon,
	CubeIcon,
	ArrowLeftIcon,
	FunnelIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
	BoltIcon,
	CogIcon,
} from "@heroicons/react/24/outline";

type IconSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

// Helper function to map icon names to components
function getIconComponent(iconName: string, className: string) {
	const iconMap: Record<string, any> = {
		trending: ChartBarIcon,
		gem: GiftIcon,
		gift: GiftIcon,
		clock: ClockIcon,
		check: CheckIcon,
		coins: CurrencyDollarIcon,
		"x-circle": XCircleIcon,
		dice: CubeIcon,
		"arrow-left": ArrowLeftIcon,
		filter: FunnelIcon,
		left: ChevronLeftIcon,
		right: ChevronRightIcon,
		zap: BoltIcon,
		settings: CogIcon,
		refresh: Loader2,
	};

	const IconComponent = iconMap[iconName];
	if (!IconComponent) {
		console.warn(`Icon "${iconName}" not found`);
		return null;
	}

	return <IconComponent className={className} />;
}

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
	const getIconSizeClass = (iconSize?: IconSize, buttonSize?: string) => {
		if (iconSize) {
			switch (iconSize) {
				case "xs":
					return "w-3 h-3";
				case "sm":
					return "w-4 h-4";
				case "md":
					return "w-5 h-5";
				case "lg":
					return "w-6 h-6";
				case "xl":
					return "w-8 h-8";
				case "2xl":
					return "w-10 h-10";
				default:
					return "w-4 h-4";
			}
		}
		return buttonSize === "sm"
			? "w-4 h-4"
			: buttonSize === "lg"
				? "w-5 h-5"
				: "w-4 h-4";
	};

	const getIconVariantClass = (variant: string) => {
		switch (variant) {
			case "default":
				return "text-foreground";
			case "muted":
				return "text-foreground/60";
			case "accent":
				return "text-warning";
			case "success":
				return "text-success";
			case "warning":
				return "text-warning";
			case "danger":
				return "text-danger";
			default:
				return "text-foreground";
		}
	};

	const iconClassName = `${getIconSizeClass(iconSize, size)} ${getIconVariantClass(iconVariant)}`;

	// Content to display
	const buttonContent = isLoading ? (
		<div className="flex items-center justify-center space-x-2">
			<Loader2 className="w-4 h-4 animate-spin" />
			<span>{loadingText || "Loading..."}</span>
		</div>
	) : (
		<div className="flex items-center justify-center space-x-2">
			{startIcon && getIconComponent(startIcon, iconClassName)}
			<span>{children}</span>
			{endIcon && getIconComponent(endIcon, iconClassName)}
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
