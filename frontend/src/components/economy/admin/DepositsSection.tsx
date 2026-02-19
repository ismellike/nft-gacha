"use client";

import { FolderOpenIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { useReadGachaTreasuryGetUserCardDepositsPage } from "@/generated";
import { Button, Card, Chip } from "../../../ui";

export function DepositsSection() {
	const [userAddress, setUserAddress] = useState("");

	const treasuryAddress = process.env
		.NEXT_PUBLIC_TREASURY_ADDRESS as `0x${string}`;
	const { data: userDeposits, refetch: refetchDeposits } =
		useReadGachaTreasuryGetUserCardDepositsPage({
			address: treasuryAddress,
			args: userAddress?.startsWith("0x")
				? [userAddress as `0x${string}`, 0n, 10n]
				: undefined,
			query: { enabled: !!userAddress && userAddress.startsWith("0x") },
		} as Parameters<typeof useReadGachaTreasuryGetUserCardDepositsPage>[0]);

	const handleSearchDeposits = () => {
		if (userAddress?.startsWith("0x")) {
			refetchDeposits();
		}
	};

	return (
		<Card className="p-8 bg-content1/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
			<div className="mb-8">
				<h2 className="text-2xl font-bold text-foreground mb-2">
					Pending Deposits
				</h2>
				<p className="text-foreground/70">
					Review and inspect NFT deposits from any user address.
				</p>
			</div>

			{/* User Address Search */}
			<div className="mb-8">
				<h3 className="text-lg font-semibold text-foreground mb-4">
					Search User Deposits
				</h3>
				<div className="flex gap-4">
					<input
						type="text"
						value={userAddress}
						onChange={(e) => setUserAddress(e.target.value)}
						placeholder="Enter user wallet address (0x...)"
						className="flex-1 bg-content1/20 backdrop-blur-xl border border-white/20 rounded-xl px-4 py-3 text-foreground focus:border-warning/50 focus:outline-none transition-colors"
					/>
					<Button
						color="glassPrimary"
						onPress={handleSearchDeposits}
						disabled={!userAddress || !userAddress.startsWith("0x")}
					>
						Search
					</Button>
				</div>
			</div>

			{/* Deposits Display */}
			<div>
				<h3 className="text-lg font-semibold text-foreground mb-4">
					Deposit History
				</h3>
				{userDeposits &&
				Array.isArray(userDeposits) &&
				userDeposits.length > 0 &&
				Array.isArray(userDeposits[0]) &&
				userDeposits[0].length > 0 ? (
					<div className="space-y-4">
						{userDeposits[0].map(
							(deposit: {
								cardId: string;
								depositCount: bigint;
								totalCardDeposits: bigint;
							}) => (
								<div
									key={deposit.cardId}
									className="p-4 bg-content1/10 border border-white/10 rounded-xl"
								>
									<div className="flex items-center justify-between mb-3">
										<div className="flex items-center gap-3">
											<FolderOpenIcon className="w-5 h-5 text-warning" />
											<div>
												<div className="font-mono text-sm text-foreground">
													Card ID:{" "}
													{deposit.cardId
														? `${deposit.cardId.slice(0, 10)}...`
														: "Unknown"}
												</div>
												<div className="text-xs text-foreground/60">
													Deposit Count:{" "}
													{deposit.depositCount?.toString() || "0"}
												</div>
											</div>
										</div>
										<Chip className="px-2 py-1 rounded-lg backdrop-blur-xl bg-success/20 border border-success/30 text-success">
											{deposit.totalCardDeposits?.toString() || "0"} Total
										</Chip>
									</div>

									<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
										<div>
											<span className="text-foreground/60">Card ID:</span>
											<div className="font-mono text-xs text-foreground">
												{deposit.cardId || "Unknown"}
											</div>
										</div>
										<div>
											<span className="text-foreground/60">Deposits:</span>
											<div className="font-mono text-xs text-foreground">
												{deposit.depositCount?.toString() || "0"}
											</div>
										</div>
										<div>
											<span className="text-foreground/60">Total:</span>
											<div className="font-mono text-xs text-foreground">
												{deposit.totalCardDeposits?.toString() || "0"}
											</div>
										</div>
									</div>
								</div>
							),
						)}

						{userDeposits.length > 2 && userDeposits[2] && (
							<div className="text-center mt-4">
								<p className="text-foreground/60 text-sm">
									Showing {userDeposits[0]?.length || 0} of{" "}
									{userDeposits[1]?.toString() || "0"} total deposits
								</p>
							</div>
						)}
					</div>
				) : userAddress?.startsWith("0x") ? (
					<div className="text-center py-12">
						<FolderOpenIcon className="w-8 h-8 mx-auto mb-4 text-foreground/40" />
						<h3 className="text-lg font-medium text-foreground/60 mb-2">
							No Deposits Found
						</h3>
						<p className="text-foreground/40">
							This user hasn't deposited any NFTs yet.
						</p>
					</div>
				) : (
					<div className="text-center py-12">
						<FolderOpenIcon className="w-8 h-8 mx-auto mb-4 text-foreground/40" />
						<h3 className="text-lg font-medium text-foreground/60 mb-2">
							Enter User Address
						</h3>
						<p className="text-foreground/40">
							Search for a user's wallet address to view their NFT deposits.
						</p>
					</div>
				)}
			</div>
		</Card>
	);
}
