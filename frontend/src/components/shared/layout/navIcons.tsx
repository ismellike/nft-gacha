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
