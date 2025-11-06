"use client";

import React from "react";
import { extendVariants } from "@heroui/react";
import { Button as HeroButton } from "@heroui/react";

export const GlassButton = extendVariants(HeroButton, {
	variants: {
		color: {
			glass: "bg-content1/20 backdrop-blur-xl border border-white/20 text-foreground font-medium shadow-lg transition-all duration-300 hover:bg-content1/30 hover:border-white/30 hover:shadow-xl active:scale-[0.97] disabled:opacity-60 disabled:pointer-events-none",
			glassPrimary: "bg-gradient-to-r from-warning to-orange-400 text-black font-medium border border-warning/30 shadow-lg transition-all duration-300 hover:from-warning/90 hover:to-orange-500/90 hover:shadow-xl active:scale-[0.97] disabled:opacity-60 disabled:pointer-events-none",
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

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	(props, ref) => <GlassButton ref={ref} {...props} />,
);

Button.displayName = "Button";

export { Button };
