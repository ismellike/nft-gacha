"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFormUrlSync } from "../hooks/useFormUrlSync";
import { useAccount, useWriteContract, usePublicClient } from "wagmi";
import { isAddress } from "viem";
import {
	CheckBadgeIcon,
	ExclamationTriangleIcon,
	CurrencyDollarIcon,
	MagnifyingGlassIcon,
	XCircleIcon,
	SparklesIcon,
	CpuChipIcon,
} from "@heroicons/react/24/outline";

import { Card, Button } from "../ui";
import { NFTCard } from "./NFTCard";
import { useGachaContracts } from "../hooks/useGachaContracts";
import { useGachaId } from "../hooks/useGachaId";
import {
	useReadNftAppraisalAppraisalFee,
	useReadNftAppraisalFeeToken,
	useReadErc20Symbol,
	useReadErc20Decimals,
	useReadErc20BalanceOf,
	useReadErc20Allowance,
} from "../generated";
import { formatTokenAmount } from "../lib/utils";
import { useActor } from "@xstate/react";
import {
	nftAppraisalMachine,
	type AppraisalCallbacks,
	type AppraisalResult,
} from "../machines/nftAppraisalMachine";
import { useNFTAppraisalStore } from "../stores/nftAppraisalStore";
import { useRewardsData } from "../hooks/useRewardsData";

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

	// XState machine integration
	const [state, send] = useActor(nftAppraisalMachine);

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
		if (state.matches("completed") && state.context.appraisalResult) {
			const appraisalResult = state.context.appraisalResult as AppraisalResult;
			const collection = appraisalResult.collection;
			const tokenId = appraisalResult.tokenId;

			// Add optimistic submission to store
			if (userAddress && collection && tokenId) {
				addOptimisticSubmission(userAddress, collection, tokenId);
			}

			// Trigger refetch of user's treasury cards and other rewards data
			refetchAllRewardsData();

			// Call onAction callback to notify upstream components
			if (onAction && collection && tokenId) {
				onAction(collection, tokenId, true); // hasValidAppraisal = true
			}

			// Call onAppraisalStatusChange callback to notify about appraisal status
			if (onAppraisalStatusChange && collection && tokenId) {
				onAppraisalStatusChange(collection, tokenId, true); // hasValidAppraisal = true
			}

			// Clear outstanding transaction hashes from machine context
			send({ type: "CLEAR_TX_HASHES" });

			if (onSubmissionSuccess && collection && tokenId) {
				onSubmissionSuccess(collection, tokenId);
			}
		}
	}, [
		state,
		onSubmissionSuccess,
		onAction,
		onAppraisalStatusChange,
		userAddress,
		addOptimisticSubmission,
		refetchAllRewardsData,
		send,
	]);

	// Handle errors from machine
	useEffect(() => {
		if (state.context.error) {
			setErrors({ general: state.context.error });
		} else {
			setErrors({});
		}
	}, [state.context.error]);

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

	const needsApproval = () => {
		if (!appraisalFee || !currentAllowance) return true;
		return currentAllowance < appraisalFee;
	};

	const hasInsufficientBalance = () => {
		if (!appraisalFee || !userBalance) return false;
		return userBalance < appraisalFee;
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

			// Create callbacks for the state machine
			const callbacks: AppraisalCallbacks = {
				approveTokens: async (params) => {
					try {
						const hash = await approveTokensAsync(params);
						return hash;
					} catch (error) {
						console.error("[NFTAppraisalForm] Approval callback error:", error);
						throw error;
					}
				},
				requestAppraisal: async (params) => {
					try {
						const hash = await requestAppraisalAsync(params);
						return hash;
					} catch (error) {
						console.error(
							"[NFTAppraisalForm] Appraisal callback error:",
							error,
						);
						throw error;
					}
				},
			};

			// Start the appraisal process with callbacks
			send({
				type: "START_APPRAISAL",
				collection: formData.collection,
				tokenId: formData.tokenId,
				userAddress,
				publicClient,
				appraisalContractAddress: contracts.appraisal,
				feeTokenAddress: feeToken,
				appraisalFee,
				callbacks,
			});
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : String(error);
			console.error("Error:", error);
			send({
				type: "ERROR",
				error: message.includes("rejected")
					? "Transaction cancelled"
					: message.includes("already exists")
						? "This NFT was already appraised"
						: "Something went wrong, please try again",
			});
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
		send({ type: "RESET" });
		setErrors({});
		const emptyFormData = { collection: "", tokenId: "" };
		setFormData(emptyFormData);
		updateUrlFromFormData(emptyFormData);
	};

	const isPending =
		isApproving || isRequestingAppraisal || !state.matches("idle");

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
										isDisabled
									>
										<span className="flex items-center justify-center gap-2">
											<CheckBadgeIcon className="w-5 h-5" /> Appraised
											Successfully
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
				{shouldShowPreview() && state.matches("idle") && (
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
				{state.matches("idle") && (
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
									className={`w-full px-4 py-3 border rounded-lg transition-colors ${
										errors.collection
											? "border-red-300 focus:border-red-500"
											: "border-gray-300 focus:border-blue-500"
									} focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-50 disabled:cursor-not-allowed`}
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
									className={`w-full px-4 py-3 border rounded-lg transition-colors ${
										errors.tokenId
											? "border-red-300 focus:border-red-500"
											: "border-gray-300 focus:border-blue-500"
									} focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-50 disabled:cursor-not-allowed`}
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
											Request re-appraisals anytime for updated market data
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
									{needsApproval() ? "Approve & Appraise" : "Get Appraisal"}
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
