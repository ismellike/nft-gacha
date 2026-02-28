import type { ToastOptions } from "react-hot-toast";
import toast from "react-hot-toast";

type ToastType = "success" | "error" | "warning" | "info";

interface ToastConfig {
	title?: string;
	message: string;
	type?: ToastType;
	duration?: number;
	action?: {
		label: string;
		onClick: () => void;
	};
}

const toastStyles: Record<ToastType, string> = {
	success: "bg-success/20 border border-success/30 text-success",
	error: "bg-danger/20 border border-danger/30 text-danger",
	warning: "bg-warning/20 border border-warning/30 text-warning",
	info: "bg-info/20 border border-info/30 text-info",
};

const toastIcons: Record<ToastType, React.ReactNode> = {
	success: (
		<svg
			className="w-5 h-5"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			role="img"
			aria-label="Success"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
			/>
		</svg>
	),
	error: (
		<svg
			className="w-5 h-5"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			role="img"
			aria-label="Error"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
			/>
		</svg>
	),
	warning: (
		<svg
			className="w-5 h-5"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			role="img"
			aria-label="Warning"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
			/>
		</svg>
	),
	info: (
		<svg
			className="w-5 h-5"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			role="img"
			aria-label="Information"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
			/>
		</svg>
	),
};

function showToast({
	title,
	message,
	type = "info",
	duration = 4000,
	action,
}: ToastConfig) {
	const baseOptions: ToastOptions = {
		duration,
		position: "bottom-right",
		className: "!p-0 !bg-transparent !border-none !shadow-none",
	};

	if (action) {
		return toast(
			(t) => (
				<div
					className="glass-card !bg-content1/30 !border-white/20 !text-foreground rounded-xl overflow-hidden"
					role={type === "error" ? "alert" : "status"}
					aria-live={type === "error" ? "assertive" : "polite"}
				>
					<div className="flex items-start gap-3 p-4">
						<div
							className={`${toastStyles[type]} rounded-full p-2 flex-shrink-0`}
						>
							{toastIcons[type]}
						</div>
						<div className="flex-1 min-w-0">
							{title && <p className="font-semibold mb-1">{title}</p>}
							<p className="text-sm text-foreground/80 break-words">
								{message}
							</p>
						</div>
						<button
							type="button"
							onClick={() => {
								action.onClick();
								toast.dismiss(t.id);
							}}
							className="text-sm font-medium text-warning hover:underline flex-shrink-0"
						>
							{action.label}
						</button>
					</div>
				</div>
			),
			baseOptions,
		);
	}

	return toast(
		(t) => (
			<div
				className="glass-card !bg-content1/30 !border-white/20 !text-foreground rounded-xl overflow-hidden"
				role={type === "error" ? "alert" : "status"}
				aria-live={type === "error" ? "assertive" : "polite"}
			>
				<div className="flex items-start gap-3 p-4">
					<div
						className={`${toastStyles[type]} rounded-full p-2 flex-shrink-0`}
					>
						{toastIcons[type]}
					</div>
					<div className="flex-1 min-w-0">
						{title && <p className="font-semibold mb-1">{title}</p>}
						<p className="text-sm text-foreground/80 break-words">{message}</p>
					</div>
					<button
						type="button"
						onClick={() => toast.dismiss(t.id)}
						className="text-foreground/50 hover:text-foreground flex-shrink-0"
						aria-label="Dismiss notification"
					>
						<svg
							className="w-4 h-4"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							role="img"
							aria-label="Close"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>
			</div>
		),
		baseOptions,
	);
}

// Convenience functions
export const toastSuccess = (message: string, title?: string) =>
	showToast({ message, ...(title && { title }), type: "success" });

export const toastError = (message: string, title?: string) =>
	showToast({
		message,
		...(title && { title }),
		type: "error",
		duration: 6000,
	});

export const toastInfo = (message: string, title?: string) =>
	showToast({ message, ...(title && { title }), type: "info" });
