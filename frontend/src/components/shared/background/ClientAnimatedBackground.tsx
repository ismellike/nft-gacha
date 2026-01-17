"use client";

import dynamic from "next/dynamic";

// Dynamically import AnimatedBackground to prevent SSR issues
const AnimatedBackground = dynamic(
	() =>
		import("./AnimatedBackground").then((mod) => ({
			default: mod.AnimatedBackground,
		})),
	{
		ssr: false,
		loading: () => (
			<div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
				<div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black" />
			</div>
		),
	},
);

export function ClientAnimatedBackground() {
	return <AnimatedBackground />;
}
