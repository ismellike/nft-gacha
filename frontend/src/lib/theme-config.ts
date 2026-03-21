/**
 * Custom HeroUI Theme Configuration
 * Defines glassmorphism variants and component customizations
 */

import { twMerge } from "tailwind-merge";
import { tv } from "tailwind-variants";

// Glassmorphism Button Variants
export const glassButton = tv({
	base: [
		"inline-flex items-center justify-center gap-2",
		"backdrop-blur-xl rounded-xl transition-all duration-300 relative overflow-hidden",
		"focus:outline-none focus-visible:ring-2 focus-visible:ring-warning/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
		"disabled:opacity-60 disabled:pointer-events-none",
	],
	variants: {
		variant: {
			primary: [
				"bg-gradient-to-r from-warning to-orange-400 text-black font-medium",
				"shadow-[0_0_8px_rgba(255,191,0,0.25),0_0_16px_rgba(255,191,0,0.08)]",
				"hover:from-warning/90 hover:to-orange-500/90",
				"hover:shadow-[0_0_12px_rgba(255,191,0,0.3),0_0_24px_rgba(255,191,0,0.1)]",
				"data-[pressed=true]:scale-[0.97]",
			],
			secondary: [
				"bg-content1/15 backdrop-blur-xl border border-white/20 text-foreground font-medium",
				"shadow-[0_0_6px_rgba(255,255,255,0.06),0_0_12px_rgba(255,255,255,0.03)]",
				"hover:bg-content1/30 hover:border-white/30",
				"hover:shadow-[0_0_8px_rgba(255,255,255,0.08),0_0_16px_rgba(255,255,255,0.04)]",
				"data-[pressed=true]:scale-[0.97]",
			],
			danger: [
				"bg-danger/20 backdrop-blur-xl border border-danger/30 text-danger font-medium",
				"shadow-[0_0_6px_rgba(239,68,68,0.2),0_0_12px_rgba(239,68,68,0.08)]",
				"hover:bg-danger/30 hover:border-danger/40",
				"hover:shadow-[0_0_8px_rgba(239,68,68,0.25),0_0_16px_rgba(239,68,68,0.1)]",
				"data-[pressed=true]:scale-[0.97]",
			],
			ghost: [
				"bg-transparent text-foreground/70 font-medium",
				"hover:bg-content1/20 hover:text-foreground",
				"data-[pressed=true]:scale-[0.97]",
			],
			warning: [
				"bg-warning/20 text-warning font-semibold border border-warning/30 backdrop-blur-xl",
				"hover:bg-warning/30 hover:border-warning/40",
				"data-[pressed=true]:scale-[0.97]",
			],
			light: [
				"bg-content1/15 border border-white/10 text-foreground",
				"hover:bg-content1/25 hover:border-white/20",
				"data-[pressed=true]:scale-[0.97]",
			],
		},
		size: {
			sm: "px-4 py-2 text-sm min-h-[36px]",
			md: "px-6 py-3 text-base min-h-[44px]",
			lg: "px-8 py-4 text-lg min-h-[52px]",
		},
		isLoading: {
			true: "cursor-wait",
		},
		animate: {
			true: "transition-transform",
			false: "",
		},
	},
	defaultVariants: {
		variant: "primary",
		size: "md",
		animate: true,
	},
});

// Glassmorphism Card Variants
export const glassCard = tv({
	base: [
		"bg-content1/20 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl",
		"transition-all duration-300",
	],
	variants: {
		variant: {
			base: "",
			interactive: [
				"cursor-pointer",
				"hover:bg-content1/25 hover:border-white/20 hover:shadow-3xl",
				"focus:outline-none focus-visible:ring-2 focus-visible:ring-warning/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
				"data-[pressed=true]:scale-[0.98]",
			],
			highlight: [
				"border-warning/30 bg-gradient-to-r from-warning/10 to-orange-400/10",
				"shadow-xl shadow-warning/10",
			],
			floating: [
				"shadow-xl shadow-black/20",
				"hover:shadow-2xl hover:shadow-black/30",
				"hover:-translate-y-1",
			],
			error: [
				"bg-danger/10 border border-danger/20",
				"shadow-lg shadow-danger/5",
			],
			success: [
				"bg-success/10 border border-success/20",
				"shadow-lg shadow-success/5",
			],
		},
		padding: {
			none: "",
			sm: "p-4",
			md: "p-6",
			lg: "p-8",
		},
		animate: {
			true: "transition-transform hover:scale-[1.02]",
			false: "",
		},
	},
	defaultVariants: {
		variant: "base",
		padding: "md",
		animate: false,
	},
});

// Glassmorphism Badge Variants
export const glassBadge = tv({
	base: [
		"inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-xl",
		"backdrop-blur-xl border transition-all duration-200",
	],
	variants: {
		variant: {
			primary: [
				"bg-gradient-to-r from-warning/20 to-orange-400/20",
				"border-warning/30 text-warning",
			],
			secondary: ["bg-content1/20 border-white/20 text-foreground/80"],
			success: ["bg-success/20 border-success/30 text-success"],
			warning: ["bg-warning/20 border-warning/30 text-warning"],
			danger: ["bg-danger/20 border-danger/30 text-danger"],
			info: ["bg-primary/20 border-primary/30 text-primary"],
		},
		size: {
			sm: "px-2 py-1 text-xs",
			md: "px-3 py-1.5 text-xs",
			lg: "px-4 py-2 text-sm",
		},
	},
	defaultVariants: {
		variant: "primary",
		size: "md",
	},
});

// Glassmorphism Modal Variants
export const glassModal = tv({
	slots: {
		wrapper: [
			"fixed inset-0 z-50 flex items-center justify-center",
			"bg-transparent",
		],
		backdrop: [
			"absolute inset-0 bg-transparent backdrop-blur-sm",
			"data-[state=open]:animate-in data-[state=open]:fade-in-0",
			"data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
		],
		base: [
			"relative bg-content1/30 backdrop-blur-2xl border border-white/15",
			"shadow-2xl rounded-2xl max-h-[90vh] overflow-hidden",
			"data-[state=open]:animate-in data-[state=open]:zoom-in-95 data-[state=open]:fade-in-0",
			"data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=closed]:fade-out-0",
		],
		header: "flex flex-col gap-1 p-6 pb-2 border-b border-white/10",
		body: "flex-1 px-6 py-2 overflow-auto",
		footer: "flex gap-2 p-6 pt-2 border-t border-white/10",
	},
	variants: {
		size: {
			xs: { base: "max-w-xs" },
			sm: { base: "max-w-sm" },
			md: { base: "max-w-md" },
			lg: { base: "max-w-lg" },
			xl: { base: "max-w-xl" },
			"2xl": { base: "max-w-2xl" },
			"3xl": { base: "max-w-3xl" },
			"4xl": { base: "max-w-4xl" },
			"5xl": {
				base: "max-w-5xl h-[85vh]",
				header: "p-8 pb-4",
				body: "px-8 py-4",
				footer: "p-8 pt-4",
			},
			"6xl": {
				base: "max-w-6xl h-[85vh]",
				header: "p-8 pb-4",
				body: "px-8 py-4",
				footer: "p-8 pt-4",
			},
			"7xl": {
				base: "max-w-[95vw] h-[90vh]",
				header: "p-6 pb-4",
				body: "px-6 py-4",
				footer: "p-6 pt-4",
			},
			full: { base: "w-full h-full max-w-none max-h-none rounded-none" },
		},
		placement: {
			center: { wrapper: "items-center justify-center" },
			top: { wrapper: "items-start justify-center pt-16" },
			bottom: { wrapper: "items-end justify-center pb-16" },
		},
	},
	defaultVariants: {
		size: "md",
		placement: "center",
	},
});

// Typography Variants
export const glassTypography = tv({
	variants: {
		variant: {
			mainHeading: ["text-3xl font-light text-foreground tracking-tight"],
			secondaryHeading: ["text-2xl font-light text-foreground tracking-tight"],
			accentHeading: [
				"text-xl font-bold bg-gradient-to-r from-warning to-orange-400 bg-clip-text text-transparent",
			],
			body: "text-foreground",
			bodySecondary: "text-foreground/80",
			bodyMuted: "text-foreground/60",
			accent: "text-warning",
		},
	},
});

// Utility function for combining classes
type ClassInput =
	| string
	| undefined
	| null
	| boolean
	| (string | undefined | null | boolean)[];
export const cn = (...inputs: ClassInput[]): string =>
	twMerge(inputs.flat().filter(Boolean).join(" "));
