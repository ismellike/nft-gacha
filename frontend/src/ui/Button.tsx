"use client";

import type React from "react";
import { extendVariants } from "@heroui/react";
import { Button as HeroButton } from "@heroui/react";

export const GlassButton = extendVariants(HeroButton, {
	variants: {
		color: {
			glass:
				"bg-content1/10 backdrop-blur-2xl border border-white/15 text-foreground font-medium shadow-xl transition-all duration-300 hover:bg-content1/25 hover:border-white/25 hover:shadow-2xl hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:hover:scale-100 rounded-2xl",
			glassPrimary:
				"bg-gradient-to-r from-warning via-warning/90 to-orange-400 text-black font-bold border-2 border-warning/40 shadow-2xl shadow-warning/30 backdrop-blur-xl transition-all duration-300 hover:shadow-3xl hover:shadow-warning/40 hover:border-warning/60 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:hover:scale-100 rounded-2xl",
		},
		size: {
			sm: "px-4 py-2 text-sm min-h-9",
			md: "px-6 py-3 text-base min-h-11",
			lg: "px-8 py-4 text-lg min-h-12",
			xl: "px-12 py-6 text-xl min-h-16",
		},
	},
	defaultVariants: {
		color: "glass",
		size: "md",
		variant: "flat",
	},
});

export interface ButtonProps extends React.ComponentProps<typeof GlassButton> {}

const Button = GlassButton;

Button.displayName = "Button";

export { Button };
