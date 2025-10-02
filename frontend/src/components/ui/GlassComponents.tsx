"use client";

/**
 * Consistent Glass Theme Components for NFT Gacha
 * Single unified look across all components
 */

import { Button as HeroButton, Card as HeroCard, Chip as HeroChip, Input as HeroInput, Badge as HeroBadge } from "@heroui/react";

// Single consistent glass styling
const glassClasses = "bg-content1/20 backdrop-blur-xl border border-white/10 shadow-glass hover:bg-content1/30 hover:border-white/20 hover:shadow-glassHover transition-all duration-300";

// Glass Button - single consistent style
export const GlassButton = ({ className = "", ...props }: any) => (
	<HeroButton
		className={`bg-gradient-to-r from-warning to-orange-400 text-black font-medium border border-warning/30 shadow-glow hover:from-warning/90 hover:to-orange-500/90 hover:shadow-glowHover hover:scale-[1.02] active:scale-[0.97] transition-all duration-300 ${className}`}
		{...props}
	/>
);

// Glass Card - single consistent style
export const GlassCard = ({ className = "", ...props }: any) => (
	<HeroCard
		className={`${glassClasses} rounded-2xl ${className}`}
		{...props}
	/>
);

// Glass Chip - single consistent style
export const GlassChip = ({ className = "", ...props }: any) => (
	<HeroChip
		className={`bg-content1/20 backdrop-blur-xl border border-white/20 text-foreground/80 transition-all duration-200 rounded-2xl ${className}`}
		{...props}
	/>
);

// Glass Input - single consistent style
export const GlassInput = ({ className = "", ...props }: any) => (
	<HeroInput
		className={`bg-content1/20 backdrop-blur-xl border border-white/20 transition-all duration-200 focus:bg-content1/30 focus:border-warning/50 focus:ring-2 focus:ring-warning/20 placeholder:text-foreground/40 rounded-xl ${className}`}
		{...props}
	/>
);

// Glass Badge - single consistent style
export const GlassBadge = ({ className = "", ...props }: any) => (
	<HeroBadge
		className={`bg-content1/20 backdrop-blur-xl border border-white/20 text-foreground/80 transition-all duration-200 rounded-lg ${className}`}
		{...props}
	/>
);

// Glass modal helper classes
export const glassModalClasses = {
	backdrop: "bg-transparent backdrop-blur-sm",
	content: "bg-content1/10 backdrop-blur-2xl border border-white/20 shadow-2xl max-h-[90vh] rounded-2xl",
	contentDark: "bg-content1/5 backdrop-blur-2xl border border-white/10 shadow-2xl max-h-[90vh] rounded-2xl",
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
