import { cn } from "../../../lib/theme-config";
import { Button } from "../../../ui";

interface SpinButtonProps {
	buttonText: string;
	disabled: boolean;
	isLoading: boolean;
	isWaitingForFulfillment: boolean;
	isRevealing: boolean;
	isError: boolean;
	onClick: () => void;
}

export function SpinButton({
	buttonText,
	disabled,
	isLoading,
	isWaitingForFulfillment,
	isRevealing,
	isError,
	onClick,
}: SpinButtonProps) {
	return (
		<div className="relative group">
			{/* Glow effect on hover */}
			<div className="absolute inset-0 bg-gradient-to-r from-warning/30 via-warning/20 to-orange-400/30 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500 scale-110" />

			<Button
				color="glassPrimary"
				size="lg"
				onPress={onClick}
				disabled={disabled}
				isLoading={isLoading}
				className={cn(
					isWaitingForFulfillment
						? "border-orange-400/60 shadow-orange-400/40"
						: undefined,
					isRevealing
						? "bg-gradient-to-r from-success via-success/90 to-emerald-400 border-success/40 shadow-success/30"
						: undefined,
					isError
						? "bg-gradient-to-r from-danger via-danger/90 to-red-600 border-danger/40 shadow-danger/30"
						: undefined,
				)}
				>
				<div className="flex items-center justify-center gap-3">
					{isWaitingForFulfillment && (
						<svg
							className="w-6 h-6 animate-spin"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							strokeWidth={2}
						>
							<title>Processing</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
							/>
						</svg>
					)}
					{isRevealing && (
						<svg
							className="w-6 h-6"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							strokeWidth={2}
						>
							<title>Revealing</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
							/>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
							/>
						</svg>
					)}
					{isError && (
						<svg
							className="w-6 h-6"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							strokeWidth={2}
						>
							<title>Error</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"
							/>
						</svg>
					)}
					{!isWaitingForFulfillment && !isRevealing && !isError && (
						<svg
							className="w-6 h-6"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							strokeWidth={2}
						>
							<title>Spin</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M13 10V3L4 14h7v7l9-11h-7z"
							/>
						</svg>
					)}
					<span className="font-bold tracking-wide">{buttonText}</span>
				</div>
			</Button>
		</div>
	);
}
