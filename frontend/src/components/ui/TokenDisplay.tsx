/**
 * Token Display Component
 * Shows ERC20 token information with logo, name, and symbol
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/theme";
import { ThemedIcon } from "../../lib/icons";

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
  'USDC': 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
  'USDT': 'https://cryptologos.cc/logos/tether-usdt-logo.png',
  'DAI': 'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png',
  'WETH': 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
  'ETH': 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
  'WBTC': 'https://cryptologos.cc/logos/wrapped-bitcoin-wbtc-logo.png',
  'UNI': 'https://cryptologos.cc/logos/uniswap-uni-logo.png',
  'LINK': 'https://cryptologos.cc/logos/chainlink-link-logo.png',
  'AAVE': 'https://cryptologos.cc/logos/aave-aave-logo.png',
  'COMP': 'https://cryptologos.cc/logos/compound-comp-logo.png',
  'SUSHI': 'https://cryptologos.cc/logos/sushiswap-sushi-logo.png',
  'CRV': 'https://cryptologos.cc/logos/curve-dao-token-crv-logo.png',
  'BAL': 'https://cryptologos.cc/logos/balancer-bal-logo.png',
  'YFI': 'https://cryptologos.cc/logos/yearn-finance-yfi-logo.png',
  'MATIC': 'https://cryptologos.cc/logos/polygon-matic-logo.png',
  '1INCH': 'https://cryptologos.cc/logos/1inch-1inch-logo.png'
};

// Token logo sources - in order of preference
const getTokenLogoSources = (address?: string, symbol?: string): string[] => {
  const sources: string[] = [];
  
  // Known token logos (highest priority)
  if (symbol && KNOWN_TOKEN_LOGOS[symbol.toUpperCase()]) {
    sources.push(KNOWN_TOKEN_LOGOS[symbol.toUpperCase()]);
  }
  
  // Trust Wallet assets (very reliable)
  if (address) {
    sources.push(`https://trustwalletapp.com/images/tokens/${address.toLowerCase()}.png`);
  }
  
  // CoinGecko API (requires token ID, but we can try with symbol)
  if (symbol) {
    sources.push(`https://assets.coingecko.com/coins/images/large/${symbol.toLowerCase()}.png`);
  }
  
  // 1inch token list
  if (address) {
    sources.push(`https://tokens.1inch.io/${address.toLowerCase()}.png`);
  }
  
  // Ethereum token list (for Ethereum mainnet)
  if (address) {
    sources.push(`https://raw.githubusercontent.com/ethereum/ethereum-lists/master/src/tokens/eth/logo/${address}.png`);
  }
  
  return sources;
};

export function TokenDisplay({
  address,
  name,
  symbol,
  amount,
  size = "md",
  showName = true,
  showSymbol = true,
  showAmount = false,
  className,
  animate = false
}: TokenDisplayProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);

  const logoSources = getTokenLogoSources(address, symbol);

  // Size configurations
  const sizeConfig = {
    sm: {
      container: "gap-2",
      image: "w-5 h-5",
      text: "text-sm",
      amount: "text-xs"
    },
    md: {
      container: "gap-3",
      image: "w-8 h-8",
      text: "text-base",
      amount: "text-sm"
    },
    lg: {
      container: "gap-4",
      image: "w-12 h-12",
      text: "text-lg",
      amount: "text-base"
    }
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
        setCurrentSourceIndex(sourceIndex + 1);
        tryLoadImage(sourceIndex + 1);
      };
      img.src = logoSources[sourceIndex];
    };

    tryLoadImage(0);
  }, [logoSources]);

  // Generate fallback initials from token name or symbol
  const getFallbackInitials = () => {
    if (symbol && symbol.length >= 2) {
      return symbol.substring(0, 2).toUpperCase();
    }
    if (name) {
      const words = name.split(' ');
      if (words.length >= 2) {
        return (words[0][0] + words[1][0]).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    return "??";
  };

  const TokenImage = () => {
    if (imageUrl && !imageError) {
      return (
        <img
          src={imageUrl}
          alt={`${name || symbol} logo`}
          className={cn(config.image, "rounded-full object-cover")}
          onError={() => setImageError(true)}
        />
      );
    }

    // Fallback with initials or icon
    return (
      <div className={cn(
        config.image,
        "rounded-full bg-gradient-to-br from-content1/60 to-content1/40 backdrop-blur-xl border border-white/20 flex items-center justify-center"
      )}>
        {symbol || name ? (
          <span className={cn(
            "font-bold text-foreground",
            size === "sm" ? "text-xs" : size === "md" ? "text-sm" : "text-base"
          )}>
            {getFallbackInitials()}
          </span>
        ) : (
          <ThemedIcon name="coins" size={size === "sm" ? "xs" : size === "md" ? "sm" : "md"} />
        )}
      </div>
    );
  };

  const content = (
    <div className={cn("flex items-center", config.container, className)}>
      <TokenImage />
      
      <div className="flex-1 min-w-0">
        {showName && name && (
          <div className={cn("font-medium text-foreground truncate", config.text)}>
            {name}
          </div>
        )}
        
        {showSymbol && symbol && (
          <div className={cn(
            "text-foreground/70 truncate",
            showName ? (size === "sm" ? "text-xs" : "text-sm") : config.text
          )}>
            {symbol}
          </div>
        )}
        
        {showAmount && amount && (
          <div className={cn("font-semibold text-foreground mt-1", config.amount)}>
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
  className
}: {
  address?: `0x${string}`;
  name?: string;
  symbol?: string;
  amount?: string;
  className?: string;
}) {
  return (
    <div className={cn(
      "bg-gradient-to-r from-warning/20 to-orange-500/20 backdrop-blur-xl border border-warning/30 rounded-xl px-4 py-3 shadow-xl",
      className
    )}>
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