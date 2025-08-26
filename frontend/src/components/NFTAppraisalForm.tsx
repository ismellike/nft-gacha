"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useClientSearchParam } from "../hooks/useClientSearchParams";
import { useAccount, useWriteContract } from "wagmi";
import { isAddress } from "viem";
import {
	CheckBadgeIcon,
	ExclamationTriangleIcon,
	CurrencyDollarIcon,
	MagnifyingGlassIcon,
	XCircleIcon,
	InformationCircleIcon,
} from "@heroicons/react/24/outline";

import { Card, Button } from "./ui";
import { UnifiedNFTCard } from "./ui/UnifiedNFTCard";
import { useGachaContracts } from "../hooks/useGachaContracts";
import { useGachaId } from "../hooks/useGachaId";
import {
	useReadNftAppraisalAppraisalFee,
	useReadNftAppraisalFeeToken,
	useReadErc20Symbol,
	useReadErc20Decimals,
	useReadErc20BalanceOf,
	useReadErc20Allowance,
	nftAppraisalAbi,
} from "../generated";
import { formatTokenAmount } from "../lib/utils";

interface NFTAppraisalFormProps {
	onSubmissionSuccess?: (collection: string, tokenId: string) => void;
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
	className,
}: NFTAppraisalFormProps) {
	const { address: userAddress, isConnected } = useAccount();
	const gachaId = useGachaId();
	const contracts = useGachaContracts(gachaId);

	// Get URL params for pre-filled forms
	const collectionParam = useClientSearchParam("collection");
	const tokenIdParam = useClientSearchParam("tokenId");

	const [formData, setFormData] = useState<FormData>({
		collection: "",
		tokenId: "",
	});
	const [errors, setErrors] = useState<FormErrors>({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isPrePopulated, setIsPrePopulated] = useState(false);

	// Populate form with URL parameters
	useEffect(() => {
		if (collectionParam || tokenIdParam) {
			setFormData({
				collection: collectionParam || "",
				tokenId: tokenIdParam || "",
			});
			setIsPrePopulated(true);
		}
	}, [collectionParam, tokenIdParam]);

	// Contract reads for appraisal fee and token info
	const { data: appraisalFee } = useReadNftAppraisalAppraisalFee({
		address: contracts.appraisal,
		query: { enabled: !!contracts.appraisal },
	});

	const { data: feeToken } = useReadNftAppraisalFeeToken({
		address: contracts.appraisal,
		query: { enabled: !!contracts.appraisal },
	});

	const { data: tokenSymbol } = useReadErc20Symbol({
		address: feeToken,
		query: { enabled: !!feeToken },
	});

	const { data: tokenDecimals } = useReadErc20Decimals({
		address: feeToken,
		query: { enabled: !!feeToken },
	});

	const { data: userBalance } = useReadErc20BalanceOf({
		address: feeToken,
		args: userAddress ? [userAddress] : undefined,
		query: { enabled: !!feeToken && !!userAddress },
	});

	const { data: currentAllowance, refetch: refetchAllowance } =
		useReadErc20Allowance({
			address: feeToken,
			args:
				userAddress && contracts.appraisal
					? [userAddress, contracts.appraisal]
					: undefined,
			query: { enabled: !!feeToken && !!userAddress && !!contracts.appraisal },
		});

	// Contract writes
	const { writeContract: approveTokens, isPending: isApproving } =
		useWriteContract();
	const { writeContract: requestAppraisal, isPending: isRequestingAppraisal } =
		useWriteContract();

	// Helper functions
	const formatFeeAmount = (amount: bigint | undefined) => {
		if (!amount || !tokenDecimals) return "0";
		return formatTokenAmount(amount, tokenDecimals, {
			maxDecimals: 6,
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
			newErrors.collection = "Collection address is required";
		} else if (!isAddress(formData.collection)) {
			newErrors.collection = "Please enter a valid Ethereum address";
		}

		if (!formData.tokenId.trim()) {
			newErrors.tokenId = "Token ID is required";
		} else if (
			Number.isNaN(Number(formData.tokenId)) ||
			Number(formData.tokenId) < 0
		) {
			newErrors.tokenId = "Please enter a valid token ID";
		}

		if (!isConnected) {
			newErrors.general = "Please connect your wallet";
		}

		if (hasInsufficientBalance()) {
			newErrors.general = `Insufficient ${tokenSymbol} balance. You need ${formatFeeAmount(appraisalFee)} ${tokenSymbol}`;
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

		setIsSubmitting(true);
		setErrors({});

		try {
			// Step 1: Approve tokens if needed
			if (needsApproval() && appraisalFee) {
				console.log("Approving tokens for appraisal fee...");
				if (feeToken && contracts.appraisal) {
					approveTokens({
						address: feeToken,
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
						args: [contracts.appraisal, appraisalFee],
					});
				}

				// Wait for approval to complete
				await new Promise((resolve) => setTimeout(resolve, 3000));
				await refetchAllowance();
			}

			// Step 2: Request appraisal
			console.log("Requesting NFT appraisal...");
			if (contracts.appraisal) {
				requestAppraisal({
					address: contracts.appraisal,
					abi: nftAppraisalAbi,
					functionName: "requestAppraisal",
					args: [
						formData.collection as `0x${string}`,
						BigInt(formData.tokenId),
					],
				});
			}

			// Reset form on success
			setFormData({ collection: "", tokenId: "" });

			if (onSubmissionSuccess) {
				onSubmissionSuccess(formData.collection, formData.tokenId);
			}
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : String(error);
			console.error("Appraisal submission error:", error);
			setErrors({
				general: message.includes("User rejected")
					? "Transaction was rejected"
					: message.includes("Appraisal already exists")
						? "This NFT has already been submitted for appraisal"
						: "Failed to submit appraisal request. Please try again.",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleInputChange = (field: keyof FormData, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));

		// Clear specific field error when user starts typing
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: undefined }));
		}

		// Clear general error when user starts typing
		if (errors.general) {
			setErrors((prev) => {
				const newErrors = { ...prev };
				delete newErrors.general;
				return newErrors;
			});
		}
	};

	const isPending = isApproving || isRequestingAppraisal || isSubmitting;

	// Check if we should show NFT preview
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
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6 }}
			className={className}
		>
			<Card glassVariant="glass" className="p-6">
				<form onSubmit={handleSubmit} className="space-y-6">
					{/* Header */}
					<div className="text-center space-y-3">
						<div className="w-16 h-16 bg-gradient-to-br from-warning/20 to-orange-400/20 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center mx-auto">
							<MagnifyingGlassIcon className="w-8 h-8 text-warning" />
						</div>
						<h3 className="text-2xl font-light tracking-tight">
							<span className="bg-gradient-to-r from-warning to-orange-400 bg-clip-text text-transparent">
								Request NFT Appraisal
							</span>
						</h3>
						<p className="text-foreground/70 max-w-md mx-auto text-sm">
							Submit your NFT for professional appraisal to determine its market
							value
						</p>
					</div>

					{/* Enhanced NFT Preview */}
					{shouldShowPreview() && (
						<motion.div
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							className="bg-gradient-to-r from-green-500/10 to-green-600/10 backdrop-blur-xl rounded-xl border border-green-500/20 p-6"
						>
							<div className="text-center mb-4">
								<div className="flex items-center justify-center gap-2 mb-2">
									<CheckBadgeIcon className="w-5 h-5 text-green-400" />
									<p className="text-sm font-medium text-green-400">
										{isPrePopulated ? "NFT Pre-loaded from URL" : "NFT Preview"}
									</p>
								</div>
								<p className="text-xs text-foreground/70">
									This NFT will be submitted for appraisal
								</p>
							</div>

							<div className="flex justify-center mb-4">
								<div className="w-64">
									{contracts.appraisal && (
										<UnifiedNFTCard
											collection={formData.collection}
											tokenId={formData.tokenId}
											variant="detailed"
											size="md"
											showAppraisal={true}
											animate={true}
											appraisalContractAddress={
												contracts.appraisal as `0x${string}`
											}
											priority={8}
										/>
									)}
								</div>
							</div>

							<div className="text-center space-y-1">
								<p className="text-xs text-foreground/60">
									Collection: {formData.collection.slice(0, 8)}...
									{formData.collection.slice(-6)}
								</p>
								<p className="text-xs text-foreground/60">
									Token ID: #{formData.tokenId}
								</p>
							</div>
						</motion.div>
					)}

					{/* Fee Information */}
					{appraisalFee && (
						<div className="bg-gradient-to-r from-content1/40 to-content1/20 backdrop-blur-xl rounded-xl border border-white/20 p-4">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 bg-gradient-to-br from-info/20 to-info/20 backdrop-blur-xl border border-white/20 rounded-xl flex items-center justify-center">
									<CurrencyDollarIcon className="w-5 h-5 text-info" />
								</div>
								<div className="flex-1">
									<p className="text-sm font-medium text-foreground">
										Appraisal Fee
									</p>
									<p className="text-xs text-foreground/60">
										{formatFeeAmount(appraisalFee)} {tokenSymbol || "TOKENS"}
									</p>
								</div>
								{hasInsufficientBalance() && (
									<ExclamationTriangleIcon className="w-5 h-5 text-warning" />
								)}
							</div>
						</div>
					)}

					{/* Form Fields */}
					<div className="space-y-4">
						{/* Collection Address */}
						<div>
							<label
								htmlFor="collection"
								className="block text-sm font-medium text-foreground/80 mb-2"
							>
								NFT Collection Address
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
									className={`w-full bg-content1/20 backdrop-blur-xl border rounded-xl px-4 py-3 text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 transition-all duration-200 ${
										errors.collection
											? "border-danger/50 focus:ring-danger/20 focus:border-danger"
											: "border-white/20 focus:ring-warning/20 focus:border-warning/50"
									}`}
								/>
								{errors.collection && (
									<div className="absolute right-3 top-1/2 -translate-y-1/2">
										<ExclamationTriangleIcon className="w-5 h-5 text-danger" />
									</div>
								)}
							</div>
							{errors.collection && (
								<p className="text-danger text-sm mt-1 flex items-center gap-1">
									<ExclamationTriangleIcon className="w-4 h-4" />
									{errors.collection}
								</p>
							)}
						</div>

						{/* Token ID */}
						<div>
							<label
								htmlFor="tokenId"
								className="block text-sm font-medium text-foreground/80 mb-2"
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
									className={`w-full bg-content1/20 backdrop-blur-xl border rounded-xl px-4 py-3 text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 transition-all duration-200 ${
										errors.tokenId
											? "border-danger/50 focus:ring-danger/20 focus:border-danger"
											: "border-white/20 focus:ring-warning/20 focus:border-warning/50"
									}`}
								/>
								{errors.tokenId && (
									<div className="absolute right-3 top-1/2 -translate-y-1/2">
										<ExclamationTriangleIcon className="w-5 h-5 text-danger" />
									</div>
								)}
							</div>
							{errors.tokenId && (
								<p className="text-danger text-sm mt-1 flex items-center gap-1">
									<ExclamationTriangleIcon className="w-4 h-4" />
									{errors.tokenId}
								</p>
							)}
						</div>
					</div>

					{/* General Error */}
					{errors.general && (
						<div className="bg-danger/10 border border-danger/20 rounded-xl p-4">
							<div className="flex items-center gap-3">
								<XCircleIcon className="w-5 h-5 text-danger flex-shrink-0" />
								<p className="text-danger text-sm">{errors.general}</p>
							</div>
						</div>
					)}

					{/* Info Box */}
					<div className="bg-gradient-to-r from-info/10 to-secondary/10 border border-info/20 rounded-xl p-4">
						<div className="flex items-start gap-3">
							<InformationCircleIcon className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
							<div className="text-sm text-foreground/70 space-y-1">
								<p className="font-medium text-info">How it works:</p>
								<ul className="space-y-1 ml-2">
									<li>• Submit your NFT details and pay the appraisal fee</li>
									<li>• External appraisal service evaluates your NFT</li>
									<li>• Receive professional market valuation</li>
									<li>• Option to deposit appraised NFT into gacha</li>
								</ul>
							</div>
						</div>
					</div>

					{/* Submit Button */}
					<div className="pt-2">
						<Button
							type="submit"
							color="glassPrimary"
							className="w-full"
							isLoading={isPending}
							isDisabled={
								!isConnected ||
								isPending ||
								hasInsufficientBalance() ||
								!formData.collection.trim() ||
								!formData.tokenId.trim()
							}
						>
							{isPending 
								? (isApproving
									? "Approving tokens..."
									: isRequestingAppraisal
										? "Requesting appraisal..."
										: "Submitting...")
								: (needsApproval()
									? "Approve & Request Appraisal"
									: "Request Appraisal")}
						</Button>
					</div>

					{/* Wallet Balance Info */}
					{userBalance !== undefined && tokenSymbol && (
						<div className="text-center">
							<p className="text-xs text-foreground/60">
								Your balance: {formatFeeAmount(userBalance)} {tokenSymbol}
							</p>
						</div>
					)}
				</form>
			</Card>
		</motion.div>
	);
}
