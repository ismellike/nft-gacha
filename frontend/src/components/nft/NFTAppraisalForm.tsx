"use client";

import {
	CheckBadgeIcon,
	CpuChipIcon,
	MagnifyingGlassIcon,
	SparklesIcon,
} from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { isAddress } from "viem";
import { useAccount, usePublicClient } from "wagmi";
import type { AppraisalResult } from "../../async-utils/nftAppraisalMachine";
import {
	useReadErc20Allowance,
	useReadErc20BalanceOf,
	useReadErc20Decimals,
	useReadErc20Symbol,
	useReadNftAppraisalAppraisalFee,
	useReadNftAppraisalFeeToken,
} from "../../generated";
import { useAppraisalEvents } from "../../hooks/useAppraisalEvents";
import { useFormUrlSync } from "../../hooks/useFormUrlSync";
import { useFormValidation } from "../../hooks/useFormValidation";
import { useGachaContracts } from "../../hooks/useGachaContracts";
import { useGachaId } from "../../hooks/useGachaId";
import { useNFTApproval } from "../../hooks/useNFTApproval";
import { useRewardsData } from "../../hooks/useRewardsData";
import { validationRules } from "../../lib/formValidation";
import { formatTokenAmount } from "../../lib/utils";
import { useNFTAppraisalStore } from "../../stores/nftAppraisalStore";
import { Button, Card } from "../../ui";
import { NFTCard } from "./NFTCard";
import {
	AppraisalFormFields,
	AppraisalProgress,
	AppraisalResult as AppraisalResultView,
} from "./appraisal";

interface NFTAppraisalFormProps {
	onSubmissionSuccess?: (collection: string, tokenId: string) => void;
	onAction?: (
		collection: string,
		tokenId: string,
		hasValidAppraisal?: boolean,
	) => void;
	onAppraisalStatusChange?: (
		collection: string,
		tokenId: string,
		hasValidAppraisal: boolean,
	) => void;
	className?: string;
}

interface FormData {
	collection: string;
	tokenId: string;
}

interface FormErrors {
	collection?: string;
	tokenId?: string;
	general?: string;
}

type AppraisalStatus =
	| "idle"
	| "approving"
	| "submitting"
	| "waitingForCompletion"
	| "completed"
	| "error";

export function NFTAppraisalForm({
	onSubmissionSuccess,
	onAction,
	onAppraisalStatusChange,
	className,
}: NFTAppraisalFormProps) {
	const { address: userAddress, isConnected } = useAccount();
	const publicClient = usePublicClient();
	const gachaId = useGachaId();
	const contracts = useGachaContracts(gachaId);

	// Sync form data with URL parameters for deep-linking
	const [urlSyncedData, updateUrlFromFormData] = useFormUrlSync({
		collection: "",
		tokenId: "",
	});

	const [formData, setFormData] = useState<FormData>({
		collection: urlSyncedData.collection,
		tokenId: urlSyncedData.tokenId,
	});

	const [errors, setErrors] = useState<FormErrors>({});

	// Form validation with real-time feedback
	const formConfig = {
		collection: {
			rules: [
				validationRules.required("Collection address is required"),
				validationRules.ethAddress(),
			],
			validateOnChange: true,
		},
		tokenId: {
			rules: [
				validationRules.required("Token ID is required"),
				validationRules.tokenId(),
			],
			validateOnChange: true,
		},
	};

	const {
		fields,
		validateField,
		touchField,
		validateAll,
		reset: resetValidation,
		isFormValid,
	} = useFormValidation(formConfig);

	const [status, setStatus] = useState<AppraisalStatus>("idle");
	const [appraisalResult, setAppraisalResult] =
		useState<AppraisalResult | null>(null);
	const [appraisalError, setAppraisalError] = useState<string | null>(null);
	const [approvalTxHash, setApprovalTxHash] = useState<string | null>(null);
	const [submissionTxHash, setSubmissionTxHash] = useState<string | null>(null);
	const [submissionOutcome, setSubmissionOutcome] = useState<
		"pending" | "success" | "refunded" | "failed" | null
	>(null);

	// Appraisal timeout and progress tracking
	const APPRAISAL_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
	const [appraisalStartTime, setAppraisalStartTime] = useState<number | null>(
		null,
	);
	const [appraisalElapsed, setAppraisalElapsed] = useState(0);

	type AppraisalStage =
		| "validating"
		| "decoding"
		| "fetching"
		| "appraising"
		| "complete";
	const [currentStage, setCurrentStage] =
		useState<AppraisalStage>("validating");

	const lastSubmittedRef = useRef<{
		collection: string;
		tokenId: string;
	} | null>(null);

	const state = useMemo(
		() => ({
			value: status,
			matches: (test: AppraisalStatus) => status === test,
			context: {
				appraisalResult,
				error: appraisalError,
				approvalTxHash,
				submissionTxHash,
			},
		}),
		[status, appraisalResult, appraisalError, approvalTxHash, submissionTxHash],
	);

	// Store for optimistic updates
	const { addOptimisticSubmission } = useNFTAppraisalStore();

	// Rewards data refetch for treasury cards
	const { refetchAllRewardsData } = useRewardsData();

	// Sync URL changes to form data
	useEffect(() => {
		setFormData({
			collection: urlSyncedData.collection,
			tokenId: urlSyncedData.tokenId,
		});
	}, [urlSyncedData.collection, urlSyncedData.tokenId]);

	// Contract reads for appraisal fee and token info
	const { data: appraisalFee } = useReadNftAppraisalAppraisalFee({
		address: contracts.appraisal as `0x${string}` | undefined,
		query: { enabled: !!contracts.appraisal },
	});

	const { data: feeToken } = useReadNftAppraisalFeeToken({
		address: contracts.appraisal as `0x${string}` | undefined,
		query: { enabled: !!contracts.appraisal },
	});

	const { data: tokenSymbol } = useReadErc20Symbol({
		address: feeToken as `0x${string}` | undefined,
		query: { enabled: !!feeToken },
	});

	const { data: tokenDecimals } = useReadErc20Decimals({
		address: feeToken as `0x${string}` | undefined,
		query: { enabled: !!feeToken },
	});

	const { data: userBalance } = useReadErc20BalanceOf({
		address: feeToken as `0x${string}` | undefined,
		args: userAddress ? [userAddress] : undefined,
		query: { enabled: !!feeToken && !!userAddress },
	});

	const { data: currentAllowance } = useReadErc20Allowance({
		address: feeToken as `0x${string}` | undefined,
		args:
			userAddress && contracts.appraisal
				? [userAddress as `0x${string}`, contracts.appraisal as `0x${string}`]
				: undefined,
		query: { enabled: !!feeToken && !!userAddress && !!contracts.appraisal },
	});

	// Approval + submission hook
	const { submitAppraisal, isApproving, isRequestingAppraisal } =
		useNFTApproval({
			publicClient,
			appraisalContractAddress: contracts.appraisal as
				| `0x${string}`
				| undefined,
			feeTokenAddress: feeToken as `0x${string}` | undefined,
			appraisalFee,
			currentAllowance,
			userAddress,
			lastSubmittedRef,
			onStatusChange: setStatus,
			onApprovalTxHash: setApprovalTxHash,
			onSubmissionTxHash: setSubmissionTxHash,
			onOutcomeChange: setSubmissionOutcome,
			onError: (message) => setAppraisalError(message),
			onClearError: () => setAppraisalError(null),
		});

	// Event watchers
	useAppraisalEvents({
		appraisalServiceHandlerAddress: contracts.appraisalServiceHandler as
			| `0x${string}`
			| undefined,
		appraisalContractAddress: contracts.appraisal as `0x${string}` | undefined,
		lastSubmittedRef,
		appraisalFee,
		userAddress,
		onStatusChange: setStatus,
		onAppraisalResult: setAppraisalResult,
		onError: (message) => setAppraisalError(message),
		onOutcomeChange: setSubmissionOutcome,
	});

	// Handle machine state completion
	useEffect(() => {
		if (status === "completed" && appraisalResult) {
			const collection = appraisalResult.collection;
			const tokenId = appraisalResult.tokenId;

			if (userAddress && collection && tokenId) {
				addOptimisticSubmission(userAddress, collection, tokenId);
			}

			refetchAllRewardsData();

			if (onAction && collection && tokenId) {
				onAction(collection, tokenId, true);
			}

			if (onAppraisalStatusChange && collection && tokenId) {
				onAppraisalStatusChange(collection, tokenId, true);
			}

			setApprovalTxHash(null);
			setSubmissionTxHash(null);

			if (onSubmissionSuccess && collection && tokenId) {
				onSubmissionSuccess(collection, tokenId);
			}
		}
	}, [
		status,
		appraisalResult,
		onSubmissionSuccess,
		onAction,
		onAppraisalStatusChange,
		userAddress,
		addOptimisticSubmission,
		refetchAllRewardsData,
	]);

	// Handle errors from machine
	useEffect(() => {
		if (appraisalError) {
			setErrors({ general: appraisalError });
		} else {
			setErrors({});
		}
	}, [appraisalError]);

	// Appraisal timeout timer
	useEffect(() => {
		if (status === "waitingForCompletion" && !appraisalStartTime) {
			setAppraisalStartTime(Date.now());
		}

		if (status !== "waitingForCompletion") {
			setAppraisalStartTime(null);
			setAppraisalElapsed(0);
			setCurrentStage("validating");
		}
	}, [status, appraisalStartTime]);

	// Update elapsed time every second
	useEffect(() => {
		if (!appraisalStartTime || status !== "waitingForCompletion") return;

		const interval = setInterval(() => {
			const elapsed = Date.now() - appraisalStartTime;
			setAppraisalElapsed(elapsed);

			// Check for timeout
			if (elapsed > APPRAISAL_TIMEOUT_MS) {
				setAppraisalError(
					"Appraisal is taking longer than expected. This may indicate an issue with the AVS service. You can wait longer or contact support.",
				);
				setStatus("error");
				clearInterval(interval);
			}
		}, 1000);

		return () => clearInterval(interval);
	}, [appraisalStartTime, status]);

	// Auto-advance progress stages for UX
	useEffect(() => {
		if (status !== "waitingForCompletion") {
			setCurrentStage("validating");
			return;
		}

		const stages: AppraisalStage[] = [
			"validating",
			"decoding",
			"fetching",
			"appraising",
		];
		const timeline = [2000, 8000, 15000, 30000]; // ms per stage
		let stageIndex = 0;

		const advanceStage = () => {
			if (stageIndex < stages.length) {
				setCurrentStage(stages[stageIndex] as AppraisalStage);
				stageIndex++;
			}
		};

		advanceStage(); // Start first stage immediately

		const timeouts = timeline.map((delay, i) =>
			setTimeout(() => advanceStage(), delay + (timeline[i - 1] || 0)),
		);

		return () => timeouts.forEach(clearTimeout);
	}, [status]);

	// Helper functions
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

	const needsApproval = () => {
		// Prefer on-chain allowance; if not yet loaded, we'll check at submission time
		if (appraisalFee === undefined || currentAllowance === undefined)
			return false;
		return currentAllowance < appraisalFee;
	};

	// Form validation using the validation hook
	const validateForm = (): boolean => {
		const newErrors: FormErrors = {};

		// Use the validation hook for field-level validation
		const isFieldsValid = validateAll({
			collection: formData.collection,
			tokenId: formData.tokenId,
		});

		if (!isFieldsValid) {
			return false;
		}

		if (!isConnected) {
			newErrors.general = "Please connect your wallet";
		}

		if (hasInsufficientBalance()) {
			newErrors.general = `Need ${formatFeeAmount(appraisalFee)} ${tokenSymbol}`;
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	// Handle form submission
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		setErrors({});
		await submitAppraisal(formData);
	};

	const handleInputChange = (field: keyof FormData, value: string) => {
		const newFormData = { ...formData, [field]: value };
		setFormData(newFormData);

		// Update URL params when form fields change
		updateUrlFromFormData(newFormData);

		// Touch and validate the field
		touchField(field);

		const fieldConfig = formConfig[field as keyof typeof formConfig];
		if (fieldConfig?.validateOnChange) {
			validateField(field, value);
		}

		// Clear general errors when user types
		if (errors.general) {
			setErrors((prev) => {
				const newErrors = { ...prev };
				delete newErrors.general;
				return newErrors;
			});
		}
	};

	const resetForm = () => {
		setStatus("idle");
		setAppraisalError(null);
		setAppraisalResult(null);
		setApprovalTxHash(null);
		setSubmissionTxHash(null);
		setSubmissionOutcome(null);
		lastSubmittedRef.current = null;
		setErrors({});
		resetValidation();
		const emptyFormData = { collection: "", tokenId: "" };
		setFormData(emptyFormData);
		updateUrlFromFormData(emptyFormData);
	};

	// Only treat in-flight contract steps as pending; allow error state to re-enable inputs
	const isPending =
		isApproving ||
		isRequestingAppraisal ||
		state.value === "approving" ||
		state.value === "submitting" ||
		state.value === "waitingForCompletion";

	// Show preview if valid NFT details
	const shouldShowPreview = () => {
		return (
			formData.collection &&
			formData.tokenId &&
			contracts.appraisal &&
			isAddress(formData.collection) &&
			!Number.isNaN(Number(formData.tokenId)) &&
			Number(formData.tokenId) >= 0
		);
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 30 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.8 }}
			className={className}
		>
			<Card className="max-w-2xl mx-auto bg-content1/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
				{/* Header */}
				<div className="text-center p-8 pb-4">
					<AnimatePresence mode="wait">
						{state.matches("completed") ? (
							<AppraisalResultView key="success" onReset={resetForm} />
						) : state.matches("waitingForCompletion") ? (
							<AppraisalProgress
								key="processing"
								appraisalElapsed={appraisalElapsed}
								currentStage={currentStage}
							/>
						) : (
							<motion.div key="default" className="space-y-4">
								<div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto">
									<MagnifyingGlassIcon className="w-10 h-10 text-white" />
								</div>
								<h2 className="text-2xl font-semibold text-foreground">
									AVS-Powered Appraisal
								</h2>
								<p className="text-foreground/70">
									Submit your NFT for metadata decoding and API-based market
									analysis
								</p>
							</motion.div>
						)}
					</AnimatePresence>
				</div>

				{/* Progress indicator */}
				<AnimatePresence>
					{(state.matches("approving") || state.matches("submitting")) && (
						<motion.div
							initial={{ height: 0, opacity: 0 }}
							animate={{ height: "auto", opacity: 1 }}
							exit={{ height: 0, opacity: 0 }}
							className="px-8 mb-6"
						>
							<div className="bg-content1/10 backdrop-blur-xl border border-white/10 rounded-xl p-3">
								<div className="flex items-center gap-2">
									<div
										className={`w-2 h-2 rounded-full ${
											state.matches("approving") || state.matches("submitting")
												? "bg-success"
												: "bg-default-300"
										}`}
									/>
									<div className={"w-8 h-0.5 bg-default-300"} />
									<div
										className={`w-2 h-2 rounded-full ${
											state.matches("submitting")
												? "bg-success"
												: "bg-default-300"
										}`}
									/>
									<div className="ml-auto text-xs text-foreground">
										{state.matches("approving") && "Approving..."}
										{state.matches("submitting") && "Submitting to AVS..."}
									</div>
								</div>
							</div>
						</motion.div>
					)}
				</AnimatePresence>

				{/* NFT Preview */}
				{shouldShowPreview() && (
					<motion.div
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						className="px-8 mb-6"
					>
						<div className="bg-success/10 border border-success/20 rounded-lg p-4">
							<div className="flex items-center gap-3 mb-3">
								<CheckBadgeIcon className="w-5 h-5 text-success" />
								<span className="text-sm font-medium text-success">
									NFT Preview
								</span>
							</div>
							<div className="flex justify-center mb-3">
								<div className="w-48">
									{contracts.appraisal && (
										<NFTCard
											data={{
												collection: formData.collection,
												tokenId: formData.tokenId,
											}}
											size="sm"
											showCollectionName={false}
											appraisalContractAddress={
												contracts.appraisal as `0x${string}`
											}
										/>
									)}
								</div>
							</div>
							<div className="text-center space-y-1">
								<p className="text-xs text-foreground/60">
									Collection:{" "}
									<span className="font-mono">
										{formData.collection.slice(0, 8)}...
										{formData.collection.slice(-6)}
									</span>
								</p>
								<p className="text-xs text-foreground/60">
									Token ID:{" "}
									<span className="font-mono">#{formData.tokenId}</span>
								</p>
							</div>
						</div>
					</motion.div>
				)}

				{/* Form */}
				{(state.matches("idle") || state.matches("error")) && (
					<AppraisalFormFields
						formData={formData}
						onInputChange={handleInputChange}
						onSubmit={handleSubmit}
						touchField={touchField}
						fields={fields}
						errors={errors}
						isPending={isPending}
						isFormValid={isFormValid}
						appraisalFee={appraisalFee}
						tokenSymbol={tokenSymbol}
						tokenDecimals={tokenDecimals}
						userBalance={userBalance}
						needsApproval={needsApproval()}
						approvalTxHash={approvalTxHash}
						submissionTxHash={submissionTxHash}
						submissionOutcome={submissionOutcome}
					/>
				)}

				{/* Pending states with cancel option */}
				{(state.matches("approving") ||
					state.matches("submitting") ||
					state.matches("waitingForCompletion")) && (
					<div className="p-8 pt-4 text-center space-y-4">
						<div className="space-y-2">
							{state.matches("approving") && (
								<>
									<div className="w-16 h-16 bg-gradient-to-br from-warning/20 to-orange-400/20 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
										<CpuChipIcon className="w-8 h-8 text-warning animate-pulse" />
									</div>
									<h3 className="text-lg font-semibold text-foreground">
										Approving Token Transfer
									</h3>
									<p className="text-foreground/70 text-sm">
										Please confirm the approval transaction in your wallet
									</p>
								</>
							)}
							{state.matches("submitting") && (
								<>
									<div className="w-16 h-16 bg-gradient-to-br from-info/20 to-blue-400/20 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
										<SparklesIcon className="w-8 h-8 text-info animate-pulse" />
									</div>
									<h3 className="text-lg font-semibold text-foreground">
										Submitting Appraisal Request
									</h3>
									<p className="text-foreground/70 text-sm">
										Your NFT is being sent to our AVS for professional appraisal
									</p>
								</>
							)}
							{state.matches("waitingForCompletion") && (
								<>
									<div className="w-16 h-16 bg-gradient-to-br from-success/20 to-green-400/20 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
										<CpuChipIcon className="w-8 h-8 text-success animate-pulse" />
									</div>
									<h3 className="text-lg font-semibold text-foreground">
										Processing Appraisal
									</h3>
									<p className="text-foreground/70 text-sm">
										Our AVS is analyzing your NFT's metadata and market data
									</p>
								</>
							)}
						</div>
						<div className="bg-content1/20 border border-white/10 rounded-lg p-3 text-left space-y-2 text-sm text-foreground/70">
							{approvalTxHash && (
								<div className="flex items-center justify-between">
									<span>Approval transaction</span>
									<span className="font-mono text-foreground/60">
										{formatHash(approvalTxHash)}
									</span>
								</div>
							)}
							{submissionTxHash && (
								<div className="flex items-center justify-between">
									<span>Appraisal transaction</span>
									<span className="font-mono text-foreground/60">
										{formatHash(submissionTxHash)}
									</span>
								</div>
							)}
							{submissionOutcome === "failed" && (
								<p className="text-xs text-red-500">
									Appraisal did not complete (failed). You can retry.
								</p>
							)}
							{submissionOutcome === "refunded" && (
								<p className="text-xs text-warning">
									Appraisal was refunded. Please retry when ready.
								</p>
							)}
							{submissionOutcome === "success" && (
								<p className="text-xs text-success">
									Appraisal transaction confirmed. Waiting for on-chain result.
								</p>
							)}
							{!approvalTxHash && !submissionTxHash && (
								<p className="text-foreground/60">
									Waiting for your wallet to confirm the transaction...
								</p>
							)}
						</div>
						<div className="flex gap-3 pt-4">
							<Button
								type="button"
								color="glass"
								className="flex-1"
								onPress={resetForm}
							>
								Cancel & Return
							</Button>
							<div className="flex-1">{/* Placeholder for balance */}</div>
						</div>
					</div>
				)}
			</Card>
		</motion.div>
	);
}
