"use client";

/**
 * Consistent Glass Theme Components for NFT Gacha
 * Single unified look across all components
 */

import {
	Button as HeroButton,
	Card as HeroCard,
	Chip as HeroChip,
	Input as HeroInput,
	Badge as HeroBadge,
	extendVariants,
} from "@heroui/react";

// Glass Button - single consistent style
export const GlassButton = extendVariants(HeroButton, {
	variants: {
		color: {
			glass: "bg-content1/20 backdrop-blur-xl border border-white/20 text-foreground font-medium shadow-[0_0_6px_rgba(255,255,255,0.06),0_0_12px_rgba(255,255,255,0.03)] hover:bg-content1/30 hover:border-white/30 hover:shadow-[0_0_8px_rgba(255,255,255,0.08),0_0_16px_rgba(255,255,255,0.04)] data-[pressed=true]:scale-[0.97] transition-all duration-300",
			primary: "bg-gradient-to-r from-warning to-orange-400 text-black font-medium border border-warning/30 shadow-[0_0_8px_rgba(255,191,0,0.25),0_0_16px_rgba(255,191,0,0.08)] hover:from-warning/90 hover:to-orange-500/90 hover:shadow-[0_0_12px_rgba(255,191,0,0.3),0_0_24px_rgba(255,191,0,0.1)] data-[pressed=true]:scale-[0.97]",
		},
		size: {
			sm: "px-4 min-w-16 h-8 text-tiny gap-1 rounded-xl",
			md: "px-6 min-w-20 h-10 text-small gap-2 rounded-xl",
			lg: "px-8 min-w-24 h-12 text-medium gap-3 rounded-xl",
			xl: "px-20 min-w-32 h-16 text-large gap-4 rounded-xl",
		},
	},
	defaultVariants: {
		color: "glass",
		size: "lg",
	},
});

// Glass Card - single consistent style
export const GlassCard = extendVariants(HeroCard, {
	variants: {
		isHoverable: {
			true: {
				base: "hover:bg-content1/30 hover:border-white/20 hover:shadow-3xl transition-all duration-300 cursor-pointer",
			},
		},
		isPressable: {
			true: {
				base: "cursor-pointer hover:bg-content1/30 hover:border-white/20 hover:shadow-3xl focus:outline-none focus:ring-2 focus:ring-warning/50 focus:ring-offset-2 focus:ring-offset-background data-[pressed=true]:scale-[0.98] transition-all duration-300",
			},
		},
	},
	defaultVariants: {
		shadow: "lg",
		radius: "lg",
	},
	slots: {
		base: "bg-content1/20 backdrop-blur-xl border border-white/10 transition-all duration-300 rounded-2xl shadow-2xl",
	},
});

// Glass Chip - single consistent style
export const GlassChip = extendVariants(HeroChip, {
	variants: {
		color: {
			glass: {
				base: "bg-content1/20 backdrop-blur-xl border border-white/20 text-foreground/80",
			},
			primary: {
				base: "bg-gradient-to-r from-warning/20 to-orange-400/20 border border-warning/30 text-warning",
			},
			success: {
				base: "bg-success/20 border border-success/30 text-success",
			},
			warning: {
				base: "bg-warning/20 border border-warning/30 text-warning",
			},
			danger: {
				base: "bg-danger/20 border border-danger/30 text-danger",
			},
		},
		variant: {
			flat: {
				base: "bg-content1/20 backdrop-blur-xl border border-white/20 text-foreground/80",
			},
			bordered: {
				base: "bg-content1/10 backdrop-blur-xl border border-white/30 text-foreground/80",
			},
			light: {
				base: "bg-content1/5 backdrop-blur-xl border border-white/10 text-foreground/60",
			},
		},
		size: {
			sm: {
				base: "h-6 min-w-12 px-2 text-tiny rounded-lg",
				content: "text-tiny",
			},
			md: {
				base: "h-8 min-w-16 px-3 text-small rounded-xl",
				content: "text-small",
			},
			lg: {
				base: "h-10 min-w-20 px-4 text-medium rounded-xl",
				content: "text-medium",
			},
		},
	},
	defaultVariants: {
		color: "glass",
		variant: "flat",
		size: "md",
	},
	slots: {
		base: "transition-all duration-200",
		closeButton: "text-foreground/60 hover:text-foreground",
	},
});

// Glass Input - single consistent style
export const GlassInput = extendVariants(HeroInput, {
	variants: {
		variant: {
			flat: {
				base: "bg-content1/20 backdrop-blur-xl border border-white/20 transition-all duration-200",
				inputWrapper: "focus-within:bg-content1/30 focus-within:border-warning/50 focus-within:ring-2 focus-within:ring-warning/20 hover:bg-content1/25",
			},
			bordered: {
				base: "bg-content1/10 backdrop-blur-xl border-2 border-white/30 transition-all duration-200",
				inputWrapper: "focus-within:bg-content1/20 focus-within:border-warning/50 focus-within:ring-2 focus-within:ring-warning/20 hover:bg-content1/15",
			},
			faded: {
				base: "bg-content1/5 backdrop-blur-xl border border-white/10 transition-all duration-200",
				inputWrapper: "focus-within:bg-content1/25 focus-within:border-warning/40 focus-within:ring-1 focus-within:ring-warning/10 hover:bg-content1/10",
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
		inputWrapper: "group-data-[focus=true]:ring-2 group-data-[focus=true]:ring-warning/20 group-data-[focus=true]:border-warning/50 transition-all duration-200",
		input: "bg-transparent text-foreground placeholder:text-foreground/40",
		label: "text-foreground",
		description: "text-foreground/60",
		errorMessage: "text-danger",
	},
});

// Glass Badge - single consistent style
export const GlassBadge = extendVariants(HeroBadge, {
	variants: {
		color: {
			glass: {
				base: "bg-content1/20 backdrop-blur-xl border border-white/20 text-foreground/80",
				badge: "bg-content1/30 backdrop-blur-xl border border-white/30 text-foreground",
			},
			primary: {
				base: "bg-gradient-to-r from-warning/20 to-orange-400/20 border border-warning/30 text-warning",
				badge: "bg-gradient-to-r from-warning/40 to-orange-400/40 border border-warning/50 text-warning",
			},
			success: {
				base: "bg-success/20 border border-success/30 text-success",
				badge: "bg-success/40 border border-success/50 text-success",
			},
			warning: {
				base: "bg-warning/20 border border-warning/30 text-warning",
				badge: "bg-warning/40 border border-warning/50 text-warning",
			},
			danger: {
				base: "bg-danger/20 border border-danger/30 text-danger",
				badge: "bg-danger/40 border border-danger/50 text-danger",
			},
		},
		variant: {
			flat: {
				base: "bg-content1/20 backdrop-blur-xl border border-white/20 text-foreground/80",
				badge: "bg-content1/30 backdrop-blur-xl border border-white/30 text-foreground",
			},
			solid: {
				base: "bg-content1/30 backdrop-blur-xl border border-white/30 text-foreground",
				badge: "bg-content1/40 backdrop-blur-xl border border-white/40 text-foreground",
			},
			faded: {
				base: "bg-content1/10 backdrop-blur-xl border border-white/10 text-foreground/60",
				badge: "bg-content1/20 backdrop-blur-xl border border-white/20 text-foreground/80",
			},
			shadow: {
				base: "bg-content1/25 backdrop-blur-xl border border-white/25 text-foreground/80 shadow-lg",
				badge: "bg-content1/35 backdrop-blur-xl border border-white/35 text-foreground shadow-xl",
			},
		},
		size: {
			sm: {
				base: "text-tiny",
				badge: "min-w-[12px] h-3 text-tiny px-1 text-tiny rounded-sm",
			},
			md: {
				base: "text-small",
				badge: "min-w-[16px] h-4 text-small px-1.5 text-small rounded-md",
			},
			lg: {
				base: "text-medium",
				badge: "min-w-[20px] h-5 text-medium px-2 text-medium rounded-lg",
			},
		},
	},
	defaultVariants: {
		color: "glass",
		variant: "flat",
		size: "md",
	},
	slots: {
		base: "transition-all duration-200",
		badge: "transition-all duration-200",
	},
});

// Glass modal helper classes
export const glassModalClasses = {
	backdrop: "bg-transparent backdrop-blur-sm",
	content:
		"bg-content1/10 backdrop-blur-2xl border border-white/20 shadow-2xl max-h-[90vh] rounded-2xl",
	contentDark:
		"bg-content1/5 backdrop-blur-2xl border border-white/10 shadow-2xl max-h-[90vh] rounded-2xl",
	header: "border-b border-white/10 backdrop-blur-xl flex-shrink-0 p-6",
	headerDark: "border-b border-white/5 backdrop-blur-xl flex-shrink-0 p-6",
	body: "backdrop-blur-xl overflow-auto flex-1 p-6",
	footer: "border-t border-white/10 backdrop-blur-xl flex-shrink-0 p-6",
	footerDark: "border-t border-white/5 backdrop-blur-xl flex-shrink-0 p-6",
};

// Export all components
export {
	GlassButton as Button,
	GlassCard as Card,
	GlassChip as Chip,
	GlassInput as Input,
	GlassBadge as Badge,
};
