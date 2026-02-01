"use client";

export function SkipToContent() {
	return (
		<a
			href="#main-content"
			className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:p-4 bg-content1 border border-white/20 rounded-lg text-warning font-medium"
		>
			Skip to main content
		</a>
	);
}
