"use client";

import { formatUnits } from "viem";
import type { RefundResult } from "../../async-utils/gachaSpinMachine";
import { Button, DialogTitle, Modal, ModalContent } from "../../ui";

interface SpinRefundModalProps {
	isOpen: boolean;
	refundResult: RefundResult;
	tokenDecimals: number | undefined;
	tokenSymbol: string | undefined;
	onReset: () => void;
}

export function SpinRefundModal({
	isOpen,
	refundResult,
	tokenDecimals,
	tokenSymbol,
	onReset,
}: SpinRefundModalProps) {
	return (
		<Modal isOpen={isOpen} size="sm">
			<ModalContent>
				<div className="text-center">
					<div className="w-16 h-16 bg-warning/20 rounded-full flex items-center justify-center mx-auto mb-3">
						<svg
							className="w-8 h-8 text-warning"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							strokeWidth={2}
							aria-hidden="true"
						>
							<title>Warning</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M9 8h6m-5 0a3 3 0 110 6H9l3 3-3-3m1 0h6m-6 0a3 3 0 110-6m6 0a3 3 0 110 6M9 8a3 3 0 000 6m0-6a3 3 0 016 0 201 201 0 00.999 1M15 14a3 3 0 000-6m0 6a3 3 0 000-6M10 21l-3-3 3-3"
							/>
						</svg>
					</div>
					<DialogTitle className="text-sm mb-2 font-semibold text-warning">
						Spin Refunded
					</DialogTitle>
					<p className="text-xs text-foreground/60 mb-3">
						Your spin was automatically refunded because the selected rarity (
						{refundResult.selectedRarity}) had no available NFTs.
					</p>
					<div className="space-y-2">
						<div className="bg-content1/20 rounded-lg p-3">
							<p className="text-xs font-medium mb-1">Refund Details:</p>
							<p className="text-sm">
								<span className="font-semibold">Rarity:</span>{" "}
								{refundResult.selectedRarity}
							</p>
							<p className="text-sm">
								<span className="font-semibold">Amount:</span>{" "}
								{formatUnits(refundResult.refundAmount, tokenDecimals || 18)}{" "}
								{tokenSymbol}
							</p>
						</div>
						<Button
							color="warning"
							size="sm"
							onPress={onReset}
							className="w-full"
						>
							Try Another Spin
						</Button>
						<p className="text-xs text-foreground/50">
							Your funds have been automatically returned to your wallet.
						</p>
					</div>
				</div>
			</ModalContent>
		</Modal>
	);
}
