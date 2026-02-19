import { Card } from "../../../ui";

interface SpinErrorDisplayProps {
	userCancelledMessage: boolean;
	permitFailed: boolean;
	feeMismatchError: boolean;
	isGachaUnavailable: boolean;
	tokenSymbol: string | undefined;
	gachaAddress: string | undefined;
}

export function SpinErrorDisplay({
	userCancelledMessage,
	permitFailed,
	feeMismatchError,
	isGachaUnavailable,
	tokenSymbol,
	gachaAddress,
}: SpinErrorDisplayProps) {
	return (
		<>
			{/* User Cancelled Message */}
			{userCancelledMessage && (
				<div className="animate-fade-in text-center text-xs text-foreground/50 px-4 py-2">
					Transaction cancelled
				</div>
			)}

			{/* Permit Fallback Message */}
			{permitFailed && (
				<output
					className="text-center p-4 bg-warning/10 border border-warning/20 rounded-2xl"
					aria-live="polite"
				>
					<div>
						<p className="text-sm mb-2 font-semibold text-warning">
							Using Direct Approval Mode
						</p>
						<p className="text-xs opacity-60 mb-3">
							Permit signing failed. Using direct approval instead. Make sure
							you've approved the gacha contract to spend your{" "}
							{tokenSymbol || "tokens"}.
						</p>
						<div className="text-xs opacity-50">
							Contract: {gachaAddress?.slice(0, 8)}...
							{gachaAddress?.slice(-6)}
						</div>
					</div>
				</output>
			)}

			{/* Fee Mismatch Error Message */}
			{feeMismatchError && (
				<output
					className="animate-fade-in text-center p-4 bg-warning/10 border border-warning/30 rounded-2xl"
					aria-live="polite"
				>
					<div className="flex items-center justify-center gap-2 mb-2">
						<svg
							className="w-4 h-4 text-warning"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							strokeWidth={2}
						>
							<title>Warning</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"
							/>
						</svg>
						<p className="text-sm font-semibold text-warning">
							Spin Fee Updated
						</p>
					</div>
					<p className="text-xs text-foreground/70 mb-2">
						The spin fee has changed. Please check the updated fee above and try
						again.
					</p>
					<p className="text-[10px] text-foreground/50">
						This happens when the treasury inventory changes from new deposits.
					</p>
				</output>
			)}

			{/* Gacha Unavailable Warning */}
			{isGachaUnavailable && (
				<Card
					className="text-center p-4 bg-warning/10 border border-warning/20 rounded-2xl"
					role="alert"
					aria-live="assertive"
				>
					<div>
						<p className="text-sm mb-2">Gacha System Unavailable</p>
						<p className="text-xs opacity-60">
							No whitelisted collections or NFTs available for spinning
						</p>
					</div>
				</Card>
			)}
		</>
	);
}
