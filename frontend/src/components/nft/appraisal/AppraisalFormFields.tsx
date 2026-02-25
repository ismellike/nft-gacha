import {
	CurrencyDollarIcon,
	ExclamationTriangleIcon,
	SparklesIcon,
	XCircleIcon,
} from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "framer-motion";
import { formatTokenAmount } from "../../../lib/utils";
import { Button, Input } from "../../../ui";

interface FormData {
	collection: string;
	tokenId: string;
}

interface FormErrors {
	collection?: string;
	tokenId?: string;
	general?: string;
}

interface FieldState {
	isTouched?: boolean | undefined;
	isValid?: boolean | undefined;
	error?: string | undefined;
}

interface AppraisalFormFieldsProps {
	formData: FormData;
	onInputChange: (field: keyof FormData, value: string) => void;
	onSubmit: (e: React.FormEvent) => void;
	touchField: (field: string) => void;
	fields: Record<string, FieldState | undefined>;
	errors: FormErrors;
	isPending: boolean;
	isFormValid: boolean;
	appraisalFee: bigint | undefined;
	tokenSymbol: string | undefined;
	tokenDecimals: number | undefined;
	userBalance: bigint | undefined;
	needsApproval: boolean;
	approvalTxHash: string | null;
	submissionTxHash: string | null;
	submissionOutcome: "pending" | "success" | "refunded" | "failed" | null;
}

export function AppraisalFormFields({
	formData,
	onInputChange,
	onSubmit,
	touchField,
	fields,
	errors,
	isPending,
	isFormValid,
	appraisalFee,
	tokenSymbol,
	tokenDecimals,
	userBalance,
	needsApproval,
	approvalTxHash,
	submissionTxHash,
	submissionOutcome,
}: AppraisalFormFieldsProps) {
	const formatFeeAmount = (amount: bigint | undefined) => {
		if (!amount || !tokenDecimals) return "0";
		return formatTokenAmount(amount, tokenDecimals, {
			maxDecimals: 4,
			minDecimals: 0,
			useGrouping: true,
			notation: "standard",
		});
	};

	const hasInsufficientBalance = () => {
		if (!appraisalFee || !userBalance) return false;
		return userBalance < appraisalFee;
	};

	const formatHash = (hash: string) =>
		hash.length > 10 ? `${hash.slice(0, 6)}...${hash.slice(-4)}` : hash;

	return (
		<form onSubmit={onSubmit} className="p-8 pt-4 space-y-4">
			{/* Collection Address */}
			<Input
				id="collection"
				type="text"
				label="Collection Address"
				placeholder="0x..."
				value={formData.collection}
				onChange={(e) => onInputChange("collection", e.target.value)}
				onBlur={() => touchField("collection")}
				disabled={isPending}
				aria-required="true"
				variant={
					fields.collection?.isTouched && !fields.collection?.isValid
						? "error"
						: "default"
				}
				errorMessage={
					fields.collection?.error ??
					(fields.collection?.isTouched && !fields.collection?.isValid
						? errors.collection
						: undefined)
				}
			/>

			{/* Token ID */}
			<Input
				id="tokenId"
				type="text"
				label="Token ID"
				placeholder="123"
				value={formData.tokenId}
				onChange={(e) => onInputChange("tokenId", e.target.value)}
				onBlur={() => touchField("tokenId")}
				disabled={isPending}
				aria-required="true"
				variant={
					fields.tokenId?.isTouched && !fields.tokenId?.isValid
						? "error"
						: "default"
				}
				errorMessage={
					fields.tokenId?.error ??
					(fields.tokenId?.isTouched && !fields.tokenId?.isValid
						? errors.tokenId
						: undefined)
				}
			/>

			{/* Fee info */}
			{appraisalFee && (
				<div className="bg-info/10 border border-info/20 rounded-lg p-3">
					<div className="flex items-center gap-3">
						<CurrencyDollarIcon className="w-5 h-5 text-info" />
						<div>
							<p className="text-sm text-foreground/80">
								Appraisal fee:{" "}
								<span className="font-semibold text-info">
									{formatFeeAmount(appraisalFee)}{" "}
									{tokenSymbol || "TOKENS"}
								</span>
							</p>
							<p className="text-xs text-foreground/60 mt-1">
								If USDC isn't approved yet, we'll prompt an approval first, then
								send the appraisal in the same flow—just confirm the wallet
								prompts we show you.
							</p>
							{userBalance !== undefined && (
								<p className="text-xs text-foreground/70">
									Your balance: {formatFeeAmount(userBalance)} {tokenSymbol}
								</p>
							)}
						</div>
						{hasInsufficientBalance() && (
							<ExclamationTriangleIcon className="w-5 h-5 text-warning" />
						)}
					</div>
				</div>
			)}

			{/* Error display */}
			<AnimatePresence>
				{errors.general && (
					<motion.div
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						className="bg-danger/10 border border-danger/20 rounded-lg p-3"
					>
						<div className="flex items-center gap-2">
							<XCircleIcon className="w-5 h-5 text-danger" />
							<p className="text-danger text-sm">{errors.general}</p>
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Submit button */}
			<AnimatePresence mode="wait">
				<motion.div
					key="submit"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
				>
					<Button
						type="submit"
						color="primary"
						className="w-full bg-gradient-to-r from-orange-400 to-yellow-400 hover:from-orange-500 hover:to-yellow-500 text-white font-medium"
						isLoading={isPending}
						isDisabled={
							!isFormValid ||
							!formData.collection.trim() ||
							!formData.tokenId.trim() ||
							hasInsufficientBalance()
						}
					>
						{needsApproval ? "Approve & Appraise" : "Appraise"}
					</Button>
				</motion.div>
			</AnimatePresence>

			{/* AVS Info */}
			<div className="text-center space-y-2 pt-4">
				<div className="flex items-center justify-center space-x-2 text-foreground/60">
					<SparklesIcon className="w-4 h-4" />
					<span className="text-sm">
						Professional appraisal helps your NFT get the best value
					</span>
				</div>
				{approvalTxHash && (
					<p className="text-xs text-foreground/50">
						Approval tx submitted:{" "}
						<span className="font-mono">{formatHash(approvalTxHash)}</span>.
						Waiting for confirmation...
					</p>
				)}
				{submissionTxHash && (
					<p className="text-xs text-foreground/50">
						Appraisal tx submitted:{" "}
						<span className="font-mono">{formatHash(submissionTxHash)}</span>.{" "}
						{submissionOutcome === "pending" && "Waiting for confirmation..."}
						{submissionOutcome === "success" && "Confirmed on-chain."}
						{submissionOutcome === "refunded" &&
							"Appraisal was refunded. You can retry anytime."}
						{submissionOutcome === "failed" &&
							"Appraisal was not processed (failed)."}
					</p>
				)}
			</div>
		</form>
	);
}
