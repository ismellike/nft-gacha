"use client";

import { Card, CardBody } from "@heroui/react";
import { Rarity, getRarityConfig } from "../lib/rarityConfig";
import { formatAddress, formatTokenId } from "../lib/utils";

interface LastSpinResultProps {
	result: {
		rarity: string;
		collection: string;
		tokenId: string;
	} | null;
}

export default function LastSpinResult({ result }: LastSpinResultProps) {
	if (!result) return null;

	const rarityConfig = getRarityConfig(
		Rarity[result.rarity as keyof typeof Rarity] || Rarity.Common,
	);

	return (
		<div className="relative group">
			<div
				className={`absolute inset-0 bg-gradient-to-r ${rarityConfig.bgGradient}/20 rounded-2xl blur-xl opacity-80 group-hover:opacity-100 transition-all duration-500 animate-pulse`}
			></div>
			<Card className="relative bg-gradient-to-br from-content2/30 to-content3/20 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-2xl overflow-hidden">
				<div
					className={`absolute inset-0 bg-gradient-to-br ${rarityConfig.bgGradient}/5`}
				></div>
				<CardBody className="py-6 px-8 relative z-10">
					<div className="flex items-center justify-center space-x-3">
						<div
							className={`w-8 h-8 bg-gradient-to-br ${rarityConfig.bgGradient} rounded-full flex items-center justify-center shadow-lg`}
						>
							<span className="text-sm">{rarityConfig.emoji}</span>
						</div>
						<div className="text-center">
							<p
								className={`text-xs font-medium ${rarityConfig.textColor} uppercase tracking-wide mb-1`}
							>
								Latest Reward
							</p>
							<p
								className={`text-lg font-bold bg-gradient-to-r ${rarityConfig.bgGradient} bg-clip-text text-transparent`}
							>
								{result.rarity} NFT {formatTokenId(result.tokenId)}
							</p>
							<p className="text-xs text-foreground/60 mt-1 font-mono">
								{formatAddress(result.collection)}
							</p>
						</div>
						<div
							className={`w-8 h-8 bg-gradient-to-br ${rarityConfig.bgGradient} rounded-full flex items-center justify-center shadow-lg`}
						>
							<span className="text-sm">✨</span>
						</div>
					</div>
				</CardBody>
			</Card>
		</div>
	);
}
