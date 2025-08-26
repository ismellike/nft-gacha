/**
 * Token Display Component
 * Shows ERC20 token information with logo, name, and symbol
 */

import { useState, useEffect } from "react";
import NextImage from "next/image";
import { motion } from "framer-motion";
import { cn } from "../../lib/theme-config";
import { CurrencyDollarIcon } from "@heroicons/react/24/outline";

interface TokenDisplayProps {
	address?: `0x${string}`;
	name?: string;
	symbol?: string;
	amount?: string;
	size?: "sm" | "md" | "lg";
	showName?: boolean;
	showSymbol?: boolean;
	showAmount?: boolean;
	className?: string;
	animate?: boolean;
}

// Common token logos mapping for well-known tokens
const KNOWN_TOKEN_LOGOS: Record<string, string> = {
	// Common tokens
	USDC: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png",
	USDT: "https://cryptologos.cc/logos/tether-usdt-logo.png",
	DAI: "https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png",
	WETH: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
	ETH: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
	WBTC: "https://cryptologos.cc/logos/wrapped-bitcoin-wbtc-logo.png",
	UNI: "https://cryptologos.cc/logos/uniswap-uni-logo.png",
	LINK: "https://cryptologos.cc/logos/chainlink-link-logo.png",
	AAVE: "https://cryptologos.cc/logos/aave-aave-logo.png",
	COMP: "https://cryptologos.cc/logos/compound-comp-logo.png",
	SUSHI: "https://cryptologos.cc/logos/sushiswap-sushi-logo.png",
	CRV: "https://cryptologos.cc/logos/curve-dao-token-crv-logo.png",
	BAL: "https://cryptologos.cc/logos/balancer-bal-logo.png",
	YFI: "https://cryptologos.cc/logos/yearn-finance-yfi-logo.png",
	MATIC: "https://cryptologos.cc/logos/polygon-matic-logo.png",
	"1INCH": "https://cryptologos.cc/logos/1inch-1inch-logo.png",
};

// Check if this is a local/test token (common patterns)
const isLocalOrTestToken = (address?: string, symbol?: string): boolean => {
	if (!address && !symbol) return false;

	// Check against known local RPC endpoints
	const isLocalEnvironment = process.env.NODE_ENV === "development";

	// Test token symbols (industry standard test token patterns)
	const testSymbols = ["TEST"];
	const isTestSymbol = symbol
		? testSymbols.includes(symbol.toUpperCase())
		: false;

	return isLocalEnvironment || isTestSymbol;
};

// Token logo sources - in order of preference
const getTokenLogoSources = (address?: string, symbol?: string): string[] => {
	const sources: string[] = [];

	// Skip external requests for local/test tokens to avoid console errors
	if (isLocalOrTestToken(address, symbol)) {
		return sources; // Return empty array to use fallback immediately
	}

	// Known token logos (highest priority)
	if (symbol && KNOWN_TOKEN_LOGOS[symbol.toUpperCase()]) {
		sources.push(KNOWN_TOKEN_LOGOS[symbol.toUpperCase()]);
	}

	// Trust Wallet assets (very reliable)
	if (address) {
		sources.push(
			`https://trustwalletapp.com/images/tokens/${address.toLowerCase()}.png`,
		);
	}

	// CoinGecko API (requires token ID, but we can try with symbol)
	if (symbol) {
		sources.push(
			`https://assets.coingecko.com/coins/images/large/${symbol.toLowerCase()}.png`,
		);
	}

	// 1inch token list
	if (address) {
		sources.push(`https://tokens.1inch.io/${address.toLowerCase()}.png`);
	}

	// Ethereum token list (for Ethereum mainnet)
	if (address) {
		sources.push(
			`https://raw.githubusercontent.com/ethereum/ethereum-lists/master/src/tokens/eth/logo/${address}.png`,
		);
	}

	return sources;
};

function TokenDisplay({
	address,
	name,
	symbol,
	amount,
	size = "md",
	showName = true,
	showSymbol = true,
	showAmount = false,
	className,
	animate = false,
}: TokenDisplayProps) {
	const [imageUrl, setImageUrl] = useState<string | null>(null);
	const [imageError, setImageError] = useState(false);

	const logoSources = getTokenLogoSources(address, symbol);

	// Size configurations
	const sizeConfig = {
		sm: {
			container: "gap-2",
			image: "w-5 h-5",
			text: "text-sm",
			amount: "text-xs",
		},
		md: {
			container: "gap-3",
			image: "w-8 h-8",
			text: "text-base",
			amount: "text-sm",
		},
		lg: {
			container: "gap-4",
			image: "w-12 h-12",
			text: "text-lg",
			amount: "text-base",
		},
	};

	const config = sizeConfig[size];

	// Try to load token image from various sources
	useEffect(() => {
		if (logoSources.length === 0) {
			setImageError(true);
			return;
		}

		const tryLoadImage = (sourceIndex: number) => {
			if (sourceIndex >= logoSources.length) {
				setImageError(true);
				return;
			}

			const img = new Image();
			img.onload = () => {
				setImageUrl(logoSources[sourceIndex]);
				setImageError(false);
			};
			img.onerror = () => {
				// Suppress error logging for known test tokens to keep console clean
				if (!isLocalOrTestToken(address, symbol)) {
					console.debug(
						"Token image failed to load:",
						logoSources[sourceIndex],
					);
				}
				tryLoadImage(sourceIndex + 1);
			};
			img.src = logoSources[sourceIndex];
		};

		tryLoadImage(0);
    }, [logoSources, address, symbol]);

	// Generate fallback initials from token name or symbol (industry standard)
	const getFallbackInitials = () => {
		if (symbol && symbol.length >= 2) {
			return symbol.substring(0, 2).toUpperCase();
		}
		if (name) {
			const words = name.split(" ");
			if (words.length >= 2) {
				return (words[0][0] + words[1][0]).toUpperCase();
			}
			return name.substring(0, 2).toUpperCase();
		}
		return "??";
	};

	// Generate deterministic gradient based on token address/symbol (like Uniswap)
	const getFallbackGradient = () => {
		const seed = address || symbol || name || "";
		const hash = seed.split("").reduce((a, b) => {
			a = (a << 5) - a + b.charCodeAt(0);
			return a & a;
		}, 0);

		// Industry standard color combinations used by major DeFi apps
		const gradients = [
			"from-primary-400 to-primary-600",
			"from-secondary-400 to-secondary-600",
			"from-success-400 to-success-600",
			"from-warning-400 to-warning-600",
			"from-danger-400 to-danger-600",
		];

		return gradients[Math.abs(hash) % gradients.length];
	};

	const TokenImage = () => {
		if (imageUrl && !imageError) {
            return (
                <div className="relative">
                    <NextImage
                        src={imageUrl}
                        alt={`${name || symbol} logo`}
                        width={64}
                        height={64}
                        className={cn(
                            config.image,
                            "rounded-full object-cover border-2 border-white/10 shadow-lg bg-gradient-to-br from-content1/20 to-content1/40",
                        )}
                        onError={() => setImageError(true)}
                    />
                </div>
            );
		}

		// Fallback with initials and deterministic gradient (industry standard)
		return (
			<div
				className={cn(
					config.image,
					"rounded-full flex items-center justify-center border-2 border-white/10 shadow-lg",
					`bg-gradient-to-br ${getFallbackGradient()}`,
				)}
			>
				{symbol || name ? (
					<span
						className={cn(
							"font-bold text-white drop-shadow-sm",
							size === "sm"
								? "text-xs"
								: size === "md"
									? "text-sm"
									: "text-base",
						)}
					>
						{getFallbackInitials()}
					</span>
				) : (
					<CurrencyDollarIcon
						className={`text-white drop-shadow-sm ${
							size === "sm" ? "w-3 h-3" : size === "md" ? "w-4 h-4" : "w-5 h-5"
						}`}
					/>
				)}
			</div>
		);
	};

	const content = (
		<div className={cn("flex items-center", config.container, className)}>
			<TokenImage />

			<div className="flex-1 min-w-0">
				{showName && name && (
					<div
						className={cn("font-medium text-foreground truncate", config.text)}
					>
						{name}
					</div>
				)}

				{showSymbol && symbol && (
					<div
						className={cn(
							"text-foreground/70 truncate font-medium",
							showName ? (size === "sm" ? "text-xs" : "text-sm") : config.text,
						)}
					>
						{symbol.toUpperCase()}
					</div>
				)}

				{showAmount && amount && (
					<div
						className={cn("font-semibold text-foreground mt-1", config.amount)}
					>
						{amount}
					</div>
				)}
			</div>
		</div>
	);

	if (animate) {
		return (
			<motion.div
				initial={{ opacity: 0, scale: 0.95 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ duration: 0.2 }}
			>
				{content}
			</motion.div>
		);
	}

	return content;
}

// Specialized component for fee display
export function TokenFeeDisplay({
	address,
	name,
	symbol,
	amount,
	className,
}: {
	address?: `0x${string}`;
	name?: string;
	symbol?: string;
	amount?: string;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"bg-gradient-to-r from-warning/20 to-warning/20 backdrop-blur-xl border border-warning/30 rounded-xl px-4 py-3 shadow-xl",
				className,
			)}
		>
			<div className="flex items-center justify-between">
				<div>
					<p className="text-xs font-medium text-warning/80 uppercase tracking-wide mb-1">
						Entry Fee
					</p>
					<TokenDisplay
						address={address}
						name={name}
						symbol={symbol}
						amount={amount}
						size="md"
						showName={false}
						showSymbol={true}
						showAmount={true}
						animate={true}
					/>
				</div>
			</div>
		</div>
	);
}
