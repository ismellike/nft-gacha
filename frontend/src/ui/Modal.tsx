"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import type { VariantProps } from "tailwind-variants";
import { glassModal, cn } from "../lib/theme-config";

type ModalVariants = VariantProps<typeof glassModal>;

type ModalContextValue = {
	size: ModalVariants["size"];
	placement: ModalVariants["placement"];
	hideCloseButton: boolean;
};

const ModalContext = React.createContext<ModalContextValue | null>(null);

const useModalContext = () => {
	const context = React.useContext(ModalContext);
	if (!context) {
		throw new Error("Modal components must be used within <Modal>");
	}
	return context;
};

export interface ModalProps
	extends Omit<
			React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root>,
			"open" | "defaultOpen" | "onOpenChange"
		>,
		ModalVariants {
	isOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
	hideCloseButton?: boolean;
	onClose?: () => void;
}

export function Modal({
	children,
	isOpen,
	onOpenChange,
	onClose,
	size = "md",
	placement = "center",
	hideCloseButton = false,
	...props
}: ModalProps) {
	const handleOpenChange = (open: boolean) => {
		onOpenChange?.(open);
		if (!open && onClose) {
			onClose();
		}
	};

	return (
		<DialogPrimitive.Root
			{...(isOpen !== undefined ? { open: isOpen } : {})}
			onOpenChange={handleOpenChange}
			{...props}
		>
			<ModalContext.Provider value={{ size, placement, hideCloseButton }}>
				{children}
			</ModalContext.Provider>
		</DialogPrimitive.Root>
	);
}

export interface ModalContentProps
	extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {}

const ModalContent = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Content>,
	ModalContentProps
>(({ className, children, ...props }, ref) => {
	const { size, placement, hideCloseButton } = useModalContext();
	const styles = glassModal({ size, placement });

	return (
		<DialogPrimitive.Portal>
			<div className={styles.wrapper()}>
				<DialogPrimitive.Overlay className={styles.backdrop()} />
				<DialogPrimitive.Content
					ref={ref}
					className={cn(styles.base(), className)}
					{...props}
				>
					{!hideCloseButton && (
						<DialogPrimitive.Close
							className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-content1/40 text-foreground/70 transition hover:scale-105 hover:border-white/30 hover:text-foreground"
							aria-label="Close"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								className="h-4 w-4"
							>
								<title>Close modal</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M18 6 6 18M6 6l12 12"
								/>
							</svg>
							<span className="sr-only">Close</span>
						</DialogPrimitive.Close>
					)}
					{children}
				</DialogPrimitive.Content>
			</div>
		</DialogPrimitive.Portal>
	);
});

ModalContent.displayName = "ModalContent";

interface ModalSectionProps extends React.HTMLAttributes<HTMLDivElement> {}

const ModalBody = React.forwardRef<HTMLDivElement, ModalSectionProps>(
	({ className, ...props }, ref) => {
		const { size, placement } = useModalContext();
		const styles = glassModal({ size, placement });
		return (
			<div ref={ref} className={cn(styles.body(), className)} {...props} />
		);
	},
);

ModalBody.displayName = "ModalBody";

export { ModalContent, ModalBody };
