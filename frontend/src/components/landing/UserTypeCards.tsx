"use client";

import { motion } from "framer-motion";
import { Card } from "../../ui";
import { glassCard } from "../../lib/theme-config";
import {
	SparklesIcon,
	TrophyIcon,
	ArrowRightIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

interface UserTypeCardProps {
	title: string;
	description: string;
	features: string[];
	icon: React.ReactNode;
	href: string;
	gradient: string;
	delay: number;
}

function UserTypeCard({
	title,
	description,
	features,
	icon,
	href,
	gradient,
	delay,
}: UserTypeCardProps) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 30 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, delay }}
			whileHover={{ y: -8 }}
			className="h-full"
		>
			<Link href={href} className="block h-full">
				<Card
					className={glassCard({
						variant: "base",
						padding: "lg",
						className:
							"h-full rounded-3xl hover:border-warning/40 transition-all duration-300 bg-gradient-to-br " + gradient,
					})}
				>
					{/* Icon */}
					<div className="w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br from-warning/20 to-orange-400/20 flex items-center justify-center text-warning">
						{icon}
					</div>

					{/* Title */}
					<h3 className="text-2xl font-bold mb-3 text-foreground">{title}</h3>

					{/* Description */}
					<p className="text-foreground/70 mb-6 leading-relaxed">{description}</p>

					{/* Features List */}
					<ul className="space-y-3 mb-6">
						{features.map((feature, index) => (
							<motion.li
								key={index}
								initial={{ opacity: 0, x: -10 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: delay + 0.3 + index * 0.1 }}
								className="flex items-start gap-2 text-foreground/80"
							>
								<span className="text-warning mt-1">✓</span>
								<span>{feature}</span>
							</motion.li>
						))}
					</ul>

					{/* CTA */}
					<div className="flex items-center gap-2 text-warning font-semibold group">
						<span>Get Started</span>
						<motion.span
							className="group-hover:translate-x-1 transition-transform"
							animate={{ x: [0, 5, 0] }}
							transition={{
								duration: 1.5,
								repeat: Number.POSITIVE_INFINITY,
								repeatDelay: 1,
							}}
						>
							<ArrowRightIcon className="w-5 h-5" />
						</motion.span>
					</div>
				</Card>
			</Link>
		</motion.div>
	);
}

interface UserTypeCardsProps {
	className?: string;
}

export function UserTypeCards({ className = "" }: UserTypeCardsProps) {
	const userTypes: UserTypeCardProps[] = [
		{
			title: "For Players",
			description:
				"Experience provably fair gacha gaming with cryptographic randomness",
			features: [
				"Verifiable fair outcomes",
				"Transparent odds on-chain",
				"Instant NFT reveals",
				"No hidden manipulation",
			],
			icon: <SparklesIcon className="w-8 h-8" />,
			href: "/gacha/?id=graded-pokemon&section=spin",
			gradient: "from-content1/30 to-warning/5",
			delay: 0.2,
		},
		{
			title: "For Contributors",
			description:
				"Deposit NFTs to earn yield from every spin on the protocol",
			features: [
				"Earn 95% of spin fees",
				"Passive income stream",
				"Dynamic odds adjustment",
				"Full treasury transparency",
			],
			icon: <TrophyIcon className="w-8 h-8" />,
			href: "/appraisal",
			gradient: "from-content1/30 to-orange-400/5",
			delay: 0.4,
		},
	];

	return (
		<div className={`grid md:grid-cols-2 gap-6 max-w-5xl mx-auto ${className}`}>
			{userTypes.map((userType) => (
				<UserTypeCard key={userType.title} {...userType} />
			))}
		</div>
	);
}
