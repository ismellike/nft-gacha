"use client";

import React from "react";
import { extendVariants } from "@heroui/react";
import { Button as HeroButton } from "@heroui/react";

export const GlassButton = extendVariants(HeroButton, {
	variants: {
		color: {
			glass:
				"bg-content1/20 backdrop-blur-xl border border-white/20 text-foreground font-medium shadow-[0_0_6px_rgba(255,255,255,0.06),0_0_12px_rgba(255,255,255,0.03)] hover:bg-content1/30 hover:border-white/30 hover:shadow-[0_0_8px_rgba(255,255,255,0.08),0_0_16px_rgba(255,255,255,0.04)] data-[pressed=true]:scale-[0.97] transition-all duration-300 disabled:bg-gray-800/20 disabled:border-gray-600/30 disabled:text-gray-400 disabled:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] disabled:cursor-not-allowed disabled:hover:bg-gray-800/20 disabled:hover:border-gray-600/30 disabled:hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] disabled:backdrop-blur-md disabled:opacity-70 disabled:saturate-50",
			primary:
				"bg-gradient-to-r from-warning to-orange-400 text-black font-medium border border-warning/30 shadow-[0_0_8px_rgba(255,191,0,0.25),0_0_16px_rgba(255,191,0,0.08)] hover:from-warning/90 hover:to-orange-500/90 hover:shadow-[0_0_12px_rgba(255,191,0,0.3),0_0_24px_rgba(255,191,0,0.1)] data-[pressed=true]:scale-[0.97] disabled:from-gray-700/40 disabled:to-gray-600/30 disabled:text-gray-400 disabled:border-gray-600/40 disabled:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_0_4px_rgba(0,0,0,0.2)] disabled:cursor-not-allowed disabled:hover:from-gray-700/40 disabled:hover:to-gray-600/30 disabled:hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_0_4px_rgba(0,0,0,0.2)] disabled:opacity-60 disabled:saturate-30",
			warning:
				"bg-gradient-to-r from-warning to-amber-500 text-black font-medium border border-warning/30 shadow-[0_0_8px_rgba(255,191,0,0.25),0_0_16px_rgba(255,191,0,0.08)] hover:from-warning/90 hover:to-amber-600/90 hover:shadow-[0_0_12px_rgba(255,191,0,0.3),0_0_24px_rgba(255,191,0,0.1)] data-[pressed=true]:scale-[0.97] disabled:from-gray-700/40 disabled:to-gray-600/30 disabled:text-gray-400 disabled:border-gray-600/40 disabled:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_0_4px_rgba(0,0,0,0.2)] disabled:cursor-not-allowed disabled:hover:from-gray-700/40 disabled:hover:to-gray-600/30 disabled:hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_0_4px_rgba(0,0,0,0.2)] disabled:opacity-60 disabled:saturate-30",
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

export interface ButtonProps extends React.ComponentProps<typeof GlassButton> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	(props, ref) => <GlassButton ref={ref as any} {...props} />,
);

Button.displayName = "Button";

export { Button };
