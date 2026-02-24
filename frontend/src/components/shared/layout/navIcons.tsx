import {
	CubeIcon,
	HomeIcon,
	MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

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
		default:
			console.warn(`Nav icon "${iconName}" not found`);
			return null;
	}
}
