"use client";

import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { WalletButton } from "../WalletButton";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { getNavIcon } from "./navIcons";

interface NavItem {
	href: string;
	label: string;
	icon: string;
}

interface MobileMenuProps {
	navItems: NavItem[];
}

export function MobileMenu({ navItems }: MobileMenuProps) {
	const [isOpen, setIsOpen] = useState(false);
	const pathname = usePathname();
	const hamburgerRef = useRef<HTMLButtonElement>(null);
	const drawerRef = useRef<HTMLDivElement>(null);

	const closeMenu = useCallback(() => {
		setIsOpen(false);
		hamburgerRef.current?.focus();
	}, []);

	// Escape key listener
	useEffect(() => {
		if (!isOpen) return;

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				closeMenu();
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [isOpen, closeMenu]);

	// Focus trap
	useEffect(() => {
		if (!isOpen || !drawerRef.current) return;

		const drawer = drawerRef.current;

		const handleTabKey = (e: KeyboardEvent) => {
			if (e.key !== "Tab") return;

			const focusableElements = drawer.querySelectorAll<HTMLElement>(
				'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])',
			);
			if (focusableElements.length === 0) return;

			const firstElement = focusableElements[0];
			const lastElement = focusableElements[focusableElements.length - 1];

			if (e.shiftKey) {
				if (document.activeElement === firstElement) {
					e.preventDefault();
					lastElement.focus();
				}
			} else {
				if (document.activeElement === lastElement) {
					e.preventDefault();
					firstElement.focus();
				}
			}
		};

		drawer.addEventListener("keydown", handleTabKey);

		// Focus the first focusable element in the drawer
		const firstFocusable = drawer.querySelector<HTMLElement>(
			'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])',
		);
		firstFocusable?.focus();

		return () => drawer.removeEventListener("keydown", handleTabKey);
	}, [isOpen]);

	return (
		<>
			{/* Hamburger Button */}
			<button
				ref={hamburgerRef}
				type="button"
				onClick={() => setIsOpen(true)}
				className="md:hidden p-2 rounded-lg hover:bg-content1/20 transition-colors"
				aria-label="Open menu"
			>
				<Bars3Icon className="w-6 h-6" />
			</button>

			{/* Overlay Backdrop */}
			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={closeMenu}
						className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
					/>
				)}
			</AnimatePresence>

			{/* Mobile Drawer */}
			<AnimatePresence>
				{isOpen && (
					<motion.div
						ref={drawerRef}
						initial={{ x: "100%" }}
						animate={{ x: 0 }}
						exit={{ x: "100%" }}
						transition={{
							type: "spring",
							damping: 25,
							stiffness: 200,
						}}
						className="fixed top-0 right-0 bottom-0 w-72 flex flex-col bg-background/95 backdrop-blur-xl border-l border-white/10 z-50 md:hidden"
						role="dialog"
						aria-modal="true"
						aria-label="Mobile navigation menu"
					>
						{/* Header */}
						<div className="flex items-center justify-between p-4 border-b border-white/10">
							<span className="font-orbitron font-bold text-lg">Menu</span>
							<button
								type="button"
								onClick={closeMenu}
								className="p-2 rounded-lg hover:bg-content1/20 transition-colors"
								aria-label="Close menu"
							>
								<XMarkIcon className="w-6 h-6" />
							</button>
						</div>

						{/* Navigation Links */}
						<nav
							className="p-4 space-y-2 flex-1 overflow-y-auto"
							aria-label="Mobile navigation"
						>
							{navItems.map((item) => {
								const isActive =
									item.href === "/"
										? pathname === "/"
										: pathname.startsWith(item.href);

								return (
									<Link
										key={item.href}
										href={item.href}
										onClick={closeMenu}
										aria-current={isActive ? "page" : undefined}
									>
										<motion.div
											className={`px-4 py-3 rounded-xl transition-all font-medium ${
												isActive
													? "bg-gradient-to-r from-warning/20 to-orange-400/20 border border-warning/30 text-warning"
													: "text-foreground/70 hover:text-foreground hover:bg-content1/20"
											}`}
											whileTap={{ scale: 0.98 }}
										>
											<span className="flex items-center gap-3">
												{getNavIcon(item.icon, "w-5 h-5")}
												{item.label}
											</span>
										</motion.div>
									</Link>
								);
							})}
						</nav>

						{/* Wallet Connect */}
						<div className="p-4 border-t border-white/10 mt-auto">
							<WalletButton />
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}
