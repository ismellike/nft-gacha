/**
 * HeroUI Theme Extensions
 * Centralized theme configuration for consistent glassmorphism design
 */

// Glass morphism utility functions for consistent styling
export const getGlassProps = (variant: "glass" | "glassPrimary" = "glass") => {
	switch (variant) {
		case "glass":
			return {
				color: "glass",
				variant: "flat" as const,
				radius: "md" as const,
			};
		case "glassPrimary":
			return {
				color: "glassPrimary",
				variant: "flat" as const,
				radius: "md" as const,
			};
		default:
			return {
				color: "glass",
				variant: "flat" as const,
				radius: "md" as const,
			};
	}
};

export const getGlassCardProps = (interactive: boolean = false) => ({
	color: interactive ? "glassInteractive" : "glass",
	variant: "flat" as const,
	radius: "lg" as const,
	shadow: "medium" as const,
	className: interactive ? "cursor-pointer" : "",
});

export const getGlassInputProps = () => ({
	color: "glass" as const,
	variant: "flat" as const,
	radius: "md" as const,
	placeholder: "Enter value...",
});

export const getGlassModalProps = () => ({
	color: "glass" as const,
	variant: "flat" as const,
	radius: "lg" as const,
	shadow: "medium" as const,
	backdrop: "blur" as const,
});
