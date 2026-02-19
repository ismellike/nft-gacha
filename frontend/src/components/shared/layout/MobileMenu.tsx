"use client";

import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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

	return (
		<>
			{/* Hamburger Button */}
			<button
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
						onClick={() => setIsOpen(false)}
						className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
					/>
				)}
			</AnimatePresence>

			{/* Mobile Drawer */}
			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ x: "100%" }}
						animate={{ x: 0 }}
						exit={{ x: "100%" }}
						transition={{
							type: "spring",
							damping: 25,
							stiffness: 200,
						}}
						className="fixed top-0 right-0 bottom-0 w-72 bg-background/95 backdrop-blur-xl border-l border-white/10 z-50 md:hidden"
					>
						{/* Header */}
						<div className="flex items-center justify-between p-4 border-b border-white/10">
							<span className="font-orbitron font-bold text-lg">Menu</span>
							<button
								type="button"
								onClick={() => setIsOpen(false)}
								className="p-2 rounded-lg hover:bg-content1/20 transition-colors"
								aria-label="Close menu"
							>
								<XMarkIcon className="w-6 h-6" />
							</button>
						</div>

						{/* Navigation Links */}
						<nav className="p-4 space-y-2" aria-label="Mobile navigation">
							{navItems.map((item) => {
								const isActive =
									item.href === "/"
										? pathname === "/"
										: pathname.startsWith(item.href);

								return (
									<Link
										key={item.href}
										href={item.href}
										onClick={() => setIsOpen(false)}
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
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}
