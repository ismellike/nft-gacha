"use client";

import type { ElementType, ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/theme-config";
import { Card } from "../../ui";

type SectionTone = "spin" | "deposits" | "rewards" | "economy" | "admin";

interface Highlight {
	icon?: ElementType;
	title: string;
	description: string;
}

interface GachaSectionLayoutProps {
	tone: SectionTone;
	icon: ElementType;
	label: string;
	title: string;
	description: string;
	highlights?: Highlight[];
	asideSlot?: ReactNode;
	children: ReactNode;
	className?: string;
}

const TONE_STYLES: Record<
	SectionTone,
	{
		gradient: string;
		iconWrapper: string;
		labelText: string;
		highlightIconWrapper: string;
		highlightTitle: string;
	}
> = {
	spin: {
		gradient:
			"bg-[radial-gradient(circle_at_top,_rgba(255,200,87,0.18),_transparent_55%)]",
		iconWrapper:
			"text-warning border-warning/40 bg-warning/10 group-hover:border-warning/60",
		labelText: "text-warning/70",
		highlightIconWrapper:
			"border-warning/40 bg-warning/10 text-warning group-hover:border-warning/50",
		highlightTitle: "text-warning/80",
	},
	deposits: {
		gradient:
			"bg-[radial-gradient(circle_at_top,_rgba(45,212,191,0.18),_transparent_55%)]",
		iconWrapper:
			"text-success border-success/40 bg-success/10 group-hover:border-success/60",
		labelText: "text-success/70",
		highlightIconWrapper:
			"border-success/40 bg-success/10 text-success group-hover:border-success/50",
		highlightTitle: "text-success/70",
	},
	rewards: {
		gradient:
			"bg-[radial-gradient(circle_at_top,_rgba(208,191,255,0.2),_transparent_55%)]",
		iconWrapper:
			"text-rarity-legendary-300 border-rarity-legendary-400/60 bg-rarity-legendary-500/15 group-hover:border-rarity-legendary-300",
		labelText: "text-rarity-legendary-400/70",
		highlightIconWrapper:
			"border-rarity-legendary-400/50 bg-rarity-legendary-500/10 text-rarity-legendary-200 group-hover:border-rarity-legendary-400",
		highlightTitle: "text-rarity-legendary-200",
	},
	economy: {
		gradient:
			"bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.2),_transparent_55%)]",
		iconWrapper:
			"text-primary border-primary/40 bg-primary/10 group-hover:border-primary/60",
		labelText: "text-primary/70",
		highlightIconWrapper:
			"border-primary/40 bg-primary/10 text-primary group-hover:border-primary/50",
		highlightTitle: "text-primary/80",
	},
	admin: {
		gradient:
			"bg-[radial-gradient(circle_at_top,_rgba(248,113,113,0.18),_transparent_55%)]",
		iconWrapper:
			"text-danger border-danger/40 bg-danger/10 group-hover:border-danger/50",
		labelText: "text-danger/70",
		highlightIconWrapper:
			"border-danger/40 bg-danger/10 text-danger group-hover:border-danger/50",
		highlightTitle: "text-danger/80",
	},
};

export function GachaSectionLayout({
	tone,
	icon: Icon,
	label,
	title,
	description,
	highlights,
	asideSlot,
	children,
	className,
}: GachaSectionLayoutProps) {
	const toneStyles = TONE_STYLES[tone];

	return (
		<section className={cn("space-y-8", className)}>
			<motion.div
				initial={{ opacity: 0, y: 12 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.35 }}
			>
				<Card className="relative overflow-hidden border border-white/10 bg-content1/30 p-6 backdrop-blur-2xl md:p-8">
					<div
						className={cn(
							"pointer-events-none absolute inset-0",
							toneStyles.gradient,
						)}
					/>
					<div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
						<div className="max-w-2xl space-y-4">
							<div className="flex items-center gap-3 group text-foreground">
								<span
									className={cn(
										"flex h-10 w-10 items-center justify-center rounded-2xl border transition-colors",
										toneStyles.iconWrapper,
									)}
								>
									<Icon className="h-5 w-5" />
								</span>
								<span
									className={cn(
										"text-xs font-medium uppercase tracking-[0.3em]",
										toneStyles.labelText,
									)}
								>
									{label}
								</span>
							</div>
							<div className="space-y-2">
								<h2 className="text-2xl font-semibold text-foreground md:text-3xl">
									{title}
								</h2>
								<p className="text-sm text-foreground/70 md:text-base">
									{description}
								</p>
							</div>
						</div>
						{asideSlot ? (
							<div className="w-full lg:w-auto">{asideSlot}</div>
						) : highlights && highlights.length > 0 ? (
							<div className="grid w-full gap-3 rounded-2xl border border-white/10 bg-content1/40 p-4 text-sm text-foreground/80 shadow-inner md:grid-cols-2 lg:w-auto lg:min-w-[320px]">
								{highlights.map(
									({
										icon: HighlightIcon,
										title: highlightTitle,
										description: highlightDescription,
									}) => (
										<div
											key={highlightTitle}
											className="group flex items-start gap-3 rounded-xl border border-white/5 bg-content1/30 p-3"
										>
											{HighlightIcon && (
												<span
													className={cn(
														"flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-sm transition-colors",
														toneStyles.highlightIconWrapper,
													)}
												>
													<HighlightIcon className="h-4 w-4" />
												</span>
											)}
											<div className="space-y-1">
												<span
													className={cn(
														"text-xs font-medium uppercase tracking-wide",
														toneStyles.highlightTitle,
													)}
												>
													{highlightTitle}
												</span>
												<p className="text-xs leading-5 text-foreground/60">
													{highlightDescription}
												</p>
											</div>
										</div>
									),
								)}
							</div>
						) : null}
					</div>
				</Card>
			</motion.div>
			<div>{children}</div>
		</section>
	);
}
