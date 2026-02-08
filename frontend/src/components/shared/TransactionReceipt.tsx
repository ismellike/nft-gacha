"use client";

import {
	ArrowTopRightOnSquareIcon,
	CheckCircleIcon,
	DocumentTextIcon,
	XCircleIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { Button, Card, Modal, ModalContent } from "../../ui";

interface TransactionReceiptProps {
	isOpen: boolean;
	onClose: () => void;
	transactionHash: string;
	type: "spin" | "appraisal" | "deposit" | "withdrawal" | "claim";
	status: "success" | "failed";
	gasUsed?: bigint;
	effectiveGasPrice?: bigint;
	timestamp?: number;
	blockNumber?: bigint;
}

export function TransactionReceipt({
	isOpen,
	onClose,
	transactionHash,
	type,
	status,
	gasUsed,
	timestamp,
	blockNumber,
}: TransactionReceiptProps) {
	const typeLabels = {
		spin: "Gacha Spin",
		appraisal: "NFT Appraisal",
		deposit: "NFT Deposit",
		withdrawal: "NFT Withdrawal",
		claim: "Yield Claim",
	};

	const formatHash = (hash: string) =>
		`${hash.slice(0, 10)}...${hash.slice(-8)}`;

	const formatGas = (gas?: bigint) =>
		gas ? `${(Number(gas) / 1_000_000).toFixed(2)} M` : "N/A";

	const formatTimestamp = (ts?: number) =>
		ts ? new Date(ts * 1000).toLocaleString() : "Just now";

	// Construct block explorer URL (configure per chain)
	const blockExplorerUrl = `https://holesky.etherscan.io/tx/${transactionHash}`;

	const handleCopyHash = () => {
		navigator.clipboard.writeText(transactionHash);
		// In a real app, you'd show a toast here
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} size="md">
			<ModalContent>
				<Card className="p-6" isPressable={false}>
					{/* Status Icon */}
					<div className="flex justify-center mb-6">
						<motion.div
							initial={{ scale: 0 }}
							animate={{ scale: 1 }}
							className={`w-20 h-20 rounded-full flex items-center justify-center ${
								status === "success" ? "bg-success/20" : "bg-danger/20"
							}`}
						>
							{status === "success" ? (
								<CheckCircleIcon className="w-10 h-10 text-success" />
							) : (
								<XCircleIcon className="w-10 h-10 text-danger" />
							)}
						</motion.div>
					</div>

					{/* Title */}
					<h2 className="text-2xl font-bold text-center mb-2">
						{status === "success"
							? "Transaction Complete!"
							: "Transaction Failed"}
					</h2>
					<p className="text-center text-foreground/70 mb-6">
						{typeLabels[type]}{" "}
						{status === "success" ? "confirmed" : "could not be completed"}
					</p>

					{/* Receipt Details */}
					<div className="space-y-3 mb-6">
						{/* Transaction Hash */}
						<div className="flex items-center justify-between p-3 bg-content1/20 rounded-lg">
							<span className="text-sm text-foreground/60">Transaction</span>
							<a
								href={blockExplorerUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-2 text-sm font-mono text-warning hover:underline"
							>
								{formatHash(transactionHash)}
								<ArrowTopRightOnSquareIcon className="w-4 h-4" />
							</a>
						</div>

						{/* Block Number */}
						{blockNumber && (
							<div className="flex items-center justify-between p-3 bg-content1/20 rounded-lg">
								<span className="text-sm text-foreground/60">Block</span>
								<span className="text-sm font-mono">
									#{blockNumber.toString()}
								</span>
							</div>
						)}

						{/* Timestamp */}
						{timestamp && (
							<div className="flex items-center justify-between p-3 bg-content1/20 rounded-lg">
								<span className="text-sm text-foreground/60">Time</span>
								<span className="text-sm">{formatTimestamp(timestamp)}</span>
							</div>
						)}

						{/* Gas Used */}
						{gasUsed && (
							<div className="flex items-center justify-between p-3 bg-content1/20 rounded-lg">
								<span className="text-sm text-foreground/60">Gas Used</span>
								<span className="text-sm font-mono">{formatGas(gasUsed)}</span>
							</div>
						)}
					</div>

					{/* Action Buttons */}
					<div className="flex gap-3">
						<Button color="glass" className="flex-1" onPress={handleCopyHash}>
							<DocumentTextIcon className="w-4 h-4 mr-2" />
							Copy Hash
						</Button>
						<Button
							color="glassPrimary"
							className="flex-1"
							onPress={() => window.open(blockExplorerUrl, "_blank")}
						>
							<ArrowTopRightOnSquareIcon className="w-4 h-4 mr-2" />
							View on Explorer
						</Button>
					</div>

					{/* Close Button */}
					<Button color="glass" className="w-full mt-4" onPress={onClose}>
						Close
					</Button>
				</Card>
			</ModalContent>
		</Modal>
	);
}
