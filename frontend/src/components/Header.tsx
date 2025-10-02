"use client";

import { memo, useMemo } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
	HomeIcon,
	CubeIcon,
	MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

// Helper function to get icon component
function getNavIcon(iconName: string, className: string) {
	switch (iconName) {
		case "home":
			return <HomeIcon className={className} />;
		case "dice":
			return <CubeIcon className={className} />;
		case "search":
			return <MagnifyingGlassIcon className={className} />;
		default:
			console.warn(`Nav icon "${iconName}" not found`);
			return null;
	}
}

export const Header = memo(() => {
	const pathname = usePathname();

	const navItems = useMemo(
		() => [
			{ href: "/", label: "Home", icon: "home" },
			{ href: "/discover", label: "Discover", icon: "dice" },
			{ href: "/appraisal", label: "NFT Appraisal", icon: "search" },
		],
		[],
	);

	return (
		<div className="relative">
			{/* Spacing element to create gap from top */}
			<div className="h-8"></div>

			{/* Floating Header */}
			<div className="sticky top-8 z-40 max-w-7xl mx-auto px-6">
				<div className="bg-content1/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-glass">
					<div className="flex items-center justify-between px-8 py-6">
						{/* Logo */}
						<Link href="/" className="flex items-center space-x-4 group">
							<div className="relative">
								{/* Subtle glow effect behind logo */}
								<div className="absolute inset-0 bg-gradient-to-r from-warning/30 via-orange-400/20 to-warning/30 rounded-2xl blur-md animate-pulse opacity-60" />

								<motion.div
									className="relative w-12 h-12 flex items-center justify-center transition-all duration-300 group-hover:scale-105"
									animate={{
										rotate: -360,
									}}
									transition={{
										duration: 20,
										repeat: Infinity,
										ease: "linear",
									}}
								>
									<Image
										src="/logo.webp"
										alt="SPINFI Logo"
										width={48}
										height={48}
										className="w-full h-full object-contain relative z-10 filter drop-shadow-lg group-hover:drop-shadow-xl transition-all duration-300"
									/>
								</motion.div>
							</div>
							<h1 className="text-3xl font-black font-orbitron bg-gradient-to-r from-warning to-orange-400 bg-clip-text text-transparent group-hover:from-warning/90 group-hover:to-orange-400/90 transition-all duration-300">
								SPINFI
							</h1>
						</Link>

						{/* Navigation Items */}
						<div className="hidden md:flex items-center space-x-6">
							{navItems.map((item) => {
								const isActive =
									item.href === "/"
										? pathname === "/"
										: pathname.startsWith(item.href);

								return (
									<Link key={item.href} href={item.href}>
										<motion.div
											className={`px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
												isActive
													? "bg-gradient-to-r from-warning/20 to-orange-400/20 border border-warning/30 text-warning"
													: "text-foreground/70 hover:text-foreground hover:bg-content1/20"
											}`}
											whileHover={{ scale: 1.05 }}
											whileTap={{ scale: 0.95 }}
											transition={{
												type: "spring",
												stiffness: 400,
												damping: 17,
											}}
										>
											<div className="flex items-center space-x-2">
												{getNavIcon(
													item.icon,
													`w-5 h-5 ${
														isActive ? "text-warning" : "text-foreground"
													}`,
												)}
												<span className="font-orbitron">{item.label}</span>
											</div>
										</motion.div>
									</Link>
								);
							})}
						</div>

						{/* Connect Button */}
						<ConnectButton />
					</div>
				</div>
			</div>
		</div>
	);
});
Header.displayName = "Header";
