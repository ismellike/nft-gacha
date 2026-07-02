"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useReadContract } from "wagmi";
import {
	gachaTreasuryAbi,
	useReadProtocolTreasuryIsRedeemable,
	useReadProtocolTreasuryRedemptionWindow,
} from "@/generated";

/**
 * Redemption preflight reason codes, mirrored from
 * `ProtocolTreasury.REDEEM_*` constants. Redemption is best-effort (not a
 * hard guarantee) — these codes let the UI explain why a redemption would
 * currently fail before the user submits a transaction.
 */
export const REDEEM_OK = 0;
export const REDEEM_WINDOW_EXPIRED = 1;
export const REDEEM_APPRAISAL_MISSING = 2;
export const REDEEM_INSUFFICIENT_LIQUIDITY = 3;
export const REDEEM_EXCEEDS_CAP = 4;

export type RedeemReasonCode =
	| typeof REDEEM_OK
	| typeof REDEEM_WINDOW_EXPIRED
	| typeof REDEEM_APPRAISAL_MISSING
	| typeof REDEEM_INSUFFICIENT_LIQUIDITY
	| typeof REDEEM_EXCEEDS_CAP;

/** Human-readable explanation for a non-OK redeem reason code, or `null` when redeemable. */
export function getRedeemReasonMessage(
	reason: RedeemReasonCode | undefined,
): string | null {
	switch (reason) {
		case REDEEM_WINDOW_EXPIRED:
			return "The redemption window for this NFT has expired.";
		case REDEEM_APPRAISAL_MISSING:
			return "This NFT must be appraised before it can be redeemed.";
		case REDEEM_INSUFFICIENT_LIQUIDITY:
			return "Treasury temporarily low on funds. Please try again later.";
		case REDEEM_EXCEEDS_CAP:
			return "This payout currently exceeds the treasury's redemption cap. Please try again later.";
		default:
			return null;
	}
}

export interface RedemptionWindowState {
	remainingSeconds: number;
	totalWindowSeconds: number;
	isEligible: boolean;
	isExpired: boolean;
	progressPercent: number;
	formattedTimeRemaining: string;
	formattedTotalWindow: string;
	isLoading: boolean;
	/** True only if `ProtocolTreasury.isRedeemable` currently reports a successful redemption. */
	isRedeemableNow: boolean;
	/** Reason code from `ProtocolTreasury.isRedeemable`, `undefined` while loading. */
	redeemReason: RedeemReasonCode | undefined;
	/** Human-readable message for `redeemReason`, `null` when redeemable or unknown. */
	redeemReasonMessage: string | null;
	/** Exact payout (USDC, 6 decimals) `isRedeemable` reports the redemption would pay out. */
	redeemPayout: bigint | undefined;
}

function formatSeconds(totalSeconds: number): string {
	if (totalSeconds <= 0) return "0:00";
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;
	if (minutes >= 60) {
		const hours = Math.floor(minutes / 60);
		const remainingMinutes = minutes % 60;
		return `${hours}:${remainingMinutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
	}
	return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

interface UseRedemptionWindowParams {
	protocolTreasuryAddress: string;
	gachaTreasuryAddress?: string | undefined;
	collection: string;
	tokenId: string;
	enabled?: boolean | undefined;
}

export function useRedemptionWindow({
	protocolTreasuryAddress,
	gachaTreasuryAddress,
	collection,
	tokenId,
	enabled = true,
}: UseRedemptionWindowParams): RedemptionWindowState {
	const collectionAddr = collection as `0x${string}`;
	const tokenIdBigInt = BigInt(tokenId);

	// Fetch the fixed on-chain receiveTime (when the NFT was won).
	// This value never changes so caching is fine.
	const { data: receiveTime, isLoading: isLoadingReceiveTime } =
		useReadContract({
			address: gachaTreasuryAddress as `0x${string}`,
			abi: gachaTreasuryAbi,
			functionName: "getNFTReceiveTime",
			args: [collectionAddr, tokenIdBigInt],
			query: {
				enabled: enabled && !!gachaTreasuryAddress,
			},
		});

	// Fetch the redemption window duration (e.g. 3600 seconds).
	// This is a global config that rarely changes.
	const { data: totalWindowOnChain, isLoading: isLoadingTotal } =
		useReadProtocolTreasuryRedemptionWindow({
			address: protocolTreasuryAddress as `0x${string}`,
			query: {
				enabled,
			},
		});

	// Preflight redemption check: reports whether `executeRedemption` would currently
	// succeed and the exact payout, since redemption is best-effort while treasury
	// funds last (not a hard guarantee).
	const { data: redeemableData, isLoading: isLoadingRedeemable } =
		useReadProtocolTreasuryIsRedeemable({
			address: protocolTreasuryAddress as `0x${string}`,
			args: [collectionAddr, tokenIdBigInt],
			query: {
				enabled: enabled && !!protocolTreasuryAddress,
			},
		});

	const isLoading = isLoadingReceiveTime || isLoadingTotal;

	const totalWindowSeconds = totalWindowOnChain
		? Number(totalWindowOnChain)
		: 0;

	// Compute the expiry timestamp once from on-chain data.
	// receiveTime is a fixed block.timestamp value from when the NFT was won.
	const expiryTimestamp = useMemo(() => {
		if (!receiveTime || !totalWindowOnChain) return null;
		const rt = Number(receiveTime);
		if (rt === 0) return null; // NFT not received from gacha
		return rt + Number(totalWindowOnChain);
	}, [receiveTime, totalWindowOnChain]);

	// Client-side countdown computed from wall-clock time, not block.timestamp.
	// This avoids stale values on local dev chains where block.timestamp
	// doesn't advance with real time.
	const [countdown, setCountdown] = useState<number | null>(null);
	const countdownRef = useRef(countdown);
	countdownRef.current = countdown;

	// Compute initial countdown from expiryTimestamp and current wall-clock time
	useEffect(() => {
		if (expiryTimestamp === null) return;
		const nowSeconds = Math.floor(Date.now() / 1000);
		setCountdown(Math.max(0, expiryTimestamp - nowSeconds));
	}, [expiryTimestamp]);

	// Tick every second
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
	useEffect(() => {
		intervalRef.current = setInterval(() => {
			if (countdownRef.current === null || countdownRef.current <= 0) {
				if (intervalRef.current) clearInterval(intervalRef.current);
				return;
			}
			setCountdown((prev) => {
				if (prev === null || prev <= 0) return 0;
				return prev - 1;
			});
		}, 1000);

		return () => {
			if (intervalRef.current) clearInterval(intervalRef.current);
		};
	}, []);

	const remainingSeconds = countdown ?? 0;
	// NFT is eligible if it has a receive time and the window hasn't expired
	const hasReceiveTime = receiveTime !== undefined && Number(receiveTime) > 0;
	const isEligible = !isLoading && hasReceiveTime;
	const isExpired = isEligible && remainingSeconds <= 0;
	const progressPercent =
		totalWindowSeconds > 0
			? Math.max(
					0,
					Math.min(100, (remainingSeconds / totalWindowSeconds) * 100),
				)
			: 0;

	const formattedTimeRemaining = formatSeconds(remainingSeconds);
	const formattedTotalWindow = formatSeconds(totalWindowSeconds);

	const [redeemableOk, redeemableReasonRaw, redeemablePayout] =
		redeemableData ?? [undefined, undefined, undefined];
	const redeemReason = isLoadingRedeemable
		? undefined
		: ((redeemableReasonRaw as RedeemReasonCode | undefined) ?? undefined);
	const isRedeemableNow = redeemableOk === true;
	const redeemReasonMessage = getRedeemReasonMessage(redeemReason);
	const redeemPayout = redeemablePayout as bigint | undefined;

	return useMemo(
		() => ({
			remainingSeconds,
			totalWindowSeconds,
			isEligible,
			isExpired,
			progressPercent,
			formattedTimeRemaining,
			formattedTotalWindow,
			isLoading: isLoading || isLoadingRedeemable,
			isRedeemableNow,
			redeemReason,
			redeemReasonMessage,
			redeemPayout,
		}),
		[
			remainingSeconds,
			totalWindowSeconds,
			isEligible,
			isExpired,
			progressPercent,
			formattedTimeRemaining,
			formattedTotalWindow,
			isLoading,
			isLoadingRedeemable,
			isRedeemableNow,
			redeemReason,
			redeemReasonMessage,
			redeemPayout,
		],
	);
}
