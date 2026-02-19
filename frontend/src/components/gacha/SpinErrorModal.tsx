"use client";

import type { UserFriendlyError } from "../../lib/transactionErrors";
import { Button, Modal, ModalContent } from "../../ui";

interface SpinErrorModalProps {
	isOpen: boolean;
	error: string | null | undefined;
	userFriendlyError: UserFriendlyError | null;
	retryCount: number;
	onRetry: () => void;
}

export function SpinErrorModal({
	isOpen,
	error,
	userFriendlyError,
	retryCount,
	onRetry,
}: SpinErrorModalProps) {
	return (
		<Modal isOpen={isOpen} size="sm">
			<ModalContent>
				<div className="text-center p-6">
					{/* Show user-friendly error if available */}
					{userFriendlyError ? (
						<>
							<p className="text-lg font-semibold text-foreground mb-2">
								{userFriendlyError.title}
							</p>
							<p className="text-sm text-foreground/70 mb-4">
								{userFriendlyError.message}
							</p>
							{userFriendlyError.action && (
								<p className="text-xs text-warning mb-3">
									{userFriendlyError.action}
								</p>
							)}
						</>
					) : (
						<p className="text-sm mb-2">{error}</p>
					)}
					<p className="text-xs text-foreground/60">
						Retry attempts: {retryCount}/5
					</p>
					{/* Show retry button if applicable */}
					{userFriendlyError?.canRetry && (
						<Button
							color="glassPrimary"
							size="sm"
							className="mt-4"
							onPress={onRetry}
						>
							Retry
						</Button>
					)}
				</div>
			</ModalContent>
		</Modal>
	);
}
