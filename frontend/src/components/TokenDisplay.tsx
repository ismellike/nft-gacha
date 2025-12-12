"use client";

/**
 * Minimal token amount displays used in the economy dashboard.
 * Trimmed down to only the pieces we actually render today.
 */

interface TokenAmountDisplayProps {
	amount?: bigint;
	showUsd?: boolean;
	decimals?: number;
}

export function TokenAmountDisplay({
	amount,
	showUsd = false,
	decimals: defaultDecimals,
}: TokenAmountDisplayProps) {
	if (!amount || amount === 0n) {
		return <span className="text-gray-400">0</span>;
	}

	const formatAmount = (value: bigint) => {
		const decimals =
			defaultDecimals !== undefined
				? BigInt(defaultDecimals)
				: showUsd
					? 6n
					: 18n;

		if (decimals === 0n) {
			return value.toString();
		}

		const wholePart = value / 10n ** decimals;
		const fractionalPart = value % 10n ** decimals;

		if (fractionalPart === 0n) {
			return wholePart.toString();
		}

		const fractionalStr = fractionalPart
			.toString()
			.padStart(Number(decimals), "0");

		const numericValue =
			Number(wholePart) + Number(fractionalStr) / 10 ** Number(decimals);

		if (numericValue < 0.000001 && numericValue > 0) {
			return numericValue.toExponential(2);
		}

		const trimmedFractional = fractionalStr.replace(/0+$/, "");

		if (trimmedFractional) {
			return `${wholePart}.${trimmedFractional}`;
		}

		return wholePart.toString();
	};

	const formattedAmount = formatAmount(amount);

	return (
		<span className="text-white font-medium">
			{formattedAmount}
			{showUsd && <span className="text-gray-400 ml-1">USD</span>}
		</span>
	);
}

export function RevenueDisplay({
	amount,
	tokenSymbol,
	decimals,
	compact = true,
}: {
	amount: bigint | undefined;
	tokenSymbol?: string;
	decimals?: number;
	compact?: boolean;
}) {
	if (!amount || amount === 0n) {
		return <span className="text-gray-400">0 {tokenSymbol || ""}</span>;
	}

	const tokenDecimals = decimals !== undefined ? BigInt(decimals) : 18n;

	const formatAmount = (value: bigint) => {
		if (tokenDecimals === 0n) {
			return value.toString();
		}

		const wholePart = value / 10n ** tokenDecimals;
		const fractionalPart = value % 10n ** tokenDecimals;

		if (fractionalPart === 0n) {
			return wholePart.toString();
		}

		const fractionalStr = fractionalPart
			.toString()
			.padStart(Number(tokenDecimals), "0");

		const numericValue =
			Number(wholePart) + Number(fractionalStr) / 10 ** Number(tokenDecimals);

		if (compact) {
			if (numericValue < 0.001 && numericValue > 0) {
				return numericValue.toExponential(2);
			}
			if (numericValue < 1) {
				return numericValue.toFixed(6).replace(/\.?0+$/, "");
			}
			return numericValue.toFixed(4).replace(/\.?0+$/, "");
		}

		const trimmedFractional = fractionalStr.replace(/0+$/, "");
		if (trimmedFractional) {
			return `${wholePart}.${trimmedFractional}`;
		}
		return wholePart.toString();
	};

	const formattedAmount = formatAmount(amount);

	return (
		<span className="text-white font-medium">
			{formattedAmount}
			{tokenSymbol && <span className="text-gray-400 ml-1">{tokenSymbol}</span>}
		</span>
	);
}
