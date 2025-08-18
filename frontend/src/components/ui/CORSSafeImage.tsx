"use client";

import { useState, useEffect } from "react";
import { cn } from "../../lib/theme-config";
import { useImageWithFallbacks } from "../../lib/image-proxy";

export interface CORSSafeImageProps {
	src: string | null | undefined;
	alt: string;
	className?: string;
	width?: number;
	height?: number;
	onLoad?: () => void;
	onError?: (error: string) => void;
	crossOrigin?: "anonymous" | "use-credentials" | "";
	referrerPolicy?:
		| "no-referrer-when-downgrade"
		| "no-referrer"
		| "origin"
		| "origin-when-cross-origin"
		| "same-origin"
		| "strict-origin"
		| "strict-origin-when-cross-origin"
		| "unsafe-url";
	loading?: "lazy" | "eager";
	placeholder?: React.ReactNode;
	showRetryIndicator?: boolean;
}

/**
 * CORS-safe image component with automatic fallback handling
 * Specifically designed for external NFT images that may have CORS restrictions
 */
export function CORSSafeImage({
	src,
	alt,
	className,
	width,
	height,
	onLoad,
	onError,
	crossOrigin = "anonymous",
	referrerPolicy = "no-referrer-when-downgrade",
	loading = "lazy",
	placeholder,
	showRetryIndicator = true,
}: CORSSafeImageProps) {
	const { finalUrl, isLoading, error, attempt } = useImageWithFallbacks(src);
	const [imageLoaded, setImageLoaded] = useState(false);

	useEffect(() => {
		if (error) {
			onError?.(error);
		}
	}, [error, onError]);

	const handleImageLoad = () => {
		setImageLoaded(true);
		onLoad?.();
	};

	const handleImageError = (
		e: React.SyntheticEvent<HTMLImageElement, Event>,
	) => {
		console.error("CORSSafeImage final load failed:", {
			src: e.currentTarget.src,
			finalUrl,
			originalSrc: src,
		});
	};

	// Show placeholder while loading
	if (isLoading || !finalUrl) {
		return (
			<div
				className={cn(
					"flex items-center justify-center bg-white/5 rounded-lg",
					className,
				)}
				style={{ width, height }}
			>
				{placeholder || (
					<div className="flex flex-col items-center gap-2 p-4">
						<div className="w-6 h-6 border-2 border-white/30 border-t-white/70 rounded-full animate-spin" />
						{showRetryIndicator && attempt > 0 && (
							<div className="text-xs text-white/60 text-center">
								Trying alternative {attempt}...
							</div>
						)}
					</div>
				)}
			</div>
		);
	}

	// Show error if all attempts failed
	if (error && !finalUrl) {
		return (
			<div
				className={cn(
					"flex items-center justify-center bg-red-500/10 border border-red-500/20 rounded-lg text-red-300",
					className,
				)}
				style={{ width, height }}
			>
				<div className="text-xs text-center p-2">Failed to load image</div>
			</div>
		);
	}

	return (
		<img
			src={finalUrl}
			alt={alt}
			className={className}
			width={width}
			height={height}
			crossOrigin={crossOrigin}
			referrerPolicy={referrerPolicy}
			loading={loading}
			onLoad={handleImageLoad}
			onError={handleImageError}
		/>
	);
}

/**
 * Specialized version for NFT images with common presets
 */
export function NFTImage({
	src,
	alt,
	className,
	size = "md",
	rounded = true,
	...props
}: Omit<CORSSafeImageProps, "width" | "height"> & {
	size?: "sm" | "md" | "lg" | "xl";
	rounded?: boolean;
}) {
	const sizePresets = {
		sm: { width: 128, height: 128 },
		md: { width: 256, height: 256 },
		lg: { width: 384, height: 384 },
		xl: { width: 512, height: 512 },
	};

	const { width, height } = sizePresets[size];

	return (
		<CORSSafeImage
			src={src}
			alt={alt}
			width={width}
			height={height}
			className={cn("object-cover", rounded && "rounded-2xl", className)}
			{...props}
		/>
	);
}
