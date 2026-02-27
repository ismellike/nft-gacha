import {
	ChartBarIcon,
	CubeIcon,
	HomeIcon,
	MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { logger } from "@/lib/logger";

/**
 * Shared helper that maps a nav icon name to a Heroicons component.
 * Used by both Header and MobileMenu to avoid duplicating the switch logic.
 */
export function getNavIcon(iconName: string, className: string) {
	switch (iconName) {
		case "home":
			return <HomeIcon className={className} aria-hidden="true" />;
		case "dice":
			return <CubeIcon className={className} aria-hidden="true" />;
		case "search":
			return <MagnifyingGlassIcon className={className} aria-hidden="true" />;
		case "chart":
			return <ChartBarIcon className={className} aria-hidden="true" />;
		default:
			logger.general.warn(`Nav icon "${iconName}" not found`);
			return null;
	}
}
