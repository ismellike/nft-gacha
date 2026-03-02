"use client";

import { Button, Card } from "../../ui";

interface EmptyStateProps {
	icon?: React.ComponentType<{ className?: string }>;
	title: string;
	description: string;
	action?: {
		label: string;
		onPress: () => void;
	};
	secondaryAction?: {
		label: string;
		onPress: () => void;
	};
	variant?: "info" | "warning" | "success";
}

export function EmptyState({
	icon: Icon,
	title,
	description,
	action,
	secondaryAction,
	variant = "info",
}: EmptyStateProps) {
	const variantStyles = {
		info: "bg-info/10 border-info/30",
		warning: "bg-warning/10 border-warning/30",
		success: "bg-success/10 border-success/30",
	};

	const iconColors = {
		info: "text-info",
		warning: "text-warning",
		success: "text-success",
	};

	return (
		<Card
			className={`p-8 text-center border ${variantStyles[variant]}`}
			isPressable={false}
		>
			{Icon && (
				<div className="w-16 h-16 mx-auto mb-4 rounded-full bg-background/50 flex items-center justify-center">
					<Icon className={`w-8 h-8 ${iconColors[variant]}`} />
				</div>
			)}
			<h3 className="text-lg font-semibold mb-2">{title}</h3>
			<p className="text-foreground/70 mb-6 max-w-md mx-auto">{description}</p>

			<div className="flex flex-col sm:flex-row gap-3 justify-center">
				{action && (
					<Button color="primary" onPress={action.onPress}>
						{action.label}
					</Button>
				)}
				{secondaryAction && (
					<Button color="glass" onPress={secondaryAction.onPress}>
						{secondaryAction.label}
					</Button>
				)}
			</div>
		</Card>
	);
}
