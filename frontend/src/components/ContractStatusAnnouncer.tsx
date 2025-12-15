"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircleIcon, ExclamationTriangleIcon, ClockIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import { cn } from "../lib/theme-config";

export type ContractStatusType = "success" | "error" | "pending" | "info";

interface ContractStatusUpdate {
	type: ContractStatusType;
	message: string;
	timestamp?: number;
	persistent?: boolean; // If true, message stays in DOM longer
}

interface ContractStatusAnnouncerProps {
	status?: ContractStatusUpdate | null;
	clearAfterMs?: number;
	className?: string;
	compact?: boolean;
}

export function ContractStatusAnnouncer({
	status,
	clearAfterMs = 5000,
	className,
	compact = false,
}: ContractStatusAnnouncerProps) {
	const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
	const statusRef = useRef<HTMLDivElement>(null);

	// Clear status after timeout
	useEffect(() => {
		if (status && !status.persistent && clearAfterMs > 0) {
			timeoutRef.current = setTimeout(() => {
				// Status will be cleared by parent component
			}, clearAfterMs);
		}

		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, [status, clearAfterMs]);

	if (!status) return null;

	const icons = {
		success: CheckCircleIcon,
		error: ExclamationTriangleIcon,
		pending: ClockIcon,
		info: InformationCircleIcon,
	};

	const Icon = icons[status.type];

	if (compact) {
		return (
			<div
				ref={statusRef}
				className={cn(
					"flex items-center gap-2 text-sm animate-fade-in",
					status.type === "success" && "text-success/80",
					status.type === "error" && "text-danger/80",
					status.type === "pending" && "text-warning/80",
					status.type === "info" && "text-foreground/60",
					className,
				)}
				role="status"
				aria-live={status.type === "error" ? "assertive" : "polite"}
				aria-atomic="true"
			>
				<Icon className="w-4 h-4 flex-shrink-0" />
				<span>{status.message}</span>
			</div>
		);
	}

	return (
		<div
			ref={statusRef}
			className={cn(
				"rounded-xl border p-4 animate-fade-in",
				status.type === "success" && "border-success/20 bg-success/5",
				status.type === "error" && "border-danger/20 bg-danger/5",
				status.type === "pending" && "border-warning/20 bg-warning/5",
				status.type === "info" && "border-foreground/20 bg-content1/10",
				className,
			)}
			role="status"
			aria-live={status.type === "error" ? "assertive" : "polite"}
			aria-atomic="true"
		>
			<div className="flex items-center gap-3">
				<Icon
					className={cn(
						"w-5 h-5 flex-shrink-0",
						status.type === "success" && "text-success",
						status.type === "error" && "text-danger",
						status.type === "pending" && "text-warning",
						status.type === "info" && "text-foreground/60",
					)}
				/>
				<p className="text-sm text-foreground/80">{status.message}</p>
			</div>
		</div>
	);
}

// Hook for managing contract status announcements
export function useContractStatusAnnouncer() {
	const [status, setStatus] = useState<ContractStatusUpdate | null>(null);

	const announceStatus = (update: Omit<ContractStatusUpdate, "timestamp">) => {
		setStatus({
			...update,
			timestamp: Date.now(),
		});

		// Auto-clear non-persistent messages after 5 seconds
		if (!update.persistent) {
			setTimeout(() => {
				setStatus(null);
			}, 5000);
		}
	};

	const clearStatus = () => setStatus(null);

	return {
		status,
		announceStatus,
		clearStatus,
	};
}

// Predefined status messages for common contract interactions
export const ContractStatusMessages = {
	// Wallet connection
	walletConnected: {
		type: "success" as ContractStatusType,
		message: "Wallet connected successfully",
	},
	walletDisconnected: {
		type: "info" as ContractStatusType,
		message: "Wallet disconnected",
	},
	walletSwitchingNetwork: {
		type: "pending" as ContractStatusType,
		message: "Switching network...",
	},
	walletNetworkSwitched: {
		type: "success" as ContractStatusType,
		message: "Network switched successfully",
	},

	// Transaction status
	transactionPending: {
		type: "pending" as ContractStatusType,
		message: "Transaction submitted, waiting for confirmation...",
		persistent: true,
	},
	transactionConfirmed: {
		type: "success" as ContractStatusType,
		message: "Transaction confirmed successfully",
	},
	transactionFailed: {
		type: "error" as ContractStatusType,
		message: "Transaction failed. Please try again.",
	},

	// Gacha-specific
	gachaSpinning: {
		type: "pending" as ContractStatusType,
		message: "Spinning gacha... WAVS randomness in progress",
		persistent: true,
	},
	gachaRevealing: {
		type: "pending" as ContractStatusType,
		message: "Revealing your NFT reward...",
		persistent: true,
	},
	gachaComplete: {
		type: "success" as ContractStatusType,
		message: "Congratulations! You won an NFT",
	},
	gachaRefunded: {
		type: "info" as ContractStatusType,
		message: "No NFTs available in rarity pool. Fee refunded.",
	},

	// Appraisal-specific
	appraisalSubmitted: {
		type: "pending" as ContractStatusType,
		message: "Appraisal submitted. Waiting for oracle results...",
		persistent: true,
	},
	appraisalComplete: {
		type: "success" as ContractStatusType,
		message: "NFT appraisal completed successfully",
	},
	appraisalFailed: {
		type: "error" as ContractStatusType,
		message: "Appraisal failed. The fee will be refunded.",
	},

	// General contract errors
	contractCallFailed: {
		type: "error" as ContractStatusType,
		message: "Contract call failed. Please check your wallet and try again.",
	},
	insufficientFunds: {
		type: "error" as ContractStatusType,
		message: "Insufficient funds for this transaction",
	},
	userRejected: {
		type: "info" as ContractStatusType,
		message: "Transaction cancelled by user",
	},

	// Network status
	networkConnected: {
		type: "success" as ContractStatusType,
		message: "Connected to network",
	},
	networkDisconnected: {
		type: "error" as ContractStatusType,
		message: "Lost connection to network",
	},
	networkReconnected: {
		type: "success" as ContractStatusType,
		message: "Network connection restored",
	},
};