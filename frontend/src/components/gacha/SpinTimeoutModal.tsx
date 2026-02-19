"use client";

import { Button, Modal, ModalContent } from "../../ui";

interface SpinTimeoutModalProps {
	isOpen: boolean;
	isReclaimPending: boolean;
	onReclaim: () => void;
	onReset: () => void;
}

export function SpinTimeoutModal({
	isOpen,
	isReclaimPending,
	onReclaim,
	onReset,
}: SpinTimeoutModalProps) {
	return (
		<Modal isOpen={isOpen} size="sm">
			<ModalContent>
				<div className="text-center">
					<div className="w-16 h-16 bg-danger/20 rounded-full flex items-center justify-center mx-auto mb-3">
						<svg
							className="w-8 h-8 text-danger"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							strokeWidth={2}
							aria-hidden="true"
						>
							<title>Error</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"
							/>
						</svg>
					</div>
					<p className="text-sm mb-2 font-semibold text-danger">
						Randomness Timeout
					</p>
					<p className="text-xs text-foreground/60 mb-3">
						The random number generation took longer than expected. This may
						indicate a network issue or VRF coordinator problem.
					</p>
					<div className="flex flex-col gap-2">
						<Button
							color="warning"
							size="sm"
							onPress={onReclaim}
							isDisabled={isReclaimPending}
						>
							{isReclaimPending ? "Reclaiming..." : "Reclaim Funds"}
						</Button>
						<Button color="default" size="sm" onPress={onReset}>
							Try Again
						</Button>
						<p className="text-xs text-foreground/50">
							Reclaim refunds your spin fee and invalidates this request to
							prevent late fulfillment.
						</p>
					</div>
				</div>
			</ModalContent>
		</Modal>
	);
}
