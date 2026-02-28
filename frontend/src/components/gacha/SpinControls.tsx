"use client";

import { memo, useEffect, useState } from "react";
import { useAccount, useChainId, useReadContract } from "wagmi";
import { useGachaRefresh } from "../../contexts/GachaRefreshContext";
import { useSoundEffects } from "../../hooks/useSoundEffects";
import {
	gachaTreasuryAbi,
	useReadErc20BalanceOf,
	useReadErc20Decimals,
	useReadErc20Name,
	useReadErc20Symbol,
	useReadGachaFeeToken,
	useReadGachaPaused,
	useReadIerc20PermitNonces,
} from "../../generated";
import { useGachaContracts } from "../../hooks/useGachaContracts";
import { useGachaId } from "../../hooks/useGachaId";
import type { UseGachaSpinMachineReturn } from "../../hooks/useGachaSpinMachine";
import { usePermitSpin } from "../../hooks/usePermitSpin";
import { useSpinCountdown } from "../../hooks/useSpinCountdown";
import { useSpinFee } from "../../hooks/useSpinFee";
import {
	type UserFriendlyError,
	mapTransactionError,
} from "../../lib/transactionErrors";
import { formatTokenAmount } from "../../lib/utils";
import { Card } from "../../ui";
import { SpinErrorModal } from "./SpinErrorModal";
import { SpinRefundModal } from "./SpinRefundModal";
import { SpinTimeoutModal } from "./SpinTimeoutModal";
import { SpinVisual } from "./SpinVisual";
import { SpinButton, SpinErrorDisplay, SpinFeeDisplay } from "./spin-controls";

interface SpinControlsProps {
	gachaSpin: UseGachaSpinMachineReturn;
	onRefund?: () => void;
}

// Constants for spin configuration
const SPIN_TIMEOUT_SECONDS = 300;
const MAX_FEE_SLIPPAGE_BPS = 200; // 2% max-fee buffer for UI

const SpinControls = memo(function SpinControls({
	gachaSpin,
	onRefund,
}: SpinControlsProps) {
	const { address: userAddress, isConnected } = useAccount();
	const chainId = useChainId();

	// Track if component is mounted to avoid hydration mismatch
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	// Sound effects
	const sound = useSoundEffects();

	// User-friendly error state
	const [userFriendlyError, setUserFriendlyError] =
		useState<UserFriendlyError | null>(null);

	// Get gacha ID and contract addresses
	const gachaId = useGachaId();
	const contracts = useGachaContracts(gachaId);
	const { registerRefetch } = useGachaRefresh();

	// Fee polling + stale detection
	const {
		spinFee,
		feeStale,
		isFetching: isFeesFetching,
		refetch: refetchFee,
	} = useSpinFee({
		gachaAddress: contracts.gacha,
		registerRefetch,
	});

	const { data: paused } = useReadGachaPaused({
		address: contracts.gacha as `0x${string}` | undefined,
		query: { enabled: !!contracts.gacha },
	});

	const { data: feeToken } = useReadGachaFeeToken({
		address: contracts.gacha as `0x${string}` | undefined,
		query: { enabled: !!contracts.gacha },
	});

	const { data: isGachaAvailable } = useReadContract({
		address: contracts.treasury as `0x${string}` | undefined,
		abi: gachaTreasuryAbi,
		functionName: "isGachaAvailable",
		query: { enabled: !!contracts.treasury },
	});

	// ERC20 token data
	const { data: tokenDecimals } = useReadErc20Decimals({
		address: feeToken,
		query: { enabled: !!feeToken },
	});

	const { data: tokenSymbol } = useReadErc20Symbol({
		address: feeToken,
		query: { enabled: !!feeToken },
	});

	const { data: tokenName } = useReadErc20Name({
		address: feeToken,
		query: { enabled: !!feeToken },
	});

	const { data: tokenBalance, refetch: refetchBalance } = useReadErc20BalanceOf(
		{
			address: feeToken,
			args: userAddress ? [userAddress] : undefined,
			query: { enabled: !!(feeToken && userAddress) },
		},
	);

	const {
		data: tokenNonce,
		refetch: refetchNonce,
		error: noncesError,
	} = useReadIerc20PermitNonces({
		address: feeToken,
		args: userAddress ? [userAddress] : undefined,
		query: { enabled: !!(feeToken && userAddress) },
	});

	const maxFee =
		spinFee !== undefined
			? spinFee + (spinFee * BigInt(MAX_FEE_SLIPPAGE_BPS)) / 10_000n
			: undefined;

	const hasSufficientBalance =
		maxFee && tokenBalance ? tokenBalance >= maxFee : false;
	const canSpin =
		isConnected &&
		spinFee &&
		maxFee &&
		hasSufficientBalance &&
		!paused &&
		isGachaAvailable &&
		gachaSpin.isIdle;

	const hasPermitSupport = !noncesError && tokenNonce !== undefined && feeToken;
	const isSpinDataReady =
		isConnected &&
		canSpin &&
		userAddress &&
		feeToken &&
		spinFee &&
		(!hasPermitSupport || tokenNonce !== undefined);

	// Permit signing + transaction submission
	const {
		isSignaturePending,
		isProcessingTransaction,
		userCancelledMessage,
		permitFailed,
		feeMismatchError,
		onSpinClick,
		handleReclaim,
		isReclaimPending,
	} = usePermitSpin({
		gachaSpin,
		gachaAddress: contracts.gacha,
		feeToken,
		spinFee,
		maxFee,
		tokenNonce,
		tokenName,
		chainId,
		userAddress,
		hasPermitSupport: !!hasPermitSupport,
		isSpinDataReady: !!isSpinDataReady,
		refetchBalance,
		refetchNonce,
		refetchFee,
		onRefund,
		onSpinSound: sound.playSpinClick,
	});

	// Countdown timer for randomness timeout
	const { countdown } = useSpinCountdown({
		isWaitingForFulfillment: gachaSpin.isWaitingForFulfillment,
		onTimeout: gachaSpin.timeout,
		timeoutSeconds: SPIN_TIMEOUT_SECONDS,
	});

	// Map gachaSpin.error to user-friendly error
	useEffect(() => {
		if (gachaSpin.isError && gachaSpin.error) {
			const friendlyError = mapTransactionError(new Error(gachaSpin.error));
			setUserFriendlyError(friendlyError);
		} else {
			setUserFriendlyError(null);
		}
	}, [gachaSpin.isError, gachaSpin.error]);

	// Formatted values using enhanced utilities
	const formattedBalance =
		tokenBalance && tokenDecimals
			? formatTokenAmount(tokenBalance, tokenDecimals, {
					maxDecimals: 4,
					useGrouping: true,
				})
			: "0";

	// Enhanced button text logic using state machine states
	const getButtonText = () => {
		// Return consistent text during SSR to prevent hydration mismatch
		if (!mounted) return "Connect Wallet";

		if (!isConnected) return "Connect Wallet";
		if (paused) return "Contract Paused";
		if (isGachaAvailable === false) return "Gacha Unavailable";

		// State machine states
		if (gachaSpin.isError)
			return gachaSpin.canRetry ? "Retry Spin" : "Reset & Try Again";
		if (isSignaturePending) return "Sign Permit...";
		if (isProcessingTransaction) return "Confirming Transaction...";
		if (gachaSpin.isSpinning) return "Preparing Spin...";
		if (gachaSpin.isWaitingForFulfillment) return "Awaiting Randomness...";
		if (gachaSpin.isRevealing) return "Revealing NFT...";

		// Fallback mode
		if (permitFailed) return "SPIN (Direct Approval)";

		// Validation checks
		if (!hasSufficientBalance) return "Insufficient Balance";
		if (hasPermitSupport && tokenNonce === undefined) return "Loading...";

		return "SPIN NOW";
	};

	const isButtonDisabled = () => {
		// Disable button during SSR to prevent hydration mismatch
		if (!mounted) return true;

		return (
			!isConnected ||
			paused ||
			!canSpin ||
			isSignaturePending ||
			isProcessingTransaction ||
			gachaSpin.isSpinning ||
			gachaSpin.isWaitingForFulfillment ||
			(hasPermitSupport && tokenNonce === undefined)
		);
	};

	return (
		<Card className="relative overflow-hidden border border-white/10 bg-content1/30 p-4 sm:p-8 backdrop-blur-2xl">
			{/* Loading skeleton during SSR */}
			{!mounted && (
				<div role="status" aria-label="Loading" className="space-y-6">
					<div className="flex justify-between">
						<div className="space-y-2">
							<div className="h-8 bg-content1/30 rounded-lg animate-pulse w-48" />
							<div className="h-4 bg-content1/20 rounded-lg animate-pulse w-64" />
						</div>
						<div className="h-12 w-12 bg-content1/30 rounded-full animate-pulse" />
					</div>
					<div className="flex justify-center">
						<div className="h-64 w-64 bg-content1/30 rounded-full animate-pulse" />
					</div>
					<div className="flex justify-center">
						<div className="h-14 bg-content1/30 rounded-xl animate-pulse w-full max-w-xs" />
					</div>
				</div>
			)}

			{/* Main content - only render when mounted */}
			{mounted && (
				<>
					{/* Enhanced background gradient */}
					<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,200,87,0.15),_transparent_60%)]" />

					<SpinFeeDisplay
						spinFee={spinFee}
						tokenDecimals={tokenDecimals}
						tokenSymbol={tokenSymbol}
						feeStale={feeStale}
						isFetching={isFeesFetching}
						onRefresh={refetchFee}
						isMuted={sound.isMuted}
						onToggleMute={sound.toggleMute}
					/>
					<div className="py-8 sm:py-16">
						<div className="flex flex-col items-center space-y-6 sm:space-y-10">
							{/* Enhanced Spinner Visual with Lottie Animation */}
							<SpinVisual
								isSpinning={gachaSpin.isSpinning}
								isWaitingForFulfillment={gachaSpin.isWaitingForFulfillment}
								isError={gachaSpin.isError}
							/>

							{/* Timeout Display */}
							<SpinTimeoutModal
								isOpen={gachaSpin.isTimeout}
								isReclaimPending={isReclaimPending}
								onReclaim={handleReclaim}
								onReset={gachaSpin.reset}
							/>

							{/* Refund Display */}
							{gachaSpin.isRefunded && gachaSpin.refundResult && (
								<SpinRefundModal
									isOpen={gachaSpin.isRefunded}
									refundResult={gachaSpin.refundResult}
									tokenDecimals={tokenDecimals}
									tokenSymbol={tokenSymbol}
									onReset={gachaSpin.reset}
								/>
							)}

							{/* Error Display Only */}
							{gachaSpin.isError &&
								!gachaSpin.isTimeout &&
								!gachaSpin.isRefunded && (
									<SpinErrorModal
										isOpen={gachaSpin.isError}
										error={gachaSpin.error}
										userFriendlyError={userFriendlyError}
										retryCount={gachaSpin.retryCount}
										onRetry={gachaSpin.retry}
									/>
								)}

							<SpinErrorDisplay
								userCancelledMessage={userCancelledMessage}
								permitFailed={permitFailed}
								feeMismatchError={feeMismatchError}
								isGachaUnavailable={isConnected && isGachaAvailable === false}
								tokenSymbol={tokenSymbol}
								gachaAddress={contracts.gacha}
							/>
							<SpinButton
								buttonText={getButtonText()}
								disabled={!!isButtonDisabled()}
								isLoading={
									isSignaturePending ||
									isProcessingTransaction ||
									gachaSpin.isSpinning
								}
								isWaitingForFulfillment={gachaSpin.isWaitingForFulfillment}
								isRevealing={gachaSpin.isRevealing}
								isError={gachaSpin.isError}
								onClick={onSpinClick}
							/>

							{/* Balance Display - Under Button */}
							{mounted && isConnected && !gachaSpin.isWaitingForFulfillment && (
								<div className="text-center">
									<p className="text-sm text-success/80">
										Balance: {formattedBalance} {tokenSymbol || "TOKENS"}
									</p>
								</div>
							)}

							{/* Minimalist Countdown Display */}
							{gachaSpin.isWaitingForFulfillment && (
								<div className="flex items-center justify-center gap-3">
									<div
										aria-hidden="true"
										className="w-4 h-4 border border-warning/50 border-t-warning rounded-full animate-spin"
									></div>
									<p className="text-sm text-warning/80 font-medium">
										Awaiting randomness • {countdown}s
									</p>
								</div>
							)}
						</div>
					</div>
				</>
			)}
		</Card>
	);
});

SpinControls.displayName = "SpinControls";

export default SpinControls;
