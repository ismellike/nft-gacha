"use client";

import React from "react";
import { extendVariants } from "@heroui/react";
import { Modal as HeroModal } from "@heroui/react";

export const GlassModal = extendVariants(HeroModal, {
	defaultVariants: {
		size: "lg",
		placement: "center",
	},
	variants: {
		size: {
			full: {
				base: "bg-content1/10 backdrop-blur-2xl border border-white/10 shadow-2xl max-w-[95vw] max-h-[95vh] rounded-2xl",
			},
		},
	},
	slots: {
		backdrop: "bg-transparent backdrop-blur-sm",
		base: "bg-content1/10 backdrop-blur-2xl border border-white/10 shadow-2xl max-h-[90vh] rounded-2xl",
		header: "border-b border-white/5 backdrop-blur-xl flex-shrink-0 p-6",
		body: "backdrop-blur-xl overflow-auto flex-1 p-6",
		footer: "border-t border-white/5 backdrop-blur-xl flex-shrink-0 p-6",
		closeButton: "text-foreground/70 hover:text-foreground transition-colors",
	},
});

export interface ModalProps extends React.ComponentProps<typeof GlassModal> {
	// Override to ensure default glass styling
	className?: string;
}

const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
	({ className = "", ...props }, ref) => (
		<GlassModal
			ref={ref as any}
			{...props}
		/>
	),
);

Modal.displayName = "Modal";

export { Modal };