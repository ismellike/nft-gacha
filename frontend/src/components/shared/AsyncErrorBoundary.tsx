"use client";

import { type ReactNode, Suspense } from "react";
import { ErrorBoundary } from "./ErrorBoundary";

interface AsyncErrorBoundaryProps {
	children: ReactNode;
	fallback?: ReactNode;
}

export function AsyncErrorBoundary({
	children,
	fallback,
}: AsyncErrorBoundaryProps) {
	return (
		<ErrorBoundary fallback={fallback}>
			<Suspense fallback={<LoadingFallback />}>{children}</Suspense>
		</ErrorBoundary>
	);
}

function LoadingFallback() {
	return (
		<div className="min-h-screen flex items-center justify-center">
			<div className="w-8 h-8 border-4 border-warning/30 border-t-warning rounded-full animate-spin" />
		</div>
	);
}
