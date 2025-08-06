/**
 * Variant Showcase Component
 * Demonstrates the HeroUI custom variants system for glassmorphism components
 */

import { GlassButton, GlassCard, GlassBadge } from "./index";

export function VariantShowcase() {
	return (
		<div className="p-8 space-y-8">
			<h2 className="text-2xl font-bold text-foreground mb-6">
				HeroUI Custom Variants Showcase
			</h2>

			{/* Button Variants */}
			<GlassCard variant="base" className="p-6">
				<h3 className="text-lg font-semibold mb-4">Button Variants</h3>
				<div className="flex flex-wrap gap-4">
					<GlassButton variant="primary" size="md">
						Primary Button
					</GlassButton>
					<GlassButton variant="secondary" size="md">
						Secondary Button
					</GlassButton>
					<GlassButton variant="danger" size="md">
						Danger Button
					</GlassButton>
					<GlassButton variant="ghost" size="md">
						Ghost Button
					</GlassButton>
				</div>

				<h4 className="text-md font-medium mt-6 mb-3">Button Sizes</h4>
				<div className="flex flex-wrap gap-4 items-center">
					<GlassButton variant="primary" size="sm">
						Small
					</GlassButton>
					<GlassButton variant="primary" size="md">
						Medium
					</GlassButton>
					<GlassButton variant="primary" size="lg">
						Large
					</GlassButton>
				</div>
			</GlassCard>

			{/* Card Variants */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				<GlassCard variant="base" className="p-4">
					<h4 className="font-semibold mb-2">Base Card</h4>
					<p className="text-sm text-foreground/70">
						Standard glassmorphism card with subtle styling.
					</p>
				</GlassCard>

				<GlassCard variant="interactive" className="p-4" animate>
					<h4 className="font-semibold mb-2">Interactive Card</h4>
					<p className="text-sm text-foreground/70">
						Hover and focus states with scale animation.
					</p>
				</GlassCard>

				<GlassCard variant="highlight" className="p-4">
					<h4 className="font-semibold mb-2">Highlight Card</h4>
					<p className="text-sm text-foreground/70">
						Warning gradient highlight for important content.
					</p>
				</GlassCard>

				<GlassCard variant="floating" className="p-4" animate>
					<h4 className="font-semibold mb-2">Floating Card</h4>
					<p className="text-sm text-foreground/70">
						Enhanced shadows with hover elevation.
					</p>
				</GlassCard>

				<GlassCard variant="success" className="p-4">
					<h4 className="font-semibold mb-2">Success Card</h4>
					<p className="text-sm text-foreground/70">
						Success state styling with green accents.
					</p>
				</GlassCard>

				<GlassCard variant="error" className="p-4">
					<h4 className="font-semibold mb-2">Error Card</h4>
					<p className="text-sm text-foreground/70">
						Error state styling with red accents.
					</p>
				</GlassCard>
			</div>

			{/* Badge Variants */}
			<GlassCard variant="base" className="p-6">
				<h3 className="text-lg font-semibold mb-4">Badge Variants</h3>
				<div className="flex flex-wrap gap-3">
					<GlassBadge variant="primary">Primary</GlassBadge>
					<GlassBadge variant="secondary">Secondary</GlassBadge>
					<GlassBadge variant="success">Success</GlassBadge>
					<GlassBadge variant="warning">Warning</GlassBadge>
					<GlassBadge variant="danger">Danger</GlassBadge>
					<GlassBadge variant="info">Info</GlassBadge>
				</div>

				<h4 className="text-md font-medium mt-6 mb-3">Badge Sizes</h4>
				<div className="flex flex-wrap gap-3 items-center">
					<GlassBadge variant="primary" size="sm">
						Small
					</GlassBadge>
					<GlassBadge variant="primary" size="md">
						Medium
					</GlassBadge>
					<GlassBadge variant="primary" size="lg">
						Large
					</GlassBadge>
				</div>

				<h4 className="text-md font-medium mt-6 mb-3">Badge Effects</h4>
				<div className="flex flex-wrap gap-3 items-center">
					<GlassBadge variant="primary" glow>
						With Glow
					</GlassBadge>
					<GlassBadge variant="success" pulse>
						With Pulse
					</GlassBadge>
					<GlassBadge variant="warning" animate>
						With Animation
					</GlassBadge>
				</div>
			</GlassCard>
		</div>
	);
}
