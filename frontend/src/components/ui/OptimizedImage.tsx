"use client";

import Image from "next/image";
import { CORSSafeImage, type CORSSafeImageProps } from "./CORSSafeImage";

export interface OptimizedImageProps
	extends Omit<CORSSafeImageProps, "width" | "height"> {
	src: string | null | undefined;
	alt: string;
	width: number;
	height: number;
	priority?: boolean;
	quality?: number;
	fill?: boolean;
	sizes?: string;
	unoptimized?: boolean;
	// Force use of CORS-safe fallback instead of Next.js Image
	forceFallback?: boolean;
}

/**
 * Intelligent image component that chooses between Next.js Image optimization
 * and CORS-safe fallback based on the image source
 */
export function OptimizedImage({
	src,
	alt,
	width,
	height,
	priority = false,
	quality = 75,
	fill = false,
	sizes,
	unoptimized = false,
	forceFallback = false,
	className,
	onLoad,
	onError,
	...props
}: OptimizedImageProps) {
	// Determine if we should use Next.js Image or fallback
	const shouldUseFallback =
		forceFallback ||
		!src ||
		src.includes("courtyard.io") ||
		src.includes("ipfs.") ||
		src.startsWith("ipfs://") ||
		src.includes("cors-anywhere") ||
		src.includes("images.weserv.nl");

	// Use CORS-safe fallback for external/problematic images
	if (shouldUseFallback) {
		return (
			<CORSSafeImage
				src={src}
				alt={alt}
				width={width}
				height={height}
				className={className}
				onLoad={onLoad}
				onError={onError}
				{...props}
			/>
		);
	}

	// Use Next.js Image for local or trusted images
	return (
		<Image
			src={src || ""}
			alt={alt}
			width={fill ? undefined : width}
			height={fill ? undefined : height}
			fill={fill}
			priority={priority}
			quality={quality}
			sizes={sizes}
			unoptimized={unoptimized}
			className={className}
			onLoad={onLoad}
			onError={(e) => {
				// Fallback to CORS-safe loading if Next.js Image fails
				console.warn("Next.js Image failed, falling back to CORS-safe loading");
				onError?.(e.toString());
			}}
		/>
	);
}

/**
 * Preset for NFT images with optimized settings
 */
export function OptimizedNFTImage({
	src,
	alt,
	size = "md",
	priority = false,
	...props
}: Omit<OptimizedImageProps, "width" | "height"> & {
	size?: "sm" | "md" | "lg" | "xl";
	priority?: boolean;
}) {
	const sizePresets = {
		sm: { width: 128, height: 128, sizes: "(max-width: 640px) 96px, 128px" },
		md: { width: 256, height: 256, sizes: "(max-width: 640px) 192px, 256px" },
		lg: { width: 384, height: 384, sizes: "(max-width: 640px) 256px, 384px" },
		xl: { width: 512, height: 512, sizes: "(max-width: 640px) 320px, 512px" },
	};

	const { width, height, sizes } = sizePresets[size];

	return (
		<OptimizedImage
			src={src}
			alt={alt}
			width={width}
			height={height}
			sizes={sizes}
			priority={priority}
			quality={85}
			unoptimized={false}
			// Force fallback for NFT images since they're usually external
			forceFallback={true}
			{...props}
		/>
	);
}
