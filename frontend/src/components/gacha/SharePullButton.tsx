"use client";

import { motion } from "framer-motion";
import { useCallback, useState } from "react";
import type { NFTMetadata } from "../../lib/metadataValidation";
import { Rarity, getRarityConfig } from "../../lib/rarityConfig";
import { Button } from "../../ui";

interface SharePullButtonProps {
	rarity: Rarity;
	metadata: NFTMetadata | null;
	rarityName: string;
	animationDelay?: number | undefined;
}

const EPIC_FLAVOR = [
	"The odds were against me!",
	"Absolutely cracked pull!",
	"No way this just happened!",
];

function getShareText(
	rarity: Rarity,
	rarityName: string,
	metadata: NFTMetadata | null,
): string {
	const config = getRarityConfig(rarity);
	const cardName = metadata?.title || metadata?.name || "an NFT";
	let text = `I just pulled a ${rarityName} ${config.emoji} ${cardName} on @spinfiapp!`;

	if (rarity >= Rarity.Epic) {
		const flavor = EPIC_FLAVOR[Math.floor(Math.random() * EPIC_FLAVOR.length)];
		text += ` ${flavor}`;
	}

	text += "\nhttps://spinfi.app";
	return text;
}

export default function SharePullButton({
	rarity,
	metadata,
	rarityName,
	animationDelay = 0.6,
}: SharePullButtonProps) {
	const [shared, setShared] = useState(false);

	const handleShare = useCallback(async () => {
		const text = getShareText(rarity, rarityName, metadata);

		// Try Web Share API (mobile)
		if (typeof navigator !== "undefined" && navigator.share) {
			try {
				await navigator.share({ text });
				setShared(true);
				setTimeout(() => setShared(false), 2000);
				return;
			} catch {
				// User cancelled or API unavailable, fall through to Twitter
			}
		}

		// Fallback: Twitter Web Intent
		const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
		window.open(
			twitterUrl,
			"_blank",
			"noopener,noreferrer,width=550,height=420",
		);
		setShared(true);
		setTimeout(() => setShared(false), 2000);
	}, [rarity, rarityName, metadata]);

	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.8, y: 30 }}
			animate={{ opacity: 1, scale: 1, y: 0 }}
			transition={{
				delay: animationDelay,
				duration: 0.6,
				type: "spring",
				stiffness: 150,
				damping: 12,
			}}
		>
			<Button
				color="glass"
				size="lg"
				onPress={handleShare}
				aria-label={shared ? "Shared!" : "Share this pull"}
				startContent={
					shared ? (
						<svg
							className="w-5 h-5 text-success"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							strokeWidth={2}
						>
							<title>Shared</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M5 13l4 4L19 7"
							/>
						</svg>
					) : (
						<svg
							className="w-5 h-5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							strokeWidth={2}
						>
							<title>Share</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
							/>
						</svg>
					)
				}
			>
				{shared ? "Shared!" : "Share Pull"}
			</Button>
		</motion.div>
	);
}
