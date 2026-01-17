"use client";

import BuybackComponent from "../economy/BuybackComponent";

// SellToTreasury is now an alias for the unified BuybackComponent
// This maintains backward compatibility while using the improved unified component
interface SellToTreasuryProps {
	collection: string;
	tokenId: string;
	appraisalContractAddress: string;
	protocolTreasuryAddress: string;
	gachaTreasuryAddress: string;
	onSuccess?: (txHash: string) => void;
	size?: "sm" | "md" | "lg";
	variant?: "button" | "card";
}

export default function SellToTreasury(props: SellToTreasuryProps) {
	return <BuybackComponent {...props} showTreasuryRestock={true} />;
}
