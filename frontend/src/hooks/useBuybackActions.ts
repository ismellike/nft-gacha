"use client";

import { useCallback } from "react";
import type { InteractionMode } from "../stores/nftInteractionStore";

type InteractionStatus =
	| "idle"
	| "checkingApprovals"
	| "awaitingNFTApprovalSignature"
	| "awaitingNFTApprovalReceipt"
	| "awaitingInteractionSignature"
	| "awaitingInteractionReceipt"
	| "completed"
	| "error";

type ActionInfo = {
	type: string;
	label: string;
	// Some external callers may attach an imperative action; guard with "in" before use
	action?: (() => Promise<void> | void) | undefined;
};

interface StartInteractionConfig {
	treasuryAddress: string;
	protocolTreasuryAddress?: string;
	hasAppraisal?: boolean;
	appraisalPrice?: bigint;
	payoutAmount?: bigint;
}

interface UseBuybackActionsParams {
	collection: string;
	tokenId: string;
	protocolTreasuryAddress: string;
	hasAppraisal: boolean | undefined;
	appraisalPrice: unknown; // raw wagmi return — may be tuple or bigint
	payoutAmount: bigint | null;
	startInteraction: (
		collection: string,
		tokenId: string,
		mode: InteractionMode,
		config: StartInteractionConfig,
	) => void;
	status: InteractionStatus;
	isSuccessState: boolean;
	isCompletedOtherNFT: boolean;
	error: string | null | undefined;
	actionInfo: ActionInfo;
	reset: () => void;
	redemptionWindowIsExpired: boolean;
	needsApproval: boolean;
	isNotOwned: boolean;
}

export interface UseBuybackActionsReturn {
	handleInteractionButtonClick: () => void;
	primaryButtonLabel: string;
}

/**
 * Encapsulates all buyback button handler logic and button label derivation.
 *
 * Extracted from BuybackComponent to keep the parent component focused on
 * layout and contract data reads. All handlers are stable useCallback
 * references so they do not cause unnecessary re-renders.
 */
export function useBuybackActions({
	collection,
	tokenId,
	protocolTreasuryAddress,
	hasAppraisal,
	appraisalPrice,
	payoutAmount,
	startInteraction,
	status,
	isSuccessState,
	isCompletedOtherNFT,
	error,
	actionInfo,
	reset,
	redemptionWindowIsExpired,
	needsApproval,
	isNotOwned,
}: UseBuybackActionsParams): UseBuybackActionsReturn {
	// -------------------------------------------------------------------------
	// handleStartBuyback — builds interaction config and fires startInteraction
	// -------------------------------------------------------------------------
	const handleStartBuyback = useCallback(async () => {
		const priceValue = Array.isArray(appraisalPrice)
			? (appraisalPrice[0] as unknown as bigint)
			: (appraisalPrice as unknown as bigint);

		const interactionConfig: StartInteractionConfig = {
			treasuryAddress: protocolTreasuryAddress,
		};

		if (protocolTreasuryAddress) {
			interactionConfig.protocolTreasuryAddress = protocolTreasuryAddress;
		}
		if (hasAppraisal !== undefined) {
			interactionConfig.hasAppraisal = hasAppraisal;
		}
		if (priceValue) {
			interactionConfig.appraisalPrice = priceValue;
		}
		if (payoutAmount) {
			interactionConfig.payoutAmount = payoutAmount;
		}

		try {
			startInteraction(collection, tokenId, "buyback", interactionConfig);
		} catch (err) {
			console.error("Buyback interaction failed:", err);
		}
	}, [
		collection,
		tokenId,
		protocolTreasuryAddress,
		hasAppraisal,
		appraisalPrice,
		payoutAmount,
		startInteraction,
	]);

	// -------------------------------------------------------------------------
	// handleAction — orchestrates state transitions and calls handleStartBuyback
	// -------------------------------------------------------------------------
	const handleAction = useCallback(async () => {
		// Already completed this NFT — nothing to do
		if (isSuccessState) return;

		if (status === "idle") {
			await handleStartBuyback();
			return;
		}

		// Previously completed a *different* NFT — reset then start fresh
		if (isCompletedOtherNFT) {
			reset();
			await new Promise((resolve) => setTimeout(resolve, 150));
			await handleStartBuyback();
			return;
		}

		// Stuck in an in-flight state — reset and retry
		if (status !== "completed") {
			reset();
			await new Promise((resolve) => setTimeout(resolve, 150));
			await handleStartBuyback();
		}
	}, [status, isSuccessState, isCompletedOtherNFT, reset, handleStartBuyback]);

	// -------------------------------------------------------------------------
	// handleButtonPress — dispatches to actionInfo.action when present, else handleAction
	// -------------------------------------------------------------------------
	const handleButtonPress = useCallback(async () => {
		if (actionInfo.action) {
			try {
				await Promise.resolve(actionInfo.action());
			} catch (err) {
				console.error("BuybackComponent action failed:", err);
			}
			return;
		}
		await handleAction();
	}, [actionInfo, handleAction]);

	// -------------------------------------------------------------------------
	// handleInteractionButtonClick — void wrapper for JSX onPress prop
	// -------------------------------------------------------------------------
	const handleInteractionButtonClick = useCallback(() => {
		void handleButtonPress();
	}, [handleButtonPress]);

	// -------------------------------------------------------------------------
	// getButtonLabel — derives the primary action button label from state
	// -------------------------------------------------------------------------
	const getButtonLabel = (): string => {
		if (redemptionWindowIsExpired) return "Window Expired";
		if (error) return "Retry Buyback";
		if (isNotOwned) return "Sold";
		if (status === "idle")
			return needsApproval ? "Approve NFT" : "Accept Buyback";
		if (status === "awaitingInteractionSignature")
			return "Awaiting Approval...";
		if (isSuccessState) return "Buyback Completed";
		if (actionInfo.label) return actionInfo.label;
		return "Accept Buyback";
	};

	const primaryButtonLabel = getButtonLabel();

	return {
		handleInteractionButtonClick,
		primaryButtonLabel,
	};
}
