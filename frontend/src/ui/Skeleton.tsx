"use client";

import * as React from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { cn } from "../lib/theme-config";

const skeleton = tv({
	base: "animate-pulse rounded-xl bg-white/5",
	variants: {
		variant: {
			default: "bg-white/5",
			card: "bg-content1/20 border border-white/10",
			text: "bg-white/10",
			button: "bg-white/10",
			image: "bg-white/5",
			circle: "rounded-full",
		},
		size: {
			sm: "h-4 w-16",
			md: "h-6 w-24",
			lg: "h-8 w-32",
			full: "w-full",
			h4: "h-4",
			h6: "h-6",
			h8: "h-8",
			h12: "h-12",
			h16: "h-16",
			h20: "h-20",
			h24: "h-24",
			h32: "h-32",
			w4: "w-4",
			w6: "w-6",
			w8: "w-8",
			w10: "w-10",
			w12: "w-12",
			w16: "w-16",
			w20: "w-20",
			w24: "w-24",
		},
	},
	defaultVariants: {
		variant: "default",
		size: "full",
	},
});

const VALID_SIZES = [
	"full",
	"sm",
	"md",
	"lg",
	"h4",
	"h6",
	"h8",
	"h12",
	"h16",
	"h20",
	"h24",
	"h32",
	"w4",
	"w6",
	"w8",
	"w10",
	"w12",
	"w16",
	"w20",
	"w24",
] as const;

export interface SkeletonProps
	extends React.HTMLAttributes<HTMLDivElement>,
		Omit<VariantProps<typeof skeleton>, "size"> {
	/** Optional children to render inside the skeleton */
	children?: React.ReactNode;
	/** Size preset for the skeleton - custom string allowed */
	size?: string;
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
	(
		{ className, variant: variantProp, size: sizeProp, children, ...props },
		ref,
	) => {
		// Map string sizes to tailwind-variants compatible values
		const getSizeClass = (size?: string) => {
			if (!size) return "";
			return size;
		};

		const sizeVariant = getSizeClass(sizeProp) as VariantProps<
			typeof skeleton
		>["size"];

		return (
			// biome-ignore lint/a11y/useSemanticElements: <output> is for form results, role="status" is correct for loading indicators
			<div
				ref={ref}
				role="status"
				aria-busy="true"
				className={cn(
					skeleton({
						variant: variantProp,
						size: sizeVariant,
					}),
					sizeProp &&
						!(VALID_SIZES as readonly string[]).includes(sizeProp)
						? sizeProp
						: "",
					className,
				)}
				{...props}
			>
				<span className="sr-only">Loading</span>
				{children}
			</div>
		);
	},
);

Skeleton.displayName = "Skeleton";

// Card skeleton component
export const CardSkeleton: React.FC<{
	className?: string;
	children?: React.ReactNode;
}> = ({ className, children }) => (
	// biome-ignore lint/a11y/useSemanticElements: role="status" is correct for loading indicators
	<div
		role="status"
		aria-busy="true"
		aria-label="Loading card"
		className={cn(
			"rounded-2xl border border-white/10 bg-content1/20 p-6 backdrop-blur-xl",
			className,
		)}
	>
		{children || (
			<div className="space-y-4">
				<Skeleton variant="text" size="h8" className="w-1/3" aria-hidden="true" />
				<Skeleton variant="text" size="h6" className="w-2/3" aria-hidden="true" />
				<Skeleton variant="text" size="h6" className="w-1/2" aria-hidden="true" />
				<div className="pt-4 space-y-3">
					<Skeleton variant="button" size="h12" aria-hidden="true" />
					<Skeleton variant="button" size="h12" className="w-2/3" aria-hidden="true" />
				</div>
			</div>
		)}
	</div>
);

// List skeleton component
export const ListSkeleton: React.FC<{
	items?: number;
	className?: string;
}> = ({ items = 3, className }) => {
	const skeletonItems = Array.from(
		{ length: items },
		(_, idx) => `list-skeleton-${idx}`,
	);

	return (
		// biome-ignore lint/a11y/useSemanticElements: role="status" is correct for loading indicators
		<div role="status" aria-busy="true" aria-label="Loading list" className={cn("space-y-3", className)}>
			{skeletonItems.map((itemKey) => (
				<div
					key={itemKey}
					className="flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-content1/20"
					aria-hidden="true"
				>
					<Skeleton variant="circle" size="w12 h12" aria-hidden="true" />
					<div className="flex-1 space-y-2">
						<Skeleton variant="text" size="h6" className="w-1/3" aria-hidden="true" />
						<Skeleton variant="text" size="h4" className="w-2/3" aria-hidden="true" />
					</div>
					<Skeleton variant="button" size="h8 w20" aria-hidden="true" />
				</div>
			))}
		</div>
	);
};

// Stats skeleton component
export const StatsSkeleton: React.FC<{ className?: string }> = ({
	className,
}) => {
	const statsSkeletons = Array.from(
		{ length: 3 },
		(_, idx) => `stats-skeleton-${idx}`,
	);

	return (
		// biome-ignore lint/a11y/useSemanticElements: role="status" is correct for loading indicators
		<div role="status" aria-busy="true" aria-label="Loading stats" className={cn("grid gap-4", className)}>
			{statsSkeletons.map((skeletonKey) => (
				<div
					key={skeletonKey}
					className="flex items-center gap-3 rounded-2xl border border-white/10 bg-content1/40 p-3"
					aria-hidden="true"
				>
					<Skeleton variant="circle" size="w10 h10" aria-hidden="true" />
					<div className="flex-1">
						<Skeleton variant="text" size="h4" className="w-1/2" aria-hidden="true" />
						<Skeleton variant="text" size="h6" className="w-1/3" aria-hidden="true" />
					</div>
				</div>
			))}
		</div>
	);
};

// Form skeleton component
export const FormSkeleton: React.FC<{ className?: string }> = ({
	className,
}) => (
	// biome-ignore lint/a11y/useSemanticElements: role="status" is correct for loading indicators
	<div role="status" aria-busy="true" aria-label="Loading form" className={cn("space-y-4", className)}>
		<div className="space-y-2">
			<Skeleton variant="text" size="h4" className="w-1/4" aria-hidden="true" />
			<Skeleton variant="button" size="h12" aria-hidden="true" />
		</div>
		<div className="space-y-2">
			<Skeleton variant="text" size="h4" className="w-1/3" aria-hidden="true" />
			<Skeleton variant="button" size="h12" aria-hidden="true" />
		</div>
		<Skeleton variant="button" size="h12" className="w-1/2" aria-hidden="true" />
	</div>
);

// Spinner button skeleton for gacha spin button
export const SpinnerButtonSkeleton: React.FC<{ className?: string }> = ({
	className,
}) => (
	// biome-ignore lint/a11y/useSemanticElements: role="status" is correct for loading indicators
	<div
		role="status"
		aria-busy="true"
		aria-label="Loading spin button"
		className={cn(
			"h-14 bg-content1/30 rounded-xl animate-pulse w-full max-w-xs mx-auto",
			className,
		)}
	/>
);

export { Skeleton };
