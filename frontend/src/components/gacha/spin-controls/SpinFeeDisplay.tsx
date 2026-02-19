import { glassTypography } from "../../../lib/theme-config";
import { formatCurrency } from "../../../lib/utils";

interface SpinFeeDisplayProps {
	spinFee: bigint | undefined;
	tokenDecimals: number | undefined;
	tokenSymbol: string | undefined;
	feeStale: boolean;
	isFetching: boolean;
	onRefresh: () => void;
	isMuted: boolean;
	onToggleMute: () => void;
}

export function SpinFeeDisplay({
	spinFee,
	tokenDecimals,
	tokenSymbol,
	feeStale,
	isFetching,
	onRefresh,
	isMuted,
	onToggleMute,
}: SpinFeeDisplayProps) {
	const formatSpinFee = () => {
		if (!spinFee || !tokenDecimals) return "Loading...";
		return formatCurrency(spinFee, tokenDecimals, tokenSymbol || "TOKENS");
	};

	return (
		<div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
			<div className="space-y-2">
				<div className="flex items-center gap-3">
					<h2 className={glassTypography({ variant: "mainHeading" })}>
						Gacha Spinner
					</h2>
					<button
						type="button"
						onClick={onToggleMute}
						className="p-2 rounded-xl bg-content1/30 hover:bg-content1/50 border border-white/10 backdrop-blur-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
						aria-label={
							isMuted ? "Unmute sound effects" : "Mute sound effects"
						}
						title={isMuted ? "Unmute sounds" : "Mute sounds"}
					>
						{isMuted ? (
							<svg
								className="w-4 h-4 text-foreground/50"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								strokeWidth={2}
							>
								<title>Sound off</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
								/>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
								/>
							</svg>
						) : (
							<svg
								className="w-4 h-4 text-foreground/70"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								strokeWidth={2}
							>
								<title>Sound on</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
								/>
							</svg>
						)}
					</button>
				</div>
				<p className="text-sm text-foreground/60">
					Provably fair randomness with instant NFT reveals
				</p>
			</div>

			{/* Enhanced Entry Fee Display */}
			<div className="flex flex-col gap-3 rounded-2xl border border-warning/30 bg-warning/5 p-4 shadow-inner relative">
				{/* Stale data indicator */}
				{feeStale && (
					<div className="absolute -top-2 -right-2 flex items-center gap-1.5 px-2 py-1 bg-danger/20 border border-danger/40 rounded-full animate-pulse">
						<div className="w-1.5 h-1.5 rounded-full bg-danger animate-ping" />
						<span className="text-[10px] font-semibold text-danger uppercase">
							Updating...
						</span>
					</div>
				)}
				<div className="flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-xl border border-warning/30 bg-warning/10">
						<svg
							className="w-5 h-5 text-warning"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							strokeWidth={2}
						>
							<title>Entry Fee</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
					</div>
					<div className="flex-1">
						<div className="flex items-center gap-2">
							<p className="text-xs uppercase tracking-wide text-warning/70 font-medium">
								Entry Fee
							</p>
							<button
								type="button"
								onClick={onRefresh}
								disabled={isFetching}
								className="p-1 rounded hover:bg-warning/20 transition-colors disabled:opacity-50"
								aria-label="Refresh spin fee"
								title="Refresh spin fee"
							>
								<svg
									className={`w-3.5 h-3.5 text-warning/70 hover:text-warning ${
										isFetching ? "animate-spin" : ""
									}`}
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									strokeWidth={2}
								>
									<title>Refresh</title>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
									/>
								</svg>
							</button>
						</div>
						<p className="text-xl font-bold text-warning">{formatSpinFee()}</p>
					</div>
				</div>
				{tokenSymbol && (
					<p className="text-xs text-warning/60">
						Per spin in {tokenSymbol}
						{feeStale && " • Updating..."}
					</p>
				)}
			</div>
		</div>
	);
}
