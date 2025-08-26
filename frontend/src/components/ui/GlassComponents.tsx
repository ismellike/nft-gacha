"use client";

/**
 * Custom HeroUI Components with Glassmorphism Variants
 * Following HeroUI custom variants pattern: https://www.heroui.com/docs/customization/custom-variants
 */

import { extendVariants } from "@heroui/react";
import {
	Button as HeroButton,
	Card as HeroCard,
	Chip as HeroChip,
	Modal as HeroModal,
	ModalContent as HeroModalContent,
	ModalHeader as HeroModalHeader,
	ModalBody as HeroModalBody,
	ModalFooter as HeroModalFooter,
} from "@heroui/react";

// Glass Button with custom variants following HeroUI patterns
export const GlassButton = extendVariants(HeroButton, {
	variants: {
		color: {
			glass: "bg-content1/20 backdrop-blur-xl border border-white/20 text-foreground shadow-lg hover:bg-content1/30 hover:border-white/30 hover:shadow-xl",
			glassPrimary: "bg-content1/20 backdrop-blur-xl border-2 border-warning/50 text-warning shadow-lg hover:bg-content1/30 hover:border-warning/70 hover:shadow-xl",
			glassDanger: "bg-content1/20 backdrop-blur-xl border-2 border-danger/50 text-danger shadow-lg hover:bg-content1/30 hover:border-danger/70 hover:shadow-xl",
			glassGhost: "bg-transparent text-foreground/70 hover:bg-content1/20 hover:text-foreground",
		},
		size: {
			xs: "px-2 min-w-12 h-6 text-tiny gap-1 rounded-small",
			sm: "px-4 min-w-16 h-8 text-small gap-2 rounded-small", 
			md: "px-6 min-w-20 h-10 text-medium gap-2 rounded-medium",
			lg: "px-8 min-w-24 h-12 text-large gap-3 rounded-medium",
			xl: "px-10 min-w-28 h-14 text-large gap-4 rounded-large",
		},
	},
	defaultVariants: {
		color: "glass",
		size: "md",
	},
});

// Glass Card with custom variants (slot-based component)
export const GlassCard = extendVariants(HeroCard, {
	variants: {
		glassVariant: {
			glass: {
				base: [
					"bg-content1/20 backdrop-blur-xl border border-white/10",
					"shadow-2xl rounded-2xl transition-all duration-300",
				],
			},
			glassInteractive: {
				base: [
					"bg-content1/20 backdrop-blur-xl border border-white/10",
					"shadow-2xl rounded-2xl transition-all duration-300 cursor-pointer",
					"hover:bg-content1/30 hover:border-white/20 hover:shadow-3xl",
					"focus:outline-none focus:ring-2 focus:ring-warning/50 focus:ring-offset-2",
					"data-[pressed=true]:scale-[0.98]",
				],
			},
			glassHighlight: {
				base: [
					"bg-content1/20 backdrop-blur-xl rounded-2xl transition-all duration-300",
					"border-warning/30 bg-gradient-to-r from-warning/10 to-orange-400/10",
					"shadow-xl shadow-warning/10",
				],
			},
			glassFloating: {
				base: [
					"bg-content1/20 backdrop-blur-xl border border-white/10",
					"shadow-xl shadow-black/20 rounded-2xl transition-all duration-300",
					"hover:shadow-2xl hover:shadow-black/30 hover:-translate-y-1",
				],
			},
		},
	},
	defaultVariants: {
		glassVariant: "glass",
	},
});

// Glass Chip with custom variants (slot-based component)
export const GlassChip = extendVariants(HeroChip, {
	variants: {
		glassVariant: {
			glass: {
				base: [
					"bg-content1/20 backdrop-blur-xl border border-white/20",
					"text-foreground/80 transition-all duration-200",
				],
			},
			glassPrimary: {
				base: [
					"bg-gradient-to-r from-warning/20 to-orange-400/20",
					"border-warning/30 text-warning backdrop-blur-xl",
				],
			},
			glassSuccess: {
				base: [
					"bg-success/20 border-success/30 text-success backdrop-blur-xl",
				],
			},
			glassDanger: {
				base: [
					"bg-danger/20 border-danger/30 text-danger backdrop-blur-xl",
				],
			},
			glassWarning: {
				base: [
					"bg-warning/20 border-warning/30 text-warning backdrop-blur-xl",
				],
			},
		},
	},
	defaultVariants: {
		glassVariant: "glass",
	},
});

// Glass Modal components - using className approach for complex slot-based components
// Modal components have complex slot structures that are difficult to extend with variants
export const GlassModal = HeroModal;
export const GlassModalContent = HeroModalContent;
export const GlassModalHeader = HeroModalHeader; 
export const GlassModalBody = HeroModalBody;
export const GlassModalFooter = HeroModalFooter;

// Helper classes for glass modal styling (use with className prop)
export const glassModalClasses = {
	backdrop: "bg-transparent backdrop-blur-sm",
	content: "bg-content1/10 backdrop-blur-2xl border border-white/20 shadow-2xl max-h-[90vh]",
	contentDark: "bg-content1/5 backdrop-blur-2xl border border-white/10 shadow-2xl max-h-[90vh]", 
	header: "border-b border-white/10 backdrop-blur-xl flex-shrink-0",
	headerDark: "border-b border-white/5 backdrop-blur-xl flex-shrink-0",
	body: "backdrop-blur-xl overflow-auto flex-1",
	footer: "border-t border-white/10 backdrop-blur-xl flex-shrink-0",
	footerDark: "border-t border-white/5 backdrop-blur-xl flex-shrink-0",
};

// Export all components for easy importing
export {
	GlassButton as Button,
	GlassCard as Card,
	GlassChip as Chip,
	GlassModal as Modal,
	GlassModalContent as ModalContent,
	GlassModalHeader as ModalHeader,
	GlassModalBody as ModalBody,
	GlassModalFooter as ModalFooter,
};
