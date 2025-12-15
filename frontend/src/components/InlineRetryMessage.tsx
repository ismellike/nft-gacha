"use client";

import { useState } from "react";
import { ExclamationTriangleIcon, ArrowPathIcon, WifiIcon, WalletIcon } from "@heroicons/react/24/outline";
import { Button } from "../ui";
import { cn } from "../lib/theme-config";

export type RetryMessageType = "wallet" | "network" | "contract" | "general";

interface InlineRetryMessageProps {
	type: RetryMessageType;
	message?: string;
	onRetry?: () => void | Promise<void>;
	isRetrying?: boolean;
	className?: string;
	compact?: boolean;
}

const defaultMessages = {
	wallet: "Wallet connection issue. Please check your wallet is connected.",
	network: "Network connection unstable. Retrying connection...",
	contract: "Contract call failed. This usually resolves automatically.",
	general: "Something went wrong. Please try again.",
};

const icons = {
	wallet: WalletIcon,
	network: WifiIcon,
	contract: ExclamationTriangleIcon,
	general: ExclamationTriangleIcon,
};

const ariaLabels = {
	wallet: "Wallet connection status",
	network: "Network connection status",
	contract: "Contract interaction status",
	general: "Application status",
};

export function InlineRetryMessage({
	type,
	message,
	onRetry,
	isRetrying = false,
	className,
	compact = false,
}: InlineRetryMessageProps) {
	const [retryCount, setRetryCount] = useState(0);
	const [lastError, setLastError] = useState<string | null>(null);

	const handleRetry = async () => {
		if (!onRetry || isRetrying) return;

		try {
			setRetryCount(prev => prev + 1);
			setLastError(null);
			await onRetry();
		} catch (error) {
			setLastError(error instanceof Error ? error.message : "Unknown error");
		}
	};

	const Icon = icons[type];
	const displayMessage = message || defaultMessages[type];
	const ariaLabel = ariaLabels[type];

	if (compact) {
		return (
			<div
				className={cn(
					"flex items-center gap-2 text-sm",
					type === "wallet" && "text-warning/80",
					type === "network" && "text-foreground/60",
					type === "contract" && "text-warning/80",
					type === "general" && "text-foreground/60",
					className,
				)}
				role="status"
				aria-live="polite"
				aria-label={ariaLabel}
			>
				<Icon className="w-4 h-4 flex-shrink-0" />
				<span className="flex-1">{displayMessage}</span>
				{onRetry && !isRetrying && (
					<button
						onClick={handleRetry}
						className="text-foreground/50 hover:text-foreground transition-colors"
						aria-label={`Retry ${type} connection`}
					>
						<ArrowPathIcon className="w-4 h-4" />
					</button>
				)}
			</div>
		);
	}

	return (
		<div
			className={cn(
				"rounded-xl border p-4",
				type === "wallet" && "border-warning/20 bg-warning/5",
				type === "network" && "border-foreground/20 bg-content1/10",
				type === "contract" && "border-warning/20 bg-warning/5",
				type === "general" && "border-foreground/20 bg-content1/10",
				className,
			)}
			role="status"
			aria-live="polite"
			aria-label={ariaLabel}
		>
			<div className="flex items-start gap-3">
				<Icon
					className={cn(
						"w-5 h-5 flex-shrink-0 mt-0.5",
						type === "wallet" && "text-warning",
						type === "network" && "text-foreground/60",
						type === "contract" && "text-warning",
						type === "general" && "text-foreground/60",
					)}
				/>
				<div className="flex-1 min-w-0">
					<p className="text-sm text-foreground/80 mb-2">{displayMessage}</p>

					{retryCount > 0 && (
						<p className="text-xs text-foreground/50 mb-2">
							Retried {retryCount} {retryCount === 1 ? "time" : "times"}
							{isRetrying && "..."}
						</p>
					)}

					{lastError && (
						<p className="text-xs text-warning/60 mb-2">Error: {lastError}</p>
					)}

					{onRetry && (
						<Button
							size="sm"
							color="glass"
							onPress={handleRetry}
							isDisabled={isRetrying}
							isLoading={isRetrying}
							startContent={<ArrowPathIcon className={cn("w-4 h-4", isRetrying && "animate-spin")} />}
							className="h-8"
						>
							{isRetrying ? "Retrying..." : "Retry"}
						</Button>
					)}
				</div>
			</div>
		</div>
	);
}

// Hook for managing retry state
export function useRetryState(onRetry: () => Promise<void>, maxRetries: number = 3) {
	const [isRetrying, setIsRetrying] = useState(false);
	const [retryCount, setRetryCount] = useState(0);
	const [shouldRetry, setShouldRetry] = useState(true);

	const handleRetry = async () => {
		if (!shouldRetry || retryCount >= maxRetries || isRetrying) return;

		setIsRetrying(true);
		try {
			await onRetry();
			setRetryCount(prev => prev + 1);

			// Disable further retries after max attempts
			if (retryCount + 1 >= maxRetries) {
				setShouldRetry(false);
			}
		} catch (error) {
			console.error("Retry failed:", error);
		} finally {
			setIsRetrying(false);
		}
	};

	const reset = () => {
		setRetryCount(0);
		setShouldRetry(true);
		setIsRetrying(false);
	};

	return {
		isRetrying,
		retryCount,
		shouldRetry,
		handleRetry,
		reset,
		canRetry: shouldRetry && retryCount < maxRetries && !isRetrying,
	};
}