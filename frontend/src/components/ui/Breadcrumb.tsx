/**
 * Breadcrumb Navigation Component
 * Provides accessible navigation breadcrumbs with glassmorphism styling
 */

import { Fragment } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ChevronRightIcon } from "@heroicons/react/24/outline";

// Helper function to get breadcrumb icons
function getBreadcrumbIcon(
	iconName: string | undefined,
	className: string = "w-4 h-4",
) {
	if (!iconName) return null;

	// Import commonly used icons
	const {
		HomeIcon,
		EyeIcon,
		BoltIcon,
		FolderOpenIcon,
		GiftIcon,
		CogIcon,
	} = require("@heroicons/react/24/outline");

	switch (iconName) {
		case "home":
			return <HomeIcon className={className} />;
		case "eye":
			return <EyeIcon className={className} />;
		case "zap":
			return <BoltIcon className={className} />;
		case "folder-open":
			return <FolderOpenIcon className={className} />;
		case "gift":
			return <GiftIcon className={className} />;
		case "settings":
			return <CogIcon className={className} />;
		default:
			return null;
	}
}
import { glassBreadcrumb } from "../../lib/theme-config";

interface BreadcrumbItem {
	label: string;
	href?: string;
	icon?: string;
	current?: boolean;
}

interface BreadcrumbProps {
	items: BreadcrumbItem[];
	className?: string;
	animate?: boolean;
}

export function Breadcrumb({
	items,
	className,
	animate = true,
}: BreadcrumbProps) {
	const router = useRouter();

	const handleNavigate = (href: string) => {
		router.push(href);
	};

	const {
		base,
		list,
		item: itemClass,
		link,
		current,
		separator,
	} = glassBreadcrumb();

	const Container = animate ? motion.nav : "nav";

	const motionProps = animate
		? {
				initial: { opacity: 0, y: -10 },
				animate: { opacity: 1, y: 0 },
				transition: { duration: 0.3 },
			}
		: {};

	return (
		<Container
			className={`${base()} ${className || ""}`}
			aria-label="Breadcrumb navigation"
			{...motionProps}
		>
			<ol className={list()} role="list">
				{items.map((item, index) => {
					const isLast = index === items.length - 1;
					const isCurrent = item.current || isLast;

					return (
						<Fragment key={index}>
							<li className={itemClass()}>
								{item.href && !isCurrent ? (
									<button
										onClick={() => handleNavigate(item.href!)}
										className={link()}
										aria-label={`Navigate to ${item.label}`}
									>
										{getBreadcrumbIcon(item.icon, "w-4 h-4")}
										<span>{item.label}</span>
									</button>
								) : (
									<div
										className={current()}
										aria-current={isCurrent ? "page" : undefined}
									>
										{getBreadcrumbIcon(
											item.icon,
											`w-4 h-4 ${isCurrent ? "text-warning" : "text-foreground"}`,
										)}
										<span>{item.label}</span>
									</div>
								)}
							</li>

							{!isLast && (
								<li className={itemClass()} aria-hidden="true">
									<ChevronRightIcon className={`w-4 h-4 ${separator()}`} />
								</li>
							)}
						</Fragment>
					);
				})}
			</ol>
		</Container>
	);
}

// Specialized breadcrumb for gacha navigation
interface GachaBreadcrumbProps {
	gachaTitle?: string;
	gachaId?: string;
	currentSection?: string;
	className?: string;
}

export function GachaBreadcrumb({
	gachaTitle,
	gachaId,
	currentSection,
	className,
}: GachaBreadcrumbProps) {
	const items: BreadcrumbItem[] = [
		{
			label: "Home",
			href: "/",
			icon: "home",
		},
		{
			label: "Discover",
			href: "/discover",
			icon: "eye",
		},
	];

	if (gachaTitle && gachaId) {
		items.push({
			label: gachaTitle,
			href: `/gacha?id=${gachaId}`,
			icon: "zap",
		});

		if (currentSection) {
			const sectionLabels: Record<string, { label: string; icon: string }> = {
				spin: { label: "Spin & Play", icon: "zap" },
				whitelist: { label: "Collections", icon: "folder-open" },
				rewards: { label: "My Rewards", icon: "gift" },
				admin: { label: "Admin", icon: "settings" },
			};

			const sectionInfo = sectionLabels[currentSection];
			if (sectionInfo) {
				items.push({
					label: sectionInfo.label,
					icon: sectionInfo.icon,
					current: true,
				});
			}
		}
	}

	return <Breadcrumb items={items} className={className} />;
}
