"use client";

import {
	CheckBadgeIcon,
	CpuChipIcon,
	CurrencyDollarIcon,
	ExclamationTriangleIcon,
	MagnifyingGlassIcon,
	SparklesIcon,
	XCircleIcon,
} from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { isAddress } from "viem";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import type { AppraisalResult } from "../../async-utils/nftAppraisalMachine";
import {
	useReadErc20Allowance,
	useReadErc20BalanceOf,
	useReadErc20Decimals,
	useReadErc20Symbol,
	useReadNftAppraisalAppraisalFee,
	useReadNftAppraisalFeeToken,
	useWatchNftAppraisalAppraisalStatusChanged,
	useWatchNftAppraisalServiceHandlerAppraisalErrorReceived,
	useWatchNftAppraisalServiceHandlerAppraisalProcessed,
} from "../../generated";
import { useFormUrlSync } from "../../hooks/useFormUrlSync";
import { useGachaContracts } from "../../hooks/useGachaContracts";
import { useGachaId } from "../../hooks/useGachaId";
import { useRewardsData } from "../../hooks/useRewardsData";
import { formatTokenAmount } from "../../lib/utils";
import { useNFTAppraisalStore } from "../../stores/nftAppraisalStore";
import { Button, Card } from "../../ui";
import { NFTCard } from "./NFTCard";

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

	const [status, setStatus] = useState<AppraisalStatus>("idle");
	const [appraisalResult, setAppraisalResult] =
		useState<AppraisalResult | null>(null);
	const [appraisalError, setAppraisalError] = useState<string | null>(null);
	const [approvalTxHash, setApprovalTxHash] = useState<string | null>(null);
	const [submissionTxHash, setSubmissionTxHash] = useState<string | null>(null);
	const [submissionOutcome, setSubmissionOutcome] = useState<
		"pending" | "success" | "refunded" | "failed" | null
	>(null);
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

	// Contract writes
	const { writeContractAsync: approveTokensAsync, isPending: isApproving } =
		useWriteContract();
	const {
		writeContractAsync: requestAppraisalAsync,
		isPending: isRequestingAppraisal,
	} = useWriteContract();

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

	// Form validation
	const validateForm = (): boolean => {
		const newErrors: FormErrors = {};

		if (!formData.collection.trim()) {
			newErrors.collection = "Please enter a collection address";
		} else if (!isAddress(formData.collection)) {
			newErrors.collection = "Please enter a valid address";
		}

		if (!formData.tokenId.trim()) {
			newErrors.tokenId = "Please enter a token ID";
		} else if (
			Number.isNaN(Number(formData.tokenId)) ||
			Number(formData.tokenId) < 0
		) {
			newErrors.tokenId = "Please enter a valid ID";
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

		if (
			!userAddress ||
			!publicClient ||
			!contracts.appraisal ||
			!feeToken ||
			!appraisalFee
		) {
			setErrors({ general: "Missing required parameters" });
			return;
		}

		try {
			setErrors({});
			setAppraisalError(null);
			setSubmissionOutcome("pending");
			if (userAddress) {
				// Track this submission optimistically so watcher hooks can react to handler events
				useNFTAppraisalStore
					.getState()
					.addOptimisticSubmission(
						userAddress,
						formData.collection,
						formData.tokenId,
					);
			}

			// Fetch a fresh allowance to avoid unnecessary approvals for users already approved
			let allowance = currentAllowance;
			if (allowance === undefined) {
				allowance = (await publicClient.readContract({
					address: feeToken as `0x${string}`,
					abi: [
						{
							name: "allowance",
							type: "function",
							stateMutability: "view",
							inputs: [
								{ name: "owner", type: "address" },
								{ name: "spender", type: "address" },
							],
							outputs: [{ name: "", type: "uint256" }],
						},
					],
					functionName: "allowance",
					args: [
						userAddress as `0x${string}`,
						contracts.appraisal as `0x${string}`,
					],
				})) as bigint;
			}

			const approvalNeeded =
				appraisalFee !== undefined && allowance !== undefined
					? allowance < appraisalFee
					: true;

			// Approve only when needed, then submit the appraisal
			if (approvalNeeded) {
				setStatus("approving");
				const hash = await approveTokensAsync({
					address: feeToken as `0x${string}`,
					abi: [
						{
							name: "approve",
							type: "function",
							stateMutability: "nonpayable",
							inputs: [
								{ name: "spender", type: "address" },
								{ name: "amount", type: "uint256" },
							],
							outputs: [{ name: "", type: "bool" }],
						},
					],
					functionName: "approve",
					args: [contracts.appraisal as `0x${string}`, appraisalFee],
				});
				setApprovalTxHash(hash);
				await publicClient.waitForTransactionReceipt({ hash });
			}

			setStatus("submitting");
			const submissionHash = await requestAppraisalAsync({
				address: contracts.appraisal as `0x${string}`,
				abi: [
					{
						name: "requestAppraisal",
						type: "function",
						stateMutability: "nonpayable",
						inputs: [
							{ name: "collection", type: "address" },
							{ name: "tokenId", type: "uint256" },
						],
						outputs: [],
					},
				],
				functionName: "requestAppraisal",
				args: [formData.collection as `0x${string}`, BigInt(formData.tokenId)],
			});
			setSubmissionTxHash(submissionHash);
			const submissionReceipt = await publicClient.waitForTransactionReceipt({
				hash: submissionHash,
			});

			lastSubmittedRef.current = {
				collection: formData.collection,
				tokenId: formData.tokenId,
			};
			if (submissionReceipt.status !== "success") {
				setSubmissionOutcome("failed");
				setAppraisalError(
					"Appraisal transaction did not complete successfully (refunded or failed).",
				);
				setStatus("error");
				return;
			}

			setSubmissionOutcome("success");

			setStatus("waitingForCompletion");
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : String(error);
			console.error("Error:", error);
			setAppraisalError(
				message.includes("rejected")
					? "Transaction cancelled"
					: message.includes("already exists")
						? "This NFT was already appraised"
						: "Something went wrong, please try again",
			);
			setStatus("error");
		}
	};

	const handleInputChange = (field: keyof FormData, value: string) => {
		const newFormData = { ...formData, [field]: value };
		setFormData(newFormData);

		// Update URL params when form fields change
		updateUrlFromFormData(newFormData);

		// Clear errors when user types
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: undefined }));
		}
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

	// Listen for service handler confirmations to unblock UI immediately when the oracle finishes
	useWatchNftAppraisalServiceHandlerAppraisalProcessed({
		address: contracts.appraisalServiceHandler as `0x${string}` | undefined,
		enabled: !!contracts.appraisalServiceHandler && !!lastSubmittedRef.current,
		onLogs: (logs: unknown[]) => {
			const latest = lastSubmittedRef.current;
			if (!latest) return;

			for (const log of logs) {
				const { collection, tokenId, priceUSD, success, timestamp } = ((
					log as { args?: unknown }
				).args || {}) as {
					collection?: `0x${string}`;
					tokenId?: bigint;
					priceUSD?: bigint;
					success?: boolean;
					timestamp?: bigint;
				};

				const matchesCollection =
					collection?.toLowerCase() === latest.collection.toLowerCase();
				const matchesToken =
					tokenId !== undefined &&
					BigInt(tokenId).toString() === BigInt(latest.tokenId).toString();

				if (!matchesCollection || !matchesToken) continue;

				if (success) {
					setSubmissionOutcome("success");
					setStatus("completed");
					setAppraisalResult({
						collection: latest.collection,
						tokenId: latest.tokenId,
						appraisalData: [
							true,
							priceUSD ?? BigInt(0),
							BigInt(0),
							"",
							BigInt(timestamp ?? Math.floor(Date.now() / 1000)),
						],
					});
					if (userAddress) {
						useNFTAppraisalStore.getState().refreshUserAppraisals(userAddress);
					}
				} else {
					setSubmissionOutcome("failed");
					setAppraisalError("Appraisal processing failed.");
					setStatus("error");
					if (userAddress) {
						useNFTAppraisalStore.getState().refreshUserAppraisals(userAddress);
					}
				}

				lastSubmittedRef.current = null;
				break;
			}
		},
	});

	useWatchNftAppraisalServiceHandlerAppraisalErrorReceived({
		address: contracts.appraisalServiceHandler as `0x${string}` | undefined,
		enabled: !!contracts.appraisalServiceHandler && !!lastSubmittedRef.current,
		onLogs: (logs: unknown[]) => {
			const latest = lastSubmittedRef.current;
			if (!latest) return;

			for (const log of logs) {
				const { contractAddress, tokenId, error } = ((log as { args?: unknown })
					.args || {}) as {
					contractAddress?: `0x${string}`;
					tokenId?: bigint;
					error?: string;
				};

				const matchesCollection =
					contractAddress?.toLowerCase() === latest.collection.toLowerCase();
				const matchesToken =
					tokenId !== undefined &&
					BigInt(tokenId).toString() === BigInt(latest.tokenId).toString();

				if (!matchesCollection || !matchesToken) continue;

				setSubmissionOutcome("failed");
				setAppraisalError(
					error ? `Appraisal error: ${error}` : "Appraisal failed to process.",
				);
				setStatus("error");
				if (userAddress) {
					useNFTAppraisalStore.getState().refreshUserAppraisals(userAddress);
				}
				lastSubmittedRef.current = null;
				break;
			}
		},
	});

	// Watch on-chain appraisal status changes to mark success/refund for the most recent submission
	useWatchNftAppraisalAppraisalStatusChanged({
		address: contracts.appraisal as `0x${string}` | undefined,
		enabled: !!contracts.appraisal && !!lastSubmittedRef.current,
		onLogs: (logs: unknown[]) => {
			const latest = lastSubmittedRef.current;
			if (!latest) return;

			for (const log of logs) {
				const { collection, tokenId, newStatus } = ((log as { args?: unknown })
					.args || {}) as {
					collection?: `0x${string}`;
					tokenId?: bigint;
					newStatus?: bigint | number;
				};

				const matchesCollection =
					collection?.toLowerCase() === latest.collection.toLowerCase();
				const matchesToken =
					tokenId !== undefined &&
					BigInt(tokenId).toString() === BigInt(latest.tokenId).toString();

				if (!matchesCollection || !matchesToken) continue;

				if (newStatus === undefined) continue;

				const statusValue = Number(newStatus);
				// 1 = Completed, 2 = OwnerOverride
				if (statusValue === 1 || statusValue === 2) {
					setSubmissionOutcome("success");
					setStatus("completed");
					setAppraisalResult({
						collection: latest.collection,
						tokenId: latest.tokenId,
						appraisalData: [
							true,
							appraisalFee ?? BigInt(0),
							BigInt(0),
							"",
							BigInt(Date.now()),
						],
					});
				} else if (statusValue === 0) {
					// Still pending; keep waiting
					continue;
				} else {
					// Treat any other status as refunded/failed
					setSubmissionOutcome("refunded");
					setAppraisalError(
						"Appraisal was not completed and the fee should be refunded.",
					);
					setStatus("error");
				}

				// Stop listening for further updates on this submission
				lastSubmittedRef.current = null;
				break;
			}
		},
	});

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
							<motion.div
								key="success"
								initial={{ scale: 0.8, opacity: 0 }}
								animate={{ scale: 1, opacity: 1 }}
								className="space-y-4"
							>
								<div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto">
									<CheckBadgeIcon className="w-10 h-10 text-white" />
								</div>
								<h2 className="text-2xl font-semibold text-success">
									Appraisal Complete! 🎉
								</h2>
								<p className="text-foreground/70">
									Your NFT metadata has been analyzed and market data queried.
									Ready for gacha deposits!
								</p>
								<div className="pt-4">
									<Button
										className="w-full bg-gradient-to-r from-success to-emerald-500 text-white font-medium"
										onPress={resetForm}
									>
										<span className="flex items-center justify-center gap-2">
											<CheckBadgeIcon className="w-5 h-5" /> Appraised
											Successfully — Start another
										</span>
									</Button>
								</div>
							</motion.div>
						) : state.matches("waitingForCompletion") ? (
							<motion.div
								key="processing"
								initial={{ scale: 0.8, opacity: 0 }}
								animate={{ scale: 1, opacity: 1 }}
								className="space-y-4"
							>
								<div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto">
									<motion.div
										animate={{ rotate: 360 }}
										transition={{
											duration: 2,
											repeat: Infinity,
											ease: "linear",
										}}
									>
										<CpuChipIcon className="w-10 h-10 text-white" />
									</motion.div>
								</div>
								<h2 className="text-2xl font-semibold text-foreground">
									AVS Processing...
								</h2>
								<p className="text-foreground/70">
									Decoding metadata and querying external APIs for market data
								</p>
								<div className="flex justify-center">
									<div className="flex space-x-2">
										<motion.div
											className="w-3 h-3 bg-blue-400 rounded-full"
											animate={{ scale: [1, 1.5, 1] }}
											transition={{ duration: 1.4, repeat: Infinity }}
										/>
										<motion.div
											className="w-3 h-3 bg-purple-400 rounded-full"
											animate={{ scale: [1, 1.5, 1] }}
											transition={{
												duration: 1.4,
												repeat: Infinity,
												delay: 0.2,
											}}
										/>
										<motion.div
											className="w-3 h-3 bg-pink-400 rounded-full"
											animate={{ scale: [1, 1.5, 1] }}
											transition={{
												duration: 1.4,
												repeat: Infinity,
												delay: 0.4,
											}}
										/>
									</div>
								</div>
							</motion.div>
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
					<form onSubmit={handleSubmit} className="p-8 pt-4 space-y-4">
						{/* Collection Address */}
						<div>
							<label
								htmlFor="collection"
								className="block text-sm font-medium text-foreground mb-2"
							>
								Collection Address
							</label>
							<div className="relative">
								<input
									id="collection"
									type="text"
									placeholder="0x..."
									value={formData.collection}
									onChange={(e) =>
										handleInputChange("collection", e.target.value)
									}
									disabled={isPending}
									className={`w-full rounded-lg border px-4 py-3 transition-colors bg-content1/50 text-foreground placeholder:text-foreground/40 ${
										errors.collection
											? "border-red-400 focus:border-red-400 focus:ring-red-400/30"
											: "border-white/10 focus:border-warning focus:ring-warning/30"
									} focus:outline-none focus:ring-2 disabled:bg-content1/30 disabled:text-foreground/40 disabled:cursor-not-allowed`}
								/>
								{errors.collection && (
									<motion.p
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										className="text-red-600 text-sm mt-1 flex items-center gap-1"
									>
										<ExclamationTriangleIcon className="w-4 h-4" />
										{errors.collection}
									</motion.p>
								)}
							</div>
						</div>

						{/* Token ID */}
						<div>
							<label
								htmlFor="tokenId"
								className="block text-sm font-medium text-foreground mb-2"
							>
								Token ID
							</label>
							<div className="relative">
								<input
									id="tokenId"
									type="text"
									placeholder="123"
									value={formData.tokenId}
									onChange={(e) => handleInputChange("tokenId", e.target.value)}
									disabled={isPending}
									className={`w-full rounded-lg border px-4 py-3 transition-colors bg-content1/50 text-foreground placeholder:text-foreground/40 ${
										errors.tokenId
											? "border-red-400 focus:border-red-400 focus:ring-red-400/30"
											: "border-white/10 focus:border-warning focus:ring-warning/30"
									} focus:outline-none focus:ring-2 disabled:bg-content1/30 disabled:text-foreground/40 disabled:cursor-not-allowed`}
								/>
								{errors.tokenId && (
									<motion.p
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										className="text-red-600 text-sm mt-1 flex items-center gap-1"
									>
										<ExclamationTriangleIcon className="w-4 h-4" />
										{errors.tokenId}
									</motion.p>
								)}
							</div>
						</div>

						{/* Fee info */}
						{appraisalFee && (
							<div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
								<div className="flex items-center gap-3">
									<CurrencyDollarIcon className="w-5 h-5 text-blue-600" />
									<div>
										<p className="text-sm text-gray-700">
											Appraisal fee:{" "}
											<span className="font-semibold text-blue-600">
												{formatFeeAmount(appraisalFee)}{" "}
												{tokenSymbol || "TOKENS"}
											</span>
										</p>
										<p className="text-xs text-gray-500 mt-1">
											If USDC isn’t approved yet, we’ll prompt an approval
											first, then send the appraisal in the same flow—just
											confirm the wallet prompts we show you.
										</p>
										{userBalance !== undefined && (
											<p className="text-xs text-gray-600">
												Your balance: {formatFeeAmount(userBalance)}{" "}
												{tokenSymbol}
											</p>
										)}
									</div>
									{hasInsufficientBalance() && (
										<ExclamationTriangleIcon className="w-5 h-5 text-orange-500" />
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
									className="bg-red-50 border border-red-200 rounded-lg p-3"
								>
									<div className="flex items-center gap-2">
										<XCircleIcon className="w-5 h-5 text-red-600" />
										<p className="text-red-700 text-sm">{errors.general}</p>
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
										!formData.collection.trim() ||
										!formData.tokenId.trim() ||
										hasInsufficientBalance()
									}
								>
									{needsApproval() ? "Approve & Appraise" : "Appraise"}
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
									<span className="font-mono">
										{formatHash(approvalTxHash)}
									</span>
									. Waiting for confirmation...
								</p>
							)}
							{submissionTxHash && (
								<p className="text-xs text-foreground/50">
									Appraisal tx submitted:{" "}
									<span className="font-mono">
										{formatHash(submissionTxHash)}
									</span>
									.{" "}
									{submissionOutcome === "pending" &&
										"Waiting for confirmation..."}
									{submissionOutcome === "success" && "Confirmed on-chain."}
									{submissionOutcome === "refunded" &&
										"Appraisal was refunded. You can retry anytime."}
									{submissionOutcome === "failed" &&
										"Appraisal was not processed (failed)."}
								</p>
							)}
						</div>
					</form>
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
